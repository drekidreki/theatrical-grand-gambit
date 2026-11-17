/**
 * tools/stats-test.mjs
 * ====================
 * Menguji mesin statistik Elo terhadap angka yang dihitung ulang langsung
 * dari CSV sumber, bukan terhadap angka yang diketik dari ingatan.
 *
 * Jalankan:  node tools/stats-test.mjs
 */

import { readFileSync } from 'node:fs';

const stats = await import('../js/features/elo-stats.js');
const { eloSeries } = await import('../data/elo-ratings.js');

/* --- Kebenaran rujukan: dihitung ulang dari CSV asli --------------------- */

const CSV = process.argv[2] ?? '/mnt/user-data/uploads/cb5ccbf5-fide-compare-all-ratings.csv';

let reference = null;
try {
  // CSV sumber memakai akhir baris CRLF, sehingga setiap kolom harus di-trim
  // lebih dulu. Tanpa itu kolom terakhir terbaca sebagai "\r" yang bernilai
  // truthy, lalu Number("\r") menghasilkan 0 — tepat jenis kesalahan yang
  // ingin dicegah oleh aturan "null bukan nol".
  const rows = readFileSync(CSV, 'utf8').trim().split(/\r?\n/).slice(1);
  const parsed = rows.map((line) => {
    const [month, classical, rapid, blitz] = line.split(',').map((cell) => cell.trim());
    return {
      period: month,
      standard: classical ? Number(classical) : null,
      rapid: rapid ? Number(rapid) : null,
      blitz: blitz ? Number(blitz) : null,
    };
  });

  reference = {};
  for (const key of ['standard', 'rapid', 'blitz']) {
    const values = parsed.filter((r) => r[key] !== null).map((r) => r[key]);
    reference[key] = {
      count: values.length,
      max: Math.max(...values),
      min: Math.min(...values),
      first: values[0],
      last: values[values.length - 1],
      mean: values.reduce((a, b) => a + b, 0) / values.length,
    };
  }
} catch {
  console.log('CSV sumber tidak ditemukan; uji perbandingan dilewati.\n');
}

let pass = 0;
let fail = 0;

function check(name, actual, expected, tolerance = 0) {
  const ok =
    typeof expected === 'number'
      ? Math.abs(actual - expected) <= tolerance
      : actual === expected;
  ok ? pass++ : fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name.padEnd(46)} ${actual} ${ok ? '' : `(harap ${expected})`}`);
}

/* --- 1. Konsistensi dengan CSV sumber ------------------------------------ */

if (reference) {
  console.log('--- Dibandingkan dengan CSV sumber ---');
  for (const key of ['standard', 'rapid', 'blitz']) {
    const ref = reference[key];
    check(`${key}: jumlah periode berdata`, stats.points(key).length, ref.count);
    check(`${key}: rating tertinggi`, stats.peak(key).value, ref.max);
    check(`${key}: rating terendah`, stats.lowest(key).value, ref.min);
    check(`${key}: rating pertama`, stats.earliest(key).value, ref.first);
    check(`${key}: rating terakhir`, stats.latest(key).value, ref.last);
    check(`${key}: rata-rata`, Number(stats.average(key).toFixed(4)), Number(ref.mean.toFixed(4)), 0.001);
  }
}

/* --- 2. Nilai null tidak pernah dianggap nol ----------------------------- */

console.log('\n--- Penanganan nilai kosong ---');

const nullCount = eloSeries.filter((p) => p.standard === null).length;
check('ada periode kosong pada dataset', nullCount > 0, true);
check('rating terendah bukan 0', stats.lowest('standard').value > 0, true);
check('rata-rata tidak tergerus nilai kosong', stats.average('standard') > 2000, true);

// Selisih dihitung antar-titik berdata, bukan antarbulan kalender.
const gapDeltas = stats.deltas('standard');
check('tidak ada selisih yang melibatkan null', gapDeltas.every((d) =>
  Number.isFinite(d.fromValue) && Number.isFinite(d.toValue)), true);

/* --- 3. Angka yang dipakai di antarmuka ---------------------------------- */

console.log('\n--- Angka yang ditampilkan di website ---');

check('puncak Standard', stats.peak('standard').value, 2432);
check('puncak Standard tercapai pada', stats.peak('standard').periods.join(', '), '2016-09, 2016-10');
check('puncak Rapid', stats.peak('rapid').value, 2411);
check('puncak Blitz', stats.peak('blitz').value, 2406);
check('kenaikan terbesar Standard', stats.biggestGain('standard').delta, 118);
check('kenaikan terbesar Standard pada', stats.biggestGain('standard').to, '2006-01');
check('penurunan terbesar Standard', stats.biggestDrop('standard').delta, -61);
check('penurunan terbesar Standard pada', stats.biggestDrop('standard').to, '2012-05');

/* --- 4. Ringkasan rentang ------------------------------------------------ */

console.log('\n--- Ringkasan rentang ---');

const early = stats.rangeSummary('standard', '2005-04', '2008-10');
check('rentang 2005-2008: rating awal', early.startValue, 2010);
check('rentang 2005-2008: rating akhir', early.endValue, 2303);
check('rentang 2005-2008: selisih', early.delta, 293);
check('rentang 2005-2008: persentase', Number(early.percentChange.toFixed(2)), 14.58, 0.01);
check('rentang 2005-2008: tren', early.trend, 'naik');

const empty = stats.rangeSummary('rapid', '2005-04', '2006-01');
check('rentang tanpa data ditandai kosong', empty.empty, true);

/* --- 5. Perbandingan kategori -------------------------------------------- */

console.log('\n--- Perbandingan kategori ---');

const overlap = stats.overlappingPeriods();
check('ada periode dengan ketiga kategori lengkap', overlap !== null && overlap.count > 0, true);

const compared = stats.compareCategories(overlap.from, overlap.to);
check('ketiga kategori terbandingkan', compared.length, 3);

const board = stats.dashboard();
check('dashboard memuat tiga kategori', board.length, 3);
check('setiap kategori punya puncak', board.every((row) => row.peak !== null), true);

/* --- 6. Lubang data ------------------------------------------------------ */

console.log('\n--- Lubang data ---');
check('lubang data terdeteksi dan dilaporkan', stats.dataGaps.length, 3);

console.log(`\n${pass} lulus, ${fail} gagal`);
process.exit(fail ? 1 : 0);
