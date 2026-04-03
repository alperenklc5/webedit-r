import React, { useRef, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { Check } from 'lucide-react';

const CodeEditorPanel = ({ visible, htmlCode, cssCode, onApply, onClose }) => {
  const monacoHtmlRef = useRef(null);
  const monacoCssRef = useRef(null);
  const [currentHtmlCode, setCurrentHtmlCode] = React.useState(htmlCode);
  const [currentCssCode, setCurrentCssCode] = React.useState(cssCode);
  const [codeLanguage, setCodeLanguage] = React.useState('html'); // 'html' or 'css'

  useEffect(() => {
    setCurrentHtmlCode(htmlCode);
    setCurrentCssCode(cssCode);
  }, [htmlCode, cssCode]);

  if (!visible) return null;

  const handleFormat = () => {
    if (codeLanguage === 'html' && monacoHtmlRef.current) {
      monacoHtmlRef.current.getAction('editor.action.formatDocument').run();
    } else if (codeLanguage === 'css' && monacoCssRef.current) {
      monacoCssRef.current.getAction('editor.action.formatDocument').run();
    }
  };

  const handleApply = () => {
    onApply(currentHtmlCode, currentCssCode);
    onClose();
  };

  return (
    <div
      style={{
        display: visible ? 'flex' : 'none',
      }}
      className="fixed inset-0 z-50 bg-[#1e1e1e] flex-col overflow-hidden font-sans"
    >
      {/* HEADER SECTION */}
      <div className="h-14 bg-[#2d2d2d] flex items-center justify-between px-6 border-b border-black shadow-2xl flex-shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600/20 p-1.5 rounded">
              <span className="text-blue-500 font-bold font-mono text-lg">{'</>'}</span>
            </div>
            <div>
              <h2 className="text-gray-200 font-bold text-sm tracking-wide">KOD EDİTÖRÜ</h2>
              <span className="text-xs text-gray-500 block leading-none">VS Code Engine</span>
            </div>
          </div>

          {/* HTML/CSS SWITCHER */}
          <div className="flex bg-black/40 rounded p-1 border border-white/10">
            <button
              onClick={() => setCodeLanguage('html')}
              className={`px-4 py-1 text-xs font-bold rounded transition-all ${codeLanguage === 'html' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
              HTML
            </button>
            <button
              onClick={() => setCodeLanguage('css')}
              className={`px-4 py-1 text-xs font-bold rounded transition-all ${codeLanguage === 'css' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
              CSS
            </button>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleFormat}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-xs font-bold border border-gray-600 transition-colors"
          >
            🧹 Formatla
          </button>
          <button
            onClick={handleApply}
            className="px-5 py-2 bg-green-600 hover:bg-green-500 text-white rounded text-sm font-bold flex items-center gap-2 shadow-lg hover:shadow-green-500/20 transition-all"
          >
            <Check size={16} /> KAYDET VE KAPAT
          </button>
        </div>
      </div>

      {/* EDITOR BODY */}
      <div className="flex-1 relative w-full h-full bg-[#1e1e1e]">
        <MonacoEditor
          height="100%"
          width="100%"
          language={codeLanguage}
          theme="vs-dark"
          value={codeLanguage === 'html' ? currentHtmlCode : currentCssCode}
          onChange={(value) => codeLanguage === 'html' ? setCurrentHtmlCode(value) : setCurrentCssCode(value)}
          onMount={(editor) => {
            if (codeLanguage === 'html') monacoHtmlRef.current = editor;
            else monacoCssRef.current = editor;
            setTimeout(() => editor.layout(), 100);
          }}
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            fontFamily: "'JetBrains Mono', Consolas, monospace",
            wordWrap: 'on',
            automaticLayout: true,
            scrollBeyondLastLine: true,
            padding: { top: 16, bottom: 16 }
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditorPanel;
