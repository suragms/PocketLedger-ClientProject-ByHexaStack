===============================================================================
 PocketLedger - Reporting Views
 Pre-built queries for Dashboard, Reports, and Admin
===============================================================================

USE PocketLedger;
GO

-- ============================================================================
-- 1. vw_DashboardSummary - Main dashboard data
-- ============================================================================
IF EXISTS (SELECT * FROM sys.views WHERE name = 'vw_DashboardSummary')
    DROP VIEW [dbo].[vw_DashboardSummary];
GO

CREATE VIEW [dbo].[vw_DashboardSummary]
AS
SELECT
    t.UserId,
    SUM(CASE WHEN t.Type = 0 THEN t.Amount ELSE 0 END) AS TotalIncome,
    SUM(CASE WHEN t.Type = 1 THEN t.Amount ELSE 0 END) AS TotalExpense,
    SUM(CASE WHEN t.Type = 0 THEN t.Amount WHEN t.Type = 1 THEN -t.Amount ELSE 0 END) AS NetIncome,
    COUNT(*) AS TotalTransactions,
    SUM(CASE WHEN t.Date >= DATEFROMPARTS(YEAR(GETUTCDATE()), MONTH(GETUTCDATE()), 1)
              THEN CASE WHEN t.Type = 0 THEN t.Amount ELSE 0 END ELSE 0 END) AS MonthlyIncome,
    SUM(CASE WHEN t.Date >= DATEFROMPARTS(YEAR(GETUTCDATE()), MONTH(GETUTCDATE()), 1)
              THEN CASE WHEN t.Type = 1 THEN t.Amount ELSE 0 END ELSE 0 END) AS MonthlyExpenses
FROM [dbo].[Transactions] t
WHERE t.IsDeleted = 0
GROUP BY t.UserId;
GO

-- ============================================================================
-- 2. vw_AccountBalances - Real-time account balances
-- ============================================================================
IF EXISTS (SELECT * FROM sys.views WHERE name = 'vw_AccountBalances')
    DROP VIEW [dbo].[vw_AccountBalances];
GO

CREATE VIEW [dbo].[vw_AccountBalances]
AS
SELECT
    a.Id AS AccountId,
    a.UserId,
    a.Name AS AccountName,
    a.Type AS AccountType,
    a.Currency,
    a.Color,
    a.IncludeInBalance,
    a.Balance AS DeclaredBalance,
    ISNULL(inc.TotalIncome, 0) AS TotalIncome,
    ISNULL(exp.TotalExpenses, 0) AS TotalExpenses,
    a.Balance + ISNULL(inc.TotalIncome, 0) - ISNULL(exp.TotalExpenses, 0) AS CalculatedBalance,
    ISNULL(tx.TransactionCount, 0) AS TransactionCount,
    tx.LastTransactionDate
FROM [dbo].[Accounts] a
LEFT JOIN (
    SELECT AccountId, SUM(Amount) AS TotalIncome
    FROM [dbo].[Transactions]
    WHERE Type = 0 AND IsDeleted = 0
    GROUP BY AccountId
) inc ON a.Id = inc.AccountId
LEFT JOIN (
    SELECT AccountId, SUM(Amount) AS TotalExpenses
    FROM [dbo].[Transactions]
    WHERE Type = 1 AND IsDeleted = 0
    GROUP BY AccountId
) exp ON a.Id = exp.AccountId
LEFT JOIN (
    SELECT AccountId, COUNT(*) AS TransactionCount, MAX(Date) AS LastTransactionDate
    FROM [dbo].[Transactions]
    WHERE IsDeleted = 0
    GROUP BY AccountId
) tx ON a.Id = tx.AccountId
WHERE a.IsDeleted = 0;
GO

-- ============================================================================
-- 3. vw_CategorySpending - Category spending analysis
-- ============================================================================
IF EXISTS (SELECT * FROM sys.views WHERE name = 'vw_CategorySpending')
    DROP VIEW [dbo].[vw_CategorySpending];
GO

