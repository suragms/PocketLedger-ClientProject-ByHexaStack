===============================================================================
 PocketLedger - Migration Scripts
 Versioned migrations for schema management
===============================================================================

USE PocketLedger;
GO

-- ============================================================================
-- MIGRATION HISTORY TABLE
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[__EFMigrationsHistory]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[__EFMigrationsHistory] (
        [MigrationId]    NVARCHAR(150) NOT NULL,
        [ProductVersion] NVARCHAR(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY CLUSTERED ([MigrationId])
    );
END
GO

-- ============================================================================
-- MIGRATION 001: Initial Schema (2024-01-01)
-- Creates all Identity tables, core application tables, and basic indexes
-- ============================================================================
-- This migration is equivalent to:
--   dotnet ef migrations add InitialSchema
--
-- Tables created:
--   - AspNetUsers (extended), AspNetRoles, AspNetUserRoles
--   - AspNetUserClaims, AspNetRoleClaims, AspNetUserLogins, AspNetUserTokens
--   - Accounts, Categories, Transactions, Budgets
--   - Tags, TransactionTags, RecurringTransactions
--   - UserPasskeys, Notifications, NotificationPreferences
--   - UserSettings, AuditLogs, SystemLogs
--
-- Execute: 01_Schema.sql + 02_Indexes.sql for this migration
-- ============================================================================

-- ============================================================================
-- MIGRATION 002: Add SystemLogs Table (2024-02-15)
-- Adds system logging for application monitoring
-- ============================================================================
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

    CREATE NONCLUSTERED INDEX [IX_SystemLogs_Timestamp]
        ON [dbo].[SystemLogs] ([Timestamp] DESC);

    CREATE NONCLUSTERED INDEX [IX_SystemLogs_Level]
        ON [dbo].[SystemLogs] ([Level], [Timestamp] DESC)
        INCLUDE ([Message], [Source]);
END
GO

-- ============================================================================
-- MIGRATION 003: Add AuditLog UserAgent Column (2024-03-01)
-- Extends audit logging with user agent tracking
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[AuditLogs]') AND name = 'UserAgent')
BEGIN
    ALTER TABLE [dbo].[AuditLogs]
        ADD [UserAgent] NVARCHAR(500) NULL;
END
GO

-- ============================================================================
-- MIGRATION 004: Add User Two-Factor Fields (2024-03-15)
-- Adds TOTP 2FA support with recovery codes
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[AspNetUsers]') AND name = 'TwoFactorSecretKey')
BEGIN
    ALTER TABLE [dbo].[AspNetUsers]
        ADD [TwoFactorSecretKey] NVARCHAR(500) NULL,
            [TwoFactorRecoveryCodes] NVARCHAR(MAX) NULL,
            [TwoFactorEnabledAt] DATETIME2 NULL;
END
GO

-- ============================================================================
-- MIGRATION 005: Add SecurityStamp2 Column (2024-04-01)
-- Additional security stamp for token rotation
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[AspNetUsers]') AND name = 'SecurityStamp2')
BEGIN
    ALTER TABLE [dbo].[AspNetUsers]
        ADD [SecurityStamp2] NVARCHAR(500) NULL;
END
GO

-- ============================================================================
-- MIGRATION 006: Add Transaction Receipt Fields (2024-04-15)
-- Supports receipt image uploads
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Transactions]') AND name = 'ReceiptUrl')
BEGIN
    ALTER TABLE [dbo].[Transactions]
        ADD [ReceiptUrl] NVARCHAR(500) NULL,
            [ReceiptThumbnailUrl] NVARCHAR(500) NULL;
END
GO

-- ============================================================================
-- MIGRATION 007: Performance Index Optimization (2024-05-01)
-- Adds covering indexes for hot query paths
-- ============================================================================
-- Execute: 02_Indexes.sql for this migration
-- ============================================================================

-- ============================================================================
-- MIGRATION 008: Add Views (2024-05-15)
-- Creates reporting views for dashboard and analytics
-- ============================================================================
-- Execute: 03_Views.sql for this migration
-- ============================================================================

-- ============================================================================
-- MIGRATION 009: Add Stored Procedures (2024-06-01)
-- Creates optimized stored procedures for common operations
-- ============================================================================
-- Execute: 04_StoredProcedures.sql for this migration
-- ============================================================================

-- ============================================================================
-- MIGRATION 010: Add Notification Push Fields (2024-06-15)
-- Supports web push notification subscriptions
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NotificationPreferences]') AND name = 'PushEndpoint')
BEGIN
    ALTER TABLE [dbo].[NotificationPreferences]
        ADD [PushEndpoint] NVARCHAR(500) NULL,
            [PushP256dh] NVARCHAR(500) NULL,
            [PushAuth] NVARCHAR(500) NULL;
END
GO

-- ============================================================================
-- RECORD MIGRATIONS
-- ============================================================================
IF NOT EXISTS (SELECT * FROM [dbo].[__EFMigrationsHistory] WHERE [MigrationId] = '20240101000000_InitialSchema')
    INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES ('20240101000000_InitialSchema', '8.0.0');

IF NOT EXISTS (SELECT * FROM [dbo].[__EFMigrationsHistory] WHERE [MigrationId] = '20240215000000_AddSystemLogs')
    INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES ('20240215000000_AddSystemLogs', '8.0.0');

IF NOT EXISTS (SELECT * FROM [dbo].[__EFMigrationsHistory] WHERE [MigrationId] = '20240301000000_AddAuditLogUserAgent')
    INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES ('20240301000000_AddAuditLogUserAgent', '8.0.0');

IF NOT EXISTS (SELECT * FROM [dbo].[__EFMigrationsHistory] WHERE [MigrationId] = '20240315000000_AddUserTwoFactor')
    INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES ('20240315000000_AddUserTwoFactor', '8.0.0');

IF NOT EXISTS (SELECT * FROM [dbo].[__EFMigrationsHistory] WHERE [MigrationId] = '20240401000000_AddSecurityStamp2')
    INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES ('20240401000000_AddSecurityStamp2', '8.0.0');

IF NOT EXISTS (SELECT * FROM [dbo].[__EFMigrationsHistory] WHERE [MigrationId] = '20240415000000_AddTransactionReceipts')
    INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES ('20240415000000_AddTransactionReceipts', '8.0.0');

IF NOT EXISTS (SELECT * FROM [dbo].[__EFMigrationsHistory] WHERE [MigrationId] = '20240501000000_PerformanceIndexes')
    INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES ('20240501000000_PerformanceIndexes', '8.0.0');

IF NOT EXISTS (SELECT * FROM [dbo].[__EFMigrationsHistory] WHERE [MigrationId] = '20240515000000_AddViews')
    INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES ('20240515000000_AddViews', '8.0.0');

IF NOT EXISTS (SELECT * FROM [dbo].[__EFMigrationsHistory] WHERE [MigrationId] = '20240601000000_AddStoredProcedures')
    INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES ('20240601000000_AddStoredProcedures', '8.0.0');

IF NOT EXISTS (SELECT * FROM [dbo].[__EFMigrationsHistory] WHERE [MigrationId] = '20240615000000_AddNotificationPushFields')
    INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES ('20240615000000_AddNotificationPushFields', '8.0.0');

PRINT 'Migration history recorded successfully.';
GO

-- ============================================================================
-- UTILITY: Check Migration Status
-- ============================================================================
-- SELECT * FROM [dbo].[__EFMigrationsHistory] ORDER BY [MigrationId];
-- ============================================================================
