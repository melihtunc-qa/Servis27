import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  Download, 
  Upload, 
  Database, 
  ShieldCheck, 
  RefreshCw,
  Trash2,
  CheckCircle,
  FileText,
  Layers,
  Car,
  Package,
  AlertTriangle,
  X,
  Lock,
  Unlock,
  KeyRound
} from 'lucide-react';
import { storage, defaultSettings } from '../services/storage';
import { ShopSettings } from '../types';
import { useModal } from '../context/ModalContext';

export const SettingsView: React.FC = () => {
  const { confirm } = useModal();
  const [settings, setSettings] = useState<ShopSettings>(() => storage.getSettings());
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [seedStatus, setSeedStatus] = useState<string | null>(null);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [backupDownloaded, setBackupDownloaded] = useState(false);
  const [isDevUnlocked, setIsDevUnlocked] = useState(() => {
    return typeof window !== 'undefined' && sessionStorage.getItem('servis27_dev_unlocked') === 'true';
  });
  const [devPasswordInput, setDevPasswordInput] = useState('');
  const [devPasswordError, setDevPasswordError] = useState<string | null>(null);
  const [, setVersion] = useState(0);

  useEffect(() => {
    return storage.subscribe(() => {
      setVersion(v => v + 1);
    });
  }, []);

  const handleUnlockDevMode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (devPasswordInput === '123456') {
      setIsDevUnlocked(true);
      setDevPasswordError(null);
      setDevPasswordInput('');
      sessionStorage.setItem('servis27_dev_unlocked', 'true');
    } else {
      setDevPasswordError('Hatalı geliştirici şifresi! Lütfen tekrar deneyiniz.');
    }
  };

  const handleLockDevMode = () => {
    setIsDevUnlocked(false);
    setDevPasswordInput('');
    setDevPasswordError(null);
    sessionStorage.removeItem('servis27_dev_unlocked');
  };

  const handleSeed100Data = () => {
    const result = storage.seed100TestData();
    setSeedStatus(`✓ ${result.customers} Müşteri, ${result.vehicles} Araç, ${result.stockItems} Yedek Parça ve ${result.services} İş Emri yüklendi!`);
    setTimeout(() => setSeedStatus(null), 6000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    storage.saveSettings(settings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExportBackup = () => {
    const backupJson = storage.exportBackup();
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `servis27_yedek_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const success = storage.importBackup(content);
        if (success) {
          setImportStatus('✓ Veritabanı başarıyla geri yüklendi! Sistem yenileniyor...');
          setTimeout(() => {
            window.location.reload();
          }, 1200);
        } else {
          setRestoreError('Hata: Seçilen dosya geçerli bir Servis27 yedeği değil veya bozuk format içeriyor!');
        }
      } catch (err) {
        setRestoreError('Hata: Dosya okunurken veya işlenirken bir sorun oluştu.');
      }
    };
    reader.onerror = () => {
      setRestoreError('Hata: Dosya okunamadı!');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetDemoData = async () => {
    const isConfirmed = await confirm({
      title: 'Fabrika Demo Verilerine Sıfırla',
      message: 'Tüm mevcut veriler sıfırlanıp standart fabrika demo başlangıç verileri (3 Müşteri, 4 Araç, 6 Stok) yüklenecek. Emin misiniz?',
      confirmText: 'Evet, Demo Verileri Yükle',
      cancelText: 'Vazgeç',
      variant: 'warning',
    });
    if (isConfirmed) {
      storage.resetToFactoryDefaults();
      setSeedStatus('✓ Tüm veriler standart fabrika demo verilerine sıfırlandı!');
      setTimeout(() => {
        window.location.reload();
      }, 700);
    }
  };

  const handleClearAllData = async () => {
    const isConfirmed = await confirm({
      title: 'Veritabanını Tamamen Sıfırla',
      message: 'DİKKAT: Tüm müşteri, araç, stok ve servis kayıtları kalıcı olarak silinecektir (0 Kayıt - Boş Veritabanı). Onaylıyor musunuz?',
      confirmText: 'Kalıcı Olarak Sil',
      cancelText: 'Vazgeç',
      variant: 'danger',
    });
    if (isConfirmed) {
      storage.clearAllData();
      setSeedStatus('✓ Tüm veriler tamamen temizlendi! Sıfır kayıtla boş veritabanı hazır.');
      setTimeout(() => {
        window.location.reload();
      }, 700);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Atölye Ayarları & Veritabanı</h2>
        <p className="text-slate-400 text-sm">
          Servis fatura/fiş başlık bilgileri, bakım periyotları ve yerel veri yedekleme
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Shop Info Form (2 Cols) */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              Servis & Fiş Başlık Bilgileri
            </h3>
            {saveSuccess && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 animate-in fade-in">
                <CheckCircle className="w-3.5 h-3.5" />
                Kaydedildi!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Servis / Atölye Adı *
                </label>
                <input
                  type="text"
                  value={settings.shopName}
                  onChange={(e) => setSettings({ ...settings, shopName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Yetkili / Usta Adı
                </label>
                <input
                  type="text"
                  value={settings.ownerName}
                  onChange={(e) => setSettings({ ...settings, ownerName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Telefon Numarası
                </label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Şehir
                </label>
                <input
                  type="text"
                  value={settings.city}
                  onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                Adres & Sanayi Sitesi Bilgisi
              </label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Vergi Dairesi
                </label>
                <input
                  type="text"
                  value={settings.taxOffice || ''}
                  onChange={(e) => setSettings({ ...settings, taxOffice: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Vergi Numarası
                </label>
                <input
                  type="text"
                  value={settings.taxNumber || ''}
                  onChange={(e) => setSettings({ ...settings, taxNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Default Maintenance Periods */}
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                Akıllı Bakım Hatırlatma Varsayılanları
              </span>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Varsayılan Yağ Değişim KM Periyodu
                  </label>
                  <input
                    type="number"
                    value={settings.defaultOilPeriodKm}
                    onChange={(e) => setSettings({ ...settings, defaultOilPeriodKm: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-blue-400 font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Varsayılan Gün Periyodu
                  </label>
                  <input
                    type="number"
                    value={settings.defaultOilPeriodDays}
                    onChange={(e) => setSettings({ ...settings, defaultOilPeriodDays: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-blue-400 font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                Servis Fişi Alt Notu & Garanti Şartı
              </label>
              <textarea
                rows={2}
                value={settings.footerNote}
                onChange={(e) => setSettings({ ...settings, footerNote: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition shadow-md shadow-blue-600/30"
              >
                <Save className="w-4 h-4" />
                Ayarları Kaydet
              </button>
            </div>
          </form>
        </div>

        {/* Database & Backup Card (1 Col) */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Lokal Veritabanı & Güvenlik</h4>
                <p className="text-[11px] text-slate-400">Cihaz hafızasında %100 çevrimdışı</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Tüm müşteri, araç ve servis kayıtlarınız cihaz hafızasında güvenle saklanmaktadır. Verileriniz asla internete veya buluta gönderilmez.
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleExportBackup}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-xl text-xs font-medium transition shadow-sm"
              >
                <Download className="w-4 h-4 text-blue-400" />
                Veritabanı Yedeği İndir (.json)
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsRestoreModalOpen(true);
                  setRestoreError(null);
                  setBackupDownloaded(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-xl text-xs font-medium transition shadow-sm active:scale-98"
              >
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Yedekten Geri Yükle</span>
              </button>

              {importStatus && (
                <p className="text-xs font-medium text-center text-emerald-400 pt-1 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg">
                  {importStatus}
                </p>
              )}
            </div>
          </div>

          {/* App & Developer Info Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <h4 className="font-bold text-white text-xs uppercase tracking-wide">Uygulama & Sürüm Bilgisi</h4>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Yazılım:</span>
                <span className="font-semibold text-slate-200">Servis27 Masaüstü</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Sürüm:</span>
                <span className="font-mono font-bold text-emerald-400">v1.5.0</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Geliştirici:</span>
                <span className="font-medium text-blue-400">Melih Tunç</span>
              </div>
            </div>
          </div>

          {/* Test & Demo Data */}
          {!isDevUnlocked ? (
            /* Locked State */
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Geliştirici & Test Verisi
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Şifre Korumalı
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Bu alan 100 test verisi yükleme ve fabrika sıfırlama araçlarını içerir. Erişim için geliştirici şifresini giriniz:
              </p>

              <form onSubmit={handleUnlockDevMode} className="space-y-3">
                <div>
                  <input
                    type="password"
                    value={devPasswordInput}
                    onChange={(e) => {
                      setDevPasswordInput(e.target.value);
                      if (devPasswordError) setDevPasswordError(null);
                    }}
                    placeholder="Geliştirici Şifresi"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition font-mono tracking-widest"
                    autoComplete="off"
                  />
                </div>

                {devPasswordError && (
                  <p className="text-xs text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    {devPasswordError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition shadow-sm active:scale-98"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  Giriş Yap ve Kilidi Aç
                </button>
              </form>
            </div>
          ) : (
            /* Unlocked State */
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                  Geliştirici & Test Verisi
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Kilit Açık
                  </span>
                  <button
                    type="button"
                    onClick={handleLockDevMode}
                    title="Geliştirici alanını kilitle"
                    className="text-slate-400 hover:text-amber-400 p-1 rounded-lg hover:bg-slate-800 transition text-[11px] flex items-center gap-1"
                  >
                    <Lock className="w-3 h-3" />
                    <span className="text-[10px]">Kilitle</span>
                  </button>
                </div>
              </div>

              {/* Current Stats Summary */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-center text-xs">
                <div>
                  <p className="text-[10px] text-slate-500">Müşteri</p>
                  <p className="font-bold text-white font-mono">{storage.getCustomers().length}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">Araç</p>
                  <p className="font-bold text-blue-400 font-mono">{storage.getVehicles().length}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">Yedek Parça</p>
                  <p className="font-bold text-emerald-400 font-mono">{storage.getStockItems().length}</p>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Çoklu veri performansını, plaka aramasını ve kritik stok filtrelerini test etmek için 100 müşteri, 100 araç ve 100 yedek parça yükleyin:
              </p>

              <button
                onClick={handleSeed100Data}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-blue-600/20 active:scale-98"
              >
                <Database className="w-4 h-4" />
                100 Test Verisi Yükle (Araç, Müşteri & Stok)
              </button>

              {seedStatus && (
                <p className="text-xs font-medium text-emerald-400 text-center animate-in fade-in bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg">
                  {seedStatus}
                </p>
              )}

              <div className="pt-2 border-t border-slate-800 space-y-2">
                <button
                  onClick={handleResetDemoData}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-950/30 hover:bg-amber-900/50 text-amber-300 border border-amber-800/50 rounded-xl text-xs font-medium transition active:scale-98"
                  title="Sistemi standart demo verilerine (3 müşteri, 4 araç, 6 yedek parça) sıfırlar"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Fabrika Demo Verilerine Sıfırla (Başlangıç Verileri)
                </button>

                <button
                  onClick={handleClearAllData}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 border border-rose-800/50 rounded-xl text-xs font-medium transition active:scale-98"
                  title="Tüm müşteri, araç, servis ve stok verilerini kalıcı olarak silip boş başlatır"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Tüm Verileri Temizle (Boş Veritabanı - 0 Kayıt)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Restore Confirmation Modal (Ön Doğrulama Ekranı) */}
      {isRestoreModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Yedekten Geri Yükleme Doğrulaması</h3>
                  <p className="text-[11px] text-slate-400">Veritabanı içeri aktarma işlemi</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsRestoreModalOpen(false);
                  setRestoreError(null);
                }}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Prominent Warning Alert */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-amber-300 leading-snug">
                    Geri Yükleme İşlemi Mevcut Verilerinizin Değişmesine Sebep Olabilir , Bu Yüzden Önce Yedekleme Yapınız
                  </h4>
                  <p className="text-xs text-amber-200/80 leading-relaxed">
                    Yedekten geri yükleme yapıldığında mevcut müşteri, araç, stok, iş emri ve kasa kayıtlarınız seçilen yedek dosyasındaki verilerle güncellenecektir.
                  </p>
                </div>
              </div>

              {/* Step 1: Backup Recommendation Action */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-[11px] flex items-center justify-center font-bold">1</span>
                    Önlem: Mevcut Verilerinizin Yedeğini Alın
                  </span>
                  {backupDownloaded && (
                    <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Yedek İndirildi
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  Olası veri kaybına karşı mevcut veritabanınızın güncel .json yedeğini tek tıkla bilgisayarınıza indirin.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    handleExportBackup();
                    setBackupDownloaded(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition shadow-sm active:scale-98"
                >
                  <Download className="w-4 h-4 text-blue-400" />
                  Şimdi Mevcut Verilerin Yedeğini İndir (.json)
                </button>
              </div>

              {/* Step 2: Choose Backup File & Restore */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] flex items-center justify-center font-bold">2</span>
                  Geri Yüklenecek Yedek Dosyasını (.json) Seçin
                </span>
                <p className="text-[11px] text-slate-400">
                  Önceden indirilmiş geçerli Servis27 yedek dosyanızı seçerek yükleme işlemini başlatın.
                </p>

                <label className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-md shadow-emerald-600/20 active:scale-98">
                  <Upload className="w-4 h-4" />
                  <span>Yedek Dosyasını Seç (.json) ve Geri Yükle</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileSelected}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Status / Error feedback */}
              {restoreError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{restoreError}</span>
                </div>
              )}

              {importStatus && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{importStatus}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsRestoreModalOpen(false);
                  setRestoreError(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
              >
                Vazgeç
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

