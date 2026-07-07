using AutoMapper;
using MediatR;
using PocketLedger.Application.Common.Exceptions;
using PocketLedger.Application.Features.Transactions.DTOs;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Transactions.Commands.RemoveReceipt;

public class RemoveReceiptCommandHandler : IRequestHandler<RemoveReceiptCommand, TransactionDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IFileStorageService _fileStorageService;
    private readonly IMapper _mapper;

    public RemoveReceiptCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService, IFileStorageService fileStorageService, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _fileStorageService = fileStorageService;
        _mapper = mapper;
    }

    public async Task<TransactionDto> Handle(RemoveReceiptCommand request, CancellationToken cancellationToken)
    {
        var transaction = await _unitOfWork.Transactions.GetByIdAsync(request.TransactionId, cancellationToken)
            ?? throw new NotFoundException(nameof(Transaction), request.TransactionId);

        if (transaction.UserId != _currentUserService.UserId)
            throw new UnauthorizedAccessException("You do not have access to this transaction.");

        if (!string.IsNullOrEmpty(transaction.ReceiptUrl))
            await _fileStorageService.DeleteAsync(transaction.ReceiptUrl, cancellationToken);
        if (!string.IsNullOrEmpty(transaction.ReceiptThumbnailUrl))
            await _fileStorageService.DeleteAsync(transaction.ReceiptThumbnailUrl, cancellationToken);

        transaction.ReceiptUrl = null;
        transaction.ReceiptThumbnailUrl = null;
        transaction.UpdatedAt = DateTime.UtcNow;
        transaction.UpdatedBy = _currentUserService.UserId;

        await _unitOfWork.Transactions.UpdateAsync(transaction, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<TransactionDto>(transaction);
    }
}