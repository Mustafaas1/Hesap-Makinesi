#  Gelişmiş Hesap Makinesi

Modern, cam-morfizm tasarımlı; hesap makinesi, para birimi, uzunluk ve sıcaklık dönüştürücüyü tek çatı altında toplayan masaüstü uygulaması.

---

##  Özellikler

###  Bilimsel Hesap Makinesi
- Temel aritmetik işlemler (`+`, `−`, `×`, `÷`, `%`)
- Trigonometrik fonksiyonlar — **sin**, **cos**, **tan**, **cot** (derece cinsinden)
- Logaritmik fonksiyonlar — **log** (taban 10) ve **ln** (doğal logaritma)
- Karekök (`√`) ve Pi sabiti (`π`)
- Tam klavye desteği (`Enter`, `Backspace`, `Escape`, operatör tuşları)
- Türk yerel sayı biçimlendirmesi (virgüllü ondalık gösterim)

###  Canlı Para Birimi Çevirici
- [open.er-api.com](https://open.er-api.com) üzerinden gerçek zamanlı döviz kurları
- 150+ para birimi desteği
- Anlık kur bilgisi gösterimi
- Tek tıkla para birimlerini ters çevirme (swap)

###  Uzunluk Çevirici
- 8 farklı birim: `mm`, `cm`, `m`, `km`, `in`, `ft`, `yd`, `mi`
- Anında dönüşüm, 6 ondalık basamak hassasiyeti

###  Sıcaklık Çevirici
- Santigrat (°C), Fahrenheit (°F) ve Kelvin (K) arası dönüşüm
- 4 ondalık basamak hassasiyeti

###  İşlem Geçmişi
- Son 50 işlem `localStorage` ile tarayıcıda saklanır
- Geçmişteki hesap sonuçlarına tıklayarak hesap makinesine aktarma
- Tek tıkla geçmişi temizleme

---

##  Ekran Görüntüsü

> Uygulama karanlık tema, animasyonlu arka plan ve cam efektli arayüzüyle modern bir görünüm sunar.

---

##  Kurulum ve Çalıştırma

### Gereksinimler

- Python 3.8+
- `pywebview` kütüphanesi

### Adımlar

```bash
# Repoyu klonla
git clone https://github.com/kullanici-adi/gelismis-hesap-makinesi.git
cd gelismis-hesap-makinesi

# Bağımlılığı kur
pip install pywebview

# Uygulamayı başlat
python main.py
```

### PyInstaller ile Derleme (Opsiyonel)

```bash
pip install pyinstaller

pyinstaller --onefile --windowed \
  --add-data "index.html;." \
  --add-data "style.css;." \
  --add-data "script.js;." \
  main.py
```

Derlenen `.exe` dosyası `dist/` klasöründe oluşur.

---

##  Dosya Yapısı

```
gelismis-hesap-makinesi/
├── main.py        # pywebview ile masaüstü penceresi açar
├── index.html     # Uygulama arayüzü ve sekme yapısı
├── style.css      # Cam-morfizm teması, animasyonlar, responsive tasarım
└── script.js      # Hesap makinesi mantığı, çeviriciler, geçmiş yönetimi
```

---

##  Kullanılan Teknolojiler

| Katman | Teknoloji |
|--------|-----------|
| Masaüstü Sarmalayıcı | [pywebview](https://pywebview.flowrl.com/) |
| Arayüz | HTML5, CSS3, Vanilla JavaScript |
| Yazı Tipi | [Inter](https://fonts.google.com/specimen/Inter) (Google Fonts) |
| İkonlar | [Font Awesome 6](https://fontawesome.com/) |
| Döviz API | [open.er-api.com](https://open.er-api.com) |

---

##  Klavye Kısayolları

| Tuş | İşlev |
|-----|-------|
| `0–9` | Rakam girişi |
| `+` `-` `*` `/` | Operatör seçimi |
| `Enter` veya `=` | Hesapla |
| `Backspace` | Son karakteri sil |
| `Escape` | Temizle (AC) |
| `.` veya `,` | Ondalık nokta |

---

##  Lisans

Bu proje [MIT Lisansı](LICENSE) ile lisanslanmıştır.
