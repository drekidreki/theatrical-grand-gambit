/**
 * js/features/statistics.js
 * =========================
 * Babak IV — Sang Ratu: The Numbers Speak.
 *
 * Setiap angka pada halaman ini dihitung saat aplikasi berjalan oleh
 * elo-stats.js dari data/elo-ratings.js. Tidak ada satu pun angka statistik
 * yang diketik manual ke dalam markup — termasuk angka yang muncul di dalam
 * kalimat narasi.
 */

import { el, empty, $$ } from '../utils/helpers.js';
import * as stats from './elo-stats.js';
import { createEloChart } from './elo-chart.js';
import { createEloCalculator } from './elo-calculator.js';
import { renderAchievementTimeline, renderAchievementStats } from './achievement-timeline.js';
import { eloSeries } from '../../data/elo-ratings.js';
import {
  periodLabel, periodList, number, signed, percent, CATEGORY_LABEL, CATEGORY_SHORT,
} from '../utils/formatters.js';
import { validatePeriodRange } from '../utils/validators.js';
import { markCompleted } from '../progress-tracker.js';

/* ===========================================================================
   Pengenalan sistem rating Elo
   ======================================================================== */

function introSection() {
  return el('div', { class: 'panel panel--framed panel--prose' }, [
    el('h2', { class: 'heading-3 heading-ink panel__title', text: 'Memahami Sistem Rating Elo' }),
    el('div', { class: 'prose' }, [
      el('p', {
        text:
          'Rating Elo adalah sistem angka yang mengukur kekuatan relatif seorang ' +
          'pemain catur dibandingkan pemain lain. Sistem ini dirancang oleh Arpad ' +
          'Elo dan dipakai resmi oleh FIDE. Angkanya tidak punya makna mutlak — ' +
          'rating 2400 tidak berarti "dua kali lebih baik" daripada 1200. Yang ' +
          'bermakna adalah selisihnya, karena selisih itulah yang menentukan ' +
          'peluang menang kedua pemain.',
      }),
      el('p', {
        text:
          'Setelah bertanding, rating berubah berdasarkan perbandingan hasil nyata ' +
          'dengan hasil yang diharapkan. Mengalahkan pemain berating jauh lebih ' +
          'tinggi menghasilkan kenaikan besar, sedangkan mengalahkan pemain berating ' +
          'jauh lebih rendah hampir tidak menambah apa-apa. Sebaliknya, kalah dari ' +
          'pemain berating rendah menurunkan rating dengan tajam. Inilah sebabnya ' +
          'rating pemain elite cenderung bergerak dalam rentang sempit.',
      }),
      el('p', {
        text:
          'FIDE memelihara tiga rating terpisah untuk setiap pemain, karena ketiga ' +
          'format waktu menuntut kemampuan yang berbeda. Standard atau klasik ' +
          'memberi waktu berjam-jam dan menguji kedalaman perhitungan. Rapid ' +
          'memberi sekitar sepuluh sampai enam puluh menit dan menguntut keputusan ' +
          'cepat yang tetap akurat. Blitz hanya memberi hitungan menit dan sangat ' +
          'bergantung pada refleks serta pola yang sudah terlatih. Seorang pemain ' +
          'bisa sangat kuat di satu format dan biasa saja di format lain.',
      }),
      el('p', {
        text:
          'Satu hal penting saat membaca grafik di bawah: rating yang mendatar ' +
          'tidak berarti permainan stagnan. FIDE membawa turun rating terakhir bagi ' +
          'pemain yang tidak bertanding, sehingga garis datar justru menandakan ' +
          'periode tanpa partai berperingkat.',
      }),
    ]),
  ]);
}

/* ===========================================================================
   Papan skor
   ======================================================================== */

