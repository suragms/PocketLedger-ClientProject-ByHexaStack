using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PocketLedger.Domain.Entities;

namespace PocketLedger.Infrastructure.Persistence.Configurations;

public class RecurringTransactionConfiguration : IEntityTypeConfiguration<RecurringTransaction>
{
    public void Configure(EntityTypeBuilder<RecurringTransaction> builder)
    {
        builder.HasKey(r => r.Id);
        builder.Property(r => r.Amount).HasColumnType("decimal(18,2)").IsRequired();
        builder.Property(r => r.Currency).IsRequired().HasMaxLength(3);
        builder.Property(r => r.Note).HasMaxLength(500);
        builder.Property(r => r.Payee).HasMaxLength(200);
        builder.HasOne(r => r.Account).WithMany().HasForeignKey(r => r.AccountId);
        builder.HasOne(r => r.Category).WithMany().HasForeignKey(r => r.CategoryId).IsRequired(false);
        builder.HasOne(r => r.User).WithMany().HasForeignKey(r => r.UserId);
        builder.HasQueryFilter(r => !r.IsDeleted);
    }
}
