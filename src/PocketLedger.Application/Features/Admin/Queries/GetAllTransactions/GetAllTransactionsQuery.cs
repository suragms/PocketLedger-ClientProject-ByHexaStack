using MediatR;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Admin.Queries.GetAllTransactions;

public record GetAllTransactionsQuery : IRequest<PagedTransactionsDto>
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
    public string? Search { get; init; }
    public string? UserId { get; init; }
    public int? Type { get; init; }
}

public class PagedTransactionsDto
{
    public List<TransactionListItemDto> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
}

public class TransactionListItemDto
{
    public int Id { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public int Type { get; set; }
    public DateTime Date { get; set; }
    public string? Note { get; set; }
    public string? Payee { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public string? AccountName { get; set; }
    public string? CategoryName { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class GetAllTransactionsQueryHandler : IRequestHandler<GetAllTransactionsQuery, PagedTransactionsDto>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetAllTransactionsQueryHandler(IUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<PagedTransactionsDto> Handle(GetAllTransactionsQuery request, CancellationToken cancellationToken)
    {
        var (items, totalCount) = await _unitOfWork.Transactions.GetPagedForAdminAsync(
            request.UserId, request.Type, request.Search, request.Page, request.PageSize, cancellationToken);

        return new PagedTransactionsDto
        {
            Items = items.Select(t => new TransactionListItemDto
            {
                Id = t.Id,
                Amount = t.Amount,
                Currency = t.Currency,
                Type = (int)t.Type,
                Date = t.Date,
                Note = t.Note,
                Payee = t.Payee,
                UserId = t.UserId,
                UserEmail = t.User?.Email ?? "",
                AccountName = t.Account?.Name,
                CategoryName = t.Category?.Name,
                CreatedAt = t.CreatedAt
            }).ToList(),
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize)
        };
    }
}
