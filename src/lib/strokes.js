// Nạp dữ liệu nét chữ từ /public/strokes/<codepoint>.json (tải sẵn bằng scripts/fetch-strokes.mjs).
// Thiếu file thì fallback sang CDN của hanzi-writer-data.
const cache = new Map();

export function strokeUrl(char) {
  return `${import.meta.env.BASE_URL}strokes/${char.codePointAt(0).toString(16)}.json`;
}

export async function loadCharData(char) {
  if (cache.has(char)) return cache.get(char);
  const p = (async () => {
    let res = await fetch(strokeUrl(char));
    if (!res.ok) {
      res = await fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/${encodeURIComponent(char)}.json`);
    }
    if (!res.ok) throw new Error(`Không có dữ liệu nét cho ${char}`);
    return res.json();
  })();
  cache.set(char, p);
  p.catch(() => cache.delete(char));
  return p;
}

/** charDataLoader cho HanziWriter */
export function charDataLoader(char, onLoad, onError) {
  loadCharData(char).then(onLoad).catch(onError);
}

export function isHan(ch) {
  return /\p{Script=Han}/u.test(ch);
}

export function hanChars(str) {
  return [...str].filter(isHan);
}
