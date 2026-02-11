-- ============================================================
-- Carmen ERP - Comprehensive Database Seed Script
-- ============================================================
-- Prerequisites: Backend must have run once (SeedDataAsync creates
--   tenants, users, roles, permissions, COA, FY 2024, JVs)
-- Target: MySQL 8.0+ / Carmen_Dev database
-- Safe to re-run: Uses INSERT IGNORE (skips existing records)
-- ============================================================

USE Carmen_Dev;

-- =============================================================
-- SECTION 0: LOOKUP EXISTING IDs FROM SEED DATA
-- =============================================================
SET @tid = '11111111-1111-1111-1111-111111111111';
SET @adminId = (SELECT Id FROM Users WHERE Email = 'admin@carmen.com' LIMIT 1);
SET @hodId = '44444444-4444-4444-4444-444444444444';
SET @now = UTC_TIMESTAMP();
SET @cb = 'system';

-- Chart of Accounts (created by SeedDataAsync)
SET @cashBank     = (SELECT Id FROM ChartOfAccounts WHERE TenantId = @tid AND AccountCode = '1020');
SET @pettyCash    = (SELECT Id FROM ChartOfAccounts WHERE TenantId = @tid AND AccountCode = '1010');
SET @arTrade      = (SELECT Id FROM ChartOfAccounts WHERE TenantId = @tid AND AccountCode = '1110');
SET @arCity       = (SELECT Id FROM ChartOfAccounts WHERE TenantId = @tid AND AccountCode = '1120');
SET @foodInv      = (SELECT Id FROM ChartOfAccounts WHERE TenantId = @tid AND AccountCode = '1210');
SET @bevInv       = (SELECT Id FROM ChartOfAccounts WHERE TenantId = @tid AND AccountCode = '1220');
SET @opSupInv     = (SELECT Id FROM ChartOfAccounts WHERE TenantId = @tid AND AccountCode = '1230');
SET @furniture    = (SELECT Id FROM ChartOfAccounts WHERE TenantId = @tid AND AccountCode = '1510');
SET @equipment    = (SELECT Id FROM ChartOfAccounts WHERE TenantId = @tid AND AccountCode = '1520');
SET @accumDep     = (SELECT Id FROM ChartOfAccounts WHERE TenantId = @tid AND AccountCode = '1590');
SET @apTrade      = (SELECT Id FROM ChartOfAccounts WHERE TenantId = @tid AND AccountCode = '2010');
SET @accSalaries  = (SELECT Id FROM ChartOfAccounts WHERE TenantId = @tid AND AccountCode = '2110');
SET @vatPayable   = (SELECT Id FROM ChartOfAccounts WHERE TenantId = @tid AND AccountCode = '2310');
SET @roomRev      = (SELECT Id FROM ChartOfAccounts WHERE TenantId = @tid AND AccountCode = '4010');
SET @grpRoomRev   = (SELECT Id FROM ChartOfAccounts WHERE TenantId = @tid AND AccountCode = '4020');
SET @foodRev      = (SELECT Id FROM ChartOfAccounts WHERE TenantId = @tid AND AccountCode = '4100');
SET @bevRev       = (SELECT Id FROM ChartOfAccounts WHERE TenantId = @tid AND AccountCode = '4200');
SET @spaRev       = (SELECT Id FROM ChartOfAccounts WHERE TenantId = @tid AND AccountCode = '4310');
SET @laundryRev   = (SELECT Id FROM ChartOfAccounts WHERE TenantId = @tid AND AccountCode = '4320');
SET @costFood     = (SELECT Id FROM ChartOfAccounts WHERE TenantId = @tid AND AccountCode = '5010');
SET @costBev      = (SELECT Id FROM ChartOfAccounts WHERE TenantId = @tid AND AccountCode = '5020');
SET @salaries     = (SELECT Id FROM ChartOfAccounts WHERE TenantId = @tid AND AccountCode = '6010');
SET @benefits     = (SELECT Id FROM ChartOfAccounts WHERE TenantId = @tid AND AccountCode = '6020');
SET @utilities    = (SELECT Id FROM ChartOfAccounts WHERE TenantId = @tid AND AccountCode = '6110');
SET @repairs      = (SELECT Id FROM ChartOfAccounts WHERE TenantId = @tid AND AccountCode = '6120');
SET @suppliesExp  = (SELECT Id FROM ChartOfAccounts WHERE TenantId = @tid AND AccountCode = '6130');
SET @officeSup    = (SELECT Id FROM ChartOfAccounts WHERE TenantId = @tid AND AccountCode = '6210');
SET @profFees     = (SELECT Id FROM ChartOfAccounts WHERE TenantId = @tid AND AccountCode = '6220');
SET @insurance    = (SELECT Id FROM ChartOfAccounts WHERE TenantId = @tid AND AccountCode = '6230');
SET @depExp       = (SELECT Id FROM ChartOfAccounts WHERE TenantId = @tid AND AccountCode = '6300');

-- Fiscal Year 2024
SET @fy24 = (SELECT Id FROM FiscalYears WHERE TenantId = @tid AND Name = 'FY 2024');
SET @p24_01 = (SELECT Id FROM FiscalPeriods WHERE TenantId = @tid AND FiscalYearId = @fy24 AND PeriodNumber = 1);
SET @p24_02 = (SELECT Id FROM FiscalPeriods WHERE TenantId = @tid AND FiscalYearId = @fy24 AND PeriodNumber = 2);
SET @p24_03 = (SELECT Id FROM FiscalPeriods WHERE TenantId = @tid AND FiscalYearId = @fy24 AND PeriodNumber = 3);
SET @p24_06 = (SELECT Id FROM FiscalPeriods WHERE TenantId = @tid AND FiscalYearId = @fy24 AND PeriodNumber = 6);

-- =============================================================
-- SECTION 1: FISCAL YEARS 2025 & 2026
-- =============================================================
INSERT IGNORE INTO FiscalYears (Id, TenantId, Name, StartDate, EndDate, IsClosed, CreatedAt, CreatedBy) VALUES
('fy250001-0000-0000-0000-000000000001', @tid, 'FY 2025', '2025-01-01', '2025-12-31', 0, @now, @cb),
('fy260001-0000-0000-0000-000000000001', @tid, 'FY 2026', '2026-01-01', '2026-12-31', 0, @now, @cb);

INSERT IGNORE INTO FiscalPeriods (Id, TenantId, FiscalYearId, PeriodNumber, Name, StartDate, EndDate, Status, CreatedAt, CreatedBy) VALUES
-- FY 2025
('fp250001-0000-0000-0000-000000000001', @tid, 'fy250001-0000-0000-0000-000000000001',  1, 'January 2025',   '2025-01-01', '2025-01-31', 1, @now, @cb),
('fp250001-0000-0000-0000-000000000002', @tid, 'fy250001-0000-0000-0000-000000000001',  2, 'February 2025',  '2025-02-01', '2025-02-28', 1, @now, @cb),
('fp250001-0000-0000-0000-000000000003', @tid, 'fy250001-0000-0000-0000-000000000001',  3, 'March 2025',     '2025-03-01', '2025-03-31', 1, @now, @cb),
('fp250001-0000-0000-0000-000000000004', @tid, 'fy250001-0000-0000-0000-000000000001',  4, 'April 2025',     '2025-04-01', '2025-04-30', 1, @now, @cb),
('fp250001-0000-0000-0000-000000000005', @tid, 'fy250001-0000-0000-0000-000000000001',  5, 'May 2025',       '2025-05-01', '2025-05-31', 1, @now, @cb),
('fp250001-0000-0000-0000-000000000006', @tid, 'fy250001-0000-0000-0000-000000000001',  6, 'June 2025',      '2025-06-01', '2025-06-30', 1, @now, @cb),
('fp250001-0000-0000-0000-000000000007', @tid, 'fy250001-0000-0000-0000-000000000001',  7, 'July 2025',      '2025-07-01', '2025-07-31', 1, @now, @cb),
('fp250001-0000-0000-0000-000000000008', @tid, 'fy250001-0000-0000-0000-000000000001',  8, 'August 2025',    '2025-08-01', '2025-08-31', 1, @now, @cb),
('fp250001-0000-0000-0000-000000000009', @tid, 'fy250001-0000-0000-0000-000000000001',  9, 'September 2025', '2025-09-01', '2025-09-30', 1, @now, @cb),
('fp250001-0000-0000-0000-000000000010', @tid, 'fy250001-0000-0000-0000-000000000001', 10, 'October 2025',   '2025-10-01', '2025-10-31', 1, @now, @cb),
('fp250001-0000-0000-0000-000000000011', @tid, 'fy250001-0000-0000-0000-000000000001', 11, 'November 2025',  '2025-11-01', '2025-11-30', 1, @now, @cb),
('fp250001-0000-0000-0000-000000000012', @tid, 'fy250001-0000-0000-0000-000000000001', 12, 'December 2025',  '2025-12-01', '2025-12-31', 1, @now, @cb),
-- FY 2026
('fp260001-0000-0000-0000-000000000001', @tid, 'fy260001-0000-0000-0000-000000000001',  1, 'January 2026',   '2026-01-01', '2026-01-31', 1, @now, @cb),
('fp260001-0000-0000-0000-000000000002', @tid, 'fy260001-0000-0000-0000-000000000001',  2, 'February 2026',  '2026-02-01', '2026-02-28', 1, @now, @cb),
('fp260001-0000-0000-0000-000000000003', @tid, 'fy260001-0000-0000-0000-000000000001',  3, 'March 2026',     '2026-03-01', '2026-03-31', 1, @now, @cb),
('fp260001-0000-0000-0000-000000000004', @tid, 'fy260001-0000-0000-0000-000000000001',  4, 'April 2026',     '2026-04-01', '2026-04-30', 1, @now, @cb),
('fp260001-0000-0000-0000-000000000005', @tid, 'fy260001-0000-0000-0000-000000000001',  5, 'May 2026',       '2026-05-01', '2026-05-31', 1, @now, @cb),
('fp260001-0000-0000-0000-000000000006', @tid, 'fy260001-0000-0000-0000-000000000001',  6, 'June 2026',      '2026-06-01', '2026-06-30', 1, @now, @cb),
('fp260001-0000-0000-0000-000000000007', @tid, 'fy260001-0000-0000-0000-000000000001',  7, 'July 2026',      '2026-07-01', '2026-07-31', 1, @now, @cb),
('fp260001-0000-0000-0000-000000000008', @tid, 'fy260001-0000-0000-0000-000000000001',  8, 'August 2026',    '2026-08-01', '2026-08-31', 1, @now, @cb),
('fp260001-0000-0000-0000-000000000009', @tid, 'fy260001-0000-0000-0000-000000000001',  9, 'September 2026', '2026-09-01', '2026-09-30', 1, @now, @cb),
('fp260001-0000-0000-0000-000000000010', @tid, 'fy260001-0000-0000-0000-000000000001', 10, 'October 2026',   '2026-10-01', '2026-10-31', 1, @now, @cb),
('fp260001-0000-0000-0000-000000000011', @tid, 'fy260001-0000-0000-0000-000000000001', 11, 'November 2026',  '2026-11-01', '2026-11-30', 1, @now, @cb),
('fp260001-0000-0000-0000-000000000012', @tid, 'fy260001-0000-0000-0000-000000000001', 12, 'December 2026',  '2026-12-01', '2026-12-31', 1, @now, @cb);

