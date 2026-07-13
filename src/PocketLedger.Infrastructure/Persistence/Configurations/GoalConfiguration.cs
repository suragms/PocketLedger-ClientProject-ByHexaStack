using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PocketLedger.Domain.Entities;

namespace PocketLedger.Infrastructure.Persistence.Configurations;

public class GoalConfiguration : IEntityTypeConfiguration<Goal>
{
    public void Configure(EntityTypeBuilder<Goal> builder)
    {
        builder.HasKey(g => g.Id);
        builder.Property(g => g.Name).IsRequired().HasMaxLength(100);
        builder.Property(g => g.TargetAmount).HasColumnType("decimal(18,2)").IsRequired();
        builder.Property(g => g.CurrentAmount).HasColumnType("decimal(18,2)").IsRequired();
        builder.HasOne(g => g.User).WithMany(u => u.Goals).HasForeignKey(g => g.UserId);
        builder.HasOne(g => g.LinkedAccount).WithMany().HasForeignKey(g => g.LinkedAccountId).IsRequired(false);
        builder.HasQueryFilter(g => !g.IsDeleted);

        builder.HasIndex(g => new { g.UserId, g.IsArchived });
    }
}
