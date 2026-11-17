/**
 * js/features/infographic-viewer.js
 * =================================
 * Penampil infografis beserta lightbox-nya.
 *
 * Aturan dari dokumen konsep yang dipegang modul ini:
 *   - Menampilkan gambar infografis ASLI yang disediakan pembuat website.
 *   - Tidak membuat ulang desain infografis dalam HTML, dan tidak
 *     menggantinya dengan rangkuman teks.
 *   - Rasio asli dipertahankan; tidak ada bagian penting yang terpotong.
 *   - Tersedia perbesar, perkecil, dan tutup (tombol, klik di luar, Escape).
 *
 * Bila berkas gambar belum tersedia, yang tampil adalah slot penanda berisi
 * path yang harus diisi — bukan gambar pengganti buatan AI.
 */

import { $, el, trapFocus, clamp } from '../utils/helpers.js';

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 4;
const ZOOM_STEP = 0.25;

let lightboxRoot = null;
let releaseFocus = null;
let zoom = 1;

/* ===========================================================================
   Lightbox
   ======================================================================== */

function applyZoom(img, level) {
  zoom = clamp(level, ZOOM_MIN, ZOOM_MAX);
  img.style.transform = `scale(${zoom})`;
  const readout = $('.lightbox__zoom-level', lightboxRoot);
  if (readout) readout.textContent = `${Math.round(zoom * 100)}%`;
}

export function closeLightbox() {
  if (!lightboxRoot) return;

  lightboxRoot.remove();
  lightboxRoot = null;
  zoom = 1;

  if (releaseFocus) {
    releaseFocus();
    releaseFocus = null;
  }

  document.removeEventListener('keydown', onLightboxKey);
}

function onLightboxKey(event) {
  if (!lightboxRoot) return;

  const img = $('.lightbox__img', lightboxRoot);

  if (event.key === 'Escape') {
    event.preventDefault();
    closeLightbox();
  } else if ((event.key === '+' || event.key === '=') && img) {
    event.preventDefault();
    applyZoom(img, zoom + ZOOM_STEP);
  } else if (event.key === '-' && img) {
    event.preventDefault();
    applyZoom(img, zoom - ZOOM_STEP);
  } else if (event.key === '0' && img) {
    event.preventDefault();
    applyZoom(img, 1);
  }
}

export function openLightbox({ src, alt }) {
  closeLightbox();

  const img = el('img', { class: 'lightbox__img', src, alt });

  const stage = el(
    'div',
    {
      class: 'lightbox__stage',
      // Klik pada area kosong di luar gambar menutup lightbox.
      onClick: (event) => {
        if (event.target === event.currentTarget) closeLightbox();
      },
    },
    [img]
  );

  const bar = el('div', { class: 'lightbox__bar' }, [
    el('p', { class: 'eyebrow', text: 'Infografis' }),
    el('div', { style: 'display:flex;gap:.5rem;align-items:center' }, [
      el('button', {
        class: 'btn btn--ghost btn--sm',
        type: 'button',
        text: '−',
        'aria-label': 'Perkecil',
        onClick: () => applyZoom(img, zoom - ZOOM_STEP),
      }),
      el('span', { class: 'lightbox__zoom-level', text: '100%', 'aria-live': 'polite' }),
      el('button', {
        class: 'btn btn--ghost btn--sm',
        type: 'button',
        text: '+',
        'aria-label': 'Perbesar',
        onClick: () => applyZoom(img, zoom + ZOOM_STEP),
      }),
      el('button', {
        class: 'btn btn--ghost btn--sm',
        type: 'button',
        text: 'Ukuran asli',
        onClick: () => applyZoom(img, 1),
      }),
      el('button', {
        class: 'btn btn--gold btn--sm',
        type: 'button',
        text: 'Tutup',
        onClick: closeLightbox,
      }),
    ]),
  ]);

  lightboxRoot = el(
    'div',
    {
      class: 'lightbox',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': 'Infografis diperbesar',
    },
    [bar, stage]
  );

  document.body.append(lightboxRoot);
  releaseFocus = trapFocus(lightboxRoot);
  document.addEventListener('keydown', onLightboxKey);

  bar.querySelector('button')?.focus();
}

/* ===========================================================================
   Penampil dalam halaman
   ======================================================================== */

/** Slot penanda untuk aset yang belum disediakan. */
function assetSlot({ label, path, hint }) {
  return el('div', { class: 'asset-slot' }, [
    el('span', { class: 'asset-slot__title', text: `${label} belum tersedia` }),
    el('code', { class: 'asset-slot__path', text: path }),
    el('span', { class: 'asset-slot__hint', text: hint }),
  ]);
}

/**
 * Merender bingkai poster berisi infografis.
 *
 * @param {Object} asset Objek dari data/irene-profile.js -> requiredAssets.
 */
export function renderInfographic(asset) {
  const frame = el('figure', { class: 'poster-frame' });

  const img = el('img', {
    class: 'infographic',
    src: asset.path,
    alt:
      'Infografis perjalanan karier dan prestasi Irene Kharisma Sukandar. ' +
      'Klik untuk memperbesar.',
    loading: 'lazy',
    decoding: 'async',
    tabindex: '0',
    role: 'button',
    'aria-haspopup': 'dialog',
  });

  // Bila berkas belum ada, ganti dengan slot penanda — bukan gambar pengganti.
  img.addEventListener('error', () => {
    img.replaceWith(assetSlot(asset));
  });

  const open = () => openLightbox({ src: asset.path, alt: img.alt });
  img.addEventListener('click', open);
  img.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      open();
    }
  });

  frame.append(
    img,
    el('figcaption', { class: 'poster-frame__caption' }, [
      el('p', {
        class: 'source-note--on-dark',
        style: 'font-size:.8125rem',
        text: 'Infografis disediakan oleh penyusun. Klik gambar untuk memperbesar.',
      }),
    ])
  );

  return frame;
}

export default { renderInfographic, openLightbox, closeLightbox };