function scoreboardSection() {
  const board = stats.dashboard();

  const tickets = board.flatMap((row) => [
    el('div', { class: 'ticket' }, [
      el('span', { class: 'ticket__label', text: `Puncak ${CATEGORY_SHORT[row.category]}` }),
      el('span', { class: 'ticket__value', text: number(row.peak.value) }),
      el('span', { class: 'ticket__meta', text: periodList(row.peak.periods) }),
    ]),
  ]);

  const latestTickets = board.map((row) =>
    el('div', { class: 'ticket' }, [
      el('span', { class: 'ticket__label', text: `Terkini ${CATEGORY_SHORT[row.category]}` }),
      el('span', { class: 'ticket__value', text: number(row.latest.value) }),
      el('span', {
        class: 'ticket__meta',
        text: `${periodLabel(row.latest.period)} · ${signed(row.latest.value - row.peak.value)} dari puncak`,
      }),
    ])
  );

  return el('div', {}, [
    el('div', { class: 'scoreboard' }, tickets),
    el('div', { class: 'scoreboard' }, latestTickets),
  ]);
}

/* ===========================================================================
   Tabel ringkasan tiga kategori
   ======================================================================== */

function summaryTable() {
  const board = stats.dashboard();

  return el('div', { class: 'panel panel--framed' }, [
    el('h3', { class: 'heading-3 heading-ink panel__title', text: 'Ringkasan Tiga Kategori' }),
    el('div', { class: 'table-scroll' }, [
      el('table', { class: 'data-table' }, [
        el('caption', {
          text: 'Seluruh nilai dihitung dari dataset saat halaman dibuka.',
        }),
        el('thead', {}, [
          el('tr', {}, [
            el('th', { scope: 'col', text: 'Ukuran' }),
            ...board.map((row) => el('th', { scope: 'col', text: CATEGORY_SHORT[row.category] })),
          ]),
        ]),
        el('tbody', {}, [
          summaryRow('Periode berdata', board, (row) => number(row.count)),
          summaryRow('Rating pertama', board, (row) => `${number(row.first.value)} (${periodLabel(row.first.period)})`),
          summaryRow('Rating terkini', board, (row) => `${number(row.latest.value)} (${periodLabel(row.latest.period)})`),
          summaryRow('Tertinggi', board, (row) => `${number(row.peak.value)} (${periodList(row.peak.periods)})`),
          summaryRow('Terendah', board, (row) => `${number(row.lowest.value)} (${periodList(row.lowest.periods)})`),
          summaryRow('Rata-rata', board, (row) => number(row.average, 1)),
          summaryRow('Pertumbuhan bersih', board, (row) => signed(row.netGrowth)),
          summaryRow('Kenaikan terbesar', board, (row) =>
            row.biggestGain ? `${signed(row.biggestGain.delta)} (${periodLabel(row.biggestGain.to)})` : '—'),
          summaryRow('Penurunan terbesar', board, (row) =>
            row.biggestDrop ? `${signed(row.biggestDrop.delta)} (${periodLabel(row.biggestDrop.to)})` : '—'),
          summaryRow('Simpangan baku perubahan', board, (row) =>
            row.volatility === null ? '—' : number(row.volatility, 2)),
        ]),
      ]),
    ]),
    el('p', {
      class: 'source-note',
      style: 'margin-block-start:.75rem',
      text:
        'Simpangan baku perubahan mengukur seberapa sering rating berfluktuasi ' +
        'tajam antarperiode. Semakin kecil angkanya, semakin stabil performanya.',
    }),
  ]);
}

function summaryRow(label, board, pick) {
  return el('tr', {}, [
    el('th', { scope: 'row', text: label }),
    ...board.map((row) => el('td', { class: 'num', text: pick(row) })),
  ]);
}

/* ===========================================================================
   Grandmaster's Statistical Lens
   ======================================================================== */

