import React, { useState } from 'react';

const fieldTypes = [
  {
    type: 'text',
    icon: '📝',
    label: 'Metin',
    defaultConfig: { label: 'Metin', placeholder: 'Metni girin', required: false },
  },
  {
    type: 'email',
    icon: '📧',
    label: 'E-posta',
    defaultConfig: { label: 'E-posta', placeholder: 'ornek@email.com', required: true },
  },
  {
    type: 'phone',
    icon: '📱',
    label: 'Telefon',
    defaultConfig: { label: 'Telefon', placeholder: '+90 XXX XXX XX XX', required: false },
  },
  {
    type: 'textarea',
    icon: '📄',
    label: 'Uzun Metin',
    defaultConfig: { label: 'Mesaj', placeholder: 'Mesajınızı yazın', rows: 4, required: false },
  },
  {
    type: 'select',
    icon: '📋',
    label: 'Seçim Listesi',
    defaultConfig: { label: 'Seçim', options: ['Seçenek 1', 'Seçenek 2', 'Seçenek 3'], required: false },
  },
  {
    type: 'checkbox',
    icon: '☑️',
    label: 'Onay Kutusu',
    defaultConfig: { label: 'Onaylıyorum', required: false },
  },
  {
    type: 'radio',
    icon: '🔘',
    label: 'Radyo Buton',
    defaultConfig: { label: 'Seçim', options: ['Evet', 'Hayır'], required: false },
  },
];

const inputStyle = {
  width: '100%',
  padding: '8px',
  background: '#374151',
  color: 'white',
  border: '1px solid #4b5563',
  borderRadius: '4px',
  fontSize: '13px',
  boxSizing: 'border-box',
};

