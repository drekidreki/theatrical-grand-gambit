/**
 * js/features/elo-chart.js
 * ========================
 * Grafik perkembangan rating Elo.
 *
 * JALUR UTAMA: Chart.js dari CDN.
 * JALUR CADANGAN: tabel ringkasan HTML, bila Chart.js gagal dimuat. Website
 * tidak boleh menampilkan kotak kosong hanya karena satu CDN tak terjangkau.
 *
 * PENANGANAN NILAI KOSONG
 * `spanGaps: false` membuat garis benar-benar TERPUTUS pada periode tanpa
 * data. Menyambungkannya akan memberi kesan ada rating di periode yang
 * sebenarnya tidak pernah dirilis.
 *
 * PEMBEDA SELAIN WARNA
 * Ketiga kategori dibedakan oleh warna sekaligus pola garis — solid, putus-
 * putus, dan titik-titik — karena informasi tidak boleh dibedakan hanya
 * melalui warna.
 */

import { el, empty, $$ } from '../utils/helpers.js';
import { eloSeries } from '../../data/elo-ratings.js';
import { points, CATEGORIES } from './elo-stats.js';
import { periodLabel, periodShort, number, signed, CATEGORY_LABEL } from '../utils/formatters.js';

/**
 * Warna garis diambil dari palet teater.
 *
 * Catatan penyimpangan: dokumen konsep menyarankan Antique Cream (#E6D5B0)
 * untuk Blitz. Warna itu nyaris tidak terlihat di atas panel gading (#F3EFE7)
 * dan gagal memenuhi rasio kontras 3:1 untuk elemen grafis. Blitz karena itu
 * memakai Velvet Maroon yang masih berasal dari palet yang sama.
 */
const SERIES_STYLE = {
  standard: { color: '#B8933F', dash: [], label: CATEGORY_LABEL.standard },
  rapid: { color: '#8E1B26', dash: [7, 4], label: CATEGORY_LABEL.rapid },
  blitz: { color: '#3A0A12', dash: [2, 3], label: CATEGORY_LABEL.blitz },
};

/** Penanda periode penting. Hanya peristiwa yang sudah diverifikasi. */
const MILESTONES = [
  { period: '2008-12', text: 'Gelar WGM (norma di Olimpiade Dresden)' },
  { period: '2012-05', text: 'Juara Asia pertama, Ho Chi Minh City' },
  { period: '2014-08', text: 'Gelar IM' },
  { period: '2016-09', text: 'Puncak karier Standard: 2432' },
  { period: '2024-12', text: 'Peringkat 9 FIDE World Rapid, New York' },
];

