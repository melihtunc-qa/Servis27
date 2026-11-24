import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Search, 
  Plus, 
  FileText, 
  Printer, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MessageCircle, 
  X,
  CreditCard,
  Tag,
  Edit2,
  Trash2,
  Package,
  Check,
  Save,
  DollarSign
} from 'lucide-react';
import { storage } from '../services/storage';
import { ServiceRecord, ServiceItem, ServiceStatus, PaymentStatus, Vehicle, Customer, StockItem, ItemType } from '../types';
import { useModal } from '../context/ModalContext';
import { openExternalUrl } from '../utils/desktop';

interface ServiceRecordsViewProps {
  onOpenNewService: () => void;
  selectedRecordForModal?: ServiceRecord | null;
  onCloseDetailModal?: () => void;
}

export const ServiceRecordsView: React.FC<ServiceRecordsViewProps> = ({
  onOpenNewService,
  selectedRecordForModal,
  onCloseDetailModal,
}) => {
  const { confirm, alert } = useModal();
  const [records, setRecords] = useState<ServiceRecord[]>(() => storage.getServiceRecords());
  const [vehicles] = useState<Vehicle[]>(() => storage.getVehicles());
  const [customers] = useState<Customer[]>(() => storage.getCustomers());
  const [stockItems, setStockItems] = useState<StockItem[]>(() => storage.getStockItems());
  const [activeTab, setActiveTab] = useState<'ALL' | ServiceStatus>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeRecord, setActiveRecord] = useState<ServiceRecord | null>(selectedRecordForModal || null);
  const [printMode, setPrintMode] = useState<'A4' | 'THERMAL' | null>(null);

  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [editEntryKm, setEditEntryKm] = useState(0);
  const [editStatus, setEditStatus] = useState<ServiceStatus>('KABUL_EDILDI');
  const [editComplaint, setEditComplaint] = useState('');
  const [editDiagnosis, setEditDiagnosis] = useState('');
  const [editTechnicianNotes, setEditTechnicianNotes] = useState('');
  const [editDiscount, setEditDiscount] = useState(0);
  const [editPaidAmount, setEditPaidAmount] = useState(0);
  const [editPaymentStatus, setEditPaymentStatus] = useState<PaymentStatus>('ODENDI');
  const [editPaymentMethod, setEditPaymentMethod] = useState<'NAKIT' | 'KREDI_KARTI' | 'HAVALE' | 'ACIK_HESAP'>('NAKIT');
  const [editItems, setEditItems] = useState<Array<{
    id: string;
    serviceRecordId: string;
    itemType: ItemType;
    name: string;
    quantity: number;
    unitPrice: number;
    costPrice: number;
    totalPrice: number;
    stockItemId?: string;
    warrantyMonths?: number;
  }>>([]);

  // Stock Picker States
  const [isStockPickerOpen, setIsStockPickerOpen] = useState(false);
  const [stockSearchQuery, setStockSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [stockPickerRowIndex, setStockPickerRowIndex] = useState<number | null>(null);

  const categories = Array.from(new Set(stockItems.map(s => s.category).filter(Boolean)));

  const refreshRecords = () => {
    setRecords(storage.getServiceRecords());
    setStockItems(storage.getStockItems());
  };

  useEffect(() => {
    return storage.subscribe(() => {
      refreshRecords();
    });
  }, []);

  useEffect(() => {
    if (selectedRecordForModal) {
      setActiveRecord(selectedRecordForModal);
      setIsEditing(false);
    }
  }, [selectedRecordForModal]);

  const getVehicle = (vehicleId: string) => vehicles.find(v => v.id === vehicleId);
  const getCustomer = (customerId: string) => customers.find(c => c.id === customerId);

  const filteredRecords = records.filter(r => {
    const vehicle = getVehicle(r.vehicleId);
    const customer = getCustomer(r.customerId);
    const search = searchTerm.toLowerCase();

    const matchesSearch = 
      (vehicle && vehicle.plate.toLowerCase().includes(search)) ||
      (customer && customer.fullName.toLowerCase().includes(search)) ||
      r.complaint.toLowerCase().includes(search);

    const matchesTab = activeTab === 'ALL' || r.status === activeTab;

    return matchesSearch && matchesTab;
  });

  const handleUpdateStatus = (record: ServiceRecord, newStatus: ServiceStatus) => {
    const updated = { ...record, status: newStatus };
    if (newStatus === 'TESLIM_EDILDI') {
      if (!updated.exitDate) updated.exitDate = new Date().toISOString();
    } else {
      delete updated.exitDate;
    }
    storage.saveServiceRecord(updated);
    refreshRecords();
    if (activeRecord?.id === record.id) {
      setActiveRecord(updated);
    }
  };

  const handleUpdatePayment = (record: ServiceRecord, newPaymentStatus: PaymentStatus, paidAmount: number) => {
    const updated = { 
      ...record, 
      paymentStatus: newPaymentStatus, 
      paidAmount: paidAmount 
    };
    storage.saveServiceRecord(updated);
    refreshRecords();
    if (activeRecord?.id === record.id) {
      setActiveRecord(updated);
    }
  };

  const handleDeleteRecord = async (record: ServiceRecord) => {
    const vehicle = getVehicle(record.vehicleId);
    const plate = vehicle?.plate || 'Bu araca ait';
    const isConfirmed = await confirm({
      title: 'İş Emrini Sil',
      message: `${plate} plakalı #${record.id.toUpperCase()} numaralı iş emrini silmek istediğinize emin misiniz?\n\nNot: Bu iş emrinde kullanılan yedek parçalar otomatik olarak depoya/stoka iade edilecek, müşteri cari borcu ve kasa tahsilat kayıtları güncellenecektir.`,
      confirmText: 'İş Emrini Sil',
      cancelText: 'Vazgeç',
      variant: 'danger',
    });
    if (isConfirmed) {
      storage.deleteServiceRecord(record.id);
      setActiveRecord(null);
      setIsEditing(false);
      if (onCloseDetailModal) onCloseDetailModal();
      refreshRecords();
    }
  };

  const handleStartEdit = (record: ServiceRecord) => {
    setEditEntryKm(record.entryKm);
    setEditStatus(record.status);
    setEditComplaint(record.complaint);
    setEditDiagnosis(record.diagnosis || '');
    setEditTechnicianNotes(record.technicianNotes || '');
    setEditDiscount(record.discount || 0);
    setEditPaidAmount(record.paidAmount || 0);
    setEditPaymentStatus(record.paymentStatus);
    setEditPaymentMethod(record.paymentMethod || 'NAKIT');
    setEditItems(
      record.items ? record.items.map(it => ({ ...it })) : []
    );
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setIsStockPickerOpen(false);
    setStockPickerRowIndex(null);
  };

  const handleAddItem = (type: ItemType) => {
    setEditItems(prev => [
      ...prev,
      {
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        serviceRecordId: activeRecord?.id || '',
        itemType: type,
        name: '',
        quantity: 1,
        unitPrice: 0,
        costPrice: 0,
        totalPrice: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setEditItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    setEditItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleUnlinkStock = (index: number) => {
    setEditItems(prev => {
      const updated = [...prev];
      const item = { ...updated[index] };
      delete item.stockItemId;
      updated[index] = item;
      return updated;
    });
  };

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
    if (stockPickerRowIndex !== null && editItems[stockPickerRowIndex]) {
      const updated = [...editItems];
      updated[stockPickerRowIndex] = {
        ...updated[stockPickerRowIndex],
        itemType: 'PARCA',
        name: stockItem.name,
        unitPrice: stockItem.unitPrice,
        costPrice: stockItem.unitCost,
        stockItemId: stockItem.id,
        quantity: updated[stockPickerRowIndex].quantity || 1,
      };
      setEditItems(updated);
      setStockPickerRowIndex(null);
    } else {
      setEditItems(prev => [
        ...prev,
        {
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          serviceRecordId: activeRecord?.id || '',
          itemType: 'PARCA',
          name: stockItem.name,
          quantity: 1,
          unitPrice: stockItem.unitPrice,
          costPrice: stockItem.unitCost,
          totalPrice: stockItem.unitPrice,
          stockItemId: stockItem.id,
        },
      ]);
    }
    setIsStockPickerOpen(false);
  };

  // Edit Calculations
  const editPartsTotal = editItems
    .filter(i => i.itemType === 'PARCA')
    .reduce((sum, i) => sum + (Number(i.quantity) * Number(i.unitPrice) || 0), 0);

  const editLaborTotal = editItems
    .filter(i => i.itemType === 'ISCILIK')
    .reduce((sum, i) => sum + (Number(i.quantity) * Number(i.unitPrice) || 0), 0);

  const editGrandTotal = Math.max(0, editPartsTotal + editLaborTotal - (Number(editDiscount) || 0));

  const handleSaveEdit = () => {
    if (!activeRecord) return;
    if (!editComplaint.trim()) {
      alert({
        title: 'Müşteri Talebi Eksik',
        message: 'Lütfen müşteri talebini / şikayetini giriniz.',
        variant: 'warning',
      });
      return;
    }

    const calculatedPartsTotal = editPartsTotal;
    const calculatedLaborTotal = editLaborTotal;
    const discountNum = Math.max(0, Number(editDiscount) || 0);
    const calculatedGrandTotal = editGrandTotal;
    const paidAmountNum = Math.max(0, Number(editPaidAmount) || 0);

    let finalPaymentStatus: PaymentStatus = editPaymentStatus;
    if (paidAmountNum >= calculatedGrandTotal && calculatedGrandTotal > 0) {
      finalPaymentStatus = 'ODENDI';
    } else if (paidAmountNum === 0) {
      finalPaymentStatus = 'BEKLIYOR';
    } else {
      finalPaymentStatus = 'KISMI_ODENDI';
    }

    const formattedItems: ServiceItem[] = editItems.map((it, idx) => ({
      id: it.id || `item-${Date.now()}-${idx}`,
      serviceRecordId: activeRecord.id,
      itemType: it.itemType,
      name: it.name.trim() || (it.itemType === 'PARCA' ? 'Yedek Parça' : 'İşçilik'),
      quantity: Math.max(1, Number(it.quantity) || 1),
      unitPrice: Math.max(0, Number(it.unitPrice) || 0),
      costPrice: Math.max(0, Number(it.costPrice) || 0),
      totalPrice: (Math.max(1, Number(it.quantity) || 1)) * (Math.max(0, Number(it.unitPrice) || 0)),
      stockItemId: it.stockItemId,
      warrantyMonths: it.warrantyMonths,
    }));

    const updatedRecord: ServiceRecord = {
      ...activeRecord,
      entryKm: Number(editEntryKm) || activeRecord.entryKm,
      complaint: editComplaint.trim(),
      diagnosis: editDiagnosis.trim() || undefined,
      technicianNotes: editTechnicianNotes.trim() || undefined,
      status: editStatus,
      exitDate: editStatus === 'TESLIM_EDILDI' 
        ? (activeRecord.exitDate || new Date().toISOString()) 
        : undefined,
      items: formattedItems,
      partsTotal: calculatedPartsTotal,
      laborTotal: calculatedLaborTotal,
      discount: discountNum,
      grandTotal: calculatedGrandTotal,
      paidAmount: paidAmountNum,
      paymentStatus: finalPaymentStatus,
      paymentMethod: editPaymentMethod,
    };

    storage.saveServiceRecord(updatedRecord);
    refreshRecords();
    setActiveRecord(updatedRecord);
    setIsEditing(false);
  };

  const handleSendReadyWhatsApp = (record: ServiceRecord) => {
    const customer = getCustomer(record.customerId);
    const vehicle = getVehicle(record.vehicleId);
    const settings = storage.getSettings();
    if (!customer) return;

    const remainingDebt = Math.max(0, record.grandTotal - (record.paidAmount || 0));
    let msg = `Merhaba ${customer.fullName} Bey/Hanım, ${settings.shopName} servisimizden ulaşıyoruz. `;
    msg += `${vehicle?.plate} plakalı aracınızın bakım/onarım işlemleri tamamlanmıştır. Aracınızı teslim alabilirsiniz.\n`;
    msg += `Toplam Tutar: ₺${record.grandTotal.toLocaleString('tr-TR')}`;
    if (remainingDebt > 0) {
      msg += ` (Kalan: ₺${remainingDebt.toLocaleString('tr-TR')})`;
    }
    msg += `\nİyi günler dileriz.`;

    const url = storage.generateWhatsAppLink(customer.phone, msg);
    void openExternalUrl(url);
  };

  const triggerPrint = (mode: 'A4' | 'THERMAL') => {
    setPrintMode(mode);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const settings = storage.getSettings();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Printable Area (Visible only when printing) */}
      {printMode && activeRecord && (
        <div className="print-only p-8 text-black bg-white">
          {printMode === 'A4' ? (
            /* A4 Servis Fişi / Teslim Belgesi */
            <div className="space-y-6 max-w-3xl mx-auto text-sm">
              <div className="border-b-2 border-black pb-4 flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold uppercase">{settings.shopName}</h1>
                  <p className="text-xs">{settings.address} - {settings.city}</p>
                  <p className="text-xs">Tel: {settings.phone}</p>
                  <p className="text-xs">Vergi Dairesi / No: {settings.taxOffice} - {settings.taxNumber}</p>
                </div>
                <div className="text-right">
                  <h2 className="text-lg font-bold">SERVİS & BAKIM İŞ EMRİ</h2>
                  <p className="font-mono text-xs">No: #{activeRecord.id.toUpperCase()}</p>
                  <p className="text-xs">Tarih: {new Date(activeRecord.entryDate).toLocaleDateString('tr-TR')}</p>
                </div>
              </div>

              {/* Müşteri ve Araç Bilgileri */}
              <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg bg-gray-50 text-xs">
                <div>
                  <h4 className="font-bold border-b pb-1 mb-2">MÜŞTERİ BİLGİLERİ</h4>
                  <p><strong>Ad Soyad:</strong> {getCustomer(activeRecord.customerId)?.fullName}</p>
                  <p><strong>Telefon:</strong> {getCustomer(activeRecord.customerId)?.phone}</p>
                  <p><strong>Adres:</strong> {getCustomer(activeRecord.customerId)?.address || '-'}</p>
                </div>
                <div>
                  <h4 className="font-bold border-b pb-1 mb-2">ARAÇ BİLGİLERİ</h4>
                  <p><strong>Plaka:</strong> {getVehicle(activeRecord.vehicleId)?.plate}</p>
                  <p><strong>Marka/Model:</strong> {getVehicle(activeRecord.vehicleId)?.brand} {getVehicle(activeRecord.vehicleId)?.model} ({getVehicle(activeRecord.vehicleId)?.year})</p>
                  <p><strong>Servis KM:</strong> {activeRecord.entryKm.toLocaleString('tr-TR')} KM</p>
                  <p><strong>Şasi No:</strong> {getVehicle(activeRecord.vehicleId)?.vin || '-'}</p>
                </div>
              </div>

              {/* Şikayet ve Teşhis */}
              <div className="text-xs space-y-1">
                <p><strong>Müşteri Talebi / Şikayet:</strong> {activeRecord.complaint}</p>
                {activeRecord.diagnosis && <p><strong>Yapılan Tespit:</strong> {activeRecord.diagnosis}</p>}
              </div>

              {/* Kalemler Tablosu */}
              <table className="w-full text-left text-xs border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2">Tür</th>
                    <th className="border p-2">Yapılan İşlem / Değişen Parça</th>
                    <th className="border p-2 text-center">Miktar</th>
                    <th className="border p-2 text-right">Birim Fiyat</th>
                    <th className="border p-2 text-right">Toplam</th>
                  </tr>
                </thead>
                <tbody>
                  {activeRecord.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="border p-2">{item.itemType === 'PARCA' ? 'Parça' : 'İşçilik'}</td>
                      <td className="border p-2 font-medium">{item.name}</td>
                      <td className="border p-2 text-center">{item.quantity}</td>
                      <td className="border p-2 text-right">₺{item.unitPrice.toLocaleString('tr-TR')}</td>
                      <td className="border p-2 text-right">₺{item.totalPrice.toLocaleString('tr-TR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Tutarlar Özeti */}
              <div className="flex justify-between items-start pt-2">
                <div className="text-xs max-w-sm text-gray-600">
                  <p className="font-semibold text-black">Garanti & Koşullar:</p>
                  <p>{settings.footerNote}</p>
                </div>
                <div className="w-64 space-y-1 text-xs">
                  <div className="flex justify-between py-1 border-b">
                    <span>Yedek Parça:</span>
                    <span>₺{activeRecord.partsTotal.toLocaleString('tr-TR')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span>İşçilik:</span>
                    <span>₺{activeRecord.laborTotal.toLocaleString('tr-TR')}</span>
                  </div>
                  {activeRecord.discount > 0 && (
                    <div className="flex justify-between py-1 border-b text-red-600">
                      <span>İskonto / İndirim:</span>
                      <span>-₺{activeRecord.discount.toLocaleString('tr-TR')}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 font-bold text-base border-b-2 border-black">
                    <span>Genel Toplam:</span>
                    <span>₺{activeRecord.grandTotal.toLocaleString('tr-TR')}</span>
                  </div>
                  <div className="flex justify-between py-1 font-semibold">
                    <span>Ödenen:</span>
                    <span>₺{activeRecord.paidAmount.toLocaleString('tr-TR')}</span>
                  </div>
                </div>
              </div>

              {/* İmza Alanları */}
              <div className="grid grid-cols-2 gap-8 pt-12 text-center text-xs">
                <div className="border-t border-black pt-2">
                  <p className="font-bold">Teslim Eden (Servis Yetkilisi)</p>
                  <p className="text-gray-500 mt-8">İmza / Kaşe</p>
                </div>
                <div className="border-t border-black pt-2">
                  <p className="font-bold">Teslim Alan (Müşteri)</p>
                  <p className="text-gray-500 mt-8">Araç eksiksiz teslim alınmıştır. İmza</p>
                </div>
              </div>
            </div>
          ) : (
            /* 80mm Termal POS Fişi */
            <div className="w-72 font-mono text-xs mx-auto space-y-3">
              <div className="text-center border-b border-black pb-2">
                <h2 className="font-bold text-sm uppercase">{settings.shopName}</h2>
                <p className="text-[10px]">{settings.phone}</p>
                <p className="text-[10px]">{new Date().toLocaleString('tr-TR')}</p>
              </div>

              <div className="space-y-0.5">
                <p><strong>PLAKA:</strong> {getVehicle(activeRecord.vehicleId)?.plate}</p>
                <p className="break-words"><strong>ARAÇ:</strong> {getVehicle(activeRecord.vehicleId)?.brand} {getVehicle(activeRecord.vehicleId)?.model}</p>
                <p><strong>KM:</strong> {activeRecord.entryKm.toLocaleString('tr-TR')} KM</p>
                <p className="break-words"><strong>MÜŞTERİ:</strong> {getCustomer(activeRecord.customerId)?.fullName}</p>
              </div>

              <div className="border-t border-b border-black py-2 space-y-1.5">
                {activeRecord.items.map((it, i) => (
                  <div key={i} className="flex justify-between items-start gap-2">
                    <span className="flex-1 break-words leading-tight">{it.quantity}x {it.name}</span>
                    <span className="shrink-0 font-medium text-right">₺{it.totalPrice.toLocaleString('tr-TR')}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-right">
                {activeRecord.discount > 0 && (
                  <p className="text-[11px]">İSKONTO: -₺{activeRecord.discount.toLocaleString('tr-TR')}</p>
                )}
                <p className="font-bold text-sm">TOPLAM: ₺{activeRecord.grandTotal.toLocaleString('tr-TR')}</p>
                <p>ÖDENEN: ₺{activeRecord.paidAmount.toLocaleString('tr-TR')}</p>
                <p>KALAN: ₺{Math.max(0, activeRecord.grandTotal - activeRecord.paidAmount).toLocaleString('tr-TR')}</p>
              </div>

              <div className="border-t border-black pt-2 text-center text-[10px]">
                <p>{settings.footerNote}</p>
                <p className="mt-2 font-bold">Bizi tercih ettiğiniz için teşekkürler!</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Screen View */}
      <div className="no-print space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">İş Emirleri & Servis Kayıtları</h2>
            <p className="text-slate-400 text-sm">Araç kabul, onarım süreçleri, parça dökümleri ve faturalandırma</p>
          </div>
          <button
            onClick={onOpenNewService}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition shadow-md shadow-blue-600/20 active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni İş Emri Aç</span>
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          {[
            { id: 'ALL', label: 'Tüm Kayıtlar' },
            { id: 'KABUL_EDILDI', label: 'Kabul Edildi' },
            { id: 'ISLEMDE', label: 'İşlemde & Liftte Olanlar' },
            { id: 'PARCA_BEKLENIYOR', label: 'Parça Bekleyen' },
            { id: 'TAMAMLANDI', label: 'Tamamlandı' },
            { id: 'TESLIM_EDILDI', label: 'Teslim Edildi' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Plaka, müşteri adı veya yapılan işlem ile filtrele..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Service Records Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/70 text-slate-400 text-xs uppercase font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Tarih</th>
                  <th className="py-3.5 px-4">Plaka / Araç</th>
                  <th className="py-3.5 px-4">Müşteri</th>
                  <th className="py-3.5 px-4">KM</th>
                  <th className="py-3.5 px-4">Şikayet / İşlem</th>
                  <th className="py-3.5 px-4 min-w-[145px] whitespace-nowrap">Durum</th>
                  <th className="py-3.5 px-4">Tutar / Ödeme</th>
                  <th className="py-3.5 px-4 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      Kayıt bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((rec) => {
                    const vehicle = getVehicle(rec.vehicleId);
                    const customer = getCustomer(rec.customerId);
                    const isUnpaid = rec.grandTotal > rec.paidAmount;

                    return (
                      <tr 
                        key={rec.id} 
                        className="hover:bg-slate-850 cursor-pointer transition"
                        onClick={() => setActiveRecord(rec)}
                      >
                        <td className="py-3.5 px-4 text-xs text-slate-400 whitespace-nowrap font-medium">
                          {new Date(rec.entryDate).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-blue-400 block">
                            {vehicle?.plate || 'Bilinmiyor'}
                          </span>
                          <span className="text-xs text-slate-400 block">
                            {vehicle?.brand} {vehicle?.model}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-medium text-slate-200 block">{customer?.fullName}</span>
                          <span className="text-xs text-slate-500 font-mono">{customer?.phone}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-300">
                          {rec.entryKm.toLocaleString('tr-TR')} KM
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-300 max-w-xs truncate">
                          {rec.complaint}
                        </td>
                        <td className="py-3.5 px-4 min-w-[145px] whitespace-nowrap">
                          <span className={`px-3 py-1 text-[11px] font-semibold rounded-full whitespace-nowrap inline-block ${
                            rec.status === 'KABUL_EDILDI' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                            rec.status === 'ISLEMDE' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            rec.status === 'PARCA_BEKLENIYOR' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                            rec.status === 'TAMAMLANDI' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            rec.status === 'TESLIM_EDILDI' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            'bg-slate-700 text-slate-300'
                          }`}>
                            {rec.status === 'KABUL_EDILDI' ? 'Kabul Edildi' :
                             rec.status === 'ISLEMDE' ? 'İşlemde (Liftte)' :
                             rec.status === 'PARCA_BEKLENIYOR' ? 'Parça Bekleniyor' :
                             rec.status === 'TAMAMLANDI' ? 'Tamamlandı' :
                             rec.status === 'TESLIM_EDILDI' ? 'Teslim Edildi' : rec.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-100">
                            ₺{rec.grandTotal.toLocaleString('tr-TR')}
                          </div>
                          <span className={`text-[10px] font-medium block ${
                            isUnpaid ? 'text-rose-400' : 'text-emerald-400'
                          }`}>
                            {isUnpaid ? `Kalan: ₺${(rec.grandTotal - rec.paidAmount).toLocaleString('tr-TR')}` : 'Ödendi'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                setActiveRecord(rec);
                                setIsEditing(false);
                              }}
                              className="p-1.5 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg transition"
                              title="İş Emri Detayını Aç"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setActiveRecord(rec);
                                handleStartEdit(rec);
                              }}
                              className="p-1.5 bg-slate-800 hover:bg-amber-600 text-slate-300 hover:text-white rounded-lg transition"
                              title="İş Emrini Düzenle"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(rec)}
                              className="p-1.5 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white rounded-lg transition"
                              title="İş Emrini Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail / Invoice Modal */}
      {activeRecord && (
        <div className="no-print fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isEditing ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {isEditing ? <Edit2 className="w-5 h-5" /> : <Wrench className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-400 text-base">
                      {getVehicle(activeRecord.vehicleId)?.plate}
                    </span>
                    <span className="text-xs text-slate-400">
                      • {new Date(activeRecord.entryDate).toLocaleDateString('tr-TR')}
                    </span>
                    {isEditing && (
                      <span className="text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                        Düzenleme Modu
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-white text-xs mt-0.5">
                    {getCustomer(activeRecord.customerId)?.fullName} ({getCustomer(activeRecord.customerId)?.phone}) • <span className="font-mono text-slate-400">#{activeRecord.id.toUpperCase()}</span>
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isEditing && (
                  <>
                    <button
                      onClick={() => handleStartEdit(activeRecord)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-blue-600/20 active:scale-98"
                      title="Bu iş emrini düzenle / güncelle"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>İş Emrini Düzenle</span>
                    </button>
                    <button
                      onClick={() => handleDeleteRecord(activeRecord)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 hover:border-rose-500 rounded-xl text-xs font-semibold transition shadow-md shadow-rose-600/20 active:scale-98"
                      title="Bu iş emrini sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>İş Emrini Sil</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    setActiveRecord(null);
                    setIsEditing(false);
                    if (onCloseDetailModal) onCloseDetailModal();
                  }}
                  className="text-slate-400 hover:text-white p-1 rounded-lg ml-1"
                  title="Kapat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content: EDIT MODE vs VIEW MODE */}
            {isEditing ? (
              <div className="p-6 overflow-y-auto space-y-5 flex-1 text-sm">
                {/* 1. Status & Entry KM */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                      İş Emri Durumu *
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as ServiceStatus)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-medium"
                    >
                      <option value="KABUL_EDILDI">Kabul Edildi</option>
                      <option value="ISLEMDE">İşlemde (Liftte)</option>
                      <option value="PARCA_BEKLENIYOR">Parça Bekleniyor</option>
                      <option value="TAMAMLANDI">Tamamlandı</option>
                      <option value="TESLIM_EDILDI">Teslim Edildi</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                      Araç Giriş KM *
                    </label>
                    <input
                      type="number"
                      value={editEntryKm}
                      onChange={(e) => setEditEntryKm(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* 2. Complaint & Diagnosis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                      Müşteri Şikayeti / Talep *
                    </label>
                    <textarea
                      rows={3}
                      value={editComplaint}
                      onChange={(e) => setEditComplaint(e.target.value)}
                      placeholder="Müşterinin belirttiği şikayet..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                      Usta Teşhisi / Açıklama
                    </label>
                    <textarea
                      rows={3}
                      value={editDiagnosis}
                      onChange={(e) => setEditDiagnosis(e.target.value)}
                      placeholder="Yapılan tespit veya arıza nedeni..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    Atölye / Teknisyen Notları
                  </label>
                  <input
                    type="text"
                    value={editTechnicianNotes}
                    onChange={(e) => setEditTechnicianNotes(e.target.value)}
                    placeholder="Ekstra montaj, usta notları veya sonraki işlem önerisi..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* 3. Items Table */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Yapılan İşlemler ve Takılan Parçalar ({editItems.length})
                    </h4>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setStockPickerRowIndex(null);
                          setIsStockPickerOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 rounded-xl text-xs font-medium transition"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>Depodan Parça Seç</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddItem('PARCA')}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Parça</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddItem('ISCILIK')}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ İşçilik</span>
                      </button>
                    </div>
                  </div>

                  <div className="border border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 font-semibold">
                        <tr>
                          <th className="p-2.5 w-24">Tür</th>
                          <th className="p-2.5">Açıklama / Kalem</th>
                          <th className="p-2.5 w-20 text-center">Adet</th>
                          <th className="p-2.5 w-28 text-right">Birim (₺)</th>
                          <th className="p-2.5 w-28 text-right">Toplam (₺)</th>
                          <th className="p-2.5 w-10 text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {editItems.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-6 text-center text-slate-500">
                              Henüz işlem veya parça kalemi eklenmemiş. Yukarıdaki butonlardan ekleyebilirsiniz.
                            </td>
                          </tr>
                        ) : (
                          editItems.map((it, idx) => (
                            <tr key={it.id || idx} className="hover:bg-slate-800/30">
                              <td className="p-2.5">
                                <select
                                  value={it.itemType}
                                  onChange={(e) => handleItemChange(idx, 'itemType', e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1 text-[11px] text-slate-200 focus:outline-none focus:border-blue-500"
                                >
                                  <option value="PARCA">PARÇA</option>
                                  <option value="ISCILIK">İŞÇİLİK</option>
                                </select>
                              </td>
                              <td className="p-2.5">
                                <div className="space-y-1">
                                  <input
                                    type="text"
                                    value={it.name}
                                    onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                                    placeholder={it.itemType === 'PARCA' ? 'Parça adı...' : 'İşçilik açıklaması...'}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                                  />
                                  {it.stockItemId && (
                                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                                      <span>📦 Stoktan Düşer</span>
                                      <button
                                        type="button"
                                        onClick={() => handleUnlinkStock(idx)}
                                        className="text-slate-500 hover:text-rose-400 text-[10px] underline ml-1"
                                        title="Depo stok bağlantısını kopar"
                                      >
                                        (Stok Dışı Ekle)
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="p-2.5 text-center">
                                <input
                                  type="number"
                                  min="1"
                                  value={it.quantity}
                                  onChange={(e) => handleItemChange(idx, 'quantity', Math.max(1, Number(e.target.value) || 1))}
                                  className="w-16 bg-slate-950 border border-slate-800 rounded-lg p-1 text-center font-mono text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                                />
                              </td>
                              <td className="p-2.5 text-right">
                                <input
                                  type="number"
                                  min="0"
                                  value={it.unitPrice}
                                  onChange={(e) => handleItemChange(idx, 'unitPrice', Math.max(0, Number(e.target.value) || 0))}
                                  className="w-24 bg-slate-950 border border-slate-800 rounded-lg p-1 text-right font-mono text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                                />
                              </td>
                              <td className="p-2.5 text-right font-mono font-bold text-slate-200">
                                ₺{((Number(it.quantity) || 1) * (Number(it.unitPrice) || 0)).toLocaleString('tr-TR')}
                              </td>
                              <td className="p-2.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(idx)}
                                  className="p-1 text-slate-500 hover:text-rose-400 rounded transition"
                                  title="Kalemi Sil"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4. Financials & Payment Integration */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Summary */}
                  <div className="space-y-2 text-xs">
                    <span className="font-semibold text-slate-400 uppercase tracking-wider block border-b border-slate-800 pb-1">
                      Hesap Özeti
                    </span>
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Yedek Parça Toplamı:</span>
                      <span className="font-mono">₺{editPartsTotal.toLocaleString('tr-TR')}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span>İşçilik Toplamı:</span>
                      <span className="font-mono">₺{editLaborTotal.toLocaleString('tr-TR')}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="text-rose-400">Uygulanan İskonto (₺):</span>
                      <input
                        type="number"
                        min="0"
                        value={editDiscount}
                        onChange={(e) => setEditDiscount(Math.max(0, Number(e.target.value) || 0))}
                        className="w-24 bg-slate-900 border border-slate-800 rounded-lg p-1 text-right font-mono text-xs text-rose-400 focus:outline-none focus:border-rose-500"
                      />
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                      <span className="font-bold text-white text-sm">Genel Toplam:</span>
                      <span className="text-xl font-bold font-mono text-emerald-400">
                        ₺{editGrandTotal.toLocaleString('tr-TR')}
                      </span>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="space-y-3 text-xs border-t md:border-t-0 md:border-l border-slate-800 md:pl-6">
                    <span className="font-semibold text-slate-400 uppercase tracking-wider block border-b border-slate-800 pb-1">
                      Ödeme & Tahsilat Bilgileri
                    </span>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-400 block mb-1">Ödeme Durumu</label>
                        <select
                          value={editPaymentStatus}
                          onChange={(e) => {
                            const newStatus = e.target.value as PaymentStatus;
                            setEditPaymentStatus(newStatus);
                            if (newStatus === 'ODENDI') {
                              setEditPaidAmount(editGrandTotal);
                            } else if (newStatus === 'BEKLIYOR') {
                              setEditPaidAmount(0);
                            }
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-medium"
                        >
                          <option value="ODENDI">Ödendi (Tamamı)</option>
                          <option value="KISMI_ODENDI">Kısmi Ödendi</option>
                          <option value="BEKLIYOR">Ödenmedi (Veresiye)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1">Ödeme Yolu</label>
                        <select
                          value={editPaymentMethod}
                          onChange={(e) => setEditPaymentMethod(e.target.value as any)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-medium"
                        >
                          <option value="NAKIT">Nakit Kasa</option>
                          <option value="KREDI_KARTI">Kredi Kartı / POS</option>
                          <option value="HAVALE">Havale / EFT</option>
                          <option value="ACIK_HESAP">Açık Hesap (Cari)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-slate-400">Alınan Tahsilat (₺)</label>
                        <span className={`text-[11px] font-medium ${
                          editGrandTotal > editPaidAmount ? 'text-rose-400' : 'text-emerald-400'
                        }`}>
                          {editGrandTotal > editPaidAmount
                            ? `Kalan Borç: ₺${(editGrandTotal - editPaidAmount).toLocaleString('tr-TR')}`
                            : 'Tamamı Tahsil Edildi'}
                        </span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        max={editGrandTotal}
                        value={editPaidAmount}
                        onChange={(e) => {
                          const val = Math.max(0, Number(e.target.value) || 0);
                          setEditPaidAmount(val);
                          if (val >= editGrandTotal && editGrandTotal > 0) {
                            setEditPaymentStatus('ODENDI');
                          } else if (val === 0) {
                            setEditPaymentStatus('BEKLIYOR');
                          } else {
                            setEditPaymentStatus('KISMI_ODENDI');
                          }
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
                {/* Quick Status Control */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase block mb-1">
                      İş Emri Durumu
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: 'KABUL_EDILDI', label: 'Kabul Edildi' },
                        { id: 'ISLEMDE', label: 'İşlemde (Liftte)' },
                        { id: 'PARCA_BEKLENIYOR', label: 'Parça Bekliyor' },
                        { id: 'TAMAMLANDI', label: 'Tamamlandı' },
                        { id: 'TESLIM_EDILDI', label: 'Teslim Edildi' },
                      ].map((st) => (
                        <button
                          key={st.id}
                          onClick={() => handleUpdateStatus(activeRecord, st.id as ServiceStatus)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                            activeRecord.status === st.id
                              ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/30'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleSendReadyWhatsApp(activeRecord)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium transition shadow-md shadow-emerald-600/20"
                  >
                    <MessageCircle className="w-4 h-4" />
                    "Aracınız Hazır" WhatsApp Mesajı
                  </button>
                </div>

                {/* Complaint & Diagnosis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                    <span className="text-slate-500 font-semibold uppercase block mb-1">Müşteri Şikayeti / Talep:</span>
                    <p className="text-slate-200">{activeRecord.complaint}</p>
                  </div>
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                    <span className="text-slate-500 font-semibold uppercase block mb-1">Usta Teşhisi / Açıklama:</span>
                    <p className="text-slate-200">{activeRecord.diagnosis || 'Henüz eklenmemiş'}</p>
                  </div>
                </div>

                {activeRecord.technicianNotes && (
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 text-xs">
                    <span className="text-slate-500 font-semibold uppercase block mb-1">Atölye / Teknisyen Notları:</span>
                    <p className="text-slate-300 italic">{activeRecord.technicianNotes}</p>
                  </div>
                )}

                {/* Items Breakdown */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Yapılan İşlemler ve Takılan Parçalar ({activeRecord.items.length})
                  </h4>
                  <div className="border border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 font-semibold">
                        <tr>
                          <th className="p-2.5">Tür</th>
                          <th className="p-2.5">Açıklama</th>
                          <th className="p-2.5 text-center">Adet</th>
                          <th className="p-2.5 text-right">Birim</th>
                          <th className="p-2.5 text-right">Toplam</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {activeRecord.items.map((it) => (
                          <tr key={it.id} className="hover:bg-slate-800/30">
                            <td className="p-2.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                it.itemType === 'PARCA' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                              }`}>
                                {it.itemType}
                              </span>
                            </td>
                            <td className="p-2.5 font-medium text-slate-200">
                              <div className="flex items-center gap-2">
                                <span>{it.name}</span>
                                {it.stockItemId && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" title="Yedek parça deposundan dinamik düşüldü">
                                    📦 Depo
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-2.5 text-center font-mono">{it.quantity}</td>
                            <td className="p-2.5 text-right font-mono">₺{it.unitPrice.toLocaleString('tr-TR')}</td>
                            <td className="p-2.5 text-right font-mono font-bold text-slate-100">₺{it.totalPrice.toLocaleString('tr-TR')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals & Payment Status */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Yedek Parça:</span>
                      <span className="font-mono text-slate-200">₺{activeRecord.partsTotal.toLocaleString('tr-TR')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">İşçilik:</span>
                      <span className="font-mono text-slate-200">₺{activeRecord.laborTotal.toLocaleString('tr-TR')}</span>
                    </div>
                    {activeRecord.discount > 0 && (
                      <div className="flex items-center gap-2 text-rose-400">
                        <span>İndirim:</span>
                        <span className="font-mono">-₺{activeRecord.discount.toLocaleString('tr-TR')}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-right space-y-1">
                    <span className="text-xs text-slate-400 uppercase tracking-wider block">Genel Toplam</span>
                    <span className="text-2xl font-bold text-emerald-400 font-mono">
                      ₺{activeRecord.grandTotal.toLocaleString('tr-TR')}
                    </span>
                    <div className="text-xs">
                      {activeRecord.grandTotal > activeRecord.paidAmount ? (
                        <span className="text-rose-400 font-semibold">
                          Kalan Borç: ₺{(activeRecord.grandTotal - activeRecord.paidAmount).toLocaleString('tr-TR')}
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-semibold">Tamamı Tahsil Edildi</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            {isEditing ? (
              <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-600/30"
                >
                  <Save className="w-4 h-4" />
                  <span>Değişiklikleri Kaydet</span>
                </button>
              </div>
            ) : (
              <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => triggerPrint('A4')}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition"
                  >
                    <Printer className="w-4 h-4 text-blue-400" />
                    A4 Servis Formu Yazdır
                  </button>
                  <button
                    onClick={() => triggerPrint('THERMAL')}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition"
                  >
                    <FileText className="w-4 h-4 text-amber-400" />
                    80mm Termal POS Fişi
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartEdit(activeRecord)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 rounded-xl text-xs font-medium transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    İş Emrini Düzenle
                  </button>
                  <button
                    onClick={() => handleDeleteRecord(activeRecord)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 rounded-xl text-xs font-medium transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    İş Emrini Sil
                  </button>
                  <button
                    onClick={() => {
                      setActiveRecord(null);
                      setIsEditing(false);
                      if (onCloseDetailModal) onCloseDetailModal();
                    }}
                    className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition ml-1"
                  >
                    Kapat
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stock Picker Modal */}
      {isStockPickerOpen && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Yedek Parça Deposundan Seç</h3>
                  <p className="text-[11px] text-slate-400">Depodaki mevcut stoktan iş emrine parça aktarın</p>
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

            <div className="p-4 border-b border-slate-800 bg-slate-950/30 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Parça kodu, adı, markası veya raf no ile ara..."
                  value={stockSearchQuery}
                  onChange={(e) => setStockSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  autoFocus
                />
              </div>

              {categories.length > 0 && (
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('ALL')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                      selectedCategory === 'ALL'
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                    }`}
                  >
                    Tümü
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                        selectedCategory === cat
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {filteredStockItems.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  Aramanıza uygun yedek parça bulunamadı.
                </div>
              ) : (
                filteredStockItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectStockItem(item)}
                    className="p-3 bg-slate-950/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition group"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {item.code}
                        </span>
                        <span className="font-medium text-slate-200 text-xs group-hover:text-white truncate">
                          {item.name}
                        </span>
                        {item.shelfLocation && (
                          <span className="text-[10px] text-slate-500">
                            (Raf: {item.shelfLocation})
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3">
                        <span>Marka: <strong className="text-slate-300">{item.brand}</strong></span>
                        <span>Stok: <strong className={item.quantity <= item.minQuantity ? 'text-rose-400' : 'text-emerald-400'}>{item.quantity} Adet</strong></span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold text-emerald-400 text-sm">
                        ₺{item.unitPrice.toLocaleString('tr-TR')}
                      </div>
                      <span className="text-[10px] text-blue-400 group-hover:underline">Seç →</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

