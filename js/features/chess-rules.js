/**
 * js/features/chess-rules.js
 * ==========================
 * Pustaka peraturan catur: ensiklopedia bidak, aturan khusus, kondisi akhir
 * permainan, dan sanksi resmi.
 *
 * Materi dari dokumen sumber ditampilkan utuh. Di bawah butir yang hasil
 * pengecekannya terhadap FIDE Laws of Chess berbeda, ditambahkan kotak
 * Catatan Verifikasi — naskah asli tidak diubah sedikit pun.
 */

import { el, $$ } from '../utils/helpers.js';
import {
  boardAnatomy, startingPosition, generalMovement, pieces,
  specialRules, endConditions, violations, sources,
} from '../../data/chess-rules.js';
import { demoBoard } from './chessboard.js';
import { UNICODE } from '../utils/piece-art.js';

/* ===========================================================================
   Potongan yang dipakai berulang
   ======================================================================== */

function prose(paragraphs) {
  return el('div', { class: 'prose' }, paragraphs.map((text) => el('p', { text })));
}

function checklist({ title, items }) {
  return el('div', { style: 'margin-block-start:1.25rem' }, [
    el('h4', { class: 'heading-4 heading-ink', style: 'margin-block-end:.5rem', text: title }),
    el('ul', { class: 'prose' }, items.map((item) => el('li', { text: item }))),
  ]);
}

/** Kotak Catatan Verifikasi terhadap FIDE Laws of Chess. */
export function verifyNote({ title, paragraphs }) {
  return el('div', { class: 'verify-note' }, [
    el('p', { class: 'verify-note__title' }, [
      el('span', { text: '⚠', 'aria-hidden': 'true' }),
      el('span', { text: title }),
    ]),
    ...paragraphs.map((text) => el('p', { text })),
  ]);
}

function pointList(points) {
  return el(
    'div',
    { class: 'stack--tight', style: 'margin-block-start:1.25rem' },
    points.map((point) =>
      el('div', {}, [
        el('h4', { class: 'heading-4 heading-ink', style: 'margin-block-end:.35rem', text: point.label }),
        el('p', { class: 'prose', text: point.text }),
      ])
    )
  );
}

/* ===========================================================================
   Babak I — papan dan susunan awal
   ======================================================================== */

export function renderBoardBasics() {
  const anatomyPanel = el('div', { class: 'panel panel--framed' }, [
    el('h3', { class: 'heading-3 heading-ink panel__title', text: boardAnatomy.title }),
    prose(boardAnatomy.paragraphs),
    pointList(boardAnatomy.points),
  ]);

  const startPanel = el('div', { class: 'panel panel--framed' }, [
    el('h3', { class: 'heading-3 heading-ink panel__title', text: startingPosition.title }),
    prose(startingPosition.paragraphs),
    pointList(startingPosition.points),
  ]);

  const board = demoBoard(undefined);

  return el('div', { class: 'stack' }, [
    anatomyPanel,
    el('div', { class: 'arena-layout' }, [
      el('div', {}, [
        board.element,
        el('p', {
          class: 'source-note--on-dark',
          style: 'margin-block-start:.75rem',
          text:
            'Klik petak mana pun untuk melihat koordinatnya, dan klik sebuah bidak ' +
            'untuk melihat seluruh langkah sahnya disorot di papan.',
        }),
      ]),
      startPanel,
    ]),
  ]);
}

/* ===========================================================================
   Babak II — ensiklopedia bidak
   ======================================================================== */

