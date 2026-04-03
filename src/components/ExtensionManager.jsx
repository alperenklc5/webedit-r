import { useState } from 'react';
import './ExtensionManager.css';

const ExtensionManager = ({ isOpen, onClose, extensions, onToggleExtension }) => {
  const [activeTab, setActiveTab] = useState('available');

  const availableExtensions = [
    {
      id: 'translator',
      name: 'AI Çevirmen',
      description: 'İngilizce temaları tek tıkla Türkçe\'ye çevirin.',
      icon: '🌐',
      version: '1.0.0',
      author: 'WebEditör',
      category: 'Araçlar',
      downloads: '5K+',
      rating: '5.0',
    },
    {
      id: 'seo',
      name: 'SEO Analizi',
      description: 'Sayfanızın SEO puanını analiz edin - H1 kontrolü, alt metinler, içerik uzunluğu ve daha fazlası.',
      icon: '📊',
      version: '1.0.0',
      author: 'WebEditör',
      category: 'Analiz',
      downloads: '5K+',
      rating: '4.8',
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="extension-manager-overlay" onClick={onClose}>
      <div className="extension-manager-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="extension-manager-header">
          <div className="extension-manager-title">
            <span>[EKLENTİ]</span>
            <div>
              <h2>Eklentiler</h2>
              <p>Editör yeteneklerini genişletin</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* Tabs */}
        <div className="extension-manager-tabs">
          <button 
            className={`tab ${activeTab === 'available' ? 'active' : ''}`}
            onClick={() => setActiveTab('available')}
          >
            Keşfet
          </button>
          <button 
            className={`tab ${activeTab === 'installed' ? 'active' : ''}`}
            onClick={() => setActiveTab('installed')}
          >
            Yüklü
          </button>
        </div>

        {/* Content */}
        <div className="extension-manager-content">
          {activeTab === 'available' && (
            <div className="extensions-list">
              {availableExtensions.map((ext) => {
                const isActive = extensions[ext.id]?.active;
                return (
                  <div key={ext.id} className="extension-row">
                    <div className="extension-icon-wrapper">
                      {ext.icon}
                    </div>
                    <div className="extension-details">
                      <div className="extension-header-row">
                        <h3>{ext.name}</h3>
                        <span className="extension-version">v{ext.version}</span>
                      </div>
                      <p className="extension-description">{ext.description}</p>
                      <div className="extension-meta-row">
                        <span className="extension-author">{ext.author}</span>
                        <span className="meta-separator">•</span>
                        <span className="extension-downloads">
                          ↓ {ext.downloads}
                        </span>
                        <span className="meta-separator">•</span>
                        <span className="extension-rating">
                          ★ {ext.rating}
                        </span>
                      </div>
                    </div>
                    <div className="extension-action">
                      <button 
                        className={`toggle-btn ${isActive ? 'active' : ''}`}
                        onClick={() => onToggleExtension(ext.id)}
                      >
                        {isActive ? '[✓] Aktif' : 'Etkinleştir'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'installed' && (
            <div className="installed-list">
              {Object.entries(extensions)
                .filter(([_, ext]) => ext.active)
                .map(([id, ext]) => {
                  const extData = availableExtensions.find(e => e.id === id);
                  return (
                    <div key={id} className="extension-row installed">
                      <div className="extension-icon-wrapper">
                        {extData?.icon || '[EXT]'}
                      </div>
                      <div className="extension-details">
                        <div className="extension-header-row">
                          <h3>{ext.name}</h3>
                          <span className="extension-badge active">AKTİF</span>
                        </div>
                        <p className="extension-description">{ext.description}</p>
                      </div>
                      <div className="extension-action">
                        <button 
                          className="toggle-btn active"
                          onClick={() => onToggleExtension(id)}
                        >
                          Devre Dışı Bırak
                        </button>
                      </div>
                    </div>
                  );
                })}
              {Object.keys(extensions).filter(id => extensions[id].active).length === 0 && (
                <div className="no-extensions">
                  <span>[EKLENTİ]</span>
                  <p>Aktif eklenti yok</p>
                  <span>Keşfet sekmesinden eklenti ekleyin</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExtensionManager;