function lensSection() {
  const periods = eloSeries.map((point) => point.period);

  const categorySelect = el('select', { class: 'field__select', id: 'lens-category' },
    stats.CATEGORIES.map((category) =>
      el('option', { value: category, text: CATEGORY_LABEL[category] })
    )
  );

  const fromSelect = el('select', { class: 'field__select', id: 'lens-from' },
    periods.map((period) => el('option', { value: period, text: periodLabel(period) }))
  );

  const toSelect = el('select', { class: 'field__select', id: 'lens-to' },
    periods.map((period) => el('option', { value: period, text: periodLabel(period) }))
  );

  fromSelect.value = periods[0];
  toSelect.value = periods[periods.length - 1];

  const output = el('div', {});
  const errorNode = el('p', { class: 'field__error', hidden: true, role: 'alert' });

  const presets = [
    { label: 'Seluruh karier', from: periods[0], to: periods[periods.length - 1] },
    { label: 'Menuju WGM (2005–2009)', from: '2005-04', to: '2009-07' },
    { label: 'Menuju IM (2010–2014)', from: '2010-03', to: '2014-12' },
    { label: 'Puncak karier (2015–2017)', from: '2015-01', to: '2017-12' },
    { label: 'Era terkini (2018–2026)', from: '2018-01', to: periods[periods.length - 1] },
  ];

  function run() {
    const check = validatePeriodRange(fromSelect.value, toSelect.value);
    errorNode.hidden = check.valid;
    errorNode.textContent = check.valid ? '' : check.message;

    if (!check.valid) {
      empty(output);
      return;
    }

    const summary = stats.rangeSummary(categorySelect.value, fromSelect.value, toSelect.value);
    empty(output);

    if (summary.empty) {
      output.append(
        el('div', { class: 'data-gap-note' }, [
          el('span', { class: 'data-gap-note__title', text: 'Tidak ada data pada rentang ini' }),
          el('span', {
            text:
              `Kategori ${CATEGORY_LABEL[categorySelect.value]} tidak memiliki rilis ` +
              'rating pada rentang periode yang dipilih. Rapid dan Blitz baru mulai ' +
              'dicatat FIDE secara terpisah pada 2012 dan 2013.',
          }),
        ])
      );
      return;
    }

    const direction = summary.delta > 0 ? 'up' : summary.delta < 0 ? 'down' : null;

    output.append(
      el('div', { class: 'result-grid' }, [
        cell('Rating awal', number(summary.startValue), periodLabel(summary.from)),
        cell('Rating akhir', number(summary.endValue), periodLabel(summary.to)),
        cell('Selisih', signed(summary.delta), 'Rating akhir − rating awal', direction),
        cell('Persentase', percent(summary.percentChange), 'Selisih ÷ rating awal × 100%', direction),
        cell('Tertinggi', number(summary.max), periodList(summary.maxPeriods)),
        cell('Terendah', number(summary.min), periodList(summary.minPeriods)),
        cell('Rata-rata', number(summary.mean, 1), `${summary.count} periode berdata`),
        cell('Rentang fluktuasi', number(summary.range), 'Tertinggi − terendah'),
      ]),

      el('div', { class: 'calc-steps' }, [
        el('div', { class: 'calc-steps__line' }, [
          el('span', { class: 'calc-steps__label', text: 'Selisih:  ' }),
          el('span', { text: `${summary.endValue} − ${summary.startValue} = ${summary.delta}` }),
        ]),
        el('div', { class: 'calc-steps__line' }, [
          el('span', { class: 'calc-steps__label', text: 'Persentase:  ' }),
          el('span', {
            text: `(${summary.delta} ÷ ${summary.startValue}) × 100% = ${summary.percentChange.toFixed(2)}%`,
          }),
        ]),
      ]),

      el('div', { class: 'prose', style: 'margin-block-start:1.25rem' }, [
        el('p', { text: interpretRange(summary) }),
      ])
    );

    markCompleted('act-ratu');
  }

  function cell(label, value, meta, direction) {
    return el('div', { class: 'result-cell' }, [
      el('span', { class: 'result-cell__label', text: label }),
      el('span', {
        class: `result-cell__value${direction ? ` result-cell__value--${direction}` : ''}`,
        text: value,
      }),
      meta ? el('span', { class: 'source-note', style: 'display:block;margin-block-start:.35rem', text: meta }) : null,
    ]);
  }

  [categorySelect, fromSelect, toSelect].forEach((control) =>
    control.addEventListener('change', run)
  );

  run();

  return el('div', { class: 'panel panel--framed lens' }, [
    el('p', { class: 'eyebrow', text: 'Analisis' }),
    el('h3', { class: 'heading-3 heading-ink panel__title', text: "Grandmaster's Statistical Lens" }),
    el('p', {
      class: 'lede',
      style: 'margin-block-end:1.25rem',
      text:
        'Pilih kategori dan rentang periode untuk melihat perhitungannya. ' +
        'Rumus yang dipakai ditampilkan terbuka di bawah hasilnya.',
    }),

    el('div', { style: 'display:flex;gap:.5rem;flex-wrap:wrap;margin-block-end:1.25rem' },
      presets.map((preset) =>
        el('button', {
          class: 'btn btn--ghost btn--sm',
          type: 'button',
          text: preset.label,
          onClick: () => {
            fromSelect.value = preset.from;
            toSelect.value = preset.to;
            run();
          },
        })
      )
    ),

    el('div', { class: 'lens__controls' }, [
      el('div', { class: 'field' }, [
        el('label', { class: 'field__label', for: 'lens-category', text: 'Kategori' }),
        categorySelect,
      ]),
      el('div', { class: 'field' }, [
        el('label', { class: 'field__label', for: 'lens-from', text: 'Periode awal' }),
        fromSelect,
      ]),
      el('div', { class: 'field' }, [
        el('label', { class: 'field__label', for: 'lens-to', text: 'Periode akhir' }),
        toSelect,
      ]),
    ]),

    errorNode,
    output,
  ]);
}

