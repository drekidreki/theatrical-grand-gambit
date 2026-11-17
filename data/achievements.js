/**
 * data/achievements.js
 * ====================
 * Arsip prestasi Irene Kharisma Sukandar, 2002–2025.
 *
 * ATURAN INTEGRITAS
 * - Seluruh baris berasal dari tabel prestasi pada dokumen tugas. Tidak ada
 *   prestasi yang dihapus demi memperpendek lini masa.
 * - Properti `verified` berisi detail tambahan yang berhasil dicocokkan
 *   dengan arsip publik. Detail ini MELENGKAPI, tidak menggantikan, isi
 *   dokumen tugas.
 * - Properti `note` dipakai bila ada perbedaan antara dokumen tugas dan
 *   arsip publik. Perbedaan ditandai, bukan ditutupi.
 * - Statistik pencapaian dihitung dari array ini saat aplikasi berjalan,
 *   bukan diketik manual.
 */

/**
 * @typedef {Object} Achievement
 * @property {number} year
 * @property {string} event      Nama ajang sesuai dokumen tugas.
 * @property {string} location
 * @property {string} result     Pencapaian sesuai dokumen tugas.
 * @property {'gelar'|'emas'|'perak'|'perunggu'|'juara'|'penghargaan'|'rekor'} category
 * @property {boolean} [milestone] Tonggak karier, diberi sorotan khusus.
 * @property {string} [badge]      Label badge gelar internasional.
 * @property {string} [verified]   Detail tambahan yang sudah dicocokkan.
 * @property {string} [note]       Catatan bila ada perbedaan antarsumber.
 */

/** @type {readonly Achievement[]} */
export const achievements = Object.freeze([
  {
    year: 2002,
    event: 'Kejuaraan Catur ASEAN',
    location: 'Singapura',
    result: 'Juara 3 Kelompok Umur 10 Tahun',
    category: 'perunggu',
  },
  {
    year: 2003,
    event: 'SEA Games',
    location: 'Vietnam',
    result: '2 Medali Perak (diraih pada usia 11 tahun)',
    category: 'perak',
  },
  {
    year: 2004,
    event: 'Olimpiade Catur',
    location: 'Calvia, Spanyol',
    result: 'Medali Perak Papan 3 Tim Nasional Putri',
    category: 'perak',
    milestone: true,
    verified:
      'Tampil pada usia dua belas tahun dengan perolehan 10 dari 12 poin — ' +
      'salah satu hasil papan terbaik kontingen Indonesia pada edisi tersebut.',
  },
  {
    year: 2004,
    event: 'Kejuaraan Catur Asia Junior',
    location: 'Singapura',
    result: 'Medali Perak Kategori U-14',
    category: 'perak',
  },
  {
    year: 2008,
    event: 'Rekor MURI & Federasi Catur Dunia (FIDE)',
    location: 'Dresden, Jerman',
    result: 'Pecatur wanita Indonesia pertama bergelar Woman Grandmaster (WGM)',
    category: 'gelar',
    badge: 'WGM',
    milestone: true,
    verified:
      'Norma terakhir diselesaikan saat memimpin tim putri Indonesia di ' +
      'Olimpiade Catur ke-38, Dresden, 12–25 November 2008, pada usia 16 tahun.',
    note:
      'Dokumen tugas mencantumkan tahun 2008 (penyelesaian norma). Arsip FIDE ' +
      'dan sebagian basis data pemain mencantumkan 2009, yaitu tahun ' +
      'ratifikasi gelar. Keduanya merujuk pencapaian yang sama.',
  },
  {
    year: 2012,
    event: 'Kejuaraan Catur Asia (Asian Continental Chess Championship)',
    location: 'Ho Chi Minh City, Vietnam',
    result: 'Juara 1 / Medali Emas',
    category: 'emas',
    milestone: true,
  },
  {
    year: 2013,
    event: 'Alexander the Great Open',
    location: 'Yunani',
    result: 'Juara 1',
    category: 'juara',
  },
  {
    year: 2013,
    event: 'SEA Games',
    location: 'Myanmar',
    result: '2 Medali Emas (Nomor Catur Cepat & Catur Kilat)',
    category: 'emas',
  },
  {
    year: 2014,
    event: 'Kejuaraan Catur Asia (Asian Continental Chess Championship)',
    location: 'Uni Emirat Arab',
    result: 'Juara 1 / Medali Emas',
    category: 'emas',
    milestone: true,
    verified:
      'Gelar juara Asia kedua setelah 2012, menjadikannya dua kali juara ' +
      'Asia kategori putri.',
  },
  {
    year: 2014,
    event: 'Federasi Catur Dunia (FIDE)',
    location: '—',
    result: 'Pecatur putri Indonesia pertama bergelar International Master (IM)',
    category: 'gelar',
    badge: 'IM',
    milestone: true,
  },
  {
    year: 2015,
    event: 'Moscow Open',
    location: 'Rusia',
    result: 'Best Woman Player (Pemain Wanita Terbaik)',
    category: 'penghargaan',
  },
  {
    year: 2018,
    event: 'Hjorth Open',
    location: 'Australia',
    result: 'Juara 1',
    category: 'juara',
  },
  {
    year: 2018,
    event: 'Doeberl Cup',
    location: 'Australia',
    result: 'Best Woman Player',
    category: 'penghargaan',
  },
  {
    year: 2021,
    event: 'Ekshibisi Nasional',
    location: 'Indonesia',
    result: 'Memecahkan rekor penonton live streaming catur terbesar di Indonesia',
    category: 'rekor',
  },
  {
    year: 2024,
    event: 'FIDE World Rapid Championship',
    location: 'Cipriani Wall Street, New York, Amerika Serikat',
    result: 'Peringkat 9 Besar Dunia Kategori Catur Cepat (Rapid)',
    category: 'penghargaan',
    milestone: true,
    verified:
      'Berlangsung 26–28 Desember 2024. Irene mengalahkan Juara Dunia Putri ' +
      'Ju Wenjun pada ronde ketiga, dan masuk ronde terakhir dengan poin sama ' +
      'bersama enam pemain teratas lainnya sebelum kalah dari Koneru Humpy ' +
      'yang akhirnya menjadi juara.',
  },
  {
    year: 2025,
    event: 'SEA Games',
    location: 'The Bazaar Hotel, Bangkok, Thailand',
    result: 'Medali Emas (Rapid Women Quadruple Beregu Putri)',
    category: 'emas',
    milestone: true,
    verified:
      'Final digelar 16 Desember 2025, Indonesia menundukkan Vietnam 2,5–1,5. ' +
      'Tim diperkuat Medina Warda Aulia, Irene Kharisma Sukandar, Chelsie ' +
      'Monica Ignesias Sihite, dan Laysa Latifah.',
  },
]);

/** Label kategori untuk badge dan statistik. */
export const CATEGORY_LABEL = Object.freeze({
  gelar: 'Gelar internasional',
  emas: 'Medali emas',
  perak: 'Medali perak',
  perunggu: 'Medali perunggu',
  juara: 'Juara turnamen',
  penghargaan: 'Penghargaan',
  rekor: 'Rekor',
});

export const sources = Object.freeze([
  'Tabel prestasi pada dokumen tugas',
  'Arsip hasil turnamen resmi FIDE dan Olimpiade Catur',
  'Pemberitaan SEA Games 2025 dan FIDE World Rapid Championship 2024',
]);

export default achievements;
