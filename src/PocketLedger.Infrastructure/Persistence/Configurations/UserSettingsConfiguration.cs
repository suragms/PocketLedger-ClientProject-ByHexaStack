using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PocketLedger.Domain.Entities;

namespace PocketLedger.Infrastructure.Persistence.Configurations;

public class UserSettingsConfiguration : IEntityTypeConfiguration<UserSettings>
{
    public void Configure(EntityTypeBuilder<UserSettings> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Theme).IsRequired().HasMaxLength(20);
        builder.Property(s => s.Language).IsRequired().HasMaxLength(10);
        builder.Property(s => s.Currency).IsRequired().HasMaxLength(3);
        builder.Property(s => s.SessionTimeoutMinutes).HasDefaultValue(30);
        builder.HasOne(s => s.User).WithOne(u => u.Settings).HasForeignKey<UserSettings>(s => s.UserId);
        builder.HasIndex(s => s.UserId).IsUnique();
    }
}
