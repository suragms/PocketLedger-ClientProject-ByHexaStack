using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PocketLedger.Application.Common;
using PocketLedger.Application.Features.Categories.Commands.ArchiveCategory;
using PocketLedger.Application.Features.Categories.Commands.CreateCategory;
using PocketLedger.Application.Features.Categories.Commands.DeleteCategory;
using PocketLedger.Application.Features.Categories.Commands.ReorderCategories;
using PocketLedger.Application.Features.Categories.Commands.RestoreCategory;
using PocketLedger.Application.Features.Categories.Commands.UpdateCategory;
using PocketLedger.Application.Features.Categories.DTOs;
using PocketLedger.Application.Features.Categories.Queries.GetCategoryById;
using PocketLedger.Application.Features.Categories.Queries.GetCategories;

namespace PocketLedger.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CategoriesController : ControllerBase
{
    private readonly IMediator _mediator;

    public CategoriesController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetCategories([FromQuery] int? type, [FromQuery] bool? isArchived, [FromQuery] string? search)
    {
        var result = await _mediator.Send(new GetCategoriesQuery { Type = type, IsArchived = isArchived, Search = search });
        return Ok(ApiResponse<List<CategoryDto>>.SuccessResponse(result));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetCategoryById(int id)
    {
        var result = await _mediator.Send(new GetCategoryByIdQuery { Id = id });
        return Ok(ApiResponse<CategoryDto>.SuccessResponse(result));
    }

    [HttpPost]
    public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryCommand command)
    {
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetCategories), ApiResponse<CategoryDto>.SuccessResponse(result, "Category created successfully."));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategory(int id, [FromBody] UpdateCategoryCommand command)
    {
        command.Id = id;
        var result = await _mediator.Send(command);
        return Ok(ApiResponse<CategoryDto>.SuccessResponse(result, "Category updated successfully."));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        await _mediator.Send(new DeleteCategoryCommand { Id = id });
        return Ok(ApiResponse<object>.SuccessResponse(null!, "Category deleted successfully."));
    }

    [HttpPut("{id}/archive")]
    public async Task<IActionResult> ArchiveCategory(int id)
    {
        await _mediator.Send(new ArchiveCategoryCommand { Id = id });
        return Ok(ApiResponse<object>.SuccessResponse(null!, "Category archived successfully."));
    }

    [HttpPut("{id}/restore")]
    public async Task<IActionResult> RestoreCategory(int id)
    {
        await _mediator.Send(new RestoreCategoryCommand { Id = id });
        return Ok(ApiResponse<object>.SuccessResponse(null!, "Category restored successfully."));
    }

    [HttpPut("reorder")]
    public async Task<IActionResult> ReorderCategories([FromBody] ReorderCategoriesCommand command)
    {
        await _mediator.Send(command);
        return Ok(ApiResponse<object>.SuccessResponse(null!, "Categories reordered successfully."));
    }
}
