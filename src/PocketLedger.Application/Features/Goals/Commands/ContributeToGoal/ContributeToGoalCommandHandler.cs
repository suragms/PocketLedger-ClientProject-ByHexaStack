using AutoMapper;
using MediatR;
using PocketLedger.Application.Common.Exceptions;
using PocketLedger.Application.Features.Goals.DTOs;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Enums;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Goals.Commands.ContributeToGoal;

public class ContributeToGoalCommandHandler : IRequestHandler<ContributeToGoalCommand, GoalDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public ContributeToGoalCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<GoalDto> Handle(ContributeToGoalCommand request, CancellationToken cancellationToken)
    {
        var goal = await _unitOfWork.Goals.GetGoalWithAccountAsync(request.GoalId, cancellationToken)
            ?? throw new NotFoundException(nameof(Goal), request.GoalId);

        if (goal.UserId != _currentUserService.UserId)
            throw new UnauthorizedAccessException("You do not have access to this goal.");

        goal.CurrentAmount += request.Amount;
        goal.UpdatedAt = DateTime.UtcNow;
        goal.UpdatedBy = _currentUserService.UserId;

        await _unitOfWork.Goals.UpdateAsync(goal, cancellationToken);

        if (goal.LinkedAccountId.HasValue)
        {
            var transaction = new Transaction
            {
                Amount = request.Amount,
                Currency = "USD",
                Type = TransactionType.Income,
                Date = DateTime.UtcNow,
                Note = $"Contribution to goal: {goal.Name}",
                Payee = "Savings Goal",
                PaymentMethod = PaymentMethod.Other,
                AccountId = goal.LinkedAccountId.Value,
                UserId = _currentUserService.UserId!,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = _currentUserService.UserId
            };

            await _unitOfWork.Transactions.AddAsync(transaction, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<GoalDto>(goal);
    }
}
