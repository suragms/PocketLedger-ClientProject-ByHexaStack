===============================================================================
 PocketLedger - SQL Server Database Schema
 Tables, Constraints, Foreign Keys, Cascade Rules
 Generated from EF Core Domain Model
===============================================================================

SET NOCOUNT ON;
SET XACT_ABORT ON;

-- ============================================================================
-- DATABASE CREATION
-- ============================================================================
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'PocketLedger')
BEGIN
    CREATE DATABASE PocketLedger;
END
GO

USE PocketLedger;
GO

-- ============================================================================
-- SCHEMA
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'app')
    EXEC('CREATE SCHEMA app');
GO

-- ============================================================================
-- 1. ASP.NET IDENTITY TABLES (Extended)
-- ============================================================================

-- Roles
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AspNetRoles]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[AspNetRoles] (
        [Id]                   NVARCHAR(128) NOT NULL,
        [Name]                 NVARCHAR(256) NULL,
        [NormalizedName]       NVARCHAR(256) NULL,
        [ConcurrencyStamp]     NVARCHAR(MAX) NULL,
        [Description]          NVARCHAR(500) NULL,
        CONSTRAINT [PK_AspNetRoles] PRIMARY KEY CLUSTERED ([Id])
    );
END
GO

-- Users (extended with PocketLedger fields)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AspNetUsers]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[AspNetUsers] (
        [Id]                            NVARCHAR(128) NOT NULL,
        [UserName]                      NVARCHAR(256) NULL,
        [NormalizedUserName]            NVARCHAR(256) NULL,
        [Email]                         NVARCHAR(256) NULL,
        [NormalizedEmail]               NVARCHAR(256) NULL,
        [EmailConfirmed]                BIT NOT NULL DEFAULT 0,
        [PasswordHash]                  NVARCHAR(MAX) NULL,
        [SecurityStamp]                 NVARCHAR(MAX) NULL,
        [ConcurrencyStamp]              NVARCHAR(MAX) NULL,
        [PhoneNumber]                   NVARCHAR(MAX) NULL,
        [PhoneNumberConfirmed]          BIT NOT NULL DEFAULT 0,
        [TwoFactorEnabled]              BIT NOT NULL DEFAULT 0,
        [LockoutEnd]                    DATETIMEOFFSET NULL,
        [LockoutEnabled]                BIT NOT NULL DEFAULT 0,
        [AccessFailedCount]             INT NOT NULL DEFAULT 0,
        -- PocketLedger custom fields
        [FirstName]                     NVARCHAR(100) NOT NULL DEFAULT '',
        [LastName]                      NVARCHAR(100) NOT NULL DEFAULT '',
        [AvatarUrl]                     NVARCHAR(500) NULL,
        [DefaultCurrency]               NCHAR(3) NOT NULL DEFAULT 'USD',
        [CreatedAt]                     DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        [LastLoginAt]                   DATETIME2 NULL,
        [IsActive]                      BIT NOT NULL DEFAULT 1,
        [EmailVerified]                 BIT NOT NULL DEFAULT 0,
        [EmailVerificationToken]        NVARCHAR(500) NULL,
        [EmailVerificationTokenExpiry]  DATETIME2 NULL,
        [PasswordResetToken]            NVARCHAR(500) NULL,
        [PasswordResetTokenExpiry]      DATETIME2 NULL,
        [PinHash]                       NVARCHAR(500) NULL,
        [PinEnabled]                    BIT NOT NULL DEFAULT 0,
        [RefreshToken]                  NVARCHAR(500) NULL,
        [RefreshTokenExpiry]            DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        [SecurityStamp2]                NVARCHAR(500) NULL,
        -- 2FA
        [TwoFactorSecretKey]            NVARCHAR(500) NULL,
        [TwoFactorRecoveryCodes]        NVARCHAR(MAX) NULL,
        [TwoFactorEnabledAt]            DATETIME2 NULL,
        CONSTRAINT [PK_AspNetUsers] PRIMARY KEY CLUSTERED ([Id])
    );
