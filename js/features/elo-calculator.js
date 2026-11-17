/**
 * js/features/elo-calculator.js
 * =============================
 * Simulasi perubahan rating dengan rumus Elo.
 *
 * RUMUS
 *   Expected score:  E_A = 1 / (1 + 10^((R_B − R_A) / 400))
 *   Rating baru:     R'_A = R_A + K × (S_A − E_A)
 *
 * Seluruh langkah perhitungan ditampilkan terbuka di antarmuka agar hasilnya
 * dapat diperiksa ulang oleh pembaca, bukan sekadar angka yang muncul.
 *
 * PENTING: ini simulasi berbasis model Elo dasar. Perhitungan resmi FIDE
 * memakai ketentuan tambahan — pembatasan selisih rating 400 poin, aturan
 * pemain baru, pembulatan per turnamen, dan faktor K yang bergantung riwayat
 * pemain — sehingga hasilnya dapat berbeda. Keterangan ini selalu ditampilkan.
 */

import { el, empty } from '../utils/helpers.js';
import { validateRating, validateKFactor, validateScore } from '../utils/validators.js';
import { signed, number } from '../utils/formatters.js';

/**
 * Menghitung ekspektasi skor pemain A terhadap pemain B.
 * @returns {number} Nilai antara 0 dan 1.
 */
export function expectedScore(ratingA, ratingB) {
  return 1 / (1 + 10 ** ((ratingB - ratingA) / 400));
}

/**
 * Menghitung perubahan rating.
 * @returns {{expected: number, change: number, newRating: number}}
 */
export function calculate({ rating, opponent, score, k }) {
  const expected = expectedScore(rating, opponent);
  const change = k * (score - expected);
  return {
    expected,
    change,
    newRating: rating + change,
  };
}

/* ===========================================================================
   Antarmuka
   ======================================================================== */

const K_OPTIONS = [
  { value: 40, label: 'K = 40 — pemain baru, kurang dari 30 partai berperingkat' },
  { value: 20, label: 'K = 20 — pemain mapan dengan rating di bawah 2400' },
  { value: 10, label: 'K = 10 — pemain yang pernah mencapai rating 2400' },
];

const SCORE_OPTIONS = [
  { value: 1, label: 'Menang (1)' },
  { value: 0.5, label: 'Remis (½)' },
  { value: 0, label: 'Kalah (0)' },
];

function field(labelText, control, hint) {
  const errorNode = el('span', { class: 'field__error', hidden: true, role: 'alert' });
  const wrapper = el('div', { class: 'field' }, [
    el('label', { class: 'field__label', for: control.id, text: labelText }),
    control,
    hint ? el('span', { class: 'field__hint', text: hint }) : null,
    errorNode,
  ]);
  wrapper.errorNode = errorNode;
  return wrapper;
}

