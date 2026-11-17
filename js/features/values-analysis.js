/**
 * js/features/values-analysis.js
 * ==============================
 * Babak III — Promosi Pion: The Values of a Champion.
 *
 * ATURAN KONTEN YANG MENGIKAT MODUL INI
 * Seluruh paragraf dari data/academic-analysis.js ditampilkan UTUH. Accordion
 * di sini hanya mengatur panjang tampilan dan SELALU TERBUKA secara default,
 * sehingga tidak ada satu uraian pun yang tersembunyi secara permanen.
 *
 * Pemetaan Pancasila berasal dari data/pancasila-analysis.js dan selalu
 * ditandai sebagai "Lapisan Interpretasi", dibedakan secara visual dari
 * naskah sumber.
 */

import { $, $$, el } from '../utils/helpers.js';
import {
  rights, obligations, exemplaryValues, reflectionQuestions, closingSummary,
} from '../../data/academic-analysis.js';
import {
  silaMappings, disclaimer, LAYER_LABEL, STRENGTH_LABEL,
} from '../../data/pancasila-analysis.js';
import { markCompleted } from '../progress-tracker.js';

/* ===========================================================================
   Pembuka: perjalanan pion menjadi Ratu
   ======================================================================== */

function pawnJourney() {
  const squares = Array.from({ length: 8 }, (_, index) =>
    el('div', { class: 'pawn-journey__square' }, [
      index === 7
        ? el('span', { class: 'pawn-journey__crown', text: '♕', 'aria-hidden': 'true' })
        : index === 0
          ? el('span', { class: 'pawn-journey__pawn', text: '♙', 'aria-hidden': 'true' })
          : null,
    ])
  );

  return el('div', {}, [
    el('div', {
      class: 'pawn-journey',
      role: 'img',
      'aria-label':
        'Ilustrasi pion yang melangkah dari petak pertama hingga petak ' +
        'kedelapan, lalu berubah menjadi Menteri.',
    }, squares),
    el('p', {
      class: 'source-note--on-dark',
      style: 'text-align:center;max-width:52ch;margin:0 auto 2rem',
      text:
        'Pion adalah bidak bernilai paling rendah di papan. Tetapi pion yang ' +
        'konsisten melangkah maju sampai ujung berhak berubah menjadi bidak ' +
        'terkuat. Babak ini membaca perjalanan Irene dengan cara yang sama.',
    }),
  ]);
}

/* ===========================================================================
   Accordion submateri — terbuka secara default
   ======================================================================== */

function analysisItem(item, index) {
  const bodyId = `${item.id}-body`;
  const toggleId = `${item.id}-toggle`;

  const body = el(
    'div',
    { class: 'analysis-item__body prose', id: bodyId, role: 'region', 'aria-labelledby': toggleId },
    item.paragraphs.map((text) => el('p', { text }))
  );

  const toggle = el(
    'button',
    {
      class: 'analysis-item__toggle',
      type: 'button',
      id: toggleId,
      'aria-expanded': 'true',
      'aria-controls': bodyId,
      onClick: () => {
        const open = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!open));
        body.hidden = open;
      },
    },
    [
      el('span', { class: 'analysis-item__title', text: `${index + 1}. ${item.title}` }),
      el('span', { class: 'analysis-item__marker', text: '−', 'aria-hidden': 'true' }),
    ]
  );

  return el('div', { class: 'analysis-item' }, [toggle, body]);
}

function valuesPanel({ title, iconPath, items, intro }) {
  return el('div', { class: 'values-panel' }, [
    el('div', { class: 'panel panel--framed' }, [
      el('div', { class: 'values-panel__header' }, [
        el('span', {
          class: 'values-panel__icon',
          html:
            `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">` +
            `<path fill="currentColor" d="${iconPath}"/></svg>`,
        }),
        el('h2', { class: 'heading-3 heading-ink', text: title }),
      ]),

      el('span', { class: 'provenance provenance--source', text: 'Naskah dokumen tugas' }),

      intro ? el('p', { class: 'lede', style: 'margin-block-end:1.25rem', text: intro }) : null,

      ...items.map(analysisItem),
    ]),
  ]);
}

