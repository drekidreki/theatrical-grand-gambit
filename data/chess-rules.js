/**
 * data/chess-rules.js
 * ===================
 * Materi peraturan catur untuk Babak II — Arena Pikir.
 *
 * SUMBER UTAMA: dokumen "Peraturan Catur" yang disediakan pengajar. Naskahnya
 * dipertahankan; penjelasan mekanisme, batasan, kondisi khusus, dan contoh
 * tidak dipangkas menjadi sekadar daftar nama bidak.
 *
 * KOTAK CATATAN VERIFIKASI
 * Beberapa butir pada dokumen sumber dicocokkan dengan FIDE Laws of Chess
 * yang berlaku. Bila ditemukan perbedaan, naskah sumber TETAP DITAMPILKAN
 * UTUH, lalu perbedaannya dijelaskan pada properti `verifyNote` yang di
 * antarmuka muncul sebagai kotak terpisah di bawahnya. Naskah pengajar tidak
 * diubah; hasil pengecekan ditambahkan, bukan menggantikan.
 */

export const ACTS = Object.freeze([
  { id: 'babak-1', roman: 'I', name: 'Mengenal Papan dan Bidak',
    blurb: 'Anatomi papan, koordinat, dan susunan awal pasukan.' },
  { id: 'babak-2', roman: 'II', name: 'Gerakan dan Strategi Dasar',
    blurb: 'Aturan gerak keenam bidak dan tiga fase permainan.' },
  { id: 'babak-3', roman: 'III', name: 'Aturan Khusus dan Akhir Permainan',
    blurb: 'Rokade, en passant, promosi, kondisi akhir, dan sanksi resmi.' },
]);

/* ===========================================================================
   BABAK I — Mengenal Papan dan Bidak
   ======================================================================== */

export const boardAnatomy = Object.freeze({
  id: 'anatomi-papan',
  act: 'babak-1',
  title: 'Anatomi Papan Catur',
  paragraphs: [
    'Papan catur adalah medan pertempuran berbentuk bujur sangkar yang terbagi menjadi 64 petak (kotak) dengan komposisi 32 petak terang (putih/krem) dan 32 petak gelap (hitam/coklat tua) yang tersusun secara selang-seling (8 × 8).',
  ],
  points: [
    {
      label: 'Posisi peletakan',
      text: 'Berdasarkan aturan resmi FIDE, papan harus diletakkan sedemikian rupa sehingga petak di sudut kanan bawah dari sudut pandang masing-masing pemain wajib berwarna putih (terang). Ingat rumusnya: "White on right" — putih di sebelah kanan.',
    },
    {
      label: 'Koordinat papan',
      text: 'Papan dibagi menjadi lajur vertikal (kolom) menggunakan abjad dari a sampai h, dari kiri ke kanan pemain putih, dan baris horizontal (ranking) menggunakan angka dari 1 sampai 8, dari bawah ke atas pemain putih. Setiap petak memiliki nama unik, misalnya petak e4, d5, atau h7.',
    },
  ],
});

export const startingPosition = Object.freeze({
  id: 'susunan-awal',
  act: 'babak-1',
  title: 'Susunan Awal Pasukan',
  paragraphs: [
    'Setiap pemain (Putih dan Hitam) memulai permainan dengan 16 buah catur. Pemain dengan bidak Putih selalu berhak melangkah pertama, memberikan inisiatif pembukaan (opening initiative).',
  ],
  points: [
    {
      label: 'Baris pion',
      text: 'Baris ke-2 untuk Putih dan baris ke-7 untuk Hitam ditempati oleh 8 Pion yang berbaris lurus.',
    },
    {
      label: 'Baris belakang',
      text: 'Pojok luar kiri dan kanan ditempati Benteng, di sebelahnya Kuda, lalu Gajah, dan dua petak tengah tersisa untuk Menteri dan Raja. Urutan dari kiri ke kanan: Benteng, Kuda, Gajah, Menteri, Raja, Gajah, Kuda, Benteng.',
    },
    {
      label: 'Aturan penempatan Menteri',
      text: 'Menteri wajib berdiri di petak yang warnanya sama dengan warna badannya — Menteri Putih di petak putih d1, Menteri Hitam di petak hitam d8. Raja berdiri di petak sisa di sebelah Menteri, yaitu Raja Putih di e1 dan Raja Hitam di e8. Akibatnya, Raja dan Menteri saling berhadapan secara vertikal di lajur d dan e.',
    },
  ],
});

