using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Infrastructure.Services;

public class FileStorageService : IFileStorageService
{
    private readonly string _uploadPath;
    private readonly ILogger<FileStorageService> _logger;
    private readonly HashSet<string> _allowedExtensions;
    private readonly long _maxFileSize;

    public FileStorageService(IConfiguration configuration, ILogger<FileStorageService> logger)
    {
        _uploadPath = configuration["Storage:LocalPath"] ?? Path.Combine(Directory.GetCurrentDirectory(), "uploads");
        _logger = logger;

        var extensionsSection = configuration.GetSection("Storage:AllowedExtensions");
        var extensions = extensionsSection.Exists() && extensionsSection.Get<string[]>() != null
            ? extensionsSection.Get<string[]>()!
            : new[] { ".jpg", ".jpeg", ".png", ".webp", ".heic" };
        _allowedExtensions = new HashSet<string>(extensions, StringComparer.OrdinalIgnoreCase);

        _maxFileSize = configuration.GetValue<long>("Storage:MaxFileSizeBytes", 10 * 1024 * 1024);

        if (!Directory.Exists(_uploadPath))
            Directory.CreateDirectory(_uploadPath);
    }

    public async Task<string> UploadAsync(Stream fileStream, string fileName, string contentType, CancellationToken cancellationToken = default)
    {
        var sanitizedFileName = SanitizeFileName(fileName);
        var extension = Path.GetExtension(sanitizedFileName).ToLowerInvariant();

        if (!_allowedExtensions.Contains(extension))
            throw new InvalidOperationException($"File extension '{extension}' is not allowed.");

        var uniqueName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(_uploadPath, uniqueName);

        using var fileStream2 = new FileStream(filePath, FileMode.Create);
        await fileStream.CopyToAsync(fileStream2, cancellationToken);

        _logger.LogInformation("File uploaded: {FileName} -> {Path}", sanitizedFileName, filePath);
        return $"/uploads/{uniqueName}";
    }

    public async Task<string> UploadReceiptAsync(Stream fileStream, string userId, string fileName, CancellationToken cancellationToken = default)
    {
        var sanitizedFileName = SanitizeFileName(fileName);
        var extension = Path.GetExtension(sanitizedFileName).ToLowerInvariant();

        if (!_allowedExtensions.Contains(extension))
            throw new InvalidOperationException($"File extension '{extension}' is not allowed.");

        var userPath = Path.Combine(_uploadPath, "receipts", SanitizeFileName(userId));
        if (!Directory.Exists(userPath))
            Directory.CreateDirectory(userPath);

        var uniqueName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(userPath, uniqueName);

        using var fileStream2 = new FileStream(filePath, FileMode.Create);
        await fileStream.CopyToAsync(fileStream2, cancellationToken);

        _logger.LogInformation("Receipt uploaded for user {UserId}: {Path}", userId, filePath);
        return $"/uploads/receipts/{SanitizeFileName(userId)}/{uniqueName}";
    }

    public Task<string> CreateThumbnailAsync(Stream fileStream, string fileName, int width, int height, CancellationToken cancellationToken = default)
    {
        var uniqueName = $"thumb_{Guid.NewGuid()}{Path.GetExtension(SanitizeFileName(fileName))}";
        var filePath = Path.Combine(_uploadPath, "thumbnails", uniqueName);

        var dir = Path.GetDirectoryName(filePath)!;
        if (!Directory.Exists(dir))
            Directory.CreateDirectory(dir);

        fileStream.Position = 0;
        using var fileStream2 = new FileStream(filePath, FileMode.Create);
        fileStream.CopyTo(fileStream2);

        _logger.LogInformation("Thumbnail created: {Path}", filePath);
        return Task.FromResult($"/uploads/thumbnails/{uniqueName}");
    }

    public Task DeleteAsync(string fileUrl, CancellationToken cancellationToken = default)
    {
        var relativePath = fileUrl.TrimStart('/');
        var filePath = Path.Combine(_uploadPath, relativePath);

        if (!IsPathWithinBasePath(filePath, _uploadPath))
        {
            _logger.LogWarning("Attempted path traversal: {Path}", fileUrl);
            return Task.CompletedTask;
        }

        if (File.Exists(filePath))
        {
            File.Delete(filePath);
            _logger.LogInformation("File deleted: {Path}", filePath);
        }
        return Task.CompletedTask;
    }

    public Task<Stream> DownloadAsync(string fileUrl, CancellationToken cancellationToken = default)
    {
        var relativePath = fileUrl.TrimStart('/');
        var filePath = Path.Combine(_uploadPath, relativePath);

        if (!IsPathWithinBasePath(filePath, _uploadPath))
            throw new InvalidOperationException("Invalid file path.");

        if (!File.Exists(filePath))
            throw new FileNotFoundException($"File not found: {fileUrl}");

        Stream stream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read, bufferSize: 4096, useAsync: true);
        return Task.FromResult(stream);
    }

    private static string SanitizeFileName(string fileName)
    {
        var sanitized = Path.GetFileName(fileName);
        var invalidChars = Path.GetInvalidFileNameChars();
        return string.Concat(sanitized.Where(c => !invalidChars.Contains(c)));
    }

    private static bool IsPathWithinBasePath(string path, string basePath)
    {
        var fullBasePath = Path.GetFullPath(basePath);
        var fullPath = Path.GetFullPath(path);
        return fullPath.StartsWith(fullBasePath, StringComparison.OrdinalIgnoreCase);
    }
}
