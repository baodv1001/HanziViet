import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar.jsx';
import WordHero from '../components/WordHero.jsx';
import StrokeOrder from '../components/StrokeOrder.jsx';
import CharInfo from '../components/CharInfo.jsx';
import Examples from '../components/Examples.jsx';
import { useVocab } from '../context/VocabContext.jsx';
import { useLang } from '../context/LangContext.jsx';
import { hanChars, loadCharData } from '../lib/strokes.js';
import { wordPath } from '../lib/routes.js';

export default function WordPage() {
  const { hanzi } = useParams();
  const navigate = useNavigate();
  const { words, byHanzi } = useVocab();
  const { t, lang } = useLang();
  const [query, setQuery] = useState('');
  const key = decodeURIComponent(hanzi);
  const word = byHanzi.get(key) || null;
  const [strokeCount, setStrokeCount] = useState(null);

  useEffect(() => {
    setQuery('');
    window.scrollTo({ top: 0 });
  }, [hanzi]);

  useEffect(() => {
    if (!word) return;
    document.title =
      lang === 'vi'
        ? `${word.hanzi} nghĩa là gì? Pinyin ${word.pinyin}, cách viết | HanziViet`
        : `${word.hanzi} meaning, pinyin ${word.pinyin}, stroke order | HanziViet`;
    let alive = true;
    setStrokeCount(null);
    Promise.all(hanChars(word.hanzi).map(loadCharData))
      .then((all) => alive && setStrokeCount(all.reduce((n, d) => n + d.strokes.length, 0)))
      .catch(() => alive && setStrokeCount(null));
    return () => {
      alive = false;
    };
  }, [word, lang]);

  if (!word) {
    return (
      <div className="empty">
        {t.noWord(key)}{' '}
        <button className="btn" onClick={() => navigate('/')}>
          {t.backHome}
        </button>
      </div>
    );
  }

  const idx = words.indexOf(word);
  const prev = words[(idx - 1 + words.length) % words.length];
  const next = words[(idx + 1) % words.length];
  const chars = hanChars(word.hanzi);

  return (
    <>
      <div className="word-search">
        <SearchBar value={query} onChange={setQuery} />
      </div>
      <WordHero word={word} strokeCount={strokeCount} />
      <StrokeOrder key={word.hanzi} chars={chars} />
      <div className="two-col">
        <CharInfo chars={chars} word={word} />
        <Examples word={word} />
      </div>
      <nav className="pager">
        <Link to={wordPath(prev)} className="pager__link" title={t.prev}>
          ‹ <span className="pinyin">{prev.pinyin}</span> {prev.hanzi}
        </Link>
        <Link to={`/?lv=${word.level}`} className="pager__link pager__link--center">
          {t.allWords} HSK {word.level}
        </Link>
        <Link to={wordPath(next)} className="pager__link" title={t.next}>
          {next.hanzi} <span className="pinyin">{next.pinyin}</span> ›
        </Link>
      </nav>
    </>
  );
}
