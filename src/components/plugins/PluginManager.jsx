import React, { useState } from 'react';
import TranslatorPlugin from './TranslatorPlugin';
import SeoPlugin from './SeoPlugin';
import FormBuilderPlugin from './FormBuilderPlugin';
import SmtpMailerPlugin from './SmtpMailerPlugin';
const plugins = [
  {
    id: 'translator',
    name: 'Çevirmen',
    icon: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" fill="url(#transGradient)"/>
      <defs>
        <linearGradient id="transGradient" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0%" stop-color="#3b82f6" />
          <stop offset="100%" stop-color="#2563eb" />
        </linearGradient>
      </defs>
    </svg>`,
    description: 'Temayı gerçek zamanlı API ile otomatik çevir',
    color: '#3b82f6',
    component: TranslatorPlugin,
  },
  {
    id: 'seo',
    name: 'SEO Analiz',
    icon: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="url(#seoGradient)"/>
      <path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z" fill="url(#seoGradient)"/>
      <defs>
        <linearGradient id="seoGradient" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0%" stop-color="#10b981" />
          <stop offset="100%" stop-color="#059669" />
        </linearGradient>
      </defs>
    </svg>`,
    description: 'SEO skorunu kontrol et',
    color: '#10b981',
    component: SeoPlugin,
  },
  {
    id: 'form-builder',
    name: 'Form Oluşturucu',
    icon: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="url(#formGradient)"/>
      <path d="M7 7H17V9H7V7ZM7 11H17V13H7V11ZM7 15H14V17H7V15Z" fill="url(#formGradient)"/>
      <defs>
        <linearGradient id="formGradient" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0%" stop-color="#8b5cf6" />
          <stop offset="100%" stop-color="#7c3aed" />
        </linearGradient>
      </defs>
    </svg>`,
    description: 'Özel iletişim formları oluştur',
    color: '#8b5cf6',
    component: FormBuilderPlugin,
  },
  {
    id: 'smtp-mailer',
    name: 'SMTP Mail',
    icon: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="url(#smtpGradient)"/>
      <defs>
        <linearGradient id="smtpGradient" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0%" stop-color="#f59e0b" />
          <stop offset="100%" stop-color="#d97706" />
        </linearGradient>
      </defs>
    </svg>`,
    description: 'Form verilerini e-posta ile gönder',
    color: '#f59e0b',
    component: SmtpMailerPlugin,
  },
];

const PluginManager = ({ isOpen, onClose, editor }) => {
  const [activePlugin, setActivePlugin] = useState(null);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 10000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#1f2937', borderRadius: '16px', padding: '30px',
          width: '90%', maxWidth: '800px', maxHeight: '80vh', overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Puzzle SVG Icon */}
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4C2.9 5 2 5.9 2 7v3.8h1.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7s2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z"
                  fill="url(#puzzleGradient)"
                />
                <defs>
                  <linearGradient id="puzzleGradient" x1="0" y1="0" x2="24" y2="24">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
              </svg>
              <h2 style={{ margin: 0, color: 'white', fontSize: '24px', fontWeight: '700' }}>
                Eklentiler
              </h2>
            </div>
            <p style={{ margin: '5px 0 0 0', color: '#9ca3af', fontSize: '14px' }}>
              Editörü güçlendiren araçlar
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#374151', color: 'white', border: 'none',
              borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '20px',
            }}
          >
            ✕
          </button>
        </div>

        {!activePlugin ? (
          /* Plugin Grid */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {plugins.map((plugin) => (
              <div
                key={plugin.id}
                onClick={() => setActivePlugin(plugin)}
                style={{
                  background: '#374151', borderRadius: '12px', padding: '24px',
                  cursor: 'pointer', transition: 'all 0.2s', border: '2px solid transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = plugin.color;
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 12px 24px ${plugin.color}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  fontSize: '48px',
                  marginBottom: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {plugin.icon.startsWith('<svg') ? (
                    <div dangerouslySetInnerHTML={{ __html: plugin.icon }} />
                  ) : (
                    <span>{plugin.icon}</span>
                  )}
                </div>
                <h3 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '20px', fontWeight: '600' }}>
                  {plugin.name}
                </h3>
                <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px', lineHeight: '1.5' }}>
                  {plugin.description}
                </p>
              </div>
            ))}
          </div>
        ) : (
          /* Active Plugin View */
          <div>
            <button
              onClick={() => setActivePlugin(null)}
              style={{
                background: '#374151', color: 'white', border: 'none',
                borderRadius: '8px', padding: '8px 16px', cursor: 'pointer',
                marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              ← Geri
            </button>
            <activePlugin.component editor={editor} onClose={() => setActivePlugin(null)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PluginManager;