/**
 * Menyusun kalimat interpretasi dari angka yang baru saja dihitung.
 * Kalimat dibangun dari data, bukan ditulis tetap, sehingga tidak mungkin
 * bertentangan dengan angka yang ditampilkan di sebelahnya.
 */
function interpretRange(summary) {
  const name = CATEGORY_LABEL[summary.category];
  const magnitude = Math.abs(summary.delta);

  let trend;
  if (summary.delta === 0) {
    trend = `rating ${name} berakhir pada angka yang sama persis dengan awal rentang`;
  } else if (summary.delta > 0) {
    trend = `rating ${name} naik ${magnitude} poin`;
  } else {
    trend = `rating ${name} turun ${magnitude} poin`;
  }

  const fluctuation =
    summary.range > magnitude * 1.5 && summary.range > 30
      ? ` Perlu dicatat, rentang fluktuasinya mencapai ${summary.range} poin — ` +
        `jauh lebih besar daripada selisih awal-akhirnya. Artinya perjalanan di ` +
        `antara kedua titik itu tidak berbentuk garis lurus, melainkan naik turun ` +
        `sebelum berakhir di ${summary.endValue}.`
      : '';

  return (
    `Selama ${summary.count} periode berdata dari ${periodLabel(summary.from)} sampai ` +
    `${periodLabel(summary.to)}, ${trend} atau ${percent(summary.percentChange)}. ` +
    `Nilai tertingginya ${summary.max} dan terendahnya ${summary.min}, dengan rata-rata ` +
    `${number(summary.mean, 1)}.${fluctuation}`
  );
}

/* ===========================================================================
   Narasi analisis dari data aktual
   ======================================================================== */

