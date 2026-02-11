import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'

import { queryClient } from '@/lib/query-client'
import { AppLayout } from '@/components/layout'
import { ProtectedRoute } from '@/components/auth'
import { LoginPage } from '@/features/auth'
import { DashboardPage } from '@/features/dashboard'
import { AccountListPage, AccountFormPage } from '@/features/general-ledger/accounts'
import { AccountSummaryPage } from '@/features/general-ledger/accounts/pages/account-summary-page'
import { TrialBalancePage } from '@/features/general-ledger/accounts/pages/trial-balance-page'
import { FiscalPeriodListPage } from '@/features/general-ledger/fiscal-periods/pages/fiscal-period-list-page'
import { JournalVoucherListPage, JournalVoucherFormPage, JournalVoucherViewPage } from '@/features/general-ledger/journal-vouchers'
import { RoleListPage, RoleFormPage, RoleViewPage } from '@/features/settings/roles'
import { VendorListPage, VendorFormPage, VendorAgingReportPage } from '@/features/accounts-payable/vendors'
import { ApInvoiceListPage, ApInvoiceFormPage, ApInvoiceViewPage } from '@/features/accounts-payable/invoices'
import { ApPaymentListPage, ApPaymentFormPage, ApPaymentViewPage } from '@/features/accounts-payable/payments'
import { CustomerListPage, CustomerFormPage, CustomerAgingReportPage } from '@/features/accounts-receivable/customers'
import { ArInvoiceListPage, ArInvoiceFormPage, ArInvoiceViewPage } from '@/features/accounts-receivable/invoices'
import { ArReceiptListPage, ArReceiptFormPage, ArReceiptViewPage } from '@/features/accounts-receivable/receipts'
import { AssetCategoryListPage, AssetCategoryFormPage } from '@/features/asset-management/categories'
import { AssetListPage, AssetFormPage, AssetViewPage } from '@/features/asset-management/assets'
import { DepreciationListPage, DepreciationRunPage } from '@/features/asset-management/depreciation'
import { UserListPage, UserViewPage } from '@/features/settings/users'
import { TaxProfileListPage, TaxProfileFormPage } from '@/features/configuration/tax-profiles'
import { CurrencyListPage, CurrencyFormPage } from '@/features/configuration/currencies'
import { PaymentTermListPage, PaymentTermFormPage } from '@/features/configuration/payment-terms'
import { DepartmentListPage, DepartmentFormPage } from '@/features/configuration/departments'
import { CompanySettingsPage } from '@/features/settings/company'
import { LicensePage } from '@/features/settings/license'
import { JobListPage } from '@/features/jobs'
import { RecurringVoucherListPage, RecurringVoucherFormPage } from '@/features/general-ledger/recurring-vouchers'
import { NotificationListPage, NotificationPreferencesPage } from '@/features/notifications'
import { PendingApprovalsPage, ApprovalHistoryPage, WorkflowDefinitionListPage, WorkflowDefinitionFormPage } from '@/features/workflow'
import { PredefinedReportsPage, ReportViewerPage, CustomReportsPage, ReportBuilderPage } from '@/features/reports'
import { BlueLedgerStatusPage } from '@/features/integration/blueledger'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Placeholder pages for modules not yet implemented
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">This module is coming soon...</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Under Construction</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            This feature is currently being developed. Check back later for updates.
          </p>
          <Button asChild variant="outline">
            <Link to="/dashboard">Return to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-6xl font-bold text-muted-foreground">404</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist.
          </p>
          <Button asChild>
            <Link to="/dashboard">Return to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-destructive">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            You don't have permission to access this page.
          </p>
          <Button asChild>
            <Link to="/dashboard">Return to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Protected routes with layout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard */}
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* General Ledger */}
            <Route path="/gl" element={<PlaceholderPage title="General Ledger" />} />
            <Route path="/gl/journal-vouchers" element={<JournalVoucherListPage />} />
            <Route path="/gl/journal-vouchers/new" element={<JournalVoucherFormPage />} />
            <Route path="/gl/journal-vouchers/:id" element={<JournalVoucherViewPage />} />
            <Route path="/gl/journal-vouchers/:id/edit" element={<JournalVoucherFormPage />} />
            <Route path="/gl/accounts" element={<AccountListPage />} />
            <Route path="/gl/accounts/new" element={<AccountFormPage />} />
            <Route path="/gl/accounts/:id" element={<AccountFormPage />} />
            <Route path="/gl/accounts/:id/edit" element={<AccountFormPage />} />
            <Route path="/gl/accounts/summary" element={<AccountSummaryPage />} />
            <Route path="/gl/trial-balance" element={<TrialBalancePage />} />
            <Route path="/gl/fiscal-periods" element={<FiscalPeriodListPage />} />
            <Route path="/gl/recurring-vouchers" element={<RecurringVoucherListPage />} />
            <Route path="/gl/recurring-vouchers/new" element={<RecurringVoucherFormPage />} />
            <Route path="/gl/recurring-vouchers/:id/edit" element={<RecurringVoucherFormPage />} />

            {/* Accounts Payable */}
            <Route path="/ap" element={<PlaceholderPage title="Accounts Payable" />} />
            <Route path="/ap/vendors" element={<VendorListPage />} />
            <Route path="/ap/vendors/new" element={<VendorFormPage />} />
            <Route path="/ap/vendors/:id" element={<VendorFormPage />} />
            <Route path="/ap/vendors/:id/edit" element={<VendorFormPage />} />
            <Route path="/ap/invoices" element={<ApInvoiceListPage />} />
            <Route path="/ap/invoices/new" element={<ApInvoiceFormPage />} />
            <Route path="/ap/invoices/:id" element={<ApInvoiceViewPage />} />
            <Route path="/ap/invoices/:id/edit" element={<ApInvoiceFormPage />} />
            <Route path="/ap/payments" element={<ApPaymentListPage />} />
            <Route path="/ap/payments/new" element={<ApPaymentFormPage />} />
            <Route path="/ap/payments/:id" element={<ApPaymentViewPage />} />
            <Route path="/ap/payments/:id/edit" element={<ApPaymentFormPage />} />
            <Route path="/ap/aging" element={<VendorAgingReportPage />} />

            {/* Accounts Receivable */}
            <Route path="/ar" element={<PlaceholderPage title="Accounts Receivable" />} />
            <Route path="/ar/customers" element={<CustomerListPage />} />
            <Route path="/ar/customers/new" element={<CustomerFormPage />} />
            <Route path="/ar/customers/:id" element={<CustomerFormPage />} />
            <Route path="/ar/customers/:id/edit" element={<CustomerFormPage />} />
            <Route path="/ar/invoices" element={<ArInvoiceListPage />} />
            <Route path="/ar/invoices/new" element={<ArInvoiceFormPage />} />
            <Route path="/ar/invoices/:id" element={<ArInvoiceViewPage />} />
            <Route path="/ar/invoices/:id/edit" element={<ArInvoiceFormPage />} />
            <Route path="/ar/receipts" element={<ArReceiptListPage />} />
            <Route path="/ar/receipts/new" element={<ArReceiptFormPage />} />
            <Route path="/ar/receipts/:id" element={<ArReceiptViewPage />} />
            <Route path="/ar/receipts/:id/edit" element={<ArReceiptFormPage />} />
            <Route path="/ar/aging" element={<CustomerAgingReportPage />} />

            {/* Asset Management */}
            <Route path="/assets" element={<Navigate to="/assets/list" replace />} />
            <Route path="/assets/categories" element={<AssetCategoryListPage />} />
            <Route path="/assets/categories/new" element={<AssetCategoryFormPage />} />
            <Route path="/assets/categories/:id/edit" element={<AssetCategoryFormPage />} />
            <Route path="/assets/list" element={<AssetListPage />} />
            <Route path="/assets/new" element={<AssetFormPage />} />
            <Route path="/assets/:id" element={<AssetViewPage />} />
            <Route path="/assets/:id/edit" element={<AssetFormPage />} />
            <Route path="/assets/depreciation" element={<DepreciationListPage />} />
            <Route path="/assets/depreciation/run" element={<DepreciationRunPage />} />

            {/* Settings */}
            <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
            <Route path="/settings/roles" element={<RoleListPage />} />
            <Route path="/settings/roles/new" element={<RoleFormPage />} />
            <Route path="/settings/roles/:id" element={<RoleViewPage />} />
            <Route path="/settings/roles/:id/edit" element={<RoleFormPage />} />
            <Route path="/settings/users" element={<UserListPage />} />
            <Route path="/settings/users/:id" element={<UserViewPage />} />
            <Route path="/settings/company" element={<CompanySettingsPage />} />
            <Route path="/settings/license" element={<LicensePage />} />
            <Route path="/settings/jobs" element={<JobListPage />} />
            <Route path="/settings/workflows" element={<WorkflowDefinitionListPage />} />
            <Route path="/settings/workflows/new" element={<WorkflowDefinitionFormPage />} />
            <Route path="/settings/workflows/:id/edit" element={<WorkflowDefinitionFormPage />} />
            <Route path="/profile" element={<PlaceholderPage title="Profile" />} />

            {/* Notifications */}
            <Route path="/notifications" element={<NotificationListPage />} />
            <Route path="/notifications/preferences" element={<NotificationPreferencesPage />} />

            {/* Approvals & Workflows */}
            <Route path="/approvals" element={<PendingApprovalsPage />} />
            <Route path="/approvals/history" element={<ApprovalHistoryPage />} />

            {/* Reports */}
            <Route path="/reports" element={<Navigate to="/reports/predefined" replace />} />
            <Route path="/reports/predefined" element={<ProtectedRoute permission="Reports.View"><PredefinedReportsPage /></ProtectedRoute>} />
            <Route path="/reports/predefined/:type" element={<ProtectedRoute permission="Reports.View"><ReportViewerPage /></ProtectedRoute>} />
            <Route path="/reports/custom" element={<ProtectedRoute permission="Reports.View"><CustomReportsPage /></ProtectedRoute>} />
            <Route path="/reports/builder" element={<ProtectedRoute permission="Reports.Create"><ReportBuilderPage /></ProtectedRoute>} />
            <Route path="/reports/builder/:id" element={<ProtectedRoute permission="Reports.Edit"><ReportBuilderPage /></ProtectedRoute>} />

            {/* Integration */}
            <Route path="/integration/blueledger" element={<BlueLedgerStatusPage />} />

            {/* Configuration */}
            <Route path="/configuration/tax-profiles" element={<TaxProfileListPage />} />
            <Route path="/configuration/tax-profiles/new" element={<TaxProfileFormPage />} />
            <Route path="/configuration/tax-profiles/:id/edit" element={<TaxProfileFormPage />} />
            <Route path="/configuration/currencies" element={<CurrencyListPage />} />
            <Route path="/configuration/currencies/new" element={<CurrencyFormPage />} />
            <Route path="/configuration/currencies/:id/edit" element={<CurrencyFormPage />} />
            <Route path="/configuration/payment-terms" element={<PaymentTermListPage />} />
            <Route path="/configuration/payment-terms/new" element={<PaymentTermFormPage />} />
            <Route path="/configuration/payment-terms/:id/edit" element={<PaymentTermFormPage />} />
            <Route path="/configuration/departments" element={<DepartmentListPage />} />
            <Route path="/configuration/departments/new" element={<DepartmentFormPage />} />
            <Route path="/configuration/departments/:id/edit" element={<DepartmentFormPage />} />
          </Route>

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
