using MediatR;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Admin.Queries.GetAllWallets;

public record GetAllWalletsQuery : IRequest<PagedWalletsDto>
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
    public string? Search { get; init; }
    public string? UserId { get; init; }
}

public class PagedWalletsDto
{
    public List<WalletListItemDto> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
}

public class WalletListItemDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Type { get; set; }
    public decimal Balance { get; set; }
    public string Currency { get; set; } = "USD";
    public string? Color { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class GetAllWalletsQueryHandler : IRequestHandler<GetAllWalletsQuery, PagedWalletsDto>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetAllWalletsQueryHandler(IUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<PagedWalletsDto> Handle(GetAllWalletsQuery request, CancellationToken cancellationToken)
    {
        var (items, totalCount) = await _unitOfWork.Accounts.GetPagedWithUserAsync(
            request.UserId, request.Search, request.Page, request.PageSize, cancellationToken);

        return new PagedWalletsDto
        {
            Items = items.Select(a => new WalletListItemDto
            {
                Id = a.Id,
                Name = a.Name,
                Description = a.Description,
                Type = (int)a.Type,
                Balance = a.Balance,
                Currency = a.Currency,
                Color = a.Color,
                UserId = a.UserId,
                UserEmail = a.User?.Email ?? "",
                CreatedAt = a.CreatedAt
            }).ToList(),
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize)
        };
    }
}
