using MediatR;

namespace PocketLedger.Application.Features.Categories.Commands.DeleteCategory;

public class DeleteCategoryCommand : IRequest<Unit>
{
    public int Id { get; set; }
}
