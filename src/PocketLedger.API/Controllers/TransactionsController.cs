using System.Text;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PocketLedger.Application.Common;
using PocketLedger.Application.Features.Transactions.Commands.CreateTransaction;
using PocketLedger.Application.Features.Transactions.Commands.DeleteTransaction;
using PocketLedger.Application.Features.Transactions.Commands.RemoveReceipt;
using PocketLedger.Application.Features.Transactions.Commands.UndoDeleteTransaction;
using PocketLedger.Application.Features.Transactions.Commands.UpdateTransaction;
using PocketLedger.Application.Features.Transactions.Commands.UploadReceipt;
using PocketLedger.Application.Features.Transactions.DTOs;
using PocketLedger.Application.Features.Transactions.Queries.GetDeletedTransactions;
using PocketLedger.Application.Features.Transactions.Queries.GetTransactionById;
using PocketLedger.Application.Features.Transactions.Queries.GetTransactions;
using PocketLedger.Domain.Enums;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.API.Controllers;

/// <summary>
/// Transaction management endpoints with search, filtering, sorting, and receipt upload
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
[Produces("application/json")]
public class TransactionsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public TransactionsController(IMediator mediator, IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _mediator = mediator;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Get paginated transactions with filtering, sorting, and search
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<TransactionDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTransactions([FromQuery] GetTransactionsQuery query)
    {
        var result = await _mediator.Send(query);
        return Ok(ApiResponse<PagedResult<TransactionDto>>.SuccessResponse(result));
    }

    /// <summary>
    /// Get transaction by ID with full details
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<TransactionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTransaction(int id)
    {
        var result = await _mediator.Send(new GetTransactionByIdQuery { Id = id });
        return Ok(ApiResponse<TransactionDto>.SuccessResponse(result));
    }

    /// <summary>
    /// Create a new transaction
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<TransactionDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateTransaction([FromBody] CreateTransactionCommand command)
    {
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetTransaction), new { id = result.Id },
            ApiResponse<TransactionDto>.SuccessResponse(result, "Transaction created successfully."));
    }

    /// <summary>
    /// Update an existing transaction
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<TransactionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateTransaction(int id, [FromBody] UpdateTransactionCommand command)
    {
        command.Id = id;
        var result = await _mediator.Send(command);
        return Ok(ApiResponse<TransactionDto>.SuccessResponse(result, "Transaction updated successfully."));
    }

    /// <summary>
    /// Soft delete a transaction
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> DeleteTransaction(int id)
    {
        await _mediator.Send(new DeleteTransactionCommand { Id = id });
        return Ok(ApiResponse<object>.SuccessResponse(null!, "Transaction deleted successfully. Use PUT /api/transactions/{id}/undo to restore."));
    }

    /// <summary>
    /// Undo a deleted transaction (restore from soft delete)
    /// </summary>
    [HttpPut("{id}/undo")]
    [ProducesResponseType(typeof(ApiResponse<TransactionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UndoDeleteTransaction(int id)
    {
        var result = await _mediator.Send(new UndoDeleteTransactionCommand { Id = id });
        return Ok(ApiResponse<TransactionDto>.SuccessResponse(result, "Transaction restored successfully."));
    }

    /// <summary>
    /// Upload receipt image for a transaction
    /// </summary>
    [HttpPost("{id}/receipt")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(ApiResponse<TransactionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UploadReceipt(int id, IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded." });

        if (file.Length > 10 * 1024 * 1024)
            return BadRequest(new { message = "File size must be less than 10MB." });

        var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp", "image/heic" };
        if (!allowedTypes.Contains(file.ContentType.ToLower()))
            return BadRequest(new { message = "Only JPEG, PNG, WebP, and HEIC files are allowed." });

        using var stream = file.OpenReadStream();
        var command = new UploadReceiptCommand
        {
            TransactionId = id,
            FileStream = stream,
            FileName = file.FileName,
            ContentType = file.ContentType
        };

        var result = await _mediator.Send(command);
        return Ok(ApiResponse<TransactionDto>.SuccessResponse(result, "Receipt uploaded successfully."));
    }

    /// <summary>
    /// Remove receipt from a transaction
    /// </summary>
    [HttpDelete("{id}/receipt")]
    [ProducesResponseType(typeof(ApiResponse<TransactionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> RemoveReceipt(int id)
    {
        var result = await _mediator.Send(new RemoveReceiptCommand { TransactionId = id });
        return Ok(ApiResponse<TransactionDto>.SuccessResponse(result, "Receipt removed successfully."));
    }

    /// <summary>
    /// Get all deleted transactions for undo
    /// </summary>
    [HttpGet("deleted")]
    [ProducesResponseType(typeof(ApiResponse<List<TransactionDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDeletedTransactions()
    {
        var result = await _mediator.Send(new GetDeletedTransactionsQuery());
        return Ok(ApiResponse<List<TransactionDto>>.SuccessResponse(result));
    }

    /// <summary>
    /// Export transactions as CSV with optional filters
    /// </summary>
    [HttpGet("export")]
    [Produces("text/csv")]
    public async Task<IActionResult> ExportTransactions(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] TransactionType? type,
        [FromQuery] int? accountId,
        [FromQuery] int? categoryId,
        [FromQuery] decimal? minAmount,
        [FromQuery] decimal? maxAmount,
        [FromQuery] string? search,
        [FromQuery] string? payee)
    {
        var userId = _currentUserService.UserId!;
        var transactions = await _unitOfWork.Transactions.GetTransactionsWithDetailsAsync(
            userId, startDate, endDate, type, accountId, categoryId,
            minAmount, maxAmount, search, payee,
            "date", "desc", 0, 10000, CancellationToken.None);

        var sb = new StringBuilder();
        sb.AppendLine("Date,Type,Amount,Currency,Payee,Note,Reference,Account,Category,Payment Method");

        foreach (var t in transactions)
        {
            var typeName = t.Type switch
            {
                TransactionType.Income => "Income",
                TransactionType.Expense => "Expense",
                TransactionType.Transfer => "Transfer",
                _ => "Unknown"
            };
            var paymentName = t.PaymentMethod switch
            {
                PaymentMethod.Cash => "Cash",
                PaymentMethod.CreditCard => "Credit Card",
                PaymentMethod.DebitCard => "Debit Card",
                PaymentMethod.BankTransfer => "Bank Transfer",
                PaymentMethod.MobilePayment => "Mobile Payment",
                PaymentMethod.Check => "Check",
                _ => "Other"
            };

            sb.AppendLine(string.Join(",",
                EscapeCsv(t.Date.ToString("yyyy-MM-dd")),
                EscapeCsv(typeName),
                t.Amount.ToString("F2"),
                EscapeCsv(t.Currency),
                EscapeCsv(t.Payee ?? ""),
                EscapeCsv(t.Note ?? ""),
                EscapeCsv(t.Reference ?? ""),
                EscapeCsv(t.Account?.Name ?? ""),
                EscapeCsv(t.Category?.Name ?? ""),
                EscapeCsv(paymentName)
            ));
        }

        var bytes = Encoding.UTF8.GetBytes("\uFEFF" + sb.ToString());
        return File(bytes, "text/csv", $"transactions_{DateTime.UtcNow:yyyyMMdd}.csv");
    }

    private static string EscapeCsv(string value)
    {
        if (value.Contains(',') || value.Contains('"') || value.Contains('\n'))
            return $"\"{value.Replace("\"", "\"\"")}\"";
        return value;
    }
}