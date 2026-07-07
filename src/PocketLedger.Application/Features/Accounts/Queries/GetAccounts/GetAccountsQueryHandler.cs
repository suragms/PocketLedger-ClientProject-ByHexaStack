using AutoMapper;
using MediatR;
using PocketLedger.Application.Common;
using PocketLedger.Application.Features.Accounts.DTOs;
using PocketLedger.Domain.Enums;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Accounts.Queries.GetAccounts;

public class GetAccountsQueryHandler : IRequestHandler<GetAccountsQuery, PagedResult<AccountDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public GetAccountsQueryHandler(
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<PagedResult<AccountDto>> Handle(GetAccountsQuery request, CancellationToken cancellationToken)
    {
        var accounts = await _unitOfWork.Accounts.GetAccountsWithStatsAsync(
            _currentUserService.UserId!, cancellationToken);

        var filtered = accounts
            .Where(a => !request.AccountType.HasValue || a.Type == request.AccountType.Value)
            .Where(a => !request.IncludeInBalance.HasValue || a.IncludeInBalance == request.IncludeInBalance.Value)
            .ToList();

        var totalCount = filtered.Count;

        var sortedAccounts = request.SortBy?.ToLower() switch
        {
            "name" => request.SortOrder?.ToLower() == "desc"
                ? filtered.OrderByDescending(a => a.Name)
                : filtered.OrderBy(a => a.Name),
            "balance" => request.SortOrder?.ToLower() == "desc"
                ? filtered.OrderByDescending(a => a.Balance)
                : filtered.OrderBy(a => a.Balance),
            "type" => request.SortOrder?.ToLower() == "desc"
                ? filtered.OrderByDescending(a => a.Type)
                : filtered.OrderBy(a => a.Type),
            _ => filtered.OrderBy(a => a.DisplayOrder).ThenBy(a => a.Name)
        };

        var pagedAccounts = sortedAccounts
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        var dtos = pagedAccounts.Select(a =>
        {
            var dto = _mapper.Map<AccountDto>(a);
            dto.TypeName = a.Type.ToString();
            dto.TransactionCount = a.Transactions.Count;
            dto.TotalIncome = a.Transactions.Where(t => t.Type == TransactionType.Income).Sum(t => t.Amount);
            dto.TotalExpenses = a.Transactions.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Amount);
            dto.LastTransactionDate = a.Transactions.Count > 0 ? a.Transactions.Max(t => t.Date) : null;
            return dto;
        }).ToList();

        return new PagedResult<AccountDto>
        {
            Items = dtos,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }
}
