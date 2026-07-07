using AutoMapper;
using MediatR;
using PocketLedger.Application.Common.Exceptions;
using PocketLedger.Application.Features.Categories.DTOs;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Categories.Queries.GetCategoryById;

public class GetCategoryByIdQueryHandler : IRequestHandler<GetCategoryByIdQuery, CategoryDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public GetCategoryByIdQueryHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<CategoryDto> Handle(GetCategoryByIdQuery request, CancellationToken cancellationToken)
    {
        var category = await _unitOfWork.Categories.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Category), request.Id);

        if (category.UserId != _currentUserService.UserId)
            throw new UnauthorizedAccessException("You do not have access to this category.");

        return _mapper.Map<CategoryDto>(category);
    }
}
