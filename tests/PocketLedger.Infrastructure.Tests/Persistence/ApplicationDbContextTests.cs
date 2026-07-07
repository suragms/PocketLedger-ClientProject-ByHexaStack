using Microsoft.EntityFrameworkCore;
using PocketLedger.Domain.Entities;
using PocketLedger.Infrastructure.Persistence;
using Xunit;

namespace PocketLedger.Infrastructure.Tests.Persistence;

public class ApplicationDbContextTests
{
    private DbContextOptions<ApplicationDbContext> CreateInMemoryOptions()
    {
        return new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
    }

    [Fact]
    public async Task Should_Save_And_Retrieve_Category()
    {
        using var context = new ApplicationDbContext(CreateInMemoryOptions());
        var category = new Category
        {
            Name = "Groceries",
            Type = Domain.Enums.CategoryType.Expense,
            Icon = "shopping-cart",
            Color = "#FF5722",
            UserId = "user-1"
        };

        context.Categories.Add(category);
        await context.SaveChangesAsync();

        var result = await context.Categories.FirstAsync(c => c.Name == "Groceries");
        Assert.Equal("Groceries", result.Name);
        Assert.Equal(Domain.Enums.CategoryType.Expense, result.Type);
        Assert.NotEqual(DateTime.MinValue, result.CreatedAt);
    }

    [Fact]
    public async Task Should_Save_And_Retrieve_Account()
    {
        using var context = new ApplicationDbContext(CreateInMemoryOptions());
        var account = new Account
        {
            Name = "Checking",
            Balance = 1000,
            Currency = "USD",
            Type = Domain.Enums.AccountType.Personal,
            UserId = "user-1"
        };

        context.Accounts.Add(account);
        await context.SaveChangesAsync();

        var result = await context.Accounts.FirstAsync(a => a.Name == "Checking");
        Assert.Equal(1000, result.Balance);
        Assert.Equal("USD", result.Currency);
    }

    [Fact]
    public async Task Should_Save_And_Retrieve_Transaction()
    {
        using var context = new ApplicationDbContext(CreateInMemoryOptions());
        var account = new Account
        {
            Name = "Checking",
            Balance = 1000,
            Currency = "USD",
            Type = Domain.Enums.AccountType.Personal,
            UserId = "user-1"
        };
        context.Accounts.Add(account);
        await context.SaveChangesAsync();

        var transaction = new Transaction
        {
            Amount = 50.25m,
            Currency = "USD",
            Type = Domain.Enums.TransactionType.Expense,
            Date = DateTime.UtcNow,
            AccountId = account.Id,
            UserId = "user-1"
        };

        context.Transactions.Add(transaction);
        await context.SaveChangesAsync();

        var result = await context.Transactions.FirstAsync(t => t.Amount == 50.25m);
        Assert.Equal(50.25m, result.Amount);
        Assert.Equal(Domain.Enums.TransactionType.Expense, result.Type);
    }

    [Fact]
    public async Task Should_Save_And_Retrieve_Budget()
    {
        using var context = new ApplicationDbContext(CreateInMemoryOptions());
        var budget = new Budget
        {
            Name = "Food Budget",
            Amount = 400,
            Currency = "USD",
            Period = Domain.Enums.BudgetPeriod.Monthly,
            StartDate = DateTime.UtcNow,
            UserId = "user-1"
        };

        context.Budgets.Add(budget);
        await context.SaveChangesAsync();

        var result = await context.Budgets.FirstAsync(b => b.Name == "Food Budget");
        Assert.Equal(400, result.Amount);
        Assert.Equal(Domain.Enums.BudgetPeriod.Monthly, result.Period);
    }

    [Fact]
    public async Task Should_Set_CreatedAt_On_Add()
    {
        using var context = new ApplicationDbContext(CreateInMemoryOptions());
        var category = new Category
        {
            Name = "Test",
            Type = Domain.Enums.CategoryType.Expense,
            UserId = "user-1"
        };

        context.Categories.Add(category);
        await context.SaveChangesAsync();

        Assert.NotEqual(DateTime.MinValue, category.CreatedAt);
        Assert.True(category.CreatedAt <= DateTime.UtcNow);
    }

    [Fact]
    public async Task Should_Set_UpdatedAt_On_Modify()
    {
        using var context = new ApplicationDbContext(CreateInMemoryOptions());
        var category = new Category
        {
            Name = "Original",
            Type = Domain.Enums.CategoryType.Expense,
            UserId = "user-1"
        };

        context.Categories.Add(category);
        await context.SaveChangesAsync();

        var id = category.Id;
        context.Categories.Update(category);
        category.Name = "Updated";
        await context.SaveChangesAsync();

        var result = await context.Categories.FindAsync(id);
        Assert.Equal("Updated", result!.Name);
        Assert.True(result.UpdatedAt >= category.CreatedAt);
    }

    [Fact]
    public async Task Should_Have_DbSet_For_All_Entities()
    {
        using var context = new ApplicationDbContext(CreateInMemoryOptions());

        Assert.NotNull(context.Accounts);
        Assert.NotNull(context.Transactions);
        Assert.NotNull(context.Categories);
        Assert.NotNull(context.Budgets);
        Assert.NotNull(context.Tags);
        Assert.NotNull(context.TransactionTags);
        Assert.NotNull(context.RecurringTransactions);
        Assert.NotNull(context.UserPasskeys);
        Assert.NotNull(context.Notifications);
        Assert.NotNull(context.NotificationPreferences);
        Assert.NotNull(context.UserSettings);
        Assert.NotNull(context.AuditLogs);
    }
}
