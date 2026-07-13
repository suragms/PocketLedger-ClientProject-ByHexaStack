using MediatR;

namespace PocketLedger.Application.Features.Tags.Commands.DeleteTag;

public class DeleteTagCommand : IRequest<Unit>
{
    public int Id { get; set; }
}