export function renderPieceEncyclopedia() {
  const detail = el('div', { class: 'panel panel--framed' });
  const boardHost = el('div', {});

  function show(piece) {
    const paragraphs = [piece.movement, piece.special, piece.strategic].filter(Boolean);

    detail.replaceChildren(
      el('div', { class: 'piece-card' }, [
        el('div', {}, [
          el('div', {
            class: 'piece-card__glyph',
            text: UNICODE.white[piece.type],
            'aria-hidden': 'true',
          }),
          el('span', { class: 'piece-card__value', text: piece.valueLabel }),
        ]),
        el('div', {}, [
          el('h3', { class: 'heading-3 heading-ink', text: piece.name }),
          el('p', {
            class: 'eyebrow',
            style: 'margin-block:.25rem 1rem',
            text: `${piece.english} · notasi "${piece.type === 'p' ? 'tanpa huruf' : { k: 'R', q: 'M', r: 'B', b: 'G', n: 'K' }[piece.type]}"`,
          }),
          prose(paragraphs),
        ]),
      ])
    );

    const board = demoBoard(piece.demoFen, piece.demoSquare);
    boardHost.replaceChildren(
      board.element,
      el('p', {
        class: 'source-note--on-dark',
        style: 'margin-block-start:.75rem',
        text: `Petak bertanda adalah seluruh langkah sah ${piece.name} dari ${piece.demoSquare} pada papan kosong. Coba pindahkan bidaknya.`,
      })
    );
  }

  const tabs = el(
    'div',
    { class: 'piece-tabs', role: 'tablist', 'aria-label': 'Enam jenis bidak catur' },
    pieces.map((piece, index) =>
      el('button', {
        class: 'btn btn--ghost btn--sm',
        type: 'button',
        role: 'tab',
        'aria-selected': String(index === 0),
        text: `${UNICODE.white[piece.type]} ${piece.name}`,
        onClick: (event) => {
          $$('.piece-tabs [role="tab"]').forEach((node) =>
            node.setAttribute('aria-selected', String(node === event.currentTarget))
          );
          show(piece);
        },
      })
    )
  );

  show(pieces[0]);

  return el('div', { class: 'stack' }, [
    el('div', { class: 'panel panel--cream panel--prose' }, [
      el('p', { class: 'prose', text: generalMovement }),
    ]),
    tabs,
    el('div', { class: 'arena-layout' }, [boardHost, detail]),
  ]);
}

/* ===========================================================================
   Babak III — aturan khusus
   ======================================================================== */

export function renderSpecialRules() {
  const boardHost = el('div', {});
  const detail = el('div', { class: 'panel panel--framed' });

  function show(rule) {
    detail.replaceChildren(
      el('h3', { class: 'heading-3 heading-ink panel__title', text: rule.title }),
      prose(rule.paragraphs),
      rule.checklist ? checklist(rule.checklist) : null,
      rule.variants
        ? el(
            'div',
            { style: 'margin-block-start:1.25rem' },
            rule.variants.map((variant) =>
              el('p', { class: 'prose', style: 'margin-block-end:.5rem' }, [
                el('strong', { text: `${variant.label}: ` }),
                document.createTextNode(variant.text),
              ])
            )
          )
        : null
    );

    const board = demoBoard(rule.demoFen);
    boardHost.replaceChildren(
      board.element,
      el('p', {
        class: 'source-note--on-dark',
        style: 'margin-block-start:.75rem',
        text: rule.demoHint ?? 'Coba jalankan sendiri aturan ini di papan.',
      })
    );
  }

  const nav = el(
    'div',
    { class: 'rules-nav', role: 'tablist', 'aria-label': 'Tiga aturan khusus' },
    specialRules.map((rule, index) =>
      el('button', {
        class: 'btn btn--ghost btn--sm',
        type: 'button',
        role: 'tab',
        'aria-selected': String(index === 0),
        text: rule.title.split(' (')[0],
        onClick: (event) => {
          $$('.rules-nav [role="tab"]').forEach((node) =>
            node.setAttribute('aria-selected', String(node === event.currentTarget))
          );
          show(rule);
        },
      })
    )
  );

  show(specialRules[0]);

  return el('div', { class: 'stack' }, [nav, el('div', { class: 'arena-layout' }, [boardHost, detail])]);
}

