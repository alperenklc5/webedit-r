import React, { useState } from 'react';

const SeoPlugin = ({ editor, onClose }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const analyzeSEO = () => {
    setAnalyzing(true);

    const html = editor?.themeHTML || '';
    if (!html) {
      alert('Analiz için önce bir tema yükleyin!');
      setAnalyzing(false);
      return;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const checks = {
      meta: { score: 0, issues: [], passed: [] },
      content: { score: 0, issues: [], passed: [] },
      images: { score: 0, issues: [], passed: [] },
      links: { score: 0, issues: [], passed: [] },
      structure: { score: 0, issues: [], passed: [] },
      performance: { score: 0, issues: [], passed: [] },
    };

    // 1. META TAGS (25 points)
    const title = doc.querySelector('title');
    const metaDesc = doc.querySelector('meta[name="description"]');
    const metaKeywords = doc.querySelector('meta[name="keywords"]');
    const ogTitle = doc.querySelector('meta[property="og:title"]');
    const ogDesc = doc.querySelector('meta[property="og:description"]');
    const ogImage = doc.querySelector('meta[property="og:image"]');

    if (title && title.textContent.length >= 30 && title.textContent.length <= 60) {
      checks.meta.score += 5;
      checks.meta.passed.push('✅ Title uzunluğu optimal (30-60 karakter)');
    } else if (title) {
      checks.meta.issues.push(`⚠️ Title ${title.textContent.length < 30 ? 'çok kısa' : 'çok uzun'} (${title.textContent.length} karakter)`);
    } else {
      checks.meta.issues.push('❌ Title tag bulunamadı');
    }

    if (metaDesc) {
      const descLength = metaDesc.getAttribute('content')?.length || 0;
      if (descLength >= 120 && descLength <= 160) {
        checks.meta.score += 5;
        checks.meta.passed.push('✅ Meta description optimal (120-160 karakter)');
      } else {
        checks.meta.issues.push(`⚠️ Meta description ${descLength < 120 ? 'kısa' : 'uzun'} (${descLength} karakter)`);
        checks.meta.score += 2;
      }
    } else {
      checks.meta.issues.push('❌ Meta description bulunamadı');
    }

    if (metaKeywords) {
      checks.meta.score += 3;
      checks.meta.passed.push('✅ Meta keywords tanımlı');
    } else {
      checks.meta.issues.push('⚠️ Meta keywords eksik');
    }

    if (ogTitle && ogDesc && ogImage) {
      checks.meta.score += 7;
      checks.meta.passed.push('✅ Open Graph tags tam');
    } else {
      checks.meta.score += (ogTitle ? 2 : 0) + (ogDesc ? 2 : 0) + (ogImage ? 1 : 0);
      checks.meta.issues.push('⚠️ Open Graph tags eksik (sosyal medya paylaşımı için önemli)');
    }

    if (doc.querySelector('link[rel="canonical"]')) {
      checks.meta.score += 5;
      checks.meta.passed.push('✅ Canonical URL tanımlı');
    } else {
      checks.meta.issues.push('⚠️ Canonical URL eksik');
    }

    // 2. CONTENT (20 points)
    const h1Tags = doc.querySelectorAll('h1');
    const h2Tags = doc.querySelectorAll('h2');
    const paragraphs = doc.querySelectorAll('p');
    const wordCount = Array.from(paragraphs)
      .map(p => p.textContent.trim().split(/\s+/).filter(Boolean).length)
      .reduce((sum, count) => sum + count, 0);

    if (h1Tags.length === 1) {
      checks.content.score += 5;
      checks.content.passed.push('✅ Tek H1 tag (optimal)');
    } else if (h1Tags.length === 0) {
      checks.content.issues.push('❌ H1 tag bulunamadı');
    } else {
      checks.content.issues.push(`⚠️ Birden fazla H1 tag (${h1Tags.length} adet)`);
      checks.content.score += 2;
    }

    if (h2Tags.length >= 2) {
      checks.content.score += 5;
      checks.content.passed.push(`✅ H2 tags kullanılıyor (${h2Tags.length} adet)`);
    } else {
      checks.content.issues.push('⚠️ H2 tags yetersiz (içerik yapısı için önemli)');
    }

    if (wordCount >= 300) {
      checks.content.score += 5;
      checks.content.passed.push(`✅ Yeterli içerik (${wordCount} kelime)`);
    } else {
      checks.content.issues.push(`⚠️ İçerik kısa (${wordCount} kelime, min. 300 önerilir)`);
    }

    const strongTags = doc.querySelectorAll('strong, b');
    const emTags = doc.querySelectorAll('em, i');
    if (strongTags.length > 0 || emTags.length > 0) {
      checks.content.score += 5;
      checks.content.passed.push('✅ Vurgu etiketleri kullanılıyor');
    } else {
      checks.content.issues.push('⚠️ Vurgu etiketleri eksik (önemli kelimeleri vurgulayın)');
    }

    // 3. IMAGES (15 points)
    const images = doc.querySelectorAll('img');
    let imagesWithAlt = 0;
    let imagesWithTitle = 0;

    images.forEach(img => {
      if (img.alt && img.alt.trim()) imagesWithAlt++;
      if (img.title) imagesWithTitle++;
    });

    if (images.length === 0) {
      checks.images.score += 15;
      checks.images.passed.push('ℹ️ Görsel kullanılmamış');
    } else {
      const altPercentage = (imagesWithAlt / images.length) * 100;

      if (altPercentage === 100) {
        checks.images.score += 10;
        checks.images.passed.push(`✅ Tüm görsellerde alt text var (${images.length}/${images.length})`);
      } else if (altPercentage >= 80) {
        checks.images.score += 7;
        // Still flag missing alts even though most are present
        checks.images.issues.push(`⚠️ ${images.length - imagesWithAlt} görselde alt text eksik`);
      } else if (altPercentage >= 50) {
        checks.images.score += 4;
        checks.images.issues.push(`⚠️ ${images.length - imagesWithAlt}/${images.length} görselde alt text eksik`);
      } else {
        checks.images.score += Math.max(0, Math.floor(altPercentage / 20));
        checks.images.issues.push(`❌ ${images.length - imagesWithAlt}/${images.length} görselde alt text eksik`);
      }

      if (imagesWithTitle >= images.length * 0.5) {
        checks.images.score += 5;
        checks.images.passed.push('✅ Görsellerde title attribute kullanılıyor');
      } else {
        checks.images.issues.push('⚠️ Görsel title attribute\'ları eksik');
      }
    }

    // 4. LINKS (15 points)
    const allLinks = doc.querySelectorAll('a');
    const internalLinks = Array.from(allLinks).filter(a => {
      const href = a.getAttribute('href');
      return href && (href.startsWith('/') || href.startsWith('#'));
    });
    const externalLinks = allLinks.length - internalLinks.length;

    if (internalLinks.length >= 3) {
      checks.links.score += 7;
      checks.links.passed.push(`✅ İyi internal link yapısı (${internalLinks.length} adet)`);
    } else if (internalLinks.length > 0) {
      checks.links.issues.push(`⚠️ Daha fazla internal link ekleyin (${internalLinks.length}/3)`);
      checks.links.score += 3;
    } else {
      checks.links.issues.push('❌ Internal link yok');
    }

    if (externalLinks >= 2 && externalLinks <= 10) {
      checks.links.score += 5;
      checks.links.passed.push(`✅ Dengeli external link (${externalLinks} adet)`);
    } else if (externalLinks === 0) {
      checks.links.issues.push('⚠️ External link yok (kaynak ekleyin)');
    } else if (externalLinks > 10) {
      checks.links.issues.push(`⚠️ Çok fazla external link (${externalLinks} adet)`);
      checks.links.score += 2;
    }

    const brokenLinks = Array.from(allLinks).filter(a => {
      const href = a.getAttribute('href');
      return !href || href === '#' || href === 'javascript:void(0)';
    }).length;

    if (brokenLinks === 0) {
      checks.links.score += 3;
      checks.links.passed.push('✅ Kırık link yok');
    } else {
      checks.links.issues.push(`❌ ${brokenLinks} kırık/boş link bulundu`);
    }

    // 5. STRUCTURE (15 points)
    const viewport = doc.querySelector('meta[name="viewport"]');
    const charset = doc.querySelector('meta[charset]');
    const favicon = doc.querySelector('link[rel*="icon"]');

    if (viewport) {
      checks.structure.score += 5;
      checks.structure.passed.push('✅ Viewport meta tag var (mobil uyumlu)');
    } else {
      checks.structure.issues.push('❌ Viewport meta tag eksik');
    }

    if (charset) {
      checks.structure.score += 3;
      checks.structure.passed.push('✅ Charset tanımlı');
    } else {
      checks.structure.issues.push('⚠️ Charset tanımı eksik');
    }

    if (favicon) {
      checks.structure.score += 2;
      checks.structure.passed.push('✅ Favicon var');
    } else {
      checks.structure.issues.push('⚠️ Favicon eksik');
    }

    const robots = doc.querySelector('meta[name="robots"]');
    if (robots) {
      checks.structure.score += 3;
      checks.structure.passed.push('✅ Robots meta tag tanımlı');
    } else {
      checks.structure.issues.push('⚠️ Robots meta tag eksik');
    }

    if (doc.querySelector('script[type="application/ld+json"]')) {
      checks.structure.score += 2;
      checks.structure.passed.push('✅ Schema.org markup var');
    } else {
      checks.structure.issues.push('⚠️ Structured data (Schema.org) eksik');
    }

    // 6. PERFORMANCE (10 points)
    const scripts = doc.querySelectorAll('script');
    const styles = doc.querySelectorAll('style, link[rel="stylesheet"]');
    const inlineStyles = doc.querySelectorAll('[style]');

    if (scripts.length <= 5) {
      checks.performance.score += 4;
      checks.performance.passed.push('✅ Script sayısı optimal');
    } else {
      checks.performance.issues.push(`⚠️ Çok fazla script (${scripts.length} adet)`);
    }

    if (styles.length <= 3) {
      checks.performance.score += 3;
      checks.performance.passed.push('✅ CSS dosya sayısı optimal');
    } else {
      checks.performance.issues.push(`⚠️ Çok fazla CSS dosyası (${styles.length} adet)`);
      checks.performance.score += 1;
    }

    if (inlineStyles.length <= 10) {
      checks.performance.score += 3;
      checks.performance.passed.push('✅ Inline style kullanımı düşük');
    } else {
      checks.performance.issues.push(`⚠️ Çok fazla inline style (${inlineStyles.length} adet)`);
    }

    const totalScore =
      checks.meta.score +
      checks.content.score +
      checks.images.score +
      checks.links.score +
      checks.structure.score +
      checks.performance.score;

    setAnalysis({
      score: totalScore,
      checks,
      summary: {
        passed: Object.values(checks).reduce((sum, c) => sum + c.passed.length, 0),
        issues: Object.values(checks).reduce((sum, c) => sum + c.issues.length, 0),
      },
    });

    setAnalyzing(false);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Mükemmel';
    if (score >= 80) return 'İyi';
    if (score >= 60) return 'Orta';
    if (score >= 40) return 'Zayıf';
    return 'Kötü';
  };

  const categoryMeta = {
    meta:        { label: '📄 Meta Tags',   max: 25 },
    content:     { label: '📝 İçerik',      max: 20 },
    images:      { label: '🖼️ Görseller',   max: 15 },
    links:       { label: '🔗 Linkler',     max: 15 },
    structure:   { label: '🏗️ Yapı',        max: 15 },
    performance: { label: '⚡ Performans',  max: 10 },
  };

  return (
    <div style={{ color: 'white' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        padding: '24px',
        borderRadius: '12px',
        marginBottom: '24px',
      }}>
        <div
          style={{ width: '48px', height: '48px', marginBottom: '12px' }}
          dangerouslySetInnerHTML={{
            __html: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="white"/>
              <path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z" fill="white"/>
            </svg>`,
          }}
        />
        <h3 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>SEO Analiz</h3>
        <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
          Temanızın SEO performansını detaylı analiz edin
        </p>
      </div>

      {/* Analyze button (idle) */}
      {!analysis && !analyzing && (
        <button
          onClick={analyzeSEO}
          style={{
            width: '100%',
            padding: '16px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          🔍 Analizi Başlat
        </button>
      )}

      {/* Loading */}
      {analyzing && (
        <div style={{
          background: '#374151',
          padding: '40px',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <p style={{ margin: 0, fontSize: '16px' }}>SEO analizi yapılıyor...</p>
        </div>
      )}

      {/* Results */}
      {analysis && (
        <div>
          {/* Score card */}
          <div style={{
            background: '#374151',
            padding: '32px',
            borderRadius: '12px',
            marginBottom: '24px',
            textAlign: 'center',
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              margin: '0 auto 20px',
              borderRadius: '50%',
              border: `8px solid ${getScoreColor(analysis.score)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}>
              <div style={{ fontSize: '36px', fontWeight: '700', color: getScoreColor(analysis.score) }}>
                {analysis.score}
              </div>
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>/ 100</div>
            </div>

            <h4 style={{ margin: '0 0 8px 0', fontSize: '24px', color: getScoreColor(analysis.score) }}>
              {getScoreLabel(analysis.score)}
            </h4>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '20px' }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
                  {analysis.summary.passed}
                </div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Başarılı</div>
              </div>
              <div style={{ width: '1px', background: '#4b5563' }} />
              <div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>
                  {analysis.summary.issues}
                </div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Sorun</div>
              </div>
            </div>
          </div>

          {/* Category breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.entries(analysis.checks).map(([category, data]) => (
              <div
                key={category}
                style={{ background: '#374151', padding: '20px', borderRadius: '12px' }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                }}>
                  <h5 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                    {categoryMeta[category].label}
                  </h5>
                  <div style={{
                    padding: '4px 12px',
                    background: getScoreColor(Math.round((data.score / categoryMeta[category].max) * 100)),
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: '600',
                  }}>
                    {data.score}/{categoryMeta[category].max}
                  </div>
                </div>

                {data.passed.map((item, i) => (
                  <div key={i} style={{
                    padding: '8px 12px',
                    background: '#1f2937',
                    borderRadius: '6px',
                    marginBottom: '4px',
                    fontSize: '13px',
                    color: '#d1fae5',
                  }}>
                    {item}
                  </div>
                ))}

                {data.issues.map((item, i) => (
                  <div key={i} style={{
                    padding: '8px 12px',
                    background: '#1f2937',
                    borderRadius: '6px',
                    marginBottom: '4px',
                    fontSize: '13px',
                    color: '#fecaca',
                  }}>
                    {item}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Re-analyze button */}
          <button
            onClick={() => setAnalysis(null)}
            style={{
              width: '100%',
              marginTop: '24px',
              padding: '12px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            🔄 Yeni Analiz
          </button>
        </div>
      )}
    </div>
  );
};

export default SeoPlugin;
