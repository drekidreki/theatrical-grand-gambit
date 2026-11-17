/**
 * js/features/video-player.js
 * ===========================
 * Pemutar video dokumenter dalam bingkai bergaya layar proyektor.
 *
 * Memakai elemen <video> bawaan browser beserta `controls`, bukan kontrol
 * buatan sendiri. Alasannya: kontrol bawaan sudah mendukung keyboard,
 * pembaca layar, Picture-in-Picture, dan layar penuh di semua browser
 * target — termasuk Safari iOS di dalam <iframe>. Membuat ulang kontrol
 * hampir selalu berarti kehilangan sebagian kemampuan itu.
 *
 * Tidak ada autoplay bersuara. Atribut `preload="metadata"` menjaga agar
 * video tidak membebani pemuatan awal halaman.
 */

import { el } from '../utils/helpers.js';

function assetSlot({ label, path, hint }) {
  return el('div', { class: 'asset-slot' }, [
    el('span', { class: 'asset-slot__title', text: `${label} belum tersedia` }),
    el('code', { class: 'asset-slot__path', text: path }),
    el('span', { class: 'asset-slot__hint', text: hint }),
  ]);
}

/**
 * @param {Object} asset Objek dari data/irene-profile.js -> requiredAssets.video
 */
export function renderVideo(asset) {
  const frame = el('figure', { class: 'projector' });

  const video = el('video', {
    controls: true,
    preload: 'metadata',
    playsinline: true,
    poster: asset.poster,
    'aria-label': 'Video dokumenter singkat mengenai Irene Kharisma Sukandar',
  });

  video.append(
    el('source', { src: asset.path, type: 'video/mp4' }),
    document.createTextNode(
      'Browser Anda tidak mendukung pemutar video bawaan. ' +
        'Unduh berkasnya untuk menontonnya secara terpisah.'
    )
  );

  const screen = el('div', { class: 'projector__screen' }, [video]);

  // Berkas belum ada: tampilkan slot penanda, bukan pemutar yang mati.
  video.addEventListener('error', () => {
    screen.replaceChildren(assetSlot(asset));
  });

  // Hentikan video bila pengunjung berpindah tab atau keluar dari iframe,
  // supaya tidak ada suara yang terus berjalan di latar belakang.
  const pause = () => {
    if (!video.paused) video.pause();
  };
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pause();
  });
  window.addEventListener('blur', pause);

  frame.append(
    screen,
    el('figcaption', { class: 'projector__caption' }, [
      el('p', {
        class: 'source-note--on-dark',
        style: 'font-size:.8125rem',
        text:
          'Video dokumenter singkat. Gunakan kontrol bawaan untuk memutar, ' +
          'mengatur volume, dan masuk ke layar penuh.',
      }),
    ])
  );

  return frame;
}

export default { renderVideo };
