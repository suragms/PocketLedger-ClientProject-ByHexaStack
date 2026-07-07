using MediatR;
using PocketLedger.Application.Features.Categories.DTOs;

namespace PocketLedger.Application.Features.Categories.Commands.CreateCategory;

public class CreateCategoryCommand : IRequest<CategoryDto>
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Icon { get; set; } = "folder";
    public string Color { get; set; } = "#6366f1";
    public int Type { get; set; } = 2;
    public int? ParentId { get; set; }
}
