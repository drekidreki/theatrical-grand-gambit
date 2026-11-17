/**
 * QC lanjutan: penyematan iframe, navigasi keyboard, reduced motion,
 * Jeda Gerak, dan ketahanan saat pustaka pihak ketiga gagal dimuat.
 */
import puppeteer from 'puppeteer';

const APP = 'http://localhost:8099/';
const PARENT = 'http://localhost:8098/';

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

let problems = 0;
const ok = (label, pass, detail = '') => {
  if (!pass) problems++;
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${label.padEnd(50)} ${detail}`);
};

/* ====================================================================
   1. Disematkan di dalam <iframe> layar penuh
   ================================================================= */
console.log('\n=== 1. Penyematan iframe fullscreen ===');
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto(PARENT, { waitUntil: 'networkidle2', timeout: 30000 });
  const frame = page.frames().find((f) => f.url().startsWith(APP));
  ok('iframe memuat aplikasi', Boolean(frame));

  await frame.evaluate(() => document.querySelector('#intro-skip')?.click());
  await new Promise((r) => setTimeout(r, 1000));

  const m = await frame.evaluate(() => ({
    bodyScrollW: document.body.scrollWidth,
    clientW: document.documentElement.clientWidth,
    bodyScrollH: document.body.scrollHeight,
    clientH: document.documentElement.clientHeight,
    htmlOv: getComputedStyle(document.documentElement).overflowY,
    bodyOv: getComputedStyle(document.body).overflowY,
    stageTop: document.querySelector('.grand-stage')?.getBoundingClientRect().top,
  }));

  // Satu-satunya kontainer scroll harus body; html terkunci.
  ok('html terkunci (tidak ada scrollbar ganda)', m.htmlOv === 'hidden', m.htmlOv);
  ok('body menjadi kontainer scroll', m.bodyOv === 'auto', m.bodyOv);
  ok('tidak ada overflow horizontal di iframe', m.bodyScrollW <= m.clientW + 1,
     `${m.bodyScrollW} vs ${m.clientW}`);
  ok('panggung tidak terpotong di atas', m.stageTop >= 0, `top=${Math.round(m.stageTop)}`);

  // Scroll di dalam iframe harus berjalan.
  await frame.evaluate(() => document.querySelector('[data-nav-target="act-pion"]')?.click());
  await new Promise((r) => setTimeout(r, 2400));
  // body memakai scroll-behavior: smooth, sehingga nilainya harus dibaca
  // setelah animasi scroll selesai — bukan tepat setelah penugasan.
  await frame.evaluate(() => { document.body.scrollTop = 600; });
  await new Promise((r) => setTimeout(r, 900));
  const scrolled = await frame.evaluate(() => document.body.scrollTop);
  const scrollH = await frame.evaluate(() => document.body.scrollHeight);
  ok('scroll internal iframe berfungsi', scrolled > 400,
     `scrollTop=${scrolled} dari tinggi ${scrollH}`);

  // localStorage di dalam iframe same-origin tetap jalan; yang diuji di sini
  // adalah tidak adanya exception yang menjatuhkan aplikasi.
  ok('tidak ada exception JavaScript', errors.length === 0, errors.join('; '));
  await page.close();
}

/* ====================================================================
   2. Navigasi keyboard
   ================================================================= */
console.log('\n=== 2. Navigasi keyboard ===');
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(APP, { waitUntil: 'networkidle2' });
  await page.evaluate(() => document.querySelector('#intro-skip')?.click());
  await new Promise((r) => setTimeout(r, 900));

  // Tab sampai menemukan sebuah loge, lalu Enter.
  let reachedLoge = false;
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab');
    const isLoge = await page.evaluate(() => document.activeElement?.classList.contains('loge'));
    if (isLoge) { reachedLoge = true; break; }
  }
  ok('loge dapat dicapai dengan Tab', reachedLoge);

  if (reachedLoge) {
    await page.keyboard.press('Enter');
    await new Promise((r) => setTimeout(r, 1400));
    const active = await page.evaluate(() =>
      [...document.querySelectorAll('.act')].find((a) => !a.hidden)?.id);
    ok('Enter membuka babak', active && active !== 'grand-stage', active);
  }

  // Escape menutup Program Acara.
  await page.evaluate(() => document.querySelector('#btn-program')?.click());
  await new Promise((r) => setTimeout(r, 600));
  const openBefore = await page.evaluate(() =>
    document.querySelector('#program-acara')?.classList.contains('is-open'));
  await page.keyboard.press('Escape');
  await new Promise((r) => setTimeout(r, 600));
  const openAfter = await page.evaluate(() =>
    document.querySelector('#program-acara')?.classList.contains('is-open'));
  ok('Program Acara terbuka lalu ditutup Escape', openBefore && !openAfter);

  // Indikator fokus terlihat.
  const hasOutline = await page.evaluate(() => {
    const btn = document.querySelector('#btn-program');
    btn.focus();
    return getComputedStyle(btn, ':focus-visible').outlineStyle !== 'none';
  });
  ok('indikator fokus tersedia', hasOutline !== false);

  // Papan catur menggambar ulang seluruh petaknya setiap kali diklik; fokus
  // keyboard harus bertahan di petak yang sama setelah itu.
  await page.evaluate(() => document.querySelector('[data-nav-target="act-arena"]')?.click());
  await page.waitForSelector('#act-arena [data-square="e2"]', { timeout: 15000 });
  const focusKept = await page.evaluate(() => {
    const sq = document.querySelector('#act-arena [data-square="e2"]');
    sq.focus();
    sq.click();
    return document.activeElement?.dataset?.square;
  });
  ok('fokus keyboard bertahan setelah papan dirender ulang', focusKept === 'e2', String(focusKept));

  await page.close();
}

/* ====================================================================
   3. Reduced motion & Jeda Gerak
   ================================================================= */
console.log('\n=== 3. Reduced motion dan Jeda Gerak ===');
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(APP, { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1800));

  const introGone = await page.evaluate(() =>
    document.querySelector('#intro')?.classList.contains('is-done'));
  ok('intro otomatis dilewati saat reduced motion', Boolean(introGone));

  const navWorks = await page.evaluate(() => {
    document.querySelector('[data-nav-target="act-ratu"]')?.click();
    return true;
  });
  await new Promise((r) => setTimeout(r, 1800));
  const ratuVisible = await page.evaluate(() => !document.getElementById('act-ratu').hidden);
  ok('navigasi tetap berfungsi tanpa animasi', navWorks && ratuVisible);
  await page.close();
}
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(APP, { waitUntil: 'networkidle2' });
  await page.evaluate(() => document.querySelector('#intro-skip')?.click());
  await new Promise((r) => setTimeout(r, 900));

  await page.evaluate(() => document.querySelector('#btn-pause-motion')?.click());
  await new Promise((r) => setTimeout(r, 400));

  const state = await page.evaluate(() => {
    const floater = document.querySelector('.anim-dust, .anim-sway');
    return {
      htmlClass: document.documentElement.classList.contains('motion-paused'),
      pressed: document.querySelector('#btn-pause-motion')?.getAttribute('aria-pressed'),
      animation: floater ? getComputedStyle(floater).animationName : 'none',
      logesClickable: document.querySelectorAll('.loge').length,
    };
  });
  ok('Jeda Gerak mengaktifkan kelas motion-paused', state.htmlClass);
  ok('tombol Jeda Gerak menandai keadaannya', state.pressed === 'true', state.pressed);
  ok('animasi ambien berhenti', state.animation === 'none', state.animation);
  ok('navigasi tetap tersedia saat gerak dijeda', state.logesClickable === 4);
  await page.close();
}

/* ====================================================================
   4. Ketahanan saat pustaka gagal dimuat
   ================================================================= */
console.log('\n=== 4. Simulasi ketiga pustaka gagal dimuat ===');
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setRequestInterception(true);
  page.on('request', (req) =>
    /assets\/vendor\//.test(req.url()) ? req.abort() : req.continue()
  );
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto(APP, { waitUntil: 'networkidle2' });
  await page.evaluate(() => document.querySelector('#intro-skip')?.click());
  await new Promise((r) => setTimeout(r, 1200));

  const libs = await page.evaluate(() => window.TGG_LIBS);
  ok('ketiga pustaka memang gagal dimuat',
     !libs.gsap && !libs.chart && !libs.chess, JSON.stringify(libs));

  await page.evaluate(() => document.querySelector('[data-nav-target="act-ratu"]')?.click());
  await page.waitForSelector('.elo-chart__fallback tbody tr', { timeout: 15000 });
  const chart = await page.evaluate(() => ({
    fallbackShown: !document.querySelector('.elo-chart__fallback')?.hidden,
    rows: document.querySelectorAll('.elo-chart__fallback tbody tr').length,
  }));
  ok('grafik berganti ke tabel cadangan', chart.fallbackShown, `${chart.rows} baris`);

  await page.evaluate(() => document.querySelector('[data-nav-target="act-arena"]')?.click());
  // Menunggu elemennya benar-benar ada jauh lebih andal daripada timeout tetap.
  await page.waitForSelector('#act-arena [data-square="g1"]', { timeout: 15000 });
  const board = await page.evaluate(() => {
    const sq = document.querySelector('#act-arena [data-square="g1"]');
    // Papan dirender ulang saat diklik, sehingga referensi ke papannya harus
    // diambil SEBELUM klik — setelah itu node petaknya sudah terlepas.
    const b = sq?.closest('.chessboard');
    sq?.click();
    return { targets: b?.querySelectorAll('.square.is-target').length ?? -1 };
  });
  // Kuda g1 pada posisi awal punya dua langkah sah: f3 dan h3.
  ok('papan catur tetap benar lewat validator internal', board.targets === 2, `${board.targets} langkah`);
  ok('tidak ada exception saat pustaka hilang', errors.length === 0, errors.join('; '));
  await page.close();
}

await browser.close();
console.log(`\n${problems === 0 ? 'SEMUA QC LULUS' : 'ADA MASALAH'} — temuan: ${problems}`);
process.exit(problems ? 1 : 0);