/* ===========================================================================
   Nilai keteladanan: spanduk + sorotan
   ======================================================================== */

function valuesSpotlight() {
  const detail = el('div', { class: 'panel panel--cream panel--framed', id: 'value-detail' });

  function show(value) {
    detail.replaceChildren(
      el('span', { class: 'provenance provenance--source', text: 'Naskah dokumen tugas' }),
      el('h3', { class: 'heading-3 heading-ink panel__title', text: value.title }),
      el('div', { class: 'prose' }, value.paragraphs.map((text) => el('p', { text })))
    );
    markCompleted('act-pion');
  }

  const banners = exemplaryValues.map((value, index) =>
    el(
      'button',
      {
        class: 'value-banner',
        type: 'button',
        'aria-pressed': String(index === 0),
        onClick: (event) => {
          $$('.value-banner').forEach((node) =>
            node.setAttribute('aria-pressed', String(node === event.currentTarget))
          );
          show(value);
        },
      },
      [
        el('span', { class: 'value-banner__number', text: String(index + 1).padStart(2, '0') }),
        el('span', { class: 'value-banner__name', text: value.shortName }),
      ]
    )
  );

  // Nilai pertama ditampilkan sejak awal, supaya panel tidak pernah kosong.
  show(exemplaryValues[0]);

  return el('div', {}, [
    el('h2', {
      class: 'heading-2 heading-gold',
      style: 'margin-block-end:.5rem',
      text: 'Nilai-Nilai Keteladanan',
    }),
    el('p', {
      class: 'source-note--on-dark',
      style: 'margin-block-end:1.5rem;max-width:62ch',
      text:
        'Bagian ini sekaligus menjadi analisis Pendidikan Agama pada tugas ' +
        'ini, sesuai pembagian materi yang ditetapkan. Pilih salah satu ' +
        'spanduk untuk membaca uraian lengkapnya.',
    }),
    el('div', { class: 'grid grid--2', style: 'align-items:start' }, [
      el('div', { class: 'values-banners' }, banners),
      detail,
    ]),
  ]);
}

/* ===========================================================================
   Pemetaan Pancasila — lapisan interpretasi
   ======================================================================== */

function pancasilaMapping() {
  const detail = el('div', { class: 'panel panel--framed' });

  function show(sila) {
    detail.replaceChildren(
      el('span', { class: 'provenance provenance--interpretation', text: LAYER_LABEL }),
      el('p', { class: 'eyebrow', text: `${sila.roman} · ${STRENGTH_LABEL[sila.strength]}` }),
      el('h3', { class: 'heading-3 heading-ink panel__title', text: sila.text }),
      el('p', { class: 'pull-quote', style: 'margin-block-end:1.25rem', text: sila.claim }),
      el('div', { class: 'prose' }, sila.paragraphs.map((text) => el('p', { text }))),
      el('div', { class: 'verify-note' }, [
        el('p', { class: 'verify-note__title', text: 'Dasar dari naskah sumber' }),
        el(
          'ul',
          { class: 'prose', style: 'padding-inline-start:1.1rem;margin:0' },
          sila.basis.map((item) => el('li', { style: 'font-size:.9375rem', text: item }))
        ),
      ])
    );
  }

  const chips = silaMappings.map((sila, index) =>
    el(
      'button',
      {
        class: 'sila-chip',
        type: 'button',
        role: 'tab',
        'aria-selected': String(index === 0),
        onClick: (event) => {
          $$('.sila-chip').forEach((node) =>
            node.setAttribute('aria-selected', String(node === event.currentTarget))
          );
          show(sila);
        },
      },
      [
        el('span', { class: 'sila-chip__ordinal', text: sila.roman }),
        el('span', { class: 'sila-chip__text', text: sila.text }),
      ]
    )
  );

  show(silaMappings[0]);

  return el('div', {}, [
    el('h2', {
      class: 'heading-2 heading-gold',
      style: 'margin-block-end:.5rem',
      text: 'Pemetaan Pancasila',
    }),

    el('div', {
      class: 'data-gap-note',
      style: 'margin-block:0 1.5rem;background:rgb(184 147 63 / 12%);border-color:rgb(184 147 63 / 45%);border-inline-start-color:var(--color-old-gold)',
    }, [
      el('span', {
        class: 'data-gap-note__title',
        style: 'color:var(--gold-deep)',
        text: `${LAYER_LABEL} — bukan kutipan dokumen sumber`,
      }),
      el('span', { text: disclaimer }),
    ]),

    el('div', { class: 'sila-grid', role: 'tablist', 'aria-label': 'Lima sila Pancasila' }, chips),
    detail,
  ]);
}

