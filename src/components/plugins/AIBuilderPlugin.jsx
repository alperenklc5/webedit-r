import React, { useState, useEffect } from 'react';
import AIModelSelector from './AIModelSelector';

// ── System prompts ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPTS = {
  site: `You are an expert web developer. Create a complete, professional, modern single-page HTML website.

REQUIREMENTS:
- Complete HTML5 with proper DOCTYPE and <head>
- All CSS inside a single <style> tag in <head> — no external stylesheets
- Mobile-first responsive design using flexbox/grid
- Professional color palette with gradients
- Clean typography (system font stack)
- Semantic HTML5 elements
- Smooth CSS transitions and animations
- Sections: navigation, hero with CTA, features/content, footer
- No external dependencies (no Bootstrap, no Google Fonts CDN, no JS libraries)
- Return ONLY the complete HTML — no markdown fences, no explanations`,

  code: `You are an expert web developer. Write clean, modern HTML/CSS code.

REQUIREMENTS:
- Complete, working HTML snippet or section
- Use inline <style> or embedded CSS
- Modern CSS (flexbox, grid, custom properties)
- Responsive design
- Semantic HTML
- Return ONLY the code — no markdown fences, no explanations`,

  quick: `You are a web development assistant. Return only the result code — no explanations, no markdown.`,
};

// ── AI API callers ─────────────────────────────────────────────────────────────
async function callGroq(prompt, system, history, apiKey) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: system },
        ...history,
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Groq API ${res.status}`);
  }
  return (await res.json()).choices[0].message.content;
}

async function callClaude(prompt, system, history, apiKey) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system,
      messages: [
        ...history.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
        { role: 'user', content: prompt },
      ],
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Claude API ${res.status}`);
  }
  return (await res.json()).content[0].text;
}

async function callOpenAI(prompt, system, history, apiKey) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: system },
        ...history,
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI API ${res.status}`);
  }
  return (await res.json()).choices[0].message.content;
}

async function callGemini(prompt, system, history, apiKey) {
  // Build multi-turn contents array from history
  const contents = [];
  for (const msg of history) {
    // Gemini roles: 'user' | 'model'
    contents.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    });
  }
  // Append current turn (system injected as preamble on first user message)
  const currentText = contents.length === 0 ? system + '\n\n' + prompt : prompt;
  contents.push({ role: 'user', parts: [{ text: currentText }] });

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gemini API ${res.status}`);
  }
  return (await res.json()).candidates[0].content.parts[0].text;
}

