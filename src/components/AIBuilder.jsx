import { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './AIBuilder.css';

const AIBuilder = ({ isOpen, onClose, editor }) => {
  const [apiKey, setApiKey] = useState('');
  const [tempApiKey, setTempApiKey] = useState('');
  const [provider, setProvider] = useState('google'); // 'google' or 'openai'
  const [messages, setMessages] = useState([]); // { role: 'user'|'ai', text: '...' }
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load saved key/provider on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('ai_api_key');
    const savedProvider = localStorage.getItem('ai_provider') || 'google';
    if (savedKey) {
      setApiKey(savedKey);
      setTempApiKey(savedKey);
    }
    setProvider(savedProvider);
  }, []);

  // Focus input when chat view opens
  useEffect(() => {
    if (apiKey && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [apiKey]);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Save API key
  const handleSaveApiKey = () => {
    if (!tempApiKey.trim()) {
      setError('Lütfen bir API anahtarı girin');
      return;
    }
    localStorage.setItem('ai_api_key', tempApiKey);
    localStorage.setItem('ai_provider', provider);
    setApiKey(tempApiKey);
    setError('');
  };

  // Handle provider change
  const handleProviderChange = (newProvider) => {
    setProvider(newProvider);
    localStorage.setItem('ai_provider', newProvider);
    // Clear temp key when switching providers as formats differ
    setTempApiKey('');
    setError('');
  };

  // Clear API key
  const handleClearApiKey = () => {
    localStorage.removeItem('ai_api_key');
    localStorage.removeItem('ai_provider');
    setApiKey('');
    setTempApiKey('');
    setMessages([]);
    setShowSettings(false);
    setError('');
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Generate website using selected provider with context
  const handleSend = async () => {
    if (!input.trim() || !editor) return;

    // 1. Add User Message to UI
    const newMessages = [...messages, { role: 'user', text: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setError('');

    try {
      // 2. Capture Current Context (The most critical part)
      const currentHtml = editor.getHtml() || '';
      const isEmptyCanvas = !currentHtml || currentHtml.length < 50 || currentHtml.trim() === '<body></body>';

      let systemPrompt = '';

      if (isEmptyCanvas) {
        // CREATION MODE (Canvas is empty)
        systemPrompt = `You are an expert UI/UX Designer using Tailwind CSS.

USER REQUEST: "${input}"

**STRICT VISUAL RULES (DO NOT IGNORE):**

1. **NO BROKEN IMAGES:**
   * NEVER use 'source.unsplash.com'. It is broken.
   * **ALWAYS USE:** 'https://picsum.photos/seed/' + Math.floor(Math.random() * 1000) + '/800/600' for generic images.
   * Example: <img src="https://picsum.photos/seed/42/800/600" class="w-full h-64 object-cover rounded-xl shadow-lg" />

2. **NO HUGE GAPS (LAYOUT):**
   * **FORBIDDEN CLASS:** Do NOT use \`h-screen\` or \`min-h-screen\` (unless explicitly asked for a fullscreen hero).
   * **USE PADDING INSTEAD:** Use \`py-16\` or \`py-24\` to create spacing. This ensures the content dictates the height, avoiding empty whitespace.

3. **CONTENT DENSITY:**
   * Don't leave huge empty areas. If you use a grid, fill it with at least 3 cards.
   * Ensure text has high contrast (e.g., if bg is dark, text must be white/gray-200).

4. **OUTPUT:** Return ONLY raw HTML inside <body>.`;
      } else {
        // EDITING MODE (Canvas has content)
        systemPrompt = `You are an expert UI/UX Designer using Tailwind CSS.

Here is the CURRENT HTML of the website:
\`\`\`html
${currentHtml}
\`\`\`

THE USER WANTS TO CHANGE: "${input}"

**STRICT VISUAL RULES (DO NOT IGNORE):**

1. **NO BROKEN IMAGES:**
   * NEVER use 'source.unsplash.com'. It is broken.
   * **ALWAYS USE:** 'https://picsum.photos/seed/' + Math.floor(Math.random() * 1000) + '/800/600' for generic images.
   * Example: <img src="https://picsum.photos/seed/42/800/600" class="w-full h-64 object-cover rounded-xl shadow-lg" />

2. **NO HUGE GAPS (LAYOUT):**
   * **FORBIDDEN CLASS:** Do NOT use \`h-screen\` or \`min-h-screen\` (unless explicitly asked for a fullscreen hero).
   * **USE PADDING INSTEAD:** Use \`py-16\` or \`py-24\` to create spacing. This ensures the content dictates the height, avoiding empty whitespace.

3. **CONTENT DENSITY:**
   * Don't leave huge empty areas. If you use a grid, fill it with at least 3 cards.
   * Ensure text has high contrast (e.g., if bg is dark, text must be white/gray-200).

4. **Return the FULL UPDATED HTML:** Do not return just the snippet. Return the whole page with the requested changes applied.
5. **Keep existing styles** that shouldn't change.
6. **OUTPUT:** Return ONLY raw HTML inside <body>.`;
      }

      let cleanHtml = '';

      if (provider === 'google') {
        // --- GOOGLE GEMINI LOGIC ---
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();

        if (!text) {
          throw new Error('Yapay zeka boş yanıt döndürdü.');
        }

        cleanHtml = text
          .replace(/```html\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();

      } else if (provider === 'openai') {
        // --- OPENAI (CHATGPT) LOGIC ---
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: 'You are an expert UI/UX Designer using Tailwind CSS. STRICT RULES: 1) NEVER use source.unsplash.com - use picsum.photos instead. 2) NEVER use h-screen or min-h-screen - use py-16 or py-24 for spacing. 3) Fill grids with at least 3 cards. 4) Ensure high contrast text. Return ONLY raw HTML. No markdown.'
              },
              {
                role: 'user',
                content: systemPrompt
              }
            ],
            temperature: 0.7,
            max_tokens: 4000
          })
        });

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error.message);
        }

        const text = data.choices?.[0]?.message?.content;

        if (!text) {
          throw new Error('Yapay zeka boş yanıt döndürdü.');
        }

        cleanHtml = text
          .replace(/```html\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
      }

      // Clean html, head, body tags if present
      cleanHtml = cleanHtml
        .replace(/<html[^>]*>/gi, '')
        .replace(/<\/html>/gi, '')
        .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
        .replace(/<body[^>]*>/gi, '')
        .replace(/<\/body>/gi, '')
        .trim();

      // 4. Update Editor & Chat
      if (cleanHtml) {
        editor.setComponents(cleanHtml);
        setMessages([...newMessages, { 
          role: 'ai', 
          text: isEmptyCanvas 
            ? 'Tasarım oluşturuldu! Başka bir değişiklik ister misin?' 
            : 'Tasarım güncellendi! Başka bir değişiklik ister misin?'
        }]);
      } else {
        throw new Error('Boş yanıt alındı.');
      }

    } catch (err) {
      console.error('AI Generation Error:', err);
      const providerName = provider === 'google' ? 'Google' : 'OpenAI';
      if (err.message?.includes('API key') || err.message?.includes('API_KEY_INVALID') || err.message?.includes('Incorrect API key')) {
        setError(`${providerName} API Anahtarı geçersiz. Lütfen kontrol edin.`);
      } else if (err.message?.includes('not found') || err.message?.includes('model')) {
        setError(`${providerName} Model hatası: Lütfen API anahtarınızın izinlerini kontrol edin.`);
      } else {
        setError(`${providerName} Hatası: ${err.message || 'Bilinmeyen hata'}`);
      }
      // Add error message to chat
      setMessages([...newMessages, { role: 'ai', text: `❌ Hata: ${err.message || 'Bir sorun oluştu'}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [
    'Kişisel Portfolyo Sitesi',
    'Modern Landing Page',
    'İletişim Formlu Kurumsal Site',
    'E-ticaret Ürün Kartları',
  ];

  // Get provider-specific link
  const getProviderLink = () => {
    return provider === 'google'
      ? 'https://aistudio.google.com/app/apikey'
      : 'https://platform.openai.com/api-keys';
  };

  // Get provider name
  const getProviderName = () => {
    return provider === 'google' ? 'Google Gemini' : 'OpenAI ChatGPT';
  };

  if (!isOpen) return null;

  // ONBOARDING VIEW - No API Key
  if (!apiKey) {
    return (
      <div className="ai-builder-overlay" onClick={onClose}>
        <div className="ai-builder-modal onboarding" onClick={(e) => e.stopPropagation()}>
          <div className="onboarding-content">
            {/* Sparkle Icon */}
            <div className="sparkle-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="url(#gradient)"/>
                <defs>
                  <linearGradient id="gradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#3B82F6"/>
                    <stop offset="1" stopColor="#8B5CF6"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <h1 className="onboarding-title">WebEditör AI Asistanı</h1>
            <p className="onboarding-subtitle">
              Başlamak için AI API anahtarına ihtiyacın var.<br />
              Ücretsiz alabilirsin.
            </p>

            {/* Provider Selector */}
            <div className="provider-selector">
              <button
                className={`provider-btn ${provider === 'google' ? 'active' : ''}`}
                onClick={() => handleProviderChange('google')}
              >
                <span className="provider-icon">🌟</span>
                Google Gemini
              </button>
              <button
                className={`provider-btn ${provider === 'openai' ? 'active' : ''}`}
                onClick={() => handleProviderChange('openai')}
              >
                <span className="provider-icon">🤖</span>
                OpenAI
              </button>
            </div>

            <a 
              href={getProviderLink()}
              target="_blank" 
              rel="noopener noreferrer"
              className="api-key-link-button"
            >
              <span>🔑</span>
              {getProviderName()} API Anahtarını Al
            </a>

            <div className="api-key-input-section">
              <input
                type="password"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder={`${getProviderName()} API anahtarını buraya yapıştır`}
                className="api-key-input"
                onKeyDown={(e) => e.key === 'Enter' && handleSaveApiKey()}
              />
              
              {error && <div className="onboarding-error">{error}</div>}
              
              <button 
                className="start-button"
                onClick={handleSaveApiKey}
                disabled={!tempApiKey.trim()}
              >
                Başla
              </button>
            </div>
          </div>

          <button className="close-btn onboarding-close" onClick={onClose}>×</button>
        </div>
      </div>
    );
  }

  // CHAT VIEW - Has API Key
  const hasMessages = messages.length > 0;

  return (
    <div className="ai-builder-overlay" onClick={onClose}>
      <div className="ai-builder-modal chat" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-title">
            <span className="sparkle-small">✨</span>
            <h2>AI Tasarımcı</h2>
            <span className="provider-badge">
              {provider === 'google' ? '🌟 Gemini' : '🤖 GPT'}
            </span>
          </div>
          <div className="chat-header-actions">
            <button 
              className="settings-btn"
              onClick={() => setShowSettings(!showSettings)}
              title="Ayarlar"
            >
              ⚙
            </button>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
        </div>

        {/* Settings Dropdown */}
        {showSettings && (
          <div className="settings-dropdown">
            <div className="settings-section">
              <span className="settings-label">AI Sağlayıcı</span>
              <div className="settings-provider-btns">
                <button 
                  className={`settings-provider-btn ${provider === 'google' ? 'active' : ''}`}
                  onClick={() => {
                    handleProviderChange('google');
                    setShowSettings(false);
                  }}
                >
                  🌟 Google Gemini
                </button>
                <button 
                  className={`settings-provider-btn ${provider === 'openai' ? 'active' : ''}`}
                  onClick={() => {
                    handleProviderChange('openai');
                    setShowSettings(false);
                  }}
                >
                  🤖 OpenAI
                </button>
              </div>
            </div>
            <button onClick={handleClearApiKey} className="settings-item danger">
              🚪 Çıkış Yap (API Anahtarını Sil)
            </button>
          </div>
        )}

        {/* Chat Body */}
        <div className="chat-body">
          {!hasMessages && !isLoading ? (
            // Initial State - Show Greeting and Suggestions
            <>
              <div className="greeting">
                <h1 className="gradient-text">Merhaba!</h1>
                <p>Bugün ne inşa ediyoruz?</p>
              </div>

              <div className="suggestions">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="suggestion-chip"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </>
          ) : (
            // Chat Mode - Show Messages
            <div className="chat-messages">
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.role}`}>
                  <div className="message-avatar">
                    {msg.role === 'user' ? '👤' : '🤖'}
                  </div>
                  <div className="message-content">
                    <p>{msg.text}</p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="message ai loading">
                  <div className="message-avatar">🤖</div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}

          {error && !hasMessages && (
            <div className="chat-error">
              <span>⚠</span> {error}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="chat-input-area">
          <div className="input-container">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={hasMessages ? "Tasarımda değişiklik yap..." : "Bir web sitesi tarif et..."}
              className="chat-input"
              disabled={isLoading}
            />
            <button 
              className="send-btn"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? (
                <span className="send-spinner"></span>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="currentColor"/>
                </svg>
              )}
            </button>
          </div>
          {hasMessages && (
            <p className="input-hint">
              💡 İpucu: "Başlığı mavi yap", "Altına iletişim formu ekle" gibi değişiklikler isteyebilirsin
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIBuilder;