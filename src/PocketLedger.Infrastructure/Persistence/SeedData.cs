using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Enums;

namespace PocketLedger.Infrastructure.Persistence;

public static class SeedData
{
    public static async Task InitializeAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<Role>>();

        if (context.Database.IsSqlite())
        {
            await context.Database.MigrateAsync();
        }
        else
        {
            await context.Database.EnsureCreatedAsync();
        }

        // Clean up duplicate "Primary Account" entries if they exist
        var primaryAccounts = await context.Accounts
            .Where(a => a.Name == "Primary Account")
            .OrderBy(a => a.Id)
            .ToListAsync();

        if (primaryAccounts.Count > 1)
        {
            var keepAccount = primaryAccounts[0];
            var duplicates = primaryAccounts.Skip(1).ToList();
            
            foreach (var duplicate in duplicates)
            {
                var transactionsToUpdate = await context.Transactions
                    .Where(t => t.AccountId == duplicate.Id)
                    .ToListAsync();
                    
                foreach (var transaction in transactionsToUpdate)
                {
                    transaction.AccountId = keepAccount.Id;
                }
            }
            
            context.Accounts.RemoveRange(duplicates);
            await context.SaveChangesAsync();
        }

        string[] roles = ["Admin", "User"];
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new Role { Name = role, Description = $"{role} role" });
        }

        // Seed Admin User (surag@admin.com)
        var adminEmail = "surag@admin.com";
        var adminUser = await userManager.FindByEmailAsync(adminEmail);
        if (adminUser == null)
        {
            var user = new User
            {
                Id = "admin-user-surag",
                UserName = adminEmail,
                Email = adminEmail,
                FirstName = "Surag",
                LastName = "Admin",
                EmailVerified = true,
                DefaultCurrency = "USD",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
            };

            var result = await userManager.CreateAsync(user, "Surag2000");
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception($"Failed to seed admin user: {errors}");
            }

            await userManager.AddToRoleAsync(user, "Admin");
            await userManager.AddToRoleAsync(user, "User");

            var categories = await SeedCategoriesAsync(context, user.Id);
            var accounts = await SeedAccountsAsync(context, user.Id);
            await SeedTransactionsAsync(context, user.Id, accounts, categories);
            await SeedBudgetsAsync(context, user.Id, categories);
        }

        await context.SaveChangesAsync();
    }

    private static async Task<Dictionary<string, Category>> SeedCategoriesAsync(
        ApplicationDbContext context, string userId)
    {
        var categories = new List<Category>
        {
            new() { Name = "Food & Dining", Description = "Restaurants, groceries, and food delivery", Icon = "utensils", Color = "#ef4444", Type = CategoryType.Expense, IsDefault = true, UserId = userId, DisplayOrder = 1 },
            new() { Name = "Transportation", Description = "Gas, public transit, rideshare, and parking", Icon = "car", Color = "#f97316", Type = CategoryType.Expense, IsDefault = true, UserId = userId, DisplayOrder = 2 },
            new() { Name = "Bills & Utilities", Description = "Electric, water, internet, and phone bills", Icon = "bolt", Color = "#eab308", Type = CategoryType.Expense, IsDefault = true, UserId = userId, DisplayOrder = 3 },
            new() { Name = "Entertainment", Description = "Movies, games, streaming, and hobbies", Icon = "film", Color = "#22c55e", Type = CategoryType.Expense, IsDefault = true, UserId = userId, DisplayOrder = 4 },
            new() { Name = "Shopping", Description = "Clothing, electronics, and general shopping", Icon = "shopping-bag", Color = "#3b82f6", Type = CategoryType.Expense, IsDefault = true, UserId = userId, DisplayOrder = 5 },
            new() { Name = "Health & Fitness", Description = "Gym, medical expenses, and wellness", Icon = "heart", Color = "#ec4899", Type = CategoryType.Expense, IsDefault = true, UserId = userId, DisplayOrder = 6 },
            new() { Name = "Education", Description = "Courses, books, and learning materials", Icon = "academic-cap", Color = "#8b5cf6", Type = CategoryType.Expense, IsDefault = true, UserId = userId, DisplayOrder = 7 },
            new() { Name = "Salary", Description = "Regular employment income", Icon = "currency-dollar", Color = "#22c55e", Type = CategoryType.Income, IsDefault = true, UserId = userId, DisplayOrder = 8 },
            new() { Name = "Freelance", Description = "Freelance and side project income", Icon = "briefcase", Color = "#14b8a6", Type = CategoryType.Income, IsDefault = true, UserId = userId, DisplayOrder = 9 },
            new() { Name = "Investments", Description = "Investment returns and dividends", Icon = "chart-bar", Color = "#06b6d4", Type = CategoryType.Income, IsDefault = true, UserId = userId, DisplayOrder = 10 },
            new() { Name = "Rent & Housing", Description = "Rent, mortgage, and home expenses", Icon = "home", Color = "#6366f1", Type = CategoryType.Expense, IsDefault = true, UserId = userId, DisplayOrder = 11 },
            new() { Name = "Personal Care", Description = "Haircuts, cosmetics, and personal hygiene", Icon = "user", Color = "#d946ef", Type = CategoryType.Expense, IsDefault = true, UserId = userId, DisplayOrder = 12 },
        };

        context.Categories.AddRange(categories);
        await context.SaveChangesAsync();

        return categories.ToDictionary(c => c.Name, c => c);
    }

    private static async Task<List<Account>> SeedAccountsAsync(
        ApplicationDbContext context, string userId)
    {
        var accounts = new List<Account>
        {
            new()
            {
                Name = "Main Checking",
                Description = "Primary checking account for daily expenses",
                Type = AccountType.Personal,
                Balance = 4250.75m,
                Currency = "USD",
                Color = "#6366f1",
                IncludeInBalance = true,
                DisplayOrder = 1,
                UserId = userId,
                CreatedAt = DateTime.UtcNow.AddDays(-90),
            },
            new()
            {
                Name = "Emergency Savings",
                Description = "Emergency fund savings account",
                Type = AccountType.Savings,
                Balance = 12500.00m,
                Currency = "USD",
                Color = "#22c55e",
                IncludeInBalance = true,
                DisplayOrder = 2,
                UserId = userId,
                CreatedAt = DateTime.UtcNow.AddDays(-90),
            },
            new()
            {
                Name = "Cash Wallet",
                Description = "Cash on hand for small purchases",
                Type = AccountType.Cash,
                Balance = 185.50m,
                Currency = "USD",
                Color = "#f97316",
                IncludeInBalance = true,
                DisplayOrder = 3,
                UserId = userId,
                CreatedAt = DateTime.UtcNow.AddDays(-90),
            },
            new()
            {
                Name = "Business Account",
                Description = "Freelance and business income",
                Type = AccountType.Business,
                Balance = 3200.00m,
                Currency = "USD",
                Color = "#8b5cf6",
                IncludeInBalance = true,
                DisplayOrder = 4,
                UserId = userId,
                CreatedAt = DateTime.UtcNow.AddDays(-60),
            },
            new()
            {
                Name = "Travel Fund",
                Description = "Savings for travel expenses",
                Type = AccountType.Custom,
                Balance = 892.30m,
                Currency = "USD",
                Color = "#06b6d4",
                IncludeInBalance = true,
                DisplayOrder = 5,
                UserId = userId,
                CreatedAt = DateTime.UtcNow.AddDays(-45),
            },
        };

        context.Accounts.AddRange(accounts);
        await context.SaveChangesAsync();
        return accounts;
    }

    private static async Task SeedTransactionsAsync(
        ApplicationDbContext context,
        string userId,
        List<Account> accounts,
        Dictionary<string, Category> categories)
    {
        var now = DateTime.UtcNow;
        var checking = accounts.First(a => a.Name == "Main Checking");
        var savings = accounts.First(a => a.Name == "Emergency Savings");
        var cash = accounts.First(a => a.Name == "Cash Wallet");
        var business = accounts.First(a => a.Name == "Business Account");

        var transactions = new List<Transaction>
        {
            // Salary (this month)
            new()
            {
                Amount = 5200.00m, Currency = "USD", Type = TransactionType.Income,
                Date = now.AddDays(-2), Payee = "Acme Corp", Note = "Monthly salary",
                PaymentMethod = PaymentMethod.BankTransfer, AccountId = checking.Id,
                CategoryId = categories["Salary"].Id, UserId = userId,
                CreatedAt = now.AddDays(-2),
            },
            // Freelance income
            new()
            {
                Amount = 750.00m, Currency = "USD", Type = TransactionType.Income,
                Date = now.AddDays(-5), Payee = "TechStart Inc", Note = "Web development project",
                PaymentMethod = PaymentMethod.BankTransfer, AccountId = checking.Id,
                CategoryId = categories["Freelance"].Id, UserId = userId,
                CreatedAt = now.AddDays(-5),
            },
            // Rent
            new()
            {
                Amount = 1400.00m, Currency = "USD", Type = TransactionType.Expense,
                Date = now.AddDays(-1), Payee = "Oakwood Apartments", Note = "Monthly rent",
                PaymentMethod = PaymentMethod.BankTransfer, AccountId = checking.Id,
                CategoryId = categories["Rent & Housing"].Id, UserId = userId,
                CreatedAt = now.AddDays(-1),
            },
            // Electric bill
            new()
            {
                Amount = 89.50m, Currency = "USD", Type = TransactionType.Expense,
                Date = now.AddDays(-3), Payee = "City Power Co", Note = "Electric bill - June",
                PaymentMethod = PaymentMethod.BankTransfer, AccountId = checking.Id,
                CategoryId = categories["Bills & Utilities"].Id, UserId = userId,
                CreatedAt = now.AddDays(-3),
            },
            // Internet bill
            new()
            {
                Amount = 65.00m, Currency = "USD", Type = TransactionType.Expense,
                Date = now.AddDays(-3), Payee = "FastNet ISP", Note = "Internet - June",
                PaymentMethod = PaymentMethod.BankTransfer, AccountId = checking.Id,
                CategoryId = categories["Bills & Utilities"].Id, UserId = userId,
                CreatedAt = now.AddDays(-3),
            },
            // Groceries
            new()
            {
                Amount = 127.34m, Currency = "USD", Type = TransactionType.Expense,
                Date = now.AddDays(-4), Payee = "Whole Foods", Note = "Weekly groceries",
                PaymentMethod = PaymentMethod.DebitCard, AccountId = checking.Id,
                CategoryId = categories["Food & Dining"].Id, UserId = userId,
                CreatedAt = now.AddDays(-4),
            },
            // Restaurant dinner
            new()
            {
                Amount = 68.50m, Currency = "USD", Type = TransactionType.Expense,
                Date = now.AddDays(-6), Payee = "Italian Bistro", Note = "Dinner with friends",
                PaymentMethod = PaymentMethod.BankTransfer, AccountId = business.Id,
                CategoryId = categories["Food & Dining"].Id, UserId = userId,
                CreatedAt = now.AddDays(-6),
            },
            // Gas
            new()
            {
                Amount = 52.30m, Currency = "USD", Type = TransactionType.Expense,
                Date = now.AddDays(-5), Payee = "Shell Gas Station", Note = "Filled up tank",
                PaymentMethod = PaymentMethod.DebitCard, AccountId = checking.Id,
                CategoryId = categories["Transportation"].Id, UserId = userId,
                CreatedAt = now.AddDays(-5),
            },
            // Netflix subscription
            new()
            {
                Amount = 15.99m, Currency = "USD", Type = TransactionType.Expense,
                Date = now.AddDays(-7), Payee = "Netflix", Note = "Monthly subscription",
                PaymentMethod = PaymentMethod.BankTransfer, AccountId = business.Id,
                CategoryId = categories["Entertainment"].Id, UserId = userId,
                CreatedAt = now.AddDays(-7),
            },
            // Spotify
            new()
            {
                Amount = 9.99m, Currency = "USD", Type = TransactionType.Expense,
                Date = now.AddDays(-7), Payee = "Spotify", Note = "Music subscription",
                PaymentMethod = PaymentMethod.BankTransfer, AccountId = business.Id,
                CategoryId = categories["Entertainment"].Id, UserId = userId,
                CreatedAt = now.AddDays(-7),
            },
            // Gym membership
            new()
            {
                Amount = 49.99m, Currency = "USD", Type = TransactionType.Expense,
                Date = now.AddDays(-10), Payee = "FitLife Gym", Note = "Monthly membership",
                PaymentMethod = PaymentMethod.DebitCard, AccountId = checking.Id,
                CategoryId = categories["Health & Fitness"].Id, UserId = userId,
                CreatedAt = now.AddDays(-10),
            },
            // Amazon shopping
            new()
            {
                Amount = 134.97m, Currency = "USD", Type = TransactionType.Expense,
                Date = now.AddDays(-8), Payee = "Amazon", Note = "Office supplies and books",
                PaymentMethod = PaymentMethod.BankTransfer, AccountId = business.Id,
                CategoryId = categories["Shopping"].Id, UserId = userId,
                CreatedAt = now.AddDays(-8),
            },
            // Coffee shop (cash)
            new()
            {
                Amount = 12.50m, Currency = "USD", Type = TransactionType.Expense,
                Date = now.AddDays(-2), Payee = "Blue Bottle Coffee", Note = "Coffee and pastry",
                PaymentMethod = PaymentMethod.Cash, AccountId = cash.Id,
                CategoryId = categories["Food & Dining"].Id, UserId = userId,
                CreatedAt = now.AddDays(-2),
            },
            // Transfer to savings
            new()
            {
                Amount = 500.00m, Currency = "USD", Type = TransactionType.Transfer,
                Date = now.AddDays(-2), Note = "Monthly savings transfer",
                PaymentMethod = PaymentMethod.BankTransfer, AccountId = checking.Id,
                UserId = userId, CreatedAt = now.AddDays(-2),
            },
            // Udemy course
            new()
            {
                Amount = 12.99m, Currency = "USD", Type = TransactionType.Expense,
                Date = now.AddDays(-12), Payee = "Udemy", Note = "React Masterclass course",
                PaymentMethod = PaymentMethod.BankTransfer, AccountId = business.Id,
                CategoryId = categories["Education"].Id, UserId = userId,
                CreatedAt = now.AddDays(-12),
            },
            // Haircut
            new()
            {
                Amount = 35.00m, Currency = "USD", Type = TransactionType.Expense,
                Date = now.AddDays(-14), Payee = "Style Studio", Note = "Haircut and styling",
                PaymentMethod = PaymentMethod.Cash, AccountId = cash.Id,
                CategoryId = categories["Personal Care"].Id, UserId = userId,
                CreatedAt = now.AddDays(-14),
            },
        };

        context.Transactions.AddRange(transactions);
        await context.SaveChangesAsync();
    }

    private static async Task SeedBudgetsAsync(
        ApplicationDbContext context,
        string userId,
        Dictionary<string, Category> categories)
    {
        var now = DateTime.UtcNow;
        var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var budgets = new List<Budget>
        {
            new()
            {
                Name = "Food & Dining",
                Amount = 400.00m,
                Currency = "USD",
                Period = BudgetPeriod.Monthly,
                StartDate = monthStart,
                AlertThreshold = 80,
                CategoryId = categories["Food & Dining"].Id,
                UserId = userId,
                CreatedAt = now.AddDays(-30),
            },
            new()
            {
                Name = "Transportation",
                Amount = 150.00m,
                Currency = "USD",
                Period = BudgetPeriod.Monthly,
                StartDate = monthStart,
                AlertThreshold = 80,
                CategoryId = categories["Transportation"].Id,
                UserId = userId,
                CreatedAt = now.AddDays(-30),
            },
            new()
            {
                Name = "Entertainment",
                Amount = 100.00m,
                Currency = "USD",
                Period = BudgetPeriod.Monthly,
                StartDate = monthStart,
                AlertThreshold = 75,
                CategoryId = categories["Entertainment"].Id,
                UserId = userId,
                CreatedAt = now.AddDays(-30),
            },
            new()
            {
                Name = "Shopping",
                Amount = 200.00m,
                Currency = "USD",
                Period = BudgetPeriod.Monthly,
                StartDate = monthStart,
                AlertThreshold = 80,
                CategoryId = categories["Shopping"].Id,
                UserId = userId,
                CreatedAt = now.AddDays(-30),
            },
            new()
            {
                Name = "Overall Monthly",
                Amount = 2500.00m,
                Currency = "USD",
                Period = BudgetPeriod.Monthly,
                StartDate = monthStart,
                AlertThreshold = 85,
                UserId = userId,
                CreatedAt = now.AddDays(-30),
            },
        };

        context.Budgets.AddRange(budgets);
        await context.SaveChangesAsync();
    }
}
