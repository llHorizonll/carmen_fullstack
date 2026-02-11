using Carmen.Domain.Entities.AP;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Carmen.Infrastructure.Data.Configurations;

public class VendorConfiguration : IEntityTypeConfiguration<Vendor>
{
    public void Configure(EntityTypeBuilder<Vendor> builder)
    {
        builder.ToTable("Vendors");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.VendorCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.VendorName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.VendorNameLocal)
            .HasMaxLength(200);

        builder.Property(e => e.ContactPerson)
            .HasMaxLength(100);

        builder.Property(e => e.Email)
            .HasMaxLength(200);

        builder.Property(e => e.Phone)
            .HasMaxLength(50);

        builder.Property(e => e.Fax)
            .HasMaxLength(50);

        builder.Property(e => e.Address)
            .HasMaxLength(500);

        builder.Property(e => e.City)
            .HasMaxLength(100);

        builder.Property(e => e.State)
            .HasMaxLength(100);

        builder.Property(e => e.PostalCode)
            .HasMaxLength(20);

        builder.Property(e => e.Country)
            .HasMaxLength(100);

        builder.Property(e => e.TaxId)
            .HasMaxLength(50);

        builder.Property(e => e.CurrencyCode)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(e => e.CreditLimit)
            .HasPrecision(18, 2);

        builder.Property(e => e.CurrentBalance)
            .HasPrecision(18, 2);

        builder.Property(e => e.BankName)
            .HasMaxLength(100);

        builder.Property(e => e.BankAccountNumber)
            .HasMaxLength(50);

        builder.Property(e => e.BankBranch)
            .HasMaxLength(100);

        builder.Property(e => e.BankSwiftCode)
            .HasMaxLength(20);

        builder.Property(e => e.Notes)
            .HasMaxLength(2000);

        builder.Property(e => e.CreatedBy)
            .HasMaxLength(200);

        builder.Property(e => e.UpdatedBy)
            .HasMaxLength(200);

        builder.HasIndex(e => new { e.TenantId, e.VendorCode })
            .IsUnique();

        builder.HasIndex(e => new { e.TenantId, e.IsActive });

