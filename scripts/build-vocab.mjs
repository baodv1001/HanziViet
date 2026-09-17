// Dựng dữ liệu từ vựng HSK 1–6 (chuẩn HSK 2.0) + câu ví dụ.
//
// Nguồn:
//  - complete-hsk-vocabulary (drkameleon, MIT): từ, pinyin, loại từ, nghĩa tiếng Anh, cấp HSK.
//  - Tatoeba (CC BY 2.0 FR): câu tiếng Trung + bản dịch tiếng Anh.
//  - data-src/*.tsv (tự biên soạn): nghĩa tiếng Việt của từ, âm Hán Việt từng chữ, bản dịch Việt của câu ví dụ,
//    câu ví dụ bổ sung cho từ không có trong Tatoeba.
//
// Kết quả:
//  - public/data/words.json            : mọi từ (hanzi, pinyin, level, pos, en, vi, hv)
//  - public/data/examples/hsk<N>.json  : câu ví dụ theo cấp  { hanzi: [{zh, py, en, vi, src}] }
//  - public/data/chars.json            : âm Hán Việt + nghĩa từng chữ
//  - data-src/todo-*.tsv               : danh sách còn thiếu để biên soạn tiếp
//
// Cách chạy:  node scripts/build-vocab.mjs <thư mục chứa complete.json và *.tsv của Tatoeba>

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pinyin as toPinyin } from 'pinyin-pro';

const SRC = process.argv[2];
if (!SRC) {
  console.error('Usage: node scripts/build-vocab.mjs <src-dir>');
  process.exit(1);
}
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DATA_SRC = join(ROOT, 'data-src');
const OUT = join(ROOT, 'public', 'data');
mkdirSync(join(OUT, 'examples'), { recursive: true });
mkdirSync(DATA_SRC, { recursive: true });

const TARGET_EXAMPLES = { 1: 3, 2: 3, 3: 3, 4: 2, 5: 2, 6: 2 };

// ---------- helpers ----------
// Đọc và gộp mọi file data-src/<prefix>*.tsv (vd. chars.tsv, chars-2.tsv, ...)
const readTsv = (prefix) => {
  const base = prefix.replace(/\.tsv$/, '');
  const files = readdirSync(DATA_SRC).filter((f) => f.startsWith(base) && f.endsWith('.tsv') && !f.startsWith('todo-'));
  const rows = [];
  for (const f of files) {
    const p = join(DATA_SRC, f);
    if (!existsSync(p)) continue;
    for (const l of readFileSync(p, 'utf8').split(/\r?\n/)) {
      if (l && !l.startsWith('#')) rows.push(l.split('\t').map((c) => c.trim()));
    }
  }
  return rows;
};
const isHan = (c) => /\p{Script=Han}/u.test(c);
const hanChars = (s) => [...s].filter(isHan);

// ---------- 1. Từ vựng ----------
const raw = JSON.parse(readFileSync(join(SRC, 'complete.json'), 'utf8'));
const POS_MAP = {
  n: ['danh từ', 'noun'], v: ['động từ', 'verb'], a: ['tính từ', 'adjective'], d: ['phó từ', 'adverb'],
  p: ['giới từ', 'preposition'], c: ['liên từ', 'conjunction'], u: ['trợ từ', 'particle'], r: ['đại từ', 'pronoun'],
  m: ['số từ', 'numeral'], q: ['lượng từ', 'measure word'], t: ['từ chỉ thời gian', 'time word'],
  f: ['từ phương vị', 'locality word'], e: ['thán từ', 'interjection'], y: ['ngữ khí từ', 'modal particle'],
  o: ['từ tượng thanh', 'onomatopoeia'], l: ['cụm từ cố định', 'set phrase'], i: ['thành ngữ', 'idiom'],
  z: ['từ trạng thái', 'status word'], b: ['từ khu biệt', 'attributive'], s: ['từ chỉ nơi chốn', 'place word'],
  nr: ['tên người', 'personal name'], ns: ['địa danh', 'place name'], nt: ['tên tổ chức', 'organization'],
  nz: ['danh từ riêng', 'proper noun'], vn: ['động từ / danh từ', 'verb / noun'], an: ['tính từ / danh từ', 'adjective / noun'],
  ad: ['tính từ / phó từ', 'adjective / adverb'], k: ['hậu tố', 'suffix'], h: ['tiền tố', 'prefix'],
  g: ['ngữ tố', 'morpheme'], j: ['từ viết tắt', 'abbreviation'], x: ['khác', 'other'], qv: ['lượng từ động lượng', 'verbal measure word'],
  mq: ['số lượng từ', 'numeral-measure'], qt: ['lượng từ thời gian', 'time measure word'], tg: ['ngữ tố thời gian', 'time morpheme'],
  cc: ['liên từ', 'conjunction'], Mg: ['ngữ tố số', 'numeral morpheme'], Rg: ['ngữ tố đại từ', 'pronoun morpheme'],
};