/* ===========================================================================
   BABAK II — Gerakan setiap bidak
   ======================================================================== */

export const generalMovement =
  'Tidak ada bidak yang boleh melompati bidak lain di jalurnya, kecuali Kuda. ' +
  'Jika sebuah bidak mendarat di petak yang diduduki bidak lawan, bidak lawan ' +
  'tersebut dianggap "dimakan" (captured) dan dikeluarkan dari papan selamanya.';

/**
 * Ensiklopedia enam bidak.
 * `demoFen` dipakai papan interaktif untuk memperagakan pola geraknya.
 */
export const pieces = Object.freeze([
  {
    id: 'raja',
    type: 'k',
    name: 'Raja',
    english: 'King',
    glyph: '♔',
    value: null,
    valueLabel: 'Tak ternilai',
    movement:
      'Bergerak 1 petak ke segala arah: ke depan, ke belakang, ke samping, maupun secara diagonal.',
    special:
      'Batasan mutlak: Raja adalah bidak paling berharga. Raja tidak boleh melangkah ke petak yang sedang diancam atau dikontrol oleh bidak lawan — artinya Raja tidak boleh melangkah bunuh diri ke dalam posisi skak.',
    strategic:
      'Nilai strategis: tak ternilai. Kematian Raja berarti kekalahan total, yaitu skakmat.',
    demoFen: '8/8/8/3K4/8/8/8/8 w - - 0 1',
    demoSquare: 'd5',
  },
  {
    id: 'menteri',
    type: 'q',
    name: 'Menteri',
    english: 'Queen',
    glyph: '♕',
    value: 9,
    valueLabel: '9 poin',
    movement:
      'Bidak paling kuat dan fleksibel di papan. Menteri dapat bergerak sejauh mungkin secara lurus vertikal, lurus horizontal, maupun diagonal, selama tidak terhalang oleh bidak lain.',
    special: null,
    strategic: 'Nilai tukar standar: bernilai 9 poin.',
    demoFen: '8/8/8/3Q4/8/8/8/8 w - - 0 1',
    demoSquare: 'd5',
  },
  {
    id: 'benteng',
    type: 'r',
    name: 'Benteng',
    english: 'Rook',
    glyph: '♖',
    value: 5,
    valueLabel: '5 poin',
    movement:
      'Bergerak sejauh mungkin secara lurus vertikal (maju atau mundur) atau lurus horizontal (ke kiri atau ke kanan).',
    special: null,
    strategic: 'Nilai tukar standar: bernilai 5 poin.',
    demoFen: '8/8/8/3R4/8/8/8/8 w - - 0 1',
    demoSquare: 'd5',
  },
  {
    id: 'gajah',
    type: 'b',
    name: 'Gajah',
    english: 'Bishop',
    glyph: '♗',
    value: 3,
    valueLabel: '3 poin',
    movement: 'Bergerak sejauh mungkin secara diagonal ke segala arah.',
    special:
      'Batasan unik: karena sifat diagonalnya, Gajah selamanya terpaku pada warna petak tempat ia lahir. Gajah yang mulai di petak terang hanya akan bisa berjalan di petak terang, begitu pula sebaliknya. Setiap pemain memiliki satu Gajah terang (light-squared bishop) dan satu Gajah gelap (dark-squared bishop).',
    strategic: 'Nilai tukar standar: bernilai 3 poin.',
    demoFen: '8/8/8/3B4/8/8/8/8 w - - 0 1',
    demoSquare: 'd5',
  },
  {
    id: 'kuda',
    type: 'n',
    name: 'Kuda',
    english: 'Knight',
    glyph: '♘',
    value: 3,
    valueLabel: '3 poin',
    movement:
      'Bergerak membentuk huruf "L" — artinya 2 petak lurus ke satu arah, vertikal atau horizontal, lalu berbelok 1 petak ke samping tegak lurus. Kuda dapat melangkah maju, mundur, ke kiri, maupun ke kanan.',
    special:
      'Keistimewaan mutlak: Kuda adalah satu-satunya bidak yang diizinkan melompati bidak lain, baik kawan maupun lawan, di atas papan. Bidak yang dilompati tidak ikut mati. Kuda sangat mematikan dalam posisi tertutup (closed positions).',
    strategic:
      'Nilai tukar standar: bernilai 3 poin, sedikit di bawah atau setara Gajah, namun memiliki dinamika yang berbeda.',
    demoFen: '8/8/8/3N4/8/8/8/8 w - - 0 1',
    demoSquare: 'd5',
  },
  {
    id: 'pion',
    type: 'p',
    name: 'Pion',
    english: 'Pawn',
    glyph: '♙',
    value: 1,
    valueLabel: '1 poin',
    movement:
      'Pion hanya bisa maju lurus ke depan, tidak pernah bisa mundur ke belakang atau bergeser menyamping secara mandiri.',
    special:
      'Langkah pertama: khusus untuk setiap pion yang belum pernah bergerak sama sekali sejak awal permainan, pemain boleh memilih untuk memajukannya 1 petak atau langsung 2 petak sekaligus ke depan, asalkan jalur di depannya kosong. Untuk langkah selanjutnya, pion hanya boleh maju 1 petak per giliran. Cara memakan lawan: pion tidak bisa memakan bidak yang berada tepat di depannya — jika ada bidak lawan di sana, pion terkunci dan tidak bisa bergerak maju. Pion hanya bisa memakan bidak lawan secara diagonal sejauh 1 petak ke kiri depan atau kanan depan.',
    strategic:
      'Nilai tukar standar: bernilai 1 poin. Pion memiliki aturan mekanik paling kompleks di antara semua bidak.',
    demoFen: '8/8/8/2p1p3/3P4/8/8/8 w - - 0 1',
    demoSquare: 'd4',
  },
]);

