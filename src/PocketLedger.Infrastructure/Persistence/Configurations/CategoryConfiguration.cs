using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PocketLedger.Domain.Entities;

namespace PocketLedger.Infrastructure.Persistence.Configurations;

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Name).IsRequired().HasMaxLength(100);
        builder.Property(c => c.Description).HasMaxLength(500);
        builder.Property(c => c.Icon).IsRequired().HasMaxLength(50);
        builder.Property(c => c.Color).IsRequired().HasMaxLength(7);
        builder.Property(c => c.Type).HasConversion<int>();
        builder.Property(c => c.IsDefault).HasDefaultValue(false);
        builder.Property(c => c.IsArchived).HasDefaultValue(false);
        builder.HasOne(c => c.User).WithMany(u => u.Categories).HasForeignKey(c => c.UserId);
        builder.HasOne(c => c.Parent).WithMany(c => c.Children).HasForeignKey(c => c.ParentId).IsRequired(false);
        builder.HasQueryFilter(c => !c.IsDeleted);

        builder.HasIndex(c => new { c.UserId, c.DisplayOrder });
        builder.HasIndex(c => new { c.UserId, c.Type });
    }
}
