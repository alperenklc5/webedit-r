import React, { useState, useEffect, useRef } from 'react';
import { X, Eye, Check, Loader2, Monitor, Layout, ArrowLeft, Search } from 'lucide-react';

const ThemeStore = ({ isOpen, onClose, onSelect }) => {
  const [themes, setThemes] = useState([]);
  const [categories, setCategories] = useState(['Tümü']);
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Önizleme State
  const [previewTheme, setPreviewTheme] = useState(null);
  const iframeRef = useRef(null);

  // Kategori Sözlüğü
  const categoryTr = {
    'All': 'Tümü', 
    'Startup': 'Girişim', 
    'E-Commerce': 'E-Ticaret', 
    'Creative': 'Yaratıcı', 
    'Health': 'Sağlık', 
    'Business': 'Kurumsal', 
    'Fashion': 'Moda', 
    'Automotive': 'Otomotiv', 
    'Hospitality': 'Konaklama / Otel', 
    'Food': 'Yeme & İçme', 
    'Real Estate': 'Emlak',
    'Education': 'Eğitim',
    'Technology': 'Teknoloji'
  };

  useEffect(() => {
    if (!isOpen) return;
    const fetchThemes = async () => {
      setLoading(true);
      try {
        // Cache sorunu olmaması için timestamp eklendi
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
      }, 100);
    } catch (err) { console.error(err); }
  };

  // --- AKILLI FİLTRELEME MANTIĞI ---
  const filteredThemes = themes.filter(t => {
    // 1. Kategori Filtresi
    const matchesCategory = selectedCategory === 'Tümü' || t.category === selectedCategory;

    // 2. Arama Filtresi (İsim + TR Kategori + EN Kategori)
    const trCatName = categoryTr[t.category] || ''; 
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = 
      t.name.toLowerCase().includes(searchLower) ||
      t.category.toLowerCase().includes(searchLower) ||
      trCatName.toLowerCase().includes(searchLower);

    return matchesCategory && matchesSearch;
  });

  if (!isOpen) return null;

  return (
    <div className="store-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <style>{`
        /* --- MAĞAZA STİLLERİ --- */
        .store-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 5000; display: flex; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box; }
        .store-container { background: #111827; width: 100%; max-width: 1200px; height: 85vh; border-radius: 16px; display: flex; overflow: hidden; border: 1px solid #374151; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
        .store-sidebar { width: 280px; background: #030712; padding: 20px; overflow-y: auto; flex-shrink: 0; border-right: 1px solid #1f2937; }
        .store-content { flex: 1; padding: 30px; overflow-y: auto; background: #111827; position: relative; }
        .store-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
        
        .theme-card { background: #1f2937; border-radius: 12px; overflow: hidden; border: 1px solid #374151; position: relative; transition: all 0.3s; display: flex; flex-direction: column; }
        .theme-card:hover { transform: translateY(-5px); border-color: #3b82f6; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
        .theme-image-wrapper { height: 180px; width: 100%; position: relative; overflow: hidden; background: #000; }
        .theme-image { width: 100%; height: 100%; object-fit: cover; object-position: top; transition: transform 0.5s; }
        .theme-card:hover .theme-image { transform: scale(1.1); }
        
        .cat-btn { display: block; width: 100%; text-align: left; padding: 10px 15px; margin-bottom: 5px; border-radius: 8px; color: #9ca3af; font-size: 14px; transition: 0.2s; }
        .cat-btn.active { background: #2563eb; color: white; }
        .cat-btn:hover:not(.active) { background: #1f2937; color: white; }
        
        .search-input-wrapper { position: relative; margin-bottom: 20px; }
        .search-input { width: 100%; background: #1f2937; border: 1px solid #374151; padding: 10px 10px 10px 40px; border-radius: 8px; color: white; outline: none; transition: 0.3s; }
        .search-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2); }
        .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; }

        .preview-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.7); opacity: 0; transition: 0.3s; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; }
        .theme-card:hover .preview-overlay { opacity: 1; }

        /* --- TAM EKRAN ÖNİZLEME STİLLERİ --- */
        .full-screen-wrapper { 
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; 
          background: #000; z-index: 99999; display: flex; flex-direction: column; 
        }
        
        .preview-header { 
          height: 70px; background: #111827; border-bottom: 1px solid #374151; 
          display: flex; align-items: center; justify-content: space-between; padding: 0 24px; flex-shrink: 0; box-sizing: border-box;
        }

        .header-left { flex: 1; display: flex; justify-content: flex-start; align-items: center; height: 100%; }
        .header-center { flex: 0; display: flex; justify-content: center; align-items: center; height: 100%; white-space: nowrap; }
        .header-right { flex: 1; display: flex; justify-content: flex-end; align-items: center; height: 100%; }
        
        .header-title { margin: 0; padding: 0; line-height: 1; display: flex; align-items: center; gap: 10px; }
        .header-btn { display: flex; align-items: center; justify-content: center; gap: 8px; height: 44px; padding: 0 20px; border-radius: 9999px; transition: all 0.2s; font-weight: 600; }

        .preview-body { flex: 1; width: 100%; height: calc(100vh - 70px); background: #fff; position: relative; }
        .preview-iframe { width: 100%; height: 100%; border: none; display: block; }
      `}</style>

      {/* MAĞAZA ARAYÜZÜ */}
      <div className="store-container">
        <div className="store-sidebar">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Layout className="text-blue-500" /> Temalar
          </h2>

          {/* ARAMA ÇUBUĞU */}
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Tema ara..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`cat-btn ${selectedCategory === cat ? 'active' : ''}`}>
              {categoryTr[cat] || cat}
            </button>
          ))}
        </div>

        <div className="store-content">
          <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-gray-800 rounded-full hover:bg-red-600 text-white"><X size={20} /></button>
          
          {loading ? (
            <div className="flex h-full items-center justify-center text-white"><Loader2 className="animate-spin mr-2"/> Mağaza Yükleniyor...</div>
          ) : (
            <>
              {filteredThemes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Search size={48} className="mb-4 opacity-20" />
                  <p className="text-lg font-medium">Aradığınız kriterde tema bulunamadı.</p>
                  <button onClick={() => {setSearchTerm(''); setSelectedCategory('Tümü')}} className="mt-4 text-blue-500 hover:underline">Filtreleri Temizle</button>
                </div>
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
            </>
          )}
        </div>
      </div>

      {/* TAM EKRAN ÖNİZLEME PENCERESİ */}
      {previewTheme && (
        <div className="full-screen-wrapper">
          <div className="preview-header">
            {/* SOL */}
            <div className="header-left">
              <button onClick={() => setPreviewTheme(null)} className="header-btn text-gray-400 hover:text-white hover:bg-gray-800">
                <ArrowLeft size={20} /> <span className="hidden md:inline">Mağazaya Dön</span>
              </button>
            </div>
            
            {/* ORTA - Başlık */}
            <div className="header-center">
              <h3 className="header-title text-white font-bold text-xl">
                <Monitor className="text-blue-500" size={24} /> {previewTheme.name}
              </h3>
            </div>
            
            {/* SAĞ */}
            <div className="header-right">
              <button 
                onClick={async () => { 
                   const res = await fetch(previewTheme.url); 
                   const html = await res.text(); 
                   onSelect(html); 
                   setPreviewTheme(null); 
                   onClose(); 
                }} 
                className="header-btn bg-blue-600 hover:bg-blue-500 text-white shadow-lg"
              >
                <Check size={20} /> <span className="hidden md:inline">Bu Temayı Kullan</span>
              </button>
            </div>
          </div>
          <div className="preview-body">
             <iframe ref={iframeRef} className="preview-iframe" title="Full Preview" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeStore;