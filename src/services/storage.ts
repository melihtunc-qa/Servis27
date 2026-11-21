import type { 
  Customer, 
  Vehicle, 
  ServiceRecord, 
  Reminder, 
  ShopSettings, 
  ServiceItem,
  StockItem,
  MaintenancePackage,
  Technician,
  CashTransaction 
} from '../types/index.ts';
import {
  factoryDefaultCustomers,
  factoryDefaultVehicles,
  factoryDefaultStockItems,
  generate100Customers,
  generate100Vehicles,
  generate100StockItems,
  generateRealisticServiceRecords,
  generateRealisticReminders
} from './mockData100.ts';

const STORAGE_KEYS = {
  CUSTOMERS: 'servis365_customers',
  VEHICLES: 'servis365_vehicles',
  SERVICE_RECORDS: 'servis365_service_records',
  REMINDERS: 'servis365_reminders',
  SETTINGS: 'servis365_settings',
  STOCK_ITEMS: 'servis365_stock_items',
  PACKAGES: 'servis365_packages',
  TECHNICIANS: 'servis365_technicians',
  CASH_TRANSACTIONS: 'servis365_cash_transactions',
};

export const defaultSettings: ShopSettings = {
  shopName: 'GÜVEN OTO BAKIM VE SERVİS',
  ownerName: 'Usta Ali Güven',
  phone: '0532 555 12 34',
  address: 'Oto Sanayi Sitesi 4. Blok No: 28',
  city: 'İstanbul',
  taxOffice: 'Maslak V.D.',
  taxNumber: '1234567890',
  defaultOilPeriodKm: 10000,
  defaultOilPeriodDays: 365,
  footerNote: 'Tüm parça ve işçiliklerimiz 6 ay / 10.000 KM Güven Oto garantisindedir. Bizi tercih ettiğiniz için teşekkür ederiz.',
};

// Initial Technicians
const initialTechnicians: Technician[] = [
  { id: 'tech-1', name: 'Ali Usta', phone: '0532 555 01 01', specialty: 'Motor & Mekanik', isActive: true },
  { id: 'tech-2', name: 'Murat Usta', phone: '0533 555 02 02', specialty: 'Ön Takım & Fren', isActive: true },
  { id: 'tech-3', name: 'Serkan Usta', phone: '0535 555 03 03', specialty: 'Oto Elektrik & Arıza Teşhis', isActive: true },
];

// Initial Spare Parts Inventory (Baseline Factory Default)
const initialStockItems: StockItem[] = factoryDefaultStockItems;

// Pre-defined Maintenance Packages
const initialPackages: MaintenancePackage[] = [
  {
    id: 'pkg-1',
    name: '10.000 KM Standart Periyodik Bakım',
    description: 'Motor yağı değişimi, 4 filtre yenileme ve 30 nokta genel emniyet kontrolü.',
    category: 'Periyodik Bakım',
    items: [
      { itemType: 'PARCA', name: 'Castrol Edge 5W-30 LL Motor Yağı 5L', quantity: 1, unitPrice: 1950, costPrice: 1400 },
      { itemType: 'PARCA', name: 'Orijinal Tipi Yağ Filtresi', quantity: 1, unitPrice: 480, costPrice: 280 },
      { itemType: 'PARCA', name: 'Hava Filtresi', quantity: 1, unitPrice: 550, costPrice: 320 },
      { itemType: 'PARCA', name: 'Karbonlu Polen Filtresi', quantity: 1, unitPrice: 650, costPrice: 380 },
      { itemType: 'ISCILIK', name: 'Periyodik Bakım ve Genel Emniyet Kontrolü İşçiliği', quantity: 1, unitPrice: 1500, costPrice: 0 },
    ],
  },
  {
    id: 'pkg-2',
    name: 'Ön Takım & Fren Sistemi Yenileme',
    description: 'Ön fren balata ve disk değişimi, fren hidrolik sıvısı ve kaliper temizliği.',
    category: 'Fren Sistemi',
    items: [
      { itemType: 'PARCA', name: 'Bosch Ön Fren Balata Takımı', quantity: 1, unitPrice: 1900, costPrice: 1300 },
      { itemType: 'PARCA', name: 'Ön Fren Disk Takımı (Hava Soğutmalı)', quantity: 1, unitPrice: 3400, costPrice: 2400 },
      { itemType: 'PARCA', name: 'DOT-4 Fren Hidrolik Sıvısı 1L', quantity: 1, unitPrice: 450, costPrice: 250 },
      { itemType: 'ISCILIK', name: 'Fren Balata, Disk Montajı ve Hidrolik Havası Alma', quantity: 1, unitPrice: 1400, costPrice: 0 },
    ],
  },
  {
    id: 'pkg-3',
    name: 'Ağır Bakım (Triger Seti & Devridaim)',
    description: 'Triger kayışı, gergi rulmanları, devridaim su pompası ve kırmızı organik antifriz değişimi.',
    category: 'Motor Mekanik',
    items: [
      { itemType: 'PARCA', name: 'Gates / Dayco Triger Kayış & Gergi Seti', quantity: 1, unitPrice: 4800, costPrice: 3500 },
      { itemType: 'PARCA', name: 'Devridaim Su Pompası', quantity: 1, unitPrice: 2600, costPrice: 1800 },
      { itemType: 'PARCA', name: 'Organik Kırmızı Antifriz 3L', quantity: 1, unitPrice: 550, costPrice: 320 },
      { itemType: 'ISCILIK', name: 'Triger ve Devridaim Değişim İşçiliği', quantity: 1, unitPrice: 3500, costPrice: 0 },
    ],
  },
];