function analysisSection() {
  const board = stats.dashboard();
  const standard = board.find((row) => row.category === 'standard');
  const rapid = board.find((row) => row.category === 'rapid');
  const blitz = board.find((row) => row.category === 'blitz');

  const overlap = stats.overlappingPeriods();
  const mostStable = [...board].sort((a, b) => a.volatility - b.volatility)[0];

  return el('div', { class: 'panel panel--framed panel--prose' }, [
    el('h3', { class: 'heading-3 heading-ink panel__title', text: 'Interpretasi Data' }),

    el('div', { class: 'prose' }, [
      el('h4', { class: 'heading-4 heading-ink', text: '1. Tren peningkatan' }),
      el('p', {
        text:
          `Fase pertumbuhan paling tajam terjadi di awal karier. Rating Standard ` +
          `bermula dari ${standard.first.value} pada ${periodLabel(standard.first.period)} ` +
          `dan mencapai puncaknya ${standard.peak.value} pada ${periodList(standard.peak.periods)} — ` +
          `pertumbuhan ${signed(standard.peak.value - standard.first.value)} poin. ` +
          `Lonjakan satu periode terbesar tercatat ${signed(standard.biggestGain.delta)} poin ` +
          `pada ${periodLabel(standard.biggestGain.to)}, naik dari ${standard.biggestGain.fromValue} ` +
          `ke ${standard.biggestGain.toValue}.`,
      }),

      el('h4', { class: 'heading-4 heading-ink', text: '2. Tren penurunan' }),
      el('p', {
        text:
          `Penurunan satu periode terbesar adalah ${signed(standard.biggestDrop.delta)} poin ` +
          `pada ${periodLabel(standard.biggestDrop.to)}, dari ${standard.biggestDrop.fromValue} ` +
          `menjadi ${standard.biggestDrop.toValue}. Dari puncak ${standard.peak.value} ke rating ` +
          `terkini ${standard.latest.value}, selisihnya ${signed(standard.latest.value - standard.peak.value)} poin. ` +
          `Fluktuasi semacam ini adalah bagian wajar dari dinamika kompetisi: rating ` +
          `hanya bergerak ketika ada partai berperingkat, dan lawan di level elite ` +
          `sama kuatnya. Data yang tersedia tidak memuat alasan di balik setiap ` +
          `perubahan, sehingga tidak ada sebab tertentu yang dapat disimpulkan dari angka saja.`,
      }),

      el('h4', { class: 'heading-4 heading-ink', text: '3. Stabilitas performa' }),
      el('p', {
        text:
          `Diukur dengan simpangan baku perubahan antarperiode, kategori paling ` +
          `stabil adalah ${CATEGORY_LABEL[mostStable.category]} dengan nilai ` +
          `${number(mostStable.volatility, 2)}. Sebagai pembanding, Standard berada di ` +
          `${number(standard.volatility, 2)}, Rapid di ${number(rapid.volatility, 2)}, dan ` +
          `Blitz di ${number(blitz.volatility, 2)}. Perlu diingat bahwa sebagian besar ` +
          `periode bernilai sama dengan periode sebelumnya karena tidak ada partai ` +
          `yang dimainkan — Standard mencatat ${standard.stagnant} periode tanpa perubahan ` +
          `dari total ${standard.count} periode berdata.`,
      }),

      el('h4', { class: 'heading-4 heading-ink', text: '4. Perbandingan antarkategori' }),
      el('p', {
        text:
          `Ketiga kategori punya titik awal yang berbeda karena FIDE baru merilis ` +
          `rating Rapid dan Blitz secara terpisah pada era 2012–2013. Rapid tercatat ` +
          `sejak ${periodLabel(rapid.first.period)} dan Blitz sejak ` +
          `${periodLabel(blitz.first.period)}, sedangkan Standard sudah ada sejak ` +
          `${periodLabel(standard.first.period)}. ` +
          (overlap
            ? `Terdapat ${overlap.count} periode ketika ketiganya sama-sama punya data, ` +
              `yaitu ${periodLabel(overlap.from)} sampai ${periodLabel(overlap.to)}. `
            : '') +
          `Puncak tertinggi dicapai di kategori Standard (${standard.peak.value}), disusul ` +
          `Rapid (${rapid.peak.value}) dan Blitz (${blitz.peak.value}). Pola ini lazim pada ` +
          `pemain yang kekuatan utamanya terletak pada kedalaman perhitungan jangka ` +
          `panjang, bukan pada kecepatan refleks.`,
      }),

      el('h4', { class: 'heading-4 heading-ink', text: '5. Pencapaian tertinggi' }),
      el('p', {
        text:
          `Rating tertinggi sepanjang karier yang tercatat pada dataset ini adalah ` +
          `${standard.peak.value} di kategori Standard, pada ${periodList(standard.peak.periods)}. ` +
          `Angka ini sekaligus menjadi titik tertinggi di antara ketiga kategori, dan ` +
          `diberi sorotan khusus pada grafik.`,
      }),
    ]),
  ]);
}

/* ===========================================================================
   Catatan lubang data
   ======================================================================== */

