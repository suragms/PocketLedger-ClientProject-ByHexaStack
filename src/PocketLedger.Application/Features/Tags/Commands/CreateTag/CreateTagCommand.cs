using MediatR;
using PocketLedger.Application.Features.Tags.DTOs;

namespace PocketLedger.Application.Features.Tags.Commands.CreateTag;

public class CreateTagCommand : IRequest<TagDto>
{
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = "#8b5cf6";
}