export function createEloChart() {
  const visible = new Set(CATEGORIES);
  let chart = null;

  const canvasWrap = el('div', { class: 'elo-chart__canvas-wrap' });
  const fallbackWrap = el('div', { class: 'elo-chart__fallback', hidden: true });

  /* --- Filter kategori -------------------------------------------------- */

  const filters = el(
    'div',
    { class: 'elo-chart__filters', role: 'group', 'aria-label': 'Filter kategori rating' },
    CATEGORIES.map((category) => {
      const style = SERIES_STYLE[category];
      const button = el('button', {
        class: 'series-toggle',
        type: 'button',
        'aria-pressed': 'true',
        onClick: () => {
          visible.has(category) ? visible.delete(category) : visible.add(category);
          button.setAttribute('aria-pressed', String(visible.has(category)));
          update();
        },
      }, [
        el('span', { class: 'series-toggle__dot', 'aria-hidden': 'true' }),
        el('span', { text: style.label }),
      ]);

      button.style.setProperty('--series-color', style.color);
      return button;
    })
  );

  /* --- Tabel cadangan ---------------------------------------------------- */

  function buildFallbackTable() {
    // Tampilkan hanya periode yang punya minimal satu nilai, agar tabel
    // cadangan tetap bisa dibaca tanpa ratusan baris kosong.
    const rows = eloSeries.filter((point) =>
      CATEGORIES.some((category) => visible.has(category) && point[category] !== null)
    );

    return el('div', { class: 'table-scroll' }, [
      el('table', { class: 'data-table' }, [
        el('caption', {
          text:
            'Tabel cadangan riwayat rating. Sel bertanda strip berarti tidak ada ' +
            'rilis rating pada periode tersebut, bukan rating bernilai nol.',
        }),
        el('thead', {}, [
          el('tr', {}, [
            el('th', { scope: 'col', text: 'Periode' }),
            ...CATEGORIES.filter((c) => visible.has(c)).map((c) =>
              el('th', { scope: 'col', text: CATEGORY_LABEL[c] })
            ),
          ]),
        ]),
        el('tbody', {}, rows.map((point) =>
          el('tr', {}, [
            el('td', { text: point.label }),
            ...CATEGORIES.filter((c) => visible.has(c)).map((c) =>
              el('td', { class: 'num', text: point[c] === null ? '—' : String(point[c]) })
            ),
          ])
        )),
      ]),
    ]);
  }

  function showFallback(reason) {
    canvasWrap.hidden = true;
    fallbackWrap.hidden = false;
    empty(fallbackWrap);
    fallbackWrap.append(
      el('p', {
        class: 'source-note',
        style: 'margin-block-end:.75rem',
        text: reason,
      }),
      buildFallbackTable()
    );
  }

  /* --- Grafik Chart.js ---------------------------------------------------- */

  function buildDatasets() {
    return CATEGORIES.filter((category) => visible.has(category)).map((category) => {
      const style = SERIES_STYLE[category];
      return {
        label: style.label,
        // null dipertahankan agar Chart.js memutus garisnya.
        data: eloSeries.map((point) => point[category]),
        borderColor: style.color,
        backgroundColor: style.color,
        borderDash: style.dash,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHitRadius: 12,
        spanGaps: false,
        tension: 0.15,
      };
    });
  }

  function update() {
    if (!chart) {
      if (!fallbackWrap.hidden) showFallback(fallbackWrap.querySelector('p')?.textContent ?? '');
      return;
    }
    chart.data.datasets = buildDatasets();
    chart.update();
  }

  function build() {
    if (!window.TGG_LIBS?.chart || typeof window.Chart !== 'function') {
      showFallback(
        'Pustaka grafik tidak dapat dimuat, sehingga data ditampilkan sebagai ' +
          'tabel. Seluruh angkanya sama persis dengan yang dipakai grafik.'
      );
      return;
    }

    const canvas = el('canvas', { role: 'img', 'aria-label':
      'Grafik garis perkembangan rating Elo Irene Kharisma Sukandar pada tiga ' +
      'kategori catur. Nilai lengkapnya tersedia pada tabel di bawah grafik.' });
    empty(canvasWrap);
    canvasWrap.append(canvas);

    try {
      chart = new window.Chart(canvas, {
        type: 'line',
        data: {
          labels: eloSeries.map((point) => periodShort(point.period)),
          datasets: buildDatasets(),
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { display: false }, // filter kustom sudah berperan sebagai legenda
            tooltip: {
              backgroundColor: '#0E0A0B',
              borderColor: '#B8933F',
              borderWidth: 1,
              titleFont: { family: 'Playfair Display, serif', size: 14 },
              bodyFont: { family: 'DM Sans, sans-serif', size: 13 },
              padding: 12,
              callbacks: {
                title: (items) => periodLabel(eloSeries[items[0].dataIndex].period),
                label: (item) => {
                  if (item.raw === null) return null;

                  // Tampilkan sekaligus selisihnya dari titik berdata sebelumnya.
                  const category = CATEGORIES.filter((c) => visible.has(c))[item.datasetIndex];
                  const data = points(category);
                  const period = eloSeries[item.dataIndex].period;
                  const position = data.findIndex((p) => p.period === period);
                  const previous = position > 0 ? data[position - 1] : null;

                  const delta = previous ? signed(item.raw - previous.value) : null;
                  return `${CATEGORY_LABEL[category]}: ${item.raw}${delta ? ` (${delta})` : ''}`;
                },
                afterBody: (items) => {
                  const period = eloSeries[items[0].dataIndex].period;
                  const milestone = MILESTONES.find((m) => m.period === period);
                  return milestone ? `★ ${milestone.text}` : '';
                },
              },
            },
          },
          scales: {
            x: {
              grid: { color: 'rgba(36,26,22,.08)' },
              ticks: {
                color: '#5A4A41',
                font: { family: 'DM Sans, sans-serif', size: 11 },
                autoSkip: true,
                maxTicksLimit: 12,
                maxRotation: 0,
              },
            },
            y: {
              title: {
                display: true,
                text: 'Rating Elo',
                color: '#5A4A41',
                font: { family: 'Playfair Display, serif', size: 12 },
              },
              grid: { color: 'rgba(36,26,22,.08)' },
              ticks: { color: '#5A4A41', font: { family: 'DM Sans, sans-serif', size: 11 } },
              // Rentang dibatasi agar perubahan puluhan poin tetap terbaca;
              // dimulai dari 1950, bukan 0, dan hal ini dinyatakan terbuka
              // pada catatan di bawah grafik.
              suggestedMin: 1950,
              suggestedMax: 2480,
            },
          },
        },
      });
    } catch (error) {
      console.error('[TGG] Chart.js gagal merender:', error);
      showFallback('Grafik gagal dirender. Data ditampilkan sebagai tabel.');
    }
  }

  /* --- Perakitan ---------------------------------------------------------- */

  const root = el('div', { class: 'elo-chart' }, [
    el('div', { class: 'elo-chart__head' }, [
      el('div', {}, [
        el('p', { class: 'eyebrow', text: 'Grafik Perkembangan' }),
        el('h3', {
          class: 'heading-3 heading-ink',
          text: 'Rating Elo 2005 — 2026',
        }),
      ]),
    ]),
    filters,
    canvasWrap,
    fallbackWrap,
    el('div', { class: 'elo-chart__footnote' }, [
      el('p', { class: 'source-note' }, [
        el('strong', { text: 'Cara membaca grafik ini. ' }),
        document.createTextNode(
          'Sumbu vertikal sengaja dimulai dari 1950, bukan dari nol, supaya ' +
            'perubahan puluhan poin tetap terlihat. Garis yang terputus berarti ' +
            'tidak ada rilis rating pada periode tersebut — bukan rating bernilai ' +
            'nol. Garis yang mendatar berarti tidak ada partai berperingkat yang ' +
            'dimainkan, sebab FIDE membawa turun rating terakhir bagi pemain yang ' +
            'sedang tidak aktif.'
        ),
      ]),
    ]),
  ]);

  // Bangun setelah elemen masuk ke halaman, supaya Chart.js mengukur lebar
  // kontainer dengan benar di dalam <iframe>.
  requestAnimationFrame(build);

  // Jaga proporsi grafik saat ukuran iframe berubah.
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(() => chart?.resize());
    observer.observe(canvasWrap);
  }

  return root;
}

export { SERIES_STYLE, MILESTONES };
export default { createEloChart };
