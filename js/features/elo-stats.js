/**
 * js/features/elo-stats.js
 * ========================
 * Mesin perhitungan statistik rating Elo.
 *
 * Modul ini TIDAK menyentuh DOM, sehingga setiap angka yang muncul di
 * website dapat diuji ulang secara terpisah lewat tools/stats-test.mjs.
 *
 * ATURAN PENANGANAN NILAI KOSONG
 * Periode tanpa rilis rating bernilai `null`. Seluruh fungsi di bawah
 * menyaring null sebelum berhitung. Tidak ada satu pun tempat di mana null
 * diperlakukan sebagai angka 0 — perlakuan semacam itu akan merusak
 * rata-rata, nilai minimum, dan bentuk kurva grafik.
 */

import { eloSeries, eloDataGaps, eloMeta } from '../../data/elo-ratings.js';

export const CATEGORIES = ['standard', 'rapid', 'blitz'];

/* ===========================================================================
   Dasar
   ======================================================================== */

/**
 * Titik data yang benar-benar punya nilai untuk satu kategori.
 * @returns {{period: string, label: string, value: number}[]}
 */
export function points(category, series = eloSeries) {
  return series
    .filter((point) => point[category] !== null && point[category] !== undefined)
    .map((point) => ({ period: point.period, label: point.label, value: point[category] }));
}

/** Menyaring deret berdasarkan rentang periode, inklusif di kedua ujung. */
export function inRange(category, from, to, series = eloSeries) {
  return points(category, series).filter(
    (point) => (!from || point.period >= from) && (!to || point.period <= to)
  );
}

/* ===========================================================================
   Statistik deskriptif
   ======================================================================== */

/** Rating tertinggi beserta seluruh periode saat nilainya tercapai. */
export function peak(category, series = eloSeries) {
  const data = points(category, series);
  if (data.length === 0) return null;

  const value = Math.max(...data.map((point) => point.value));
  return {
    value,
    periods: data.filter((point) => point.value === value).map((point) => point.period),
  };
}

/** Rating terendah beserta periodenya. */
export function lowest(category, series = eloSeries) {
  const data = points(category, series);
  if (data.length === 0) return null;

  const value = Math.min(...data.map((point) => point.value));
  return {
    value,
    periods: data.filter((point) => point.value === value).map((point) => point.period),
  };
}

/** Rating terbaru, yaitu nilai pada periode terakhir yang ada datanya. */
export function latest(category, series = eloSeries) {
  const data = points(category, series);
  return data.length ? data[data.length - 1] : null;
}

/** Rating paling awal yang tercatat. */
export function earliest(category, series = eloSeries) {
  const data = points(category, series);
  return data.length ? data[0] : null;
}

/** Rata-rata rating selama periode aktif. */
export function average(category, series = eloSeries) {
  const data = points(category, series);
  if (data.length === 0) return null;
  return data.reduce((sum, point) => sum + point.value, 0) / data.length;
}

/* ===========================================================================
   Perubahan antarperiode
   ======================================================================== */

/**
 * Perubahan dari satu periode berdata ke periode berdata berikutnya.
 * Perhatikan: selisih dihitung antar-titik yang ADA DATANYA, bukan antarbulan
 * kalender, karena periode kosong tidak boleh dianggap bernilai apa pun.
 */
export function deltas(category, series = eloSeries) {
  const data = points(category, series);
  const result = [];

  for (let i = 1; i < data.length; i += 1) {
    result.push({
      from: data[i - 1].period,
      to: data[i].period,
      fromValue: data[i - 1].value,
      toValue: data[i].value,
      delta: data[i].value - data[i - 1].value,
    });
  }

  return result;
}

/** Kenaikan terbesar dalam satu langkah periode. */
export function biggestGain(category, series = eloSeries) {
  const all = deltas(category, series).filter((d) => d.delta > 0);
  if (all.length === 0) return null;
  return all.reduce((best, current) => (current.delta > best.delta ? current : best));
}