// Initial Customers (Baseline Factory Default)
const initialCustomers: Customer[] = factoryDefaultCustomers;

// Initial Vehicles (Baseline Factory Default)
const initialVehicles: Vehicle[] = factoryDefaultVehicles;

// Initial Service Records
const initialRecords: ServiceRecord[] = [
  {
    id: 'srv-1',
    vehicleId: 'veh-1',
    customerId: 'cust-1',
    technicianId: 'tech-1',
    entryDate: '2026-02-10T09:00:00Z',
    exitDate: '2026-02-10T16:00:00Z',
    entryKm: 145000,
    complaint: '145.000 km periyodik yağ ve filtre bakımı, ön takım kontrolü.',
    diagnosis: 'Yağ ve tüm filtreler değiştirildi. Ön sağ salıncak burcunda hafif boşluk var.',
    intakeChecklist: {
      fuelLevel: '1/2',
      hasSpareTire: true,
      hasJackAndTools: true,
      existingDamages: 'Ön tampon sağ altta hafif sürtme izi mevcut.',
    },
    status: 'TESLIM_EDILDI',
    partsTotal: 4800,
    laborTotal: 1500,
    discount: 300,
    grandTotal: 6000,
    paidAmount: 4500,
    paymentStatus: 'KISMI_ODENDI',
    paymentMethod: 'KREDI_KARTI',
    technicianNotes: 'Kalan 1500 TL sonraki ay başında ödenecek.',
    createdAt: '2026-02-10T09:15:00Z',
    items: [
      {
        id: 'itm-1',
        serviceRecordId: 'srv-1',
        itemType: 'PARCA',
        name: 'Castrol Edge 5W-30 LL Motor Yağı 5L',
        quantity: 1,
        unitPrice: 1850,
        costPrice: 1350,
        totalPrice: 1850,
        warrantyMonths: 12,
      },
      {
        id: 'itm-2',
        serviceRecordId: 'srv-1',
        itemType: 'PARCA',
        name: 'Mann Filtre Seti (Yağ, Hava, Polen, Yakıt)',
        quantity: 1,
        unitPrice: 2950,
        costPrice: 2100,
        totalPrice: 2950,
        warrantyMonths: 12,
      },
      {
        id: 'itm-3',
        serviceRecordId: 'srv-1',
        itemType: 'ISCILIK',
        name: 'Periyodik Bakım ve Genel Kontrol İşçiliği',
        quantity: 1,
        unitPrice: 1500,
        costPrice: 0,
        totalPrice: 1500,
        warrantyMonths: 6,
      },
    ],
  },
  {
    id: 'srv-2',
    vehicleId: 'veh-2',
    customerId: 'cust-2',
    technicianId: 'tech-2',
    entryDate: '2026-11-08T08:30:00Z',
    entryKm: 89000,
    complaint: 'Frenlerden ötme sesi geliyor, vites geçişlerinde titreme.',
    diagnosis: 'Ön ve arka fren balataları bitmiş, diskler taşlandı.',
    intakeChecklist: {
      fuelLevel: '3/4',
      hasSpareTire: true,
      hasJackAndTools: true,
      existingDamages: 'Sağ arka çamurlukta göçük düzeltme izi var.',
    },
    status: 'ISLEMDE',
    partsTotal: 3400,
    laborTotal: 1200,
    discount: 0,
    grandTotal: 4600,
    paidAmount: 0,
    paymentStatus: 'BEKLIYOR',
    technicianNotes: 'Diskler torna tezgahında düzeltildi, montaj devam ediyor.',
    createdAt: '2026-11-08T08:45:00Z',
    items: [
      {
        id: 'itm-4',
        serviceRecordId: 'srv-2',
        itemType: 'PARCA',
        name: 'Bosch Ön Fren Balata Takımı',
        quantity: 1,
        unitPrice: 1900,
        costPrice: 1400,
        totalPrice: 1900,
        warrantyMonths: 6,
      },
      {
        id: 'itm-5',
        serviceRecordId: 'srv-2',
        itemType: 'PARCA',
        name: 'Bosch Arka Fren Balata Takımı',
        quantity: 1,
        unitPrice: 1500,
        costPrice: 1050,
        totalPrice: 1500,
        warrantyMonths: 6,
      },
      {
        id: 'itm-6',
        serviceRecordId: 'srv-2',
        itemType: 'ISCILIK',
        name: 'Ön-Arka Fren Balata Değişimi & Disk Taşlama İşçiliği',
        quantity: 1,
        unitPrice: 1200,
        costPrice: 0,
        totalPrice: 1200,
        warrantyMonths: 6,
      },
    ],
  },
];

