using AutoMapper;
using MediatR;
using PocketLedger.Application.Features.Goals.DTOs;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Goals.Queries.GetGoals;

public class GetGoalsQueryHandler : IRequestHandler<GetGoalsQuery, List<GoalDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public GetGoalsQueryHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<List<GoalDto>> Handle(GetGoalsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId!;
        var goals = await _unitOfWork.Goals.GetGoalsByUserIdAsync(userId, cancellationToken);
        return _mapper.Map<List<GoalDto>>(goals);
    }
}