/* ===========================================================================
   BABAK III — Aturan khusus
   ======================================================================== */

export const specialRules = Object.freeze([
  {
    id: 'rokade',
    act: 'babak-3',
    title: 'Rokade (Castling)',
    paragraphs: [
      'Rokade adalah gerakan bertahan sekaligus menyerang yang melibatkan Raja dan salah satu Benteng dalam satu giliran yang sama. Tujuannya untuk mengamankan Raja ke sudut papan dan mengeluarkan Benteng ke tengah permainan.',
      'Mekanisme gerakan: Raja digeser 2 petak penuh menuju ke arah Benteng, ke kiri atau ke kanan, kemudian Benteng tersebut melompati Raja dan mendarat di petak tepat di sebelah Raja.',
    ],
    checklist: {
      title: 'Syarat mutlak melakukan rokade',
      items: [
        'Raja dan Benteng yang bersangkutan belum pernah bergerak sama sekali sejak awal permainan. Bahkan jika sebelumnya mereka bergerak lalu kembali ke posisi semula, hak rokade tetap hangus.',
        'Tidak ada bidak apa pun, baik kawan maupun lawan, yang berdiri di antara Raja dan Benteng tersebut.',
        'Raja tidak sedang berada dalam posisi skak.',
        'Petak yang dilewati oleh Raja maupun petak tujuan akhir Raja tidak sedang diancam atau diserang oleh bidak lawan.',
      ],
    },
    variants: [
      { label: 'Rokade Pendek (Kingside Castling)', text: 'Raja digeser 2 petak ke sisi kanan. Notasi: 0-0.' },
      { label: 'Rokade Panjang (Queenside Castling)', text: 'Raja digeser 2 petak ke sisi kiri, melewati posisi Menteri. Notasi: 0-0-0.' },
    ],
    demoFen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1',
  },
  {
    id: 'en-passant',
    act: 'babak-3',
    title: 'En Passant ("Sambil Lalu")',
    paragraphs: [
      'Definisi: aturan tangkapan khusus bagi pion terhadap pion lawan yang melakukan langkah ganda di sebelah posisinya.',
      'Skenario: misalkan pion Putih berada di baris ke-5. Pemain Hitam menjalankan pionnya dari baris ke-7 langsung maju 2 petak, melewati jangkauan serangan diagonal pion Putih, dan berhenti tepat bersebelahan atau sejajar di samping pion Putih.',
      'Eksekusi: pion Putih berhak memakan pion Hitam tersebut secara diagonal seolah-olah pion Hitam itu hanya maju 1 petak, dan pion Putih mendarat di petak kosong di belakang bekas pion Hitam tersebut. Pion Hitam yang dimakan dikeluarkan dari papan.',
    ],
    checklist: {
      title: 'Aturan waktu (window of opportunity)',
      items: [
        'Hak en passant wajib dilakukan seketika pada giliran tepat setelah langkah ganda lawan tersebut.',
        'Jika pemain melewatkan giliran itu dan melakukan langkah lain, hak en passant hangus selamanya.',
      ],
    },
    demoFen: '4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1',
    demoHint: 'Pion putih di e5 dapat memakan pion hitam d5 dengan melangkah ke d6.',
  },
  {
    id: 'promosi',
    act: 'babak-3',
    title: 'Promosi Pion (Promotion)',
    paragraphs: [
      'Definisi: transformasi radikal saat pion berhasil merangsek maju hingga mencapai baris paling ujung di wilayah teritorial musuh — baris ke-8 bagi pion Putih, baris ke-1 bagi pion Hitam.',
      'Mekanisme: saat menginjak baris akhir tersebut, pion wajib langsung diubah menjadi buah catur lain milik pemain yang sama, yaitu Menteri, Benteng, Gajah, atau Kuda. Pilihannya bebas sesuai strategi dan tidak dibatasi oleh buah catur yang sudah mati sebelumnya.',
      'Fakta unik: seorang pemain bisa memiliki lebih dari satu Menteri di atas papan secara bersamaan jika berhasil mempromosikan beberapa pion. Promosi tidak boleh dibiarkan tetap menjadi pion dan tidak boleh menjadi Raja.',
    ],
    demoFen: '4k3/3P4/8/8/8/8/8/4K3 w - - 0 1',
    demoHint: 'Pion putih di d7 dapat melangkah ke d8 dan langsung dipromosikan.',
  },
]);

