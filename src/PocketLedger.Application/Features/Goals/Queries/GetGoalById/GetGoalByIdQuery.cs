using MediatR;
using PocketLedger.Application.Features.Goals.DTOs;

namespace PocketLedger.Application.Features.Goals.Queries.GetGoalById;

public class GetGoalByIdQuery : IRequest<GoalDto>
{
    public int Id { get; set; }
}
