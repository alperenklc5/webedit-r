import { useState, useEffect, useCallback } from 'react';
import './SeoPlugin.css';

const SeoPlugin = ({ isOpen, onClose, editor, onAutoFix }) => {
  const [analysis, setAnalysis] = useState(null);
  const [score, setScore] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeSeo = useCallback(() => {
    if (!editor) {
      console.error('[SEO] Editor instance not available');
      return;
    }

    setIsAnalyzing(true);
    console.log('[SEO] Starting SEO analysis...');

    try {
      // Get HTML content from GrapesJS
      const html = editor.getHtml();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Initialize checks
      const checks = [];
      let passedChecks = 0;
      let totalChecks = 0;

      // Check 1: H1 tag exists
      totalChecks++;
      const h1Tags = doc.querySelectorAll('h1');
      if (h1Tags.length > 0) {
        checks.push({
          id: 'h1_exists',
          name: 'H1 Başlığı',
          status: 'passed',
          message: `${h1Tags.length} adet H1 etiketi bulundu`,
          icon: '✓'
        });
        passedChecks++;
      } else {
        checks.push({
          id: 'h1_exists',
          name: 'H1 Başlığı',
          status: 'failed',
          message: 'H1 etiketi bulunamadı - SEO için kritik öneme sahiptir',
          icon: '✗'
        });
      }

      // Check 2: Too many H1 tags
      totalChecks++;
      if (h1Tags.length === 1) {
        checks.push({
          id: 'h1_single',
          name: 'Tek H1 Etiketi',
          status: 'passed',
          message: 'Sayfada yalnızca bir H1 etiketi var (ideal durum)',
          icon: '✓'
        });
        passedChecks++;
      } else if (h1Tags.length > 1) {
        checks.push({
          id: 'h1_single',
          name: 'Tek H1 Etiketi',
          status: 'warning',
          message: `${h1Tags.length} adet H1 etiketi var - yalnızca bir tane önerilir`,
          icon: '!'
        });
        passedChecks++; // Partial pass
      }

      // Check 3: Images have alt attributes
      totalChecks++;
      const images = doc.querySelectorAll('img');
      const imagesWithAlt = Array.from(images).filter(img => img.hasAttribute('alt') && img.getAttribute('alt').trim() !== '');
      const imagesWithoutAlt = images.length - imagesWithAlt.length;
      
      if (images.length === 0) {
        checks.push({
          id: 'images_alt',
          name: 'Resim Alt Metinleri',
          status: 'passed',
          message: 'Sayfada resim bulunmuyor',
          icon: '✓'
        });
        passedChecks++;
      } else if (imagesWithoutAlt === 0) {
        checks.push({
          id: 'images_alt',
          name: 'Resim Alt Metinleri',
          status: 'passed',
          message: `Tüm ${images.length} resimde alt metin var`,
          icon: '✓'
        });
        passedChecks++;
      } else {
        checks.push({
          id: 'images_alt',
          name: 'Resim Alt Metinleri',
          status: 'warning',
          message: `${imagesWithoutAlt}/${images.length} resimde alt metin eksik`,
          icon: '!'
        });
      }

      // Check 4: Text content length
      totalChecks++;
      const bodyText = doc.body?.textContent || '';
      const wordCount = bodyText.trim().split(/\s+/).filter(word => word.length > 0).length;
      
      if (wordCount >= 300) {
        checks.push({
          id: 'content_length',
          name: 'İçerik Uzunluğu',
          status: 'passed',
          message: `${wordCount} kelime - yeterli içerik (300+ kelime önerilir)`,
          icon: '✓'
        });
        passedChecks++;
      } else if (wordCount >= 150) {
        checks.push({
          id: 'content_length',
          name: 'İçerik Uzunluğu',
          status: 'warning',
          message: `${wordCount} kelime - orta düzey içerik (300+ kelime önerilir)`,
          icon: '!'
        });
        passedChecks++; // Partial
      } else {
        checks.push({
          id: 'content_length',
          name: 'İçerik Uzunluğu',
          status: 'failed',
          message: `${wordCount} kelime - çok kısa içerik (300+ kelime önerilir)`,
          icon: '✗'
        });
      }

      // Check 5: Meta description (in head)
      totalChecks++;
      const metaDesc = doc.querySelector('meta[name="description"]');
      if (metaDesc && metaDesc.getAttribute('content')) {
        const descLength = metaDesc.getAttribute('content').length;
        if (descLength >= 50 && descLength <= 160) {
          checks.push({
            id: 'meta_desc',
            name: 'Meta Açıklama',
            status: 'passed',
            message: `Meta açıklama mevcut (${descLength} karakter - ideal aralıkta)`,
            icon: '✓'
          });
          passedChecks++;
        } else {
          checks.push({
            id: 'meta_desc',
            name: 'Meta Açıklama',
            status: 'warning',
            message: `Meta açıklama mevcut ama uzunluğu ideal değil (${descLength} karakter)`,
            icon: '!'
          });
          passedChecks++; // Partial
        }
      } else {
        checks.push({
          id: 'meta_desc',
          name: 'Meta Açıklama',
          status: 'failed',
          message: 'Meta açıklama eksik - arama motorları için önemli',
          icon: '✗'
        });
      }

      // Check 6: Title tag
      totalChecks++;
      const titleTag = doc.querySelector('title');
      if (titleTag && titleTag.textContent && titleTag.textContent.trim().length > 0) {
        const titleLength = titleTag.textContent.trim().length;
        if (titleLength >= 30 && titleLength <= 60) {
          checks.push({
            id: 'title_tag',
            name: 'Sayfa Başlığı',
            status: 'passed',
            message: `Başlık mevcut (${titleLength} karakter - ideal aralıkta)`,
            icon: '✓'
          });
          passedChecks++;
        } else {
          checks.push({
            id: 'title_tag',
            name: 'Sayfa Başlığı',
            status: 'warning',
            message: `Başlık mevcut ama uzunluğu ideal değil (${titleLength} karakter)`,
            icon: '!'
          });
          passedChecks++; // Partial
        }
      } else {
        checks.push({
          id: 'title_tag',
          name: 'Sayfa Başlığı',
          status: 'failed',
          message: 'Sayfa başlığı eksik',
          icon: '✗'
        });
      }

      // Check 7: Heading hierarchy (H1 -> H2 -> H3)
      totalChecks++;
      const allHeadings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let hasProperHierarchy = true;
      let prevLevel = 0;
      
      for (const heading of allHeadings) {
        const level = parseInt(heading.tagName[1]);
        if (level > prevLevel + 1 && prevLevel !== 0) {
          hasProperHierarchy = false;
          break;
        }
        prevLevel = level;
      }
      
      if (allHeadings.length === 0) {
        checks.push({
          id: 'heading_hierarchy',
          name: 'Başlık Hiyerarşisi',
          status: 'warning',
          message: 'Sayfada hiç başlık etiketi yok',
          icon: '!'
        });
      } else if (hasProperHierarchy) {
        checks.push({
          id: 'heading_hierarchy',
          name: 'Başlık Hiyerarşisi',
          status: 'passed',
          message: `${allHeadings.length} başlık etiketi - düzenli hiyerarşi`,
          icon: '✓'
        });
        passedChecks++;
      } else {
        checks.push({
          id: 'heading_hierarchy',
          name: 'Başlık Hiyerarşisi',
          status: 'warning',
          message: 'Başlık hiyerarşisinde atlama var (örn: H1 -> H3)',
          icon: '!'
        });
      }

      // Check 8: Links with anchor text
      totalChecks++;
      const links = doc.querySelectorAll('a');
      const linksWithText = Array.from(links).filter(a => a.textContent && a.textContent.trim().length > 0);
      
      if (links.length === 0) {
        checks.push({
          id: 'links_text',
          name: 'Bağlantı Metinleri',
          status: 'warning',
          message: 'Sayfada bağlantı bulunmuyor',
          icon: '!'
        });
      } else {
        const linksWithoutText = links.length - linksWithText.length;
        if (linksWithoutText === 0) {
          checks.push({
            id: 'links_text',
            name: 'Bağlantı Metinleri',
            status: 'passed',
            message: `Tüm ${links.length} bağlantıda metin var`,
            icon: '✓'
          });
          passedChecks++;
        } else {
          checks.push({
            id: 'links_text',
            name: 'Bağlantı Metinleri',
            status: 'warning',
            message: `${linksWithoutText}/${links.length} bağlantıda metin eksik (resim bağlantıları olabilir)`,
            icon: '!'
          });
        }
      }

      // Calculate score
      const calculatedScore = Math.round((passedChecks / totalChecks) * 100);
      
      setScore(calculatedScore);
      setAnalysis(checks);
      console.log(`[SEO] Analysis complete. Score: ${calculatedScore}/100`);
      
    } catch (error) {
      console.error('[SEO] Error during analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [editor]);

  // Generate SEO fix prompt from failed/warning checks
  const generateSeoPrompt = () => {
    if (!analysis || analysis.length === 0) return null;

    const failedAndWarnings = analysis.filter(
      check => check.status === 'failed' || check.status === 'warning'
    );

    if (failedAndWarnings.length === 0) return null;

    const fixes = failedAndWarnings.map(check => {
      switch (check.id) {
        case 'h1_exists':
          return 'Add exactly one H1 heading tag with a descriptive title';
        case 'h1_single':
          return 'Ensure only one H1 tag exists on the page';
        case 'images_alt':
          return 'Add descriptive alt attributes to all images';
        case 'content_length':
          return 'Add more text content (minimum 300 words) for better SEO';
        case 'meta_desc':
          return 'Add a meta description between 50-160 characters';
        case 'title_tag':
          return 'Add a page title between 30-60 characters';
        case 'heading_hierarchy':
          return 'Fix heading hierarchy (H1 -> H2 -> H3, no skipping levels)';
        case 'links_text':
          return 'Ensure all links have descriptive anchor text';
        default:
          return check.message;
      }
    });

    return `Fix the following SEO issues:\n${fixes.join('\n')}`;
  };

  // Handle AI Auto-Fix button click
  const handleAutoFix = () => {
    if (onAutoFix) {
      onAutoFix();
    }
  };

  const hasIssues = analysis?.some(check => check.status === 'failed' || check.status === 'warning');

  // Auto-analyze when plugin opens
  useEffect(() => {
    if (isOpen && editor) {
      analyzeSeo();
    }
  }, [isOpen, editor, analyzeSeo]);

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'İyi SEO';
    if (score >= 60) return 'Orta SEO';
    return 'Geliştirilmeli';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed': return '✓';
      case 'warning': return '!';
      case 'failed': return '✗';
      default: return '?';
    }
  };

  const getStatusClass = (status) => {
    return `status-${status}`;
  };

  if (!isOpen) return null;

  return (
    <div className="seo-plugin-overlay" onClick={onClose}>
      <div className="seo-plugin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="seo-plugin-header">
          <div className="seo-plugin-title">
            <span className="header-icon">📊</span>
            <div>
              <h2>SEO Analizi</h2>
              <p>Sayfanızın arama motoru optimizasyonunu kontrol edin</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="seo-plugin-content">
          {/* Score Card */}
          <div className="score-card">
            <div 
              className="score-circle"
              style={{ 
                borderColor: getScoreColor(score),
                boxShadow: `0 0 20px ${getScoreColor(score)}40`
              }}
            >
              <span className="score-value" style={{ color: getScoreColor(score) }}>
                {score}
              </span>
              <span className="score-label" style={{ color: getScoreColor(score) }}>
                {getScoreLabel(score)}
              </span>
            </div>
          </div>

          {/* Analyze Button */}
          <button 
            className="analyze-button"
            onClick={analyzeSeo}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <span className="spinner">⟳</span>
                Analiz Ediliyor...
              </>
            ) : (
              <>
                <span>🔄</span>
                Analizi Yenile
              </>
            )}
          </button>

          {/* AI Auto-Fix Button */}
          {hasIssues && onAutoFix && (
            <button
              className="fix-button"
              onClick={handleAutoFix}
            >
              <span>✨</span>
              AI ile Otomatik Düzelt
            </button>
          )}

          {/* Analysis Results */}
          {analysis && (
            <div className="analysis-results">
              <h3 className="results-title">Analiz Sonuçları</h3>
              <div className="checks-list">
                {analysis.map((check, index) => (
                  <div key={check.id} className={`check-item ${getStatusClass(check.status)}`}>
                    <div className="check-icon">{getStatusIcon(check.status)}</div>
                    <div className="check-content">
                      <div className="check-name">{check.name}</div>
                      <div className="check-message">{check.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="seo-tips">
            <h4>💡 SEO İpuçları</h4>
            <ul>
              <li>H1 etiketi sayfa için bir kez kullanılmalı</li>
              <li>Her resim için anlamlı alt metin ekleyin</li>
              <li>İçerik en az 300 kelime olmalı</li>
              <li>Meta açıklama 50-160 karakter arasında olmalı</li>
              <li>Başlık etiketi 30-60 karakter arasında olmalı</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeoPlugin;