function dataGapSection() {
  if (stats.dataGaps.length === 0) return null;

  return el('div', { class: 'data-gap-note' }, [
    el('span', { class: 'data-gap-note__title', text: 'Batas data yang perlu Anda ketahui' }),
    el('p', {
      style: 'margin-block-end:.75rem',
      text:
        `Ekspor sumber memiliki ${stats.dataGaps.length} rentang periode yang kosong ` +
        'padahal kategorinya aktif dicatat sebelum dan sesudahnya. Kemungkinan besar ' +
        'ekspornya tidak lengkap, bukan rating yang dihentikan. Periode-periode ini ' +
        'disimpan sebagai nilai kosong dan garis grafiknya sengaja diputus, bukan ' +
        'ditambal dengan angka perkiraan.',
    }),
    el('ul', { style: 'padding-inline-start:1.1rem' },
      stats.dataGaps.map((gap) =>
        el('li', {
          style: 'margin-block-end:.35rem;font-size:.9375rem',
          text: `${CATEGORY_SHORT[gap.kategori]}: ${periodLabel(gap.dari)} sampai ${periodLabel(gap.sampai)}`,
        })
      )
    ),
    el('p', {
      style: 'margin-block-start:.75rem;font-size:.875rem',
      text:
        'Untuk melengkapinya, ekspor ulang riwayat rating dari profil FIDE ' +
        '(FIDE ID 7101384), lalu jalankan tools/generate-elo-data.py terhadap ' +
        'berkas CSV yang baru.',
    }),
  ]);
}

/* ===========================================================================
   Penutup
   ======================================================================== */

function closingSection() {
  const board = stats.dashboard();
  const standard = board.find((row) => row.category === 'standard');

  return el('div', { class: 'panel panel--cream panel--framed panel--prose' }, [
    el('h3', { class: 'heading-3 heading-ink panel__title', text: 'Penutup Analisis Matematika' }),
    el('div', { class: 'prose' }, [
      el('p', {
        text:
          `Pola perkembangan rating Irene berbentuk kurva yang menanjak tajam di ` +
          `awal, mendatar di level elite selama bertahun-tahun, lalu melandai di ` +
          `era terkini. Dari ${standard.first.value} pada ${periodLabel(standard.first.period)} ` +
          `ke puncak ${standard.peak.value} pada ${periodList(standard.peak.periods)}, lalu ` +
          `${standard.latest.value} pada ${periodLabel(standard.latest.period)}.`,
      }),
      el('p', {
        text:
          'Hubungan antara statistik dan perjalanan prestasinya terlihat jelas bila ' +
          'kedua arsip dibaca berdampingan. Periode kenaikan rating paling tajam ' +
          'bertepatan dengan fase ia mengumpulkan norma gelar, dan fase rating ' +
          'tertinggi berdekatan dengan dua gelar juara Asia. Namun hubungan ini perlu ' +
          'dibaca hati-hati: data rating tidak memuat keterangan turnamen, sehingga ' +
          'kesejajaran waktu bukan bukti sebab-akibat.',
      }),
      el('p', {
        text:
          'Satu hal yang tidak bisa ditangkap angka mana pun: rating hanya mengukur ' +
          'hasil, bukan proses. Grafik ini tidak menunjukkan kekalahan telak di ' +
          'Kejurnas 1999 yang menjadi titik awalnya, karena saat itu ia belum punya ' +
          'rating internasional sama sekali. Yang terbaca di sini baru dimulai enam ' +
          'tahun setelah momen tersebut — dan justru itulah yang membuat enam tahun ' +
          'pertama yang tak terlihat itu menjadi bagian paling penting dari ceritanya.',
      }),
    ]),
  ]);
}

/* ===========================================================================
   Render
   ======================================================================== */

function heading(text, subtitle) {
  return el('div', { style: 'margin-block-end:1.25rem' }, [
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

export async function render(host) {
  host.append(
    el('div', { class: 'stack' }, [
      introSection(),

      heading('Papan Skor', `Dihitung dari ${stats.meta.jumlahPeriode} periode rilis rating FIDE.`),
      scoreboardSection(),

      createEloChart(),
      dataGapSection(),

      summaryTable(),
      lensSection(),
      analysisSection(),

      heading('Kalkulator Elo'),
      createEloCalculator(),

      heading(
        'Arsip Prestasi',
        'Seluruh pencapaian ditampilkan kronologis. Prestasi penting disorot, ' +
          'tetapi urutannya tidak diubah.'
      ),
      renderAchievementStats(),
      renderAchievementTimeline(),

      closingSection(),
    ])
  );
}

export default { render };
