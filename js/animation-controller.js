/**
 * js/animation-controller.js
 * ==========================
 * Satu titik kendali untuk seluruh gerak di website ini.
 *
 * Tanggung jawab: intro pembukaan tirai, sorotan pengikut kursor, paralaks
 * berlapis, bidak melayang, proyeksi notasi, kursor kustom, serta sakelar
 * Jeda Gerak dan Reduced Motion.
 *
 * ATURAN YANG DIPEGANG
 *   1. GSAP bersifat opsional. Bila CDN gagal dimuat, intro tetap selesai
 *      dan seluruh navigasi tetap berfungsi — hanya tanpa koreografi halus.
 *   2. Hanya `transform` dan `opacity` yang dianimasikan, supaya tidak ada
 *      reflow dan frame rate tetap mendekati 60 fps.
 *   3. Animasi berhenti ketika tab tidak aktif, ketika fokus keluar dari
 *      <iframe>, dan ketika panggung tidak terlihat di layar.
 */

import {
  $, $$, el, clamp, lerp, rafThrottle, prefersReducedMotion, isTouchOnly,
} from './utils/helpers.js';
import { pieceSvg } from './utils/piece-art.js';
import { read, write, KEYS } from './storage.js';

const gsap = () => (window.TGG_LIBS?.gsap ? window.gsap : null);

let motionPaused = false;
let parallaxActive = false;
let ambientTimers = [];

/* ===========================================================================
   SAKELAR GERAK
   ======================================================================== */

/** Apakah seluruh gerak dekoratif sedang dimatikan. */
export const isMotionOff = () => motionPaused || prefersReducedMotion();

export function setMotionPaused(paused, { persist = true } = {}) {
  motionPaused = paused;
  document.documentElement.classList.toggle('motion-paused', paused);

  const button = $('#btn-pause-motion');
  if (button) {
    button.setAttribute('aria-pressed', String(paused));
    const label = button.querySelector('.icon-btn__label');
    if (label) label.textContent = paused ? 'Lanjutkan Gerak' : 'Jeda Gerak';
  }

  if (paused) {
    stopAmbient();
  } else {
    startAmbient();
  }

  if (persist) write(KEYS.MOTION_PAUSED, paused);
}

function initMotionToggle() {
  const saved = read(KEYS.MOTION_PAUSED, false);
  setMotionPaused(Boolean(saved), { persist: false });

  $('#btn-pause-motion')?.addEventListener('click', () => {
    setMotionPaused(!motionPaused);
  });
}

/* ===========================================================================
   INTRO — THE OPENING CURTAIN
   ======================================================================== */

/**
 * Menjalankan intro. Selalu menyelesaikan dirinya sendiri, bahkan bila GSAP
 * tidak ada, sehingga pengunjung tidak pernah terjebak di layar pembuka.
 */
