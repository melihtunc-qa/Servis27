import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { storage } from '../services/storage.ts';
import type { ServiceRecord, StockItem, Reminder } from '../types/index.ts';

describe('Real-Time Storage Event Reactivity & Badge Trigger Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    // Re-initialize storage
    (storage as any).initStorage();
  });

  it('should notify subscriber when a new service record is created', () => {
    let callCount = 0;
    const unsubscribe = storage.subscribe(() => {
      callCount++;
    });

    const newRecord: ServiceRecord = {
      id: `rec-reactive-${Date.now()}`,
      customerId: 'cust-1',
      vehicleId: 'veh-1',
      entryDate: new Date().toISOString(),
      entryKm: 150000,
      intakeChecklist: {
        fuelLevel: '1/2',
        hasSpareTire: true,
        hasJackAndTools: true,
      },
      complaint: 'Fren balatası ötüyor',
      diagnosis: 'Ön balatalar aşınmış',
      status: 'ISLEMDE',
      items: [
        { id: 'item-1', serviceRecordId: 'rec-1', itemType: 'PARCA', name: 'Ön Balata', quantity: 1, unitPrice: 1200, costPrice: 800, totalPrice: 1200 },
      ],
      partsTotal: 1200,
      laborTotal: 0,
      discount: 0,
      grandTotal: 1200,
      paymentStatus: 'BEKLIYOR',
      paidAmount: 0,
      paymentMethod: 'NAKIT',
      technicianId: 'tech-1',
      createdAt: new Date().toISOString(),
    };

    const initialActive = storage.getServiceRecords().filter(r => r.status === 'ISLEMDE' || r.status === 'PARCA_BEKLENIYOR').length;
    
    storage.saveServiceRecord(newRecord);

    const afterActive = storage.getServiceRecords().filter(r => r.status === 'ISLEMDE' || r.status === 'PARCA_BEKLENIYOR').length;

    assert.strictEqual(callCount >= 1, true, 'Subscriber should be notified on saving service record');
    assert.strictEqual(afterActive, initialActive + 1, 'Active service count should increase by 1');

    unsubscribe();
  });

  it('should notify subscriber when service status is updated (e.g. to TESLIM_EDILDI)', () => {
    let notified = false;
    const records = storage.getServiceRecords();
    const active = records.find(r => r.status === 'ISLEMDE');
    assert.ok(active, 'Must have at least one active record');

    const unsubscribe = storage.subscribe(() => {
      notified = true;
    });

    const updated: ServiceRecord = {
      ...active,
      status: 'TESLIM_EDILDI',
      exitDate: new Date().toISOString(),
    };

    storage.saveServiceRecord(updated);

    assert.strictEqual(notified, true, 'Storage event listener must be fired when status is changed');
    unsubscribe();
  });

  it('should notify subscriber when stock is deducted or low stock is reached', () => {
    let listenerFired = false;
    const unsubscribe = storage.subscribe(() => {
      listenerFired = true;
    });

    const stockItem: StockItem = {
      id: `stk-reactive-${Date.now()}`,
      code: 'TEST-PART-1',
      name: 'Test Filtre',
      category: 'Filtre',
      brand: 'Bosch',
      quantity: 5,
      minQuantity: 3,
      unitCost: 100,
      unitPrice: 200,
      shelfLocation: 'Raf X',
      updatedAt: new Date().toISOString(),
    };

    storage.saveStockItem(stockItem);
    assert.strictEqual(listenerFired, true, 'Saving stock item must trigger notification');

    listenerFired = false;
    // Deduct stock to trigger low-stock
    storage.deductStock(stockItem.id, 4); // quantity becomes 1 <= minQuantity 3
    assert.strictEqual(listenerFired, true, 'Deducting stock must trigger notification');

    const lowStockItems = storage.getLowStockItems();
    assert.ok(lowStockItems.some(i => i.id === stockItem.id), 'Item should now be in low stock list');

    unsubscribe();
  });

  it('should notify subscriber when a reminder is saved or deleted', () => {
    let callCount = 0;
    const unsubscribe = storage.subscribe(() => {
      callCount++;
    });

    const reminder: Reminder = {
      id: `rem-reactive-${Date.now()}`,
      vehicleId: 'veh-1',
      customerId: 'cust-1',
      type: 'YAG_BAKIMI',
      title: 'Periyodik Yağ Değişimi',
      targetDate: '2026-12-01',
      targetKm: 160000,
      lastServiceKm: 150000,
      status: 'YAKLASAN',
      notes: 'Test notu',
      createdAt: new Date().toISOString(),
    };

    storage.saveReminder(reminder);
    assert.strictEqual(callCount >= 1, true, 'Subscriber should be notified on saving reminder');

    const previousCount = callCount;
    storage.deleteReminder(reminder.id);
    assert.strictEqual(callCount > previousCount, true, 'Subscriber should be notified on deleting reminder');

    unsubscribe();
  });

  it('should notify subscriber when backup is imported', () => {
    let listenerFired = false;
    const unsubscribe = storage.subscribe(() => {
      listenerFired = true;
    });

    const backupJson = storage.exportBackup();
    const result = storage.importBackup(backupJson);

    assert.strictEqual(result, true);
    assert.strictEqual(listenerFired, true, 'Importing backup must notify listeners');

    unsubscribe();
  });

  it('should stop notifying subscriber after unsubscribe is called', () => {
    let count = 0;
    const unsubscribe = storage.subscribe(() => {
      count++;
    });

    const reminder: Reminder = {
      id: `rem-unsub-${Date.now()}`,
      vehicleId: 'veh-1',
      customerId: 'cust-1',
      type: 'FREN_BALATA',
      title: 'Fren Kontrol',
      targetDate: '2026-12-01',
      status: 'YAKLASAN',
      createdAt: new Date().toISOString(),
    };

    storage.saveReminder(reminder);
    assert.strictEqual(count, 1);

    unsubscribe();

    storage.deleteReminder(reminder.id);
    assert.strictEqual(count, 1, 'Count must not increase after unsubscribe');
  });
});