const words = new Map(); // hanzi -> word
for (const w of raw) {
  const lv = Math.min(...w.level.filter((l) => l.startsWith('old-')).map((l) => +l.slice(4)));
  if (!Number.isFinite(lv)) continue;
  // Chọn cách đọc phổ biến nhất: bỏ nghĩa "surname", "variant of", "used in ..."; ưu tiên form nhiều nghĩa
  const JUNK = /^(surname |old variant|variant of|used in |see |abbr\. for|Taiwan pr|\((archaic|literary|old|onom\.|dialect)\))/i;
  const scored = w.forms
    .map((f) => ({ f, meanings: f.meanings.filter((m) => !JUNK.test(m)) }))
    .filter((x) => x.meanings.length)
    .sort((a, b) => b.meanings.length - a.meanings.length || (/^[A-Z]/.test(a.f.transcriptions.pinyin) ? 1 : -1));
  const best = scored[0] || { f: w.forms[0], meanings: w.forms[0].meanings };
  const form = best.f;
  const pin = form.transcriptions.pinyin || '';
  const posCode = (w.pos || [])[0];
  const pos = POS_MAP[posCode] || POS_MAP.x;
  const en = [...new Set(best.meanings)].slice(0, 4).join('; ');
  if (!words.has(w.simplified)) {
    words.set(w.simplified, {
      hanzi: w.simplified,
      trad: form.traditional !== w.simplified ? form.traditional : undefined,
      pinyin: pin.replace(/\s+/g, ''),
      pinyinSpaced: pin,
      level: lv,
      pos: pos[0],
      posEn: pos[1],
      en,
      freq: w.frequency,
      classifiers: form.classifiers?.length ? form.classifiers.join(' ') : undefined,
    });
  } else {
    const prev = words.get(w.simplified);
    prev.level = Math.min(prev.level, lv);
  }
}
console.log('words:', words.size);

// Bản đồ phồn -> giản (theo cặp từ cùng độ dài) để chuẩn hoá câu Tatoeba
const t2s = new Map();
for (const w of raw) {
  for (const f of w.forms) {
    const t = f.traditional;
    if (t && t.length === w.simplified.length) {
      for (let i = 0; i < t.length; i++) if (t[i] !== w.simplified[i]) t2s.set(t[i], w.simplified[i]);
    }
  }
}
const toSimp = (s) => [...s].map((c) => t2s.get(c) || c).join('');

// ---------- 2. Dữ liệu tự biên soạn ----------
// words-vi: hanzi \t nghĩa Việt \t (pinyin ghi đè, tuỳ chọn)
const viWords = new Map();
const pinyinOverride = new Map();
const enOverride = new Map();
for (const [h, vi, py, en] of readTsv('words-vi.tsv')) {
  viWords.set(h, vi);
  if (py) pinyinOverride.set(h, py);
  if (en) enOverride.set(h, en);
}
const chars = new Map(readTsv('chars.tsv').map(([c, hv, vi]) => [c, { hv, vi }]));
const viEx = new Map(readTsv('examples-vi.tsv').map(([id, vi]) => [id, vi]));
const extraEx = readTsv('examples-extra.tsv'); // hanzi \t zh \t en \t vi

for (const w of words.values()) {
  w.vi = viWords.get(w.hanzi) || '';
  if (pinyinOverride.has(w.hanzi)) {
    w.pinyinSpaced = pinyinOverride.get(w.hanzi);
    w.pinyin = w.pinyinSpaced.replace(/\s+/g, '');
  }
  if (enOverride.has(w.hanzi)) w.en = enOverride.get(w.hanzi);
  const hvs = hanChars(w.hanzi).map((c) => chars.get(c)?.hv || '?');
  w.hv = hvs.join(' ');
}

// ---------- 3. Câu ví dụ Tatoeba ----------
const cmn = new Map();
for (const line of readFileSync(join(SRC, 'cmn_sentences.tsv'), 'utf8').split('\n')) {
  const [id, , text] = line.split('\t');
  if (id && text) cmn.set(id, toSimp(text.trim()));
}
const links = new Map(); // cmn id -> eng id
for (const line of readFileSync(join(SRC, 'cmn-eng_links.tsv'), 'utf8').split('\n')) {
  const [a, b] = line.split('\t');
  if (a && b && !links.has(a)) links.set(a, b.trim());
}
const engNeeded = new Set(links.values());
const eng = new Map();
for (const line of readFileSync(join(SRC, 'eng_sentences.tsv'), 'utf8').split('\n')) {
  const tab = line.indexOf('\t');
  const id = line.slice(0, tab);
  if (engNeeded.has(id)) eng.set(id, line.slice(line.lastIndexOf('\t') + 1).trim());
}
// danh sách câu dùng được: có bản dịch Anh, độ dài hợp lý, không lặp
const pool = [];
const seen = new Set();
for (const [id, zh] of cmn) {
  const enId = links.get(id);
  if (!enId || !eng.has(enId)) continue;
  const n = hanChars(zh).length;
  if (n < 4 || n > 22) continue;
  if (/[A-Za-z0-9０-９]/.test(zh)) continue; // bỏ câu có tên riêng Latin / số
  if (seen.has(zh)) continue;
  seen.add(zh);
  pool.push({ id, zh, en: eng.get(enId), n });
}
console.log('usable sentences:', pool.length);