// Initial Reminders
const initialReminders: Reminder[] = [
  {
    id: 'rem-1',
    vehicleId: 'veh-1',
    customerId: 'cust-1',
    type: 'YAG_BAKIMI',
    title: 'Periyodik Bakım (155.000 KM / 1 Yıl)',
    targetDate: '2026-11-15',
    targetKm: 155000,
    lastServiceKm: 145000,
    status: 'YAKLASAN',
    notes: 'Tahmini bakım zamanı geldi, WhatsApp ile hatırlatma yapılabilir.',
    createdAt: '2026-02-10T16:00:00Z',
  },
  {
    id: 'rem-2',
    vehicleId: 'veh-3',
    customerId: 'cust-3',
    type: 'MUAYENE',
    title: 'TÜVTÜRK Araç Muayenesi',
    targetDate: '2026-11-20',
    status: 'YAKLASAN',
    notes: 'Muayene öncesi far ayarı ve fren testi yapılmalı.',
    createdAt: '2026-02-20T14:20:00Z',
  },
];

// Initial Cash Transactions
const initialCashTransactions: CashTransaction[] = [
  {
    id: 'csh-1',
    date: '2026-02-10T16:05:00Z',
    type: 'GELIR',
    category: 'SERVIS_TAHSILAT',
    amount: 4500,
    paymentMethod: 'KREDI_KARTI',
    description: '34VR4821 - Periyodik Bakım Tahsilatı (Ahmet Yılmaz)',
    relatedServiceId: 'srv-1',
    relatedCustomerId: 'cust-1',
  },
  {
    id: 'csh-2',
    date: '2026-11-05T10:00:00Z',
    type: 'GIDER',
    category: 'PARCA_ALIMI',
    amount: 8500,
    paymentMethod: 'HAVALE',
    description: 'Öztürk Oto Parça - 10 Teneke Castrol Yağ ve Filtre Alımı',
  },
  {
    id: 'csh-3',
    date: '2026-11-01T09:00:00Z',
    type: 'GIDER',
    category: 'KIRA_VE_AIDAT',
    amount: 15000,
    paymentMethod: 'HAVALE',
    description: 'Kasım Ayı Atölye Kirası',
  },
];

type StorageListener = () => void;

class StorageService {
  private listeners: Set<StorageListener> = new Set();

