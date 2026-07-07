===============================================================================
 PocketLedger - Performance Indexes
 Composite, Covering, and Filtered Indexes
===============================================================================

USE PocketLedger;
GO

-- ============================================================================
-- 1. USER INDEXES
-- ============================================================================

-- Login lookup
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_AspNetUsers_NormalizedEmail' AND object_id = OBJECT_ID('AspNetUsers'))
    CREATE UNIQUE NONCLUSTERED INDEX [IX_AspNetUsers_NormalizedEmail]
        ON [dbo].[AspNetUsers] ([NormalizedEmail])
        WHERE [NormalizedEmail] IS NOT NULL;

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_AspNetUsers_NormalizedUserName' AND object_id = OBJECT_ID('AspNetUsers'))
    CREATE UNIQUE NONCLUSTERED INDEX [IX_AspNetUsers_NormalizedUserName]
        ON [dbo].[AspNetUsers] ([NormalizedUserName])
        WHERE [NormalizedUserName] IS NOT NULL;

-- Admin user list search
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_AspNetUsers_Email_Name' AND object_id = OBJECT_ID('AspNetUsers'))
    CREATE NONCLUSTERED INDEX [IX_AspNetUsers_Email_Name]
        ON [dbo].[AspNetUsers] ([Email], [FirstName], [LastName])
        INCLUDE ([IsActive], [CreatedAt], [LastLoginAt]);

-- Active user filter
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_AspNetUsers_IsActive' AND object_id = OBJECT_ID('AspNetUsers'))
    CREATE NONCLUSTERED INDEX [IX_AspNetUsers_IsActive]
        ON [dbo].[AspNetUsers] ([IsActive])
        INCLUDE ([Email], [FirstName], [LastName]);

-- Refresh token lookup
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_AspNetUsers_RefreshToken' AND object_id = OBJECT_ID('AspNetUsers'))
    CREATE NONCLUSTERED INDEX [IX_AspNetUsers_RefreshToken]
        ON [dbo].[AspNetUsers] ([RefreshToken])
        WHERE [RefreshToken] IS NOT NULL;

-- PIN login
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_AspNetUsers_PinLogin' AND object_id = OBJECT_ID('AspNetUsers'))
    CREATE NONCLUSTERED INDEX [IX_AspNetUsers_PinLogin]
        ON [dbo].[AspNetUsers] ([Email], [PinEnabled], [PinHash])
        INCLUDE ([FirstName], [LastName])
        WHERE [PinEnabled] = 1;

-- ============================================================================
-- 2. ACCOUNT INDEXES
-- ============================================================================

-- User accounts list (primary query pattern)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Accounts_UserId_DisplayOrder' AND object_id = OBJECT_ID('Accounts'))
    CREATE NONCLUSTERED INDEX [IX_Accounts_UserId_DisplayOrder]
        ON [dbo].[Accounts] ([UserId], [DisplayOrder])
        INCLUDE ([Name], [Type], [Balance], [Currency], [Color], [IncludeInBalance])
        WHERE [IsDeleted] = 0;

-- Account type filter
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Accounts_UserId_Type' AND object_id = OBJECT_ID('Accounts'))
    CREATE NONCLUSTERED INDEX [IX_Accounts_UserId_Type]
        ON [dbo].[Accounts] ([UserId], [Type])
        INCLUDE ([Name], [Balance], [Currency])
        WHERE [IsDeleted] = 0;

-- Admin wallet list
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Accounts_UserId_Search' AND object_id = OBJECT_ID('Accounts'))
    CREATE NONCLUSTERED INDEX [IX_Accounts_UserId_Search]
        ON [dbo].[Accounts] ([UserId])
        INCLUDE ([Name], [Description], [Type], [Balance], [Currency], [Color], [CreatedAt])
        WHERE [IsDeleted] = 0;

-- ============================================================================
-- 3. TRANSACTION INDEXES (Most Critical for Performance)
-- ============================================================================

-- Primary query: user transactions by date
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Transactions_UserId_Date' AND object_id = OBJECT_ID('Transactions'))
    CREATE NONCLUSTERED INDEX [IX_Transactions_UserId_Date]
        ON [dbo].[Transactions] ([UserId], [Date] DESC)
        INCLUDE ([Amount], [Currency], [Type], [Payee], [AccountId], [CategoryId], [PaymentMethod])
        WHERE [IsDeleted] = 0;

-- Account transactions
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Transactions_AccountId_Date' AND object_id = OBJECT_ID('Transactions'))
    CREATE NONCLUSTERED INDEX [IX_Transactions_AccountId_Date]
        ON [dbo].[Transactions] ([AccountId], [Date] DESC)
        INCLUDE ([Amount], [Type], [CategoryId])
        WHERE [IsDeleted] = 0;

