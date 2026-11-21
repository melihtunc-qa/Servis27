import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  MessageCircle, 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Car, 
  User, 
  X, 
  Trash2,
  Search,
  Calendar
} from 'lucide-react';
import { storage } from '../services/storage';
import { Reminder, ReminderType, ReminderStatus, Vehicle, Customer } from '../types';

export type ReminderFilterTab = 'ALL' | 'YAKLASAN' | 'GECMIS' | 'TAMAMLANDI';

export const RemindersView: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>(() => storage.getReminders());
  const [vehicles] = useState<Vehicle[]>(() => storage.getVehicles());
  const [customers] = useState<Customer[]>(() => storage.getCustomers());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ReminderFilterTab>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    vehicleId: vehicles[0]?.id || '',
    type: 'YAG_BAKIMI' as ReminderType,
    title: 'Periyodik Yağ & Filtre Bakımı',
    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    targetKm: 0,
    notes: '',
  });

  const refreshReminders = () => {
    setReminders(storage.getReminders());
  };

  useEffect(() => {
    return storage.subscribe(() => {
      refreshReminders();
    });
  }, []);

  const getVehicle = (id: string) => vehicles.find(v => v.id === id);
  const getCustomer = (id: string) => customers.find(c => c.id === id);

  const todayStr = new Date().toISOString().split('T')[0];

  const getReminderCategory = (rem: Reminder): 'YAKLASAN' | 'GECMIS' | 'TAMAMLANDI' => {
    if (rem.status === 'TAMAMLANDI') return 'TAMAMLANDI';
    if (rem.targetDate && rem.targetDate < todayStr) return 'GECMIS';
    return 'YAKLASAN';
  };

  const allCount = reminders.length;
  const yaklasanCount = reminders.filter(r => getReminderCategory(r) === 'YAKLASAN').length;
  const gecmisCount = reminders.filter(r => getReminderCategory(r) === 'GECMIS').length;
  const tamamlandiCount = reminders.filter(r => getReminderCategory(r) === 'TAMAMLANDI').length;

  const filteredReminders = reminders.filter(rem => {
    const category = getReminderCategory(rem);
    const matchesTab = activeTab === 'ALL' || category === activeTab;
    if (!matchesTab) return false;

    if (!searchTerm.trim()) return true;
    const q = searchTerm.trim().toLowerCase();
    const vehicle = getVehicle(rem.vehicleId);
    const customer = getCustomer(rem.customerId);
    const plate = vehicle?.plate.toLowerCase() || '';
    const custName = customer?.fullName.toLowerCase() || '';
    const custPhone = customer?.phone || '';
    const title = rem.title.toLowerCase();

    return plate.includes(q) || custName.includes(q) || custPhone.includes(q) || title.includes(q);
  });

  const handleSendWhatsApp = (rem: Reminder) => {
    const customer = getCustomer(rem.customerId);
    const vehicle = getVehicle(rem.vehicleId);
    const settings = storage.getSettings();
    if (!customer) return;

    let text = `Sayın ${customer.fullName},\n${settings.shopName} servisimizden hatırlatmadır: `;
    text += `${vehicle?.plate} plakalı aracınızın ${rem.title} zamanı `;
    if (rem.targetKm) {
      text += `(${rem.targetKm.toLocaleString('tr-TR')} KM) `;
    }
    text += `gelmiştir.\nRandevu oluşturmak veya bilgi almak için bu numaradan bizimle iletişime geçebilirsiniz.`;

    const url = storage.generateWhatsAppLink(customer.phone, text);
    window.open(url, '_blank');

    // Update status to BILDIRILDI
    storage.saveReminder({ ...rem, status: 'BILDIRILDI' });
    refreshReminders();
  };

  const handleMarkCompleted = (rem: Reminder) => {
    storage.saveReminder({ ...rem, status: 'TAMAMLANDI' });
    refreshReminders();
  };

  const handleDelete = (id: string) => {
    if (confirm('Bu hatırlatmayı silmek istediğinize emin misiniz?')) {
      storage.deleteReminder(id);
      refreshReminders();
    }
  };

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    const vehicle = getVehicle(formData.vehicleId);
    if (!vehicle) return;

    const newReminder: Reminder = {
      id: `rem-${Date.now()}`,
      vehicleId: vehicle.id,
      customerId: vehicle.customerId,
      type: formData.type,
      title: formData.title,
      targetDate: formData.targetDate,
      targetKm: Number(formData.targetKm) || undefined,
      status: 'YAKLASAN',
      notes: formData.notes,
      createdAt: new Date().toISOString(),
    };

    storage.saveReminder(newReminder);
    refreshReminders();
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Periyodik Bakım & Hatırlatma Takvimi</h2>
          <p className="text-slate-400 text-sm">
            Yaklaşan periyodik bakımlar, muayene tarihleri ve tek tıkla WhatsApp bildirimleri
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition shadow-md shadow-blue-600/20 active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Hatırlatma Ekle</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'ALL', label: 'Tüm Kayıtlar', count: allCount, color: 'bg-blue-600 text-white' },
            { id: 'YAKLASAN', label: 'Yaklaşan', count: yaklasanCount, color: 'bg-amber-600 text-white' },
            { id: 'GECMIS', label: 'Geçmiş', count: gecmisCount, color: 'bg-rose-600 text-white' },
            { id: 'TAMAMLANDI', label: 'Tamamlandı', count: tamamlandiCount, color: 'bg-emerald-600 text-white' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ReminderFilterTab)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? `${tab.color} font-semibold shadow-sm`
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-black/25 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Plaka, müşteri veya başlık ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Reminders List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReminders.length === 0 ? (
          <div className="col-span-full bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
            <p className="text-base font-medium">Bu filtreye uygun hatırlatma bulunmuyor.</p>
          </div>
        ) : (
          filteredReminders.map((rem) => {
            const vehicle = getVehicle(rem.vehicleId);
            const customer = getCustomer(rem.customerId);
            const category = getReminderCategory(rem);
            const isCompleted = category === 'TAMAMLANDI';
            const isOverdue = category === 'GECMIS';
            const isSent = rem.status === 'BILDIRILDI';

            return (
              <div
                key={rem.id}
                className={`bg-slate-900 border rounded-2xl p-5 space-y-4 transition flex flex-col justify-between ${
                  isCompleted 
                    ? 'border-slate-800/50 opacity-60' 
                    : isOverdue
                    ? 'border-rose-500/40 bg-rose-950/15 hover:border-rose-500/60 shadow-sm shadow-rose-950/30'
                    : isSent
                    ? 'border-blue-500/30 bg-blue-950/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-blue-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                      {vehicle?.plate}
                    </span>
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                      isCompleted ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      isOverdue ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40 font-bold' :
                      isSent ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {isCompleted ? 'Tamamlandı' :
                       isOverdue ? 'Geçmiş / Gecikmiş' :
                       isSent ? 'Bildirildi (WhatsApp)' :
                       'Yaklaşan'}
                    </span>
                  </div>

                  {/* Title & Customer */}
                  <div className="mt-3">
                    <h4 className="font-bold text-slate-100 text-base">{rem.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      {customer?.fullName} ({customer?.phone})
                    </p>
                  </div>

                  {/* Target details */}
                  <div className="mt-3 p-2.5 bg-slate-950/50 rounded-xl border border-slate-800/80 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Hedef Tarih:</span>
                      <span className={`font-medium ${isOverdue ? 'text-rose-400 font-bold flex items-center gap-1 font-mono' : 'text-slate-200'}`}>
                        {isOverdue && <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                        {rem.targetDate}
                        {isOverdue && <span className="text-[10px] text-rose-400 font-normal">(Tarihi Geçti)</span>}
                      </span>
                    </div>
                    {rem.targetKm && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Hedef KM:</span>
                        <span className="font-mono font-bold text-blue-400">
                          {rem.targetKm.toLocaleString('tr-TR')} KM
                        </span>
                      </div>
                    )}
                    {rem.notes && (
                      <p className="text-slate-400 text-[11px] pt-1 border-t border-slate-800/60 italic">
                        {rem.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  {!isCompleted && (
                    <button
                      onClick={() => handleSendWhatsApp(rem)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium transition shadow-sm"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      WhatsApp'tan Bildir
                    </button>
                  )}

                  {!isCompleted ? (
                    <button
                      onClick={() => handleMarkCompleted(rem)}
                      className="p-2 bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white rounded-xl transition"
                      title="Tamamlandı Olarak İşaretle"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  ) : null}

                  <button
                    onClick={() => handleDelete(rem.id)}
                    className="p-2 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white rounded-xl transition"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Reminder Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-lg text-white">Yeni Bakım / Hatırlatma Tanımla</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReminder} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  İlgili Araç *
                </label>
                <select
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  required
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plate} ({v.brand} {v.model})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Hatırlatma Türü
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => {
                    const type = e.target.value as ReminderType;
                    let title = 'Periyodik Bakım';
                    if (type === 'MUAYENE') title = 'TÜVTÜRK Muayene Hatırlatması';
                    if (type === 'TRIGER') title = 'Triger Kayışı Değişimi';
                    if (type === 'FREN_BALATA') title = 'Fren Balata Kontrolü';
                    setFormData({ ...formData, type, title });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="YAG_BAKIMI">Periyodik Yağ & Filtre Bakımı</option>
                  <option value="MUAYENE">TÜVTÜRK Araç Muayenesi</option>
                  <option value="TRIGER">Triger Kayışı / Seti Değişimi</option>
                  <option value="FREN_BALATA">Fren Balata Kontrolü</option>
                  <option value="OZEL">Özel Hatırlatma</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Başlık *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    Hedef Tarih *
                  </label>
                  <input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    Hedef KM (Opsiyonel)
                  </label>
                  <input
                    type="number"
                    placeholder="150000"
                    value={formData.targetKm}
                    onChange={(e) => setFormData({ ...formData, targetKm: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Notlar
                </label>
                <textarea
                  rows={2}
                  placeholder="Müşteriye iletilecek ek not..."
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
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

