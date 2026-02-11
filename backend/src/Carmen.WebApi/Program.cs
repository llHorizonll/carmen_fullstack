using System.Text;
using Carmen.Application.Interfaces;
using Carmen.Application.Jobs;
using Carmen.Application.Services.Auth;
using Carmen.Application.Services.Configuration;
using Carmen.Application.Services.GL;
using Carmen.Application.Services.AP;
using Carmen.Application.Services.AR;
using Carmen.Application.Services.Asset;
using Carmen.Application.Services.Dashboard;
using Carmen.Application.Services.Report;
using Carmen.Application.Services.Settings;
using Carmen.Infrastructure.Data;
using Carmen.Infrastructure.Jobs;
using Carmen.Infrastructure.Services;
using Carmen.Infrastructure.Services.Reports;
using Carmen.Infrastructure.Services.Reports.Predefined;
using Hangfire;
using Hangfire.MySql;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .CreateLogger();

builder.Host.UseSerilog();

// Add DbContext
// Database and Hangfire are skipped in Testing (integration tests use InMemory provider)
if (builder.Environment.IsEnvironment("Testing"))
{
    // InMemory DbContext will be registered by TestWebApplicationFactory
    builder.Services.AddDbContext<CarmenDbContext>(options =>
        options.UseInMemoryDatabase("TestDb"));
}
else
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("Connection string not configured");

    builder.Services.AddDbContext<CarmenDbContext>(options =>
        options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

    // === Hangfire Configuration ===
    builder.Services.AddHangfire(config => config
        .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
        .UseSimpleAssemblyNameTypeSerializer()
        .UseRecommendedSerializerSettings()
        .UseStorage(new MySqlStorage(connectionString, new MySqlStorageOptions
        {
            TablesPrefix = "Hangfire_",
            PrepareSchemaIfNecessary = true,
            QueuePollInterval = TimeSpan.FromSeconds(15),
            JobExpirationCheckInterval = TimeSpan.FromHours(1),
            CountersAggregateInterval = TimeSpan.FromMinutes(5),
            DashboardJobListLimit = 50000,
            TransactionTimeout = TimeSpan.FromMinutes(1),
        })));

    builder.Services.AddHangfireServer(options =>
    {
        options.WorkerCount = Environment.ProcessorCount * 2;
        options.Queues = new[] { "critical", "default", "low" };
    });
}

// Add HttpContextAccessor
builder.Services.AddHttpContextAccessor();

// Register Application Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

// Register GL Services
builder.Services.AddScoped<IAccountService, AccountService>();
builder.Services.AddScoped<IJournalVoucherService, JournalVoucherService>();
builder.Services.AddScoped<IFiscalPeriodService, FiscalPeriodService>();
builder.Services.AddScoped<IRecurringVoucherService, RecurringVoucherService>();

// Register AP Services
builder.Services.AddScoped<IVendorService, VendorService>();
builder.Services.AddScoped<IApInvoiceService, ApInvoiceService>();
builder.Services.AddScoped<IApPaymentService, ApPaymentService>();

// Register AR Services
builder.Services.AddScoped<ICustomerService, CustomerService>();
builder.Services.AddScoped<IArInvoiceService, ArInvoiceService>();
builder.Services.AddScoped<IArReceiptService, ArReceiptService>();

// Register Asset Services
builder.Services.AddScoped<IAssetCategoryService, AssetCategoryService>();
builder.Services.AddScoped<IAssetService, AssetService>();
builder.Services.AddScoped<IDepreciationService, DepreciationService>();

// Register Dashboard Services
builder.Services.AddScoped<IDashboardService, DashboardService>();

// Register Report Services
builder.Services.AddScoped<IPredefinedReportService, PredefinedReportService>();
builder.Services.AddScoped<IPdfReportRenderer, QuestPdfReportRenderer>();
builder.Services.AddScoped<IExcelReportRenderer, ClosedXmlReportRenderer>();
// Predefined report providers
builder.Services.AddScoped<IPredefinedReportProvider, TrialBalanceReportProvider>();
builder.Services.AddScoped<IPredefinedReportProvider, BalanceSheetReportProvider>();
builder.Services.AddScoped<IPredefinedReportProvider, IncomeStatementReportProvider>();
builder.Services.AddScoped<IPredefinedReportProvider, GeneralLedgerDetailReportProvider>();
builder.Services.AddScoped<IPredefinedReportProvider, JournalVoucherListingReportProvider>();
builder.Services.AddScoped<IPredefinedReportProvider, ApAgingReportProvider>();
builder.Services.AddScoped<IPredefinedReportProvider, ArAgingReportProvider>();
builder.Services.AddScoped<IPredefinedReportProvider, AssetRegisterReportProvider>();
builder.Services.AddScoped<IPredefinedReportProvider, DepreciationScheduleReportProvider>();
// Custom report services
builder.Services.AddScoped<IReportTemplateService, ReportTemplateService>();
// Data providers for custom reports
builder.Services.AddScoped<IReportDataProvider, GlReportDataProvider>();
builder.Services.AddScoped<IReportDataProvider, ApReportDataProvider>();
builder.Services.AddScoped<IReportDataProvider, ArReportDataProvider>();
builder.Services.AddScoped<IReportDataProvider, AssetReportDataProvider>();

