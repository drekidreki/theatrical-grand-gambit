/**
 * js/navigation.js
 * ================
 * Navigasi antarbabak untuk aplikasi satu halaman (SPA).
 *
 * Prinsip yang dipegang modul ini:
 *   1. Navigasi tidak boleh bergantung pada animasi. Bila GSAP gagal dimuat,
 *      perpindahan tetap berjalan, hanya tanpa transisi tirai.
 *   2. Setiap babak dapat dicapai lewat loge, Program Acara, tombol tiket
 *      maju-mundur, URL, maupun keyboard.
 *   3. Babak yang tidak aktif memakai atribut `hidden` sehingga ikut keluar
 *      dari urutan fokus keyboard.
 *   4. Posisi scroll tiap babak diingat, sehingga pengunjung yang kembali
 *      tidak kehilangan tempat bacanya.
 */

import { $, $$, el, getScroller, empty } from './utils/helpers.js';
import { read, write, KEYS } from './storage.js';

/** Daftar babak. Urutan array menentukan navigasi Sebelumnya/Berikutnya. */
export const ACTS = Object.freeze([
  {
    id: 'act-tokoh',
    number: 'Babak I',
    title: 'Sang Tokoh',
    subtitle: 'The Portrait of a Grandmaster',
    description: 'Perjalanan hidup, infografis, dan video dokumenter singkat.',
  },
  {
    id: 'act-arena',
    number: 'Babak II',
    title: 'Arena Pikir',
    subtitle: 'The Chess Arena',
    description: 'Peraturan catur, pergerakan bidak, dan tiga fase permainan.',
  },
  {
    id: 'act-pion',
    number: 'Babak III',
    title: 'Promosi Pion',
    subtitle: 'The Values of a Champion',
    description: 'Hak, kewajiban, nilai keteladanan, dan pemetaan Pancasila.',
  },
  {
    id: 'act-ratu',
    number: 'Babak IV',
    title: 'Sang Ratu',
    subtitle: 'The Numbers Speak',
    description: 'Statistik rating Elo, grafik perkembangan, dan kalkulator Elo.',
  },
]);

export const STAGE_ID = 'grand-stage';

const scrollMemory = new Map();
const listeners = new Set();

let currentId = STAGE_ID;
let programOpen = false;

