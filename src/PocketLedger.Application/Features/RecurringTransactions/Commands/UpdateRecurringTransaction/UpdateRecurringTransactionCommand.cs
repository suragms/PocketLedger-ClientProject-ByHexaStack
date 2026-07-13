using MediatR;
using PocketLedger.Application.Features.RecurringTransactions.DTOs;
using PocketLedger.Domain.Enums;

namespace PocketLedger.Application.Features.RecurringTransactions.Commands.UpdateRecurringTransaction;

public class UpdateRecurringTransactionCommand : IRequest<RecurringTransactionDto>
{
    public int Id { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public TransactionType Type { get; set; }
    public string? Note { get; set; }
    public string? Payee { get; set; }
    public int FrequencyDays { get; set; }
    public DateTime NextDueDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int AccountId { get; set; }
    public int? CategoryId { get; set; }
}
