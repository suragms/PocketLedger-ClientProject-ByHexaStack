using MediatR;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Settings.Queries.GetPasskeys;

public record GetPasskeysQuery : IRequest<PasskeyListDto>;

public class PasskeyListDto
{
    public List<PasskeyDto> Passkeys { get; set; } = new();
}

public class PasskeyDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? LastUsedAt { get; set; }
}

public class GetPasskeysQueryHandler : IRequestHandler<GetPasskeysQuery, PasskeyListDto>
{
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUser;

    public GetPasskeysQueryHandler(IUserRepository userRepository, ICurrentUserService currentUser)
    {
        _userRepository = userRepository;
        _currentUser = currentUser;
    }

    public async Task<PasskeyListDto> Handle(GetPasskeysQuery request, CancellationToken cancellationToken)
    {
        var passkeys = await _userRepository.GetPasskeysByUserIdAsync(_currentUser.UserId!, cancellationToken);

        return new PasskeyListDto
        {
            Passkeys = passkeys.Select(p => new PasskeyDto
            {
                Id = p.Id,
                Name = p.Name,
                CreatedAt = p.CreatedAt,
                LastUsedAt = p.LastUsedAt
            }).ToList()
        };
    }
}