CREATE VIEW [dbo].[vw_CategorySpending]
AS
SELECT
    t.UserId,
    t.CategoryId,
    c.Name AS CategoryName,
    c.Color AS CategoryColor,
    c.Icon AS CategoryIcon,
    t.Type AS TransactionType,
    SUM(t.Amount) AS TotalAmount,
    COUNT(*) AS TransactionCount,
    AVG(t.Amount) AS AverageAmount,
    MIN(t.Date) AS FirstTransactionDate,
    MAX(t.Date) AS LastTransactionDate
FROM [dbo].[Transactions] t
INNER JOIN [dbo].[Categories] c ON t.CategoryId = c.Id
WHERE t.IsDeleted = 0 AND c.IsDeleted = 0
GROUP BY t.UserId, t.CategoryId, c.Name, c.Color, c.Icon, t.Type;
GO

-- ============================================================================
-- 4. vw_MonthlyReport - Monthly financial report
-- ============================================================================
IF EXISTS (SELECT * FROM sys.views WHERE name = 'vw_MonthlyReport')
    DROP VIEW [dbo].[vw_MonthlyReport];
GO

CREATE VIEW [dbo].[vw_MonthlyReport]
AS
SELECT
    UserId,
    FORMAT(Date, 'yyyy-MM') AS Month,
    SUM(CASE WHEN Type = 0 THEN Amount ELSE 0 END) AS Income,
    SUM(CASE WHEN Type = 1 THEN Amount ELSE 0 END) AS Expense,
    SUM(CASE WHEN Type = 0 THEN Amount WHEN Type = 1 THEN -Amount ELSE 0 END) AS Net,
    COUNT(*) AS TransactionCount,
    CASE
        WHEN SUM(CASE WHEN Type = 0 THEN Amount ELSE 0 END) > 0
        THEN (SUM(CASE WHEN Type = 1 THEN Amount ELSE 0 END) /
              SUM(CASE WHEN Type = 0 THEN Amount ELSE 0 END)) * 100
        ELSE 0
    END AS ExpenseToIncomeRatio
FROM [dbo].[Transactions]
WHERE IsDeleted = 0
GROUP BY UserId, FORMAT(Date, 'yyyy-MM');
GO

-- ============================================================================
-- 5. vw_BudgetProgress - Budget spending progress
-- ============================================================================
IF EXISTS (SELECT * FROM sys.views WHERE name = 'vw_BudgetProgress')
    DROP VIEW [dbo].[vw_BudgetProgress];
GO

CREATE VIEW [dbo].[vw_BudgetProgress]
AS
SELECT
    b.Id AS BudgetId,
    b.UserId,
    b.Name AS BudgetName,
    b.Amount AS BudgetAmount,
    b.Currency,
    b.Period,
    b.StartDate,
    b.EndDate,
    b.AlertThreshold,
    b.IsActive,
    ISNULL(spent.TotalSpent, 0) AS SpentAmount,
    b.Amount - ISNULL(spent.TotalSpent, 0) AS RemainingAmount,
    CASE
        WHEN b.Amount > 0
        THEN (ISNULL(spent.TotalSpent, 0) / b.Amount) * 100
        ELSE 0
    END AS PercentUsed,
    CASE
        WHEN ISNULL(spent.TotalSpent, 0) > b.Amount THEN 'OverBudget'
        WHEN b.AlertThreshold IS NOT NULL AND (ISNULL(spent.TotalSpent, 0) / b.Amount) * 100 >= b.AlertThreshold THEN 'NearLimit'
        ELSE 'OnTrack'
    END AS Status,
    c.Name AS CategoryName,
    c.Color AS CategoryColor
FROM [dbo].[Budgets] b
LEFT JOIN [dbo].[Categories] c ON b.CategoryId = c.Id
LEFT JOIN (
    SELECT
        t.UserId,
        t.CategoryId,
        SUM(t.Amount) AS TotalSpent
    FROM [dbo].[Transactions] t
    WHERE t.Type = 1 AND t.IsDeleted = 0
    GROUP BY t.UserId, t.CategoryId
) spent ON b.UserId = spent.UserId
    AND (
        (b.CategoryId IS NOT NULL AND b.CategoryId = spent.CategoryId)
        OR (b.CategoryId IS NULL)
    )