// Register Configuration Services
builder.Services.AddScoped<ITaxProfileService, TaxProfileService>();
builder.Services.AddScoped<ICurrencyService, CurrencyService>();
builder.Services.AddScoped<IPaymentTermService, PaymentTermService>();
builder.Services.AddScoped<IDepartmentService, DepartmentService>();

// Register Settings Services
builder.Services.AddScoped<ITenantSettingsService, TenantSettingsService>();
builder.Services.AddScoped<ILicenseService, LicenseService>();

// Register Auth Management Services
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<IPermissionService, PermissionService>();
builder.Services.AddScoped<IUserRoleService, UserRoleService>();
builder.Services.AddScoped<IUserService, UserService>();

// Register Notification Services
builder.Services.AddSingleton<Carmen.Application.Services.Notification.IEmailTemplateService, EmailTemplateService>();
builder.Services.AddScoped<Carmen.Application.Services.Notification.INotificationService, NotificationService>();
builder.Services.AddScoped<Carmen.Application.Services.Notification.IEmailService, EmailService>();

// Register Workflow Services
builder.Services.AddScoped<Carmen.Application.Services.Workflow.IWorkflowService, WorkflowService>();
builder.Services.AddScoped<Carmen.Application.Services.Workflow.IWorkflowDefinitionService, WorkflowDefinitionService>();

// Register Integration Services
builder.Services.AddHttpClient();
builder.Services.AddScoped<Carmen.Application.Services.Integration.IBlueLedgerClient, BlueLedgerClient>();
builder.Services.AddScoped<Carmen.Application.Services.Integration.IBlueLedgerIntegrationService, BlueLedgerIntegrationService>();
builder.Services.AddScoped<Carmen.Application.Services.Integration.IOcrService, OcrService>();

// Register Background Jobs
builder.Services.AddScoped<IDepreciationJob, DepreciationJob>();
builder.Services.AddScoped<IRecurringVoucherJob, RecurringVoucherJob>();
builder.Services.AddScoped<IAmortizationJob, AmortizationJob>();
builder.Services.AddScoped<IBlueLedgerReconciliationJob, BlueLedgerReconciliationJob>();
builder.Services.AddScoped<Carmen.Infrastructure.Jobs.ISendNotificationEmailJob, Carmen.Infrastructure.Jobs.SendNotificationEmailJob>();
builder.Services.AddScoped<Carmen.Infrastructure.Jobs.INotificationCleanupJob, Carmen.Infrastructure.Jobs.NotificationCleanupJob>();

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Carmen API",
        Version = "v1",
        Description = "Carmen SAAS Financial Accounting System API"
    });

    // Add JWT authentication to Swagger
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey is not configured");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
        };

        // Support SignalR token via query string
        options.Events = new Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? ["http://localhost:5173"])
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// Add SignalR
builder.Services.AddSignalR();

// Add Health Checks
builder.Services.AddHealthChecks();

var app = builder.Build();

// Apply migrations and seed data in development
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<CarmenDbContext>();
    var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();

    // Apply migrations
    await context.Database.MigrateAsync();

    // Seed data
    await SeedDataAsync(context, passwordHasher);
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.MapSwagger("/openapi/{documentName}.json");
    app.MapScalarApiReference("/scalar/{documentName}", options =>
    {
        options
            .WithTitle("Carmen API")
            .WithTheme(ScalarTheme.BluePlanet)
            .WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.HttpClient);
    });
}

app.UseSerilogRequestLogging();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

// Hangfire Dashboard (skip in Testing environment)
if (!app.Environment.IsEnvironment("Testing"))
{
    app.UseHangfireDashboard("/hangfire", new DashboardOptions
    {
        Authorization = new[] { new HangfireAuthorizationFilter() },
        DashboardTitle = "Carmen Jobs",
        DisplayStorageConnectionString = false
    });
}

app.MapControllers();

// SignalR Hub
app.MapHub<Carmen.Infrastructure.Hubs.NotificationHub>("/hubs/notifications");

// Health check endpoints
app.MapHealthChecks("/health");
app.MapHealthChecks("/health/ready");
app.MapHealthChecks("/health/live");

// Welcome endpoint
app.MapGet("/", () => Results.Ok(new
{
    Name = "Carmen API",
    Version = "1.0.0",
    Status = "Running"
})).ExcludeFromDescription();

try
{
    Log.Information("Starting Carmen API");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Carmen API terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}

