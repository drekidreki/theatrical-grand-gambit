/**
 * js/audio-controller.js
 * ======================
 * Kontrol suara latar dan efek transisi.
 *
 * KEBIJAKAN AUTOPLAY
 * Browser modern memblokir pemutaran audio bersuara yang tidak dipicu oleh
 * gerakan pengguna, dan pembatasan itu lebih ketat lagi di dalam <iframe>.
 * Karena itu seluruh pemutaran di sini HANYA dimulai setelah pengunjung
 * menekan tombol suara. Tidak ada audio yang berbunyi sendiri.
 *
 * Pengalaman website harus tetap lengkap tanpa suara: modul ini tidak pernah
 * melempar error ke pemanggilnya bila berkas audio tidak ada.
 */

import { $ } from './utils/helpers.js';
import { read, write, KEYS } from './storage.js';

const SOURCES = {
  ambient: './assets/audio/ambient.mp3',
  transition: './assets/audio/transition.mp3',
};

/** @type {Map<string, HTMLAudioElement>} */
const tracks = new Map();

let enabled = false;
let unlocked = false; // true setelah gerakan pengguna pertama

function getTrack(name) {
  if (tracks.has(name)) return tracks.get(name);

  const audio = new Audio(SOURCES[name]);
  audio.preload = 'none';

  if (name === 'ambient') {
    audio.loop = true;
    audio.volume = 0.22;
  } else {
    audio.volume = 0.4;
  }

  // Berkas audio bersifat opsional. Bila belum disediakan, cukup diamkan.
  audio.addEventListener('error', () => {
    console.info(`[TGG] Berkas audio "${name}" belum tersedia. Suara dilewati.`);
  });

  tracks.set(name, audio);
  return audio;
}

/** Memutar efek sekali jalan. Diabaikan diam-diam bila suara dimatikan. */
export function playEffect(name = 'transition') {
  if (!enabled || !unlocked) return;

  const audio = getTrack(name);
  audio.currentTime = 0;
  audio.play().catch(() => {
    /* Kebijakan autoplay menolak. Tidak perlu mengganggu pengunjung. */
  });
}

function startAmbient() {
  const audio = getTrack('ambient');
  audio.play().catch(() => {
    console.info('[TGG] Pemutaran audio ditolak browser. Tombol suara tetap aktif.');
  });
}

function stopAmbient() {
  const audio = tracks.get('ambient');
  if (audio) audio.pause();
}

export function setSoundEnabled(value, { persist = true } = {}) {
  enabled = Boolean(value);

  const button = $('#btn-sound');
  if (button) {
    button.setAttribute('aria-pressed', String(enabled));
    const label = button.querySelector('.icon-btn__label');
    if (label) label.textContent = enabled ? 'Suara: Aktif' : 'Suara';
  }

  if (enabled) {
    unlocked = true; // tombol itu sendiri adalah gerakan pengguna
    startAmbient();
  } else {
    stopAmbient();
  }

  if (persist) write(KEYS.SOUND_ENABLED, enabled);
}

export const isSoundEnabled = () => enabled;

export function initAudio() {
  // Preferensi tersimpan dipulihkan sebagai KEADAAN TOMBOL saja. Audio baru
  // benar-benar berbunyi setelah pengunjung berinteraksi di sesi ini.
  const saved = Boolean(read(KEYS.SOUND_ENABLED, false));
  enabled = false;
  setSoundEnabled(false, { persist: false });

  $('#btn-sound')?.addEventListener('click', () => {
    setSoundEnabled(!enabled);
  });

  if (saved) {
    // Tandai preferensinya, lalu nyalakan pada interaksi pertama.
    const resume = () => {
      setSoundEnabled(true, { persist: false });
      document.removeEventListener('pointerdown', resume);
      document.removeEventListener('keydown', resume);
    };
    document.addEventListener('pointerdown', resume, { once: true });
    document.addEventListener('keydown', resume, { once: true });
  }

  // Jeda otomatis saat tab atau iframe kehilangan fokus.
  const pause = () => stopAmbient();
  const resume = () => {
    if (enabled && !document.hidden) startAmbient();
  };

  document.addEventListener('visibilitychange', () =>
    document.hidden ? pause() : resume()
  );
  window.addEventListener('blur', pause);
  window.addEventListener('focus', resume);
}

export default { initAudio, setSoundEnabled, isSoundEnabled, playEffect };
