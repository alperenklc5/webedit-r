import React, { useState, useEffect, useRef } from 'react';
import { X, Eye, Check, Loader2, Monitor, Layout } from 'lucide-react';

const ThemeStore = ({ isOpen, onClose, onSelect }) => {
  const [themes, setThemes] = useState([]);
  const [categories, setCategories] = useState(['Tümü']);
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [loading, setLoading] = useState(true);
  
  // Önizleme State
  const [previewTheme, setPreviewTheme] = useState(null);
  const iframeRef = useRef(null);

  // Kategori Sözlüğü
  const categoryTr = {
    'All': 'Tümü', 'Startup': 'Girişim', 'E-Commerce': 'E-Ticaret', 
    'Creative': 'Yaratıcı', 'Health': 'Sağlık', 'Business': 'Kurumsal', 
    'Fashion': 'Moda', 'Automotive': 'Otomotiv', 'Hospitality': 'Konaklama / Otel', 
    'Food': 'Yeme & İçme', 'Real Estate': 'Emlak'
  };

  useEffect(() => {
    if (!isOpen) return;
    const fetchThemes = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://raw.githubusercontent.com/alperenklc5/Webeditor_themes/main/themes.json?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          setThemes(data);
          setCategories(['Tümü', ...new Set(data.map(t => t.category))]);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchThemes();
  }, [isOpen]);

  const handlePreview = async (theme) => {
    setPreviewTheme(theme);
    try {
      const res = await fetch(theme.url);
      const html = await res.text();
      setTimeout(() => {
        if (iframeRef.current) {
          const doc = iframeRef.current.contentWindow.document;
          doc.open(); doc.write(html); doc.close();
        }
      }, 500);
    } catch (err) { console.error(err); }
  };

  const filteredThemes = selectedCategory === 'Tümü' ? themes : themes.filter(t => t.category === selectedCategory);

  if (!isOpen) return null;

  return (
    <div className="store-overlay">
      {/* BU CSS BLOĞU ZORUNLU STİLLERİ TANIMLAR */}
      <style>{`
        .store-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .store-container { background: #111827; width: 100%; max-width: 1200px; height: 85vh; border-radius: 16px; display: flex; overflow: hidden; border: 1px solid #374151; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
        .store-sidebar { width: 250px; background: #030712; padding: 20px; overflow-y: auto; flex-shrink: 0; border-right: 1px solid #1f2937; }
        .store-content { flex: 1; padding: 30px; overflow-y: auto; background: #111827; position: relative; }
        .store-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
        
        /* İŞTE RESİM BOYUTUNU ZORLAYAN KISIM */
        .theme-card { background: #1f2937; border-radius: 12px; overflow: hidden; border: 1px solid #374151; position: relative; transition: all 0.3s; display: flex; flex-direction: column; }
        .theme-card:hover { transform: translateY(-5px); border-color: #3b82f6; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
        .theme-image-wrapper { height: 180px; width: 100%; position: relative; overflow: hidden; background: #000; }
        .theme-image { width: 100%; height: 100%; object-fit: cover; object-position: top; transition: transform 0.5s; }
        .theme-card:hover .theme-image { transform: scale(1.1); }
        
        .cat-btn { display: block; width: 100%; text-align: left; padding: 10px 15px; margin-bottom: 5px; border-radius: 8px; color: #9ca3af; font-size: 14px; transition: 0.2s; }
        .cat-btn.active { background: #2563eb; color: white; }
        .cat-btn:hover:not(.active) { background: #1f2937; color: white; }
        
        .preview-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.7); opacity: 0; transition: 0.3s; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; }
        .theme-card:hover .preview-overlay { opacity: 1; }
      `}</style>

      <div className="store-container">
        {/* SOL MENÜ */}
        <div className="store-sidebar">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Layout className="text-blue-500" /> Temalar
          </h2>
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`cat-btn ${selectedCategory === cat ? 'active' : ''}`}>
              {categoryTr[cat] || cat}
            </button>
          ))}
        </div>

        {/* SAĞ İÇERİK */}
        <div className="store-content">
          <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-gray-800 rounded-full hover:bg-red-600 text-white"><X size={20} /></button>
          
          {loading ? (
            <div className="flex h-full items-center justify-center text-white"><Loader2 className="animate-spin mr-2"/> Mağaza Yükleniyor...</div>
          ) : (
            <div className="store-grid">
              {filteredThemes.map(theme => (
                <div key={theme.id} className="theme-card">
                  <div className="theme-image-wrapper">
                    <img src={theme.thumbnail} alt={theme.name} className="theme-image" />
                    <div className="preview-overlay">
                      <button onClick={() => handlePreview(theme)} className="px-5 py-2 border border-white text-white rounded-full hover:bg-white hover:text-black transition flex items-center gap-2 font-medium text-sm">
                        <Eye size={16} /> Önizle
                      </button>
                      <button onClick={async () => { const res = await fetch(theme.url); const html = await res.text(); onSelect(html); }} className="px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition flex items-center gap-2 font-medium text-sm">
                        <Check size={16} /> Uygula
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-bold text-sm">{theme.name}</h3>
                    <p className="text-gray-400 text-xs mt-1 uppercase font-semibold tracking-wider">{categoryTr[theme.category] || theme.category}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ÖNİZLEME MODALI */}
      {previewTheme && (
        <div className="fixed inset-0 z-[10000] bg-black flex flex-col">
          <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 shrink-0">
            <h3 className="text-white font-bold flex items-center gap-2"><Monitor className="text-blue-500"/> {previewTheme.name}</h3>
            <div className="flex gap-4">
              <button onClick={async () => { const res = await fetch(previewTheme.url); const html = await res.text(); onSelect(html); setPreviewTheme(null); }} className="px-4 py-1 bg-blue-600 text-white rounded-md text-sm">Kullan</button>
              <button onClick={() => setPreviewTheme(null)} className="p-2 text-white hover:text-red-500"><X size={20} /></button>
            </div>
          </div>
          <div className="flex-1 bg-white relative"><iframe ref={iframeRef} className="w-full h-full border-none" title="Preview" /></div>
        </div>
      )}
    </div>
  );
};

export default ThemeStore;