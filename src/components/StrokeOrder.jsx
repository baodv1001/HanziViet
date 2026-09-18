import { useEffect, useRef, useState } from 'react';
import HanziWriter from 'hanzi-writer';
import { charDataLoader } from '../lib/strokes.js';
import { useTheme } from '../context/ThemeContext.jsx';

const SPEEDS = [
  { label: 'Chậm', value: 0.5 },
  { label: 'Vừa', value: 1 },
  { label: 'Nhanh', value: 2 },
];

function writerColors(theme) {
  if (theme === 'dark') {
    return {
      strokeColor: '#f5f5f4',
      outlineColor: '#3f3f46',
      radicalColor: '#f97316',
      drawingColor: '#38bdf8',
      highlightColor: '#38bdf8',
    };
  }
  return {
    strokeColor: '#ff0000',
    outlineColor: '#c8c8cc',
    radicalColor: '#ff0000',
    drawingColor: '#ff0000',
    highlightColor: '#ff0000',
  };
}

export default function StrokeOrder({ chars }) {
  const { theme } = useTheme();
  const [mode, setMode] = useState('watch');
  const [speed, setSpeed] = useState(1);
  const [showOutline, setShowOutline] = useState(true);
  const [animating, setAnimating] = useState(false);
  const [restartKey, setRestartKey] = useState(0);

  const boxRefs = useRef([]);
  const writersRef = useRef([]);
  const stopRef = useRef(false);

  const colors = writerColors(theme);

  useEffect(() => {
    writersRef.current = chars.map((ch, i) => {
      const el = boxRefs.current[i];
      el.innerHTML = '';
      return HanziWriter.create(el, ch, {
        width: 220,
        height: 220,
        padding: 14,
        showOutline,
        showCharacter: false,
        strokeAnimationSpeed: speed,
        delayBetweenStrokes: 350 / speed,
        delayBetweenLoops: 1200,
        ...colors,
        drawingWidth: 8,
        charDataLoader,
        renderer: 'svg',
      });
    });
    return () => {
      stopRef.current = true;
      writersRef.current.forEach((w) => {
        try { w.cancelQuiz(); w.hideCharacter({ duration: 0 }); } catch { /* ignore */ }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chars, speed, showOutline, theme]);

  // Watch mode: all characters animate simultaneously, then loop
  useEffect(() => {
    if (mode !== 'watch') return;
    stopRef.current = false;
    const writers = writersRef.current;
    let cancelled = false;

    const run = async () => {
      writers.forEach((w) => w.hideCharacter({ duration: 0 }));
      while (!cancelled && !stopRef.current) {
        setAnimating(true);
        await Promise.all(
          writers.map(
            (w) =>
              new Promise((resolve) => {
                w.hideCharacter({ duration: 0 });
                w.animateCharacter({ onComplete: resolve });
              }),
          ),
        );
        if (cancelled) return;
        setAnimating(false);
        await new Promise((r) => setTimeout(r, 1000));
        writers.forEach((w) => w.hideCharacter({ duration: 300 }));
        await new Promise((r) => setTimeout(r, 400));
      }
    };
    run();
    return () => {
      cancelled = true;
      stopRef.current = true;
      setAnimating(false);
      writers.forEach((w) => { try { w.cancelQuiz(); } catch { /* ignore */ } });
    };
  }, [mode, chars, speed, showOutline, theme, restartKey]);

  // Practice mode: quiz each character in sequence
  useEffect(() => {
    if (mode !== 'practice') return;
    stopRef.current = true;
    const writers = writersRef.current;
    let cancelled = false;
    writers.forEach((w) => w.hideCharacter({ duration: 0 }));

    const quizAt = (i) => {
      if (cancelled || i >= writers.length) return;
      writers[i].quiz({
        showHintAfterMisses: 2,
        onComplete: () => setTimeout(() => quizAt(i + 1), 600),
      });
    };
    quizAt(0);
    return () => {
      cancelled = true;
      writers.forEach((w) => { try { w.cancelQuiz(); } catch { /* ignore */ } });
    };
  }, [mode, chars, restartKey, speed, showOutline, theme]);

  const restart = () => setRestartKey((k) => k + 1);

  return (
    <section id="strokes" className="panel strokes">
      <div className="panel__head">
        <h2 className="panel__title">Thứ tự viết nét chữ</h2>
        <div className="tabs">
          <button className={mode === 'watch' ? 'is-active' : ''} onClick={() => setMode('watch')}>
            Xem viết
          </button>
          <button className={mode === 'practice' ? 'is-active' : ''} onClick={() => setMode('practice')}>
            Luyện tập
          </button>
        </div>
      </div>

      <div className="strokes__boxes">
        {chars.map((ch, i) => (
          <div key={`${ch}-${i}`} className={`stroke-box ${animating && mode === 'watch' ? 'is-animating' : ''}`}>
            <div className="stroke-box__grid" aria-hidden="true">
              <span className="h" />
              <span className="v" />
              <span className="d1" />
              <span className="d2" />
            </div>
            <div className="stroke-box__canvas" ref={(el) => (boxRefs.current[i] = el)} />
            <div className="stroke-box__label">{ch}</div>
          </div>
        ))}
      </div>

      <div className="strokes__controls">
        <div className="seg">
          {SPEEDS.map((s) => (
            <button key={s.value} className={speed === s.value ? 'is-active' : ''} onClick={() => setSpeed(s.value)}>
              {s.label}
            </button>
          ))}
        </div>
        <label className="toggle">
          <input type="checkbox" checked={showOutline} onChange={(e) => setShowOutline(e.target.checked)} />
          Hiện nét mờ
        </label>
        <button className="btn" onClick={restart}>
          ↻ {mode === 'watch' ? 'Viết lại' : 'Làm lại'}
        </button>
      </div>
      <p className="muted strokes__hint">
        {mode === 'watch'
          ? 'Tất cả chữ viết đồng thời, lặp lại liên tục – không cần bấm.'
          : 'Dùng chuột hoặc ngón tay viết từng nét theo đúng thứ tự. Sai 2 lần sẽ hiện gợi ý.'}
      </p>
    </section>
  );
}
