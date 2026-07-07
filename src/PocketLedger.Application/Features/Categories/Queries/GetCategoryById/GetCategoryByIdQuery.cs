using MediatR;
using PocketLedger.Application.Features.Categories.DTOs;

namespace PocketLedger.Application.Features.Categories.Queries.GetCategoryById;

public class GetCategoryByIdQuery : IRequest<CategoryDto>
{
    public int Id { get; set; }
}
