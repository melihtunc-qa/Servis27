import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Car, 
  MessageCircle, 
  X, 
  CreditCard, 
  Edit2, 
  History, 
  ChevronRight 
} from 'lucide-react';
import { storage } from '../services/storage';
import { Customer, Vehicle, ServiceRecord } from '../types';
import { useModal } from '../context/ModalContext';
import { openExternalUrl } from '../utils/desktop';

interface CustomersViewProps {
  onSelectVehicle: (vehicle: Vehicle) => void;
  onOpenServiceDetail?: (record: ServiceRecord) => void;
  selectedCustomerForDetail?: Customer | null;
  onClearSelectedCustomer?: () => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  onSelectVehicle,
  onOpenServiceDetail,
  selectedCustomerForDetail,
  onClearSelectedCustomer,
}) => {
  const { alert } = useModal();
  const [customers, setCustomers] = useState<Customer[]>(() => storage.getCustomers());
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => storage.getVehicles());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOnlyDebtors, setFilterOnlyDebtors] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [activeCustomerDetail, setActiveCustomerDetail] = useState<Customer | null>(selectedCustomerForDetail || null);

  useEffect(() => {
    return storage.subscribe(() => {
      const updatedCustomers = storage.getCustomers();
      setCustomers(updatedCustomers);
      setVehicles(storage.getVehicles());
      setActiveCustomerDetail(prev => prev ? updatedCustomers.find(c => c.id === prev.id) || null : null);
    });
  }, []);

  // Sync external selected customer (e.g. from VehiclesView)
  useEffect(() => {
    if (selectedCustomerForDetail) {
      setActiveCustomerDetail(selectedCustomerForDetail);
    }
  }, [selectedCustomerForDetail]);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    balance: 0,
    notes: '',
  });

  const refreshCustomers = () => {
    setCustomers(storage.getCustomers());
  };

  const getStatusLabel = (status: ServiceRecord['status']) => {
    switch (status) {
      case 'KABUL_EDILDI': return 'Kabul Edildi';
      case 'ISLEMDE': return 'İşlemde';
      case 'PARCA_BEKLENIYOR': return 'Parça Bekleniyor';
      case 'TAMAMLANDI': return 'Tamamlandı';
      case 'TESLIM_EDILDI': return 'Teslim Edildi';
      default: return status;
    }
  };

  const getCustomerVehicles = (customerId: string) => {
    return vehicles.filter(v => v.customerId === customerId);
  };

  const debtorCustomers = customers.filter(c => (c.balance || 0) > 0);
  const totalDebt = debtorCustomers.reduce((sum, c) => sum + (c.balance || 0), 0);

  const filteredCustomers = customers.filter(c => {
    if (filterOnlyDebtors && !((c.balance || 0) > 0)) {
      return false;
    }
    const search = searchTerm.toLowerCase();
    return (
      (c.fullName || '').toLowerCase().includes(search) ||
      (c.phone || '').includes(search) ||
      (c.email ? c.email.toLowerCase().includes(search) : false)
    );
  });

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      address: '',
      balance: 0,
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setFormData({
      fullName: cust.fullName,
      phone: cust.phone,
      email: cust.email || '',
      address: cust.address || '',
      balance: cust.balance || 0,
      notes: cust.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) {
      alert({
        title: 'Eksik Müşteri Bilgisi',
        message: 'Lütfen Müşteri Adı ve Telefon alanlarını doldurunuz.',
        variant: 'warning',
      });
      return;
    }

    const customerToSave: Customer = {
      id: editingCustomer ? editingCustomer.id : `cust-${Date.now()}`,
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      balance: Number(formData.balance) || 0,
      notes: formData.notes,
      createdAt: editingCustomer ? editingCustomer.createdAt : new Date().toISOString(),
    };

    storage.saveCustomer(customerToSave);
    refreshCustomers();
    setIsModalOpen(false);
  };

  const handleDirectWhatsApp = (phone: string, name: string) => {
    if (!phone) {
      alert({
        title: 'Telefon Numarası Eksik',
        message: 'Müşterinin kayıtlı bir telefon numarası bulunamadı.',
        variant: 'warning',
      });
      return;
    }
    const settings = storage.getSettings();
    const message = `Merhaba ${name} Bey/Hanım, ${settings.shopName} servisimizden ulaşıyoruz. Aracınız ile ilgili bilgi vermek istiyoruz.`;
    const url = storage.generateWhatsAppLink(phone, message);
    void openExternalUrl(url);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Müşteri Rehberi</h2>
          <p className="text-slate-400 text-sm">Müşteri iletişim bilgileri, araçları ve borç/alacak bakiyeleri</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition shadow-md shadow-blue-600/20 active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Müşteri Ekle</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="İsim, telefon veya e-posta ile müşteri ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-11 pr-10 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-lg transition"
              title="Aramayı Temizle"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Borçlu Müşteriler Filtresi */}
        <button
          type="button"
          onClick={() => setFilterOnlyDebtors((prev) => !prev)}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition whitespace-nowrap border ${
            filterOnlyDebtors
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-sm shadow-rose-950/50'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
          }`}
          title="Yalnızca cari hesap borcu (bakiye > 0) olan müşterileri listele"
        >
          <CreditCard className="w-4 h-4" />
          <span>Borçlu Müşteriler</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              filterOnlyDebtors
                ? 'bg-rose-500 text-white'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            {debtorCustomers.length}
          </span>
        </button>
      </div>

      {/* Aktif Borçlu Filtresi Bilgi Şeridi */}
      {filterOnlyDebtors && (
        <div className="flex items-center justify-between bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2.5 text-xs text-rose-300">
          <span className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-rose-400" />
            <span>
              Filtre aktif: <strong>{filteredCustomers.length} borçlu müşteri</strong> listeleniyor (Toplam Cari Alacak:{' '}
              <strong className="text-white">₺{totalDebt.toLocaleString('tr-TR')}</strong>)
            </span>
          </span>
          <button
            type="button"
            onClick={() => setFilterOnlyDebtors(false)}
            className="text-rose-400 hover:text-white underline font-semibold ml-2"
          >
            Filtreyi Temizle
          </button>
        </div>
      )}

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
            <p className="text-base font-medium">
              {filterOnlyDebtors ? 'Borçlu müşteri bulunamadı.' : 'Müşteri bulunamadı.'}
            </p>
            {filterOnlyDebtors && (
              <button
                type="button"
                onClick={() => setFilterOnlyDebtors(false)}
                className="mt-3 text-xs text-blue-400 hover:text-blue-300 underline font-medium"
              >
                Tüm Müşterileri Göster
              </button>
            )}
          </div>
        ) : (
          filteredCustomers.map((cust) => {
            const customerVehicles = getCustomerVehicles(cust.id);
            const hasDebt = cust.balance > 0;
            return (
              <div
                key={cust.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-4 transition flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div 
                    onClick={() => setActiveCustomerDetail(cust)}
                    className="flex items-start justify-between cursor-pointer group"
                    title="Müşteri detaylarını ve hesap geçmişini gör"
                  >
                    <div>
                      <h3 className="font-bold text-white text-base group-hover:text-blue-400 transition">
                        {cust.fullName}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-mono">{cust.phone}</span>
                      </div>
                    </div>
                    {/* Bakiye Rozeti */}
                    <div className="text-right">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg inline-flex items-center gap-1 ${
                          hasDebt
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        <CreditCard className="w-3 h-3" />
                        {hasDebt ? `₺${cust.balance.toLocaleString('tr-TR')} Borç` : 'Bakiye Temiz'}
                      </span>
                    </div>
                  </div>

                  {/* Notes / Address */}
                  {cust.notes && (
                    <p className="text-xs text-slate-400 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80 mt-3">
                      {cust.notes}
                    </p>
                  )}

                  {/* Customer Vehicles */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-blue-400" />
                      Kayıtlı Araçları ({customerVehicles.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {customerVehicles.length === 0 ? (
                        <span className="text-xs text-slate-600 italic">Kayıtlı araç yok</span>
                      ) : (
                        customerVehicles.map((v) => (
                          <button
                            key={v.id}
                            onClick={() => onSelectVehicle(v)}
                            className="font-mono text-xs font-bold text-blue-400 bg-slate-950 hover:bg-blue-600/20 border border-slate-800 hover:border-blue-500/40 px-2 py-1 rounded-md transition"
                            title={`${v.brand} ${v.model} - Detayları Aç`}
                          >
                            {v.plate}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveCustomerDetail(cust)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-600/15 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 rounded-xl text-xs font-medium transition"
                  >
                    Detay
                  </button>
                  <button
                    onClick={() => handleDirectWhatsApp(cust.phone, cust.fullName)}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600/15 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 rounded-xl text-xs font-medium transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    WhatsApp
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(cust)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition"
                  >
                    Düzenle
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-lg text-white">
                  {editingCustomer ? 'Müşteri Bilgilerini Düzenle' : 'Yeni Müşteri Tanımla'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Ad Soyad / Firma Adı *
                </label>
                <input
                  type="text"
                  placeholder="Ahmet Yılmaz"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Telefon Numarası *
                </label>
                <input
                  type="text"
                  placeholder="0532 123 45 67"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    E-posta
                  </label>
                  <input
                    type="email"
                    placeholder="musteri@mail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    Mevcut Bakiye (Borç TL)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Adres / Semt
                </label>
                <input
                  type="text"
                  placeholder="Kadıköy, İstanbul"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Özel Notlar
                </label>
                <textarea
                  rows={2}
                  placeholder="Örn: Hafta sonu aranmak istemiyor, fatura talep ediyor..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition shadow-md shadow-blue-600/30"
                >
                  {editingCustomer ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Detail & Account Modal */}
      {activeCustomerDetail && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-start justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xl text-white">
                      {activeCustomerDetail.fullName}
                    </h3>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        activeCustomerDetail.balance > 0
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {activeCustomerDetail.balance > 0
                        ? `₺${activeCustomerDetail.balance.toLocaleString('tr-TR')} Borç`
                        : 'Bakiye Temiz'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Müşteri No: #{activeCustomerDetail.id} • Kayıt: {new Date(activeCustomerDetail.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveCustomerDetail(null);
                  if (onClearSelectedCustomer) onClearSelectedCustomer();
                }}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {/* Contact & Address Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1">
                  <span className="text-slate-500 block">Telefon</span>
                  <span className="font-mono font-bold text-slate-200 block">
                    {activeCustomerDetail.phone}
                  </span>
                  <button
                    onClick={() => handleDirectWhatsApp(activeCustomerDetail.phone, activeCustomerDetail.fullName)}
                    className="mt-1 text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <MessageCircle className="w-3 h-3" />
                    WhatsApp İle Yaz
                  </button>
                </div>
                <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1">
                  <span className="text-slate-500 block">E-posta</span>
                  <span className="text-slate-200 truncate block">
                    {activeCustomerDetail.email || 'Belirtilmedi'}
                  </span>
                </div>
                <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1">
                  <span className="text-slate-500 block">Adres / Konum</span>
                  <span className="text-slate-200 truncate block">
                    {activeCustomerDetail.address || 'Belirtilmedi'}
                  </span>
                </div>
              </div>

              {/* Notes if any */}
              {activeCustomerDetail.notes && (
                <div className="p-3 bg-slate-950/50 border border-slate-800/70 rounded-xl text-xs text-slate-300">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1 font-semibold">
                    Özel Müşteri Notu
                  </span>
                  {activeCustomerDetail.notes}
                </div>
              )}

              {/* Registered Vehicles */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-blue-400" />
                    Kayıtlı Araçları ({getCustomerVehicles(activeCustomerDetail.id).length})
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Detay için araca tıklayın
                  </span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {getCustomerVehicles(activeCustomerDetail.id).length === 0 ? (
                    <p className="col-span-full text-xs text-slate-500 italic p-3 bg-slate-950/40 rounded-xl text-center">
                      Bu müşteriye kayıtlı araç bulunmuyor.
                    </p>
                  ) : (
                    getCustomerVehicles(activeCustomerDetail.id).map((veh) => (
                      <button
                        key={veh.id}
                        onClick={() => {
                          setActiveCustomerDetail(null);
                          if (onClearSelectedCustomer) onClearSelectedCustomer();
                          onSelectVehicle(veh);
                        }}
                        className="text-left p-3 bg-slate-950 border border-slate-800 hover:border-blue-500/40 rounded-xl transition group flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-blue-400 group-hover:text-blue-300">
                              {veh.plate}
                            </span>
                            <span className="text-[11px] text-slate-400">{veh.year}</span>
                          </div>
                          <p className="text-xs text-slate-300 mt-0.5">
                            {veh.brand} {veh.model}
                          </p>
                          <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                            {veh.currentKm.toLocaleString('tr-TR')} KM
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition shrink-0" />
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Service Records History */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-blue-400" />
                  Müşterinin Servis & İş Emri Geçmişi ({storage.getServiceRecords().filter(r => r.customerId === activeCustomerDetail.id).length})
                </h4>
                <div className="space-y-2">
                  {storage.getServiceRecords().filter(r => r.customerId === activeCustomerDetail.id).length === 0 ? (
                    <p className="text-xs text-slate-500 italic p-3 bg-slate-950/40 rounded-xl text-center">
                      Bu müşteriye ait servis kaydı bulunmuyor.
                    </p>
                  ) : (
                    storage.getServiceRecords()
                      .filter(r => r.customerId === activeCustomerDetail.id)
                      .slice(0, 10)
                      .map((rec) => {
                        const veh = vehicles.find(v => v.id === rec.vehicleId);
                        return (
                          <div
                            key={rec.id}
                            onClick={() => {
                              if (onOpenServiceDetail) {
                                setActiveCustomerDetail(null);
                                if (onClearSelectedCustomer) onClearSelectedCustomer();
                                onOpenServiceDetail(rec);
                              }
                            }}
                            className={`p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs space-y-1.5 ${
                              onOpenServiceDetail ? 'hover:border-slate-700 cursor-pointer' : ''
                            } transition`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-blue-400">{veh?.plate || 'Plaka Yok'}</span>
                                <span className="text-slate-400">{new Date(rec.entryDate).toLocaleDateString('tr-TR')}</span>
                              </div>
                              <span className="font-bold text-emerald-400 font-mono">
                                ₺{rec.grandTotal.toLocaleString('tr-TR')}
                              </span>
                            </div>
                            <p className="text-slate-300 font-medium truncate">
                              {rec.complaint}
                            </p>
                            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/60">
                              <span>Durum: {getStatusLabel(rec.status)}</span>
                              <span className={rec.paymentStatus === 'ODENDI' ? 'text-emerald-400' : 'text-amber-400'}>
                                {rec.paymentStatus === 'ODENDI' ? 'Ödendi' : `Kalan: ₺${Math.max(0, rec.grandTotal - (rec.paidAmount || 0)).toLocaleString('tr-TR')}`}
                              </span>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  const custToEdit = activeCustomerDetail;
                  setActiveCustomerDetail(null);
                  handleOpenEditModal(custToEdit);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition"
              >
                <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                Bilgileri Düzenle
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDirectWhatsApp(activeCustomerDetail.phone, activeCustomerDetail.fullName)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium transition shadow-sm"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp
                </button>
                <button
                  onClick={() => {
                    setActiveCustomerDetail(null);
                    if (onClearSelectedCustomer) onClearSelectedCustomer();
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

