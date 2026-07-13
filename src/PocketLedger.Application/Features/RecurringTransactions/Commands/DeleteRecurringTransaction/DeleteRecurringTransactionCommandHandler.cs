using MediatR;
using PocketLedger.Application.Common.Exceptions;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.RecurringTransactions.Commands.DeleteRecurringTransaction;

public class DeleteRecurringTransactionCommandHandler : IRequestHandler<DeleteRecurringTransactionCommand, Unit>
{
    private readonly IRepository<RecurringTransaction> _recurringRepo;
    private readonly ICurrentUserService _currentUserService;

    public DeleteRecurringTransactionCommandHandler(
        IRepository<RecurringTransaction> recurringRepo,
        ICurrentUserService currentUserService)
    {
        _recurringRepo = recurringRepo;
        _currentUserService = currentUserService;
    }

    public async Task<Unit> Handle(DeleteRecurringTransactionCommand request, CancellationToken cancellationToken)
    {
        var recurring = await _recurringRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(RecurringTransaction), request.Id);

        if (recurring.UserId != _currentUserService.UserId)
            throw new UnauthorizedAccessException("You do not have access to this recurring transaction.");

        await _recurringRepo.DeleteAsync(recurring, cancellationToken);
        return Unit.Value;
    }
}
