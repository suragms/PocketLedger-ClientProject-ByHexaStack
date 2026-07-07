using AutoMapper;
using MediatR;
using PocketLedger.Application.Common.Exceptions;
using PocketLedger.Application.Features.Budgets.DTOs;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Budgets.Commands.CreateBudget;

public class CreateBudgetCommandHandler : IRequestHandler<CreateBudgetCommand, BudgetDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public CreateBudgetCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<BudgetDto> Handle(CreateBudgetCommand request, CancellationToken cancellationToken)
    {
        if (request.CategoryId.HasValue)
        {
            var category = await _unitOfWork.Categories.GetByIdAsync(request.CategoryId.Value, cancellationToken);
            if (category == null || category.UserId != _currentUserService.UserId)
                throw new NotFoundException(nameof(Category), request.CategoryId.Value);
        }

        var budget = new Budget
        {
            Name = request.Name,
            Amount = request.Amount,
            Currency = request.Currency,
            Period = request.Period,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            AlertThreshold = request.AlertThreshold,
            CategoryId = request.CategoryId,
            UserId = _currentUserService.UserId!,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = _currentUserService.UserId
        };

        var result = await _unitOfWork.Budgets.AddAsync(budget, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<BudgetDto>(result);
    }
}
