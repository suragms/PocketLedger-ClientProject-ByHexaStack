using MediatR;
using PocketLedger.Application.Common.Exceptions;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Goals.Commands.DeleteGoal;

public class DeleteGoalCommandHandler : IRequestHandler<DeleteGoalCommand, Unit>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public DeleteGoalCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<Unit> Handle(DeleteGoalCommand request, CancellationToken cancellationToken)
    {
        var goal = await _unitOfWork.Goals.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Goal), request.Id);

        if (goal.UserId != _currentUserService.UserId)
            throw new UnauthorizedAccessException("You do not have access to this goal.");

        goal.IsDeleted = true;
        goal.DeletedAt = DateTime.UtcNow;
        goal.DeletedBy = _currentUserService.UserId;

        await _unitOfWork.Goals.UpdateAsync(goal, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
