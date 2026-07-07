using MediatR;
using PocketLedger.Application.Features.Budgets.DTOs;
using PocketLedger.Domain.Enums;

namespace PocketLedger.Application.Features.Budgets.Commands.CreateBudget;

public class CreateBudgetCommand : IRequest<BudgetDto>
{
    public string Name { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public BudgetPeriod Period { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public decimal? AlertThreshold { get; set; }
    public int? CategoryId { get; set; }
}
