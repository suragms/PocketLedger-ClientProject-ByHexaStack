using PocketLedger.Domain.Entities;
using PocketLedger.Application.Common.Mappings;

namespace PocketLedger.Application.Features.Categories.DTOs;

public class CategoryDto : IMapFrom<Category>
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Icon { get; set; } = "folder";
    public string Color { get; set; } = "#6366f1";
    public int Type { get; set; }
    public string TypeName { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
    public bool IsArchived { get; set; }
    public int? ParentId { get; set; }
    public int DisplayOrder { get; set; }
    public DateTime CreatedAt { get; set; }
    public int TransactionCount { get; set; }
    public List<CategoryDto> Children { get; set; } = new();
}
