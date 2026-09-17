import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { buildIndex } from '../lib/search.js';

const VocabContext = createContext(null);
const BASE = import.meta.env.BASE_URL;

/** Nạp public/data/words.json một lần, dựng chỉ mục tìm kiếm và bảng tra theo chữ. */
export function VocabProvider({ children }) {
  const [words, setWords] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    fetch(`${BASE}data/words.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => alive && setWords(data))
      .catch((e) => alive && setError(e));
    return () => {
      alive = false;
    };
  }, []);

  const value = useMemo(() => {
    if (!words) return { words: null, error, index: null, byHanzi: null };
    const byHanzi = new Map(words.map((w) => [w.hanzi, w]));
    return { words, error, index: buildIndex(words), byHanzi };
  }, [words, error]);

  return <VocabContext.Provider value={value}>{children}</VocabContext.Provider>;
}

export function useVocab() {
  return useContext(VocabContext);
}

const exampleCache = new Map();
/** Câu ví dụ của một cấp, nạp lười và cache. */
export function loadExamples(level) {
  if (!exampleCache.has(level)) {
    const p = fetch(`${BASE}data/examples/hsk${level}.json`).then((r) => (r.ok ? r.json() : {}));
    exampleCache.set(level, p);
  }
  return exampleCache.get(level);
}

let charsPromise = null;
/** Bảng âm Hán Việt + nghĩa từng chữ: { chữ: [hv, vi] } */
export function loadChars() {
  if (!charsPromise) charsPromise = fetch(`${BASE}data/chars.json`).then((r) => (r.ok ? r.json() : {}));
  return charsPromise;
}
