import React, { useState } from 'react';

const MODELS = [
  {
    id: 'groq',
    name: 'Groq',
    subtitle: 'Llama 3.3 70B',
    badge: 'Hızlı & Ücretsiz',
    badgeColor: '#10b981',
    color: '#f97316',
    keyLabel: 'Groq API Key',
    keyPlaceholder: 'gsk_...',
    keyLink: 'https://console.groq.com/keys',
    keyLinkText: 'console.groq.com',
    recommended: true,
    logo: (
      <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="10" fill="#f97316"/>
        <text x="24" y="32" textAnchor="middle" fontSize="22" fontWeight="bold" fill="white" fontFamily="sans-serif">G</text>
      </svg>
    ),
  },
  {
    id: 'claude',
    name: 'Claude',
    subtitle: 'Claude Sonnet 4',
    badge: 'En Yetenekli',
    badgeColor: '#8b5cf6',
    color: '#8b5cf6',
    keyLabel: 'Anthropic API Key',
    keyPlaceholder: 'sk-ant-...',
    keyLink: 'https://console.anthropic.com/',
    keyLinkText: 'console.anthropic.com',
    recommended: false,
    logo: (
      <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="10" fill="#8b5cf6"/>
        <text x="24" y="32" textAnchor="middle" fontSize="22" fontWeight="bold" fill="white" fontFamily="sans-serif">C</text>
      </svg>
    ),
  },
  {
    id: 'openai',
    name: 'OpenAI',
    subtitle: 'GPT-4o',
    badge: 'En Popüler',
    badgeColor: '#10b981',
    color: '#10b981',
    keyLabel: 'OpenAI API Key',
    keyPlaceholder: 'sk-...',
    keyLink: 'https://platform.openai.com/api-keys',
    keyLinkText: 'platform.openai.com',
    recommended: false,
    logo: (
      <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="10" fill="#10b981"/>
        <text x="24" y="32" textAnchor="middle" fontSize="20" fontWeight="bold" fill="white" fontFamily="sans-serif">AI</text>
      </svg>
    ),
  },
  {
    id: 'gemini',
    name: 'Gemini',
    subtitle: 'Gemini 1.5 Pro',
    badge: 'Google AI',
    badgeColor: '#3b82f6',
    color: '#3b82f6',
    keyLabel: 'Google AI API Key',
    keyPlaceholder: 'AIza...',
    keyLink: 'https://aistudio.google.com/app/apikey',
    keyLinkText: 'aistudio.google.com',
    recommended: false,
    logo: (
      <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="10" fill="#3b82f6"/>
        <text x="24" y="32" textAnchor="middle" fontSize="20" fontWeight="bold" fill="white" fontFamily="sans-serif">G</text>
      </svg>
    ),
  },
];

const AIModelSelector = ({ onComplete }) => {
  const [selected, setSelected] = useState('groq');
  const [apiKeys, setApiKeys] = useState({ groq: '', claude: '', openai: '', gemini: '' });
  const [error, setError] = useState('');

  const model = MODELS.find(m => m.id === selected);

  const handleConfirm = () => {
    const key = apiKeys[selected]?.trim();
    if (!key) {
      setError(`Lütfen ${model.keyLabel} girin.`);
      return;
    }
    setError('');
    const config = { selectedModel: selected, apiKeys };
    localStorage.setItem('webeditr_ai_config', JSON.stringify(config));
    onComplete(config);
  };

  return (
    <div style={{ color: 'white' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
        padding: '28px 24px', borderRadius: '12px', marginBottom: '24px', textAlign: 'center',
      }}>
        <div style={{ fontSize: '52px', marginBottom: '12px' }}>🤖</div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '700' }}>AI Builder Kurulumu</h3>
        <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
          Kullanmak istediğiniz AI modelini seçin ve API anahtarınızı girin
        </p>
      </div>

      {/* Model grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        {MODELS.map(m => (
          <button
            key={m.id}
            onClick={() => { setSelected(m.id); setError(''); }}
            style={{
              padding: '16px', background: selected === m.id ? '#1f2937' : '#374151',
              color: 'white', border: selected === m.id ? `2px solid ${m.color}` : '2px solid transparent',
              borderRadius: '10px', cursor: 'pointer', textAlign: 'left',
              transition: 'all 0.2s', position: 'relative',
            }}
          >
            {m.recommended && (
              <div style={{
                position: 'absolute', top: '8px', right: '8px',
                padding: '2px 8px', background: m.badgeColor, borderRadius: '10px',
                fontSize: '10px', fontWeight: '700',
              }}>
                {m.badge}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              {m.logo}
              <div>
                <div style={{ fontSize: '15px', fontWeight: '700' }}>{m.name}</div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>{m.subtitle}</div>
              </div>
            </div>
            {!m.recommended && (
              <div style={{
                display: 'inline-block', padding: '2px 8px',
                background: m.badgeColor + '33', color: m.badgeColor,
                borderRadius: '10px', fontSize: '11px', fontWeight: '600',
              }}>
                {m.badge}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* API Key input for selected model */}
      <div style={{ background: '#374151', padding: '20px', borderRadius: '12px', marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
          {model.keyLabel}
        </label>
        <input
          type="password"
          value={apiKeys[selected]}
          onChange={e => setApiKeys(k => ({ ...k, [selected]: e.target.value }))}
          placeholder={model.keyPlaceholder}
          style={{
            width: '100%', padding: '12px', background: '#1f2937',
            color: 'white', border: `2px solid ${error ? '#ef4444' : '#4b5563'}`,
            borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box',
          }}
        />
        {error && <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#ef4444' }}>{error}</p>}
        <p style={{ margin: '10px 0 0', fontSize: '13px', color: '#9ca3af' }}>
          API anahtarı:{' '}
          <a href={model.keyLink} target="_blank" rel="noreferrer" style={{ color: model.color }}>
            {model.keyLinkText}
          </a>
          {model.id === 'groq' && ' — ücretsiz hesapla başlayabilirsiniz'}
        </p>
      </div>

      <button
        onClick={handleConfirm}
        style={{
          width: '100%', padding: '14px',
          background: `linear-gradient(135deg, ${model.color}dd 0%, ${model.color} 100%)`,
          color: 'white', border: 'none', borderRadius: '10px',
          fontSize: '16px', fontWeight: '700', cursor: 'pointer',
        }}
      >
        ✅ {model.name} ile Başla
      </button>
    </div>
  );
};

export default AIModelSelector;
