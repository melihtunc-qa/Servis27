import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Wrench, 
  Plus, 
  Trash2, 
  DollarSign, 
  Car, 
  User, 
  CheckCircle,
  Package,
  Search,
  ChevronDown,
  Check
} from 'lucide-react';
import { storage } from '../services/storage';
import { Vehicle, Customer, ServiceRecord, ServiceItem, ServiceStatus, PaymentStatus, ItemType, StockItem } from '../types';
import { matchPlateSearch } from '../utils/plate';

interface NewServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordCreated: (record: ServiceRecord) => void;
  preSelectedVehicle?: Vehicle | null;
}

export const NewServiceModal: React.FC<NewServiceModalProps> = ({
  isOpen,
  onClose,
  onRecordCreated,
  preSelectedVehicle,
}) => {
  const vehicles = storage.getVehicles();
  const customers = storage.getCustomers();
  const stockItems = storage.getStockItems();
  const categories = Array.from(new Set(stockItems.map(s => s.category).filter(Boolean)));

  const [isStockPickerOpen, setIsStockPickerOpen] = useState(false);
  const [stockPickerRowIndex, setStockPickerRowIndex] = useState<number | null>(null);
  const [stockSearchQuery, setStockSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const [selectedVehicleId, setSelectedVehicleId] = useState(
    preSelectedVehicle ? preSelectedVehicle.id : (vehicles[0]?.id || '')
  );

  const [isVehicleDropdownOpen, setIsVehicleDropdownOpen] = useState(false);
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState('');
  const vehicleDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (vehicleDropdownRef.current && !vehicleDropdownRef.current.contains(event.target as Node)) {
        setIsVehicleDropdownOpen(false);
      }
    };
    if (isVehicleDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVehicleDropdownOpen]);

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);
  const selectedCustomer = selectedVehicle ? customers.find(c => c.id === selectedVehicle.customerId) : null;

  const [entryKm, setEntryKm] = useState(selectedVehicle ? selectedVehicle.currentKm : 0);
  const [complaint, setComplaint] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [status, setStatus] = useState<ServiceStatus>('ISLEMDE');
  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('ODENDI');
  const [paymentMethod, setPaymentMethod] = useState<'NAKIT' | 'KREDI_KARTI' | 'HAVALE' | 'ACIK_HESAP'>('NAKIT');

  // Service items (parts and labor) - starts empty by default
  const [items, setItems] = useState<Array<{
    id: string;
    itemType: ItemType;
    name: string;
    quantity: number;
    unitPrice: number;
    costPrice: number;
    stockItemId?: string;
  }>>([]);

  useEffect(() => {
    if (isOpen) {
      setItems([]);
      setDiscount(0);
      setPaidAmount(0);
      setComplaint('');
      setDiagnosis('');
      if (preSelectedVehicle) {
        setSelectedVehicleId(preSelectedVehicle.id);
        setEntryKm(preSelectedVehicle.currentKm);
      } else if (vehicles[0]) {
        setSelectedVehicleId(vehicles[0].id);
        setEntryKm(vehicles[0].currentKm);
      }
    }
  }, [isOpen, preSelectedVehicle]);

  if (!isOpen) return null;

  const filteredVehicles = vehicles.filter(v => {
    if (!vehicleSearchQuery.trim()) return true;
    const q = vehicleSearchQuery.trim().toLowerCase();
    const cust = customers.find(c => c.id === v.customerId);
    return (
      matchPlateSearch(v.plate, vehicleSearchQuery) ||
      v.brand.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      (cust && cust.fullName.toLowerCase().includes(q))
    );
  });

  const filteredStockItems = stockItems.filter(item => {
    const q = stockSearchQuery.trim().toLowerCase();
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch = !q || 
      item.name.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q) ||
      item.brand.toLowerCase().includes(q) ||
      (item.shelfLocation && item.shelfLocation.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  const handleSelectStockItem = (stockItem: StockItem) => {
    if (stockPickerRowIndex !== null && items[stockPickerRowIndex]) {
      const updated = [...items];
      updated[stockPickerRowIndex] = {
        ...updated[stockPickerRowIndex],
        itemType: 'PARCA',
        name: stockItem.name,
        unitPrice: stockItem.unitPrice,
        costPrice: stockItem.unitCost,
        stockItemId: stockItem.id,
        quantity: updated[stockPickerRowIndex].quantity || 1,
      };
      setItems(updated);
      setStockPickerRowIndex(null);
    } else {
      setItems(prev => [
        ...prev,
        {
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          itemType: 'PARCA',
          name: stockItem.name,
          quantity: 1,
          unitPrice: stockItem.unitPrice,
          costPrice: stockItem.unitCost,
          stockItemId: stockItem.id,
        },
      ]);
    }
    setIsStockPickerOpen(false);
  };

  const handleUnlinkStock = (index: number) => {
    const updated = [...items];
    const item = { ...updated[index] };
    delete item.stockItemId;
    updated[index] = item;
    setItems(updated);
  };

  const handleVehicleChange = (vId: string) => {
    setSelectedVehicleId(vId);
    const veh = vehicles.find(v => v.id === vId);
    if (veh) {
      setEntryKm(veh.currentKm);
    }
  };

  const handleAddItem = (type: ItemType) => {
    setItems([
      ...items,
      {
        id: `item-${Date.now()}`,
        itemType: type,
        name: '',
        quantity: 1,
        unitPrice: 0,
        costPrice: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  // Calculations
  const partsTotal = items
    .filter(i => i.itemType === 'PARCA')
    .reduce((sum, i) => sum + (Number(i.quantity) * Number(i.unitPrice) || 0), 0);

  const laborTotal = items
    .filter(i => i.itemType === 'ISCILIK')
    .reduce((sum, i) => sum + (Number(i.quantity) * Number(i.unitPrice) || 0), 0);

  const grandTotal = Math.max(0, partsTotal + laborTotal - Number(discount || 0));

  // Auto-sync paidAmount when paymentStatus is 'ODENDI'
  useEffect(() => {
    if (paymentStatus === 'ODENDI') {
      setPaidAmount(grandTotal);
    }
  }, [grandTotal, paymentStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle || !selectedCustomer) {
      alert('Lütfen geçerli bir araç seçiniz.');
      return;
    }
    if (!complaint) {
      alert('Lütfen müşteri talebini / şikayetini giriniz.');
      return;
    }

    const recordId = `srv-${Date.now()}`;

    const formattedItems: ServiceItem[] = items.map((it) => ({
      id: it.id,
      serviceRecordId: recordId,
      itemType: it.itemType,
      name: it.name || (it.itemType === 'PARCA' ? 'Yedek Parça' : 'İşçilik'),
      quantity: Number(it.quantity) || 1,
      unitPrice: Number(it.unitPrice) || 0,
      costPrice: Number(it.costPrice) || 0,
      totalPrice: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0),
      stockItemId: it.stockItemId,
    }));

    const newRecord: ServiceRecord = {
      id: recordId,
      vehicleId: selectedVehicle.id,
      customerId: selectedCustomer.id,
      entryDate: new Date().toISOString(),
      entryKm: Number(entryKm) || selectedVehicle.currentKm,
      complaint,
      diagnosis,
      status,
      items: formattedItems,
      partsTotal,
      laborTotal,
      discount: Number(discount) || 0,
      grandTotal,
      paidAmount: Number(paidAmount) || 0,
      paymentStatus,
      paymentMethod,
      createdAt: new Date().toISOString(),
    };

    storage.saveServiceRecord(newRecord);
    onRecordCreated(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Yeni İş Emri & Servis Girişi</h3>
              <p className="text-xs text-slate-400">Araç kabul, işlem kalemleri ve fiyatlandırma</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Vehicle and Customer Selector */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
            {/* Servise Gelen Araç (Searchable Select - Expanded Width) */}
            <div className="md:col-span-6 relative" ref={vehicleDropdownRef}>
              <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                Servise Gelen Araç *
              </label>

              {/* Custom Searchable Trigger Button */}
              <button
                type="button"
                onClick={() => setIsVehicleDropdownOpen(prev => !prev)}
                className="w-full bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-xl px-3 py-2 text-sm text-left font-medium text-slate-100 flex items-center justify-between transition focus:outline-none focus:border-blue-500 shadow-sm h-[38px]"
              >
                {selectedVehicle ? (
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 text-xs shrink-0">
                      {selectedVehicle.plate}
                    </span>
                    <span className="truncate text-slate-200">
                      {selectedVehicle.brand} {selectedVehicle.model} ({selectedVehicle.year})
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-400">Araç Seçiniz...</span>
                )}
                <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 ml-2 transition-transform duration-150 ${isVehicleDropdownOpen ? 'rotate-180 text-blue-400' : ''}`} />
              </button>

              {/* Searchable Dropdown Menu */}
              {isVehicleDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2.5 space-y-2 animate-in fade-in zoom-in-95 duration-100">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Plaka , Marka, Model veya Müşteri Aratın"
                      value={vehicleSearchQuery}
                      onChange={(e) => setVehicleSearchQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-medium"
                      autoFocus
                    />
                    {vehicleSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setVehicleSearchQuery('')}
                        className="text-slate-500 hover:text-slate-300 absolute right-2.5 top-1/2 -translate-y-1/2"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                    {filteredVehicles.length === 0 ? (
                      <p className="p-3 text-center text-xs text-slate-500">
                        Aramaya uygun araç bulunamadı.
                      </p>
                    ) : (
                      filteredVehicles.map((v) => {
                        const isSelected = v.id === selectedVehicleId;
                        const vCustomer = customers.find(c => c.id === v.customerId);

                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => {
                              handleVehicleChange(v.id);
                              setIsVehicleDropdownOpen(false);
                              setVehicleSearchQuery('');
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-lg text-xs text-left transition ${
                              isSelected
                                ? 'bg-blue-600/20 border border-blue-500/40 text-blue-200'
                                : 'hover:bg-slate-800 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="font-mono font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 text-[11px] shrink-0">
                                {v.plate}
                              </span>
                              <div className="truncate">
                                <span className="font-semibold text-white mr-1.5">{v.brand} {v.model}</span>
                                <span className="text-slate-400 text-[11px]">({v.year})</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-2">
                              {vCustomer && (
                                <span className="text-[11px] text-slate-400 truncate max-w-[130px]">
                                  {vCustomer.fullName}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-500 font-mono">
                                {v.currentKm.toLocaleString('tr-TR')} KM
                              </span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Müşteri (Sahibi) */}
            <div className="md:col-span-4">
              <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                Müşteri (Sahibi)
              </label>
              <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 truncate flex items-center gap-2 h-[38px]">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">
                  {selectedCustomer ? `${selectedCustomer.fullName} (${selectedCustomer.phone})` : 'Seçilmedi'}
                </span>
              </div>
            </div>

            {/* Servis Giriş KM (Narrowed) */}
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                Giriş KM *
              </label>
              <input
                type="number"
                value={entryKm}
                onChange={(e) => setEntryKm(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono font-bold text-slate-100 focus:outline-none focus:border-blue-500 h-[38px]"
                required
              />
            </div>
          </div>

          {/* Complaint and Diagnosis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                Müşteri Şikayeti & Talep *
              </label>
              <textarea
                rows={3}
                placeholder="Örn: 10.000 KM periyodik bakımı, ön frenlerden ses geliyor, klima gazı kontrolü..."
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                Usta Teşhisi / Ön Muayene
              </label>
              <textarea
                rows={3}
                placeholder="Örn: Ön balatalar aşınmış, motor yağı seviyesi düşük, hava filtresi tıkalı..."
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Dynamic Service Items (Parts / Labor) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Değişen Parçalar ve İşçilik Kalemleri
              </h4>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStockPickerRowIndex(null);
                    setStockSearchQuery('');
                    setIsStockPickerOpen(true);
                  }}
                  className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm active:scale-98"
                >
                  <Package className="w-3.5 h-3.5" />
                  + Stoktan Parça Ekle
                </button>
                <button
                  type="button"
                  onClick={() => handleAddItem('PARCA')}
                  className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-800 rounded-lg text-xs font-medium flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Stok Dışı Parça
                </button>
                <button
                  type="button"
                  onClick={() => handleAddItem('ISCILIK')}
                  className="px-2.5 py-1 bg-amber-950 hover:bg-amber-900 text-amber-400 border border-amber-800 rounded-lg text-xs font-medium flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + İşçilik Ekle
                </button>
              </div>
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold uppercase">
                  <tr>
                    <th className="p-2.5 w-24">Tür</th>
                    <th className="p-2.5">Kalem Adı / Parça</th>
                    <th className="p-2.5 w-20 text-center">Miktar</th>
                    <th className="p-2.5 w-28 text-right">Birim Fiyat</th>
                    <th className="p-2.5 w-28 text-right">Tutar</th>
                    <th className="p-2.5 w-12 text-center">Sil</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 text-xs">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <Package className="w-6 h-6 text-slate-600 mb-1" />
                          <p className="font-medium text-slate-400">Henüz parça veya işçilik eklenmedi.</p>
                          <p className="text-[11px] text-slate-500">
                            Yukarıdaki <strong className="text-emerald-400 font-normal">+ Stoktan Parça Ekle</strong>, <strong className="text-cyan-400 font-normal">+ Stok Dışı Parça</strong> veya <strong className="text-amber-400 font-normal">+ İşçilik Ekle</strong> butonlarını kullanarak ekleyebilirsiniz.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => {
                    const rowTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
                    const linkedStock = item.stockItemId ? stockItems.find(s => s.id === item.stockItemId) : null;
                    const isOutOfStock = linkedStock && linkedStock.quantity < Number(item.quantity);

                    return (
                      <tr key={item.id} className="hover:bg-slate-900/50">
                        <td className="p-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.itemType === 'PARCA' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}>
                            {item.itemType}
                          </span>
                        </td>
                        <td className="p-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                placeholder={item.itemType === 'PARCA' ? 'Parça Adı (veya Stoktan Seçin)' : 'İşlem / İşçilik Adı'}
                                value={item.name}
                                onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500"
                                required
                              />
                              {item.itemType === 'PARCA' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setStockPickerRowIndex(index);
                                    setStockSearchQuery('');
                                    setIsStockPickerOpen(true);
                                  }}
                                  title={item.stockItemId ? 'Farklı stok ürünü seç' : 'Depo stok listesinden seç'}
                                  className={`shrink-0 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium flex items-center gap-1 transition ${
                                    item.stockItemId
                                      ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                                  }`}
                                >
                                  <Package className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>{item.stockItemId ? 'Stok' : 'Depo'}</span>
                                </button>
                              )}
                            </div>

                            {/* Stock Info Badge & Real-time Validation */}
                            {item.itemType === 'PARCA' && item.stockItemId && linkedStock && (
                              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                                <span className="font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                                  <Package className="w-3 h-3" />
                                  {linkedStock.code}
                                </span>
                                <span className="text-slate-400">
                                  Mevcut Depo: <strong className={isOutOfStock ? 'text-rose-400' : 'text-slate-200 font-mono'}>{linkedStock.quantity} adet</strong>
                                </span>
                                {linkedStock.shelfLocation && (
                                  <span className="text-slate-500">({linkedStock.shelfLocation})</span>
                                )}
                                {isOutOfStock && (
                                  <span className="text-rose-400 font-semibold flex items-center gap-1">
                                    ⚠️ Yetersiz Stok!
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleUnlinkStock(index)}
                                  className="text-slate-500 hover:text-amber-400 underline text-[10px] ml-auto"
                                  title="Stok bağlantısını kaldırıp serbest parçaya çevir"
                                >
                                  Bağlantıyı Kaldır
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-center text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                            required
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-right text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                            required
                          />
                        </td>
                        <td className="p-2 text-right font-mono font-bold text-slate-200">
                          ₺{rowTotal.toLocaleString('tr-TR')}
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-slate-500 hover:text-rose-400 p-1 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  }))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing & Payment Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            {/* Status & Method */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  İşlem Durumu
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ServiceStatus)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="KABUL_EDILDI">Kabul Edildi</option>
                  <option value="ISLEMDE">İşlemde (Liftte)</option>
                  <option value="PARCA_BEKLENIYOR">Parça Bekleniyor</option>
                  <option value="TAMAMLANDI">Tamamlandı</option>
                  <option value="TESLIM_EDILDI">Teslim Edildi</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    Ödeme Durumu
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => {
                      const val = e.target.value as PaymentStatus;
                      setPaymentStatus(val);
                      if (val === 'ODENDI') {
                        setPaidAmount(grandTotal);
                        if (paymentMethod === 'ACIK_HESAP') setPaymentMethod('NAKIT');
                      } else if (val === 'BEKLIYOR' || val === 'VERESIYE') {
                        setPaidAmount(0);
                        if (val === 'VERESIYE') setPaymentMethod('ACIK_HESAP');
                      } else if (val === 'KISMI_ODENDI') {
                        if (paidAmount === 0 || paidAmount >= grandTotal) {
                          setPaidAmount(Math.round(grandTotal / 2));
                        }
                        if (paymentMethod === 'ACIK_HESAP') setPaymentMethod('NAKIT');
                      }
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="ODENDI">Ödendi (Tamamı)</option>
                    <option value="KISMI_ODENDI">Kısmi Ödendi</option>
                    <option value="VERESIYE">Veresiye / Açık Hesap</option>
                    <option value="BEKLIYOR">Bekliyor</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    Ödeme Yolu
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setPaymentMethod(val);
                      if (val === 'ACIK_HESAP') {
                        setPaymentStatus('VERESIYE');
                        setPaidAmount(0);
                      } else if (paymentStatus === 'VERESIYE') {
                        setPaymentStatus('ODENDI');
                        setPaidAmount(grandTotal);
                      }
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="NAKIT">Nakit</option>
                    <option value="KREDI_KARTI">Kredi Kartı (POS)</option>
                    <option value="HAVALE">Havale / EFT</option>
                    <option value="ACIK_HESAP">Açık Hesap (Cari)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Yedek Parça Toplamı:</span>
                <span className="font-mono font-bold text-slate-200">₺{partsTotal.toLocaleString('tr-TR')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">İşçilik Toplamı:</span>
                <span className="font-mono font-bold text-slate-200">₺{laborTotal.toLocaleString('tr-TR')}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">İskonto / İndirim (₺):</span>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-right text-rose-400 font-mono font-bold focus:outline-none"
                />
              </div>
              <div className="flex justify-between py-2 border-b-2 border-slate-700 text-sm">
                <span className="font-bold text-white">Genel Toplam:</span>
                <span className="font-mono font-bold text-emerald-400 text-base">
                  ₺{grandTotal.toLocaleString('tr-TR')}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Alınan Tahsilat (₺):</span>
                <input
                  type="number"
                  min="0"
                  max={grandTotal}
                  value={paidAmount}
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value));
                    setPaidAmount(val);
                    if (val >= grandTotal && grandTotal > 0) {
                      setPaymentStatus('ODENDI');
                      if (paymentMethod === 'ACIK_HESAP') setPaymentMethod('NAKIT');
                    } else if (val <= 0) {
                      setPaymentStatus('VERESIYE');
                    } else {
                      setPaymentStatus('KISMI_ODENDI');
                      if (paymentMethod === 'ACIK_HESAP') setPaymentMethod('NAKIT');
                    }
                  }}
                  className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-right text-emerald-400 font-mono font-bold focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-between py-1.5 pt-2 border-t border-slate-800/80">
                <span className="text-slate-400">Kalan Borç (Cari):</span>
                <span className={`font-mono font-bold text-xs ${grandTotal - paidAmount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  ₺{Math.max(0, grandTotal - paidAmount).toLocaleString('tr-TR')}
                  {grandTotal - paidAmount > 0 ? ' (Müşteri Bakiyesine Borç Yazılır)' : ' (Borç Yok)'}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm transition"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition shadow-md shadow-blue-600/30 flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              İş Emrini Kaydet ve Başlat
            </button>
          </div>
        </form>
      </div>

      {/* Stock Selection Modal (Stoktan Parça Seç) */}
      {isStockPickerOpen && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Yedek Parça Deposundan Seç</h3>
                  <p className="text-[11px] text-slate-400">
                    İş emrine eklenecek parçayı seçin; kayıt tamamlandığında stoktan otomatik düşülecektir.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsStockPickerOpen(false);
                  setStockPickerRowIndex(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/40 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Parça adı, OEM parça kodu, marka veya raf ara..."
                  value={stockSearchQuery}
                  onChange={(e) => setStockSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                  autoFocus
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition shrink-0 ${
                    selectedCategory === 'ALL'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Tümü ({stockItems.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition shrink-0 ${
                      selectedCategory === cat
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Stock Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredStockItems.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Aramanıza uygun yedek parça bulunamadı.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {filteredStockItems.map((stk) => {
                    const isCritical = stk.quantity <= stk.minQuantity;
                    const isZero = stk.quantity <= 0;

                    return (
                      <div
                        key={stk.id}
                        className="bg-slate-950 p-3 rounded-xl border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-3 group"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                              {stk.code}
                            </span>
                            <span className="text-[10px] text-slate-400">{stk.brand}</span>
                            {stk.shelfLocation && (
                              <span className="text-[10px] text-slate-500">({stk.shelfLocation})</span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-white truncate" title={stk.name}>
                            {stk.name}
                          </p>
                          <div className="flex items-center gap-3 text-[11px]">
                            <span className="text-slate-400">
                              Depo: <strong className={isZero ? 'text-rose-400' : isCritical ? 'text-amber-400' : 'text-emerald-400 font-mono'}>{stk.quantity} adet</strong>
                            </span>
                            <span className="font-bold text-white font-mono">
                              ₺{stk.unitPrice.toLocaleString('tr-TR')}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSelectStockItem(stk)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition shrink-0 active:scale-95 shadow-sm shadow-emerald-600/20"
                        >
                          Seç & Ekle
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-800 bg-slate-950 flex justify-between items-center text-xs">
              <span className="text-slate-400">
                {filteredStockItems.length} parça listelendi
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsStockPickerOpen(false);
                  setStockPickerRowIndex(null);
                }}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

