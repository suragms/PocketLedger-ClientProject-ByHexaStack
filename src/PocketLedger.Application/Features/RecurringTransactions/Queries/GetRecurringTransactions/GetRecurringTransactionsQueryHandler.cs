using AutoMapper;
using MediatR;
using PocketLedger.Application.Features.RecurringTransactions.DTOs;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.RecurringTransactions.Queries.GetRecurringTransactions;

public class GetRecurringTransactionsQueryHandler : IRequestHandler<GetRecurringTransactionsQuery, List<RecurringTransactionDto>>
{
    private readonly IRepository<RecurringTransaction> _recurringRepo;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public GetRecurringTransactionsQueryHandler(
        IRepository<RecurringTransaction> recurringRepo,
        ICurrentUserService currentUserService,
        IMapper mapper)
    {
        _recurringRepo = recurringRepo;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<List<RecurringTransactionDto>> Handle(GetRecurringTransactionsQuery request, CancellationToken cancellationToken)
    {
        var query = await _recurringRepo.FindAsync(r => r.UserId == _currentUserService.UserId, cancellationToken);

        var dtos = _mapper.Map<List<RecurringTransactionDto>>(query);

        if (request.IsActive.HasValue)
            dtos = dtos.Where(r => r.IsActive == request.IsActive.Value).ToList();

        return dtos.OrderByDescending(r => r.NextDueDate).ToList();
    }
}
