using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PocketLedger.Domain.Entities;

namespace PocketLedger.Infrastructure.Persistence.Configurations;

public class NotificationPreferenceConfiguration : IEntityTypeConfiguration<NotificationPreference>
{
    public void Configure(EntityTypeBuilder<NotificationPreference> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.UserId).IsRequired();
        builder.HasIndex(p => p.UserId).IsUnique();
        builder.HasOne(p => p.User).WithMany().HasForeignKey(p => p.UserId);
    }
}