export function playIntro() {
  const intro = $('#intro');
  if (!intro) return Promise.resolve();

  const counter = $('#intro-counter');
  const skip = $('#intro-skip');
  const leftCurtain = $('.intro__curtain--left');
  const rightCurtain = $('.intro__curtain--right');

  // Kunjungan berulang dalam satu sesi memakai intro singkat.
  const seenThisSession = read(KEYS.INTRO_SEEN, false);
  const shortVersion = seenThisSession || isMotionOff();

  return new Promise((resolve) => {
    let finished = false;

    function finish() {
      if (finished) return;
      finished = true;

      ambientTimers.forEach(clearInterval);
      intro.classList.add('is-done');
      intro.setAttribute('aria-hidden', 'true');
      write(KEYS.INTRO_SEEN, true);

      // Lepas dari pohon aksesibilitas setelah transisi memudarnya selesai.
      setTimeout(() => {
        intro.hidden = true;
      }, 900);

      resolve();
    }

    skip?.addEventListener('click', finish, { once: true });

    // Escape juga melewati intro.
    const onKey = (event) => {
      if (event.key === 'Escape') {
        finish();
        document.removeEventListener('keydown', onKey);
      }
    };
    document.addEventListener('keydown', onKey);

    if (shortVersion) {
      if (counter) counter.textContent = '100';
      setTimeout(finish, 420);
      return;
    }

    // Penghitung 0 sampai 100 selama fase pembukaan.
    let value = 0;
    const counterTimer = setInterval(() => {
      value = Math.min(100, value + 4);
      if (counter) counter.textContent = String(value);
      if (value >= 100) clearInterval(counterTimer);
    }, 55);
    ambientTimers.push(counterTimer);

    const lib = gsap();

    if (!lib) {
      // Jalur cadangan tanpa GSAP: tirai dibuka dengan animasi CSS.
      leftCurtain?.style.setProperty('transition', 'transform 1.6s cubic-bezier(.65,0,.35,1) 1.4s');
      rightCurtain?.style.setProperty('transition', 'transform 1.6s cubic-bezier(.65,0,.35,1) 1.4s');
      requestAnimationFrame(() => {
        if (leftCurtain) leftCurtain.style.transform = 'translate3d(-102%,0,0)';
        if (rightCurtain) rightCurtain.style.transform = 'translate3d(102%,0,0)';
      });
      setTimeout(finish, 4200);
      return;
    }

    // Koreografi GSAP: sorotan menyala, tirai terbuka, panggung dinyalakan.
    const tl = lib.timeline({ onComplete: finish });

    tl.fromTo('.intro__spotlight', { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power2.out' })
      .fromTo('.intro__content', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
      .to('.intro__curtain--left', {
        xPercent: -102, duration: 1.6, ease: 'power2.inOut',
      }, 1.6)
      .to('.intro__curtain--right', {
        xPercent: 102, duration: 1.6, ease: 'power2.inOut',
      }, 1.6)
      .to('.intro__content', { opacity: 0, duration: 0.5 }, 2.4)
      .fromTo('.loge',
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.14, ease: 'power2.out' },
        3.1)
      .fromTo('.grand-stage__title-block',
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
        3.6)
      .to({}, { duration: 0.6 });
  });
}

/* ===========================================================================
   PARALAKS BERLAPIS
   ======================================================================== */

function initParallax() {
  const root = $('#stage-parallax');
  if (!root || isTouchOnly()) return;

  const layers = $$('.stage-layer[data-depth]', root).map((node) => ({
    node,
    depth: Number.parseFloat(node.dataset.depth) || 0,
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  }));

  if (layers.length === 0) return;

  let running = false;
  let frame = null;

  function tick() {
    let moving = false;

    for (const layer of layers) {
      layer.x = lerp(layer.x, layer.targetX, 0.08);
      layer.y = lerp(layer.y, layer.targetY, 0.08);

      if (Math.abs(layer.x - layer.targetX) > 0.05 ||
          Math.abs(layer.y - layer.targetY) > 0.05) {
        moving = true;
      }

      layer.node.style.transform =
        `translate3d(${layer.x.toFixed(2)}px, ${layer.y.toFixed(2)}px, 0)`;
    }

    frame = moving ? requestAnimationFrame(tick) : null;
    running = Boolean(frame);
  }

  const onPointerMove = rafThrottle((event) => {
    if (isMotionOff() || !parallaxActive) return;

    const rect = root.getBoundingClientRect();
    const relX = (event.clientX - rect.left) / rect.width - 0.5;
    const relY = (event.clientY - rect.top) / rect.height - 0.5;

    for (const layer of layers) {
      // Lapisan depan bergerak lebih jauh daripada lapisan belakang.
      layer.targetX = -relX * layer.depth * 70;
      layer.targetY = -relY * layer.depth * 38;
    }

    if (!running) {
      running = true;
      frame = requestAnimationFrame(tick);
    }
  });

  root.addEventListener('pointermove', onPointerMove, { passive: true });

  root.addEventListener('pointerleave', () => {
    for (const layer of layers) {
      layer.targetX = 0;
      layer.targetY = 0;
    }
    if (!running) {
      running = true;
      frame = requestAnimationFrame(tick);
    }
  });
}

/* ===========================================================================
   SOROTAN PENGIKUT KURSOR
   ======================================================================== */

function initSpotlight() {
  const root = $('#stage-parallax');
  const spotlight = $('#stage-spotlight');
  if (!root || !spotlight || isTouchOnly()) return;

  let currentX = 50;
  let currentY = 50;
  let targetX = 50;
  let targetY = 50;
  let frame = null;

  function tick() {
    currentX = lerp(currentX, targetX, 0.1);
    currentY = lerp(currentY, targetY, 0.1);

    spotlight.style.setProperty('--spot-x', `${currentX.toFixed(2)}%`);
    spotlight.style.setProperty('--spot-y', `${currentY.toFixed(2)}%`);

    const settled =
      Math.abs(currentX - targetX) < 0.1 && Math.abs(currentY - targetY) < 0.1;
    frame = settled ? null : requestAnimationFrame(tick);
  }

  root.addEventListener(
    'pointermove',
    rafThrottle((event) => {
      if (isMotionOff()) return;

      const rect = root.getBoundingClientRect();
      targetX = clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100);
      targetY = clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100);

      if (!frame) frame = requestAnimationFrame(tick);
    }),
    { passive: true }
  );
}

