// Tải dữ liệu nét chữ (hanzi-writer-data) cho mọi chữ trong public/data/words.json
// và lưu vào public/strokes/<codepoint hex>.json để site tự phục vụ, không phụ thuộc CDN.
import { mkdir, writeFile, access, readFile } from 'node:fs/promises';

const ROOT = new URL('../', import.meta.url);
const OUT = new URL('public/strokes/', ROOT);
await mkdir(OUT, { recursive: true });

const words = JSON.parse(await readFile(new URL('public/data/words.json', ROOT), 'utf8'));
const chars = new Set();
for (const w of words) for (const c of w.hanzi) if (/\p{Script=Han}/u.test(c)) chars.add(c);

let ok = 0, skip = 0;
const fail = [];
const queue = [...chars];
const CONCURRENCY = 8;
async function worker() {
  while (queue.length) {
    const c = queue.shift();
    const file = new URL(`${c.codePointAt(0).toString(16)}.json`, OUT);
    try { await access(file); skip++; continue; } catch { /* chưa có */ }
    const url = `https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/${encodeURIComponent(c)}.json`;
    try {
      const res = await fetch(url);
      if (!res.ok) { fail.push(c); continue; }
      await writeFile(file, await res.text());
      ok++;
    } catch { fail.push(c); }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
console.log(`chars: ${chars.size}, downloaded: ${ok}, skipped: ${skip}, failed: ${fail.join('') || 'none'}`);
