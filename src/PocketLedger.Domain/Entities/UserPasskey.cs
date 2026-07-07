namespace PocketLedger.Domain.Entities;

public class UserPasskey
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public byte[] CredentialId { get; set; } = Array.Empty<byte>();
    public byte[] PublicKey { get; set; } = Array.Empty<byte>();
    public uint SignCount { get; set; }
    public string? Transports { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastUsedAt { get; set; }

    public User User { get; set; } = null!;
}
