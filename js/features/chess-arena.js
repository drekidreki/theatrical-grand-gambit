/**
 * js/features/chess-arena.js
 * ==========================
 * Babak II — Arena Pikir: The Chess Arena.
 *
 * Materi disusun sebagai ensiklopedia olahraga interaktif dalam tiga babak,
 * bukan satu artikel panjang. Setiap babak punya navigasi internal sendiri,
 * namun seluruh materi dari dokumen sumber tetap lengkap.
 */

import { el, empty, $$ } from '../utils/helpers.js';
import { ACTS, gamePhases } from '../../data/chess-rules.js';
import {
  renderBoardBasics, renderPieceEncyclopedia, renderSpecialRules,
  renderEndConditions, renderViolations,
} from './chess-rules.js';
import { Chessboard, demoBoard } from './chessboard.js';
import { createQuiz } from './guess-the-move.js';
import { engineBackend } from './chess-engine.js';
import { markCompleted } from '../progress-tracker.js';

/* ===========================================================================
   Papan bebas: tempat pengunjung mencoba sendiri
   ======================================================================== */

function freePlayBoard() {
  let moveCount = 0;

  const board = new Chessboard({
    onMove: () => {
      moveCount += 1;
      // Menjalankan beberapa langkah sah dihitung sebagai interaksi bermakna.
      if (moveCount >= 4) markCompleted('act-arena');
    },
  });

  return el('div', { class: 'arena-layout' }, [
    board.element,
    el('div', { class: 'panel panel--framed' }, [
      el('h3', { class: 'heading-3 heading-ink panel__title', text: 'Coba Sendiri' }),
      el('div', { class: 'prose' }, [
        el('p', {
          text:
            'Papan ini memakai posisi awal lengkap dengan 32 bidak. Ketuk sebuah ' +
            'bidak untuk melihat seluruh langkah sahnya, lalu ketuk petak tujuan ' +
            'untuk menjalankannya. Langkah yang tidak sah akan ditolak dan petaknya ' +
            'bergetar sebagai penanda.',
        }),
        el('p', {
          text:
            'Seluruh aturan yang dipelajari di babak ini berlaku di papan ini: ' +
            'rokade, en passant, promosi pion, skak, skakmat, pat, aturan 50 ' +
            'langkah, dan pengulangan posisi tiga kali. Raja tidak akan pernah ' +
            'bisa melangkah ke petak yang terancam.',
        }),
      ]),
      el('div', { class: 'verify-note' }, [
        el('p', { class: 'verify-note__title', text: 'Catatan notasi' }),
        el('p', {
          text:
            'Riwayat langkah memakai notasi Indonesia: R untuk Raja, M untuk ' +
            'Menteri, B untuk Benteng, G untuk Gajah, dan K untuk Kuda. Pion ' +
            'ditulis tanpa huruf. Perhatikan bahwa K di sini berarti Kuda, berbeda ' +
            'dengan notasi internasional yang memakai K untuk King.',
        }),
      ]),
      el('p', {
        class: 'source-note',
        style: 'margin-block-start:1rem',
        text: `Validasi langkah dijalankan oleh ${engineBackend()}.`,
      }),
    ]),
  ]);
}

/* ===========================================================================
   Tiga fase permainan
   ======================================================================== */

function phasesSection() {
  const boardHost = el('div', {});
  const detail = el('div', { class: 'panel panel--framed' });

  function show(phase) {
    detail.replaceChildren(
      el('p', { class: 'eyebrow', text: `Act ${phase.roman}` }),
      el('h3', {
        class: 'heading-3 heading-ink panel__title',
        text: `${phase.name} — ${phase.nameId}`,
      }),
      el('div', { class: 'prose' }, phase.paragraphs.map((text) => el('p', { text })))
    );

    const board = demoBoard(phase.demoFen);
    boardHost.replaceChildren(
      board.element,
      el('p', {
        class: 'source-note--on-dark',
        style: 'margin-block-start:.75rem',
        text: phase.demoHint,
      })
    );
  }

  const tabs = el(
    'div',
    { class: 'three-acts', role: 'tablist', 'aria-label': 'Tiga fase permainan catur' },
    gamePhases.map((phase, index) =>
      el('button', {
        class: 'act-tab',
        type: 'button',
        role: 'tab',
        'aria-selected': String(index === 0),
        onClick: (event) => {
          $$('.act-tab').forEach((node) =>
            node.setAttribute('aria-selected', String(node === event.currentTarget))
          );
          show(phase);
        },
      }, [
        el('span', { class: 'act-tab__roman', text: `Act ${phase.roman}` }),
        el('span', { class: 'act-tab__name', text: phase.name }),
        el('span', {
          style: 'display:block;margin-block-start:.35rem;font-size:.8125rem;color:var(--text-on-dark-soft)',
          text: phase.nameId,
        }),
      ])
    )
  );

  show(gamePhases[0]);

  return el('div', { class: 'stack' }, [
    tabs,
    el('div', { class: 'arena-layout' }, [boardHost, detail]),
  ]);
}

