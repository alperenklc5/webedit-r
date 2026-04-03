import React, { useState, useEffect, useRef } from 'react';
import { Editor as CraftEditor, Frame, Element, useNode, useEditor } from '@craftjs/core';
import MonacoEditor from '@monaco-editor/react';
import {
  Layout,
  Eye,
  Code,
  ShoppingBag,
  Save,
  Download,
  Undo,
  Redo,
  Monitor,
  Tablet,
  Smartphone,
  Type,
  Square,
  X,
  Edit3,
  Image as ImageIcon,
  Plus,
  Terminal as TerminalIcon,
  Bot,
  Puzzle,
  Clock,
  FileCode,
} from 'lucide-react';
import ThemeStore from './ThemeStore';
import TerminalTab from './TerminalTab';
import PluginManager from './plugins/PluginManager';
import AIAssistantPanel from './AIAssistantPanel';
import AdvancedToolbox from './AdvancedToolbox';

// Tab definitions
const TABS = {
  EDIT: 'edit',
  PREVIEW: 'preview',
  CODE: 'code',
  HISTORY: 'history',
  TERMINAL: 'terminal',
};

// HTML Formatter helper function - defined at module level for reuse
const formatHTML = (html) => {
  try {
    // Simple indentation formatter
    let formatted = '';
    let indent = 0;
    const lines = html.split(/>\s*</);
    
    lines.forEach((line, index) => {
      // Closing tag
      if (line.match(/^\/\w/)) {
        indent = Math.max(0, indent - 1);
      }
      
      // Add indentation
      formatted += '  '.repeat(Math.max(0, indent));
      
      // Add the line
      if (index < lines.length - 1) {
        formatted += '<' + line + '>\n';
      } else {
        formatted += '<' + line;
      }
      
      // Opening tag (not self-closing)
      if (line.match(/^<?\w[^>]*[^\/]$/) && !line.startsWith('/')) {
        indent++;
      }
    });
    
    return formatted.trim();
  } catch (error) {
    // If formatting fails, return original
    return html;
  }
};

// Toast notification helper — module-level so all components in this file can use it
const showToast = (message, type = 'success', duration = 2500) => {
  const colors = {
    success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    error:   'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    info:    'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  };
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = [
    'position:fixed',
    'top:80px',
    'right:20px',
    `background:${colors[type] || colors.success}`,
    'color:white',
    'padding:14px 24px',
    'border-radius:10px',
    'font-weight:700',
    'font-size:14px',
    'z-index:10000',
    'box-shadow:0 4px 20px rgba(0,0,0,0.3)',
    'max-width:360px',
    'word-break:break-word',
    'transition:opacity 0.3s ease',
  ].join(';');
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, duration);
};

// ============ CRAFT.JS COMPONENTS ============

const Box = ({ children, padding = 20, background = '#ffffff', margin = 0 }) => {
  const { connectors: { connect, drag }, selected } = useNode((state) => ({
    selected: state.events.selected,
  }));

  return (
    <div
      ref={(ref) => connect(drag(ref))}
      style={{
        padding: `${padding}px`,
        background,
        margin: `${margin}px`,
        border: selected ? '2px solid #2196F3' : '1px solid #ddd',
        minHeight: '50px',
        borderRadius: '4px',
      }}
    >
      {children}
    </div>
  );
};

Box.craft = {
  displayName: 'Box',
  props: {
    padding: 20,
    background: '#ffffff',
    margin: 0,
  },
};

const Text = ({ text = 'Metin', fontSize = 16, color = '#333333', textAlign = 'left', margin = 0 }) => {
  const { connectors: { connect, drag }, selected } = useNode((state) => ({
    selected: state.events.selected,
  }));

  return (
    <p
      ref={(ref) => connect(drag(ref))}
      style={{
        fontSize: `${fontSize}px`,
        color,
        textAlign,
        margin: `${margin}px`,
        border: selected ? '1px dashed #2196F3' : 'none',
        padding: '5px',
      }}
    >
      {text}
    </p>
  );
};

