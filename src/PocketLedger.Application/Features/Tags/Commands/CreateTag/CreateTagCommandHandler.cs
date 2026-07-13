using AutoMapper;
using MediatR;
using PocketLedger.Application.Features.Tags.DTOs;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Tags.Commands.CreateTag;

public class CreateTagCommandHandler : IRequestHandler<CreateTagCommand, TagDto>
{
    private readonly IRepository<Tag> _tagRepo;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public CreateTagCommandHandler(
        IRepository<Tag> tagRepo,
        ICurrentUserService currentUserService,
        IMapper mapper)
    {
        _tagRepo = tagRepo;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<TagDto> Handle(CreateTagCommand request, CancellationToken cancellationToken)
    {
        var existing = await _tagRepo.FindAsync(t => t.UserId == _currentUserService.UserId && t.Name == request.Name, cancellationToken);
        if (existing.Any())
            throw new InvalidOperationException("A tag with this name already exists.");

        var tag = new Tag
        {
            Name = request.Name,
            Color = request.Color,
            UserId = _currentUserService.UserId!,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = _currentUserService.UserId
        };

        await _tagRepo.AddAsync(tag, cancellationToken);
        return _mapper.Map<TagDto>(tag);
    }
}
