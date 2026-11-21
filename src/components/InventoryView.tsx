import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package,
  Search, 
  Plus, 
  AlertTriangle, 
  TrendingUp, 
  MapPin, 
  X,
  Edit2,
  Trash2,
  Filter
} from 'lucide-react';
import { storage } from '../services/storage';
import { StockItem } from '../types';

const STOCK_CATEGORIES = [
  'Motor Yağı',
  'Filtre',
  'Fren Sistemi',
  'Ön Takım',
  'Ateşleme',
  'Sıvı & Katkı',
  'Soğutma & Isıtma',
  'Aydınlatma & Silecek',
  'Kayış & Rulman',
  'Sarf Malzeme',
  'Diğer',
] as const;

export const InventoryView: React.FC = () => {
  const [stockItems, setStockItems] = useState<StockItem[]>(() => storage.getStockItems());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'Motor Yağı',
    brand: '',
    quantity: 1,
    minQuantity: 3,
    unitCost: 0,
    unitPrice: 0,
    shelfLocation: '',
  });

  const refreshItems = () => {
    setStockItems(storage.getStockItems());
  };

  useEffect(() => {
    return storage.subscribe(() => {
      refreshItems();
    });
  }, []);

  // Unified categories: standard categories + dynamic item categories, with 'Diğer' guaranteed at the very end
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    // 1. Add standard categories (except 'Diğer')
    STOCK_CATEGORIES.forEach(c => {
      if (c !== 'Diğer') cats.add(c);
    });
    // 2. Add any custom / dynamic categories from existing stock items (except 'Diğer')
    stockItems.forEach(item => {
      const trimmed = item.category?.trim();
      if (trimmed && trimmed !== 'Diğer') {
        cats.add(trimmed);
      }
    });
    // 3. 'Diğer' is always positioned at the very end
    return [...Array.from(cats), 'Diğer'];
  }, [stockItems]);

  const getCategoryButtonStyle = (cat: string, isSelected: boolean): string => {
    switch (cat) {
      case 'ALL':
        return isSelected
          ? 'bg-blue-600 text-white border-blue-500 shadow-sm shadow-blue-600/30'
          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-blue-400 hover:border-blue-500/30';
      case 'Motor Yağı':
        return isSelected
          ? 'bg-amber-600 text-white border-amber-500 shadow-sm shadow-amber-600/30'
          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-amber-400 hover:border-amber-500/30';
      case 'Filtre':
        return isSelected
          ? 'bg-cyan-600 text-white border-cyan-500 shadow-sm shadow-cyan-600/30'
          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30';
      case 'Fren Sistemi':
        return isSelected
          ? 'bg-rose-600 text-white border-rose-500 shadow-sm shadow-rose-600/30'
          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30';
      case 'Sıvı & Katkı':
      case 'Sıvı & Antifriz':
        return isSelected
          ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-600/30'
          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30';
      case 'Ateşleme':
        return isSelected
          ? 'bg-orange-600 text-white border-orange-500 shadow-sm shadow-orange-600/30'
          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-orange-400 hover:border-orange-500/30';
      case 'Ön Takım':
      case 'Ön Takım & Süspansiyon':
        return isSelected
          ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-600/30'
          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30';
      case 'Aydınlatma & Silecek':
        return isSelected
          ? 'bg-yellow-600 text-white border-yellow-500 shadow-sm shadow-yellow-600/30'
          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-yellow-400 hover:border-yellow-500/30';
      case 'Soğutma & Isıtma':
        return isSelected
          ? 'bg-teal-600 text-white border-teal-500 shadow-sm shadow-teal-600/30'
          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-teal-400 hover:border-teal-500/30';
      case 'Kayış & Rulman':
        return isSelected
          ? 'bg-purple-600 text-white border-purple-500 shadow-sm shadow-purple-600/30'
          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-purple-400 hover:border-purple-500/30';
      case 'Sarf Malzeme':
        return isSelected
          ? 'bg-fuchsia-600 text-white border-fuchsia-500 shadow-sm shadow-fuchsia-600/30'
          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-fuchsia-400 hover:border-fuchsia-500/30';
      default:
        return isSelected
          ? 'bg-violet-600 text-white border-violet-500 shadow-sm shadow-violet-600/30'
          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-violet-400 hover:border-violet-500/30';
    }
  };

  const filteredItems = stockItems.filter(item => {
    const search = searchTerm.toLowerCase().trim();
    const matchesSearch = !search || (
      item.name.toLowerCase().includes(search) ||
      item.code.toLowerCase().includes(search) ||
      item.brand.toLowerCase().includes(search) ||
      item.category.toLowerCase().includes(search)
    );

    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesLowStock = !filterLowStock || item.quantity <= item.minQuantity;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const lowStockCount = storage.getLowStockItems().length;

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      code: '',
      name: '',
      category: 'Motor Yağı',
      brand: '',
      quantity: 1,
      minQuantity: 3,
      unitCost: 0,
      unitPrice: 0,
      shelfLocation: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: StockItem) => {
    setEditingItem(item);
    setFormData({
      code: item.code,
      name: item.name,
      category: item.category,
      brand: item.brand,
      quantity: item.quantity,
      minQuantity: item.minQuantity,
      unitCost: item.unitCost,
      unitPrice: item.unitPrice,
      shelfLocation: item.shelfLocation || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name) {
      alert('Lütfen Parça Kodu ve Adını doldurunuz.');
      return;
    }

    const itemToSave: StockItem = {
      id: editingItem ? editingItem.id : `stk-${Date.now()}`,
      code: formData.code.toUpperCase(),
      name: formData.name,
      category: formData.category,
      brand: formData.brand,
      quantity: Number(formData.quantity) || 0,
      minQuantity: Number(formData.minQuantity) || 0,
      unitCost: Number(formData.unitCost) || 0,
      unitPrice: Number(formData.unitPrice) || 0,
      shelfLocation: formData.shelfLocation,
      updatedAt: new Date().toISOString(),
    };

    storage.saveStockItem(itemToSave);
    refreshItems();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bu parçayı stoktan silmek istediğinize emin misiniz?')) {
      storage.deleteStockItem(id);
      refreshItems();
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Yedek Parça & Stok Takibi</h2>
          <p className="text-slate-400 text-sm">Motor yağları, filtreler, fren parçaları ve kritik stok alarmları</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition shadow-md shadow-blue-600/20 active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Parça Ekle</span>
        </button>
      </div>

      {/* Filter / Search & Category Selection & Low Stock Toggle */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        {/* Search input (narrowed ~yarı yarıya) */}
        <div className="relative w-full lg:w-72 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Parça adı, OEM kodu veya marka ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-8 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition font-medium"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Categories Bar & Kritik Stoklar (Kritik Stoklar is immediately next to Tüm Kategoriler) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 lg:pb-0 scrollbar-thin scrollbar-thumb-slate-800 flex-1 min-w-0">
          {/* 1. Tüm Kategoriler Button */}
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition shrink-0 ${getCategoryButtonStyle('ALL', selectedCategory === 'ALL')}`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Tüm Kategoriler ({stockItems.length})</span>
          </button>

          {/* 2. Kritik Stoklar Button (Tüm Kategoriler'in hemen yanında) */}
          <button
            type="button"
            onClick={() => setFilterLowStock(!filterLowStock)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition shrink-0 ${
              filterLowStock
                ? 'bg-rose-500 text-white border-rose-400 shadow-sm shadow-rose-500/30'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Kritik Stoklar ({lowStockCount})</span>
          </button>

          {/* 3. Individual Category Buttons with subtle distinct color tones */}
          {availableCategories.map((cat) => {
            const count = stockItems.filter(item => item.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(isSelected ? 'ALL' : cat)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition shrink-0 ${getCategoryButtonStyle(cat, isSelected)}`}
              >
                <span>{cat}</span>
                <span className="text-[10px] opacity-75 font-mono">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/70 text-slate-400 text-xs uppercase font-semibold">
              <tr>
                <th className="py-3.5 px-4">Kod</th>
                <th className="py-3.5 px-4">Parça Adı</th>
                <th className="py-3.5 px-4">Kategori / Marka</th>
                <th className="py-3.5 px-4 text-center">Mevcut Stok</th>
                <th className="py-3.5 px-4 text-right">Alış (Maliyet)</th>
                <th className="py-3.5 px-4 text-right">Satış Fiyatı</th>
                <th className="py-3.5 px-4">Raf / Konum</th>
                <th className="py-3.5 px-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package className="w-8 h-8 text-slate-600 mb-1" />
                      <p className="text-slate-400 font-medium">Seçili filtrelere uygun parça bulunamadı.</p>
                      {(searchTerm || selectedCategory !== 'ALL' || filterLowStock) && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchTerm('');
                            setSelectedCategory('ALL');
                            setFilterLowStock(false);
                          }}
                          className="text-xs text-blue-400 hover:text-blue-300 underline font-medium transition"
                        >
                          Tüm Filtreleri Temizle
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isLow = item.quantity <= item.minQuantity;
                  return (
                    <tr key={item.id} className="hover:bg-slate-850 transition">
                      <td className="py-3 px-4 font-mono font-bold text-xs text-blue-400">
                        {item.code}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-200">
                        {item.name}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-400">
                        <span>{item.category}</span>
                        {item.brand && <span className="text-slate-500 block">{item.brand}</span>}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 font-mono font-bold px-2.5 py-0.5 rounded-full text-xs ${
                          isLow
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {item.quantity} Adet
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-xs text-slate-400">
                        ₺{item.unitCost.toLocaleString('tr-TR')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 text-xs">
                        ₺{item.unitPrice.toLocaleString('tr-TR')}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-400">
                        {item.shelfLocation ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            {item.shelfLocation}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-lg text-white">
                  {editingItem ? 'Parça Bilgilerini Düzenle' : 'Yeni Yedek Parça Tanımla'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    Parça Kodu / OEM *
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: HU711/51X"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono font-bold text-blue-400 focus:outline-none focus:border-blue-500 uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    Marka
                  </label>
                  <input
                    type="text"
                    placeholder="Mann, Castrol, Bosch..."
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                  Parça Adı *
                </label>
                <input
                  type="text"
                  placeholder="Örn: Yağ Filtresi (VAG Grubu)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    Kategori
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    {availableCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    Raf / Kutu Konumu
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: Raf B-2"
                    value={formData.shelfLocation}
                    onChange={(e) => setFormData({ ...formData, shelfLocation: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    Mevcut Stok Adedi *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    Kritik Stok Uyarısı Sınırı
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.minQuantity}
                    onChange={(e) => setFormData({ ...formData, minQuantity: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-rose-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    Alış / Maliyet Fiyatı (₺)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.unitCost}
                    onChange={(e) => setFormData({ ...formData, unitCost: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-slate-300 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase block mb-1">
                    Satış Fiyatı (₺) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono font-bold text-emerald-400 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
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
                  {editingItem ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

