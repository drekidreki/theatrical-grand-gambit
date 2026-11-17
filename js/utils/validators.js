/**
 * js/utils/validators.js
 * ======================
 * Validasi masukan pengguna. Setiap fungsi mengembalikan
 * { valid: boolean, value?: number, message?: string }
 * sehingga pemanggil dapat langsung menampilkan pesan kesalahannya.
 */

/**
 * Memvalidasi rating Elo.
 * Batas bawah 100 mengikuti rating terendah yang dipublikasikan FIDE;
 * batas atas 3000 dipakai sebagai pagar kewajaran, karena rating tertinggi
 * yang pernah tercatat dalam sejarah masih di bawah 2900.
 */
export function validateRating(raw, label = 'Rating') {
  const text = String(raw ?? '').trim();

  if (text === '') {
    return { valid: false, message: `${label} tidak boleh kosong.` };
  }

  const value = Number(text);

  if (!Number.isFinite(value)) {
    return { valid: false, message: `${label} harus berupa angka.` };
  }
  if (!Number.isInteger(value)) {
    return { valid: false, message: `${label} harus bilangan bulat.` };
  }
  if (value < 100) {
    return { valid: false, message: `${label} terlalu rendah. Rating FIDE terendah adalah 100.` };
  }
  if (value > 3000) {
    return { valid: false, message: `${label} terlalu tinggi. Rating tertinggi dalam sejarah masih di bawah 2900.` };
  }

  return { valid: true, value };
}

/**
 * Memvalidasi faktor K.
 * FIDE memakai K = 40, 20, atau 10 bergantung pengalaman dan rating pemain.
 * Nilai lain tetap diperbolehkan untuk keperluan simulasi, selama masuk akal.
 */
export function validateKFactor(raw) {
  const text = String(raw ?? '').trim();

  if (text === '') {
    return { valid: false, message: 'Faktor K tidak boleh kosong.' };
  }

  const value = Number(text);

  if (!Number.isFinite(value)) {
    return { valid: false, message: 'Faktor K harus berupa angka.' };
  }
  if (value <= 0) {
    return { valid: false, message: 'Faktor K harus lebih besar dari nol.' };
  }
  if (value > 100) {
    return { valid: false, message: 'Faktor K di atas 100 tidak dipakai dalam sistem rating mana pun.' };
  }

  return { valid: true, value };
}

/** Memvalidasi hasil pertandingan: menang 1, remis 0.5, kalah 0. */
export function validateScore(raw) {
  const value = Number(raw);
  if (![0, 0.5, 1].includes(value)) {
    return { valid: false, message: 'Hasil pertandingan harus menang, remis, atau kalah.' };
  }
  return { valid: true, value };
}

/** Memvalidasi urutan periode: awal tidak boleh setelah akhir. */
export function validatePeriodRange(from, to) {
  if (!from || !to) {
    return { valid: false, message: 'Pilih periode awal dan periode akhir.' };
  }
  if (from > to) {
    return { valid: false, message: 'Periode awal tidak boleh setelah periode akhir.' };
  }
  return { valid: true };
}

export default { validateRating, validateKFactor, validateScore, validatePeriodRange };
