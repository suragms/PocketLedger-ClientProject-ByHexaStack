using MediatR;

namespace PocketLedger.Application.Features.Reports.Queries.GetSpendingByCategory;

public class GetSpendingByCategoryQuery : IRequest<List<CategorySpendingDto>>
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}

public class CategorySpendingDto
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public double Percentage { get; set; }
}
