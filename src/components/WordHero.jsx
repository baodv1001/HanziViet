import { useState } from 'react';
import { toneNumbers, TONE_NAMES } from '../lib/pinyin.js';
import { hanChars } from '../lib/strokes.js';
import { speak } from '../lib/speech.js';
import { useLang } from '../context/LangContext.jsx';

/** Thẻ đầu trang: pinyin đỏ, chữ Hán lớn, nghĩa, âm Hán Việt, thông tin nhanh. */
export default function WordHero({ word, strokeCount }) {
  const { t, lang } = useLang();
  const [copied, setCopied] = useState(false);
  const tones = toneNumbers(word.pinyinSpaced || word.pinyin);
  const chars = hanChars(word.hanzi);
  const meaning = lang === 'vi' ? word.vi || word.en : word.en;

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: word.hanzi, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch {
      /* người dùng huỷ */
    }
  };

  return (
    <section className="hero">
      <div className="hero__grid" aria-hidden="true" />
      <div className="hero__top">
        <span className="chip">📖 {t.chineseVocab}</span>
        <span className="chip chip--gold">{lang === 'vi' ? word.pos : word.posEn}</span>
        <span className={`chip chip--level lvl--${word.level}`}>HSK {word.level}</span>
        <button
          className="icon-btn stroke-jump-btn"
          onClick={() => document.getElementById('strokes')?.scrollIntoView({ behavior: 'smooth' })}
          title={lang === 'vi' ? 'Xem cách viết chữ' : 'Stroke order'}
          aria-label={lang === 'vi' ? 'Xem cách viết chữ' : 'Stroke order'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </button>
      </div>

      <div className="hero__pinyin">{word.pinyinSpaced || word.pinyin}</div>

      <div className="hero__hanzi-row">
        <h1 className="hero__hanzi">{word.hanzi}</h1>
        <button className="icon-btn" onClick={() => speak(word.hanzi)} title={t.listen} aria-label={t.listen}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5 6 9H2v6h4l5 4V5z" />
            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            <path d="M18.5 5.5a9 9 0 0 1 0 13" />
          </svg>
        </button>
        {word.trad && (
          <span className="hero__trad" title={t.traditional}>
            {word.trad}
          </span>
        )}
      </div>

      <div className="hero__meanings">
        <div className="meaning">
          <div className="meaning__label">{t.meaning}</div>
          <div className="meaning__value">{meaning}</div>
          {lang === 'vi' && word.vi && word.en && <div className="meaning__sub">{word.en}</div>}
        </div>
        <div className="meaning meaning--hv">
          <div className="meaning__label">{t.sinoViet}</div>
          <div className="meaning__value">{word.hv}</div>
          {word.classifiers && (
            <div className="meaning__sub">
              {t.classifier}: <span className="hanzi-inline">{word.classifiers}</span>
            </div>
          )}
        </div>
      </div>

      <div className="hero__bottom">
        <div className="hero__stats">
          <span className="chip">{t.chars(chars.length)}</span>
          <span className="chip">{strokeCount != null ? t.strokes(strokeCount) : t.strokesLoading}</span>
          <span className="chip">
            {t.tones}{' '}
            {tones.map((tn, i) => (
              <span key={i} className={`tone tone--${tn}`}>
                {tn} {TONE_NAMES[tn]}
              </span>
            ))}
          </span>
        </div>
        <button className="btn btn--ghost" onClick={share}>
          {copied ? `✓ ${t.copied}` : `⤴ ${t.share}`}
        </button>
      </div>
    </section>
  );
}
