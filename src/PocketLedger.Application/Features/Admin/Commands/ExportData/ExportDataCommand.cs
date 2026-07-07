using MediatR;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Admin.Commands.ExportData;

public record ExportDataCommand : IRequest<ExportResultDto>
{
    public string? Type { get; init; }
}

public class ExportResultDto
{
    public string DownloadUrl { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public DateTime ExportedAt { get; set; }
}

public class ExportDataCommandHandler : IRequestHandler<ExportDataCommand, ExportResultDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IFileStorageService _fileStorage;

    public ExportDataCommandHandler(IUserRepository userRepository, IUnitOfWork unitOfWork, IFileStorageService fileStorage)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _fileStorage = fileStorage;
    }

    public async Task<ExportResultDto> Handle(ExportDataCommand request, CancellationToken cancellationToken)
    {
        var users = await _userRepository.GetAllAsync(cancellationToken);
        var exportData = new
        {
            ExportDate = DateTime.UtcNow,
            Type = request.Type ?? "all",
            UserCount = users.Count,
            Users = users.Select(u => new { u.Email, u.FirstName, u.LastName, u.CreatedAt, u.IsActive })
        };

        var json = System.Text.Json.JsonSerializer.Serialize(exportData, new System.Text.Json.JsonSerializerOptions { WriteIndented = true });
        var bytes = System.Text.Encoding.UTF8.GetBytes(json);
        using var stream = new MemoryStream(bytes);

        var fileName = $"admin-export-{DateTime.UtcNow:yyyyMMdd-HHmmss}.json";
        var url = await _fileStorage.UploadAsync(stream, fileName, "application/json", cancellationToken);

        return new ExportResultDto
        {
            DownloadUrl = url,
            FileName = fileName,
            FileSize = bytes.Length,
            ExportedAt = DateTime.UtcNow
        };
    }
}
