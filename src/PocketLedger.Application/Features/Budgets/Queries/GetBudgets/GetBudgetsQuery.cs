using MediatR;
using PocketLedger.Application.Features.Budgets.DTOs;

namespace PocketLedger.Application.Features.Budgets.Queries.GetBudgets;

public class GetBudgetsQuery : IRequest<List<BudgetDto>> { }
