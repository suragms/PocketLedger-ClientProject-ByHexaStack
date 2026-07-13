using MediatR;
using PocketLedger.Application.Common.Exceptions;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Tags.Commands.DeleteTag;

public class DeleteTagCommandHandler : IRequestHandler<DeleteTagCommand, Unit>
{
    private readonly IRepository<Tag> _tagRepo;
    private readonly ICurrentUserService _currentUserService;

    public DeleteTagCommandHandler(IRepository<Tag> tagRepo, ICurrentUserService currentUserService)
    {
        _tagRepo = tagRepo;
        _currentUserService = currentUserService;
    }

    public async Task<Unit> Handle(DeleteTagCommand request, CancellationToken cancellationToken)
    {
        var tag = await _tagRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Tag), request.Id);

        if (tag.UserId != _currentUserService.UserId)
            throw new UnauthorizedAccessException("You do not have access to this tag.");

        await _tagRepo.DeleteAsync(tag, cancellationToken);
        return Unit.Value;
    }
}
