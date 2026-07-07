using AutoMapper;
using MediatR;
using PocketLedger.Application.Common.Exceptions;
using PocketLedger.Application.Features.Budgets.DTOs;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Budgets.Commands.UpdateBudget;

public class UpdateBudgetCommandHandler : IRequestHandler<UpdateBudgetCommand, BudgetDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public UpdateBudgetCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<BudgetDto> Handle(UpdateBudgetCommand request, CancellationToken cancellationToken)
    {
        var budget = await _unitOfWork.Budgets.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Budget), request.Id);

        if (budget.UserId != _currentUserService.UserId)
            throw new UnauthorizedAccessException("You do not have access to this budget.");

        budget.Name = request.Name;
        budget.Amount = request.Amount;
        budget.Period = request.Period;
        budget.StartDate = request.StartDate;
        budget.EndDate = request.EndDate;
        budget.AlertThreshold = request.AlertThreshold;
        budget.IsActive = request.IsActive;
        budget.UpdatedAt = DateTime.UtcNow;
        budget.UpdatedBy = _currentUserService.UserId;

        await _unitOfWork.Budgets.UpdateAsync(budget, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<BudgetDto>(budget);
    }
}
