/**
 * data/academic-analysis.js
 * =========================
 * Naskah analisis Pendidikan Pancasila dan Agama: Hak, Kewajiban, dan
 * Nilai-Nilai Keteladanan Irene Kharisma Sukandar.
 *
 * ================== ATURAN YANG MENGIKAT BERKAS INI ==================
 * Seluruh paragraf di bawah disalin UTUH dari dokumen analisis tugas.
 *
 * DILARANG:
 *   - meringkas paragraf atau mengubahnya menjadi poin-poin pendek;
 *   - menghilangkan contoh konkret, nama, tempat, tahun, atau pencapaian;
 *   - menghapus penjelasan hubungan sebab-akibat;
 *   - mengganti substansi analisis dengan kalimat umum.
 *
 * Yang boleh: memformat dan memisahkan paragraf demi keterbacaan, tanpa
 * mengubah makna satu kalimat pun.
 *
 * Catatan pembagian materi: bagian Nilai Keteladanan sekaligus menjadi
 * analisis Pendidikan Agama pada tugas ini, sesuai pembagian materi yang
 * ditetapkan. Karena itu tidak ada berkas religious-analysis.js terpisah.
 */

export const SOURCE_LABEL = 'Naskah dokumen tugas';

/** Analisis Hak (Rights) — empat submateri. */
export const rights = Object.freeze([
  {
    id: 'hak-kebebasan',
    title: 'Hak kebebasan memilih dan mengembangkan minat serta bakat',
    paragraphs: [
      'Sebagai seorang anak, Irene Kharisma Sukandar memperoleh hak fundamental untuk menentukan pilihan hidup dan mengekspresikan potensinya tanpa paksaan. Meskipun ayahnya, Singgih Heyzkel, merupakan atlet dan pelatih tenis meja, kedua orang tuanya (Singgih Heyzkel dan Cici Ratna Mulya) tidak memaksakan warisan profesi keluarga tersebut kepadanya. Sebaliknya, mereka memberikan kebebasan penuh sekaligus dukungan moral dan material ketika Irene menunjukkan ketertarikan pada olahraga catur sejak usia tujuh tahun karena dinilai lebih selaras dengan kepribadiannya yang tenang dan analitis. Pemenuhan hak ini menjadi fondasi psikologis yang krusial bagi perkembangan kepercayaan diri dan kemandiriannya dalam berkarier.',
    ],
  },
  {
    id: 'hak-pembinaan',
    title: 'Hak memperoleh pembinaan dan fasilitas olahraga yang layak',
    paragraphs: [
      'Untuk mengembangkan bakat alamiahnya menjadi prestasi profesional, Irene mendapatkan hak atas akses pelatihan berkualitas dan terstruktur. Ia berkesempatan menempuh pendidikan khusus secara intensif selama enam tahun di Sekolah Catur Utut Adianto (SCUA) di Bekasi. Di institusi tersebut, ia dibimbing langsung oleh pelatih berpengalaman sekaligus mantan pecatur nasional, Master Internasional (MI) Ivan Situru. Akses terhadap kurikulum catur yang sistematis, mentor yang kompeten, serta lingkungan latihan yang kompetitif ini merupakan wujud pemenuhan hak atlet muda untuk mendapatkan pembinaan yang optimal.',
    ],
  },
  {
    id: 'hak-pendidikan',
    title: 'Hak mendapatkan pendidikan formal yang setara',
    paragraphs: [
      'Kesibukan sebagai atlet berprestasi tidak membuat hak Irene atas pendidikan akademik terabaikan. Di tengah padatnya jadwal pemusatan latihan, try-out, dan turnamen di dalam maupun luar negeri, ia tetap terdaftar dan memperoleh akses pendidikan formal sebagai siswi di SMA Nusantara, Jakarta. Pemenuhan hak ini memastikan bahwa perkembangan intelektual dan wawasan akademiknya tetap berjalan beriringan dengan karier olahraganya, sehingga ia memiliki bekal masa depan yang seimbang.',
    ],
  },
  {
    id: 'hak-kompetisi',
    title: 'Hak berkompetisi secara adil dan memperoleh pengakuan atas prestasi',
    paragraphs: [
      'Irene mendapatkan ruang dan kesempatan yang luas untuk menguji kemampuannya di berbagai jenjang kompetisi resmi, mulai dari Kejuaraan Nasional (Kejurnas) 1999 hingga turnamen bergengsi tingkat internasional. Atas dedikasi dan kemenangannya, ia berhak menerima pengakuan resmi berupa kenaikan gelar catur secara bertahap dan objektif sesuai standar federasi nasional maupun dunia—dimulai dari Master Percasi (2001), Master Nasional Wanita (2002), Master FIDE Wanita (2004), hingga mencatatkan sejarah sebagai Grand Master Wanita (WGM) pertama di Indonesia.',
    ],
  },
]);

