using MediatR;
using PocketLedger.Application.Features.Categories.DTOs;

namespace PocketLedger.Application.Features.Categories.Queries.GetCategories;

public class GetCategoriesQuery : IRequest<List<CategoryDto>>
{
    public int? Type { get; set; }
    public bool? IsArchived { get; set; }
    public string? Search { get; set; }
}
