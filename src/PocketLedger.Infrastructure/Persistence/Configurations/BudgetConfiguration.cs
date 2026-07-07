using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PocketLedger.Domain.Entities;

namespace PocketLedger.Infrastructure.Persistence.Configurations;

public class BudgetConfiguration : IEntityTypeConfiguration<Budget>
{
    public void Configure(EntityTypeBuilder<Budget> builder)
    {
        builder.HasKey(b => b.Id);
        builder.Property(b => b.Name).IsRequired().HasMaxLength(100);
        builder.Property(b => b.Amount).HasColumnType("decimal(18,2)").IsRequired();
        builder.Property(b => b.Currency).IsRequired().HasMaxLength(3);
        builder.Property(b => b.NotifyOnAlert).HasDefaultValue(true);
        builder.Property(b => b.NotifyOnExceed).HasDefaultValue(true);
        builder.HasOne(b => b.User).WithMany(u => u.Budgets).HasForeignKey(b => b.UserId);
        builder.HasOne(b => b.Category).WithMany(c => c.Budgets).HasForeignKey(b => b.CategoryId).IsRequired(false);
        builder.HasQueryFilter(b => !b.IsDeleted);

        builder.HasIndex(b => new { b.UserId, b.IsActive });
        builder.HasIndex(b => new { b.UserId, b.Period });
    }
}
