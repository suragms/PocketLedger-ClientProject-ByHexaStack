===============================================================================
 PocketLedger - Seed Data
 Roles, Demo User, Default Categories, Accounts, Transactions, Budgets
===============================================================================

USE PocketLedger;
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

-- ============================================================================
-- 1. ROLES
-- ============================================================================
IF NOT EXISTS (SELECT * FROM [dbo].[AspNetRoles] WHERE [Name] = 'Admin')
BEGIN
    INSERT INTO [dbo].[AspNetRoles] ([Id], [Name], [NormalizedName], [ConcurrencyStamp], [Description])
    VALUES (NEWID(), 'Admin', 'ADMIN', NEWID(), 'System administrator with full access');
END

IF NOT EXISTS (SELECT * FROM [dbo].[AspNetRoles] WHERE [Name] = 'User')
BEGIN
    INSERT INTO [dbo].[AspNetRoles] ([Id], [Name], [NormalizedName], [ConcurrencyStamp], [Description])
    VALUES (NEWID(), 'User', 'USER', NEWID(), 'Standard user');
END

IF NOT EXISTS (SELECT * FROM [dbo].[AspNetRoles] WHERE [Name] = 'Moderator')
BEGIN
    INSERT INTO [dbo].[AspNetRoles] ([Id], [Name], [NormalizedName], [ConcurrencyStamp], [Description])
    VALUES (NEWID(), 'Moderator', 'MODERATOR', NEWID(), 'Moderator with limited admin access');
END
GO

-- ============================================================================
-- 2. DEMO USER (Skip if exists)
-- ============================================================================
DECLARE @DemoUserId NVARCHAR(128) = 'demo-user-001';
DECLARE @DemoEmail NVARCHAR(256) = 'demo@pocketledger.com';

IF NOT EXISTS (SELECT * FROM [dbo].[AspNetUsers] WHERE [Id] = @DemoUserId)
BEGIN
    -- Note: Password hash is for 'Password123!' using ASP.NET Identity v3 hasher
    -- In production, use UserManager to create this user
    INSERT INTO [dbo].[AspNetUsers] (
        [Id], [UserName], [NormalizedUserName], [Email], [NormalizedEmail],
        [EmailConfirmed], [PasswordHash], [SecurityStamp], [ConcurrencyStamp],
        [FirstName], [LastName], [DefaultCurrency], [CreatedAt], [IsActive],
        [EmailVerified], [TwoFactorEnabled], [LockoutEnabled], [AccessFailedCount]
    )
    VALUES (
        @DemoUserId,
        @DemoEmail,
        UPPER(@DemoEmail),
        @DemoEmail,
        UPPER(@DemoEmail),
        1,
        'AQAAAAIAAYagAAAAELaXnMG+YUDH4T9V4dYh+3Bf5s8J7k1L2m3N4o5P6q7R8s9T0u1V2w3X4y5Z6==', -- Placeholder hash
        NEWID(),
        NEWID(),
        'Demo',
        'User',
        'USD',
        SYSUTCDATETIME(),
        1,
        1,
        0,
        0,
        0
    );

    -- Assign User role
    DECLARE @UserRoleRoleId NVARCHAR(128);
    SELECT @UserRoleRoleId = [Id] FROM [dbo].[AspNetRoles] WHERE [Name] = 'User';
    IF @UserRoleRoleId IS NOT NULL
    BEGIN
        INSERT INTO [dbo].[AspNetUserRoles] ([UserId], [RoleId])
        VALUES (@DemoUserId, @UserRoleRoleId);
    END

    -- User settings
    INSERT INTO [dbo].[UserSettings] ([UserId], [Theme], [Language], [Currency])
    VALUES (@DemoUserId, 'system', 'en', 'USD');

    -- Notification preferences
    INSERT INTO [dbo].[NotificationPreferences] ([UserId])
    VALUES (@DemoUserId);
END
GO

-- ============================================================================
-- 3. DEMO CATEGORIES
-- ============================================================================
DECLARE @DemoUserId NVARCHAR(128) = 'demo-user-001';