// Strip markdown fences from AI output (handles html/jsx/javascript/tsx/etc.)
function extractCode(raw) {
  const fenceMatch = raw.match(/```(?:[a-z]*)\n?([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();
  return raw.trim();
}

// ── Model meta ─────────────────────────────────────────────────────────────────
const MODEL_META = {
  groq:   { name: 'Groq · Llama 3.3', color: '#f97316', icon: '🔥' },
  claude: { name: 'Claude Sonnet 4',  color: '#8b5cf6', icon: '🤖' },
  openai: { name: 'GPT-4o',           color: '#10b981', icon: '🧠' },
  gemini: { name: 'Gemini 1.5 Pro',   color: '#3b82f6', icon: '✨' },
};

const QUICK_ACTIONS = [
  { label: 'Hero Section',    prompt: 'Create a modern full-width hero section with a heading, subheading, and two CTA buttons' },
  { label: 'Responsive Navbar', prompt: 'Create a responsive navigation bar with logo, menu links, and a CTA button' },
  { label: 'Footer',          prompt: 'Create a professional footer with columns: links, social icons, and copyright' },
  { label: 'Contact Form',    prompt: 'Create a styled contact form with name, email, message fields and a submit button' },
  { label: 'Testimonials',    prompt: 'Create a testimonials section with 3 review cards in a responsive grid' },
  { label: 'Pricing Table',   prompt: 'Create a 3-column pricing table with Free, Pro, and Enterprise plans' },
];

// ── Component ──────────────────────────────────────────────────────────────────
const AIBuilderPlugin = ({ editor, onClose }) => {
  const [aiConfig, setAiConfig] = useState(null);
  const [showSelector, setShowSelector] = useState(false);
  const [activeTab, setActiveTab] = useState('site');
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const raw = localStorage.getItem('webeditr_ai_config');
    if (raw) {
      try { setAiConfig(JSON.parse(raw)); }
      catch { setShowSelector(true); }
    } else {
      setShowSelector(true);
    }

    // Pick up prompt queued from terminal
    const queued = localStorage.getItem('webeditr_ai_terminal_prompt');
    const queuedMode = localStorage.getItem('webeditr_ai_terminal_mode') || 'code';
    if (queued) {
      localStorage.removeItem('webeditr_ai_terminal_prompt');
      localStorage.removeItem('webeditr_ai_terminal_mode');
      setPrompt(queued);
      setActiveTab(queuedMode === 'site' ? 'site' : 'code');
    }
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2800);
  };

  const generate = async (userPrompt, mode) => {
    if (!userPrompt.trim()) return;
    setGenerating(true);
    setResult(null);
    setErrorMsg('');

    const system = SYSTEM_PROMPTS[mode] ?? SYSTEM_PROMPTS.quick;
    const key = aiConfig.apiKeys[aiConfig.selectedModel];

    try {
      let raw;
      switch (aiConfig.selectedModel) {
        case 'groq':   raw = await callGroq(userPrompt, system, history, key); break;
        case 'claude': raw = await callClaude(userPrompt, system, history, key); break;
        case 'openai': raw = await callOpenAI(userPrompt, system, history, key); break;
        case 'gemini': raw = await callGemini(userPrompt, system, history, key); break;
        default: throw new Error('Bilinmeyen model');
      }

      const code = extractCode(raw);
      setResult({ code, raw });
      // Store extracted code (not raw) in history so follow-up context is cleaner
      setHistory(h => [...h,
        { role: 'user', content: userPrompt },
        { role: 'assistant', content: code },
      ]);
    } catch (err) {
      console.error('AI error:', err);
      setErrorMsg(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const applyToEditor = (mode) => {
    if (!result?.code) return;

    if (mode === 'site') {
      // Update React state (triggers GrapesJSEditor re-render)
      editor.setThemeHTML?.(result.code);
      // Switch to grapes mode so the iframe is actually mounted
      editor.setEditorMode?.('grapes');
      // Also write to iframe directly for immediate effect
      try {
        const iframe = document.querySelector('iframe[title="Theme Canvas"]');
        if (iframe?.contentDocument) {
          iframe.contentDocument.open();
          iframe.contentDocument.write(result.code);
          iframe.contentDocument.close();
        }
      } catch { /* ignore */ }
      localStorage.setItem('webeditr_project', result.code);
      showToast('✅ Site editöre yüklendi!');
      onClose?.();
      return;
    }

    // code / quick → append to body
    let baseHTML = editor?.themeHTML || '';
    if (!baseHTML) {
      try { baseHTML = localStorage.getItem('webeditr_project') || ''; } catch { /* ignore */ }
    }
    if (!baseHTML) {
      showToast('❌ Önce bir tema yükleyin');
      return;
    }
    const parser = new DOMParser();
    const doc = parser.parseFromString(baseHTML, 'text/html');
    const wrapper = doc.createElement('div');
    wrapper.innerHTML = result.code;
    Array.from(wrapper.childNodes).forEach(n => doc.body.appendChild(n));
    const merged = doc.documentElement.outerHTML;
    editor.setThemeHTML?.(merged);
    editor.setEditorMode?.('grapes');
    try {
      const iframe = document.querySelector('iframe[title="Theme Canvas"]');
      if (iframe?.contentDocument) {
        iframe.contentDocument.open();
        iframe.contentDocument.write(merged);
        iframe.contentDocument.close();
      }
    } catch { /* ignore */ }
    localStorage.setItem('webeditr_project', merged);
    showToast('✅ Kod temaya eklendi!');
  };

  const copyCode = () => {
    if (!result?.code) return;
    navigator.clipboard.writeText(result.code);
    showToast('✅ Kopyalandı!');
  };

  // ── Model selector screen ──────────────────────────────────────────────────
  if (showSelector) {
    return (
      <AIModelSelector
        onComplete={(config) => {
          setAiConfig(config);
          setShowSelector(false);
        }}
      />
    );
  }

  if (!aiConfig) {
    return <div style={{ color: 'white', padding: '40px', textAlign: 'center' }}>Yükleniyor…</div>;
  }

  const meta = MODEL_META[aiConfig.selectedModel] ?? MODEL_META.groq;

  const tabBtn = (id, label) => (
    <button
      key={id}
      onClick={() => { setActiveTab(id); setResult(null); setPrompt(''); setErrorMsg(''); setHistory([]); }}
      style={{
        flex: 1, padding: '11px',
        background: activeTab === id ? '#1f2937' : 'transparent',
        color: 'white', border: 'none', borderRadius: '6px',
        fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s',
      }}
    >
      {label}
    </button>
  );

  const promptArea = (placeholder, rows, mode) => (
    <>
      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) generate(prompt, mode); }}
        style={{
          width: '100%', padding: '12px', background: '#1f2937',
          color: 'white', border: '2px solid #4b5563', borderRadius: '8px',
          fontSize: '14px', fontFamily: 'inherit', resize: 'vertical',
          lineHeight: '1.5', boxSizing: 'border-box',
        }}
      />
      <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
        Ctrl+Enter ile gönder
      </div>
      <button
        onClick={() => generate(prompt, mode)}
        disabled={!prompt.trim() || generating}
        style={{
          marginTop: '12px', width: '100%', padding: '14px',
          background: prompt.trim() && !generating
            ? `linear-gradient(135deg, ${meta.color}cc 0%, ${meta.color} 100%)`
            : '#4b5563',
          color: 'white', border: 'none', borderRadius: '8px',
          fontSize: '15px', fontWeight: '700',
          cursor: prompt.trim() && !generating ? 'pointer' : 'not-allowed',
          opacity: prompt.trim() && !generating ? 1 : 0.5,
          transition: 'all 0.2s',
        }}
      >
        {generating ? '⏳ Oluşturuluyor…' : mode === 'site' ? '🚀 Site Oluştur' : '✍️ Kod Yaz'}
      </button>
    </>
  );

  return (
    <div style={{ color: 'white' }}>
      {/* Toast */}
      {toastMsg && (
        <div style={{
          position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)',
          background: '#1f2937', color: 'white', padding: '12px 24px',
          borderRadius: '8px', fontSize: '14px', fontWeight: '600',
          zIndex: 99999, boxShadow: '0 4px 12px rgba(0,0,0,0.4)', border: '1px solid #374151',
        }}>
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${meta.color}cc 0%, ${meta.color} 100%)`,
        padding: '24px', borderRadius: '12px', marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '44px', marginBottom: '10px' }}>{meta.icon}</div>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '24px', fontWeight: '700' }}>AI Builder</h3>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>{meta.name} ile çalışıyor</p>
          </div>
          <button
            onClick={() => { setShowSelector(true); setResult(null); setPrompt(''); setErrorMsg(''); setHistory([]); }}
            style={{
              padding: '8px 14px', background: 'rgba(255,255,255,0.2)', color: 'white',
              border: 'none', borderRadius: '8px', fontSize: '13px',
              fontWeight: '600', cursor: 'pointer', backdropFilter: 'blur(6px)',
            }}
          >
            ⚙️ Model Değiştir
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '6px', marginBottom: '20px',
        background: '#374151', padding: '6px', borderRadius: '8px',
      }}>
        {tabBtn('site',  '🎨 Site Builder')}
        {tabBtn('code',  '💻 Kod Yazıcı')}
        {tabBtn('quick', '⚡ Hızlı')}
      </div>

      {/* Site Builder */}
      {activeTab === 'site' && (
        <div style={{ background: '#374151', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>🎨 Site Tanımı</h4>
          <p style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#9ca3af', lineHeight: '1.6' }}>
            Nasıl bir site istediğinizi anlatın — tüm HTML sıfırdan oluşturulacak
          </p>
          {promptArea(
            'Örn: Modern bir restoran sitesi, menü bölümü, galeri ve iletişim formu olsun. Koyu tema, altın renkler.',
            6, 'site'
          )}
        </div>
      )}

      {/* Code Writer */}
      {activeTab === 'code' && (
        <div style={{ background: '#374151', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>💻 Kod Talebi</h4>
          <p style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#9ca3af', lineHeight: '1.6' }}>
            Bir bileşen veya bölüm isteyin — mevcut temaya eklenir
          </p>
          {promptArea(
            'Örn: Create a responsive pricing table with 3 columns: Free, Pro, Enterprise. Include feature lists and CTA buttons.',
            5, 'code'
          )}
        </div>
      )}

      {/* Quick Actions */}
      {activeTab === 'quick' && (
        <div style={{ background: '#374151', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>⚡ Hızlı Bileşenler</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {QUICK_ACTIONS.map((a, i) => (
              <button
                key={i}
                onClick={() => { setPrompt(a.prompt); generate(a.prompt, 'quick'); }}
                disabled={generating}
                style={{
                  padding: '14px 12px', background: '#1f2937', color: 'white',
                  border: '2px solid #4b5563', borderRadius: '8px',
                  fontSize: '14px', fontWeight: '600', cursor: generating ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s', textAlign: 'left', opacity: generating ? 0.5 : 1,
                }}
                onMouseEnter={e => { if (!generating) { e.currentTarget.style.borderColor = meta.color; e.currentTarget.style.transform = 'translateY(-2px)'; }}}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#4b5563'; e.currentTarget.style.transform = ''; }}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {errorMsg && (
        <div style={{
          padding: '14px 16px', background: '#fee2e2', color: '#991b1b',
          borderRadius: '8px', fontSize: '14px', marginBottom: '16px',
        }}>
          ❌ {errorMsg}
        </div>
      )}

      {/* Generating spinner */}
      {generating && (
        <div style={{
          background: '#374151', padding: '32px', borderRadius: '12px',
          textAlign: 'center', marginBottom: '20px',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>⏳</div>
          <p style={{ margin: 0, fontSize: '15px', color: '#9ca3af' }}>
            {meta.name} düşünüyor…
          </p>
        </div>
      )}

      {/* Result */}
      {result && !generating && (
        <div style={{ background: '#374151', padding: '20px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>✨ Sonuç</h4>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={copyCode}
                style={{
                  padding: '8px 14px', background: '#3b82f6', color: 'white',
                  border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                }}
              >
                📋 Kopyala
              </button>
              <button
                onClick={() => applyToEditor(activeTab)}
                style={{
                  padding: '8px 14px',
                  background: `linear-gradient(135deg, ${meta.color}cc 0%, ${meta.color} 100%)`,
                  color: 'white', border: 'none', borderRadius: '6px',
                  fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                }}
              >
                {activeTab === 'site' ? '🚀 Editöre Yükle' : '➕ Temaya Ekle'}
              </button>
            </div>
          </div>
          <pre style={{
            margin: 0, padding: '16px', background: '#1f2937', color: '#d1d5db',
            borderRadius: '8px', fontSize: '12px', overflow: 'auto', maxHeight: '400px',
            fontFamily: '"Fira Code", "Courier New", monospace', lineHeight: '1.5',
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          }}>
            {result.code}
          </pre>
          <button
            onClick={() => { setResult(null); setPrompt(''); setErrorMsg(''); }}
            style={{
              marginTop: '12px', width: '100%', padding: '10px',
              background: '#4b5563', color: 'white', border: 'none',
              borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
            }}
          >
            🔄 Yeni İstek
          </button>
        </div>
      )}
    </div>
  );
};

export default AIBuilderPlugin;