-- Period variables for 2025
SET @p25_01 = 'fp250001-0000-0000-0000-000000000001';
SET @p25_02 = 'fp250001-0000-0000-0000-000000000002';
SET @p25_03 = 'fp250001-0000-0000-0000-000000000003';
SET @p25_06 = 'fp250001-0000-0000-0000-000000000006';
SET @p25_09 = 'fp250001-0000-0000-0000-000000000009';
SET @p25_12 = 'fp250001-0000-0000-0000-000000000012';
SET @p26_01 = 'fp260001-0000-0000-0000-000000000001';
SET @p26_02 = 'fp260001-0000-0000-0000-000000000002';

-- =============================================================
-- SECTION 2: CURRENCIES
-- =============================================================
INSERT IGNORE INTO Currencies (Id, TenantId, CurrencyCode, CurrencyName, CurrencyNameLocal, Symbol, DecimalPlaces, ExchangeRate, ExchangeRateDate, IsBaseCurrency, SortOrder, IsActive, CreatedAt, CreatedBy) VALUES
('c0000001-0000-0000-0000-000000000001', @tid, 'USD', 'US Dollar',       NULL,           '$', 2,   1.000000, '2025-01-01', 1, 1, 1, @now, @cb),
('c0000001-0000-0000-0000-000000000002', @tid, 'THB', 'Thai Baht',       'บาท',          '฿', 2,  35.500000, '2025-01-01', 0, 2, 1, @now, @cb),
('c0000001-0000-0000-0000-000000000003', @tid, 'EUR', 'Euro',            NULL,           '€', 2,   0.920000, '2025-01-01', 0, 3, 1, @now, @cb),
('c0000001-0000-0000-0000-000000000004', @tid, 'GBP', 'British Pound',   NULL,           '£', 2,   0.790000, '2025-01-01', 0, 4, 1, @now, @cb),
('c0000001-0000-0000-0000-000000000005', @tid, 'JPY', 'Japanese Yen',    '円',            '¥', 0, 149.500000, '2025-01-01', 0, 5, 1, @now, @cb);

-- =============================================================
-- SECTION 3: DEPARTMENTS (hierarchical)
-- =============================================================
INSERT IGNORE INTO Departments (Id, TenantId, DepartmentCode, DepartmentName, DepartmentNameLocal, ParentDepartmentId, Level, Description, CostCenterCode, ManagerName, SortOrder, IsActive, CreatedAt, CreatedBy) VALUES
-- Level 1 (top-level)
('d0000001-0000-0000-0000-000000000001', @tid, 'FO',      'Front Office',      NULL, NULL,                                          1, 'Guest reception and services',  'CC-FO',   'Somchai P.',   1, 1, @now, @cb),
('d0000001-0000-0000-0000-000000000004', @tid, 'HK',      'Housekeeping',      NULL, NULL,                                          1, 'Room cleaning and laundry',     'CC-HK',   'Nattaya S.',   2, 1, @now, @cb),
('d0000001-0000-0000-0000-000000000005', @tid, 'FB',      'Food & Beverage',   NULL, NULL,                                          1, 'Restaurant and bar operations', 'CC-FB',   'Wichai T.',    3, 1, @now, @cb),
('d0000001-0000-0000-0000-000000000008', @tid, 'ENG',     'Engineering',       NULL, NULL,                                          1, 'Building maintenance',          'CC-ENG',  'Prasert K.',   4, 1, @now, @cb),
('d0000001-0000-0000-0000-000000000009', @tid, 'FIN',     'Finance',           NULL, NULL,                                          1, 'Accounting and finance',        'CC-FIN',  'Rattana M.',   5, 1, @now, @cb),
('d0000001-0000-0000-0000-000000000010', @tid, 'SM',      'Sales & Marketing', NULL, NULL,                                          1, 'Revenue and marketing',         'CC-SM',   'Aranya C.',    6, 1, @now, @cb),
-- Level 2 (sub-departments)
('d0000001-0000-0000-0000-000000000002', @tid, 'FO-REC',  'Reception',         NULL, 'd0000001-0000-0000-0000-000000000001',         2, 'Front desk and check-in',       'CC-FO-R', NULL,           1, 1, @now, @cb),
('d0000001-0000-0000-0000-000000000003', @tid, 'FO-CON',  'Concierge',         NULL, 'd0000001-0000-0000-0000-000000000001',         2, 'Guest services and tours',      'CC-FO-C', NULL,           2, 1, @now, @cb),
('d0000001-0000-0000-0000-000000000006', @tid, 'FB-KIT',  'Kitchen',           NULL, 'd0000001-0000-0000-0000-000000000005',         2, 'Food preparation',              'CC-FB-K', NULL,           1, 1, @now, @cb),
('d0000001-0000-0000-0000-000000000007', @tid, 'FB-REST', 'Restaurant',        NULL, 'd0000001-0000-0000-0000-000000000005',         2, 'Dining room operations',        'CC-FB-R', NULL,           2, 1, @now, @cb);

-- =============================================================
-- SECTION 4: TAX PROFILES
-- =============================================================
INSERT IGNORE INTO TaxProfiles (Id, TenantId, TaxCode, TaxName, TaxNameLocal, TaxType, CalculationMethod, TaxRate, Description, IsActive, IsDefault, TaxPayableAccountId, TaxReceivableAccountId, SortOrder, CreatedAt, CreatedBy) VALUES
('t0000001-0000-0000-0000-000000000001', @tid, 'VAT7',   'VAT 7%',              'ภาษีมูลค่าเพิ่ม 7%', 1, 1,  7.0000, 'Standard VAT rate',       1, 1, @vatPayable, NULL, 1, @now, @cb),
('t0000001-0000-0000-0000-000000000002', @tid, 'VAT0',   'VAT Exempt',          NULL,                  1, 1,  0.0000, 'VAT exempt items',        1, 0, @vatPayable, NULL, 2, @now, @cb),
('t0000001-0000-0000-0000-000000000003', @tid, 'SVC10',  'Service Charge 10%',  NULL,                  4, 1, 10.0000, 'Hotel service charge',    1, 0, NULL,        NULL, 3, @now, @cb),
('t0000001-0000-0000-0000-000000000004', @tid, 'WHT3',   'Withholding Tax 3%',  'ภาษีหัก ณ ที่จ่าย 3%',  5, 1,  3.0000, 'Standard WHT for services', 1, 0, NULL,     NULL, 4, @now, @cb);

-- =============================================================
-- SECTION 5: PAYMENT TERMS
-- =============================================================
INSERT IGNORE INTO PaymentTerms (Id, TenantId, TermCode, TermName, TermNameLocal, DueDays, DiscountPercent, DiscountDays, Description, IsDefault, SortOrder, IsActive, CreatedAt, CreatedBy) VALUES
('p0000001-0000-0000-0000-000000000001', @tid, 'NET30',    'Net 30 Days',     NULL, 30, NULL, NULL, 'Payment due in 30 days',           1, 1, 1, @now, @cb),
('p0000001-0000-0000-0000-000000000002', @tid, 'NET60',    'Net 60 Days',     NULL, 60, NULL, NULL, 'Payment due in 60 days',           0, 2, 1, @now, @cb),
('p0000001-0000-0000-0000-000000000003', @tid, 'COD',      'Cash on Delivery', NULL,  0, NULL, NULL, 'Payment on delivery',              0, 3, 1, @now, @cb),
('p0000001-0000-0000-0000-000000000004', @tid, 'NET15-2',  'Net 15 / 2% 10',  NULL, 15, 2.00,   10, '2% discount if paid within 10 days', 0, 4, 1, @now, @cb);

-- =============================================================
-- SECTION 6: VENDORS
-- =============================================================
INSERT IGNORE INTO Vendors (Id, TenantId, VendorCode, VendorName, VendorNameLocal, ContactPerson, Email, Phone, Fax, Address, City, State, PostalCode, Country, TaxId, IsActive,
  DefaultPaymentTermId, CurrencyCode, CreditLimit, CurrentBalance, DefaultTax1ProfileId, DefaultTax2ProfileId, DefaultWhtProfileId, DefaultApAccountId, DefaultExpenseAccountId,
  BankName, BankAccountNumber, BankBranch, BankSwiftCode, Notes, CreatedAt, CreatedBy) VALUES
('e0000001-0000-0000-0000-000000000001', @tid, 'V001', 'Bangkok Office Supply Co.', 'บจก.บางกอก ออฟฟิศ ซัพพลาย', 'Khun Suda', 'suda@bkksupply.com', '+66-2-111-1111', NULL,
  '88 Silom Road', 'Bangkok', 'Bangkok', '10500', 'Thailand', '0105500001234', 1,
  'p0000001-0000-0000-0000-000000000001', 'USD', 50000.00, 0.00, 't0000001-0000-0000-0000-000000000001', NULL, NULL, @apTrade, @officeSup,
  'Bangkok Bank', '001-2-34567-8', 'Silom Branch', 'BKKBTHBK', NULL, @now, @cb),