-- Category spending analysis
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Transactions_UserId_CategoryId_Date' AND object_id = OBJECT_ID('Transactions'))
    CREATE NONCLUSTERED INDEX [IX_Transactions_UserId_CategoryId_Date]
        ON [dbo].[Transactions] ([UserId], [CategoryId], [Date] DESC)
        INCLUDE ([Amount], [Type])
        WHERE [IsDeleted] = 0;

-- Monthly income/expense summary
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Transactions_UserId_Type_Date' AND object_id = OBJECT_ID('Transactions'))
    CREATE NONCLUSTERED INDEX [IX_Transactions_UserId_Type_Date]
        ON [dbo].[Transactions] ([UserId], [Type], [Date] DESC)
        INCLUDE ([Amount], [AccountId], [CategoryId])
        WHERE [IsDeleted] = 0;

-- Search by payee
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Transactions_UserId_Payee' AND object_id = OBJECT_ID('Transactions'))
    CREATE NONCLUSTERED INDEX [IX_Transactions_UserId_Payee]
        ON [dbo].[Transactions] ([UserId], [Payee])
        INCLUDE ([Amount], [Date], [Type])
        WHERE [IsDeleted] = 0 AND [Payee] IS NOT NULL;

-- Dashboard recent transactions
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Transactions_UserId_Covering' AND object_id = OBJECT_ID('Transactions'))
    CREATE NONCLUSTERED INDEX [IX_Transactions_UserId_Covering]
        ON [dbo].[Transactions] ([UserId], [Date] DESC)
        INCLUDE ([Amount], [Currency], [Type], [Note], [Payee], [AccountId], [CategoryId], [PaymentMethod])
        WHERE [IsDeleted] = 0;

-- Admin transaction list
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Transactions_Date' AND object_id = OBJECT_ID('Transactions'))
    CREATE NONCLUSTERED INDEX [IX_Transactions_Date]
        ON [dbo].[Transactions] ([Date] DESC)
        INCLUDE ([Amount], [Currency], [Type], [Payee], [UserId], [AccountId]);

-- Recurring transaction lookup
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Transactions_IsRecurring' AND object_id = OBJECT_ID('Transactions'))
    CREATE NONCLUSTERED INDEX [IX_Transactions_IsRecurring]
        ON [dbo].[Transactions] ([IsRecurring], [RecurringTransactionId])
        WHERE [IsRecurring] = 1 AND [IsDeleted] = 0;

-- ============================================================================
-- 4. CATEGORY INDEXES
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Categories_UserId_DisplayOrder' AND object_id = OBJECT_ID('Categories'))
    CREATE NONCLUSTERED INDEX [IX_Categories_UserId_DisplayOrder]
        ON [dbo].[Categories] ([UserId], [DisplayOrder])
        INCLUDE ([Name], [Icon], [Color], [Type], [IsDefault], [IsArchived])
        WHERE [IsDeleted] = 0;

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Categories_UserId_Type' AND object_id = OBJECT_ID('Categories'))
    CREATE NONCLUSTERED INDEX [IX_Categories_UserId_Type]
        ON [dbo].[Categories] ([UserId], [Type])
        INCLUDE ([Name], [Icon], [Color])
        WHERE [IsDeleted] = 0;

-- Parent category lookup
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Categories_ParentId' AND object_id = OBJECT_ID('Categories'))
    CREATE NONCLUSTERED INDEX [IX_Categories_ParentId]
        ON [dbo].[Categories] ([ParentId])
        WHERE [ParentId] IS NOT NULL AND [IsDeleted] = 0;

-- ============================================================================
-- 5. BUDGET INDEXES
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Budgets_UserId_IsActive' AND object_id = OBJECT_ID('Budgets'))
    CREATE NONCLUSTERED INDEX [IX_Budgets_UserId_IsActive]
        ON [dbo].[Budgets] ([UserId], [IsActive])
        INCLUDE ([Name], [Amount], [Currency], [Period], [StartDate], [CategoryId])
        WHERE [IsDeleted] = 0;

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Budgets_UserId_Period' AND object_id = OBJECT_ID('Budgets'))
    CREATE NONCLUSTERED INDEX [IX_Budgets_UserId_Period]
        ON [dbo].[Budgets] ([UserId], [Period])
        INCLUDE ([Name], [Amount], [IsActive])
        WHERE [IsDeleted] = 0;

