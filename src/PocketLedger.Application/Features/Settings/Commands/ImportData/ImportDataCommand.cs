using MediatR;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Enums;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Settings.Commands.ImportData;

public record ImportDataCommand : IRequest<ImportResult>
{
    public Stream FileStream { get; set; } = null!;
    public string FileName { get; set; } = string.Empty;
}

public class ImportResult
{
    public int AccountsImported { get; set; }
    public int TransactionsImported { get; set; }
    public int CategoriesImported { get; set; }
    public int BudgetsImported { get; set; }
    public DateTime ImportedAt { get; set; }
}

public class ImportDataCommandHandler : IRequestHandler<ImportDataCommand, ImportResult>
{
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUser;
    private readonly IUnitOfWork _unitOfWork;

    public ImportDataCommandHandler(
        IUserRepository userRepository,
        ICurrentUserService currentUser,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _currentUser = currentUser;
        _unitOfWork = unitOfWork;
    }

    public async Task<ImportResult> Handle(ImportDataCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(_currentUser.UserId!, cancellationToken)
            ?? throw new Exception("User not found");

        using var reader = new StreamReader(request.FileStream);
        var json = await reader.ReadToEndAsync(cancellationToken);

        var importData = System.Text.Json.JsonSerializer.Deserialize<ImportDataDto>(json)
            ?? throw new Exception("Invalid import file format");

        var accountsImported = 0;
        var transactionsImported = 0;
        var categoriesImported = 0;
        var budgetsImported = 0;

        if (importData.Categories != null)
        {
            foreach (var cat in importData.Categories)
            {
                var category = new Category
                {
                    Name = cat.Name ?? "Imported Category",
                    Icon = cat.Icon ?? "folder",
                    Color = cat.Color ?? "#6366f1",
                    Type = (CategoryType)cat.Type,
                    UserId = _currentUser.UserId!
                };
                await _unitOfWork.Categories.AddAsync(category, cancellationToken);
                categoriesImported++;
            }
        }

        if (importData.Accounts != null)
        {
            foreach (var acc in importData.Accounts)
            {
                var account = new Account
                {
                    Name = acc.Name ?? "Imported Account",
                    Type = (AccountType)acc.Type,
                    Balance = acc.Balance,
                    Currency = acc.Currency ?? user.DefaultCurrency,
                    Description = acc.Description,
                    UserId = _currentUser.UserId!
                };
                await _unitOfWork.Accounts.AddAsync(account, cancellationToken);
                accountsImported++;
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ImportResult
        {
            AccountsImported = accountsImported,
            TransactionsImported = transactionsImported,
            CategoriesImported = categoriesImported,
            BudgetsImported = budgetsImported,
            ImportedAt = DateTime.UtcNow
        };
    }
}

public class ImportDataDto
{
    public List<ImportAccountDto>? Accounts { get; set; }
    public List<ImportTransactionDto>? Transactions { get; set; }
    public List<ImportCategoryDto>? Categories { get; set; }
    public List<ImportBudgetDto>? Budgets { get; set; }
}

public class ImportAccountDto
{
    public string? Name { get; set; }
    public int Type { get; set; }
    public decimal Balance { get; set; }
    public string? Currency { get; set; }
    public string? Description { get; set; }
}

public class ImportTransactionDto
{
    public decimal Amount { get; set; }
    public int Type { get; set; }
    public DateTime Date { get; set; }
    public string? Note { get; set; }
    public string? Payee { get; set; }
}

public class ImportCategoryDto
{
    public string? Name { get; set; }
    public string? Icon { get; set; }
    public string? Color { get; set; }
    public int Type { get; set; }
}

public class ImportBudgetDto
{
    public string? Name { get; set; }
    public decimal Amount { get; set; }
    public string? Currency { get; set; }
    public int Period { get; set; }
}
