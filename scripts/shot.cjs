// Ad-hoc screenshots aplikacije (radi u Playwright Docker imageu, --network host).
const { chromium } = require("playwright");

const BASE = process.env.BASE_URL || "http://localhost:5173";
const OUT = process.env.OUT_DIR || "/work/shots";
const SHOTS = [
  { name: "dashboard-desktop", path: "/", w: 1280, h: 900 },
  { name: "dashboard-mobile", path: "/", w: 390, h: 844 },
  { name: "form-desktop", path: "/smjene/nova", w: 1280, h: 900 },
];

(async () => {
  const b = await chromium.launch();
  for (const s of SHOTS) {
    const p = await b.newPage({ viewport: { width: s.w, height: s.h } });
    await p.goto(BASE + s.path, { waitUntil: "networkidle", timeout: 30000 });
    await p.waitForTimeout(500);
    await p.screenshot({ path: `${OUT}/${s.name}.png`, fullPage: true });
    console.log("saved", s.name);
    await p.close();
  }
  await b.close();
})().catch((e) => { console.error("FAIL", e.message); process.exit(1); });
