using MediatR;
using PocketLedger.Application.Common.Exceptions;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Budgets.Commands.DeleteBudget;

public class DeleteBudgetCommandHandler : IRequestHandler<DeleteBudgetCommand, Unit>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public DeleteBudgetCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<Unit> Handle(DeleteBudgetCommand request, CancellationToken cancellationToken)
    {
        var budget = await _unitOfWork.Budgets.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Budget), request.Id);

        if (budget.UserId != _currentUserService.UserId)
            throw new UnauthorizedAccessException("You do not have access to this budget.");

        budget.IsDeleted = true;
        budget.DeletedAt = DateTime.UtcNow;
        budget.DeletedBy = _currentUserService.UserId;

        await _unitOfWork.Budgets.UpdateAsync(budget, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