('e0000001-0000-0000-0000-000000000002', @tid, 'V002', 'Fresh Farm Produce Ltd.', NULL, 'Khun Wanna', 'wanna@freshfarm.co.th', '+66-2-222-2222', NULL,
  '15 Ratchadaphisek Road', 'Bangkok', 'Bangkok', '10400', 'Thailand', '0105500002345', 1,
  'p0000001-0000-0000-0000-000000000001', 'USD', 100000.00, 0.00, 't0000001-0000-0000-0000-000000000001', NULL, NULL, @apTrade, @costFood,
  'Kasikorn Bank', '012-3-45678-9', 'Chatuchak Branch', 'KASITHBK', NULL, @now, @cb),

('e0000001-0000-0000-0000-000000000003', @tid, 'V003', 'Royal Maintenance Services', NULL, 'Khun Pong', 'pong@royalmaint.com', '+66-2-333-3333', NULL,
  '42 Sukhumvit Soi 22', 'Bangkok', 'Bangkok', '10110', 'Thailand', '0105500003456', 1,
  'p0000001-0000-0000-0000-000000000002', 'USD', 80000.00, 0.00, 't0000001-0000-0000-0000-000000000001', NULL, 't0000001-0000-0000-0000-000000000004', @apTrade, @repairs,
  'SCB', '222-3-44556-7', 'Asoke Branch', 'SICOTHBK', NULL, @now, @cb),

('e0000001-0000-0000-0000-000000000004', @tid, 'V004', 'Pacific Equipment Trading', NULL, 'Mr. Chen', 'chen@pacificequip.com', '+66-2-444-4444', '+66-2-444-4445',
  '100 Rama IV Road', 'Bangkok', 'Bangkok', '10330', 'Thailand', '0105500004567', 1,
  'p0000001-0000-0000-0000-000000000002', 'USD', 200000.00, 0.00, 't0000001-0000-0000-0000-000000000001', NULL, NULL, @apTrade, @equipment,
  'Krungsri', '333-4-55667-8', 'Ploenchit Branch', 'AYUDTHBK', NULL, @now, @cb),

('e0000001-0000-0000-0000-000000000005', @tid, 'V005', 'Metro Utilities Corp.', NULL, 'Khun Noi', 'noi@metroutil.co.th', '+66-2-555-5555', NULL,
  '55 Phayathai Road', 'Bangkok', 'Bangkok', '10400', 'Thailand', '0105500005678', 1,
  'p0000001-0000-0000-0000-000000000003', 'USD', 30000.00, 0.00, 't0000001-0000-0000-0000-000000000001', NULL, NULL, @apTrade, @utilities,
  'TMB', '444-5-66778-9', 'Phayathai Branch', 'TMBKTHBK', NULL, @now, @cb);

-- =============================================================
-- SECTION 7: CUSTOMERS
-- =============================================================
INSERT IGNORE INTO Customers (Id, TenantId, CustomerCode, CustomerName, CustomerNameLocal, ContactPerson, Email, Phone, Fax, Address, City, State, PostalCode, Country, TaxId, IsActive,
  DefaultPaymentTermId, CurrencyCode, CreditLimit, CurrentBalance, DefaultTax1ProfileId, DefaultTax2ProfileId, DefaultWhtProfileId, DefaultArAccountId, DefaultRevenueAccountId,
  BankName, BankAccountNumber, BankBranch, BankSwiftCode, Notes, CreatedAt, CreatedBy) VALUES
('f0000001-0000-0000-0000-000000000001', @tid, 'C001', 'Sunrise Travel Agency', NULL, 'Ms. Linda', 'linda@sunrisetravel.com', '+66-2-600-1111', NULL,
  '10 Wireless Road', 'Bangkok', 'Bangkok', '10330', 'Thailand', '0105500010001', 1,
  'p0000001-0000-0000-0000-000000000001', 'USD', 100000.00, 0.00, 't0000001-0000-0000-0000-000000000001', NULL, NULL, @arTrade, @roomRev,
  NULL, NULL, NULL, NULL, 'Major travel agency partner', @now, @cb),

('f0000001-0000-0000-0000-000000000002', @tid, 'C002', 'Golden Lotus Corporation', NULL, 'Mr. Tanaka', 'tanaka@goldenlotus.jp', '+81-3-1234-5678', NULL,
  '1-2-3 Ginza, Chuo-ku', 'Tokyo', NULL, '104-0061', 'Japan', 'JP-1234567890', 1,
  'p0000001-0000-0000-0000-000000000002', 'USD', 200000.00, 0.00, 't0000001-0000-0000-0000-000000000001', NULL, NULL, @arTrade, @roomRev,
  NULL, NULL, NULL, NULL, 'Japanese corporate client', @now, @cb),

('f0000001-0000-0000-0000-000000000003', @tid, 'C003', 'Summit Conference Group', NULL, 'Ms. Sarah', 'sarah@summitconf.com', '+1-555-123-4567', NULL,
  '500 Park Avenue', 'New York', 'NY', '10022', 'United States', 'US-98765432', 1,
  'p0000001-0000-0000-0000-000000000001', 'USD', 150000.00, 0.00, 't0000001-0000-0000-0000-000000000001', NULL, NULL, @arTrade, @foodRev,
  NULL, NULL, NULL, NULL, 'Conference and event organizer', @now, @cb),

('f0000001-0000-0000-0000-000000000004', @tid, 'C004', 'Asia Pacific Tours', NULL, 'Mr. Lee', 'lee@aptours.com', '+65-6789-0123', NULL,
  '50 Raffles Place', 'Singapore', NULL, '048623', 'Singapore', 'SG-201500001', 1,
  'p0000001-0000-0000-0000-000000000001', 'USD', 120000.00, 0.00, 't0000001-0000-0000-0000-000000000001', NULL, NULL, @arTrade, @grpRoomRev,
  NULL, NULL, NULL, NULL, 'Regional tour operator', @now, @cb),

('f0000001-0000-0000-0000-000000000005', @tid, 'C005', 'Harmony Events Co.', NULL, 'Khun Ploy', 'ploy@harmonyevents.co.th', '+66-2-700-5555', NULL,
  '25 Langsuan Road', 'Bangkok', 'Bangkok', '10330', 'Thailand', '0105500020005', 1,
  'p0000001-0000-0000-0000-000000000003', 'USD', 80000.00, 0.00, 't0000001-0000-0000-0000-000000000001', NULL, NULL, @arTrade, @foodRev,
  NULL, NULL, NULL, NULL, 'Wedding and event planner', @now, @cb);

-- =============================================================
-- SECTION 8: AP INVOICES
-- =============================================================
-- Status enum: Draft=0, Pending=1, Approved=2, Rejected=3, PartiallyPaid=4, Paid=5, Void=6

INSERT IGNORE INTO ApInvoices (Id, TenantId, InvoiceNumber, VendorInvoiceNumber, InvoiceDate, DueDate, Status, VendorId, CurrencyCode, ExchangeRate,
  SubTotal, Tax1ProfileId, Tax1Amount, Tax2ProfileId, Tax2Amount, WhtProfileId, WhtAmount, TotalAmount, NetAmount, PaidAmount, BalanceAmount,
  SubTotalBase, TotalAmountBase, NetAmountBase, PaymentTermId, Description, Reference, FiscalPeriodId, ApprovedAt, ApprovedBy, PostedAt, PostedBy,
  RejectionReason, VoidReason, JournalVoucherId, ApAccountId, CreatedAt, CreatedBy) VALUES

-- 1. Draft - Office Supplies
('a1000001-0000-0000-0000-000000000001', @tid, 'API-2025-0001', 'BOS-INV-001', '2025-01-15', '2025-02-14', 0,
  'e0000001-0000-0000-0000-000000000001', 'USD', 1.000000,
  5000.00, 't0000001-0000-0000-0000-000000000001', 350.00, NULL, 0.00, NULL, 0.00, 5350.00, 5350.00, 0.00, 5350.00,
  5000.00, 5350.00, 5350.00, 'p0000001-0000-0000-0000-000000000001', 'Office supplies and stationery', 'PO-2025-001', @p25_01,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL, @apTrade, @now, 'admin@carmen.com'),

-- 2. Pending - Food supplies
('a1000001-0000-0000-0000-000000000002', @tid, 'API-2025-0002', 'FFP-2025-100', '2025-01-20', '2025-02-19', 1,
  'e0000001-0000-0000-0000-000000000002', 'USD', 1.000000,
  12000.00, 't0000001-0000-0000-0000-000000000001', 840.00, NULL, 0.00, NULL, 0.00, 12840.00, 12840.00, 0.00, 12840.00,
  12000.00, 12840.00, 12840.00, 'p0000001-0000-0000-0000-000000000001', 'Monthly food supplies - January', 'PO-2025-002', @p25_01,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL, @apTrade, @now, 'admin@carmen.com'),

-- 3. Approved - Maintenance
('a1000001-0000-0000-0000-000000000003', @tid, 'API-2025-0003', 'RMS-2025-050', '2025-02-05', '2025-04-06', 2,
  'e0000001-0000-0000-0000-000000000003', 'USD', 1.000000,
  8500.00, 't0000001-0000-0000-0000-000000000001', 595.00, NULL, 0.00, NULL, 0.00, 9095.00, 9095.00, 0.00, 9095.00,
  8500.00, 9095.00, 9095.00, 'p0000001-0000-0000-0000-000000000002', 'HVAC and plumbing maintenance', 'WO-2025-010', @p25_02,
  '2025-02-07 10:00:00', 'admin@carmen.com', NULL, NULL, NULL, NULL, NULL, @apTrade, @now, 'admin@carmen.com'),

-- 4. Approved (paidAmount=0, can be voided)
('a1000001-0000-0000-0000-000000000004', @tid, 'API-2025-0004', 'BOS-INV-015', '2025-02-15', '2025-03-17', 2,
  'e0000001-0000-0000-0000-000000000001', 'USD', 1.000000,
  3200.00, 't0000001-0000-0000-0000-000000000001', 224.00, NULL, 0.00, NULL, 0.00, 3424.00, 3424.00, 0.00, 3424.00,
  3200.00, 3424.00, 3424.00, 'p0000001-0000-0000-0000-000000000001', 'Printer supplies and toner', 'PO-2025-015', @p25_02,
  '2025-02-17 14:00:00', 'admin@carmen.com', NULL, NULL, NULL, NULL, NULL, @apTrade, @now, 'admin@carmen.com'),

