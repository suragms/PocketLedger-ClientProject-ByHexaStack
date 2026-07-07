using MediatR;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Admin.Queries.GetNotifications;

public record GetNotificationsQuery : IRequest<PagedNotificationsDto>
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
    public string? UserId { get; init; }
    public int? Type { get; init; }
}

public class PagedNotificationsDto
{
    public List<NotificationListItemDto> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
}

public class NotificationListItemDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public int Type { get; set; }
    public int Status { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class GetNotificationsQueryHandler : IRequestHandler<GetNotificationsQuery, PagedNotificationsDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserRepository _userRepository;

    public GetNotificationsQueryHandler(IUnitOfWork unitOfWork, IUserRepository userRepository)
    {
        _unitOfWork = unitOfWork;
        _userRepository = userRepository;
    }

    public async Task<PagedNotificationsDto> Handle(GetNotificationsQuery request, CancellationToken cancellationToken)
    {
        var (items, totalCount) = await _unitOfWork.Notifications.GetPagedForAdminAsync(
            request.UserId, request.Type, request.Page, request.PageSize, cancellationToken);

        var userIds = items.Select(n => n.UserId).Distinct().ToList();
        var users = await _userRepository.GetByIdsAsync(userIds, cancellationToken);
        var userEmailMap = users.ToDictionary(u => u.Id, u => u.Email ?? "");

        return new PagedNotificationsDto
        {
            Items = items.Select(n => new NotificationListItemDto
            {
                Id = n.Id,
                Title = n.Title,
                Message = n.Message,
                Type = (int)n.Type,
                Status = (int)n.Status,
                UserId = n.UserId,
                UserEmail = userEmailMap.TryGetValue(n.UserId, out var email) ? email : "",
                CreatedAt = n.CreatedAt
            }).ToList(),
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize)
        };
    }
}
