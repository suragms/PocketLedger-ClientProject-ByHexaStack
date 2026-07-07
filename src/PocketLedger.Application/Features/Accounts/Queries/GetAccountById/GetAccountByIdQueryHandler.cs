using AutoMapper;
using MediatR;
using PocketLedger.Application.Common.Exceptions;
using PocketLedger.Application.Features.Accounts.DTOs;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Accounts.Queries.GetAccountById;

public class GetAccountByIdQueryHandler : IRequestHandler<GetAccountByIdQuery, AccountDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public GetAccountByIdQueryHandler(
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<AccountDto> Handle(GetAccountByIdQuery request, CancellationToken cancellationToken)
    {
        var account = await _unitOfWork.Accounts.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Account), request.Id);

        if (account.UserId != _currentUserService.UserId)
            throw new UnauthorizedAccessException("You do not have access to this account.");

        return _mapper.Map<AccountDto>(account);
    }
}