-- 5. Posted - Equipment purchase
('a1000001-0000-0000-0000-000000000005', @tid, 'API-2025-0005', 'PET-2025-200', '2025-03-01', '2025-04-30', 4,
  'e0000001-0000-0000-0000-000000000004', 'USD', 1.000000,
  25000.00, 't0000001-0000-0000-0000-000000000001', 1750.00, NULL, 0.00, NULL, 0.00, 26750.00, 26750.00, 0.00, 26750.00,
  25000.00, 26750.00, 26750.00, 'p0000001-0000-0000-0000-000000000002', 'Kitchen and laundry equipment', 'PO-2025-020', @p25_03,
  '2025-03-02 09:00:00', 'admin@carmen.com', '2025-03-03 10:00:00', 'admin@carmen.com', NULL, NULL, NULL, @apTrade, @now, 'admin@carmen.com'),

-- 6. PartiallyPaid - Beverage supplies
('a1000001-0000-0000-0000-000000000006', @tid, 'API-2025-0006', 'FFP-2025-200', '2025-03-10', '2025-04-09', 4,
  'e0000001-0000-0000-0000-000000000002', 'USD', 1.000000,
  18000.00, 't0000001-0000-0000-0000-000000000001', 1260.00, NULL, 0.00, NULL, 0.00, 19260.00, 19260.00, 10000.00, 9260.00,
  18000.00, 19260.00, 19260.00, 'p0000001-0000-0000-0000-000000000001', 'Wine and spirits order', 'PO-2025-025', @p25_03,
  '2025-03-11 09:00:00', 'admin@carmen.com', '2025-03-11 14:00:00', 'admin@carmen.com', NULL, NULL, NULL, @apTrade, @now, 'admin@carmen.com'),

-- 7. Paid - Utilities
('a1000001-0000-0000-0000-000000000007', @tid, 'API-2025-0007', 'MUC-2025-MAR', '2025-03-15', '2025-03-15', 5,
  'e0000001-0000-0000-0000-000000000005', 'USD', 1.000000,
  6500.00, 't0000001-0000-0000-0000-000000000001', 455.00, NULL, 0.00, NULL, 0.00, 6955.00, 6955.00, 6955.00, 0.00,
  6500.00, 6955.00, 6955.00, 'p0000001-0000-0000-0000-000000000003', 'March utilities - electricity & water', NULL, @p25_03,
  '2025-03-15 08:00:00', 'admin@carmen.com', '2025-03-15 09:00:00', 'admin@carmen.com', NULL, NULL, NULL, @apTrade, @now, 'admin@carmen.com'),

-- 8. Void
('a1000001-0000-0000-0000-000000000008', @tid, 'API-2025-0008', 'RMS-2025-ERR', '2025-01-25', '2025-03-26', 6,
  'e0000001-0000-0000-0000-000000000003', 'USD', 1.000000,
  2000.00, 't0000001-0000-0000-0000-000000000001', 140.00, NULL, 0.00, NULL, 0.00, 2140.00, 2140.00, 0.00, 2140.00,
  2000.00, 2140.00, 2140.00, 'p0000001-0000-0000-0000-000000000002', 'Duplicate invoice - voided', NULL, @p25_01,
  NULL, NULL, NULL, NULL, NULL, 'Duplicate of API-2025-0003', NULL, @apTrade, @now, 'admin@carmen.com');

-- =============================================================
-- SECTION 8b: AP INVOICE LINES
-- =============================================================
INSERT IGNORE INTO ApInvoiceLines (Id, TenantId, ApInvoiceId, LineNumber, AccountId, Description, Quantity, Unit, UnitPrice, Amount, AmountBase, DiscountPercent, DiscountAmount, NetAmount, Tax1ProfileId, Tax1Amount, DepartmentId, ProjectCode, CreatedAt, CreatedBy) VALUES
-- API-2025-0001 lines
('a1100001-0000-0000-0000-000000000001', @tid, 'a1000001-0000-0000-0000-000000000001', 1, @officeSup,    'A4 paper and envelopes',         100, 'Box',  30.00,  3000.00, 3000.00, 0.00, 0.00, 3000.00, 't0000001-0000-0000-0000-000000000001', 210.00, 'd0000001-0000-0000-0000-000000000009', NULL, @now, 'admin@carmen.com'),
('a1100001-0000-0000-0000-000000000002', @tid, 'a1000001-0000-0000-0000-000000000001', 2, @suppliesExp,  'Guest amenities and toiletries',   50, 'Set',  40.00,  2000.00, 2000.00, 0.00, 0.00, 2000.00, 't0000001-0000-0000-0000-000000000001', 140.00, 'd0000001-0000-0000-0000-000000000004', NULL, @now, 'admin@carmen.com'),
-- API-2025-0002 lines
('a1100001-0000-0000-0000-000000000003', @tid, 'a1000001-0000-0000-0000-000000000002', 1, @costFood,     'Fresh produce and vegetables',      1, 'Lot', 7000.00, 7000.00, 7000.00, 0.00, 0.00, 7000.00, 't0000001-0000-0000-0000-000000000001', 490.00, 'd0000001-0000-0000-0000-000000000006', NULL, @now, 'admin@carmen.com'),
('a1100001-0000-0000-0000-000000000004', @tid, 'a1000001-0000-0000-0000-000000000002', 2, @costFood,     'Frozen seafood and meats',          1, 'Lot', 5000.00, 5000.00, 5000.00, 0.00, 0.00, 5000.00, 't0000001-0000-0000-0000-000000000001', 350.00, 'd0000001-0000-0000-0000-000000000006', NULL, @now, 'admin@carmen.com'),
-- API-2025-0003 lines
('a1100001-0000-0000-0000-000000000005', @tid, 'a1000001-0000-0000-0000-000000000003', 1, @repairs,      'HVAC system annual maintenance',    1, 'Job', 5000.00, 5000.00, 5000.00, 0.00, 0.00, 5000.00, 't0000001-0000-0000-0000-000000000001', 350.00, 'd0000001-0000-0000-0000-000000000008', NULL, @now, 'admin@carmen.com'),
('a1100001-0000-0000-0000-000000000006', @tid, 'a1000001-0000-0000-0000-000000000003', 2, @repairs,      'Plumbing repairs - guest rooms',    1, 'Job', 3500.00, 3500.00, 3500.00, 0.00, 0.00, 3500.00, 't0000001-0000-0000-0000-000000000001', 245.00, 'd0000001-0000-0000-0000-000000000008', NULL, @now, 'admin@carmen.com'),
-- API-2025-0004 lines
('a1100001-0000-0000-0000-000000000007', @tid, 'a1000001-0000-0000-0000-000000000004', 1, @officeSup,    'Printer paper bulk order',        200, 'Ream', 12.00,  2400.00, 2400.00, 0.00, 0.00, 2400.00, 't0000001-0000-0000-0000-000000000001', 168.00, 'd0000001-0000-0000-0000-000000000009', NULL, @now, 'admin@carmen.com'),
('a1100001-0000-0000-0000-000000000008', @tid, 'a1000001-0000-0000-0000-000000000004', 2, @officeSup,    'Toner cartridges HP LaserJet',      4, 'Pc', 200.00,   800.00,  800.00, 0.00, 0.00,  800.00, 't0000001-0000-0000-0000-000000000001',  56.00, 'd0000001-0000-0000-0000-000000000009', NULL, @now, 'admin@carmen.com'),
-- API-2025-0005 lines
('a1100001-0000-0000-0000-000000000009', @tid, 'a1000001-0000-0000-0000-000000000005', 1, @equipment,    'Commercial kitchen equipment',      1, 'Set', 15000.00, 15000.00, 15000.00, 0.00, 0.00, 15000.00, 't0000001-0000-0000-0000-000000000001', 1050.00, 'd0000001-0000-0000-0000-000000000006', NULL, @now, 'admin@carmen.com'),
('a1100001-0000-0000-0000-000000000010', @tid, 'a1000001-0000-0000-0000-000000000005', 2, @equipment,    'Industrial laundry dryer',          1, 'Unit', 10000.00, 10000.00, 10000.00, 0.00, 0.00, 10000.00, 't0000001-0000-0000-0000-000000000001', 700.00, 'd0000001-0000-0000-0000-000000000004', NULL, @now, 'admin@carmen.com'),
-- API-2025-0006 lines
('a1100001-0000-0000-0000-000000000011', @tid, 'a1000001-0000-0000-0000-000000000006', 1, @costBev,      'Premium wine selection',             1, 'Lot', 10000.00, 10000.00, 10000.00, 0.00, 0.00, 10000.00, 't0000001-0000-0000-0000-000000000001', 700.00, 'd0000001-0000-0000-0000-000000000007', NULL, @now, 'admin@carmen.com'),
('a1100001-0000-0000-0000-000000000012', @tid, 'a1000001-0000-0000-0000-000000000006', 2, @costBev,      'Spirits and liquor assortment',      1, 'Lot',  8000.00,  8000.00,  8000.00, 0.00, 0.00,  8000.00, 't0000001-0000-0000-0000-000000000001', 560.00, 'd0000001-0000-0000-0000-000000000007', NULL, @now, 'admin@carmen.com'),
-- API-2025-0007 lines
('a1100001-0000-0000-0000-000000000013', @tid, 'a1000001-0000-0000-0000-000000000007', 1, @utilities,    'Electricity - March 2025',          1, 'Month', 4000.00, 4000.00, 4000.00, 0.00, 0.00, 4000.00, 't0000001-0000-0000-0000-000000000001', 280.00, 'd0000001-0000-0000-0000-000000000008', NULL, @now, 'admin@carmen.com'),
('a1100001-0000-0000-0000-000000000014', @tid, 'a1000001-0000-0000-0000-000000000007', 2, @utilities,    'Water supply - March 2025',         1, 'Month', 2500.00, 2500.00, 2500.00, 0.00, 0.00, 2500.00, 't0000001-0000-0000-0000-000000000001', 175.00, 'd0000001-0000-0000-0000-000000000008', NULL, @now, 'admin@carmen.com'),
-- API-2025-0008 lines
('a1100001-0000-0000-0000-000000000015', @tid, 'a1000001-0000-0000-0000-000000000008', 1, @repairs,      'Duplicate maintenance charge',      1, 'Job',  2000.00, 2000.00, 2000.00, 0.00, 0.00, 2000.00, 't0000001-0000-0000-0000-000000000001', 140.00, 'd0000001-0000-0000-0000-000000000008', NULL, @now, 'admin@carmen.com');

