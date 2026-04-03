import { useState, useEffect, useRef } from 'react';
import './UnsplashPlugin.css';

// Static MOCK_IMAGES map with reliable direct URLs
const MOCK_IMAGES = {
  office: [
    { id: 'office-1', url: 'https://images.pexels.com/photos/1170412/pexels-photo-1170412.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/1170412/pexels-photo-1170412.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Modern office workspace', author: 'Pexels' },
    { id: 'office-2', url: 'https://images.pexels.com/photos/260689/pexels-photo-260689.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/260689/pexels-photo-260689.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Office meeting room', author: 'Pexels' },
    { id: 'office-3', url: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Open plan office', author: 'Pexels' },
    { id: 'office-4', url: 'https://images.pexels.com/photos/1595385/pexels-photo-1595385.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/1595385/pexels-photo-1595385.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Office desk setup', author: 'Pexels' },
    { id: 'office-5', url: 'https://images.pexels.com/photos/1957474/pexels-photo-1957474.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/1957474/pexels-photo-1957474.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Modern office interior', author: 'Pexels' },
    { id: 'office-6', url: 'https://images.pexels.com/photos/2452195/pexels-photo-2452195.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/2452195/pexels-photo-2452195.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Corporate office', author: 'Pexels' },
  ],
  tech: [
    { id: 'tech-1', url: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Code on screen', author: 'Pexels' },
    { id: 'tech-2', url: 'https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Technology workspace', author: 'Pexels' },
    { id: 'tech-3', url: 'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Computer setup', author: 'Pexels' },
    { id: 'tech-4', url: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Programming', author: 'Pexels' },
    { id: 'tech-5', url: 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Developer workspace', author: 'Pexels' },
    { id: 'tech-6', url: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Tech gadgets', author: 'Pexels' },
  ],
  nature: [
    { id: 'nature-1', url: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Mountain landscape', author: 'Pexels' },
    { id: 'nature-2', url: 'https://images.pexels.com/photos/15286/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/15286/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400', alt: 'Forest path', author: 'Pexels' },
    { id: 'nature-3', url: 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Ocean waves', author: 'Pexels' },
    { id: 'nature-4', url: 'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Lake reflection', author: 'Pexels' },
    { id: 'nature-5', url: 'https://images.pexels.com/photos/3244513/pexels-photo-3244513.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/3244513/pexels-photo-3244513.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Desert landscape', author: 'Pexels' },
    { id: 'nature-6', url: 'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Autumn forest', author: 'Pexels' },
  ],
  ağaç: [
    { id: 'tree-1', url: 'https://images.pexels.com/photos/1632790/pexels-photo-1632790.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/1632790/pexels-photo-1632790.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Single tree', author: 'Pexels' },
    { id: 'tree-2', url: 'https://images.pexels.com/photos/1182825/pexels-photo-1182825.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/1182825/pexels-photo-1182825.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Pine trees', author: 'Pexels' },
    { id: 'tree-3', url: 'https://images.pexels.com/photos/1547813/pexels-photo-1547813.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/1547813/pexels-photo-1547813.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Tree in field', author: 'Pexels' },
    { id: 'tree-4', url: 'https://images.pexels.com/photos/1631000/pexels-photo-1631000.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/1631000/pexels-photo-1631000.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Oak tree', author: 'Pexels' },
    { id: 'tree-5', url: 'https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Forest trees', author: 'Pexels' },
    { id: 'tree-6', url: 'https://images.pexels.com/photos/38136/pexels-photo-38136.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/38136/pexels-photo-38136.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Tree silhouette', author: 'Pexels' },
  ],
  business: [
    { id: 'business-1', url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Business meeting', author: 'Pexels' },
    { id: 'business-2', url: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Team collaboration', author: 'Pexels' },
    { id: 'business-3', url: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Business handshake', author: 'Pexels' },
    { id: 'business-4', url: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Office presentation', author: 'Pexels' },
    { id: 'business-5', url: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Business team', author: 'Pexels' },
    { id: 'business-6', url: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Corporate meeting', author: 'Pexels' },
  ],
  abstract: [
    { id: 'abstract-1', url: 'https://images.pexels.com/photos/19670/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/19670/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400', alt: 'Abstract colors', author: 'Pexels' },
    { id: 'abstract-2', url: 'https://images.pexels.com/photos/1939485/pexels-photo-1939485.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/1939485/pexels-photo-1939485.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Abstract texture', author: 'Pexels' },
    { id: 'abstract-3', url: 'https://images.pexels.com/photos/1616403/pexels-photo-1616403.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/1616403/pexels-photo-1616403.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Abstract pattern', author: 'Pexels' },
    { id: 'abstract-4', url: 'https://images.pexels.com/photos/3109807/pexels-photo-3109807.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/3109807/pexels-photo-3109807.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Abstract art', author: 'Pexels' },
    { id: 'abstract-5', url: 'https://images.pexels.com/photos/2832382/pexels-photo-2832382.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/2832382/pexels-photo-2832382.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Abstract design', author: 'Pexels' },
    { id: 'abstract-6', url: 'https://images.pexels.com/photos/2113566/pexels-photo-2113566.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/2113566/pexels-photo-2113566.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Abstract background', author: 'Pexels' },
  ],
  people: [
    { id: 'people-1', url: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Professional portrait', author: 'Pexels' },
    { id: 'people-2', url: 'https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Business woman', author: 'Pexels' },
    { id: 'people-3', url: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Business man', author: 'Pexels' },
    { id: 'people-4', url: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Team working', author: 'Pexels' },
    { id: 'people-5', url: 'https://images.pexels.com/photos/1181695/pexels-photo-1181695.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/1181695/pexels-photo-1181695.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Creative team', author: 'Pexels' },
    { id: 'people-6', url: 'https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Office people', author: 'Pexels' },
  ],
  architecture: [
    { id: 'arch-1', url: 'https://images.pexels.com/photos/1838640/pexels-photo-1838640.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/1838640/pexels-photo-1838640.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Modern building', author: 'Pexels' },
    { id: 'arch-2', url: 'https://images.pexels.com/photos/1838641/pexels-photo-1838641.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/1838641/pexels-photo-1838641.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Glass building', author: 'Pexels' },
    { id: 'arch-3', url: 'https://images.pexels.com/photos/1485894/pexels-photo-1485894.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/1485894/pexels-photo-1485894.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Skyscraper', author: 'Pexels' },
    { id: 'arch-4', url: 'https://images.pexels.com/photos/1838644/pexels-photo-1838644.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/1838644/pexels-photo-1838644.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'City architecture', author: 'Pexels' },
    { id: 'arch-5', url: 'https://images.pexels.com/photos/1838645/pexels-photo-1838645.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/1838645/pexels-photo-1838645.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Urban building', author: 'Pexels' },
    { id: 'arch-6', url: 'https://images.pexels.com/photos/1838646/pexels-photo-1838646.jpeg?auto=compress&cs=tinysrgb&w=800', thumb: 'https://images.pexels.com/photos/1838646/pexels-photo-1838646.jpeg?auto=compress&cs=tinysrgb&w=400', alt: 'Modern architecture', author: 'Pexels' },
  ],
};

const UnsplashPlugin = ({ isOpen, onClose, editor }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const searchInputRef = useRef(null);

  // Popular search terms for quick access
  const popularSearches = [
    'office', 'tech', 'nature', 'business', 
    'abstract', 'people', 'architecture', 'ağaç'
  ];

  // Load initial images on open
  useEffect(() => {
    if (isOpen) {
      fetchImages('office');
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const fetchImages = async (query) => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const searchTerm = query.toLowerCase().trim();
    
    // Find matching images from MOCK_IMAGES
    let resultImages = [];
    
    // Direct match
    if (MOCK_IMAGES[searchTerm]) {
      resultImages = MOCK_IMAGES[searchTerm];
    } else {
      // Partial match - search all categories
      for (const [category, categoryImages] of Object.entries(MOCK_IMAGES)) {
        if (category.includes(searchTerm) || searchTerm.includes(category)) {
          resultImages = [...resultImages, ...categoryImages];
        }
      }
      
      // If still no results, return office images as default
      if (resultImages.length === 0) {
        resultImages = MOCK_IMAGES['office'];
      }
    }
    
    setImages(resultImages);
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchImages(searchQuery);
    }
  };

  const handleQuickSearch = (term) => {
    setSearchQuery(term);
    fetchImages(term);
  };

  const insertImage = (image) => {
    if (!editor) return;

    const imageComponent = editor.DomComponents.addComponent({
      type: 'image',
      attributes: {
        src: image.url,
        alt: image.alt,
        style: 'max-width: 100%; height: auto;'
      }
    });

    const wrapper = editor.getWrapper();
    wrapper.append(imageComponent);
    
    editor.select(imageComponent);
    onClose();
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const confirmInsert = () => {
    if (selectedImage) {
      insertImage(selectedImage);
      setSelectedImage(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="unsplash-plugin-overlay" onClick={onClose}>
      <div className="unsplash-plugin-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="unsplash-plugin-header">
          <div className="unsplash-plugin-title">
            <span className="header-icon">[FOTO]</span>
            <div>
              <h2>Stok Fotoğraflar</h2>
              <p>Yüksek kaliteli ücretsiz görseller</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* Search Section */}
        <div className="unsplash-search-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper">
              <span className="search-icon">⌕</span>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Görsel ara... (örn: office, nature, tech)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button 
                  type="button" 
                  className="clear-search"
                  onClick={() => { setSearchQuery(''); searchInputRef.current?.focus(); }}
                >
                  ×
                </button>
              )}
            </div>
            <button type="submit" className="search-btn" disabled={loading}>
              {loading ? '...' : 'Ara'}
            </button>
          </form>

          {/* Quick Search Tags */}
          <div className="quick-search-tags">
            <span className="tags-label">Popüler:</span>
            {popularSearches.map((term) => (
              <button
                key={term}
                className={`tag ${searchQuery === term ? 'active' : ''}`}
                onClick={() => handleQuickSearch(term)}
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        <div className="unsplash-toolbar">
          <span className="results-count">
            {loading ? 'Yükleniyor...' : `${images.length} görsel`}
          </span>
          <div className="view-toggle">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid görünüm"
            >
              ▦
            </button>
            <button 
              className={`view-btn ${viewMode === 'compact' ? 'active' : ''}`}
              onClick={() => setViewMode('compact')}
              title="Kompakt görünüm"
            >
              ⊞
            </button>
          </div>
        </div>

        {/* Images Grid */}
        <div className={`unsplash-images-container ${viewMode}`}>
          {loading ? (
            <div className="loading-state">
              <span className="spinner">⟳</span>
              <p>Görseller yükleniyor...</p>
            </div>
          ) : images.length > 0 ? (
            <div className={`images-grid ${viewMode}`}>
              {images.map((image) => (
                <div
                  key={image.id}
                  className={`image-card ${selectedImage?.id === image.id ? 'selected' : ''}`}
                  onClick={() => handleImageClick(image)}
                >
                  <div className="image-wrapper">
                    <img 
                      src={image.thumb} 
                      alt={image.alt}
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/400x300/333/666?text=${encodeURIComponent(image.alt)}`;
                      }}
                    />
                    <div className="image-overlay">
                      <button className="preview-btn">👁</button>
                    </div>
                  </div>
                  <div className="image-info">
                    <span className="image-author">{image.author}</span>
                    {selectedImage?.id === image.id && (
                      <span className="selected-badge">[SEÇİLDİ]</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <span className="no-results-icon">□</span>
              <p>Sonuç bulunamadı</p>
              <span>Farklı bir arama terimi deneyin</span>
            </div>
          )}
        </div>

        {/* Footer with Actions */}
        {selectedImage && (
          <div className="unsplash-plugin-footer">
            <div className="selected-preview">
              <img src={selectedImage.thumb} alt={selectedImage.alt} />
              <div className="selected-info">
                <span className="selected-label">Seçilen Görsel</span>
                <span className="selected-dimensions">800 x 600</span>
              </div>
            </div>
            <div className="footer-actions">
              <button className="cancel-btn" onClick={() => setSelectedImage(null)}>
                İptal
              </button>
              <button className="insert-btn" onClick={confirmInsert}>
                [↓] Editöre Ekle
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div 
          className="image-preview-overlay" 
          onClick={() => setSelectedImage(null)}
        >
          <div className="image-preview-modal" onClick={(e) => e.stopPropagation()}>
            <button className="preview-close" onClick={() => setSelectedImage(null)}>×</button>
            <img src={selectedImage.url} alt={selectedImage.alt} />
            <div className="preview-actions">
              <button className="cancel-btn" onClick={() => setSelectedImage(null)}>
                Kapat
              </button>
              <button className="insert-btn" onClick={confirmInsert}>
                [↓] Editöre Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnsplashPlugin;
