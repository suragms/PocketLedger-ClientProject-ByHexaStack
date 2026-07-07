===============================================================================
 PocketLedger - Stored Procedures
 Optimized queries for common operations
===============================================================================

USE PocketLedger;
GO

-- ============================================================================
-- 1. sp_GetDashboardSummary - Complete dashboard data in one call
-- ============================================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetDashboardSummary')
    DROP PROCEDURE [dbo].[sp_GetDashboardSummary];
GO

CREATE PROCEDURE [dbo].[sp_GetDashboardSummary]
    @UserId NVARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON;

    -- Account summaries
    SELECT
        a.Id AS Id,
        a.Name AS Name,
        a.Balance AS Balance,
        a.Currency AS Currency,
        a.Color AS Color,
        a.Type AS [Type],
        CASE a.Type
            WHEN 0 THEN 'Personal' WHEN 1 THEN 'Savings' WHEN 2 THEN 'Credit Card'
            WHEN 3 THEN 'Cash' WHEN 4 THEN 'Investment' WHEN 5 THEN 'Loan'
            WHEN 6 THEN 'Other' WHEN 7 THEN 'Business' WHEN 8 THEN 'Custom'
        END AS TypeName,
        ISNULL(tx.TransactionCount, 0) AS TransactionCount,
        ISNULL(tx.TotalIncome, 0) AS TotalIncome,
        ISNULL(tx.TotalExpenses, 0) AS TotalExpenses,
        tx.LastTransactionDate
    FROM [dbo].[Accounts] a
    LEFT JOIN (
        SELECT
            AccountId,
            COUNT(*) AS TransactionCount,
            SUM(CASE WHEN Type = 0 THEN Amount ELSE 0 END) AS TotalIncome,
            SUM(CASE WHEN Type = 1 THEN Amount ELSE 0 END) AS TotalExpenses,
            MAX(Date) AS LastTransactionDate
        FROM [dbo].[Transactions]
        WHERE IsDeleted = 0
        GROUP BY AccountId
    ) tx ON a.Id = tx.AccountId
    WHERE a.UserId = @UserId AND a.IsDeleted = 0
    ORDER BY a.DisplayOrder;

    -- Recent transactions (top 10)
    SELECT TOP 10
        t.Id, t.Amount, t.Currency, t.Type, t.Date, t.Payee, t.Note,
        a.Name AS AccountName, a.Color AS AccountColor,
        c.Name AS CategoryName, c.Color AS CategoryColor, c.Icon AS CategoryIcon
    FROM [dbo].[Transactions] t
    INNER JOIN [dbo].[Accounts] a ON t.AccountId = a.Id
    LEFT JOIN [dbo].[Categories] c ON t.CategoryId = c.Id
    WHERE t.UserId = @UserId AND t.IsDeleted = 0
    ORDER BY t.Date DESC;

    -- Budget progress
    SELECT TOP 5
        b.Id, b.Name, b.Amount,
        ISNULL(spent.TotalSpent, 0) AS SpentAmount,
        b.Amount - ISNULL(spent.TotalSpent, 0) AS RemainingAmount,
        CASE WHEN b.Amount > 0 THEN (ISNULL(spent.TotalSpent, 0) / b.Amount) * 100 ELSE 0 END AS PercentUsed,
        c.Name AS CategoryName,
        CASE
            WHEN ISNULL(spent.TotalSpent, 0) > b.Amount THEN 1
            WHEN b.AlertThreshold IS NOT NULL AND (ISNULL(spent.TotalSpent, 0) / b.Amount) * 100 >= b.AlertThreshold THEN 1
            ELSE 0
        END AS IsOverBudget
    FROM [dbo].[Budgets] b
    LEFT JOIN [dbo].[Categories] c ON b.CategoryId = c.Id
    LEFT JOIN (
        SELECT
            t.CategoryId,
            SUM(t.Amount) AS TotalSpent
        FROM [dbo].[Transactions] t
        WHERE t.UserId = @UserId AND t.Type = 1 AND t.IsDeleted = 0
        GROUP BY t.CategoryId
    ) spent ON b.CategoryId = spent.CategoryId
    WHERE b.UserId = @UserId AND b.IsActive = 1 AND b.IsDeleted = 0;

    -- Top spending categories (current month)
    SELECT TOP 7
        c.Id AS CategoryId,
        c.Name AS CategoryName,
        c.Color,
        SUM(t.Amount) AS Amount,
        CASE
            WHEN total.TotalMonthExpense > 0
            THEN (SUM(t.Amount) / total.TotalMonthExpense) * 100
            ELSE 0
        END AS Percentage
    FROM [dbo].[Transactions] t
    INNER JOIN [dbo].[Categories] c ON t.CategoryId = c.Id
    CROSS JOIN (
        SELECT SUM(Amount) AS TotalMonthExpense
        FROM [dbo].[Transactions]
        WHERE UserId = @UserId AND Type = 1 AND IsDeleted = 0
            AND Date >= DATEFROMPARTS(YEAR(GETUTCDATE()), MONTH(GETUTCDATE()), 1)
    ) total
    WHERE t.UserId = @UserId AND t.Type = 1 AND t.IsDeleted = 0
        AND t.Date >= DATEFROMPARTS(YEAR(GETUTCDATE()), MONTH(GETUTCDATE()), 1)
    GROUP BY c.Id, c.Name, c.Color, total.TotalMonthExpense
    ORDER BY SUM(t.Amount) DESC;
