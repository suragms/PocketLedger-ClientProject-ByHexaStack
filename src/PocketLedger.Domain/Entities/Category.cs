using PocketLedger.Domain.Common;
using PocketLedger.Domain.Enums;

namespace PocketLedger.Domain.Entities;

public class Category : BaseAuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Icon { get; set; } = "folder";
    public string Color { get; set; } = "#6366f1";
    public CategoryType Type { get; set; } = CategoryType.Both;
    public bool IsDefault { get; set; }
    public bool IsArchived { get; set; }
    public int? ParentId { get; set; }
    public int DisplayOrder { get; set; }
    public string UserId { get; set; } = string.Empty;

    public User User { get; set; } = null!;
    public Category? Parent { get; set; }
    public ICollection<Category> Children { get; set; } = new List<Category>();
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    public ICollection<Budget> Budgets { get; set; } = new List<Budget>();
}