/* ===========================================================================
   Navigasi tiga babak
   ======================================================================== */

function sectionHeading(text, subtitle) {
  return el('div', { style: 'margin-block-end:1.5rem' }, [
    el('h2', { class: 'heading-2 heading-gold', text }),
    subtitle
      ? el('p', {
          class: 'source-note--on-dark',
          style: 'margin-block-start:.35rem;max-width:62ch',
          text: subtitle,
        })
      : null,
  ]);
}

const ACT_CONTENT = {
  'babak-1': () =>
    el('div', { class: 'stack' }, [
      sectionHeading('Anatomi Papan dan Susunan Awal'),
      renderBoardBasics(),
      sectionHeading(
        'Ensiklopedia Bidak',
        'Enam jenis bidak beserta aturan gerak, batasan, dan nilai tukar standarnya. ' +
          'Pilih salah satu untuk melihat pola geraknya langsung di papan.'
      ),
      renderPieceEncyclopedia(),
    ]),

  'babak-2': () =>
    el('div', { class: 'stack' }, [
      sectionHeading(
        'Papan Catur Interaktif',
        'Seluruh aturan berlaku penuh di papan ini. Reset, Undo, dan Flip tersedia di bawahnya.'
      ),
      freePlayBoard(),
      sectionHeading(
        'Tiga Fase Permainan',
        'Satu partai catur terbagi menjadi tiga babak dengan logika yang berbeda-beda.'
      ),
      phasesSection(),
    ]),

  'babak-3': () =>
    el('div', { class: 'stack' }, [
      sectionHeading(
        'Aturan Khusus',
        'Tiga aturan yang paling sering disalahpahami: rokade, en passant, dan promosi pion.'
      ),
      renderSpecialRules(),
      sectionHeading('Kondisi Akhir Permainan'),
      renderEndConditions(),
      sectionHeading(
        'Kesalahan, Pelanggaran, dan Sanksi Resmi',
        'Naskah dokumen sumber ditampilkan utuh, dilengkapi kotak Catatan Verifikasi ' +
          'pada butir yang hasil pengecekannya terhadap FIDE Laws of Chess berbeda.'
      ),
      renderViolations(),
      sectionHeading(
        'Guess the Move',
        'Sepuluh soal untuk menguji pemahaman. Setiap jawaban disertai penjelasan.'
      ),
      createQuiz(),
    ]),
};

/* ===========================================================================
   Render
   ======================================================================== */

export async function render(host) {
  const content = el('div', {});

  function show(actId) {
    empty(content);
    const builder = ACT_CONTENT[actId];
    if (builder) content.append(builder());
  }

  const nav = el(
    'div',
    { class: 'three-acts', role: 'tablist', 'aria-label': 'Tiga babak materi catur' },
    ACTS.map((act, index) =>
      el('button', {
        class: 'act-tab',
        type: 'button',
        role: 'tab',
        'aria-selected': String(index === 0),
        dataset: { arenaAct: act.id },
        onClick: (event) => {
          $$('[data-arena-act]').forEach((node) =>
            node.setAttribute('aria-selected', String(node === event.currentTarget))
          );
          show(act.id);
          content.scrollIntoView({ block: 'start', behavior: 'smooth' });
        },
      }, [
        el('span', { class: 'act-tab__roman', text: `Babak ${act.roman}` }),
        el('span', { class: 'act-tab__name', text: act.name }),
        el('span', {
          style: 'display:block;margin-block-start:.35rem;font-size:.8125rem;color:var(--text-on-dark-soft)',
          text: act.blurb,
        }),
      ])
    )
  );

  show(ACTS[0].id);

  host.append(
    el('div', { class: 'stack' }, [
      el('div', { class: 'panel panel--cream panel--prose' }, [
        el('div', { class: 'prose' }, [
          el('p', {
            text:
              'Catur adalah olahraga strategi dua pemain yang dimainkan di atas papan ' +
              '64 petak. Berbeda dari kebanyakan cabang olahraga, tidak ada unsur ' +
              'keberuntungan sama sekali di dalamnya: kedua pemain melihat seluruh ' +
              'informasi yang sama sepanjang pertandingan, sehingga hasil akhirnya ' +
              'sepenuhnya ditentukan oleh kualitas keputusan masing-masing.',
          }),
          el('p', {
            text:
              'Materi berikut dibagi menjadi tiga babak. Babak I mengenalkan papan dan ' +
              'bidak, Babak II membahas gerakan dan strategi dasar, dan Babak III ' +
              'membahas aturan khusus, kondisi akhir permainan, serta sanksi resmi ' +
              'dalam pertandingan.',
          }),
        ]),
      ]),
      nav,
      content,
    ])
  );
}

export default { render };
