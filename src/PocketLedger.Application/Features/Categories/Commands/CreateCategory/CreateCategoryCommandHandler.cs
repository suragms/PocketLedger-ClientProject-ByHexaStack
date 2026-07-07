using AutoMapper;
using MediatR;
using PocketLedger.Application.Common.Exceptions;
using PocketLedger.Application.Features.Categories.DTOs;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Enums;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Categories.Commands.CreateCategory;

public class CreateCategoryCommandHandler : IRequestHandler<CreateCategoryCommand, CategoryDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public CreateCategoryCommandHandler(
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<CategoryDto> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
    {
        if (request.ParentId.HasValue)
        {
            var parent = await _unitOfWork.Categories.GetByIdAsync(request.ParentId.Value, cancellationToken);
            if (parent == null || parent.UserId != _currentUserService.UserId)
                throw new NotFoundException(nameof(Category), request.ParentId.Value);
        }

        var categories = await _unitOfWork.Categories.GetCategoriesByUserIdAsync(
            _currentUserService.UserId!, cancellationToken);
        var maxOrder = categories.Count > 0 ? categories.Max(c => c.DisplayOrder) : 0;

        var category = new Category
        {
            Name = request.Name,
            Description = request.Description,
            Icon = request.Icon,
            Color = request.Color,
            Type = (CategoryType)request.Type,
            ParentId = request.ParentId,
            DisplayOrder = maxOrder + 1,
            UserId = _currentUserService.UserId!,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = _currentUserService.UserId
        };

        var result = await _unitOfWork.Categories.AddAsync(category, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = _mapper.Map<CategoryDto>(result);
        dto.TypeName = ((CategoryType)request.Type).ToString();
        return dto;
    }
}
