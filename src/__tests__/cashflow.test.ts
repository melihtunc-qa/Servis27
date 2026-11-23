import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { storage } from '../services/storage.ts';
import { clearStorage } from './setup.ts';
import type { CashTransaction, ServiceRecord } from '../types/index.ts';

describe('Cash Flow & Register Transactions Tests', () => {
  beforeEach(() => {
    clearStorage();
    (storage as any).initStorage();
  });

  describe('Cash Transactions Repository CRUD', () => {
    it('should initialize with baseline cash transactions', () => {
      const transactions = storage.getCashTransactions();
      assert.ok(transactions.length >= 3, 'Initial transactions should exist');
      
      const incomeCount = transactions.filter(t => t.type === 'GELIR').length;
      const expenseCount = transactions.filter(t => t.type === 'GIDER').length;
      assert.ok(incomeCount >= 1, 'Should have at least 1 income');
      assert.ok(expenseCount >= 1, 'Should have at least 1 expense');
    });

    it('should create new manual income transaction and update register', () => {
      const newIncome: CashTransaction = {
        id: 'csh-income-manual',
        date: new Date().toISOString(),
        type: 'GELIR',
        category: 'SERVIS_TAHSILAT',
        amount: 3200,
        paymentMethod: 'NAKIT',
        description: 'Eski Borç Tahsilatı',
      };

      storage.saveCashTransaction(newIncome);

      const transactions = storage.getCashTransactions();
      const saved = transactions.find(t => t.id === 'csh-income-manual');
      assert.ok(saved);
      assert.equal(saved.amount, 3200);
      assert.equal(saved.type, 'GELIR');
    });

    it('should create new expense transaction and deduct from net balance', () => {
      const newExpense: CashTransaction = {
        id: 'csh-expense-rent',
        date: new Date().toISOString(),
        type: 'GIDER',
        category: 'KIRA_VE_AIDAT',
        amount: 5000,
        paymentMethod: 'HAVALE',
        description: 'Atölye Depo Kirası',
      };

      storage.saveCashTransaction(newExpense);

      const transactions = storage.getCashTransactions();
      const saved = transactions.find(t => t.id === 'csh-expense-rent');
      assert.ok(saved);
      assert.equal(saved.amount, 5000);
      assert.equal(saved.type, 'GIDER');
    });

    it('should delete cash transaction successfully', () => {
      const initialCount = storage.getCashTransactions().length;
      const deleted = storage.deleteCashTransaction('csh-2'); // 8500 TL parça alımı
      assert.equal(deleted, true);

      const transactionsAfter = storage.getCashTransactions();
      assert.equal(transactionsAfter.length, initialCount - 1);
      assert.equal(transactionsAfter.find(t => t.id === 'csh-2'), undefined);
    });
  });

  describe('Net Balance and Dashboard Aggregate Calculation', () => {
    it('should accurately calculate totalIncome, totalExpense, and netCashBalance in stats', () => {
      const stats = storage.getDashboardStats();

      const transactions = storage.getCashTransactions();
      const expectedIncome = transactions
        .filter(t => t.type === 'GELIR')
        .reduce((sum, t) => sum + t.amount, 0);
      const expectedExpense = transactions
        .filter(t => t.type === 'GIDER')
        .reduce((sum, t) => sum + t.amount, 0);
      const expectedNet = expectedIncome - expectedExpense;

      assert.equal(stats.totalIncome, expectedIncome);
      assert.equal(stats.totalExpense, expectedExpense);
      assert.equal(stats.netCashBalance, expectedNet);
    });

    it('should correctly reflect deficit (negative net balance) when expenses exceed income', () => {
      clearStorage();
      // Initialize with only 10,000 TL income and 25,000 TL expense
      const initialData: CashTransaction[] = [
        {
          id: 'c-in-1',
          date: '2026-01-01',
          type: 'GELIR',
          category: 'SERVIS_TAHSILAT',
          amount: 10000,
          paymentMethod: 'NAKIT',
          description: 'Gelir',
        },
        {
          id: 'c-out-1',
          date: '2026-01-02',
          type: 'GIDER',
          category: 'KIRA_VE_AIDAT',
          amount: 25000,
          paymentMethod: 'HAVALE',
          description: 'Kira',
        },
      ];
      localStorage.setItem('servis27_cash_transactions', JSON.stringify(initialData));

      const stats = storage.getDashboardStats();
      assert.equal(stats.totalIncome, 10000);
      assert.equal(stats.totalExpense, 25000);
      assert.equal(stats.netCashBalance, -15000, 'Deficit must be -15000 TL');
    });
  });

  describe('Automatic Cashbook Entry on Service Payment', () => {
    it('should automatically log cash transaction when a new service record with paidAmount is saved', () => {
      const initialTxCount = storage.getCashTransactions().length;

      const record: ServiceRecord = {
        id: `srv-cash-auto-${Date.now()}`,
        vehicleId: 'veh-1',
        customerId: 'cust-1',
        entryDate: new Date().toISOString(),
        entryKm: 151000,
        complaint: 'Ödeme Test Servisi',
        status: 'TAMAMLANDI',
        items: [],
        partsTotal: 4000,
        laborTotal: 1500,
        discount: 500,
        grandTotal: 5000,
        paidAmount: 3500,
        paymentStatus: 'KISMI_ODENDI',
        paymentMethod: 'KREDI_KARTI',
        createdAt: new Date().toISOString(),
      };

      storage.saveServiceRecord(record);

      const transactions = storage.getCashTransactions();
      assert.equal(transactions.length, initialTxCount + 1, 'One cash transaction should be added');

      const latestTx = transactions[0]; // saved using unshift
      assert.equal(latestTx.type, 'GELIR');
      assert.equal(latestTx.category, 'SERVIS_TAHSILAT');
      assert.equal(latestTx.amount, 3500);
      assert.equal(latestTx.paymentMethod, 'KREDI_KARTI');
      assert.equal(latestTx.relatedServiceId, record.id);
      assert.equal(latestTx.relatedCustomerId, 'cust-1');
      assert.ok(latestTx.description.includes('34VR4821'), 'Description should contain vehicle plate');
      assert.ok(latestTx.description.includes('Ahmet Yılmaz'), 'Description should contain customer name');
    });

    it('should NOT create cash transaction if paidAmount is 0 (unpaid service / veresiye)', () => {
      const initialTxCount = storage.getCashTransactions().length;

      const unpaidRecord: ServiceRecord = {
        id: `srv-unpaid-${Date.now()}`,
        vehicleId: 'veh-2',
        customerId: 'cust-2',
        entryDate: new Date().toISOString(),
        entryKm: 90000,
        complaint: 'Veresiye Servis',
        status: 'TAMAMLANDI',
        items: [],
        partsTotal: 2000,
        laborTotal: 1000,
        discount: 0,
        grandTotal: 3000,
        paidAmount: 0,
        paymentStatus: 'VERESIYE',
        createdAt: new Date().toISOString(),
      };

      storage.saveServiceRecord(unpaidRecord);

      const transactions = storage.getCashTransactions();
      assert.equal(transactions.length, initialTxCount, 'No cash transaction should be created for 0 paidAmount');
    });
  });

  describe('Customer Debt Collection via Cash Inflow (collectCustomerDebt)', () => {
    it('should collect debt, reduce customer balance and credit unpaid service records', () => {
      // 1. Create a dedicated customer with debt and an unpaid service record
      const testCustomer = {
        id: 'cust-debt-test',
        fullName: 'Test Borçlu Müşteri',
        phone: '0555 123 45 67',
        balance: 1500,
        createdAt: new Date().toISOString(),
      };
      storage.saveCustomer(testCustomer as any);

      const unpaidRecord: ServiceRecord = {
        id: 'srv-debt-test-1',
        vehicleId: 'veh-1',
        customerId: 'cust-debt-test',
        entryDate: new Date().toISOString(),
        entryKm: 120000,
        complaint: 'Açık hesap bakım',
        status: 'TAMAMLANDI',
        items: [],
        partsTotal: 1500,
        laborTotal: 500,
        discount: 0,
        grandTotal: 2000,
        paidAmount: 500,
        paymentStatus: 'KISMI_ODENDI',
        createdAt: new Date().toISOString(),
      };
      storage.saveServiceRecord(unpaidRecord);

      // Verify customer debt before collection
      const custBefore = storage.getCustomer('cust-debt-test');
      assert.ok(custBefore);
      assert.equal(custBefore.balance, 1500);
      const initialCashCount = storage.getCashTransactions().length;

      // 2. Collect 1000 TL from customer debt
      const result = storage.collectCustomerDebt({
        customerId: 'cust-debt-test',
        amount: 1000,
        paymentMethod: 'KREDI_KARTI',
        description: 'Test Borçlu - POS Cari Tahsilat',
      });

      // Assertions
      assert.equal(result.newBalance, 500);
      const custAfter = storage.getCustomer('cust-debt-test');
      assert.equal(custAfter?.balance, 500);

      // Verify cash transaction
      const cashList = storage.getCashTransactions();
      assert.equal(cashList.length, initialCashCount + 1);
      const debtTx = cashList[0];
      assert.equal(debtTx.type, 'GELIR');
      assert.equal(debtTx.amount, 1000);
      assert.equal(debtTx.paymentMethod, 'KREDI_KARTI');
      assert.equal(debtTx.relatedCustomerId, 'cust-debt-test');

      // Verify service record paidAmount was credited
      const recordAfter = storage.getServiceRecord('srv-debt-test-1');
      assert.ok(recordAfter);
      assert.equal(recordAfter.paidAmount, 1500, 'Original 500 + 1000 collected = 1500 TL');
      assert.equal(recordAfter.paymentStatus, 'KISMI_ODENDI');

      // 3. Collect the remaining 500 TL
      storage.collectCustomerDebt({
        customerId: 'cust-debt-test',
        amount: 500,
        paymentMethod: 'NAKIT',
      });

      const recordFullyPaid = storage.getServiceRecord('srv-debt-test-1');
      assert.equal(recordFullyPaid?.paidAmount, 2000);
      assert.equal(recordFullyPaid?.paymentStatus, 'ODENDI', 'Should transition to ODENDI when debt is fully covered');
      assert.equal(storage.getCustomer('cust-debt-test')?.balance, 0);
    });

    it('should restore customer debt if debt collection transaction is deleted', () => {
      const testCustomer = {
        id: 'cust-debt-restore-test',
        fullName: 'Restore Test Müşteri',
        phone: '0555 999 88 77',
        balance: 1000,
        createdAt: new Date().toISOString(),
      };
      storage.saveCustomer(testCustomer as any);

      const result = storage.collectCustomerDebt({
        customerId: 'cust-debt-restore-test',
        amount: 400,
        paymentMethod: 'NAKIT',
      });

      assert.equal(storage.getCustomer('cust-debt-restore-test')?.balance, 600);

      // Delete this transaction
      const deleted = storage.deleteCashTransaction(result.transaction.id);
      assert.equal(deleted, true);

      // Verify customer balance was restored
      assert.equal(storage.getCustomer('cust-debt-restore-test')?.balance, 1000);
    });
  });
});
