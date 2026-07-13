using AutoMapper;
using MediatR;
using PocketLedger.Application.Common.Exceptions;
using PocketLedger.Application.Features.RecurringTransactions.DTOs;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.RecurringTransactions.Queries.GetRecurringTransactionById;

public class GetRecurringTransactionByIdQueryHandler : IRequestHandler<GetRecurringTransactionByIdQuery, RecurringTransactionDto>
{
    private readonly IRepository<RecurringTransaction> _recurringRepo;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public GetRecurringTransactionByIdQueryHandler(
        IRepository<RecurringTransaction> recurringRepo,
        ICurrentUserService currentUserService,
        IMapper mapper)
    {
        _recurringRepo = recurringRepo;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<RecurringTransactionDto> Handle(GetRecurringTransactionByIdQuery request, CancellationToken cancellationToken)
    {
        var recurring = await _recurringRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(RecurringTransaction), request.Id);

        if (recurring.UserId != _currentUserService.UserId)
            throw new UnauthorizedAccessException("You do not have access to this recurring transaction.");

        return _mapper.Map<RecurringTransactionDto>(recurring);
    }
}
