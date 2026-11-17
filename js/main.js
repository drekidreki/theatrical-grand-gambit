/**
 * js/main.js
 * ==========
 * Titik masuk aplikasi.
 *
 * Tugasnya hanya tiga: menyalakan sistem inti, memuat modul tiap babak saat
 * pertama kali dibutuhkan, dan memastikan satu modul yang gagal tidak
 * menjatuhkan seluruh pertunjukan.
 *
 * Modul babak sengaja dimuat secara dinamis (lazy) agar pengunjung yang hanya
 * membaca satu babak tidak perlu mengunduh kode babak lainnya.
 */

import { $, el } from './utils/helpers.js';
import { initNavigation, onNavigate, goTo, STAGE_ID } from './navigation.js';
import { initProgressTracker, getPercent, getJournal } from './progress-tracker.js';
import { initAnimations, playIntro, transitionToAct } from './animation-controller.js';
import { initAudio, playEffect } from './audio-controller.js';
import { openModal } from './features/modal.js';
import { profile } from '../data/irene-profile.js';
import { ACTS } from './navigation.js';

/* ===========================================================================
   Pemuatan modul tiap babak
   ======================================================================== */

/**
 * Pemetaan babak ke modul fiturnya. Setiap modul mengekspor `render(host)`.
 * Daftar ini bertambah seiring tahap pengembangan; babak yang modulnya belum
 * ada akan menampilkan penanda, bukan halaman kosong.
 */
const ACT_MODULES = {
  'act-tokoh': () => import('./features/the-portrait.js'),
  'act-arena': () => import('./features/chess-arena.js'),
  'act-pion': () => import('./features/values-analysis.js'),
  'act-ratu': () => import('./features/statistics.js'),
};

const HOST_IDS = {
  'act-tokoh': 'tokoh-body',
  'act-arena': 'arena-body',
  'act-pion': 'pion-body',
  'act-ratu': 'ratu-body',
};

const loaded = new Set();
const loading = new Set();

async function loadAct(actId) {
  if (loaded.has(actId) || loading.has(actId)) return;

  const loader = ACT_MODULES[actId];
  const host = document.getElementById(HOST_IDS[actId]);
  if (!loader || !host) return;

  loading.add(actId);
  host.append(buildLoadingState());

  try {
    const module = await loader();
    host.replaceChildren();
    await module.render(host);
    loaded.add(actId);
    transitionToAct(actId);
  } catch (error) {
    console.error(`[TGG] Modul babak "${actId}" gagal dimuat:`, error);
    host.replaceChildren(buildErrorState(actId));
  } finally {
    loading.delete(actId);
  }
}

/** Status pemuatan bergaya teater. Tanpa persentase palsu. */
function buildLoadingState() {
  return el('div', { class: 'asset-slot', role: 'status', 'aria-live': 'polite' }, [
    el('span', { class: 'asset-slot__title', text: 'Menyiapkan panggung' }),
    el('span', { class: 'asset-slot__hint', text: 'Materi babak ini sedang dimuat.' }),
  ]);
}

function buildErrorState(actId) {
  const meta = ACTS.find((act) => act.id === actId);
  return el('div', { class: 'panel panel--framed' }, [
    el('h2', { class: 'heading-3 heading-ink panel__title', text: 'Materi belum dapat ditampilkan' }),
    el('div', { class: 'prose' }, [
      el('p', {
        text:
          `Modul untuk ${meta?.title ?? 'babak ini'} gagal dimuat. Periksa konsol ` +
          'browser untuk detailnya. Babak lain tetap dapat diakses melalui ' +
          'Program Acara.',
      }),
    ]),
  ]);
}

/* ===========================================================================
   Pop-up fakta bidak raksasa
   ======================================================================== */

function initGiantPieceFacts() {
  $('#giant-pieces')?.addEventListener('click', (event) => {
    const button = event.target.closest('.giant-piece');
    if (!button) return;

    const fact = profile.stageFacts[button.dataset.factKey];
    if (!fact) return;

    playEffect('transition');
    openModal({
      eyebrow: 'Dari panggung',
      title: fact.title,
      body: fact.body,
      footnote: fact.source,
    });
  });
}

