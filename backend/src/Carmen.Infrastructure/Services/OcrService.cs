using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Carmen.Application.DTOs.AP;
using Carmen.Application.DTOs.Integration;
using Carmen.Application.Services.AP;
using Carmen.Application.Services.Integration;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Carmen.Infrastructure.Services;

public class OcrService : IOcrService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IApInvoiceService _apInvoiceService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<OcrService> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    public OcrService(
        IHttpClientFactory httpClientFactory,
        IApInvoiceService apInvoiceService,
        IConfiguration configuration,
        ILogger<OcrService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _apInvoiceService = apInvoiceService;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<OcrExtractedInvoiceDto> ProcessInvoiceAsync(byte[] fileBytes, string fileName)
    {
        _logger.LogInformation("Processing OCR for file: {FileName} ({Size} bytes)", fileName, fileBytes.Length);

        var apiKey = _configuration["Mistral:ApiKey"]
            ?? throw new InvalidOperationException("Mistral API key is not configured.");

        // Step 1: Call Mistral OCR endpoint to extract raw text
        var rawText = await ExtractTextWithOcrAsync(fileBytes, fileName, apiKey);

        // Step 2: Call Mistral Chat API with JSON mode to extract structured data
        var extractedInvoice = await ExtractStructuredDataAsync(rawText, apiKey);

        _logger.LogInformation(
            "OCR completed for {FileName}: vendor={Vendor}, total={Total}, confidence={Confidence:P0}",
            fileName, extractedInvoice.VendorName, extractedInvoice.TotalAmount, extractedInvoice.Confidence);

        return extractedInvoice;
    }

    public async Task<Guid> CreateInvoiceFromOcrAsync(Guid tenantId, CreateInvoiceFromOcrRequest request)
    {
        _logger.LogInformation("Creating AP invoice from OCR data for tenant {TenantId}", tenantId);

        var createRequest = new CreateApInvoiceRequest(
            VendorInvoiceNumber: request.InvoiceNumber,
            InvoiceDate: request.InvoiceDate,
            DueDate: request.DueDate,
            VendorId: request.VendorId,
            CurrencyCode: request.CurrencyCode,
            ExchangeRate: request.ExchangeRate,
            Tax1ProfileId: null,
            Tax2ProfileId: null,
            WhtProfileId: null,
            PaymentTermId: request.PaymentTermId,
            Description: request.Notes ?? "Created from OCR scan",
            Reference: $"OCR-{DateTime.UtcNow:yyyyMMdd-HHmmss}",
            FiscalPeriodId: request.FiscalPeriodId,
            ApAccountId: null,
            Lines: request.Lines.Select(line => new CreateApInvoiceLineRequest(
                AccountId: line.AccountId,
                Description: line.Description,
                Quantity: line.Quantity,
                Unit: null,
                UnitPrice: line.UnitPrice,
                DiscountPercent: 0,
                Tax1ProfileId: line.TaxProfileId,
                DepartmentId: line.DepartmentId,
                ProjectCode: null
            )).ToList()
        );

        var invoice = await _apInvoiceService.CreateInvoiceAsync(createRequest);

        _logger.LogInformation("Created AP invoice {InvoiceId} from OCR for tenant {TenantId}",
            invoice.Id, tenantId);

        return invoice.Id;
    }

    private async Task<string> ExtractTextWithOcrAsync(byte[] fileBytes, string fileName, string apiKey)
    {
        var client = _httpClientFactory.CreateClient("MistralApi");
        var ocrUrl = _configuration["Mistral:OcrUrl"] ?? "https://api.mistral.ai/v1/ocr";

        var base64Content = Convert.ToBase64String(fileBytes);
        var mimeType = GetMimeType(fileName);

        var requestBody = new
        {
            model = "mistral-ocr-latest",
            document = new
            {
                type = "image_url",
                image_url = $"data:{mimeType};base64,{base64Content}"
            }
        };

        var request = new HttpRequestMessage(HttpMethod.Post, ocrUrl)
        {
            Content = new StringContent(
                JsonSerializer.Serialize(requestBody, JsonOptions),
                Encoding.UTF8,
                "application/json")
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        _logger.LogInformation("Calling Mistral OCR API...");
        var response = await client.SendAsync(request);
        var responseContent = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("Mistral OCR API error: {StatusCode} - {Response}",
                response.StatusCode, responseContent);
            throw new InvalidOperationException($"Mistral OCR API returned {response.StatusCode}: {responseContent}");
        }

        // Parse OCR response - extract markdown text from pages
        using var doc = JsonDocument.Parse(responseContent);
        var pages = doc.RootElement.GetProperty("pages");
        var textBuilder = new StringBuilder();

        foreach (var page in pages.EnumerateArray())
        {
            if (page.TryGetProperty("markdown", out var markdown))
            {
                textBuilder.AppendLine(markdown.GetString());
            }
        }

        var extractedText = textBuilder.ToString();
        _logger.LogInformation("OCR extracted {Length} characters of text", extractedText.Length);

        return extractedText;
    }

    private async Task<OcrExtractedInvoiceDto> ExtractStructuredDataAsync(string rawText, string apiKey)
    {
        var client = _httpClientFactory.CreateClient("MistralApi");
        var chatUrl = _configuration["Mistral:ChatUrl"] ?? "https://api.mistral.ai/v1/chat/completions";

        var systemPrompt = @"You are an invoice data extraction assistant. Extract structured invoice data from the provided text.
Return a JSON object with these fields:
- vendorName (string or null)
- vendorTaxId (string or null)
- invoiceNumber (string or null)
- invoiceDate (string in YYYY-MM-DD format or null)
- dueDate (string in YYYY-MM-DD format or null)
- currencyCode (string, default ""USD"")
- subTotal (number)
- taxAmount (number)
- totalAmount (number)
- confidence (number between 0 and 1)
- lines (array of objects with: description, quantity, unitPrice, amount, accountCode)

If a field cannot be determined, use null for strings/dates and 0 for numbers.";

        var requestBody = new
        {
            model = _configuration["Mistral:ChatModel"] ?? "mistral-large-latest",
            messages = new[]
            {
                new { role = "system", content = systemPrompt },
                new { role = "user", content = $"Extract invoice data from this text:\n\n{rawText}" }
            },
            response_format = new { type = "json_object" },
            temperature = 0.0
        };

        var request = new HttpRequestMessage(HttpMethod.Post, chatUrl)
        {
            Content = new StringContent(
                JsonSerializer.Serialize(requestBody, JsonOptions),
                Encoding.UTF8,
                "application/json")
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        _logger.LogInformation("Calling Mistral Chat API for structured extraction...");
        var response = await client.SendAsync(request);
        var responseContent = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("Mistral Chat API error: {StatusCode} - {Response}",
                response.StatusCode, responseContent);
            throw new InvalidOperationException($"Mistral Chat API returned {response.StatusCode}: {responseContent}");
        }

        // Parse chat response
        using var doc = JsonDocument.Parse(responseContent);
        var messageContent = doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString();

        if (string.IsNullOrEmpty(messageContent))
        {
            throw new InvalidOperationException("Mistral Chat API returned empty content.");
        }

        // Parse the extracted JSON
        using var extractedDoc = JsonDocument.Parse(messageContent);
        var root = extractedDoc.RootElement;

        var lines = new List<OcrExtractedLineDto>();
        if (root.TryGetProperty("lines", out var linesElement))
        {
            foreach (var line in linesElement.EnumerateArray())
            {
                lines.Add(new OcrExtractedLineDto(
                    Description: GetStringOrNull(line, "description"),
                    Quantity: GetDecimalOrDefault(line, "quantity", 1),
                    UnitPrice: GetDecimalOrDefault(line, "unitPrice"),
                    Amount: GetDecimalOrDefault(line, "amount"),
                    AccountCode: GetStringOrNull(line, "accountCode")
                ));
            }
        }

        return new OcrExtractedInvoiceDto(
            VendorName: GetStringOrNull(root, "vendorName"),
            VendorTaxId: GetStringOrNull(root, "vendorTaxId"),
            InvoiceNumber: GetStringOrNull(root, "invoiceNumber"),
            InvoiceDate: GetDateOrNull(root, "invoiceDate"),
            DueDate: GetDateOrNull(root, "dueDate"),
            CurrencyCode: GetStringOrNull(root, "currencyCode") ?? "USD",
            SubTotal: GetDecimalOrDefault(root, "subTotal"),
            TaxAmount: GetDecimalOrDefault(root, "taxAmount"),
            TotalAmount: GetDecimalOrDefault(root, "totalAmount"),
            Lines: lines,
            RawText: rawText,
            Confidence: GetDoubleOrDefault(root, "confidence", 0.5)
        );
    }

    private static string GetMimeType(string fileName)
    {
        var ext = Path.GetExtension(fileName).ToLowerInvariant();
        return ext switch
        {
            ".pdf" => "application/pdf",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            _ => "application/octet-stream"
        };
    }

    private static string? GetStringOrNull(JsonElement element, string property)
    {
        if (element.TryGetProperty(property, out var value) && value.ValueKind == JsonValueKind.String)
            return value.GetString();
        return null;
    }

    private static decimal GetDecimalOrDefault(JsonElement element, string property, decimal defaultValue = 0)
    {
        if (element.TryGetProperty(property, out var value))
        {
            if (value.ValueKind == JsonValueKind.Number)
                return value.GetDecimal();
            if (value.ValueKind == JsonValueKind.String && decimal.TryParse(value.GetString(), out var parsed))
                return parsed;
        }
        return defaultValue;
    }

    private static double GetDoubleOrDefault(JsonElement element, string property, double defaultValue = 0)
    {
        if (element.TryGetProperty(property, out var value))
        {
            if (value.ValueKind == JsonValueKind.Number)
                return value.GetDouble();
            if (value.ValueKind == JsonValueKind.String && double.TryParse(value.GetString(), out var parsed))
                return parsed;
        }
        return defaultValue;
    }

    private static DateTime? GetDateOrNull(JsonElement element, string property)
    {
        if (element.TryGetProperty(property, out var value) && value.ValueKind == JsonValueKind.String)
        {
            if (DateTime.TryParse(value.GetString(), out var date))
                return date;
        }
        return null;
    }
}
