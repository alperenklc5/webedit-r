import React, { useState } from 'react';

const TranslatorPlugin = ({ editor }) => {
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('tr');
  const [translating, setTranslating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
  ];

  const translateText = async (text, from, to) => {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.responseStatus === 200) {
        return data.responseData.translatedText;
      }
      return text;
    } catch {
      return text;
    }
  };

  const translateTheme = async () => {
    setTranslating(true);
    setProgress(0);
    setResults(null);

    const iframe = document.querySelector('iframe[title="Theme Canvas"]');
    if (!iframe || !iframe.contentDocument) {
      alert('Canvas bulunamadı!');
      setTranslating(false);
      return;
    }

    const doc = iframe.contentDocument;

    // Collect text nodes
    const textNodes = [];
    const walk = document.createTreeWalker(
      doc.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          if (!node.textContent.trim()) return NodeFilter.FILTER_REJECT;
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.tagName;
          if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );

    let node;
    while ((node = walk.nextNode())) {
      textNodes.push(node);
    }

    const translated = [];

    for (let i = 0; i < textNodes.length; i++) {
      const current = textNodes[i];
      const original = current.textContent.trim();

      if (original.length < 2) {
        setProgress(Math.round(((i + 1) / textNodes.length) * 100));
        continue;
      }

      const translatedText = await translateText(original, sourceLang, targetLang);

      if (translatedText !== original) {
        current.textContent = current.textContent.replace(original, translatedText);
        translated.push({ original, translated: translatedText });
      }

      setProgress(Math.round(((i + 1) / textNodes.length) * 100));

      // Rate limit: 200ms between requests
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    // Sync updated HTML back to editor
    const updatedHTML = '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
    editor.setThemeHTML?.(updatedHTML);

    setResults({
      total: textNodes.length,
      translated: translated.length,
      failed: textNodes.length - translated.length,
    });

    setTranslating(false);
  };

  return (
    <div style={{ color: 'white' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        padding: '24px',
        borderRadius: '12px',
        marginBottom: '24px',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌐</div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>Otomatik Çeviri</h3>
        <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
          Temadaki tüm metinleri seçtiğiniz dile çevirin
        </p>
      </div>

      {/* Language Selector */}
      <div style={{ background: '#374151', padding: '24px', borderRadius: '12px', marginBottom: '24px' }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>Dil Seçimi</h4>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#9ca3af' }}>
              Kaynak Dil
            </label>
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              style={{
                width: '100%', padding: '12px', background: '#1f2937', color: 'white',
                border: '2px solid #4b5563', borderRadius: '8px', fontSize: '14px', cursor: 'pointer',
              }}
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.flag} {lang.name}</option>
              ))}
            </select>
          </div>

          <div style={{ fontSize: '24px', color: '#3b82f6', marginTop: '20px' }}>→</div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#9ca3af' }}>
              Hedef Dil
            </label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              style={{
                width: '100%', padding: '12px', background: '#1f2937', color: 'white',
                border: '2px solid #4b5563', borderRadius: '8px', fontSize: '14px', cursor: 'pointer',
              }}
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.flag} {lang.name}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={() => { const t = sourceLang; setSourceLang(targetLang); setTargetLang(t); }}
          style={{
            width: '100%', marginTop: '12px', padding: '10px',
            background: '#4b5563', color: 'white', border: 'none',
            borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
          }}
        >
          🔄 Dilleri Değiştir
        </button>
      </div>

      {/* Translate Button */}
      {!translating && !results && (
        <button
          onClick={translateTheme}
          disabled={sourceLang === targetLang}
          style={{
            width: '100%', padding: '16px',
            background: sourceLang === targetLang
              ? '#4b5563'
              : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white', border: 'none', borderRadius: '12px',
            fontSize: '16px', fontWeight: '600',
            cursor: sourceLang === targetLang ? 'not-allowed' : 'pointer',
            opacity: sourceLang === targetLang ? 0.5 : 1,
          }}
        >
          🚀 Çeviriyi Başlat
        </button>
      )}

      {/* Progress */}
      {translating && (
        <div style={{ background: '#374151', padding: '24px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>Çeviri yapılıyor...</span>
            <span style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>{progress}%</span>
          </div>
          <div style={{ width: '100%', height: '12px', background: '#1f2937', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{
              width: `${progress}%`, height: '100%',
              background: 'linear-gradient(90deg, #3b82f6, #2563eb)',
              transition: 'width 0.3s',
            }} />
          </div>
        </div>
      )}

      {/* Results */}
      {results && (
        <div style={{ background: '#374151', padding: '24px', borderRadius: '12px' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>Çeviri Tamamlandı!</h4>
            <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>
              {results.translated} metin başarıyla çevrildi
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
            {[
              { value: results.total, label: 'Toplam Metin', color: '#3b82f6' },
              { value: results.translated, label: 'Çevrildi', color: '#10b981' },
              { value: results.failed, label: 'Atlandı', color: '#ef4444' },
            ].map(({ value, label, color }) => (
              <div key={label} style={{ background: '#1f2937', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color }}>{value}</div>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>{label}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => { setResults(null); setProgress(0); }}
            style={{
              width: '100%', padding: '12px', background: '#3b82f6', color: 'white',
              border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
            }}
          >
            ✨ Yeni Çeviri
          </button>
        </div>
      )}
    </div>
  );
};

export default TranslatorPlugin;