END
GO

-- UserRoles
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AspNetUserRoles]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[AspNetUserRoles] (
        [UserId] NVARCHAR(128) NOT NULL,
        [RoleId] NVARCHAR(128) NOT NULL,
        CONSTRAINT [PK_AspNetUserRoles] PRIMARY KEY CLUSTERED ([UserId], [RoleId]),
        CONSTRAINT [FK_AspNetUserRoles_AspNetUsers] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers]([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_AspNetUserRoles_AspNetRoles] FOREIGN KEY ([RoleId]) REFERENCES [dbo].[AspNetRoles]([Id]) ON DELETE CASCADE
    );
END
GO

-- UserClaims
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AspNetUserClaims]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[AspNetUserClaims] (
        [Id]         INT IDENTITY(1,1) NOT NULL,
        [UserId]     NVARCHAR(128) NOT NULL,
        [ClaimType]  NVARCHAR(MAX) NULL,
        [ClaimValue] NVARCHAR(MAX) NULL,
        CONSTRAINT [PK_AspNetUserClaims] PRIMARY KEY CLUSTERED ([Id]),
        CONSTRAINT [FK_AspNetUserClaims_AspNetUsers] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers]([Id]) ON DELETE CASCADE
    );
END
GO

-- RoleClaims
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AspNetRoleClaims]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[AspNetRoleClaims] (
        [Id]         INT IDENTITY(1,1) NOT NULL,
        [RoleId]     NVARCHAR(128) NOT NULL,
        [ClaimType]  NVARCHAR(MAX) NULL,
        [ClaimValue] NVARCHAR(MAX) NULL,
        CONSTRAINT [PK_AspNetRoleClaims] PRIMARY KEY CLUSTERED ([Id]),
        CONSTRAINT [FK_AspNetRoleClaims_AspNetRoles] FOREIGN KEY ([RoleId]) REFERENCES [dbo].[AspNetRoles]([Id]) ON DELETE CASCADE
    );
END
GO

-- UserLogins
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AspNetUserLogins]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[AspNetUserLogins] (
        [LoginProvider]       NVARCHAR(128) NOT NULL,
        [ProviderKey]         NVARCHAR(128) NOT NULL,
        [ProviderDisplayName] NVARCHAR(MAX) NULL,
        [UserId]              NVARCHAR(128) NOT NULL,
        CONSTRAINT [PK_AspNetUserLogins] PRIMARY KEY CLUSTERED ([LoginProvider], [ProviderKey]),
        CONSTRAINT [FK_AspNetUserLogins_AspNetUsers] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers]([Id]) ON DELETE CASCADE
    );
END
GO

-- UserTokens
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AspNetUserTokens]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[AspNetUserTokens] (
        [UserId]        NVARCHAR(128) NOT NULL,
        [LoginProvider] NVARCHAR(128) NOT NULL,
        [Name]          NVARCHAR(128) NOT NULL,
        [Value]         NVARCHAR(MAX) NULL,
        CONSTRAINT [PK_AspNetUserTokens] PRIMARY KEY CLUSTERED ([UserId], [LoginProvider], [Name]),
        CONSTRAINT [FK_AspNetUserTokens_AspNetUsers] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers]([Id]) ON DELETE CASCADE
    );
END
GO

-- ============================================================================
-- 2. APPLICATION TABLES
-- ============================================================================

