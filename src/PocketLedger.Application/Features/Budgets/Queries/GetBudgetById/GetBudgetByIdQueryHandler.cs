using AutoMapper;
using MediatR;
using PocketLedger.Application.Common.Exceptions;
using PocketLedger.Application.Features.Budgets.DTOs;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Enums;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Budgets.Queries.GetBudgetById;

public class GetBudgetByIdQueryHandler : IRequestHandler<GetBudgetByIdQuery, BudgetDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public GetBudgetByIdQueryHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<BudgetDto> Handle(GetBudgetByIdQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId!;
        var now = DateTime.UtcNow;

        var budget = await _unitOfWork.Budgets.GetBudgetWithCategoryAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Budget), request.Id);

        if (budget.UserId != userId)
            throw new UnauthorizedAccessException("You do not have access to this budget.");

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
        return dto;
    }
}
