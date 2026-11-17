# The Theatrical Grand Gambit

Aplikasi web edukatif interaktif tentang perjalanan karier, olahraga catur,
kajian Pendidikan Pancasila, dan analisis statistik rating Elo Grandmaster
catur Indonesia **Irene Kharisma Sukandar** (FIDE ID 7101384).

Static front-end murni: HTML5, CSS3, dan JavaScript ES6+ modular. Tanpa
backend, tanpa basis data, tanpa proses build. Dirancang tahan banting saat
disematkan sebagai `<iframe>` layar penuh di halaman portal induk.

---

## Menjalankan secara lokal

Modul ES (`type="module"`) tidak berjalan lewat protokol `file://`. Jalankan
melalui server statis ringan:

```bash
# Pilih salah satu
npx serve .
python3 -m http.server 8000
# atau klik "Go Live" pada ekstensi Live Server di VS Code
```

Lalu buka `http://localhost:8000`.

## Deploy ke Vercel

```bash
npx vercel --prod
```

Tidak ada langkah build. `vercel.json` sudah mengatur header yang diperlukan:

| Header | Nilai | Alasan |
| --- | --- | --- |
| `Content-Security-Policy` | `frame-ancestors *` | Mengizinkan penyematan lintas domain |
| `X-Frame-Options` | **sengaja tidak diset** | Jika diset `DENY`/`SAMEORIGIN`, iframe akan diblokir |
| `Permissions-Policy` | `autoplay`, `fullscreen`, `clipboard-write` | Agar pemutar video dan kontrol audio berfungsi |

Untuk membatasi hanya ke portal tertentu, ganti `frame-ancestors *` menjadi
`frame-ancestors https://domain-portal-anda.com`.

## Menyematkan ke halaman induk

```html
<iframe
  src="https://kelompokganjil.vercel.app"
  title="The Theatrical Grand Gambit"
  allow="autoplay; fullscreen; clipboard-write"
  style="position:fixed; inset:0; width:100%; height:100%; border:0;"
  loading="lazy"
></iframe>
```

Halaman induk sebaiknya memakai `overflow: hidden` pada `body`. Dokumen di
dalam iframe mengelola scroll-nya sendiri, sehingga tidak muncul scrollbar
ganda.

---

## Struktur proyek

```text
theatrical-grand-gambit/
├── index.html              Dokumen utama, kerangka lima bagian
├── vercel.json             Header keamanan dan izin iframe
├── assets/
│   ├── vendor/             GSAP, Chart.js, chess.js (disimpan lokal)
│   └── images, videos, audio, icons, fonts  (lihat "Aset yang perlu diisi")
├── css/
│   ├── reset · variables · typography · global · layout · animations · responsive
│   └── sections/           Gaya khusus tiap babak
├── js/
│   ├── main.js             Titik masuk, memuat modul babak secara lazy
│   ├── navigation.js       Routing SPA, Program Acara, tiket maju-mundur
│   ├── animation-controller.js  Intro, paralaks, spotlight, Jeda Gerak
│   ├── storage.js          localStorage + in-memory fallback
│   ├── audio-controller.js Audio berbasis gerakan pengguna
│   ├── progress-tracker.js Grandmaster's Journal
│   ├── features/           Modul fitur tiap babak
│   └── utils/              Fungsi pembantu murni
├── data/                   Data terpisah dari logika tampilan
└── tools/                  Skrip verifikasi, tidak ikut di-deploy
```

### Penyimpangan dari struktur konsep, beserta alasannya