-- Accounts
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Accounts]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[Accounts] (
        [Id]                 INT IDENTITY(1,1) NOT NULL,
        [Name]               NVARCHAR(100) NOT NULL,
        [Description]        NVARCHAR(500) NULL,
        [Type]               INT NOT NULL DEFAULT 0,
        [Balance]            DECIMAL(18,2) NOT NULL DEFAULT 0,
        [Currency]           NCHAR(3) NOT NULL DEFAULT 'USD',
        [Color]              NVARCHAR(7) NULL,
        [Icon]               NVARCHAR(50) NULL,
        [IncludeInBalance]   BIT NOT NULL DEFAULT 1,
        [DisplayOrder]       INT NOT NULL DEFAULT 0,
        [UserId]             NVARCHAR(128) NOT NULL,
        [CreatedAt]          DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        [UpdatedAt]          DATETIME2 NULL,
        [CreatedBy]          NVARCHAR(128) NULL,
        [UpdatedBy]          NVARCHAR(128) NULL,
        [IsDeleted]          BIT NOT NULL DEFAULT 0,
        [DeletedAt]          DATETIME2 NULL,
        [DeletedBy]          NVARCHAR(128) NULL,
        CONSTRAINT [PK_Accounts] PRIMARY KEY CLUSTERED ([Id]),
        CONSTRAINT [FK_Accounts_AspNetUsers] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers]([Id]) ON DELETE CASCADE,
        CONSTRAINT [CK_Accounts_Balance] CHECK ([Balance] >= 0),
        CONSTRAINT [CK_Accounts_Currency] CHECK (LEN([Currency]) = 3),
        CONSTRAINT [CK_Accounts_Type] CHECK ([Type] BETWEEN 0 AND 8)
    );
END
GO

-- Categories
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Categories]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[Categories] (
        [Id]             INT IDENTITY(1,1) NOT NULL,
        [Name]           NVARCHAR(100) NOT NULL,
        [Description]    NVARCHAR(500) NULL,
        [Icon]           NVARCHAR(50) NOT NULL DEFAULT 'folder',
        [Color]          NVARCHAR(7) NOT NULL DEFAULT '#6366f1',
        [Type]           INT NOT NULL DEFAULT 2,
        [IsDefault]      BIT NOT NULL DEFAULT 0,
        [IsArchived]     BIT NOT NULL DEFAULT 0,
        [ParentId]       INT NULL,
        [DisplayOrder]   INT NOT NULL DEFAULT 0,
        [UserId]         NVARCHAR(128) NOT NULL,
        [CreatedAt]      DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        [UpdatedAt]      DATETIME2 NULL,
        [CreatedBy]      NVARCHAR(128) NULL,
        [UpdatedBy]      NVARCHAR(128) NULL,
        [IsDeleted]      BIT NOT NULL DEFAULT 0,
        [DeletedAt]      DATETIME2 NULL,
        [DeletedBy]      NVARCHAR(128) NULL,
        CONSTRAINT [PK_Categories] PRIMARY KEY CLUSTERED ([Id]),
        CONSTRAINT [FK_Categories_AspNetUsers] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers]([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_Categories_Parent] FOREIGN KEY ([ParentId]) REFERENCES [dbo].[Categories]([Id]) ON DELETE NO ACTION,
        CONSTRAINT [CK_Categories_Type] CHECK ([Type] BETWEEN 0 AND 2),
        CONSTRAINT [CK_Categories_Color] CHECK (LEN([Color]) = 7)
    );
END
GO

