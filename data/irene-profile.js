/**
 * data/irene-profile.js
 * =====================
 * Profil Irene Kharisma Sukandar.
 *
 * ATURAN INTEGRITAS
 * Setiap butir di berkas ini berasal dari dokumen tugas yang disediakan atau
 * dari sumber publik yang dapat ditelusuri. Butir yang masih perlu dicek
 * diberi properti `needsVerification: true` berikut alasannya — ditandai,
 * bukan dikarang penggantinya.
 */

export const profile = Object.freeze({
  namaLengkap: 'Irene Kharisma Sukandar',
  namaPanggilan: 'Irene',
  fideId: '7101384',
  lahir: { tanggal: '7 April 1992', tempat: 'Jakarta, Indonesia' },
  gelarTerkini: 'International Master (IM) · Woman Grandmaster (WGM)',
  negara: 'Indonesia',

  orangTua: {
    ayah: 'Singgih Heyzkel',
    ibu: 'Cici Ratna Mulya',
    catatan:
      'Sang ayah merupakan atlet sekaligus pelatih tenis meja, namun kedua ' +
      'orang tuanya tidak memaksakan warisan profesi keluarga tersebut.',
  },

  pendidikan: [
    {
      lembaga: 'Sekolah Catur Utut Adianto (SCUA), Bekasi',
      keterangan: 'Pendidikan catur intensif selama enam tahun.',
      pembimbing: 'Master Internasional (MI) Ivan Situru',
    },
    {
      lembaga: 'SMA Nusantara, Jakarta',
      keterangan:
        'Tetap menempuh pendidikan formal di tengah jadwal pemusatan latihan ' +
        'dan turnamen di dalam maupun luar negeri.',
    },
  ],

  panutan: {
    nama: 'Judit Polgar',
    asal: 'Hungaria',
    keterangan: 'Pecatur legendaris dunia yang dijadikan standar dan inspirasi.',
  },

  /**
   * Riwayat gelar. Perhatikan catatan verifikasi pada gelar WGM: norma
   * terakhirnya diselesaikan pada Olimpiade Catur Dresden, November 2008,
   * sedangkan pencantuman gelar pada arsip FIDE tertera tahun 2009.
   */
  gelar: [
    { tahun: 2001, nama: 'Master Percasi', sumber: 'Dokumen tugas' },
    { tahun: 2002, nama: 'Master Nasional Wanita', sumber: 'Dokumen tugas' },
    { tahun: 2004, nama: 'Master FIDE Wanita (WFM)', sumber: 'Dokumen tugas' },
    {
      tahun: 2008,
      nama: 'Woman Grandmaster (WGM)',
      keterangan:
        'Pecatur wanita Indonesia pertama yang meraih gelar ini. Norma ' +
        'terakhir diselesaikan di Olimpiade Catur ke-38, Dresden, Jerman, ' +
        'November 2008, pada usia 16 tahun.',
      catatanVerifikasi:
        'Arsip FIDE dan beberapa basis data pemain mencantumkan tahun gelar ' +
        '2009, yaitu tahun ratifikasi. Keduanya merujuk pencapaian yang sama.',
      sumber: 'Dokumen tugas; pemberitaan Olimpiade Catur Dresden 2008',
    },
    {
      tahun: 2014,
      nama: 'International Master (IM)',
      keterangan: 'Pecatur putri Indonesia pertama yang meraih gelar ini.',
      sumber: 'Arsip FIDE',
    },
  ],

  /**
   * Fakta singkat yang muncul ketika bidak raksasa di panggung utama diklik.
   * Kuncinya dirujuk oleh js/animation-controller.js.
   */
  stageFacts: {
    start: {
      title: 'Dimulai pada usia tujuh tahun',
      body:
        'Irene mulai menekuni catur sejak usia tujuh tahun. Pada debut ' +
        'kompetitifnya di Kejuaraan Nasional Catur 1999 di Bekasi, ia pulang ' +
        'tanpa meraih satu poin pun — kekalahan yang justru dijadikannya ' +
        'tolok ukur kelemahan diri dan pemicu untuk berlatih lebih keras.',
      source: 'Dokumen analisis tugas',
    },
    wgm: {
      title: 'WGM pertama Indonesia',
      body:
        'Pada Olimpiade Catur ke-38 di Dresden, Jerman, November 2008, Irene ' +
        'menyelesaikan norma terakhirnya dan menjadi pecatur wanita Indonesia ' +
        'pertama bergelar Woman Grandmaster. Usianya saat itu 16 tahun.',
      source: 'Dokumen tugas; pemberitaan Olimpiade Catur Dresden 2008',
    },
    im: {
      title: 'International Master, 2014',
      body:
        'Enam tahun setelah WGM, Irene menjadi pecatur putri Indonesia pertama ' +
        'yang meraih gelar International Master — gelar yang tidak dibatasi ' +
        'kategori putri dan menuntut norma melawan lawan bergelar.',
      source: 'Arsip FIDE',
    },
    asia: {
      title: 'Dua kali Juara Asia',
      body:
        'Irene memenangi Asian Continental Chess Championship kategori putri ' +
        'sebanyak dua kali: di Ho Chi Minh City, Vietnam (2012) dan di Uni ' +
        'Emirat Arab (2014).',
      source: 'Dokumen tugas; arsip kejuaraan',
    },
    peak: {
      title: 'Rating tertinggi 2432',
      body:
        'Rating Standard tertinggi Irene tercatat 2432 pada daftar rating FIDE ' +
        'September 2016 — titik puncak dalam 206 periode rating yang ' +
        'tersedia di dataset website ini.',
      source: 'Riwayat rating resmi FIDE',
    },
  },

  pengantar:
    'Irene Kharisma Sukandar adalah Grandmaster catur Indonesia yang memulai ' +
    'perjalanannya sejak usia tujuh tahun. Dari sebuah kekalahan telak pada ' +
    'kejuaraan nasional pertamanya, ia menapak hingga menjadi pecatur wanita ' +
    'Indonesia pertama bergelar Woman Grandmaster, lalu International Master, ' +
    'dan dua kali juara Asia. Empat babak berikut menelusuri perjalanan itu ' +
    'dari empat sudut pandang: biografi, olahraga catur, nilai keteladanan, ' +
    'dan angka.',

  penutup:
    'Perjalanan Irene memperlihatkan bahwa prestasi puncak bukan hasil satu ' +
    'langkah besar, melainkan akumulasi langkah-langkah kecil yang konsisten ' +
    'selama dua dekade. Grafik rating pada Babak IV memberi bentuk kuantitatif ' +
    'pada perjalanan yang pada Babak III dibaca melalui nilai keteladanannya.',
});

/** Aset yang harus disediakan pembuat website. Dipakai untuk slot placeholder. */
export const requiredAssets = Object.freeze({
  infographic: {
    path: '/assets/images/infographic/irene-infografis.webp',
    label: 'Infografis Irene Kharisma Sukandar',
    hint:
      'Letakkan berkas infografis asli pada path di atas. Jangan membuat ulang ' +
      'desainnya; website hanya menampilkan gambar yang disediakan.',
  },
  video: {
    path: '/assets/videos/irene-documentary.mp4',
    poster: '/assets/images/irene/video-poster.webp',
    label: 'Video dokumenter singkat',
    hint:
      'Letakkan video terkompresi (H.264) dan gambar poster pada path di atas. ' +
      'Video tidak akan diputar otomatis dengan suara.',
  },
  portrait: {
    path: '/assets/images/irene/portrait.webp',
    label: 'Foto potret',
    hint: 'Foto potret untuk bagian pembuka Babak I.',
  },
  ambient: {
    path: '/assets/audio/ambient.mp3',
    label: 'Musik latar suasana teater',
    hint: 'Hanya diputar setelah pengunjung menekan tombol suara.',
  },
});

export default profile;
