/**
 * js/utils/formatters.js
 * ======================
 * Pemformat angka dan tanggal. Fungsi murni, tanpa efek samping.
 */

const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const BULAN_SINGKAT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

/** "2016-09" -> "September 2016" */
export function periodLabel(period) {
  if (!period) return '—';
  const [year, month] = period.split('-');
  return `${BULAN[Number(month) - 1] ?? month} ${year}`;
}

/** "2016-09" -> "Sep 2016" */
export function periodShort(period) {
  if (!period) return '—';
  const [year, month] = period.split('-');
  return `${BULAN_SINGKAT[Number(month) - 1] ?? month} ${year}`;
}

/** Angka dengan pemisah ribuan gaya Indonesia. */
export function number(value, digits = 0) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return Number(value).toLocaleString('id-ID', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/** Selisih bertanda, mis. "+118" atau "−61". Memakai minus tipografis. */
export function signed(value, digits = 0) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const rounded = Number(value.toFixed(digits));
  if (rounded > 0) return `+${number(rounded, digits)}`;
  if (rounded < 0) return `−${number(Math.abs(rounded), digits)}`;
  return '0';
}

/** Persentase bertanda, mis. "+4,32%". */
export function percent(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return `${signed(value, digits)}%`;
}

/** Daftar periode yang dirangkum, mis. "September dan Oktober 2016". */
export function periodList(periods) {
  if (!periods || periods.length === 0) return '—';
  if (periods.length === 1) return periodLabel(periods[0]);
  if (periods.length === 2) {
    return `${periodLabel(periods[0])} dan ${periodLabel(periods[1])}`;
  }
  return `${periodLabel(periods[0])} sampai ${periodLabel(periods[periods.length - 1])}`;
}

/** Nama kategori yang ramah dibaca. */
export const CATEGORY_LABEL = Object.freeze({
  standard: 'Standard (Klasik)',
  rapid: 'Rapid (Catur Cepat)',
  blitz: 'Blitz (Catur Kilat)',
});

export const CATEGORY_SHORT = Object.freeze({
  standard: 'Standard',
  rapid: 'Rapid',
  blitz: 'Blitz',
});

export default { periodLabel, periodShort, number, signed, percent, periodList, CATEGORY_LABEL };