/** Penurunan terbesar dalam satu langkah periode. */
export function biggestDrop(category, series = eloSeries) {
  const all = deltas(category, series).filter((d) => d.delta < 0);
  if (all.length === 0) return null;
  return all.reduce((worst, current) => (current.delta < worst.delta ? current : worst));
}

/**
 * Ukuran kestabilan: simpangan baku dari perubahan antarperiode.
 * Semakin kecil nilainya, semakin jarang rating berfluktuasi tajam.
 */
export function volatility(category, series = eloSeries) {
  const changes = deltas(category, series).map((d) => d.delta);
  if (changes.length < 2) return null;

  const mean = changes.reduce((sum, value) => sum + value, 0) / changes.length;
  const variance =
    changes.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (changes.length - 1);

  return Math.sqrt(variance);
}

/** Berapa banyak periode yang nilainya tidak berubah sama sekali. */
export function stagnantPeriods(category, series = eloSeries) {
  return deltas(category, series).filter((d) => d.delta === 0).length;
}

/* ===========================================================================
   Analisis rentang
   ======================================================================== */

/**
 * Ringkasan lengkap untuk sebuah rentang periode.
 * Inilah yang dipakai fitur "Grandmaster's Statistical Lens".
 */
export function rangeSummary(category, from, to, series = eloSeries) {
  const data = inRange(category, from, to, series);

  if (data.length === 0) {
    return { empty: true, category, from, to, count: 0 };
  }

  const first = data[0];
  const last = data[data.length - 1];
  const values = data.map((point) => point.value);

  const delta = last.value - first.value;
  const percentChange = first.value === 0 ? null : (delta / first.value) * 100;

  const max = Math.max(...values);
  const min = Math.min(...values);

  return {
    empty: false,
    category,
    from: first.period,
    to: last.period,
    count: data.length,
    startValue: first.value,
    endValue: last.value,
    delta,
    percentChange,
    max,
    min,
    range: max - min,
    mean: values.reduce((sum, value) => sum + value, 0) / values.length,
    maxPeriods: data.filter((point) => point.value === max).map((point) => point.period),
    minPeriods: data.filter((point) => point.value === min).map((point) => point.period),
    trend: delta > 0 ? 'naik' : delta < 0 ? 'turun' : 'datar',
  };
}

/**
 * Membandingkan ketiga kategori pada rentang periode yang sama, hanya memakai
 * periode ketika kategori bersangkutan memang punya data.
 */
export function compareCategories(from, to, series = eloSeries) {
  return CATEGORIES.map((category) => rangeSummary(category, from, to, series)).filter(
    (summary) => !summary.empty
  );
}

/**
 * Periode ketika ketiga kategori sama-sama punya data, untuk perbandingan
 * yang benar-benar setara.
 */
export function overlappingPeriods(series = eloSeries) {
  const overlap = series.filter((point) =>
    CATEGORIES.every((category) => point[category] !== null)
  );
  return overlap.length
    ? { from: overlap[0].period, to: overlap[overlap.length - 1].period, count: overlap.length }
    : null;
}

/* ===========================================================================
   Ringkasan menyeluruh untuk papan skor
   ======================================================================== */

export function dashboard(series = eloSeries) {
  return CATEGORIES.map((category) => {
    const data = points(category, series);

    return {
      category,
      count: data.length,
      first: earliest(category, series),
      latest: latest(category, series),
      peak: peak(category, series),
      lowest: lowest(category, series),
      average: average(category, series),
      biggestGain: biggestGain(category, series),
      biggestDrop: biggestDrop(category, series),
      volatility: volatility(category, series),
      stagnant: stagnantPeriods(category, series),
      netGrowth: data.length >= 2 ? data[data.length - 1].value - data[0].value : null,
    };
  });
}

/** Lubang data, diteruskan apa adanya untuk ditampilkan ke pembaca. */
export const dataGaps = eloDataGaps;
export const meta = eloMeta;

export default {
  CATEGORIES, points, inRange, peak, lowest, latest, earliest, average,
  deltas, biggestGain, biggestDrop, volatility, stagnantPeriods,
  rangeSummary, compareCategories, overlappingPeriods, dashboard,
  dataGaps, meta,
};
