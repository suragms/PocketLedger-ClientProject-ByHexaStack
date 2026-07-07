using PocketLedger.Domain.Enums;
using PocketLedger.Domain.Entities;
using PocketLedger.Application.Common.Mappings;

namespace PocketLedger.Application.Features.Accounts.DTOs;

public class AccountDto : IMapFrom<Account>
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public AccountType Type { get; set; }
    public string TypeName { get; set; } = string.Empty;
    public decimal Balance { get; set; }
    public string Currency { get; set; } = "USD";
    public string? Color { get; set; }
    public string? Icon { get; set; }
    public bool IncludeInBalance { get; set; }
    public int DisplayOrder { get; set; }
    public DateTime CreatedAt { get; set; }
    public int TransactionCount { get; set; }
    public decimal TotalIncome { get; set; }
    public decimal TotalExpenses { get; set; }
    public DateTime? LastTransactionDate { get; set; }
}