// Seed data method
static async Task SeedDataAsync(CarmenDbContext context, IPasswordHasher passwordHasher)
{
    // Use consistent IDs for development
    var devTenantId = Guid.Parse("11111111-1111-1111-1111-111111111111");

    // Seed Demo Tenant
    Guid tenantId;
    if (!await context.Tenants.AnyAsync())
    {
        var tenant = new Carmen.Domain.Entities.Auth.Tenant
        {
            Id = devTenantId,
            Code = "DEMO",
            Name = "Demo Hotel",
            Description = "Demo hotel for testing and development",
            Address = "123 Demo Street, Bangkok, Thailand",
            Phone = "+66-2-123-4567",
            Email = "demo@carmen.com",
            BaseCurrency = "USD",
            DefaultLanguage = "en",
            TimeZone = "Asia/Bangkok",
            IsActive = true,
            SubscriptionExpiresAt = DateTime.UtcNow.AddYears(1),
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "system"
        };

        context.Tenants.Add(tenant);
        await context.SaveChangesAsync();
        tenantId = tenant.Id;

        Log.Information("Seeded demo tenant: {TenantName}", tenant.Name);
    }
    else
    {
        tenantId = (await context.Tenants.FirstAsync()).Id;
    }

    // Seed Admin Role
    if (!await context.Roles.AnyAsync())
    {
        var adminRole = new Carmen.Domain.Entities.Auth.Role
        {
            Id = Guid.NewGuid(),
            Name = "Admin",
            Description = "System Administrator with full access",
            IsSystemRole = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "system"
        };

        var userRole = new Carmen.Domain.Entities.Auth.Role
        {
            Id = Guid.NewGuid(),
            Name = "User",
            Description = "Regular user with limited access",
            IsSystemRole = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "system"
        };

        context.Roles.AddRange(adminRole, userRole);
        await context.SaveChangesAsync();

        Log.Information("Seeded default roles");
    }

    // Seed Admin User (with tenant)
    if (!await context.Users.AnyAsync())
    {
        var adminRole = await context.Roles.FirstAsync(r => r.Name == "Admin");

        var adminUser = new Carmen.Domain.Entities.Auth.User
        {
            Id = Guid.NewGuid(),
            Email = "admin@carmen.com",
            PasswordHash = passwordHasher.HashPassword("Admin@123"),
            FirstName = "System",
            LastName = "Administrator",
            IsActive = true,
            PreferredLanguage = "en",
            TenantId = tenantId, // Associate with tenant
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "system"
        };

        context.Users.Add(adminUser);
        context.UserRoles.Add(new Carmen.Domain.Entities.Auth.UserRole
        {
            UserId = adminUser.Id,
            RoleId = adminRole.Id
        });

        await context.SaveChangesAsync();

        Log.Information("Seeded admin user: admin@carmen.com / Admin@123");
    }
    else
    {
        // Update existing admin user to have tenant if missing
        var adminUser = await context.Users.FirstOrDefaultAsync(u => u.Email == "admin@carmen.com");
        if (adminUser != null && adminUser.TenantId == null)
        {
            adminUser.TenantId = tenantId;
            await context.SaveChangesAsync();
            Log.Information("Updated admin user with tenant ID");
        }
    }

    // === SECOND TENANT FOR MULTI-TENANT TESTING ===
    var secondTenantId = Guid.Parse("22222222-2222-2222-2222-222222222222");
    if (!await context.Tenants.AnyAsync(t => t.Id == secondTenantId))
    {
        context.Tenants.Add(new Carmen.Domain.Entities.Auth.Tenant
        {
            Id = secondTenantId,
            Code = "BEACH",
            Name = "Beach Resort Hotel",
            Description = "Luxury beachfront resort property",
            Address = "456 Beach Road, Phuket",
            Phone = "+66-76-555-5555",
            Email = "info@beachresort.com",
            TaxId = "TAX-BEACH-002",
            BaseCurrency = "THB",
            DefaultLanguage = "th",
            TimeZone = "Asia/Bangkok",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "system"
        });
        await context.SaveChangesAsync();
        Log.Information("Seeded second tenant: Beach Resort Hotel");
    }

    // === USER FOR SECOND TENANT ONLY ===
    var beachManagerId = Guid.Parse("33333333-3333-3333-3333-333333333333");
    if (!await context.Users.AnyAsync(u => u.Id == beachManagerId))
    {
        var userRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == "User");
        if (userRole == null)
        {
            // Create User role if it doesn't exist
            userRole = new Carmen.Domain.Entities.Auth.Role
            {
                Id = Guid.NewGuid(),
                Name = "User",
                Description = "Regular user with limited access",
                IsSystemRole = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "system"
            };
            context.Roles.Add(userRole);
            await context.SaveChangesAsync();
        }

        context.Users.Add(new Carmen.Domain.Entities.Auth.User
        {
            Id = beachManagerId,
            Email = "manager@beachresort.com",
            PasswordHash = passwordHasher.HashPassword("Beach@123"),
            FirstName = "Beach",
            LastName = "Manager",
            TenantId = secondTenantId,
            IsActive = true,
            PreferredLanguage = "th",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "system"
        });
        await context.SaveChangesAsync();

        // Assign User role
        context.UserRoles.Add(new Carmen.Domain.Entities.Auth.UserRole
        {
            UserId = beachManagerId,
            RoleId = userRole.Id
        });
        await context.SaveChangesAsync();
        Log.Information("Seeded Beach Resort manager: manager@beachresort.com / Beach@123");
    }

    // === HEAD OF DEPARTMENT (MULTI-TENANT ACCESS) ===
    var hodUserId = Guid.Parse("44444444-4444-4444-4444-444444444444");
    if (!await context.Users.AnyAsync(u => u.Id == hodUserId))
    {
        var adminRole = await context.Roles.FirstAsync(r => r.Name == "Admin");

        context.Users.Add(new Carmen.Domain.Entities.Auth.User
        {
            Id = hodUserId,
            Email = "hod@carmen.com",
            PasswordHash = passwordHasher.HashPassword("HOD@123"),
            FirstName = "Head",
            LastName = "Department",
            TenantId = tenantId, // Primary tenant is Demo Hotel
            IsActive = true,
            PreferredLanguage = "en",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "system"
        });
        await context.SaveChangesAsync();

        // Assign Admin role for full access
        context.UserRoles.Add(new Carmen.Domain.Entities.Auth.UserRole
        {
            UserId = hodUserId,
            RoleId = adminRole.Id
        });
        await context.SaveChangesAsync();
        Log.Information("Seeded Head of Department: hod@carmen.com / HOD@123");
    }

    // === GROUP TENANT ACCESS (HOD can access both tenants) ===
    if (!await context.GroupTenantAccesses.AnyAsync(g => g.UserId == hodUserId && g.TenantId == secondTenantId))
    {
        var existingAdmin = await context.Users.FirstAsync(u => u.Email == "admin@carmen.com");

        // Grant HOD access to second tenant (Beach Resort)
        context.GroupTenantAccesses.Add(new Carmen.Domain.Entities.Auth.GroupTenantAccess
        {
            UserId = hodUserId,
            TenantId = secondTenantId,
            AssignedAt = DateTime.UtcNow,
            AssignedBy = existingAdmin.Id
        });
        await context.SaveChangesAsync();
        Log.Information("Seeded GroupTenantAccess: HOD can access Beach Resort Hotel");
    }

    // Seed Permissions
    if (!await context.Permissions.AnyAsync())
    {
        var permissions = new List<Carmen.Domain.Entities.Auth.Permission>
        {
            // System permissions
            new() { Id = Guid.NewGuid(), Code = "*", Name = "Full Access", Module = "System", CreatedAt = DateTime.UtcNow, CreatedBy = "system" },

            // Auth permissions
            new() { Id = Guid.NewGuid(), Code = "Users.View", Name = "View Users", Module = "Auth", CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
            new() { Id = Guid.NewGuid(), Code = "Users.Create", Name = "Create Users", Module = "Auth", CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
            new() { Id = Guid.NewGuid(), Code = "Users.Edit", Name = "Edit Users", Module = "Auth", CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
            new() { Id = Guid.NewGuid(), Code = "Users.Delete", Name = "Delete Users", Module = "Auth", CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
            new() { Id = Guid.NewGuid(), Code = "Auth.Roles.View", Name = "View Roles", Module = "Auth", CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
            new() { Id = Guid.NewGuid(), Code = "Auth.Roles.Create", Name = "Create Roles", Module = "Auth", CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
            new() { Id = Guid.NewGuid(), Code = "Auth.Roles.Edit", Name = "Edit Roles", Module = "Auth", CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
            new() { Id = Guid.NewGuid(), Code = "Auth.Roles.Delete", Name = "Delete Roles", Module = "Auth", CreatedAt = DateTime.UtcNow, CreatedBy = "system" },

            // GL permissions
            new() { Id = Guid.NewGuid(), Code = "GL.ChartOfAccounts.View", Name = "View Chart of Accounts", Module = "GL", CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
            new() { Id = Guid.NewGuid(), Code = "GL.ChartOfAccounts.Create", Name = "Create Chart of Accounts", Module = "GL", CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
            new() { Id = Guid.NewGuid(), Code = "GL.JournalVoucher.View", Name = "View Journal Vouchers", Module = "GL", CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
            new() { Id = Guid.NewGuid(), Code = "GL.JournalVoucher.Create", Name = "Create Journal Vouchers", Module = "GL", CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
            new() { Id = Guid.NewGuid(), Code = "GL.JournalVoucher.Approve", Name = "Approve Journal Vouchers", Module = "GL", CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
            new() { Id = Guid.NewGuid(), Code = "GL.JournalVoucher.Post", Name = "Post Journal Vouchers", Module = "GL", CreatedAt = DateTime.UtcNow, CreatedBy = "system" },

            // Configuration permissions
            new() { Id = Guid.NewGuid(), Code = "Configuration.TaxProfile.View", Name = "View Tax Profiles", Module = "Configuration", CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
            new() { Id = Guid.NewGuid(), Code = "Configuration.TaxProfile.Create", Name = "Create Tax Profiles", Module = "Configuration", CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
            new() { Id = Guid.NewGuid(), Code = "Configuration.TaxProfile.Edit", Name = "Edit Tax Profiles", Module = "Configuration", CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
            new() { Id = Guid.NewGuid(), Code = "Configuration.TaxProfile.Delete", Name = "Delete Tax Profiles", Module = "Configuration", CreatedAt = DateTime.UtcNow, CreatedBy = "system" },

            // Reports permissions
            new() { Id = Guid.NewGuid(), Code = "Reports.View", Name = "View Reports", Module = "Reports", CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
            new() { Id = Guid.NewGuid(), Code = "Reports.Generate", Name = "Generate Reports", Module = "Reports", CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
            new() { Id = Guid.NewGuid(), Code = "Reports.Create", Name = "Create Report Templates", Module = "Reports", CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
            new() { Id = Guid.NewGuid(), Code = "Reports.Edit", Name = "Edit Report Templates", Module = "Reports", CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
            new() { Id = Guid.NewGuid(), Code = "Reports.Delete", Name = "Delete Report Templates", Module = "Reports", CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        };

        context.Permissions.AddRange(permissions);
        await context.SaveChangesAsync();

        // Assign all permissions to Admin role
        var adminRole = await context.Roles.FirstAsync(r => r.Name == "Admin");
        var fullAccessPermission = await context.Permissions.FirstAsync(p => p.Code == "*");

        context.RolePermissions.Add(new Carmen.Domain.Entities.Auth.RolePermission
        {
            RoleId = adminRole.Id,
            PermissionId = fullAccessPermission.Id
        });

        await context.SaveChangesAsync();

        Log.Information("Seeded permissions");
    }

    // Seed Chart of Accounts
    if (!await context.ChartOfAccounts.AnyAsync())
    {
        await SeedChartOfAccountsAsync(context, tenantId);
        Log.Information("Seeded chart of accounts");
    }

    // Seed Fiscal Year and Periods
    if (!await context.FiscalYears.AnyAsync())
    {
        await SeedFiscalPeriodsAsync(context, tenantId);
        Log.Information("Seeded fiscal year and periods");
    }

    // Seed Journal Vouchers
    if (!await context.JournalVouchers.AnyAsync())
    {
        await SeedJournalVouchersAsync(context, tenantId);
        Log.Information("Seeded journal vouchers");
    }
}

// Seed Chart of Accounts
static async Task SeedChartOfAccountsAsync(CarmenDbContext context, Guid tenantId)
{
    var accounts = new List<Carmen.Domain.Entities.GL.ChartOfAccount>
    {
        // Assets (1xxx)
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "1000", AccountName = "Cash and Cash Equivalents", AccountType = Carmen.Domain.Entities.GL.AccountType.Asset, Level = 1, IsHeader = true, AllowPosting = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "1010", AccountName = "Petty Cash", AccountType = Carmen.Domain.Entities.GL.AccountType.Asset, Level = 2, IsHeader = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "1020", AccountName = "Cash in Bank - Operating", AccountType = Carmen.Domain.Entities.GL.AccountType.Asset, Level = 2, IsHeader = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "1100", AccountName = "Accounts Receivable", AccountType = Carmen.Domain.Entities.GL.AccountType.Asset, Level = 1, IsHeader = true, AllowPosting = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "1110", AccountName = "Accounts Receivable - Trade", AccountType = Carmen.Domain.Entities.GL.AccountType.Asset, Level = 2, IsHeader = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "1120", AccountName = "Accounts Receivable - City Ledger", AccountType = Carmen.Domain.Entities.GL.AccountType.Asset, Level = 2, IsHeader = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "1200", AccountName = "Inventory", AccountType = Carmen.Domain.Entities.GL.AccountType.Asset, Level = 1, IsHeader = true, AllowPosting = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "1210", AccountName = "Food Inventory", AccountType = Carmen.Domain.Entities.GL.AccountType.Asset, Level = 2, IsHeader = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "1220", AccountName = "Beverage Inventory", AccountType = Carmen.Domain.Entities.GL.AccountType.Asset, Level = 2, IsHeader = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "1230", AccountName = "Operating Supplies", AccountType = Carmen.Domain.Entities.GL.AccountType.Asset, Level = 2, IsHeader = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "1500", AccountName = "Fixed Assets", AccountType = Carmen.Domain.Entities.GL.AccountType.Asset, Level = 1, IsHeader = true, AllowPosting = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "1510", AccountName = "Furniture & Fixtures", AccountType = Carmen.Domain.Entities.GL.AccountType.Asset, Level = 2, IsHeader = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "1520", AccountName = "Equipment", AccountType = Carmen.Domain.Entities.GL.AccountType.Asset, Level = 2, IsHeader = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "1590", AccountName = "Accumulated Depreciation", AccountType = Carmen.Domain.Entities.GL.AccountType.Asset, Level = 2, IsHeader = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },

        // Liabilities (2xxx)
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "2000", AccountName = "Accounts Payable", AccountType = Carmen.Domain.Entities.GL.AccountType.Liability, Level = 1, IsHeader = true, AllowPosting = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "2010", AccountName = "Accounts Payable - Trade", AccountType = Carmen.Domain.Entities.GL.AccountType.Liability, Level = 2, IsHeader = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "2100", AccountName = "Accrued Expenses", AccountType = Carmen.Domain.Entities.GL.AccountType.Liability, Level = 1, IsHeader = true, AllowPosting = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "2110", AccountName = "Accrued Salaries", AccountType = Carmen.Domain.Entities.GL.AccountType.Liability, Level = 2, IsHeader = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "2120", AccountName = "Accrued Utilities", AccountType = Carmen.Domain.Entities.GL.AccountType.Liability, Level = 2, IsHeader = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "2200", AccountName = "Guest Deposits", AccountType = Carmen.Domain.Entities.GL.AccountType.Liability, Level = 1, IsHeader = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "2300", AccountName = "Taxes Payable", AccountType = Carmen.Domain.Entities.GL.AccountType.Liability, Level = 1, IsHeader = true, AllowPosting = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "2310", AccountName = "VAT Payable", AccountType = Carmen.Domain.Entities.GL.AccountType.Liability, Level = 2, IsHeader = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "2320", AccountName = "Service Charge Payable", AccountType = Carmen.Domain.Entities.GL.AccountType.Liability, Level = 2, IsHeader = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },

        // Equity (3xxx)
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "3000", AccountName = "Owner's Equity", AccountType = Carmen.Domain.Entities.GL.AccountType.Equity, Level = 1, IsHeader = true, AllowPosting = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "3010", AccountName = "Paid-in Capital", AccountType = Carmen.Domain.Entities.GL.AccountType.Equity, Level = 2, IsHeader = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "3100", AccountName = "Retained Earnings", AccountType = Carmen.Domain.Entities.GL.AccountType.Equity, Level = 1, IsHeader = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },

        // Revenue (4xxx)
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "4000", AccountName = "Room Revenue", AccountType = Carmen.Domain.Entities.GL.AccountType.Revenue, Level = 1, IsHeader = true, AllowPosting = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "4010", AccountName = "Room Revenue - Transient", AccountType = Carmen.Domain.Entities.GL.AccountType.Revenue, Level = 2, IsHeader = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "4020", AccountName = "Room Revenue - Group", AccountType = Carmen.Domain.Entities.GL.AccountType.Revenue, Level = 2, IsHeader = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "4100", AccountName = "Food Revenue", AccountType = Carmen.Domain.Entities.GL.AccountType.Revenue, Level = 1, IsHeader = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "4200", AccountName = "Beverage Revenue", AccountType = Carmen.Domain.Entities.GL.AccountType.Revenue, Level = 1, IsHeader = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "4300", AccountName = "Other Revenue", AccountType = Carmen.Domain.Entities.GL.AccountType.Revenue, Level = 1, IsHeader = true, AllowPosting = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "4310", AccountName = "Spa Revenue", AccountType = Carmen.Domain.Entities.GL.AccountType.Revenue, Level = 2, IsHeader = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "4320", AccountName = "Laundry Revenue", AccountType = Carmen.Domain.Entities.GL.AccountType.Revenue, Level = 2, IsHeader = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "4330", AccountName = "Parking Revenue", AccountType = Carmen.Domain.Entities.GL.AccountType.Revenue, Level = 2, IsHeader = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },

        // Expenses (5xxx-6xxx)
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "5000", AccountName = "Cost of Sales", AccountType = Carmen.Domain.Entities.GL.AccountType.Expense, Level = 1, IsHeader = true, AllowPosting = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "5010", AccountName = "Cost of Food", AccountType = Carmen.Domain.Entities.GL.AccountType.Expense, Level = 2, IsHeader = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "5020", AccountName = "Cost of Beverage", AccountType = Carmen.Domain.Entities.GL.AccountType.Expense, Level = 2, IsHeader = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "6000", AccountName = "Payroll Expenses", AccountType = Carmen.Domain.Entities.GL.AccountType.Expense, Level = 1, IsHeader = true, AllowPosting = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "6010", AccountName = "Salaries & Wages", AccountType = Carmen.Domain.Entities.GL.AccountType.Expense, Level = 2, IsHeader = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "6020", AccountName = "Employee Benefits", AccountType = Carmen.Domain.Entities.GL.AccountType.Expense, Level = 2, IsHeader = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "6100", AccountName = "Operating Expenses", AccountType = Carmen.Domain.Entities.GL.AccountType.Expense, Level = 1, IsHeader = true, AllowPosting = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "6110", AccountName = "Utilities Expense", AccountType = Carmen.Domain.Entities.GL.AccountType.Expense, Level = 2, IsHeader = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "6120", AccountName = "Repairs & Maintenance", AccountType = Carmen.Domain.Entities.GL.AccountType.Expense, Level = 2, IsHeader = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "6130", AccountName = "Supplies Expense", AccountType = Carmen.Domain.Entities.GL.AccountType.Expense, Level = 2, IsHeader = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "6200", AccountName = "Administrative Expenses", AccountType = Carmen.Domain.Entities.GL.AccountType.Expense, Level = 1, IsHeader = true, AllowPosting = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "6210", AccountName = "Office Supplies", AccountType = Carmen.Domain.Entities.GL.AccountType.Expense, Level = 2, IsHeader = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "6220", AccountName = "Professional Fees", AccountType = Carmen.Domain.Entities.GL.AccountType.Expense, Level = 2, IsHeader = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "6230", AccountName = "Insurance Expense", AccountType = Carmen.Domain.Entities.GL.AccountType.Expense, Level = 2, IsHeader = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, AccountCode = "6300", AccountName = "Depreciation Expense", AccountType = Carmen.Domain.Entities.GL.AccountType.Expense, Level = 1, IsHeader = false, CreatedAt = DateTime.UtcNow, CreatedBy = "system" },
    };

    context.ChartOfAccounts.AddRange(accounts);
    await context.SaveChangesAsync();
}

// Seed Fiscal Year and Periods
static async Task SeedFiscalPeriodsAsync(CarmenDbContext context, Guid tenantId)
{
    var fiscalYear = new Carmen.Domain.Entities.GL.FiscalYear
    {
        Id = Guid.NewGuid(),
        TenantId = tenantId,
        Name = "FY 2024",
        StartDate = new DateTime(2024, 1, 1),
        EndDate = new DateTime(2024, 12, 31),
        IsClosed = false,
        CreatedAt = DateTime.UtcNow,
        CreatedBy = "system"
    };

    context.FiscalYears.Add(fiscalYear);
    await context.SaveChangesAsync();

    // Create 12 monthly periods
    var periods = new List<Carmen.Domain.Entities.GL.FiscalPeriod>();
    for (int month = 1; month <= 12; month++)
    {
        var startDate = new DateTime(2024, month, 1);
        var endDate = startDate.AddMonths(1).AddDays(-1);

        periods.Add(new Carmen.Domain.Entities.GL.FiscalPeriod
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            FiscalYearId = fiscalYear.Id,
            PeriodNumber = month,
            Name = startDate.ToString("MMMM yyyy"),
            StartDate = startDate,
            EndDate = endDate,
            Status = month <= DateTime.UtcNow.Month ? Carmen.Domain.Entities.GL.PeriodStatus.Open : Carmen.Domain.Entities.GL.PeriodStatus.Open,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "system"
        });
    }

    context.FiscalPeriods.AddRange(periods);
    await context.SaveChangesAsync();
}

// Seed Journal Vouchers
static async Task SeedJournalVouchersAsync(CarmenDbContext context, Guid tenantId)
{
    // Get accounts for creating voucher lines
    var cashAccount = await context.ChartOfAccounts.FirstAsync(a => a.TenantId == tenantId && a.AccountCode == "1020");
    var arAccount = await context.ChartOfAccounts.FirstAsync(a => a.TenantId == tenantId && a.AccountCode == "1110");
    var apAccount = await context.ChartOfAccounts.FirstAsync(a => a.TenantId == tenantId && a.AccountCode == "2010");
    var salariesAccount = await context.ChartOfAccounts.FirstAsync(a => a.TenantId == tenantId && a.AccountCode == "6010");
    var utilitiesAccount = await context.ChartOfAccounts.FirstAsync(a => a.TenantId == tenantId && a.AccountCode == "6110");
    var roomRevenueAccount = await context.ChartOfAccounts.FirstAsync(a => a.TenantId == tenantId && a.AccountCode == "4010");
    var foodRevenueAccount = await context.ChartOfAccounts.FirstAsync(a => a.TenantId == tenantId && a.AccountCode == "4100");
    var suppliesAccount = await context.ChartOfAccounts.FirstAsync(a => a.TenantId == tenantId && a.AccountCode == "6130");
    var depreciationAccount = await context.ChartOfAccounts.FirstAsync(a => a.TenantId == tenantId && a.AccountCode == "6300");
    var accumDepAccount = await context.ChartOfAccounts.FirstAsync(a => a.TenantId == tenantId && a.AccountCode == "1590");

    // Get fiscal period
    var januaryPeriod = await context.FiscalPeriods.FirstAsync(p => p.TenantId == tenantId && p.PeriodNumber == 1);

    var vouchers = new List<Carmen.Domain.Entities.GL.JournalVoucher>
    {
        // JV-001: Monthly Revenue Entry (Posted)
        new()
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            VoucherNumber = "JV-2024-0001",
            VoucherDate = new DateTime(2024, 1, 15),
            PostingDate = new DateTime(2024, 1, 15),
            VoucherType = Carmen.Domain.Entities.GL.VoucherType.General,
            Status = Carmen.Domain.Entities.GL.DocumentStatus.Posted,
            Description = "Daily revenue - Room and F&B",
            Reference = "PMS-20240115",
            CurrencyCode = "USD",
            ExchangeRate = 1,
            TotalDebit = 15000,
            TotalCredit = 15000,
            FiscalPeriodId = januaryPeriod.Id,
            PostedAt = new DateTime(2024, 1, 16),
            PostedBy = "admin@carmen.com",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "admin@carmen.com"
        },

        // JV-002: Payroll Entry (Approved)
        new()
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            VoucherNumber = "JV-2024-0002",
            VoucherDate = new DateTime(2024, 1, 20),
            PostingDate = new DateTime(2024, 1, 20),
            VoucherType = Carmen.Domain.Entities.GL.VoucherType.General,
            Status = Carmen.Domain.Entities.GL.DocumentStatus.Approved,
            Description = "January payroll expense",
            Reference = "PAY-2024-01",
            CurrencyCode = "USD",
            ExchangeRate = 1,
            TotalDebit = 25000,
            TotalCredit = 25000,
            FiscalPeriodId = januaryPeriod.Id,
            ApprovedAt = new DateTime(2024, 1, 21),
            ApprovedBy = "admin@carmen.com",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "admin@carmen.com"
        },

        // JV-003: Utility Payment (Pending)
        new()
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            VoucherNumber = "JV-2024-0003",
            VoucherDate = new DateTime(2024, 1, 25),
            PostingDate = new DateTime(2024, 1, 25),
            VoucherType = Carmen.Domain.Entities.GL.VoucherType.General,
            Status = Carmen.Domain.Entities.GL.DocumentStatus.Pending,
            Description = "January utilities - Electric & Water",
            Reference = "UTIL-2024-01",
            CurrencyCode = "USD",
            ExchangeRate = 1,
            TotalDebit = 8500,
            TotalCredit = 8500,
            FiscalPeriodId = januaryPeriod.Id,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "admin@carmen.com"
        },

        // JV-004: Supplies Purchase (Draft)
        new()
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            VoucherNumber = "JV-2024-0004",
            VoucherDate = new DateTime(2024, 1, 28),
            PostingDate = new DateTime(2024, 1, 28),
            VoucherType = Carmen.Domain.Entities.GL.VoucherType.General,
            Status = Carmen.Domain.Entities.GL.DocumentStatus.Draft,
            Description = "Operating supplies purchase",
            Reference = "PO-2024-0015",
            CurrencyCode = "USD",
            ExchangeRate = 1,
            TotalDebit = 3500,
            TotalCredit = 3500,
            FiscalPeriodId = januaryPeriod.Id,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "admin@carmen.com"
        },

        // JV-005: Monthly Depreciation (Draft)
        new()
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            VoucherNumber = "JV-2024-0005",
            VoucherDate = new DateTime(2024, 1, 31),
            PostingDate = new DateTime(2024, 1, 31),
            VoucherType = Carmen.Domain.Entities.GL.VoucherType.Recurring,
            Status = Carmen.Domain.Entities.GL.DocumentStatus.Draft,
            Description = "January depreciation",
            Reference = "DEP-2024-01",
            CurrencyCode = "USD",
            ExchangeRate = 1,
            TotalDebit = 5000,
            TotalCredit = 5000,
            FiscalPeriodId = januaryPeriod.Id,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "admin@carmen.com"
        },
    };

    context.JournalVouchers.AddRange(vouchers);
    await context.SaveChangesAsync();

    // Add voucher lines
    var lines = new List<Carmen.Domain.Entities.GL.JournalVoucherLine>
    {
        // JV-001 Lines (Revenue)
        new() { Id = Guid.NewGuid(), TenantId = tenantId, JournalVoucherId = vouchers[0].Id, LineNumber = 1, AccountId = arAccount.Id, DebitAmount = 15000, CreditAmount = 0, DebitAmountBase = 15000, CreditAmountBase = 0, Description = "Guest charges", CreatedAt = DateTime.UtcNow, CreatedBy = "admin@carmen.com" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, JournalVoucherId = vouchers[0].Id, LineNumber = 2, AccountId = roomRevenueAccount.Id, DebitAmount = 0, CreditAmount = 12000, DebitAmountBase = 0, CreditAmountBase = 12000, Description = "Room revenue", CreatedAt = DateTime.UtcNow, CreatedBy = "admin@carmen.com" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, JournalVoucherId = vouchers[0].Id, LineNumber = 3, AccountId = foodRevenueAccount.Id, DebitAmount = 0, CreditAmount = 3000, DebitAmountBase = 0, CreditAmountBase = 3000, Description = "F&B revenue", CreatedAt = DateTime.UtcNow, CreatedBy = "admin@carmen.com" },

        // JV-002 Lines (Payroll)
        new() { Id = Guid.NewGuid(), TenantId = tenantId, JournalVoucherId = vouchers[1].Id, LineNumber = 1, AccountId = salariesAccount.Id, DebitAmount = 25000, CreditAmount = 0, DebitAmountBase = 25000, CreditAmountBase = 0, Description = "January salaries", CreatedAt = DateTime.UtcNow, CreatedBy = "admin@carmen.com" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, JournalVoucherId = vouchers[1].Id, LineNumber = 2, AccountId = apAccount.Id, DebitAmount = 0, CreditAmount = 20000, DebitAmountBase = 0, CreditAmountBase = 20000, Description = "Net payable", CreatedAt = DateTime.UtcNow, CreatedBy = "admin@carmen.com" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, JournalVoucherId = vouchers[1].Id, LineNumber = 3, AccountId = cashAccount.Id, DebitAmount = 0, CreditAmount = 5000, DebitAmountBase = 0, CreditAmountBase = 5000, Description = "Tax withholding paid", CreatedAt = DateTime.UtcNow, CreatedBy = "admin@carmen.com" },

        // JV-003 Lines (Utilities)
        new() { Id = Guid.NewGuid(), TenantId = tenantId, JournalVoucherId = vouchers[2].Id, LineNumber = 1, AccountId = utilitiesAccount.Id, DebitAmount = 8500, CreditAmount = 0, DebitAmountBase = 8500, CreditAmountBase = 0, Description = "Electric & Water", CreatedAt = DateTime.UtcNow, CreatedBy = "admin@carmen.com" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, JournalVoucherId = vouchers[2].Id, LineNumber = 2, AccountId = cashAccount.Id, DebitAmount = 0, CreditAmount = 8500, DebitAmountBase = 0, CreditAmountBase = 8500, Description = "Payment", CreatedAt = DateTime.UtcNow, CreatedBy = "admin@carmen.com" },

        // JV-004 Lines (Supplies)
        new() { Id = Guid.NewGuid(), TenantId = tenantId, JournalVoucherId = vouchers[3].Id, LineNumber = 1, AccountId = suppliesAccount.Id, DebitAmount = 3500, CreditAmount = 0, DebitAmountBase = 3500, CreditAmountBase = 0, Description = "Operating supplies", CreatedAt = DateTime.UtcNow, CreatedBy = "admin@carmen.com" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, JournalVoucherId = vouchers[3].Id, LineNumber = 2, AccountId = apAccount.Id, DebitAmount = 0, CreditAmount = 3500, DebitAmountBase = 0, CreditAmountBase = 3500, Description = "Vendor payable", CreatedAt = DateTime.UtcNow, CreatedBy = "admin@carmen.com" },

        // JV-005 Lines (Depreciation)
        new() { Id = Guid.NewGuid(), TenantId = tenantId, JournalVoucherId = vouchers[4].Id, LineNumber = 1, AccountId = depreciationAccount.Id, DebitAmount = 5000, CreditAmount = 0, DebitAmountBase = 5000, CreditAmountBase = 0, Description = "Monthly depreciation", CreatedAt = DateTime.UtcNow, CreatedBy = "admin@carmen.com" },
        new() { Id = Guid.NewGuid(), TenantId = tenantId, JournalVoucherId = vouchers[4].Id, LineNumber = 2, AccountId = accumDepAccount.Id, DebitAmount = 0, CreditAmount = 5000, DebitAmountBase = 0, CreditAmountBase = 5000, Description = "Accumulated depreciation", CreatedAt = DateTime.UtcNow, CreatedBy = "admin@carmen.com" },
    };

    context.JournalVoucherLines.AddRange(lines);
    await context.SaveChangesAsync();
}

// Make Program class accessible for WebApplicationFactory<Program> in integration tests
public partial class Program { }
