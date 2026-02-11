using Carmen.Domain.Entities.AP;
using Carmen.Domain.Entities.AR;
using Carmen.Domain.Entities.Asset;
using Carmen.Domain.Entities.Auth;
using Carmen.Domain.Entities.Configuration;
using Carmen.Domain.Entities.GL;
using Carmen.Domain.Entities.Notification;
using Carmen.Domain.Entities.Report;
using Carmen.Domain.Entities.Workflow;
using Microsoft.EntityFrameworkCore;

namespace Carmen.Infrastructure.Data;

public class CarmenDbContext : DbContext
{
    private readonly Guid? _currentTenantId;
    // Non-nullable filter field used in HasQueryFilter expressions to avoid
    // Nullable<T>.Value throws during EF Core parameter extraction.
    // Guid.Empty = "no tenant filter" (all rows pass).
    private readonly Guid _tenantIdFilter;

    public CarmenDbContext(DbContextOptions<CarmenDbContext> options) : base(options)
    {
        _tenantIdFilter = Guid.Empty;
    }

    public CarmenDbContext(DbContextOptions<CarmenDbContext> options, Guid? tenantId) : base(options)
    {
        _currentTenantId = tenantId;
        _tenantIdFilter = tenantId ?? Guid.Empty;
    }

    // Auth entities
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<GroupTenantAccess> GroupTenantAccesses => Set<GroupTenantAccess>();

    // GL entities
    public DbSet<ChartOfAccount> ChartOfAccounts => Set<ChartOfAccount>();
    public DbSet<JournalVoucher> JournalVouchers => Set<JournalVoucher>();
    public DbSet<JournalVoucherLine> JournalVoucherLines => Set<JournalVoucherLine>();
    public DbSet<FiscalYear> FiscalYears => Set<FiscalYear>();
    public DbSet<FiscalPeriod> FiscalPeriods => Set<FiscalPeriod>();
    public DbSet<RecurringVoucher> RecurringVouchers => Set<RecurringVoucher>();
    public DbSet<RecurringVoucherLine> RecurringVoucherLines => Set<RecurringVoucherLine>();
    public DbSet<TaxProfile> TaxProfiles => Set<TaxProfile>();
    public DbSet<Currency> Currencies => Set<Currency>();
    public DbSet<PaymentTerm> PaymentTerms => Set<PaymentTerm>();
    public DbSet<Department> Departments => Set<Department>();

    // AP entities
    public DbSet<Vendor> Vendors => Set<Vendor>();
    public DbSet<ApInvoice> ApInvoices => Set<ApInvoice>();
    public DbSet<ApInvoiceLine> ApInvoiceLines => Set<ApInvoiceLine>();
    public DbSet<ApPayment> ApPayments => Set<ApPayment>();
    public DbSet<ApPaymentLine> ApPaymentLines => Set<ApPaymentLine>();

    // AR entities
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<ArInvoice> ArInvoices => Set<ArInvoice>();
    public DbSet<ArInvoiceLine> ArInvoiceLines => Set<ArInvoiceLine>();
    public DbSet<ArReceipt> ArReceipts => Set<ArReceipt>();
    public DbSet<ArReceiptLine> ArReceiptLines => Set<ArReceiptLine>();

    // Asset entities
    public DbSet<AssetCategory> AssetCategories => Set<AssetCategory>();
    public DbSet<Asset> Assets => Set<Asset>();
    public DbSet<DepreciationSchedule> DepreciationSchedules => Set<DepreciationSchedule>();
    public DbSet<AssetDisposal> AssetDisposals => Set<AssetDisposal>();

    // Notification entities
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<NotificationPreference> NotificationPreferences => Set<NotificationPreference>();
    public DbSet<EmailLog> EmailLogs => Set<EmailLog>();

    // Report entities
    public DbSet<ReportTemplate> ReportTemplates => Set<ReportTemplate>();
    public DbSet<ReportTemplateColumn> ReportTemplateColumns => Set<ReportTemplateColumn>();
    public DbSet<ReportTemplateFilter> ReportTemplateFilters => Set<ReportTemplateFilter>();
    public DbSet<ReportTemplateGroup> ReportTemplateGroups => Set<ReportTemplateGroup>();
    public DbSet<ScheduledReport> ScheduledReports => Set<ScheduledReport>();

