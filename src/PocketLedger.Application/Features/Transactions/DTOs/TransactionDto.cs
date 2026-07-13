using AutoMapper;
using PocketLedger.Domain.Enums;
using PocketLedger.Domain.Entities;
using PocketLedger.Application.Common.Mappings;

namespace PocketLedger.Application.Features.Transactions.DTOs;

public class TransactionDto : IMapFrom<Transaction>
{
    void IMapFrom<Transaction>.Mapping(Profile profile)
    {
        profile.CreateMap<Transaction, TransactionDto>()
            .ForMember(d => d.Tags, opt => opt.MapFrom(s => s.TransactionTags.Select(tt => tt.Tag.Name).ToList()))
            .ForMember(d => d.TagIds, opt => opt.MapFrom(s => s.TransactionTags.Select(tt => tt.TagId).ToList()))
            .ForMember(d => d.TargetAccountName, opt => opt.MapFrom(s => s.TargetAccount != null ? s.TargetAccount.Name : null))
            .ForMember(d => d.TargetAccountColor, opt => opt.MapFrom(s => s.TargetAccount != null ? s.TargetAccount.Color : null));
    }

    public int Id { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public TransactionType Type { get; set; }
    public string TypeName => Type switch
    {
        TransactionType.Income => "Income",
        TransactionType.Expense => "Expense",
        TransactionType.Transfer => "Transfer",
        _ => "Unknown"
    };
    public DateTime Date { get; set; }
    public string? Note { get; set; }
    public string? Payee { get; set; }
    public string? Reference { get; set; }
    public string? ReceiptUrl { get; set; }
    public string? ReceiptThumbnailUrl { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public string PaymentMethodName => PaymentMethod switch
    {
        PaymentMethod.Cash => "Cash",
        PaymentMethod.CreditCard => "Credit Card",
        PaymentMethod.DebitCard => "Debit Card",
        PaymentMethod.BankTransfer => "Bank Transfer",
        PaymentMethod.MobilePayment => "Mobile Payment",
        PaymentMethod.Check => "Check",
        _ => "Other"
    };
    public int AccountId { get; set; }
    public string AccountName { get; set; } = string.Empty;
    public string? AccountColor { get; set; }
    public int? TargetAccountId { get; set; }
    public string? TargetAccountName { get; set; }
    public string? TargetAccountColor { get; set; }
    public Guid? TransferGroupId { get; set; }
    public int? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public string? CategoryColor { get; set; }
    public string? CategoryIcon { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public List<string> Tags { get; set; } = new();
    public List<int> TagIds { get; set; } = new();
}