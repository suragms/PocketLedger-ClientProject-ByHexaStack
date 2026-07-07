using MediatR;
using PocketLedger.Application.Common.Exceptions;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Categories.Commands.ReorderCategories;

public class ReorderCategoriesCommandHandler : IRequestHandler<ReorderCategoriesCommand, Unit>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public ReorderCategoriesCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<Unit> Handle(ReorderCategoriesCommand request, CancellationToken cancellationToken)
    {
        foreach (var item in request.Items)
        {
            var category = await _unitOfWork.Categories.GetByIdAsync(item.Id, cancellationToken);
            if (category == null || category.UserId != _currentUserService.UserId)
                continue;

            category.DisplayOrder = item.DisplayOrder;
            category.UpdatedAt = DateTime.UtcNow;
            category.UpdatedBy = _currentUserService.UserId;

            await _unitOfWork.Categories.UpdateAsync(category, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
