using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Carmen.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddLatestChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TermNameLocal",
                table: "PaymentTerms",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "AssetCategories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    CategoryCode = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CategoryName = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CategoryNameLocal = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Description = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    DefaultUsefulLifeMonths = table.Column<int>(type: "int", nullable: false),
                    DefaultDepreciationMethod = table.Column<int>(type: "int", nullable: false),
                    DefaultSalvagePercent = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    DefaultAssetAccountId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    DefaultAccumDepreciationAccountId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    DefaultDepreciationExpenseAccountId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    DefaultGainLossAccountId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    AssetCodePrefix = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Notes = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TenantId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssetCategories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AssetCategories_ChartOfAccounts_DefaultAccumDepreciationAcco~",
                        column: x => x.DefaultAccumDepreciationAccountId,
                        principalTable: "ChartOfAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_AssetCategories_ChartOfAccounts_DefaultAssetAccountId",
                        column: x => x.DefaultAssetAccountId,
                        principalTable: "ChartOfAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_AssetCategories_ChartOfAccounts_DefaultDepreciationExpenseAc~",
                        column: x => x.DefaultDepreciationExpenseAccountId,
                        principalTable: "ChartOfAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_AssetCategories_ChartOfAccounts_DefaultGainLossAccountId",
                        column: x => x.DefaultGainLossAccountId,
                        principalTable: "ChartOfAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Customers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    CustomerCode = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CustomerName = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CustomerNameLocal = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ContactPerson = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Email = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Phone = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Fax = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Address = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    City = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    State = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PostalCode = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Country = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TaxId = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    DefaultPaymentTermId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    CurrencyCode = table.Column<string>(type: "varchar(3)", maxLength: 3, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreditLimit = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CurrentBalance = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    DefaultTax1ProfileId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    DefaultTax2ProfileId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    DefaultWhtProfileId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    DefaultArAccountId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    DefaultRevenueAccountId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    BankName = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    BankAccountNumber = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    BankBranch = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    BankSwiftCode = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Notes = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TenantId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Customers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Customers_ChartOfAccounts_DefaultArAccountId",
                        column: x => x.DefaultArAccountId,
                        principalTable: "ChartOfAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Customers_ChartOfAccounts_DefaultRevenueAccountId",
                        column: x => x.DefaultRevenueAccountId,
                        principalTable: "ChartOfAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Customers_PaymentTerms_DefaultPaymentTermId",
                        column: x => x.DefaultPaymentTermId,
                        principalTable: "PaymentTerms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Customers_TaxProfiles_DefaultTax1ProfileId",
                        column: x => x.DefaultTax1ProfileId,
                        principalTable: "TaxProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Customers_TaxProfiles_DefaultTax2ProfileId",
                        column: x => x.DefaultTax2ProfileId,
                        principalTable: "TaxProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Customers_TaxProfiles_DefaultWhtProfileId",
                        column: x => x.DefaultWhtProfileId,
                        principalTable: "TaxProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "EmailLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    ToEmail = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Subject = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Body = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TemplateName = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Status = table.Column<int>(type: "int", nullable: false),
                    SentAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    ErrorMessage = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    RetryCount = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TenantId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmailLogs", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "NotificationPreferences",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    UserId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Type = table.Column<int>(type: "int", nullable: false),
                    InAppEnabled = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    EmailEnabled = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificationPreferences", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    UserId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Priority = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Message = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ActionUrl = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    EntityType = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    EntityId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    IsRead = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    ReadAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Data = table.Column<string>(type: "varchar(4000)", maxLength: 4000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TenantId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "RecurringVouchers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Name = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Description = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Frequency = table.Column<int>(type: "int", nullable: false),
                    CustomIntervalDays = table.Column<int>(type: "int", nullable: true),
                    StartDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    NextExecutionDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    LastExecutionDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    CurrencyCode = table.Column<string>(type: "varchar(3)", maxLength: 3, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ExchangeRate = table.Column<decimal>(type: "decimal(18,6)", precision: 18, scale: 6, nullable: false),
                    Reference = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TotalDebit = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalCredit = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    ExecutionCount = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TenantId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecurringVouchers", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "ReportTemplates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Name = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Description = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    DataSourceType = table.Column<int>(type: "int", nullable: false),
                    IsPublic = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    DefaultOutputFormat = table.Column<int>(type: "int", nullable: false),
                    PageOrientation = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TenantId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReportTemplates", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "WorkflowDefinitions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Name = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Description = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    EntityType = table.Column<int>(type: "int", nullable: false),
                    AmountThreshold = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    IsDefault = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TenantId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkflowDefinitions", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Assets",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    AssetCode = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    AssetName = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    AssetNameLocal = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Description = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    SerialNumber = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Barcode = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    AssetCategoryId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    LocationDescription = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    DepartmentId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    Condition = table.Column<int>(type: "int", nullable: false),
                    AcquisitionDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    AcquisitionCost = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CurrencyCode = table.Column<string>(type: "varchar(3)", maxLength: 3, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ExchangeRate = table.Column<decimal>(type: "decimal(18,6)", precision: 18, scale: 6, nullable: false),
                    AcquisitionCostBase = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    VendorId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    ApInvoiceId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    PurchaseReference = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    DepreciationMethod = table.Column<int>(type: "int", nullable: false),
                    UsefulLifeMonths = table.Column<int>(type: "int", nullable: false),
                    SalvageValue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    DepreciationStartDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    MonthlyDepreciation = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    AccumulatedDepreciation = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CurrentValue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    DepreciatedMonths = table.Column<int>(type: "int", nullable: false),
                    IsFullyDepreciated = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    AssetAccountId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    AccumDepreciationAccountId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    DepreciationExpenseAccountId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    DisposedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    DisposalValue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    GainLossAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    Notes = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TenantId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Assets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Assets_ApInvoices_ApInvoiceId",
                        column: x => x.ApInvoiceId,
                        principalTable: "ApInvoices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Assets_AssetCategories_AssetCategoryId",
                        column: x => x.AssetCategoryId,
                        principalTable: "AssetCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Assets_ChartOfAccounts_AccumDepreciationAccountId",
                        column: x => x.AccumDepreciationAccountId,
                        principalTable: "ChartOfAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Assets_ChartOfAccounts_AssetAccountId",
                        column: x => x.AssetAccountId,
                        principalTable: "ChartOfAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Assets_ChartOfAccounts_DepreciationExpenseAccountId",
                        column: x => x.DepreciationExpenseAccountId,
                        principalTable: "ChartOfAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Assets_Departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalTable: "Departments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Assets_Vendors_VendorId",
                        column: x => x.VendorId,
                        principalTable: "Vendors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "ArInvoices",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    InvoiceNumber = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CustomerReference = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    InvoiceDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    DueDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CustomerId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    CurrencyCode = table.Column<string>(type: "varchar(3)", maxLength: 3, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ExchangeRate = table.Column<decimal>(type: "decimal(18,6)", precision: 18, scale: 6, nullable: false),
                    SubTotal = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Tax1ProfileId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    Tax1Amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Tax2ProfileId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    Tax2Amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    WhtProfileId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    WhtAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    NetAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    PaidAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    BalanceAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    SubTotalBase = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalAmountBase = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    NetAmountBase = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    PaymentTermId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    Description = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Reference = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FiscalPeriodId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    ApprovedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    ApprovedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PostedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    PostedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    RejectionReason = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    VoidReason = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    JournalVoucherId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    ArAccountId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TenantId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ArInvoices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ArInvoices_ChartOfAccounts_ArAccountId",
                        column: x => x.ArAccountId,
                        principalTable: "ChartOfAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ArInvoices_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ArInvoices_FiscalPeriods_FiscalPeriodId",
                        column: x => x.FiscalPeriodId,
                        principalTable: "FiscalPeriods",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ArInvoices_JournalVouchers_JournalVoucherId",
                        column: x => x.JournalVoucherId,
                        principalTable: "JournalVouchers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ArInvoices_PaymentTerms_PaymentTermId",
                        column: x => x.PaymentTermId,
                        principalTable: "PaymentTerms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ArInvoices_TaxProfiles_Tax1ProfileId",
                        column: x => x.Tax1ProfileId,
                        principalTable: "TaxProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ArInvoices_TaxProfiles_Tax2ProfileId",
                        column: x => x.Tax2ProfileId,
                        principalTable: "TaxProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ArInvoices_TaxProfiles_WhtProfileId",
                        column: x => x.WhtProfileId,
                        principalTable: "TaxProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "ArReceipts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    ReceiptNumber = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ReceiptDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CustomerId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    ReceiptMethod = table.Column<int>(type: "int", nullable: false),
                    CheckNumber = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CheckDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    BankReference = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CurrencyCode = table.Column<string>(type: "varchar(3)", maxLength: 3, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ExchangeRate = table.Column<decimal>(type: "decimal(18,6)", precision: 18, scale: 6, nullable: false),
                    TotalAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalAmountBase = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    AllocatedAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    UnallocatedAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    BankAccountId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Description = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Reference = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PayerName = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FiscalPeriodId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    ApprovedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    ApprovedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PostedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    PostedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    VoidReason = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    JournalVoucherId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TenantId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ArReceipts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ArReceipts_ChartOfAccounts_BankAccountId",
                        column: x => x.BankAccountId,
                        principalTable: "ChartOfAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ArReceipts_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ArReceipts_FiscalPeriods_FiscalPeriodId",
                        column: x => x.FiscalPeriodId,
                        principalTable: "FiscalPeriods",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ArReceipts_JournalVouchers_JournalVoucherId",
                        column: x => x.JournalVoucherId,
                        principalTable: "JournalVouchers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "RecurringVoucherLines",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    RecurringVoucherId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    LineNumber = table.Column<int>(type: "int", nullable: false),
                    AccountId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    DebitAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CreditAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Description = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Reference = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    DepartmentId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TenantId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecurringVoucherLines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RecurringVoucherLines_ChartOfAccounts_AccountId",
                        column: x => x.AccountId,
                        principalTable: "ChartOfAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RecurringVoucherLines_RecurringVouchers_RecurringVoucherId",
                        column: x => x.RecurringVoucherId,
                        principalTable: "RecurringVouchers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "ReportTemplateColumns",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    ReportTemplateId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    FieldName = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    DisplayName = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ColumnType = table.Column<int>(type: "int", nullable: false),
                    Width = table.Column<int>(type: "int", nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    AggregateFunction = table.Column<int>(type: "int", nullable: false),
                    SortDirection = table.Column<int>(type: "int", nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TenantId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReportTemplateColumns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReportTemplateColumns_ReportTemplates_ReportTemplateId",
                        column: x => x.ReportTemplateId,
                        principalTable: "ReportTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "ReportTemplateFilters",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    ReportTemplateId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    FieldName = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Operator = table.Column<int>(type: "int", nullable: false),
                    Value = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Value2 = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TenantId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReportTemplateFilters", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReportTemplateFilters_ReportTemplates_ReportTemplateId",
                        column: x => x.ReportTemplateId,
                        principalTable: "ReportTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "ReportTemplateGroups",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    ReportTemplateId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    FieldName = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Order = table.Column<int>(type: "int", nullable: false),
                    ShowSubtotals = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    SortDirection = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TenantId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReportTemplateGroups", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReportTemplateGroups_ReportTemplates_ReportTemplateId",
                        column: x => x.ReportTemplateId,
                        principalTable: "ReportTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "ScheduledReports",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    ReportTemplateId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Frequency = table.Column<int>(type: "int", nullable: false),
                    CronExpression = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    Recipients = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    OutputFormat = table.Column<int>(type: "int", nullable: false),
                    LastRunAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    NextRunAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TenantId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScheduledReports", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ScheduledReports_ReportTemplates_ReportTemplateId",
                        column: x => x.ReportTemplateId,
                        principalTable: "ReportTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "WorkflowInstances",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    DefinitionId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    EntityType = table.Column<int>(type: "int", nullable: false),
                    EntityId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    EntityNumber = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CurrentStepOrder = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    SubmittedByUserId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    SubmittedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TenantId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkflowInstances", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkflowInstances_WorkflowDefinitions_DefinitionId",
                        column: x => x.DefinitionId,
                        principalTable: "WorkflowDefinitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "WorkflowSteps",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    DefinitionId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    StepOrder = table.Column<int>(type: "int", nullable: false),
                    StepName = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ApproverUserId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    ApproverRoleId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    AllowDelegation = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TenantId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkflowSteps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkflowSteps_WorkflowDefinitions_DefinitionId",
                        column: x => x.DefinitionId,
                        principalTable: "WorkflowDefinitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "AssetDisposals",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    AssetId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    DisposalDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    DisposalMethod = table.Column<int>(type: "int", nullable: false),
                    DisposalValue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    DisposalCost = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    NetProceeds = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    BookValueAtDisposal = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    AccumulatedDepreciationAtDisposal = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    GainLossAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    BuyerName = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Reference = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Reason = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Notes = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IsPosted = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    JournalVoucherId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    PostedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    PostedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ApprovedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ApprovedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TenantId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssetDisposals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AssetDisposals_Assets_AssetId",
                        column: x => x.AssetId,
                        principalTable: "Assets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AssetDisposals_JournalVouchers_JournalVoucherId",
                        column: x => x.JournalVoucherId,
                        principalTable: "JournalVouchers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "DepreciationSchedules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    AssetId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    FiscalPeriodId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    ScheduleNumber = table.Column<int>(type: "int", nullable: false),
                    ScheduleDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    OpeningValue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    DepreciationAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    DepreciationAmountBase = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    ClosingValue = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    AccumulatedDepreciation = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    IsPosted = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    JournalVoucherId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    PostedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    PostedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Notes = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TenantId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DepreciationSchedules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DepreciationSchedules_Assets_AssetId",
                        column: x => x.AssetId,
                        principalTable: "Assets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DepreciationSchedules_FiscalPeriods_FiscalPeriodId",
                        column: x => x.FiscalPeriodId,
                        principalTable: "FiscalPeriods",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DepreciationSchedules_JournalVouchers_JournalVoucherId",
                        column: x => x.JournalVoucherId,
                        principalTable: "JournalVouchers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "ArInvoiceLines",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    ArInvoiceId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    LineNumber = table.Column<int>(type: "int", nullable: false),
                    AccountId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Description = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Quantity = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    Unit = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UnitPrice = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    AmountBase = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    DiscountPercent = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    NetAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Tax1ProfileId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    Tax1Amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    DepartmentId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    ProjectCode = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TenantId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ArInvoiceLines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ArInvoiceLines_ArInvoices_ArInvoiceId",
                        column: x => x.ArInvoiceId,
                        principalTable: "ArInvoices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ArInvoiceLines_ChartOfAccounts_AccountId",
                        column: x => x.AccountId,
                        principalTable: "ChartOfAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ArInvoiceLines_Departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalTable: "Departments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ArInvoiceLines_TaxProfiles_Tax1ProfileId",
                        column: x => x.Tax1ProfileId,
                        principalTable: "TaxProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "ArReceiptLines",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    ArReceiptId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    ArInvoiceId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    LineNumber = table.Column<int>(type: "int", nullable: false),
                    AmountAllocated = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    AmountAllocatedBase = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    WhtAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    ExchangeGainLoss = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Notes = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TenantId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ArReceiptLines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ArReceiptLines_ArInvoices_ArInvoiceId",
                        column: x => x.ArInvoiceId,
                        principalTable: "ArInvoices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ArReceiptLines_ArReceipts_ArReceiptId",
                        column: x => x.ArReceiptId,
                        principalTable: "ArReceipts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "WorkflowHistories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    InstanceId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    StepOrder = table.Column<int>(type: "int", nullable: false),
                    StepName = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ActionByUserId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Action = table.Column<int>(type: "int", nullable: false),
                    Comment = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ActionAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreatedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    UpdatedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TenantId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkflowHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkflowHistories_WorkflowInstances_InstanceId",
                        column: x => x.InstanceId,
                        principalTable: "WorkflowInstances",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_ArInvoiceLines_AccountId",
                table: "ArInvoiceLines",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_ArInvoiceLines_ArInvoiceId_LineNumber",
                table: "ArInvoiceLines",
                columns: new[] { "ArInvoiceId", "LineNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_ArInvoiceLines_DepartmentId",
                table: "ArInvoiceLines",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_ArInvoiceLines_Tax1ProfileId",
                table: "ArInvoiceLines",
                column: "Tax1ProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_ArInvoices_ArAccountId",
                table: "ArInvoices",
                column: "ArAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_ArInvoices_CustomerId",
                table: "ArInvoices",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_ArInvoices_FiscalPeriodId",
                table: "ArInvoices",
                column: "FiscalPeriodId");

            migrationBuilder.CreateIndex(
                name: "IX_ArInvoices_JournalVoucherId",
                table: "ArInvoices",
                column: "JournalVoucherId");

            migrationBuilder.CreateIndex(
                name: "IX_ArInvoices_PaymentTermId",
                table: "ArInvoices",
                column: "PaymentTermId");

            migrationBuilder.CreateIndex(
                name: "IX_ArInvoices_Tax1ProfileId",
                table: "ArInvoices",
                column: "Tax1ProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_ArInvoices_Tax2ProfileId",
                table: "ArInvoices",
                column: "Tax2ProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_ArInvoices_TenantId_CustomerId_DueDate",
                table: "ArInvoices",
                columns: new[] { "TenantId", "CustomerId", "DueDate" });

            migrationBuilder.CreateIndex(
                name: "IX_ArInvoices_TenantId_InvoiceDate",
                table: "ArInvoices",
                columns: new[] { "TenantId", "InvoiceDate" });

            migrationBuilder.CreateIndex(
                name: "IX_ArInvoices_TenantId_InvoiceNumber",
                table: "ArInvoices",
                columns: new[] { "TenantId", "InvoiceNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ArInvoices_TenantId_Status",
                table: "ArInvoices",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_ArInvoices_WhtProfileId",
                table: "ArInvoices",
                column: "WhtProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_ArReceiptLines_ArInvoiceId",
                table: "ArReceiptLines",
                column: "ArInvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_ArReceiptLines_ArReceiptId_LineNumber",
                table: "ArReceiptLines",
                columns: new[] { "ArReceiptId", "LineNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_ArReceipts_BankAccountId",
                table: "ArReceipts",
                column: "BankAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_ArReceipts_CustomerId",
                table: "ArReceipts",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_ArReceipts_FiscalPeriodId",
                table: "ArReceipts",
                column: "FiscalPeriodId");

            migrationBuilder.CreateIndex(
                name: "IX_ArReceipts_JournalVoucherId",
                table: "ArReceipts",
                column: "JournalVoucherId");

            migrationBuilder.CreateIndex(
                name: "IX_ArReceipts_TenantId_CustomerId_ReceiptDate",
                table: "ArReceipts",
                columns: new[] { "TenantId", "CustomerId", "ReceiptDate" });

            migrationBuilder.CreateIndex(
                name: "IX_ArReceipts_TenantId_ReceiptDate",
                table: "ArReceipts",
                columns: new[] { "TenantId", "ReceiptDate" });

            migrationBuilder.CreateIndex(
                name: "IX_ArReceipts_TenantId_ReceiptNumber",
                table: "ArReceipts",
                columns: new[] { "TenantId", "ReceiptNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ArReceipts_TenantId_Status",
                table: "ArReceipts",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_AssetCategories_DefaultAccumDepreciationAccountId",
                table: "AssetCategories",
                column: "DefaultAccumDepreciationAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_AssetCategories_DefaultAssetAccountId",
                table: "AssetCategories",
                column: "DefaultAssetAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_AssetCategories_DefaultDepreciationExpenseAccountId",
                table: "AssetCategories",
                column: "DefaultDepreciationExpenseAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_AssetCategories_DefaultGainLossAccountId",
                table: "AssetCategories",
                column: "DefaultGainLossAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_AssetCategories_TenantId_CategoryCode",
                table: "AssetCategories",
                columns: new[] { "TenantId", "CategoryCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AssetCategories_TenantId_IsActive",
                table: "AssetCategories",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_AssetDisposals_AssetId",
                table: "AssetDisposals",
                column: "AssetId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AssetDisposals_JournalVoucherId",
                table: "AssetDisposals",
                column: "JournalVoucherId");

            migrationBuilder.CreateIndex(
                name: "IX_AssetDisposals_TenantId_AssetId",
                table: "AssetDisposals",
                columns: new[] { "TenantId", "AssetId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AssetDisposals_TenantId_DisposalDate",
                table: "AssetDisposals",
                columns: new[] { "TenantId", "DisposalDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Assets_AccumDepreciationAccountId",
                table: "Assets",
                column: "AccumDepreciationAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_Assets_ApInvoiceId",
                table: "Assets",
                column: "ApInvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_Assets_AssetAccountId",
                table: "Assets",
                column: "AssetAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_Assets_AssetCategoryId",
                table: "Assets",
                column: "AssetCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Assets_DepartmentId",
                table: "Assets",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Assets_DepreciationExpenseAccountId",
                table: "Assets",
                column: "DepreciationExpenseAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_Assets_TenantId_AcquisitionDate",
                table: "Assets",
                columns: new[] { "TenantId", "AcquisitionDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Assets_TenantId_AssetCategoryId",
                table: "Assets",
                columns: new[] { "TenantId", "AssetCategoryId" });

            migrationBuilder.CreateIndex(
                name: "IX_Assets_TenantId_AssetCode",
                table: "Assets",
                columns: new[] { "TenantId", "AssetCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Assets_TenantId_DepartmentId",
                table: "Assets",
                columns: new[] { "TenantId", "DepartmentId" });

            migrationBuilder.CreateIndex(
                name: "IX_Assets_TenantId_Status",
                table: "Assets",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Assets_VendorId",
                table: "Assets",
                column: "VendorId");

            migrationBuilder.CreateIndex(
                name: "IX_Customers_DefaultArAccountId",
                table: "Customers",
                column: "DefaultArAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_Customers_DefaultPaymentTermId",
                table: "Customers",
                column: "DefaultPaymentTermId");

            migrationBuilder.CreateIndex(
                name: "IX_Customers_DefaultRevenueAccountId",
                table: "Customers",
                column: "DefaultRevenueAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_Customers_DefaultTax1ProfileId",
                table: "Customers",
                column: "DefaultTax1ProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_Customers_DefaultTax2ProfileId",
                table: "Customers",
                column: "DefaultTax2ProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_Customers_DefaultWhtProfileId",
                table: "Customers",
                column: "DefaultWhtProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_Customers_TenantId_CustomerCode",
                table: "Customers",
                columns: new[] { "TenantId", "CustomerCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Customers_TenantId_IsActive",
                table: "Customers",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_DepreciationSchedules_AssetId",
                table: "DepreciationSchedules",
                column: "AssetId");

            migrationBuilder.CreateIndex(
                name: "IX_DepreciationSchedules_FiscalPeriodId",
                table: "DepreciationSchedules",
                column: "FiscalPeriodId");

            migrationBuilder.CreateIndex(
                name: "IX_DepreciationSchedules_JournalVoucherId",
                table: "DepreciationSchedules",
                column: "JournalVoucherId");

            migrationBuilder.CreateIndex(
                name: "IX_DepreciationSchedules_TenantId_AssetId_FiscalPeriodId",
                table: "DepreciationSchedules",
                columns: new[] { "TenantId", "AssetId", "FiscalPeriodId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DepreciationSchedules_TenantId_FiscalPeriodId_IsPosted",
                table: "DepreciationSchedules",
                columns: new[] { "TenantId", "FiscalPeriodId", "IsPosted" });

            migrationBuilder.CreateIndex(
                name: "IX_DepreciationSchedules_TenantId_ScheduleDate",
                table: "DepreciationSchedules",
                columns: new[] { "TenantId", "ScheduleDate" });

            migrationBuilder.CreateIndex(
                name: "IX_EmailLogs_CreatedAt",
                table: "EmailLogs",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_EmailLogs_TenantId_Status",
                table: "EmailLogs",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_NotificationPreferences_UserId_Type",
                table: "NotificationPreferences",
                columns: new[] { "UserId", "Type" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_TenantId_UserId_CreatedAt",
                table: "Notifications",
                columns: new[] { "TenantId", "UserId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_TenantId_UserId_IsRead",
                table: "Notifications",
                columns: new[] { "TenantId", "UserId", "IsRead" });

            migrationBuilder.CreateIndex(
                name: "IX_RecurringVoucherLines_AccountId",
                table: "RecurringVoucherLines",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_RecurringVoucherLines_RecurringVoucherId_LineNumber",
                table: "RecurringVoucherLines",
                columns: new[] { "RecurringVoucherId", "LineNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_RecurringVouchers_TenantId_IsActive_NextExecutionDate",
                table: "RecurringVouchers",
                columns: new[] { "TenantId", "IsActive", "NextExecutionDate" });

            migrationBuilder.CreateIndex(
                name: "IX_RecurringVouchers_TenantId_Name",
                table: "RecurringVouchers",
                columns: new[] { "TenantId", "Name" });

            migrationBuilder.CreateIndex(
                name: "IX_ReportTemplateColumns_TemplateId_Order",
                table: "ReportTemplateColumns",
                columns: new[] { "ReportTemplateId", "Order" });

            migrationBuilder.CreateIndex(
                name: "IX_ReportTemplateFilters_ReportTemplateId",
                table: "ReportTemplateFilters",
                column: "ReportTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_ReportTemplateGroups_TemplateId_Order",
                table: "ReportTemplateGroups",
                columns: new[] { "ReportTemplateId", "Order" });

            migrationBuilder.CreateIndex(
                name: "IX_ReportTemplates_TenantId_Name",
                table: "ReportTemplates",
                columns: new[] { "TenantId", "Name" });

            migrationBuilder.CreateIndex(
                name: "IX_ScheduledReports_ReportTemplateId",
                table: "ScheduledReports",
                column: "ReportTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduledReports_TenantId_IsActive",
                table: "ScheduledReports",
                columns: new[] { "TenantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowDefinitions_TenantId_EntityType_IsActive",
                table: "WorkflowDefinitions",
                columns: new[] { "TenantId", "EntityType", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowHistories_InstanceId_ActionAt",
                table: "WorkflowHistories",
                columns: new[] { "InstanceId", "ActionAt" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowInstances_DefinitionId",
                table: "WorkflowInstances",
                column: "DefinitionId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowInstances_TenantId_EntityType_EntityId",
                table: "WorkflowInstances",
                columns: new[] { "TenantId", "EntityType", "EntityId" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowInstances_TenantId_Status",
                table: "WorkflowInstances",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowSteps_DefinitionId_StepOrder",
                table: "WorkflowSteps",
                columns: new[] { "DefinitionId", "StepOrder" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ArInvoiceLines");

            migrationBuilder.DropTable(
                name: "ArReceiptLines");

            migrationBuilder.DropTable(
                name: "AssetDisposals");

            migrationBuilder.DropTable(
                name: "DepreciationSchedules");

            migrationBuilder.DropTable(
                name: "EmailLogs");

            migrationBuilder.DropTable(
                name: "NotificationPreferences");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "RecurringVoucherLines");

            migrationBuilder.DropTable(
                name: "ReportTemplateColumns");

            migrationBuilder.DropTable(
                name: "ReportTemplateFilters");

            migrationBuilder.DropTable(
                name: "ReportTemplateGroups");

            migrationBuilder.DropTable(
                name: "ScheduledReports");

            migrationBuilder.DropTable(
                name: "WorkflowHistories");

            migrationBuilder.DropTable(
                name: "WorkflowSteps");

            migrationBuilder.DropTable(
                name: "ArInvoices");

            migrationBuilder.DropTable(
                name: "ArReceipts");

            migrationBuilder.DropTable(
                name: "Assets");

            migrationBuilder.DropTable(
                name: "RecurringVouchers");

            migrationBuilder.DropTable(
                name: "ReportTemplates");

            migrationBuilder.DropTable(
                name: "WorkflowInstances");

            migrationBuilder.DropTable(
                name: "Customers");

            migrationBuilder.DropTable(
                name: "AssetCategories");

            migrationBuilder.DropTable(
                name: "WorkflowDefinitions");

            migrationBuilder.DropColumn(
                name: "TermNameLocal",
                table: "PaymentTerms");
        }
    }
}
