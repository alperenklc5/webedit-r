import { useState } from 'react';
import './TemplateModal.css';

const templates = [
  {
    id: 'empty',
    name: 'Boş Proje',
    description: 'Sıfırdan başlayın',
    thumbnail: '□',
    html: '<div style="padding: 40px; text-align: center;"><h1>Yeni Proje</h1><p>İçeriğinizi buraya ekleyin</p></div>',
    css: '',
  },
  {
    id: 'startup',
    name: 'Startup',
    description: 'Modern girişimci sayfası',
    thumbnail: '🚀',
    html: `
      <nav style="background: #252526; padding: 15px 30px; display: flex; justify-content: space-between; align-items: center;">
        <div style="color: #f0f0f0; font-size: 20px; font-weight: 600;">Startup</div>
        <div style="display: flex; gap: 20px;">
          <a href="#" style="color: #cccccc; text-decoration: none;">Özellikler</a>
          <a href="#" style="color: #cccccc; text-decoration: none;">Fiyatlar</a>
          <a href="#" style="color: #cccccc; text-decoration: none;">İletişim</a>
        </div>
      </nav>
      <header style="background: linear-gradient(135deg, #007acc 0%, #005a9e 100%); padding: 80px 20px; text-align: center; color: white;">
        <h1 style="font-size: 48px; margin-bottom: 20px;">Geleceği İnşa Edin</h1>
        <p style="font-size: 20px; margin-bottom: 30px;">Modern çözümlerle işinizi büyütün</p>
        <button style="padding: 15px 30px; background: white; color: #007acc; border: none; font-size: 16px; cursor: pointer;">Başlayın</button>
      </header>
      <section style="padding: 60px 20px; text-align: center;">
        <h2 style="margin-bottom: 40px;">Özellikler</h2>
        <div style="display: flex; justify-content: center; gap: 40px; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 250px; max-width: 300px; padding: 30px;">
            <h3>⚡ Hızlı</h3>
            <p>Saniyeler içinde yüklenir</p>
          </div>
          <div style="flex: 1; min-width: 250px; max-width: 300px; padding: 30px;">
            <h3>🔒 Güvenli</h3>
            <p>Enterprise güvenlik</p>
          </div>
          <div style="flex: 1; min-width: 250px; max-width: 300px; padding: 30px;">
            <h3>📱 Responsive</h3>
            <p>Tüm cihazlarda mükemmel</p>
          </div>
        </div>
      </section>
    `,
    css: 'body { font-family: "Segoe UI", sans-serif; margin: 0; }',
  },
  {
    id: 'blog',
    name: 'Blog',
    description: 'Kişisel blog şablonu',
    thumbnail: '📝',
    html: `
      <header style="background: #252526; padding: 20px; text-align: center; border-bottom: 1px solid #3e3e42;">
        <h1 style="color: #f0f0f0; margin: 0;">Blog Adı</h1>
        <p style="color: #969696; margin: 10px 0 0 0;">Düşünceler, fikirler ve daha fazlası</p>
      </header>
      <div style="max-width: 800px; margin: 0 auto; padding: 40px 20px;">
        <article style="margin-bottom: 40px; padding-bottom: 40px; border-bottom: 1px solid #eee;">
          <h2 style="color: #333;">İlk Blog Yazım</h2>
          <p style="color: #666; font-size: 14px;">1 Ocak 2024</p>
          <p style="line-height: 1.6;">Blog yazısı içeriği buraya gelecek. Düzenlemek için tıklayın...</p>
          <a href="#" style="color: #007acc;">Devamını oku →</a>
        </article>
        <article style="margin-bottom: 40px;">
          <h2 style="color: #333;">İkinci Blog Yazım</h2>
          <p style="color: #666; font-size: 14px;">2 Ocak 2024</p>
          <p style="line-height: 1.6;">Başka bir blog yazısı içeriği...</p>
          <a href="#" style="color: #007acc;">Devamını oku →</a>
        </article>
      </div>
    `,
    css: 'body { font-family: "Segoe UI", sans-serif; margin: 0; background: #ffffff; }',
  },
  {
    id: 'portfolio',
    name: 'Portfolyo',
    description: 'Profesyonel portfolyo sitesi',
    thumbnail: '💼',
    html: `
      <div style="min-height: 100vh; background: #1e1e1e;">
        <nav style="padding: 20px 40px; display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #f0f0f0; font-size: 24px; font-weight: bold;">Ad Soyad</span>
          <div style="display: flex; gap: 30px;">
            <a href="#" style="color: #cccccc; text-decoration: none;">Hakkımda</a>
            <a href="#" style="color: #cccccc; text-decoration: none;">Projeler</a>
            <a href="#" style="color: #cccccc; text-decoration: none;">İletişim</a>
          </div>
        </nav>
        <section style="padding: 80px 40px; text-align: center;">
          <h1 style="color: #f0f0f0; font-size: 56px; margin-bottom: 20px;">Merhaba, ben <span style="color: #007acc;">tasarımcı</span></h1>
          <p style="color: #969696; font-size: 20px; max-width: 600px; margin: 0 auto;">Kullanıcı deneyimi ve arayüz tasarımı konusunda uzman</p>
        </section>
        <section style="padding: 60px 40px;">
          <h2 style="color: #f0f0f0; text-align: center; margin-bottom: 40px;">Projelerim</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; max-width: 1200px; margin: 0 auto;">
            <div style="background: #252526; padding: 30px; border: 1px solid #3e3e42;">
              <h3 style="color: #f0f0f0;">Proje 1</h3>
              <p style="color: #969696;">Proje açıklaması</p>
            </div>
            <div style="background: #252526; padding: 30px; border: 1px solid #3e3e42;">
              <h3 style="color: #f0f0f0;">Proje 2</h3>
              <p style="color: #969696;">Proje açıklaması</p>
            </div>
            <div style="background: #252526; padding: 30px; border: 1px solid #3e3e42;">
              <h3 style="color: #f0f0f0;">Proje 3</h3>
              <p style="color: #969696;">Proje açıklaması</p>
            </div>
          </div>
        </section>
      </div>
    `,
    css: 'body { font-family: "Segoe UI", sans-serif; margin: 0; }',
  },
];

const TemplateModal = ({ isOpen, onSelect, onClose }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  if (!isOpen) return null;

  const handleSelect = (template) => {
    setSelectedTemplate(template.id);
    onSelect(template);
  };

  return (
    <div className="template-modal-overlay" onClick={onClose}>
      <div className="template-modal" onClick={(e) => e.stopPropagation()}>
        <div className="template-modal-header">
          <h2>Şablon Seç</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="template-modal-content">
          <div className="template-grid">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
                onClick={() => handleSelect(template)}
              >
                <div className="template-thumbnail">{template.thumbnail}</div>
                <div className="template-info">
                  <h3>{template.name}</h3>
                  <p>{template.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateModal;
