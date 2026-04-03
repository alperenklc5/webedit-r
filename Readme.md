WEBEDITR v1.0 - TÜRKÇE GITHUB DOSYALARI

Tam Türkçe README + diğer dosyalar

═══════════════════════════════════════════════════════════════



<div align="center">

# 🎨 WebEdit-r

**Yapay Zeka Destekli Görsel HTML Editörü**

Sürükle-bırak kolaylığı ve yapay zeka yardımıyla fikirlerinizi muhteşem web sitelerine dönüştürün.

[![Lisans: MIT](https://img.shields.io/badge/Lisans-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.0-blue.svg)](https://reactjs.org/)
[![AI Destekli](https://img.shields.io/badge/AI-Destekli-purple.svg)]()

[Demo](#demo) • [Özellikler](#özellikler) • [Kurulum](#kurulum) • [Kullanım](#kullanım) • [Katkıda Bulunma](#katkıda-bulunma)

</div>

---

## ✨ Özellikler

### 🤖 Yapay Zeka Asistanı
- **Çoklu Model Desteği:** Groq (ücretsiz), Claude, GPT-4, Gemini
- **ChatGPT Tarzı Arayüz:** Kalıcı konuşma hafızası
- **Bağlam Farkındalığı:** Siteyi yeniden yapmadan iyileştirmeler
- **Profesyonel Çıktı:** WordPress/Webflow kalitesinde siteler

### 🎨 Görsel Editör
- **Sürükle & Bırak:** Elementleri özgürce taşıyın
- **Tıkla Seç:** Sezgisel element seçimi
- **Canlı Düzenleme:** Metinleri çift tıklayarak düzenleyin
- **Gerçek Zamanlı Önizleme:** Değişiklikleri anında görün
- **Geri Al/İleri Al:** Tam geçmiş desteği (Ctrl+Z/Y)

### 🧰 Gelişmiş Araç Kutusu
- **33+ Component:** Butonlar, kartlar, slider'lar, takvimler, grafikler
- **6 Kategori:** Temel, Form, Gelişmiş, Medya, Layout, Grafikler
- **İnteraktif Componentler:** Zamanlayıcılar, toggle'lar, accordion'lar, carousel'ler
- **Tek Tıkla Ekleme:** Sürükle veya tıkla

### 🔌 Profesyonel Eklentiler

#### 🌐 Çevirmen
- MyMemory API ile çoklu dil çevirisi
- Gerçek zamanlı ilerleme takibi
- Otomatik tema güncellemesi

#### 🔍 SEO Analiz
- 100 puanlık skorlama sistemi
- 6 analiz kategorisi (meta, içerik, resimler, linkler, yapı, performans)
- Uygulanabilir öneriler

#### 📝 Form Oluşturucu
- 7 alan tipi (metin, e-posta, textarea, seçim, checkbox, radio, dosya)
- Sürükle-sırala alanları
- Canlı önizleme
- XSS-güvenli çıktı

#### 📧 SMTP Mail Ayarları
- 3 sağlayıcı yapılandırması (Gmail, Outlook, Özel)
- Node.js backend kod üreteci
- EmailJS entegrasyon rehberi

### ⌨️ Geliştirici Araçları
- **Monaco Kod Editörü:** Tarayıcıda tam özellikli IDE
- **Sanal Terminal:** git, npm dahil 20+ komut
- **Dosya Sistemi:** Simüle edilmiş proje yapısı
- **HTML Export:** Temiz, minified çıktı

---

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Node.js 16+ ve npm

### Kurulum

# Depoyu klonlayın
git clone https://github.com/alperenklc5/webedit-r.git
cd webedit-r

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev


Tarayıcınızda [http://localhost:5173](http://localhost:5173) adresini açın.



## 📖 Kullanım

### 1. Tema veya AI ile Başlayın
- **Tema Yükle:** "Temalar" butonuna tıklayarak 9 hazır temaya göz atın
- **AI ile Oluştur:** AI Asistan'ı açın → "Modern bir portfolyo sitesi oluştur"
- **Boş Başla:** Boş kanvas ile başlayın

### 2. Component Ekleyin
- Sol kenar çubuğundaki **🧰 Araç Kutusu** sekmesine tıklayın
- Kategorilere göz atın: Temel, Form, Gelişmiş, Medya, Layout, Grafikler
- Componentleri tıklayın veya kanvasa sürükleyin

### 3. Elementleri Düzenleyin
- **Seç:** Herhangi bir elemente tıklayın
- **Taşı:** Seçili elementi sürükleyin
- **Metni Düzenle:** Metin elementlerine çift tıklayın
- **Stillendir:** Sağ paneli kullanın (renkler, boyut, boşluk, kenarlıklar)
- **Sil:** Seç + Delete tuşu veya 🗑️ butonu

### 4. AI Asistanı Kullanın
- Araç çubuğundaki **🤖 AI Assistant** butonuna tıklayın
- İlk kez: Model seçin (Groq önerilir - ücretsiz)
- API anahtarı girin (sağlayıcıdan alın)
- Doğal konuşun: "Bir iletişim formu ekle", "Koyu tema yap", vb.

### 5. Kaydet & Export
- **Kaydet:** 💾 butonuna tıklayın (localStorage'a kaydeder)
- **Export:** Temiz HTML dosyası için export butonuna tıklayın
- **Kod Görünümü:** Monaco editör için "Kod" sekmesine geçin

### 6. Terminal (İsteğe Bağlı)
- "Terminal" sekmesine geçin
- Komutları deneyin: `help`, `git init`, `npm install react`, `theme`

---

## 🛠️ Teknoloji Yığını

- **Frontend:** React 18, Vite
- **Editör:** Monaco Editor (VS Code)
- **AI API'ları:** Groq, Anthropic Claude, OpenAI, Google Gemini
- **Depolama:** LocalStorage (sadece istemci tarafı)
- **Stil:** Inline stiller (framework yok)

---

## 🎯 Yol Haritası

### v1.1 (Planlanmış)
- [ ] Eklemeden önce component önizlemesi
- [ ] Gradient & gölge oluşturucular
- [ ] Animasyon preset kütüphanesi
- [ ] Çoklu sayfa desteği
- [ ] İşbirlikli düzenleme

### v1.2 (Gelecek)
- [ ] WordPress export
- [ ] React/Vue component export
- [ ] Resim CDN entegrasyonu
- [ ] Özel component kütüphanesi
- [ ] Sürüm kontrolü

---

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen önce [CONTRIBUTING.md](CONTRIBUTING.md) dosyasını okuyun.

### Geliştirme Kurulumu
```bash
# Depoyu fork edin
# Fork'unuzu klonlayın
git clone https://github.com/KULLANICI_ADINIZ/webedit-r.git

# Bir branch oluşturun
git checkout -b feature/harika-ozellik

# Değişiklik yapın ve commit edin
git commit -m "Harika özellik eklendi"

# Push edin ve PR oluşturun
git push origin feature/harika-ozellik
```

---

## 📝 Lisans

MIT Lisansı - detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

## 🙏 Teşekkürler

- [React](https://reactjs.org/) ile geliştirildi
- Kod editörü [Monaco Editor](https://microsoft.github.io/monaco-editor/) tarafından desteklenmektedir
- AI yetenekleri: [Groq](https://groq.com/), [Anthropic](https://anthropic.com/), [OpenAI](https://openai.com/), [Google](https://ai.google.dev/)
- İkonlar: [Lucide](https://lucide.dev/)
- İlham kaynakları: WordPress, Webflow ve Wix

---

## 📧 İletişim

**Proje Linki:** [https://github.com/alperenklc5/webedit-r](https://github.com/alperenklc5/webedit-r)

**Sorunlar:** [https://github.com/alperenklc5/webedit-r/issues](https://github.com/alperenklc5/webedit-r/issues)

---

<div align="center">

**⭐ Bu projeyi faydalı bulduysanız yıldızlamayı unutmayın!**

❤️ ve AI ile yapıldı

</div>
````

