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
