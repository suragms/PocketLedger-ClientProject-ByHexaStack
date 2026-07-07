using AutoMapper;
using MediatR;
using PocketLedger.Application.Features.Accounts.DTOs;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Accounts.Commands.CreateAccount;

public class CreateAccountCommandHandler : IRequestHandler<CreateAccountCommand, AccountDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public CreateAccountCommandHandler(
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<AccountDto> Handle(CreateAccountCommand request, CancellationToken cancellationToken)
    {
        var account = new Account
        {
            Name = request.Name,
            Description = request.Description,
            Type = request.Type,
            Balance = request.Balance,
            Currency = request.Currency,
            Color = request.Color,
            Icon = request.Icon,
            IncludeInBalance = request.IncludeInBalance,
            UserId = _currentUserService.UserId!,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = _currentUserService.UserId
        };

        var result = await _unitOfWork.Accounts.AddAsync(account, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<AccountDto>(result);
    }
}
