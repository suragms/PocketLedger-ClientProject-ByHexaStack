using AutoMapper;
using MediatR;
using PocketLedger.Application.Features.Categories.DTOs;
using PocketLedger.Domain.Enums;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Categories.Queries.GetCategories;

public class GetCategoriesQueryHandler : IRequestHandler<GetCategoriesQuery, List<CategoryDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public GetCategoriesQueryHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<List<CategoryDto>> Handle(GetCategoriesQuery request, CancellationToken cancellationToken)
    {
        var categories = await _unitOfWork.Categories.GetCategoriesByUserIdAsync(
            _currentUserService.UserId!, cancellationToken);

        if (request.Type.HasValue)
        {
            var type = (CategoryType)request.Type.Value;
            categories = categories.Where(c => c.Type == type || c.Type == CategoryType.Both).ToList();
        }

        if (request.IsArchived.HasValue)
        {
            categories = categories.Where(c => c.IsArchived == request.IsArchived.Value).ToList();
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLowerInvariant();
            categories = categories.Where(c =>
                c.Name.ToLowerInvariant().Contains(search) ||
                (c.Description != null && c.Description.ToLowerInvariant().Contains(search))
            ).ToList();
        }

        var categoryDtos = _mapper.Map<List<CategoryDto>>(categories);

        foreach (var dto in categoryDtos)
        {
            dto.TypeName = ((CategoryType)dto.Type).ToString();
            dto.TransactionCount = categories.First(c => c.Id == dto.Id).Transactions.Count;
        }

        return categoryDtos;
    }
}
