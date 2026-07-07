using MediatR;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Settings.Commands.UploadAvatar;

public record UploadAvatarCommand : IRequest<AvatarResult>
{
    public Stream FileStream { get; set; } = null!;
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
}

public class AvatarResult
{
    public string AvatarUrl { get; set; } = string.Empty;
}

public class UploadAvatarCommandHandler : IRequestHandler<UploadAvatarCommand, AvatarResult>
{
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUser;
    private readonly IFileStorageService _fileStorage;

    public UploadAvatarCommandHandler(
        IUserRepository userRepository,
        ICurrentUserService currentUser,
        IFileStorageService fileStorage)
    {
        _userRepository = userRepository;
        _currentUser = currentUser;
        _fileStorage = fileStorage;
    }

    public async Task<AvatarResult> Handle(UploadAvatarCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(_currentUser.UserId!, cancellationToken)
            ?? throw new Exception("User not found");

        var extension = Path.GetExtension(request.FileName);
        var fileName = $"avatar-{user.Id}-{DateTime.UtcNow:yyyyMMddHHmmss}{extension}";
        var avatarUrl = await _fileStorage.UploadAsync(request.FileStream, fileName, request.ContentType, cancellationToken);

        user.AvatarUrl = avatarUrl;
        await _userRepository.UpdateAsync(user, cancellationToken);

        return new AvatarResult { AvatarUrl = avatarUrl };
    }
}
