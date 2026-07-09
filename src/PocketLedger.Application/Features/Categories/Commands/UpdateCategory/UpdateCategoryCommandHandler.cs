using AutoMapper;
using MediatR;
using PocketLedger.Application.Common.Exceptions;
using PocketLedger.Application.Features.Categories.DTOs;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Enums;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Categories.Commands.UpdateCategory;

public class UpdateCategoryCommandHandler : IRequestHandler<UpdateCategoryCommand, CategoryDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public UpdateCategoryCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<CategoryDto> Handle(UpdateCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await _unitOfWork.Categories.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Category), request.Id);

        if (category.UserId != _currentUserService.UserId)
            throw new UnauthorizedAccessException("You do not have access to this category.");

        if (request.ParentId.HasValue)
        {
            if (request.ParentId.Value == request.Id)
                throw new InvalidOperationException("A category cannot be its own parent.");

            var parent = await _unitOfWork.Categories.GetByIdAsync(request.ParentId.Value, cancellationToken);
            if (parent == null || parent.UserId != _currentUserService.UserId)
                throw new NotFoundException(nameof(Category), request.ParentId.Value);

            if (parent.IsArchived)
                throw new InvalidOperationException("Cannot move a category under an archived category.");

            // Check for circular hierarchy
            var current = parent;
            while (current.ParentId.HasValue)
            {
                if (current.ParentId.Value == request.Id)
                    throw new InvalidOperationException("Circular hierarchy detected. A category cannot be its own ancestor.");
                current = await _unitOfWork.Categories.GetByIdAsync(current.ParentId.Value, cancellationToken);
                if (current == null) break;
            }

            if (parent.Type != CategoryType.Both && (CategoryType)request.Type != parent.Type)
                throw new InvalidOperationException($"Cannot place a {(CategoryType)request.Type} category under a {parent.Type} parent.");
        }

        var categories = await _unitOfWork.Categories.GetCategoriesByUserIdAsync(
            _currentUserService.UserId!, cancellationToken);
        if (categories.Any(c => c.Id != request.Id && c.Name.Equals(request.Name, StringComparison.OrdinalIgnoreCase) && c.ParentId == request.ParentId))
            throw new InvalidOperationException("A category with this name already exists at the same level.");

        category.Name = request.Name;
        category.Description = request.Description;
        category.Icon = request.Icon;
        category.Color = request.Color;
        category.Type = (CategoryType)request.Type;
        category.ParentId = request.ParentId;
        category.DisplayOrder = request.DisplayOrder;
        category.UpdatedAt = DateTime.UtcNow;
        category.UpdatedBy = _currentUserService.UserId;

        await _unitOfWork.Categories.UpdateAsync(category, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = _mapper.Map<CategoryDto>(category);
        dto.TypeName = category.Type.ToString();
        return dto;
    }
}