const FormBuilderPlugin = ({ editor, onClose }) => {
  const [formFields, setFormFields] = useState([]);
  const [formSettings, setFormSettings] = useState({
    title: 'İletişim Formu',
    submitText: 'Gönder',
    successMessage: 'Mesajınız başarıyla gönderildi!',
    formId: 'contact-form-' + Date.now(),
  });
  const [showPreview, setShowPreview] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const addField = (type) => {
    const def = fieldTypes.find(f => f.type === type);
    if (!def) return;
    setFormFields(prev => [...prev, { id: Date.now() + Math.random(), type, ...def.defaultConfig }]);
  };

  const removeField = (id) => setFormFields(prev => prev.filter(f => f.id !== id));

  const updateField = (id, updates) =>
    setFormFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));

  const moveField = (id, dir) => {
    setFormFields(prev => {
      const idx = prev.findIndex(f => f.id === id);
      const next = idx + (dir === 'up' ? -1 : 1);
      if (next < 0 || next >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr;
    });
  };

  // Escape user-supplied strings before injecting into generated HTML
  const esc = (str) =>
    String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  const generateFormHTML = () => {
    const { formId, title, submitText, successMessage } = formSettings;

    const fieldHTML = formFields.map(field => {
      // Safe attribute name: only alphanumeric + underscore
      const name = esc(field.label.toLowerCase().replace(/[^a-z0-9]/g, '_'));
      const req = field.required ? ' required' : '';
      const fieldStyle = 'padding:12px;border:2px solid #e5e7eb;border-radius:8px;font-size:14px;width:100%;box-sizing:border-box;transition:border-color 0.2s;';
      const focusBlur = `onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e5e7eb'"`;
      // Safe display label (shown as text content, not attr)
      const safeLabel = esc(field.label);
      const labelHTML = field.type !== 'checkbox'
        ? `<label style="font-size:14px;font-weight:600;color:#374151;">${safeLabel}${field.required ? ' <span style="color:#ef4444;">*</span>' : ''}</label>`
        : '';

      let input = '';
      switch (field.type) {
        case 'text':
        case 'email':
          input = `<input type="${field.type}" name="${name}" placeholder="${esc(field.placeholder)}"${req} style="${fieldStyle}" ${focusBlur}/>`;
          break;
        case 'phone':
          // 'tel' is the correct HTML5 type for phone numbers
          input = `<input type="tel" name="${name}" placeholder="${esc(field.placeholder)}"${req} style="${fieldStyle}" ${focusBlur}/>`;
          break;
        case 'textarea':
          input = `<textarea name="${name}" placeholder="${esc(field.placeholder)}" rows="${parseInt(field.rows) || 4}"${req} style="${fieldStyle}resize:vertical;font-family:inherit;" ${focusBlur}></textarea>`;
          break;
        case 'select':
          input = `<select name="${name}"${req} style="${fieldStyle}background:white;cursor:pointer;">
  <option value="">Seçiniz...</option>
  ${(field.options || []).map(o => `<option value="${esc(o)}">${esc(o)}</option>`).join('\n  ')}
</select>`;
          break;
        case 'checkbox':
          input = `<label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
  <input type="checkbox" name="${name}"${req} style="width:18px;height:18px;cursor:pointer;"/>
  <span style="font-size:14px;color:#374151;">${safeLabel}${field.required ? ' <span style="color:#ef4444;">*</span>' : ''}</span>
</label>`;
          break;
        case 'radio':
          // All radio buttons with the same name need required on each for proper HTML5 validation
          input = (field.options || []).map(opt =>
            `<label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
  <input type="radio" name="${name}" value="${esc(opt)}"${req} style="width:18px;height:18px;cursor:pointer;"/>
  <span style="font-size:14px;color:#374151;">${esc(opt)}</span>
</label>`
          ).join('\n');
          break;
        default:
          input = '';
      }

      return `<div style="display:flex;flex-direction:column;gap:8px;">${labelHTML}${input}</div>`;
    }).join('\n    ');

    return `<!-- Form Builder: ${title} -->
<div id="${formId}" style="max-width:600px;margin:40px auto;padding:30px;background:white;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
  <h2 style="margin:0 0 24px 0;font-size:24px;font-weight:700;color:#1f2937;">${title}</h2>
  <form id="${formId}-form" onsubmit="handleFormSubmit_${formId.replace(/-/g, '_')}(event)" style="display:flex;flex-direction:column;gap:20px;">
    ${fieldHTML}
    <button type="submit" style="padding:14px 24px;background:linear-gradient(135deg,#3b82f6 0%,#2563eb 100%);color:white;border:none;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 16px rgba(59,130,246,0.3)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
      ${submitText}
    </button>
  </form>
  <div id="${formId}-success" style="display:none;margin-top:20px;padding:16px;background:#d1fae5;color:#065f46;border-radius:8px;font-size:14px;font-weight:600;">
    ${successMessage}
  </div>
</div>
<script>
function handleFormSubmit_${formId.replace(/-/g, '_')}(e) {
  e.preventDefault();
  var form = document.getElementById('${formId}-form');
  var success = document.getElementById('${formId}-success');
  if (form && success) {
    form.style.display = 'none';
    success.style.display = 'block';
    setTimeout(function() { form.reset(); form.style.display = 'flex'; success.style.display = 'none'; }, 3000);
  }
  return false;
}
</script>`;
  };

  const insertFormIntoTheme = () => {
    if (!editor?.themeHTML) {
      showToast('❌ Önce bir tema yükleyin!');
      return;
    }
    const formHTML = generateFormHTML();
    const parser = new DOMParser();
    const doc = parser.parseFromString(editor.themeHTML, 'text/html');
    const wrapper = doc.createElement('div');
    wrapper.innerHTML = formHTML;
    Array.from(wrapper.childNodes).forEach(node => doc.body.appendChild(node));
    editor.setThemeHTML?.(doc.documentElement.outerHTML);
    showToast('✅ Form temaya eklendi!');
  };

  const copyFormHTML = () => {
    navigator.clipboard.writeText(generateFormHTML());
    showToast('✅ Form HTML kopyalandı!');
  };

  const isEmpty = formFields.length === 0;

  return (
    <div style={{ color: 'white', position: 'relative' }}>
      {/* Toast */}
      {toastMsg && (
        <div style={{
          position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)',
          background: '#1f2937', color: 'white', padding: '12px 24px',
          borderRadius: '8px', fontSize: '14px', fontWeight: '600',
          zIndex: 99999, boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          border: '1px solid #374151',
        }}>
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        padding: '24px', borderRadius: '12px', marginBottom: '24px',
      }}>
        <div
          style={{ width: '48px', height: '48px', marginBottom: '12px' }}
          dangerouslySetInnerHTML={{
            __html: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="white"/>
              <path d="M7 7H17V9H7V7ZM7 11H17V13H7V11ZM7 15H14V17H7V15Z" fill="white"/>
            </svg>`,
          }}
        />
        <h3 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>Form Oluşturucu</h3>
        <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
          Özel iletişim formları oluşturun ve temaya ekleyin
        </p>
      </div>

      {/* Form Settings */}
      <div style={{ background: '#374151', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>⚙️ Form Ayarları</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#9ca3af' }}>Form Başlığı</label>
            <input
              type="text"
              value={formSettings.title}
              onChange={e => setFormSettings(s => ({ ...s, title: e.target.value }))}
              style={{ ...inputStyle, padding: '10px', background: '#1f2937', border: '2px solid #4b5563' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#9ca3af' }}>Buton Metni</label>
              <input
                type="text"
                value={formSettings.submitText}
                onChange={e => setFormSettings(s => ({ ...s, submitText: e.target.value }))}
                style={{ ...inputStyle, padding: '10px', background: '#1f2937', border: '2px solid #4b5563' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#9ca3af' }}>Başarı Mesajı</label>
              <input
                type="text"
                value={formSettings.successMessage}
                onChange={e => setFormSettings(s => ({ ...s, successMessage: e.target.value }))}
                style={{ ...inputStyle, padding: '10px', background: '#1f2937', border: '2px solid #4b5563' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add Field Palette */}
      <div style={{ background: '#374151', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>➕ Alan Ekle</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px' }}>
          {fieldTypes.map(ft => (
            <button
              key={ft.type}
              onClick={() => addField(ft.type)}
              style={{
                padding: '16px 12px', background: '#1f2937', color: 'white',
                border: '2px solid #4b5563', borderRadius: '8px', cursor: 'pointer',
                transition: 'all 0.2s', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '8px',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#8b5cf6'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#4b5563'; e.currentTarget.style.transform = ''; }}
            >
              <span style={{ fontSize: '24px' }}>{ft.icon}</span>
              <span style={{ fontSize: '12px', fontWeight: '600' }}>{ft.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Field List */}
      {!isEmpty && (
        <div style={{ background: '#374151', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
            📝 Form Alanları ({formFields.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {formFields.map((field, index) => {
              const def = fieldTypes.find(f => f.type === field.type);
              return (
                <div
                  key={field.id}
                  style={{ background: '#1f2937', padding: '16px', borderRadius: '8px', border: '2px solid #4b5563' }}
                >
                  {/* Field header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '20px' }}>{def?.icon}</span>
                      <span style={{ fontSize: '14px', fontWeight: '600' }}>{def?.label}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {[
                        { label: '↑', action: () => moveField(field.id, 'up'), disabled: index === 0 },
                        { label: '↓', action: () => moveField(field.id, 'down'), disabled: index === formFields.length - 1 },
                      ].map(btn => (
                        <button
                          key={btn.label}
                          onClick={btn.action}
                          disabled={btn.disabled}
                          style={{
                            padding: '6px 10px', background: '#374151', color: 'white',
                            border: 'none', borderRadius: '4px',
                            cursor: btn.disabled ? 'not-allowed' : 'pointer',
                            opacity: btn.disabled ? 0.4 : 1,
                          }}
                        >
                          {btn.label}
                        </button>
                      ))}
                      <button
                        onClick={() => removeField(field.id)}
                        style={{ padding: '6px 10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Field config */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input
                      type="text"
                      value={field.label}
                      onChange={e => updateField(field.id, { label: e.target.value })}
                      placeholder="Alan adı"
                      style={inputStyle}
                    />

                    {['text', 'email', 'phone', 'textarea'].includes(field.type) && (
                      <input
                        type="text"
                        value={field.placeholder}
                        onChange={e => updateField(field.id, { placeholder: e.target.value })}
                        placeholder="Placeholder metni"
                        style={inputStyle}
                      />
                    )}

                    {field.type === 'textarea' && (
                      <input
                        type="number"
                        value={field.rows || 4}
                        min={2}
                        max={12}
                        onChange={e => updateField(field.id, { rows: Number(e.target.value) })}
                        placeholder="Satır sayısı"
                        style={{ ...inputStyle, width: '120px' }}
                      />
                    )}

                    {['select', 'radio'].includes(field.type) && (
                      <textarea
                        value={(field.options || []).join('\n')}
                        onChange={e => updateField(field.id, { options: e.target.value.split('\n').filter(o => o.trim()) })}
                        placeholder="Seçenekler (her satıra bir tane)"
                        rows={3}
                        style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                      />
                    )}

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={e => updateField(field.id, { required: e.target.checked })}
                        style={{ cursor: 'pointer' }}
                      />
                      <span>Zorunlu alan</span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div style={{ padding: '60px 20px', textAlign: 'center', background: '#374151', borderRadius: '12px', marginBottom: '20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📝</div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Formunuzu oluşturmaya başlayın</h4>
          <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>
            Yukarıdan alan türlerini seçerek formunuzu oluşturun
          </p>
        </div>
      )}

      {/* Action buttons */}
      {!isEmpty && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: showPreview ? '20px' : 0 }}>
          <button
            onClick={() => setShowPreview(v => !v)}
            style={{
              flex: 1, padding: '14px', background: '#374151', color: 'white',
              border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
            }}
          >
            {showPreview ? '📝 Düzenle' : '👁️ Önizle'}
          </button>
          <button
            onClick={copyFormHTML}
            style={{
              flex: 1, padding: '14px', background: '#3b82f6', color: 'white',
              border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
            }}
          >
            📋 HTML Kopyala
          </button>
          <button
            onClick={insertFormIntoTheme}
            style={{
              flex: 1, padding: '14px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white', border: 'none', borderRadius: '8px',
              fontSize: '14px', fontWeight: '600', cursor: 'pointer',
            }}
          >
            ➕ Temaya Ekle
          </button>
        </div>
      )}

      {/* Preview */}
      {showPreview && !isEmpty && (
        <div
          style={{ padding: '20px', background: '#f9fafb', borderRadius: '12px' }}
          dangerouslySetInnerHTML={{ __html: generateFormHTML() }}
        />
      )}
    </div>
  );
};

export default FormBuilderPlugin;
