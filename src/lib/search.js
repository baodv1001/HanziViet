import { normalizeQuery, searchKeys } from './pinyin.js';

/** Dựng chỉ mục tìm kiếm cho danh sách từ. */
export function buildIndex(words) {
  return words.map((w) => ({
    word: w,
    keys: searchKeys(w.pinyin),
    vi: (w.vi || '').toLowerCase(),
    en: (w.en || '').toLowerCase(),
    hv: (w.hv || '').toLowerCase(),
  }));
}

/**
 * Tìm từ theo pinyin (không dấu, có thể có khoảng trắng / số thanh), chữ Hán, nghĩa Việt/Anh, âm Hán Việt.
 * @param {ReturnType<typeof buildIndex>} index
 * @param {string} query
 * @param {{levels?: Set<number>, pos?: string}} filters
 */
export function searchWords(index, query, filters = {}) {
  const raw = query.trim().toLowerCase();
  const q = normalizeQuery(raw);
  const { levels, pos } = filters;
  const scored = [];
  for (const item of index) {
    const w = item.word;
    if (levels && levels.size && !levels.has(w.level)) continue;
    if (pos && w.pos !== pos) continue;
    if (!raw) {
      scored.push({ w, score: 0 });
      continue;
    }
    let score = 0;
    if (q && item.keys.some((k) => k === q)) score = 100;
    else if (q && item.keys.some((k) => k.startsWith(q))) score = 80;
    else if (w.hanzi.includes(raw)) score = 70;
    else if (q && item.keys.some((k) => k.includes(q))) score = 50;
    else if (item.vi.includes(raw) || item.en.includes(raw) || item.hv.includes(raw)) score = 30;
    if (score) scored.push({ w, score });
  }
  if (raw) scored.sort((a, b) => b.score - a.score || a.w.level - b.w.level || a.w.pinyin.localeCompare(b.w.pinyin));
  return scored.map((s) => s.w);
}
