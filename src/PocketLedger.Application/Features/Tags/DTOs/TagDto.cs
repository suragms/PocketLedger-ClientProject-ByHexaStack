using PocketLedger.Domain.Entities;
using PocketLedger.Application.Common.Mappings;

namespace PocketLedger.Application.Features.Tags.DTOs;

public class TagDto : IMapFrom<Tag>
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = "#8b5cf6";
    public DateTime CreatedAt { get; set; }
}
