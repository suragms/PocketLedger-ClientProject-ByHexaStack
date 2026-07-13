using AutoMapper;
using MediatR;
using PocketLedger.Application.Common.Exceptions;
using PocketLedger.Application.Features.RecurringTransactions.DTOs;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.RecurringTransactions.Commands.UpdateRecurringTransaction;

public class UpdateRecurringTransactionCommandHandler : IRequestHandler<UpdateRecurringTransactionCommand, RecurringTransactionDto>
{
    private readonly IRepository<RecurringTransaction> _recurringRepo;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public UpdateRecurringTransactionCommandHandler(
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

    public async Task<RecurringTransactionDto> Handle(UpdateRecurringTransactionCommand request, CancellationToken cancellationToken)
    {
        var recurring = await _recurringRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(RecurringTransaction), request.Id);

        if (recurring.UserId != _currentUserService.UserId)
            throw new UnauthorizedAccessException("You do not have access to this recurring transaction.");

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

        recurring.Amount = request.Amount;
        recurring.Currency = request.Currency;
        recurring.Type = request.Type;
        recurring.Note = request.Note;
        recurring.Payee = request.Payee;
        recurring.FrequencyDays = request.FrequencyDays;
        recurring.NextDueDate = request.NextDueDate;
        recurring.EndDate = request.EndDate;
        recurring.AccountId = request.AccountId;
        recurring.CategoryId = request.CategoryId;
        recurring.UpdatedAt = DateTime.UtcNow;
        recurring.UpdatedBy = _currentUserService.UserId;

        await _recurringRepo.UpdateAsync(recurring, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<RecurringTransactionDto>(recurring);
    }
}