-- Budget spending calculation
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Budgets_UserId_CategoryId' AND object_id = OBJECT_ID('Budgets'))
    CREATE NONCLUSTERED INDEX [IX_Budgets_UserId_CategoryId]
        ON [dbo].[Budgets] ([UserId], [CategoryId])
        INCLUDE ([Name], [Amount], [Period], [StartDate])
        WHERE [IsDeleted] = 0 AND [CategoryId] IS NOT NULL;

-- ============================================================================
-- 6. NOTIFICATION INDEXES
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Notifications_UserId_Status' AND object_id = OBJECT_ID('Notifications'))
    CREATE NONCLUSTERED INDEX [IX_Notifications_UserId_Status]
        ON [dbo].[Notifications] ([UserId], [Status])
        INCLUDE ([Title], [Message], [Type], [ActionUrl], [CreatedAt]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Notifications_UserId_CreatedAt' AND object_id = OBJECT_ID('Notifications'))
    CREATE NONCLUSTERED INDEX [IX_Notifications_UserId_CreatedAt]
        ON [dbo].[Notifications] ([UserId], [CreatedAt] DESC)
        INCLUDE ([Title], [Message], [Type], [Status]);

-- Unread count query
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Notifications_Unread' AND object_id = OBJECT_ID('Notifications'))
    CREATE NONCLUSTERED INDEX [IX_Notifications_Unread]
        ON [dbo].[Notifications] ([UserId])
        INCLUDE ([Id])
        WHERE [Status] = 0;

-- ============================================================================
-- 7. TAG INDEXES
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Tags_UserId' AND object_id = OBJECT_ID('Tags'))
    CREATE NONCLUSTERED INDEX [IX_Tags_UserId]
        ON [dbo].[Tags] ([UserId])
        INCLUDE ([Name], [Color])
        WHERE [IsDeleted] = 0;

-- ============================================================================
-- 8. AUDIT LOG INDEXES
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_AuditLogs_UserId_CreatedAt' AND object_id = OBJECT_ID('AuditLogs'))
    CREATE NONCLUSTERED INDEX [IX_AuditLogs_UserId_CreatedAt]
        ON [dbo].[AuditLogs] ([UserId], [CreatedAt] DESC)
        INCLUDE ([Action], [Entity], [EntityId], [IsSuccess]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_AuditLogs_Entity' AND object_id = OBJECT_ID('AuditLogs'))
    CREATE NONCLUSTERED INDEX [IX_AuditLogs_Entity]
        ON [dbo].[AuditLogs] ([Entity], [Action])
        INCLUDE ([UserId], [EntityId], [IsSuccess], [CreatedAt]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_AuditLogs_CreatedAt' AND object_id = OBJECT_ID('AuditLogs'))
    CREATE NONCLUSTERED INDEX [IX_AuditLogs_CreatedAt]
        ON [dbo].[AuditLogs] ([CreatedAt] DESC);

-- ============================================================================
-- 9. SYSTEM LOG INDEXES
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SystemLogs_Timestamp' AND object_id = OBJECT_ID('SystemLogs'))
    CREATE NONCLUSTERED INDEX [IX_SystemLogs_Timestamp]
        ON [dbo].[SystemLogs] ([Timestamp] DESC);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SystemLogs_Level' AND object_id = OBJECT_ID('SystemLogs'))
    CREATE NONCLUSTERED INDEX [IX_SystemLogs_Level]
        ON [dbo].[SystemLogs] ([Level], [Timestamp] DESC)
        INCLUDE ([Message], [Source]);

-- ============================================================================
-- 10. RECURRING TRANSACTION INDEXES
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_RecurringTransactions_UserId' AND object_id = OBJECT_ID('RecurringTransactions'))
    CREATE NONCLUSTERED INDEX [IX_RecurringTransactions_UserId]
        ON [dbo].[RecurringTransactions] ([UserId], [IsActive])
        INCLUDE ([Name], [Amount], [NextDueDate])
        WHERE [IsDeleted] = 0;

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_RecurringTransactions_NextDueDate' AND object_id = OBJECT_ID('RecurringTransactions'))
    CREATE NONCLUSTERED INDEX [IX_RecurringTransactions_NextDueDate]
        ON [dbo].[RecurringTransactions] ([NextDueDate])
        INCLUDE ([UserId], [AccountId], [Amount], [Type])
        WHERE [IsActive] = 1 AND [IsDeleted] = 0;

-- ============================================================================
-- 11. USER PASSKEY INDEXES
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_UserPasskeys_UserId' AND object_id = OBJECT_ID('UserPasskeys'))
    CREATE NONCLUSTERED INDEX [IX_UserPasskeys_UserId]
        ON [dbo].[UserPasskeys] ([UserId])
        INCLUDE ([Name], [CredentialId], [LastUsedAt]);

PRINT 'Indexes created successfully.';
GO