-- Transactions
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Transactions]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[Transactions] (
        [Id]                     INT IDENTITY(1,1) NOT NULL,
        [Amount]                 DECIMAL(18,2) NOT NULL,
        [Currency]               NCHAR(3) NOT NULL DEFAULT 'USD',
        [Type]                   INT NOT NULL,
        [Date]                   DATETIME2 NOT NULL,
        [Note]                   NVARCHAR(500) NULL,
        [Payee]                  NVARCHAR(200) NULL,
        [Reference]              NVARCHAR(100) NULL,
        [ReceiptUrl]             NVARCHAR(500) NULL,
        [ReceiptThumbnailUrl]    NVARCHAR(500) NULL,
        [PaymentMethod]          INT NOT NULL DEFAULT 0,
        [IsRecurring]            BIT NOT NULL DEFAULT 0,
        [RecurringTransactionId] INT NULL,
        [AccountId]              INT NOT NULL,
        [CategoryId]             INT NULL,
        [UserId]                 NVARCHAR(128) NOT NULL,
        [CreatedAt]              DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        [UpdatedAt]              DATETIME2 NULL,
        [CreatedBy]              NVARCHAR(128) NULL,
        [UpdatedBy]              NVARCHAR(128) NULL,
        [IsDeleted]              BIT NOT NULL DEFAULT 0,
        [DeletedAt]              DATETIME2 NULL,
        [DeletedBy]              NVARCHAR(128) NULL,
        CONSTRAINT [PK_Transactions] PRIMARY KEY CLUSTERED ([Id]),
        CONSTRAINT [FK_Transactions_Accounts] FOREIGN KEY ([AccountId]) REFERENCES [dbo].[Accounts]([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Transactions_Categories] FOREIGN KEY ([CategoryId]) REFERENCES [dbo].[Categories]([Id]) ON DELETE SET NULL,
        CONSTRAINT [FK_Transactions_AspNetUsers] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers]([Id]) ON DELETE CASCADE,
        CONSTRAINT [CK_Transactions_Amount] CHECK ([Amount] > 0),
        CONSTRAINT [CK_Transactions_Currency] CHECK (LEN([Currency]) = 3),
        CONSTRAINT [CK_Transactions_Type] CHECK ([Type] BETWEEN 0 AND 2),
        CONSTRAINT [CK_Transactions_PaymentMethod] CHECK ([PaymentMethod] BETWEEN 0 AND 6)
    );
END
GO

-- Budgets
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Budgets]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[Budgets] (
        [Id]              INT IDENTITY(1,1) NOT NULL,
        [Name]            NVARCHAR(100) NOT NULL,
        [Amount]          DECIMAL(18,2) NOT NULL,
        [Currency]        NCHAR(3) NOT NULL DEFAULT 'USD',
        [Period]          INT NOT NULL DEFAULT 1,
        [StartDate]       DATETIME2 NOT NULL,
        [EndDate]         DATETIME2 NULL,
        [AlertThreshold]  DECIMAL(5,2) NULL,
        [IsActive]        BIT NOT NULL DEFAULT 1,
        [NotifyOnAlert]   BIT NOT NULL DEFAULT 1,
        [NotifyOnExceed]  BIT NOT NULL DEFAULT 1,
        [CategoryId]      INT NULL,
        [UserId]          NVARCHAR(128) NOT NULL,
        [CreatedAt]       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        [UpdatedAt]       DATETIME2 NULL,
        [CreatedBy]       NVARCHAR(128) NULL,
        [UpdatedBy]       NVARCHAR(128) NULL,
        [IsDeleted]       BIT NOT NULL DEFAULT 0,
        [DeletedAt]       DATETIME2 NULL,
        [DeletedBy]       NVARCHAR(128) NULL,
        CONSTRAINT [PK_Budgets] PRIMARY KEY CLUSTERED ([Id]),
        CONSTRAINT [FK_Budgets_AspNetUsers] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers]([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_Budgets_Categories] FOREIGN KEY ([CategoryId]) REFERENCES [dbo].[Categories]([Id]) ON DELETE SET NULL,
        CONSTRAINT [CK_Budgets_Amount] CHECK ([Amount] > 0),
        CONSTRAINT [CK_Budgets_Currency] CHECK (LEN([Currency]) = 3),
        CONSTRAINT [CK_Budgets_Period] CHECK ([Period] BETWEEN 0 AND 3),
        CONSTRAINT [CK_Budgets_AlertThreshold] CHECK ([AlertThreshold] IS NULL OR ([AlertThreshold] >= 0 AND [AlertThreshold] <= 100))
    );
END
GO

