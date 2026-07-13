using MediatR;
using PocketLedger.Application.Common;
using PocketLedger.Application.Features.Transactions.DTOs;
using PocketLedger.Domain.Enums;

namespace PocketLedger.Application.Features.Transactions.Queries.GetTransactions;

public class GetTransactionsQuery : IRequest<PagedResult<TransactionDto>>
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? Search { get; set; }
    public string? SortBy { get; set; }
    public string? SortOrder { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public TransactionType? Type { get; set; }
    public int? AccountId { get; set; }
    public int? CategoryId { get; set; }
    public int? TagId { get; set; }
    public decimal? MinAmount { get; set; }
    public decimal? MaxAmount { get; set; }
    public string? Payee { get; set; }
}