export function createEloCalculator({ defaultRating = 2330 } = {}) {
  const ratingInput = el('input', {
    class: 'field__input', id: 'calc-rating', type: 'number',
    inputmode: 'numeric', value: String(defaultRating), min: '100', max: '3000',
  });

  const opponentInput = el('input', {
    class: 'field__input', id: 'calc-opponent', type: 'number',
    inputmode: 'numeric', value: '2400', min: '100', max: '3000',
  });

  const scoreSelect = el('select', { class: 'field__select', id: 'calc-score' },
    SCORE_OPTIONS.map((option) =>
      el('option', { value: String(option.value), text: option.label })
    )
  );

  const kSelect = el('select', { class: 'field__select', id: 'calc-k' },
    K_OPTIONS.map((option) =>
      el('option', { value: String(option.value), text: option.label, selected: option.value === 20 })
    )
  );

  const ratingField = field('Rating pemain', ratingInput, 'Rating Standard terakhir Irene adalah 2330.');
  const opponentField = field('Rating lawan', opponentInput);
  const scoreField = field('Hasil pertandingan', scoreSelect);
  const kField = field('Faktor K', kSelect, 'Faktor pengembangan sesuai regulasi FIDE.');

  const results = el('div', { class: 'result-grid' });
  const steps = el('div', { class: 'calc-steps' });

  function run() {
    // Validasi seluruh masukan sebelum berhitung.
    const ratingCheck = validateRating(ratingInput.value, 'Rating pemain');
    const opponentCheck = validateRating(opponentInput.value, 'Rating lawan');
    const scoreCheck = validateScore(scoreSelect.value);
    const kCheck = validateKFactor(kSelect.value);

    const checks = [
      [ratingCheck, ratingField],
      [opponentCheck, opponentField],
      [scoreCheck, scoreField],
      [kCheck, kField],
    ];

    let hasError = false;
    for (const [check, node] of checks) {
      node.errorNode.hidden = check.valid;
      node.errorNode.textContent = check.valid ? '' : check.message;
      if (!check.valid) hasError = true;
    }

    if (hasError) {
      empty(results);
      empty(steps);
      results.append(
        el('p', {
          class: 'source-note',
          text: 'Perbaiki masukan yang ditandai untuk melihat hasil perhitungan.',
        })
      );
      return;
    }

    const rating = ratingCheck.value;
    const opponent = opponentCheck.value;
    const score = scoreCheck.value;
    const k = kCheck.value;

    const { expected, change, newRating } = calculate({ rating, opponent, score, k });

    // FIDE membulatkan perubahan rating ke bilangan bulat terdekat.
    const roundedChange = Math.round(change);
    const roundedNew = rating + roundedChange;

    empty(results);
    results.append(
      resultCell('Expected Score (E)', expected.toFixed(4),
        'Peluang teoretis memperoleh poin'),
      resultCell('Actual Score (S)', score === 0.5 ? '0,5' : String(score),
        SCORE_OPTIONS.find((o) => o.value === score)?.label ?? ''),
      resultCell('Perubahan Rating', signed(roundedChange),
        `K × (S − E) = ${change.toFixed(2)}`,
        roundedChange > 0 ? 'up' : roundedChange < 0 ? 'down' : null),
      resultCell('Rating Baru', number(roundedNew), `Dari ${number(rating)}`)
    );

    empty(steps);
    steps.append(
      stepLine('Selisih rating', `R_B − R_A = ${opponent} − ${rating} = ${opponent - rating}`),
      stepLine('Expected score', `E_A = 1 / (1 + 10^(${opponent - rating} / 400)) = ${expected.toFixed(4)}`),
      stepLine('Selisih hasil', `S_A − E_A = ${score} − ${expected.toFixed(4)} = ${(score - expected).toFixed(4)}`),
      stepLine('Perubahan', `K × (S_A − E_A) = ${k} × ${(score - expected).toFixed(4)} = ${change.toFixed(2)}`),
      stepLine('Pembulatan', `${change.toFixed(2)} → ${signed(roundedChange)}`),
      stepLine('Rating baru', `R'_A = ${rating} + (${signed(roundedChange)}) = ${roundedNew}`)
    );
  }

  function resultCell(label, value, meta, direction) {
    return el('div', { class: 'result-cell' }, [
      el('span', { class: 'result-cell__label', text: label }),
      el('span', {
        class: `result-cell__value${direction ? ` result-cell__value--${direction}` : ''}`,
        text: value,
      }),
      meta ? el('span', { class: 'source-note', style: 'display:block;margin-block-start:.35rem', text: meta }) : null,
    ]);
  }

  function stepLine(label, text) {
    return el('div', { class: 'calc-steps__line' }, [
      el('span', { class: 'calc-steps__label', text: `${label}:  ` }),
      el('span', { text }),
    ]);
  }

  // Hitung ulang setiap kali masukan berubah.
  [ratingInput, opponentInput, scoreSelect, kSelect].forEach((control) => {
    control.addEventListener('input', run);
    control.addEventListener('change', run);
  });

  const resetButton = el('button', {
    class: 'btn btn--ghost btn--sm',
    type: 'button',
    text: 'Reset',
    onClick: () => {
      ratingInput.value = String(defaultRating);
      opponentInput.value = '2400';
      scoreSelect.value = '1';
      kSelect.value = '20';
      run();
    },
  });

  run();

  return el('div', { class: 'panel panel--framed' }, [
    el('p', { class: 'eyebrow', text: 'Simulasi' }),
    el('h3', { class: 'heading-3 heading-ink panel__title', text: 'Kalkulator Elo' }),

    el('div', { class: 'prose', style: 'margin-block-end:1.5rem' }, [
      el('p', {
        text:
          'Masukkan rating kedua pemain dan hasil pertandingannya untuk melihat ' +
          'perkiraan perubahan rating. Setiap langkah perhitungannya ditampilkan ' +
          'di bawah supaya dapat Anda periksa ulang sendiri.',
      }),
    ]),

    el('div', { class: 'lens__controls' }, [ratingField, opponentField, scoreField, kField]),

    el('div', { style: 'display:flex;gap:.5rem;margin-block-end:1.5rem' }, [resetButton]),

    results,
    steps,

    el('div', { class: 'verify-note' }, [
      el('p', { class: 'verify-note__title', text: 'Batas keberlakuan simulasi ini' }),
      el('p', {
        text:
          'Hasil di atas memakai model Elo dasar. Perhitungan resmi FIDE ' +
          'menambahkan sejumlah ketentuan yang tidak diterapkan di sini: selisih ' +
          'rating dibatasi maksimal 400 poin, ada aturan khusus bagi pemain yang ' +
          'belum punya rating tetap, perubahan dijumlahkan per turnamen dan bukan ' +
          'per partai, serta faktor K ditentukan oleh riwayat pemain. Karena itu ' +
          'angka di atas adalah perkiraan, bukan pengganti perhitungan resmi FIDE.',
      }),
    ]),
  ]);
}

export default { createEloCalculator, calculate, expectedScore };