/* ===========================================================================
   Refleksi dan penutup
   ======================================================================== */

function reflection() {
  return el('div', { class: 'reflection' }, [
    el('div', { class: 'panel panel--cream panel--framed panel--prose' }, [
      el('h2', { class: 'heading-3 heading-ink panel__title', text: 'Refleksi' }),
      el('p', {
        class: 'lede',
        style: 'margin-block-end:1.25rem',
        text:
          'Empat pertanyaan berikut tidak memiliki jawaban benar atau salah, ' +
          'dan tidak ada jawaban yang dikirim ke mana pun. Silakan dijawab ' +
          'dalam hati atau didiskusikan di kelas.',
      }),
      ...reflectionQuestions.map((question) =>
        el('p', { class: 'reflection__question', text: question })
      ),
      el('p', {
        class: 'source-note reflection__note',
        text:
          'Website ini tidak mengumpulkan, menyimpan, maupun mengirimkan data ' +
          'pribadi pengunjung dalam bentuk apa pun.',
      }),
    ]),
  ]);
}

function closing() {
  return el('div', { class: 'panel panel--framed panel--prose' }, [
    el('h2', { class: 'heading-3 heading-ink panel__title', text: 'Rangkuman Hubungan Ketiga Aspek' }),
    el('div', { class: 'prose' }, [el('p', { text: closingSummary })]),
  ]);
}

/* ===========================================================================
   Kontrol buka/tutup semua
   ======================================================================== */

function expandControls() {
  function setAll(open) {
    $$('.analysis-item__toggle').forEach((toggle) => {
      toggle.setAttribute('aria-expanded', String(open));
      const body = document.getElementById(toggle.getAttribute('aria-controls'));
      if (body) body.hidden = !open;
    });
  }

  return el('div', { style: 'display:flex;gap:.5rem;flex-wrap:wrap;justify-content:center' }, [
    el('button', {
      class: 'btn btn--ghost btn--sm',
      type: 'button',
      text: 'Buka semua uraian',
      onClick: () => setAll(true),
    }),
    el('button', {
      class: 'btn btn--ghost btn--sm',
      type: 'button',
      text: 'Ringkas semua',
      onClick: () => setAll(false),
    }),
  ]);
}

/* ===========================================================================
   Render
   ======================================================================== */

export async function render(host) {
  host.append(
    el('div', { class: 'stack' }, [
      pawnJourney(),

      expandControls(),

      el('div', { class: 'values-panels' }, [
        valuesPanel({
          title: 'Analisis Hak',
          // ikon: tangan terbuka menerima
          iconPath:
            'M12 2a2 2 0 0 1 2 2v7h1V6a2 2 0 1 1 4 0v9a7 7 0 0 1-7 7h-1a7 7 0 0 1-7-7V9a2 2 0 1 1 4 0v2h1V4a2 2 0 0 1 2-2Z',
          intro:
            'Empat bentuk pemenuhan hak yang menjadi fondasi perjalanan karier ' +
            'Irene, dari kebebasan memilih sampai pengakuan atas prestasi.',
          items: rights,
        }),

        valuesPanel({
          title: 'Analisis Kewajiban',
          // ikon: perisai
          iconPath: 'M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z',
          intro:
            'Tiga tanggung jawab yang dipikul Irene sebagai konsekuensi dari ' +
            'hak-hak yang telah ia terima.',
          items: obligations,
        }),
      ]),

      valuesSpotlight(),
      pancasilaMapping(),
      reflection(),
      closing(),
    ])
  );
}

export default { render };