WHERE b.IsDeleted = 0;
GO

-- ============================================================================
-- 6. vw_DailyTrend - Daily income/expense trend
-- ============================================================================
IF EXISTS (SELECT * FROM sys.views WHERE name = 'vw_DailyTrend')
    DROP VIEW [dbo].[vw_DailyTrend];
GO

CREATE VIEW [dbo].[vw_DailyTrend]
AS
SELECT
    UserId,
    CAST(Date AS DATE) AS Day,
    SUM(CASE WHEN Type = 0 THEN Amount ELSE 0 END) AS Income,
    SUM(CASE WHEN Type = 1 THEN Amount ELSE 0 END) AS Expense,
    COUNT(*) AS TransactionCount
FROM [dbo].[Transactions]
WHERE IsDeleted = 0
    AND Date >= DATEADD(DAY, -90, GETUTCDATE())
GROUP BY UserId, CAST(Date AS DATE);
GO

-- ============================================================================
-- 7. vw_WalletStatistics - Detailed wallet statistics
-- ============================================================================
IF EXISTS (SELECT * FROM sys.views WHERE name = 'vw_WalletStatistics')
    DROP VIEW [dbo].[vw_WalletStatistics];
GO

CREATE VIEW [dbo].[vw_WalletStatistics]
AS
SELECT
    a.Id AS AccountId,
    a.UserId,
    a.Name AS AccountName,
    a.Balance,
    a.Currency,
    a.Color,
    a.Type AS AccountType,
    ISNULL(s.TotalTransactions, 0) AS TotalTransactions,
    ISNULL(s.TotalIncome, 0) AS TotalIncome,
    ISNULL(s.TotalExpenses, 0) AS TotalExpenses,
    ISNULL(s.IncomeAmount, 0) AS IncomeAmount,
    ISNULL(s.ExpenseAmount, 0) AS ExpenseAmount,
    ISNULL(s.IncomeAmount, 0) - ISNULL(s.ExpenseAmount, 0) AS NetAmount,
    ISNULL(s.AverageTransactionAmount, 0) AS AverageTransactionAmount,
    ISNULL(s.HighestExpense, 0) AS HighestExpense,
    ISNULL(s.HighestIncome, 0) AS HighestIncome,
    s.FirstTransactionDate,
    s.LastTransactionDate
FROM [dbo].[Accounts] a
LEFT JOIN (
    SELECT
        AccountId,
        COUNT(*) AS TotalTransactions,
        SUM(CASE WHEN Type = 0 THEN Amount ELSE 0 END) AS TotalIncome,
        SUM(CASE WHEN Type = 1 THEN Amount ELSE 0 END) AS TotalExpenses,
        SUM(CASE WHEN Type = 0 THEN Amount ELSE 0 END) AS IncomeAmount,
        SUM(CASE WHEN Type = 1 THEN Amount ELSE 0 END) AS ExpenseAmount,
        AVG(Amount) AS AverageTransactionAmount,
        MAX(CASE WHEN Type = 1 THEN Amount ELSE 0 END) AS HighestExpense,
        MAX(CASE WHEN Type = 0 THEN Amount ELSE 0 END) AS HighestIncome,
        MIN(Date) AS FirstTransactionDate,
        MAX(Date) AS LastTransactionDate
    FROM [dbo].[Transactions]
    WHERE IsDeleted = 0
    GROUP BY AccountId
) s ON a.Id = s.AccountId
WHERE a.IsDeleted = 0;
GO

-- ============================================================================
-- 8. vw_AdminDashboard - Admin overview
-- ============================================================================
IF EXISTS (SELECT * FROM sys.views WHERE name = 'vw_AdminDashboard')
    DROP VIEW [dbo].[vw_AdminDashboard];
GO

