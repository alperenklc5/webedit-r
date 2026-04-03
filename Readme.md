<div align="center">

# 🎨 WebEdit-r

**Yapay Zeka Destekli Görsel HTML Editörü**

Sürükle-bırak kolaylığı ve yapay zeka yardımıyla fikirlerinizi muhteşem web sitelerine dönüştürün.

[![Lisans: MIT](https://img.shields.io/badge/Lisans-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.0-blue.svg)](https://reactjs.org/)
[![AI Destekli](https://img.shields.io/badge/AI-Destekli-purple.svg)]()

<br>

<img width="100%" alt="WebEdit-r Genel Görünüm" src="https://github.com/user-attachments/assets/6cd6253f-fc60-450f-88d7-242f0315183f" />

<br>

[Demo](#demo) • [Özellikler](#özellikler) • [Kurulum](#kurulum) • [Kullanım](#kullanım) • [Katkıda Bulunma](#katkıda-bulunma)

</div>

---

## ✨ Özellikler

### 🤖 Yapay Zeka Asistanı
- **Çoklu Model Desteği:** Groq (ücretsiz), Claude, GPT-4, Gemini
- **ChatGPT Tarzı Arayüz:** Kalıcı konuşma hafızası
- **Bağlam Farkındalığı:** Siteyi yeniden yapmadan iyileştirmeler
- **Profesyonel Çıktı:** WordPress/Webflow kalitesinde siteler



### 🎨 Görsel Editör & 🧰 Gelişmiş Araç Kutusu
- **Sürükle & Bırak:** Elementleri özgürce taşıyın
- **Tıkla Seç:** Sezgisel element seçimi
- **Canlı Düzenleme:** Metinleri çift tıklayarak düzenleyin
- **33+ Component:** Butonlar, kartlar, slider'lar, takvimler, grafikler
- **6 Kategori:** Temel, Form, Gelişmiş, Medya, Layout, Grafikler

<div align="center">
  <img width="80%" alt="Araç Kutusu ve Editör" src="https://github.com/user-attachments/assets/18ae6a1d-12e9-4979-97cd-53ce4563c940" />
</div>

### 🔌 Profesyonel Eklentiler & ⌨️ Geliştirici Araçları
- **SEO Analiz:** 100 puanlık skorlama sistemi ve uygulanabilir öneriler
- **Form Oluşturucu:** Canlı önizlemeli ve XSS-güvenli çıktı
- **Monaco Kod Editörü:** Tarayıcıda tam özellikli IDE
- **Sanal Terminal:** git, npm dahil 20+ komut

<div align="center">
  <img width="80%" alt="Ekran Görüntüsü 4" src="https://github.com/user-attachments/assets/df6c3c7e-1b34-47ba-b887-178fa63df0ba" />
  
</div>

---

## 📸 Monaco Editör Kod Düzenleme ve Terminal Ekran görüntüleri

<div align="center">
  
  <img width="49%" alt="Ekran Görüntüsü 2" src="https://github.com/user-attachments/assets/8a38c2e4-7283-4a0e-9f6c-c1106f2ec811" />
  <br><br>
  <img width="49%" alt="Ekran Görüntüsü 3" src="https://github.com/user-attachments/assets/23d5f7bf-146b-4843-8eb9-cd71c66b8002" />
  <img width="49%" alt="Eklentiler ve Terminal" src="https://github.com/user-attachments/assets/d16bf9fa-4a7c-4e38-a252-397b377a529d" />
</div>

---

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Node.js 16+ ve npm

### Kurulum

```bash
# Depoyu klonlayın
git clone [https://github.com/alperenklc5/webedit-r.git](https://github.com/alperenklc5/webedit-r.git)
cd webedit-r

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

Tarayıcınızda `http://localhost:5173` adresini açın.

---

## 📖 Kullanım

1. **Tema veya AI ile Başlayın**
   * **Tema Yükle:** "Temalar" butonuna tıklayarak 9 hazır temaya göz atın.
   * **AI ile Oluştur:** AI Asistan'ı açın → "Modern bir portfolyo sitesi oluştur".
   * **Boş Başla:** Boş kanvas ile başlayın.
  <div align="center">
  <img width="80%" alt="AI Asistan Görünümü" src="https://github.com/user-attachments/assets/8f3e3978-9cdd-440e-9ace-cd7d34df3db9" />
</div>

2. **Component Ekleyin**
   * Sol kenar çubuğundaki 🧰 Araç Kutusu sekmesine tıklayın.
   * Kategorilere göz atın: Temel, Form, Gelişmiş, Medya, Layout, Grafikler.
   * Componentleri tıklayın veya kanvasa sürükleyin.
     <div align="center">
       <img width="80%"  alt="Ekran görüntüsü 2026-04-03 112849" src="https://github.com/user-attachments/assets/0793a26a-b670-48b8-b04e-e214c713c17b" />

  
</div>

3. **Elementleri Düzenleyin**
   * **Seç:** Herhangi bir elemente tıklayın.
   * **Taşı:** Seçili elementi sürükleyin.
   * **Metni Düzenle:** Metin elementlerine çift tıklayın.
   * **Stillendir:** Sağ paneli kullanın (renkler, boyut, boşluk, kenarlıklar).
    <div align="center">
    <img width="80%" alt="Ekran Görüntüsü 1" src="https://github.com/user-attachments/assets/ff6f88c1-13ac-4a1b-910f-14d39f554f21" />
    </div>

4. **AI Asistanı Kullanın**
   * Araç çubuğundaki 🤖 AI Assistant butonuna tıklayın.
   * İlk kez model seçin (Groq önerilir - ücretsiz).
   * API anahtarı girin (sağlayıcıdan alın).
   * Doğal konuşun: "Bir iletişim formu ekle", "Koyu tema yap", vb.

5. **Kaydet & Export**
   * **Kaydet:** 💾 butonuna tıklayın (localStorage'a kaydeder).
   * **Export:** Temiz HTML dosyası için export butonuna tıklayın.

---

## 🛠️ Teknoloji Yığını

* **Frontend:** React 18, Vite
* **Editör:** Monaco Editor (VS Code)
* **AI API'ları:** Groq, Anthropic Claude, OpenAI, Google Gemini
* **Depolama:** LocalStorage (sadece istemci tarafı)

---

## 🎯 Yol Haritası

**v1.1 (Planlanmış)**
- [ ] Eklemeden önce component önizlemesi
- [ ] Gradient & gölge oluşturucular
- [ ] Animasyon preset kütüphanesi
- [ ] Çoklu sayfa desteği
- [ ] İşbirlikli düzenleme

**v1.2 (Gelecek)**
- [ ] WordPress export
- [ ] React/Vue component export
- [ ] Resim CDN entegrasyonu
- [ ] Özel component kütüphanesi
- [ ] Sürüm kontrolü

---

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen önce `CONTRIBUTING.md` dosyasını okuyun.

---

## 📝 Lisans

MIT Lisansı - detaylar için `LICENSE` dosyasına bakın.

---

## 📧 İletişim

**Proje Linki:** [https://github.com/alperenklc5/webedit-r](https://github.com/alperenklc5/webedit-r)  
**Sorunlar:** [https://github.com/alperenklc5/webedit-r/issues](https://github.com/alperenklc5/webedit-r/issues)

<div align="center">
<br>
⭐ Bu projeyi faydalı bulduysanız yıldızlamayı unutmayın! <br>
❤️ ve AI ile yapıldı
</div>