IF NOT EXISTS (SELECT * FROM [dbo].[Categories] WHERE [UserId] = @DemoUserId)
BEGIN
    INSERT INTO [dbo].[Categories] ([Name], [Description], [Icon], [Color], [Type], [IsDefault], [DisplayOrder], [UserId], [CreatedAt])
    VALUES
        ('Food & Dining', 'Restaurants, groceries, and food delivery', 'utensils', '#ef4444', 1, 1, 1, @DemoUserId, SYSUTCDATETIME()),
        ('Transportation', 'Gas, public transit, rideshare, and parking', 'car', '#f97316', 1, 1, 2, @DemoUserId, SYSUTCDATETIME()),
        ('Bills & Utilities', 'Electric, water, internet, and phone bills', 'bolt', '#eab308', 1, 1, 3, @DemoUserId, SYSUTCDATETIME()),
        ('Entertainment', 'Movies, games, streaming, and hobbies', 'film', '#22c55e', 1, 1, 4, @DemoUserId, SYSUTCDATETIME()),
        ('Shopping', 'Clothing, electronics, and general shopping', 'shopping-bag', '#3b82f6', 1, 1, 5, @DemoUserId, SYSUTCDATETIME()),
        ('Health & Fitness', 'Gym, medical expenses, and wellness', 'heart', '#ec4899', 1, 1, 6, @DemoUserId, SYSUTCDATETIME()),
        ('Education', 'Courses, books, and learning materials', 'academic-cap', '#8b5cf6', 1, 1, 7, @DemoUserId, SYSUTCDATETIME()),
        ('Salary', 'Regular employment income', 'currency-dollar', '#22c55e', 0, 1, 8, @DemoUserId, SYSUTCDATETIME()),
        ('Freelance', 'Freelance and side project income', 'briefcase', '#14b8a6', 0, 1, 9, @DemoUserId, SYSUTCDATETIME()),
        ('Investments', 'Investment returns and dividends', 'chart-bar', '#06b6d4', 0, 1, 10, @DemoUserId, SYSUTCDATETIME()),
        ('Rent & Housing', 'Rent, mortgage, and home expenses', 'home', '#6366f1', 1, 1, 11, @DemoUserId, SYSUTCDATETIME()),
        ('Personal Care', 'Haircuts, cosmetics, and personal hygiene', 'user', '#d946ef', 1, 1, 12, @DemoUserId, SYSUTCDATETIME());
END
GO

-- ============================================================================
-- 4. DEMO ACCOUNTS
-- ============================================================================
DECLARE @DemoUserId NVARCHAR(128) = 'demo-user-001';
DECLARE @CheckingId INT, @SavingsId INT, @CashId INT, @BusinessId INT, @TravelId INT;

