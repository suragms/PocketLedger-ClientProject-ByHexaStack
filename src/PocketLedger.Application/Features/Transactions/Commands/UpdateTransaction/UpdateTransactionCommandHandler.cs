using AutoMapper;
using MediatR;
using PocketLedger.Application.Common.Exceptions;
using PocketLedger.Application.Features.Transactions.DTOs;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Enums;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Transactions.Commands.UpdateTransaction;

public class UpdateTransactionCommandHandler : IRequestHandler<UpdateTransactionCommand, TransactionDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public UpdateTransactionCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<TransactionDto> Handle(UpdateTransactionCommand request, CancellationToken cancellationToken)
    {
        var transaction = await _unitOfWork.Transactions.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Transaction), request.Id);

        if (transaction.UserId != _currentUserService.UserId)
            throw new UnauthorizedAccessException("You do not have access to this transaction.");

        var account = await _unitOfWork.Accounts.GetByIdAsync(transaction.AccountId, cancellationToken)
            ?? throw new NotFoundException(nameof(Account), transaction.AccountId);

        // Reverse old balance
        account.Balance = transaction.Type switch
        {
            TransactionType.Income => account.Balance - transaction.Amount,
            TransactionType.Expense => account.Balance + transaction.Amount,
            _ => account.Balance
        };

        // Update transaction
        transaction.Amount = request.Amount;
        transaction.Currency = request.Currency;
        transaction.Type = request.Type;
        transaction.Date = request.Date;
        transaction.Note = request.Note;
        transaction.Payee = request.Payee;
        transaction.Reference = request.Reference;
        transaction.PaymentMethod = request.PaymentMethod;
        transaction.AccountId = request.AccountId;
        transaction.CategoryId = request.CategoryId;
        transaction.UpdatedAt = DateTime.UtcNow;
        transaction.UpdatedBy = _currentUserService.UserId;

        // Apply new balance
        account.Balance = request.Type switch
        {
            TransactionType.Income => account.Balance + request.Amount,
            TransactionType.Expense => account.Balance - request.Amount,
            _ => account.Balance
        };
        account.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Transactions.UpdateAsync(transaction, cancellationToken);
        await _unitOfWork.Accounts.UpdateAsync(account, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<TransactionDto>(transaction);
    }
}