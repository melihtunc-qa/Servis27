import type { Customer, Vehicle, StockItem, ServiceRecord, Reminder } from '../types/index.ts';

// 100 Distinct Customers
export const generate100Customers = (): Customer[] => {
  const initialBaseCustomers: Customer[] = [
    {
      id: 'cust-1',
      fullName: 'Ahmet Yılmaz',
      phone: '0532 111 22 33',
      email: 'ahmet.yilmaz@email.com',
      address: 'Kadıköy, İstanbul',
      balance: 1500,
      notes: 'Devamlı müşteri, filo araçları da var.',
      createdAt: '2026-01-15T10:00:00Z',
    },
    {
      id: 'cust-2',
      fullName: 'Burak Demir',
      phone: '0544 222 33 44',
      email: 'burak.demir@email.com',
      address: 'Ümraniye, İstanbul',
      balance: 0,
      notes: 'Hassas müşteri, orijinal parça tercih ediyor.',
      createdAt: '2026-02-01T11:30:00Z',
    },
    {
      id: 'cust-3',
      fullName: 'Fatma Şahin',
      phone: '0555 333 44 55',
      email: 'fatma.sahin@email.com',
      address: 'Beşiktaş, İstanbul',
      balance: 0,
      notes: 'Periyodik bakım hatırlatması WhatsApp ile iletilsin.',
      createdAt: '2026-02-20T14:15:00Z',
    },
  ];

  const firstNames = [
    'Mustafa', 'Ali', 'Emre', 'Can', 'Serkan', 'Murat', 'Kemal', 'Hakan', 'Tolga', 'Ozan',
    'Barış', 'Sinan', 'Erdem', 'Uğur', 'Selim', 'Cihan', 'Volkan', 'Ayşe', 'Zeynep', 'Merve',
    'Elif', 'Gamze', 'Büşra', 'Derya', 'Özlem', 'Sema', 'Ebru', 'Deniz', 'Esra', 'Pınar',
    'Sevgi', 'Gizem', 'Melike', 'Tuğba', 'Nuray', 'İrem', 'Kaan', 'Onur', 'Gökhan', 'Eren',
    'Yasin', 'Fatih', 'Alper', 'Kadir', 'Batuhan', 'Tarık', 'Kerem', 'Tuncay', 'Cem', 'Sedat'
  ];

  const lastNames = [
    'Kaya', 'Çelik', 'Yıldız', 'Aydın', 'Özdemir', 'Arslan', 'Koç', 'Kurt', 'Öztürk', 'Polat',
    'Erdoğan', 'Yavuz', 'Aktaş', 'Güler', 'Doğan', 'Çetin', 'Karaca', 'Güven', 'Şen', 'Avcı',
    'Aslan', 'Korkmaz', 'Keskin', 'Tekin', 'Tunç', 'Aksoy', 'Bulut', 'Yiğit', 'Taş', 'Yaman',
    'Vural', 'Coşkun', 'Bozkurt', 'Özer', 'Sönmez', 'Yalçın', 'Güneş', 'Sever', 'Duran', 'Bilir',
    'Candan', 'Esen', 'Alkan', 'Kılıç', 'Soylu', 'Işık', 'Gül', 'Uysal', 'Korkut', 'Sarı'
  ];

  const districts = [
    'Kadıköy, İstanbul', 'Ümraniye, İstanbul', 'Beşiktaş, İstanbul', 'Maslak, İstanbul',
    'Pendik, İstanbul', 'Kartal, İstanbul', 'Başakşehir, İstanbul', 'Beylikdüzü, İstanbul',
    'Çankaya, Ankara', 'Yenimahalle, Ankara', 'Etimesgut, Ankara', 'Keçiören, Ankara',
    'Bornova, İzmir', 'Karşıyaka, İzmir', 'Konak, İzmir', 'Nilüfer, Bursa', 'Osmangazi, Bursa',
    'Muratpaşa, Antalya', 'Konyaaltı, Antalya', 'Gebze, Kocaeli', 'İzmit, Kocaeli'
  ];

  const customers: Customer[] = [...initialBaseCustomers];

  for (let i = 4; i <= 100; i++) {
    const fn = firstNames[(i - 4) % firstNames.length];
    const ln = lastNames[Math.floor((i - 4) / 2) % lastNames.length];
    const fullName = `${fn} ${ln}`;
    const pad = i.toString().padStart(3, '0');
    const phonePrefixes = ['0532', '0533', '0542', '0544', '0555', '0505', '0535', '0541'];
    const prefix = phonePrefixes[i % phonePrefixes.length];
    const phone = `${prefix} ${pad} ${((i * 17) % 90 + 10)} ${((i * 31) % 90 + 10)}`;
    const address = districts[i % districts.length];
    
    let balance = 0;
    if (i % 7 === 0) balance = 2400;
    else if (i % 11 === 0) balance = 5800;
    else if (i % 19 === 0) balance = 1250;

    customers.push({
      id: `cust-${i}`,
      fullName,
      phone,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@email.com`,
      address,
      balance,
      notes: i % 5 === 0 ? 'Düzenli şirket/filo aracı kullanıcısı.' : i % 3 === 0 ? 'Orijinal parça tercih ediyor.' : 'Kayıtlı atölye müşterisi.',
      createdAt: new Date(Date.now() - (100 - i) * 86400000 * 3).toISOString(),
    });
  }

  return customers;
};

// 100 Distinct Vehicles
export const generate100Vehicles = (customers: Customer[]): Vehicle[] => {
  const initialBaseVehicles: Vehicle[] = [
    {
      id: 'veh-1',
      customerId: 'cust-1',
      plate: '34VR4821',
      brand: 'Volkswagen',
      model: 'Passat 1.6 TDI B8',
      year: 2018,
      currentKm: 148500,
      vin: 'WVWZZZ3CZJE123456',
      engineNo: 'DCX12345',
      fuelType: 'Dizel',
      color: 'Füme',
      notes: 'DSG kavrama 110.000 kmde değişti.',
      createdAt: '2026-01-15T10:05:00Z',
    },
    {
      id: 'veh-2',
      customerId: 'cust-2',
      plate: '34ABC789',
      brand: 'Renault',
      model: 'Megane 4 1.5 dCi',
      year: 2020,
      currentKm: 89000,
      vin: 'VF1RFB00123456789',
      fuelType: 'Dizel',
      color: 'Beyaz',
      notes: 'Triger seti kontrol edilecek.',
      createdAt: '2026-02-01T11:35:00Z',
    },
    {
      id: 'veh-3',
      customerId: 'cust-3',
      plate: '06FS5522',
      brand: 'Toyota',
      model: 'Corolla 1.8 Hybrid',
      year: 2021,
      currentKm: 54000,
      vin: 'NMTBZ3BE123456789',
      fuelType: 'Hibrit',
      color: 'Gümüş Gri',
      notes: 'Bakım zamanı yaklaşıyor.',
      createdAt: '2026-02-20T14:20:00Z',
    },
    {
      id: 'veh-4',
      customerId: 'cust-1',
      plate: '34VR8726',
      brand: 'Fiat',
      model: 'Egea 1.3 MultiJet',
      year: 2022,
      currentKm: 76000,
      vin: 'NM435600001234567',
      fuelType: 'Dizel',
      color: 'Kurşun Gri',
      notes: 'Filo aracı, periyodik bakım takibi.',
      createdAt: '2026-03-01T12:00:00Z',
    },
  ];

  const carDatabase = [
    { brand: 'Volkswagen', model: 'Golf 7 1.4 TSI Highline', fuelType: 'Benzin' as const },
    { brand: 'Volkswagen', model: 'Polo 1.0 TSI Comfortline', fuelType: 'Benzin' as const },
    { brand: 'Volkswagen', model: 'Tiguan 1.5 TSI Elegance', fuelType: 'Benzin' as const },
    { brand: 'Volkswagen', model: 'Caddy 2.0 TDI Maxi', fuelType: 'Dizel' as const },
    { brand: 'Renault', model: 'Clio 5 1.0 TCe X-Tronic', fuelType: 'Benzin' as const },
    { brand: 'Renault', model: 'Kadjar 1.3 TCe EDC', fuelType: 'Benzin' as const },
    { brand: 'Renault', model: 'Symbol 1.5 dCi Joy', fuelType: 'Dizel' as const },
    { brand: 'Renault', model: 'Kangoo 1.5 dCi Multix', fuelType: 'Dizel' as const },
    { brand: 'Ford', model: 'Focus 1.5 EcoBlue Titanium', fuelType: 'Dizel' as const },
    { brand: 'Ford', model: 'Fiesta 1.0 EcoBoost', fuelType: 'Benzin' as const },
    { brand: 'Ford', model: 'Courier 1.5 TDCi Trend', fuelType: 'Dizel' as const },
    { brand: 'Ford', model: 'Kuga 1.5 EcoBoost ST-Line', fuelType: 'Benzin' as const },
    { brand: 'Fiat', model: 'Egea Cross 1.6 Multijet Lounge', fuelType: 'Dizel' as const },
    { brand: 'Fiat', model: 'Doblo 1.6 Multijet Premio', fuelType: 'Dizel' as const },
    { brand: 'Fiat', model: 'Fiorino 1.3 Multijet Pop', fuelType: 'Dizel' as const },
    { brand: 'Toyota', model: 'Corolla 1.6 Flame', fuelType: 'Benzin' as const },
    { brand: 'Toyota', model: 'Yaris 1.5 Hybrid', fuelType: 'Hibrit' as const },
    { brand: 'Toyota', model: 'C-HR 1.8 Hybrid Passion', fuelType: 'Hibrit' as const },
    { brand: 'BMW', model: '320i 1.6 M Sport (F30)', fuelType: 'Benzin' as const },
    { brand: 'BMW', model: '520d 2.0 xDrive (G30)', fuelType: 'Dizel' as const },
    { brand: 'BMW', model: '118i 1.5 Joy Plus', fuelType: 'Benzin' as const },
    { brand: 'Mercedes-Benz', model: 'C200d 1.6 AMG (W205)', fuelType: 'Dizel' as const },
    { brand: 'Mercedes-Benz', model: 'E220d 2.0 Exclusive', fuelType: 'Dizel' as const },
    { brand: 'Mercedes-Benz', model: 'A180 1.3 Progressive', fuelType: 'Benzin' as const },
    { brand: 'Hyundai', model: 'i20 1.4 MPI Style', fuelType: 'Benzin' as const },
    { brand: 'Hyundai', model: 'Tucson 1.6 CRDi Elite Plus', fuelType: 'Dizel' as const },
    { brand: 'Honda', model: 'Civic 1.6 i-VTEC Eco Elegance', fuelType: 'LPG' as const },
    { brand: 'Honda', model: 'Civic 1.5 VTEC Turbo RS', fuelType: 'Benzin' as const },
    { brand: 'Peugeot', model: '3008 1.5 BlueHDi Allure', fuelType: 'Dizel' as const },
    { brand: 'Peugeot', model: '2008 1.2 PureTech GT', fuelType: 'Benzin' as const },
    { brand: 'Opel', model: 'Astra K 1.6 CDTI Dynamic', fuelType: 'Dizel' as const },
    { brand: 'Opel', model: 'Corsa F 1.2 Turbo Ultimate', fuelType: 'Benzin' as const },
    { brand: 'Audi', model: 'A3 Sedan 1.6 TDI Design', fuelType: 'Dizel' as const },
    { brand: 'Audi', model: 'A4 2.0 TDI Quattro', fuelType: 'Dizel' as const },
    { brand: 'Skoda', model: 'Octavia 1.6 TDI Style', fuelType: 'Dizel' as const },
    { brand: 'Skoda', model: 'Superb 1.5 TSI Prestige', fuelType: 'Benzin' as const },
    { brand: 'Seat', model: 'Leon 1.6 TDI DSG FR', fuelType: 'Dizel' as const },
    { brand: 'Seat', model: 'Arona 1.0 TSI Xcellence', fuelType: 'Benzin' as const },
    { brand: 'Nissan', model: 'Qashqai 1.5 dCi Tekna', fuelType: 'Dizel' as const },
    { brand: 'Dacia', model: 'Duster 1.5 Blue dCi Prestige', fuelType: 'Dizel' as const },
    { brand: 'Kia', model: 'Sportage 1.6 CRDi Elegance', fuelType: 'Dizel' as const },
    { brand: 'Volvo', model: 'XC60 2.0 B4 AWD Inscription', fuelType: 'Dizel' as const },
    { brand: 'Tesla', model: 'Model Y Long Range AWD', fuelType: 'Elektrik' as const },
    { brand: 'MG', model: 'MG4 Electric Luxury 64kWh', fuelType: 'Elektrik' as const },
    { brand: 'Citroen', model: 'C5 Aircross 1.5 BlueHDi Shine', fuelType: 'Dizel' as const },
    { brand: 'Mazda', model: 'Mazda 3 1.5 SkyActiv-G Power', fuelType: 'Benzin' as const }
  ];

  const cityCodes = ['34', '06', '35', '16', '07', '41', '54', '61', '26', '38', '01', '33', '10', '20', '27', '42'];
  const letterSeries = ['VR', 'ANK', 'EGE', 'BUR', 'ANT', 'KOC', 'SAK', 'TRB', 'MK', 'ER', 'RT', 'TK', 'ZK', 'BC', 'HD', 'SV'];
  const colors = ['Beyaz', 'Siyah', 'Gümüş Gri', 'Füme', 'Gece Mavisi', 'Kırmızı', 'Lacivert', 'Sedefli Beyaz', 'Antrasit', 'Kum Beji'];

  const vehicles: Vehicle[] = [...initialBaseVehicles];

  for (let i = 5; i <= 100; i++) {
    const cust = customers[(i - 1) % customers.length];
    const car = carDatabase[(i - 5) % carDatabase.length];
    
    const city = cityCodes[(i - 5) % cityCodes.length];
    const letters = letterSeries[(i - 5) % letterSeries.length];
    const num = ((i * 37) % 9000 + 1000).toString();
    const plate = `${city}${letters}${num}`;

    const year = 2014 + (i % 11);
    const currentKm = 24000 + ((i * 4731) % 220000);
    const vin = `WBA${car.brand.substring(0, 3).toUpperCase()}${year}${i.toString().padStart(6, '0')}789`;

    vehicles.push({
      id: `veh-${i}`,
      customerId: cust.id,
      plate,
      brand: car.brand,
      model: car.model,
      year,
      currentKm,
      vin,
      engineNo: `ENG-${i.toString().padStart(5, '0')}`,
      fuelType: car.fuelType,
      color: colors[i % colors.length],
      notes: i % 6 === 0 ? 'Kavrama ve triger kontrolü önerildi.' : i % 4 === 0 ? 'Tüm bakımları servisimizde yapılıyor.' : 'Kayıtlı müşteri aracı.',
      createdAt: new Date(Date.now() - (100 - i) * 86400000 * 3).toISOString(),
    });
  }

  return vehicles;
};

// 100 Distinct Spare Parts (Stock Items)
export const generate100StockItems = (): StockItem[] => {
  const initialBaseStockItems: StockItem[] = [
    {
      id: 'stk-1',
      code: 'CAST-5W30-4L',
      name: 'Castrol Edge 5W-30 LL Motor Yağı 4L',
      category: 'Motor Yağı',
      brand: 'Castrol',
      quantity: 14,
      minQuantity: 4,
      unitCost: 1350,
      unitPrice: 1850,
      shelfLocation: 'Raf A-1',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'stk-2',
      code: 'MOTUL-5W30-5L',
      name: 'Motul 8100 X-clean EFE 5W-30 5L',
      category: 'Motor Yağı',
      brand: 'Motul',
      quantity: 8,
      minQuantity: 3,
      unitCost: 1600,
      unitPrice: 2200,
      shelfLocation: 'Raf A-2',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'stk-3',
      code: 'MANN-HU71151X',
      name: 'Mann Yağ Filtresi (VAG Grubu)',
      category: 'Filtre',
      brand: 'Mann',
      quantity: 6,
      minQuantity: 5,
      unitCost: 280,
      unitPrice: 480,
      shelfLocation: 'Kutu F-12',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'stk-4',
      code: 'MANN-C35154',
      name: 'Mann Hava Filtresi (VAG Grubu)',
      category: 'Filtre',
      brand: 'Mann',
      quantity: 2, // Kritik seviyede
      minQuantity: 4,
      unitCost: 350,
      unitPrice: 580,
      shelfLocation: 'Kutu F-14',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'stk-5',
      code: 'BOSCH-0986494004',
      name: 'Bosch Ön Fren Balata Takımı (Megane/Clio)',
      category: 'Fren Sistemi',
      brand: 'Bosch',
      quantity: 5,
      minQuantity: 2,
      unitCost: 1250,
      unitPrice: 1800,
      shelfLocation: 'Raf B-4',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'stk-6',
      code: 'TOTAL-GLACELF-3L',
      name: 'Total Glacelf Kırmızı Organik Antifriz 3L',
      category: 'Sıvı & Katkı',
      brand: 'Total',
      quantity: 12,
      minQuantity: 4,
      unitCost: 320,
      unitPrice: 550,
      shelfLocation: 'Raf C-1',
      updatedAt: new Date().toISOString(),
    },
  ];

  const additionalParts: { code: string; name: string; category: string; brand: string; quantity: number; minQuantity: number; unitCost: number; unitPrice: number; shelfLocation: string }[] = [
    // Motor Yağları & Katkılar
    { code: 'CAST-5W40-4L', name: 'Castrol Magnatec 5W-40 DPF 4L', category: 'Motor Yağı', brand: 'Castrol', quantity: 12, minQuantity: 4, unitCost: 1250, unitPrice: 1700, shelfLocation: 'Raf A-3' },
    { code: 'MOTUL-0W20-5L', name: 'Motul 8100 Eco-lite 0W-20 Hibrit/TSI 5L', category: 'Motor Yağı', brand: 'Motul', quantity: 2, minQuantity: 4, unitCost: 1850, unitPrice: 2500, shelfLocation: 'Raf A-4' }, // Kritik
    { code: 'MOBIL1-ESP-5L', name: 'Mobil 1 ESP Formula 5W-30 Tam Sentetik 5L', category: 'Motor Yağı', brand: 'Mobil', quantity: 14, minQuantity: 4, unitCost: 1650, unitPrice: 2250, shelfLocation: 'Raf A-5' },
    { code: 'LIQUI-5W30-5L', name: 'Liqui Moly Top Tec 4200 5W-30 Longlife 5L', category: 'Motor Yağı', brand: 'Liqui Moly', quantity: 7, minQuantity: 3, unitCost: 1950, unitPrice: 2650, shelfLocation: 'Raf A-6' },
    { code: 'SHELL-10W40-4L', name: 'Shell Helix HX7 10W-40 Yarı Sentetik 4L', category: 'Motor Yağı', brand: 'Shell', quantity: 16, minQuantity: 5, unitCost: 950, unitPrice: 1350, shelfLocation: 'Raf A-7' },
    { code: 'TOTAL-5W30-5L', name: 'Total Quartz Ineo ECS 5W-30 (PSA Onaylı) 5L', category: 'Motor Yağı', brand: 'Total', quantity: 11, minQuantity: 4, unitCost: 1400, unitPrice: 1900, shelfLocation: 'Raf A-8' },
    { code: 'PO-ANTIFRIZ-3L', name: 'PO Organik Kırmızı Antifriz -56C 3L', category: 'Motor Yağı', brand: 'Petrol Ofisi', quantity: 24, minQuantity: 6, unitCost: 320, unitPrice: 520, shelfLocation: 'Raf B-1' },
    { code: 'CAST-ATF-1L', name: 'Castrol Transmax ATF Otomatik Şanzıman Yağı 1L', category: 'Motor Yağı', brand: 'Castrol', quantity: 8, minQuantity: 3, unitCost: 420, unitPrice: 650, shelfLocation: 'Raf B-2' },

    // Filtreler
    { code: 'MANN-CUK2939', name: 'Mann Karbonlu Polen Filtresi (VAG MQB)', category: 'Filtre', brand: 'Mann', quantity: 8, minQuantity: 4, unitCost: 410, unitPrice: 680, shelfLocation: 'Kutu F-3' },
    { code: 'MANN-WK8533X', name: 'Mann Mazot / Yakıt Filtresi (VAG 1.6 TDI)', category: 'Filtre', brand: 'Mann', quantity: 1, minQuantity: 4, unitCost: 680, unitPrice: 1100, shelfLocation: 'Kutu F-4' }, // Kritik
    { code: 'BOSCH-F026407023', name: 'Bosch Yağ Filtresi (Renault 1.5 dCi / Dacia)', category: 'Filtre', brand: 'Bosch', quantity: 22, minQuantity: 6, unitCost: 220, unitPrice: 380, shelfLocation: 'Kutu F-5' },
    { code: 'BOSCH-F026400037', name: 'Bosch Hava Filtresi (Renault Megane 4 / Clio 5)', category: 'Filtre', brand: 'Bosch', quantity: 14, minQuantity: 5, unitCost: 310, unitPrice: 520, shelfLocation: 'Kutu F-6' },
    { code: 'BOSCH-1987432364', name: 'Bosch Karbonlu Polen Filtresi (Renault Grubu)', category: 'Filtre', brand: 'Bosch', quantity: 10, minQuantity: 4, unitCost: 340, unitPrice: 560, shelfLocation: 'Kutu F-7' },
    { code: 'BOSCH-0450906471', name: 'Bosch Yakıt Filtresi (Renault 1.5 dCi Megane/Clio)', category: 'Filtre', brand: 'Bosch', quantity: 3, minQuantity: 5, unitCost: 750, unitPrice: 1200, shelfLocation: 'Kutu F-8' }, // Kritik
    { code: 'FILTRON-OE6882', name: 'Filtron Yağ Filtresi (Ford Focus / Courier 1.5 TDCi)', category: 'Filtre', brand: 'Filtron', quantity: 16, minQuantity: 5, unitCost: 210, unitPrice: 370, shelfLocation: 'Kutu F-9' },
    { code: 'FILTRON-AP1861', name: 'Filtron Hava Filtresi (Ford 1.5 EcoBlue / TDCi)', category: 'Filtre', brand: 'Filtron', quantity: 9, minQuantity: 4, unitCost: 290, unitPrice: 480, shelfLocation: 'Kutu F-10' },
    { code: 'MAHLE-OX404D', name: 'Mahle Yağ Filtresi (BMW 320i / 520d N20/B47)', category: 'Filtre', brand: 'Mahle', quantity: 6, minQuantity: 3, unitCost: 460, unitPrice: 750, shelfLocation: 'Kutu F-11' },
    { code: 'MAHLE-LX1211', name: 'Mahle Hava Filtresi (BMW G20 / G30)', category: 'Filtre', brand: 'Mahle', quantity: 5, minQuantity: 3, unitCost: 650, unitPrice: 1050, shelfLocation: 'Kutu F-12' },
    { code: 'MANN-HU7025Z', name: 'Mann Yağ Filtresi (Fiat Egea 1.3 / 1.6 Multijet)', category: 'Filtre', brand: 'Mann', quantity: 19, minQuantity: 6, unitCost: 190, unitPrice: 340, shelfLocation: 'Kutu F-13' },
    { code: 'BOSCH-F026400350', name: 'Bosch Hava Filtresi (Fiat Egea 1.3 / 1.6)', category: 'Filtre', brand: 'Bosch', quantity: 12, minQuantity: 4, unitCost: 270, unitPrice: 460, shelfLocation: 'Kutu F-15' },
    { code: 'MANN-W683', name: 'Mann Vidalı Yağ Filtresi (Toyota Corolla Hybrid)', category: 'Filtre', brand: 'Mann', quantity: 11, minQuantity: 4, unitCost: 240, unitPrice: 420, shelfLocation: 'Kutu F-16' },
    { code: 'FILTRON-AP1423', name: 'Filtron Hava Filtresi (Toyota Corolla 1.6/1.8)', category: 'Filtre', brand: 'Filtron', quantity: 7, minQuantity: 3, unitCost: 280, unitPrice: 470, shelfLocation: 'Kutu F-17' },

    // Fren Sistemi
    { code: 'BREMBO-P85072', name: 'Brembo Ön Fren Balata Takımı (Golf 7 / Passat B8)', category: 'Fren Sistemi', brand: 'Brembo', quantity: 7, minQuantity: 3, unitCost: 1250, unitPrice: 1900, shelfLocation: 'Raf C-2' },
    { code: 'BREMBO-P85124', name: 'Brembo Arka Fren Balata Takımı (VAG Grubu)', category: 'Fren Sistemi', brand: 'Brembo', quantity: 6, minQuantity: 3, unitCost: 980, unitPrice: 1550, shelfLocation: 'Raf C-3' },
    { code: 'BREMBO-09977211', name: 'Brembo Hava Soğutmalı Ön Fren Disk Çifti 312mm', category: 'Fren Sistemi', brand: 'Brembo', quantity: 2, minQuantity: 3, unitCost: 2900, unitPrice: 4200, shelfLocation: 'Raf C-4' }, // Kritik
    { code: 'TRW-GDB1330', name: 'TRW Ön Fren Balata Takımı (Renault Megane / Clio)', category: 'Fren Sistemi', brand: 'TRW', quantity: 9, minQuantity: 4, unitCost: 890, unitPrice: 1400, shelfLocation: 'Raf C-5' },
    { code: 'TRW-GDB1331', name: 'TRW Arka Fren Balata Takımı (Renault Megane 4)', category: 'Fren Sistemi', brand: 'TRW', quantity: 8, minQuantity: 3, unitCost: 760, unitPrice: 1200, shelfLocation: 'Raf C-6' },
    { code: 'TRW-DF4274S', name: 'TRW Ön Fren Disk Çifti (Renault Megane 4)', category: 'Fren Sistemi', brand: 'TRW', quantity: 3, minQuantity: 2, unitCost: 2400, unitPrice: 3500, shelfLocation: 'Raf C-7' },
    { code: 'BOSCH-0986424797', name: 'Bosch Ön Fren Balata Takımı (Fiat Egea / Doblo)', category: 'Fren Sistemi', brand: 'Bosch', quantity: 14, minQuantity: 5, unitCost: 820, unitPrice: 1300, shelfLocation: 'Raf C-8' },
    { code: 'BOSCH-0986479720', name: 'Bosch Ön Fren Disk Çifti (Fiat Egea 284mm)', category: 'Fren Sistemi', brand: 'Bosch', quantity: 4, minQuantity: 3, unitCost: 1950, unitPrice: 2950, shelfLocation: 'Raf C-9' },
    { code: 'FERODO-FDB1617', name: 'Ferodo Premier Ön Fren Balatası (Ford Focus/Courier)', category: 'Fren Sistemi', brand: 'Ferodo', quantity: 8, minQuantity: 3, unitCost: 920, unitPrice: 1450, shelfLocation: 'Raf C-10' },
    { code: 'ATE-DOT4-1L', name: 'ATE SL.6 DOT-4 ESP Uyumlu Fren Hidrolik Sıvısı 1L', category: 'Fren Sistemi', brand: 'ATE', quantity: 16, minQuantity: 5, unitCost: 340, unitPrice: 550, shelfLocation: 'Raf C-11' },
    { code: 'MOTUL-DOT51-500M', name: 'Motul DOT 5.1 Yüksek Performans Fren Sıvısı 500ml', category: 'Fren Sistemi', brand: 'Motul', quantity: 7, minQuantity: 3, unitCost: 280, unitPrice: 480, shelfLocation: 'Raf C-12' },
    { code: 'BREMBO-P06087', name: 'Brembo Ön Fren Balata Takımı (BMW F30 / G30)', category: 'Fren Sistemi', brand: 'Brembo', quantity: 4, minQuantity: 2, unitCost: 1850, unitPrice: 2800, shelfLocation: 'Raf C-13' },
    { code: 'TRW-GDB1956', name: 'TRW Ön Fren Balatası (Mercedes C200d W205)', category: 'Fren Sistemi', brand: 'TRW', quantity: 3, minQuantity: 2, unitCost: 1950, unitPrice: 2950, shelfLocation: 'Raf C-14' },
    { code: 'BOSCH-0986494662', name: 'Bosch Ön Fren Balata Takımı (Toyota Corolla)', category: 'Fren Sistemi', brand: 'Bosch', quantity: 6, minQuantity: 3, unitCost: 1100, unitPrice: 1700, shelfLocation: 'Raf C-15' },
    { code: 'VALEO-872430', name: 'Valeo Arka Fren Kampana & Çene Takımı (Fiorino/Clio)', category: 'Fren Sistemi', brand: 'Valeo', quantity: 3, minQuantity: 2, unitCost: 1400, unitPrice: 2200, shelfLocation: 'Raf C-16' },
    { code: 'WURTH-FREN-SPR', name: 'Würth Plus Fren ve Parça Balata Temizleyici 500ml', category: 'Fren Sistemi', brand: 'Würth', quantity: 36, minQuantity: 12, unitCost: 95, unitPrice: 180, shelfLocation: 'Koli W-1' },

    // Süspansiyon & Ön Takım
    { code: 'LEMF-2713201', name: 'Lemförder Salıncak Burcu Ön Arka (VAG Golf/Passat)', category: 'Süspansiyon & Ön Takım', brand: 'Lemförder', quantity: 18, minQuantity: 6, unitCost: 320, unitPrice: 550, shelfLocation: 'Raf D-1' },
    { code: 'LEMF-3814201', name: 'Lemförder Ön Z-Rot / Askı Rotu Çift (Golf 7/Passat)', category: 'Süspansiyon & Ön Takım', brand: 'Lemförder', quantity: 8, minQuantity: 4, unitCost: 650, unitPrice: 1100, shelfLocation: 'Raf D-2' },
    { code: 'FEBI-29840', name: 'Febi Bilstein Ön Rot Başı Sağ/Sol (VAG Grubu)', category: 'Süspansiyon & Ön Takım', brand: 'Febi', quantity: 10, minQuantity: 4, unitCost: 380, unitPrice: 650, shelfLocation: 'Raf D-3' },
    { code: 'FEBI-32481', name: 'Febi Ön Rotil (Renault Megane 4 / Kadjar)', category: 'Süspansiyon & Ön Takım', brand: 'Febi', quantity: 7, minQuantity: 3, unitCost: 410, unitPrice: 700, shelfLocation: 'Raf D-4' },
    { code: 'DELPHI-TC1985', name: 'Delphi Komple Ön Salıncak Sağ (Renault Megane 4)', category: 'Süspansiyon & Ön Takım', brand: 'Delphi', quantity: 2, minQuantity: 2, unitCost: 1850, unitPrice: 2800, shelfLocation: 'Raf D-5' },
    { code: 'DELPHI-TC1986', name: 'Delphi Komple Ön Salıncak Sol (Renault Megane 4)', category: 'Süspansiyon & Ön Takım', brand: 'Delphi', quantity: 1, minQuantity: 2, unitCost: 1850, unitPrice: 2800, shelfLocation: 'Raf D-6' }, // Kritik
    { code: 'SACHS-315910', name: 'Sachs Ön Gazlı Amortisör Adet (Golf 7 / Passat B8)', category: 'Süspansiyon & Ön Takım', brand: 'Sachs', quantity: 4, minQuantity: 2, unitCost: 2600, unitPrice: 3800, shelfLocation: 'Raf D-7' },
    { code: 'SACHS-315911', name: 'Sachs Arka Gazlı Amortisör Adet (VAG MQB)', category: 'Süspansiyon & Ön Takım', brand: 'Sachs', quantity: 4, minQuantity: 2, unitCost: 1900, unitPrice: 2900, shelfLocation: 'Raf D-8' },
    { code: 'MONROE-G8005', name: 'Monroe Ön Amortisör Çifti (Fiat Egea / Doblo)', category: 'Süspansiyon & Ön Takım', brand: 'Monroe', quantity: 3, minQuantity: 2, unitCost: 3800, unitPrice: 5600, shelfLocation: 'Raf D-9' },
    { code: 'SKF-VKD35025T', name: 'SKF Amortisör Üst Rulman & Takoz Seti Çift', category: 'Süspansiyon & Ön Takım', brand: 'SKF', quantity: 6, minQuantity: 3, unitCost: 850, unitPrice: 1400, shelfLocation: 'Raf D-10' },
    { code: 'MEYLE-HD-ZROT', name: 'Meyle HD Güçlendirilmiş Ön Z-Rot Çift (BMW F30)', category: 'Süspansiyon & Ön Takım', brand: 'Meyle', quantity: 3, minQuantity: 2, unitCost: 950, unitPrice: 1600, shelfLocation: 'Raf D-11' },
    { code: 'FEBI-01090', name: 'Febi Ön Tekerlek Porya Rulmanı (VAG 1.6 TDI)', category: 'Süspansiyon & Ön Takım', brand: 'Febi', quantity: 4, minQuantity: 2, unitCost: 1450, unitPrice: 2300, shelfLocation: 'Raf D-12' },
    { code: 'DELPHI-TD628W', name: 'Delphi Ön Viraj Demir Lastik Takımı', category: 'Süspansiyon & Ön Takım', brand: 'Delphi', quantity: 12, minQuantity: 4, unitCost: 180, unitPrice: 350, shelfLocation: 'Raf D-13' },
    { code: 'LEMF-34011', name: 'Lemförder Direksiyon Körüğü Seti', category: 'Süspansiyon & Ön Takım', brand: 'Lemförder', quantity: 8, minQuantity: 3, unitCost: 290, unitPrice: 520, shelfLocation: 'Raf D-14' },

    // Ateşleme & Elektrik
    { code: 'NGK-ILZKR7B11', name: 'NGK Laser Iridium Buji 4 Adet Takım (Honda/Toyota)', category: 'Ateşleme & Elektrik', brand: 'NGK', quantity: 8, minQuantity: 3, unitCost: 1350, unitPrice: 2100, shelfLocation: 'Raf E-1' },
    { code: 'BOSCH-0242236564', name: 'Bosch Çift Platin Buji 4 Adet (VAG 1.4/1.5 TSI)', category: 'Ateşleme & Elektrik', brand: 'Bosch', quantity: 10, minQuantity: 4, unitCost: 1200, unitPrice: 1900, shelfLocation: 'Raf E-2' },
    { code: 'BOSCH-0221604115', name: 'Bosch Ateşleme Bobini Tekli (VAG 1.4 TSI)', category: 'Ateşleme & Elektrik', brand: 'Bosch', quantity: 5, minQuantity: 2, unitCost: 890, unitPrice: 1450, shelfLocation: 'Raf E-3' },
    { code: 'BERU-GE101', name: 'Beru Kızdırma Bujisi Adet (Renault 1.5 dCi)', category: 'Ateşleme & Elektrik', brand: 'Beru', quantity: 14, minQuantity: 4, unitCost: 320, unitPrice: 550, shelfLocation: 'Raf E-4' },
    { code: 'BOSCH-0250403009', name: 'Bosch Kızdırma Bujisi Adet (VAG 1.6 TDI / Passat)', category: 'Ateşleme & Elektrik', brand: 'Bosch', quantity: 12, minQuantity: 4, unitCost: 450, unitPrice: 750, shelfLocation: 'Raf E-5' },
    { code: 'VARTA-D52-AGM', name: 'Varta Silver Dynamic AGM Akü 12V 60Ah 680A', category: 'Ateşleme & Elektrik', brand: 'Varta', quantity: 3, minQuantity: 2, unitCost: 3900, unitPrice: 5400, shelfLocation: 'Akü Alanı' },
    { code: 'VARTA-E39-AGM', name: 'Varta Silver Dynamic AGM Akü 12V 70Ah 760A', category: 'Ateşleme & Elektrik', brand: 'Varta', quantity: 4, minQuantity: 2, unitCost: 4600, unitPrice: 6300, shelfLocation: 'Akü Alanı' },
    { code: 'MUTLU-72AH-EFB', name: 'Mutlu EFB Start-Stop Akü 12V 72Ah 720A', category: 'Ateşleme & Elektrik', brand: 'Mutlu', quantity: 5, minQuantity: 2, unitCost: 3400, unitPrice: 4700, shelfLocation: 'Akü Alanı' },
    { code: 'VALEO-MARS-OTOM', name: 'Valeo Marş Motoru Otomatiği (Fiat/Renault)', category: 'Ateşleme & Elektrik', brand: 'Valeo', quantity: 2, minQuantity: 2, unitCost: 950, unitPrice: 1600, shelfLocation: 'Raf E-6' },
    { code: 'BOSCH-SARJ-REG', name: 'Bosch Alternatör Şarj Dinamosu Konjektörü', category: 'Ateşleme & Elektrik', brand: 'Bosch', quantity: 2, minQuantity: 2, unitCost: 850, unitPrice: 1450, shelfLocation: 'Raf E-7' },

    // Debriyaj & Şanzıman
    { code: 'LUK-600001600', name: 'LuK Komple Çift Kütleli Volan ve Debriyaj Seti (VAG)', category: 'Debriyaj & Şanzıman', brand: 'LuK', quantity: 2, minQuantity: 2, unitCost: 14500, unitPrice: 20500, shelfLocation: 'Ağır Parça A-1' },
    { code: 'LUK-624328500', name: 'LuK Debriyaj Baskı Balata Rulman Seti (Renault 1.5 dCi)', category: 'Debriyaj & Şanzıman', brand: 'LuK', quantity: 3, minQuantity: 2, unitCost: 4800, unitPrice: 7200, shelfLocation: 'Ağır Parça A-2' },
    { code: 'VALEO-826315', name: 'Valeo Debriyaj Kiti (Fiat Egea 1.3 Multijet)', category: 'Debriyaj & Şanzıman', brand: 'Valeo', quantity: 4, minQuantity: 2, unitCost: 3900, unitPrice: 5900, shelfLocation: 'Ağır Parça A-3' },
    { code: 'SACHS-3000951', name: 'Sachs Debriyaj Seti (Ford Focus 1.5 TDCi)', category: 'Debriyaj & Şanzıman', brand: 'Sachs', quantity: 2, minQuantity: 2, unitCost: 5200, unitPrice: 7800, shelfLocation: 'Ağır Parça A-4' },
    { code: 'LUK-DSG-KAVR', name: 'LuK Kuru Tip 7 İleri DSG Çift Kavrama Seti (DQ200)', category: 'Debriyaj & Şanzıman', brand: 'LuK', quantity: 1, minQuantity: 2, unitCost: 16800, unitPrice: 23500, shelfLocation: 'Ağır Parça A-5' }, // Kritik
    { code: 'FTE-KG15043', name: 'FTE Debriyaj Üst Merkezi (Renault Megane/Clio)', category: 'Debriyaj & Şanzıman', brand: 'FTE', quantity: 3, minQuantity: 2, unitCost: 1200, unitPrice: 1950, shelfLocation: 'Raf E-8' },
    { code: 'CAST-MAN-75W80', name: 'Castrol Syntrans 75W-80 Manuel Şanzıman Yağı 1L', category: 'Debriyaj & Şanzıman', brand: 'Castrol', quantity: 12, minQuantity: 4, unitCost: 380, unitPrice: 620, shelfLocation: 'Raf B-3' },
    { code: 'MOTUL-MULTI-DCTF', name: 'Motul Multi DCTF Çift Kavrama Şanzıman Yağı 1L', category: 'Debriyaj & Şanzıman', brand: 'Motul', quantity: 6, minQuantity: 3, unitCost: 550, unitPrice: 850, shelfLocation: 'Raf B-4' },

    // Triger & Motor Kayışları
    { code: 'GATES-KP15678XS', name: 'Gates Triger Kayış Seti & Devridaim Su Pompası (VAG)', category: 'Triger & Kayış', brand: 'Gates', quantity: 3, minQuantity: 2, unitCost: 5400, unitPrice: 7900, shelfLocation: 'Ağır Parça B-1' },
    { code: 'DAYCO-KTBWP4630', name: 'Dayco Triger Seti + Devridaim (Renault 1.5 dCi)', category: 'Triger & Kayış', brand: 'Dayco', quantity: 4, minQuantity: 2, unitCost: 3900, unitPrice: 5800, shelfLocation: 'Ağır Parça B-2' },
    { code: 'CONTI-CT1168WP1', name: 'Continental ContiTech Triger Seti + Devridaim (PSA)', category: 'Triger & Kayış', brand: 'Continental', quantity: 2, minQuantity: 2, unitCost: 4800, unitPrice: 7100, shelfLocation: 'Ağır Parça B-3' },
    { code: 'INA-530050310', name: 'INA Triger Rulmanı & Gergi Kiti (Ford 1.5/1.6 TDCi)', category: 'Triger & Kayış', brand: 'INA', quantity: 3, minQuantity: 2, unitCost: 3200, unitPrice: 4800, shelfLocation: 'Raf E-9' },
    { code: 'GATES-6PK1070', name: 'Gates V Kanalı Alternatör Kayışı 6PK1070', category: 'Triger & Kayış', brand: 'Gates', quantity: 11, minQuantity: 4, unitCost: 360, unitPrice: 600, shelfLocation: 'Raf E-10' },
    { code: 'GATES-6PK1195', name: 'Gates V Kanalı Alternatör Kayışı 6PK1195', category: 'Triger & Kayış', brand: 'Gates', quantity: 9, minQuantity: 3, unitCost: 390, unitPrice: 650, shelfLocation: 'Raf E-11' },
    { code: 'INA-534015110', name: 'INA Otomatik V Kayış Gergi Kütüğü', category: 'Triger & Kayış', brand: 'INA', quantity: 4, minQuantity: 2, unitCost: 1100, unitPrice: 1750, shelfLocation: 'Raf E-12' },
    { code: 'CORTECO-KRANK', name: 'Corteco Titreşim Sönümleyici Krank Kasnağı (1.5 dCi)', category: 'Triger & Kayış', brand: 'Corteco', quantity: 2, minQuantity: 2, unitCost: 2200, unitPrice: 3400, shelfLocation: 'Ağır Parça B-4' },

    // Soğutma & Isıtma
    { code: 'BEHR-TERMO-VAG', name: 'Behr Mahle Komple Gövdeli Termostat 87C (VAG)', category: 'Soğutma & Isıtma', brand: 'Behr', quantity: 3, minQuantity: 2, unitCost: 1650, unitPrice: 2550, shelfLocation: 'Raf F-1' },
    { code: 'VALEO-TERMO-REN', name: 'Valeo Gövdeli Termostat (Renault 1.5 dCi Megane/Clio)', category: 'Soğutma & Isıtma', brand: 'Valeo', quantity: 4, minQuantity: 2, unitCost: 1250, unitPrice: 1950, shelfLocation: 'Raf F-2' },
    { code: 'KALE-RAD-EGEA', name: 'Kale Motor Su Radyatörü (Fiat Egea 1.3/1.6)', category: 'Soğutma & Isıtma', brand: 'Kale', quantity: 2, minQuantity: 1, unitCost: 2600, unitPrice: 3900, shelfLocation: 'Ağır Parça C-1' },
    { code: 'GRAF-POMPA-VAG', name: 'Graf Döküm Kanatlı Devridaim Su Pompası (VAG TDI)', category: 'Soğutma & Isıtma', brand: 'Graf', quantity: 4, minQuantity: 2, unitCost: 1350, unitPrice: 2150, shelfLocation: 'Raf F-3' },
    { code: 'FEBI-GENLESME', name: 'Febi Motor Soğutma Suyu Genleşme Kabı & Kapağı', category: 'Soğutma & Isıtma', brand: 'Febi', quantity: 5, minQuantity: 2, unitCost: 580, unitPrice: 950, shelfLocation: 'Raf F-4' },
    { code: 'FEBI-FAN-MUSUR', name: 'Febi Çift Kademeli Radyatör Fan Müşürü', category: 'Soğutma & Isıtma', brand: 'Febi', quantity: 6, minQuantity: 2, unitCost: 280, unitPrice: 490, shelfLocation: 'Raf F-5' },

    // Aydınlatma & Silecek
    { code: 'OSRAM-H7-NBL', name: 'Osram Night Breaker Laser H7 +150% Ampul Çifti', category: 'Aydınlatma & Silecek', brand: 'Osram', quantity: 8, minQuantity: 3, unitCost: 750, unitPrice: 1250, shelfLocation: 'Kutu L-1' },
    { code: 'OSRAM-H4-ORIG', name: 'Osram Standart H4 12V 60/55W Halojen Ampul', category: 'Aydınlatma & Silecek', brand: 'Osram', quantity: 20, minQuantity: 6, unitCost: 95, unitPrice: 180, shelfLocation: 'Kutu L-2' },
    { code: 'PHILIPS-W5W-LED', name: 'Philips Ultinon Pro6000 W5W T10 Park Led Ampul', category: 'Aydınlatma & Silecek', brand: 'Philips', quantity: 12, minQuantity: 4, unitCost: 240, unitPrice: 420, shelfLocation: 'Kutu L-3' },
    { code: 'BOSCH-A863S', name: 'Bosch Aerotwin A863S Ön Muz Silecek Takımı (Golf 7)', category: 'Aydınlatma & Silecek', brand: 'Bosch', quantity: 7, minQuantity: 3, unitCost: 620, unitPrice: 980, shelfLocation: 'Silecek Standı' },
    { code: 'BOSCH-A102S', name: 'Bosch Aerotwin A102S Muz Silecek Takımı (Megane 4)', category: 'Aydınlatma & Silecek', brand: 'Bosch', quantity: 6, minQuantity: 3, unitCost: 650, unitPrice: 1020, shelfLocation: 'Silecek Standı' },
    { code: 'WURTH-CAMSUYU-1L', name: 'Würth Konsantre Dört Mevsim Cam Suyu -60C 1L', category: 'Aydınlatma & Silecek', brand: 'Würth', quantity: 28, minQuantity: 8, unitCost: 110, unitPrice: 220, shelfLocation: 'Raf G-1' },

    // Sarf Malzeme & Atölye Kimyasalları
    { code: 'WURTH-SIVI-GRES', name: 'Würth HHS 2000 Yüksek Basınca Dayanıklı Sıvı Gres 500ml', category: 'Sarf Malzeme', brand: 'Würth', quantity: 14, minQuantity: 4, unitCost: 260, unitPrice: 440, shelfLocation: 'Kutu K-1' },
    { code: 'WD40-SPRA-400ML', name: 'WD-40 Akıllı Pipet Çok Amaçlı Pas Sökücü 400ml', category: 'Sarf Malzeme', brand: 'WD-40', quantity: 22, minQuantity: 6, unitCost: 240, unitPrice: 410, shelfLocation: 'Kutu K-2' },
    { code: 'LIQUI-MOTOR-CLEAN', name: 'Liqui Moly Motor İçi Yağ Yıkama Temizleyici 300ml', category: 'Sarf Malzeme', brand: 'Liqui Moly', quantity: 9, minQuantity: 3, unitCost: 310, unitPrice: 520, shelfLocation: 'Raf G-2' },
    { code: 'LIQUI-INJ-CLEAN', name: 'Liqui Moly Dizel Sistem ve Enjektör Temizleyici 250ml', category: 'Sarf Malzeme', brand: 'Liqui Moly', quantity: 11, minQuantity: 4, unitCost: 280, unitPrice: 490, shelfLocation: 'Raf G-3' },
    { code: 'ELRING-DIRKO-70M', name: 'Elring Dirko HT Siyah Sıvı Silikon Sıvı Conta 70ml', category: 'Sarf Malzeme', brand: 'Elring', quantity: 15, minQuantity: 4, unitCost: 195, unitPrice: 350, shelfLocation: 'Kutu K-3' },
    { code: 'TAPA-PUL-SETI', name: 'Karter Tapa Bakır ve Alüminyum Pul Karışık Set (150 Parça)', category: 'Sarf Malzeme', brand: 'OEM', quantity: 6, minQuantity: 2, unitCost: 250, unitPrice: 450, shelfLocation: 'Kutu K-4' },
  ];

  const stockItems: StockItem[] = [...initialBaseStockItems];

  additionalParts.forEach((p, idx) => {
    stockItems.push({
      id: `stk-${idx + 7}`,
      code: p.code,
      name: p.name,
      category: p.category,
      brand: p.brand,
      quantity: p.quantity,
      minQuantity: p.minQuantity,
      unitCost: p.unitCost,
      unitPrice: p.unitPrice,
      shelfLocation: p.shelfLocation,
      updatedAt: new Date(Date.now() - (100 - idx) * 3600000).toISOString(),
    });
  });

  return stockItems.slice(0, 100);
};

// Realistic Service Records for Multi-Data Behavior Testing (15 records)
export const generateRealisticServiceRecords = (
  customers: Customer[],
  vehicles: Vehicle[],
  stockItems: StockItem[]
): ServiceRecord[] => {
  const records: ServiceRecord[] = [];
  const statuses = ['ISLEMDE', 'PARCA_BEKLENIYOR', 'TAMAMLANDI', 'TESLIM_EDILDI', 'KABUL_EDILDI'] as const;

  for (let i = 1; i <= 15; i++) {
    const veh = vehicles[i - 1];
    const cust = customers.find(c => c.id === veh.customerId) || customers[0];
    const status = statuses[(i - 1) % statuses.length];
    const stock1 = stockItems[(i * 3) % stockItems.length];
    const stock2 = stockItems[(i * 7) % stockItems.length];

    const part1Cost = stock1.unitCost;
    const part1Price = stock1.unitPrice;
    const part2Cost = stock2.unitCost;
    const part2Price = stock2.unitPrice;

    const partsTotal = part1Price + part2Price;
    const laborTotal = 1200 + ((i * 300) % 1800);
    const discount = i % 4 === 0 ? 300 : 0;
    const grandTotal = partsTotal + laborTotal - discount;

    const paymentStatus = status === 'TESLIM_EDILDI' 
      ? (i % 3 === 0 ? 'VERESIYE' : 'ODENDI') 
      : (status === 'TAMAMLANDI' ? 'KISMI_ODENDI' : 'BEKLIYOR');
    
    const paidAmount = paymentStatus === 'ODENDI' ? grandTotal : paymentStatus === 'KISMI_ODENDI' ? Math.floor(grandTotal / 2) : 0;

    records.push({
      id: `rec-bulk-${i}`,
      vehicleId: veh.id,
      customerId: cust.id,
      technicianId: i % 2 === 0 ? 'tech-1' : 'tech-2',
      entryDate: new Date(Date.now() - (16 - i) * 86400000 * 2).toISOString(),
      exitDate: status === 'TESLIM_EDILDI' ? new Date(Date.now() - (16 - i) * 86400000).toISOString() : undefined,
      entryKm: veh.currentKm - ((16 - i) * 450),
      complaint: i % 3 === 0 ? 'Periyodik 10.000 KM bakımı ve fren kontrolü.' : i % 2 === 0 ? 'Ön takımdan kasislerde lokurtu sesi geliyor.' : 'Motor arıza lambası yanıyor ve çekiş düşük.',
      diagnosis: i % 3 === 0 ? 'Yağ, filtreler ve fren balataları yenilendi.' : i % 2 === 0 ? 'Ön Z-rotlar ve viraj lastikleri aşınmış.' : 'Kızdırma bujisi arızalı tespit edildi.',
      status,
      items: [
        {
          id: `item-${i}-1`,
          serviceRecordId: `rec-bulk-${i}`,
          stockItemId: stock1.id,
          itemType: 'PARCA',
          name: stock1.name,
          quantity: 1,
          costPrice: part1Cost,
          unitPrice: part1Price,
          totalPrice: part1Price,
          warrantyMonths: 12,
        },
        {
          id: `item-${i}-2`,
          serviceRecordId: `rec-bulk-${i}`,
          stockItemId: stock2.id,
          itemType: 'PARCA',
          name: stock2.name,
          quantity: 1,
          costPrice: part2Cost,
          unitPrice: part2Price,
          totalPrice: part2Price,
          warrantyMonths: 12,
        },
        {
          id: `item-${i}-3`,
          serviceRecordId: `rec-bulk-${i}`,
          itemType: 'ISCILIK',
          name: 'Periyodik Bakım, Ön Takım Kontrol ve Test İşçiliği',
          quantity: 1,
          costPrice: 0,
          unitPrice: laborTotal,
          totalPrice: laborTotal,
          warrantyMonths: 6,
        },
      ],
      partsTotal,
      laborTotal,
      discount,
      grandTotal,
      paidAmount,
      paymentStatus,
      paymentMethod: i % 3 === 0 ? 'KREDI_KARTI' : i % 2 === 0 ? 'HAVALE' : 'NAKIT',
      technicianNotes: 'Tüm tork kontrolleri yapıldı, test sürüşü olumlu.',
      createdAt: new Date(Date.now() - (16 - i) * 86400000 * 2).toISOString(),
    });
  }

  return records;
};

// Realistic Reminders (12 items)
export const generateRealisticReminders = (
  customers: Customer[],
  vehicles: Vehicle[]
): Reminder[] => {
  const reminders: Reminder[] = [];
  const types = ['YAG_BAKIMI', 'MUAYENE', 'TRIGER', 'FREN_BALATA'] as const;

  for (let i = 1; i <= 12; i++) {
    const veh = vehicles[i];
    const cust = customers.find(c => c.id === veh.customerId) || customers[0];
    const type = types[(i - 1) % types.length];

    reminders.push({
      id: `rem-bulk-${i}`,
      vehicleId: veh.id,
      customerId: cust.id,
      type,
      title: type === 'YAG_BAKIMI' ? 'Periyodik 10.000 KM Yağ Bakımı' : type === 'MUAYENE' ? 'TÜVTÜRK Araç Muayenesi Hatırlatması' : type === 'TRIGER' ? 'Triger Kayış & Seti Değişim Zamanı' : 'Ön & Arka Fren Balata Kontrolü',
      targetDate: new Date(Date.now() + ((i * 7) - 14) * 86400000).toISOString().split('T')[0],
      targetKm: veh.currentKm + 10000,
      lastServiceKm: veh.currentKm,
      status: i <= 8 ? 'YAKLASAN' : 'TAMAMLANDI',
      notes: 'Müşteriye SMS/WhatsApp ile bilgi verilecek.',
      createdAt: new Date(Date.now() - (12 - i) * 86400000).toISOString(),
    });
  }

  return reminders;
};
