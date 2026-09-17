import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar.jsx';
import WordList from '../components/WordList.jsx';
import Filters from '../components/Filters.jsx';
import useSearch from '../hooks/useSearch.js';
import { useVocab } from '../context/VocabContext.jsx';
import { useLang } from '../context/LangContext.jsx';

export default function HomePage() {
  const [params, setParams] = useSearchParams();
  const { words } = useVocab();
  const { t } = useLang();

  const query = params.get('q') ?? '';
  const levels = useMemo(() => new Set((params.get('lv') || '').split(',').filter(Boolean).map(Number)), [params]);
  const pos = params.get('pos') || '';

  const update = (patch) => {
    const next = { q: query, lv: [...levels].sort().join(','), pos, ...patch };
    const clean = {};
    for (const [k, v] of Object.entries(next)) if (v) clean[k] = v;
    setParams(clean, { replace: true });
  };

  const results = useSearch(query, { levels, pos });

  // Đếm số từ theo cấp (theo từ khoá + loại từ hiện tại, bỏ lọc cấp) để hiện trên chip
  const counts = useMemo(() => {
    const c = {};
    for (const w of words) c[w.level] = (c[w.level] || 0) + 1;
    return c;
  }, [words]);

  const posOptions = useMemo(() => {
    const m = new Map();
    for (const w of words) if (!m.has(w.pos)) m.set(w.pos, w.posEn);
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [words]);

  return (
    <>
      <section className="home-hero">
        <h1>{t.homeTitle}</h1>
        <p className="muted">{t.homeSub}</p>
        <SearchBar value={query} onChange={(q) => update({ q })} autoFocus showSuggestions={false} />
      </section>

      <Filters
        levels={levels}
        onLevels={(s) => update({ lv: [...s].sort().join(',') })}
        pos={pos}
        onPos={(p) => update({ pos: p })}
        posOptions={posOptions}
        counts={counts}
      />

      <div className="list-head">
        <span className="muted">{query ? t.results(results.length, query) : t.total(results.length)}</span>
      </div>
      <WordList words={results} query={query} />
    </>
  );
}
