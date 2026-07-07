using MediatR;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Admin.Queries.GetAuditLogs;

public record GetAuditLogsQuery : IRequest<PagedAuditLogsDto>
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
    public string? Search { get; init; }
    public string? UserId { get; init; }
    public string? Action { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
}

public class PagedAuditLogsDto
{
    public List<AuditLogListItemDto> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
}

public class AuditLogListItemDto
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string Entity { get; set; } = string.Empty;
    public string? EntityId { get; set; }
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public string? IpAddress { get; set; }
    public bool IsSuccess { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class GetAuditLogsQueryHandler : IRequestHandler<GetAuditLogsQuery, PagedAuditLogsDto>
{
    private readonly IAuditLogRepository _auditRepo;

    public GetAuditLogsQueryHandler(IAuditLogRepository auditRepo) => _auditRepo = auditRepo;

    public async Task<PagedAuditLogsDto> Handle(GetAuditLogsQuery request, CancellationToken cancellationToken)
    {
        var (items, totalCount) = await _auditRepo.GetPagedAsync(
            request.Page, request.PageSize, request.Search, request.UserId,
            request.Action, request.StartDate, request.EndDate, cancellationToken);

        return new PagedAuditLogsDto
        {
            Items = items.Select(a => new AuditLogListItemDto
            {
                Id = a.Id,
                UserId = a.UserId,
                UserEmail = a.User?.Email ?? "",
                Action = a.Action,
                Entity = a.Entity,
                EntityId = a.EntityId,
                OldValues = a.OldValues,
                NewValues = a.NewValues,
                IpAddress = a.IpAddress,
                IsSuccess = a.IsSuccess,
                CreatedAt = a.CreatedAt
            }).ToList(),
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize)
        };
    }
}
