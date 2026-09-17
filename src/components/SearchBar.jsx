import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVocab } from '../context/VocabContext.jsx';
import { useLang } from '../context/LangContext.jsx';
import { searchWords } from '../lib/search.js';
import { wordPath } from '../lib/routes.js';

/**
 * Ô tìm kiếm: gõ pinyin (không cần dấu), chữ Hán hoặc nghĩa.
 * Hiện gợi ý ngay bên dưới (tuỳ chọn); Enter mở kết quả khớp nhất.
 */
export default function SearchBar({ value, onChange, autoFocus = false, showSuggestions = true }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const boxRef = useRef(null);
  const { index } = useVocab();
  const { t, lang } = useLang();
  const suggestions = value.trim() && showSuggestions && index ? searchWords(index, value).slice(0, 8) : [];

  useEffect(() => {
    const onDoc = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => setActive(0), [value]);

  const go = (word) => {
    setOpen(false);
    navigate(wordPath(word));
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !suggestions.length) {
      const first = index && value.trim() ? searchWords(index, value)[0] : null;
      if (first) go(first);
      return;
    }
    if (!suggestions.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => (a + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => (a - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(suggestions[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="search" ref={boxRef}>
      <div className="search__field">
        <svg className="search__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="text"
          value={value}
          autoFocus={autoFocus}
          placeholder={t.searchPlaceholder}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          spellCheck={false}
        />
        {value && (
          <button className="search__clear" onClick={() => onChange('')} aria-label="Clear">
            ×
          </button>
        )}
      </div>
      {open && suggestions.length > 0 && (
        <ul className="search__suggest">
          {suggestions.map((w, i) => (
            <li
              key={w.hanzi}
              className={i === active ? 'is-active' : ''}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                go(w);
              }}
            >
              <span className="hanzi">{w.hanzi}</span>
              <span className="pinyin">{w.pinyin}</span>
              <span className="vi">{(lang === 'vi' && w.vi) || w.en}</span>
              <span className="lvl">HSK {w.level}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
