import { useLang } from '../context/LangContext.jsx';
import { LEVELS } from '../i18n.js';

/**
 * Bộ lọc nhanh: chip cấp HSK (chọn nhiều) + loại từ.
 * levels: Set<number> (rỗng = tất cả), pos: string ('' = tất cả)
 */
export default function Filters({ levels, onLevels, pos, onPos, posOptions, counts }) {
  const { t, lang } = useLang();
  const toggleLevel = (l) => {
    const next = new Set(levels);
    if (next.has(l)) next.delete(l);
    else next.add(l);
    onLevels(next);
  };
  return (
    <div className="filters">
      <div className="chips" role="group" aria-label={t.level}>
        <button className={`chip-btn ${levels.size === 0 ? 'is-active' : ''}`} onClick={() => onLevels(new Set())}>
          {t.allLevels}
        </button>
        {LEVELS.map((l) => (
          <button key={l} className={`chip-btn chip-btn--${l} ${levels.has(l) ? 'is-active' : ''}`} onClick={() => toggleLevel(l)}>
            HSK {l}
            {counts && <span className="chip-btn__count">{counts[l] || 0}</span>}
          </button>
        ))}
      </div>
      <select className="select" value={pos} onChange={(e) => onPos(e.target.value)} aria-label={t.posLabel}>
        <option value="">{t.allPos}</option>
        {posOptions.map(([vi, en]) => (
          <option key={vi} value={vi}>
            {lang === 'vi' ? vi : en}
          </option>
        ))}
      </select>
    </div>
  );
}