END
GO

-- ============================================================================
-- 2. sp_GetWalletStatistics - Detailed wallet stats
-- ============================================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetWalletStatistics')
    DROP PROCEDURE [dbo].[sp_GetWalletStatistics];
GO

CREATE PROCEDURE [dbo].[sp_GetWalletStatistics]
    @UserId NVARCHAR(128),
    @AccountId INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Main stats
    SELECT
        a.Id AS AccountId,
        a.Name AS AccountName,
        a.Balance,
        a.Currency,
        ISNULL(s.TotalTransactions, 0) AS TotalTransactions,
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
    WHERE a.Id = @AccountId AND a.UserId = @UserId AND a.IsDeleted = 0;

    -- Monthly breakdown (last 6 months)
    SELECT
        FORMAT(Date, 'yyyy-MM') AS [Month],
        SUM(CASE WHEN Type = 0 THEN Amount ELSE 0 END) AS Income,
        SUM(CASE WHEN Type = 1 THEN Amount ELSE 0 END) AS Expense,
        SUM(CASE WHEN Type = 0 THEN Amount WHEN Type = 1 THEN -Amount ELSE 0 END) AS Net
    FROM [dbo].[Transactions]
    WHERE AccountId = @AccountId AND UserId = @UserId AND IsDeleted = 0
        AND Date >= DATEADD(MONTH, -6, GETUTCDATE())
    GROUP BY FORMAT(Date, 'yyyy-MM')
    ORDER BY [Month];

    -- Top categories
    SELECT TOP 5
        c.Id AS CategoryId,
        c.Name AS CategoryName,
        c.Color,
        SUM(t.Amount) AS Amount,
        CASE
            WHEN total.TotalAmount > 0
            THEN (SUM(t.Amount) / total.TotalAmount) * 100
            ELSE 0
        END AS Percentage,
        COUNT(*) AS TransactionCount
    FROM [dbo].[Transactions] t
    INNER JOIN [dbo].[Categories] c ON t.CategoryId = c.Id
    CROSS JOIN (
        SELECT SUM(Amount) AS TotalAmount
        FROM [dbo].[Transactions]
        WHERE AccountId = @AccountId AND UserId = @UserId AND Type = 1 AND IsDeleted = 0
    ) total
    WHERE t.AccountId = @AccountId AND t.UserId = @UserId AND t.Type = 1 AND t.IsDeleted = 0
    GROUP BY c.Id, c.Name, c.Color, total.TotalAmount
    ORDER BY SUM(t.Amount) DESC;
END
GO

-- ============================================================================
-- 3. sp_GetMonthlyReport - Monthly financial report
-- ============================================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetMonthlyReport')
    DROP PROCEDURE [dbo].[sp_GetMonthlyReport];
GO