CREATE VIEW [dbo].[vw_AdminDashboard]
AS
SELECT
    (SELECT COUNT(*) FROM [dbo].[AspNetUsers]) AS TotalUsers,
    (SELECT COUNT(*) FROM [dbo].[AspNetUsers] WHERE IsActive = 1) AS ActiveUsers,
    (SELECT COUNT(*) FROM [dbo].[AspNetUsers]
     WHERE CAST(CreatedAt AS DATE) = CAST(SYSUTCDATETIME() AS DATE)) AS NewUsersToday,
    (SELECT COUNT(*) FROM [dbo].[Transactions] WHERE IsDeleted = 0) AS TotalTransactions,
    (SELECT ISNULL(SUM(Amount), 0) FROM [dbo].[Transactions] WHERE IsDeleted = 0) AS TotalVolume,
    (SELECT COUNT(*) FROM [dbo].[Categories] WHERE IsDeleted = 0) AS TotalCategories,
    (SELECT COUNT(*) FROM [dbo].[Accounts] WHERE IsDeleted = 0) AS TotalWallets,
    (SELECT COUNT(*) FROM [dbo].[Budgets] WHERE IsDeleted = 0) AS TotalBudgets,
    (SELECT COUNT(*) FROM [dbo].[Notifications]) AS TotalNotifications,
    (SELECT COUNT(*) FROM [dbo].[AuditLogs]) AS AuditLogCount;
GO

-- ============================================================================
-- 9. vw_UserActivity - User activity report
-- ============================================================================
IF EXISTS (SELECT * FROM sys.views WHERE name = 'vw_UserActivity')
    DROP VIEW [dbo].[vw_UserActivity];
GO

CREATE VIEW [dbo].[vw_UserActivity]
AS
SELECT
    u.Id AS UserId,
    u.Email,
    u.FirstName + ' ' + u.LastName AS FullName,
    u.CreatedAt AS MemberSince,
    u.LastLoginAt,
    u.IsActive,
    ISNULL(a.AccountCount, 0) AS AccountCount,
    ISNULL(t.TransactionCount, 0) AS TransactionCount,
    ISNULL(t.TotalVolume, 0) AS TotalVolume,
    ISNULL(c.CategoryCount, 0) AS CategoryCount,
    ISNULL(b.BudgetCount, 0) AS BudgetCount
FROM [dbo].[AspNetUsers] u
LEFT JOIN (
    SELECT UserId, COUNT(*) AS AccountCount
    FROM [dbo].[Accounts] WHERE IsDeleted = 0
    GROUP BY UserId
) a ON u.Id = a.UserId
LEFT JOIN (
    SELECT UserId, COUNT(*) AS TransactionCount, SUM(Amount) AS TotalVolume
    FROM [dbo].[Transactions] WHERE IsDeleted = 0
    GROUP BY UserId
) t ON u.Id = t.UserId
LEFT JOIN (
    SELECT UserId, COUNT(*) AS CategoryCount
    FROM [dbo].[Categories] WHERE IsDeleted = 0
    GROUP BY UserId
) c ON u.Id = c.UserId
LEFT JOIN (
    SELECT UserId, COUNT(*) AS BudgetCount
    FROM [dbo].[Budgets] WHERE IsDeleted = 0
    GROUP BY UserId
) b ON u.Id = b.UserId;
GO

-- ============================================================================
-- 10. vw_WeeklyComparison - Week-over-week comparison
-- ============================================================================
IF EXISTS (SELECT * FROM sys.views WHERE name = 'vw_WeeklyComparison')
    DROP VIEW [dbo].[vw_WeeklyComparison];
GO

CREATE VIEW [dbo].[vw_WeeklyComparison]
AS
SELECT
    UserId,
    DATEPART(YEAR, Date) AS Year,
    DATEPART(WEEK, Date) AS WeekNumber,
    CONCAT(DATEPART(YEAR, Date), '-W', FORMAT(DATEPART(WEEK, Date), '00')) AS WeekLabel,
    SUM(CASE WHEN Type = 0 THEN Amount ELSE 0 END) AS Income,
    SUM(CASE WHEN Type = 1 THEN Amount ELSE 0 END) AS Expense
FROM [dbo].[Transactions]
WHERE IsDeleted = 0
    AND Date >= DATEADD(WEEK, -12, GETUTCDATE())
GROUP BY UserId, DATEPART(YEAR, Date), DATEPART(WEEK, Date);
GO

PRINT 'Views created successfully.';
GO