/* ===========================================================================
   Final Curtain
   ======================================================================== */

function showFinalCurtain() {
  const root = $('#final-curtain');
  if (!root) return;

  const journal = getJournal();
  const percent = getPercent();

  root.replaceChildren(
    el('div', { class: 'final-curtain__inner' }, [
      el('p', { class: 'eyebrow', text: 'Tirai Penutup' }),
      el('h2', {
        class: 'heading-1 heading-gold',
        id: 'final-curtain-title',
        text: 'Pertunjukan Selesai',
      }),
      el('p', { class: 'final-curtain__message', text: profile.penutup }),

      el('ul', { class: 'journal__list', role: 'list', style: 'text-align:start' },
        ACTS.map((act) =>
          el('li', { class: 'journal__item', role: 'listitem' }, [
            el('span', { text: act.title }),
            el('span', {
              class: 'journal__status',
              dataset: { state: journal[act.id] === 'unvisited' ? 'unvisited' : 'visited' },
              text: journal[act.id] === 'completed' ? 'Selesai'
                : journal[act.id] === 'in-progress' ? 'Sedang dibaca'
                : 'Belum dibuka',
            }),
          ])
        )
      ),

      el('p', { class: 'journal__progress', text: `${percent}% dijelajahi` }),

      el('div', { class: 'final-curtain__actions' }, [
        el('button', {
          class: 'btn btn--gold',
          type: 'button',
          text: 'Kembali ke Panggung',
          onClick: () => {
            hideFinalCurtain();
            goTo(STAGE_ID);
          },
        }),
        el('button', {
          class: 'btn btn--ghost',
          type: 'button',
          text: 'Jelajahi Kembali',
          onClick: () => {
            hideFinalCurtain();
            goTo('act-tokoh');
          },
        }),
      ]),
    ])
  );

  root.hidden = false;
  playEffect('transition');
  root.querySelector('button')?.focus();

  document.addEventListener('keydown', onCurtainKey);
}

function hideFinalCurtain() {
  const root = $('#final-curtain');
  if (root) root.hidden = true;
  document.removeEventListener('keydown', onCurtainKey);
}

function onCurtainKey(event) {
  if (event.key === 'Escape') hideFinalCurtain();
}

function initFinalCurtain() {
  // Tombol di Program Acara dan di footer babak terakhir.
  document.addEventListener('click', (event) => {
    if (event.target.closest('#btn-final-curtain, #btn-final-curtain-footer')) {
      showFinalCurtain();
    }
  });
}

/* ===========================================================================
   Bootstrap
   ======================================================================== */

async function boot() {
  // 1. Sistem inti. Urutan penting: navigasi merender Program Acara dan
  //    footer babak yang kemudian dibaca progress-tracker.
  initNavigation();
  initProgressTracker();
  initAnimations({ facts: profile.stageFacts });
  initAudio();
  initGiantPieceFacts();
  initFinalCurtain();

  // 2. Muat modul babak saat babaknya dibuka.
  onNavigate((actId) => {
    if (actId !== STAGE_ID) loadAct(actId);
  });

  // 3. Bila pengunjung masuk langsung lewat URL ke sebuah babak, modulnya
  //    harus ikut dimuat tanpa menunggu navigasi berikutnya.
  const initialHash = window.location.hash.replace('#', '');
  if (initialHash && ACT_MODULES[initialHash]) loadAct(initialHash);

  // 4. Intro dijalankan terakhir agar tidak menahan inisialisasi apa pun.
  await playIntro();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}

// Satu error tak terduga tidak boleh membuat layar kosong.
window.addEventListener('error', (event) => {
  console.error('[TGG] Error tak tertangani:', event.error ?? event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[TGG] Promise ditolak tanpa penanganan:', event.reason);
});
