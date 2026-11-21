import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { storage } from '../services/storage.ts';
import type { ServiceRecord, Customer, Vehicle, StockItem } from '../types/index.ts';

describe('Service Record Update & End-to-End Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    (storage as any).initStorage();
  });

  describe('Financial & Customer Balance Updates on Service Edit', () => {
    it('should accurately update customer debt balance when paidAmount is updated', () => {
      // Create dedicated customer with 0 initial balance
      storage.saveCustomer({
        id: 'cust-upd-1',
        fullName: 'Test Güncelleme Müşteri',
        phone: '0555 111 22 33',
        balance: 0,
        createdAt: '2026-01-01T00:00:00Z',
      });

      // 1. Create a service record with 5,000 TL total, 2,000 TL paid (3,000 TL balance)
      const record: ServiceRecord = {
        id: 'srv-upd-fin-1',
        vehicleId: 'veh-1',
        customerId: 'cust-upd-1',
        entryDate: '2026-11-20T10:00:00Z',
        entryKm: 150000,
        complaint: 'Periyodik bakım',
        status: 'ISLEMDE',
        partsTotal: 3000,
        laborTotal: 2000,
        discount: 0,
        grandTotal: 5000,
        paidAmount: 2000,
        paymentStatus: 'KISMI_ODENDI',
        paymentMethod: 'NAKIT',
        items: [
          {
            id: 'it-f1',
            serviceRecordId: 'srv-upd-fin-1',
            itemType: 'PARCA',
            name: 'Yağ Değişimi',
            quantity: 1,
            unitPrice: 3000,
            costPrice: 2000,
            totalPrice: 3000,
          },
          {
            id: 'it-f2',
            serviceRecordId: 'srv-upd-fin-1',
            itemType: 'ISCILIK',
            name: 'İşçilik',
            quantity: 1,
            unitPrice: 2000,
            costPrice: 0,
            totalPrice: 2000,
          },
        ],
        createdAt: '2026-11-20T10:00:00Z',
      };

      storage.saveServiceRecord(record);

      const customerAfterFirstSave = storage.getCustomer('cust-upd-1');
      assert.ok(customerAfterFirstSave);
      assert.strictEqual(customerAfterFirstSave.balance, 3000, 'Customer balance should reflect 3,000 TL unpaid');

      // Check cash transaction
      const cashList = storage.getCashTransactions();
      const tx = cashList.find(t => t.relatedServiceId === 'srv-upd-fin-1');
      assert.ok(tx, 'Cash transaction should be created for initial 2,000 TL paid');
      assert.strictEqual(tx.amount, 2000);

      // 2. Update service record: Customer pays remaining balance in full (paidAmount = 5,000 TL)
      const updatedRecord: ServiceRecord = {
        ...record,
        paidAmount: 5000,
        paymentStatus: 'ODENDI',
        paymentMethod: 'KREDI_KARTI',
      };

      storage.saveServiceRecord(updatedRecord);

      const customerAfterUpdate = storage.getCustomer('cust-upd-1');
      assert.ok(customerAfterUpdate);
      assert.strictEqual(customerAfterUpdate.balance, 0, 'Customer balance must drop to 0 TL after full payment');

      // Check cash transaction was updated to 5,000 TL and paymentMethod changed to KREDI_KARTI
      const updatedTx = storage.getCashTransactions().find(t => t.relatedServiceId === 'srv-upd-fin-1');
      assert.ok(updatedTx);
      assert.strictEqual(updatedTx.amount, 5000, 'Cash transaction amount must be updated to 5,000 TL');
      assert.strictEqual(updatedTx.paymentMethod, 'KREDI_KARTI');
    });

    it('should recalculate customer balance when discount or items change in an existing service', () => {
      storage.saveCustomer({
        id: 'cust-upd-2',
        fullName: 'İskonto Test Müşteri',
        phone: '0555 222 33 44',
        balance: 0,
        createdAt: '2026-01-01T00:00:00Z',
      });

      const record: ServiceRecord = {
        id: 'srv-upd-disc-1',
        vehicleId: 'veh-1',
        customerId: 'cust-upd-2',
        entryDate: '2026-11-20T10:00:00Z',
        entryKm: 150000,
        complaint: 'Ağır bakım',
        status: 'ISLEMDE',
        partsTotal: 4000,
        laborTotal: 1000,
        discount: 0,
        grandTotal: 5000,
        paidAmount: 1000,
        paymentStatus: 'KISMI_ODENDI',
        paymentMethod: 'NAKIT',
        items: [],
        createdAt: '2026-11-20T10:00:00Z',
      };

      storage.saveServiceRecord(record);
      assert.strictEqual(storage.getCustomer('cust-upd-2')?.balance, 4000);

      // Apply 1,000 TL discount on update -> GrandTotal becomes 4,000 TL, remaining debt becomes 3,000 TL
      const updatedWithDiscount: ServiceRecord = {
        ...record,
        discount: 1000,
        grandTotal: 4000,
      };

      storage.saveServiceRecord(updatedWithDiscount);
      assert.strictEqual(storage.getCustomer('cust-upd-2')?.balance, 3000, 'Customer balance should decrease to 3,000 TL after discount');
    });

    it('should delete cash transaction if paidAmount is reverted back to 0 (unpaid/veresiye)', () => {
      storage.saveCustomer({
        id: 'cust-upd-3',
        fullName: 'Revert Test Müşteri',
        phone: '0555 333 44 55',
        balance: 0,
        createdAt: '2026-01-01T00:00:00Z',
      });

      const record: ServiceRecord = {
        id: 'srv-upd-revert-1',
        vehicleId: 'veh-1',
        customerId: 'cust-upd-3',
        entryDate: '2026-11-20T10:00:00Z',
        entryKm: 150000,
        complaint: 'Ödeme İptal Testi',
        status: 'ISLEMDE',
        partsTotal: 2500,
        laborTotal: 500,
        discount: 0,
        grandTotal: 3000,
        paidAmount: 3000,
        paymentStatus: 'ODENDI',
        paymentMethod: 'NAKIT',
        items: [],
        createdAt: '2026-11-20T10:00:00Z',
      };

      storage.saveServiceRecord(record);
      assert.ok(storage.getCashTransactions().some(t => t.relatedServiceId === 'srv-upd-revert-1'));

      // Revert payment to 0 TL (customer requested open account)
      const revertedRecord: ServiceRecord = {
        ...record,
        paidAmount: 0,
        paymentStatus: 'BEKLIYOR',
      };

      storage.saveServiceRecord(revertedRecord);

      assert.strictEqual(storage.getCustomer('cust-upd-3')?.balance, 3000, 'Customer balance should now be 3,000 TL');
      assert.strictEqual(
        storage.getCashTransactions().some(t => t.relatedServiceId === 'srv-upd-revert-1'),
        false,
        'Cash transaction should be deleted when paidAmount reverts to 0'
      );
    });
  });

  describe('Inventory Stock Delta Reconciliation on Service Edit', () => {
    it('should deduct additional stock when item quantity is increased on edit', () => {
      // stk-1 initial quantity is 14
      const initialStock = storage.getStockItem('stk-1')?.quantity || 0;
      assert.ok(initialStock > 5);

      const record: ServiceRecord = {
        id: 'srv-stock-delta-1',
        vehicleId: 'veh-1',
        customerId: 'cust-1',
        entryDate: '2026-11-20T10:00:00Z',
        entryKm: 150000,
        complaint: 'Yağ Değişimi',
        status: 'ISLEMDE',
        partsTotal: 1850,
        laborTotal: 500,
        discount: 0,
        grandTotal: 2350,
        paidAmount: 2350,
        paymentStatus: 'ODENDI',
        items: [
          {
            id: 'it-s1',
            serviceRecordId: 'srv-stock-delta-1',
            itemType: 'PARCA',
            name: 'Castrol Edge 5W-30',
            quantity: 1, // 1 used initially
            unitPrice: 1850,
            costPrice: 1350,
            totalPrice: 1850,
            stockItemId: 'stk-1',
          },
        ],
        createdAt: '2026-11-20T10:00:00Z',
      };

      storage.saveServiceRecord(record);
      assert.strictEqual(storage.getStockItem('stk-1')?.quantity, initialStock - 1, 'Initial stock should decrease by 1');

      // Edit record to use 3 items (an increase of 2)
      const updatedRecord: ServiceRecord = {
        ...record,
        partsTotal: 5550,
        grandTotal: 6050,
        paidAmount: 6050,
        items: [
          {
            ...record.items[0],
            quantity: 3,
            totalPrice: 5550,
          },
        ],
      };

      storage.saveServiceRecord(updatedRecord);
      assert.strictEqual(
        storage.getStockItem('stk-1')?.quantity,
        initialStock - 3,
        'Stock should decrease by an additional 2 (total 3 deducted from baseline)'
      );
    });

    it('should restore stock when item quantity is decreased on edit', () => {
      const initialStock = storage.getStockItem('stk-1')?.quantity || 0;

      const record: ServiceRecord = {
        id: 'srv-stock-delta-2',
        vehicleId: 'veh-1',
        customerId: 'cust-1',
        entryDate: '2026-11-20T10:00:00Z',
        entryKm: 150000,
        complaint: 'Yağ Değişimi',
        status: 'ISLEMDE',
        partsTotal: 5550,
        laborTotal: 500,
        discount: 0,
        grandTotal: 6050,
        paidAmount: 6050,
        paymentStatus: 'ODENDI',
        items: [
          {
            id: 'it-s2',
            serviceRecordId: 'srv-stock-delta-2',
            itemType: 'PARCA',
            name: 'Castrol Edge 5W-30',
            quantity: 3, // 3 used initially
            unitPrice: 1850,
            costPrice: 1350,
            totalPrice: 5550,
            stockItemId: 'stk-1',
          },
        ],
        createdAt: '2026-11-20T10:00:00Z',
      };

      storage.saveServiceRecord(record);
      assert.strictEqual(storage.getStockItem('stk-1')?.quantity, initialStock - 3);

      // Edit record to decrease quantity from 3 to 1 (return 2 to inventory)
      const updatedRecord: ServiceRecord = {
        ...record,
        items: [
          {
            ...record.items[0],
            quantity: 1,
            totalPrice: 1850,
          },
        ],
      };

      storage.saveServiceRecord(updatedRecord);
      assert.strictEqual(
        storage.getStockItem('stk-1')?.quantity,
        initialStock - 1,
        'Stock should be restored by 2 (returning to initialStock - 1)'
      );
    });

    it('should fully restore stock when a stock item is removed from an existing service record', () => {
      const initialStock = storage.getStockItem('stk-2')?.quantity || 0; // Motul 5L

      const record: ServiceRecord = {
        id: 'srv-stock-delta-3',
        vehicleId: 'veh-1',
        customerId: 'cust-1',
        entryDate: '2026-11-20T10:00:00Z',
        entryKm: 150000,
        complaint: 'Şanzıman Yağı',
        status: 'ISLEMDE',
        partsTotal: 2200,
        laborTotal: 800,
        discount: 0,
        grandTotal: 3000,
        paidAmount: 3000,
        paymentStatus: 'ODENDI',
        items: [
          {
            id: 'it-s3',
            serviceRecordId: 'srv-stock-delta-3',
            itemType: 'PARCA',
            name: 'Motul 8100 5L',
            quantity: 2, // 2 used initially
            unitPrice: 1100,
            costPrice: 800,
            totalPrice: 2200,
            stockItemId: 'stk-2',
          },
        ],
        createdAt: '2026-11-20T10:00:00Z',
      };

      storage.saveServiceRecord(record);
      assert.strictEqual(storage.getStockItem('stk-2')?.quantity, initialStock - 2);

      // User removes the stock item completely from service items
      const updatedRecord: ServiceRecord = {
        ...record,
        items: [
          {
            id: 'it-labor-only',
            serviceRecordId: 'srv-stock-delta-3',
            itemType: 'ISCILIK',
            name: 'Genel Kontrol',
            quantity: 1,
            unitPrice: 500,
            costPrice: 0,
            totalPrice: 500,
          },
        ],
      };

      storage.saveServiceRecord(updatedRecord);
      assert.strictEqual(
        storage.getStockItem('stk-2')?.quantity,
        initialStock,
        'Stock must be fully restored back to initial level when item is removed'
      );
    });

    it('should deduct stock when a new stock item is added to an existing service record', () => {
      const initialStock = storage.getStockItem('stk-3')?.quantity || 0; // Mann Yağ Filtresi

      // Initially only labor, no stock parts
      const record: ServiceRecord = {
        id: 'srv-stock-delta-4',
        vehicleId: 'veh-1',
        customerId: 'cust-1',
        entryDate: '2026-11-20T10:00:00Z',
        entryKm: 150000,
        complaint: 'Kontrol',
        status: 'ISLEMDE',
        partsTotal: 0,
        laborTotal: 800,
        discount: 0,
        grandTotal: 800,
        paidAmount: 800,
        paymentStatus: 'ODENDI',
        items: [
          {
            id: 'it-l1',
            serviceRecordId: 'srv-stock-delta-4',
            itemType: 'ISCILIK',
            name: 'Kontrol',
            quantity: 1,
            unitPrice: 800,
            costPrice: 0,
            totalPrice: 800,
          },
        ],
        createdAt: '2026-11-20T10:00:00Z',
      };

      storage.saveServiceRecord(record);
      assert.strictEqual(storage.getStockItem('stk-3')?.quantity, initialStock);

      // User adds Mann Yağ Filtresi (stk-3, qty 2) in update modal
      const updatedRecord: ServiceRecord = {
        ...record,
        items: [
          ...record.items,
          {
            id: 'it-snew',
            serviceRecordId: 'srv-stock-delta-4',
            itemType: 'PARCA',
            name: 'Mann Yağ Filtresi',
            quantity: 2,
            unitPrice: 350,
            costPrice: 200,
            totalPrice: 700,
            stockItemId: 'stk-3',
          },
        ],
      };

      storage.saveServiceRecord(updatedRecord);
      assert.strictEqual(
        storage.getStockItem('stk-3')?.quantity,
        initialStock - 2,
        'New stock item added during edit must deduct its quantity from warehouse stock'
      );
    });
  });

  describe('Vehicle KM and Service Deletion Integration', () => {
    it('should update vehicle currentKm when service entryKm is increased on edit', () => {
      const vehicle = storage.getVehicle('veh-1');
      assert.ok(vehicle);
      const startKm = vehicle.currentKm;

      const record: ServiceRecord = {
        id: 'srv-km-upd',
        vehicleId: 'veh-1',
        customerId: 'cust-1',
        entryDate: '2026-11-20T10:00:00Z',
        entryKm: startKm,
        complaint: 'KM Testi',
        status: 'ISLEMDE',
        partsTotal: 0,
        laborTotal: 1000,
        discount: 0,
        grandTotal: 1000,
        paidAmount: 1000,
        paymentStatus: 'ODENDI',
        items: [],
        createdAt: '2026-11-20T10:00:00Z',
      };

      storage.saveServiceRecord(record);
      assert.strictEqual(storage.getVehicle('veh-1')?.currentKm, startKm);

      // Technician corrects vehicle entry KM to startKm + 5,000
      const updatedRecord: ServiceRecord = {
        ...record,
        entryKm: startKm + 5000,
      };

      storage.saveServiceRecord(updatedRecord);
      assert.strictEqual(
        storage.getVehicle('veh-1')?.currentKm,
        startKm + 5000,
        'Vehicle currentKm must be updated when service record entryKm is corrected upwards'
      );
    });

    it('should cleanly delete service record and restore stock & recalculate customer balance', () => {
      const initialStock = storage.getStockItem('stk-1')?.quantity || 0;

      const record: ServiceRecord = {
        id: 'srv-delete-test',
        vehicleId: 'veh-1',
        customerId: 'cust-1',
        entryDate: '2026-11-20T10:00:00Z',
        entryKm: 150000,
        complaint: 'Silinecek İş Emri',
        status: 'ISLEMDE',
        partsTotal: 1850,
        laborTotal: 1000,
        discount: 0,
        grandTotal: 2850,
        paidAmount: 1000, // 1850 TL debt
        paymentStatus: 'KISMI_ODENDI',
        paymentMethod: 'NAKIT',
        items: [
          {
            id: 'it-del',
            serviceRecordId: 'srv-delete-test',
            itemType: 'PARCA',
            name: 'Castrol Yağ',
            quantity: 1,
            unitPrice: 1850,
            costPrice: 1350,
            totalPrice: 1850,
            stockItemId: 'stk-1',
          },
        ],
        createdAt: '2026-11-20T10:00:00Z',
      };

      storage.saveServiceRecord(record);
      assert.strictEqual(storage.getStockItem('stk-1')?.quantity, initialStock - 1);
      assert.ok(storage.getCashTransactions().some(t => t.relatedServiceId === 'srv-delete-test'));

      const debtBefore = storage.getCustomer('cust-1')?.balance || 0;

      // Delete service record
      const result = storage.deleteServiceRecord('srv-delete-test');
      assert.strictEqual(result, true);

      // Verify record is gone
      assert.strictEqual(storage.getServiceRecord('srv-delete-test'), undefined);

      // Verify stock restored
      assert.strictEqual(storage.getStockItem('stk-1')?.quantity, initialStock, 'Stock must be restored on deletion');

      // Verify cash transaction removed
      assert.strictEqual(
        storage.getCashTransactions().some(t => t.relatedServiceId === 'srv-delete-test'),
        false,
        'Linked cash transaction must be removed on deletion'
      );

      // Verify customer debt decreased by 1850 TL
      const debtAfter = storage.getCustomer('cust-1')?.balance || 0;
      assert.strictEqual(debtAfter, debtBefore - 1850, 'Customer balance should remove the debt of the deleted service');
    });
  });
});
