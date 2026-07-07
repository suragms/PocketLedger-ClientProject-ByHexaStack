using MediatR;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Admin.Queries.GetAllCategories;

public record GetAllCategoriesQuery : IRequest<PagedCategoriesDto>
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
    public string? Search { get; init; }
    public string? UserId { get; init; }
}

public class PagedCategoriesDto
{
    public List<CategoryListItemDto> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
}

public class CategoryListItemDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Icon { get; set; } = "folder";
    public string Color { get; set; } = "#6366f1";
    public int Type { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class GetAllCategoriesQueryHandler : IRequestHandler<GetAllCategoriesQuery, PagedCategoriesDto>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetAllCategoriesQueryHandler(IUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<PagedCategoriesDto> Handle(GetAllCategoriesQuery request, CancellationToken cancellationToken)
    {
        var (items, totalCount) = await _unitOfWork.Categories.GetPagedWithUserAsync(
            request.UserId, request.Search, request.Page, request.PageSize, cancellationToken);

        return new PagedCategoriesDto
        {
            Items = items.Select(c => new CategoryListItemDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                Icon = c.Icon,
                Color = c.Color,
                Type = (int)c.Type,
                UserId = c.UserId,
                UserEmail = c.User?.Email ?? "",
                CreatedAt = c.CreatedAt
            }).ToList(),
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize)
        };
    }
}
