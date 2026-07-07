using PocketLedger.Application.Features.Reports.Queries.GetReport;

namespace PocketLedger.Application.Common.Interfaces;

public interface IReportExportService
{
    byte[] ExportToCsv(ReportDto report);
    byte[] ExportToPdf(ReportDto report);
}