/* ===========================================================================
   BIDAK RAKSASA DI PANGGUNG
   ======================================================================== */

/**
 * Fakta singkat yang muncul saat bidak raksasa diklik.
 * Seluruhnya berasal dari data terverifikasi; tidak ada yang dikarang.
 * Teks lengkap dan sumbernya ada di data/irene-profile.js.
 */
/* Posisi horizontal sengaja dijaga di rentang 23%–77%. Keempat loge menempati
   sisi kiri dan kanan panggung, sehingga bidak di luar rentang itu akan
   tertutup dan tidak bisa diklik. */
const GIANT_PIECES = [
  { type: 'rook', left: '24%', size: '70px', bottom: '17%', factKey: 'peak' },
  { type: 'knight', left: '35%', size: '84px', bottom: '14%', factKey: 'wgm' },
  { type: 'king', left: '50%', size: '108px', bottom: '11%', factKey: 'im' },
  { type: 'bishop', left: '65%', size: '84px', bottom: '14%', factKey: 'asia' },
  { type: 'pawn', left: '76%', size: '62px', bottom: '17%', factKey: 'start' },
];

function renderGiantPieces(facts = {}) {
  const host = $('#giant-pieces');
  if (!host) return;

  host.replaceChildren(
    ...GIANT_PIECES.map((config, index) => {
      const button = el('button', {
        class: 'giant-piece',
        type: 'button',
        'aria-haspopup': 'dialog',
        dataset: { factKey: config.factKey },
        html: pieceSvg(config.type),
      });

      button.style.setProperty('--piece-left', config.left);
      button.style.setProperty('--piece-size', config.size);
      button.style.setProperty('--piece-bottom', config.bottom);
      button.style.setProperty('--float-delay', `${index * -1.8}s`);

      const fact = facts[config.factKey];
      button.setAttribute(
        'aria-label',
        fact ? `Bidak catur. Lihat fakta: ${fact.title}` : 'Bidak catur dekoratif'
      );

      return button;
    })
  );
}

/* ===========================================================================
   DEBU DAN PROYEKSI NOTASI
   ======================================================================== */

function renderDust() {
  const layer = $('#dust-layer');
  if (!layer) return;

  // Jumlah partikel dibatasi: lebih sedikit di perangkat kecil.
  const count = window.matchMedia('(max-width: 767px)').matches ? 10 : 26;

  layer.replaceChildren(
    ...Array.from({ length: count }, () => {
      const mote = el('span', { class: 'dust-mote anim-dust' });
      mote.style.left = `${Math.random() * 100}%`;
      mote.style.top = `${40 + Math.random() * 60}%`;
      mote.style.setProperty('--dust-duration', `${9 + Math.random() * 10}s`);
      mote.style.setProperty('--dust-delay', `${Math.random() * -14}s`);
      mote.style.opacity = String(0.25 + Math.random() * 0.45);
      return mote;
    })
  );
}

