using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PocketLedger.Domain.Entities;

namespace PocketLedger.Infrastructure.Persistence.Configurations;

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.HasKey(n => n.Id);
        builder.Property(n => n.Title).IsRequired().HasMaxLength(200);
        builder.Property(n => n.Message).IsRequired().HasMaxLength(1000);
        builder.Property(n => n.ActionUrl).HasMaxLength(500);
        builder.Property(n => n.Icon).HasMaxLength(50);
        builder.Property(n => n.UserId).IsRequired();
        builder.HasOne(n => n.User).WithMany().HasForeignKey(n => n.UserId);
        builder.HasIndex(n => new { n.UserId, n.Status });
        builder.HasIndex(n => n.CreatedAt);
    }
}
