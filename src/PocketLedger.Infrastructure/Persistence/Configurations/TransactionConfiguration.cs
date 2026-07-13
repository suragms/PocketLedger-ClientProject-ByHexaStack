using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PocketLedger.Domain.Entities;

namespace PocketLedger.Infrastructure.Persistence.Configurations;

public class TransactionConfiguration : IEntityTypeConfiguration<Transaction>
{
    public void Configure(EntityTypeBuilder<Transaction> builder)
    {
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Amount).HasColumnType("decimal(18,2)").IsRequired();
        builder.Property(t => t.Currency).IsRequired().HasMaxLength(3);
        builder.Property(t => t.Note).HasMaxLength(500);
        builder.Property(t => t.Payee).HasMaxLength(200);
        builder.Property(t => t.Reference).HasMaxLength(100);
        builder.Property(t => t.ReceiptUrl).HasMaxLength(500);
        builder.Property(t => t.ReceiptThumbnailUrl).HasMaxLength(500);
        builder.HasOne(t => t.Account).WithMany(a => a.Transactions).HasForeignKey(t => t.AccountId).OnDelete(DeleteBehavior.NoAction);
        builder.HasOne(t => t.TargetAccount).WithMany().HasForeignKey(t => t.TargetAccountId).IsRequired(false).OnDelete(DeleteBehavior.NoAction);
        builder.HasOne(t => t.Category).WithMany(c => c.Transactions).HasForeignKey(t => t.CategoryId).IsRequired(false);
        builder.HasOne(t => t.User).WithMany(u => u.Transactions).HasForeignKey(t => t.UserId);
        builder.HasIndex(t => t.TransferGroupId);
        builder.HasIndex(t => t.Date);
        builder.HasIndex(t => t.UserId);
        builder.HasIndex(t => new { t.UserId, t.IsDeleted });
        builder.HasQueryFilter(t => !t.IsDeleted);
    }
}