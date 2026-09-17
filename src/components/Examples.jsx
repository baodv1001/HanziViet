import { speak } from '../lib/speech.js';
import useExamples from '../hooks/useExamples.js';
import { useLang } from '../context/LangContext.jsx';

/** Câu ví dụ (2–3 câu): chữ Hán (tô đỏ từ đang xem), pinyin, bản dịch, nút nghe. */
export default function Examples({ word }) {
  const list = useExamples(word);
  const { t, lang } = useLang();
  return (
    <section className="panel">
      <h2 className="panel__title">{t.examples}</h2>
      {list === null && <div className="muted">{t.loading}</div>}
      {list && list.length === 0 && <div className="muted">{t.noExamples}</div>}
      {list && list.length > 0 && (
        <ol className="examples">
          {list.map((ex, i) => {
            const parts = ex.zh.split(word.hanzi);
            const trans = lang === 'vi' ? ex.vi || ex.en : ex.en || ex.vi;
            return (
              <li key={i} className="example">
                <div className="example__zh">
                  {parts.map((p, j) => (
                    <span key={j}>
                      {p}
                      {j < parts.length - 1 && <mark>{word.hanzi}</mark>}
                    </span>
                  ))}
                  <button className="icon-btn icon-btn--sm" onClick={() => speak(ex.zh)} aria-label={t.listen} title={t.listen}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 5 6 9H2v6h4l5 4V5z" />
                      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                    </svg>
                  </button>
                </div>
                <div className="example__py">{ex.py}</div>
                <div className="example__vi">{trans}</div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
