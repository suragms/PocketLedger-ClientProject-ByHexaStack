using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PocketLedger.Domain.Entities;

namespace PocketLedger.Infrastructure.Persistence.Configurations;

public class TagConfiguration : IEntityTypeConfiguration<Tag>
{
    public void Configure(EntityTypeBuilder<Tag> builder)
    {
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Name).IsRequired().HasMaxLength(50);
        builder.Property(t => t.Color).IsRequired().HasMaxLength(7);
        builder.HasOne(t => t.User).WithMany(u => u.Tags).HasForeignKey(t => t.UserId);
        builder.HasQueryFilter(t => !t.IsDeleted);
    }
}