-- Tags
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Tags]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[Tags] (
        [Id]         INT IDENTITY(1,1) NOT NULL,
        [Name]       NVARCHAR(50) NOT NULL,
        [Color]      NVARCHAR(7) NOT NULL DEFAULT '#8b5cf6',
        [UserId]     NVARCHAR(128) NOT NULL,
        [CreatedAt]  DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        [UpdatedAt]  DATETIME2 NULL,
        [CreatedBy]  NVARCHAR(128) NULL,
        [UpdatedBy]  NVARCHAR(128) NULL,
        [IsDeleted]  BIT NOT NULL DEFAULT 0,
        [DeletedAt]  DATETIME2 NULL,
        [DeletedBy]  NVARCHAR(128) NULL,
        CONSTRAINT [PK_Tags] PRIMARY KEY CLUSTERED ([Id]),
        CONSTRAINT [FK_Tags_AspNetUsers] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers]([Id]) ON DELETE CASCADE,
        CONSTRAINT [CK_Tags_Color] CHECK (LEN([Color]) = 7)
    );
END
GO

-- TransactionTags (Many-to-Many)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TransactionTags]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[TransactionTags] (
        [TransactionId] INT NOT NULL,
        [TagId]         INT NOT NULL,
        CONSTRAINT [PK_TransactionTags] PRIMARY KEY CLUSTERED ([TransactionId], [TagId]),
        CONSTRAINT [FK_TransactionTags_Transactions] FOREIGN KEY ([TransactionId]) REFERENCES [dbo].[Transactions]([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_TransactionTags_Tags] FOREIGN KEY ([TagId]) REFERENCES [dbo].[Tags]([Id]) ON DELETE CASCADE
    );
END
GO

-- RecurringTransactions
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[RecurringTransactions]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[RecurringTransactions] (
        [Id]             INT IDENTITY(1,1) NOT NULL,
        [Amount]         DECIMAL(18,2) NOT NULL,
        [Currency]       NCHAR(3) NOT NULL DEFAULT 'USD',
        [Type]           INT NOT NULL,
        [Note]           NVARCHAR(500) NULL,
        [Payee]          NVARCHAR(200) NULL,
        [FrequencyDays]  INT NOT NULL,
        [NextDueDate]    DATETIME2 NOT NULL,
        [EndDate]        DATETIME2 NULL,
        [IsActive]       BIT NOT NULL DEFAULT 1,
        [AccountId]      INT NOT NULL,
        [CategoryId]     INT NULL,
        [UserId]         NVARCHAR(128) NOT NULL,
        [CreatedAt]      DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        [UpdatedAt]      DATETIME2 NULL,
        [CreatedBy]      NVARCHAR(128) NULL,
        [UpdatedBy]      NVARCHAR(128) NULL,
        [IsDeleted]      BIT NOT NULL DEFAULT 0,
        [DeletedAt]      DATETIME2 NULL,
        [DeletedBy]      NVARCHAR(128) NULL,
        CONSTRAINT [PK_RecurringTransactions] PRIMARY KEY CLUSTERED ([Id]),
        CONSTRAINT [FK_RecurringTransactions_Accounts] FOREIGN KEY ([AccountId]) REFERENCES [dbo].[Accounts]([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_RecurringTransactions_Categories] FOREIGN KEY ([CategoryId]) REFERENCES [dbo].[Categories]([Id]) ON DELETE SET NULL,
        CONSTRAINT [FK_RecurringTransactions_AspNetUsers] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers]([Id]) ON DELETE CASCADE,
        CONSTRAINT [CK_RecurringTransactions_Amount] CHECK ([Amount] > 0),
        CONSTRAINT [CK_RecurringTransactions_Currency] CHECK (LEN([Currency]) = 3),
        CONSTRAINT [CK_RecurringTransactions_Type] CHECK ([Type] BETWEEN 0 AND 2),
        CONSTRAINT [CK_RecurringTransactions_FrequencyDays] CHECK ([FrequencyDays] > 0)
    );
END
GO

-- UserPasskeys
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserPasskeys]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[UserPasskeys] (
        [Id]             INT IDENTITY(1,1) NOT NULL,
        [UserId]         NVARCHAR(128) NOT NULL,
        [Name]           NVARCHAR(200) NOT NULL,
        [CredentialId]   VARBINARY(MAX) NOT NULL,
        [PublicKey]      VARBINARY(MAX) NOT NULL,
        [SignCount]      BIGINT NOT NULL DEFAULT 0,
        [Transports]     NVARCHAR(500) NULL,
        [CreatedAt]      DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        [LastUsedAt]     DATETIME2 NULL,
        CONSTRAINT [PK_UserPasskeys] PRIMARY KEY CLUSTERED ([Id]),
        CONSTRAINT [FK_UserPasskeys_AspNetUsers] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers]([Id]) ON DELETE CASCADE
    );
