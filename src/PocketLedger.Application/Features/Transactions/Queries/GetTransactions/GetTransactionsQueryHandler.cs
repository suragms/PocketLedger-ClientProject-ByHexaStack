using AutoMapper;
using MediatR;
using PocketLedger.Application.Common;
using PocketLedger.Application.Features.Transactions.DTOs;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Transactions.Queries.GetTransactions;

public class GetTransactionsQueryHandler : IRequestHandler<GetTransactionsQuery, PagedResult<TransactionDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public GetTransactionsQueryHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<PagedResult<TransactionDto>> Handle(GetTransactionsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId!;
        var skip = (request.Page - 1) * request.PageSize;

        var transactions = await _unitOfWork.Transactions.GetTransactionsWithDetailsAsync(
            userId, request.StartDate, request.EndDate, request.Type,
            request.AccountId, request.CategoryId, request.MinAmount, request.MaxAmount,
            request.Search, request.Payee, request.SortBy, request.SortOrder,
            skip, request.PageSize, cancellationToken);

        var totalCount = await _unitOfWork.Transactions.GetFilteredCountAsync(
            userId, request.StartDate, request.EndDate, request.Type,
            request.AccountId, request.CategoryId, request.MinAmount, request.MaxAmount,
            request.Search, request.Payee, cancellationToken);

        return new PagedResult<TransactionDto>
        {
            Items = _mapper.Map<IReadOnlyList<TransactionDto>>(transactions),
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }
}