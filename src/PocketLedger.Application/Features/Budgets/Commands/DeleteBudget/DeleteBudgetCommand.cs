using MediatR;

namespace PocketLedger.Application.Features.Budgets.Commands.DeleteBudget;

public class DeleteBudgetCommand : IRequest<Unit>
{
    public int Id { get; set; }
}
