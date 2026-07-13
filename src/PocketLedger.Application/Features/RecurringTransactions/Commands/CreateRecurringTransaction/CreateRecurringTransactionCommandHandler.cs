using AutoMapper;
using MediatR;
using PocketLedger.Application.Common.Exceptions;
using PocketLedger.Application.Features.RecurringTransactions.DTOs;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.RecurringTransactions.Commands.CreateRecurringTransaction;

public class CreateRecurringTransactionCommandHandler : IRequestHandler<CreateRecurringTransactionCommand, RecurringTransactionDto>
{
    private readonly IRepository<RecurringTransaction> _recurringRepo;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public CreateRecurringTransactionCommandHandler(
        IRepository<RecurringTransaction> recurringRepo,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        IMapper mapper)
    {
        _recurringRepo = recurringRepo;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<RecurringTransactionDto> Handle(CreateRecurringTransactionCommand request, CancellationToken cancellationToken)
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

        var recurring = new RecurringTransaction
        {
            Amount = request.Amount,
            Currency = request.Currency,
            Type = request.Type,
            Note = request.Note,
            Payee = request.Payee,
            FrequencyDays = request.FrequencyDays,
            NextDueDate = request.NextDueDate,
            EndDate = request.EndDate,
            IsActive = true,
            AccountId = request.AccountId,
            CategoryId = request.CategoryId,
            UserId = _currentUserService.UserId!,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = _currentUserService.UserId
        };

        await _recurringRepo.AddAsync(recurring, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<RecurringTransactionDto>(recurring);
    }
}