/** Mendaftarkan callback yang dipanggil setiap kali babak berganti. */
export function onNavigate(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

/** Id babak yang sedang aktif. */
export const getCurrentAct = () => currentId;

/** Metadata sebuah babak, atau undefined untuk panggung utama. */
export const getActMeta = (id) => ACTS.find((act) => act.id === id);

/* ===========================================================================
   Perpindahan babak
   ======================================================================== */

function isValidTarget(id) {
  return id === STAGE_ID || ACTS.some((act) => act.id === id);
}

/**
 * Berpindah ke sebuah babak.
 *
 * @param {string}  id                 Id babak tujuan.
 * @param {Object}  [options]
 * @param {boolean} [options.push]     Catat ke riwayat browser. Default true.
 * @param {boolean} [options.restore]  Pulihkan posisi scroll. Default true.
 */
export function goTo(id, { push = true, restore = true } = {}) {
  if (!isValidTarget(id)) {
    console.warn(`[TGG] Target navigasi tidak dikenal: "${id}".`);
    return;
  }
  if (id === currentId) {
    closeProgram();
    return;
  }

  const scroller = getScroller();
  scrollMemory.set(currentId, scroller.scrollTop);

  const outgoing = document.getElementById(currentId);
  const incoming = document.getElementById(id);
  if (!incoming) return;

  if (outgoing) {
    outgoing.classList.remove('is-active');
    outgoing.hidden = true;
  }

  incoming.hidden = false;
  incoming.classList.add('is-active');

  const previousId = currentId;
  currentId = id;

  // Posisi scroll: panggung utama selalu dari atas, babak lain dipulihkan.
  const target = id === STAGE_ID ? 0 : restore ? scrollMemory.get(id) ?? 0 : 0;
  scroller.scrollTo({ top: target, behavior: 'auto' });

  if (push) {
    const hash = id === STAGE_ID ? ' ' : `#${id}`;
    try {
      history.pushState({ act: id }, '', hash);
    } catch {
      // Beberapa konfigurasi iframe menolak pushState. Navigasi tetap jalan.
    }
  }

  write(KEYS.LAST_ACT, id);
  syncChrome();
  announce(id);
  closeProgram();

  for (const callback of listeners) {
    try {
      callback(id, previousId);
    } catch (error) {
      console.error('[TGG] Listener navigasi gagal:', error);
    }
  }
}

/** Mengumumkan perpindahan ke pembaca layar. */
function announce(id) {
  const announcer = $('#route-announcer');
  if (!announcer) return;

  const meta = getActMeta(id);
  announcer.textContent = meta
    ? `${meta.number}: ${meta.title}. ${meta.subtitle}.`
    : 'Panggung utama. Strategi Terkuak.';
}

/** Menyelaraskan header, Program Acara, dan judul dokumen. */
function syncChrome() {
  const backButton = $('#btn-back-to-stage');
  if (backButton) backButton.hidden = currentId === STAGE_ID;

  $$('.program__item').forEach((item) => {
    item.setAttribute('aria-current', String(item.dataset.navTarget === currentId));
  });

  const meta = getActMeta(currentId);
  document.title = meta
    ? `${meta.title} — The Theatrical Grand Gambit`
    : 'The Theatrical Grand Gambit — Irene Kharisma Sukandar';
}

/* ===========================================================================
   Program Acara
   ======================================================================== */

export function openProgram() {
  if (programOpen) return;
  programOpen = true;

  const panel = $('#program-acara');
  const backdrop = $('#program-backdrop');
  const toggle = $('#btn-program');

  backdrop.hidden = false;
  // Satu frame agar transisi opacity sempat berjalan.
  requestAnimationFrame(() => backdrop.classList.add('is-open'));

  panel.classList.add('is-open');
  panel.setAttribute('aria-hidden', 'false');
  toggle?.setAttribute('aria-expanded', 'true');

  $('#btn-program-close')?.focus();
}

export function closeProgram({ returnFocus = false } = {}) {
  if (!programOpen) return;
  programOpen = false;

  const panel = $('#program-acara');
  const backdrop = $('#program-backdrop');
  const toggle = $('#btn-program');

  panel.classList.remove('is-open');
  panel.setAttribute('aria-hidden', 'true');
  backdrop.classList.remove('is-open');
  toggle?.setAttribute('aria-expanded', 'false');

  // Sembunyikan backdrop setelah transisinya selesai.
  setTimeout(() => {
    if (!programOpen) backdrop.hidden = true;
  }, 450);

  if (returnFocus) toggle?.focus();
}

function toggleProgram() {
  programOpen ? closeProgram({ returnFocus: true }) : openProgram();
}

/* ===========================================================================
   Render: daftar Program Acara dan footer tiap babak
   ======================================================================== */

function renderProgramList() {
  const list = $('#program-list');
  if (!list) return;

  empty(list);

  for (const act of ACTS) {
    list.append(
      el(
        'button',
        {
          class: 'program__item',
          type: 'button',
          role: 'listitem',
          dataset: { navTarget: act.id },
          'aria-current': String(act.id === currentId),
        },
        [
          el('span', { class: 'program__item-number', text: act.number }),
          el('span', { class: 'program__item-title', text: act.title }),
          el('span', { class: 'program__item-desc', text: act.description }),
          el('span', {
            class: 'program__item-status',
            dataset: { journalStatus: act.id },
            text: '',
          }),
        ]
      )
    );
  }
}

function renderActFooters() {
  $$('[data-act-footer]').forEach((footer) => {
    const id = footer.dataset.actFooter;
    const index = ACTS.findIndex((act) => act.id === id);
    if (index === -1) return;

    empty(footer);

    const previous = ACTS[index - 1];
    const next = ACTS[index + 1];

    const nav = el('div', { class: 'act-nav' });

    nav.append(
      previous
        ? el(
            'button',
            {
              class: 'act-nav__ticket act-nav__ticket--prev',
              type: 'button',
              dataset: { navTarget: previous.id },
            },
            [
              el('span', { class: 'act-nav__direction', text: '‹ Babak Sebelumnya' }),
              el('span', { class: 'act-nav__name', text: previous.title }),
            ]
          )
        : el(
            'button',
            {
              class: 'act-nav__ticket act-nav__ticket--prev',
              type: 'button',
              dataset: { navTarget: STAGE_ID },
            },
            [
              el('span', { class: 'act-nav__direction', text: '‹ Kembali' }),
              el('span', { class: 'act-nav__name', text: 'Panggung Utama' }),
            ]
          )
    );

    nav.append(
      next
        ? el(
            'button',
            {
              class: 'act-nav__ticket act-nav__ticket--next',
              type: 'button',
              dataset: { navTarget: next.id },
            },
            [
              el('span', { class: 'act-nav__direction', text: 'Babak Berikutnya ›' }),
              el('span', { class: 'act-nav__name', text: next.title }),
            ]
          )
        : el(
            'button',
            {
              class: 'act-nav__ticket act-nav__ticket--next',
              type: 'button',
              id: 'btn-final-curtain-footer',
            },
            [
              el('span', { class: 'act-nav__direction', text: 'Penutup ›' }),
              el('span', { class: 'act-nav__name', text: 'Akhiri Pertunjukan' }),
            ]
          )
    );

    footer.append(
      el('button', {
        class: 'btn btn--ghost',
        type: 'button',
        dataset: { navTarget: STAGE_ID },
        text: 'Kembali ke Panggung',
      }),
      nav
    );
  });
}

/* ===========================================================================
   Inisialisasi
   ======================================================================== */

export function initNavigation() {
  renderProgramList();
  renderActFooters();

  // Satu listener untuk seluruh tombol navigasi (event delegation).
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-nav-target]');
    if (!trigger) return;

    event.preventDefault();
    goTo(trigger.dataset.navTarget);
  });

  $('#btn-program')?.addEventListener('click', toggleProgram);
  $('#btn-open-program-hero')?.addEventListener('click', openProgram);
  $('#btn-program-close')?.addEventListener('click', () =>
    closeProgram({ returnFocus: true })
  );
  $('#program-backdrop')?.addEventListener('click', () => closeProgram());

  // Escape menutup Program Acara dari mana pun.
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && programOpen) {
      event.preventDefault();
      closeProgram({ returnFocus: true });
    }
  });

  // Tombol maju-mundur browser.
  window.addEventListener('popstate', (event) => {
    const id = event.state?.act ?? hashToId();
    goTo(id, { push: false });
  });

  // Babak awal: dari URL bila ada, jika tidak dari panggung utama.
  const initial = hashToId();
  if (initial !== STAGE_ID) {
    goTo(initial, { push: false });
  } else {
    syncChrome();
  }
}

function hashToId() {
  const raw = window.location.hash.replace('#', '').trim();
  return isValidTarget(raw) ? raw : STAGE_ID;
}

/** Babak yang terakhir dikunjungi pada sesi sebelumnya (untuk saran lanjut). */
export const getLastVisited = () => read(KEYS.LAST_ACT, null);
