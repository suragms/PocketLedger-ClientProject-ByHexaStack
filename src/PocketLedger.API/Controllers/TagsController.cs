using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PocketLedger.Application.Common;
using PocketLedger.Application.Features.Tags.Commands.CreateTag;
using PocketLedger.Application.Features.Tags.Commands.DeleteTag;
using PocketLedger.Application.Features.Tags.DTOs;
using PocketLedger.Application.Features.Tags.Queries.GetTags;

namespace PocketLedger.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TagsController : ControllerBase
{
    private readonly IMediator _mediator;

    public TagsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetTags([FromQuery] GetTagsQuery query)
    {
        var result = await _mediator.Send(query);
        return Ok(ApiResponse<List<TagDto>>.SuccessResponse(result));
    }

    [HttpPost]
    public async Task<IActionResult> CreateTag([FromBody] CreateTagCommand command)
    {
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetTags), ApiResponse<TagDto>.SuccessResponse(result, "Tag created successfully."));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTag(int id)
    {
        await _mediator.Send(new DeleteTagCommand { Id = id });
        return Ok(ApiResponse<object>.SuccessResponse(null!, "Tag deleted successfully."));
    }
}
