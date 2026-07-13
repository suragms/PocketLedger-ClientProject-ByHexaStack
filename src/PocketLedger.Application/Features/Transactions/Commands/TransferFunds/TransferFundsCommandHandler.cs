using AutoMapper;
using MediatR;
using PocketLedger.Application.Common.Exceptions;
using PocketLedger.Application.Features.Transactions.DTOs;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Enums;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Transactions.Commands.TransferFunds;

public class TransferFundsCommandHandler : IRequestHandler<TransferFundsCommand, TransferResult>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public TransferFundsCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<TransferResult> Handle(TransferFundsCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId!;

        if (request.FromAccountId == request.ToAccountId)
            throw new InvalidOperationException("Source and destination accounts must be different.");

        var fromAccount = await _unitOfWork.Accounts.GetByIdAsync(request.FromAccountId, cancellationToken)
            ?? throw new NotFoundException(nameof(Account), request.FromAccountId);

        if (fromAccount.UserId != userId)
            throw new UnauthorizedAccessException("You do not have access to the source account.");

        var toAccount = await _unitOfWork.Accounts.GetByIdAsync(request.ToAccountId, cancellationToken)
            ?? throw new NotFoundException(nameof(Account), request.ToAccountId);

        if (toAccount.UserId != userId)
            throw new UnauthorizedAccessException("You do not have access to the destination account.");

        var transferGroupId = Guid.NewGuid();
        var now = DateTime.UtcNow;

        var sourceTransaction = new Transaction
        {
            Amount = request.Amount,
            Currency = request.Currency,
            Type = TransactionType.Transfer,
            Date = request.Date,
            Note = request.Note ?? $"Transfer to {toAccount.Name}",
            Payee = $"Transfer to {toAccount.Name}",
            PaymentMethod = PaymentMethod.BankTransfer,
            AccountId = request.FromAccountId,
            TargetAccountId = request.ToAccountId,
            TransferGroupId = transferGroupId,
            UserId = userId,
            CreatedAt = now,
            CreatedBy = userId
        };

        var destinationTransaction = new Transaction
        {
            Amount = request.Amount,
            Currency = request.Currency,
            Type = TransactionType.Transfer,
            Date = request.Date,
            Note = request.Note ?? $"Transfer from {fromAccount.Name}",
            Payee = $"Transfer from {fromAccount.Name}",
            PaymentMethod = PaymentMethod.BankTransfer,
            AccountId = request.ToAccountId,
            TargetAccountId = request.FromAccountId,
            TransferGroupId = transferGroupId,
            UserId = userId,
            CreatedAt = now,
            CreatedBy = userId
        };

        await _unitOfWork.Transactions.AddAsync(sourceTransaction, cancellationToken);
        await _unitOfWork.Transactions.AddAsync(destinationTransaction, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new TransferResult
        {
            SourceTransaction = _mapper.Map<TransactionDto>(sourceTransaction),
            DestinationTransaction = _mapper.Map<TransactionDto>(destinationTransaction),
            TransferGroupId = transferGroupId
        };
    }
}
