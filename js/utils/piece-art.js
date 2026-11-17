/**
 * js/utils/piece-art.js
 * =====================
 * Siluet bidak catur sebagai SVG inline.
 *
 * Dibuat sebagai vektor, bukan gambar raster, agar tetap tajam pada layar
 * kepadatan tinggi dan dapat diwarnai lewat `currentColor` mengikuti token
 * palet teater. Seluruh siluet memakai viewBox 0 0 60 140 sehingga tingginya
 * sebanding saat berdiri berdampingan di panggung.
 *
 * Untuk papan catur interaktif dipakai karakter Unicode (lihat UNICODE di
 * bawah) karena lebih ringan untuk 32 bidak yang terus dirender ulang.
 */

/** Alas bertingkat yang dipakai semua bidak. */
const BASE = 'M5,112 h50 l2,8 h-54 z M1,120 h58 v12 h-58 z';

/** @type {Record<string, string>} */
const PATHS = {
  pawn:
    'M30,20 a14,14 0 1,1 -0.1,0 z ' +
    'M15,54 h30 l-3,8 h-24 z ' +
    'M21,62 c0,24 -5,36 -11,50 h40 c-6,-14 -11,-26 -11,-50 z ' +
    BASE,

  rook:
    'M10,22 h9 v9 h7 v-9 h8 v9 h7 v-9 h9 v24 h-40 z ' +
    'M14,46 h32 v9 h-32 z ' +
    'M19,55 h22 l5,57 h-32 z ' +
    BASE,

  bishop:
    'M30,10 a5.5,5.5 0 1,1 -0.1,0 z ' +
    'M30,20 c14,12 17,31 11,42 h-22 c-6,-11 -3,-30 11,-42 z ' +
    'M30,30 l0,22 M22,42 h16 ' +
    'M16,62 h28 v9 h-28 z ' +
    'M20,71 h20 l6,41 h-32 z ' +
    BASE,

  knight:
    'M24,112 c-3,-20 -1,-33 6,-42 ' +
    'c-6,1 -12,-1 -15,-6 c-3,-6 -1,-13 4,-19 ' +
    'c4,-5 9,-8 12,-13 c2,-4 2,-9 1,-13 ' +
    'c6,3 12,9 16,17 c6,12 7,27 5,41 ' +
    'c-2,12 -3,24 -1,35 z ' +
    'M22,42 a2.6,2.6 0 1,1 -0.1,0 z ' +
    'M14,104 h32 l2,8 h-36 z ' +
    BASE,

  queen:
    'M9,30 a4.5,4.5 0 1,1 -0.1,0 z ' +
    'M20,22 a4.5,4.5 0 1,1 -0.1,0 z ' +
    'M30,17 a5,5 0 1,1 -0.1,0 z ' +
    'M40,22 a4.5,4.5 0 1,1 -0.1,0 z ' +
    'M51,30 a4.5,4.5 0 1,1 -0.1,0 z ' +
    'M9,34 l6,26 h30 l6,-26 l-11,14 l-5,-24 l-5,24 l-5,-24 l-5,24 z ' +
    'M14,60 h32 v9 h-32 z ' +
    'M19,69 c1,20 -3,30 -9,43 h40 c-6,-13 -10,-23 -9,-43 z ' +
    BASE,

  king:
    'M27,4 h6 v7 h7 v6 h-7 v9 h-6 v-9 h-7 v-6 h7 z ' +
    'M30,26 c12,0 20,8 20,17 c0,7 -4,12 -9,17 h-22 c-5,-5 -9,-10 -9,-17 ' +
    'c0,-9 8,-17 20,-17 z ' +
    'M15,60 h30 v9 h-30 z ' +
    'M20,69 c1,20 -3,30 -9,43 h38 c-6,-13 -10,-23 -9,-43 z ' +
    BASE,
};

/** Karakter Unicode untuk papan catur interaktif. */
export const UNICODE = Object.freeze({
  white: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
  black: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' },
});

/** Nama bidak dalam bahasa Indonesia, dipakai untuk label aksesibilitas. */
export const PIECE_NAMES = Object.freeze({
  pawn: 'Pion',
  rook: 'Benteng',
  knight: 'Kuda',
  bishop: 'Gajah',
  queen: 'Menteri',
  king: 'Raja',
});

/**
 * Menghasilkan markup SVG siluet sebuah bidak.
 *
 * @param {keyof PATHS} type
 * @param {Object} [options]
 * @param {string} [options.className]
 * @returns {string} Markup SVG.
 */
export function pieceSvg(type, { className = '' } = {}) {
  const path = PATHS[type];
  if (!path) return '';

  return (
    `<svg class="${className}" viewBox="0 0 60 140" role="img" ` +
    `aria-label="${PIECE_NAMES[type] ?? type}" focusable="false">` +
    `<path fill="currentColor" fill-rule="evenodd" d="${path}" />` +
    '</svg>'
  );
}

export const PIECE_TYPES = Object.keys(PATHS);

export default { pieceSvg, UNICODE, PIECE_NAMES, PIECE_TYPES };