  subscribe(listener: StorageListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  notifyListeners(): void {
    this.listeners.forEach(fn => {
      try {
        fn();
      } catch (err) {
        console.error('Storage listener error:', err);
      }
    });
  }

  private initStorage() {
    // Migration: Copy legacy servis360 data if exists and servis365 not yet set
    const legacyKeys: [string, string][] = [
      ['servis360_customers', STORAGE_KEYS.CUSTOMERS],
      ['servis360_vehicles', STORAGE_KEYS.VEHICLES],
      ['servis360_service_records', STORAGE_KEYS.SERVICE_RECORDS],
      ['servis360_reminders', STORAGE_KEYS.REMINDERS],
      ['servis360_settings', STORAGE_KEYS.SETTINGS],
      ['servis360_stock_items', STORAGE_KEYS.STOCK_ITEMS],
      ['servis360_packages', STORAGE_KEYS.PACKAGES],
      ['servis360_technicians', STORAGE_KEYS.TECHNICIANS],
      ['servis360_cash_transactions', STORAGE_KEYS.CASH_TRANSACTIONS],
    ];
    for (const [oldKey, newKey] of legacyKeys) {
      const oldVal = localStorage.getItem(oldKey);
      if (oldVal && !localStorage.getItem(newKey)) {
        localStorage.setItem(newKey, oldVal);
      }
    }

    if (localStorage.getItem(STORAGE_KEYS.CUSTOMERS) === null) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(initialCustomers));
    }
    if (localStorage.getItem(STORAGE_KEYS.VEHICLES) === null) {
      localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(initialVehicles));
    }
    if (localStorage.getItem(STORAGE_KEYS.SERVICE_RECORDS) === null) {
      localStorage.setItem(STORAGE_KEYS.SERVICE_RECORDS, JSON.stringify(initialRecords));
    }
    if (localStorage.getItem(STORAGE_KEYS.REMINDERS) === null) {
      localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(initialReminders));
    }
    if (localStorage.getItem(STORAGE_KEYS.SETTINGS) === null) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
    }
    if (localStorage.getItem(STORAGE_KEYS.STOCK_ITEMS) === null) {
      localStorage.setItem(STORAGE_KEYS.STOCK_ITEMS, JSON.stringify(initialStockItems));
    }
    if (localStorage.getItem(STORAGE_KEYS.PACKAGES) === null) {
      localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(initialPackages));
    }
    if (localStorage.getItem(STORAGE_KEYS.TECHNICIANS) === null) {
      localStorage.setItem(STORAGE_KEYS.TECHNICIANS, JSON.stringify(initialTechnicians));
    }
    if (localStorage.getItem(STORAGE_KEYS.CASH_TRANSACTIONS) === null) {
      localStorage.setItem(STORAGE_KEYS.CASH_TRANSACTIONS, JSON.stringify(initialCashTransactions));
    }
  }

  /**
   * Resets all tables to the original baseline factory demo data
   * (3 customers, 4 vehicles, 6 stock items, 2 records, 2 reminders, etc.)
   */
  resetToFactoryDefaults(): void {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(initialCustomers));
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(initialVehicles));
    localStorage.setItem(STORAGE_KEYS.SERVICE_RECORDS, JSON.stringify(initialRecords));
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(initialReminders));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
    localStorage.setItem(STORAGE_KEYS.STOCK_ITEMS, JSON.stringify(initialStockItems));
    localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(initialPackages));
    localStorage.setItem(STORAGE_KEYS.TECHNICIANS, JSON.stringify(initialTechnicians));
    localStorage.setItem(STORAGE_KEYS.CASH_TRANSACTIONS, JSON.stringify(initialCashTransactions));
    this.notifyListeners();
  }

  /**
   * Clears all business data to completely empty state (0 records)
   */
  clearAllData(): void {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SERVICE_RECORDS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.STOCK_ITEMS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CASH_TRANSACTIONS, JSON.stringify([]));
    this.notifyListeners();
  }

  constructor() {
    this.initStorage();
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('storage', () => {
        this.notifyListeners();
      });
    }
  }

  // --- Customers ---
  getCustomers(): Customer[] {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return data ? JSON.parse(data) : [];
  }

  getCustomer(id: string): Customer | undefined {
    return this.getCustomers().find(c => c.id === id);
  }

  saveCustomer(customer: Customer): Customer {
    const list = this.getCustomers();
    const index = list.findIndex(c => c.id === customer.id);
    if (index >= 0) {
      list[index] = customer;
    } else {
      list.unshift(customer);
    }
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(list));
    this.notifyListeners();
    return customer;
  }

  deleteCustomer(id: string): boolean {
    const list = this.getCustomers().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(list));
    this.notifyListeners();
    return true;
  }

  // --- Vehicles ---
  getVehicles(): Vehicle[] {
    const data = localStorage.getItem(STORAGE_KEYS.VEHICLES);
    return data ? JSON.parse(data) : [];
  }

  getVehicle(id: string): Vehicle | undefined {
    return this.getVehicles().find(v => v.id === id);
  }

  getVehicleByPlate(plate: string): Vehicle | undefined {
    const clean = (plate || '').replace(/\s+/g, '').toUpperCase();
    if (!clean) return undefined;
    const exact = this.getVehicles().find(v => v.plate.replace(/\s+/g, '').toUpperCase() === clean);
    if (exact) return exact;
    // Fallback: If no exact match, but contains match has exactly 1 result
    const partials = this.searchVehiclesByPlate(clean);
    return partials.length === 1 ? partials[0] : undefined;
  }

  searchVehiclesByPlate(plateQuery: string): Vehicle[] {
    const clean = (plateQuery || '').replace(/\s+/g, '').toUpperCase();
    if (!clean) return this.getVehicles();
    return this.getVehicles().filter(v => 
      v.plate.replace(/\s+/g, '').toUpperCase().includes(clean)
    );
  }

  getVehiclesByCustomer(customerId: string): Vehicle[] {
    return this.getVehicles().filter(v => v.customerId === customerId);
  }

  saveVehicle(vehicle: Vehicle): Vehicle {
    const list = this.getVehicles();
    vehicle.plate = vehicle.plate.replace(/\s+/g, '').toUpperCase();
    const index = list.findIndex(v => v.id === vehicle.id);
    if (index >= 0) {
      list[index] = vehicle;
    } else {
      list.unshift(vehicle);
    }
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(list));
    this.notifyListeners();
    return vehicle;
  }

  deleteVehicle(id: string): boolean {
    const list = this.getVehicles().filter(v => v.id !== id);
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(list));
    this.notifyListeners();
    return true;
  }

  // --- Technicians ---
  getTechnicians(): Technician[] {
    const data = localStorage.getItem(STORAGE_KEYS.TECHNICIANS);
    return data ? JSON.parse(data) : [];
  }

  saveTechnician(tech: Technician): Technician {
    const list = this.getTechnicians();
    const index = list.findIndex(t => t.id === tech.id);
    if (index >= 0) list[index] = tech;
    else list.push(tech);
    localStorage.setItem(STORAGE_KEYS.TECHNICIANS, JSON.stringify(list));
    this.notifyListeners();
    return tech;
  }

  // --- Maintenance Packages ---
  getPackages(): MaintenancePackage[] {
    const data = localStorage.getItem(STORAGE_KEYS.PACKAGES);
    return data ? JSON.parse(data) : [];
  }

  savePackage(pkg: MaintenancePackage): MaintenancePackage {
    const list = this.getPackages();
    const index = list.findIndex(p => p.id === pkg.id);
    if (index >= 0) list[index] = pkg;
    else list.push(pkg);
    localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(list));
    this.notifyListeners();
    return pkg;
  }

  // --- Spare Parts Stock ---
  getStockItems(): StockItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.STOCK_ITEMS);
    return data ? JSON.parse(data) : [];
  }

  getStockItem(id: string): StockItem | undefined {
    return this.getStockItems().find(s => s.id === id);
  }

  saveStockItem(item: StockItem): StockItem {
    const list = this.getStockItems();
    item.updatedAt = new Date().toISOString();
    const index = list.findIndex(s => s.id === item.id);
    if (index >= 0) list[index] = item;
    else list.unshift(item);
    localStorage.setItem(STORAGE_KEYS.STOCK_ITEMS, JSON.stringify(list));
    this.notifyListeners();
    return item;
  }

  deleteStockItem(id: string): boolean {
    const list = this.getStockItems().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.STOCK_ITEMS, JSON.stringify(list));
    this.notifyListeners();
    return true;
  }

  getLowStockItems(): StockItem[] {
    return this.getStockItems().filter(s => s.quantity <= s.minQuantity);
  }

  deductStock(stockId: string, quantityToDeduct: number) {
    const list = this.getStockItems();
    const item = list.find(s => s.id === stockId);
    if (item) {
      item.quantity = Math.max(0, item.quantity - quantityToDeduct);
      item.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.STOCK_ITEMS, JSON.stringify(list));
      this.notifyListeners();
    }
  }

  restoreStock(stockId: string, quantityToRestore: number) {
    if (quantityToRestore <= 0) return;
    const list = this.getStockItems();
    const item = list.find(s => s.id === stockId);
    if (item) {
      item.quantity += quantityToRestore;
      item.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.STOCK_ITEMS, JSON.stringify(list));
      this.notifyListeners();
    }
  }

  // --- Cash & Register Transactions ---
  getCashTransactions(): CashTransaction[] {
    const data = localStorage.getItem(STORAGE_KEYS.CASH_TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  }

  saveCashTransaction(tx: CashTransaction): CashTransaction {
    const list = this.getCashTransactions();
    const index = list.findIndex(t => t.id === tx.id);
    if (index >= 0) list[index] = tx;
    else list.unshift(tx);
    localStorage.setItem(STORAGE_KEYS.CASH_TRANSACTIONS, JSON.stringify(list));
    this.notifyListeners();
    return tx;
  }

  deleteCashTransaction(id: string): boolean {
    const list = this.getCashTransactions();
    const tx = list.find(t => t.id === id);
    if (!tx) return false;

    // If it was a customer debt collection without direct service creation, restore the customer balance
    if (tx.relatedCustomerId && tx.type === 'GELIR' && !tx.relatedServiceId) {
      const customer = this.getCustomer(tx.relatedCustomerId);
      if (customer) {
        customer.balance = Math.round((customer.balance + tx.amount) * 100) / 100;
        this.saveCustomer(customer);
      }
    }

    const filtered = list.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.CASH_TRANSACTIONS, JSON.stringify(filtered));
    this.notifyListeners();
    return true;
  }

  /**
   * Borçlu müşteriden kasa girişi ile cari borç tahsilatı yapar.
   * - Müşterinin açık/ödenmemiş servis kayıtlarını sırayla kapatır
   * - Müşteri cari borç bakiyesini (customer.balance) düşer
   * - Kasa defterine GELIR kaydı işler
   */
  collectCustomerDebt(params: {
    customerId: string;
    amount: number;
    paymentMethod: 'NAKIT' | 'KREDI_KARTI' | 'HAVALE';
    description?: string;
  }): { transaction: CashTransaction; newBalance: number } {
    const customer = this.getCustomer(params.customerId);
    if (!customer) throw new Error('Müşteri bulunamadı.');

    const amount = Math.max(0, Number(params.amount) || 0);
    if (amount <= 0) throw new Error('Geçersiz tahsilat tutarı.');

    // 1. Müşterinin ödenmemiş servis kayıtlarını en eskiden en yeniye sırayla kapat
    const allRecords = this.getServiceRecords();
    const customerRecords = allRecords
      .filter(r => r.customerId === params.customerId && (r.grandTotal - (r.paidAmount || 0)) > 0)
      .sort((a, b) => new Date(a.entryDate || a.createdAt).getTime() - new Date(b.entryDate || b.createdAt).getTime());

    let remainingToCover = amount;
    for (const rec of customerRecords) {
      if (remainingToCover <= 0) break;
      const unpaid = Math.max(0, rec.grandTotal - (rec.paidAmount || 0));
      const payThis = Math.min(unpaid, remainingToCover);
      rec.paidAmount = (rec.paidAmount || 0) + payThis;
      remainingToCover -= payThis;
      if (rec.paidAmount >= rec.grandTotal) {
        rec.paymentStatus = 'ODENDI';
      } else {
        rec.paymentStatus = 'KISMI_ODENDI';
      }
    }
    localStorage.setItem(STORAGE_KEYS.SERVICE_RECORDS, JSON.stringify(allRecords));

    // 2. Müşteri borç bakiyesinden girilen tutarı düş
    const updatedBalance = Math.max(0, Math.round((customer.balance - amount) * 100) / 100);
    customer.balance = updatedBalance;
    this.saveCustomer(customer);

    // 3. Kasa defterine gelir hareketi işle
    const tx: CashTransaction = {
      id: `csh-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      date: new Date().toISOString(),
      type: 'GELIR',
      category: 'SERVIS_TAHSILAT',
      amount: amount,
      paymentMethod: params.paymentMethod,
      description: params.description || `${customer.fullName} - Cari Borç Tahsilatı`,
      relatedCustomerId: customer.id,
    };
    this.saveCashTransaction(tx);

    this.notifyListeners();
    return { transaction: tx, newBalance: customer.balance };
  }

  // --- Service Records ---
  getServiceRecords(): ServiceRecord[] {
    const data = localStorage.getItem(STORAGE_KEYS.SERVICE_RECORDS);
    return data ? JSON.parse(data) : [];
  }

  getServiceRecord(id: string): ServiceRecord | undefined {
    return this.getServiceRecords().find(r => r.id === id);
  }

  getRecordsByVehicle(vehicleId: string): ServiceRecord[] {
    return this.getServiceRecords()
      .filter(r => r.vehicleId === vehicleId)
      .sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());
  }

  saveServiceRecord(record: ServiceRecord): ServiceRecord {
    const list = this.getServiceRecords();
    const index = list.findIndex(r => r.id === record.id);
    const isNew = index === -1;
    const oldRecord: ServiceRecord | null = index >= 0 
      ? { ...list[index], items: list[index].items ? list[index].items.map(it => ({ ...it })) : [] } 
      : null;
    
    if (index >= 0) {
      list[index] = record;
    } else {
      list.unshift(record);
    }
    localStorage.setItem(STORAGE_KEYS.SERVICE_RECORDS, JSON.stringify(list));

    // Update vehicle's current KM
    const vehicle = this.getVehicle(record.vehicleId);
    if (vehicle && record.entryKm > vehicle.currentKm) {
      vehicle.currentKm = record.entryKm;
      this.saveVehicle(vehicle);
    }

    // Auto calculate customer balance for current customer
    const customer = this.getCustomer(record.customerId);
    if (customer) {
      const customerRecords = list.filter(r => r.customerId === customer.id);
      const totalDebt = customerRecords.reduce((sum, r) => {
        return sum + Math.max(0, r.grandTotal - (r.paidAmount || 0));
      }, 0);
      customer.balance = Math.max(0, Math.round(totalDebt * 100) / 100);
      this.saveCustomer(customer);
    }

    // If customer was changed on update, recalculate previous customer's balance too
    if (oldRecord && oldRecord.customerId !== record.customerId) {
      const prevCustomer = this.getCustomer(oldRecord.customerId);
      if (prevCustomer) {
        const prevRecords = list.filter(r => r.customerId === prevCustomer.id);
        const prevDebt = prevRecords.reduce((sum, r) => {
          return sum + Math.max(0, r.grandTotal - (r.paidAmount || 0));
        }, 0);
        prevCustomer.balance = Math.max(0, Math.round(prevDebt * 100) / 100);
        this.saveCustomer(prevCustomer);
      }
    }

    // Stock inventory reconciliation (Delta updates)
    if (isNew) {
      if (record.items) {
        record.items.forEach(it => {
          if (it.stockItemId) {
            this.deductStock(it.stockItemId, Number(it.quantity) || 1);
          }
        });
      }
    } else if (oldRecord) {
      // Compare old and new stock item usage
      const oldUsage = new Map<string, number>();
      oldRecord.items?.forEach(it => {
        if (it.stockItemId) {
          oldUsage.set(it.stockItemId, (oldUsage.get(it.stockItemId) || 0) + (Number(it.quantity) || 0));
        }
      });

      const newUsage = new Map<string, number>();
      record.items?.forEach(it => {
        if (it.stockItemId) {
          newUsage.set(it.stockItemId, (newUsage.get(it.stockItemId) || 0) + (Number(it.quantity) || 0));
        }
      });

      const allStockIds = new Set([...oldUsage.keys(), ...newUsage.keys()]);
      allStockIds.forEach(stockId => {
        const oldQty = oldUsage.get(stockId) || 0;
        const newQty = newUsage.get(stockId) || 0;
        const delta = newQty - oldQty;
        if (delta > 0) {
          // More parts consumed: deduct delta from stock
          this.deductStock(stockId, delta);
        } else if (delta < 0) {
          // Parts returned or reduced: restore to stock
          this.restoreStock(stockId, Math.abs(delta));
        }
      });
    }

    // Cash transactions synchronization
    const currentPaid = Math.max(0, Number(record.paidAmount) || 0);
    const plate = vehicle?.plate || '';
    const custName = customer?.fullName || '';
    const cashList = this.getCashTransactions();
    const existingTx = cashList.find(t => t.relatedServiceId === record.id);

    if (isNew) {
      if (currentPaid > 0) {
        this.saveCashTransaction({
          id: `csh-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          date: new Date().toISOString(),
          type: 'GELIR',
          category: 'SERVIS_TAHSILAT',
          amount: currentPaid,
          paymentMethod: record.paymentMethod === 'KREDI_KARTI' ? 'KREDI_KARTI' : record.paymentMethod === 'HAVALE' ? 'HAVALE' : 'NAKIT',
          description: `${plate} Servis Tahsilatı - ${custName}`,
          relatedServiceId: record.id,
          relatedCustomerId: record.customerId,
        });
      }
    } else {
      if (existingTx) {
        if (currentPaid > 0) {
          existingTx.amount = currentPaid;
          existingTx.paymentMethod = record.paymentMethod === 'KREDI_KARTI' ? 'KREDI_KARTI' : record.paymentMethod === 'HAVALE' ? 'HAVALE' : 'NAKIT';
          existingTx.description = `${plate} Servis Tahsilatı - ${custName}`;
          existingTx.relatedCustomerId = record.customerId;
          this.saveCashTransaction(existingTx);
        } else {
          // Payment reduced to 0: remove the cash inflow
          this.deleteCashTransaction(existingTx.id);
        }
      } else if (currentPaid > 0) {
        // Previously paidAmount was 0, now new payment received
        this.saveCashTransaction({
          id: `csh-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          date: new Date().toISOString(),
          type: 'GELIR',
          category: 'SERVIS_TAHSILAT',
          amount: currentPaid,
          paymentMethod: record.paymentMethod === 'KREDI_KARTI' ? 'KREDI_KARTI' : record.paymentMethod === 'HAVALE' ? 'HAVALE' : 'NAKIT',
          description: `${plate} Servis Tahsilatı - ${custName}`,
          relatedServiceId: record.id,
          relatedCustomerId: record.customerId,
        });
      }
    }

    // Generate automatic maintenance reminder only if it is a brand new service record
    if (isNew) {
      this.createAutomaticReminderForRecord(record);
    }

    this.notifyListeners();
    return record;
  }

  deleteServiceRecord(id: string): boolean {
    const list = this.getServiceRecords();
    const record = list.find(r => r.id === id);
    if (!record) return false;

    // 1. Restore any stock items that were consumed by this record
    if (record.items) {
      record.items.forEach(it => {
        if (it.stockItemId && it.quantity > 0) {
          this.restoreStock(it.stockItemId, it.quantity);
        }
      });
    }

    // 2. Delete any related cash transactions
    const cashList = this.getCashTransactions();
    const relatedTx = cashList.find(t => t.relatedServiceId === id);
    if (relatedTx) {
      this.deleteCashTransaction(relatedTx.id);
    }

    // 3. Remove record from list
    const updatedList = list.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.SERVICE_RECORDS, JSON.stringify(updatedList));

    // 4. Recalculate customer balance
    const customer = this.getCustomer(record.customerId);
    if (customer) {
      const remainingRecords = updatedList.filter(r => r.customerId === customer.id);
      const totalDebt = remainingRecords.reduce((sum, r) => {
        return sum + Math.max(0, r.grandTotal - (r.paidAmount || 0));
      }, 0);
      customer.balance = Math.max(0, Math.round(totalDebt * 100) / 100);
      this.saveCustomer(customer);
    }

    this.notifyListeners();
    return true;
  }

  private createAutomaticReminderForRecord(record: ServiceRecord) {
    const settings = this.getSettings();
    const targetKm = record.entryKm + (settings.defaultOilPeriodKm || 10000);
    
    const entryDate = new Date(record.entryDate);
    const targetDate = new Date(entryDate.getTime() + (settings.defaultOilPeriodDays || 365) * 24 * 60 * 60 * 1000);
    const targetDateStr = targetDate.toISOString().split('T')[0];

    const reminder: Reminder = {
      id: `rem-auto-${Date.now()}`,
      vehicleId: record.vehicleId,
      customerId: record.customerId,
      type: 'YAG_BAKIMI',
      title: `Periyodik Bakım (${targetKm.toLocaleString('tr-TR')} KM / 1 Yıl)`,
      targetDate: targetDateStr,
      targetKm: targetKm,
      lastServiceKm: record.entryKm,
      status: 'YAKLASAN',
      notes: `Son bakım ${record.entryKm.toLocaleString('tr-TR')} km'de yapıldı.`,
      createdAt: new Date().toISOString(),
    };

    this.saveReminder(reminder);
  }

  // --- Reminders ---
  getReminders(): Reminder[] {
    const data = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    return data ? JSON.parse(data) : [];
  }

  saveReminder(reminder: Reminder): Reminder {
    const list = this.getReminders();
    const index = list.findIndex(r => r.id === reminder.id);
    if (index >= 0) {
      list[index] = reminder;
    } else {
      list.unshift(reminder);
    }
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(list));
    this.notifyListeners();
    return reminder;
  }

  deleteReminder(id: string): boolean {
    const list = this.getReminders().filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(list));
    this.notifyListeners();
    return true;
  }

  // --- Settings ---
  getSettings(): ShopSettings {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : defaultSettings;
  }

  saveSettings(settings: ShopSettings): ShopSettings {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    this.notifyListeners();
    return settings;
  }

  // --- WhatsApp URL Helper ---
  generateWhatsAppLink(phone: string, message: string): string {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.startsWith('90')
      ? cleanPhone
      : cleanPhone.startsWith('0')
      ? '90' + cleanPhone.substring(1)
      : '90' + cleanPhone;
    
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  }

  // --- Backup & Restore ---
  exportBackup(): string {
    const backupData = {
      version: '2.0',
      exportDate: new Date().toISOString(),
      customers: this.getCustomers(),
      vehicles: this.getVehicles(),
      serviceRecords: this.getServiceRecords(),
      reminders: this.getReminders(),
      stockItems: this.getStockItems(),
      packages: this.getPackages(),
      technicians: this.getTechnicians(),
      cashTransactions: this.getCashTransactions(),
      settings: this.getSettings(),
    };
    return JSON.stringify(backupData, null, 2);
  }

  importBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.customers && data.vehicles) {
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(data.customers));
        localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(data.vehicles));
        localStorage.setItem(STORAGE_KEYS.SERVICE_RECORDS, JSON.stringify(data.serviceRecords || []));
        localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(data.reminders || []));
        if (data.stockItems) localStorage.setItem(STORAGE_KEYS.STOCK_ITEMS, JSON.stringify(data.stockItems));
        if (data.packages) localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(data.packages));
        if (data.technicians) localStorage.setItem(STORAGE_KEYS.TECHNICIANS, JSON.stringify(data.technicians));
        if (data.cashTransactions) localStorage.setItem(STORAGE_KEYS.CASH_TRANSACTIONS, JSON.stringify(data.cashTransactions));
        if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
        this.notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import error', e);
      return false;
    }
  }

  seed100TestData(): {
    customers: number;
    vehicles: number;
    stockItems: number;
    services: number;
    serviceRecords: number;
    reminders: number;
  } {
    const customers = generate100Customers();
    const vehicles = generate100Vehicles(customers);
    const stockItems = generate100StockItems();
    const serviceRecords = generateRealisticServiceRecords(customers, vehicles, stockItems);
    const reminders = generateRealisticReminders(customers, vehicles);

    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
    localStorage.setItem(STORAGE_KEYS.STOCK_ITEMS, JSON.stringify(stockItems));
    localStorage.setItem(STORAGE_KEYS.SERVICE_RECORDS, JSON.stringify(serviceRecords));
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));

    this.notifyListeners();

    return {
      customers: customers.length,
      vehicles: vehicles.length,
      stockItems: stockItems.length,
      services: serviceRecords.length,
      serviceRecords: serviceRecords.length,
      reminders: reminders.length,
    };
  }

  // --- Dashboard Aggregates ---
  getDashboardStats() {
    const customers = this.getCustomers();
    const vehicles = this.getVehicles();
    const records = this.getServiceRecords();
    const reminders = this.getReminders();
    const lowStock = this.getLowStockItems();
    const cash = this.getCashTransactions();

    const inProgressServices = records.filter(r => r.status === 'ISLEMDE');
    const acceptedServices = records.filter(r => r.status === 'KABUL_EDILDI');
    const waitingPartsServices = records.filter(r => r.status === 'PARCA_BEKLENIYOR');
    const totalReceivables = customers.reduce((sum, c) => sum + (c.balance > 0 ? c.balance : 0), 0);
    const totalRevenue = records.reduce((sum, r) => sum + (r.paidAmount || 0), 0);

    const totalIncome = cash.filter(c => c.type === 'GELIR').reduce((s, c) => s + c.amount, 0);
    const totalExpense = cash.filter(c => c.type === 'GIDER').reduce((s, c) => s + c.amount, 0);
    const netCashBalance = totalIncome - totalExpense;

    return {
      customerCount: customers.length,
      vehicleCount: vehicles.length,
      activeServiceCount: inProgressServices.length,
      acceptedServiceCount: acceptedServices.length,
      waitingPartsCount: waitingPartsServices.length,
      totalReceivables,
      totalRevenue,
      remindersCount: reminders.length,
      lowStockCount: lowStock.length,
      totalIncome,
      totalExpense,
      netCashBalance,
      recentRecords: records.slice(0, 5),
    };
  }
}

export const storage = new StorageService();
