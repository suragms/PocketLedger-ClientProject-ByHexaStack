using MediatR;
using PocketLedger.Application.Features.Budgets.DTOs;
using PocketLedger.Domain.Enums;

namespace PocketLedger.Application.Features.Budgets.Commands.UpdateBudget;

public class UpdateBudgetCommand : IRequest<BudgetDto>
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public BudgetPeriod Period { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public decimal? AlertThreshold { get; set; }
    public bool IsActive { get; set; }
}
