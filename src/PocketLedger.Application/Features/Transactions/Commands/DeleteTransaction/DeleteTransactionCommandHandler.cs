using MediatR;
using PocketLedger.Application.Common.Exceptions;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Enums;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Transactions.Commands.DeleteTransaction;

public class DeleteTransactionCommandHandler : IRequestHandler<DeleteTransactionCommand, Unit>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public DeleteTransactionCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<Unit> Handle(DeleteTransactionCommand request, CancellationToken cancellationToken)
    {
        var transaction = await _unitOfWork.Transactions.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Transaction), request.Id);

        if (transaction.UserId != _currentUserService.UserId)
            throw new UnauthorizedAccessException("You do not have access to this transaction.");

        var account = await _unitOfWork.Accounts.GetByIdAsync(transaction.AccountId, cancellationToken)
            ?? throw new NotFoundException(nameof(Account), transaction.AccountId);

        account.Balance = transaction.Type switch
        {
            TransactionType.Income => account.Balance - transaction.Amount,
            TransactionType.Expense => account.Balance + transaction.Amount,
            _ => account.Balance
        };
        account.UpdatedAt = DateTime.UtcNow;

        transaction.IsDeleted = true;
        transaction.DeletedAt = DateTime.UtcNow;
        transaction.DeletedBy = _currentUserService.UserId;

        await _unitOfWork.Transactions.UpdateAsync(transaction, cancellationToken);
        await _unitOfWork.Accounts.UpdateAsync(account, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}