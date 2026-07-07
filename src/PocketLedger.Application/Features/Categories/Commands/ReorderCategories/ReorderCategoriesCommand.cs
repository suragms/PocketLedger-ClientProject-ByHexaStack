using MediatR;

namespace PocketLedger.Application.Features.Categories.Commands.ReorderCategories;

public class ReorderCategoriesCommand : IRequest<Unit>
{
    public List<CategoryOrderItem> Items { get; set; } = new();
}

public class CategoryOrderItem
{
    public int Id { get; set; }
    public int DisplayOrder { get; set; }
}
