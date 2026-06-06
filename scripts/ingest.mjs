// Ingest Spire Codex (spire-codex.com) -> JSON bundlé patch-stampé + images réelles.
// Données © Mega Crit / servies par Spire Codex (PolyForm Noncommercial). Usage fan non commercial.
//
//   node scripts/ingest.mjs            # data + images
//   node scripts/ingest.mjs --no-img   # data seulement (rapide)

import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const API = 'https://spire-codex.com/api';
const HOST = 'https://spire-codex.com';
// source de secours (datamined, même schéma) si l'API spire-codex est indisponible
const MIRROR = 'https://raw.githubusercontent.com/nkhoit/spire-archive/main/data/sts2';
const UA = { 'User-Agent': 'sts2-companion/1.0 (personal fan tool)' };
const CHARS = ['IRONCLAD', 'SILENT', 'DEFECT', 'NECROBINDER', 'REGENT'];
const DATA_DIR = 'src/data';
const noImg = process.argv.includes('--no-img');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJSON(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers: UA });
      if (r.status === 429) { await sleep(4000); continue; }
      if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
      return await r.json();
    } catch (e) {
      if (i === tries - 1) throw e;
      await sleep(1500);
    }
  }
}

/* ---------------- DATA ---------------- */
// contenu : spire-codex en priorité, sinon repli sur le miroir nkhoit (même schéma)
async function getContent(name) {
  try {
    return await getJSON(`${API}/${name}`);
  } catch (e) {
    console.warn(`  ! spire-codex /${name} KO (${e.message}) → repli miroir nkhoit`);
    return await getJSON(`${MIRROR}/${name}.json`);
  }
}
console.log('• Fetching reference data…');
const [cardsRaw, characters, relicsRaw, potions, keywords] = await Promise.all([
  getContent('cards'),
  getContent('characters'),
  getContent('relics'),
  getContent('potions'),
  getJSON(`${API}/keywords`).catch(() => []),
]);
let events = await getJSON(`${API}/events`).catch(() => []);

// trim card fields
const cards = cardsRaw.map((c) => ({
  id: c.id, name: c.name, description: c.description, cost: c.cost, is_x_cost: c.is_x_cost,
  type: c.type, rarity: c.rarity, target: c.target, color: c.color,
  damage: c.damage, block: c.block, keywords: c.keywords, tags: c.tags,
  upgrade: c.upgrade, upgrade_description: c.upgrade_description,
  image_url: c.image_url, compendium_order: c.compendium_order,
}));
const relics = relicsRaw.map((r) => ({
  id: r.id, name: r.name, description: r.description, rarity: r.rarity,
  character: r.character ?? r.color ?? null, flavor: r.flavor ?? r.flavor_text ?? null,
  image_url: r.image_url,
}));

/* ---------------- RATINGS ---------------- */
console.log('• Fetching run-stats (win-impact)…');
const ratings = { cards: {}, relics: {} };
ratings.cards.overall = await getJSON(`${API}/runs/scores/cards`).catch(() => ({}));
ratings.relics.overall = await getJSON(`${API}/runs/scores/relics`).catch(() => ({}));
for (const ch of CHARS) {
  ratings.cards[ch] = await getJSON(`${API}/runs/scores/cards?character=${ch}`).catch(() => ({}));
  await sleep(150);
}

/* ---------------- PATCH VERSION ---------------- */
let patch = 'Early Access';
let patchDate = null;
let recentChanges = [];
try {
  const cl = await getJSON(`${API}/changelogs`);
  const list = Array.isArray(cl) ? cl : cl.changelogs || cl.items || [];
  const top = list[0] || {};
  patch = String(top.game_version || top.tag || patch);
  patchDate = top.date ?? null;
  recentChanges = list.slice(0, 8).map((c) => ({ version: c.game_version || c.tag, date: c.date, title: c.title, summary: c.summary }));
} catch { /* tolère */ }

const meta = {
  patch,
  patchDate,
  ingestedAt: new Date().toISOString(),
  source: 'spire-codex.com',
  recentChanges,
  counts: { cards: cards.length, characters: characters.length, relics: relics.length, potions: potions.length, events: events.length },
};

await mkdir(DATA_DIR, { recursive: true });
await writeFile(`${DATA_DIR}/cards.json`, JSON.stringify(cards));
await writeFile(`${DATA_DIR}/characters.json`, JSON.stringify(characters, null, 2));
await writeFile(`${DATA_DIR}/relics.json`, JSON.stringify(relics));
await writeFile(`${DATA_DIR}/potions.json`, JSON.stringify(potions, null, 2));
await writeFile(`${DATA_DIR}/keywords.json`, JSON.stringify(keywords, null, 2));
await writeFile(`${DATA_DIR}/events.json`, JSON.stringify(events));
await writeFile(`${DATA_DIR}/ratings.json`, JSON.stringify(ratings));
await writeFile(`${DATA_DIR}/meta.json`, JSON.stringify(meta, null, 2));
console.log(`✓ data written (patch ${patch}):`, meta.counts);

/* ---------------- IMAGES ---------------- */
if (noImg) { console.log('— images skipped (--no-img)'); process.exit(0); }

const jobs = [];
const add = (dir, id, image_url) => {
  if (!image_url) return;
  const ext = image_url.endsWith('.png') ? '.png' : '.webp';
  jobs.push({ url: HOST + image_url, out: `public/${dir}/${id.toLowerCase()}${ext}` });
};
for (const c of cards) add('cards', c.id, c.image_url);
for (const r of relics) add('relics', r.id, r.image_url);
for (const p of potions) add('potions', p.id, p.image_url);
for (const ch of characters) add('characters', ch.id, ch.image_url);

for (const d of ['cards', 'relics', 'potions', 'characters']) await mkdir(`public/${d}`, { recursive: true });

console.log(`• Downloading ${jobs.length} images (concurrency 6)…`);
let ok = 0, skip = 0, fail = 0;
const CONC = 6;
async function worker(queue) {
  while (queue.length) {
    const job = queue.pop();
    if (existsSync(job.out)) { skip++; continue; }
    try {
      const r = await fetch(job.url, { headers: UA });
      if (r.status === 429) { await sleep(5000); queue.push(job); continue; }
      if (!r.ok) { fail++; continue; }
      await writeFile(job.out, Buffer.from(await r.arrayBuffer()));
      ok++;
      if (ok % 100 === 0) console.log(`  …${ok} downloaded`);
    } catch { fail++; }
  }
}
await Promise.all(Array.from({ length: CONC }, () => worker(jobs)));
console.log(`✓ images: ${ok} downloaded, ${skip} cached, ${fail} failed`);
