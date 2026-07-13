using MediatR;
using PocketLedger.Application.Features.Tags.DTOs;

namespace PocketLedger.Application.Features.Tags.Queries.GetTags;

public class GetTagsQuery : IRequest<List<TagDto>>
{
    public string? Search { get; set; }
}
