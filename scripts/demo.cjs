'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = process.env.QA_BASE_URL || 'http://localhost:5173';
const VIDEO_DIR = process.env.VIDEO_DIR || '/work/demo';
const OUTPUT_NAME = 'demo-napojnice.webm';
const REHEARSAL = process.argv.includes('--rehearse');

fs.mkdirSync(VIDEO_DIR, { recursive: true });

// ---- helpers (iz ui-demo skilla) ----
async function injectCursor(page) {
  await page.evaluate(() => {
    if (document.getElementById('demo-cursor')) return;
    const c = document.createElement('div');
    c.id = 'demo-cursor';
    c.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 3L19 12L12 13L9 20L5 3Z" fill="white" stroke="black" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
    c.style.cssText = 'position:fixed;z-index:999999;pointer-events:none;width:24px;height:24px;transition:left .1s,top .1s;filter:drop-shadow(1px 1px 2px rgba(0,0,0,.3));left:0;top:0';
    document.body.appendChild(c);
    document.addEventListener('mousemove', (e) => { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; });
  });
}
async function injectSubtitleBar(page) {
  await page.evaluate(() => {
    if (document.getElementById('demo-subtitle')) return;
    const b = document.createElement('div');
    b.id = 'demo-subtitle';
    b.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:999998;text-align:center;padding:12px 24px;background:rgba(0,0,0,.78);color:#fff;font-family:-apple-system,"Segoe UI",sans-serif;font-size:17px;font-weight:600;letter-spacing:.3px;transition:opacity .3s;pointer-events:none;opacity:0';
    document.body.appendChild(b);
  });
}
async function showSubtitle(page, text) {
  await page.evaluate((t) => {
    const b = document.getElementById('demo-subtitle');
    if (!b) return;
    if (t) { b.textContent = t; b.style.opacity = '1'; } else { b.style.opacity = '0'; }
  }, text);
  if (text) await page.waitForTimeout(700);
}
async function ensureVisible(page, locator, label) {
  const el = typeof locator === 'string' ? page.locator(locator).first() : locator;
  const ok = await el.isVisible().catch(() => false);
  console[ok ? 'log' : 'error'](`${ok ? 'OK' : 'FAIL'}: ${label}`);
  return ok;
}
async function moveAndClick(page, locator, label, postDelay = 900) {
  const el = typeof locator === 'string' ? page.locator(locator).first() : locator;
  if (!(await el.isVisible().catch(() => false))) { console.error(`skip click: ${label}`); return false; }
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  const box = await el.boundingBox();
  if (box) { await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 12 }); await page.waitForTimeout(350); }
  await el.click();
  await page.waitForTimeout(postDelay);
  return true;
}
async function typeSlowly(page, locator, text, label, d = 38) {
  const el = typeof locator === 'string' ? page.locator(locator).first() : locator;
  if (!(await el.isVisible().catch(() => false))) { console.error(`skip type: ${label}`); return false; }
  await moveAndClick(page, el, label, 200);
  await el.fill('');
  await el.pressSequentially(text, { delay: d });
  await page.waitForTimeout(400);
  return true;
}
async function panElements(page, selector, max = 6) {
  const els = await page.locator(selector).all();
  for (let i = 0; i < Math.min(els.length, max); i++) {
    const box = await els[i].boundingBox().catch(() => null);
    if (box && box.y < 700) { await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 8 }); await page.waitForTimeout(600); }
  }
}

// ---- flow ----
async function run(page, recording) {
  await page.goto(BASE_URL + '/', { waitUntil: 'networkidle' });
  await injectCursor(page); await injectSubtitleBar(page);

  if (REHEARSAL) {
    let ok = true;
    ok &= await ensureVisible(page, page.getByRole('tab', { name: 'Sve' }), 'tab Sve');
    ok &= await ensureVisible(page, page.getByRole('link', { name: '+ Nova smjena' }), 'link Nova smjena');
    await page.goto(BASE_URL + '/smjene/nova', { waitUntil: 'networkidle' });
    ok &= await ensureVisible(page, page.getByLabel('Broj gostiju'), 'polje Broj gostiju');
    ok &= await ensureVisible(page, page.getByLabel('Lokal'), 'polje Lokal');
    ok &= await ensureVisible(page, page.getByRole('button', { name: 'Spremi smjenu' }), 'gumb Spremi');
    if (!ok) { console.error('REHEARSAL FAILED'); process.exit(1); }
    console.log('REHEARSAL PASSED'); return;
  }

  await showSubtitle(page, 'Napojnice — pratitelj smjena i bakšiša za konobare');
  await page.waitForTimeout(1400);
  await showSubtitle(page, 'Pregled: napojnice, €/sat, sati, smjene');
  await panElements(page, '.stat-card', 4);
  await page.waitForTimeout(800);

  await showSubtitle(page, 'Razdoblje: tjedan / mjesec / sve');
  await moveAndClick(page, page.getByRole('tab', { name: 'Mjesec' }), 'tab Mjesec');
  await moveAndClick(page, page.getByRole('tab', { name: 'Sve' }), 'tab Sve');
  await moveAndClick(page, page.getByRole('tab', { name: 'Tjedan' }), 'tab Tjedan');

  await showSubtitle(page, 'Nova smjena');
  await moveAndClick(page, page.getByRole('link', { name: '+ Nova smjena' }), 'Nova smjena');
  await injectCursor(page); await injectSubtitleBar(page);
  await showSubtitle(page, 'Nova smjena');

  await showSubtitle(page, 'Unos: napojnice + broj gostiju');
  await typeSlowly(page, page.getByLabel('Napojnice — gotovina (€)'), '45', 'gotovina');
  await typeSlowly(page, page.getByLabel('Napojnice — kartica (€)'), '30', 'kartica');
  await typeSlowly(page, page.getByLabel('Broj gostiju'), '52', 'gosti');
  await typeSlowly(page, page.getByLabel('Lokal'), 'Konoba Adriatic', 'lokal');
  await page.waitForTimeout(600);

  await showSubtitle(page, 'Spremi');
  await moveAndClick(page, page.getByRole('button', { name: 'Spremi smjenu' }), 'Spremi smjenu', 1400);
  await injectCursor(page); await injectSubtitleBar(page);

  await showSubtitle(page, 'Spremljeno — nova smjena je u listi');
  const row = page.locator('.shift').filter({ hasText: 'Konoba Adriatic' }).first();
  const box = await row.boundingBox().catch(() => null);
  if (box) { await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 12 }); }
  await page.waitForTimeout(2400);
  await showSubtitle(page, '');
  await page.waitForTimeout(800);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  if (REHEARSAL) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    await run(await ctx.newPage(), false);
    await browser.close();
    return;
  }
  const ctx = await browser.newContext({ recordVideo: { dir: VIDEO_DIR, size: { width: 1280, height: 720 } }, viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();
  try { await run(page, true); }
  catch (e) { console.error('DEMO ERROR:', e.message); }
  finally {
    await ctx.close();
    const v = page.video();
    if (v) { const src = await v.path(); fs.copyFileSync(src, path.join(VIDEO_DIR, OUTPUT_NAME)); console.log('Video saved:', path.join(VIDEO_DIR, OUTPUT_NAME)); }
    await browser.close();
  }
})();