END
GO

-- Notifications
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Notifications]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[Notifications] (
        [Id]          INT IDENTITY(1,1) NOT NULL,
        [Title]       NVARCHAR(200) NOT NULL,
        [Message]     NVARCHAR(1000) NOT NULL,
        [Type]        INT NOT NULL DEFAULT 0,
        [Status]      INT NOT NULL DEFAULT 0,
        [ActionUrl]   NVARCHAR(500) NULL,
        [Icon]        NVARCHAR(50) NULL,
        [UserId]      NVARCHAR(128) NOT NULL,
        [ReadAt]      DATETIME2 NULL,
        [ArchivedAt]  DATETIME2 NULL,
        [CreatedAt]   DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        [UpdatedAt]   DATETIME2 NULL,
        [CreatedBy]   NVARCHAR(128) NULL,
        [UpdatedBy]   NVARCHAR(128) NULL,
        CONSTRAINT [PK_Notifications] PRIMARY KEY CLUSTERED ([Id]),
        CONSTRAINT [FK_Notifications_AspNetUsers] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers]([Id]) ON DELETE CASCADE,
        CONSTRAINT [CK_Notifications_Type] CHECK ([Type] BETWEEN 0 AND 5),
        CONSTRAINT [CK_Notifications_Status] CHECK ([Status] BETWEEN 0 AND 2)
    );
END
GO

-- NotificationPreferences
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NotificationPreferences]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[NotificationPreferences] (
        [Id]                       INT IDENTITY(1,1) NOT NULL,
        [UserId]                   NVARCHAR(128) NOT NULL,
        [DailyReminderEnabled]     BIT NOT NULL DEFAULT 1,
        [DailyReminderHour]        INT NOT NULL DEFAULT 9,
        [WeeklySummaryEnabled]     BIT NOT NULL DEFAULT 1,
        [WeeklySummaryDay]         INT NOT NULL DEFAULT 1,
        [MonthlySummaryEnabled]    BIT NOT NULL DEFAULT 1,
        [MonthlySummaryDay]        INT NOT NULL DEFAULT 1,
        [BudgetAlertEnabled]       BIT NOT NULL DEFAULT 1,
        [BudgetExceededEnabled]    BIT NOT NULL DEFAULT 1,
        [PushNotificationsEnabled] BIT NOT NULL DEFAULT 1,
        [PushEndpoint]             NVARCHAR(500) NULL,
        [PushP256dh]               NVARCHAR(500) NULL,
        [PushAuth]                 NVARCHAR(500) NULL,
        CONSTRAINT [PK_NotificationPreferences] PRIMARY KEY CLUSTERED ([Id]),
        CONSTRAINT [FK_NotificationPreferences_AspNetUsers] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers]([Id]) ON DELETE CASCADE,
        CONSTRAINT [UQ_NotificationPreferences_UserId] UNIQUE ([UserId]),
        CONSTRAINT [CK_NotificationPreferences_DailyReminderHour] CHECK ([DailyReminderHour] BETWEEN 0 AND 23),
        CONSTRAINT [CK_NotificationPreferences_WeeklySummaryDay] CHECK ([WeeklySummaryDay] BETWEEN 0 AND 6),
        CONSTRAINT [CK_NotificationPreferences_MonthlySummaryDay] CHECK ([MonthlySummaryDay] BETWEEN 1 AND 28)
    );