/* ===========================================================================
   BABAK III — Kondisi akhir permainan
   ======================================================================== */

export const endConditions = Object.freeze({
  check: {
    id: 'skak',
    title: 'Skak (Check) dan Skakmat (Checkmate)',
    paragraphs: [
      'Skak adalah kondisi saat Raja sedang diserang secara langsung oleh bidak lawan dan berada dalam ancaman tertangkap pada giliran berikutnya.',
    ],
    checklist: {
      title: 'Tiga cara wajib menyelamatkan Raja dari skak',
      items: [
        'Melarikan Raja ke petak tetangga yang aman.',
        'Menutup jalur serangan dengan menaruh bidak lain di antara Raja dan penyerang.',
        'Memakan bidak penyerang.',
      ],
    },
    closing:
      'Skakmat adalah puncak dari permainan catur: kondisi saat Raja terkena skak dan tidak ada satu pun langkah sah di seluruh papan yang bisa melepaskan Raja dari ancaman tersebut. Pemain yang diskakmat dinyatakan kalah, dan lawannya menang mutlak.',
    demoFen: 'rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3',
    demoHint: 'Posisi skakmat tercepat dalam catur, dikenal sebagai Fool’s Mate.',
  },

  draws: {
    id: 'remis',
    title: 'Berbagai Kondisi Remis (Draw / Seri)',
    intro:
      'Pertandingan tidak selalu berakhir dengan kemenangan salah satu pihak. ' +
      'Hasil imbang sah terjadi dalam lima situasi berikut.',
    items: [
      {
        label: 'Pat (Stalemate)',
        text: 'Giliran seorang pemain untuk melangkah, Rajanya tidak sedang dalam posisi skak, tetapi pemain tersebut sama sekali tidak memiliki langkah yang sah untuk semua bidaknya. Permainan langsung dinyatakan remis seketika.',
      },
      {
        label: 'Kesepakatan Bersama (Mutual Agreement)',
        text: 'Kedua pemain sepakat untuk mengakhiri pertandingan dengan skor imbang, biasanya ditawarkan setelah langkah tertentu.',
      },
      {
        label: 'Pengulangan Posisi Tiga Kali (Threefold Repetition)',
        text: 'Posisi bidak yang persis sama di atas papan terjadi sebanyak 3 kali dengan giliran jalan pemain yang sama.',
        verifyNote:
          'Dokumen sumber menulis "3 kali berturut-turut (tidak harus di langkah yang berurutan)" — dua keterangan yang saling bertentangan. Menurut FIDE Laws of Chess, yang benar adalah yang kedua: ketiga kemunculan posisi TIDAK harus berurutan. Selain itu posisi baru dianggap sama bila giliran jalan, hak rokade, dan hak en passant juga sama persis.',
      },
      {
        label: 'Aturan 50 Langkah (50-Move Rule)',
        text: 'Tidak ada satu pun pion yang bergerak dan tidak ada satu pun bidak yang dimakan selama 50 langkah berturut-turut dari kedua belah pihak.',
      },
      {
        label: 'Materi Tidak Cukup (Insufficient Material)',
        text: 'Kondisi di mana kedua pemain sama-sama tidak memiliki sisa bidak yang cukup untuk melakukan skakmat kepada lawan.',
        examples: [
          'Raja vs Raja',
          'Raja + Gajah vs Raja',
          'Raja + Kuda vs Raja',
          'Raja + Gajah vs Raja + Gajah, dengan kedua Gajah berada di warna petak yang sama',
        ],
      },
    ],
  },
});

