import { useState } from 'react';
import './CodeImportModal.css';

const CodeImportModal = ({ isOpen, onClose, onImport }) => {
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [activeTab, setActiveTab] = useState('html');

  if (!isOpen) return null;

  const handleImport = () => {
    onImport({ html: htmlCode, css: cssCode });
    setHtmlCode('');
    setCssCode('');
    onClose();
  };

  const handleClose = () => {
    setHtmlCode('');
    setCssCode('');
    onClose();
  };

  const htmlPlaceholder = `<!-- HTML kodunuzu buraya yapıştırın -->
<!-- Örnek: ThemeForest, TemplateMonster'dan indirdiğiniz HTML -->

<div class="container">
  <h1>Merhaba Dünya</h1>
  <p>İçeriğiniz buraya...</p>
</div>`;

  const cssPlaceholder = `/* CSS kodunuzu buraya yapıştırın */

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #333;
  font-size: 32px;
}`;

  return (
    <div className="code-import-overlay" onClick={handleClose}>
      <div className="code-import-modal" onClick={(e) => e.stopPropagation()}>
        <div className="code-import-header">
          <h2>Koddan Tema Yükle</h2>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>

        <div className="code-import-tabs">
          <button 
            className={`tab ${activeTab === 'html' ? 'active' : ''}`}
            onClick={() => setActiveTab('html')}
          >
            HTML
          </button>
          <button 
            className={`tab ${activeTab === 'css' ? 'active' : ''}`}
            onClick={() => setActiveTab('css')}
          >
            CSS
          </button>
        </div>

        <div className="code-import-content">
          {activeTab === 'html' && (
            <div className="code-section">
              <label>HTML Kodu:</label>
              <textarea
                value={htmlCode}
                onChange={(e) => setHtmlCode(e.target.value)}
                placeholder={htmlPlaceholder}
                className="code-textarea"
              />
            </div>
          )}

          {activeTab === 'css' && (
            <div className="code-section">
              <label>CSS Kodu:</label>
              <textarea
                value={cssCode}
                onChange={(e) => setCssCode(e.target.value)}
                placeholder={cssPlaceholder}
                className="code-textarea"
              />
            </div>
          )}

          <div className="import-help">
            <h4>Nasıl kullanılır?</h4>
            <ol>
              <li>ThemeForest, TemplateMonster veya başka bir siteden ücretsiz HTML şablon indirin</li>
              <li>HTML dosyasını açın ve içeriği kopyalayın</li>
              <li>Yukarıdaki alana yapıştırın</li>
              <li>Varsa CSS kodunu CSS sekmesine yapıştırın</li>
              <li>Yükle butonuna tıklayın</li>
            </ol>
          </div>
        </div>

        <div className="code-import-footer">
          <button className="cancel-btn" onClick={handleClose}>İptal</button>
          <button className="import-btn" onClick={handleImport} disabled={!htmlCode.trim()}>
            [↓] Yükle
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodeImportModal;