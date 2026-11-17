/**
 * Uji asap: membuka aplikasi di browser sungguhan, menelusuri setiap babak,
 * dan mencatat seluruh error konsol serta permintaan jaringan yang gagal.
 */
import puppeteer from 'puppeteer';

const BASE = process.argv[2] ?? 'http://localhost:8099';
const VIEWPORTS = [
  { name: '360', width: 360, height: 740 },
  { name: '768', width: 768, height: 1024 },
  { name: '1440', width: 1440, height: 900 },
];

// Aset yang memang belum disediakan pembuat website; 404-nya disengaja dan
// ditangani dengan slot penanda di antarmuka.
const IGNORED = /favicon\.ico|irene-infografis|irene-documentary|video-poster|ambient\.mp3|transition\.mp3|portrait\.webp/;

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

let totalErrors = 0;

for (const vp of VIEWPORTS) {
  const page = await browser.newPage();
  await page.setViewport({ width: vp.width, height: vp.height });

  const errors = [];
  const failedRequests = [];

  page.on('console', (msg) => {
    const text = msg.text();
    if (msg.type() === 'error' && !IGNORED.test(text) && !/Failed to load resource/.test(text)) {
      errors.push(`[console] ${text}`);
    }
  });
  page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`));
  page.on('requestfailed', (req) => {
    const url = req.url();
    if (url.startsWith(BASE) && !IGNORED.test(url)) failedRequests.push(`${req.failure()?.errorText} ${url}`);
  });
  page.on('response', (res) => {
    if (res.url().startsWith(BASE) && res.status() >= 400 && !IGNORED.test(res.url())) {
      failedRequests.push(`HTTP ${res.status()} ${res.url()}`);
    }
  });

  console.log(`\n=== Viewport ${vp.name}px ===`);
  await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 30000 });

  // Lewati intro.
  await page.evaluate(() => document.querySelector('#intro-skip')?.click());
  await new Promise((r) => setTimeout(r, 900));

  // Cek tidak ada scroll horizontal.
  const overflow = await page.evaluate(() => ({
    bodyScrollW: document.body.scrollWidth,
    clientW: document.documentElement.clientWidth,
    htmlOverflowY: getComputedStyle(document.documentElement).overflowY,
    bodyOverflowY: getComputedStyle(document.body).overflowY,
  }));
  const hasHOverflow = overflow.bodyScrollW > overflow.clientW + 1;
  console.log(`  scroll horizontal: ${hasHOverflow ? 'ADA (' + overflow.bodyScrollW + ' > ' + overflow.clientW + ')' : 'tidak ada'}`);
  console.log(`  overflow html/body: ${overflow.htmlOverflowY} / ${overflow.bodyOverflowY}`);
  if (hasHOverflow) totalErrors++;

  // Telusuri setiap babak.
  for (const act of ['act-tokoh', 'act-arena', 'act-pion', 'act-ratu']) {
    await page.evaluate((id) => {
      document.querySelector(`[data-nav-target="${id}"]`)?.click();
    }, act);
    await new Promise((r) => setTimeout(r, 1600));

    const info = await page.evaluate((id) => {
      const section = document.getElementById(id);
      const body = section?.querySelector('.act-body');
      return {
        visible: section && !section.hidden,
        childCount: body?.childElementCount ?? 0,
        textLength: body?.textContent.trim().length ?? 0,
        hasOutlineStub: /sedang dibangun/i.test(body?.textContent ?? ''),
        buttons: section?.querySelectorAll('button').length ?? 0,
      };
    }, act);

    const ok = info.visible && info.childCount > 0 && info.textLength > 400 && !info.hasOutlineStub;
    if (!ok) totalErrors++;
    console.log(
      `  ${ok ? 'OK  ' : 'GAGAL'} ${act.padEnd(10)} elemen:${info.childCount} teks:${info.textLength} tombol:${info.buttons}${info.hasOutlineStub ? ' [MASIH KERANGKA]' : ''}`
    );
  }

  // Interaksi papan catur di Arena Pikir.
  await page.evaluate(() => document.querySelector('[data-nav-target="act-arena"]')?.click());
  await new Promise((r) => setTimeout(r, 1200));
  const boardTest = await page.evaluate(() => {
    const sq = document.querySelector('#act-arena [data-square="e2"]');
    if (!sq) return { found: false };
    const board = sq.closest('.chessboard');
    sq.click();
    const targets = board.querySelectorAll('.square.is-target, .square.is-target-capture');
    return { found: true, legalTargets: targets.length, squares: board.children.length };
  });
  console.log(`  papan catur: ${boardTest.found ? `${boardTest.squares} petak, e2 punya ${boardTest.legalTargets} langkah sah` : 'TIDAK DITEMUKAN'}`);
  if (!boardTest.found) totalErrors++;

  // Grafik Elo di Sang Ratu.
  await page.evaluate(() => document.querySelector('[data-nav-target="act-ratu"]')?.click());
  await new Promise((r) => setTimeout(r, 2000));
  const chartTest = await page.evaluate(() => ({
    canvas: Boolean(document.querySelector('#act-ratu canvas')),
    fallbackVisible: !document.querySelector('.elo-chart__fallback')?.hidden,
    tickets: document.querySelectorAll('#act-ratu .ticket').length,
    achievements: document.querySelectorAll('#act-ratu .achievement').length,
    chartLib: Boolean(window.Chart),
  }));
  console.log(`  grafik: canvas=${chartTest.canvas} chartjs=${chartTest.chartLib} fallback=${chartTest.fallbackVisible} tiket=${chartTest.tickets} prestasi=${chartTest.achievements}`);
  if (chartTest.achievements !== 16) totalErrors++;

  if (errors.length) {
    console.log(`  ERROR KONSOL (${errors.length}):`);
    [...new Set(errors)].slice(0, 10).forEach((e) => console.log(`    ${e}`));
    totalErrors += errors.length;
  } else {
    console.log('  error konsol: tidak ada');
  }

  if (failedRequests.length) {
    console.log(`  REQUEST GAGAL (${failedRequests.length}):`);
    [...new Set(failedRequests)].slice(0, 10).forEach((e) => console.log(`    ${e}`));
    totalErrors += failedRequests.length;
  } else {
    console.log('  request gagal: tidak ada');
  }

  if (vp.name === '1440') {
    await page.evaluate(() => document.querySelector('[data-nav-target="grand-stage"]')?.click());
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: './shot-stage.png' });
    await page.evaluate(() => document.querySelector('[data-nav-target="act-ratu"]')?.click());
    await new Promise((r) => setTimeout(r, 2000));
    await page.screenshot({ path: './shot-ratu.png' });
    await page.evaluate(() => document.querySelector('[data-nav-target="act-arena"]')?.click());
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: './shot-arena.png' });
  }

  await page.close();
}

await browser.close();
console.log(`\n${totalErrors === 0 ? 'LULUS' : 'ADA MASALAH'} — total temuan: ${totalErrors}`);
process.exit(totalErrors ? 1 : 0);
