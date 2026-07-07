using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PocketLedger.Application.Common;
using PocketLedger.Application.Features.Admin.Queries.GetDashboard;
using PocketLedger.Application.Features.Admin.Queries.GetUsers;
using PocketLedger.Application.Features.Admin.Queries.GetUserDetail;
using PocketLedger.Application.Features.Admin.Commands.UpdateUserRole;
using PocketLedger.Application.Features.Admin.Commands.UpdateUserStatus;
using PocketLedger.Application.Features.Admin.Commands.DeleteUser;
using PocketLedger.Application.Features.Admin.Queries.GetAllTransactions;
using PocketLedger.Application.Features.Admin.Queries.GetAllCategories;
using PocketLedger.Application.Features.Admin.Queries.GetAllWallets;
using PocketLedger.Application.Features.Admin.Queries.GetAllBudgets;
using PocketLedger.Application.Features.Admin.Queries.GetAnalytics;
using PocketLedger.Application.Features.Admin.Queries.GetAuditLogs;
using PocketLedger.Application.Features.Admin.Queries.GetSystemLogs;
using PocketLedger.Application.Features.Admin.Queries.GetRoles;
using PocketLedger.Application.Features.Admin.Commands.CreateRole;
using PocketLedger.Application.Features.Admin.Commands.DeleteRole;
using PocketLedger.Application.Features.Admin.Commands.AssignRole;
using PocketLedger.Application.Features.Admin.Commands.RemoveRole;
using PocketLedger.Application.Features.Admin.Queries.GetNotifications;
using PocketLedger.Application.Features.Admin.Commands.ExportData;
using PocketLedger.Application.Features.Admin.Commands.CreateUser;
using PocketLedger.Application.Features.Admin.Commands.UpdateUser;

namespace PocketLedger.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize(Policy = "AdminOnly")]
public class AdminController : ControllerBase
{
    private readonly IMediator _mediator;

    public AdminController(IMediator mediator) => _mediator = mediator;

    // Dashboard
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var result = await _mediator.Send(new GetDashboardQuery());
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    // Users
    [HttpPost("users")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(ApiResponse<object>.SuccessResponse(new { id = result }, "User created successfully"));
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null, [FromQuery] string? role = null, [FromQuery] bool? isActive = null)
    {
        var result = await _mediator.Send(new GetUsersQuery { Page = page, PageSize = pageSize, Search = search, Role = role, IsActive = isActive });
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    [HttpGet("users/{id}")]
    public async Task<IActionResult> GetUserDetail(string id)
    {
        var result = await _mediator.Send(new GetUserDetailQuery { UserId = id });
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    [HttpPut("users/{id}")]
    public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserCommand command)
    {
        await _mediator.Send(command with { UserId = id });
        return Ok(ApiResponse<object>.SuccessResponse(null!, "User updated successfully"));
    }

    [HttpPut("users/{id}/role")]
    public async Task<IActionResult> UpdateUserRole(string id, [FromBody] UpdateUserRoleCommand command)
    {
        var result = await _mediator.Send(command with { UserId = id });
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    [HttpPut("users/{id}/status")]
    public async Task<IActionResult> UpdateUserStatus(string id, [FromBody] UpdateUserStatusCommand command)
    {
        await _mediator.Send(command with { UserId = id });
        return Ok(ApiResponse<object>.SuccessResponse(null!, "User status updated"));
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        await _mediator.Send(new DeleteUserCommand { UserId = id });
        return Ok(ApiResponse<object>.SuccessResponse(null!, "User deleted"));
    }

    // Transactions
    [HttpGet("transactions")]
    public async Task<IActionResult> GetAllTransactions([FromQuery] int page = 1, [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null, [FromQuery] string? userId = null, [FromQuery] int? type = null)
    {
        var result = await _mediator.Send(new GetAllTransactionsQuery { Page = page, PageSize = pageSize, Search = search, UserId = userId, Type = type });
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    // Categories
    [HttpGet("categories")]
    public async Task<IActionResult> GetAllCategories([FromQuery] int page = 1, [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null, [FromQuery] string? userId = null)
    {
        var result = await _mediator.Send(new GetAllCategoriesQuery { Page = page, PageSize = pageSize, Search = search, UserId = userId });
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    // Wallets
    [HttpGet("wallets")]
    public async Task<IActionResult> GetAllWallets([FromQuery] int page = 1, [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null, [FromQuery] string? userId = null)
    {
        var result = await _mediator.Send(new GetAllWalletsQuery { Page = page, PageSize = pageSize, Search = search, UserId = userId });
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    // Budgets
    [HttpGet("budgets")]
    public async Task<IActionResult> GetAllBudgets([FromQuery] int page = 1, [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null, [FromQuery] string? userId = null)
    {
        var result = await _mediator.Send(new GetAllBudgetsQuery { Page = page, PageSize = pageSize, Search = search, UserId = userId });
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    // Analytics
    [HttpGet("analytics")]
    public async Task<IActionResult> GetAnalytics([FromQuery] string? period = "monthly")
    {
        var result = await _mediator.Send(new GetAnalyticsQuery { Period = period });
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    // Audit Logs
    [HttpGet("audit-logs")]
    public async Task<IActionResult> GetAuditLogs([FromQuery] int page = 1, [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null, [FromQuery] string? userId = null,
        [FromQuery] string? action = null, [FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
    {
        var result = await _mediator.Send(new GetAuditLogsQuery
        {
            Page = page, PageSize = pageSize, Search = search, UserId = userId,
            Action = action, StartDate = startDate, EndDate = endDate
        });
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    // System Logs
    [HttpGet("system-logs")]
    public async Task<IActionResult> GetSystemLogs([FromQuery] int page = 1, [FromQuery] int pageSize = 50,
        [FromQuery] string? level = null, [FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
    {
        var result = await _mediator.Send(new GetSystemLogsQuery { Page = page, PageSize = pageSize, Level = level, StartDate = startDate, EndDate = endDate });
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    // Roles
    [HttpGet("roles")]
    public async Task<IActionResult> GetRoles()
    {
        var result = await _mediator.Send(new GetRolesQuery());
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    [HttpPost("roles")]
    public async Task<IActionResult> CreateRole([FromBody] CreateRoleCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    [HttpDelete("roles/{id}")]
    public async Task<IActionResult> DeleteRole(string id)
    {
        await _mediator.Send(new DeleteRoleCommand { RoleId = id });
        return Ok(ApiResponse<object>.SuccessResponse(null!, "Role deleted"));
    }

    [HttpPost("roles/assign")]
    public async Task<IActionResult> AssignRole([FromBody] AssignRoleCommand command)
    {
        await _mediator.Send(command);
        return Ok(ApiResponse<object>.SuccessResponse(null!, "Role assigned"));
    }

    [HttpPost("roles/remove")]
    public async Task<IActionResult> RemoveRole([FromBody] RemoveRoleCommand command)
    {
        await _mediator.Send(command);
        return Ok(ApiResponse<object>.SuccessResponse(null!, "Role removed"));
    }

    // Notifications
    [HttpGet("notifications")]
    public async Task<IActionResult> GetNotifications([FromQuery] int page = 1, [FromQuery] int pageSize = 20,
        [FromQuery] string? userId = null, [FromQuery] int? type = null)
    {
        var result = await _mediator.Send(new GetNotificationsQuery { Page = page, PageSize = pageSize, UserId = userId, Type = type });
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    // Export
    [HttpPost("export")]
    public async Task<IActionResult> ExportData([FromBody] ExportDataCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(ApiResponse<object>.SuccessResponse(result));
    }
}
