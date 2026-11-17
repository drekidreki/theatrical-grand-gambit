/**
 * js/storage.js
 * =============
 * Pembungkus localStorage yang aman untuk lingkungan <iframe> lintas domain.
 *
 * MENGAPA MODUL INI ADA
 * Saat aplikasi berjalan di dalam cross-origin <iframe>, Safari, Firefox
 * dengan proteksi ketat, dan mode Incognito dapat MELEMPAR EXCEPTION pada
 * akses pertama ke localStorage — bukan sekadar mengembalikan null. Tanpa
 * pembungkus ini, satu panggilan saja dapat menghentikan seluruh aplikasi.
 *
 * Solusinya: setiap operasi dibungkus try...catch, dan bila penyimpanan
 * browser diblokir, modul otomatis beralih ke penyimpanan dalam memori.
 * Preferensi pengguna tetap bekerja selama sesi berlangsung, hanya tidak
 * bertahan setelah halaman ditutup.
 */

const PREFIX = 'tgg:';

/** Penyimpanan cadangan berbasis objek biasa. */
const memoryStore = new Map();

/** Hasil deteksi, dihitung sekali saja. */
let backend = null;

/** Memeriksa apakah localStorage benar-benar dapat ditulis. */
function detectBackend() {
  if (backend) return backend;

  try {
    const probe = `${PREFIX}__probe__`;
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    backend = 'local';
  } catch {
    console.info(
      '[TGG] localStorage tidak tersedia (kemungkinan pembatasan iframe atau ' +
        'mode privat). Preferensi disimpan sementara di memori.'
    );
    backend = 'memory';
  }

  return backend;
}

/** Apakah preferensi akan bertahan setelah halaman ditutup. */
export const isPersistent = () => detectBackend() === 'local';

/**
 * Membaca nilai. Selalu mengembalikan `fallback` bila kunci tidak ada,
 * nilainya rusak, atau penyimpanan diblokir.
 */
export function read(key, fallback = null) {
  const fullKey = PREFIX + key;

  try {
    const raw =
      detectBackend() === 'local'
        ? window.localStorage.getItem(fullKey)
        : memoryStore.get(fullKey) ?? null;

    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    // JSON rusak atau akses ditolak: perlakukan seperti tidak ada data.
    return fallback;
  }
}

/** Menulis nilai. Mengembalikan true bila berhasil disimpan di suatu tempat. */
export function write(key, value) {
  const fullKey = PREFIX + key;
  let raw;

  try {
    raw = JSON.stringify(value);
  } catch {
    console.warn(`[TGG] Nilai untuk "${key}" tidak dapat diserialisasi.`);
    return false;
  }

  try {
    if (detectBackend() === 'local') {
      window.localStorage.setItem(fullKey, raw);
    } else {
      memoryStore.set(fullKey, raw);
    }
    return true;
  } catch {
    // Kuota penuh atau izin dicabut di tengah sesi: turunkan ke memori.
    backend = 'memory';
    memoryStore.set(fullKey, raw);
    return true;
  }
}

/** Menghapus satu kunci. */
export function remove(key) {
  const fullKey = PREFIX + key;
  try {
    if (detectBackend() === 'local') window.localStorage.removeItem(fullKey);
  } catch {
    /* diabaikan dengan sengaja */
  }
  memoryStore.delete(fullKey);
}

/**
 * Kunci yang dipakai aplikasi. Dikumpulkan di satu tempat agar penamaan
 * konsisten dan mudah ditelusuri.
 */
export const KEYS = Object.freeze({
  MOTION_PAUSED: 'motion-paused',
  SOUND_ENABLED: 'sound-enabled',
  INTRO_SEEN: 'intro-seen',
  LAST_ACT: 'last-act',
  JOURNAL: 'journal',
  QUIZ_BEST: 'quiz-best',
});

export default { read, write, remove, isPersistent, KEYS };
