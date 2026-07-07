using MediatR;

namespace PocketLedger.Application.Features.Categories.Commands.RestoreCategory;

public class RestoreCategoryCommand : IRequest<Unit>
{
    public int Id { get; set; }
}