/** Analisis Kewajiban (Obligations) — tiga submateri. */
export const obligations = Object.freeze([
  {
    id: 'kewajiban-bangsa',
    title: 'Kewajiban menjaga kepercayaan dan mengharumkan nama bangsa',
    paragraphs: [
      'Sebagai konsekuensi dari dukungan keluarga, pembinaan federasi, dan fasilitas negara yang telah diterimanya, Irene memikul tanggung jawab moral untuk memberikan kontribusi nyata bagi Indonesia. Ia menunaikan kewajiban ini dengan tampil maksimal di berbagai panggung internasional dan mempersembahkan beragam gelar bergengsi bagi Tanah Air, antara lain dua medali perak pada ajang SEA Games di Vietnam (2003), medali perak pada Olimpiade Catur di Calvia, Spanyol (2004), serta meraih predikat Juara 1 pada ajang Asian Continental Chess Championship di Ho Chi Minh City, Vietnam (2012).',
    ],
  },
  {
    id: 'kewajiban-sportivitas',
    title: 'Kewajiban menjunjung tinggi sportivitas dan kualitas permainan',
    paragraphs: [
      'Dalam setiap pertandingan yang diikutinya, Irene memegang teguh etika profesi sebagai atlet dengan berkomitmen menampilkan kualitas permainan terbaik dan konsentrasi penuh. Ia tidak memandang kompetisi sekadar sebagai ajang mengejar kemenangan instan atau keuntungan jangka pendek yang mengabaikan esensi permainan. Kewajiban menjaga standar mutu permainan dan sikap sportif ini merupakan bentuk penghormatan terhadap lawan, aturan pertandingan, serta martabat olahraga catur itu sendiri.',
    ],
  },
  {
    id: 'kewajiban-waktu',
    title: 'Kewajiban mengelola waktu dan memanfaatkan masa produktif secara bertanggung jawab',
    paragraphs: [
      'Irene memiliki kesadaran penuh bahwa masa muda adalah periode emas yang sangat menentukan puncak karier seorang atlet. Oleh karena itu, ia memikul kewajiban terhadap dirinya sendiri untuk tidak menyia-nyiakan waktu tersebut. Ia mengalokasikan energi, pikiran, dan fokusnya pada rutinitas latihan yang ketat dan pengembangan strategi permainan demi mendorong kemajuan prestasi catur nasional di kancah global.',
    ],
  },
]);

/**
 * Nilai-Nilai Keteladanan — empat nilai.
 * Bagian ini sekaligus menjadi analisis Pendidikan Agama pada tugas ini.
 */
