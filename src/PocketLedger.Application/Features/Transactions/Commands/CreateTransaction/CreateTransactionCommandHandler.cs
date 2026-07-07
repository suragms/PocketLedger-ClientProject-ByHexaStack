using AutoMapper;
using MediatR;
using PocketLedger.Application.Common.Exceptions;
using PocketLedger.Application.Features.Transactions.DTOs;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Enums;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Transactions.Commands.CreateTransaction;

public class CreateTransactionCommandHandler : IRequestHandler<CreateTransactionCommand, TransactionDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public CreateTransactionCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<TransactionDto> Handle(CreateTransactionCommand request, CancellationToken cancellationToken)
    {
        var account = await _unitOfWork.Accounts.GetByIdAsync(request.AccountId, cancellationToken)
            ?? throw new NotFoundException(nameof(Account), request.AccountId);

        if (account.UserId != _currentUserService.UserId)
            throw new UnauthorizedAccessException("You do not have access to this account.");

        if (request.CategoryId.HasValue)
        {
            var category = await _unitOfWork.Categories.GetByIdAsync(request.CategoryId.Value, cancellationToken);
            if (category == null || category.UserId != _currentUserService.UserId)
                throw new NotFoundException(nameof(Category), request.CategoryId.Value);
        }

        var transaction = new Transaction
        {
            Amount = request.Amount,
            Currency = request.Currency,
            Type = request.Type,
            Date = request.Date,
            Note = request.Note,
            Payee = request.Payee,
            Reference = request.Reference,
            PaymentMethod = request.PaymentMethod,
            AccountId = request.AccountId,
            CategoryId = request.CategoryId,
            UserId = _currentUserService.UserId!,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = _currentUserService.UserId
        };

        await _unitOfWork.Transactions.AddAsync(transaction, cancellationToken);

        account.Balance = request.Type switch
        {
            TransactionType.Income => account.Balance + request.Amount,
            TransactionType.Expense => account.Balance - request.Amount,
            _ => account.Balance
        };
        account.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.Accounts.UpdateAsync(account, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<TransactionDto>(transaction);
    }
}