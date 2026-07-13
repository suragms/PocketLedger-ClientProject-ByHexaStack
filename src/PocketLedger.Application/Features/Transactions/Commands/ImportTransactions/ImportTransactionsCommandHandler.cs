using AutoMapper;
using MediatR;
using PocketLedger.Application.Common.Exceptions;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Enums;
using PocketLedger.Domain.Interfaces;
using System.Globalization;
using System.Text;

namespace PocketLedger.Application.Features.Transactions.Commands.ImportTransactions;

public class ImportTransactionsCommandHandler : IRequestHandler<ImportTransactionsCommand, ImportResult>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public ImportTransactionsCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<ImportResult> Handle(ImportTransactionsCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId!;

        var account = await _unitOfWork.Accounts.GetByIdAsync(request.AccountId, cancellationToken)
            ?? throw new NotFoundException(nameof(Account), request.AccountId);

        if (account.UserId != userId)
            throw new UnauthorizedAccessException("You do not have access to this account.");

        var allCategories = await _unitOfWork.Categories.GetCategoriesByUserIdAsync(userId, cancellationToken);
        var currency = account.Currency;

        string[] lines;
        using (var reader = new StreamReader(request.FileStream, Encoding.UTF8))
        {
            var content = await reader.ReadToEndAsync(cancellationToken);
            lines = content.Split('\n', StringSplitOptions.None);
        }

        var result = new ImportResult { Currency = currency };
        var transactionsToAdd = new List<Transaction>();
        var startIndex = request.HasHeaderRow ? 1 : 0;

        for (int i = startIndex; i < lines.Length; i++)
        {
            var line = lines[i].Trim();
            if (string.IsNullOrEmpty(line))
                continue;

            var rowNumber = i + 1;
            var columns = ParseCsvLine(line);

            if (columns.Length <= Math.Max(request.DateColumn, Math.Max(request.DescriptionColumn, Math.Max(request.AmountColumn, request.TypeColumn))))
            {
                result.Errors.Add(new ImportError { RowNumber = rowNumber, Message = "Row has fewer columns than expected." });
                result.SkippedCount++;
                continue;
            }

            var dateStr = columns[request.DateColumn].Trim();
            var descStr = columns[request.DescriptionColumn].Trim();
            var amountStr = columns[request.AmountColumn].Trim();
            var typeStr = columns[request.TypeColumn].Trim();
            var categoryStr = request.CategoryColumn.HasValue ? columns[request.CategoryColumn.Value].Trim() : null;

            if (!DateTime.TryParse(dateStr, CultureInfo.InvariantCulture, DateTimeStyles.None, out var date))
            {
                result.Errors.Add(new ImportError { RowNumber = rowNumber, Message = $"Invalid date '{dateStr}'." });
                result.SkippedCount++;
                continue;
            }

            if (string.IsNullOrEmpty(descStr))
                descStr = "Imported transaction";

            if (!decimal.TryParse(amountStr, NumberStyles.Any, CultureInfo.InvariantCulture, out var amount) || amount <= 0)
            {
                result.Errors.Add(new ImportError { RowNumber = rowNumber, Message = $"Invalid amount '{amountStr}'." });
                result.SkippedCount++;
                continue;
            }

            var type = ParseTransactionType(typeStr);
            if (type == null)
            {
                result.Errors.Add(new ImportError { RowNumber = rowNumber, Message = $"Invalid type '{typeStr}'. Use 'income', 'expense', '0', or '1'." });
                result.SkippedCount++;
                continue;
            }

            int? categoryId = null;
            if (!string.IsNullOrEmpty(categoryStr))
            {
                var matched = allCategories.FirstOrDefault(c =>
                    string.Equals(c.Name, categoryStr, StringComparison.OrdinalIgnoreCase));
                if (matched != null)
                    categoryId = matched.Id;
            }

            transactionsToAdd.Add(new Transaction
            {
                Amount = amount,
                Currency = currency,
                Type = type.Value,
                Date = date,
                Payee = descStr,
                Note = $"Imported from {request.FileName}",
                PaymentMethod = PaymentMethod.Other,
                AccountId = request.AccountId,
                CategoryId = categoryId,
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = userId
            });
        }

        foreach (var t in transactionsToAdd)
        {
            await _unitOfWork.Transactions.AddAsync(t, cancellationToken);
        }

        account.Balance += transactionsToAdd.Sum(t =>
            t.Type == TransactionType.Income ? t.Amount : -t.Amount);
        await _unitOfWork.Accounts.UpdateAsync(account, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        result.ImportedCount = transactionsToAdd.Count;
        return result;
    }

    private static string[] ParseCsvLine(string line)
    {
        var fields = new List<string>();
        var current = new StringBuilder();
        bool inQuotes = false;

        for (int i = 0; i < line.Length; i++)
        {
            var c = line[i];
            if (c == '"')
            {
                if (inQuotes && i + 1 < line.Length && line[i + 1] == '"')
                {
                    current.Append('"');
                    i++;
                }
                else
                {
                    inQuotes = !inQuotes;
                }
            }
            else if (c == ',' && !inQuotes)
            {
                fields.Add(current.ToString());
                current.Clear();
            }
            else
            {
                current.Append(c);
            }
        }
        fields.Add(current.ToString());
        return fields.ToArray();
    }

    private static TransactionType? ParseTransactionType(string value)
    {
        var lower = value.Trim().ToLowerInvariant();
        if (lower is "income" or "0") return TransactionType.Income;
        if (lower is "expense" or "1") return TransactionType.Expense;
        if (lower is "transfer" or "2") return TransactionType.Transfer;
        return null;
    }
}