CREATE PROCEDURE [dbo].[sp_GetMonthlyReport]
    @UserId NVARCHAR(128),
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @StartDate IS NULL SET @StartDate = DATEFROMPARTS(YEAR(GETUTCDATE()), MONTH(GETUTCDATE()), 1);
    IF @EndDate IS NULL SET @EndDate = EOMONTH(GETUTCDATE());

    -- Monthly summary
    SELECT
        SUM(CASE WHEN Type = 0 THEN Amount ELSE 0 END) AS TotalIncome,
        SUM(CASE WHEN Type = 1 THEN Amount ELSE 0 END) AS TotalExpense,
        SUM(CASE WHEN Type = 0 THEN Amount WHEN Type = 1 THEN -Amount ELSE 0 END) AS NetIncome,
        COUNT(*) AS TransactionCount,
        CASE
            WHEN SUM(CASE WHEN Type = 0 THEN Amount ELSE 0 END) > 0
            THEN ((SUM(CASE WHEN Type = 0 THEN Amount ELSE 0 END) - SUM(CASE WHEN Type = 1 THEN Amount ELSE 0 END))
                  / SUM(CASE WHEN Type = 0 THEN Amount ELSE 0 END)) * 100
            ELSE 0
        END AS SavingsRate
    FROM [dbo].[Transactions]
    WHERE UserId = @UserId AND IsDeleted = 0
        AND CAST(Date AS DATE) BETWEEN @StartDate AND @EndDate;

    -- Category breakdown
    SELECT
        c.Id AS CategoryId,
        c.Name AS CategoryName,
        c.Color,
        SUM(t.Amount) AS Amount,
        CASE
            WHEN total.TotalExpense > 0
            THEN (SUM(t.Amount) / total.TotalExpense) * 100
            ELSE 0
        END AS Percentage,
        COUNT(*) AS TransactionCount
    FROM [dbo].[Transactions] t
    INNER JOIN [dbo].[Categories] c ON t.CategoryId = c.Id
    CROSS JOIN (
        SELECT SUM(Amount) AS TotalExpense
        FROM [dbo].[Transactions]
        WHERE UserId = @UserId AND Type = 1 AND IsDeleted = 0
            AND CAST(Date AS DATE) BETWEEN @StartDate AND @EndDate
    ) total
    WHERE t.UserId = @UserId AND t.Type = 1 AND t.IsDeleted = 0
        AND CAST(t.Date AS DATE) BETWEEN @StartDate AND @EndDate
    GROUP BY c.Id, c.Name, c.Color, total.TotalExpense
    ORDER BY SUM(t.Amount) DESC;

    -- Daily trend
    SELECT
        CAST(Date AS DATE) AS [Day],
        SUM(CASE WHEN Type = 0 THEN Amount ELSE 0 END) AS Income,
        SUM(CASE WHEN Type = 1 THEN Amount ELSE 0 END) AS Expense
    FROM [dbo].[Transactions]
    WHERE UserId = @UserId AND IsDeleted = 0
        AND CAST(Date AS DATE) BETWEEN @StartDate AND @EndDate
    GROUP BY CAST(Date AS DATE)
    ORDER BY [Day];
END
GO

-- ============================================================================
-- 4. sp_GetBudgetAnalytics - Budget analytics
-- ============================================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetBudgetAnalytics')
    DROP PROCEDURE [dbo].[sp_GetBudgetAnalytics];
GO

