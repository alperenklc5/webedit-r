import React, { useState, useEffect, useRef } from 'react';
import AIModelSelector from './plugins/AIModelSelector';

// ── API callers ────────────────────────────────────────────────────────────────
async function callGroq(systemPrompt, history, apiKey) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: systemPrompt }, ...history],
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

async function callClaude(systemPrompt, history, apiKey) {
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
      system: systemPrompt,
      messages: history,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Claude API ${res.status}`);
  }
  return (await res.json()).content[0].text;
}

async function callOpenAI(systemPrompt, history, apiKey) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'system', content: systemPrompt }, ...history],
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

async function callGemini(systemPrompt, history, apiKey) {
  const contents = [];
  for (const msg of history) {
    contents.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    });
  }
  // Inject system prompt into first user message if no history yet
  if (contents.length === 0) {
    contents.push({ role: 'user', parts: [{ text: systemPrompt + '\n\n' + history[history.length - 1]?.content }] });
  }
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

function extractCode(raw) {
  const fenceMatch = raw.match(/```(?:[a-z]*)\n?([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();
  return raw.trim();
}

function getCurrentHTML() {
  try {
    const iframe = document.querySelector('iframe[title="Theme Canvas"]');
    if (iframe?.contentDocument?.documentElement) {
      const html = iframe.contentDocument.documentElement.outerHTML;
      if (html && html.length > 100) return html;
    }
  } catch { /* ignore */ }
  try {
    return localStorage.getItem('webeditr_project') || '';
  } catch { /* ignore */ }
  return '';
}

// ── Model meta ────────────────────────────────────────────────────────────────
const MODEL_META = {
  groq:   { name: 'Groq · Llama 3.3', color: '#f97316', icon: '🔥' },
  claude: { name: 'Claude Sonnet 4',  color: '#8b5cf6', icon: '🤖' },
  openai: { name: 'GPT-4o',           color: '#10b981', icon: '🧠' },
  gemini: { name: 'Gemini 1.5 Pro',   color: '#3b82f6', icon: '✨' },
};

const SUGGESTIONS = [
  { icon: '🚀', text: 'Modern SaaS Landing Page', prompt: 'Create a modern SaaS landing page with a gradient hero section (purple/cyan), 4 feature cards with icons, a 3-tier pricing table with the middle highlighted, customer testimonials, and a bold CTA section. Use a dark navy + purple color scheme with glassmorphism cards.' },
  { icon: '🍽️', text: 'Luxury Restaurant Website', prompt: 'Create a luxury restaurant website with a dark theme, gold accents (#f59e0b), full-screen hero with an overlay, elegant serif-inspired typography, a menu section with dish cards, an ambiance gallery grid, and a reservation form.' },
  { icon: '🎨', text: 'Creative Portfolio', prompt: 'Create a creative portfolio with an asymmetric grid layout, bold purple/pink gradient accents, animated hover effects on project cards, a showcase of 6 projects, an about section, and a minimal contact area.' },
  { icon: '💼', text: 'Corporate Website', prompt: 'Create a professional corporate website with navy (#1e40af) and white colors, a services grid with 6 cards, a team section with 4 member cards with circular photo placeholders, a stats bar (clients, projects, years), and a multi-column footer.' },
];

// ── Component ─────────────────────────────────────────────────────────────────
const AIAssistantPanel = ({ isOpen, onToggle, onApplyCode }) => {
  const [aiConfig, setAiConfig]             = useState(null);
  const [showSelector, setShowSelector]     = useState(false);
  const [messages, setMessages]             = useState([]);
  const [inputMessage, setInputMessage]     = useState('');
  const [generating, setGenerating]         = useState(false);
  const messagesEndRef                      = useRef(null);
  const textareaRef                         = useRef(null);

  // ── Load config + conversation on mount ───────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem('webeditr_ai_config');
      if (saved) {
        setAiConfig(JSON.parse(saved));
      } else {
        setShowSelector(true);
      }
    } catch {
      setShowSelector(true);
    }

    try {
      const savedMsgs = localStorage.getItem('webeditr_ai_conversation');
      if (savedMsgs) setMessages(JSON.parse(savedMsgs));
    } catch { /* ignore */ }
  }, []);

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, generating]);

  // ── Persist conversation ──────────────────────────────────────────────────
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('webeditr_ai_conversation', JSON.stringify(messages.slice(-50)));
    }
  }, [messages]);

  // ── Generate ──────────────────────────────────────────────────────────────
  const generate = async (userText) => {
    if (!userText.trim() || generating) return;
    if (!aiConfig) { setShowSelector(true); return; }

    const userMsg = { role: 'user', content: userText };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputMessage('');
    setGenerating(true);

    try {
      const currentHTML = getCurrentHTML();
      const hasPage = currentHTML.length > 200;

      const systemPrompt = `You are a SENIOR DESIGNER at Stripe/Vercel/Linear building $50,000 enterprise websites that make engineers say "HOW did they build this?!"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 YOUR MISSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Every site you create must have: animated floating orbs, glassmorphism nav, gradient headings, multiple @keyframes, hover transforms, precise spacing, layered shadows, pixel-perfect typography, and a scroll-triggered navbar. No exceptions.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎓 STUDY THIS ELITE EXAMPLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**EXAMPLE 1: Premium SaaS Hero (Webflow Quality)**
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Premium SaaS Platform</title>
<style>
  :root {
    --primary: #6366f1;
    --primary-dark: #4f46e5;
    --secondary: #8b5cf6;
    --accent: #ec4899;
    --dark: #0f172a;
    --light: #f1f5f9;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; line-height: 1.6; color: var(--dark); overflow-x: hidden; }
  .hero { position: relative; min-height: 100vh; display: flex; align-items: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); overflow: hidden; }
  .hero::before { content: ''; position: absolute; top: -50%; right: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 50px 50px; animation: moveGrid 20s linear infinite; }
  @keyframes moveGrid { 0% { transform: translate(0, 0); } 100% { transform: translate(50px, 50px); } }
  .hero-blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.3; animation: float 8s ease-in-out infinite; }
  .blob-1 { top: 20%; left: 10%; width: 400px; height: 400px; background: linear-gradient(135deg, #667eea, #764ba2); animation-delay: 0s; }
  .blob-2 { bottom: 20%; right: 10%; width: 350px; height: 350px; background: linear-gradient(135deg, #f093fb, #f5576c); animation-delay: 2s; }
  @keyframes float { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(30px, -30px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } }
  .hero-content { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; padding: 0 40px; text-align: center; }
  .hero h1 { font-size: clamp(48px, 8vw, 92px); font-weight: 800; line-height: 1.1; margin-bottom: 32px; background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: -0.03em; animation: fadeInUp 0.8s ease-out; }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
  .hero p { font-size: clamp(18px, 3vw, 24px); color: rgba(255,255,255,0.95); max-width: 700px; margin: 0 auto 48px; line-height: 1.7; font-weight: 300; animation: fadeInUp 0.8s ease-out 0.2s both; }
  .cta-buttons { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; animation: fadeInUp 0.8s ease-out 0.4s both; }
  .btn { padding: 20px 48px; font-size: 18px; font-weight: 700; border: none; border-radius: 16px; cursor: pointer; text-decoration: none; display: inline-block; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
  .btn-primary { background: white; color: var(--primary); box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
  .btn-primary:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 30px 80px rgba(0,0,0,0.4); }
  .btn-secondary { background: rgba(255,255,255,0.15); color: white; border: 2px solid rgba(255,255,255,0.3); backdrop-filter: blur(10px); }
  .btn-secondary:hover { background: rgba(255,255,255,0.25); transform: translateY(-4px); border-color: rgba(255,255,255,0.5); }
  nav { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; padding: 20px 40px; background: rgba(255,255,255,0.1); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.1); transition: all 0.3s ease; }
  nav.scrolled { background: rgba(255,255,255,0.95); box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
  nav .container { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
  .logo { font-size: 24px; font-weight: 800; color: white; text-decoration: none; }
  nav.scrolled .logo { color: var(--dark); }
  nav ul { display: flex; gap: 32px; list-style: none; }
  nav a { color: rgba(255,255,255,0.9); text-decoration: none; font-weight: 500; transition: color 0.3s; }
  nav.scrolled a { color: var(--dark); }
  nav a:hover { color: white; }
  nav.scrolled a:hover { color: var(--primary); }
  .features { padding: 120px 40px; background: linear-gradient(180deg, #f8fafc 0%, #ffffff 50%, #f8fafc 100%); }
  .features .container { max-width: 1200px; margin: 0 auto; }
  .section-header { text-align: center; margin-bottom: 80px; }
  .section-header h2 { font-size: clamp(36px, 6vw, 64px); font-weight: 800; color: var(--dark); margin-bottom: 20px; letter-spacing: -0.02em; }
  .section-header p { font-size: 20px; color: #64748b; max-width: 600px; margin: 0 auto; }
  .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 40px; }
  .feature-card { padding: 48px; background: white; border-radius: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.02), 0 20px 60px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.03); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; }
  .feature-card:hover { transform: translateY(-12px); box-shadow: 0 4px 6px rgba(0,0,0,0.02), 0 40px 100px rgba(102,126,234,0.15); }
  .feature-icon { width: 72px; height: 72px; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; box-shadow: 0 10px 30px rgba(99,102,241,0.3); transition: all 0.4s; }
  .feature-card:hover .feature-icon { transform: scale(1.1) rotate(5deg); box-shadow: 0 20px 40px rgba(99,102,241,0.4); }
  .feature-card h3 { font-size: 24px; font-weight: 700; color: var(--dark); margin-bottom: 16px; }
  .feature-card p { font-size: 16px; color: #64748b; line-height: 1.7; }
  @media (max-width: 768px) { .hero h1 { font-size: 42px; } .cta-buttons { flex-direction: column; } .btn { width: 100%; } nav ul { display: none; } .feature-grid { grid-template-columns: 1fr; } }
</style>
</head>
<body>
  <nav id="navbar"><div class="container"><a href="#" class="logo">Brand</a><ul><li><a href="#features">Features</a></li><li><a href="#pricing">Pricing</a></li><li><a href="#about">About</a></li></ul></div></nav>
  <section class="hero"><div class="hero-blob blob-1"></div><div class="hero-blob blob-2"></div><div class="hero-content"><h1>Build the Future<br/>With AI Technology</h1><p>Transform your ideas into reality with cutting-edge artificial intelligence. Join thousands of innovators already building tomorrow.</p><div class="cta-buttons"><a href="#" class="btn btn-primary">Start Free Trial</a><a href="#" class="btn btn-secondary">Watch Demo</a></div></div></section>
  <section class="features" id="features"><div class="container"><div class="section-header"><h2>Everything You Need to Succeed</h2><p>Powerful features designed to help you build faster and smarter</p></div><div class="feature-grid"><div class="feature-card"><div class="feature-icon"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg></div><h3>Lightning Fast</h3><p>Optimized for speed and performance with sub-50ms response times.</p></div><div class="feature-card"><div class="feature-icon"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div><h3>Bank-Level Security</h3><p>Enterprise-grade encryption. SOC 2 Type II certified.</p></div><div class="feature-card"><div class="feature-icon"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div><h3>Real-Time Analytics</h3><p>Beautiful dashboards and actionable insights powered by AI.</p></div></div></div></section>
  <script>const navbar=document.getElementById('navbar');window.addEventListener('scroll',()=>{navbar.classList.toggle('scrolled',window.scrollY>100)});</script>
</body>
</html>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ NON-NEGOTIABLE REQUIREMENTS (violating = FAILURE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ALL CSS IN <STYLE> TAG — NEVER inline styles for hover or animations
2. MINIMUM 3 FLOATING BLOBS — position:absolute, filter:blur(80px), @keyframes float
3. GLASSMORPHISM NAV — backdrop-filter:blur(20px), rgba bg, scroll-triggered solid
4. GRADIENT TEXT HEADINGS — background:linear-gradient, -webkit-background-clip:text
5. HOVER TRANSFORMS on every interactive element — translateY(-4px) + shadow upgrade
6. CUBIC-BEZIER TRANSITIONS — always cubic-bezier(0.4,0,0.2,1)
7. CSS VARIABLES at :root — --primary, --secondary, --accent, --dark
8. CLAMP() typography — clamp(48px,8vw,92px) hero, clamp(36px,6vw,64px) sections
9. LAYERED BOX-SHADOWS — minimum 2 layers: soft base + colored halo
10. @keyframes float + fadeInUp + moveGrid — all three, every site

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 COLOR PALETTES — PICK ONE AND GO DEEP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Purple Dream: #667eea → #764ba2 (Stripe/Linear energy)
Ocean Blue:   #0EA5E9 → #0284C7 + #38BDF8 accent (Vercel cool)
Sunset Fire:  #F59E0B → #EF4444 + #FCD34D accent (warm startup)
Forest Green: #10B981 → #059669 + #34D399 accent (SaaS/fintech)
Midnight Pro: #0f172a bg + #6366f1 primary + #ec4899 accent (agency)

Apply 60-30-10: 60% dominant color, 30% secondary, 10% accent pops.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📐 EXACT MEASUREMENTS TO USE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Hero padding: 120px vertical
- Section padding: 120px vertical, 40px horizontal
- Card padding: 48px
- Border radius: 16px (small), 20-24px (large)
- Button padding: 20px 48px
- Icon size: 72px
- Grid gap: 40px
- Font sizes: clamp(48px,8vw,92px) hero h1 · clamp(36px,6vw,64px) section h2 · 24px card h3
- Line height: 1.1 (headings), 1.7 (body)
- Letter spacing: -0.03em (large headings), -0.02em (medium)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📐 STRUCTURE (full site must have ALL of these)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Nav — sticky, backdrop-blur glassmorphism, logo left + links + CTA button right
2. Hero — 100vh, gradient bg, floating orbs, badge pill, gradient text h1, 2 CTAs, stats row
3. Features — light bg, label + h2, 3-4 cards with gradient icon boxes, hover lift
4. Social proof / Logos — dark bg, "trusted by X companies"
5. Showcase — image grid or mockup with overlay gradient
6. Testimonials — gradient bg, glassmorphism cards, avatar circles, star ratings
7. Pricing — 3 tiers, middle highlighted with gradient + "Most Popular" badge
8. CTA — bold gradient bg, large h2, single action button
9. Footer — dark bg #0f172a, 4 columns, social icons, legal links

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${messages.length > 0
  ? `CONVERSATION (last 3 turns):
${messages.slice(-3).map(m =>
    `${m.role === 'user' ? 'USER' : 'AI'}: ${(m.codeContent || m.content).substring(0, 100)}...`
  ).join('\n')}

IMPORTANT: You are CONTINUING an existing site. Make ONLY the specific change requested. Preserve everything else.`
  : 'FRESH START: Create a complete, stunning website from scratch using ALL sections listed above.'}

${hasPage ? `\nCURRENT PAGE HTML:\n${currentHTML.slice(0, 5000)}${currentHTML.length > 5000 ? '\n...(truncated)' : ''}` : ''}

USER REQUEST: ${userText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 OUTPUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return COMPLETE HTML starting with <!DOCTYPE html>. ZERO explanations. ZERO markdown fences. ONLY THE CODE.
Look like it was built by Stripe's design team at $50,000. Every technique from the example — applied.
CSS goes in <style> blocks ONLY — NOT inline styles. Use class names, :hover, @keyframes.
BLOW THEIR MIND. GO FULL DESIGNER MODE. 🚀
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

      // Build API message history (last 12 turns, assistant content trimmed)
      const apiHistory = updatedMessages.slice(-12).map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.role === 'assistant' && m.codeContent
          ? m.codeContent.slice(0, 500) + '...(truncated for context)'
          : m.content,
      }));

      let raw;
      const key = aiConfig.apiKeys[aiConfig.selectedModel];
      switch (aiConfig.selectedModel) {
        case 'groq':   raw = await callGroq(systemPrompt, apiHistory, key);   break;
        case 'claude': raw = await callClaude(systemPrompt, apiHistory, key); break;
        case 'openai': raw = await callOpenAI(systemPrompt, apiHistory, key); break;
        case 'gemini': raw = await callGemini(systemPrompt, apiHistory, key); break;
        default: throw new Error('Unknown model');
      }

      const code = extractCode(raw);
      const isFullDoc = /<!doctype/i.test(code) || /^<html/i.test(code);

      // Apply to editor
      if (isFullDoc) {
        onApplyCode?.(code, 'full');
      } else if (hasPage) {
        onApplyCode?.(code, 'append');
      } else {
        onApplyCode?.(code, 'full');
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `✅ ${isFullDoc ? 'Site güncellendi' : 'Kod eklendi'} — ${(code.length / 1024).toFixed(1)} KB`,
        codeContent: code,
      }]);
    } catch (err) {
      console.error('AI error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ Hata: ${err.message}`,
        isError: true,
      }]);
    } finally {
      setGenerating(false);
    }
  };

  const handleSend = () => {
    if (!inputMessage.trim() || generating) return;
    generate(inputMessage);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearConversation = () => {
    if (!confirm('Tüm sohbeti silmek istiyor musunuz?')) return;
    setMessages([]);
    localStorage.removeItem('webeditr_ai_conversation');
  };

  const meta = MODEL_META[aiConfig?.selectedModel] || MODEL_META.groq;

  // ── Collapsed tab ─────────────────────────────────────────────────────────
  if (!isOpen) {
    return (
      <div
        onClick={onToggle}
        title="AI Asistan"
        style={{
          position: 'fixed',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: '40px',
          height: '110px',
          background: `linear-gradient(180deg, ${meta.color}cc 0%, ${meta.color} 100%)`,
          borderRadius: '10px 0 0 10px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '-4px 0 16px rgba(0,0,0,0.25)',
          zIndex: 999,
          transition: 'width 0.2s, box-shadow 0.2s',
          gap: '4px',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.width = '48px';
          e.currentTarget.style.boxShadow = `-8px 0 24px ${meta.color}55`;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.width = '40px';
          e.currentTarget.style.boxShadow = '-4px 0 16px rgba(0,0,0,0.25)';
        }}
      >
        <span style={{ fontSize: '18px' }}>{meta.icon}</span>
        <span style={{
          writingMode: 'vertical-rl',
          color: 'white',
          fontSize: '11px',
          fontWeight: '700',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
        }}>
          AI
        </span>
      </div>
    );
  }

  // ── Full panel ────────────────────────────────────────────────────────────
  return (
    <>
    {/* ── Model selector full-screen modal ── */}
    {showSelector && (
      <div
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10001,
          backdropFilter: 'blur(4px)',
        }}
        onClick={() => {
          // Allow cancel only if a config already exists
          if (aiConfig) setShowSelector(false);
        }}
      >
        <div
          style={{
            background: '#1f2937', borderRadius: '16px', padding: '28px',
            width: '90%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {aiConfig && (
            <button
              onClick={() => setShowSelector(false)}
              style={{
                float: 'right', background: 'none', border: 'none',
                color: '#9ca3af', fontSize: '20px', cursor: 'pointer',
                padding: '0 4px', lineHeight: 1,
              }}
            >
              ✕
            </button>
          )}
          <AIModelSelector
            onComplete={(cfg) => {
              setAiConfig(cfg);
              setShowSelector(false);
            }}
          />
        </div>
      </div>
    )}

    <div style={{
      position: 'fixed',
      right: 0,
      top: 0,
      width: '380px',
      height: '100vh',
      background: '#111827',
      borderLeft: '1px solid #1f2937',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      boxShadow: '-8px 0 32px rgba(0,0,0,0.4)',
    }}>
      {/* ── Header ── */}
      <div style={{
        padding: '14px 16px',
        background: `linear-gradient(135deg, ${meta.color}cc 0%, ${meta.color} 100%)`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>{meta.icon}</span>
          <div>
            <div style={{ color: 'white', fontSize: '15px', fontWeight: '700' }}>AI Asistan</div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px' }}>{meta.name}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={clearConversation}
            title="Sohbeti temizle"
            style={iconBtnStyle}
          >
            🗑️
          </button>
          <button
            onClick={() => setShowSelector(true)}
            title="Model değiştir"
            style={iconBtnStyle}
          >
            ⚙️
          </button>
          <button
            onClick={onToggle}
            title="Kapat"
            style={iconBtnStyle}
          >
            ✕
          </button>
        </div>
      </div>

      {/* ── Messages ── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px 8px', color: '#9ca3af' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>💬</div>
            <p style={{ margin: '0 0 4px', color: '#d1d5db', fontSize: '15px', fontWeight: '600' }}>
              Merhaba! 👋
            </p>
            <p style={{ margin: '0 0 20px', fontSize: '13px', lineHeight: '1.6' }}>
              Website oluştur, düzenle veya özellik ekle.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
              <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
                Hızlı başlangıç
              </div>
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setInputMessage(s.prompt)}
                  style={{
                    padding: '9px 12px',
                    background: '#1f2937',
                    color: '#d1d5db',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#374151'}
                  onMouseLeave={e => e.currentTarget.style.background = '#1f2937'}
                >
                  <span>{s.icon}</span>
                  <span>{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
            gap: '4px',
          }}>
            <div style={{ fontSize: '11px', color: '#6b7280' }}>
              {msg.role === 'user' ? '👤 Siz' : `${meta.icon} ${meta.name.split('·')[0].trim()}`}
            </div>
            <div style={{
              maxWidth: '90%',
              padding: '10px 14px',
              background: msg.isError
                ? 'rgba(239,68,68,0.2)'
                : msg.role === 'user'
                ? meta.color
                : '#1f2937',
              color: msg.isError ? '#fca5a5' : 'white',
              borderRadius: msg.role === 'user'
                ? '14px 14px 4px 14px'
                : '14px 14px 14px 4px',
              fontSize: '13px',
              lineHeight: '1.6',
              border: msg.isError
                ? '1px solid rgba(239,68,68,0.4)'
                : msg.role === 'assistant'
                ? '1px solid #374151'
                : 'none',
              wordBreak: 'break-word',
            }}>
              {msg.role === 'assistant' && !msg.isError && msg.codeContent ? (
                <div>
                  <div style={{ marginBottom: '8px' }}>{msg.content}</div>
                  <button
                    onClick={() => {
                      const isFullDoc = /<!doctype/i.test(msg.codeContent) || /^<html/i.test(msg.codeContent);
                      onApplyCode?.(msg.codeContent, isFullDoc ? 'full' : 'append');
                    }}
                    style={{
                      padding: '5px 12px',
                      background: `${meta.color}33`,
                      color: meta.color,
                      border: `1px solid ${meta.color}66`,
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    ↺ Tekrar Uygula
                  </button>
                </div>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {generating && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af' }}>
            <span style={{ fontSize: '14px' }}>{meta.icon}</span>
            <span style={{ fontSize: '13px' }}>Düşünüyor</span>
            <span style={{ display: 'flex', gap: '3px' }}>
              {[0, 1, 2].map(n => (
                <span
                  key={n}
                  style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    background: meta.color,
                    animation: `aiDot 1.2s ease-in-out ${n * 0.2}s infinite`,
                    display: 'inline-block',
                  }}
                />
              ))}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Style presets ── */}
      <div style={{ padding: '8px 14px', borderTop: '1px solid #1f2937', background: '#0f172a', flexShrink: 0 }}>
        <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
          🎨 Stil Kodları
        </div>
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {[
            { label: '🌈 Modern',       code: 'Use vibrant gradients, glassmorphism cards, and bold typography with purple/cyan palette.' },
            { label: '💼 Profesyonel',  code: 'Use navy/gold colors, clean serif-style headings, and a corporate professional style.' },
            { label: '🎨 Kreatif',      code: 'Use asymmetric layouts, bold accent colors, and artistic oversized elements.' },
            { label: '⚡ Minimal',      code: 'Use lots of white space, monochrome palette with one accent, and clean lines.' },
            { label: '🌙 Karanlık',     code: 'Use a dark theme (#0f172a base) with neon accent colors and subtle glow effects.' },
            { label: '🎯 Landing',      code: 'Single-page layout: hero → features → testimonials → pricing → CTA.' },
          ].map((s, i) => (
            <button
              key={i}
              onClick={() => setInputMessage(v => v.trim() ? `${v.trim()}. ${s.code}` : s.code)}
              style={{
                padding: '4px 9px',
                background: '#1f2937',
                color: '#d1d5db',
                border: '1px solid #374151',
                borderRadius: '5px',
                fontSize: '11px',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#374151'; e.currentTarget.style.borderColor = meta.color; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#1f2937'; e.currentTarget.style.borderColor = '#374151'; }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Input ── */}
      <div style={{
        padding: '12px 14px',
        borderTop: '1px solid #1f2937',
        background: '#111827',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Mesajınızı yazın… (Enter = gönder)"
            rows={2}
            style={{
              flex: 1,
              padding: '10px 12px',
              background: '#1f2937',
              color: 'white',
              border: `1.5px solid #374151`,
              borderRadius: '8px',
              fontSize: '13px',
              fontFamily: 'inherit',
              resize: 'none',
              outline: 'none',
              lineHeight: '1.5',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => e.target.style.borderColor = meta.color}
            onBlur={e => e.target.style.borderColor = '#374151'}
          />
          <button
            onClick={handleSend}
            disabled={!inputMessage.trim() || generating}
            style={{
              padding: '10px 14px',
              background: inputMessage.trim() && !generating
                ? `linear-gradient(135deg, ${meta.color}cc 0%, ${meta.color} 100%)`
                : '#374151',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              cursor: inputMessage.trim() && !generating ? 'pointer' : 'not-allowed',
              opacity: inputMessage.trim() && !generating ? 1 : 0.45,
              flexShrink: 0,
              transition: 'background 0.15s, opacity 0.15s',
            }}
          >
            ▲
          </button>
        </div>
        <div style={{ marginTop: '6px', fontSize: '11px', color: '#4b5563', textAlign: 'center' }}>
          Shift+Enter = yeni satır · AI mevcut sayfayı hatırlar
        </div>
      </div>

      <style>{`
        @keyframes aiDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
    </>
  );
};

const iconBtnStyle = {
  padding: '6px 9px',
  background: 'rgba(255,255,255,0.15)',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  fontSize: '15px',
  cursor: 'pointer',
  lineHeight: 1,
};

export default AIAssistantPanel;
