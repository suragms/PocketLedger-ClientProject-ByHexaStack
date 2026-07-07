using MediatR;
using PocketLedger.Domain.Enums;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Reports.Queries.GetIncomeVsExpense;

public class GetIncomeVsExpenseQueryHandler : IRequestHandler<GetIncomeVsExpenseQuery, IncomeVsExpenseDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public GetIncomeVsExpenseQueryHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<IncomeVsExpenseDto> Handle(GetIncomeVsExpenseQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId!;

        var totalIncome = await _unitOfWork.Transactions.GetTotalByTypeAsync(
            userId, TransactionType.Income, request.StartDate, request.EndDate, cancellationToken);

        var totalExpense = await _unitOfWork.Transactions.GetTotalByTypeAsync(
            userId, TransactionType.Expense, request.StartDate, request.EndDate, cancellationToken);

        var monthlyBreakdown = new List<MonthlyData>();
        var current = new DateTime(request.StartDate.Year, request.StartDate.Month, 1);

        while (current <= request.EndDate)
        {
            var monthEnd = current.AddMonths(1).AddDays(-1);
            var monthIncome = await _unitOfWork.Transactions.GetTotalByTypeAsync(
                userId, TransactionType.Income, current, monthEnd, cancellationToken);
            var monthExpense = await _unitOfWork.Transactions.GetTotalByTypeAsync(
                userId, TransactionType.Expense, current, monthEnd, cancellationToken);

            monthlyBreakdown.Add(new MonthlyData
            {
                Month = current.ToString("MMM yyyy"),
                Income = monthIncome,
                Expense = monthExpense
            });

            current = current.AddMonths(1);
        }

        return new IncomeVsExpenseDto
        {
            TotalIncome = totalIncome,
            TotalExpense = totalExpense,
            MonthlyBreakdown = monthlyBreakdown
        };
    }
}
