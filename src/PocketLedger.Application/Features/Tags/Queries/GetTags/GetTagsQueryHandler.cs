using AutoMapper;
using MediatR;
using PocketLedger.Application.Features.Tags.DTOs;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Tags.Queries.GetTags;

public class GetTagsQueryHandler : IRequestHandler<GetTagsQuery, List<TagDto>>
{
    private readonly IRepository<Tag> _tagRepo;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public GetTagsQueryHandler(
        IRepository<Tag> tagRepo,
        ICurrentUserService currentUserService,
        IMapper mapper)
    {
        _tagRepo = tagRepo;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<List<TagDto>> Handle(GetTagsQuery request, CancellationToken cancellationToken)
    {
        var tags = await _tagRepo.FindAsync(t => t.UserId == _currentUserService.UserId, cancellationToken);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLowerInvariant();
            tags = tags.Where(t => t.Name.ToLowerInvariant().Contains(search)).ToList();
        }

        return _mapper.Map<List<TagDto>>(tags.OrderBy(t => t.Name).ToList());
    }
}
