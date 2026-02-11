using Carmen.Application.DTOs.Report;
using Carmen.Application.Services.Report;
using Carmen.Domain.Entities.Report;
using Carmen.Infrastructure.Services.Reports.Predefined;

namespace Carmen.Infrastructure.Services.Reports;

public class PredefinedReportService : IPredefinedReportService
{
    private readonly Dictionary<PredefinedReportType, IPredefinedReportProvider> _providers;
    private readonly IPdfReportRenderer _pdfRenderer;
    private readonly IExcelReportRenderer _excelRenderer;

    public PredefinedReportService(
        IEnumerable<IPredefinedReportProvider> providers,
        IPdfReportRenderer pdfRenderer,
        IExcelReportRenderer excelRenderer)
    {
        _providers = providers.ToDictionary(p => p.ReportType);
        _pdfRenderer = pdfRenderer;
        _excelRenderer = excelRenderer;
    }

    public List<PredefinedReportInfo> GetAvailableReports() =>
    [
        new(PredefinedReportType.TrialBalance, "Trial Balance", "Account balances as of a specific date", "General Ledger", "scale"),
        new(PredefinedReportType.BalanceSheet, "Balance Sheet", "Assets, liabilities, and equity summary", "General Ledger", "landmark"),
        new(PredefinedReportType.IncomeStatement, "Income Statement", "Revenue and expense summary for a period", "General Ledger", "trending-up"),
        new(PredefinedReportType.GeneralLedgerDetail, "General Ledger Detail", "Transaction-level detail per account", "General Ledger", "book-open"),
        new(PredefinedReportType.JournalVoucherListing, "Journal Voucher Listing", "All journal vouchers in a date range", "General Ledger", "file-text"),
        new(PredefinedReportType.ApAging, "AP Aging Report", "Outstanding payables by aging bucket", "Accounts Payable", "clock"),
        new(PredefinedReportType.ArAging, "AR Aging Report", "Outstanding receivables by aging bucket", "Accounts Receivable", "clock"),
        new(PredefinedReportType.AssetRegister, "Asset Register", "Complete list of fixed assets", "Asset Management", "package"),
        new(PredefinedReportType.DepreciationSchedule, "Depreciation Schedule", "Depreciation by period for assets", "Asset Management", "calendar"),
    ];

    public List<ReportParameterDefinition> GetParameters(PredefinedReportType reportType)
    {
        if (!_providers.TryGetValue(reportType, out var provider))
            throw new ArgumentException($"Report type '{reportType}' is not available.");

        return provider.GetParameters();
    }

    public async Task<ReportDataSet> PreviewAsync(PredefinedReportType reportType, Dictionary<string, string> parameters)
    {
        if (!_providers.TryGetValue(reportType, out var provider))
            throw new ArgumentException($"Report type '{reportType}' is not available.");

        return await provider.GenerateAsync(parameters);
    }

    public async Task<byte[]> GenerateAsync(PredefinedReportType reportType, OutputFormat format, Dictionary<string, string> parameters)
    {
        var dataSet = await PreviewAsync(reportType, parameters);

        return format switch
        {
            OutputFormat.Pdf => await _pdfRenderer.RenderAsync(dataSet),
            OutputFormat.Excel => await _excelRenderer.RenderAsync(dataSet),
            _ => throw new ArgumentException($"Unsupported output format: {format}")
        };
    }
}
