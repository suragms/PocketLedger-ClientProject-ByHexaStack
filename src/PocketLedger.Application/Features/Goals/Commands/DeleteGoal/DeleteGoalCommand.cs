using MediatR;

namespace PocketLedger.Application.Features.Goals.Commands.DeleteGoal;

public class DeleteGoalCommand : IRequest<Unit>
{
    public int Id { get; set; }
}
