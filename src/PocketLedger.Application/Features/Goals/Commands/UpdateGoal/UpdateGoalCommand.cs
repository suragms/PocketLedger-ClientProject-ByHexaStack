using MediatR;
using PocketLedger.Application.Features.Goals.DTOs;

namespace PocketLedger.Application.Features.Goals.Commands.UpdateGoal;

public class UpdateGoalCommand : IRequest<GoalDto>
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal TargetAmount { get; set; }
    public decimal CurrentAmount { get; set; }
    public DateTime TargetDate { get; set; }
    public int? LinkedAccountId { get; set; }
    public bool IsArchived { get; set; }
}
