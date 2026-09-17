import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { wordPath } from '../lib/routes.js';
import { useLang } from '../context/LangContext.jsx';

const PAGE = 96;

/** Lưới kết quả: pinyin luôn màu đỏ, chữ Hán lớn, nghĩa bên dưới, nhãn cấp HSK. Hiện dần theo trang. */
export default function WordList({ words, query }) {
  const { t, lang } = useLang();
  const [limit, setLimit] = useState(PAGE);
  useEffect(() => setLimit(PAGE), [words]);

  if (!words.length) {
    return <div className="empty">{t.notFound(query)}</div>;
  }
  const shown = words.slice(0, limit);
  return (
    <>
      <ul className="word-grid">
        {shown.map((w) => (
          <li key={w.hanzi}>
            <Link to={wordPath(w)} className="word-card">
              <span className="word-card__top">
                <span className="word-card__pinyin">{w.pinyin}</span>
                <span className={`lvl lvl--${w.level}`}>HSK {w.level}</span>
              </span>
              <span className="word-card__hanzi">{w.hanzi}</span>
              <span className="word-card__vi">{(lang === 'vi' && w.vi) || w.en}</span>
              <span className="word-card__pos">{lang === 'vi' ? w.pos : w.posEn}</span>
            </Link>
          </li>
        ))}
      </ul>
      {limit < words.length && (
        <div className="more">
          <button className="btn" onClick={() => setLimit((l) => l + PAGE * 2)}>
            {t.showMore} ({words.length - limit})
          </button>
        </div>
      )}
    </>
  );
}
