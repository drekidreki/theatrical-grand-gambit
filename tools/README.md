# tools/

Skrip pemeriksaan. Tidak ikut di-deploy — isinya hanya untuk memverifikasi
proyek sebelum dipublikasikan.

| Berkas | Fungsi | Perintah |
| --- | --- | --- |
| `generate-elo-data.py` | Membuat `data/elo-ratings.js` dari ekspor CSV FIDE | `python3 -I tools/generate-elo-data.py <input.csv> data/elo-ratings.js` |
| `perft-test.mjs` | Uji perft mesin catur pada 5 posisi standar | `node tools/perft-test.mjs` |
| `verify-questions.mjs` | Membuktikan setiap kunci jawaban kuis terhadap mesin | `node tools/verify-questions.mjs` |
| `stats-test.mjs` | Membandingkan hasil mesin statistik dengan CSV mentah | `node tools/stats-test.mjs [csv]` |
| `browser-smoke-test.mjs` | Membuka aplikasi di Chrome headless pada 3 viewport | lihat di bawah |
| `browser-qc-test.mjs` | Uji iframe, keyboard, reduced motion, dan ketahanan pustaka | lihat di bawah |

Tiga skrip pertama berjalan langsung dengan Node dan Python tanpa dependensi.

Dua skrip browser memerlukan Puppeteer dan sebuah server lokal:

```bash
npm install puppeteer
python3 -m http.server 8099          # di folder akar proyek
node tools/browser-smoke-test.mjs http://localhost:8099
```

`browser-qc-test.mjs` juga memerlukan halaman induk yang menyematkan aplikasi
lewat iframe pada porta 8098. Sesuaikan konstanta `APP` dan `PARENT` di bagian
atas berkas bila porta yang Anda pakai berbeda.
