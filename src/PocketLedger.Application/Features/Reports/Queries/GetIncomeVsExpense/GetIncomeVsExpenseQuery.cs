using MediatR;

namespace PocketLedger.Application.Features.Reports.Queries.GetIncomeVsExpense;

public class GetIncomeVsExpenseQuery : IRequest<IncomeVsExpenseDto>
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}

public class IncomeVsExpenseDto
{
    public decimal TotalIncome { get; set; }
    public decimal TotalExpense { get; set; }
    public decimal NetIncome => TotalIncome - TotalExpense;
    public List<MonthlyData> MonthlyBreakdown { get; set; } = new();
}

public class MonthlyData
{
    public string Month { get; set; } = string.Empty;
    public decimal Income { get; set; }
    public decimal Expense { get; set; }
    public decimal Net => Income - Expense;
}
