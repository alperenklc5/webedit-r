import { useState, useEffect } from 'react';
import './SettingsPanel.css';

const SettingsPanel = ({ isOpen, onClose, editor }) => {
  const [settings, setSettings] = useState({
    title: '',
    favicon: '',
    description: '',
    author: '',
    keywords: '',
  });

  // Load current settings from editor when panel opens
  useEffect(() => {
    if (!isOpen || !editor) return;

    // Try to get existing meta tags from the editor's HTML
    const html = editor.getHtml() || '';
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    setSettings({
      title: doc.querySelector('title')?.textContent || '',
      favicon: doc.querySelector('link[rel="icon"]')?.getAttribute('href') || '',
      description: doc.querySelector('meta[name="description"]')?.getAttribute('content') || '',
      author: doc.querySelector('meta[name="author"]')?.getAttribute('content') || '',
      keywords: doc.querySelector('meta[name="keywords"]')?.getAttribute('content') || '',
    });
  }, [isOpen, editor]);

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!editor) return;

    // Get current HTML
    let html = editor.getHtml() || '';

    // Parse and update head section
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Update title
    if (settings.title) {
      let titleTag = doc.querySelector('title');
      if (!titleTag) {
        titleTag = doc.createElement('title');
        doc.head.appendChild(titleTag);
      }
      titleTag.textContent = settings.title;
    }

    // Update favicon
    if (settings.favicon) {
      let faviconTag = doc.querySelector('link[rel="icon"]');
      if (!faviconTag) {
        faviconTag = doc.createElement('link');
        faviconTag.setAttribute('rel', 'icon');
        doc.head.appendChild(faviconTag);
      }
      faviconTag.setAttribute('href', settings.favicon);
      faviconTag.setAttribute('type', 'image/x-icon');
    }

    // Update meta description
    if (settings.description) {
      let descTag = doc.querySelector('meta[name="description"]');
      if (!descTag) {
        descTag = doc.createElement('meta');
        descTag.setAttribute('name', 'description');
        doc.head.appendChild(descTag);
      }
      descTag.setAttribute('content', settings.description);
    }

    // Update meta author
    if (settings.author) {
      let authorTag = doc.querySelector('meta[name="author"]');
      if (!authorTag) {
        authorTag = doc.createElement('meta');
        authorTag.setAttribute('name', 'author');
        doc.head.appendChild(authorTag);
      }
      authorTag.setAttribute('content', settings.author);
    }

    // Update meta keywords
    if (settings.keywords) {
      let keywordsTag = doc.querySelector('meta[name="keywords"]');
      if (!keywordsTag) {
        keywordsTag = doc.createElement('meta');
        keywordsTag.setAttribute('name', 'keywords');
        doc.head.appendChild(keywordsTag);
      }
      keywordsTag.setAttribute('content', settings.keywords);
    }

    // Serialize back to HTML
    const serializer = new XMLSerializer();
    const updatedHtml = serializer.serializeToString(doc);

    // Update editor content
    editor.setComponents(updatedHtml);

    onClose();
  };

  const handleReset = () => {
    setSettings({
      title: '',
      favicon: '',
      description: '',
      author: '',
      keywords: '',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="settings-panel-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="settings-panel-header">
          <h2>⚙️ Site Ayarları</h2>
          <p>SEO ve meta verilerini yönetin</p>
          <button className="settings-panel-close" onClick={onClose}>×</button>
        </div>

        {/* Content */}
        <div className="settings-panel-content">
          <div className="settings-section">
            <h3>🌐 Temel Bilgiler</h3>

            <div className="setting-field">
              <label htmlFor="site-title">
                Sayfa Başlığı (Title)
                <span className="field-hint">Tarayıcı sekmesinde görünür</span>
              </label>
              <input
                type="text"
                id="site-title"
                value={settings.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Örn: Web Sitem - Ana Sayfa"
              />
            </div>

            <div className="setting-field">
              <label htmlFor="site-favicon">
                Favicon URL
                <span className="field-hint">.ico, .png veya .svg formatında</span>
              </label>
              <input
                type="text"
                id="site-favicon"
                value={settings.favicon}
                onChange={(e) => handleChange('favicon', e.target.value)}
                placeholder="https://example.com/favicon.ico"
              />
              {settings.favicon && (
                <div className="favicon-preview">
                  <img src={settings.favicon} alt="Favicon preview" onError={(e) => e.target.style.display = 'none'} />
                </div>
              )}
            </div>
          </div>

          <div className="settings-section">
            <h3>🔍 SEO Meta Etiketleri</h3>

            <div className="setting-field">
              <label htmlFor="site-description">
                Meta Açıklama (Description)
                <span className="field-hint">Google arama sonuçlarında görünür</span>
              </label>
              <textarea
                id="site-description"
                value={settings.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Site içeriğinin kısa özeti..."
                rows={3}
              />
              <div className="char-count">
                {settings.description.length} / 160 karakter (önerilen)
              </div>
            </div>

            <div className="setting-field">
              <label htmlFor="site-keywords">
                Anahtar Kelimeler (Keywords)
                <span className="field-hint">Virgülle ayırarak yazın</span>
              </label>
              <input
                type="text"
                id="site-keywords"
                value={settings.keywords}
                onChange={(e) => handleChange('keywords', e.target.value)}
                placeholder="web tasarım, portfolyo, blog"
              />
            </div>

            <div className="setting-field">
              <label htmlFor="site-author">
                Yazar (Author)
                <span className="field-hint">Site sahibi veya kurum</span>
              </label>
              <input
                type="text"
                id="site-author"
                value={settings.author}
                onChange={(e) => handleChange('author', e.target.value)}
                placeholder="Örn: Ahmet Yılmaz"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="settings-panel-footer">
          <button className="reset-btn" onClick={handleReset}>
            🔄 Sıfırla
          </button>
          <div className="footer-actions">
            <button className="cancel-btn" onClick={onClose}>
              İptal
            </button>
            <button className="save-btn" onClick={handleSave}>
              💾 Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;