/* ===========================================================================
   Kondisi akhir permainan
   ======================================================================== */

export function renderEndConditions() {
  const { check, draws } = endConditions;

  const checkPanel = el('div', { class: 'panel panel--framed' }, [
    el('h3', { class: 'heading-3 heading-ink panel__title', text: check.title }),
    prose(check.paragraphs),
    checklist(check.checklist),
    el('div', { class: 'prose', style: 'margin-block-start:1.25rem' }, [
      el('p', { text: check.closing }),
    ]),
  ]);

  const mateBoard = demoBoard(check.demoFen);

  const drawPanel = el('div', { class: 'panel panel--framed' }, [
    el('h3', { class: 'heading-3 heading-ink panel__title', text: draws.title }),
    el('p', { class: 'lede', style: 'margin-block-end:1.25rem', text: draws.intro }),
    ...draws.items.map((item, index) =>
      el('div', { class: 'rule-card', style: index ? 'margin-block-start:1.5rem' : '' }, [
        el('div', { class: 'rule-card__heading' }, [
          el('span', { class: 'rule-card__number', text: String(index + 1) }),
          el('h4', { class: 'heading-4 heading-ink', text: item.label }),
        ]),
        el('p', { class: 'prose', text: item.text }),
        item.examples
          ? el('ul', { class: 'prose', style: 'margin-block-start:.75rem' },
              item.examples.map((example) => el('li', { text: example })))
          : null,
        item.verifyNote
          ? verifyNote({
              title: 'Catatan Verifikasi — FIDE Laws of Chess',
              paragraphs: [item.verifyNote],
            })
          : null,
      ])
    ),
  ]);

  return el('div', { class: 'stack' }, [
    el('div', { class: 'arena-layout' }, [
      el('div', {}, [
        mateBoard.element,
        el('p', {
          class: 'source-note--on-dark',
          style: 'margin-block-start:.75rem',
          text: check.demoHint,
        }),
      ]),
      checkPanel,
    ]),
    drawPanel,
  ]);
}

/* ===========================================================================
   Pelanggaran dan sanksi
   ======================================================================== */

export function renderViolations() {
  return el('div', { class: 'stack' }, [
    el('div', { class: 'panel panel--cream panel--prose' }, [
      el('p', { class: 'prose', text: violations.intro }),
    ]),

    ...violations.items.map((item, index) =>
      el('div', { class: 'panel panel--framed' }, [
        el('div', { class: 'rule-card__heading' }, [
          el('span', { class: 'rule-card__number', text: String(index + 1) }),
          el('h3', { class: 'heading-3 heading-ink', text: item.title }),
        ]),

        el('span', { class: 'provenance provenance--source', text: 'Naskah dokumen tugas' }),

        item.paragraphs.length ? prose(item.paragraphs) : null,
        item.checklist ? checklist(item.checklist) : null,

        item.sanctions
          ? el('div', { style: 'margin-block-start:1.25rem' }, [
              el('h4', {
                class: 'heading-4 heading-ink',
                style: 'margin-block-end:.5rem',
                text: item.sanctions.title,
              }),
              ...item.sanctions.items.map((sanction) =>
                el('p', { class: 'prose', style: 'margin-block-end:.75rem' }, [
                  el('strong', { text: `${sanction.label}: ` }),
                  document.createTextNode(sanction.text),
                ])
              ),
            ])
          : null,

        item.verifyNote ? verifyNote(item.verifyNote) : null,
      ])
    ),

    el('div', { class: 'panel panel--cream' }, [
      el('h4', { class: 'heading-4 heading-ink', style: 'margin-block-end:.5rem', text: 'Sumber materi babak ini' }),
      el('ul', { class: 'prose' }, sources.map((source) => el('li', { text: source }))),
    ]),
  ]);
}

export default {
  renderBoardBasics, renderPieceEncyclopedia, renderSpecialRules,
  renderEndConditions, renderViolations, verifyNote,
};
