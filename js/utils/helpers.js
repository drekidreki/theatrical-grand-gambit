/**
 * js/utils/helpers.js
 * ===================
 * Fungsi pembantu murni yang dipakai lintas modul. Tidak menyimpan keadaan
 * aplikasi dan tidak pernah mengimpor modul fitur.
 */

/** Pemilih elemen tunggal. */
export const $ = (selector, scope = document) => scope.querySelector(selector);

/** Pemilih banyak elemen, mengembalikan array sungguhan. */
export const $$ = (selector, scope = document) =>
  Array.from(scope.querySelectorAll(selector));

/**
 * Membuat elemen beserta atribut dan anaknya dalam satu panggilan.
 *
 * @param {string} tag           Nama tag.
 * @param {Object} [props]       Atribut. `class`, `text`, `html`, dan
 *                               `dataset` ditangani khusus.
 * @param {Array}  [children]    Anak berupa Node atau string.
 */
export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);

  for (const [key, value] of Object.entries(props)) {
    if (value === null || value === undefined || value === false) continue;

    if (key === 'class') {
      node.className = value;
    } else if (key === 'text') {
      node.textContent = value;
    } else if (key === 'html') {
      node.innerHTML = value;
    } else if (key === 'dataset') {
      Object.assign(node.dataset, value);
    } else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (value === true) {
      node.setAttribute(key, '');
    } else {
      node.setAttribute(key, String(value));
    }
  }

  for (const child of [].concat(children)) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }

  return node;
}

/**
 * Kontainer scroll dokumen ini.
 *
 * PENTING: global.css mengunci <html> dengan overflow:hidden dan menjadikan
 * <body> satu-satunya kontainer scroll, supaya tidak muncul double scrollbar
 * saat aplikasi disematkan di dalam <iframe>. Karena itu posisi scroll
 * HARUS dibaca dari sini, bukan dari window.scrollY.
 */
export const getScroller = () => document.body;

/** Membatasi nilai pada rentang tertentu. */
export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/** Interpolasi linear, dipakai untuk kelambanan sorotan lampu. */
export const lerp = (from, to, amount) => from + (to - from) * amount;

/**
 * Menunda pemanggilan sampai pemanggil berhenti memicu selama `wait` ms.
 * Dipakai untuk resize dan input teks.
 */
export function debounce(fn, wait = 150) {
  let timer;
  return function debounced(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

/**
 * Membatasi pemanggilan menjadi maksimal satu kali per frame.
 * Dipakai untuk event scroll dan pointermove agar tetap 60fps.
 */
export function rafThrottle(fn) {
  let queued = false;
  let lastArgs;

  return function throttled(...args) {
    lastArgs = args;
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      fn.apply(this, lastArgs);
    });
  };
}

/** Apakah pengguna meminta pengurangan gerak lewat pengaturan perangkat. */
export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Apakah perangkat tidak memiliki kursor (layar sentuh). */
export const isTouchOnly = () => window.matchMedia('(hover: none)').matches;

/** Mengosongkan isi sebuah elemen. */
export function empty(node) {
  while (node.firstChild) node.firstChild.remove();
  return node;
}

/**
 * Menjebak fokus keyboard di dalam sebuah elemen (dipakai modal dan lightbox).
 * Mengembalikan fungsi pelepas.
 */
export function trapFocus(container) {
  const SELECTOR =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
    'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  const previouslyFocused = document.activeElement;

  function onKeydown(event) {
    if (event.key !== 'Tab') return;

    const focusable = $$(SELECTOR, container).filter(
      (node) => node.offsetParent !== null
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  container.addEventListener('keydown', onKeydown);

  return function release() {
    container.removeEventListener('keydown', onKeydown);
    if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
  };
}

/** Menunggu sejumlah milidetik. */
export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