// Text Settings Component for Craft.js
const TextSettings = () => {
  const { actions, selected, text, fontSize, color } = useEditor((state, query) => {
    const currentNodeId = query.getEvent('selected').first();
    if (!currentNodeId) return {};
    
    const node = state.nodes[currentNodeId];
    return {
      selected: currentNodeId,
      text: node?.data?.props?.text || '',
      fontSize: node?.data?.props?.fontSize || 16,
      color: node?.data?.props?.color || '#333333'
    };
  });

  if (!selected) return null;

  return (
    <div>
      <div style={{ marginBottom: '12px' }}>
        <label style={{ color: '#9ca3af', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
          Metin İçeriği
        </label>
        <textarea
          value={text}
          onChange={(e) => {
            actions.setProp(selected, (props) => {
              props.text = e.target.value;
            });
          }}
          style={{
            width: '100%',
            minHeight: '60px',
            padding: '8px',
            background: '#1f2937',
            border: '1px solid #4b5563',
            borderRadius: '6px',
            color: 'white',
            fontSize: '13px',
            resize: 'vertical'
          }}
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ color: '#9ca3af', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
          Font Boyutu
        </label>
        <input
          type="number"
          value={fontSize}
          onChange={(e) => {
            actions.setProp(selected, (props) => {
              props.fontSize = parseInt(e.target.value) || 16;
            });
          }}
          style={{
            width: '100%',
            padding: '8px',
            background: '#1f2937',
            border: '1px solid #4b5563',
            borderRadius: '6px',
            color: 'white',
            fontSize: '13px'
          }}
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ color: '#9ca3af', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
          Renk
        </label>
        <input
          type="color"
          value={color}
          onChange={(e) => {
            actions.setProp(selected, (props) => {
              props.color = e.target.value;
            });
          }}
          style={{
            width: '100%',
            height: '40px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        />
      </div>
    </div>
  );
};

Text.craft = {
  displayName: 'Text',
  props: {
    text: 'Metin',
    fontSize: 16,
    color: '#333333',
    textAlign: 'left',
    margin: 0,
  },
  related: {
    settings: TextSettings
  }
};

const Button = ({ text = 'Buton', background = '#007acc', color = '#ffffff', padding = '10px 20px', margin = 0 }) => {
  const { connectors: { connect, drag }, selected } = useNode((state) => ({
    selected: state.events.selected,
  }));

  return (
    <button
      ref={(ref) => connect(drag(ref))}
      style={{
        padding,
        background,
        color,
        margin: `${margin}px`,
        border: selected ? '2px solid #FF9800' : 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
      }}
    >
      {text}
    </button>
  );
};

// Button Settings Component for Craft.js
const ButtonSettings = () => {
  const { actions, selected, text, background, color } = useEditor((state, query) => {
    const currentNodeId = query.getEvent('selected').first();
    if (!currentNodeId) return {};
    
    const node = state.nodes[currentNodeId];
    return {
      selected: currentNodeId,
      text: node?.data?.props?.text || '',
      background: node?.data?.props?.background || '#007acc',
      color: node?.data?.props?.color || '#ffffff'
    };
  });

  if (!selected) return null;

  return (
    <div>
      <div style={{ marginBottom: '12px' }}>
        <label style={{ color: '#9ca3af', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
          Buton Metni
        </label>
        <input
          type="text"
          value={text}
          onChange={(e) => {
            actions.setProp(selected, (props) => {
              props.text = e.target.value;
            });
          }}
          style={{
            width: '100%',
            padding: '8px',
            background: '#1f2937',
            border: '1px solid #4b5563',
            borderRadius: '6px',
            color: 'white',
            fontSize: '13px'
          }}
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ color: '#9ca3af', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
          Arka Plan Rengi
        </label>
        <input
          type="color"
          value={background}
          onChange={(e) => {
            actions.setProp(selected, (props) => {
              props.background = e.target.value;
            });
          }}
          style={{
            width: '100%',
            height: '40px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ color: '#9ca3af', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
          Metin Rengi
        </label>
        <input
          type="color"
          value={color}
          onChange={(e) => {
            actions.setProp(selected, (props) => {
              props.color = e.target.value;
            });
          }}
          style={{
            width: '100%',
            height: '40px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        />
      </div>
    </div>
  );
};

Button.craft = {
  displayName: 'Button',
  props: {
    text: 'Buton',
    background: '#007acc',
    color: '#ffffff',
    padding: '10px 20px',
    margin: 0,
  },
  related: {
    settings: ButtonSettings
  }
};

const Image = ({ src = '', alt = 'Image', width = 'auto', height = 'auto', margin = 0 }) => {
  const { connectors: { connect, drag }, selected } = useNode((state) => ({
    selected: state.events.selected,
  }));

  return (
    <img
      ref={(ref) => connect(drag(ref))}
      src={src}
      alt={alt}
      style={{
        width,
        height,
        maxWidth: '100%',
        margin: `${margin}px`,
        border: selected ? '2px solid #2196F3' : 'none',
        borderRadius: '4px',
      }}
    />
  );
};

Image.craft = {
  displayName: 'Image',
  props: {
    src: '',
    alt: 'Image',
    width: 'auto',
    height: 'auto',
    margin: 0,
  },
};

const Container = ({ children, background = '#f5f5f5', padding = 20, minHeight = '100px', margin = 0 }) => {
  const { connectors: { connect, drag }, selected } = useNode((state) => ({
    selected: state.events.selected,
  }));

  return (
    <div
      ref={(ref) => connect(drag(ref))}
      style={{
        padding: `${padding}px`,
        background,
        minHeight,
        margin: `${margin}px`,
        border: selected ? '2px dashed #2196F3' : '1px dashed #ccc',
        borderRadius: '4px',
      }}
    >
      {children}
    </div>
  );
};

Container.craft = {
  displayName: 'Container',
  props: {
    background: '#f5f5f5',
    padding: 20,
    minHeight: '100px',
    margin: 0,
  },
};

// ============ CRAFT.JS EDITOR CONTENT ============

const CraftEditorContent = () => {
  const { actions } = useEditor();

  const ToolboxItem = ({ component: Component, label, icon: Icon }) => {
    const { connectors } = useEditor();

    return (
      <div
        ref={(ref) => connectors.create(ref, <Component />)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px',
          background: '#2d2d2d',
          borderRadius: '6px',
          border: '1px solid #3d3d3d',
          cursor: 'grab',
          marginBottom: '8px',
        }}
      >
        <Icon size={16} style={{ color: '#60a5fa' }} />
        <span style={{ color: '#d1d5db', fontSize: '14px' }}>{label}</span>
      </div>
    );
  };

  const PropertiesPanel = () => {
    // Safe check for selected node
    const { selectedNode, selectedId } = useEditor((state, query) => {
      const currentNodeId = query.getEvent('selected').first();
      
      if (!currentNodeId) {
        return { selectedNode: null, selectedId: null };
      }
      
      const node = state.nodes[currentNodeId];
      
      if (!node) {
        return { selectedNode: null, selectedId: null };
      }
      
      return {
        selectedNode: node,
        selectedId: currentNodeId
      };
    });

    if (!selectedNode) {
      return (
        <div style={{ 
          padding: '20px', 
          color: '#9ca3af',
          textAlign: 'center',
          fontSize: '14px'
        }}>
          <p>👆 Bir bileşen seçin</p>
          <p style={{ fontSize: '12px', marginTop: '10px', opacity: 0.7 }}>
            Canvas üzerindeki bir elemente tıklayın
          </p>
        </div>
      );
    }

    // Get display name safely
    const displayName = selectedNode.data?.displayName || selectedNode.data?.name || 'Unknown';
    
    // Get props safely with fallback
    const nodeProps = selectedNode.data?.props || {};
    
    // Get settings component if available
    const SettingsComponent = selectedNode.related?.settings;
    
    // Check if deletable (not ROOT)
    const isDeletable = selectedNode.data?.name !== 'ROOT';

    return (
      <div style={{ padding: '16px' }}>
        {/* Selected Element Info */}
        <div style={{
          padding: '12px',
          background: '#374151',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          <h4 style={{ 
            color: 'white', 
            margin: 0,
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            {displayName}
          </h4>
          <p style={{
            color: '#9ca3af',
            fontSize: '11px',
            margin: '4px 0 0 0'
          }}>
            ID: {selectedId}
          </p>
        </div>

        {/* Settings Component */}
        {SettingsComponent && (
          <div style={{ marginTop: '12px' }}>
            {React.createElement(SettingsComponent)}
          </div>
        )}

        {/* Fallback: Show props manually if no settings component */}
        {!SettingsComponent && Object.keys(nodeProps).length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(nodeProps).map(([key, value]) => {
              if (key === 'children' || key === 'className') return null;
              
              return (
                <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase' }}>{key}</label>
                  <input
                    type={key.includes('color') || key.includes('background') ? 'color' : 'text'}
                    value={value || ''}
                    onChange={(e) => {
                      actions.setProp(selectedId, (props) => {
                        props[key] = e.target.value;
                      });
                    }}
                    style={{
                      padding: '8px',
                      background: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '4px',
                      color: '#d1d5db',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Delete Button */}
        {isDeletable && (
          <button
            onClick={() => {
              if (confirm('Bu bileşeni silmek istediğinize emin misiniz?')) {
                actions.delete(selectedId);
              }
            }}
            style={{
              width: '100%',
              padding: '10px',
              marginTop: '20px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            🗑️ Bileşeni Sil
          </button>
        )}

        {/* Props Display (for debugging) */}
        {Object.keys(nodeProps).length > 0 && (
          <details style={{ marginTop: '20px' }}>
            <summary style={{ 
              color: '#9ca3af', 
              fontSize: '12px',
              cursor: 'pointer',
              padding: '8px',
              background: '#374151',
              borderRadius: '4px'
            }}>
              🔍 Props (Debug)
            </summary>
            <pre style={{
              fontSize: '10px',
              color: '#d1d5db',
              background: '#1f2937',
              padding: '8px',
              borderRadius: '4px',
              marginTop: '8px',
              overflow: 'auto',
              maxHeight: '200px'
            }}>
              {JSON.stringify(nodeProps, null, 2)}
            </pre>
          </details>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 48px)' }}>
      {/* LEFT SIDEBAR */}
      <div style={{ 
        width: '280px', 
        display: 'flex', 
        flexDirection: 'column',
        background: '#1f2937',
        borderRight: '1px solid #374151',
        flexShrink: 0
      }}>
        {/* Toolbox */}
        <div style={{ 
          flex: '0 0 40%',
          overflowY: 'auto',
          borderBottom: '1px solid #374151'
        }}>
          <div style={{ padding: '12px 16px', background: '#1f2937' }}>
            <h3 style={{ color: 'white', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>
              Araç Kutusu
            </h3>
          </div>
          <div style={{ padding: '12px' }}>
            <ToolboxItem component={Box} label="Kutu" icon={Square} />
            <ToolboxItem component={Text} label="Metin" icon={Type} />
            <ToolboxItem component={Button} label="Düğme" icon={Square} />
            <ToolboxItem component={Container} label="Konteyner" icon={Layout} />
            <ToolboxItem component={Image} label="Görsel" icon={ImageIcon} />
          </div>
        </div>

        {/* Properties */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '12px 16px', background: '#1f2937', borderBottom: '1px solid #374151' }}>
            <h3 style={{ color: 'white', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>
              Özellikler
            </h3>
          </div>
          <PropertiesPanel />
        </div>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, background: '#111827', padding: '20px', overflowY: 'auto' }}>
        <Frame>
          <Element is={Container} canvas background="#ffffff" minHeight="100%" padding={20}>
            <Text text="Yeni Projeniz" fontSize={32} textAlign="center" color="#333333" margin={16} />
            <Text text="Buraya bir şeyler sürükleyin..." fontSize={16} textAlign="center" color="#666666" margin={8} />
            <Container minHeight="200px" margin="16px 0" background="#f0f0f0">
              <Text text="Bileşenler:" fontSize={18} color="#333333" />
              <Button text="Tıkla Bana" margin={16} />
            </Container>
          </Element>
        </Frame>
      </div>
    </div>
  );
};

// ============ IFRAME-BASED EDITOR ============

const GrapesJSEditor = ({ themeHTML, onHTMLChange, onJumpToCode, onHistoryEntry }) => {
  const iframeRef = useRef(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectionKey, setSelectionKey] = useState(0);
  // Bug #1 Fix: Controlled color picker state
  const [currentTextColor, setCurrentTextColor] = useState('#000000');
  const [currentBgColor, setCurrentBgColor] = useState('#ffffff');
  // Controlled input state for element properties
  const [currentHref, setCurrentHref] = useState('');
  const [currentLinkTarget, setCurrentLinkTarget] = useState(false);
  const [currentImageSrc, setCurrentImageSrc] = useState('');
  const [currentImageAlt, setCurrentImageAlt] = useState('');
  const [currentBgImageUrl, setCurrentBgImageUrl] = useState('');
  const [currentFontSizePx, setCurrentFontSizePx] = useState('16px');
  const [currentFontFamilyState, setCurrentFontFamilyState] = useState('inherit');
  const [currentPadding, setCurrentPadding] = useState('');
  const [currentMargin, setCurrentMargin] = useState('');
  const [currentWidth, setCurrentWidth] = useState('');
  const [currentHeight, setCurrentHeight] = useState('');
  const [currentPosition, setCurrentPosition] = useState('static');
  const [currentLeft, setCurrentLeft] = useState('');
  const [currentTop, setCurrentTop] = useState('');
  const [currentBorderColor, setCurrentBorderColor] = useState('#000000');
  const [currentBorderWidth, setCurrentBorderWidth] = useState('0px');
  const [currentBorderRadius, setCurrentBorderRadius] = useState('');
  // Meta editor controlled state
  const [metaTitle, setMetaTitle] = useState('');
  const [metaFavicon, setMetaFavicon] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showMetaEditor, setShowMetaEditor] = useState(false);
  const [showToolbox, setShowToolbox] = useState(false);
  // Phase 2: Element management
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // Drag-drop canvas
  const [isDraggingComponent, setIsDraggingComponent] = useState(false);
  const [isDragOverCanvas, setIsDragOverCanvas] = useState(false);
  // Element drag position indicator
  const [dragPosition, setDragPosition] = useState(null);

  // Ref to store event listeners for re-attachment
  const eventListenersRef = useRef([]);
  // Ref to track in-canvas element drag state
  const dragStateRef = useRef({ isDragging: false, initialX: 0, initialY: 0, cleanup: null });
  // CRITICAL FIX #1: Track user-initiated HTML changes to skip iframe reload
  const isUserEditRef = useRef(false);

  // Helper: Convert RGB to Hex
  const rgbToHex = (rgb) => {
    if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return '#ffffff';
    const match = rgb.match(/\d+/g);
    if (!match) return '#ffffff';
    return '#' + match.slice(0, 3).map(x => {
      const hex = parseInt(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  // Helper: Get element CSS path
  const getElementPath = (element, body) => {
    const path = [];
    let current = element;
    while (current && current !== body) {
      let selector = current.tagName.toLowerCase();
      if (current.id) selector += '#' + current.id;
      if (current.className && typeof current.className === 'string') {
        selector += '.' + current.className.split(' ').filter(c => c).join('.');
      }
      path.unshift(selector);
      current = current.parentElement;
    }
    return path.join(' > ');
  };

  // ============ META & SEO HELPER FUNCTIONS ============
  
  // Get meta content from iframe
  const getMetaContent = (name) => {
    const iframe = iframeRef.current;
    if (!iframe) return '';
    
    const iframeDoc = iframe.contentDocument;
    if (!iframeDoc) return '';
    
    if (name === 'title') {
      return iframeDoc.title || '';
    }
    
    const meta = iframeDoc.querySelector(`meta[name="${name}"]`);
    return meta?.getAttribute('content') || '';
  };

  // Get favicon href from iframe
  const getFaviconHref = () => {
    const iframe = iframeRef.current;
    if (!iframe) return '';
    
    const iframeDoc = iframe.contentDocument;
    if (!iframeDoc) return '';
    
    const link = iframeDoc.querySelector('link[rel="icon"]') || 
                  iframeDoc.querySelector('link[rel="shortcut icon"]');
    return link?.getAttribute('href') || '';
  };

  // Update meta tag in iframe
  const updateMetaTag = (name, content) => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    
    const iframeDoc = iframe.contentDocument;
    if (!iframeDoc) return;
    
    if (name === 'title') {
      iframeDoc.title = content;
      updateHTML();
      return;
    }
    
    let meta = iframeDoc.querySelector(`meta[name="${name}"]`);
    if (!meta) {
      meta = iframeDoc.createElement('meta');
      meta.setAttribute('name', name);
      iframeDoc.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
    updateHTML();
  };

  // Update favicon in iframe
  const updateFavicon = (href) => {
    const iframe = iframeRef.current;
    if (!iframe || !href) return;
    
    const iframeDoc = iframe.contentDocument;
    if (!iframeDoc) return;
    
    // Remove old favicons
    iframeDoc.querySelectorAll('link[rel*="icon"]').forEach(link => link.remove());
    
    // Add new favicon
    const link = iframeDoc.createElement('link');
    link.setAttribute('rel', 'icon');
    link.setAttribute('type', 'image/x-icon');
    link.setAttribute('href', href);
    iframeDoc.head.appendChild(link);
    
    updateHTML();
  };

  // Save to history
  const saveToHistory = () => {
    if (!iframeRef.current) return;

    const iframeDoc = iframeRef.current.contentDocument;
    if (!iframeDoc || !iframeDoc.documentElement) return;

    const currentHTML = iframeDoc.documentElement.outerHTML;

    // Don't save if identical to current history entry
    if (currentHTML === history[historyIndex]) return;

    // Remove future history if we're in the middle
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(currentHTML);

    // Limit history to 50 items
    if (newHistory.length > 50) {
      newHistory.shift();
    }

    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Sync meta editor state when panel opens
  useEffect(() => {
    if (showMetaEditor) {
      setMetaTitle(getMetaContent('title'));
      setMetaFavicon(getFaviconHref());
      setMetaDescription(getMetaContent('description'));
      setMetaKeywords(getMetaContent('keywords'));
    }
  }, [showMetaEditor]);

  // Update HTML and notify parent
  const updateHTML = (markUnsaved = true) => {
    isUserEditRef.current = true; // CRITICAL FIX #1: this change came from a user edit
    if (!iframeRef.current) return;
    
    const iframeDoc = iframeRef.current.contentDocument;
    if (!iframeDoc || !iframeDoc.documentElement) return;
    
    const updatedHTML = `<!DOCTYPE html>\n${iframeDoc.documentElement.outerHTML}`;
    
    if (onHTMLChange) {
      onHTMLChange(updatedHTML);
    }
    
    if (markUnsaved) {
      setHasUnsavedChanges(true);
      
      // Auto-save after 2 seconds of inactivity
      clearTimeout(window.autoSaveTimeout);
      window.autoSaveTimeout = setTimeout(() => {
        applyChanges();
      }, 2000);
    }
    
    // Save to history after a small delay (debounce)
    clearTimeout(window.historyTimeout);
    window.historyTimeout = setTimeout(saveToHistory, 500);
  };

  // Apply changes function — saves current iframe HTML to localStorage
  const applyChanges = () => {
    setIsSaving(true);
    setHasUnsavedChanges(false);

    try {
      const iframe = iframeRef.current;
      if (iframe?.contentDocument) {
        const currentHTML = `<!DOCTYPE html>\n${iframe.contentDocument.documentElement.outerHTML}`;
        try {
          localStorage.setItem('webeditr_project', currentHTML);
          console.log('💾 Auto-saved to localStorage:', (currentHTML.length / 1024).toFixed(1), 'KB');
        } catch (storageError) {
          console.error('❌ localStorage save failed:', storageError);
          setIsSaving(false);
          if (storageError.name === 'QuotaExceededError' || storageError.code === 22) {
            const toast = document.createElement('div');
            toast.innerHTML = `<div style="margin-bottom:8px;font-weight:700;">❌ Kaydetme başarısız</div><div style="font-size:13px;line-height:1.4;">LocalStorage dolu (resimler çok büyük olabilir).<br/>Çözüm: Dışa Aktar butonunu kullanın.</div>`;
            toast.style.cssText = 'position:fixed;top:80px;right:20px;background:linear-gradient(135deg,#ef4444 0%,#dc2626 100%);color:white;padding:16px 24px;border-radius:10px;font-weight:600;z-index:10000;box-shadow:0 4px 20px rgba(239,68,68,0.4);max-width:320px;';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 5000);
            console.warn('📊 Project size:', (currentHTML.length / 1024).toFixed(2), 'KB — localStorage limit is typically 5-10 MB');
          } else {
            const toast = document.createElement('div');
            toast.textContent = '❌ Kaydetme hatası: ' + storageError.message;
            toast.style.cssText = 'position:fixed;top:80px;right:20px;background:#ef4444;color:white;padding:14px 24px;border-radius:10px;font-weight:700;z-index:10000;';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
          }
          return;
        }
      }
    } catch (error) {
      console.error('❌ Auto-save failed:', error);
    }

    setTimeout(() => {
      setIsSaving(false);
    }, 500);
  };

  // Store attachEventListeners in ref for reuse
  const attachEventListenersRef = useRef(null);

  // Initialize iframe with proper null checks
  const initializeEditor = () => {
    if (!iframeRef.current || !themeHTML) {
      console.error('Cannot initialize editor: iframe or themeHTML is null');
      return;
    }

    const iframe = iframeRef.current;

    // Wait for iframe document to be ready
    const checkDocReady = () => {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

      if (!iframeDoc || !iframeDoc.body) {
        console.log('Waiting for iframe document...');
        setTimeout(checkDocReady, 50);
        return;
      }

      console.log('✅ Iframe document ready, initializing...');
      console.log('📄 Theme HTML length:', themeHTML.length);

      try {
        const usesAlpine = /x-data|x-text|x-for|x-show|x-if|x-model/i.test(themeHTML);
        const hasAlpineCDN = /alpinejs|alpine\.js|alpine\.min/i.test(themeHTML);

        let htmlToWrite = themeHTML;

        if (usesAlpine) {
          // Inject mock data BEFORE Alpine so x-for loops and x-text bindings
          // have something to render. Expose values both as globals (window.X)
          // and via alpine:init so component-scoped lookups also work.
          const mockDataScript = `<script>
(function() {
  var mock = {
    // Burger / food themes
    items: [
      { name: 'Classic Burger', price: 12, description: 'Beef patty with cheese', image: '', category: 'burger' },
      { name: 'Veggie Burger',  price: 10, description: 'Plant-based patty',      image: '', category: 'burger' },
      { name: 'Chicken Burger', price: 11, description: 'Grilled chicken fillet', image: '', category: 'burger' }
    ],
    toppings: [
      { name: 'Cheese',   price: 2,   selected: false },
      { name: 'Bacon',    price: 3,   selected: false },
      { name: 'Avocado',  price: 2.5, selected: false },
      { name: 'Jalapeno', price: 1.5, selected: false }
    ],
    item:    { name: 'Classic Burger', price: 12, description: 'Beef patty', image: '' },
    topping: { name: 'Cheese', price: 2, selected: false },
    cart: [], cartTotal: 0, cartCount: 0,

    // Hotel / accommodation themes
    rooms: [
      { name: 'Deluxe Suite',       price: 299, beds: 2, baths: 2, sqft: 600,  image: '' },
      { name: 'Standard Room',      price: 149, beds: 1, baths: 1, sqft: 350,  image: '' },
      { name: 'Presidential Suite', price: 599, beds: 3, baths: 3, sqft: 1200, image: '' }
    ],
    room: { name: 'Deluxe Suite', price: 299, beds: 2, baths: 2, sqft: 600 },

    // Real-estate themes
    properties: [
      { location: 'Manhattan', beds: 3, baths: 2, sqft: 2800, price: 3200000 },
      { location: 'Brooklyn',  beds: 2, baths: 1, sqft: 1500, price: 1800000 }
    ],
    property: { location: 'Manhattan', beds: 3, baths: 2, sqft: 2800, price: 3200000 },

    // Generic / e-commerce
    products: [
      { name: 'Product 1', price: 49, description: 'Great product', image: '', rating: 5 },
      { name: 'Product 2', price: 39, description: 'Also great',    image: '', rating: 4 }
    ],
    product: { name: 'Product 1', price: 49, description: 'Great product', image: '' },
    features: [
      { title: 'Fast',    description: 'Lightning speed',    icon: '' },
      { title: 'Secure',  description: 'Bank-grade security', icon: '' },
      { title: 'Simple',  description: 'Easy to use',        icon: '' }
    ],
    testimonials: [
      { name: 'Jane D.',  text: 'Excellent service!', rating: 5 },
      { name: 'John S.',  text: 'Highly recommend.',  rating: 5 }
    ],

    // Common flags / primitives
    open: false, show: false, active: false,
    selected: null, loading: false, count: 0, total: 0,
    tab: 0, activeTab: 0, currentSlide: 0,
    menuOpen: false, modalOpen: false, sidebarOpen: false,
    title: 'Welcome', subtitle: 'Subtitle', description: 'Description',
    price: 15, name: 'Item', quantity: 1
  };

  // Make every key available as a global so Alpine component scopes can resolve them
  Object.keys(mock).forEach(function(k) { window[k] = mock[k]; });
  window._webeditrMock = mock;

  // Register with Alpine when it boots (handles x-data="functionName()" patterns)
  document.addEventListener('alpine:init', function() {
    if (window.Alpine) {
      Alpine.store('mock', mock);
      Alpine.data('mockData',   function() { return mock; });
      Alpine.data('burgerMenu', function() { return mock; });
      Alpine.data('hotelApp',   function() { return mock; });
      Alpine.data('app',        function() { return mock; });
      Alpine.data('store',      function() { return mock; });
    }
  });
})();
<\/script>`;

          if (!hasAlpineCDN) {
            console.log('💧 Injecting Alpine.js CDN + mock data...');
            const alpineTag = '<script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer><\/script>';
            const inject = mockDataScript + '\n' + alpineTag + '\n';
            htmlToWrite = htmlToWrite.includes('</head>')
              ? htmlToWrite.replace('</head>', inject + '</head>')
              : inject + htmlToWrite;
          } else {
            console.log('💧 Theme has Alpine.js — injecting mock data only...');
            htmlToWrite = htmlToWrite.includes('</head>')
              ? htmlToWrite.replace('</head>', mockDataScript + '\n</head>')
              : mockDataScript + '\n' + htmlToWrite;
          }
        }

        // Write HTML to iframe
        iframeDoc.open();
        iframeDoc.write(htmlToWrite);
        iframeDoc.close();

        // Aggressive error suppressor — must be set immediately after close,
        // before Alpine starts evaluating directives.
        if (iframe.contentWindow) {
          iframe.contentWindow.onerror = function(msg) {
            if (msg && typeof msg === 'string') {
              const suppress = [
                'is not defined', 'undefined', 'Cannot read',
                'Cannot access', 'not a function', 'Alpine'
              ];
              if (suppress.some(function(k) { return msg.includes(k); })) {
                console.warn('⚠️ Suppressed iframe error:', msg.substring(0, 120));
                return true;
              }
            }
            return false;
          };
          iframe.contentWindow.addEventListener('unhandledrejection', function(e) {
            console.warn('⚠️ Suppressed promise rejection in iframe');
            e.preventDefault();
          });
        }

        // 1000ms when Alpine was injected — gives CDN time to download,
        // parse, and run x-for / x-show before we attach click listeners.
        const listenerDelay = (usesAlpine && !hasAlpineCDN) ? 1000 : 300;

        // CRITICAL: Wait for all content (images, fonts, styles) to load
        const waitForContentLoad = () => {
          // Ensure proper sizing and overflow - CRITICAL for full theme display
          if (iframeDoc.body) {
            // Reset any problematic styles - use auto height to allow content expansion
            iframeDoc.body.style.cssText = `
              margin: 0 !important;
              padding: 0 !important;
              height: auto !important;
              min-height: 100vh !important;
              overflow: visible !important;
              overflow-x: hidden !important;
              width: 100% !important;
            `;
          }

          // Ensure html element also has proper styles
          if (iframeDoc.documentElement) {
            iframeDoc.documentElement.style.cssText = `
              height: auto !important;
              min-height: 100vh !important;
              overflow: visible !important;
              overflow-x: hidden !important;
              width: 100% !important;
            `;
          }

          // Add base styles to ensure content displays correctly
          let baseStyle = iframeDoc.getElementById('webeditr-base-styles');
          if (!baseStyle) {
            baseStyle = iframeDoc.createElement('style');
            baseStyle.id = 'webeditr-base-styles';
            baseStyle.textContent = `
              /* WebEdit-r Base Styles - FULL HEIGHT FIX */
              *, *::before, *::after {
                box-sizing: border-box;
              }
              html {
                height: auto !important;
                min-height: 100vh !important;
                overflow: visible !important;
                overflow-x: hidden !important;
              }
              body {
                margin: 0 !important;
                padding: 0 !important;
                height: auto !important;
                min-height: 100vh !important;
                overflow: visible !important;
                overflow-x: hidden !important;
                width: 100% !important;
              }
              img {
                max-width: 100%;
                height: auto;
              }
              /* Ensure main containers can expand */
              #root, #app, .app, .main, main, .container, .wrapper {
                height: auto !important;
                min-height: auto !important;
                overflow: visible !important;
              }
              /* Prevent JS errors from breaking display */
              [onclick*="\${"], [onmouseover*="\${"] {
                pointer-events: auto !important;
              }
            `;
            if (iframeDoc.head) {
              iframeDoc.head.insertBefore(baseStyle, iframeDoc.head.firstChild);
            }
          }

          // Debug: Log content height
          console.log('📊 Theme content height:', {
            bodyScrollHeight: iframeDoc.body?.scrollHeight,
            bodyClientHeight: iframeDoc.body?.clientHeight,
            htmlScrollHeight: iframeDoc.documentElement?.scrollHeight
          });

          console.log('✅ Base styles and error handler applied');
        };

        // Wait for content to load then attach listeners
        // listenerDelay is 700ms when Alpine was injected, 300ms otherwise
        setTimeout(() => {
          waitForContentLoad();

          if (attachEventListenersRef.current) {
            attachEventListenersRef.current(iframeDoc);
          }

          // Initialize history with current HTML
          if (history.length === 0) {
            setHistory([themeHTML]);
            setHistoryIndex(0);
          }

          console.log('✅ Editor initialized successfully');
        }, listenerDelay);

        // Image error handling — run after images have had time to start loading
        setTimeout(() => {
          const images = iframeDoc.querySelectorAll('img');
          console.log(`📷 Found ${images.length} images in theme`);

          const placeholder = 'data:image/svg+xml,' + encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">' +
            '<rect fill="#374151" width="400" height="300"/>' +
            '<text x="50%" y="48%" text-anchor="middle" fill="#9ca3af" font-size="16" font-family="sans-serif">Resim Yüklenemedi</text>' +
            '<text x="50%" y="62%" text-anchor="middle" fill="#6b7280" font-size="12" font-family="sans-serif">Image failed to load</text>' +
            '</svg>'
          );

          images.forEach(img => {
            // Lazy loading for performance
            if (!img.getAttribute('loading')) img.setAttribute('loading', 'lazy');

            // Store original src before any modification
            if (!img.dataset.originalSrc) img.dataset.originalSrc = img.src;

            // Fix Unsplash URLs — ensure width/quality params are present
            try {
              if (img.src && img.src.includes('unsplash.com') && !img.src.startsWith('data:')) {
                const u = new URL(img.src);
                if (!u.searchParams.has('w')) u.searchParams.set('w', '800');
                if (!u.searchParams.has('q')) u.searchParams.set('q', '80');
                if (!u.searchParams.has('auto')) u.searchParams.set('auto', 'format');
                img.src = u.toString();
              }
            } catch (_) { /* non-parseable src, skip */ }

            // Replace broken images with styled placeholder
            img.addEventListener('error', function onImgError() {
              if (this.src !== placeholder) {
                console.warn('⚠️ Image failed to load:', this.dataset.originalSrc || this.src);
                this.src = placeholder;
                this.style.background = '#374151';
                this.removeEventListener('error', onImgError);
              }
            });
          });
        }, 800);

      } catch (error) {
        console.error('Error initializing editor:', error);
      }
    };

    checkDocReady();
  };

  // Attach event listeners function with null checks
  const attachEventListeners = (iframeDoc) => {
    if (!iframeDoc || !iframeDoc.body) {
      console.error('Cannot attach listeners: document or body is null');
      return;
    }
    
    const body = iframeDoc.body;
    
    try {
      // Add selection CSS — only once per document (avoid duplicate <style> tags)
      if (!iframeDoc.getElementById('__editor-selection-styles')) {
        const style = iframeDoc.createElement('style');
        style.id = '__editor-selection-styles';
        style.textContent = `
          .editor-selected {
            outline: 2px solid #3b82f6 !important;
            outline-offset: 2px;
            cursor: grab !important;
          }
          .editor-selected:active {
            cursor: grabbing !important;
          }
          .editor-hover {
            outline: 1px dashed #60a5fa !important;
            outline-offset: 1px;
            cursor: pointer !important;
          }
          .editor-dragging {
            opacity: 0.82 !important;
            box-shadow: 0 20px 60px rgba(59,130,246,0.4) !important;
            outline: 2px solid #3b82f6 !important;
            cursor: grabbing !important;
          }
        `;
        if (iframeDoc.head) {
          iframeDoc.head.appendChild(style);
        }
      }
      
      // Clear previous listeners
      if (eventListenersRef.current && eventListenersRef.current.forEach) {
        eventListenersRef.current.forEach(cleanup => {
          if (typeof cleanup === 'function') cleanup();
        });
      }
      eventListenersRef.current = [];
      
      // Click handler
      const handleElementClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        
        let clickedElement = e.target;

        // Walk up to nearest @click trigger (so clicks on icons/spans inside a button select the button)
        const closestTrigger = clickedElement.closest('[\\@click], [x-on\\:click]');
        if (closestTrigger && closestTrigger !== clickedElement) {
          clickedElement = closestTrigger;
          console.log('✅ Auto-selected accordion trigger:', clickedElement.tagName);
        }
        // Walk up to <summary> for native details
        const closestSummary = !closestTrigger && clickedElement.tagName.toLowerCase() !== 'summary'
          ? clickedElement.closest('summary')
          : null;
        if (closestSummary) {
          clickedElement = closestSummary;
          console.log('✅ Auto-selected summary:', clickedElement.tagName);
        }

        // === NATIVE DETAILS ACCORDION ===
        const parentDetails = clickedElement.closest('details');
        const isSummary = clickedElement.tagName.toLowerCase() === 'summary' || !!clickedElement.closest('summary');
        const isInsideDetails = parentDetails !== null;

        if (isInsideDetails && !isSummary) {
          const summary = parentDetails.querySelector('summary');
          const contentElements = Array.from(parentDetails.children).filter(
            el => el !== summary && el.tagName.toLowerCase() !== 'summary'
          );
          if (contentElements.length > 0) {
            clickedElement = contentElements[0];
            console.log('📋 Selected accordion content:', clickedElement.tagName);
          }
        }

        // === ALPINE.JS ACCORDION ===
        const hasClickHandler = clickedElement.hasAttribute('@click') || clickedElement.hasAttribute('x-on:click');
        const xDataContainer = clickedElement.closest('[x-data]');
        let alpineContent = null;
        if (hasClickHandler && xDataContainer) {
          const parent = clickedElement.parentElement;
          alpineContent = parent ? Array.from(parent.children).find(
            child => child.hasAttribute('x-show') || child.hasAttribute('x-collapse')
          ) : null;
        }
        // Also check if clicked element itself has x-show (user clicked the answer area)
        const xShowEl = clickedElement.hasAttribute('x-show') || clickedElement.hasAttribute('x-collapse')
          ? clickedElement
          : clickedElement.closest('[x-show], [x-collapse]');

        const isAlpineAccordion = !!(hasClickHandler && alpineContent) || !!(xShowEl && xDataContainer);

        // Build accordion role/question/answer refs
        let accordionRole = null;
        let accordionQuestion = null;
        let accordionAnswer = null;
        let accordionType = null;

        if (isInsideDetails) {
          accordionType = 'native';
          accordionRole = isSummary ? 'summary' : 'content';
          accordionQuestion = parentDetails.querySelector('summary');
          accordionAnswer = Array.from(parentDetails.children).find(
            c => c.tagName.toLowerCase() !== 'summary'
          ) || null;
        } else if (isAlpineAccordion) {
          accordionType = 'alpine';
          if (hasClickHandler && alpineContent) {
            // Clicked the trigger button
            accordionRole = 'trigger';
            accordionQuestion = clickedElement;
            accordionAnswer = alpineContent;
          } else if (xShowEl) {
            // Clicked inside the answer area
            accordionRole = 'content';
            accordionAnswer = xShowEl;
            accordionQuestion = xDataContainer?.querySelector('[\\@click], [x-on\\:click]') || null;
            clickedElement = xShowEl; // Select the x-show container
          }
        }

        const isAccordion = isInsideDetails || isAlpineAccordion;

        console.log('🔍 Accordion detection:', {
          nativeDetails: isInsideDetails,
          alpineAccordion: isAlpineAccordion,
          hasClickHandler,
          accordionType,
          accordionRole
        });

        // === DEEPEST ELEMENT SELECTION ===
        // For non-accordion elements: walk up to <a>/<button> so clicking link text
        // selects the full link. But keep <span> if it has its own style attribute
        // (styled spans in headings should be editable independently).
        if (!isAccordion) {
          const tag = clickedElement.tagName.toLowerCase();
          // Clicked a child of a link → select the link
          const closestAnchor = clickedElement.closest('a');
          if (closestAnchor && closestAnchor !== clickedElement && !clickedElement.getAttribute('style')) {
            clickedElement = closestAnchor;
            console.log('✅ Auto-selected <a> tag');
          }
          // Span inside a heading with no inline style → walk up to the heading
          // (avoids empty-text selections when heading has no styled spans)
          else if (tag === 'span' && !clickedElement.getAttribute('style') && !clickedElement.className) {
            const parentHeading = clickedElement.closest('h1,h2,h3,h4,h5,h6');
            if (parentHeading) {
              clickedElement = parentHeading;
              console.log('✅ Auto-selected heading from unstyled span');
            }
          }
        }

        // CRITICAL FIX: If clicked element is IMG, use it directly
        if (clickedElement.tagName.toLowerCase() === 'img') {
          console.log('✅ Image clicked directly');
        } else {
          // If user clicked on a DIV/container, check if they meant to click an image inside
          const imgInside = clickedElement.querySelector('img');
          if (imgInside && clickedElement.children.length === 1) {
            // DIV only contains one image, assume user wants to edit the image
            clickedElement = imgInside;
            console.log('✅ Auto-selected image inside DIV');
          }
        }
        
        // === NAVBAR/FOOTER DETECTION ===
        const isNavbar = isNavbarContainer(clickedElement);
        const navbarItems = isNavbar ? getNavbarItems(clickedElement) : [];
        const containerType = isNavbar ? getContainerType(clickedElement) : null;
        console.log('Container type:', containerType, 'Items:', navbarItems.length);

        // Remove all previous selections
        try {
          const allSelected = iframeDoc.querySelectorAll('.editor-selected');
          allSelected.forEach(el => el.classList.remove('editor-selected'));
        } catch (err) {
          console.warn('Error removing selections:', err);
        }
        
        // Add selection
        clickedElement.classList.add('editor-selected');

        // ── DRAG & DROP ──────────────────────────────────────────
        // Remove previous drag listeners
        if (dragStateRef.current.cleanup) {
          dragStateRef.current.cleanup();
          dragStateRef.current.cleanup = null;
        }

        const onDragMouseDown = (evt) => {
          const t = evt.target.tagName;
          if (t === 'INPUT' || t === 'TEXTAREA' || t === 'BUTTON' || t === 'A') return;
          if (clickedElement.contentEditable === 'true') return;

          evt.preventDefault();
          evt.stopPropagation();

          // Convert to absolute positioning if needed
          const cs = iframeRef.current?.contentWindow?.getComputedStyle(clickedElement);
          if (cs && cs.position !== 'absolute' && cs.position !== 'fixed') {
            const rect = clickedElement.getBoundingClientRect();
            const scrollLeft = iframeDoc.documentElement.scrollLeft || iframeDoc.body.scrollLeft || 0;
            const scrollTop = iframeDoc.documentElement.scrollTop || iframeDoc.body.scrollTop || 0;
            clickedElement.style.position = 'absolute';
            clickedElement.style.left = (rect.left + scrollLeft) + 'px';
            clickedElement.style.top = (rect.top + scrollTop) + 'px';
            clickedElement.style.margin = '0';
          }

          dragStateRef.current.isDragging = true;
          dragStateRef.current.initialX = evt.clientX - (parseInt(clickedElement.style.left) || 0);
          dragStateRef.current.initialY = evt.clientY - (parseInt(clickedElement.style.top) || 0);

          clickedElement.classList.add('editor-dragging');
          clickedElement.style.zIndex = '9999';
        };

        const onDragMouseMove = (evt) => {
          if (!dragStateRef.current.isDragging) return;
          evt.preventDefault();

          const newX = evt.clientX - dragStateRef.current.initialX;
          const newY = evt.clientY - dragStateRef.current.initialY;

          clickedElement.style.left = newX + 'px';
          clickedElement.style.top = newY + 'px';

          setDragPosition({ x: Math.round(newX), y: Math.round(newY) });
        };

        const onDragMouseUp = () => {
          if (!dragStateRef.current.isDragging) return;

          dragStateRef.current.isDragging = false;
          clickedElement.classList.remove('editor-dragging');
          clickedElement.style.zIndex = '';

          setDragPosition(null);

          // Save position to history
          saveToHistory();
          updateHTML();
          showToast('Konum kaydedildi', 'success');
        };

        clickedElement.addEventListener('mousedown', onDragMouseDown);
        iframeDoc.addEventListener('mousemove', onDragMouseMove);
        iframeDoc.addEventListener('mouseup', onDragMouseUp);

        dragStateRef.current.cleanup = () => {
          clickedElement.removeEventListener('mousedown', onDragMouseDown);
          iframeDoc.removeEventListener('mousemove', onDragMouseMove);
          iframeDoc.removeEventListener('mouseup', onDragMouseUp);
        };
        // ─────────────────────────────────────────────────────────

        // Get computed styles
        let computedStyle;
        try {
          computedStyle = iframeRef.current?.contentWindow?.getComputedStyle(clickedElement);
        } catch (err) {
          console.warn('Error getting computed style:', err);
        }
        
        // IMPORTANT: Detect if this is an IMG tag
        const isImage = clickedElement.tagName.toLowerCase() === 'img';
        
        // CRITICAL FIX: Safely convert className (might be SVGAnimatedString)
        const safeClassName = typeof clickedElement.className === 'string' 
          ? clickedElement.className 
          : (clickedElement.className?.baseVal || '');
        
        // Set selected element with all data - SAFE EXTRACTION
        setSelectedElement({
          element: clickedElement,
          tagName: clickedElement.tagName?.toLowerCase() || 'div',
          isImage: isImage, // ← Flag to show image editor
          // CRITICAL FIX: Safe className handling for SVG elements
          className: safeClassName,
          id: clickedElement.id || '',
          // SAFE TEXT EXTRACTION with try-catch
          text: (() => {
            try {
              return clickedElement.innerText?.substring(0, 200) || '';
            } catch {
              return clickedElement.textContent?.substring(0, 200) || '';
            }
          })(),
          textContent: (() => {
            try {
              return clickedElement.textContent?.substring(0, 200) || '';
            } catch {
              return '';
            }
          })(),
          innerHTML: (() => {
            try {
              return clickedElement.innerHTML || '';
            } catch {
              return '';
            }
          })(),
          href: clickedElement.getAttribute('href') || '',
          src: clickedElement.getAttribute('src') || '',
          alt: clickedElement.getAttribute('alt') || '',
          target: clickedElement.getAttribute('target') || '',
          // Safe style extraction with fallbacks
          backgroundColor: (() => {
            try {
              return rgbToHex(computedStyle?.backgroundColor) || '#ffffff';
            } catch {
              return '#ffffff';
            }
          })(),
          color: (() => {
            try {
              return rgbToHex(computedStyle?.color) || '#000000';
            } catch {
              return '#000000';
            }
          })(),
          fontSize: computedStyle?.fontSize || '16px',
          fontWeight: computedStyle?.fontWeight || 'normal',
          padding: computedStyle?.padding || '0px',
          margin: computedStyle?.margin || '0px',
          width: computedStyle?.width || 'auto',
          height: computedStyle?.height || 'auto',
          path: getElementPath(clickedElement, body),
          // Accordion support
          isAccordion,
          accordionType,
          accordionRole,
          accordionQuestion,
          accordionAnswer,
          parentDetails: parentDetails,
          isNavbar,
          containerType,
          navbarItems
        });

        // Bug #1 Fix: Update controlled color picker state when element is selected
        setCurrentTextColor(rgbToHex(computedStyle?.color) || '#000000');
        setCurrentBgColor(rgbToHex(computedStyle?.backgroundColor) || '#ffffff');
        // Update all other controlled input states
        setCurrentHref(clickedElement.getAttribute('href') || '');
        setCurrentLinkTarget(clickedElement.getAttribute('target') === '_blank');
        const rawSrc = clickedElement.getAttribute('src') || '';
        setCurrentImageSrc(rawSrc.startsWith('data:') ? '' : rawSrc);
        setCurrentImageAlt(clickedElement.getAttribute('alt') || '');
        const rawBg = clickedElement.style?.backgroundImage || '';
        setCurrentBgImageUrl(rawBg ? rawBg.replace(/url\(['"]?|['"]?\)/g, '') : '');
        setCurrentFontSizePx(computedStyle?.fontSize || '16px');
        setCurrentFontFamilyState(
          computedStyle?.fontFamily
            ? computedStyle.fontFamily.replace(/['"]/g, '').split(',')[0].trim()
            : 'inherit'
        );
        setCurrentPadding(computedStyle?.padding || '');
        setCurrentMargin(computedStyle?.margin || '');
        setCurrentWidth(clickedElement.style.width || '');
        setCurrentHeight(clickedElement.style.height || '');
        setCurrentPosition(computedStyle?.position || 'static');
        setCurrentLeft(clickedElement.style.left || '');
        setCurrentTop(clickedElement.style.top || '');
        setCurrentBorderColor(rgbToHex(computedStyle?.borderTopColor) || '#000000');
        setCurrentBorderWidth(clickedElement.style.borderWidth || clickedElement.style.border ? (computedStyle?.borderTopWidth || '0px') : '0px');
        setCurrentBorderRadius(clickedElement.style.borderRadius || '');

        if (onHistoryEntry) {
          onHistoryEntry('info', 'Element seçildi', {
            tag: clickedElement.tagName?.toLowerCase(),
            id: clickedElement.id || null,
            class: (typeof clickedElement.className === 'string' ? clickedElement.className.split(' ')[0] : null) || null
          });
        }

        setSelectionKey(prev => prev + 1);
      };
      
      // Attach listeners to elements
      try {
        const allElements = body.querySelectorAll('*');
        
        if (!allElements || allElements.length === 0) {
          console.warn('No elements found in iframe body');
          return;
        }
        
        console.log(`✅ Attaching listeners to ${allElements.length} elements`);
        
        allElements.forEach(el => {
          el.addEventListener('click', handleElementClick, true);
          
          el.addEventListener('mouseenter', () => {
            if (!el.classList.contains('editor-selected')) {
              el.classList.add('editor-hover');
            }
          });
          
          el.addEventListener('mouseleave', () => {
            el.classList.remove('editor-hover');
          });
        });
        
        // Store cleanup function
        eventListenersRef.current.push(() => {
          allElements.forEach(el => {
            el.removeEventListener('click', handleElementClick, true);
          });
        });
        
      } catch (error) {
        console.error('Error attaching event listeners:', error);
      }
      
    } catch (error) {
      console.error('Error in attachEventListeners:', error);
    }
  };

  // Store reference for reuse
  attachEventListenersRef.current = attachEventListeners;

  // Enable canvas drag-drop overlay while a component is being dragged
  useEffect(() => {
    const onDragStart = (e) => {
      if (e.dataTransfer?.types?.includes('text/html')) {
        setIsDraggingComponent(true);
      }
    };
    const onDragEnd = () => {
      setIsDraggingComponent(false);
      setIsDragOverCanvas(false);
    };
    window.addEventListener('dragstart', onDragStart);
    window.addEventListener('dragend', onDragEnd);
    return () => {
      window.removeEventListener('dragstart', onDragStart);
      window.removeEventListener('dragend', onDragEnd);
    };
  }, []);

  // Main useEffect
  useEffect(() => {
    if (!iframeRef.current || !themeHTML) {
      console.log('useEffect: iframe or themeHTML not ready');
      return;
    }

    // CRITICAL FIX #1: Skip iframe reload if this HTML change came from a user edit
    if (isUserEditRef.current) {
      console.log('⚡ Skipping iframe reload — user edit');
      isUserEditRef.current = false;
      return;
    }

    // Bug #3 Fix: Skip iframe reload if change came from Monaco code editor
    if (sessionStorage.getItem('skipNextReload') === 'true') {
      console.log('⚡ Skipping iframe reload — Monaco edit');
      sessionStorage.removeItem('skipNextReload');
      return;
    }

    const iframe = iframeRef.current;

    // Check if iframe document is already ready
    if (iframe.contentDocument?.readyState === 'complete') {
      initializeEditor();
    } else {
      iframe.onload = initializeEditor;
    }

    // Cleanup
    return () => {
      iframe.onload = null;
    };
  }, [themeHTML]);

  // Refresh iframe with proper null checks
  const handleRefresh = () => {
    if (!iframeRef.current || !themeHTML) {
      console.error('Cannot refresh: iframe or themeHTML is null');
      return;
    }
    
    try {
      const iframe = iframeRef.current;
      
      // Check if document is ready
      const checkAndRefresh = () => {
        const iframeDoc = iframe.contentDocument;
        
        if (!iframeDoc) {
          setTimeout(checkAndRefresh, 50);
          return;
        }
        
        iframeDoc.open();
        iframeDoc.write(themeHTML);
        iframeDoc.close();
        
        // Re-attach listeners
        setTimeout(() => {
          if (attachEventListenersRef.current) {
            attachEventListenersRef.current(iframeDoc);
          }
        }, 200);
        
        setSelectedElement(null);
        setHasUnsavedChanges(false);
        console.log('✅ Iframe refreshed');
      };
      
      checkAndRefresh();
      
    } catch (error) {
      console.error('Error refreshing iframe:', error);
    }
  };

  // Undo function with null checks
  const handleUndo = () => {
    if (historyIndex <= 0 || !iframeRef.current) return;
    
    const previousHTML = history[historyIndex - 1];
    if (!previousHTML) return;
    
    setHistoryIndex(historyIndex - 1);
    
    // Load previous state
    const iframeDoc = iframeRef.current.contentDocument;
    if (!iframeDoc) return;
    
    iframeDoc.open();
    iframeDoc.write(previousHTML);
    iframeDoc.close();
    
    setSelectionKey(prev => prev + 1);
    setSelectedElement(null);
    
    // Re-attach listeners
    setTimeout(() => {
      if (attachEventListenersRef.current) {
        attachEventListenersRef.current(iframeDoc);
      }
    }, 200);
  };

  // Redo function with null checks
  const handleRedo = () => {
    if (historyIndex >= history.length - 1 || !iframeRef.current) return;
    
    const nextHTML = history[historyIndex + 1];
    if (!nextHTML) return;
    
    setHistoryIndex(historyIndex + 1);
    
    // Load next state
    const iframeDoc = iframeRef.current.contentDocument;
    if (!iframeDoc) return;
    
    iframeDoc.open();
    iframeDoc.write(nextHTML);
    iframeDoc.close();
    
    setSelectionKey(prev => prev + 1);
    setSelectedElement(null);
    
    // Re-attach listeners
    setTimeout(() => {
      if (attachEventListenersRef.current) {
        attachEventListenersRef.current(iframeDoc);
      }
    }, 200);
  };

  // Reset function to restore original theme
  const handleReset = () => {
    if (!confirm('Tüm değişiklikler kaybolacak. Orijinal temaya dönmek istiyor musunuz?')) {
      return;
    }
    
    if (!iframeRef.current || !themeHTML) {
      console.error('Cannot reset - iframe or theme is null');
      return;
    }
    
    try {
      // Clear selection
      setSelectedElement(null);
      setHasUnsavedChanges(false);
      
      // Get iframe document
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      
      if (!iframeDoc) {
        console.error('Iframe document not available');
        return;
      }
      
      // Reload original theme HTML
      iframeDoc.open();
      iframeDoc.write(themeHTML);
      iframeDoc.close();
      
      // Reset history
      setHistory([themeHTML]);
      setHistoryIndex(0);
      
      // Re-attach event listeners after a delay
      setTimeout(() => {
        if (attachEventListenersRef.current && iframeDoc) {
          attachEventListenersRef.current(iframeDoc);
        }
      }, 300);
      
      console.log('✅ Theme reset to original');
      
    } catch (error) {
      console.error('Error resetting theme:', error);
      showToast('❌ Tema sıfırlanırken hata oluştu: ' + error.message, 'error', 4000);
    }
  };

  // Jump to Code function
  const handleJumpToCode = () => {
    if (!selectedElement || !selectedElement.element) {
      console.warn('⚠️ No element selected');
      showToast('❌ Önce bir element seçin', 'warning');
      return;
    }
    
    // Get OUTER HTML (includes the tag itself)
    const elementHTML = selectedElement.element.outerHTML;
    
    console.log('🔍 Raw element code:', elementHTML);
    console.log('📏 Code length:', elementHTML.length);
    
    // Format HTML for better readability
    const formattedHTML = formatHTML(elementHTML);
    
    console.log('✨ Formatted code:', formattedHTML);
    console.log('📏 Formatted length:', formattedHTML.length);
    
    // Get a unique identifier for better search
    const elementId = selectedElement.id;
    const elementClass = selectedElement.className;
    const elementTag = selectedElement.tagName;
    
    console.log('🔍 Jumping to code:');
    console.log('Tag:', elementTag);
    console.log('ID:', elementId);
    console.log('Class:', elementClass);
    
    // Set isolated element code for focused view
    if (onJumpToCode) {
      onJumpToCode({
        code: formattedHTML,
        originalHTML: elementHTML, // For line number calculation
        tagName: elementTag,
        id: elementId,
        className: elementClass,
        path: selectedElement.path,
        elementRef: selectedElement.element, // Store reference for updating
        timestamp: Date.now()
      });
      console.log('✅ onJumpToCode called');
    } else {
      console.error('❌ onJumpToCode is not defined!');
    }
    
    console.log('✅ Switched to Code tab');
  };

  const updateElementStyle = (property, value) => {
    if (selectedElement && selectedElement.element) {
      selectedElement.element.style[property] = value;
      updateHTML();
    }
  };

  const updateElementColor = (newColor) => {
    if (selectedElement && selectedElement.element) {
      const el = selectedElement.element;
      const oldColor = el.style.color || selectedElement.color;
      // Use setProperty with !important to override Alpine/Tailwind classes
      el.style.setProperty('color', newColor, 'important');
      setSelectedElement(prev => ({ ...prev, color: newColor }));
      updateHTML();
      if (onHistoryEntry) onHistoryEntry('success', 'Renk değiştirildi', { tag: el.tagName, oldValue: oldColor, newValue: newColor });
    }
  };

  // Helper: detect if element is a navbar/menu/footer container
  const isNavbarContainer = (element) => {
    if (!element) return false;
    const tagName = element.tagName.toLowerCase();
    if (tagName === 'nav' || tagName === 'footer') return true;
    const links = element.querySelectorAll('a');
    if (links.length >= 3) {
      const parent = links[0]?.parentElement;
      if (parent && Array.from(links).every(link => link.parentElement === parent)) return true;
    }
    const className = element.className || '';
    if (typeof className === 'string') {
      const keywords = ['nav', 'menu', 'header-links', 'navigation', 'footer', 'footer-links', 'footer-menu'];
      if (keywords.some(k => className.toLowerCase().includes(k))) return true;
    }
    const id = element.id || '';
    if (id.toLowerCase().includes('nav') || id.toLowerCase().includes('footer') || id.toLowerCase().includes('menu')) return true;
    return false;
  };

  // Helper: get container type ('navbar' or 'footer')
  const getContainerType = (element) => {
    if (!element) return null;
    const tagName = element.tagName.toLowerCase();
    if (tagName === 'footer') return 'footer';
    if (tagName === 'nav') return 'navbar';
    const className = (element.className || '').toLowerCase();
    const id = (element.id || '').toLowerCase();
    if (className.includes('footer') || id.includes('footer')) return 'footer';
    if (className.includes('nav') || className.includes('menu') || id.includes('nav')) return 'navbar';
    return 'navbar';
  };

  // Helper: extract link items from a navbar element
  const getNavbarItems = (navEl) => {
    if (!navEl) return [];
    return Array.from(navEl.querySelectorAll('a')).map((link, i) => ({
      element: link,
      text: link.textContent.trim(),
      href: link.getAttribute('href') || '#',
      index: i
    }));
  };

  // Find the live DOM element inside the iframe (avoids stale references after re-renders)
  const findLiveElement = (elementInfo) => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return null;

    // Strategy 1: by id
    if (elementInfo.id) {
      const el = doc.getElementById(elementInfo.id);
      if (el) return el;
    }

    // Strategy 2: find @click trigger whose first text node matches stored text
    if (elementInfo.isAccordion && (elementInfo.accordionRole === 'trigger' || elementInfo.accordionRole === 'summary')) {
      const triggers = doc.querySelectorAll('[\\@click], [x-on\\:click], summary');
      for (const t of triggers) {
        let txt = '';
        for (const n of t.childNodes) {
          if (n.nodeType === Node.TEXT_NODE) { txt = n.textContent.trim(); break; }
        }
        if (!txt) txt = t.textContent?.trim() || '';
        if (txt && elementInfo.text && txt.startsWith(elementInfo.text.substring(0, 20))) return t;
      }
    }

    // Strategy 3: by className (first class)
    if (elementInfo.className) {
      const cls = elementInfo.className.trim().split(/\s+/)[0];
      if (cls) {
        const el = doc.querySelector('.' + CSS.escape(cls));
        if (el) return el;
      }
    }

    console.warn('⚠️ findLiveElement: no match found', elementInfo);
    return null;
  };

  // Given a live trigger element, find its x-show/x-collapse sibling (the answer panel)
  const findLiveAccordionContent = (liveTrigger) => {
    const parent = liveTrigger?.parentElement;
    if (!parent) return null;
    const wrapper = Array.from(parent.children).find(
      c => c !== liveTrigger && (c.hasAttribute('x-show') || c.hasAttribute('x-collapse') || c.hasAttribute('x-transition'))
    );
    if (!wrapper) return null;
    // Return the innermost text-bearing element (<p>, <span>, etc.) rather than the wrapper div
    const inner = wrapper.querySelector('p.text-gray-600, p, span.text-gray-600, span');
    return inner || wrapper;
  };

  // Save accordion changes — reads live iframe DOM and syncs to parent state
  const saveAccordionChanges = () => {
    if (!iframeRef.current?.contentDocument) return;
    const currentHTML = `<!DOCTYPE html>\n${iframeRef.current.contentDocument.documentElement.outerHTML}`;
    isUserEditRef.current = true;
    if (onHTMLChange) onHTMLChange(currentHTML);
    if (onHistoryEntry) onHistoryEntry('success', 'Accordion değişiklikleri kaydedildi', { type: selectedElement?.accordionType });
    const toast = document.createElement('div');
    toast.textContent = '✅ Kaydedildi!';
    toast.style.cssText = 'position:fixed;top:80px;right:20px;background:#10b981;color:white;padding:12px 20px;border-radius:8px;font-weight:700;z-index:10000;';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  // Ctrl+S — save current iframe state to parent
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (iframeRef.current?.contentDocument) {
          const updatedHTML = `<!DOCTYPE html>\n${iframeRef.current.contentDocument.documentElement.outerHTML}`;
          isUserEditRef.current = true;
          if (onHTMLChange) onHTMLChange(updatedHTML);
        }
        const toast = document.createElement('div');
        toast.textContent = '✅ Tüm değişiklikler kaydedildi';
        toast.style.cssText = 'position:fixed;top:80px;right:20px;background:linear-gradient(135deg,#10b981,#059669);color:white;padding:14px 24px;border-radius:10px;font-weight:700;font-size:15px;z-index:10000;box-shadow:0 4px 20px rgba(16,185,129,0.5);';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const updateElementText = (newText) => {
    if (selectedElement && selectedElement.element) {
      const el = selectedElement.element;
      // Remove x-text so Alpine.js doesn't override our manual edit
      if (el.hasAttribute('x-text')) {
        el.removeAttribute('x-text');
      }
      if (el.hasAttribute('x-html')) {
        el.removeAttribute('x-html');
      }

      const tag = el.tagName.toLowerCase();

      // For input/textarea, update value attribute
      if (tag === 'input' || tag === 'textarea') {
        el.value = newText;
        el.setAttribute('value', newText);
      }
      // For summary or accordion content: set textContent directly
      else if (tag === 'summary' || (selectedElement.isAccordion && selectedElement.accordionRole === 'content')) {
        el.textContent = newText;
      }
      // Only update text nodes, preserve child elements
      else if (el.children.length === 0) {
        el.textContent = newText;
      } else {
        // Has child elements, only update text nodes
        const textNodes = Array.from(el.childNodes).filter(node => node.nodeType === 3);
        if (textNodes.length > 0) {
          textNodes[0].textContent = newText;
        } else {
          el.textContent = newText;
        }
      }

      updateHTML();
      setSelectedElement(prev => ({ ...prev, text: newText, textContent: newText }));
      if (onHistoryEntry) onHistoryEntry('success', 'Metin değiştirildi', {
        tag: el.tagName,
        isAccordion: selectedElement.isAccordion,
        accordionRole: selectedElement.accordionRole,
        newValue: newText.substring(0, 60)
      });
    }
  };

  const updateElementAttribute = (attr, value) => {
    if (selectedElement && selectedElement.element) {
      selectedElement.element.setAttribute(attr, value);
      updateHTML();
    }
  };

  // ============ PHASE 2: ELEMENT MANAGEMENT ============

  const elementTemplates = {
    sections: {
      hero: {
        name: 'Hero Bölümü', icon: '🦸',
        html: `<section class="hero-section" style="padding:80px 20px;text-align:center;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;"><div style="max-width:800px;margin:0 auto;"><h1 style="font-size:48px;font-weight:bold;margin-bottom:20px;">Başlık Buraya</h1><p style="font-size:20px;margin-bottom:30px;">Alt başlık veya açıklama metni buraya gelir.</p><button style="padding:15px 40px;font-size:18px;background:white;color:#667eea;border:none;border-radius:8px;cursor:pointer;font-weight:600;">Hemen Başla</button></div></section>`
      },
      features: {
        name: 'Özellikler', icon: '⭐',
        html: `<section class="features-section" style="padding:60px 20px;background:#f9fafb;"><div style="max-width:1200px;margin:0 auto;"><h2 style="text-align:center;font-size:36px;margin-bottom:50px;">Özellikler</h2><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:30px;"><div style="padding:30px;background:white;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);"><div style="font-size:40px;margin-bottom:15px;">🚀</div><h3 style="font-size:22px;margin-bottom:10px;">Hızlı</h3><p style="color:#6b7280;">Açıklama metni buraya gelir.</p></div><div style="padding:30px;background:white;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);"><div style="font-size:40px;margin-bottom:15px;">🎨</div><h3 style="font-size:22px;margin-bottom:10px;">Güzel</h3><p style="color:#6b7280;">Açıklama metni buraya gelir.</p></div><div style="padding:30px;background:white;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);"><div style="font-size:40px;margin-bottom:15px;">💪</div><h3 style="font-size:22px;margin-bottom:10px;">Güçlü</h3><p style="color:#6b7280;">Açıklama metni buraya gelir.</p></div></div></div></section>`
      },
      cta: {
        name: 'Çağrı (CTA)', icon: '📣',
        html: `<section class="cta-section" style="padding:80px 20px;text-align:center;background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%);color:white;"><div style="max-width:700px;margin:0 auto;"><h2 style="font-size:42px;font-weight:bold;margin-bottom:20px;">Hazır mısınız?</h2><p style="font-size:18px;margin-bottom:30px;">Hemen başlamak için kaydolun!</p><button style="padding:15px 40px;font-size:18px;background:white;color:#f5576c;border:none;border-radius:8px;cursor:pointer;font-weight:600;">Ücretsiz Dene</button></div></section>`
      },
      testimonials: {
        name: 'Yorumlar', icon: '💬',
        html: `<section style="padding:60px 20px;background:#f9fafb;"><div style="max-width:1000px;margin:0 auto;"><h2 style="text-align:center;font-size:36px;margin-bottom:50px;">Müşteri Yorumları</h2><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;"><div style="padding:28px;background:white;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.08);"><p style="font-style:italic;color:#374151;margin-bottom:20px;">"Harika bir ürün, kesinlikle tavsiye ederim!"</p><div style="display:flex;align-items:center;gap:12px;"><div style="width:40px;height:40px;background:#667eea;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;">A</div><div><div style="font-weight:600;">Ali Yılmaz</div><div style="font-size:12px;color:#6b7280;">Müşteri</div></div></div></div><div style="padding:28px;background:white;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.08);"><p style="font-style:italic;color:#374151;margin-bottom:20px;">"Beklentilerimin ötesinde bir deneyim yaşadım."</p><div style="display:flex;align-items:center;gap:12px;"><div style="width:40px;height:40px;background:#10b981;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;">S</div><div><div style="font-weight:600;">Selin Kaya</div><div style="font-size:12px;color:#6b7280;">Kullanıcı</div></div></div></div></div></div></section>`
      },
      footer: {
        name: 'Footer', icon: '🦶',
        html: `<footer style="padding:40px 20px;background:#1f2937;color:white;text-align:center;"><div style="max-width:1200px;margin:0 auto;"><p style="font-size:16px;margin-bottom:12px;font-weight:600;">Şirket Adı</p><p style="color:#9ca3af;font-size:14px;margin-bottom:20px;">© 2025 Tüm hakları saklıdır.</p><div style="display:flex;gap:20px;justify-content:center;"><a href="#" style="color:#9ca3af;text-decoration:none;font-size:14px;">Hakkımızda</a><a href="#" style="color:#9ca3af;text-decoration:none;font-size:14px;">İletişim</a><a href="#" style="color:#9ca3af;text-decoration:none;font-size:14px;">Gizlilik</a></div></div></footer>`
      },
    },
    components: {
      button: {
        name: 'Buton', icon: '🔘',
        html: `<button style="padding:12px 30px;background:#3b82f6;color:white;border:none;border-radius:6px;font-size:16px;font-weight:600;cursor:pointer;">Butona Tıkla</button>`
      },
      card: {
        name: 'Kart', icon: '🗂️',
        html: `<div style="padding:30px;background:white;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);max-width:400px;"><h3 style="font-size:24px;margin-bottom:15px;">Kart Başlığı</h3><p style="color:#6b7280;margin-bottom:20px;">Kart içeriği buraya gelir. Detaylı açıklama yazabilirsiniz.</p><button style="padding:10px 24px;background:#3b82f6;color:white;border:none;border-radius:6px;cursor:pointer;">Devamını Oku</button></div>`
      },
      image: {
        name: 'Resim', icon: '🖼️',
        html: `<img src="https://placehold.co/600x400/667eea/ffffff?text=Resim+Buraya" alt="Resim" style="width:100%;max-width:600px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);" />`
      },
      divider: {
        name: 'Ayırıcı', icon: '➖',
        html: `<hr style="border:none;border-top:2px solid #e5e7eb;margin:40px 0;" />`
      },
    },
    text: {
      heading: {
        name: 'Başlık', icon: '📝',
        html: `<h2 style="font-size:36px;font-weight:bold;margin-bottom:20px;">Yeni Başlık</h2>`
      },
      paragraph: {
        name: 'Paragraf', icon: '📄',
        html: `<p style="font-size:16px;line-height:1.7;color:#374151;margin-bottom:16px;">Buraya metin yazın. Bu bir paragraf örneğidir ve istediğiniz gibi düzenleyebilirsiniz.</p>`
      },
      list: {
        name: 'Liste', icon: '📋',
        html: `<ul style="list-style:none;padding:0;margin:0;"><li style="padding:8px 0;display:flex;align-items:center;"><span style="color:#10b981;margin-right:10px;font-size:20px;">✓</span><span>Liste öğesi 1</span></li><li style="padding:8px 0;display:flex;align-items:center;"><span style="color:#10b981;margin-right:10px;font-size:20px;">✓</span><span>Liste öğesi 2</span></li><li style="padding:8px 0;display:flex;align-items:center;"><span style="color:#10b981;margin-right:10px;font-size:20px;">✓</span><span>Liste öğesi 3</span></li></ul>`
      },
    },
  };

  const insertElement = (htmlString, position = 'bottom') => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) {
      showToast('❌ Canvas bulunamadı', 'error');
      return;
    }
    const doc = iframe.contentDocument;
    const body = doc.body;
    const temp = doc.createElement('div');
    temp.innerHTML = htmlString.trim();
    const newElement = temp.firstElementChild;
    if (!newElement) {
      showToast('❌ Geçersiz HTML', 'error');
      return;
    }
    if (position === 'bottom') {
      body.appendChild(newElement);
    } else if (position === 'top') {
      body.insertBefore(newElement, body.firstChild);
    } else if (position === 'after' && selectedElement?.element) {
      const parent = selectedElement.element.parentNode;
      parent.insertBefore(newElement, selectedElement.element.nextSibling);
    }
    isUserEditRef.current = true;
    updateHTML();
    saveToHistory();
    setShowAddPanel(false);
    showToast('✅ Element eklendi', 'success');
    if (onHistoryEntry) onHistoryEntry('success', 'Element eklendi', { tag: newElement.tagName });

    // Re-attach click/hover listeners so the new element is immediately selectable
    setTimeout(() => {
      if (attachEventListenersRef.current && iframeRef.current?.contentDocument) {
        attachEventListenersRef.current(iframeRef.current.contentDocument);
      }
      // Auto-select and scroll into view
      newElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      newElement.click();
    }, 80);
  };

  const deleteSelectedElement = () => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument || !selectedElement?.element) return;
    const elementName = selectedElement.element.tagName.toLowerCase();
    selectedElement.element.remove();
    setSelectedElement(null);
    isUserEditRef.current = true;
    updateHTML();
    saveToHistory();
    setShowDeleteConfirm(false);
    showToast(`✅ <${elementName}> silindi`, 'success');
    if (onHistoryEntry) onHistoryEntry('success', 'Element silindi', { tag: elementName });
  };

  const duplicateSelectedElement = () => {
    if (!selectedElement?.element) {
      showToast('⚠️ Kopyalanacak element seçilmedi', 'warning');
      return;
    }
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) return;
    const original = selectedElement.element;
    const clone = original.cloneNode(true);
    // Strip IDs to avoid duplicates
    clone.removeAttribute('id');
    clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
    original.parentNode.insertBefore(clone, original.nextSibling);
    isUserEditRef.current = true;
    updateHTML();
    saveToHistory();
    showToast(`✅ <${original.tagName.toLowerCase()}> kopyalandı`, 'success');
    if (onHistoryEntry) onHistoryEntry('success', 'Element kopyalandı', { tag: original.tagName });
  };

  return (
    <div style={{ display: 'flex', flex:1 , background: '#111827', overflow: 'hidden' }}>
      {/* Left Sidebar - Blocks / Toolbox */}
      <div style={{
        width: '280px',
        background: '#1f2937',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #374151',
        flexShrink: 0,
        overflow: 'hidden',
      }}>
        {/* Tab switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid #374151', flexShrink: 0 }}>
          <button
            onClick={() => setShowToolbox(false)}
            style={{
              flex: 1, padding: '10px 0', background: !showToolbox ? '#111827' : 'transparent',
              color: !showToolbox ? '#60a5fa' : '#9ca3af', border: 'none', borderBottom: !showToolbox ? '2px solid #3b82f6' : '2px solid transparent',
              fontWeight: '600', fontSize: '12px', cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            Bloklar
          </button>
          <button
            onClick={() => setShowToolbox(true)}
            style={{
              flex: 1, padding: '10px 0', background: showToolbox ? '#111827' : 'transparent',
              color: showToolbox ? '#a78bfa' : '#9ca3af', border: 'none', borderBottom: showToolbox ? '2px solid #8b5cf6' : '2px solid transparent',
              fontWeight: '600', fontSize: '12px', cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            Araç Kutusu
          </button>
        </div>

        {/* Toolbox panel */}
        {showToolbox && (
          <AdvancedToolbox onAddComponent={(html) => insertElement(html)} />
        )}

        {/* Bloklar panel */}
        {!showToolbox && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: 0 }}>
          Temada bir öğeye tıklayın ve sağ panelden düzenleyin.
        </p>

        {/* How-to-use instructions */}
        <div style={{
          padding: '14px',
          background: 'linear-gradient(135deg, #1e3a5f 0%, #1e1b4b 100%)',
          borderRadius: '10px',
          marginBottom: '16px',
          border: '1px solid #3b4fd8',
        }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#93c5fd', marginBottom: '10px' }}>
            Nasıl Kullanılır
          </div>
          {[
            ['1', 'Seç:', 'Element\'e tek tıkla'],
            ['2', 'Taşı:', 'Seçili elementi sürükle'],
            ['3', 'Düzenle:', 'Sağ panelden stil uygula'],
          ].map(([num, bold, rest]) => (
            <div key={num} style={{ display: 'flex', gap: '8px', marginBottom: '6px', fontSize: '12px', color: '#cbd5e1' }}>
              <span style={{ fontWeight: '700', color: '#60a5fa', minWidth: '16px' }}>{num}.</span>
              <span><strong style={{ color: '#e2e8f0' }}>{bold}</strong> {rest}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => setIsEditing(!isEditing)}
            style={{
              width: '100%',
              padding: '10px',
              background: isEditing ? '#ef4444' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {isEditing ? '🔒 Düzenlemeyi Kilitle' : '✏️ Düzenleme Modunu Aç'}
          </button>
          
          {/* Undo/Redo Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              style={{
                flex: 1,
                padding: '8px',
                background: historyIndex > 0 ? '#3b82f6' : '#374151',
                color: historyIndex > 0 ? 'white' : '#6b7280',
                border: 'none',
                borderRadius: '6px',
                cursor: historyIndex > 0 ? 'pointer' : 'not-allowed',
                fontSize: '13px'
              }}
            >
              ↶ Geri Al
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              style={{
                flex: 1,
                padding: '8px',
                background: historyIndex < history.length - 1 ? '#3b82f6' : '#374151',
                color: historyIndex < history.length - 1 ? 'white' : '#6b7280',
                border: 'none',
                borderRadius: '6px',
                cursor: historyIndex < history.length - 1 ? 'pointer' : 'not-allowed',
                fontSize: '13px'
              }}
            >
              ↷ İleri Al
            </button>
          </div>
          
          {/* Refresh and Reset Buttons */}
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
            <button
              onClick={handleRefresh}
              style={{
                flex: 1,
                padding: '10px',
                background: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              🔄 Yenile
            </button>
            
            <button
              onClick={handleReset}
              style={{
                flex: 1,
                padding: '10px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              ↩️ Sıfırla
            </button>
          </div>
        </div>

        {selectedElement && (
          <div style={{ 
            marginTop: '20px', 
            padding: '12px', 
            background: '#374151', 
            borderRadius: '8px' 
          }}>
            <p style={{ color: '#60a5fa', fontSize: '12px', margin: 0 }}>
              Seçili Öğe:
            </p>
            <p style={{ color: 'white', fontSize: '14px', fontWeight: 'bold', marginTop: '4px' }}>
              &lt;{selectedElement.tagName}&gt;
            </p>
            {selectedElement.className && (
              <p style={{ color: '#9ca3af', fontSize: '11px', marginTop: '4px', wordBreak: 'break-all' }}>
                .{selectedElement.className}
              </p>
            )}
          </div>
        )}
        </div>
        )}
      </div>

      {/* Center - Canvas with Iframe - EXPLICIT HEIGHT (like ThemeStore preview) */}
      <div style={{
        flex: 1,
        width: '100%',
        alignSelf: 'stretch',
        background: '#ffffff',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <iframe
          ref={iframeRef}
          title="Theme Canvas"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
            background: 'white',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
        />
        {/* Live position indicator while dragging an element */}
        {dragPosition && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15,23,42,0.88)',
            color: 'white',
            padding: '6px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600',
            zIndex: 20,
            pointerEvents: 'none',
            fontFamily: 'monospace',
            letterSpacing: '0.04em',
          }}>
            X: {dragPosition.x}px &nbsp;|&nbsp; Y: {dragPosition.y}px
          </div>
        )}

        {/* Drag-drop overlay — activates when a toolbox component is being dragged */}
        <div
          onDragOver={e => { e.preventDefault(); setIsDragOverCanvas(true); }}
          onDragLeave={() => setIsDragOverCanvas(false)}
          onDrop={e => {
            e.preventDefault();
            setIsDragOverCanvas(false);
            setIsDraggingComponent(false);
            const html = e.dataTransfer.getData('text/html');
            if (html) {
              insertElement(html, 'bottom');
            }
          }}
          style={{
            position: 'absolute', inset: 0, zIndex: 10,
            pointerEvents: isDraggingComponent ? 'all' : 'none',
            background: isDragOverCanvas ? 'rgba(99,102,241,0.12)' : 'transparent',
            border: isDragOverCanvas ? '3px dashed #6366f1' : '3px dashed transparent',
            borderRadius: '4px',
            transition: 'background 0.15s, border-color 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {isDragOverCanvas && (
            <div style={{
              background: '#6366f1', color: 'white',
              padding: '14px 28px', borderRadius: '12px',
              fontSize: '16px', fontWeight: '700',
              boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
              pointerEvents: 'none',
            }}>
              ✦ Buraya bırakın
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Properties */}
      <div style={{
        width: '320px',
        background: '#1f2937',
        padding: '16px',
        overflowY: 'auto',
        borderLeft: '1px solid #374151',
        flexShrink: 0
      }}>
        <div style={{ 
          padding: '12px',
          background: '#1f2937',
          borderBottom: '1px solid #374151',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          margin: '-16px',
          marginBottom: '16px',
          paddingBottom: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ color: 'white', margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>
                {selectedElement?.containerType === 'navbar' ? '🔗' :
                 selectedElement?.containerType === 'footer' ? '📄' : '⚙️'}
              </span>
              {selectedElement?.containerType === 'navbar' ? 'Navbar Düzenleyici' :
               selectedElement?.containerType === 'footer' ? 'Footer Düzenleyici' :
               'Özellikler'}
            </h3>
            
            {hasUnsavedChanges && (
              <button
                onClick={applyChanges}
                disabled={isSaving}
                style={{
                  padding: '8px 16px',
                  background: isSaving ? '#10b981' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isSaving ? 'default' : 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.3s'
                }}
              >
                {isSaving ? (
                  <>
                    <span className="spinner">⟳</span> Kaydediliyor...
                  </>
                ) : (
                  <>
                    💾 Değişiklikleri Kaydet
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        
        {/* Meta & SEO Editor - Always visible */}
        <div style={{ 
          marginBottom: '16px',
          background: '#374151',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <button
            onClick={() => setShowMetaEditor(!showMetaEditor)}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: showMetaEditor ? '#8b5cf6' : '#1f2937',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>🔧 Meta & SEO Ayarları</span>
            <span>{showMetaEditor ? '▼' : '▶'}</span>
          </button>
          
          {showMetaEditor && (
            <div style={{ 
              padding: '16px',
              background: '#1f2937'
            }}>
              {/* Page Title */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: '#9ca3af', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                  📄 Sayfa Başlığı
                </label>
                <input
                  type="text"
                  placeholder="My Amazing Website"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  onBlur={(e) => updateMetaTag('title', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#374151',
                    border: '1px solid #4b5563',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '13px'
                  }}
                />
              </div>

              {/* Favicon */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: '#9ca3af', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                  🎨 Favicon URL
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/favicon.ico"
                  value={metaFavicon}
                  onChange={(e) => setMetaFavicon(e.target.value)}
                  onBlur={(e) => updateFavicon(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#374151',
                    border: '1px solid #4b5563',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '13px'
                  }}
                />
              </div>

              {/* Description */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: '#9ca3af', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                  📝 Meta Description
                </label>
                <textarea
                  placeholder="Site description for SEO"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  onBlur={(e) => updateMetaTag('description', e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '60px',
                    padding: '10px',
                    background: '#374151',
                    border: '1px solid #4b5563',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '13px',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Keywords */}
              <div>
                <label style={{ color: '#9ca3af', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                  🔑 Meta Keywords
                </label>
                <input
                  type="text"
                  placeholder="web, design, tech"
                  value={metaKeywords}
                  onChange={(e) => setMetaKeywords(e.target.value)}
                  onBlur={(e) => updateMetaTag('keywords', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#374151',
                    border: '1px solid #4b5563',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>
          )}
        </div>
        
        {selectedElement ? (
          <div>
            {/* Element Info Card - Enhanced with gradient */}
            <div style={{
              marginBottom: '20px',
              padding: '16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              color: 'white'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <h4 style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  &lt;{selectedElement.tagName}&gt;
                </h4>
                {/* Action buttons: Duplicate + Delete */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={duplicateSelectedElement}
                    title="Kopyala"
                    style={{
                      padding: '5px 10px',
                      background: 'rgba(59,130,246,0.8)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    📋 Kopyala
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    title="Sil"
                    style={{
                      padding: '5px 10px',
                      background: 'rgba(239,68,68,0.8)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    🗑️ Sil
                  </button>
                </div>
              </div>
              
              {selectedElement.className && typeof selectedElement.className === 'string' && (
                <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '4px' }}>
                  <strong>Class:</strong> {selectedElement.className}
                </div>
              )}
              
              {selectedElement.id && (
                <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '4px' }}>
                  <strong>ID:</strong> #{selectedElement.id}
                </div>
              )}
              
              {/* Safe path display */}
              <div style={{ 
                fontSize: '10px', 
                opacity: 0.8, 
                marginTop: '8px',
                fontFamily: 'monospace',
                wordBreak: 'break-all'
              }}>
                {String(selectedElement.path || '')}
              </div>
            </div>

            {/* Jump to Code Button */}
            <button
              onClick={handleJumpToCode}
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '20px',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
              }}
            >
              <span style={{ fontSize: '16px' }}>💻</span>
              Kodunu Görüntüle
            </button>

            {/* ACCORDION EDITOR */}
            {selectedElement?.isAccordion && (
              <div style={{
                marginBottom: '20px',
                padding: '16px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: '12px',
                color: 'white'
              }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold' }}>📂 Açılır Menü Düzenleyici</h4>
                  <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.2)', padding: '3px 7px', borderRadius: '4px', fontWeight: '600' }}>
                    {selectedElement.accordionType === 'native' ? 'HTML' : 'Alpine.js'}
                  </span>
                </div>

                {/* TRIGGER / BUTTON TEXT */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <span>🔘</span>
                    <label style={{ fontSize: '12px', fontWeight: '600', flex: 1 }}>Buton / Başlık Metni</label>
                    {selectedElement.accordionRole === 'content' && (
                      <button
                        onClick={() => {
                          const newEl = selectedElement.accordionQuestion;
                          if (!newEl) return;
                          setSelectedElement(prev => ({
                            ...prev,
                            element: newEl,
                            accordionRole: 'trigger',
                            text: newEl.textContent?.trim().substring(0, 200) || '',
                            textContent: newEl.textContent?.trim().substring(0, 200) || ''
                          }));
                        }}
                        style={{ padding: '3px 8px', background: 'rgba(255,255,255,0.3)', border: 'none', borderRadius: '4px', color: 'white', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}
                      >
                        Düzenle →
                      </button>
                    )}
                  </div>

                  {selectedElement.accordionRole === 'trigger' || selectedElement.accordionRole === 'summary' ? (
                    <textarea
                      key={`trigger-${selectionKey}`}
                      defaultValue={(() => {
                        const trigger = selectedElement.accordionQuestion || selectedElement.element;
                        if (!trigger) return '';
                        // Prefer text from the display span, fallback to full textContent
                        const span = trigger.querySelector('span.font-semibold') || trigger.querySelector('span');
                        return (span ? span.textContent : trigger.textContent)?.trim() || '';
                      })()}
                      onBlur={(e) => {
                        const newText = e.target.value.trim();
                        const doc = iframeRef.current?.contentDocument;
                        if (!doc) return;

                        // STEP 1: Find LIVE element
                        const liveTrigger = findLiveElement(selectedElement);
                        if (!liveTrigger) {
                          const errToast = document.createElement('div');
                          errToast.textContent = '❌ Element bulunamadı';
                          errToast.style.cssText = 'position:fixed;top:80px;right:20px;background:#ef4444;color:white;padding:12px 20px;border-radius:8px;font-weight:600;z-index:10000;';
                          document.body.appendChild(errToast);
                          setTimeout(() => errToast.remove(), 3000);
                          return;
                        }

                        // STEP 2: Write text into the display <span> if present, else fallback to recursive text-node replacement
                        const targetSpan = liveTrigger.querySelector('span.font-semibold') || liveTrigger.querySelector('span');
                        if (targetSpan) {
                          targetSpan.innerHTML = '';
                          targetSpan.textContent = newText;
                        } else {
                          const walker = doc.createTreeWalker(liveTrigger, NodeFilter.SHOW_TEXT, null, false);
                          const toRemove = [];
                          let node;
                          while ((node = walker.nextNode())) {
                            if (node.textContent.trim()) toRemove.push(node);
                          }
                          toRemove.forEach(n => n.remove());
                          liveTrigger.insertBefore(doc.createTextNode(newText), liveTrigger.firstChild);
                        }

                        // STEP 3: Synchronously read + save
                        const updatedHTML = `<!DOCTYPE html>\n${doc.documentElement.outerHTML}`;
                        isUserEditRef.current = true;
                        if (onHTMLChange) onHTMLChange(updatedHTML);
                        if (onHistoryEntry) onHistoryEntry('success', 'Buton metni değiştirildi', { newText: newText.substring(0, 50) });

                        // STEP 4: Update selectedElement with live reference + new text
                        setSelectedElement(prev => ({ ...prev, element: liveTrigger, accordionQuestion: liveTrigger, text: newText }));

                        const toast = document.createElement('div');
                        toast.textContent = '✅ Buton metni kaydedildi';
                        toast.style.cssText = 'position:fixed;top:80px;right:20px;background:#10b981;color:white;padding:12px 20px;border-radius:8px;font-weight:600;font-size:14px;z-index:10000;box-shadow:0 4px 16px rgba(16,185,129,0.4);';
                        document.body.appendChild(toast);
                        setTimeout(() => toast.remove(), 2000);
                      }}
                      style={{
                        width: '100%', minHeight: '52px', padding: '10px',
                        background: 'rgba(255,255,255,0.95)', color: '#1f2937',
                        border: '2px solid rgba(255,255,255,0.4)', borderRadius: '8px',
                        fontSize: '14px', fontWeight: '600', resize: 'vertical',
                        fontFamily: 'inherit', boxSizing: 'border-box'
                      }}
                      placeholder="Buton/başlık metni..."
                    />
                  ) : (
                    <div style={{ padding: '10px', background: 'rgba(255,255,255,0.15)', borderRadius: '6px', fontSize: '13px', fontStyle: 'italic', color: 'rgba(255,255,255,0.85)' }}>
                      {(() => {
                        const trigger = selectedElement.accordionQuestion;
                        if (!trigger) return 'Buton bulunamadı';
                        let text = '';
                        for (const node of (trigger.childNodes || [])) {
                          if (node.nodeType === Node.TEXT_NODE) text += node.textContent;
                        }
                        return text.trim() || trigger.textContent?.trim() || 'Metin yok';
                      })()}
                    </div>
                  )}
                </div>

                {/* CONTENT TEXT */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <span>📄</span>
                    <label style={{ fontSize: '12px', fontWeight: '600', flex: 1 }}>Açılır İçerik Metni</label>
                    {(selectedElement.accordionRole === 'trigger' || selectedElement.accordionRole === 'summary') && (
                      <button
                        onClick={() => {
                          const newEl = selectedElement.accordionAnswer;
                          if (!newEl) return;
                          setSelectedElement(prev => ({
                            ...prev,
                            element: newEl,
                            accordionRole: 'content',
                            text: newEl.textContent?.trim().substring(0, 200) || '',
                            textContent: newEl.textContent?.trim().substring(0, 200) || ''
                          }));
                        }}
                        style={{ padding: '3px 8px', background: 'rgba(255,255,255,0.3)', border: 'none', borderRadius: '4px', color: 'white', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}
                      >
                        Düzenle →
                      </button>
                    )}
                  </div>

                  {selectedElement.accordionRole === 'content' ? (
                    <textarea
                      key={`content-${selectionKey}`}
                      defaultValue={selectedElement.element?.textContent?.trim() || ''}
                      onBlur={(e) => {
                        const newText = e.target.value.trim();
                        const doc = iframeRef.current?.contentDocument;
                        if (!doc) return;

                        // CRITICAL FIX #4: Find <p> inside THE SELECTED accordion, not the first one
                        let targetP = null;

                        // Step 1: Get the selected trigger element and find its parent
                        const selectedTrigger = selectedElement.accordionQuestion || selectedElement.element;
                        if (selectedTrigger && doc.contains(selectedTrigger)) {
                          const parent = selectedTrigger.parentElement;
                          if (parent) {
                            // Step 2: Find sibling content div with x-show attribute
                            const contentDiv = Array.from(parent.children).find(child =>
                              child.hasAttribute('x-show') && child !== selectedTrigger
                            );
                            if (contentDiv) {
                              targetP = contentDiv.querySelector('p.text-gray-600, p');
                              if (targetP) console.log('✅ Found <p> inside selected accordion content div');
                            }
                          }
                        }

                        // Fallback: match by current displayed text
                        if (!targetP) {
                          const currentText = selectedElement.element?.textContent?.trim() || selectedElement.text || '';
                          if (currentText) {
                            const allParagraphs = doc.querySelectorAll('p.text-gray-600, p');
                            targetP = Array.from(allParagraphs).find(p =>
                              p.closest('[x-show]') && p.textContent.trim().startsWith(currentText.substring(0, 30))
                            ) || null;
                            if (targetP) console.log('✅ Found <p> by text match (fallback)');
                          }
                        }

                        if (!targetP) {
                          console.error('❌ Could not find content element for selected accordion');
                          return;
                        }

                        console.log('Before:', targetP.textContent.substring(0, 50));
                        targetP.textContent = newText;
                        console.log('After:', targetP.textContent.substring(0, 50));

                        const updatedHTML = `<!DOCTYPE html>\n${doc.documentElement.outerHTML}`;
                        const hasNewText = updatedHTML.includes(newText);

                        isUserEditRef.current = true;
                        if (onHTMLChange) onHTMLChange(updatedHTML);
                        if (onHistoryEntry) onHistoryEntry('success', 'İçerik metni kaydedildi', { newText: newText.substring(0, 50), success: hasNewText });

                        setSelectedElement(prev => ({ ...prev, accordionAnswer: targetP }));

                        const toast = document.createElement('div');
                        toast.textContent = hasNewText ? '✅ İçerik kaydedildi!' : '⚠️ Kayıt sorunlu';
                        toast.style.cssText = `position:fixed;top:80px;right:20px;background:${hasNewText ? '#10b981' : '#ef4444'};color:white;padding:12px 20px;border-radius:8px;font-weight:700;z-index:10000;`;
                        document.body.appendChild(toast);
                        setTimeout(() => toast.remove(), 2000);
                      }}
                      style={{
                        width: '100%', minHeight: '120px', padding: '10px',
                        background: 'rgba(255,255,255,0.95)', color: '#1f2937',
                        border: '2px solid rgba(255,255,255,0.4)', borderRadius: '8px',
                        fontSize: '13px', resize: 'vertical',
                        fontFamily: 'inherit', lineHeight: '1.6', boxSizing: 'border-box'
                      }}
                      placeholder="Açılır bölümde görünecek metin..."
                    />
                  ) : (
                    <div style={{
                      padding: '10px', background: 'rgba(255,255,255,0.15)', borderRadius: '6px',
                      fontSize: '12px', fontStyle: 'italic', color: 'rgba(255,255,255,0.8)',
                      maxHeight: '72px', overflow: 'hidden'
                    }}>
                      {(selectedElement.accordionAnswer?.textContent?.trim() || 'İçerik yok').substring(0, 120)}…
                    </div>
                  )}
                </div>

                {/* Tip */}
                <div style={{ marginTop: '12px', padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', fontSize: '11px', lineHeight: '1.5', color: 'rgba(255,255,255,0.9)' }}>
                  💡 <strong>İpucu:</strong> "Düzenle →" ile buton ve içerik arasında geçiş yapabilirsiniz.
                </div>

                {/* Save button */}
                <button
                  onClick={saveAccordionChanges}
                  style={{
                    width: '100%', marginTop: '10px', padding: '11px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white', border: 'none', borderRadius: '8px',
                    fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}
                >
                  <span>💾</span>
                  <span>Kaydet (Ctrl+S)</span>
                </button>
              </div>
            )}

            {/* === NAVBAR/FOOTER SPECIAL EDITOR === */}
            {selectedElement?.isNavbar && selectedElement.navbarItems?.length > 0 && (
              <div style={{
                marginBottom: '20px',
                padding: '16px',
                background: selectedElement.containerType === 'footer'
                  ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
                  : 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                borderRadius: '12px',
                color: 'white'
              }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{selectedElement.containerType === 'footer' ? '📄' : '🔗'}</span>
                  {selectedElement.containerType === 'footer' ? 'Footer Linkleri' : 'Navbar Linkleri'} ({selectedElement.navbarItems.length})
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedElement.navbarItems.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        const iframeDoc = iframeRef.current?.contentDocument;
                        const iwin = iframeRef.current?.contentWindow;
                        if (!iframeDoc || !iwin) return;
                        const computed = iwin.getComputedStyle(item.element);
                        setSelectedElement({
                          element: item.element,
                          tagName: item.element.tagName?.toLowerCase() || 'a',
                          id: item.element.id || '',
                          className: typeof item.element.className === 'string' ? item.element.className : '',
                          text: item.text,
                          textContent: item.text,
                          innerHTML: item.element.innerHTML || '',
                          href: item.href,
                          src: '', alt: '', target: item.element.getAttribute('target') || '',
                          color: rgbToHex(computed.color) || '#000000',
                          backgroundColor: rgbToHex(computed.backgroundColor) || '#ffffff',
                          fontSize: computed.fontSize || '16px',
                          fontWeight: computed.fontWeight || '400',
                          padding: computed.padding || '0px',
                          margin: computed.margin || '0px',
                          width: computed.width || 'auto',
                          height: computed.height || 'auto',
                          path: '',
                          isImage: false,
                          isAccordion: false,
                          accordionType: null, accordionRole: null,
                          accordionQuestion: null, accordionAnswer: null, parentDetails: null,
                          isNavbar: false,
                          containerType: null,
                          navbarItems: []
                        });
                        setSelectionKey(prev => prev + 1);
                        if (onHistoryEntry) onHistoryEntry('info',
                          `${selectedElement.containerType === 'footer' ? 'Footer' : 'Navbar'} linki seçildi`,
                          { text: item.text, index: idx }
                        );
                      }}
                      style={{
                        padding: '12px 16px',
                        background: 'rgba(255,255,255,0.95)',
                        color: '#1f2937',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textAlign: 'left',
                        width: '100%',
                        transition: 'background 0.15s, transform 0.15s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.95)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                    >
                      <span style={{ flex: 1 }}>{idx + 1}. {item.text || '(boş link)'}</span>
                      <span style={{ fontSize: '16px' }}>✏️</span>
                    </button>
                  ))}
                </div>

                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginTop: '12px', lineHeight: '1.5' }}>
                  💡 {selectedElement.containerType === 'footer' ? 'Footer linkine' : 'Navbar butonuna'} tıklayarak tek tek düzenleyin
                </p>
              </div>
            )}

            {/* FONT CONTROLS */}
            {selectedElement?.element && (
              <details open style={{ marginBottom: '24px' }}>
                <summary style={{ cursor: 'pointer', padding: '14px 16px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', borderRadius: '12px', color: 'white', fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', listStyle: 'none', userSelect: 'none' }}>
                  <span style={{ fontSize: '20px' }}>🔤</span> Font Ayarları
                  <span style={{ marginLeft: 'auto', fontSize: '18px', opacity: 0.7 }}>▾</span>
                </summary>
              <div style={{ padding: '16px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', borderRadius: '0 0 12px 12px', color: 'white', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                {(() => {
                  // Resolve live element once for all controls in this block
                  const liveEl = selectedElement.element;
                  const iwin = iframeRef.current?.contentWindow;
                  const computed = liveEl && iwin ? iwin.getComputedStyle(liveEl) : null;
                  const currentFontFamily = computed
                    ? computed.fontFamily.replace(/['"]/g, '').split(',')[0].trim()
                    : 'inherit';
                  const currentFontSize = computed ? parseInt(computed.fontSize) || 16 : 16;
                  const currentFontWeight = computed ? computed.fontWeight : '400';

                  const applyStyle = (prop, val) => {
                    if (!liveEl) return;
                    liveEl.style[prop] = val;
                    updateHTML();
                    if (onHistoryEntry) onHistoryEntry('success', 'Font değiştirildi', { prop, val });
                  };

                  return (
                    <>
                      {/* Font Family */}
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>Font Ailesi</label>
                        <select
                          value={currentFontFamilyState}
                          onChange={(e) => {
                            const newFont = e.target.value;
                            setCurrentFontFamilyState(newFont);
                            const systemFonts = ['Arial','Helvetica','Times New Roman','Georgia','Courier New','Verdana','Trebuchet MS','Comic Sans MS','inherit'];
                            if (!systemFonts.includes(newFont) && iframeRef.current?.contentDocument) {
                              // Bug #4 Fix: Wait for Google Font to load before saving
                              const link = iframeRef.current.contentDocument.createElement('link');
                              link.href = `https://fonts.googleapis.com/css2?family=${newFont.replace(/ /g, '+')}:wght@300;400;500;600;700;800&display=swap`;
                              link.rel = 'stylesheet';
                              link.onload = () => {
                                console.log('✅ Google Font loaded:', newFont);
                                applyStyle('fontFamily', newFont);
                              };
                              link.onerror = () => {
                                console.warn('⚠️ Font load failed, saving anyway:', newFont);
                                applyStyle('fontFamily', newFont);
                              };
                              iframeRef.current.contentDocument.head.appendChild(link);
                              console.log('⏳ Loading Google Font:', newFont);
                            } else {
                              applyStyle('fontFamily', newFont);
                            }
                          }}
                          style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.95)', color: '#1f2937', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                        >
                          <option value="inherit">-- Varsayılan --</option>
                          <optgroup label="Sistem Fontları">
                            {['Arial','Helvetica','Times New Roman','Georgia','Courier New','Verdana','Trebuchet MS','Comic Sans MS'].map(f => <option key={f} value={f}>{f}</option>)}
                          </optgroup>
                          <optgroup label="Google Fonts - Sans Serif">
                            {['Inter','Roboto','Open Sans','Lato','Montserrat','Poppins','Nunito','Ubuntu','Raleway'].map(f => <option key={f} value={f}>{f}</option>)}
                          </optgroup>
                          <optgroup label="Google Fonts - Serif">
                            {['Playfair Display','Merriweather','Lora','PT Serif','Crimson Text'].map(f => <option key={f} value={f}>{f}</option>)}
                          </optgroup>
                          <optgroup label="Google Fonts - Monospace">
                            {['Fira Code','Source Code Pro','JetBrains Mono'].map(f => <option key={f} value={f}>{f}</option>)}
                          </optgroup>
                        </select>
                      </div>

                      {/* Font Size */}
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <label style={{ fontSize: '13px', fontWeight: '600' }}>Font Boyutu</label>
                          <span id="font-size-display" style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}>{currentFontSize}px</span>
                        </div>
                        <input
                          type="range"
                          min="8" max="120" step="1"
                          key={`fs-${selectionKey}`}
                          defaultValue={currentFontSize}
                          onChange={(e) => {
                            if (!liveEl) return;
                            liveEl.style.fontSize = e.target.value + 'px';
                            const display = document.getElementById('font-size-display');
                            if (display) display.textContent = e.target.value + 'px';
                          }}
                          onMouseUp={(e) => applyStyle('fontSize', e.target.value + 'px')}
                          style={{ width: '100%', height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.3)', outline: 'none', cursor: 'pointer' }}
                        />
                      </div>

                      {/* Font Weight */}
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }}>Font Kalınlığı</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                          {[{value:'300',label:'İnce'},{value:'400',label:'Normal'},{value:'600',label:'Orta'},{value:'700',label:'Kalın'}].map(w => {
                            const isActive = currentFontWeight === w.value || (w.value === '400' && currentFontWeight === 'normal') || (w.value === '700' && currentFontWeight === 'bold');
                            return (
                              <button
                                key={w.value}
                                onClick={() => applyStyle('fontWeight', w.value)}
                                style={{ padding: '8px', background: isActive ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.2)', color: isActive ? '#4f46e5' : 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: w.value, cursor: 'pointer' }}
                              >{w.label}</button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Custom Font */}
                      <details>
                        <summary style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', listStyle: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>⬆️</span> Özel Font Yükle
                        </summary>
                        <div style={{ paddingTop: '12px' }}>
                          <input
                            type="text"
                            placeholder='Google Fonts adı veya URL — Enter'
                            onKeyDown={(e) => {
                              if (e.key !== 'Enter') return;
                              const input = e.target.value.trim();
                              if (!input || !iframeRef.current?.contentDocument) return;
                              const link = iframeRef.current.contentDocument.createElement('link');
                              link.href = input.startsWith('http')
                                ? input
                                : `https://fonts.googleapis.com/css2?family=${input.replace(/ /g, '+')}:wght@300;400;500;600;700;800&display=swap`;
                              link.rel = 'stylesheet';
                              iframeRef.current.contentDocument.head.appendChild(link);
                              e.target.value = '';
                              showToast(`✅ "${input}" yüklendi — dropdown'dan seçin`, 'success');
                            }}
                            style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.95)', color: '#1f2937', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
                          />
                          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', marginTop: '8px', lineHeight: '1.5' }}>
                            💡 Font adını yazıp Enter — örn: "Dancing Script"
                          </p>
                        </div>
                      </details>

                      {/* Save Button */}
                      <button
                        onClick={() => {
                          if (!iframeRef.current?.contentDocument) return;
                          const updatedHTML = `<!DOCTYPE html>\n${iframeRef.current.contentDocument.documentElement.outerHTML}`;
                          isUserEditRef.current = true;
                          if (onHTMLChange) onHTMLChange(updatedHTML);
                          if (onHistoryEntry) onHistoryEntry('success', 'Font ayarları kaydedildi', { element: selectedElement.tagName, id: selectedElement.id });
                          const toast = document.createElement('div');
                          toast.textContent = '✅ Font ayarları kaydedildi';
                          toast.style.cssText = 'position:fixed;top:80px;right:20px;background:linear-gradient(135deg,#10b981,#059669);color:white;padding:14px 24px;border-radius:10px;font-weight:700;font-size:15px;z-index:10000;box-shadow:0 4px 20px rgba(16,185,129,0.4);';
                          document.body.appendChild(toast);
                          setTimeout(() => toast.remove(), 2000);
                        }}
                        style={{ width: '100%', marginTop: '16px', padding: '12px', background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}
                      >
                        <span>💾</span><span>Kaydet (Ctrl+S)</span>
                      </button>
                    </>
                  );
                })()}
              </div>
              </details>
            )}

            {/* Text Content Editor — hidden for accordion elements */}
            {selectedElement?.element && !selectedElement?.isAccordion && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ color: 'white', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Metin İçeriği
                    <span style={{ fontSize: '11px', background: 'rgba(99,102,241,0.3)', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace', color: '#a5b4fc' }}>
                      &lt;{selectedElement.tagName.toLowerCase()}&gt;
                    </span>
                  </label>
                  <span style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'monospace' }}>
                    {selectedElement.element?.textContent?.length || 0} karakter
                  </span>
                </div>

                <textarea
                  value={selectedElement.element?.textContent?.trim() || selectedElement.text || ''}
                  onChange={(e) => {
                    const newText = e.target.value;
                    const el = selectedElement.element;
                    if (!el) return;
                    if (el.tagName.toLowerCase() === 'input' || el.tagName.toLowerCase() === 'textarea') {
                      el.value = newText;
                    } else {
                      el.textContent = newText;
                    }
                    setSelectedElement(prev => ({ ...prev, text: newText, textContent: newText }));
                    // Turn save button amber while there are unsaved changes
                    const btn = e.target.parentElement?.querySelector('.text-save-btn');
                    if (btn) {
                      btn.style.background = 'linear-gradient(135deg,#f59e0b,#d97706)';
                      const lbl = btn.querySelector('span:last-child');
                      if (lbl) lbl.textContent = 'Kaydet (değişiklik var)';
                    }
                  }}
                  style={{
                    width: '100%', minHeight: '100px', padding: '12px',
                    background: '#374151', color: 'white',
                    border: '2px solid #4b5563', borderRadius: '8px',
                    fontSize: '14px', resize: 'vertical',
                    fontFamily: 'inherit', lineHeight: '1.6', boxSizing: 'border-box'
                  }}
                  placeholder="Metin girin..."
                />

                <button
                  className="text-save-btn"
                  onClick={(e) => {
                    if (!iframeRef.current?.contentDocument) return;
                    const updatedHTML = `<!DOCTYPE html>\n${iframeRef.current.contentDocument.documentElement.outerHTML}`;
                    isUserEditRef.current = true;
                    if (onHTMLChange) onHTMLChange(updatedHTML);
                    if (onHistoryEntry) onHistoryEntry('success', 'Metin kaydedildi', { element: selectedElement.tagName, id: selectedElement.id });
                    // Reset button to green
                    const btn = e.currentTarget;
                    btn.style.background = 'linear-gradient(135deg,#10b981,#059669)';
                    const lbl = btn.querySelector('span:last-child');
                    if (lbl) lbl.textContent = 'Kaydet (Ctrl+S)';
                    const toast = document.createElement('div');
                    toast.textContent = '✅ Metin kaydedildi';
                    toast.style.cssText = 'position:fixed;top:80px;right:20px;background:linear-gradient(135deg,#10b981,#059669);color:white;padding:14px 24px;border-radius:10px;font-weight:700;font-size:15px;z-index:10000;box-shadow:0 4px 20px rgba(16,185,129,0.4);';
                    document.body.appendChild(toast);
                    setTimeout(() => toast.remove(), 2000);
                  }}
                  style={{ width: '100%', marginTop: '10px', padding: '12px', background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}
                >
                  <span>💾</span><span>Kaydet (Ctrl+S)</span>
                </button>

                <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px', lineHeight: '1.5' }}>
                  💡 Yazdıkça ekranda görünür. Kaydet butonuna basarak state'e yazın.
                </p>
              </div>
            )}

            {/* Link/URL Editor for <a> tags */}
            {(selectedElement?.tagName === 'a' || selectedElement?.href) && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: '#9ca3af', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                  Link (URL)
                </label>
                <input
                  type="text"
                  value={currentHref}
                  onChange={(e) => {
                    setCurrentHref(e.target.value);
                    if (selectedElement?.element) selectedElement.element.setAttribute('href', e.target.value);
                  }}
                  onBlur={() => updateHTML()}
                  placeholder="https://twitter.com"
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: '#374151',
                    border: '1px solid #4b5563',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '13px'
                  }}
                />
                <p style={{ color: '#6b7280', fontSize: '11px', marginTop: '4px' }}>
                  Sosyal medya bağlantısı veya sayfa URL'si
                </p>
              </div>
            )}

            {/* Target attribute for links */}
            {selectedElement?.tagName === 'a' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: '#9ca3af', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={currentLinkTarget}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setCurrentLinkTarget(checked);
                      if (selectedElement?.element) {
                        if (checked) {
                          selectedElement.element.setAttribute('target', '_blank');
                          selectedElement.element.setAttribute('rel', 'noopener noreferrer');
                        } else {
                          selectedElement.element.removeAttribute('target');
                          selectedElement.element.removeAttribute('rel');
                        }
                        updateHTML();
                      }
                    }}
                  />
                  Yeni sekmede aç
                </label>
              </div>
            )}

            {/* IMAGE EDITOR - Enhanced with File Upload */}
            {(selectedElement?.isImage || selectedElement?.tagName === 'img') && (
              <div style={{ 
                marginBottom: '20px',
                padding: '16px',
                background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                borderRadius: '12px',
                border: '2px solid #ec4899'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: '12px'
                }}>
                  <h4 style={{ 
                    margin: 0, 
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}>
                    🖼️ Resim Düzenleyici
                  </h4>
                  <span style={{
                    padding: '4px 10px',
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: 'white',
                    fontWeight: '600'
                  }}>
                    IMG
                  </span>
                </div>
                
                {/* Current Image Preview */}
                {selectedElement.src && (
                  <div style={{ 
                    marginBottom: '16px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '3px solid rgba(255,255,255,0.3)',
                    background: '#1f2937',
                    position: 'relative'
                  }}>
                    <img 
                      src={selectedElement.src} 
                      alt="Current"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextElementSibling) {
                          e.target.nextElementSibling.style.display = 'flex';
                        }
                      }}
                      style={{ 
                        width: '100%', 
                        height: 'auto',
                        maxHeight: '200px',
                        objectFit: 'contain',
                        display: 'block',
                        background: '#000'
                      }}
                    />
                    {/* Error Fallback */}
                    <div style={{
                      display: 'none',
                      width: '100%',
                      height: '150px',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      background: '#1f2937',
                      color: '#9ca3af',
                      fontSize: '13px'
                    }}>
                      <span style={{ fontSize: '32px', marginBottom: '8px' }}>🖼️</span>
                      <span>Resim yüklenemedi</span>
                      <span style={{ fontSize: '11px', marginTop: '4px', opacity: 0.7 }}>
                        URL hatalı veya erişilemiyor
                      </span>
                    </div>
                  </div>
                )}
                
                {/* ===== METHOD 1: UPLOAD FROM DEVICE ===== */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ 
                    color: 'white', 
                    fontSize: '13px', 
                    fontWeight: '600',
                    display: 'block', 
                    marginBottom: '8px' 
                  }}>
                    📤 Cihazdan Resim Yükle
                  </label>
                  
                  {/* File Input (Hidden) */}
                  <input
                    type="file"
                    accept="image/*"
                    id="image-upload-input"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      
                      // Check file size (max 5MB)
                      if (file.size > 5 * 1024 * 1024) {
                        showToast('❌ Resim çok büyük! Maksimum 5MB olmalı.', 'error', 3000);
                        return;
                      }
                      
                      // Check file type
                      if (!file.type.startsWith('image/')) {
                        showToast('❌ Lütfen bir resim dosyası seçin!', 'error', 3000);
                        return;
                      }
                      
                      // Show loading indicator
                      const uploadBtn = document.getElementById('upload-btn');
                      const originalText = uploadBtn.innerHTML;
                      uploadBtn.innerHTML = '⏳ Yükleniyor...';
                      uploadBtn.disabled = true;
                      
                      // Convert to base64
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const base64Image = event.target.result;
                        
                        // Update image
                        if (selectedElement?.element) {
                          selectedElement.element.setAttribute('src', base64Image);
                          
                          // Update state
                          setSelectedElement({
                            ...selectedElement,
                            src: base64Image
                          });
                          
                          updateHTML();
                          
                          // Success feedback
                          uploadBtn.innerHTML = '✅ Yüklendi!';
                          uploadBtn.style.background = '#10b981';
                          
                          setTimeout(() => {
                            uploadBtn.innerHTML = originalText;
                            uploadBtn.style.background = 'rgba(255,255,255,0.2)';
                            uploadBtn.disabled = false;
                          }, 2000);
                          
                          console.log('✅ Image uploaded successfully');
                        }
                      };
                      
                      reader.onerror = () => {
                        showToast('❌ Resim yüklenirken hata oluştu!', 'error', 3000);
                        uploadBtn.innerHTML = originalText;
                        uploadBtn.disabled = false;
                      };
                      
                      reader.readAsDataURL(file);
                    }}
                  />
                  
                  {/* Upload Button */}
                  <button
                    id="upload-btn"
                    onClick={() => {
                      document.getElementById('image-upload-input').click();
                    }}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      border: '2px dashed rgba(255,255,255,0.4)',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(255,255,255,0.3)';
                      e.target.style.borderColor = 'rgba(255,255,255,0.6)';
                      e.target.style.transform = 'scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(255,255,255,0.2)';
                      e.target.style.borderColor = 'rgba(255,255,255,0.4)';
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>📂</span>
                    <span>Bilgisayardan Seç</span>
                  </button>
                  
                  <p style={{
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.7)',
                    marginTop: '6px',
                    marginBottom: 0,
                    textAlign: 'center'
                  }}>
                    Max 5MB • JPG, PNG, GIF, WebP
                  </p>
                </div>

                {/* ===== DIVIDER ===== */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  margin: '16px 0'
                }}>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.2)' }} />
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: '600' }}>
                    VEYA
                  </span>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.2)' }} />
                </div>

                {/* ===== METHOD 2: URL INPUT ===== */}
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ 
                    color: 'white', 
                    fontSize: '13px', 
                    fontWeight: '600',
                    display: 'block', 
                    marginBottom: '6px' 
                  }}>
                    🔗 URL ile Ekle
                  </label>
                  <input
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    value={currentImageSrc}
                    onChange={(e) => setCurrentImageSrc(e.target.value)}
                    onBlur={(e) => {
                      if (!e.target.value) return;
                      if (selectedElement?.element) {
                        selectedElement.element.setAttribute('src', e.target.value);
                        setSelectedElement({ ...selectedElement, src: e.target.value });
                        updateHTML();
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'rgba(255,255,255,0.15)',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}
                  />
                  <p style={{
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.7)',
                    marginTop: '6px',
                    marginBottom: 0
                  }}>
                    💡 İpucu: Unsplash, Pexels gibi sitelerden URL kopyalayabilirsiniz
                  </p>
                </div>

                {/* ===== QUICK PASTE BUTTON ===== */}
                <button
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      
                      // Check if it's a valid URL
                      if (text.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)/i)) {
                        if (selectedElement?.element) {
                          selectedElement.element.setAttribute('src', text);
                          
                          setSelectedElement({
                            ...selectedElement,
                            src: text
                          });
                          
                          updateHTML();
                          
                          showToast('✅ Panodaki URL eklendi!', 'success');
                        }
                      } else {
                        showToast('⚠️ Panoda geçerli bir resim URL\'si bulunamadı.', 'warning', 3000);
                      }
                    } catch (err) {
                      showToast('❌ Panoya erişim reddedildi. Tarayıcı izni gerekli.', 'error', 3000);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: '16px'
                  }}
                >
                  📋 Panodan URL Yapıştır
                </button>

                {/* ===== IMAGE INFO ===== */}
                {selectedElement.src && (
                  <details style={{ marginBottom: '12px' }}>
                    <summary style={{
                      color: 'rgba(255,255,255,0.8)',
                      fontSize: '11px',
                      cursor: 'pointer',
                      padding: '6px',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '4px'
                    }}>
                      ℹ️ Resim Bilgileri
                    </summary>
                    <div style={{
                      marginTop: '8px',
                      padding: '10px',
                      background: 'rgba(0,0,0,0.3)',
                      borderRadius: '6px',
                      fontSize: '11px',
                      color: 'rgba(255,255,255,0.8)',
                      wordBreak: 'break-all'
                    }}>
                      <div style={{ marginBottom: '6px' }}>
                        <strong>Kaynak:</strong> {
                          selectedElement.src.startsWith('data:') 
                            ? '📤 Yüklenen Dosya (Base64)' 
                            : '🔗 URL'
                        }
                      </div>
                      {!selectedElement.src.startsWith('data:') && (
                        <div style={{ fontSize: '10px', opacity: 0.7 }}>
                          {selectedElement.src.substring(0, 80)}...
                        </div>
                      )}
                    </div>
                  </details>
                )}
                
                {/* Alt Text */}
                <div style={{ marginTop: '12px' }}>
                  <label style={{ 
                    color: 'white', 
                    fontSize: '11px',
                    display: 'block', 
                    marginBottom: '4px',
                    opacity: 0.9
                  }}>
                    Alt Text (SEO & Erişilebilirlik)
                  </label>
                  <input
                    type="text"
                    placeholder="Image description"
                    value={currentImageAlt}
                    onChange={(e) => {
                      setCurrentImageAlt(e.target.value);
                      if (selectedElement?.element) selectedElement.element.setAttribute('alt', e.target.value);
                    }}
                    onBlur={() => updateHTML()}
                    style={{
                      width: '100%',
                      padding: '8px',
                      background: 'rgba(255,255,255,0.15)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '6px',
                      color: 'white',
                      fontSize: '12px'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Alt text for images (fallback) */}
            {selectedElement?.tagName === 'img' && !selectedElement?.src && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: '#9ca3af', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                  Alt Text (Erişilebilirlik)
                </label>
                <input
                  type="text"
                  value={currentImageAlt}
                  onChange={(e) => {
                    setCurrentImageAlt(e.target.value);
                    if (selectedElement?.element) selectedElement.element.setAttribute('alt', e.target.value);
                  }}
                  onBlur={() => updateHTML()}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: '#374151',
                    border: '1px solid #4b5563',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '13px'
                  }}
                />
              </div>
            )}

            {/* Color Picker */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#9ca3af', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                Metin Rengi
              </label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={currentTextColor}
                  onChange={(e) => { setCurrentTextColor(e.target.value); updateElementColor(e.target.value); }}
                  style={{
                    width: '48px',
                    height: '40px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                />
                <input
                  type="text"
                  value={currentTextColor}
                  onChange={(e) => setCurrentTextColor(e.target.value)}
                  onBlur={(e) => updateElementColor(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: '#374151',
                    border: '1px solid #4b5563',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>

            {/* Background Image Editor */}
            <div style={{ marginBottom: '20px', padding: '16px', background: '#374151', borderRadius: '8px' }}>
              <label style={{ color: 'white', fontSize: '13px', display: 'block', marginBottom: '12px', fontWeight: '600' }}>
                🖼️ Arka Plan
              </label>
              
              {/* Background Color */}
              <div style={{ marginBottom: '12px' }}>
                <p style={{ color: '#9ca3af', fontSize: '11px', marginBottom: '4px' }}>Renk</p>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={currentBgColor}
                    onChange={(e) => { setCurrentBgColor(e.target.value); updateElementStyle('backgroundColor', e.target.value); }}
                    style={{
                      width: '40px',
                      height: '40px',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  />
                  <input
                    type="text"
                    value={currentBgColor}
                    onChange={(e) => setCurrentBgColor(e.target.value)}
                    onBlur={(e) => updateElementStyle('backgroundColor', e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: '#1f2937',
                      border: '1px solid #4b5563',
                      borderRadius: '6px',
                      color: 'white',
                      fontSize: '12px'
                    }}
                  />
                </div>
              </div>

              {/* Background Image - Works for ALL elements */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: '#9ca3af', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                  🖼️ Arka Plan Resmi
                </label>
                
                {/* Show current background image if exists */}
                {(() => {
                  const bgImage = selectedElement?.element?.style.backgroundImage;
                  const bgUrl = bgImage ? bgImage.replace(/url\(['"]?|['"]?\)/g, '') : '';
                  
                  return (
                    <>
                      {bgUrl && (
                        <div style={{
                          marginBottom: '8px',
                          padding: '8px',
                          background: '#374151',
                          borderRadius: '6px',
                          fontSize: '11px',
                          color: '#9ca3af',
                          wordBreak: 'break-all'
                        }}>
                          Mevcut: {bgUrl.substring(0, 50)}...
                        </div>
                      )}
                      
                      <input
                        type="text"
                        placeholder="https://example.com/image.jpg"
                        value={currentBgImageUrl}
                        onChange={(e) => setCurrentBgImageUrl(e.target.value)}
                        onBlur={(e) => {
                          if (selectedElement?.element) {
                            if (e.target.value) {
                              selectedElement.element.style.backgroundImage = `url('${e.target.value}')`;
                              selectedElement.element.style.backgroundSize = 'cover';
                              selectedElement.element.style.backgroundPosition = 'center';
                              selectedElement.element.style.backgroundRepeat = 'no-repeat';
                            } else {
                              selectedElement.element.style.backgroundImage = '';
                              setCurrentBgImageUrl('');
                            }
                            updateHTML();
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '10px',
                          background: '#1f2937',
                          border: '1px solid #4b5563',
                          borderRadius: '6px',
                          color: 'white',
                          fontSize: '13px'
                        }}
                      />
                    </>
                  );
                })()}
              </div>
                
                {/* Background Size */}
                <select
                  onChange={(e) => {
                    if (selectedElement?.element) {
                      selectedElement.element.style.backgroundSize = e.target.value;
                      updateHTML();
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: '#1f2937',
                    border: '1px solid #4b5563',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '12px',
                    cursor: 'pointer',
                    marginBottom: '8px'
                  }}
                >
                  <option value="cover">Kaplama (Cover)</option>
                  <option value="contain">Sığdırma (Contain)</option>
                  <option value="100% 100%">Uzatma (Stretch)</option>
                  <option value="auto">Orijinal Boyut</option>
                </select>
                
                {/* Background Position */}
                <select
                  onChange={(e) => {
                    if (selectedElement?.element) {
                      selectedElement.element.style.backgroundPosition = e.target.value;
                      updateHTML();
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: '#1f2937',
                    border: '1px solid #4b5563',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '12px',
                    cursor: 'pointer',
                    marginBottom: '8px'
                  }}
                >
                  <option value="center">Orta</option>
                  <option value="top">Üst</option>
                  <option value="bottom">Alt</option>
                  <option value="left">Sol</option>
                  <option value="right">Sağ</option>
                </select>

                {/* Quick Image Picker Button */}
                <button
                  onClick={() => {
                    const url = prompt('Resim URL\'sini girin:', '');
                    if (url && selectedElement?.element) {
                      selectedElement.element.style.backgroundImage = `url('${url}')`;
                      selectedElement.element.style.backgroundSize = 'cover';
                      selectedElement.element.style.backgroundPosition = 'center';
                      updateHTML();
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                >
                  🖼️ Arka Plan Resmi Ekle
                </button>
              </div>

            {/* Font Size */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#9ca3af', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                Font Boyutu ({currentFontSizePx})
              </label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="range"
                  min="8"
                  max="72"
                  value={parseInt(currentFontSizePx) || 16}
                  onChange={(e) => {
                    const newSize = e.target.value + 'px';
                    setCurrentFontSizePx(newSize);
                    if (selectedElement?.element) selectedElement.element.style.fontSize = newSize;
                  }}
                  onMouseUp={() => updateHTML()}
                  style={{ flex: 1 }}
                />
                <input
                  type="number"
                  min="8"
                  max="72"
                  value={parseInt(currentFontSizePx) || 16}
                  onChange={(e) => {
                    const newSize = e.target.value + 'px';
                    setCurrentFontSizePx(newSize);
                    if (selectedElement?.element) selectedElement.element.style.fontSize = newSize;
                  }}
                  onBlur={() => updateHTML()}
                  style={{
                    width: '60px',
                    padding: '8px',
                    background: '#374151',
                    border: '1px solid #4b5563',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>

            {/* Padding */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#9ca3af', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                İç Boşluk (Padding)
              </label>
              <input
                type="text"
                value={currentPadding}
                onChange={(e) => {
                  setCurrentPadding(e.target.value);
                  if (selectedElement?.element) selectedElement.element.style.padding = e.target.value;
                }}
                onBlur={() => updateHTML()}
                placeholder="örn: 20px"
                style={{
                  width: '100%',
                  padding: '8px',
                  background: '#374151',
                  border: '1px solid #4b5563',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '13px'
                }}
              />
            </div>

            {/* Margin */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#9ca3af', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                Dış Boşluk (Margin)
              </label>
              <input
                type="text"
                value={currentMargin}
                onChange={(e) => {
                  setCurrentMargin(e.target.value);
                  if (selectedElement?.element) selectedElement.element.style.margin = e.target.value;
                }}
                onBlur={() => updateHTML()}
                placeholder="örn: 10px"
                style={{
                  width: '100%',
                  padding: '8px',
                  background: '#374151',
                  border: '1px solid #4b5563',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '13px'
                }}
              />
            </div>

            {/* ── SIZE CONTROLS ──────────────────────────── */}
            <div style={{ borderTop: '1px solid #4b5563', paddingTop: '20px', marginBottom: '20px' }}>
              <label style={{ color: '#9ca3af', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '14px' }}>
                📏 Boyut
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {/* Width */}
                <div>
                  <label style={{ color: '#6b7280', fontSize: '11px', display: 'block', marginBottom: '4px' }}>Genişlik</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input
                      type="text"
                      value={currentWidth}
                      onChange={(e) => {
                        setCurrentWidth(e.target.value);
                        if (selectedElement?.element) selectedElement.element.style.width = e.target.value;
                      }}
                      onBlur={() => updateHTML()}
                      placeholder="auto"
                      style={{ flex: 1, minWidth: 0, padding: '7px 8px', background: '#374151', border: '1px solid #4b5563', borderRadius: '6px', color: 'white', fontSize: '12px' }}
                    />
                    <button onClick={() => { setCurrentWidth('100%'); if (selectedElement?.element) { selectedElement.element.style.width = '100%'; updateHTML(); } }} style={{ padding: '7px 8px', background: '#3b82f6', border: 'none', borderRadius: '6px', color: 'white', fontSize: '10px', cursor: 'pointer', whiteSpace: 'nowrap' }}>100%</button>
                  </div>
                </div>
                {/* Height */}
                <div>
                  <label style={{ color: '#6b7280', fontSize: '11px', display: 'block', marginBottom: '4px' }}>Yükseklik</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input
                      type="text"
                      value={currentHeight}
                      onChange={(e) => {
                        setCurrentHeight(e.target.value);
                        if (selectedElement?.element) selectedElement.element.style.height = e.target.value;
                      }}
                      onBlur={() => updateHTML()}
                      placeholder="auto"
                      style={{ flex: 1, minWidth: 0, padding: '7px 8px', background: '#374151', border: '1px solid #4b5563', borderRadius: '6px', color: 'white', fontSize: '12px' }}
                    />
                    <button onClick={() => { setCurrentHeight('auto'); if (selectedElement?.element) { selectedElement.element.style.height = 'auto'; updateHTML(); } }} style={{ padding: '7px 8px', background: '#4b5563', border: 'none', borderRadius: '6px', color: 'white', fontSize: '10px', cursor: 'pointer' }}>Auto</button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── POSITION CONTROLS ─────────────────────── */}
            <div style={{ borderTop: '1px solid #4b5563', paddingTop: '20px', marginBottom: '20px' }}>
              <label style={{ color: '#9ca3af', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '14px' }}>
                📍 Konum
              </label>
              {/* Position type */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ color: '#6b7280', fontSize: '11px', display: 'block', marginBottom: '4px' }}>Pozisyon Tipi</label>
                <select
                  value={currentPosition}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCurrentPosition(val);
                    if (selectedElement?.element) {
                      selectedElement.element.style.position = val;
                      if (val === 'absolute' && !selectedElement.element.style.left) {
                        selectedElement.element.style.left = '0px';
                        selectedElement.element.style.top = '0px';
                        setCurrentLeft('0px');
                        setCurrentTop('0px');
                      }
                      updateHTML();
                    }
                  }}
                  style={{ width: '100%', padding: '8px', background: '#374151', border: '1px solid #4b5563', borderRadius: '6px', color: 'white', fontSize: '12px' }}
                >
                  <option value="static">Static (Normal)</option>
                  <option value="relative">Relative</option>
                  <option value="absolute">Absolute (Serbest)</option>
                  <option value="fixed">Fixed (Sabit)</option>
                  <option value="sticky">Sticky</option>
                </select>
              </div>
              {/* Left / Top inputs — only when positioned */}
              {(currentPosition === 'absolute' || currentPosition === 'fixed' || currentPosition === 'relative' || currentPosition === 'sticky') && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {[
                    { label: 'Sol (Left)', state: currentLeft, setter: setCurrentLeft, prop: 'left' },
                    { label: 'Üst (Top)',  state: currentTop,  setter: setCurrentTop,  prop: 'top'  },
                  ].map(({ label, state, setter, prop }) => (
                    <div key={prop}>
                      <label style={{ color: '#6b7280', fontSize: '11px', display: 'block', marginBottom: '4px' }}>{label}</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => {
                          setter(e.target.value);
                          if (selectedElement?.element) selectedElement.element.style[prop] = e.target.value;
                        }}
                        onBlur={() => updateHTML()}
                        placeholder="0px"
                        style={{ width: '100%', padding: '7px 8px', background: '#374151', border: '1px solid #4b5563', borderRadius: '6px', color: 'white', fontSize: '12px', boxSizing: 'border-box' }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── BORDER CONTROLS ───────────────────────── */}
            <div style={{ borderTop: '1px solid #4b5563', paddingTop: '20px', marginBottom: '4px' }}>
              <label style={{ color: '#9ca3af', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '14px' }}>
                🔲 Kenar
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                {/* Border color */}
                <div>
                  <label style={{ color: '#6b7280', fontSize: '11px', display: 'block', marginBottom: '4px' }}>Kenar Rengi</label>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <input type="color" value={currentBorderColor}
                      onChange={(e) => {
                        setCurrentBorderColor(e.target.value);
                        if (selectedElement?.element) { selectedElement.element.style.borderColor = e.target.value; updateHTML(); }
                      }}
                      style={{ width: '40px', height: '34px', border: 'none', borderRadius: '6px', cursor: 'pointer', flexShrink: 0 }}
                    />
                    <input type="text" value={currentBorderColor}
                      onChange={(e) => { setCurrentBorderColor(e.target.value); if (selectedElement?.element) selectedElement.element.style.borderColor = e.target.value; }}
                      onBlur={() => updateHTML()}
                      style={{ flex: 1, minWidth: 0, padding: '7px 8px', background: '#374151', border: '1px solid #4b5563', borderRadius: '6px', color: 'white', fontSize: '11px', fontFamily: 'monospace' }}
                    />
                  </div>
                </div>
                {/* Border width */}
                <div>
                  <label style={{ color: '#6b7280', fontSize: '11px', display: 'block', marginBottom: '4px' }}>Kenar Kalınlığı</label>
                  <input type="text" value={currentBorderWidth}
                    onChange={(e) => {
                      setCurrentBorderWidth(e.target.value);
                      if (selectedElement?.element) {
                        selectedElement.element.style.borderWidth = e.target.value;
                        if (!selectedElement.element.style.borderStyle || selectedElement.element.style.borderStyle === 'none') {
                          selectedElement.element.style.borderStyle = 'solid';
                        }
                      }
                    }}
                    onBlur={() => updateHTML()}
                    placeholder="0px"
                    style={{ width: '100%', padding: '7px 8px', background: '#374151', border: '1px solid #4b5563', borderRadius: '6px', color: 'white', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
              {/* Border radius */}
              <div>
                <label style={{ color: '#6b7280', fontSize: '11px', display: 'block', marginBottom: '4px' }}>Köşe Yuvarlama (Border Radius)</label>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <input type="text" value={currentBorderRadius}
                    onChange={(e) => {
                      setCurrentBorderRadius(e.target.value);
                      if (selectedElement?.element) selectedElement.element.style.borderRadius = e.target.value;
                    }}
                    onBlur={() => updateHTML()}
                    placeholder="0px"
                    style={{ flex: 1, padding: '7px 8px', background: '#374151', border: '1px solid #4b5563', borderRadius: '6px', color: 'white', fontSize: '12px' }}
                  />
                  {['4px','8px','12px','16px','50%'].map(r => (
                    <button key={r} onClick={() => { setCurrentBorderRadius(r); if (selectedElement?.element) { selectedElement.element.style.borderRadius = r; updateHTML(); } }}
                      style={{ padding: '7px 8px', background: '#374151', border: '1px solid #4b5563', borderRadius: r === '50%' ? '50%' : '6px', color: '#9ca3af', fontSize: '10px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        ) : (
          <p style={{ color: '#9ca3af', fontSize: '13px' }}>
            Düzenlemek için canvas üzerinde bir öğeye tıklayın.
          </p>
        )}

        <h3 style={{ color: 'white', fontSize: '16px', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #374151' }}>
          Stiller
        </h3>
        <p style={{ color: '#9ca3af', fontSize: '12px' }}>
          Yukarıdaki özellik panelinden temel stilleri düzenleyebilirsiniz.
        </p>
      </div>

      {/* ====== DELETE CONFIRM MODAL ====== */}
      {showDeleteConfirm && selectedElement && (
        <div
          onClick={() => setShowDeleteConfirm(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '380px',
              width: '90%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h3 style={{ margin: '0 0 12px', fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
              Elementi Sil?
            </h3>
            <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
              <strong>&lt;{selectedElement.tagName?.toLowerCase()}&gt;</strong> elementi kalıcı olarak silinecek.
              Bu işlem geri alınamaz (Ctrl+Z ile geri alınabilir).
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  flex: 1, padding: '12px',
                  background: '#f3f4f6', color: '#374151',
                  border: 'none', borderRadius: '8px',
                  fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                }}
              >
                İptal
              </button>
              <button
                onClick={deleteSelectedElement}
                style={{
                  flex: 1, padding: '12px',
                  background: 'linear-gradient(135deg,#ef4444 0%,#dc2626 100%)',
                  color: 'white', border: 'none', borderRadius: '8px',
                  fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                }}
              >
                🗑️ Sil
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// ============ PREVIEW PANEL ============

const PreviewPanel = ({ editorMode, themeHTML }) => {
  const [device, setDevice] = useState('desktop');
  const deviceWidths = { desktop: '100%', tablet: '768px', mobile: '375px' };

  const getHTML = () => {
    if (editorMode === 'grapes') {
      return themeHTML || `<!DOCTYPE html><html><head></head><body><h1>Boş Tema</h1></body></html>`;
    }
    return `<!DOCTYPE html><html><head><style>body { font-family: Arial; margin: 0; padding: 20px; }</style></head><body><h1>Yeni Projeniz</h1><p>Buraya bir şeyler sürükleyin...</p></body></html>`;
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#1e1e1e' }}>
      <div style={{ height: '48px', background: '#252526', borderBottom: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', padding: '0 16px', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#9ca3af', fontSize: '14px' }}>Cihaz:</span>
          {['desktop', 'tablet', 'mobile'].map((dev) => (
            <button
              key={dev}
              onClick={() => setDevice(dev)}
              style={{
                padding: '8px',
                borderRadius: '4px',
                background: device === dev ? '#007acc' : '#2d2d2d',
                color: device === dev ? 'white' : '#9ca3af',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {dev === 'desktop' && <Monitor size={16} />}
              {dev === 'tablet' && <Tablet size={16} />}
              {dev === 'mobile' && <Smartphone size={16} />}
            </button>
          ))}
        </div>
        {editorMode === 'grapes' && <span style={{ color: '#8b5cf6', fontSize: '12px' }}>📄 Tema Önizleme</span>}
      </div>
      
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px', overflow: 'auto' }}>
        <iframe srcDoc={getHTML()} style={{ width: deviceWidths[device], height: '100%', maxHeight: 'calc(100vh - 160px)', border: 'none', borderRadius: '8px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }} title="Preview" sandbox="allow-scripts" />
      </div>
    </div>
  );
};

// ============ CODE PANEL ============

const CodePanel = ({ editorMode, themeHTML, onCodeChange, highlightedCode, isolatedElementCode, onClearIsolated, onSaveIsolatedCode, onSwitchToEdit, onHistoryEntry }) => {
  const [editorLanguage, setEditorLanguage] = useState('html');
  const monacoRef = useRef(null);
  const decorationsRef = useRef([]);
  const [showingIsolated, setShowingIsolated] = useState(false);
  const [isolatedCode, setIsolatedCode] = useState('');
  const [displayCode, setDisplayCode] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [lineNumber, setLineNumber] = useState(null);

  const extractHTML = () => {
    if (!themeHTML) return '';
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(themeHTML, 'text/html');
      return doc.body.innerHTML;
    } catch (e) {
      return themeHTML;
    }
  };

  const extractCSS = () => {
    if (!themeHTML) return '';
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(themeHTML, 'text/html');
      const styleTags = doc.querySelectorAll('style');
      let css = '';
      styleTags.forEach(tag => { css += tag.innerHTML + '\n'; });
      return css;
    } catch (e) {
      return '';
    }
  };

  // Calculate line number in full HTML
  const calculateLineNumber = (fullHTML, elementHTML) => {
    try {
      const index = fullHTML.indexOf(elementHTML);
      if (index === -1) return null;
      
      const beforeElement = fullHTML.substring(0, index);
      const lineNum = beforeElement.split('\n').length;
      return lineNum;
    } catch {
      return null;
    }
  };

  // Update code when isolatedElementCode changes
  useEffect(() => {
    console.log('📄 CodePanel received isolatedElementCode:', isolatedElementCode);
    
    if (isolatedElementCode && isolatedElementCode.code) {
      const codeToDisplay = isolatedElementCode.code;
      
      console.log('✅ Setting isolated code, length:', codeToDisplay?.length);
      console.log('Code preview:', codeToDisplay?.substring(0, 100));
      
      setIsolatedCode(codeToDisplay);
      setDisplayCode(codeToDisplay);
      setShowingIsolated(true);
      setHasChanges(false);
      setEditorLanguage('html');
      
      // Calculate line number in full document
      if (themeHTML) {
        const lineNum = calculateLineNumber(themeHTML, isolatedElementCode.originalHTML || codeToDisplay);
        setLineNumber(lineNum);
        console.log('📍 Element is at line:', lineNum);
      }
      
      console.log('📄 Showing isolated element code');
    } else {
      console.log('📄 Loading full page code');
      
      // Show full page code
      if (editorMode === 'grapes') {
        const fullCode = editorLanguage === 'html' ? extractHTML() : extractCSS();
        setDisplayCode(fullCode);
        setShowingIsolated(false);
        setHasChanges(false);
        setLineNumber(null);
        console.log('✅ Full page code loaded, length:', fullCode?.length);
      }
    }
  }, [isolatedElementCode, themeHTML, editorMode, editorLanguage]);

  // Handle code changes
  const handleCodeChange = (newValue) => {
    console.log('✏️ Code changed, length:', newValue?.length);
    setDisplayCode(newValue || '');
    if (showingIsolated) {
      setIsolatedCode(newValue || '');
      setHasChanges(true);
    }
  };

  // Save full code to parent + iframe + localStorage
  const handleCodeSave = () => {
    const code = monacoRef.current?.getValue() ?? displayCode;
    if (!code) { showToast('ℹ️ Kaydedilecek kod yok', 'info'); return; }

    // Propagate to parent (updates themeHTML state → triggers GrapesJS reload)
    if (onCodeChange) onCodeChange(code, editorLanguage);

    // Write directly to iframe for immediate preview
    try {
      const iframe = document.querySelector('iframe[title="Theme Canvas"]');
      if (iframe?.contentDocument) {
        iframe.contentDocument.open();
        iframe.contentDocument.write(code);
        iframe.contentDocument.close();
      }
    } catch { /* ignore */ }

    localStorage.setItem('webeditr_project', code);
    showToast('✅ Kod kaydedildi ve önizleme güncellendi!');
  };

  // Handle save changes - Direct DOM approach
  const handleSaveChanges = () => {
    if (!isolatedElementCode || !hasChanges || !displayCode) {
      console.warn('❌ Nothing to save:', { hasElement: !!isolatedElementCode, hasChanges, hasCode: !!displayCode });
      showToast('ℹ️ Kaydedilecek değişiklik yok', 'info');
      return;
    }

    console.log('💾 Save: Starting...');
    console.log('📋 Element info:', {
      id: isolatedElementCode.id,
      className: isolatedElementCode.className,
      tagName: isolatedElementCode.tagName,
      hasRef: !!isolatedElementCode.elementRef
    });

    try {
      // Step 1: Find the iframe - try multiple selectors
      let iframe = null;

      // Try 1: By title
      iframe = document.querySelector('iframe[title="Theme Canvas"]');
      console.log('Try 1 (by title):', iframe ? 'Found' : 'Not found');

      // Try 2: Inside any visible container
      if (!iframe) {
        const allIframes = document.querySelectorAll('iframe');
        console.log('Try 2: Total iframes in DOM:', allIframes.length);
        for (const f of allIframes) {
          // Skip preview iframes
          if (f.title === 'Preview' || f.hasAttribute('sandbox')) continue;
          // Check if iframe has content
          if (f.contentDocument || f.contentWindow?.document) {
            iframe = f;
            console.log('Try 2 (by contentDocument):', 'Found');
            break;
          }
        }
      }

      // Try 3: Just get first iframe that's not a preview
      if (!iframe) {
        const allIframes = document.querySelectorAll('iframe:not([sandbox])');
        if (allIframes.length > 0) {
          iframe = allIframes[0];
          console.log('Try 3 (first non-sandbox iframe):', 'Found');
        }
      }

      if (!iframe) {
        console.error('❌ No iframe found');
        showToast('❌ Canvas bulunamadı — önce "Düzenleme" sekmesine geçin', 'error', 4000);
        return;
      }

      console.log('✅ Iframe found:', iframe.title || '(no title)');

      // Step 2: Access iframe document
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) {
        console.error('❌ Cannot access iframe document');
        showToast('❌ Iframe içeriğine erişilemiyor!', 'error', 3000);
        return;
      }

      console.log('✅ Iframe document accessed');

      // Step 3: Find the element to update
      let targetElement = null;

      // Method 1: By ID (most reliable)
      if (isolatedElementCode.id) {
        targetElement = doc.getElementById(isolatedElementCode.id);
        if (targetElement) {
          console.log('✅ Found by ID:', isolatedElementCode.id);
        }
      }

      // Method 2: By stored reference (if element ref still valid)
      if (!targetElement && isolatedElementCode.elementRef) {
        try {
          if (doc.contains(isolatedElementCode.elementRef)) {
            targetElement = isolatedElementCode.elementRef;
            console.log('✅ Found by stored reference');
          } else {
            console.log('⚠️ Stored reference not in document');
          }
        } catch (e) {
          console.log('⚠️ Reference check failed:', e.message);
        }
      }

      // Method 3: By querySelector with class
      if (!targetElement && isolatedElementCode.className && typeof isolatedElementCode.className === 'string') {
        const firstClass = isolatedElementCode.className.trim().split(/\s+/)[0];
        if (firstClass) {
          const selector = '.' + firstClass;
          targetElement = doc.querySelector(selector);
          if (targetElement) {
            console.log('✅ Found by class selector:', selector);
          }
        }
      }

      // Method 4: By tag name + text content similarity
      if (!targetElement && isolatedElementCode.tagName) {
        const elements = doc.getElementsByTagName(isolatedElementCode.tagName);
        console.log(`Looking for ${isolatedElementCode.tagName}, found ${elements.length} elements`);

        // If only one element of this type, use it
        if (elements.length === 1) {
          targetElement = elements[0];
          console.log('✅ Found by tag (only one exists)');
        }
      }

      // Method 5: Find by editor-selected class (element might still be selected)
      if (!targetElement) {
        targetElement = doc.querySelector('.editor-selected');
        if (targetElement) {
          console.log('✅ Found by .editor-selected class');
        }
      }

      if (!targetElement) {
        console.error('❌ Target element not found');
        console.log('Search criteria:', {
          id: isolatedElementCode.id,
          className: isolatedElementCode.className,
          tagName: isolatedElementCode.tagName
        });
        showToast('⚠️ Element bulunamadı — "Düzenleme" sekmesinden elementi tekrar seçin', 'warning', 4000);
        return;
      }

      console.log('✅ Target element found:', targetElement.tagName, targetElement.id || targetElement.className);

      // Step 4: Validate and sanitize the element
      let newCode = displayCode.trim();

      // CRITICAL: Sanitize JavaScript template literals that cause "property not defined" errors
      // Replace ${variableName} patterns with empty string or placeholder text
      newCode = newCode.replace(/\$\{[^}]+\}/g, (match) => {
        console.log('⚠️ Removing JS template literal:', match);
        return ''; // Remove template literals
      });

      // Also remove any onclick handlers with undefined variables
      newCode = newCode.replace(/onclick="[^"]*\$\{[^}]*\}[^"]*"/gi, '');
      newCode = newCode.replace(/onclick='[^']*\$\{[^}]*\}[^']*'/gi, '');


      // Validate HTML before replacing
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = newCode;

      if (!tempDiv.firstChild) {
        showToast('❌ Geçersiz HTML kodu!', 'error', 3000);
        return;
      }

      console.log('✅ New HTML validated and sanitized, replacing element...');

      // Store element info for re-selection
      const newElementId = tempDiv.firstChild.id;
      const newElementClass = tempDiv.firstChild.className;

      // Do the replacement
      targetElement.outerHTML = newCode;

      console.log('✅ Element replaced successfully in iframe');

      // CRITICAL: Force visual refresh of the iframe
      const iframeDoc = doc;
      if (iframeDoc && iframeDoc.body) {
        // Force layout recalculation
        iframeDoc.body.style.display = 'none';
        void iframeDoc.body.offsetHeight; // Force reflow
        iframeDoc.body.style.display = '';

        // Dispatch resize event to trigger any responsive handlers
        if (iframe.contentWindow) {
          iframe.contentWindow.dispatchEvent(new Event('resize'));
        }

        console.log('✅ Forced visual refresh');
      }

      // Step 5: Update state
      setHasChanges(false);
      setIsolatedCode(newCode);

      // Call callback to sync themeHTML state — pass element info for parent View Change button
      if (onSaveIsolatedCode) {
        onSaveIsolatedCode(newCode, {
          tagName: isolatedElementCode.tagName,
          id: isolatedElementCode.id,
          className: isolatedElementCode.className
        });
      }

      // Debug: Verify the change
      console.log('🔍 After save - iframe HTML length:',
        iframe.contentDocument?.documentElement?.outerHTML?.length || 0
      );
      if (newElementId) {
        console.log('🔍 New element in DOM:',
          doc.getElementById(newElementId) ? 'YES' : 'NO'
        );
      }

      // Visual feedback on button
      const btn = document.getElementById('save-code-btn');
      if (btn) {
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span style="font-size:16px">✅</span> <span>Kaydedildi!</span>';
        btn.style.background = '#10b981';
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.background = '#3b82f6';
        }, 2000);
      }

      console.log('🎉 Save completed successfully!');
      if (onHistoryEntry) onHistoryEntry('success', 'Element kodu kaydedildi', { tag: isolatedElementCode?.tagName, id: isolatedElementCode?.id });

    } catch (error) {
      console.error('❌ Save error:', error);
      if (onHistoryEntry) onHistoryEntry('error', 'Kayıt başarısız: ' + error.message, { tag: isolatedElementCode?.tagName });
      showToast('❌ Hata: ' + error.message, 'error', 4000);
    }
  };

  // Highlight code when highlightedCode changes
  useEffect(() => {
    if (!highlightedCode || !monacoRef.current) {
      console.log('⏭️ Skipping highlight:', { 
        hasHighlight: !!highlightedCode, 
        hasEditor: !!monacoRef.current
      });
      return;
    }

    const editor = monacoRef.current;
    const model = editor.getModel();

    if (!model) {
      console.error('❌ No model');
      return;
    }

    // Wait a bit for Monaco to be fully ready
    setTimeout(() => {
      try {
        const fullCode = model.getValue();
        console.log('🔍 Searching in code, length:', fullCode.length);
        
        let startIndex = -1;
        let searchHTML = highlightedCode.html?.trim() || '';
        
        // Strategy 1: Direct HTML match
        startIndex = fullCode.indexOf(searchHTML);
        console.log('Strategy 1 (direct):', startIndex);
        
        // Strategy 2: Search by unique identifier (ID)
        if (startIndex === -1 && highlightedCode.id) {
          const idPattern = new RegExp(`id=["']${highlightedCode.id}["']`, 'i');
          const match = fullCode.match(idPattern);
          if (match) {
            startIndex = fullCode.indexOf(match[0]);
            console.log('Strategy 2 (by ID):', startIndex);
          }
        }
        
        // Strategy 3: Search by class name
        if (startIndex === -1 && highlightedCode.className && typeof highlightedCode.className === 'string') {
          const firstClass = highlightedCode.className.split(' ')[0];
          if (firstClass) {
            const classPattern = new RegExp(`class=["'][^"']*${firstClass}[^"']*["']`, 'i');
            const match = fullCode.match(classPattern);
            if (match) {
              startIndex = fullCode.indexOf(match[0]);
              console.log('Strategy 3 (by class):', startIndex);
            }
          }
        }
        
        // Strategy 4: Search by opening tag
        if (startIndex === -1 && highlightedCode.tagName) {
          const tagPattern = new RegExp(`<${highlightedCode.tagName}[^>]*>`, 'i');
          const matches = [...fullCode.matchAll(new RegExp(tagPattern, 'gi'))];
          if (matches.length > 0) {
            // Find the most relevant match (contains the same classes/id)
            for (const match of matches) {
              if (
                (highlightedCode.id && match[0].includes(highlightedCode.id)) ||
                (highlightedCode.className && typeof highlightedCode.className === 'string' && match[0].includes(highlightedCode.className.split(' ')[0]))
              ) {
                startIndex = match.index;
                break;
              }
            }
            // If no specific match, use first occurrence
            if (startIndex === -1) {
              startIndex = matches[0].index;
            }
            console.log('Strategy 4 (by tag):', startIndex);
          }
        }
        
        if (startIndex === -1) {
          console.error('❌ Element not found in code');
          return;
        }
        
        console.log('✅ Found at index:', startIndex);
        
        // Convert to position
        const startPos = model.getPositionAt(startIndex);
        const endPos = model.getPositionAt(startIndex + Math.min(searchHTML.length, 500));
        
        console.log('📍 Position:', startPos.lineNumber, ':', startPos.column);
        
        // Clear old decorations
        if (decorationsRef.current.length > 0) {
          editor.deltaDecorations(decorationsRef.current, []);
        }
        
        // Reveal line (CENTERED)
        editor.revealLineInCenter(startPos.lineNumber);
        
        // Wait for scroll to complete
        setTimeout(() => {
          // Set selection
          editor.setSelection({
            startLineNumber: startPos.lineNumber,
            startColumn: startPos.column,
            endLineNumber: endPos.lineNumber,
            endColumn: endPos.column
          });
          
          // Add highlight decoration
          const newDecorations = editor.deltaDecorations([], [
            {
              range: {
                startLineNumber: startPos.lineNumber,
                startColumn: 1,
                endLineNumber: endPos.lineNumber,
                endColumn: model.getLineMaxColumn(endPos.lineNumber)
              },
              options: {
                isWholeLine: true,
                className: 'highlighted-code-line',
                glyphMarginClassName: 'highlighted-code-glyph',
                linesDecorationsClassName: 'highlighted-code-decoration'
              }
            }
          ]);
          
          decorationsRef.current = newDecorations;
          
          // Focus editor
          editor.focus();
          
          console.log('✅ Code highlighted at line', startPos.lineNumber);
          
          // Auto-clear after 15 seconds
          setTimeout(() => {
            if (decorationsRef.current.length > 0) {
              editor.deltaDecorations(decorationsRef.current, []);
              decorationsRef.current = [];
            }
            if (highlightedCode.onClearHighlight) {
              highlightedCode.onClearHighlight();
            }
          }, 15000);
          
        }, 200);
        
      } catch (error) {
        console.error('❌ Highlighting error:', error);
      }
    }, 300);
    
  }, [highlightedCode]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#1e1e1e' }}>
      {/* Language tabs */}
      <div style={{ height: '48px', background: '#252526', borderBottom: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', padding: '0 16px', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {['html', 'css'].map((lang) => (
            <button
              key={lang}
              onClick={() => setEditorLanguage(lang)}
              style={{
                padding: '6px 16px',
                borderRadius: '4px',
                fontSize: '12px',
                background: editorLanguage === lang ? '#007acc' : '#2d2d2d',
                color: editorLanguage === lang ? 'white' : '#9ca3af',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {editorMode === 'grapes' && <span style={{ color: '#8b5cf6', fontSize: '12px' }}>📄 Tema Kodu</span>}
          {!showingIsolated && (
            <button
              onClick={handleCodeSave}
              title="Kaydet ve önizle (Ctrl+S)"
              style={{
                padding: '5px 14px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              💾 Kaydet <span style={{ opacity: 0.7, fontSize: '10px' }}>Ctrl+S</span>
            </button>
          )}
        </div>
      </div>
      
      <div style={{ flex: 1, position: 'relative' }}>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.9; transform: scale(1.05); }
          }
          .spinner {
            display: inline-block;
            animation: spin 1s linear infinite;
          }
          .highlighted-code-line {
            background-color: rgba(251, 191, 36, 0.25) !important;
            border-left: 4px solid #fbbf24 !important;
          }
          .highlighted-code-glyph {
            background-color: #fbbf24 !important;
            width: 6px !important;
          }
          .highlighted-code-decoration {
            background-color: #fbbf24 !important;
            width: 4px !important;
          }
        `}</style>
        
        {/* Show which element is highlighted */}
        {highlightedCode && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '50px',
            padding: '8px 16px',
            background: 'rgba(251, 191, 36, 0.95)',
            color: '#000',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '600',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>🎯</span>
            <span>&lt;{highlightedCode.tagName}&gt;</span>
            {highlightedCode.id && <span>#{highlightedCode.id}</span>}
            <button
              onClick={() => {
                if (decorationsRef.current.length > 0 && monacoRef.current) {
                  monacoRef.current.deltaDecorations(decorationsRef.current, []);
                  decorationsRef.current = [];
                }
                if (highlightedCode.onClearHighlight) {
                  highlightedCode.onClearHighlight();
                }
              }}
              style={{
                background: 'rgba(0,0,0,0.2)',
                border: 'none',
                color: '#000',
                padding: '2px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px',
                marginLeft: '4px'
              }}
            >
              ✕
            </button>
          </div>
        )}
        
        {/* Isolated Element Indicator */}
        {showingIsolated && isolatedElementCode && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '60px',
            background: 'linear-gradient(90deg, #8b5cf6 0%, #6366f1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            borderBottom: '2px solid #7c3aed'
          }}>
            {/* Left: Element Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '28px' }}>🎯</span>
              <div>
                <div style={{ 
                  color: 'white', 
                  fontWeight: 'bold', 
                  fontSize: '17px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '4px'
                }}>
                  <span>&lt;{isolatedElementCode.tagName}&gt;</span>
                  {isolatedElementCode.id && (
                    <span style={{ 
                      fontSize: '13px', 
                      background: 'rgba(255,255,255,0.25)',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      fontWeight: '600'
                    }}>
                      #{isolatedElementCode.id}
                    </span>
                  )}
                  {lineNumber && (
                    <span style={{ 
                      fontSize: '12px', 
                      background: 'rgba(251, 191, 36, 0.3)',
                      color: '#fbbf24',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span>📍</span>
                      <span>Satır {lineNumber}</span>
                    </span>
                  )}
                </div>
                <div style={{ 
                  color: 'rgba(255,255,255,0.85)', 
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {hasChanges ? '⚠️ Kaydedilmemiş değişiklikler var' : '✏️ Kodu düzenleyebilirsiniz'}
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {/* Save Button */}
              {hasChanges && (
                <button
                  id="save-code-btn"
                  onClick={handleSaveChanges}
                  style={{
                    padding: '10px 20px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                  }}
                >
                  <span style={{ fontSize: '16px' }}>💾</span>
                  <span>Kaydet</span>
                </button>
              )}

              {/* Copy Button */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(isolatedCode);
                  const btn = document.activeElement;
                  const originalHTML = btn.innerHTML;
                  btn.innerHTML = '<span style="font-size:16px">✅</span> Kopyalandı';
                  setTimeout(() => {
                    btn.innerHTML = originalHTML;
                  }, 2000);
                }}
                style={{
                  padding: '10px 16px',
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span style={{ fontSize: '16px' }}>📋</span>
                <span>Kopyala</span>
              </button>

              {/* Show Full Code Button */}
              <button
                onClick={() => {
                  if (hasChanges) {
                    if (!confirm('Kaydedilmemiş değişiklikler var. Yine de çıkmak istiyor musunuz?')) {
                      return;
                    }
                  }
                  if (onClearIsolated) onClearIsolated();
                  setShowingIsolated(false);
                  setHasChanges(false);
                }}
                style={{
                  padding: '10px 16px',
                  background: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span style={{ fontSize: '16px' }}>📄</span>
                <span>Tüm Kod</span>
              </button>

              {/* Close Button */}
              <button
                onClick={() => {
                  if (hasChanges) {
                    if (!confirm('Kaydedilmemiş değişiklikler var. Yine de kapatmak istiyor musunuz?')) {
                      return;
                    }
                  }
                  if (onClearIsolated) onClearIsolated();
                }}
                style={{
                  padding: '10px 14px',
                  background: 'rgba(239, 68, 68, 0.9)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '700'
                }}
              >
                ✕
              </button>
            </div>
          </div>
        )}
        
        <div style={{ 
          height: '100%', 
          paddingTop: showingIsolated ? '60px' : '0',
          boxSizing: 'border-box'
        }}>
          <MonacoEditor
            height="100%"
            defaultLanguage="html"
            theme="vs-dark"
            value={displayCode}
            onMount={(editor, monaco) => {
              monacoRef.current = editor;
              console.log('✅ Monaco Editor mounted with code length:', displayCode?.length);
              // Ctrl+S → save
              editor.addCommand(
                monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
                () => handleCodeSave()
              );
            }}
            onChange={handleCodeChange}
            options={{
              minimap: { enabled: !showingIsolated },
              fontSize: 14,
              wordWrap: 'on',
              automaticLayout: true,
              scrollBeyondLastLine: false,
              formatOnPaste: true,
              formatOnType: true,
              glyphMargin: true,
              lineDecorationsWidth: 10,
              readOnly: false, // Now EDITABLE
              lineNumbers: 'on',
              tabSize: 2,
              insertSpaces: true
            }}
          />
        </div>
      </div>
    </div>
  );
};

// ============ HISTORY TAB ============

const HistoryTab = ({ history, onClear, onViewCode }) => {
  const [expandedId, setExpandedId] = React.useState(null);
  const iconFor  = (t) => ({ success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' }[t] || '•');
  const colorFor = (t) => ({ success: '#10b981', error: '#ef4444', warning: '#f59e0b', info: '#3b82f6' }[t] || '#6b7280');

  return (
    <div style={{ height: '100%', background: '#1e1e1e', overflowY: 'auto', padding: '20px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #374151' }}>
        <h3 style={{ margin: 0, color: 'white', fontSize: '18px', fontWeight: 700 }}>📋 Düzenleme Geçmişi</h3>
        <button
          onClick={onClear}
          style={{ padding: '8px 16px', background: '#374151', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
        >
          🗑️ Temizle
        </button>
      </div>

      {history.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
          <p style={{ fontSize: '16px', margin: 0 }}>Henüz düzenleme yapılmadı</p>
          <p style={{ fontSize: '14px', marginTop: '8px', opacity: 0.7 }}>Yaptığınız tüm değişiklikler burada görünecek</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {history.map(entry => {
            const isExpanded = expandedId === entry.id;
            const hasCode = entry.details?.code;
            return (
              <div key={entry.id} style={{ background: '#2d2d2d', borderRadius: '8px', borderLeft: `4px solid ${colorFor(entry.type)}`, overflow: 'hidden' }}>
                {/* Main row */}
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', cursor: entry.details ? 'pointer' : 'default' }}
                  onClick={() => entry.details && setExpandedId(isExpanded ? null : entry.id)}
                >
                  <span style={{ fontSize: '16px', flexShrink: 0 }}>{iconFor(entry.type)}</span>
                  <span style={{ color: 'white', fontSize: '13px', fontWeight: 600, flex: 1 }}>{entry.message}</span>
                  {entry.details?.tag && (
                    <span style={{ background: '#374151', color: '#9ca3af', fontSize: '10px', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace', flexShrink: 0 }}>
                      &lt;{entry.details.tag?.toLowerCase()}&gt;
                    </span>
                  )}
                  <span style={{ color: '#6b7280', fontSize: '11px', whiteSpace: 'nowrap', flexShrink: 0 }}>{entry.timestamp}</span>
                  {entry.details && (
                    <span style={{ color: '#6b7280', fontSize: '12px', flexShrink: 0 }}>{isExpanded ? '▲' : '▼'}</span>
                  )}
                </div>

                {/* Expanded detail panel */}
                {isExpanded && entry.details && (
                  <div style={{ borderTop: '1px solid #374151', padding: '12px 16px', background: '#1a1a1a' }}>
                    {/* Property change: oldValue → newValue */}
                    {(entry.details.oldValue !== undefined || entry.details.newValue !== undefined) && (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
                        {entry.details.property && (
                          <span style={{ color: '#9ca3af', fontSize: '12px' }}>{entry.details.property}:</span>
                        )}
                        {entry.details.oldValue !== undefined && (
                          <span style={{ background: '#4b1c1c', color: '#f87171', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace' }}>
                            - {String(entry.details.oldValue).substring(0, 80)}
                          </span>
                        )}
                        {entry.details.newValue !== undefined && (
                          <span style={{ background: '#1c3a2a', color: '#34d399', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace' }}>
                            + {String(entry.details.newValue).substring(0, 80)}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Code preview */}
                    {hasCode && (
                      <div style={{ marginBottom: '10px' }}>
                        <pre style={{ background: '#111', padding: '10px', borderRadius: '6px', fontSize: '11px', color: '#d1d5db', margin: 0, overflow: 'auto', maxHeight: '140px', fontFamily: 'monospace' }}>
                          {entry.details.code.substring(0, 800)}{entry.details.code.length > 800 ? '\n...' : ''}
                        </pre>
                      </div>
                    )}

                    {/* Other detail fields (excluding code/oldValue/newValue/property/tag which are rendered above) */}
                    {(() => {
                      const skip = new Set(['code', 'oldValue', 'newValue', 'property', 'tag']);
                      const rest = Object.entries(entry.details).filter(([k]) => !skip.has(k));
                      return rest.length > 0 ? (
                        <pre style={{ background: '#111', padding: '8px', borderRadius: '6px', fontSize: '11px', color: '#9ca3af', margin: 0, overflow: 'auto', maxHeight: '100px' }}>
                          {JSON.stringify(Object.fromEntries(rest), null, 2)}
                        </pre>
                      ) : null;
                    })()}

                    {/* "Kodu Görüntüle" button */}
                    {hasCode && onViewCode && (
                      <button
                        onClick={() => onViewCode(entry)}
                        style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}
                      >
                        <span>📄</span> Kodu Görüntüle
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ============ HEADER ============

const Header = ({ activeTab, setActiveTab, onSave, onExport, onOpenThemeStore, onOpenPlugins, onOpenAIPanel, isAIPanelOpen, onOpenToolbox, isToolboxOpen, editorMode, onNewProject, editHistory, showViewChangeButton, onViewChange, onUndo, onRedo, canUndo, canRedo }) => {
  return (
    <header style={{ height: '48px', background: '#333', display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: '1px solid #1e1e1e', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <h1 style={{ color: '#d1d5db', fontSize: '14px', fontWeight: 600 }}>WebEdit-r</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#252526', borderRadius: '6px', padding: '4px' }}>
          {[
            { key: TABS.EDIT, icon: Layout, label: 'Düzenleme' },
            { key: TABS.PREVIEW, icon: Eye, label: 'Ön İzleme' },
            { key: TABS.CODE, icon: Code, label: 'Kod' },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '4px',
                background: activeTab === key ? '#3d3d3d' : 'transparent',
                color: activeTab === key ? 'white' : '#9ca3af',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Icon size={14} /> {label}
            </button>
          ))}

          {/* View Change button — shows in header after a save, visible on Code tab */}
          {showViewChangeButton && activeTab === TABS.CODE && (
            <button
              onClick={onViewChange}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '6px 18px', fontSize: '12px', fontWeight: 700,
                borderRadius: '4px', border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                boxShadow: '0 4px 16px rgba(16,185,129,0.4)',
                animation: 'gentle-bounce 2s ease-in-out infinite',
                transition: 'all 0.3s ease',
                marginLeft: '4px',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(16,185,129,0.6)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(16,185,129,0.4)'; }}
            >
              <Eye size={15} />
              <span>Değişikliği Gör</span>
            </button>
          )}

          {/* History tab */}
          <button
            onClick={() => setActiveTab(TABS.HISTORY)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 16px', fontSize: '12px', fontWeight: 600,
              borderRadius: '4px',
              background: activeTab === TABS.HISTORY ? '#3d3d3d' : 'transparent',
              color: activeTab === TABS.HISTORY ? 'white' : '#9ca3af',
              border: 'none', cursor: 'pointer',
            }}
          >
            <Clock size={14} /> Geçmiş
            {editHistory && editHistory.length > 0 && (
              <span style={{ background: '#6366f1', color: 'white', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: 700 }}>
                {editHistory.length}
              </span>
            )}
          </button>

          {/* Terminal tab */}
          <button
            onClick={() => setActiveTab(TABS.TERMINAL)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 16px', fontSize: '12px', fontWeight: 600,
              borderRadius: '4px',
              background: activeTab === TABS.TERMINAL ? '#3d3d3d' : 'transparent',
              color: activeTab === TABS.TERMINAL ? '#0dbc79' : '#9ca3af',
              border: 'none', cursor: 'pointer',
            }}
          >
            <TerminalIcon size={14} /> Terminal
          </button>
        </div>

        {editorMode === 'grapes' && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#8b5cf6', fontSize: '12px', padding: '4px 12px', background: 'rgba(139, 92, 246, 0.2)', borderRadius: '4px' }}>
            <FileCode size={12} /> Tema Düzenleme
          </span>
        )}
      </div>
      
      <div style={{ flex: 1 }} />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => { if (canUndo && onUndo) onUndo(); }}
          disabled={!canUndo}
          title="Geri Al (Ctrl+Z)"
          style={{ padding: '8px', background: '#2d2d2d', border: 'none', borderRadius: '4px', cursor: canUndo ? 'pointer' : 'not-allowed', color: canUndo ? 'white' : '#4b5563', opacity: canUndo ? 1 : 0.5 }}
        >
          <Undo size={16} />
        </button>
        <button
          onClick={() => { if (canRedo && onRedo) onRedo(); }}
          disabled={!canRedo}
          title="İleri Al (Ctrl+Y)"
          style={{ padding: '8px', background: '#2d2d2d', border: 'none', borderRadius: '4px', cursor: canRedo ? 'pointer' : 'not-allowed', color: canRedo ? 'white' : '#4b5563', opacity: canRedo ? 1 : 0.5 }}
        >
          <Redo size={16} />
        </button>
        <button onClick={onNewProject} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: '#8b5cf6', borderRadius: '4px', fontSize: '12px', fontWeight: 600, color: 'white', border: 'none', cursor: 'pointer' }}><Plus size={14} /> Yeni Proje</button>
        <button onClick={onSave} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: '#2d2d2d', borderRadius: '4px', fontSize: '12px', fontWeight: 600, color: '#d1d5db', border: 'none', cursor: 'pointer' }}><Save size={14} /> Kaydet</button>
        <button onClick={onExport} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: '#007acc', borderRadius: '4px', fontSize: '12px', fontWeight: 600, color: 'white', border: 'none', cursor: 'pointer' }}><Download size={14} /> Dışa Aktar</button>
        <button onClick={onOpenThemeStore} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: '#8b5cf6', borderRadius: '4px', fontSize: '12px', fontWeight: 600, color: 'white', border: 'none', cursor: 'pointer', marginLeft: '8px' }}><ShoppingBag size={14} /> Tema Mağazası</button>
        <button
          onClick={onOpenAIPanel}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px',
            background: isAIPanelOpen
              ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
              : 'linear-gradient(135deg, #8b5cf6cc 0%, #7c3aedcc 100%)',
            borderRadius: '4px', fontSize: '12px', fontWeight: 600,
            color: 'white', border: 'none', cursor: 'pointer',
            boxShadow: isAIPanelOpen ? '0 2px 8px rgba(139,92,246,0.5)' : 'none',
          }}
        >
          <Bot size={14} /> AI Asistan
        </button>
        <button
          onClick={onOpenToolbox}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px',
            background: isToolboxOpen
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : 'linear-gradient(135deg, #10b981cc 0%, #059669cc 100%)',
            borderRadius: '4px', fontSize: '12px', fontWeight: 600,
            color: 'white', border: 'none', cursor: 'pointer',
            boxShadow: isToolboxOpen ? '0 2px 8px rgba(16,185,129,0.5)' : 'none',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
          Araç Kutusu
        </button>
        <button onClick={onOpenPlugins} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 16px', background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', borderRadius: '4px', fontSize: '12px', fontWeight: 600, color: 'white', border: 'none', cursor: 'pointer' }}><Puzzle size={14} /> Eklentiler</button>
      </div>
    </header>
  );
};

// ============ MAIN EDITOR ============

const Editor = () => {
  const [activeTab, setActiveTab] = useState(TABS.EDIT);
  const [isThemeStoreOpen, setIsThemeStoreOpen] = useState(false);
  const [showPlugins, setShowPlugins] = useState(false);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [showAdvancedToolbox, setShowAdvancedToolbox] = useState(false);
  const [editorMode, setEditorMode] = useState('craft');
  const [themeHTML, setThemeHTML] = useState(null);
  const [highlightedCode, setHighlightedCode] = useState(null);
  const [isolatedElementCode, setIsolatedElementCode] = useState(null);
  const [editHistory, setEditHistory] = useState([]);
  const [showViewChangeButton, setShowViewChangeButton] = useState(false);
  const [lastEditedElement, setLastEditedElement] = useState(null);
  const viewChangeBtnTimerRef = React.useRef(null);

  // BUG #2 FIX: Undo/Redo history in main editor
  const [themeHistory, setThemeHistory] = useState([]);
  const [themeHistoryIndex, setThemeHistoryIndex] = useState(-1);
  const isUndoRedoRef = React.useRef(false);

  const addHistoryEntry = (type, message, details = null) => {
    setEditHistory(prev => [{
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toLocaleTimeString('tr-TR'),
      type,   // 'success' | 'error' | 'warning' | 'info'
      message,
      details
    }, ...prev].slice(0, 50));
    console.log(`📝 History: ${type} — ${message}`);
  };
  
  const defaultHtmlCode = `<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>WebEdit-r</title><style>body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }</style></head><body><h1>Yeni Projeniz</h1><p>Buraya bir şeyler sürükleyin...</p></body></html>`;

  // Auto-load saved project on mount
  useEffect(() => {
    const saved = localStorage.getItem('webeditr_project');
    if (saved && saved.trim()) {
      setThemeHTML(saved);
      setEditorMode('grapes');
      setThemeHistory([saved]);
      setThemeHistoryIndex(0);
    }
  }, []);

  // Debugging: Log editor state changes
  useEffect(() => {
    console.log('📊 Editor State:', {
      activeTab,
      editorMode,
      hasHighlightedCode: !!highlightedCode,
      hasIsolatedCode: !!isolatedElementCode,
      isolatedTag: isolatedElementCode?.tagName
    });
  }, [activeTab, editorMode, highlightedCode, isolatedElementCode]);

  const handleThemeSelect = (htmlContent) => {
    console.log('=== THEME SELECTED ===');
    console.log('Length:', htmlContent.length);
    console.log('Has <body>:', htmlContent.includes('<body>'));
    console.log('Has <style>:', htmlContent.includes('<style>'));

    setThemeHTML(htmlContent);
    setEditorMode('grapes');
    setActiveTab(TABS.EDIT);
    setIsThemeStoreOpen(false);
    // Initialize undo history with the selected theme as the base state
    setThemeHistory([htmlContent]);
    setThemeHistoryIndex(0);
    addHistoryEntry('success', 'Tema yüklendi', { length: htmlContent.length });
  };

  const handleThemeHTMLChange = (updatedHTML) => {
    setThemeHTML(updatedHTML);
    setHighlightedCode(null);

    // BUG #2 FIX: push to undo/redo history (skip during undo/redo)
    if (!isUndoRedoRef.current) {
      setThemeHistory(prev => {
        const trimmed = prev.slice(0, themeHistoryIndex + 1);
        const next = [...trimmed, updatedHTML].slice(-50);
        return next;
      });
      setThemeHistoryIndex(prev => {
        const trimmedLen = Math.min(prev + 1, 50); // max 50 entries
        return Math.min(trimmedLen, 49); // max valid index
      });
    }
  };

  const handleMainUndo = () => {
    // Bug #5 Fix: Guard against empty/null history
    if (!themeHistory || themeHistory.length === 0) {
      console.log('⚠️ No history to undo');
      return;
    }
    if (themeHistoryIndex <= 0) {
      console.log('⚠️ Already at oldest history entry');
      return;
    }
    const newIndex = themeHistoryIndex - 1;
    const previousState = themeHistory[newIndex];
    if (!previousState) {
      console.error('❌ History entry not found at index', newIndex);
      return;
    }
    isUndoRedoRef.current = true;
    setThemeHistoryIndex(newIndex);
    setThemeHTML(previousState);
    setTimeout(() => { isUndoRedoRef.current = false; }, 100);
    const toast = document.createElement('div');
    toast.textContent = '↶ Geri alındı';
    toast.style.cssText = 'position:fixed;top:80px;right:20px;background:#3b82f6;color:white;padding:12px 20px;border-radius:8px;font-weight:600;z-index:10000;';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1500);
  };

  const handleMainRedo = () => {
    // Bug #5 Fix: Guard against empty/null history
    if (!themeHistory || themeHistory.length === 0) {
      console.log('⚠️ No history to redo');
      return;
    }
    if (themeHistoryIndex >= themeHistory.length - 1) {
      console.log('⚠️ Already at newest history entry');
      return;
    }
    const newIndex = themeHistoryIndex + 1;
    const nextState = themeHistory[newIndex];
    if (!nextState) {
      console.error('❌ History entry not found at index', newIndex);
      return;
    }
    isUndoRedoRef.current = true;
    setThemeHistoryIndex(newIndex);
    setThemeHTML(nextState);
    setTimeout(() => { isUndoRedoRef.current = false; }, 100);
    const toast = document.createElement('div');
    toast.textContent = '↷ İleri alındı';
    toast.style.cssText = 'position:fixed;top:80px;right:20px;background:#3b82f6;color:white;padding:12px 20px;border-radius:8px;font-weight:600;z-index:10000;';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1500);
  };

  // BUG #2 FIX: Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleMainUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleMainRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [themeHistory, themeHistoryIndex]);

  const handleJumpToCode = (elementInfo) => {
    console.log('🎯 Main Editor received elementInfo:', elementInfo);
    
    // Set isolated element code for focused view
    setIsolatedElementCode({
      code: elementInfo.code || elementInfo.html,
      originalHTML: elementInfo.originalHTML,
      tagName: elementInfo.tagName,
      id: elementInfo.id,
      className: elementInfo.className,
      elementRef: elementInfo.elementRef,
      timestamp: Date.now()
    });
    setActiveTab(TABS.CODE);
    addHistoryEntry('info', 'Element koda yönlendirildi', { tag: elementInfo.tagName, id: elementInfo.id });
    console.log('✅ Set isolatedElementCode and switched to Code tab');
  };

  const handleAIApplyCode = (code, mode) => {
    let finalCode = code;

    if (mode !== 'full') {
      // Append snippet to existing body
      const base = themeHTML || localStorage.getItem('webeditr_project') || '';
      if (base) {
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(base, 'text/html');
          const wrapper = doc.createElement('div');
          wrapper.innerHTML = code;
          while (wrapper.firstChild) doc.body.appendChild(wrapper.firstChild);
          finalCode = '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
        } catch { /* fallback to code as-is */ }
      }
    }

    setThemeHTML(finalCode);
    setEditorMode('grapes');

    // Write to iframe immediately for instant preview
    try {
      const iframe = document.querySelector('iframe[title="Theme Canvas"]');
      if (iframe?.contentDocument) {
        iframe.contentDocument.open();
        iframe.contentDocument.write(finalCode);
        iframe.contentDocument.close();
      }
    } catch { /* ignore */ }

    localStorage.setItem('webeditr_project', finalCode);
  };

  const handleGrapesClose = () => {
    setEditorMode('craft');
    setThemeHTML(null);
  };

  const handleNewProject = () => {
    if (!confirm('Yeni proje oluşturulacak. Mevcut çalışma kaybolacak. Devam edilsin mi?')) return;

    const starterHTML = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Yeni Proje</title>
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .container {
      text-align: center;
      color: white;
      padding: 60px 40px;
      max-width: 600px;
    }
    h1 {
      font-size: clamp(36px, 8vw, 64px);
      font-weight: 800;
      margin-bottom: 20px;
      letter-spacing: -0.02em;
      line-height: 1.1;
    }
    p {
      font-size: 20px;
      opacity: 0.85;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Yeni Proje</h1>
    <p>AI Asistan ile harika bir şeyler yaratmaya başla!</p>
  </div>
</body>
</html>`;

    // Update React state
    setThemeHTML(starterHTML);
    setEditorMode('grapes');
    setThemeHistory([starterHTML]);
    setThemeHistoryIndex(0);

    // Write to iframe immediately
    try {
      const iframe = document.querySelector('iframe[title="Theme Canvas"]');
      if (iframe?.contentDocument) {
        iframe.contentDocument.open();
        iframe.contentDocument.write(starterHTML);
        iframe.contentDocument.close();
      }
    } catch { /* ignore */ }

    localStorage.removeItem('webeditr_project');
    showToast('✅ Editor sıfırlandı!', 'success');
  };

  const handleSave = () => {
    let codeToSave;
    if (editorMode === 'grapes') {
      codeToSave = themeHTML;
    } else {
      codeToSave = defaultHtmlCode;
    }
    localStorage.setItem('webeditr_project', codeToSave);
    showToast('✅ Proje kaydedildi!', 'success');
  };

  const handleExport = () => {
    let fullHTML;
    if (editorMode === 'grapes') {
      fullHTML = themeHTML;
    } else {
      fullHTML = `<!DOCTYPE html><html><head><style>body { font-family: Arial; margin: 0; padding: 20px; }</style></head><body><h1>Yeni Projeniz</h1><p>Buraya bir şeyler sürükleyin...</p></body></html>`;
    }
    const blob = new Blob([fullHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'webeditr-project.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCodeChange = (code, language) => {
    if (!themeHTML) return;

    try {
      // Bug #3 Fix: Set flag so GrapesJSEditor skips iframe reload for Monaco edits
      sessionStorage.setItem('skipNextReload', 'true');

      if (language === 'html') {
        // CRITICAL FIX #5: detect full document vs body-only to preserve <head>
        const trimmed = (code || '').trim();
        const isFullDocument = trimmed.toLowerCase().startsWith('<!doctype') ||
                               trimmed.toLowerCase().startsWith('<html');

        if (isFullDocument) {
          // Full document — use as-is so <head> changes are preserved
          setThemeHTML(code);
        } else {
          // Body-only snippet — merge into existing document
          const parser = new DOMParser();
          const doc = parser.parseFromString(themeHTML, 'text/html');
          doc.body.innerHTML = code;
          setThemeHTML('<!DOCTYPE html>\n' + doc.documentElement.outerHTML);
        }
      } else {
        // CSS language — update first <style> tag
        const parser = new DOMParser();
        const doc = parser.parseFromString(themeHTML, 'text/html');
        const styleTags = doc.querySelectorAll('style');
        if (styleTags.length > 0) {
          styleTags[0].innerHTML = code;
        }
        setThemeHTML('<!DOCTYPE html>\n' + doc.documentElement.outerHTML);
      }
    } catch (e) {
      sessionStorage.removeItem('skipNextReload');
      console.error('Failed to update code:', e);
    }
  };

  // Handle saving isolated element code from CodePanel
  // This syncs the themeHTML state after the iframe has been directly updated
  const handleSaveIsolatedCode = (newCode, elementInfo) => {
    console.log('💾 handleSaveIsolatedCode: Syncing themeHTML state...');

    // Show View Change button in Header
    if (elementInfo) {
      setLastEditedElement(elementInfo);
      setShowViewChangeButton(true);
      if (viewChangeBtnTimerRef.current) clearTimeout(viewChangeBtnTimerRef.current);
      viewChangeBtnTimerRef.current = setTimeout(() => setShowViewChangeButton(false), 15000);
    }

    try {
      // Get the updated HTML from the iframe
      const iframe = document.querySelector('iframe[title="Theme Canvas"]') ||
                     document.querySelector('iframe:not([sandbox])');

      if (iframe && iframe.contentDocument) {
        const iframeDoc = iframe.contentDocument;

        // Get the full updated HTML including DOCTYPE
        const doctype = iframeDoc.doctype;
        const doctypeString = doctype
          ? `<!DOCTYPE ${doctype.name}${doctype.publicId ? ` PUBLIC "${doctype.publicId}"` : ''}${doctype.systemId ? ` "${doctype.systemId}"` : ''}>`
          : '<!DOCTYPE html>';

        const updatedHTML = doctypeString + '\n' + iframeDoc.documentElement.outerHTML;
        setThemeHTML(updatedHTML);
        console.log('✅ themeHTML synced from iframe, length:', updatedHTML.length);

        // Force visual refresh in case the change isn't showing
        iframeDoc.body.style.display = 'none';
        void iframeDoc.body.offsetHeight;
        iframeDoc.body.style.display = '';

        // Trigger resize to ensure responsive elements update
        if (iframe.contentWindow) {
          iframe.contentWindow.dispatchEvent(new Event('resize'));
        }
      }

      // Update isolatedElementCode to reflect the new code
      setIsolatedElementCode(prev => prev ? {
        ...prev,
        code: newCode.trim(),
        originalHTML: newCode.trim()
      } : null);

      console.log('✅ State synced successfully');
      addHistoryEntry('success', 'Kod kaydedildi', {
        tag: isolatedElementCode?.tagName,
        id: isolatedElementCode?.id,
        className: isolatedElementCode?.className,
        code: newCode.trim().substring(0, 2000),
      });
      return true;

    } catch (error) {
      console.error('⚠️ Error syncing state:', error);
      addHistoryEntry('error', 'Kayıt sırasında hata', { error: error.message });
      // Don't fail - the iframe was already updated
      return true;
    }
  };

  const handleViewCodeFromHistory = (entry) => {
    // entry.details.code contains the saved HTML snippet
    setIsolatedElementCode({
      code: entry.details.code,
      originalHTML: entry.details.code,
      tagName: entry.details.tag || 'element',
      id: entry.details.id || '',
      className: entry.details.className || '',
    });
    setActiveTab(TABS.CODE);
    addHistoryEntry('info', 'Geçmiş kod görüntüleniyor', { fromEntry: entry.message });
  };

  const handleViewChange = () => {
    console.log('👁️ View change clicked, lastEditedElement:', lastEditedElement);
    setShowViewChangeButton(false);
    if (viewChangeBtnTimerRef.current) clearTimeout(viewChangeBtnTimerRef.current);

    setActiveTab(TABS.EDIT);

    setTimeout(() => {
      const iframe = document.querySelector('iframe[title="Theme Canvas"]') ||
                     document.querySelector('iframe:not([sandbox])');
      if (!iframe?.contentDocument) {
        console.warn('⚠️ Iframe not found for View Change');
        return;
      }

      const doc = iframe.contentDocument;
      let targetEl = null;

      if (lastEditedElement?.id) {
        targetEl = doc.getElementById(lastEditedElement.id);
      } else if (lastEditedElement?.className && typeof lastEditedElement.className === 'string') {
        const cls = lastEditedElement.className.trim().split(/\s+/)[0];
        if (cls) targetEl = doc.querySelector('.' + cls);
      }

      if (!targetEl) {
        console.warn('⚠️ Could not find edited element in canvas');
        addHistoryEntry('warning', 'Düzenlenen element bulunamadı');
        return;
      }

      console.log('✅ Scrolling to element:', targetEl.tagName);
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

      // Pulsing green highlight
      const origOutline = targetEl.style.outline;
      const origOffset  = targetEl.style.outlineOffset;
      const origShadow  = targetEl.style.boxShadow;
      const origTrans   = targetEl.style.transition;

      targetEl.style.transition   = 'all 0.3s ease';
      targetEl.style.outline      = '4px solid #10b981';
      targetEl.style.outlineOffset = '4px';
      targetEl.style.boxShadow    = '0 0 0 8px rgba(16,185,129,0.2)';

      let pulses = 0;
      const pulse = setInterval(() => {
        pulses++;
        targetEl.style.outlineWidth  = pulses % 2 === 0 ? '4px' : '6px';
        targetEl.style.outlineOffset = pulses % 2 === 0 ? '4px' : '2px';
        if (pulses >= 6) {
          clearInterval(pulse);
          setTimeout(() => {
            targetEl.style.outline      = origOutline;
            targetEl.style.outlineOffset = origOffset;
            targetEl.style.boxShadow    = origShadow;
            targetEl.style.transition   = origTrans;
          }, 300);
        }
      }, 400);

      // Trigger click to select element in properties panel
      setTimeout(() => {
        targetEl.click();
        addHistoryEntry('info', 'Düzenlenen elemente gidildi', { tag: lastEditedElement?.tagName, id: lastEditedElement?.id });
      }, 800);

    }, 400);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#1e1e1e', color: '#d1d5db', overflow: 'hidden', marginRight: isAIPanelOpen ? '400px' : '0', transition: 'margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes gentle-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes pulse-highlight {
          0%, 100% { outline-color: #10b981; outline-width: 3px; }
          50%       { outline-color: #34d399; outline-width: 6px; }
        }
      `}</style>

      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSave={handleSave}
        onExport={handleExport}
        onOpenThemeStore={() => setIsThemeStoreOpen(true)}
        onOpenPlugins={() => setShowPlugins(true)}
        onOpenAIPanel={() => setIsAIPanelOpen(p => !p)}
        isAIPanelOpen={isAIPanelOpen}
        onOpenToolbox={() => setShowAdvancedToolbox(p => !p)}
        isToolboxOpen={showAdvancedToolbox}
        editorMode={editorMode}
        onNewProject={handleNewProject}
        editHistory={editHistory}
        showViewChangeButton={showViewChangeButton}
        onViewChange={handleViewChange}
        onUndo={handleMainUndo}
        onRedo={handleMainRedo}
        canUndo={themeHistoryIndex > 0}
        canRedo={themeHistoryIndex < themeHistory.length - 1}
      />

      {/* Craft.js Editor - only shown on EDIT tab in craft mode */}
      {activeTab === TABS.EDIT && editorMode === 'craft' && (
        <CraftEditor resolver={{ Box, Text, Button, Container, Image }}><CraftEditorContent /></CraftEditor>
      )}

      {/* GrapesJS Editor - ALWAYS rendered when in grapes mode (hidden when not on EDIT tab) */}
      {/* This keeps the iframe in DOM so CodePanel can access it */}
      {editorMode === 'grapes' && (
        <div style={{
          flex: 1,
          display: activeTab === TABS.EDIT ? 'flex' : 'none',
          overflow: 'hidden',
          height: '100%',
          minHeight: 0
        }}>
          <GrapesJSEditor
            themeHTML={themeHTML}
            onHTMLChange={handleThemeHTMLChange}
            onJumpToCode={handleJumpToCode}
            onHistoryEntry={addHistoryEntry}
          />
        </div>
      )}

      {activeTab === TABS.PREVIEW && (
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <PreviewPanel editorMode={editorMode} themeHTML={themeHTML} />
        </div>
      )}

      {activeTab === TABS.CODE && (
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <CodePanel
            editorMode={editorMode}
            themeHTML={themeHTML}
            onCodeChange={handleCodeChange}
            highlightedCode={highlightedCode}
            onHighlightClear={() => setHighlightedCode(null)}
            isolatedElementCode={isolatedElementCode}
            onClearIsolated={() => setIsolatedElementCode(null)}
            onSaveIsolatedCode={handleSaveIsolatedCode}
            onSwitchToEdit={() => setActiveTab(TABS.EDIT)}
            onHistoryEntry={addHistoryEntry}
          />
        </div>
      )}

      {activeTab === TABS.HISTORY && (
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <HistoryTab history={editHistory} onClear={() => setEditHistory([])} onViewCode={handleViewCodeFromHistory} />
        </div>
      )}

      {activeTab === TABS.TERMINAL && (
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <TerminalTab />
        </div>
      )}

      {isThemeStoreOpen && <ThemeStore isOpen={isThemeStoreOpen} onClose={() => setIsThemeStoreOpen(false)} onSelect={handleThemeSelect} />}
      <PluginManager
        isOpen={showPlugins}
        onClose={() => setShowPlugins(false)}
        editor={{ setThemeHTML, themeHTML, setEditorMode }}
      />
      <AIAssistantPanel
        isOpen={isAIPanelOpen}
        onToggle={() => setIsAIPanelOpen(p => !p)}
        onApplyCode={handleAIApplyCode}
      />

      {/* ── Advanced Toolbox Modal ─────────────────────────────── */}
      {showAdvancedToolbox && (
        <div
          onClick={() => setShowAdvancedToolbox(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 10500,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '92%', maxWidth: '960px', height: '82vh',
              background: '#1f2937',
              borderRadius: '16px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
              border: '1px solid #374151',
            }}
          >
            {/* Modal header */}
            <div style={{
              padding: '16px 24px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <div>
                <h2 style={{ margin: 0, color: 'white', fontSize: '18px', fontWeight: 700 }}>
                  🧰 Araç Kutusu
                </h2>
                <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                  Bir bileşene tıklayarak sayfaya ekleyin
                </p>
              </div>
              <button
                onClick={() => setShowAdvancedToolbox(false)}
                style={{
                  width: '32px', height: '32px',
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none', borderRadius: '8px',
                  color: 'white', fontSize: '18px',
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>

            {/* Toolbox content */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <AdvancedToolbox
                onAddComponent={(html) => {
                  handleAIApplyCode(html, 'snippet');
                  setShowAdvancedToolbox(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;
