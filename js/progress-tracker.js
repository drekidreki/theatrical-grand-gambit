/**
 * js/progress-tracker.js
 * ======================
 * The Grandmaster's Journal — pelacak progres eksplorasi.
 *
 * Tiga keadaan per babak:
 *   unvisited    belum pernah dibuka
 *   in-progress  sudah dibuka
 *   completed    pengunjung benar-benar menelusuri isinya
 *
 * Sesuai dokumen konsep, "completed" TIDAK diberikan hanya karena halaman
 * terbuka beberapa detik. Statusnya naik jika salah satu terpenuhi:
 *   a. pengunjung menggulir sampai sekitar akhir babak, atau
 *   b. modul fitur memanggil markCompleted() setelah interaksi bermakna
 *      (misalnya menyelesaikan Guess the Move atau menjalankan kalkulator Elo).
 *
 * Fitur ini tidak pernah menghalangi akses ke materi mana pun.
 */

import { $, $$, el, getScroller, rafThrottle, clamp } from './utils/helpers.js';
import { read, write, KEYS } from './storage.js';
import { ACTS, STAGE_ID, getCurrentAct, onNavigate } from './navigation.js';

const STATE_LABEL = {
  unvisited: 'Belum dibuka',
  'in-progress': 'Sedang dibaca',
  completed: 'Selesai',
};

/** @type {Record<string, 'unvisited'|'in-progress'|'completed'>} */
let journal = {};

function defaultJournal() {
  return Object.fromEntries(ACTS.map((act) => [act.id, 'unvisited']));
}

function load() {
  const stored = read(KEYS.JOURNAL, null);
  journal = { ...defaultJournal(), ...(stored && typeof stored === 'object' ? stored : {}) };

  // Buang kunci babak yang sudah tidak ada lagi.
  for (const key of Object.keys(journal)) {
    if (!ACTS.some((act) => act.id === key)) delete journal[key];
  }
}

function persist() {
  write(KEYS.JOURNAL, journal);
}

/** Persentase eksplorasi: selesai bernilai penuh, sedang dibaca bernilai separuh. */
export function getPercent() {
  const total = ACTS.length;
  const score = ACTS.reduce((sum, act) => {
    if (journal[act.id] === 'completed') return sum + 1;
    if (journal[act.id] === 'in-progress') return sum + 0.5;
    return sum;
  }, 0);
  return Math.round((score / total) * 100);
}

export const getJournal = () => ({ ...journal });

export const getCompletedCount = () =>
  ACTS.filter((act) => journal[act.id] === 'completed').length;

/** Menaikkan status sebuah babak. Status tidak pernah diturunkan. */
function setState(actId, state) {
  const RANK = { unvisited: 0, 'in-progress': 1, completed: 2 };
  if (!(actId in journal)) return;
  if (RANK[state] <= RANK[journal[actId]]) return;

  journal[actId] = state;
  persist();
  render();
}

/** Dipanggil modul fitur setelah interaksi bermakna selesai. */
export function markCompleted(actId) {
  setState(actId, 'completed');
}

/* ===========================================================================
   Render
   ======================================================================== */

function render() {
  const list = $('#journal-list');
  if (list) {
    list.replaceChildren(
      ...ACTS.map((act) =>
        el('li', { class: 'journal__item', role: 'listitem' }, [
          el('span', { text: act.title }),
          el('span', {
            class: 'journal__status',
            dataset: { state: journal[act.id] === 'unvisited' ? 'unvisited' : 'visited' },
            text: STATE_LABEL[journal[act.id]],
          }),
        ])
      )
    );
  }

  const percentNode = $('#journal-percent');
  if (percentNode) percentNode.textContent = `${getPercent()}%`;

  // Penanda status di dalam Program Acara.
  $$('[data-journal-status]').forEach((node) => {
    const state = journal[node.dataset.journalStatus];
    node.textContent = state && state !== 'unvisited' ? STATE_LABEL[state] : '';
  });
}

/* ===========================================================================
   Progres membaca + deteksi penyelesaian
   ======================================================================== */

function initReadingProgress() {
  const bar = $('#reading-progress-bar');
  const scroller = getScroller();
  if (!bar) return;

  const update = rafThrottle(() => {
    const scrollable = scroller.scrollHeight - scroller.clientHeight;
    const ratio = scrollable > 8 ? scroller.scrollTop / scrollable : 0;
    const percent = clamp(ratio * 100, 0, 100);

    bar.style.width = `${percent}%`;

    // Menggulir hampir sampai akhir sebuah babak dihitung sebagai selesai.
    const actId = getCurrentAct();
    if (actId !== STAGE_ID && percent >= 85) markCompleted(actId);
  });

  scroller.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

export function initProgressTracker() {
  load();
  render();
  initReadingProgress();

  onNavigate((actId) => {
    if (actId !== STAGE_ID) setState(actId, 'in-progress');

    // Babak yang muat seluruhnya tanpa perlu digulir tetap bisa selesai.
    requestAnimationFrame(() => {
      const scroller = getScroller();
      if (actId !== STAGE_ID && scroller.scrollHeight <= scroller.clientHeight + 8) {
        markCompleted(actId);
      }
    });
  });
}

export default { initProgressTracker, markCompleted, getPercent, getJournal };
