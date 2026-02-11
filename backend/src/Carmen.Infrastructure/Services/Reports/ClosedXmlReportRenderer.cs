using Carmen.Application.DTOs.Report;
using Carmen.Application.Services.Report;
using Carmen.Domain.Entities.Report;
using ClosedXML.Excel;

namespace Carmen.Infrastructure.Services.Reports;

public class ClosedXmlReportRenderer : IExcelReportRenderer
{
    public Task<byte[]> RenderAsync(ReportDataSet dataSet)
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add(TruncateSheetName(dataSet.ReportTitle));

        // Title rows
        var row = 1;
        worksheet.Cell(row, 1).Value = dataSet.ReportTitle;
        worksheet.Cell(row, 1).Style.Font.Bold = true;
        worksheet.Cell(row, 1).Style.Font.FontSize = 14;
        row++;

        if (!string.IsNullOrEmpty(dataSet.ReportSubtitle))
        {
            worksheet.Cell(row, 1).Value = dataSet.ReportSubtitle;
            worksheet.Cell(row, 1).Style.Font.FontSize = 10;
            worksheet.Cell(row, 1).Style.Font.FontColor = XLColor.Gray;
            row++;
        }

        worksheet.Cell(row, 1).Value = $"Generated: {dataSet.GeneratedAt:yyyy-MM-dd HH:mm}";
        worksheet.Cell(row, 1).Style.Font.FontSize = 8;
        worksheet.Cell(row, 1).Style.Font.FontColor = XLColor.Gray;
        row += 2;

        // Header row
        var headerRow = row;
        for (var col = 0; col < dataSet.Columns.Count; col++)
        {
            var cell = worksheet.Cell(headerRow, col + 1);
            cell.Value = dataSet.Columns[col].DisplayName;
            cell.Style.Font.Bold = true;
            cell.Style.Fill.BackgroundColor = XLColor.LightGray;
            cell.Style.Border.BottomBorder = XLBorderStyleValues.Medium;
            cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        }
        row++;

        // Data rows
        foreach (var dataRow in dataSet.Rows)
        {
            for (var col = 0; col < dataSet.Columns.Count; col++)
            {
                var colDef = dataSet.Columns[col];
                dataRow.TryGetValue(colDef.FieldName, out var value);
                var cell = worksheet.Cell(row, col + 1);
                SetCellValue(cell, value, colDef.ColumnType);
            }
            row++;
        }

        // Grand totals row
        if (dataSet.GrandTotals != null)
        {
            for (var col = 0; col < dataSet.Columns.Count; col++)
            {
                var colDef = dataSet.Columns[col];
                dataSet.GrandTotals.TryGetValue(colDef.FieldName, out var value);
                var cell = worksheet.Cell(row, col + 1);

                if (value != null)
                {
                    SetCellValue(cell, value, colDef.ColumnType);
                }
                else if (col == 0)
                {
                    cell.Value = "Grand Total";
                }

                cell.Style.Font.Bold = true;
                cell.Style.Border.TopBorder = XLBorderStyleValues.Double;
            }
        }

        // Auto-fit columns
        worksheet.Columns().AdjustToContents(5, 50);

        // Freeze header row
        worksheet.SheetView.FreezeRows(headerRow);

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return Task.FromResult(stream.ToArray());
    }

    private static void SetCellValue(IXLCell cell, object? value, ColumnType columnType)
    {
        if (value == null)
        {
            cell.Value = "";
            return;
        }

        switch (columnType)
        {
            case ColumnType.Currency:
                if (value is decimal d)
                {
                    cell.Value = d;
                    cell.Style.NumberFormat.Format = "#,##0.00";
                    cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
                }
                else
                {
                    cell.Value = value.ToString();
                }
                break;

            case ColumnType.Number:
                if (value is decimal d2)
                {
                    cell.Value = d2;
                    cell.Style.NumberFormat.Format = "#,##0.00";
                    cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
                }
                else if (value is int i)
                {
                    cell.Value = i;
                    cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
                }
                else
                {
                    cell.Value = value.ToString();
                }
                break;

            case ColumnType.Percentage:
                if (value is decimal d3)
                {
                    cell.Value = d3 / 100;
                    cell.Style.NumberFormat.Format = "0.00%";
                    cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
                }
                else
                {
                    cell.Value = value.ToString();
                }
                break;

            case ColumnType.Date:
                if (value is DateTime dt)
                {
                    cell.Value = dt;
                    cell.Style.DateFormat.Format = "yyyy-MM-dd";
                }
                else
                {
                    cell.Value = value.ToString();
                }
                break;

            case ColumnType.Boolean:
                cell.Value = value is bool b ? (b ? "Yes" : "No") : value.ToString();
                break;

            default:
                cell.Value = value.ToString();
                break;
        }
    }

    private static string TruncateSheetName(string name)
    {
        // Excel sheet names are limited to 31 characters
        var clean = name.Replace("[", "").Replace("]", "").Replace("*", "")
            .Replace("?", "").Replace("/", "").Replace("\\", "");
        return clean.Length > 31 ? clean[..31] : clean;
    }
}
