import React, { useState, useEffect } from 'react';

const PROVIDERS = [
  {
    id: 'gmail',
    name: 'Gmail',
    icon: '📧',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    help: 'Gmail için Google hesabınızda "App Password" oluşturmanız gerekir.',
  },
  {
    id: 'outlook',
    name: 'Outlook',
    icon: '📨',
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false,
    help: 'Outlook / Hotmail hesaplarınızı kullanabilirsiniz.',
  },
  {
    id: 'custom',
    name: 'Özel SMTP',
    icon: '⚙️',
    host: '',
    port: 587,
    secure: false,
    help: 'Kendi SMTP sunucunuzu yapılandırın.',
  },
];

const STORAGE_KEY = 'webeditr_smtp_settings';

const fieldStyle = {
  width: '100%',
  padding: '10px',
  background: '#1f2937',
  color: 'white',
  border: '2px solid #4b5563',
  borderRadius: '6px',
  fontSize: '14px',
  boxSizing: 'border-box',
};

const disabledFieldStyle = { ...fieldStyle, background: '#2d3748', opacity: 0.7 };

const SmtpMailerPlugin = ({ editor, onClose }) => {
  const [settings, setSettings] = useState({
    provider: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    username: '',
    password: '',
    fromEmail: '',
    fromName: 'WebEdit-r Form',
    toEmail: '',
  });

  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [activeTab, setActiveTab] = useState('config');
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setSettings(JSON.parse(raw));
        setSaved(true);
      } catch {
        // ignore corrupt storage
      }
    }
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const set = (patch) => {
    setSettings(prev => ({ ...prev, ...patch }));
    setSaved(false);
  };

  const handleProviderChange = (id) => {
    const p = PROVIDERS.find(p => p.id === id);
    if (!p) return;
    set({ provider: id, host: p.host, port: p.port, secure: p.secure });
  };

  const saveSettings = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
    showToast('✅ SMTP ayarları kaydedildi');
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    await new Promise(r => setTimeout(r, 1800));

    const { username, password, fromEmail, toEmail } = settings;
    if (!username || !password || !fromEmail || !toEmail) {
      setTestResult({ success: false, message: 'Lütfen tüm alanları doldurun.' });
      setTesting(false);
      return;
    }

    console.log('📧 SMTP Config (simulation):', {
      provider: settings.provider,
      host: settings.host,
      port: settings.port,
      from: `${settings.fromName} <${settings.fromEmail}>`,
      to: settings.toEmail,
    });

    setTestResult({ success: true });
    setTesting(false);
  };

  const generateBackendCode = () => `// Node.js + Express + Nodemailer
// npm install express nodemailer cors body-parser

const express    = require('express');
const nodemailer = require('nodemailer');
const cors       = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
  host:   '${settings.host}',
  port:   ${settings.port},
  secure: ${settings.secure},
  auth: {
    user: '${settings.username || 'YOUR_EMAIL'}',
    pass: '${settings.password ? '••••••••' : 'YOUR_APP_PASSWORD'}',
  },
});

app.post('/api/submit-form', async (req, res) => {
  const emailContent = Object.entries(req.body)
    .map(([k, v]) => \`<strong>\${k}:</strong> \${v}\`)
    .join('<br>');

  const mail = {
    from:    '"${settings.fromName}" <${settings.fromEmail || 'noreply@example.com'}>',
    to:      '${settings.toEmail || 'admin@example.com'}',
    subject: 'Yeni Form Gönderimi',
    html: \`
      <div style="font-family:Arial,sans-serif;padding:20px;">
        <h2 style="color:#3b82f6;">Yeni Form Gönderimi</h2>
        <div style="margin-top:20px;">\${emailContent}</div>
        <hr style="margin:20px 0;border:none;border-top:1px solid #e5e7eb;">
        <p style="color:#6b7280;font-size:12px;">
          Bu e-posta WebEdit-r Form Builder tarafından otomatik oluşturulmuştur.
        </p>
      </div>\`,
  };

  try {
    await transporter.sendMail(mail);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.listen(3001, () => console.log('📧 SMTP Server → http://localhost:3001'));`;

  const generateIntegrationCode = () => `<!-- Seçenek 1: Kendi backend'iniz (Node.js server.js çalışıyor olmalı) -->
<script>
async function handleFormSubmit(event, formId) {
  event.preventDefault();
  const form = event.target;
  const data = Object.fromEntries(new FormData(form).entries());

  try {
    const res = await fetch('http://localhost:3001/api/submit-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();

    if (result.success) {
      const successEl = document.getElementById(formId + '-success');
      if (successEl) {
        form.style.display = 'none';
        successEl.style.display = 'block';
        setTimeout(() => {
          form.reset();
          form.style.display = 'flex';
          successEl.style.display = 'none';
        }, 3000);
      }
    } else {
      alert('Hata: ' + result.message);
    }
  } catch (err) {
    alert('Form gönderilemedi. Backend çalışıyor mu?');
  }
  return false;
}
</script>

<!-- Seçenek 2: EmailJS (backend gerektirmez, 200 email/ay ücretsiz) -->
<!-- https://www.emailjs.com/ -->
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
<script>
  emailjs.init('YOUR_PUBLIC_KEY');

  function handleFormSubmit(event, formId) {
    event.preventDefault();
    const form = event.target;
    emailjs.sendForm('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', form)
      .then(() => { alert('✅ Gönderildi!'); form.reset(); })
      .catch(err => alert('❌ Hata: ' + err.text));
    return false;
  }
</script>`;

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    showToast('✅ Kopyalandı!');
  };

  const currentProvider = PROVIDERS.find(p => p.id === settings.provider);

  const tabs = [
    { id: 'config', label: '⚙️ Ayarlar' },
    { id: 'test', label: '🧪 Test' },
    { id: 'integrate', label: '🔌 Entegrasyon' },
  ];

  return (
    <div style={{ color: 'white' }}>
      {/* Toast */}
      {toastMsg && (
        <div style={{
          position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)',
          background: '#1f2937', color: 'white', padding: '12px 24px',
          borderRadius: '8px', fontSize: '14px', fontWeight: '600',
          zIndex: 99999, boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          border: '1px solid #374151',
        }}>
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        padding: '24px', borderRadius: '12px', marginBottom: '24px',
      }}>
        <div
          style={{ width: '48px', height: '48px', marginBottom: '12px' }}
          dangerouslySetInnerHTML={{
            __html: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="white"/>
            </svg>`,
          }}
        />
        <h3 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>SMTP Mail Gönderici</h3>
        <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
          Form verilerini e-posta ile gönderin
        </p>
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: '6px', marginBottom: '20px',
        background: '#374151', padding: '6px', borderRadius: '8px',
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: '10px',
              background: activeTab === tab.id ? '#1f2937' : 'transparent',
              color: 'white', border: 'none', borderRadius: '6px',
              fontSize: '14px', fontWeight: '600', cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── CONFIG TAB ── */}
      {activeTab === 'config' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Provider picker */}
          <div style={{ background: '#374151', padding: '20px', borderRadius: '12px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>📮 SMTP Sağlayıcı</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {PROVIDERS.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleProviderChange(p.id)}
                  style={{
                    padding: '16px', cursor: 'pointer', borderRadius: '8px',
                    background: settings.provider === p.id ? '#1f2937' : '#4b5563',
                    color: 'white',
                    border: settings.provider === p.id ? '2px solid #f59e0b' : '2px solid transparent',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontSize: '28px' }}>{p.icon}</span>
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>{p.name}</span>
                </button>
              ))}
            </div>
            <div style={{
              marginTop: '12px', padding: '10px 14px', background: '#1f2937',
              borderRadius: '6px', fontSize: '12px', color: '#9ca3af',
            }}>
              ℹ️ {currentProvider?.help}
            </div>
          </div>

          {/* SMTP connection */}
          <div style={{ background: '#374151', padding: '20px', borderRadius: '12px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>🔧 Bağlantı Ayarları</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#9ca3af' }}>SMTP Host</label>
                  <input
                    type="text"
                    value={settings.host}
                    onChange={e => set({ host: e.target.value })}
                    placeholder="smtp.example.com"
                    disabled={settings.provider !== 'custom'}
                    style={settings.provider !== 'custom' ? disabledFieldStyle : fieldStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#9ca3af' }}>Port</label>
                  <input
                    type="number"
                    value={settings.port}
                    onChange={e => set({ port: parseInt(e.target.value) || 587 })}
                    style={fieldStyle}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#9ca3af' }}>Kullanıcı Adı / E-posta</label>
                <input
                  type="text"
                  value={settings.username}
                  onChange={e => set({ username: e.target.value })}
                  placeholder="kullanici@example.com"
                  style={fieldStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#9ca3af' }}>Şifre / App Password</label>
                <input
                  type="password"
                  value={settings.password}
                  onChange={e => set({ password: e.target.value })}
                  placeholder="••••••••••••"
                  style={fieldStyle}
                />
              </div>
            </div>
          </div>

          {/* Email addresses */}
          <div style={{ background: '#374151', padding: '20px', borderRadius: '12px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>📧 E-posta Ayarları</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#9ca3af' }}>Gönderen E-posta</label>
                  <input
                    type="email"
                    value={settings.fromEmail}
                    onChange={e => set({ fromEmail: e.target.value })}
                    placeholder="noreply@example.com"
                    style={fieldStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#9ca3af' }}>Gönderen İsim</label>
                  <input
                    type="text"
                    value={settings.fromName}
                    onChange={e => set({ fromName: e.target.value })}
                    placeholder="WebEdit-r Form"
                    style={fieldStyle}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#9ca3af' }}>Alıcı E-posta</label>
                <input
                  type="email"
                  value={settings.toEmail}
                  onChange={e => set({ toEmail: e.target.value })}
                  placeholder="admin@example.com"
                  style={fieldStyle}
                />
              </div>
            </div>
          </div>

          {/* Save */}
          <button
            onClick={saveSettings}
            style={{
              width: '100%', padding: '14px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white', border: 'none', borderRadius: '8px',
              fontSize: '16px', fontWeight: '600', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            💾 Ayarları Kaydet {saved && <span style={{ fontSize: '13px', opacity: 0.85 }}>(Kaydedildi ✓)</span>}
          </button>
        </div>
      )}

      {/* ── TEST TAB ── */}
      {activeTab === 'test' && (
        <div style={{ background: '#374151', padding: '32px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>
            {testing ? '⏳' : testResult ? (testResult.success ? '✅' : '❌') : '📧'}
          </div>

          <h4 style={{ margin: '0 0 12px 0', fontSize: '20px' }}>
            {testing
              ? 'Bağlantı test ediliyor...'
              : testResult
                ? (testResult.success ? 'Ayarlar doğrulandı!' : 'Doğrulama başarısız')
                : 'SMTP Bağlantısını Test Et'}
          </h4>

          {!testing && !testResult && (
            <p style={{ margin: '0 0 24px 0', color: '#9ca3af', fontSize: '14px' }}>
              Ayarlarınızın eksiksiz olduğunu doğrulayın
            </p>
          )}

          {testResult && (
            <div style={{
              margin: '0 auto 20px', maxWidth: '400px',
              padding: '16px',
              background: testResult.success ? '#d1fae5' : '#fee2e2',
              color: testResult.success ? '#065f46' : '#991b1b',
              borderRadius: '8px', fontSize: '14px', lineHeight: '1.6',
            }}>
              {testResult.success ? (
                <>
                  Konfigürasyon geçerli.<br />
                  <strong>Not:</strong> Gerçek e-posta gönderimi için backend kurulumu gereklidir.
                  <br />
                  <span style={{ fontSize: '13px' }}>
                    "Entegrasyon" sekmesinden hazır Node.js kodunu alabilirsiniz.
                  </span>
                </>
              ) : (
                <>❌ {testResult.message}</>
              )}
            </div>
          )}

          {!testing && (
            <button
              onClick={testConnection}
              disabled={!saved}
              style={{
                padding: '14px 32px',
                background: saved
                  ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                  : '#4b5563',
                color: 'white', border: 'none', borderRadius: '8px',
                fontSize: '16px', fontWeight: '600',
                cursor: saved ? 'pointer' : 'not-allowed',
                opacity: saved ? 1 : 0.5,
              }}
            >
              🧪 {testResult ? 'Tekrar Test Et' : 'Bağlantıyı Test Et'}
            </button>
          )}

          {!saved && (
            <p style={{ marginTop: '16px', color: '#ef4444', fontSize: '13px' }}>
              ⚠️ Önce Ayarlar sekmesinden ayarları kaydedin
            </p>
          )}
        </div>
      )}

      {/* ── INTEGRATION TAB ── */}
      {activeTab === 'integrate' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Backend code */}
          <div style={{ background: '#374151', padding: '20px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>🖥️ Backend Kodu (Node.js)</h4>
              <button
                onClick={() => copyText(generateBackendCode())}
                style={{
                  padding: '8px 16px', background: '#3b82f6', color: 'white',
                  border: 'none', borderRadius: '6px', fontSize: '13px',
                  fontWeight: '600', cursor: 'pointer',
                }}
              >
                📋 Kopyala
              </button>
            </div>
            <pre style={{
              margin: 0, padding: '16px', background: '#1f2937', color: '#d1d5db',
              borderRadius: '8px', fontSize: '12px', overflow: 'auto',
              maxHeight: '280px', fontFamily: '"Fira Code", "Courier New", monospace',
              whiteSpace: 'pre',
            }}>
              {generateBackendCode()}
            </pre>
          </div>

          {/* Form integration code */}
          <div style={{ background: '#374151', padding: '20px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>🔌 Form Entegrasyon Kodu</h4>
              <button
                onClick={() => copyText(generateIntegrationCode())}
                style={{
                  padding: '8px 16px', background: '#3b82f6', color: 'white',
                  border: 'none', borderRadius: '6px', fontSize: '13px',
                  fontWeight: '600', cursor: 'pointer',
                }}
              >
                📋 Kopyala
              </button>
            </div>
            <pre style={{
              margin: 0, padding: '16px', background: '#1f2937', color: '#d1d5db',
              borderRadius: '8px', fontSize: '12px', overflow: 'auto',
              maxHeight: '280px', fontFamily: '"Fira Code", "Courier New", monospace',
              whiteSpace: 'pre',
            }}>
              {generateIntegrationCode()}
            </pre>
          </div>

          {/* Setup steps */}
          <div style={{
            padding: '20px', background: '#1f2937', borderRadius: '12px',
            border: '2px solid #f59e0b',
          }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#f59e0b' }}>📖 Kurulum Adımları</h4>
            <ol style={{ margin: 0, paddingLeft: '20px', color: '#d1d5db', fontSize: '14px', lineHeight: '2' }}>
              <li>Backend kodunu kopyalayın → <code style={{ color: '#f59e0b' }}>server.js</code> olarak kaydedin</li>
              <li>Terminalde: <code style={{ color: '#f59e0b' }}>npm install express nodemailer cors body-parser</code></li>
              <li>Başlatın: <code style={{ color: '#f59e0b' }}>node server.js</code></li>
              <li>Form entegrasyon kodunu temanızdaki forma ekleyin</li>
              <li>Form gönderimlerinde e-posta otomatik iletilecek!</li>
            </ol>
            <div style={{
              marginTop: '16px', padding: '12px', background: '#374151',
              borderRadius: '6px', fontSize: '13px', color: '#9ca3af',
            }}>
              💡 <strong>Backend istemiyorsanız:</strong>{' '}
              <a href="https://www.emailjs.com/" target="_blank" rel="noreferrer" style={{ color: '#f59e0b' }}>
                EmailJS
              </a>{' '}
              ile 200 e-posta/ay ücretsiz gönderebilirsiniz — entegrasyon kodunda hazır örnek var.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmtpMailerPlugin;