        builder.HasOne(e => e.DefaultPaymentTerm)
            .WithMany()
            .HasForeignKey(e => e.DefaultPaymentTermId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(e => e.DefaultTax1Profile)
            .WithMany()
            .HasForeignKey(e => e.DefaultTax1ProfileId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(e => e.DefaultTax2Profile)
            .WithMany()
            .HasForeignKey(e => e.DefaultTax2ProfileId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(e => e.DefaultWhtProfile)
            .WithMany()
            .HasForeignKey(e => e.DefaultWhtProfileId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(e => e.DefaultApAccount)
            .WithMany()
            .HasForeignKey(e => e.DefaultApAccountId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(e => e.DefaultExpenseAccount)
            .WithMany()
            .HasForeignKey(e => e.DefaultExpenseAccountId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

public class ApInvoiceConfiguration : IEntityTypeConfiguration<ApInvoice>
{
    public void Configure(EntityTypeBuilder<ApInvoice> builder)
    {
        builder.ToTable("ApInvoices");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.InvoiceNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.VendorInvoiceNumber)
            .HasMaxLength(100);

        builder.Property(e => e.CurrencyCode)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(e => e.ExchangeRate)
            .HasPrecision(18, 6);

        builder.Property(e => e.SubTotal)
            .HasPrecision(18, 2);

        builder.Property(e => e.Tax1Amount)
            .HasPrecision(18, 2);

        builder.Property(e => e.Tax2Amount)
            .HasPrecision(18, 2);

        builder.Property(e => e.WhtAmount)
            .HasPrecision(18, 2);

        builder.Property(e => e.TotalAmount)
            .HasPrecision(18, 2);

        builder.Property(e => e.NetAmount)
            .HasPrecision(18, 2);

        builder.Property(e => e.PaidAmount)
            .HasPrecision(18, 2);

        builder.Property(e => e.BalanceAmount)
            .HasPrecision(18, 2);

        builder.Property(e => e.SubTotalBase)
            .HasPrecision(18, 2);

        builder.Property(e => e.TotalAmountBase)
            .HasPrecision(18, 2);

        builder.Property(e => e.NetAmountBase)
            .HasPrecision(18, 2);

        builder.Property(e => e.Description)
            .HasMaxLength(500);

        builder.Property(e => e.Reference)
            .HasMaxLength(200);

        builder.Property(e => e.ApprovedBy)
            .HasMaxLength(200);

        builder.Property(e => e.PostedBy)
            .HasMaxLength(200);

        builder.Property(e => e.RejectionReason)
            .HasMaxLength(500);

        builder.Property(e => e.VoidReason)
            .HasMaxLength(500);

        builder.Property(e => e.CreatedBy)
            .HasMaxLength(200);

        builder.Property(e => e.UpdatedBy)
            .HasMaxLength(200);

        builder.HasIndex(e => new { e.TenantId, e.InvoiceNumber })
            .IsUnique();

        builder.HasIndex(e => new { e.TenantId, e.VendorId, e.DueDate });
        builder.HasIndex(e => new { e.TenantId, e.Status });
        builder.HasIndex(e => new { e.TenantId, e.InvoiceDate });

        builder.HasOne(e => e.Vendor)
            .WithMany(v => v.Invoices)
            .HasForeignKey(e => e.VendorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.PaymentTerm)
            .WithMany()
            .HasForeignKey(e => e.PaymentTermId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(e => e.Tax1Profile)
            .WithMany()
            .HasForeignKey(e => e.Tax1ProfileId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(e => e.Tax2Profile)
            .WithMany()
            .HasForeignKey(e => e.Tax2ProfileId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(e => e.WhtProfile)
            .WithMany()
            .HasForeignKey(e => e.WhtProfileId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(e => e.FiscalPeriod)
            .WithMany()
            .HasForeignKey(e => e.FiscalPeriodId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.JournalVoucher)
            .WithMany()
            .HasForeignKey(e => e.JournalVoucherId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(e => e.ApAccount)
            .WithMany()
            .HasForeignKey(e => e.ApAccountId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

public class ApInvoiceLineConfiguration : IEntityTypeConfiguration<ApInvoiceLine>
{
    public void Configure(EntityTypeBuilder<ApInvoiceLine> builder)
    {
        builder.ToTable("ApInvoiceLines");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Description)
            .HasMaxLength(500);

        builder.Property(e => e.Unit)
            .HasMaxLength(20);

        builder.Property(e => e.Quantity)
            .HasPrecision(18, 4);

        builder.Property(e => e.UnitPrice)
            .HasPrecision(18, 4);

        builder.Property(e => e.Amount)
            .HasPrecision(18, 2);

        builder.Property(e => e.AmountBase)
            .HasPrecision(18, 2);

        builder.Property(e => e.DiscountPercent)
            .HasPrecision(5, 2);

        builder.Property(e => e.DiscountAmount)
            .HasPrecision(18, 2);

        builder.Property(e => e.NetAmount)
            .HasPrecision(18, 2);

        builder.Property(e => e.Tax1Amount)
            .HasPrecision(18, 2);

        builder.Property(e => e.ProjectCode)
            .HasMaxLength(50);

        builder.Property(e => e.CreatedBy)
            .HasMaxLength(200);

        builder.Property(e => e.UpdatedBy)
            .HasMaxLength(200);

        builder.HasOne(e => e.ApInvoice)
            .WithMany(i => i.Lines)
            .HasForeignKey(e => e.ApInvoiceId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Account)
            .WithMany()
            .HasForeignKey(e => e.AccountId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Tax1Profile)
            .WithMany()
            .HasForeignKey(e => e.Tax1ProfileId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(e => e.Department)
            .WithMany()
            .HasForeignKey(e => e.DepartmentId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(e => new { e.ApInvoiceId, e.LineNumber });
    }
}

public class ApPaymentConfiguration : IEntityTypeConfiguration<ApPayment>
{
    public void Configure(EntityTypeBuilder<ApPayment> builder)
    {
        builder.ToTable("ApPayments");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.PaymentNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.CheckNumber)
            .HasMaxLength(50);

        builder.Property(e => e.BankReference)
            .HasMaxLength(100);

        builder.Property(e => e.CurrencyCode)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(e => e.ExchangeRate)
            .HasPrecision(18, 6);

        builder.Property(e => e.TotalAmount)
            .HasPrecision(18, 2);

        builder.Property(e => e.TotalAmountBase)
            .HasPrecision(18, 2);

        builder.Property(e => e.AllocatedAmount)
            .HasPrecision(18, 2);

        builder.Property(e => e.UnallocatedAmount)
            .HasPrecision(18, 2);

        builder.Property(e => e.Description)
            .HasMaxLength(500);

        builder.Property(e => e.Reference)
            .HasMaxLength(200);

        builder.Property(e => e.PayeeName)
            .HasMaxLength(200);

        builder.Property(e => e.ApprovedBy)
            .HasMaxLength(200);

        builder.Property(e => e.PostedBy)
            .HasMaxLength(200);

        builder.Property(e => e.VoidReason)
            .HasMaxLength(500);

        builder.Property(e => e.CreatedBy)
            .HasMaxLength(200);

        builder.Property(e => e.UpdatedBy)
            .HasMaxLength(200);

        builder.HasIndex(e => new { e.TenantId, e.PaymentNumber })
            .IsUnique();

        builder.HasIndex(e => new { e.TenantId, e.VendorId, e.PaymentDate });
        builder.HasIndex(e => new { e.TenantId, e.Status });
        builder.HasIndex(e => new { e.TenantId, e.PaymentDate });

        builder.HasOne(e => e.Vendor)
            .WithMany(v => v.Payments)
            .HasForeignKey(e => e.VendorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.BankAccount)
            .WithMany()
            .HasForeignKey(e => e.BankAccountId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.FiscalPeriod)
            .WithMany()
            .HasForeignKey(e => e.FiscalPeriodId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.JournalVoucher)
            .WithMany()
            .HasForeignKey(e => e.JournalVoucherId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

public class ApPaymentLineConfiguration : IEntityTypeConfiguration<ApPaymentLine>
{
    public void Configure(EntityTypeBuilder<ApPaymentLine> builder)
    {
        builder.ToTable("ApPaymentLines");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.AmountAllocated)
            .HasPrecision(18, 2);

        builder.Property(e => e.AmountAllocatedBase)
            .HasPrecision(18, 2);

        builder.Property(e => e.DiscountAmount)
            .HasPrecision(18, 2);

        builder.Property(e => e.WhtAmount)
            .HasPrecision(18, 2);

        builder.Property(e => e.ExchangeGainLoss)
            .HasPrecision(18, 2);

        builder.Property(e => e.Notes)
            .HasMaxLength(500);

        builder.Property(e => e.CreatedBy)
            .HasMaxLength(200);

        builder.Property(e => e.UpdatedBy)
            .HasMaxLength(200);

        builder.HasOne(e => e.ApPayment)
            .WithMany(p => p.Lines)
            .HasForeignKey(e => e.ApPaymentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.ApInvoice)
            .WithMany(i => i.PaymentLines)
            .HasForeignKey(e => e.ApInvoiceId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(e => new { e.ApPaymentId, e.LineNumber });
        builder.HasIndex(e => new { e.ApInvoiceId });
    }
}
