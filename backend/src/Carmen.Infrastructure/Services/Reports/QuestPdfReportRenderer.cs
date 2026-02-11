using Carmen.Application.DTOs.Report;
using Carmen.Application.Services.Report;
using Carmen.Domain.Entities.Report;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Carmen.Infrastructure.Services.Reports;

public class QuestPdfReportRenderer : IPdfReportRenderer
{
    public Task<byte[]> RenderAsync(ReportDataSet dataSet, PageOrientation orientation = PageOrientation.Portrait)
    {
        QuestPDF.Settings.License = LicenseType.Community;

        var pageSize = orientation == PageOrientation.Landscape
            ? PageSizes.A4.Landscape()
            : PageSizes.A4;

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(pageSize);
                page.Margin(30);
                page.DefaultTextStyle(x => x.FontSize(9));

                page.Header().Element(c => ComposeHeader(c, dataSet));
                page.Content().Element(c => ComposeContent(c, dataSet));
                page.Footer().Element(ComposeFooter);
            });
        });

        var bytes = document.GeneratePdf();
        return Task.FromResult(bytes);
    }

    private static void ComposeHeader(IContainer container, ReportDataSet dataSet)
    {
        container.Column(column =>
        {
            column.Item().Row(row =>
            {
                row.RelativeItem().Column(col =>
                {
                    col.Item().Text("Carmen Financial System")
                        .FontSize(8).FontColor(Colors.Grey.Medium);
                    col.Item().Text(dataSet.ReportTitle)
                        .FontSize(16).Bold();
                    if (!string.IsNullOrEmpty(dataSet.ReportSubtitle))
                    {
                        col.Item().Text(dataSet.ReportSubtitle)
                            .FontSize(10).FontColor(Colors.Grey.Darken1);
                    }
                });
                row.ConstantItem(150).AlignRight().Column(col =>
                {
                    col.Item().Text($"Generated: {dataSet.GeneratedAt:yyyy-MM-dd HH:mm}")
                        .FontSize(8).FontColor(Colors.Grey.Medium);
                });
            });

            column.Item().PaddingVertical(5).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
        });
    }

    private static void ComposeContent(IContainer container, ReportDataSet dataSet)
    {
        container.PaddingVertical(5).Table(table =>
        {
            // Define columns
            table.ColumnsDefinition(columns =>
            {
                foreach (var col in dataSet.Columns)
                {
                    columns.RelativeColumn(col.Width > 0 ? col.Width : 100);
                }
            });

            // Header row
            foreach (var col in dataSet.Columns)
            {
                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten1)
                    .Padding(4)
                    .Background(Colors.Grey.Lighten3)
                    .Text(col.DisplayName)
                    .FontSize(8).Bold();
            }

            // Data rows
            var rowIndex = 0;
            foreach (var row in dataSet.Rows)
            {
                var bgColor = rowIndex % 2 == 0 ? Colors.White : Colors.Grey.Lighten4;

                foreach (var col in dataSet.Columns)
                {
                    row.TryGetValue(col.FieldName, out var value);
                    var text = FormatValue(value, col.ColumnType);

                    var cell = table.Cell()
                        .BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten3)
                        .Padding(4)
                        .Background(bgColor);

                    if (IsNumericType(col.ColumnType))
                    {
                        cell.AlignRight().Text(text).FontSize(8);
                    }
                    else
                    {
                        cell.Text(text).FontSize(8);
                    }
                }
                rowIndex++;
            }

            // Grand totals row
            if (dataSet.GrandTotals != null)
            {
                foreach (var col in dataSet.Columns)
                {
                    dataSet.GrandTotals.TryGetValue(col.FieldName, out var value);

                    var cell = table.Cell()
                        .BorderTop(2).BorderColor(Colors.Black)
                        .Padding(4)
                        .Background(Colors.Grey.Lighten3);

                    if (value != null)
                    {
                        var text = FormatValue(value, col.ColumnType);
                        if (IsNumericType(col.ColumnType))
                            cell.AlignRight().Text(text).FontSize(8).Bold();
                        else
                            cell.Text(text).FontSize(8).Bold();
                    }
                    else if (col == dataSet.Columns.First())
                    {
                        cell.Text("Grand Total").FontSize(8).Bold();
                    }
                    else
                    {
                        cell.Text("");
                    }
                }
            }
        });
    }

    private static void ComposeFooter(IContainer container)
    {
        container.Row(row =>
        {
            row.RelativeItem().AlignLeft()
                .Text("Carmen Financial Accounting System")
                .FontSize(7).FontColor(Colors.Grey.Medium);

            row.RelativeItem().AlignRight()
                .Text(text =>
                {
                    text.Span("Page ").FontSize(7).FontColor(Colors.Grey.Medium);
                    text.CurrentPageNumber().FontSize(7).FontColor(Colors.Grey.Medium);
                    text.Span(" of ").FontSize(7).FontColor(Colors.Grey.Medium);
                    text.TotalPages().FontSize(7).FontColor(Colors.Grey.Medium);
                });
        });
    }

    private static string FormatValue(object? value, ColumnType columnType)
    {
        if (value == null) return "";

        return columnType switch
        {
            ColumnType.Currency => value is decimal d ? d.ToString("N2") : value.ToString() ?? "",
            ColumnType.Number => value is decimal d2 ? d2.ToString("N2") : value.ToString() ?? "",
            ColumnType.Percentage => value is decimal d3 ? d3.ToString("P2") : value.ToString() ?? "",
            ColumnType.Date => value is DateTime dt ? dt.ToString("yyyy-MM-dd") : value.ToString() ?? "",
            ColumnType.Boolean => value is bool b ? (b ? "Yes" : "No") : value.ToString() ?? "",
            _ => value.ToString() ?? ""
        };
    }

    private static bool IsNumericType(ColumnType columnType)
    {
        return columnType is ColumnType.Currency or ColumnType.Number or ColumnType.Percentage;
    }
}
