using MediatR;
using PocketLedger.Application.Features.Categories.DTOs;

namespace PocketLedger.Application.Features.Categories.Commands.UpdateCategory;

public class UpdateCategoryCommand : IRequest<CategoryDto>
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Icon { get; set; } = "folder";
    public string Color { get; set; } = "#6366f1";
    public int Type { get; set; } = 2;
    public int? ParentId { get; set; }
    public int DisplayOrder { get; set; }
}
