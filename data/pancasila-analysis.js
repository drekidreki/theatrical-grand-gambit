/**
 * data/pancasila-analysis.js
 * ==========================
 * Pemetaan perjalanan Irene Kharisma Sukandar terhadap lima sila Pancasila.
 *
 * ============== STATUS MATERI: LAPISAN INTERPRETASI ==============
 * Dokumen tugas TIDAK memuat pemetaan sila. Seluruh isi berkas ini adalah
 * lapisan analisis tambahan yang disusun oleh penyusun website, dibangun di
 * atas naskah Hak, Kewajiban, dan Nilai Keteladanan di data/academic-analysis.js.
 *
 * Karena itu, di antarmuka bagian ini SELALU diberi label "Lapisan
 * Interpretasi" dan dibedakan secara visual dari naskah sumber. Tidak boleh
 * ada satu kalimat pun di sini yang disajikan seolah-olah kutipan dari
 * dokumen tugas, dari teks Pancasila, maupun dari ajaran agama tertentu.
 *
 * Tiap pemetaan menyertakan `basis`, yaitu butir naskah sumber yang menjadi
 * dasarnya, agar pembaca dapat memeriksa sendiri kekuatan hubungannya.
 */

export const LAYER_LABEL = 'Lapisan Interpretasi';

export const disclaimer =
  'Pemetaan berikut bukan kutipan dari dokumen tugas maupun dari rumusan resmi ' +
  'mana pun. Ini adalah pembacaan penyusun atas naskah analisis Hak, ' +
  'Kewajiban, dan Nilai Keteladanan. Setiap butir mencantumkan bagian naskah ' +
  'yang menjadi dasarnya, dan kekuatan hubungannya dinyatakan terbuka — ' +
  'termasuk ketika hubungannya memang tidak langsung.';

/**
 * @typedef {Object} SilaMapping
 * @property {number} ordinal
 * @property {string} roman
 * @property {string} text        Bunyi sila.
 * @property {string} claim       Pembacaan penyusun dalam satu kalimat.
 * @property {string[]} paragraphs Uraian argumentatif.
 * @property {string[]} basis     Butir naskah sumber yang menjadi dasarnya.
 * @property {'kuat'|'sedang'|'tidak langsung'} strength
 */