-- =============================================================
-- SECTION 9: AP PAYMENTS
-- =============================================================
-- PaymentMethod: Cash=1, Check=2, BankTransfer=3, CreditCard=4, Other=99
-- Status: Draft=0, Pending=1, Approved=2, Posted=3, Void=4

INSERT IGNORE INTO ApPayments (Id, TenantId, PaymentNumber, PaymentDate, Status, VendorId, PaymentMethod, CheckNumber, CheckDate, BankReference,
  CurrencyCode, ExchangeRate, TotalAmount, TotalAmountBase, AllocatedAmount, UnallocatedAmount, BankAccountId, Description, Reference, PayeeName,
  FiscalPeriodId, ApprovedAt, ApprovedBy, PostedAt, PostedBy, VoidReason, JournalVoucherId, CreatedAt, CreatedBy) VALUES

-- Pay API-0007 fully
('a2000001-0000-0000-0000-000000000001', @tid, 'APP-2025-0001', '2025-03-16', 3,
  'e0000001-0000-0000-0000-000000000005', 3, NULL, NULL, 'TRF-20250316-001',
  'USD', 1.000000, 6955.00, 6955.00, 6955.00, 0.00, @cashBank, 'Payment for March utilities', NULL, 'Metro Utilities Corp.',
  @p25_03, '2025-03-16 10:00:00', 'admin@carmen.com', '2025-03-16 11:00:00', 'admin@carmen.com', NULL, NULL, @now, 'admin@carmen.com'),

-- Partial pay API-0006
('a2000001-0000-0000-0000-000000000002', @tid, 'APP-2025-0002', '2025-03-11', 3,
  'e0000001-0000-0000-0000-000000000002', 3, NULL, NULL, 'TRF-20250311-001',
  'USD', 1.000000, 10000.00, 10000.00, 10000.00, 0.00, @cashBank, 'Partial payment for beverage order', NULL, 'Fresh Farm Produce Ltd.',
  @p25_03, '2025-03-11 10:00:00', 'admin@carmen.com', '2025-03-11 14:00:00', 'admin@carmen.com', NULL, NULL, @now, 'admin@carmen.com'),

-- Draft payment
('a2000001-0000-0000-0000-000000000003', @tid, 'APP-2025-0003', '2025-03-25', 0,
  'e0000001-0000-0000-0000-000000000001', 2, 'CHK-001234', '2025-03-25', NULL,
  'USD', 1.000000, 5350.00, 5350.00, 0.00, 5350.00, @cashBank, 'Payment for office supplies', NULL, 'Bangkok Office Supply Co.',
  @p25_03, NULL, NULL, NULL, NULL, NULL, NULL, @now, 'admin@carmen.com');

-- =============================================================
-- SECTION 9b: AP PAYMENT LINES
-- =============================================================
INSERT IGNORE INTO ApPaymentLines (Id, TenantId, ApPaymentId, ApInvoiceId, LineNumber, AmountAllocated, AmountAllocatedBase, DiscountAmount, WhtAmount, ExchangeGainLoss, Notes, CreatedAt, CreatedBy) VALUES
('a2100001-0000-0000-0000-000000000001', @tid, 'a2000001-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000007', 1, 6955.00, 6955.00, 0.00, 0.00, 0.00, 'Full payment', @now, 'admin@carmen.com'),
('a2100001-0000-0000-0000-000000000002', @tid, 'a2000001-0000-0000-0000-000000000002', 'a1000001-0000-0000-0000-000000000006', 1, 10000.00, 10000.00, 0.00, 0.00, 0.00, 'Partial payment', @now, 'admin@carmen.com');

-- =============================================================
-- SECTION 10: AR INVOICES
-- =============================================================
-- Status: Draft=0, Pending=1, Approved=2, Rejected=3, PartiallyPaid=4, Paid=5, Void=6

INSERT IGNORE INTO ArInvoices (Id, TenantId, InvoiceNumber, CustomerReference, InvoiceDate, DueDate, Status, CustomerId, CurrencyCode, ExchangeRate,
  SubTotal, Tax1ProfileId, Tax1Amount, Tax2ProfileId, Tax2Amount, WhtProfileId, WhtAmount, TotalAmount, NetAmount, PaidAmount, BalanceAmount,
  SubTotalBase, TotalAmountBase, NetAmountBase, PaymentTermId, Description, Reference, FiscalPeriodId, ApprovedAt, ApprovedBy, PostedAt, PostedBy,
  RejectionReason, VoidReason, JournalVoucherId, ArAccountId, CreatedAt, CreatedBy) VALUES

-- 1. Draft - Room charges
('b1000001-0000-0000-0000-000000000001', @tid, 'ARI-2025-0001', 'STA-REF-001', '2025-01-10', '2025-02-09', 0,
  'f0000001-0000-0000-0000-000000000001', 'USD', 1.000000,
  15000.00, 't0000001-0000-0000-0000-000000000001', 1050.00, NULL, 0.00, NULL, 0.00, 16050.00, 16050.00, 0.00, 16050.00,
  15000.00, 16050.00, 16050.00, 'p0000001-0000-0000-0000-000000000001', 'Room charges - Deluxe suite', 'GF-20250110', @p25_01,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL, @arTrade, @now, 'admin@carmen.com'),

-- 2. Pending - F&B services
('b1000001-0000-0000-0000-000000000002', @tid, 'ARI-2025-0002', 'GLC-2025-088', '2025-01-18', '2025-03-19', 1,
  'f0000001-0000-0000-0000-000000000002', 'USD', 1.000000,
  8500.00, 't0000001-0000-0000-0000-000000000001', 595.00, NULL, 0.00, NULL, 0.00, 9095.00, 9095.00, 0.00, 9095.00,
  8500.00, 9095.00, 9095.00, 'p0000001-0000-0000-0000-000000000002', 'Restaurant and banquet services', 'BNQ-20250118', @p25_01,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL, @arTrade, @now, 'admin@carmen.com'),

-- 3. Approved - Corporate event
('b1000001-0000-0000-0000-000000000003', @tid, 'ARI-2025-0003', 'SCG-CONF-2025', '2025-02-01', '2025-03-03', 2,
  'f0000001-0000-0000-0000-000000000003', 'USD', 1.000000,
  22000.00, 't0000001-0000-0000-0000-000000000001', 1540.00, NULL, 0.00, NULL, 0.00, 23540.00, 23540.00, 0.00, 23540.00,
  22000.00, 23540.00, 23540.00, 'p0000001-0000-0000-0000-000000000001', 'Corporate conference event', 'CONF-20250201', @p25_02,
  '2025-02-03 10:00:00', 'admin@carmen.com', NULL, NULL, NULL, NULL, NULL, @arTrade, @now, 'admin@carmen.com'),

-- 4. Approved (paidAmount=0, can be voided)
('b1000001-0000-0000-0000-000000000004', @tid, 'ARI-2025-0004', 'STA-SPA-001', '2025-02-12', '2025-03-14', 2,
  'f0000001-0000-0000-0000-000000000001', 'USD', 1.000000,
  4500.00, 't0000001-0000-0000-0000-000000000001', 315.00, NULL, 0.00, NULL, 0.00, 4815.00, 4815.00, 0.00, 4815.00,
  4500.00, 4815.00, 4815.00, 'p0000001-0000-0000-0000-000000000001', 'Spa treatments and wellness', 'SPA-20250212', @p25_02,
  '2025-02-14 09:00:00', 'admin@carmen.com', NULL, NULL, NULL, NULL, NULL, @arTrade, @now, 'admin@carmen.com'),

-- 5. Posted - Group booking
('b1000001-0000-0000-0000-000000000005', @tid, 'ARI-2025-0005', 'APT-GRP-2025', '2025-03-05', '2025-04-04', 4,
  'f0000001-0000-0000-0000-000000000004', 'USD', 1.000000,
  35000.00, 't0000001-0000-0000-0000-000000000001', 2450.00, NULL, 0.00, NULL, 0.00, 37450.00, 37450.00, 0.00, 37450.00,
  35000.00, 37450.00, 37450.00, 'p0000001-0000-0000-0000-000000000001', 'Tour group room block', 'GRP-20250305', @p25_03,
  '2025-03-06 09:00:00', 'admin@carmen.com', '2025-03-07 10:00:00', 'admin@carmen.com', NULL, NULL, NULL, @arTrade, @now, 'admin@carmen.com'),

-- 6. PartiallyPaid
('b1000001-0000-0000-0000-000000000006', @tid, 'ARI-2025-0006', 'GLC-EXT-2025', '2025-03-12', '2025-05-11', 4,
  'f0000001-0000-0000-0000-000000000002', 'USD', 1.000000,
  12000.00, 't0000001-0000-0000-0000-000000000001', 840.00, NULL, 0.00, NULL, 0.00, 12840.00, 12840.00, 7000.00, 5840.00,
  12000.00, 12840.00, 12840.00, 'p0000001-0000-0000-0000-000000000002', 'Extended stay - corporate', 'EXT-20250312', @p25_03,
  '2025-03-13 09:00:00', 'admin@carmen.com', '2025-03-13 14:00:00', 'admin@carmen.com', NULL, NULL, NULL, @arTrade, @now, 'admin@carmen.com'),

-- 7. Paid
('b1000001-0000-0000-0000-000000000007', @tid, 'ARI-2025-0007', 'HEC-WED-001', '2025-03-20', '2025-03-20', 5,
  'f0000001-0000-0000-0000-000000000005', 'USD', 1.000000,
  9800.00, 't0000001-0000-0000-0000-000000000001', 686.00, NULL, 0.00, NULL, 0.00, 10486.00, 10486.00, 10486.00, 0.00,
  9800.00, 10486.00, 10486.00, 'p0000001-0000-0000-0000-000000000003', 'Wedding reception package', 'WED-20250320', @p25_03,
  '2025-03-20 08:00:00', 'admin@carmen.com', '2025-03-20 09:00:00', 'admin@carmen.com', NULL, NULL, NULL, @arTrade, @now, 'admin@carmen.com'),

