using MediatR;
using PocketLedger.Application.Features.Budgets.DTOs;

namespace PocketLedger.Application.Features.Budgets.Queries.GetBudgetById;

public class GetBudgetByIdQuery : IRequest<BudgetDto>
{
    public int Id { get; set; }
}
