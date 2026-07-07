using MediatR;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Admin.Queries.GetAllBudgets;

public record GetAllBudgetsQuery : IRequest<PagedBudgetsDto>
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
    public string? Search { get; init; }
    public string? UserId { get; init; }
}

public class PagedBudgetsDto
{
    public List<BudgetListItemDto> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
}

public class BudgetListItemDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public int Period { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? AlertThreshold { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public string? CategoryName { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class GetAllBudgetsQueryHandler : IRequestHandler<GetAllBudgetsQuery, PagedBudgetsDto>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetAllBudgetsQueryHandler(IUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<PagedBudgetsDto> Handle(GetAllBudgetsQuery request, CancellationToken cancellationToken)
    {
        var (items, totalCount) = await _unitOfWork.Budgets.GetPagedWithDetailsAsync(
            request.UserId, request.Search, request.Page, request.PageSize, cancellationToken);

        return new PagedBudgetsDto
        {
            Items = items.Select(b => new BudgetListItemDto
            {
                Id = b.Id,
                Name = b.Name,
                Amount = b.Amount,
                Currency = b.Currency,
                Period = (int)b.Period,
                StartDate = b.StartDate,
                EndDate = b.EndDate,
                AlertThreshold = b.AlertThreshold != null ? (int?)Math.Round(b.AlertThreshold.Value) : null,
                UserId = b.UserId,
                UserEmail = b.User?.Email ?? "",
                CategoryName = b.Category?.Name,
                CreatedAt = b.CreatedAt
            }).ToList(),
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize)
        };
    }
}
