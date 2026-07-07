using AutoMapper;
using MediatR;
using PocketLedger.Application.Common.Exceptions;
using PocketLedger.Application.Features.Transactions.DTOs;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Transactions.Queries.GetTransactionById;

public class GetTransactionByIdQueryHandler : IRequestHandler<GetTransactionByIdQuery, TransactionDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public GetTransactionByIdQueryHandler(
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<TransactionDto> Handle(GetTransactionByIdQuery request, CancellationToken cancellationToken)
    {
        var transaction = await _unitOfWork.Transactions.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Transaction), request.Id);

        if (transaction.UserId != _currentUserService.UserId)
            throw new UnauthorizedAccessException("You do not have access to this transaction.");

        return _mapper.Map<TransactionDto>(transaction);
    }
}
