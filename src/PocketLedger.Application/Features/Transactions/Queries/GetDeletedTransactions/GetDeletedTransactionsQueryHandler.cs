using AutoMapper;
using MediatR;
using PocketLedger.Application.Features.Transactions.DTOs;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Transactions.Queries.GetDeletedTransactions;

public class GetDeletedTransactionsQueryHandler : IRequestHandler<GetDeletedTransactionsQuery, List<TransactionDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public GetDeletedTransactionsQueryHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<List<TransactionDto>> Handle(GetDeletedTransactionsQuery request, CancellationToken cancellationToken)
    {
        var transactions = await _unitOfWork.Transactions.GetDeletedTransactionsAsync(
            _currentUserService.UserId!, cancellationToken);
        return _mapper.Map<List<TransactionDto>>(transactions);
    }
}