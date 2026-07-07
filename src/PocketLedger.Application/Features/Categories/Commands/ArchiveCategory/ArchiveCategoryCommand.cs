using MediatR;

namespace PocketLedger.Application.Features.Categories.Commands.ArchiveCategory;

public class ArchiveCategoryCommand : IRequest<Unit>
{
    public int Id { get; set; }
}