const formatPinyin = (zh) => {
  const py = toPinyin(zh, { nonZh: 'consecutive' });
  return py
    .replace(/\s+([，。！？；：、”’）])/g, '$1')
    .replace(/([“‘（])\s+/g, '$1')
    .replace(/，/g, ',')
    .replace(/。/g, '.')
    .replace(/！/g, '!')
    .replace(/？/g, '?')
    .replace(/；/g, ';')
    .replace(/：/g, ':')
    .replace(/、/g, ',')
    .replace(/[“”]/g, '"')
    .replace(/^\s*\p{L}/u, (m) => m.toUpperCase())
    .replace(/([.!?]\s+)(\p{L})/gu, (m, a, b) => a + b.toUpperCase())
    .trim();
};

const examples = {}; // level -> { hanzi: [...] }
for (let l = 1; l <= 6; l++) examples[l] = {};
const missing = []; // [hanzi, level, count]
const usedIds = new Set();

// Ưu tiên câu ngắn vừa (8–14 chữ) và đã có bản dịch Việt
const score = (s, hasVi) => Math.abs(s.n - 10) - (hasVi ? 100 : 0);

for (const w of words.values()) {
  const target = TARGET_EXAMPLES[w.level];
  const list = [];
  // câu bổ sung tự biên soạn trước
  for (const [h, zh, en, vi] of extraEx) {
    if (h === w.hanzi) list.push({ zh, py: formatPinyin(zh), en, vi, src: 'own' });
  }
  if (list.length < target) {
    const cands = pool.filter((s) => s.zh.includes(w.hanzi));
    cands.sort((a, b) => score(a, viEx.has(a.id)) - score(b, viEx.has(b.id)));
    for (const s of cands) {
      if (list.length >= target) break;
      if (list.some((e) => e.zh === s.zh)) continue;
      list.push({ zh: s.zh, py: formatPinyin(s.zh), en: s.en, vi: viEx.get(s.id) || '', src: `tatoeba:${s.id}` });
      usedIds.add(s.id);
    }
  }
  if (list.length < Math.min(target, 2)) missing.push([w.hanzi, w.level, list.length]);
  examples[w.level][w.hanzi] = list;
}

// ---------- 4. Ghi kết quả ----------
const wordList = [...words.values()].sort((a, b) => a.level - b.level || a.pinyin.localeCompare(b.pinyin));
writeFileSync(join(OUT, 'words.json'), JSON.stringify(wordList));
for (let l = 1; l <= 6; l++) writeFileSync(join(OUT, 'examples', `hsk${l}.json`), JSON.stringify(examples[l]));
const charOut = {};
const allChars = new Set(wordList.flatMap((w) => hanChars(w.hanzi)));
for (const c of allChars) if (chars.has(c)) charOut[c] = [chars.get(c).hv, chars.get(c).vi];
writeFileSync(join(OUT, 'chars.json'), JSON.stringify(charOut));

// ---------- 5. Danh sách việc còn thiếu ----------
const todoWords = wordList.filter((w) => !w.vi).map((w) => `${w.hanzi}\t${w.pinyin}\t${w.level}\t${w.en}`);
writeFileSync(join(DATA_SRC, 'todo-words.tsv'), todoWords.join('\n'));
const todoChars = [...allChars].filter((c) => !chars.has(c));
writeFileSync(join(DATA_SRC, 'todo-chars.tsv'), todoChars.join('\n'));
const todoEx = [];
for (const s of pool) if (usedIds.has(s.id) && !viEx.has(s.id)) todoEx.push(`${s.id}\t${s.zh}\t${s.en}`);
writeFileSync(join(DATA_SRC, 'todo-examples.tsv'), todoEx.join('\n'));
writeFileSync(join(DATA_SRC, 'todo-missing-examples.tsv'), missing.map((m) => m.join('\t')).join('\n'));

const byLevel = {};
for (const w of wordList) byLevel[w.level] = (byLevel[w.level] || 0) + 1;
console.log('by level:', byLevel);
console.log('chars:', allChars.size, '| chars without HV:', todoChars.length);
console.log('words without VI:', todoWords.length);
console.log('example sentences used:', usedIds.size, '| without VI:', todoEx.length);
console.log('words with <2 examples:', missing.length);