| Perubahan | Alasan |
| --- | --- |
| `js/features/chess-engine.js` ditambahkan | Konsep bagian 9 meminta rules engine dipisah dari renderer papan. Modul ini juga menjadi jalur cadangan bila chess.js gagal dimuat dari CDN. |
| `js/features/elo-stats.js` ditambahkan | Memisahkan mesin hitung dari grafik, sehingga angka statistik dapat diuji tanpa merender apa pun. |
| `js/features/modal.js` ditambahkan | Konsep mencantumkan Modal dan Lightbox sebagai komponen; keduanya dipakai lintas babak. |
| `data/religious-analysis.js` dihapus | Materi Pendidikan Agama pada tugas ini berupa bagian Nilai Keteladanan, sehingga digabung ke `data/pancasila-analysis.js`. |
| `js/features/the-portrait.js`, `chess-arena.js`, `statistics.js` | Modul penyusun tiap babak, dinamai sama dengan berkas di `css/sections/`. Masing-masing mengoordinasikan modul fitur yang tercantum di konsep. |
| `data/elo-ratings.js` di-generate skrip | 206 periode rating tidak diketik manual, sehingga mustahil terjadi salah ketik angka. |
| `js/features/elo-stats.js` dan `achievement-timeline.js` | Mesin hitung dipisah dari tampilan, sehingga setiap angka dapat diuji terpisah lewat `tools/stats-test.mjs`. |
| Pustaka disimpan lokal, bukan dari CDN | Lihat bagian "Pustaka pihak ketiga". |
| Garis Blitz memakai Velvet Maroon, bukan Antique Cream | Antique Cream (#E6D5B0) nyaris tidak terlihat di atas panel gading (#F3EFE7) dan gagal memenuhi rasio kontras 3:1 untuk elemen grafis. |

---

## Aset yang perlu diisi

Berkas berikut belum tersedia dan saat ini ditampilkan sebagai slot penanda di
antarmuka. Letakkan berkas asli pada path berikut, lalu muat ulang halaman:

| Path | Isi |
| --- | --- |
| `assets/images/infographic/irene-infografis.webp` | Infografis asli. Jangan dibuat ulang; website hanya menampilkan gambar yang disediakan. |
| `assets/videos/irene-documentary.mp4` | Video dokumenter, kompresi H.264 |
| `assets/images/irene/video-poster.webp` | Gambar poster video |
| `assets/images/irene/portrait.webp` | Foto potret untuk pembuka Babak I |
| `assets/audio/ambient.mp3` | Musik latar suasana teater (opsional) |
| `assets/audio/transition.mp3` | Efek suara perpindahan babak (opsional) |

Seluruh path aset memakai path relatif murni (`./assets/...`) tanpa awalan
slash akar, agar tetap ditemukan baik saat diakses langsung maupun di dalam
iframe.

---

## Pustaka pihak ketiga

Ketiganya **disimpan lokal** di `assets/vendor/`, bukan dimuat dari CDN.

Alasannya ditemukan saat pengujian: di lingkungan berproksi, ketiga CDN
(cdnjs dan jsDelivr) terblokir sekaligus. Aplikasi tetap berjalan berkat jalur
cadangan, tetapi grafik turun menjadi tabel dan animasi hilang. Dengan
disimpan lokal, pustaka berasal dari origin yang sama dengan halamannya,
sehingga ikut hidup atau mati bersama aplikasinya — penting untuk jaringan
sekolah yang kerap memblokir CDN.

| Pustaka | Versi | Ukuran | Kegunaan | Jalur cadangan |
| --- | --- | --- | --- | --- |
| GSAP | 3.12.5 | 72 KB | Koreografi intro tirai dan transisi babak | Animasi CSS; intro tetap selesai, navigasi tetap jalan |
| Chart.js | 4.4.1 | 205 KB | Grafik garis rating Elo | Tabel ringkasan 199 baris |
| chess.js | 0.10.3 | 47 KB | Validasi langkah, skak, skakmat | Validator internal `js/features/chess-engine.js` |

Jalur cadangan tetap dipertahankan sebagai pengaman lapis kedua dan **sudah
diuji**: `tools/browser-qc-test.mjs` memblokir ketiga berkas, lalu memastikan
aplikasi tetap berfungsi penuh tanpa satu pun exception.

Status pemuatan tiap pustaka tercatat di `window.TGG_LIBS`.

## Sumber data

| Data | Sumber |
| --- | --- |
| Riwayat rating Elo (206 periode, 2005–2026) | Ekspor riwayat rating resmi FIDE, FIDE ID 7101384 |
| Arsip prestasi 2002–2025 | Dokumen tugas, dicocokkan dengan arsip kejuaraan publik |
| Materi peraturan catur | Dokumen "Peraturan Catur" dari pengajar, diverifikasi terhadap FIDE Laws of Chess |
| Analisis Hak, Kewajiban, Nilai Keteladanan | Dokumen analisis tugas, ditampilkan utuh tanpa diringkas |

### Prinsip integritas data yang dipegang kode ini

1. Tidak ada angka rating fiktif. Periode tanpa rilis rating disimpan `null`,
   bukan `0` dan bukan hasil interpolasi.
2. Lubang data pada ekspor sumber ditampilkan terbuka kepada pembaca, tidak
   ditambal diam-diam.
3. Seluruh angka statistik dihitung saat aplikasi berjalan dari dataset
   aktual, tidak ada yang diketik manual ke dalam HTML.
4. Materi sumber dari pengajar ditampilkan utuh. Bila hasil pengecekan
   terhadap peraturan FIDE terkini berbeda, perbedaannya ditulis pada kotak
   **Catatan Verifikasi** di bawah naskah aslinya — naskah asli tidak diubah.
5. Pemetaan terhadap sila Pancasila diberi label **Lapisan Interpretasi**,
   dibedakan secara visual dari naskah sumber.

---

## Aksesibilitas

- Navigasi penuh dengan keyboard: Tab, Enter, dan Escape untuk menutup dialog.
- Indikator `:focus-visible` yang jelas, juga saat berjalan di dalam iframe.
- Tombol **Jeda Gerak** menghentikan seluruh animasi dekoratif kapan saja.
- `prefers-reduced-motion` dihormati: intro dilewati, transisi menjadi fade.
- Target sentuh minimal 44 × 44 px.
- Tidak ada informasi penting yang hanya muncul lewat `:hover`.
- Paragraf panjang selalu berada di atas panel gading `#F3EFE7` dengan teks
  gelap. Emas hanya dipakai untuk judul, angka besar, dan ornamen.

## Titik uji responsif

360 px · 390 px · 430 px · 768 px · 1024 px · 1440 px

Diuji pada dua skenario: akses langsung ke URL, dan akses melalui `<iframe>`
layar penuh.

---

## Pengujian

Seluruh angka dan aturan pada proyek ini diverifikasi otomatis, bukan
diperiksa dengan mata saja. Jalankan dari folder akar proyek:

```bash
node tools/perft-test.mjs          # 17 uji perft mesin catur, 5 posisi standar
node tools/verify-questions.mjs    # 10 kunci jawaban kuis dibuktikan ke mesin
node tools/stats-test.mjs          # 41 uji statistik Elo terhadap CSV mentah
```

Hasil terakhir: **17/17**, **10/10**, dan **41/41** lulus.

Dua uji browser memerlukan Puppeteer; keterangannya ada di `tools/README.md`.
Keduanya memeriksa tiga viewport, penyematan iframe, navigasi keyboard,
reduced motion, Jeda Gerak, dan perilaku saat ketiga pustaka diblokir.

### Yang sudah dipastikan lewat pengujian

- Tidak ada scrollbar ganda: `html` terkunci, `body` satu-satunya scroller.
- Tidak ada overflow horizontal pada 360, 768, maupun 1440 px.
- Keempat babak memuat konten penuh, tanpa halaman kosong.
- Grafik Elo merender; bila Chart.js diblokir, tabel cadangan muncul.
- Papan catur tetap memvalidasi langkah dengan benar tanpa chess.js.
- Loge dapat dicapai dengan Tab dan dibuka dengan Enter.
- Escape menutup Program Acara dan seluruh dialog.
- Fokus keyboard bertahan di petak yang sama setelah papan dirender ulang.
- Nol error konsol dan nol permintaan jaringan yang gagal.

## Status pengembangan

Seluruh sembilan tahap selesai. Yang tersisa hanyalah mengisi berkas aset
pada tabel "Aset yang perlu diisi" di atas.
