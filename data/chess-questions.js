/**
 * data/chess-questions.js
 * =======================
 * Bank soal untuk fitur "Guess the Move" di Babak II.
 *
 * Setiap soal memuat properti `verify` yang dipakai tools/verify-questions.mjs
 * untuk MEMBUKTIKAN kunci jawabannya terhadap mesin aturan catur. Tidak ada
 * kunci jawaban yang hanya mengandalkan keyakinan penulis soal.
 *
 * Bentuk `verify`:
 *   { kind: 'legal',    move: {from, to, promotion?} }  langkah harus sah
 *   { kind: 'illegal',  move: {from, to} }              langkah harus tidak sah
 *   { kind: 'mate',     move: {from, to} }              langkah menghasilkan skakmat
 *   { kind: 'state',    state: 'stalemate' | 'checkmate' | 'check' }
 *   { kind: 'unreachable', square, from }               petak mustahil dicapai
 *
 * Notasi pada pilihan jawaban memakai huruf Indonesia:
 *   R Raja · M Menteri · B Benteng · G Gajah · K Kuda · pion tanpa huruf.
 */

/**
 * @typedef {Object} Question
 * @property {string} id
 * @property {string} topic
 * @property {'mudah'|'sedang'|'sulit'} level
 * @property {string} fen
 * @property {string} prompt
 * @property {string} [hint]
 * @property {string[]} options
 * @property {number} answer      Indeks jawaban benar pada `options`.
 * @property {string} explanation
 * @property {Object} verify
 */

