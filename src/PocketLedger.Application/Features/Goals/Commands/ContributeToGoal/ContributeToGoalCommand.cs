using MediatR;
using PocketLedger.Application.Features.Goals.DTOs;

namespace PocketLedger.Application.Features.Goals.Commands.ContributeToGoal;

public class ContributeToGoalCommand : IRequest<GoalDto>
{
    public int GoalId { get; set; }
    public decimal Amount { get; set; }
}