export const exemplaryValues = Object.freeze([
  {
    id: 'nilai-pantang-menyerah',
    shortName: 'Pantang menyerah',
    title: 'Pantang menyerah dan menjadikan kegagalan sebagai pemicu semangat',
    paragraphs: [
      'Ketangguhan mental Irene terlihat jelas sejak awal kariernya. Pada debut kompetitifnya di Kejuaraan Nasional (Kejurnas) Catur 1999 di Bekasi, ia mengalami kekalahan telak dan pulang tanpa meraih satu poin pun. Namun, kegagalan tersebut tidak mematahkan semangatnya atau membuatnya minder. Ia justru menjadikan kekalahan perdana itu sebagai tolok ukur kelemahan diri dan cambuk motivasi untuk berlatih jauh lebih keras dan terarah.',
    ],
  },
  {
    id: 'nilai-proses',
    shortName: 'Berorientasi pada proses',
    title: 'Berorientasi pada proses dan memiliki kedewasaan emosional (berjiwa besar)',
    paragraphs: [
      'Irene menanamkan prinsip bahwa kualitas langkah dan strategi di atas papan catur jauh lebih esensial dibandingkan sekadar hasil akhir menang atau kalah. Pola pikir yang berorientasi pada proses ini membentuk kestabilan emosinya: ia mampu menahan diri agar tidak larut dalam euforia berlebihan saat meraih kemenangan, sekaligus tidak mudah terpuruk atau kehilangan kepercayaan diri ketika mengalami kekalahan. Sikap berjiwa besar ini memungkinkannya melakukan evaluasi objektif di setiap akhir pertandingan.',
    ],
  },
  {
    id: 'nilai-disiplin',
    shortName: 'Disiplin dan konsistensi',
    title: 'Disiplin tinggi dan konsisten sejak usia dini',
    paragraphs: [
      'Prestasi gemilang yang diraih Irene bukanlah hasil yang instan, melainkan buah dari kedisiplinan jangka panjang. Memulai latihan secara serius sejak usia tujuh tahun, ia menjaga konsistensi belajar teori catur, menganalisis pertandingan, dan mengasah taktik setiap hari. Ketekunan tersebut terbukti membuahkan hasil progresif: hanya dalam kurun waktu dua tahun ia berhasil meraih gelar Master Percasi, dan terus konsisten menanjak hingga menembus level elite Asia dan dunia.',
    ],
  },
  {
    id: 'nilai-potensi',
    shortName: 'Mengenali potensi diri',
    title: 'Kemampuan mengenali potensi diri dan memiliki panutan (role model) yang tepat',
    paragraphs: [
      'Irene menunjukkan kecerdasan dalam mengenali karakter dan kekuatan dirinya sendiri, yakni ketertarikannya pada olahraga otak yang menuntut ketenangan, ketajaman logika, dan perhitungan matang. Kesadaran diri ini diperkuat dengan keberaniannya menetapkan standar tinggi melalui sosok panutan yang tepat, seperti pecatur legendaris dunia asal Hungaria, Judit Polgar. Menjadikan tokoh kelas dunia sebagai inspirasi memberinya arah visi yang jelas untuk terus melampaui batas kemampuannya.',
    ],
  },
]);

/** Pertanyaan reflektif penutup. Bukan ujian, tidak mengumpulkan data apa pun. */
export const reflectionQuestions = Object.freeze([
  'Bagaimana cara menerapkan sikap disiplin dalam kehidupan sehari-hari, meskipun tidak ada kompetisi yang sedang menanti?',
  'Mengapa kegagalan dapat menjadi bagian dari proses pengembangan diri, dan apa yang membedakan kegagalan yang membangun dari kegagalan yang melemahkan?',
  'Bagaimana cara menghargai hak yang kita terima dan menjalankan kewajiban secara seimbang?',
  'Siapa sosok panutan yang arah hidupnya ingin Anda jadikan rujukan, dan nilai apa yang ingin Anda ambil darinya?',
]);

/** Rangkuman hubungan ketiga aspek, sebagai penutup babak. */
export const closingSummary =
  'Ketiga aspek di atas tidak berdiri sendiri. Hak yang dipenuhi keluarga, ' +
  'federasi, dan negara menjadi modal awal; kewajiban yang ditunaikan Irene ' +
  'adalah cara ia membayar kembali modal tersebut; dan nilai keteladanan ' +
  'adalah sifat yang membuat keduanya berjalan konsisten selama lebih dari ' +
  'dua dekade. Tanpa pemenuhan hak, bakat itu mungkin tidak pernah terasah. ' +
  'Tanpa kesadaran akan kewajiban, prestasi itu berhenti menjadi milik ' +
  'pribadi. Dan tanpa disiplin serta kelapangan menerima kekalahan, ' +
  'keduanya tidak akan bertahan melewati kekalahan pertama di Bekasi tahun 1999.';

export default { rights, obligations, exemplaryValues, reflectionQuestions, closingSummary };