/** Notasi yang berganti di layar proyeksi. Seluruhnya langkah catur nyata. */
const NOTATIONS = [
  'E2 — E4', 'Kf3', 'Gc4', 'O-O', 'd4', 'Mh5', 'Bxe5', 'Skak!', 'e.p.', 'Rxf7',
];

function startProjection() {
  const node = $('#projection-notation');
  if (!node) return null;

  let index = 0;
  return setInterval(() => {
    if (isMotionOff() || document.hidden) return;
    index = (index + 1) % NOTATIONS.length;
    node.style.opacity = '0';
    setTimeout(() => {
      node.textContent = NOTATIONS[index];
      node.style.opacity = '1';
    }, 260);
  }, 3400);
}

/* ===========================================================================
   KURSOR EMAS KUSTOM
   ======================================================================== */

function initCustomCursor() {
  const cursor = $('#custom-cursor');
  if (!cursor || isTouchOnly()) return;

  const move = rafThrottle((event) => {
    cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    cursor.classList.add('is-visible');
  });

  document.addEventListener('pointermove', move, { passive: true });
  document.addEventListener('pointerleave', () => cursor.classList.remove('is-visible'));

  // Membesar di atas elemen yang dapat diklik.
  document.addEventListener('pointerover', (event) => {
    const interactive = event.target.closest('button, a, input, select, [role="button"]');
    cursor.classList.toggle('is-hovering', Boolean(interactive));
  });
}

/* ===========================================================================
   SIKLUS HIDUP ANIMASI
   ======================================================================== */

function startAmbient() {
  if (isMotionOff()) return;
  stopAmbient();
  const timer = startProjection();
  if (timer) ambientTimers.push(timer);
}

function stopAmbient() {
  ambientTimers.forEach(clearInterval);
  ambientTimers = [];
}

/**
 * Menghentikan animasi saat tab tidak aktif ATAU saat fokus keluar dari
 * <iframe>. Keduanya diperlukan: visibilitychange tidak selalu terpicu
 * ketika pengguna mengklik di luar iframe pada halaman induk yang sama.
 */
function initLifecycle() {
  const onHidden = () => stopAmbient();
  const onVisible = () => {
    if (!document.hidden) startAmbient();
  };

  document.addEventListener('visibilitychange', () =>
    document.hidden ? onHidden() : onVisible()
  );
  window.addEventListener('blur', onHidden);
  window.addEventListener('focus', onVisible);

  // Animasi hanya berjalan ketika panggung benar-benar terlihat.
  const stage = $('#stage-parallax');
  if (stage && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        parallaxActive = entry.isIntersecting;
        stage.classList.toggle('is-offscreen', !entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(stage);
  } else {
    parallaxActive = true;
  }
}

/* ===========================================================================
   INISIALISASI
   ======================================================================== */

export function initAnimations({ facts = {} } = {}) {
  initMotionToggle();
  renderGiantPieces(facts);
  renderDust();
  initParallax();
  initSpotlight();
  initCustomCursor();
  initLifecycle();
  startAmbient();
}

/** Transisi masuk sebuah babak. Tanpa GSAP, CSS yang mengambil alih. */
export function transitionToAct(actId) {
  const lib = gsap();
  if (!lib || isMotionOff()) return;

  const node = document.getElementById(actId);
  if (!node) return;

  lib.fromTo(
    node.querySelectorAll('.act-header, .act-body > *'),
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out', clearProps: 'all' }
  );
}

export default { initAnimations, playIntro, setMotionPaused, isMotionOff, transitionToAct };
