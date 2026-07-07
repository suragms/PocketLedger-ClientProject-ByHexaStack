using MediatR;
using PocketLedger.Application.Features.Transactions.DTOs;

namespace PocketLedger.Application.Features.Transactions.Queries.GetTransactionById;

public class GetTransactionByIdQuery : IRequest<TransactionDto>
{
    public int Id { get; set; }
}
