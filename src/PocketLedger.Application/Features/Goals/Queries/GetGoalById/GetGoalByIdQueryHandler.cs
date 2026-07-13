using AutoMapper;
using MediatR;
using PocketLedger.Application.Common.Exceptions;
using PocketLedger.Application.Features.Goals.DTOs;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Goals.Queries.GetGoalById;

public class GetGoalByIdQueryHandler : IRequestHandler<GetGoalByIdQuery, GoalDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public GetGoalByIdQueryHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<GoalDto> Handle(GetGoalByIdQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId!;

        var goal = await _unitOfWork.Goals.GetGoalWithAccountAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Goal), request.Id);

        if (goal.UserId != userId)
            throw new UnauthorizedAccessException("You do not have access to this goal.");

        return _mapper.Map<GoalDto>(goal);
    }
}