-- 8. Void
('b1000001-0000-0000-0000-000000000008', @tid, 'ARI-2025-0008', 'APT-CXL-001', '2025-01-28', '2025-02-27', 6,
  'f0000001-0000-0000-0000-000000000004', 'USD', 1.000000,
  3000.00, 't0000001-0000-0000-0000-000000000001', 210.00, NULL, 0.00, NULL, 0.00, 3210.00, 3210.00, 0.00, 3210.00,
  3000.00, 3210.00, 3210.00, 'p0000001-0000-0000-0000-000000000001', 'Cancelled reservation', NULL, @p25_01,
  NULL, NULL, NULL, NULL, NULL, 'Booking cancelled by customer', NULL, @arTrade, @now, 'admin@carmen.com');

-- =============================================================
-- SECTION 10b: AR INVOICE LINES
-- =============================================================
INSERT IGNORE INTO ArInvoiceLines (Id, TenantId, ArInvoiceId, LineNumber, AccountId, Description, Quantity, Unit, UnitPrice, Amount, AmountBase, DiscountPercent, DiscountAmount, NetAmount, Tax1ProfileId, Tax1Amount, DepartmentId, ProjectCode, CreatedAt, CreatedBy) VALUES
-- ARI-0001 lines
('b1100001-0000-0000-0000-000000000001', @tid, 'b1000001-0000-0000-0000-000000000001', 1, @roomRev,   'Deluxe Suite - 5 nights',           5, 'Night', 2500.00, 12500.00, 12500.00, 0.00, 0.00, 12500.00, 't0000001-0000-0000-0000-000000000001', 875.00, 'd0000001-0000-0000-0000-000000000001', NULL, @now, 'admin@carmen.com'),
('b1100001-0000-0000-0000-000000000002', @tid, 'b1000001-0000-0000-0000-000000000001', 2, @foodRev,   'Minibar and room service',           1, 'Lot',  2500.00,  2500.00,  2500.00, 0.00, 0.00,  2500.00, 't0000001-0000-0000-0000-000000000001', 175.00, 'd0000001-0000-0000-0000-000000000007', NULL, @now, 'admin@carmen.com'),
-- ARI-0002 lines
('b1100001-0000-0000-0000-000000000003', @tid, 'b1000001-0000-0000-0000-000000000002', 1, @foodRev,   'Restaurant dining charges',          1, 'Lot',  5500.00,  5500.00,  5500.00, 0.00, 0.00,  5500.00, 't0000001-0000-0000-0000-000000000001', 385.00, 'd0000001-0000-0000-0000-000000000007', NULL, @now, 'admin@carmen.com'),
('b1100001-0000-0000-0000-000000000004', @tid, 'b1000001-0000-0000-0000-000000000002', 2, @foodRev,   'Banquet services',                   1, 'Event', 3000.00, 3000.00,  3000.00, 0.00, 0.00,  3000.00, 't0000001-0000-0000-0000-000000000001', 210.00, 'd0000001-0000-0000-0000-000000000005', NULL, @now, 'admin@carmen.com'),
-- ARI-0003 lines
('b1100001-0000-0000-0000-000000000005', @tid, 'b1000001-0000-0000-0000-000000000003', 1, @roomRev,   'Conference room rental - 3 days',    3, 'Day',  5000.00, 15000.00, 15000.00, 0.00, 0.00, 15000.00, 't0000001-0000-0000-0000-000000000001', 1050.00, 'd0000001-0000-0000-0000-000000000010', NULL, @now, 'admin@carmen.com'),
('b1100001-0000-0000-0000-000000000006', @tid, 'b1000001-0000-0000-0000-000000000003', 2, @foodRev,   'Conference catering package',         1, 'Pkg',  7000.00,  7000.00,  7000.00, 0.00, 0.00,  7000.00, 't0000001-0000-0000-0000-000000000001',  490.00, 'd0000001-0000-0000-0000-000000000005', NULL, @now, 'admin@carmen.com'),
-- ARI-0004 lines
('b1100001-0000-0000-0000-000000000007', @tid, 'b1000001-0000-0000-0000-000000000004', 1, @spaRev,    'Spa treatment packages',            10, 'Pax',   300.00,  3000.00,  3000.00, 0.00, 0.00,  3000.00, 't0000001-0000-0000-0000-000000000001', 210.00, NULL, NULL, @now, 'admin@carmen.com'),
('b1100001-0000-0000-0000-000000000008', @tid, 'b1000001-0000-0000-0000-000000000004', 2, @spaRev,    'Wellness program access',             3, 'Pax',   500.00,  1500.00,  1500.00, 0.00, 0.00,  1500.00, 't0000001-0000-0000-0000-000000000001', 105.00, NULL, NULL, @now, 'admin@carmen.com'),
-- ARI-0005 lines
('b1100001-0000-0000-0000-000000000009', @tid, 'b1000001-0000-0000-0000-000000000005', 1, @grpRoomRev, 'Group room block - 20 rooms x 3 nights', 1, 'Block', 28000.00, 28000.00, 28000.00, 0.00, 0.00, 28000.00, 't0000001-0000-0000-0000-000000000001', 1960.00, 'd0000001-0000-0000-0000-000000000001', NULL, @now, 'admin@carmen.com'),
('b1100001-0000-0000-0000-000000000010', @tid, 'b1000001-0000-0000-0000-000000000005', 2, @foodRev,   'Group F&B package',                   1, 'Pkg',   7000.00,  7000.00,  7000.00, 0.00, 0.00,  7000.00, 't0000001-0000-0000-0000-000000000001',  490.00, 'd0000001-0000-0000-0000-000000000005', NULL, @now, 'admin@carmen.com'),
-- ARI-0006 lines
('b1100001-0000-0000-0000-000000000011', @tid, 'b1000001-0000-0000-0000-000000000006', 1, @roomRev,   'Extended stay - Executive room',      1, 'Stay', 10000.00, 10000.00, 10000.00, 0.00, 0.00, 10000.00, 't0000001-0000-0000-0000-000000000001', 700.00, 'd0000001-0000-0000-0000-000000000001', NULL, @now, 'admin@carmen.com'),
('b1100001-0000-0000-0000-000000000012', @tid, 'b1000001-0000-0000-0000-000000000006', 2, @laundryRev, 'Laundry and guest services',          1, 'Lot',   2000.00,  2000.00,  2000.00, 0.00, 0.00,  2000.00, 't0000001-0000-0000-0000-000000000001', 140.00, 'd0000001-0000-0000-0000-000000000004', NULL, @now, 'admin@carmen.com'),
-- ARI-0007 lines
('b1100001-0000-0000-0000-000000000013', @tid, 'b1000001-0000-0000-0000-000000000007', 1, @foodRev,   'Ballroom rental - Wedding',           1, 'Event', 6000.00,  6000.00,  6000.00, 0.00, 0.00,  6000.00, 't0000001-0000-0000-0000-000000000001', 420.00, 'd0000001-0000-0000-0000-000000000005', NULL, @now, 'admin@carmen.com'),
('b1100001-0000-0000-0000-000000000014', @tid, 'b1000001-0000-0000-0000-000000000007', 2, @foodRev,   'Wedding catering - 100 pax',          1, 'Pkg',   3800.00,  3800.00,  3800.00, 0.00, 0.00,  3800.00, 't0000001-0000-0000-0000-000000000001', 266.00, 'd0000001-0000-0000-0000-000000000005', NULL, @now, 'admin@carmen.com'),
-- ARI-0008 lines
('b1100001-0000-0000-0000-000000000015', @tid, 'b1000001-0000-0000-0000-000000000008', 1, @roomRev,   'Cancelled group booking deposit',      1, 'Lot',   3000.00,  3000.00,  3000.00, 0.00, 0.00,  3000.00, 't0000001-0000-0000-0000-000000000001', 210.00, 'd0000001-0000-0000-0000-000000000001', NULL, @now, 'admin@carmen.com');

-- =============================================================
-- SECTION 11: AR RECEIPTS
-- =============================================================
-- ReceiptMethod: Cash=1, Check=2, BankTransfer=3, CreditCard=4, Other=99
-- Status: Draft=0, Pending=1, Approved=2, Posted=3, Void=4

INSERT IGNORE INTO ArReceipts (Id, TenantId, ReceiptNumber, ReceiptDate, Status, CustomerId, ReceiptMethod, CheckNumber, CheckDate, BankReference,
  CurrencyCode, ExchangeRate, TotalAmount, TotalAmountBase, AllocatedAmount, UnallocatedAmount, BankAccountId, Description, Reference, PayerName,
  FiscalPeriodId, ApprovedAt, ApprovedBy, PostedAt, PostedBy, VoidReason, JournalVoucherId, CreatedAt, CreatedBy) VALUES

('b2000001-0000-0000-0000-000000000001', @tid, 'ARR-2025-0001', '2025-03-21', 3,
  'f0000001-0000-0000-0000-000000000005', 3, NULL, NULL, 'TRF-20250321-001',
  'USD', 1.000000, 10486.00, 10486.00, 10486.00, 0.00, @cashBank, 'Wedding reception full payment', NULL, 'Harmony Events Co.',
  @p25_03, '2025-03-21 10:00:00', 'admin@carmen.com', '2025-03-21 11:00:00', 'admin@carmen.com', NULL, NULL, @now, 'admin@carmen.com'),

('b2000001-0000-0000-0000-000000000002', @tid, 'ARR-2025-0002', '2025-03-13', 3,
  'f0000001-0000-0000-0000-000000000002', 3, NULL, NULL, 'TRF-20250313-001',
  'USD', 1.000000, 7000.00, 7000.00, 7000.00, 0.00, @cashBank, 'Partial payment for extended stay', NULL, 'Golden Lotus Corporation',
  @p25_03, '2025-03-13 10:00:00', 'admin@carmen.com', '2025-03-13 14:00:00', 'admin@carmen.com', NULL, NULL, @now, 'admin@carmen.com'),

('b2000001-0000-0000-0000-000000000003', @tid, 'ARR-2025-0003', '2025-03-28', 0,
  'f0000001-0000-0000-0000-000000000001', 2, 'CHK-9876', '2025-03-28', NULL,
  'USD', 1.000000, 16050.00, 16050.00, 0.00, 16050.00, @cashBank, 'Payment for room charges', NULL, 'Sunrise Travel Agency',
  @p25_03, NULL, NULL, NULL, NULL, NULL, NULL, @now, 'admin@carmen.com');

