using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PocketLedger.Domain.Entities;

namespace PocketLedger.Infrastructure.Persistence.Configurations;

public class AccountConfiguration : IEntityTypeConfiguration<Account>
{
    public void Configure(EntityTypeBuilder<Account> builder)
    {
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Name).IsRequired().HasMaxLength(100);
        builder.Property(a => a.Description).HasMaxLength(500);
        builder.Property(a => a.Currency).IsRequired().HasMaxLength(3);
        builder.Property(a => a.Color).HasMaxLength(7);
        builder.Property(a => a.Icon).HasMaxLength(50);
        builder.Property(a => a.Balance).HasColumnType("decimal(18,2)");
        builder.Property(a => a.Type).HasConversion<int>();
        builder.Property(a => a.IncludeInBalance).HasDefaultValue(true);
        builder.HasOne(a => a.User).WithMany(u => u.Accounts).HasForeignKey(a => a.UserId);
        builder.HasQueryFilter(a => !a.IsDeleted);

        builder.HasIndex(a => new { a.UserId, a.DisplayOrder });
        builder.HasIndex(a => new { a.UserId, a.Type });
    }
}
