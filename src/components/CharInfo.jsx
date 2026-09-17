import { Link } from 'react-router-dom';
import useCharData from '../hooks/useCharData.js';
import useChars from '../hooks/useChars.js';
import { useVocab } from '../context/VocabContext.jsx';
import { useLang } from '../context/LangContext.jsx';
import { wordPath } from '../lib/routes.js';
import { splitSyllables } from '../lib/pinyin.js';

function CharRow({ char, pinyin, info }) {
  const data = useCharData(char);
  const { byHanzi } = useVocab();
  const { t, lang } = useLang();
  const single = byHanzi.get(char);
  return (
    <li className="char-row">
      {single ? (
        <Link to={wordPath(single)} className="char-row__hanzi" title={single.pinyin}>
          {char}
        </Link>
      ) : (
        <span className="char-row__hanzi">{char}</span>
      )}
      <div className="char-row__info">
        <div className="char-row__pinyin">{single?.pinyin || pinyin}</div>
        <div className="char-row__vi">
          {info ? (
            <>
              <b>{info[0]}</b>
              {lang === 'vi' && info[1] ? ` · ${info[1]}` : single ? ` · ${single.en}` : ''}
            </>
          ) : single ? (
            <>
              <b>{single.hv}</b> · {(lang === 'vi' && single.vi) || single.en}
            </>
          ) : (
            <span className="muted">{t.component}</span>
          )}
        </div>
        <div className="char-row__meta">
          {data === null && t.loading}
          {data === undefined && t.noStrokeData}
          {data && t.strokeMeta(data.strokes.length, data.radStrokes?.length ?? 0)}
        </div>
      </div>
    </li>
  );
}

/** Thông tin từng chữ trong từ: pinyin, Hán Việt, nghĩa, số nét. */
export default function CharInfo({ chars, word }) {
  const table = useChars();
  const { t } = useLang();
  const syls = splitSyllables(word?.pinyinSpaced || word?.pinyin || '');
  return (
    <section className="panel">
      <h2 className="panel__title">{t.charsInWord}</h2>
      <ul className="char-list">
        {chars.map((c, i) => (
          <CharRow key={`${c}-${i}`} char={c} pinyin={syls[i] || ''} info={table?.[c]} />
        ))}
      </ul>
    </section>
  );
}
