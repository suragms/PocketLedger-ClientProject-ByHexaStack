using System.Globalization;
using System.Text;
using CsvHelper;
using CsvHelper.Configuration;
using PocketLedger.Application.Features.Reports.Queries.GetReport;
using PocketLedger.Application.Common.Interfaces;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace PocketLedger.Infrastructure.Services;

public class ReportExportService : IReportExportService
{
    public byte[] ExportToCsv(ReportDto report)
    {
        using var memoryStream = new MemoryStream();
        using var writer = new StreamWriter(memoryStream, Encoding.UTF8);
        using var csv = new CsvWriter(writer, new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            HasHeaderRecord = true,
        });

        csv.WriteField("PocketLedger Financial Report");
        csv.NextRecord();
        csv.WriteField($"Period: {report.Period}");
        csv.NextRecord();
        csv.WriteField($"From: {report.StartDate:yyyy-MM-dd} To: {report.EndDate:yyyy-MM-dd}");
        csv.NextRecord();
        csv.WriteField($"Currency: {report.Currency}");
        csv.NextRecord();
        csv.NextRecord();

        csv.WriteField("Summary");
        csv.NextRecord();
        csv.WriteField("Metric");
        csv.WriteField("Value");
        csv.NextRecord();
        csv.WriteField("Total Income");
        csv.WriteField(report.TotalIncome.ToString("F2"));
        csv.NextRecord();
        csv.WriteField("Total Expenses");
        csv.WriteField(report.TotalExpense.ToString("F2"));
        csv.NextRecord();
        csv.WriteField("Net Income");
        csv.WriteField(report.NetIncome.ToString("F2"));
        csv.NextRecord();
        csv.WriteField("Savings Rate");
        csv.WriteField($"{report.SavingsRate:F1}%");
        csv.NextRecord();
        csv.NextRecord();

        csv.WriteField("Monthly Breakdown");
        csv.NextRecord();
        csv.WriteField("Month");
        csv.WriteField("Income");
        csv.WriteField("Expense");
        csv.WriteField("Net");
        csv.NextRecord();
        foreach (var m in report.MonthlyBreakdown)
        {
            csv.WriteField(m.Month);
            csv.WriteField(m.Income.ToString("F2"));
            csv.WriteField(m.Expense.ToString("F2"));
            csv.WriteField(m.Net.ToString("F2"));
            csv.NextRecord();
        }
        csv.NextRecord();

        csv.WriteField("Category Breakdown");
        csv.NextRecord();
        csv.WriteField("Category");
        csv.WriteField("Amount");
        csv.WriteField("Percentage");
        csv.NextRecord();
        foreach (var c in report.CategoryBreakdown)
        {
            csv.WriteField(c.CategoryName);
            csv.WriteField(c.Amount.ToString("F2"));
            csv.WriteField($"{c.Percentage:F1}%");
            csv.NextRecord();
        }
        csv.NextRecord();

        csv.WriteField("Wallet Analysis");
        csv.NextRecord();
        csv.WriteField("Wallet");
        csv.WriteField("Balance");
        csv.WriteField("Income");
        csv.WriteField("Expense");
        csv.WriteField("Net");
        csv.NextRecord();
        foreach (var w in report.WalletAnalysis)
        {
            csv.WriteField(w.AccountName);
            csv.WriteField(w.Balance.ToString("F2"));
            csv.WriteField(w.TotalIncome.ToString("F2"));
            csv.WriteField(w.TotalExpense.ToString("F2"));
            csv.WriteField(w.NetAmount.ToString("F2"));
            csv.NextRecord();
        }

        writer.Flush();
        return memoryStream.ToArray();
    }

    public byte[] ExportToPdf(ReportDto report)
    {
        QuestPDF.Settings.License = LicenseType.Community;

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Element(header =>
                {
                    header.Column(col =>
                    {
                        col.Item().Text("PocketLedger").Bold().FontSize(20);
                        col.Item().Text($"Financial Report - {report.Period}").FontSize(14);
                        col.Item().Text($"{report.StartDate:MMM d, yyyy} - {report.EndDate:MMM d, yyyy}").FontSize(10);
                        col.Item().LineHorizontal(1);
                    });
                });

                page.Content().Element(content =>
                {
                    content.Column(col =>
                    {
                        col.Item().PaddingBottom(10);
                        col.Item().Text("Summary").Bold().FontSize(16);
                        col.Item().Text($"Total Income: ${report.TotalIncome:N2}");
                        col.Item().Text($"Total Expenses: ${report.TotalExpense:N2}");
                        col.Item().Text($"Net Income: ${report.NetIncome:N2}");
                        col.Item().Text($"Savings Rate: {report.SavingsRate:F1}%");

                        col.Item().PaddingBottom(15);
                        col.Item().Text("Monthly Breakdown").Bold().FontSize(14);
                        foreach (var m in report.MonthlyBreakdown)
                        {
                            col.Item().Text($"{m.Month}: Income ${m.Income:N2} | Expense ${m.Expense:N2} | Net ${m.Net:N2}");
                        }

                        col.Item().PaddingBottom(15);
                        col.Item().Text("Category Breakdown").Bold().FontSize(14);
                        foreach (var c in report.CategoryBreakdown)
                        {
                            col.Item().Text($"{c.CategoryName}: ${c.Amount:N2} ({c.Percentage:F1}%)");
                        }

                        col.Item().PaddingBottom(15);
                        col.Item().Text("Wallet Analysis").Bold().FontSize(14);
                        foreach (var w in report.WalletAnalysis)
                        {
                            col.Item().Text($"{w.AccountName}: Balance ${w.Balance:N2} | Income ${w.TotalIncome:N2} | Expense ${w.TotalExpense:N2}");
                        }
                    });
                });

                page.Footer().Element(footer =>
                {
                    footer.AlignCenter().Text($"Generated on {DateTime.Now:MMM d, yyyy HH:mm}").FontSize(8);
                });
            });
        });

        using var stream = new MemoryStream();
        document.GeneratePdf(stream);
        return stream.ToArray();
    }
}