END
GO

-- UserSettings
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserSettings]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[UserSettings] (
        [Id]                      INT IDENTITY(1,1) NOT NULL,
        [UserId]                  NVARCHAR(128) NOT NULL,
        [Theme]                   NVARCHAR(20) NOT NULL DEFAULT 'system',
        [Language]                NVARCHAR(10) NOT NULL DEFAULT 'en',
        [Currency]                NCHAR(3) NOT NULL DEFAULT 'USD',
        [EmailNotifications]      BIT NOT NULL DEFAULT 1,
        [PushNotifications]       BIT NOT NULL DEFAULT 1,
        [BudgetAlerts]            BIT NOT NULL DEFAULT 1,
        [WeeklyReport]            BIT NOT NULL DEFAULT 1,
        [MonthlyReport]           BIT NOT NULL DEFAULT 1,
        [ShowBalance]             BIT NOT NULL DEFAULT 1,
        [ShowTransactions]        BIT NOT NULL DEFAULT 1,
        [PublicProfile]           BIT NOT NULL DEFAULT 0,
        [LoginNotifications]      BIT NOT NULL DEFAULT 1,
        [SessionTimeout]          BIT NOT NULL DEFAULT 0,
        [SessionTimeoutMinutes]   INT NOT NULL DEFAULT 30,
        [CreatedAt]               DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        [UpdatedAt]               DATETIME2 NULL,
        CONSTRAINT [PK_UserSettings] PRIMARY KEY CLUSTERED ([Id]),
        CONSTRAINT [FK_UserSettings_AspNetUsers] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers]([Id]) ON DELETE CASCADE,
        CONSTRAINT [UQ_UserSettings_UserId] UNIQUE ([UserId]),
        CONSTRAINT [CK_UserSettings_Theme] CHECK ([Theme] IN ('light', 'dark', 'system')),
        CONSTRAINT [CK_UserSettings_SessionTimeoutMinutes] CHECK ([SessionTimeoutMinutes] BETWEEN 5 AND 480)
    );
END
GO

-- AuditLogs
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AuditLogs]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[AuditLogs] (
        [Id]          INT IDENTITY(1,1) NOT NULL,
        [UserId]      NVARCHAR(128) NOT NULL,
        [Action]      NVARCHAR(100) NOT NULL,
        [Entity]      NVARCHAR(100) NOT NULL,
        [EntityId]    NVARCHAR(100) NULL,
        [OldValues]   NVARCHAR(MAX) NULL,
        [NewValues]   NVARCHAR(MAX) NULL,
        [IpAddress]   NVARCHAR(45) NULL,
        [UserAgent]   NVARCHAR(500) NULL,
        [IsSuccess]   BIT NOT NULL DEFAULT 1,
        [ErrorMessage] NVARCHAR(MAX) NULL,
        [CreatedAt]   DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        [UpdatedAt]   DATETIME2 NULL,
        CONSTRAINT [PK_AuditLogs] PRIMARY KEY CLUSTERED ([Id]),
        CONSTRAINT [FK_AuditLogs_AspNetUsers] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers]([Id]) ON DELETE NO ACTION
    );
END
GO

-- SystemLogs (application logging, no FK to users)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SystemLogs]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[SystemLogs] (
        [Id]          BIGINT IDENTITY(1,1) NOT NULL,
        [Timestamp]   DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        [Level]       NVARCHAR(20) NOT NULL,
        [Message]     NVARCHAR(MAX) NOT NULL,
        [Exception]   NVARCHAR(MAX) NULL,
        [Source]      NVARCHAR(200) NULL,
        [StackTrace]  NVARCHAR(MAX) NULL,
        [Properties]  NVARCHAR(MAX) NULL,
        CONSTRAINT [PK_SystemLogs] PRIMARY KEY CLUSTERED ([Id])
    );
END
GO

PRINT 'Schema created successfully.';
GO