CREATE PROCEDURE [dbo].[sp_GetBudgetAnalytics]
    @UserId NVARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON;

    -- Overall summary
    SELECT
        SUM(b.Amount) AS TotalBudgeted,
        ISNULL(SUM(spent.TotalSpent), 0) AS TotalSpent,
        SUM(b.Amount) - ISNULL(SUM(spent.TotalSpent), 0) AS TotalRemaining,
        CASE
            WHEN SUM(b.Amount) > 0
            THEN (ISNULL(SUM(spent.TotalSpent), 0) / SUM(b.Amount)) * 100
            ELSE 0
        END AS OverallPercentUsed,
        COUNT(*) AS ActiveBudgets,
        SUM(CASE WHEN ISNULL(spent.TotalSpent, 0) > b.Amount THEN 1 ELSE 0 END) AS OverBudgetCount,
        SUM(CASE WHEN b.AlertThreshold IS NOT NULL AND (ISNULL(spent.TotalSpent, 0) / b.Amount) * 100 >= b.AlertThreshold AND ISNULL(spent.TotalSpent, 0) <= b.Amount THEN 1 ELSE 0 END) AS NearLimitCount
    FROM [dbo].[Budgets] b
    LEFT JOIN (
        SELECT
            COALESCE(b2.CategoryId, t.CategoryId) AS CategoryId,
            SUM(t.Amount) AS TotalSpent
        FROM [dbo].[Transactions] t
        INNER JOIN [dbo].[Budgets] b2 ON t.UserId = b2.UserId
            AND (b2.CategoryId IS NULL OR b2.CategoryId = t.CategoryId)
        WHERE t.UserId = @UserId AND t.Type = 1 AND t.IsDeleted = 0
        GROUP BY COALESCE(b2.CategoryId, t.CategoryId)
    ) spent ON b.CategoryId = spent.CategoryId OR (b.CategoryId IS NULL AND spent.CategoryId IS NULL)
    WHERE b.UserId = @UserId AND b.IsActive = 1 AND b.IsDeleted = 0;

    -- Per-budget breakdown
    SELECT
        b.Id, b.Name, b.Amount AS BudgetAmount, b.Currency, b.Period,
        b.StartDate, b.AlertThreshold,
        ISNULL(spent.TotalSpent, 0) AS SpentAmount,
        b.Amount - ISNULL(spent.TotalSpent, 0) AS RemainingAmount,
        CASE WHEN b.Amount > 0 THEN (ISNULL(spent.TotalSpent, 0) / b.Amount) * 100 ELSE 0 END AS PercentUsed,
        c.Name AS CategoryName,
        c.Color AS CategoryColor,
        CASE
            WHEN ISNULL(spent.TotalSpent, 0) > b.Amount THEN 'OverBudget'
            WHEN b.AlertThreshold IS NOT NULL AND (ISNULL(spent.TotalSpent, 0) / b.Amount) * 100 >= b.AlertThreshold THEN 'NearLimit'
            ELSE 'OnTrack'
        END AS Status
    FROM [dbo].[Budgets] b
    LEFT JOIN [dbo].[Categories] c ON b.CategoryId = c.Id
    LEFT JOIN (
        SELECT CategoryId, SUM(Amount) AS TotalSpent
        FROM [dbo].[Transactions]
        WHERE UserId = @UserId AND Type = 1 AND IsDeleted = 0
        GROUP BY CategoryId
    ) spent ON b.CategoryId = spent.CategoryId
    WHERE b.UserId = @UserId AND b.IsActive = 1 AND b.IsDeleted = 0;

    -- Daily spending for current period
    SELECT
        CAST(t.Date AS DATE) AS [Date],
        SUM(t.Amount) AS Amount
    FROM [dbo].[Transactions] t
    INNER JOIN [dbo].[Budgets] b ON t.UserId = b.UserId
        AND (b.CategoryId IS NULL OR b.CategoryId = t.CategoryId)
    WHERE t.UserId = @UserId AND t.Type = 1 AND t.IsDeleted = 0
        AND b.IsActive = 1 AND b.IsDeleted = 0
        AND t.Date >= b.StartDate
    GROUP BY CAST(t.Date AS DATE)
    ORDER BY [Date];
END
GO

-- ============================================================================
-- 5. sp_GetAdminDashboardStats - Admin dashboard
-- ============================================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetAdminDashboardStats')
    DROP PROCEDURE [dbo].[sp_GetAdminDashboardStats];
GO

CREATE PROCEDURE [dbo].[sp_GetAdminDashboardStats]
AS
BEGIN
    SET NOCOUNT ON;

    -- Summary stats
    SELECT
        (SELECT COUNT(*) FROM [dbo].[AspNetUsers]) AS TotalUsers,
        (SELECT COUNT(*) FROM [dbo].[AspNetUsers] WHERE IsActive = 1) AS ActiveUsers,
        (SELECT COUNT(*) FROM [dbo].[AspNetUsers] WHERE CAST(CreatedAt AS DATE) = CAST(SYSUTCDATETIME() AS DATE)) AS NewUsersToday,
        (SELECT COUNT(*) FROM [dbo].[Transactions] WHERE IsDeleted = 0) AS TotalTransactions,
        (SELECT ISNULL(SUM(Amount), 0) FROM [dbo].[Transactions] WHERE IsDeleted = 0) AS TotalVolume,
        (SELECT COUNT(*) FROM [dbo].[Categories] WHERE IsDeleted = 0) AS TotalCategories,
        (SELECT COUNT(*) FROM [dbo].[Accounts] WHERE IsDeleted = 0) AS TotalWallets,
        (SELECT COUNT(*) FROM [dbo].[Budgets] WHERE IsDeleted = 0) AS TotalBudgets,
        (SELECT COUNT(*) FROM [dbo].[Notifications]) AS TotalNotifications,
        (SELECT COUNT(*) FROM [dbo].[AuditLogs]) AS AuditLogCount;

    -- Daily stats (last 7 days)
    SELECT
        CAST(CreatedAt AS DATE) AS [Date],
        COUNT(*) AS Users,
        0 AS Transactions,
        0 AS Volume
    FROM [dbo].[AspNetUsers]
    WHERE CreatedAt >= DATEADD(DAY, -7, GETUTCDATE())
    GROUP BY CAST(CreatedAt AS DATE)
    ORDER BY [Date];

    -- Top users by transaction count
    SELECT TOP 10
        u.Id AS Id,
        u.Email,
        u.FirstName + ' ' + u.LastName AS [Name],
        COUNT(t.Id) AS TransactionCount,
        ISNULL(SUM(t.Amount), 0) AS TotalVolume
    FROM [dbo].[AspNetUsers] u
    LEFT JOIN [dbo].[Transactions] t ON u.Id = t.UserId AND t.IsDeleted = 0
    GROUP BY u.Id, u.Email, u.FirstName, u.LastName
    ORDER BY COUNT(t.Id) DESC;
