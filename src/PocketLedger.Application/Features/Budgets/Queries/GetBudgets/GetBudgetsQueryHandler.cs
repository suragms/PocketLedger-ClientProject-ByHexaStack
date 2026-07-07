using AutoMapper;
using MediatR;
using PocketLedger.Application.Features.Budgets.DTOs;
using PocketLedger.Domain.Enums;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Budgets.Queries.GetBudgets;

public class GetBudgetsQueryHandler : IRequestHandler<GetBudgetsQuery, List<BudgetDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public GetBudgetsQueryHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<List<BudgetDto>> Handle(GetBudgetsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId!;
        var now = DateTime.UtcNow;
        var budgets = await _unitOfWork.Budgets.GetBudgetsByUserIdAsync(userId, cancellationToken);

        var budgetDtos = new List<BudgetDto>();

        foreach (var budget in budgets)
        {
            var (startDate, endDate) = budget.Period switch
            {
                BudgetPeriod.Weekly => (now.AddDays(-7), now),
                BudgetPeriod.Monthly => (new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc), now),
                BudgetPeriod.Quarterly => (new DateTime(now.Year, ((now.Month - 1) / 3) * 3 + 1, 1, 0, 0, 0, DateTimeKind.Utc), now),
                BudgetPeriod.Yearly => (new DateTime(now.Year, 1, 1, 0, 0, 0, DateTimeKind.Utc), now),
                _ => (budget.StartDate, budget.EndDate ?? now),
            };

            decimal spent;
            if (budget.CategoryId.HasValue)
            {
                spent = await _unitOfWork.Transactions.GetTotalByCategoryAsync(
                    userId, budget.CategoryId.Value, startDate, endDate, cancellationToken);
            }
            else
            {
                spent = await _unitOfWork.Transactions.GetTotalByTypeAsync(
                    userId, TransactionType.Expense, startDate, endDate, cancellationToken);
            }

            var dto = _mapper.Map<BudgetDto>(budget);
            dto.SpentAmount = spent;
            dto.PeriodName = budget.Period.ToString();
            dto.CategoryName = budget.Category?.Name;
            dto.CategoryColor = budget.Category?.Color;
            budgetDtos.Add(dto);
        }

        return budgetDtos;
    }
}