/** @type {readonly SilaMapping[]} */
export const silaMappings = Object.freeze([
  {
    ordinal: 1,
    roman: 'Sila Pertama',
    text: 'Ketuhanan Yang Maha Esa',
    claim:
      'Terbaca melalui sikap jujur dan sportif yang dijaga meski tidak ada ' +
      'yang mengawasi, serta kesediaan menerima hasil dengan lapang dada.',
    paragraphs: [
      'Sila pertama kerap dipahami hanya sebagai ritual keagamaan, padahal dimensi yang paling sering diuji dalam olahraga adalah dimensi moralnya: apakah seseorang tetap jujur ketika kecurangan mustahil ketahuan. Catur adalah olahraga yang sangat terbuka terhadap godaan semacam itu, mulai dari penyalahgunaan perangkat elektronik hingga bantuan program komputer, dan justru karena itu integritas pemain menjadi taruhan terus-menerus.',
      'Naskah sumber menyebut bahwa Irene berkomitmen menampilkan kualitas permainan terbaik dan tidak memandang kompetisi sekadar sebagai ajang mengejar kemenangan instan atau keuntungan jangka pendek. Sikap itu dapat dibaca sebagai bentuk pertanggungjawaban yang melampaui penilaian wasit dan penonton. Pada sisi lain, kemampuannya menahan diri agar tidak larut dalam euforia saat menang dan tidak terpuruk saat kalah mencerminkan kesadaran bahwa hasil bukan sepenuhnya berada dalam genggaman manusia — sebuah sikap yang dalam banyak tradisi keagamaan disebut sebagai syukur dan kelapangan hati.',
    ],
    basis: [
      'Kewajiban menjunjung tinggi sportivitas dan kualitas permainan',
      'Berorientasi pada proses dan memiliki kedewasaan emosional',
    ],
    strength: 'sedang',
  },

  {
    ordinal: 2,
    roman: 'Sila Kedua',
    text: 'Kemanusiaan yang Adil dan Beradab',
    claim:
      'Terbaca paling kuat pada pengakuan orang tua atas hak anak untuk ' +
      'memilih jalannya sendiri, dan pada penghormatan terhadap lawan.',
    paragraphs: [
      'Hubungan paling jelas antara perjalanan Irene dan sila kedua terletak pada keputusan orang tuanya. Naskah sumber mencatat bahwa meskipun ayahnya, Singgih Heyzkel, adalah atlet dan pelatih tenis meja, kedua orang tuanya tidak memaksakan warisan profesi keluarga tersebut kepadanya, dan justru memberikan kebebasan penuh ketika ia menunjukkan ketertarikan pada catur sejak usia tujuh tahun. Memperlakukan seorang anak berusia tujuh tahun sebagai pribadi yang berhak menentukan minatnya sendiri adalah bentuk paling konkret dari memanusiakan manusia.',
      'Dimensi "beradab" muncul pada sisi kompetisi. Naskah sumber menyebut bahwa menjaga standar mutu permainan dan sikap sportif merupakan bentuk penghormatan terhadap lawan, aturan pertandingan, serta martabat olahraga catur itu sendiri. Di sini lawan tidak diposisikan sebagai musuh yang harus dikalahkan dengan cara apa pun, melainkan sebagai sesama manusia yang kehadirannya justru membuat pertandingan bermakna.',
    ],
    basis: [
      'Hak kebebasan memilih dan mengembangkan minat serta bakat',
      'Kewajiban menjunjung tinggi sportivitas dan kualitas permainan',
    ],
    strength: 'kuat',
  },

  {
    ordinal: 3,
    roman: 'Sila Ketiga',
    text: 'Persatuan Indonesia',
    claim:
      'Terbaca pada kesadaran bahwa pembinaan yang diterimanya berasal dari ' +
      'banyak pihak, sehingga prestasinya dikembalikan untuk nama bangsa.',
    paragraphs: [
      'Naskah sumber menempatkan hubungan ini sebagai sebab-akibat yang eksplisit: sebagai konsekuensi dari dukungan keluarga, pembinaan federasi, dan fasilitas negara yang telah diterimanya, Irene memikul tanggung jawab moral untuk memberikan kontribusi nyata bagi Indonesia. Prestasi tidak dibaca sebagai milik pribadi, melainkan sebagai hasil dari rantai dukungan yang lebih panjang dari dirinya sendiri.',
      'Wujudnya tercatat dalam deretan penampilan membawa nama negara: dua medali perak pada SEA Games di Vietnam (2003), medali perak pada Olimpiade Catur di Calvia, Spanyol (2004), dan gelar Juara 1 Asian Continental Chess Championship di Ho Chi Minh City, Vietnam (2012). Pada ajang beregu, catur yang biasanya merupakan olahraga paling individual berubah menjadi kerja tim — satu papan yang kalah dapat membatalkan kemenangan tiga papan lainnya.',
    ],
    basis: [
      'Kewajiban menjaga kepercayaan dan mengharumkan nama bangsa',
      'Hak memperoleh pembinaan dan fasilitas olahraga yang layak',
    ],
    strength: 'kuat',
  },

  {
    ordinal: 4,
    roman: 'Sila Keempat',
    text: 'Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan dalam Permusyawaratan/Perwakilan',
    claim:
      'Hubungannya paling tidak langsung. Yang dapat dipertanggungjawabkan ' +
      'adalah kepatuhan pada aturan yang disepakati bersama.',
    paragraphs: [
      'Perlu dinyatakan terbuka: di antara kelima sila, hubungan sila keempat dengan perjalanan seorang atlet catur adalah yang paling tidak langsung. Dokumen tugas tidak memuat peristiwa musyawarah, pemilihan, atau pengambilan keputusan kolektif yang melibatkan Irene. Memaksakan hubungan di titik ini justru akan melemahkan keseluruhan analisis, sehingga pemetaannya dibatasi pada apa yang memang didukung naskah.',
      'Yang dapat dipertanggungjawabkan adalah ini: catur kompetitif sepenuhnya berdiri di atas seperangkat aturan yang disepakati bersama dan ditegakkan oleh wasit sebagai pihak yang mewakili kesepakatan itu. Naskah sumber menyebut penghormatan Irene terhadap aturan pertandingan sebagai bagian dari sportivitas. Kesediaan tunduk pada keputusan wasit, termasuk ketika keputusan itu merugikan, adalah bentuk paling dasar dari menerima hasil mekanisme bersama — inti yang sama yang dijaga sila keempat dalam konteks kehidupan bernegara.',
    ],
    basis: ['Kewajiban menjunjung tinggi sportivitas dan kualitas permainan'],
    strength: 'tidak langsung',
  },

  {
    ordinal: 5,
    roman: 'Sila Kelima',
    text: 'Keadilan Sosial bagi Seluruh Rakyat Indonesia',
    claim:
      'Terbaca pada akses pembinaan yang layak dan pada sistem penilaian ' +
      'prestasi yang objektif dan terbuka bagi siapa pun.',
    paragraphs: [
      'Keadilan sosial berbicara tentang kesempatan, bukan hanya tentang hasil. Naskah sumber mencatat bahwa Irene memperoleh akses pelatihan berkualitas dan terstruktur selama enam tahun di Sekolah Catur Utut Adianto di Bekasi, dibimbing Master Internasional Ivan Situru, serta tetap memperoleh pendidikan formal di SMA Nusantara, Jakarta, di tengah padatnya jadwal turnamen. Pemenuhan dua hak ini sekaligus — pembinaan olahraga dan pendidikan akademik — adalah gambaran konkret tentang bagaimana seharusnya kesempatan diberikan kepada atlet muda.',
      'Dimensi kedua terletak pada sistem penilaiannya. Naskah sumber menyebut bahwa kenaikan gelar catur diberikan secara bertahap dan objektif sesuai standar federasi nasional maupun dunia, dari Master Percasi (2001), Master Nasional Wanita (2002), Master FIDE Wanita (2004), hingga Grand Master Wanita pertama di Indonesia. Sistem rating dan norma gelar dalam catur bekerja dengan aturan yang sama bagi setiap pemain, tanpa memandang asal daerah maupun latar belakang keluarga. Keadilan semacam ini jarang ditemukan sejernih itu di bidang lain.',
    ],
    basis: [
      'Hak memperoleh pembinaan dan fasilitas olahraga yang layak',
      'Hak mendapatkan pendidikan formal yang setara',
      'Hak berkompetisi secara adil dan memperoleh pengakuan atas prestasi',
    ],
    strength: 'kuat',
  },
]);

export const STRENGTH_LABEL = Object.freeze({
  kuat: 'Hubungan kuat',
  sedang: 'Hubungan sedang',
  'tidak langsung': 'Hubungan tidak langsung',
});

export default { silaMappings, disclaimer, LAYER_LABEL, STRENGTH_LABEL };
