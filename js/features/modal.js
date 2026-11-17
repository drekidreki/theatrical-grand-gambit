/**
 * js/features/modal.js
 * ====================
 * Modal bersama untuk pop-up fakta bidak, kartu bidak, dan dialog kecil
 * lainnya. Lightbox infografis punya modul sendiri karena butuh zoom.
 *
 * Aksesibilitas: fokus dijebak di dalam dialog, Escape menutupnya, dan fokus
 * dikembalikan ke elemen pemicu setelah ditutup.
 */

import { $, el, trapFocus, empty } from '../utils/helpers.js';

let releaseFocus = null;
let activeRoot = null;

/** Menutup modal yang sedang terbuka. */
export function closeModal() {
  if (!activeRoot) return;

  activeRoot.remove();
  activeRoot = null;

  if (releaseFocus) {
    releaseFocus();
    releaseFocus = null;
  }

  document.removeEventListener('keydown', onKeydown);
}

function onKeydown(event) {
  if (event.key === 'Escape') {
    event.preventDefault();
    closeModal();
  }
}

/**
 * Membuka modal.
 *
 * @param {Object} options
 * @param {string} options.title   Judul dialog.
 * @param {Node|string} options.body Isi dialog.
 * @param {string} [options.eyebrow] Label kecil di atas judul.
 * @param {string} [options.footnote] Keterangan sumber di bagian bawah.
 */
export function openModal({ title, body, eyebrow, footnote }) {
  closeModal();

  const host = $('#modal-root');
  if (!host) return;

  const titleId = 'modal-title';

  const panel = el(
    'div',
    { class: 'panel panel--framed modal__panel', role: 'document' },
    [
      eyebrow ? el('p', { class: 'eyebrow', text: eyebrow }) : null,
      el('h2', { class: 'heading-3 heading-ink panel__title', id: titleId, text: title }),
      typeof body === 'string'
        ? el('div', { class: 'prose' }, [el('p', { text: body })])
        : body,
      footnote
        ? el('p', { class: 'source-note', text: `Sumber: ${footnote}`, style: 'margin-block-start:1rem' })
        : null,
      el('div', { style: 'margin-block-start:1.5rem;display:flex;justify-content:flex-end' }, [
        el('button', {
          class: 'btn btn--ink btn--sm',
          type: 'button',
          text: 'Tutup',
          onClick: closeModal,
        }),
      ]),
    ]
  );

  const backdrop = el('div', {
    class: 'program__backdrop is-open',
    onClick: closeModal,
  });

  activeRoot = el(
    'div',
    {
      class: 'modal',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': titleId,
    },
    [panel]
  );

  empty(host);
  host.append(backdrop, activeRoot);

  releaseFocus = trapFocus(activeRoot);
  document.addEventListener('keydown', onKeydown);

  panel.querySelector('button')?.focus();
}

export default { openModal, closeModal };
