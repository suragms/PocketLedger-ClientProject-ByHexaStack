using MediatR;
using PocketLedger.Application.Common.Exceptions;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Categories.Commands.ArchiveCategory;

public class ArchiveCategoryCommandHandler : IRequestHandler<ArchiveCategoryCommand, Unit>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public ArchiveCategoryCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<Unit> Handle(ArchiveCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await _unitOfWork.Categories.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Category), request.Id);

        if (category.UserId != _currentUserService.UserId)
            throw new UnauthorizedAccessException("You do not have access to this category.");

        category.IsArchived = true;
        category.UpdatedAt = DateTime.UtcNow;
        category.UpdatedBy = _currentUserService.UserId;

        await _unitOfWork.Categories.UpdateAsync(category, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