/* ===========================================================================
   BAB V — Kesalahan, pelanggaran, dan sanksi resmi
   ======================================================================== */

export const violations = Object.freeze({
  intro:
    'Dalam turnamen catur resmi di bawah naungan FIDE dan Percasi, disiplin ' +
    'sangat dijaga ketat oleh wasit (arbiter). Berikut rincian kesalahan dan ' +
    'sanksinya.',

  items: [
    {
      id: 'illegal-move',
      title: 'Langkah Tidak Sah (Illegal Move)',
      paragraphs: [
        'Sebuah langkah dianggap sah sebagai pelanggaran resmi setelah pemain tersebut melepaskan tangannya dari bidak dan menekan jam catur.',
      ],
      checklist: {
        title: 'Contoh illegal move',
        items: [
          'Membiarkan Raja tetap dalam posisi skak atau melangkah ke petak yang terancam.',
          'Menggerakkan Kuda lurus seperti Benteng, atau Gajah melompati bidak.',
          'Melakukan rokade ilegal, misalnya melewati petak yang dijaga musuh.',
          'Menekan jam catur menggunakan tangan yang berbeda dengan tangan yang memegang bidak, atau menggunakan buah catur untuk menekan tombol jam.',
        ],
      },
      sanctions: {
        title: 'Sanksi illegal move menurut dokumen sumber',
        items: [
          {
            label: 'Catur Standar (Classic)',
            text: 'Pada pelanggaran illegal move pertama, wasit akan menghentikan pertandingan dan memberikan tambahan waktu 2 menit kepada pihak lawan. Jika pemain yang sama melakukan illegal move untuk kedua kalinya, pemain tersebut dinyatakan KALAH, kecuali posisi awal tidak memungkinkan lawan menang, maka dinyatakan remis.',
          },
          {
            label: 'Catur Cepat (Rapid) & Kilat (Blitz)',
            text: 'Pada kategori cepat/kilat, melakukan 1 kali illegal move, jika diprotes dengan benar oleh lawan dan wasit menyaksikan, dapat langsung berakibat kekalahan seketika, karena aturan waktu yang ketat.',
          },
        ],
      },
      verifyNote: {
        title: 'Catatan Verifikasi — FIDE Laws of Chess',
        paragraphs: [
          'Ketentuan untuk kategori Rapid dan Blitz pada dokumen sumber mengacu pada aturan lama. FIDE mengubahnya terhitung 1 Januari 2018, justru dengan tujuan menyamakan aturan catur klasik dengan rapid dan blitz.',
          'Menurut Pasal 7.5.3 yang berlaku sekarang, illegal move PERTAMA tidak langsung berakibat kalah di kategori mana pun. Lawan mendapat tambahan waktu — 2 menit untuk standar dan rapid, dan 1 menit untuk blitz sesuai Appendix B. Illegal move KEDUA oleh pemain yang sama barulah berakibat kekalahan, dan ini berlaku untuk ketiga kategori. Pengecualiannya tetap sama: bila posisi tidak memungkinkan lawan melakukan skakmat dengan rangkaian langkah sah apa pun, hasilnya remis.',
          'Ketentuan kekalahan seketika pada satu illegal move kini hanya berlaku untuk rapid dan blitz yang dimainkan TANPA pengawasan wasit yang memadai, yaitu ketika lawan sendiri yang mengajukan klaim sebelum melangkah.',
          'Satu catatan kecil lagi: menekan jam dengan tangan yang berbeda bukan termasuk illegal move menurut Laws of Chess, melainkan pelanggaran prosedur tersendiri yang ditangani wasit dengan sanksi terpisah.',
        ],
      },
    },

    {
      id: 'touch-move',
      title: 'Aturan Sentuh-Jalan (Touch-Move Rule)',
      paragraphs: ['Aturan paling fundamental dalam etika kompetisi catur.'],
      checklist: {
        title: 'Empat ketentuan sentuh-jalan',
        items: [
          '"Satu Sentuh, Jalan" (Touch and Move): jika pemain dengan sengaja menyentuh salah satu bidaknya sendiri di atas papan, ia wajib melangkahkan bidak tersebut selama ada langkah yang sah.',
          '"Sentuh Lawan, Makan" (Touch and Capture): jika pemain dengan sengaja menyentuh bidak milik lawan, ia wajib memakan bidak tersebut jika ada cara yang sah untuk melakukannya.',
          'Kecuali merapikan posisi (J’adoube): jika posisi bidak miring di tengah petak dan pemain ingin merapikannya tanpa berniat melangkah, ia wajib mengucapkan kata "J’adoube" atau "Saya perbaiki" terlebih dahulu kepada lawan atau wasit sebelum menyentuh bidak tersebut. Menyentuh bidak tanpa izin dan berdalih "hanya merapikan" tetap akan dikenai sanksi touch-move rule.',
          'Kesalahan rokade: saat hendak rokade, pemain wajib menyentuh Raja terlebih dahulu, bukan Benteng. Jika pemain menyentuh Benteng terlebih dahulu, ia hanya diwajibkan melangkah dengan Benteng tersebut dan kehilangan hak rokade.',
        ],
      },
    },

    {
      id: 'perilaku',
      title: 'Pelanggaran Perilaku dan Perangkat Elektronik',
      paragraphs: [],
      checklist: {
        title: 'Tiga kelompok pelanggaran',
        items: [
          'Perangkat elektronik: membawa handphone, smartwatch, tablet, atau alat komunikasi aktif apa pun ke area meja pertandingan, bahkan dalam keadaan mati atau silent, adalah pelanggaran berat yang langsung berakibat diskualifikasi dan kekalahan mutlak, dan bahkan pencabutan gelar catur.',
          'Mengganggu lawan: berbicara berlebihan, menawarkan remis secara terus-menerus dan mengganggu konsentrasi lawan (psychological distraction), atau bersikap tidak sportif dapat dikenai teguran keras, pengurangan waktu, hingga pengusiran dari ruang pertandingan oleh wasit.',
          'Menggunakan program: dengan berkembangnya ranah catur online dan perpindahan banyak turnamen catur ke website online, muncul juga kesempatan untuk melakukan tindak curang dengan menggunakan program artificial intelligence untuk memainkan catur atau memberi bantuan ke pemain. Seperti pelanggaran perangkat elektronik, menggunakan bantuan AI di kompetisi catur dapat berakibat diskualifikasi, kekalahan mutlak, dan pencabutan gelar.',
        ],
      },
      verifyNote: {
        title: 'Catatan Verifikasi — FIDE Laws of Chess',
        paragraphs: [
          'Sanksi perangkat elektronik pada dokumen sumber lebih berat daripada yang tertulis di Laws of Chess. Pasal 11.3.2 menetapkan sanksi kekalahan PARTAI bagi pemain yang kedapatan membawa perangkat semacam itu pada badannya di area pertandingan, dan regulasi penyelenggara diperbolehkan menetapkan sanksi yang lebih ringan. Banyak turnamen, misalnya, mengizinkan ponsel dalam keadaan mati sepenuhnya di dalam tas.',
          'Diskualifikasi dari seluruh turnamen dan pencabutan gelar bukan sanksi otomatis menurut Laws of Chess. Keduanya merupakan sanksi berat yang hanya dapat dijatuhkan melalui proses disiplin tersendiri, biasanya pada kasus kecurangan terbukti — misalnya penggunaan bantuan mesin, yang ditangani FIDE Fair Play Commission, bukan oleh wasit di meja pertandingan.',
          'Isi pokok materi ini tetap benar: membawa perangkat komunikasi dan memakai bantuan program adalah pelanggaran berat dengan konsekuensi serius. Yang perlu diluruskan hanyalah tingkat sanksi otomatisnya.',
        ],
      },
    },
  ],
});