    // Workflow entities
    public DbSet<WorkflowDefinition> WorkflowDefinitions => Set<WorkflowDefinition>();
    public DbSet<WorkflowStep> WorkflowSteps => Set<WorkflowStep>();
    public DbSet<WorkflowInstance> WorkflowInstances => Set<WorkflowInstance>();
    public DbSet<WorkflowHistory> WorkflowHistories => Set<WorkflowHistory>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply configurations from assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CarmenDbContext).Assembly);

        // Global query filters for multi-tenancy
        // Always register filters — EF Core parameterizes the _currentTenantId field
        // per query. When _currentTenantId is null, the filter passes all rows.
        modelBuilder.Entity<ChartOfAccount>()
            .HasQueryFilter(e => _tenantIdFilter == Guid.Empty || e.TenantId == _tenantIdFilter);

        modelBuilder.Entity<JournalVoucher>()
            .HasQueryFilter(e => _tenantIdFilter == Guid.Empty || e.TenantId == _tenantIdFilter);

        modelBuilder.Entity<JournalVoucherLine>()
            .HasQueryFilter(e => _tenantIdFilter == Guid.Empty || e.TenantId == _tenantIdFilter);

        modelBuilder.Entity<FiscalYear>()
            .HasQueryFilter(e => _tenantIdFilter == Guid.Empty || e.TenantId == _tenantIdFilter);

        modelBuilder.Entity<FiscalPeriod>()
            .HasQueryFilter(e => _tenantIdFilter == Guid.Empty || e.TenantId == _tenantIdFilter);

        modelBuilder.Entity<RecurringVoucher>()
            .HasQueryFilter(e => _tenantIdFilter == Guid.Empty || e.TenantId == _tenantIdFilter);

        modelBuilder.Entity<RecurringVoucherLine>()
            .HasQueryFilter(e => _tenantIdFilter == Guid.Empty || e.TenantId == _tenantIdFilter);

        modelBuilder.Entity<TaxProfile>()
            .HasQueryFilter(e => _tenantIdFilter == Guid.Empty || e.TenantId == _tenantIdFilter);

        modelBuilder.Entity<Currency>()
            .HasQueryFilter(e => _tenantIdFilter == Guid.Empty || e.TenantId == _tenantIdFilter);

        modelBuilder.Entity<PaymentTerm>()
            .HasQueryFilter(e => _tenantIdFilter == Guid.Empty || e.TenantId == _tenantIdFilter);

        modelBuilder.Entity<Department>()
            .HasQueryFilter(e => _tenantIdFilter == Guid.Empty || e.TenantId == _tenantIdFilter);

        // AP entities query filters
        modelBuilder.Entity<Vendor>()
            .HasQueryFilter(e => _tenantIdFilter == Guid.Empty || e.TenantId == _tenantIdFilter);

        modelBuilder.Entity<ApInvoice>()
            .HasQueryFilter(e => _tenantIdFilter == Guid.Empty || e.TenantId == _tenantIdFilter);

        modelBuilder.Entity<ApInvoiceLine>()
            .HasQueryFilter(e => _tenantIdFilter == Guid.Empty || e.TenantId == _tenantIdFilter);

        modelBuilder.Entity<ApPayment>()
            .HasQueryFilter(e => _tenantIdFilter == Guid.Empty || e.TenantId == _tenantIdFilter);

        modelBuilder.Entity<ApPaymentLine>()
            .HasQueryFilter(e => _tenantIdFilter == Guid.Empty || e.TenantId == _tenantIdFilter);

        // AR entities query filters
        modelBuilder.Entity<Customer>()
            .HasQueryFilter(e => _tenantIdFilter == Guid.Empty || e.TenantId == _tenantIdFilter);

        modelBuilder.Entity<ArInvoice>()
            .HasQueryFilter(e => _tenantIdFilter == Guid.Empty || e.TenantId == _tenantIdFilter);

        modelBuilder.Entity<ArInvoiceLine>()
            .HasQueryFilter(e => _tenantIdFilter == Guid.Empty || e.TenantId == _tenantIdFilter);

        modelBuilder.Entity<ArReceipt>()
            .HasQueryFilter(e => _tenantIdFilter == Guid.Empty || e.TenantId == _tenantIdFilter);

        modelBuilder.Entity<ArReceiptLine>()
            .HasQueryFilter(e => _tenantIdFilter == Guid.Empty || e.TenantId == _tenantIdFilter);

        // Asset entities query filters
        modelBuilder.Entity<AssetCategory>()
            .HasQueryFilter(e => _tenantIdFilter == Guid.Empty || e.TenantId == _tenantIdFilter);

        modelBuilder.Entity<Asset>()
            .HasQueryFilter(e => _tenantIdFilter == Guid.Empty || e.TenantId == _tenantIdFilter);

        modelBuilder.Entity<DepreciationSchedule>()
            .HasQueryFilter(e => _tenantIdFilter == Guid.Empty || e.TenantId == _tenantIdFilter);

        modelBuilder.Entity<AssetDisposal>()
            .HasQueryFilter(e => _tenantIdFilter == Guid.Empty || e.TenantId == _tenantIdFilter);

        // Notification entities query filters
        modelBuilder.Entity<Notification>()
            .HasQueryFilter(e => _tenantIdFilter == Guid.Empty || e.TenantId == _tenantIdFilter);

        modelBuilder.Entity<EmailLog>()
            .HasQueryFilter(e => _tenantIdFilter == Guid.Empty || e.TenantId == _tenantIdFilter);

        // Report entities query filters
        modelBuilder.Entity<ReportTemplate>()
            .HasQueryFilter(e => _tenantIdFilter == Guid.Empty || e.TenantId == _tenantIdFilter);

        modelBuilder.Entity<ReportTemplateColumn>()
            .HasQueryFilter(e => _tenantIdFilter == Guid.Empty || e.TenantId == _tenantIdFilter);

        modelBuilder.Entity<ReportTemplateFilter>()
            .HasQueryFilter(e => _tenantIdFilter == Guid.Empty || e.TenantId == _tenantIdFilter);

        modelBuilder.Entity<ReportTemplateGroup>()
            .HasQueryFilter(e => _tenantIdFilter == Guid.Empty || e.TenantId == _tenantIdFilter);

        modelBuilder.Entity<ScheduledReport>()
            .HasQueryFilter(e => _tenantIdFilter == Guid.Empty || e.TenantId == _tenantIdFilter);

        // Workflow entities query filters
        modelBuilder.Entity<WorkflowDefinition>()
            .HasQueryFilter(e => _tenantIdFilter == Guid.Empty || e.TenantId == _tenantIdFilter);

        modelBuilder.Entity<WorkflowStep>()
            .HasQueryFilter(e => _tenantIdFilter == Guid.Empty || e.TenantId == _tenantIdFilter);

        modelBuilder.Entity<WorkflowInstance>()
            .HasQueryFilter(e => _tenantIdFilter == Guid.Empty || e.TenantId == _tenantIdFilter);

        modelBuilder.Entity<WorkflowHistory>()
            .HasQueryFilter(e => _tenantIdFilter == Guid.Empty || e.TenantId == _tenantIdFilter);
    }

    public override int SaveChanges()
    {
        UpdateTimestamps();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateTimestamps();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void UpdateTimestamps()
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified);

        foreach (var entry in entries)
        {
            // Check if entity has the property before accessing it
            var createdAtProperty = entry.Metadata.FindProperty("CreatedAt");
            var updatedAtProperty = entry.Metadata.FindProperty("UpdatedAt");

            if (entry.State == EntityState.Added && createdAtProperty != null)
            {
                entry.Property("CreatedAt").CurrentValue = DateTime.UtcNow;
            }

            if (entry.State == EntityState.Modified && updatedAtProperty != null)
            {
                entry.Property("UpdatedAt").CurrentValue = DateTime.UtcNow;
            }
        }
    }
}
