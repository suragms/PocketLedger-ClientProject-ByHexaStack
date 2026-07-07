using MediatR;
using PocketLedger.Application.Common.Exceptions;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Accounts.Commands.DeleteAccount;

public class DeleteAccountCommandHandler : IRequestHandler<DeleteAccountCommand, Unit>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public DeleteAccountCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<Unit> Handle(DeleteAccountCommand request, CancellationToken cancellationToken)
    {
        var account = await _unitOfWork.Accounts.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Account), request.Id);

        if (account.UserId != _currentUserService.UserId)
            throw new UnauthorizedAccessException("You do not have access to this account.");

        account.IsDeleted = true;
        account.DeletedAt = DateTime.UtcNow;
        account.DeletedBy = _currentUserService.UserId;
        account.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Accounts.UpdateAsync(account, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
