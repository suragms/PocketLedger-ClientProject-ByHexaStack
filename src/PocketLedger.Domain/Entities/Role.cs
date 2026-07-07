using Microsoft.AspNetCore.Identity;

namespace PocketLedger.Domain.Entities;

public class Role : IdentityRole
{
    public string? Description { get; set; }
}
