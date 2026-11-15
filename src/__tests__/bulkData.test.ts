import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { storage } from '../services/storage.ts';
import { 
  generate100Customers, 
  generate100Vehicles, 
  generate100StockItems, 
  generateRealisticServiceRecords, 
  generateRealisticReminders 
} from '../services/mockData100.ts';

describe('100 Bulk Test Data & High-Volume Behavior Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    (storage as any).initStorage();
  });

  describe('100 Customers Dataset Verification', () => {
    it('should generate exactly 100 distinct customers with valid phones and names', () => {
      const customers = generate100Customers();
      assert.strictEqual(customers.length, 100, 'Must generate exactly 100 customers');

      const uniqueIds = new Set(customers.map(c => c.id));
      assert.strictEqual(uniqueIds.size, 100, 'All 100 customer IDs must be unique');

      const uniquePhones = new Set(customers.map(c => c.phone));
      assert.strictEqual(uniquePhones.size, 100, 'All 100 customer phone numbers must be unique');

      // Check balance tracking
      const debtors = customers.filter(c => c.balance > 0);
      assert.ok(debtors.length >= 10, 'Should have multiple customers with receivable balances');
    });
  });

  describe('100 Vehicles Dataset Verification & Search Performance', () => {
    it('should generate exactly 100 distinct vehicles with unique plates', () => {
      const customers = generate100Customers();
      const vehicles = generate100Vehicles(customers);
      assert.strictEqual(vehicles.length, 100, 'Must generate exactly 100 vehicles');

      const uniquePlates = new Set(vehicles.map(v => v.plate));
      assert.strictEqual(uniquePlates.size, 100, 'All 100 vehicle plates must be unique');

      // Verify every vehicle has a valid customer link
      const customerIds = new Set(customers.map(c => c.id));
      vehicles.forEach(v => {
        assert.ok(customerIds.has(v.customerId), `Vehicle ${v.plate} must link to an existing customer`);
        assert.ok(v.currentKm > 0, `Vehicle ${v.plate} must have positive KM`);
        assert.ok(v.vin && v.vin.length >= 10, `Vehicle ${v.plate} must have valid VIN`);
      });
    });

    it('should quickly perform contain and substring search across 100 vehicles', () => {
      const t0 = performance.now();
      const vrMatches = storage.searchVehiclesByPlate('VR');
      const duration = performance.now() - t0;

      assert.ok(duration < 50, `100 vehicles search should be fast (<50ms), took ${duration.toFixed(2)}ms`);
      assert.ok(vrMatches.length >= 5, 'Should find multiple vehicles containing "VR"');
      assert.ok(vrMatches.some(v => v.plate === '34VR8726'), 'Must include 34VR8726');
      assert.ok(vrMatches.some(v => v.plate === '34VR4821'), 'Must include 34VR4821');

      // Search by partial numbers: '87' and '26'
      const search87 = storage.searchVehiclesByPlate('87');
      assert.ok(search87.some(v => v.plate.includes('87')));

      const search26 = storage.searchVehiclesByPlate('26');
      assert.ok(search26.some(v => v.plate.includes('26')));
    });
  });

  describe('100 Spare Parts & Inventory Alarms Verification', () => {
    it('should generate exactly 100 distinct stock items across diverse categories', () => {
      const stockItems = generate100StockItems();
      assert.strictEqual(stockItems.length, 100, 'Must generate exactly 100 stock items');

      const uniqueCodes = new Set(stockItems.map(s => s.code));
      assert.strictEqual(uniqueCodes.size, 100, 'All 100 stock codes must be unique');

      const categories = new Set(stockItems.map(s => s.category));
      assert.ok(categories.size >= 8, 'Must cover at least 8 automotive categories');
      assert.ok(categories.has('Motor Yağı'));
      assert.ok(categories.has('Filtre'));
      assert.ok(categories.has('Fren Sistemi'));
      assert.ok(categories.has('Süspansiyon & Ön Takım'));
      assert.ok(categories.has('Debriyaj & Şanzıman'));
      assert.ok(categories.has('Triger & Kayış'));
    });

    it('should properly identify critical low-stock items in the 100 items inventory', () => {
      const lowStock = storage.getLowStockItems();
      assert.ok(lowStock.length >= 10, 'Should have at least 10 critical low stock items');
      lowStock.forEach(item => {
        assert.ok(
          item.quantity <= item.minQuantity,
          `Item ${item.code} in lowStock must satisfy quantity <= minQuantity (${item.quantity} <= ${item.minQuantity})`
        );
      });
    });
  });

  describe('Storage.seed100TestData() Service Method & Real-Time Sync', () => {
    it('should seed 100 entities and trigger real-time notification listener', () => {
      let notified = false;
      const unsubscribe = storage.subscribe(() => {
        notified = true;
      });

      const result = storage.seed100TestData();

      assert.strictEqual(result.customers, 100);
      assert.strictEqual(result.vehicles, 100);
      assert.strictEqual(result.stockItems, 100);
      assert.ok(result.services >= 10, 'Should seed realistic services');
      assert.ok(result.reminders >= 10, 'Should seed realistic reminders');

      assert.strictEqual(notified, true, 'seed100TestData must notify reactive listeners');
      assert.strictEqual(storage.getCustomers().length, 100);
      assert.strictEqual(storage.getVehicles().length, 100);
      assert.strictEqual(storage.getStockItems().length, 100);

      unsubscribe();
    });
  });
});

