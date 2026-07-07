using MediatR;
using PocketLedger.Application.Common.Exceptions;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Enums;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Accounts.Queries.GetWalletStatistics;

public class GetWalletStatisticsQueryHandler : IRequestHandler<GetWalletStatisticsQuery, WalletStatisticsDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public GetWalletStatisticsQueryHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<WalletStatisticsDto> Handle(GetWalletStatisticsQuery request, CancellationToken cancellationToken)
    {
        var account = await _unitOfWork.Accounts.GetByIdAsync(request.AccountId, cancellationToken)
            ?? throw new NotFoundException(nameof(Account), request.AccountId);

        if (account.UserId != _currentUserService.UserId)
            throw new UnauthorizedAccessException("You do not have access to this account.");

        var transactions = await _unitOfWork.Transactions.FindAsync(
            t => t.AccountId == request.AccountId && !t.IsDeleted,
            cancellationToken);

        var incomeTransactions = transactions.Where(t => t.Type == TransactionType.Income).ToList();
        var expenseTransactions = transactions.Where(t => t.Type == TransactionType.Expense).ToList();

        var incomeAmount = incomeTransactions.Sum(t => t.Amount);
        var expenseAmount = expenseTransactions.Sum(t => t.Amount);
        var totalCount = transactions.Count;

        var monthlyBreakdown = transactions
            .GroupBy(t => new { t.Date.Year, t.Date.Month })
            .Select(g => new MonthlyBreakdownDto
            {
                Month = $"{g.Key.Year}-{g.Key.Month:D2}",
                Income = g.Where(t => t.Type == TransactionType.Income).Sum(t => t.Amount),
                Expense = g.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Amount),
            })
            .OrderByDescending(m => m.Month)
            .Take(12)
            .ToList();

        var categoryBreakdown = transactions
            .Where(t => t.Type == TransactionType.Expense && t.CategoryId.HasValue)
            .GroupBy(t => new { t.CategoryId, t.Category?.Name, t.Category?.Color })
            .Select(g => new CategoryBreakdownDto
            {
                CategoryId = g.Key.CategoryId ?? 0,
                CategoryName = g.Key.Name ?? "Uncategorized",
                Color = g.Key.Color ?? "#6b7280",
                Amount = g.Sum(t => t.Amount),
                Percentage = expenseAmount > 0 ? Math.Round(g.Sum(t => t.Amount) / expenseAmount * 100, 1) : 0,
                TransactionCount = g.Count(),
            })
            .OrderByDescending(c => c.Amount)
            .Take(10)
            .ToList();

        return new WalletStatisticsDto
        {
            AccountId = account.Id,
            AccountName = account.Name,
            Balance = account.Balance,
            Currency = account.Currency,
            TotalTransactions = totalCount,
            TotalIncome = incomeTransactions.Count,
            TotalExpenses = expenseTransactions.Count,
            IncomeAmount = incomeAmount,
            ExpenseAmount = expenseAmount,
            AverageTransactionAmount = totalCount > 0 ? Math.Round(transactions.Average(t => t.Amount), 2) : 0,
            HighestExpense = expenseTransactions.Count > 0 ? expenseTransactions.Max(t => t.Amount) : 0,
            HighestIncome = incomeTransactions.Count > 0 ? incomeTransactions.Max(t => t.Amount) : 0,
            LastTransactionDate = transactions.Count > 0 ? transactions.Max(t => t.Date) : null,
            FirstTransactionDate = transactions.Count > 0 ? transactions.Min(t => t.Date) : null,
            MonthlyBreakdown = monthlyBreakdown,
            TopCategories = categoryBreakdown,
        };
    }
}