/** @type {readonly Question[]} */
export const questions = Object.freeze([
  {
    id: 'q-kuda',
    topic: 'Gerak Kuda',
    level: 'mudah',
    fen: '4k3/8/8/3N4/8/8/8/4K3 w - - 0 1',
    prompt: 'Kuda putih berdiri di d5. Manakah langkah yang sah untuk Kuda?',
    hint: 'Kuda bergerak membentuk huruf L: dua petak lurus, lalu satu petak tegak lurus.',
    options: ['Kd5–f6', 'Kd5–d7', 'Kd5–g5', 'Kd5–d3'],
    answer: 0,
    explanation:
      'Kd5–f6 adalah pola L yang benar: dua petak ke kanan lalu satu petak ke atas. ' +
      'Tiga pilihan lainnya adalah gerakan lurus — d7 dan d3 bergerak vertikal seperti ' +
      'Benteng, g5 bergerak horizontal. Kuda tidak pernah bergerak lurus.',
    verify: { kind: 'legal', move: { from: 'd5', to: 'f6' } },
  },

  {
    id: 'q-gajah-warna',
    topic: 'Batasan warna Gajah',
    level: 'mudah',
    fen: '4k3/8/8/8/2B5/8/8/4K3 w - - 0 1',
    prompt:
      'Gajah putih berdiri di c4, sebuah petak terang. Petak manakah yang ' +
      'TIDAK AKAN PERNAH bisa dicapai Gajah ini, berapa pun banyaknya langkah?',
    hint: 'Perhatikan warna petak tujuan, bukan jaraknya.',
    options: ['d5', 'f7', 'e5', 'a2'],
    answer: 2,
    explanation:
      'e5 adalah petak gelap, sedangkan Gajah ini lahir di petak terang c4. ' +
      'Karena hanya bergerak diagonal, Gajah selamanya terpaku pada satu warna petak. ' +
      'Petak d5, f7, dan a2 semuanya terang sehingga dapat dicapai, sejauh apa pun ' +
      'jaraknya. Inilah sebabnya setiap pemain memiliki satu Gajah terang dan satu ' +
      'Gajah gelap yang tidak pernah bisa saling menggantikan.',
    verify: { kind: 'unreachable', from: 'c4', square: 'e5' },
  },

  {
    id: 'q-pion-terkunci',
    topic: 'Pion tidak memakan lurus',
    level: 'mudah',
    fen: '4k3/8/8/8/3p4/3P4/8/4K3 w - - 0 1',
    prompt:
      'Pion putih di d3 berhadapan langsung dengan pion hitam di d4. ' +
      'Apa yang dapat dilakukan pion putih tersebut?',
    hint: 'Pion memakan dengan cara yang berbeda dari cara ia melangkah.',
    options: [
      'Memakan pion hitam dengan d3xd4',
      'Maju ke d4 dan mendorong pion hitam mundur',
      'Tidak dapat bergerak maju sama sekali — pion ini terkunci',
      'Bergeser ke samping ke c3 atau e3',
    ],
    answer: 2,
    explanation:
      'Pion tidak bisa memakan bidak yang berada tepat di depannya, dan tidak bisa ' +
      'maju ke petak yang sudah ditempati. Pion hanya memakan secara diagonal satu ' +
      'petak ke kiri depan atau kanan depan. Karena tidak ada bidak hitam di c4 maupun ' +
      'e4, pion d3 benar-benar terkunci sampai keadaan di sekitarnya berubah. Pion juga ' +
      'tidak pernah bisa bergeser menyamping secara mandiri.',
    verify: { kind: 'illegal', move: { from: 'd3', to: 'd4' } },
  },

  {
    id: 'q-skak-keluar',
    topic: 'Menyelamatkan Raja dari skak',
    level: 'sedang',
    fen: '4k3/8/8/8/8/8/4r3/4K3 w - - 0 1',
    prompt:
      'Raja putih di e1 terkena skak dari Benteng hitam di e2. ' +
      'Manakah di antara langkah berikut yang sah?',
    hint: 'Benteng menguasai seluruh lajur e dan seluruh baris ke-2.',
    options: ['Rd2', 'Rf2', 'Rd1', 'Raja tetap diam dan menunggu'],
    answer: 2,
    explanation:
      'Rd1 memindahkan Raja keluar dari lajur e menuju petak yang tidak dijangkau ' +
      'Benteng. Rd2 dan Rf2 keduanya mendarat di baris ke-2 yang sepenuhnya dikuasai ' +
      'Benteng e2 — melangkah ke sana berarti bunuh diri ke dalam skak, dan itu tidak ' +
      'pernah sah. Membiarkan Raja tetap dalam posisi skak juga tidak diperbolehkan: ' +
      'pemain wajib menyelamatkan Rajanya dengan melarikan diri, menutup jalur serangan, ' +
      'atau memakan bidak penyerang.',
    verify: { kind: 'legal', move: { from: 'e1', to: 'd1' } },
  },

  {
    id: 'q-skakmat',
    topic: 'Skakmat dalam satu langkah',
    level: 'sedang',
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
    prompt:
      'Giliran Putih. Menteri di f3 dan Gajah di c4 sama-sama mengarah ke satu ' +
      'titik lemah. Langkah manakah yang langsung menghasilkan skakmat?',
    hint: 'Petak f7 hanya dijaga oleh Raja hitam, dan ada bidak putih kedua yang menjaganya.',
    options: ['Mxf7#', 'Gxf7+', 'Mf3–f6', 'Kg1–f3'],
    answer: 0,
    explanation:
      'Mxf7 adalah skakmat. Menteri memakan pion f7 dan menyerang Raja hitam dari jarak ' +
      'satu petak, sementara Gajah c4 menjaga Menteri itu lewat diagonal c4–d5–e6–f7 ' +
      'sehingga Raja tidak bisa memakannya. Raja hitam juga tidak punya petak pelarian: ' +
      'd8 ditempati Menteri sendiri, f8 ditempati Gajah sendiri, d7 ditempati pion sendiri, ' +
      'dan e7 diserang Menteri putih. Gxf7+ hanya memberi skak biasa karena Raja dapat ' +
      'melangkah ke e7. Pola serangan ke f7 ini dikenal sebagai Scholar’s Mate.',
    verify: { kind: 'mate', move: { from: 'f3', to: 'f7' } },
  },

  {
    id: 'q-en-passant',
    topic: 'En passant',
    level: 'sulit',
    fen: '4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1',
    prompt:
      'Pion hitam baru saja melaju dua petak sekaligus dari d7 ke d5, melewati ' +
      'jangkauan serangan pion putih di e5. Langkah manakah yang memanfaatkan ' +
      'aturan en passant?',
    hint: 'Pion penangkap mendarat di petak yang dilewati pion lawan, bukan di petak tujuannya.',
    options: ['exd6 e.p.', 'exd5', 'e5–e6', 'exf6'],
    answer: 0,
    explanation:
      'exd6 adalah en passant. Pion putih memakan pion hitam secara diagonal seolah-olah ' +
      'pion hitam itu hanya maju satu petak ke d6, lalu mendarat di d6 sementara pion ' +
      'hitam di d5 diangkat dari papan. exd5 tidak sah karena pion memakan secara ' +
      'diagonal, bukan lurus ke samping. e5–e6 adalah langkah maju biasa yang sah, tetapi ' +
      'bukan en passant — dan memilihnya berarti hak en passant hangus selamanya, karena ' +
      'hak itu hanya berlaku pada giliran tepat setelah langkah ganda lawan.',
    verify: { kind: 'legal', move: { from: 'e5', to: 'd6' } },
  },

  {
    id: 'q-promosi',
    topic: 'Promosi pion',
    level: 'sedang',
    fen: '7k/3P4/8/8/8/8/8/4K3 w - - 0 1',
    prompt:
      'Pion putih di d7 siap mencapai baris terakhir. Apa yang terjadi ketika ' +
      'pion itu melangkah ke d8?',
    hint: 'Promosi bersifat wajib dan terjadi seketika pada langkah yang sama.',
    options: [
      'Pion wajib langsung berubah menjadi Menteri, Benteng, Gajah, atau Kuda',
      'Pion boleh tetap menjadi pion bila pemain menghendaki',
      'Pion dapat diubah menjadi Raja kedua',
      'Pion baru boleh dipromosikan pada giliran berikutnya',
    ],
    answer: 0,
    explanation:
      'Promosi bersifat wajib dan terjadi pada langkah yang sama, bukan pada giliran ' +
      'berikutnya. Pion harus diganti dengan Menteri, Benteng, Gajah, atau Kuda milik ' +
      'pemain yang sama, dan pilihannya bebas sesuai strategi — tidak dibatasi oleh buah ' +
      'catur yang sudah mati sebelumnya. Karena itu seorang pemain bisa memiliki dua ' +
      'Menteri atau lebih di atas papan sekaligus. Yang tidak diperbolehkan hanya dua: ' +
      'membiarkannya tetap pion, dan mengubahnya menjadi Raja.',
    verify: { kind: 'legal', move: { from: 'd7', to: 'd8', promotion: 'q' } },
  },

  {
    id: 'q-rokade',
    topic: 'Syarat rokade',
    level: 'sulit',
    fen: '4kr2/8/8/8/8/8/8/R3K2R w KQ - 0 1',
    prompt:
      'Putih masih memiliki hak rokade di kedua sisi, dan tidak ada bidak yang ' +
      'menghalangi. Namun Benteng hitam berdiri di f8. Rokade manakah yang sah?',
    hint: 'Periksa setiap petak yang DILEWATI Raja, bukan hanya petak tujuannya.',
    options: ['Rokade pendek (0-0)', 'Rokade panjang (0-0-0)', 'Keduanya sah', 'Keduanya tidak sah'],
    answer: 1,
    explanation:
      'Hanya rokade panjang yang sah. Pada rokade pendek, Raja bergeser dari e1 melewati ' +
      'f1 menuju g1 — dan f1 sedang diserang Benteng hitam f8 melalui lajur f yang kosong. ' +
      'Syarat rokade melarang Raja melewati maupun berhenti di petak yang diancam lawan. ' +
      'Pada rokade panjang, Raja melewati d1 dan berhenti di c1; keduanya tidak diserang, ' +
      'sehingga langkah itu sah. Perhatikan bahwa petak b1 yang dilalui Benteng boleh saja ' +
      'diserang — larangan itu hanya berlaku untuk petak yang dilewati Raja.',
    verify: { kind: 'legal', move: { from: 'e1', to: 'c1' } },
  },

  {
    id: 'q-pat',
    topic: 'Pat (stalemate)',
    level: 'sulit',
    fen: '7K/8/6q1/8/8/8/8/3k4 w - - 0 1',
    prompt:
      'Giliran Putih. Raja putih di h8 tidak sedang terkena skak, tetapi juga ' +
      'tidak memiliki satu pun langkah yang sah. Apa hasil permainan ini?',
    hint: 'Tidak terkena skak, tetapi tidak bisa bergerak sama sekali.',
    options: [
      'Hitam menang karena Putih tidak bisa melangkah',
      'Remis karena pat (stalemate)',
      'Skakmat untuk Putih',
      'Putih melewatkan giliran dan permainan berlanjut',
    ],
    answer: 1,
    explanation:
      'Ini adalah pat, dan hasilnya remis seketika. Raja putih tidak terkena skak, ' +
      'namun ketiga petak pelariannya dikuasai Menteri hitam: g8 lewat lajur g, g7 karena ' +
      'bersebelahan langsung, dan h7 lewat diagonal g6–h7. Perbedaannya dengan skakmat ' +
      'terletak pada ada atau tidaknya skak — pada skakmat Raja sedang diserang, pada pat ' +
      'tidak. Melewatkan giliran juga tidak pernah diperbolehkan dalam catur: setiap pemain ' +
      'wajib melangkah bila tiba gilirannya. Posisi seperti ini adalah jebakan klasik bagi ' +
      'pihak yang unggul materi dan terlalu terburu-buru.',
    verify: { kind: 'state', state: 'stalemate' },
  },

  {
    id: 'q-materi-tidak-cukup',
    topic: 'Materi tidak cukup',
    level: 'sedang',
    fen: '4k3/8/8/8/8/8/8/3BK3 w - - 0 1',
    prompt:
      'Di papan hanya tersisa Raja putih beserta satu Gajah, melawan Raja hitam ' +
      'yang sendirian. Apa hasil permainan ini?',
    hint: 'Pertanyaannya bukan siapa yang unggul, melainkan apakah skakmat masih mungkin.',
    options: [
      'Putih menang karena unggul satu Gajah',
      'Permainan dilanjutkan sampai aturan 50 langkah terpenuhi',
      'Remis karena materi tidak cukup',
      'Putih menang bila berhasil mendesak Raja hitam ke sudut',
    ],
    answer: 2,
    explanation:
      'Remis karena materi tidak cukup. Raja dan satu Gajah secara matematis tidak dapat ' +
      'memaksakan skakmat terhadap Raja yang sendirian, sekuat apa pun pemainnya bermain. ' +
      'Keunggulan materi tidak ada artinya bila posisi menang mustahil dibentuk. Tiga ' +
      'skenario lain yang juga langsung remis adalah Raja vs Raja, Raja dan Kuda vs Raja, ' +
      'serta Raja dan Gajah vs Raja dan Gajah apabila kedua Gajah berada pada warna petak ' +
      'yang sama.',
    verify: { kind: 'state', state: 'insufficient' },
  },
]);

export const LEVEL_LABEL = Object.freeze({
  mudah: 'Mudah',
  sedang: 'Sedang',
  sulit: 'Sulit',
});

export default questions;
