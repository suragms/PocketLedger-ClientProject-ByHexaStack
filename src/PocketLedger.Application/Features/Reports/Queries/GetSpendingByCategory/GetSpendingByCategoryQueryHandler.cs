using MediatR;
using PocketLedger.Domain.Enums;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Reports.Queries.GetSpendingByCategory;

public class GetSpendingByCategoryQueryHandler : IRequestHandler<GetSpendingByCategoryQuery, List<CategorySpendingDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public GetSpendingByCategoryQueryHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<List<CategorySpendingDto>> Handle(GetSpendingByCategoryQuery request, CancellationToken cancellationToken)
    {
        var spendingByCategory = await _unitOfWork.Transactions.GetSpendingByCategoryAsync(
            _currentUserService.UserId!, request.StartDate, request.EndDate, cancellationToken);

        var totalSpending = spendingByCategory.Values.Sum();

        return spendingByCategory.Select(kvp => new CategorySpendingDto
        {
            CategoryId = kvp.Key.GetHashCode(),
            CategoryName = kvp.Key,
            Color = "#6366f1",
            Amount = kvp.Value,
            Percentage = totalSpending > 0 ? (double)(kvp.Value / totalSpending) * 100 : 0
        }).OrderByDescending(x => x.Amount).ToList();
    }
}
