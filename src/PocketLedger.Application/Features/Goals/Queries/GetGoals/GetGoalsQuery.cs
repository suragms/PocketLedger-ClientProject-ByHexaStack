using MediatR;
using PocketLedger.Application.Features.Goals.DTOs;

namespace PocketLedger.Application.Features.Goals.Queries.GetGoals;

public class GetGoalsQuery : IRequest<List<GoalDto>> { }