IF NOT EXISTS (SELECT * FROM [dbo].[Accounts] WHERE [UserId] = @DemoUserId)
BEGIN
    INSERT INTO [dbo].[Accounts] ([Name], [Description], [Type], [Balance], [Currency], [Color], [IncludeInBalance], [DisplayOrder], [UserId], [CreatedAt])
    VALUES
        ('Main Checking', 'Primary checking account for daily expenses', 0, 4250.75, 'USD', '#6366f1', 1, 1, @DemoUserId, DATEADD(DAY, -90, SYSUTCDATETIME())),
        ('Emergency Savings', 'Emergency fund savings account', 1, 12500.00, 'USD', '#22c55e', 1, 2, @DemoUserId, DATEADD(DAY, -90, SYSUTCDATETIME())),
        ('Cash Wallet', 'Cash on hand for small purchases', 3, 185.50, 'USD', '#f97316', 1, 3, @DemoUserId, DATEADD(DAY, -90, SYSUTCDATETIME())),
        ('Business Account', 'Freelance and business income', 7, 3200.00, 'USD', '#8b5cf6', 1, 4, @DemoUserId, DATEADD(DAY, -60, SYSUTCDATETIME())),
        ('Travel Fund', 'Savings for travel expenses', 8, 892.30, 'USD', '#06b6d4', 1, 5, @DemoUserId, DATEADD(DAY, -45, SYSUTCDATETIME()));

    SELECT @CheckingId = [Id] FROM [dbo].[Accounts] WHERE [Name] = 'Main Checking' AND [UserId] = @DemoUserId;
    SELECT @SavingsId = [Id] FROM [dbo].[Accounts] WHERE [Name] = 'Emergency Savings' AND [UserId] = @DemoUserId;
    SELECT @CashId = [Id] FROM [dbo].[Accounts] WHERE [Name] = 'Cash Wallet' AND [UserId] = @DemoUserId;
    SELECT @BusinessId = [Id] FROM [dbo].[Accounts] WHERE [Name] = 'Business Account' AND [UserId] = @DemoUserId;
    SELECT @TravelId = [Id] FROM [dbo].[Accounts] WHERE [Name] = 'Travel Fund' AND [UserId] = @DemoUserId;

    -- ============================================================================
    -- 5. DEMO TRANSACTIONS
    -- ============================================================================
    DECLARE @SalaryId INT, @FreelanceId INT, @FoodId INT, @TransportId INT, @BillsId INT;
    DECLARE @EntertainmentId INT, @ShoppingId INT, @HealthId INT, @EducationId INT;
    DECLARE @RentId INT, @PersonalCareId INT;

    SELECT @SalaryId = [Id] FROM [dbo].[Categories] WHERE [Name] = 'Salary' AND [UserId] = @DemoUserId;
    SELECT @FreelanceId = [Id] FROM [dbo].[Categories] WHERE [Name] = 'Freelance' AND [UserId] = @DemoUserId;
    SELECT @FoodId = [Id] FROM [dbo].[Categories] WHERE [Name] = 'Food & Dining' AND [UserId] = @DemoUserId;
    SELECT @TransportId = [Id] FROM [dbo].[Categories] WHERE [Name] = 'Transportation' AND [UserId] = @DemoUserId;
    SELECT @BillsId = [Id] FROM [dbo].[Categories] WHERE [Name] = 'Bills & Utilities' AND [UserId] = @DemoUserId;
    SELECT @EntertainmentId = [Id] FROM [dbo].[Categories] WHERE [Name] = 'Entertainment' AND [UserId] = @DemoUserId;
    SELECT @ShoppingId = [Id] FROM [dbo].[Categories] WHERE [Name] = 'Shopping' AND [UserId] = @DemoUserId;
    SELECT @HealthId = [Id] FROM [dbo].[Categories] WHERE [Name] = 'Health & Fitness' AND [UserId] = @DemoUserId;
    SELECT @EducationId = [Id] FROM [dbo].[Categories] WHERE [Name] = 'Education' AND [UserId] = @DemoUserId;
    SELECT @RentId = [Id] FROM [dbo].[Categories] WHERE [Name] = 'Rent & Housing' AND [UserId] = @DemoUserId;
    SELECT @PersonalCareId = [Id] FROM [dbo].[Categories] WHERE [Name] = 'Personal Care' AND [UserId] = @DemoUserId;

    INSERT INTO [dbo].[Transactions] ([Amount], [Currency], [Type], [Date], [Payee], [Note], [PaymentMethod], [AccountId], [CategoryId], [UserId], [CreatedAt])
    VALUES
        -- Income
        (5200.00, 'USD', 0, DATEADD(DAY, -2, SYSUTCDATETIME()), 'Acme Corp', 'Monthly salary', 3, @CheckingId, @SalaryId, @DemoUserId, DATEADD(DAY, -2, SYSUTCDATETIME())),
        (750.00, 'USD', 0, DATEADD(DAY, -5, SYSUTCDATETIME()), 'TechStart Inc', 'Web development project', 3, @CheckingId, @FreelanceId, @DemoUserId, DATEADD(DAY, -5, SYSUTCDATETIME())),
        -- Expenses
        (1400.00, 'USD', 1, DATEADD(DAY, -1, SYSUTCDATETIME()), 'Oakwood Apartments', 'Monthly rent', 3, @CheckingId, @RentId, @DemoUserId, DATEADD(DAY, -1, SYSUTCDATETIME())),
        (89.50, 'USD', 1, DATEADD(DAY, -3, SYSUTCDATETIME()), 'City Power Co', 'Electric bill - June', 3, @CheckingId, @BillsId, @DemoUserId, DATEADD(DAY, -3, SYSUTCDATETIME())),
        (65.00, 'USD', 1, DATEADD(DAY, -3, SYSUTCDATETIME()), 'FastNet ISP', 'Internet - June', 3, @CheckingId, @BillsId, @DemoUserId, DATEADD(DAY, -3, SYSUTCDATETIME())),
        (127.34, 'USD', 1, DATEADD(DAY, -4, SYSUTCDATETIME()), 'Whole Foods', 'Weekly groceries', 2, @CheckingId, @FoodId, @DemoUserId, DATEADD(DAY, -4, SYSUTCDATETIME())),
        (68.50, 'USD', 1, DATEADD(DAY, -6, SYSUTCDATETIME()), 'Italian Bistro', 'Dinner with friends', 3, @BusinessId, @FoodId, @DemoUserId, DATEADD(DAY, -6, SYSUTCDATETIME())),
        (52.30, 'USD', 1, DATEADD(DAY, -5, SYSUTCDATETIME()), 'Shell Gas Station', 'Filled up tank', 2, @CheckingId, @TransportId, @DemoUserId, DATEADD(DAY, -5, SYSUTCDATETIME())),
        (15.99, 'USD', 1, DATEADD(DAY, -7, SYSUTCDATETIME()), 'Netflix', 'Monthly subscription', 3, @BusinessId, @EntertainmentId, @DemoUserId, DATEADD(DAY, -7, SYSUTCDATETIME())),
        (9.99, 'USD', 1, DATEADD(DAY, -7, SYSUTCDATETIME()), 'Spotify', 'Music subscription', 3, @BusinessId, @EntertainmentId, @DemoUserId, DATEADD(DAY, -7, SYSUTCDATETIME())),
        (49.99, 'USD', 1, DATEADD(DAY, -10, SYSUTCDATETIME()), 'FitLife Gym', 'Monthly membership', 2, @CheckingId, @HealthId, @DemoUserId, DATEADD(DAY, -10, SYSUTCDATETIME())),
        (134.97, 'USD', 1, DATEADD(DAY, -8, SYSUTCDATETIME()), 'Amazon', 'Office supplies and books', 3, @BusinessId, @ShoppingId, @DemoUserId, DATEADD(DAY, -8, SYSUTCDATETIME())),
        (12.50, 'USD', 1, DATEADD(DAY, -2, SYSUTCDATETIME()), 'Blue Bottle Coffee', 'Coffee and pastry', 0, @CashId, @FoodId, @DemoUserId, DATEADD(DAY, -2, SYSUTCDATETIME())),
        (12.99, 'USD', 1, DATEADD(DAY, -12, SYSUTCDATETIME()), 'Udemy', 'React Masterclass course', 3, @BusinessId, @EducationId, @DemoUserId, DATEADD(DAY, -12, SYSUTCDATETIME())),
        (35.00, 'USD', 1, DATEADD(DAY, -14, SYSUTCDATETIME()), 'Style Studio', 'Haircut and styling', 0, @CashId, @PersonalCareId, @DemoUserId, DATEADD(DAY, -14, SYSUTCDATETIME())),
        -- Transfer
        (500.00, 'USD', 2, DATEADD(DAY, -2, SYSUTCDATETIME()), NULL, 'Monthly savings transfer', 3, @CheckingId, NULL, @DemoUserId, DATEADD(DAY, -2, SYSUTCDATETIME()));

    -- ============================================================================
    -- 6. DEMO BUDGETS
    -- ============================================================================
    DECLARE @MonthStart DATETIME2 = DATEFROMPARTS(YEAR(SYSUTCDATETIME()), MONTH(SYSUTCDATETIME()), 1);

    INSERT INTO [dbo].[Budgets] ([Name], [Amount], [Currency], [Period], [StartDate], [AlertThreshold], [CategoryId], [UserId], [CreatedAt])
    VALUES
        ('Food & Dining', 400.00, 'USD', 1, @MonthStart, 80, @FoodId, @DemoUserId, DATEADD(DAY, -30, SYSUTCDATETIME())),
        ('Transportation', 150.00, 'USD', 1, @MonthStart, 80, @TransportId, @DemoUserId, DATEADD(DAY, -30, SYSUTCDATETIME())),
        ('Entertainment', 100.00, 'USD', 1, @MonthStart, 75, @EntertainmentId, @DemoUserId, DATEADD(DAY, -30, SYSUTCDATETIME())),
        ('Shopping', 200.00, 'USD', 1, @MonthStart, 80, @ShoppingId, @DemoUserId, DATEADD(DAY, -30, SYSUTCDATETIME())),
        ('Overall Monthly', 2500.00, 'USD', 1, @MonthStart, 85, NULL, @DemoUserId, DATEADD(DAY, -30, SYSUTCDATETIME()));
END
GO

PRINT 'Seed data inserted successfully.';
GO
