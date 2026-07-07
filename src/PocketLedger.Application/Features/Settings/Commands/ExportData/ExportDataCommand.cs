using MediatR;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Settings.Commands.ExportData;

public record ExportDataCommand : IRequest<ExportResult>;

public class ExportResult
{
    public string DownloadUrl { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public DateTime ExportedAt { get; set; }
}

public class ExportDataCommandHandler : IRequestHandler<ExportDataCommand, ExportResult>
{
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUser;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IFileStorageService _fileStorage;

    public ExportDataCommandHandler(
        IUserRepository userRepository,
        ICurrentUserService currentUser,
        IUnitOfWork unitOfWork,
        IFileStorageService fileStorage)
    {
        _userRepository = userRepository;
        _currentUser = currentUser;
        _unitOfWork = unitOfWork;
        _fileStorage = fileStorage;
    }

    public async Task<ExportResult> Handle(ExportDataCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(_currentUser.UserId!, cancellationToken)
            ?? throw new Exception("User not found");

        var accounts = await _unitOfWork.Accounts.GetAccountsByUserIdAsync(_currentUser.UserId!, cancellationToken);
        var transactions = await _unitOfWork.Transactions.FindAsync(t => t.UserId == _currentUser.UserId!, cancellationToken);
        var categories = await _unitOfWork.Categories.GetCategoriesByUserIdAsync(_currentUser.UserId!, cancellationToken);
        var budgets = await _unitOfWork.Budgets.GetBudgetsByUserIdAsync(_currentUser.UserId!, cancellationToken);

        var exportData = new
        {
            ExportDate = DateTime.UtcNow,
            Profile = new
            {
                user.FirstName,
                user.LastName,
                user.Email,
                user.DefaultCurrency,
                user.CreatedAt
            },
            Accounts = accounts?.Select(a => new { a.Name, a.Type, a.Balance, a.Currency, a.Description }) ?? Enumerable.Empty<object>(),
            Transactions = transactions?.Select(t => new { t.Amount, t.Type, t.Date, t.Note, t.Payee }) ?? Enumerable.Empty<object>(),
            Categories = categories?.Select(c => new { c.Name, c.Icon, c.Color, c.Type }) ?? Enumerable.Empty<object>(),
            Budgets = budgets?.Select(b => new { b.Name, b.Amount, b.Currency, b.Period }) ?? Enumerable.Empty<object>()
        };

        var json = System.Text.Json.JsonSerializer.Serialize(exportData, new System.Text.Json.JsonSerializerOptions { WriteIndented = true });
        var bytes = System.Text.Encoding.UTF8.GetBytes(json);
        using var stream = new MemoryStream(bytes);

        var fileName = $"pocketledger-export-{DateTime.UtcNow:yyyyMMdd-HHmmss}.json";
        var url = await _fileStorage.UploadAsync(stream, fileName, "application/json", cancellationToken);

        return new ExportResult
        {
            DownloadUrl = url,
            FileName = fileName,
            FileSize = bytes.Length,
            ExportedAt = DateTime.UtcNow
        };
    }
}
