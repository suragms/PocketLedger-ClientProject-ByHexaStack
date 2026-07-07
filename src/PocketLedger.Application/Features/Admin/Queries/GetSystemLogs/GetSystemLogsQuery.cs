using MediatR;

namespace PocketLedger.Application.Features.Admin.Queries.GetSystemLogs;

public record GetSystemLogsQuery : IRequest<SystemLogsDto>
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 50;
    public string? Level { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
}

public class SystemLogsDto
{
    public List<SystemLogEntry> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}

public class SystemLogEntry
{
    public DateTime Timestamp { get; set; }
    public string Level { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Exception { get; set; }
    public string? Source { get; set; }
}

public class GetSystemLogsQueryHandler : IRequestHandler<GetSystemLogsQuery, SystemLogsDto>
{
    public Task<SystemLogsDto> Handle(GetSystemLogsQuery request, CancellationToken cancellationToken)
    {
        // System logs are read from Serilog rolling files
        var logsDir = Path.Combine(AppContext.BaseDirectory, "Logs");
        var logFiles = Directory.Exists(logsDir)
            ? Directory.GetFiles(logsDir, "log-*.txt").OrderByDescending(f => f).Take(5).ToList()
            : new List<string>();

        var allLines = new List<SystemLogEntry>();
        foreach (var file in logFiles)
        {
            try
            {
                var lines = File.ReadAllLines(file);
                foreach (var line in lines.TakeLast(500))
                {
                    if (!string.IsNullOrWhiteSpace(line))
                    {
                        allLines.Add(new SystemLogEntry
                        {
                            Timestamp = DateTime.UtcNow,
                            Level = "Info",
                            Message = line.Length > 200 ? line[..200] : line
                        });
                    }
                }
            }
            catch { }
        }

        var filtered = allLines.AsEnumerable();
        if (!string.IsNullOrEmpty(request.Level))
            filtered = filtered.Where(l => l.Level.Equals(request.Level, StringComparison.OrdinalIgnoreCase));

        var paged = filtered
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        return Task.FromResult(new SystemLogsDto
        {
            Items = paged,
            TotalCount = allLines.Count,
            Page = request.Page,
            PageSize = request.PageSize
        });
    }
}