-- =============================================================
-- SECTION 11b: AR RECEIPT LINES
-- =============================================================
INSERT IGNORE INTO ArReceiptLines (Id, TenantId, ArReceiptId, ArInvoiceId, LineNumber, AmountAllocated, AmountAllocatedBase, DiscountAmount, WhtAmount, ExchangeGainLoss, Notes, CreatedAt, CreatedBy) VALUES
('b2100001-0000-0000-0000-000000000001', @tid, 'b2000001-0000-0000-0000-000000000001', 'b1000001-0000-0000-0000-000000000007', 1, 10486.00, 10486.00, 0.00, 0.00, 0.00, 'Full payment', @now, 'admin@carmen.com'),
('b2100001-0000-0000-0000-000000000002', @tid, 'b2000001-0000-0000-0000-000000000002', 'b1000001-0000-0000-0000-000000000006', 1,  7000.00,  7000.00, 0.00, 0.00, 0.00, 'Partial payment', @now, 'admin@carmen.com');

-- =============================================================
-- SECTION 12: ASSET CATEGORIES
-- =============================================================
-- DepreciationMethod: StraightLine=1, DecliningBalance=2, DoubleDecliningBalance=3, SumOfYearsDigits=4, UnitsOfProduction=5

INSERT IGNORE INTO AssetCategories (Id, TenantId, CategoryCode, CategoryName, CategoryNameLocal, Description, IsActive, DefaultUsefulLifeMonths, DefaultDepreciationMethod, DefaultSalvagePercent,
  DefaultAssetAccountId, DefaultAccumDepreciationAccountId, DefaultDepreciationExpenseAccountId, DefaultGainLossAccountId, AssetCodePrefix, Notes, CreatedAt, CreatedBy) VALUES
('ac000001-0000-0000-0000-000000000001', @tid, 'FF',  'Furniture & Fixtures', 'เฟอร์นิเจอร์', 'Hotel furniture, beds, tables, chairs',     1, 120, 1, 10.00, @furniture, @accumDep, @depExp, NULL, 'FF',  NULL, @now, @cb),
('ac000001-0000-0000-0000-000000000002', @tid, 'EQ',  'Equipment',            'อุปกรณ์',      'Kitchen, laundry, and operational equipment', 1,  60, 1,  5.00, @equipment, @accumDep, @depExp, NULL, 'EQ',  NULL, @now, @cb),
('ac000001-0000-0000-0000-000000000003', @tid, 'VH',  'Vehicles',             'ยานพาหนะ',     'Hotel shuttles and service vehicles',        1,  60, 2, 15.00, @equipment, @accumDep, @depExp, NULL, 'VH',  NULL, @now, @cb),
('ac000001-0000-0000-0000-000000000004', @tid, 'IT',  'IT Equipment',         'อุปกรณ์ไอที',   'Computers, servers, networking',              1,  36, 1,  0.00, @equipment, @accumDep, @depExp, NULL, 'IT',  NULL, @now, @cb);

-- =============================================================
-- SECTION 13: ASSETS
-- =============================================================
-- AssetStatus: Active=0, Disposed=1, Transferred=2, Sold=3, WrittenOff=4
-- AssetCondition: New=1, Good=2, Fair=3, Poor=4

INSERT IGNORE INTO Assets (Id, TenantId, AssetCode, AssetName, AssetNameLocal, Description, SerialNumber, Barcode, AssetCategoryId, LocationDescription, DepartmentId,
  `Condition`, AcquisitionDate, AcquisitionCost, CurrencyCode, ExchangeRate, AcquisitionCostBase, VendorId, ApInvoiceId, PurchaseReference,
  DepreciationMethod, UsefulLifeMonths, SalvageValue, DepreciationStartDate, MonthlyDepreciation, Status, AccumulatedDepreciation, CurrentValue, DepreciatedMonths, IsFullyDepreciated,
  AssetAccountId, AccumDepreciationAccountId, DepreciationExpenseAccountId, DisposedAt, DisposalValue, GainLossAmount, Notes, CreatedAt, CreatedBy) VALUES

('aa000001-0000-0000-0000-000000000001', @tid, 'FF-001', 'Lobby Grand Chandelier', NULL, 'Crystal chandelier in main lobby', 'CHAN-2024-001', 'BAR-FF-001',
  'ac000001-0000-0000-0000-000000000001', 'Main Lobby', 'd0000001-0000-0000-0000-000000000001',
  1, '2024-01-15', 25000.00, 'USD', 1.000000, 25000.00, NULL, NULL, 'PO-2024-FF-001',
  1, 120, 2500.00, '2024-02-01', 187.50, 0, 2250.00, 22750.00, 12, 0,
  @furniture, @accumDep, @depExp, NULL, NULL, NULL, 'Imported Italian crystal', @now, @cb),

('aa000001-0000-0000-0000-000000000002', @tid, 'EQ-001', 'Commercial Washing Machine', NULL, 'Industrial washer for laundry dept', 'WM-2024-001', 'BAR-EQ-001',
  'ac000001-0000-0000-0000-000000000002', 'Laundry Room B2', 'd0000001-0000-0000-0000-000000000004',
  2, '2024-03-01', 18000.00, 'USD', 1.000000, 18000.00, 'e0000001-0000-0000-0000-000000000004', NULL, 'PO-2024-EQ-001',
  1, 60, 900.00, '2024-03-01', 285.00, 0, 2850.00, 15150.00, 10, 0,
  @equipment, @accumDep, @depExp, NULL, NULL, NULL, NULL, @now, @cb),

('aa000001-0000-0000-0000-000000000003', @tid, 'EQ-002', 'Walk-in Refrigerator Unit', NULL, 'Main kitchen cold storage', 'RF-2024-001', 'BAR-EQ-002',
  'ac000001-0000-0000-0000-000000000002', 'Kitchen - Cold Room', 'd0000001-0000-0000-0000-000000000006',
  1, '2024-06-01', 35000.00, 'USD', 1.000000, 35000.00, 'e0000001-0000-0000-0000-000000000004', NULL, 'PO-2024-EQ-002',
  1, 60, 1750.00, '2024-06-01', 554.17, 0, 3325.02, 31674.98, 6, 0,
  @equipment, @accumDep, @depExp, NULL, NULL, NULL, 'Carrier brand commercial unit', @now, @cb),

('aa000001-0000-0000-0000-000000000004', @tid, 'VH-001', 'Airport Shuttle Van', NULL, 'Toyota HiAce 15-seater', 'VIN-2024-SH-001', 'BAR-VH-001',
  'ac000001-0000-0000-0000-000000000003', 'Parking Garage', NULL,
  2, '2024-01-01', 45000.00, 'USD', 1.000000, 45000.00, NULL, NULL, 'PO-2024-VH-001',
  2, 60, 6750.00, '2024-01-01', 637.50, 0, 7650.00, 37350.00, 12, 0,
  @equipment, @accumDep, @depExp, NULL, NULL, NULL, 'For airport transfers', @now, @cb),

('aa000001-0000-0000-0000-000000000005', @tid, 'IT-001', 'Server Room Equipment', NULL, 'Dell PowerEdge rack + UPS', 'SRV-2024-001', 'BAR-IT-001',
  'ac000001-0000-0000-0000-000000000004', 'Server Room - 3F', 'd0000001-0000-0000-0000-000000000009',
  1, '2024-04-01', 28000.00, 'USD', 1.000000, 28000.00, NULL, NULL, 'PO-2024-IT-001',
  1, 36, 0.00, '2024-04-01', 777.78, 0, 7000.02, 20999.98, 9, 0,
  @equipment, @accumDep, @depExp, NULL, NULL, NULL, 'PMS and accounting server', @now, @cb),

('aa000001-0000-0000-0000-000000000006', @tid, 'FF-002', 'Guest Room Furniture Set x50', NULL, 'Complete furniture for 50 guest rooms', NULL, 'BAR-FF-002',
  'ac000001-0000-0000-0000-000000000001', 'Floors 3-8', 'd0000001-0000-0000-0000-000000000004',
  2, '2024-02-01', 150000.00, 'USD', 1.000000, 150000.00, NULL, NULL, 'PO-2024-FF-002',
  1, 120, 15000.00, '2024-02-01', 1125.00, 0, 12375.00, 137625.00, 11, 0,
  @furniture, @accumDep, @depExp, NULL, NULL, NULL, 'Beds, desks, wardrobes, chairs', @now, @cb);

-- =============================================================
-- SECTION 14: RECURRING VOUCHERS
-- =============================================================
-- RecurringFrequency: Monthly=1, Quarterly=2, SemiAnnually=3, Annually=4, Custom=99

INSERT IGNORE INTO RecurringVouchers (Id, TenantId, Name, Description, Frequency, CustomIntervalDays, StartDate, EndDate, NextExecutionDate, LastExecutionDate,
  IsActive, CurrencyCode, ExchangeRate, Reference, TotalDebit, TotalCredit, ExecutionCount, CreatedAt, CreatedBy) VALUES
('rv000001-0000-0000-0000-000000000001', @tid, 'Monthly Depreciation', 'Fixed assets depreciation entry', 1, NULL,
  '2025-01-31', '2025-12-31', '2025-04-30', '2025-03-31', 1, 'USD', 1.000000, 'REC-DEP', 5000.00, 5000.00, 3, @now, @cb),
('rv000001-0000-0000-0000-000000000002', @tid, 'Monthly Rent Accrual', 'Office space rent accrual', 1, NULL,
  '2025-01-31', '2025-12-31', '2025-04-30', '2025-03-31', 1, 'USD', 1.000000, 'REC-RENT', 15000.00, 15000.00, 3, @now, @cb);