END
GO

-- ============================================================================
-- 6. sp_RebuildIndexes - Maintenance procedure
-- ============================================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_RebuildIndexes')
    DROP PROCEDURE [dbo].[sp_RebuildIndexes];
GO

CREATE PROCEDURE [dbo].[sp_RebuildIndexes]
    @SchemaName NVARCHAR(128) = 'dbo',
    @TableName NVARCHAR(128) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @SQL NVARCHAR(MAX) = '';

    SELECT @SQL = @SQL + 'ALTER INDEX ' + QUOTENAME(i.name) + ' ON '
        + QUOTENAME(s.name) + '.' + QUOTENAME(t.name) + ' REBUILD;'
        + CHAR(13)
    FROM sys.indexes i
    INNER JOIN sys.tables t ON i.object_id = t.object_id
    INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
    WHERE i.index_id > 0
        AND i.is_disabled = 0
        AND s.name = @SchemaName
        AND (@TableName IS NULL OR t.name = @TableName)
        AND t.is_ms_shipped = 0;

    IF @SQL <> ''
    BEGIN
        EXEC sp_executesql @SQL;
        PRINT 'Indexes rebuilt successfully.';
    END
    ELSE
        PRINT 'No indexes found to rebuild.';
END
GO

-- ============================================================================
-- 7. sp_CleanupOldSystemLogs - Log retention
-- ============================================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_CleanupOldSystemLogs')
    DROP PROCEDURE [dbo].[sp_CleanupOldSystemLogs];
GO

CREATE PROCEDURE [dbo].[sp_CleanupOldSystemLogs]
    @RetentionDays INT = 90
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @DeletedCount INT;

    DELETE FROM [dbo].[SystemLogs]
    WHERE [Timestamp] < DATEADD(DAY, -@RetentionDays, SYSUTCDATETIME());

    SET @DeletedCount = @@ROWCOUNT;
    PRINT CONCAT('Deleted ', @DeletedCount, ' system log entries older than ', @RetentionDays, ' days.');
END
GO

-- ============================================================================
-- 8. sp_ExportUserData - Export all user data (GDPR)
-- ============================================================================
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_ExportUserData')
    DROP PROCEDURE [dbo].[sp_ExportUserData];
GO

CREATE PROCEDURE [dbo].[sp_ExportUserData]
    @UserId NVARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON;

    -- User profile
    SELECT 'Profile' AS DataType, u.Email, u.FirstName, u.LastName, u.AvatarUrl,
           u.DefaultCurrency, u.CreatedAt, u.LastLoginAt
    FROM [dbo].[AspNetUsers] u
    WHERE u.Id = @UserId;

    -- Accounts
    SELECT 'Accounts' AS DataType, *
    FROM [dbo].[Accounts]
    WHERE UserId = @UserId AND IsDeleted = 0;

    -- Transactions
    SELECT 'Transactions' AS DataType, *
    FROM [dbo].[Transactions]
    WHERE UserId = @UserId AND IsDeleted = 0;

    -- Categories
    SELECT 'Categories' AS DataType, *
    FROM [dbo].[Categories]
    WHERE UserId = @UserId AND IsDeleted = 0;

    -- Budgets
    SELECT 'Budgets' AS DataType, *
    FROM [dbo].[Budgets]
    WHERE UserId = @UserId AND IsDeleted = 0;

    -- Tags
    SELECT 'Tags' AS DataType, *
    FROM [dbo].[Tags]
    WHERE UserId = @UserId AND IsDeleted = 0;

    -- Notifications
    SELECT 'Notifications' AS DataType, *
    FROM [dbo].[Notifications]
    WHERE UserId = @UserId;

    -- Settings
    SELECT 'Settings' AS DataType, *
    FROM [dbo].[UserSettings]
    WHERE UserId = @UserId;
END
GO

PRINT 'Stored procedures created successfully.';
GO
