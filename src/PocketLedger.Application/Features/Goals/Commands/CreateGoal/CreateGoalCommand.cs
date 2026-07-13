using MediatR;
using PocketLedger.Application.Features.Goals.DTOs;

namespace PocketLedger.Application.Features.Goals.Commands.CreateGoal;

public class CreateGoalCommand : IRequest<GoalDto>
{
    public string Name { get; set; } = string.Empty;
    public decimal TargetAmount { get; set; }
    public decimal CurrentAmount { get; set; }
    public DateTime TargetDate { get; set; }
    public int? LinkedAccountId { get; set; }
}
