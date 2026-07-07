using PocketLedger.Domain.Enums;

namespace PocketLedger.Application.Features.Transactions.DTOs;

public class CreateTransactionRequest
{
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public TransactionType Type { get; set; }
    public DateTime Date { get; set; }
    public string? Note { get; set; }
    public string? Payee { get; set; }
    public string? Reference { get; set; }
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;
    public int AccountId { get; set; }
    public int? CategoryId { get; set; }
    public List<int>? TagIds { get; set; }
}