/* ===========================================================================
   Tiga fase permainan
   ======================================================================== */

export const gamePhases = Object.freeze([
  {
    id: 'opening',
    roman: 'I',
    name: 'Opening',
    nameId: 'Pembukaan',
    paragraphs: [
      'Fase pembukaan adalah sekitar sepuluh sampai lima belas langkah pertama, saat kedua pemain mengeluarkan pasukannya dari baris belakang. Tiga tujuan utamanya adalah mengembangkan bidak, menguasai petak pusat, dan mengamankan Raja.',
      'Penguasaan pusat penting karena bidak yang berdiri di tengah papan menjangkau lebih banyak petak daripada bidak yang terdesak ke tepi. Seekor Kuda di d5 mengontrol delapan petak, sedangkan Kuda yang sama di a1 hanya mengontrol dua. Perlindungan Raja umumnya dilakukan lewat rokade, yang sekaligus menyelesaikan dua pekerjaan dalam satu langkah: Raja bersembunyi ke sudut, dan Benteng keluar ke tengah.',
    ],
    demoFen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    demoHint: 'Pembukaan Italia: kedua pihak menguasai pusat dan siap melakukan rokade.',
  },
  {
    id: 'middlegame',
    roman: 'II',
    name: 'Middlegame',
    nameId: 'Permainan Tengah',
    paragraphs: [
      'Fase permainan tengah dimulai setelah bidak-bidak selesai dikembangkan. Di sinilah strategi jangka panjang dan taktik jangka pendek bertemu. Strategi berbicara tentang rencana besar seperti menguasai lajur terbuka, memperbaiki struktur pion, atau menempatkan Kuda di petak yang tidak bisa diusir pion lawan.',
      'Taktik berbicara tentang perhitungan konkret beberapa langkah ke depan: garpu Kuda yang menyerang dua bidak sekaligus, pin yang membuat sebuah bidak tidak bisa bergerak karena melindungi bidak lebih berharga di belakangnya, atau pengorbanan materi demi serangan ke Raja lawan. Pertukaran bidak dinilai dengan nilai tukar standar, tetapi nilai itu hanya pedoman — Kuda bernilai 3 poin bisa jauh lebih berharga daripada Benteng bernilai 5 poin bila ia menduduki posisi yang menentukan.',
    ],
    demoFen: 'r2q1rk1/pp2bppp/2n1bn2/2pp4/3P4/2NBPN2/PP3PPP/R1BQ1RK1 w - - 0 10',
    demoHint: 'Posisi tengah yang seimbang: kedua pihak sudah rokade dan mulai menyusun rencana.',
  },
  {
    id: 'endgame',
    roman: 'III',
    name: 'Endgame',
    nameId: 'Akhir Permainan',
    paragraphs: [
      'Fase akhir permainan dimulai ketika sebagian besar bidak sudah habis dipertukarkan. Di sini peran Raja berubah total. Sepanjang pembukaan dan permainan tengah, Raja adalah bidak yang harus disembunyikan; di akhir permainan, Raja berubah menjadi bidak penyerang yang aktif karena ancaman skakmat sudah jauh berkurang.',
      'Pion pun berubah nilainya. Pion yang di awal permainan hanya bernilai 1 poin bisa menjadi penentu kemenangan, karena setiap pion yang berhasil mencapai baris terakhir berubah menjadi Menteri. Karena itu teknik akhir permainan banyak berurusan dengan mengawal pion sampai ke ujung, sekaligus menghentikan pion lawan melakukan hal yang sama.',
    ],
    demoFen: '8/5p2/4k3/8/4K3/8/5P2/8 w - - 0 1',
    demoHint: 'Akhir permainan Raja dan pion: Raja menjadi bidak aktif, pion menjadi penentu.',
  },
]);

export const sources = Object.freeze([
  'Dokumen "Peraturan Catur" yang disediakan pengajar',
  'FIDE Laws of Chess, termasuk perubahan Pasal 7.5 yang berlaku 1 Januari 2018 dan Appendix A dan B untuk Rapid dan Blitz',
]);

export default {
  ACTS, boardAnatomy, startingPosition, generalMovement, pieces,
  specialRules, endConditions, violations, gamePhases, sources,
};
