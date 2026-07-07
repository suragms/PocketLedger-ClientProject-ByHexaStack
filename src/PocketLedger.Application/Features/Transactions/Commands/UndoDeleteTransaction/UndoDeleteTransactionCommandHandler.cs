using AutoMapper;
using MediatR;
using PocketLedger.Application.Common.Exceptions;
using PocketLedger.Application.Features.Transactions.DTOs;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Enums;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Transactions.Commands.UndoDeleteTransaction;

public class UndoDeleteTransactionCommandHandler : IRequestHandler<UndoDeleteTransactionCommand, TransactionDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public UndoDeleteTransactionCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<TransactionDto> Handle(UndoDeleteTransactionCommand request, CancellationToken cancellationToken)
    {
        var transaction = await _unitOfWork.Transactions.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Transaction), request.Id);

        if (transaction.UserId != _currentUserService.UserId)
            throw new UnauthorizedAccessException("You do not have access to this transaction.");

        if (!transaction.IsDeleted)
            throw new InvalidOperationException("Transaction is not deleted.");

        var account = await _unitOfWork.Accounts.GetByIdAsync(transaction.AccountId, cancellationToken)
            ?? throw new NotFoundException(nameof(Account), transaction.AccountId);

        // Re-apply balance
        account.Balance = transaction.Type switch
        {
            TransactionType.Income => account.Balance + transaction.Amount,
            TransactionType.Expense => account.Balance - transaction.Amount,
            _ => account.Balance
        };
        account.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Transactions.RestoreAsync(transaction, cancellationToken);
        await _unitOfWork.Accounts.UpdateAsync(account, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<TransactionDto>(transaction);
    }
}