INSERT IGNORE INTO RecurringVoucherLines (Id, TenantId, RecurringVoucherId, LineNumber, AccountId, DebitAmount, CreditAmount, Description, Reference, DepartmentId, CreatedAt, CreatedBy) VALUES
-- Monthly Depreciation
('rl000001-0000-0000-0000-000000000001', @tid, 'rv000001-0000-0000-0000-000000000001', 1, @depExp,   5000.00, 0.00, 'Monthly depreciation expense', NULL, NULL, @now, @cb),
('rl000001-0000-0000-0000-000000000002', @tid, 'rv000001-0000-0000-0000-000000000001', 2, @accumDep, 0.00, 5000.00, 'Accumulated depreciation',     NULL, NULL, @now, @cb),
-- Monthly Rent
('rl000001-0000-0000-0000-000000000003', @tid, 'rv000001-0000-0000-0000-000000000002', 1, @utilities,   15000.00, 0.00, 'Office rent expense',     NULL, 'd0000001-0000-0000-0000-000000000009', @now, @cb),
('rl000001-0000-0000-0000-000000000004', @tid, 'rv000001-0000-0000-0000-000000000002', 2, @apTrade,     0.00, 15000.00, 'Rent payable',            NULL, NULL, @now, @cb);

-- =============================================================
-- SECTION 15: WORKFLOW DEFINITIONS & STEPS
-- =============================================================
-- WorkflowEntityType: JournalVoucher=1, ApInvoice=2, ArInvoice=3, ApPayment=4, ArReceipt=5

INSERT IGNORE INTO WorkflowDefinitions (Id, TenantId, Name, Description, EntityType, AmountThreshold, IsDefault, IsActive, CreatedAt, CreatedBy) VALUES
('wd000001-0000-0000-0000-000000000001', @tid, 'AP Invoice Approval', 'Standard approval for AP invoices', 2, 5000.00, 1, 1, @now, @cb),
('wd000001-0000-0000-0000-000000000002', @tid, 'Journal Voucher Approval', 'Multi-level approval for journal entries', 1, 10000.00, 1, 1, @now, @cb);

INSERT IGNORE INTO WorkflowSteps (Id, TenantId, DefinitionId, StepOrder, StepName, ApproverUserId, ApproverRoleId, AllowDelegation, CreatedAt, CreatedBy) VALUES
-- AP Invoice steps
('ws000001-0000-0000-0000-000000000001', @tid, 'wd000001-0000-0000-0000-000000000001', 1, 'Department Head Review', @hodId, NULL, 1, @now, @cb),
('ws000001-0000-0000-0000-000000000002', @tid, 'wd000001-0000-0000-0000-000000000001', 2, 'Finance Manager Approval', @adminId, NULL, 1, @now, @cb),
-- Journal Voucher steps
('ws000001-0000-0000-0000-000000000003', @tid, 'wd000001-0000-0000-0000-000000000002', 1, 'Preparer Verification', @hodId, NULL, 0, @now, @cb),
('ws000001-0000-0000-0000-000000000004', @tid, 'wd000001-0000-0000-0000-000000000002', 2, 'Controller Approval', @adminId, NULL, 1, @now, @cb),
('ws000001-0000-0000-0000-000000000005', @tid, 'wd000001-0000-0000-0000-000000000002', 3, 'CFO Final Sign-off', @adminId, NULL, 0, @now, @cb);

-- =============================================================
-- SECTION 16: REPORT TEMPLATES
-- =============================================================
-- DataSourceType: GeneralLedger=0, AccountsPayable=1, AccountsReceivable=2, AssetManagement=3
-- OutputFormat: Pdf=0, Excel=1
-- PageOrientation: Portrait=0, Landscape=1
-- ColumnType: Text=0, Number=1, Currency=2, Date=3, Boolean=4, Percentage=5
-- AggregateFunction: None=0, Sum=1, Count=2, Average=3, Min=4, Max=5

INSERT IGNORE INTO ReportTemplates (Id, TenantId, Name, Description, DataSourceType, IsPublic, DefaultOutputFormat, PageOrientation, CreatedAt, CreatedBy) VALUES
('rt000001-0000-0000-0000-000000000001', @tid, 'GL Trial Balance',       'Monthly trial balance report',          0, 1, 0, 0, @now, @cb),
('rt000001-0000-0000-0000-000000000002', @tid, 'AP Aging Summary',       'Accounts payable aging by vendor',      1, 1, 1, 1, @now, @cb),
('rt000001-0000-0000-0000-000000000003', @tid, 'AR Invoice Detail',      'Detailed AR invoice listing',           2, 1, 1, 1, @now, @cb);

INSERT IGNORE INTO ReportTemplateColumns (Id, TenantId, ReportTemplateId, FieldName, DisplayName, ColumnType, Width, `Order`, AggregateFunction, SortDirection, SortOrder, CreatedAt, CreatedBy) VALUES
-- GL Trial Balance columns
('rc000001-0000-0000-0000-000000000001', @tid, 'rt000001-0000-0000-0000-000000000001', 'AccountCode',  'Account Code',  0, 100, 1, 0, 0,    1, @now, @cb),
('rc000001-0000-0000-0000-000000000002', @tid, 'rt000001-0000-0000-0000-000000000001', 'AccountName',  'Account Name',  0, 200, 2, 0, NULL, NULL, @now, @cb),
('rc000001-0000-0000-0000-000000000003', @tid, 'rt000001-0000-0000-0000-000000000001', 'DebitBalance',  'Debit',        2, 120, 3, 1, NULL, NULL, @now, @cb),
('rc000001-0000-0000-0000-000000000004', @tid, 'rt000001-0000-0000-0000-000000000001', 'CreditBalance', 'Credit',       2, 120, 4, 1, NULL, NULL, @now, @cb),
-- AP Aging columns
('rc000001-0000-0000-0000-000000000005', @tid, 'rt000001-0000-0000-0000-000000000002', 'VendorCode',   'Vendor Code',   0, 100, 1, 0, 0,    1, @now, @cb),
('rc000001-0000-0000-0000-000000000006', @tid, 'rt000001-0000-0000-0000-000000000002', 'VendorName',   'Vendor Name',   0, 200, 2, 0, NULL, NULL, @now, @cb),
('rc000001-0000-0000-0000-000000000007', @tid, 'rt000001-0000-0000-0000-000000000002', 'Current',      'Current',       2, 120, 3, 1, NULL, NULL, @now, @cb),
('rc000001-0000-0000-0000-000000000008', @tid, 'rt000001-0000-0000-0000-000000000002', 'Over30',       '31-60 Days',    2, 120, 4, 1, NULL, NULL, @now, @cb),
('rc000001-0000-0000-0000-000000000009', @tid, 'rt000001-0000-0000-0000-000000000002', 'Over60',       '61-90 Days',    2, 120, 5, 1, NULL, NULL, @now, @cb),
('rc000001-0000-0000-0000-000000000010', @tid, 'rt000001-0000-0000-0000-000000000002', 'Over90',       'Over 90 Days',  2, 120, 6, 1, NULL, NULL, @now, @cb),
-- AR Invoice Detail columns
('rc000001-0000-0000-0000-000000000011', @tid, 'rt000001-0000-0000-0000-000000000003', 'InvoiceNumber', 'Invoice #',    0, 120, 1, 0, 0,    1, @now, @cb),
('rc000001-0000-0000-0000-000000000012', @tid, 'rt000001-0000-0000-0000-000000000003', 'CustomerName',  'Customer',     0, 200, 2, 0, NULL, NULL, @now, @cb),
('rc000001-0000-0000-0000-000000000013', @tid, 'rt000001-0000-0000-0000-000000000003', 'InvoiceDate',   'Date',         3, 100, 3, 0, NULL, NULL, @now, @cb),
('rc000001-0000-0000-0000-000000000014', @tid, 'rt000001-0000-0000-0000-000000000003', 'TotalAmount',   'Total',        2, 120, 4, 1, NULL, NULL, @now, @cb),
('rc000001-0000-0000-0000-000000000015', @tid, 'rt000001-0000-0000-0000-000000000003', 'BalanceAmount', 'Balance',      2, 120, 5, 1, NULL, NULL, @now, @cb);

-- =============================================================
-- SECTION 17: NOTIFICATIONS (for admin user)
-- =============================================================
-- NotificationType: Approval=1, Alert=2, System=3, Report=4, User=5
-- NotificationPriority: Low=1, Normal=2, High=3, Urgent=4

INSERT IGNORE INTO Notifications (Id, TenantId, UserId, Type, Priority, Title, Message, ActionUrl, EntityType, EntityId, IsRead, ReadAt, Data, CreatedAt, CreatedBy) VALUES
('nn000001-0000-0000-0000-000000000001', @tid, @adminId, 1, 3, 'Invoice Awaiting Approval',
  'AP Invoice API-2025-0002 from Fresh Farm Produce requires your approval.',
  '/ap/invoices/a1000001-0000-0000-0000-000000000002', 'ApInvoice', 'a1000001-0000-0000-0000-000000000002',
  0, NULL, NULL, @now, @cb),

('nn000001-0000-0000-0000-000000000002', @tid, @adminId, 2, 2, 'Payment Completed',
  'Payment APP-2025-0001 of $6,955.00 to Metro Utilities has been posted.',
  '/ap/payments/a2000001-0000-0000-0000-000000000001', 'ApPayment', 'a2000001-0000-0000-0000-000000000001',
  1, @now, NULL, DATE_SUB(@now, INTERVAL 2 DAY), @cb),

('nn000001-0000-0000-0000-000000000003', @tid, @adminId, 4, 1, 'Monthly Report Ready',
  'Your GL Trial Balance report for March 2025 is ready for download.',
  '/reports', NULL, NULL,
  0, NULL, NULL, DATE_SUB(@now, INTERVAL 1 DAY), @cb),

('nn000001-0000-0000-0000-000000000004', @tid, @adminId, 3, 2, 'System Maintenance',
  'Scheduled system maintenance on Sunday 11:00 PM - 2:00 AM. Please save your work.',
  NULL, NULL, NULL,
  0, NULL, NULL, DATE_SUB(@now, INTERVAL 3 HOUR), @cb),

('nn000001-0000-0000-0000-000000000005', @tid, @adminId, 2, 4, 'Budget Threshold Alert',
  'Operating Expenses have reached 85% of the monthly budget ($42,500 of $50,000).',
  '/gl/journal-vouchers', NULL, NULL,
  0, NULL, '{"budgetAmount": 50000, "currentAmount": 42500, "percentage": 85}', DATE_SUB(@now, INTERVAL 6 HOUR), @cb);

-- =============================================================
-- DONE
-- =============================================================
SELECT 'Seed data inserted successfully!' AS Result;
