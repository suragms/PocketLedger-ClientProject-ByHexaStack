using MediatR;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Admin.Queries.GetUserDetail;

public record GetUserDetailQuery : IRequest<UserDetailDto>
{
    public string UserId { get; init; } = string.Empty;
}

public class UserDetailDto
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string DefaultCurrency { get; set; } = "USD";
    public bool IsActive { get; set; }
    public bool EmailVerified { get; set; }
    public bool PinEnabled { get; set; }
    public bool TwoFactorEnabled { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public List<string> Roles { get; set; } = new();
    public int TransactionCount { get; set; }
    public int AccountCount { get; set; }
    public int CategoryCount { get; set; }
    public int BudgetCount { get; set; }
}

public class GetUserDetailQueryHandler : IRequestHandler<GetUserDetailQuery, UserDetailDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public GetUserDetailQueryHandler(IUserRepository userRepository, IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<UserDetailDto> Handle(GetUserDetailQuery request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken)
            ?? throw new Exception("User not found");

        var roles = await _userRepository.GetRolesAsync(user, cancellationToken);
        var accounts = await _unitOfWork.Accounts.GetAccountsByUserIdAsync(request.UserId, cancellationToken);
        var categories = await _unitOfWork.Categories.GetCategoriesByUserIdAsync(request.UserId, cancellationToken);
        var budgets = await _unitOfWork.Budgets.GetBudgetsByUserIdAsync(request.UserId, cancellationToken);
        var allTransactions = await _unitOfWork.Transactions.GetAllAsync(cancellationToken);
        var transactionCount = allTransactions.Count(t => t.UserId == request.UserId);

        return new UserDetailDto
        {
            Id = user.Id,
            Email = user.Email ?? "",
            FirstName = user.FirstName,
            LastName = user.LastName,
            AvatarUrl = user.AvatarUrl,
            DefaultCurrency = user.DefaultCurrency,
            IsActive = user.IsActive,
            EmailVerified = user.EmailVerified,
            PinEnabled = user.PinEnabled,
            TwoFactorEnabled = user.TwoFactorEnabled,
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt,
            Roles = roles.ToList(),
            TransactionCount = transactionCount,
            AccountCount = accounts?.Count() ?? 0,
            CategoryCount = categories?.Count() ?? 0,
            BudgetCount = budgets?.Count() ?? 0
        };
    }
}
