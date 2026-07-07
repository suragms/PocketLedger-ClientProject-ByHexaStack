using AutoMapper;
using MediatR;
using PocketLedger.Application.Common.Exceptions;
using PocketLedger.Application.Features.Accounts.DTOs;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Accounts.Commands.UpdateAccount;

public class UpdateAccountCommandHandler : IRequestHandler<UpdateAccountCommand, AccountDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public UpdateAccountCommandHandler(
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<AccountDto> Handle(UpdateAccountCommand request, CancellationToken cancellationToken)
    {
        var account = await _unitOfWork.Accounts.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Account), request.Id);

        if (account.UserId != _currentUserService.UserId)
            throw new UnauthorizedAccessException("You do not have access to this account.");

        account.Name = request.Name;
        account.Description = request.Description;
        account.Type = request.Type;
        account.Color = request.Color;
        account.Icon = request.Icon;
        account.IncludeInBalance = request.IncludeInBalance;
        account.DisplayOrder = request.DisplayOrder;
        account.UpdatedAt = DateTime.UtcNow;
        account.UpdatedBy = _currentUserService.UserId;

        await _unitOfWork.Accounts.UpdateAsync(account, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<AccountDto>(account);
    }
}
