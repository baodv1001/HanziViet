import { useEffect, useRef, useState } from 'react';
import HanziWriter from 'hanzi-writer';
import { charDataLoader } from '../lib/strokes.js';

const SPEEDS = [
  { label: 'Chậm', value: 0.5 },
  { label: 'Vừa', value: 1 },
  { label: 'Nhanh', value: 2 },
];

/**
 * Thứ tự viết nét chữ – TỰ ĐỘNG chạy khi mở trang, viết lần lượt từng chữ rồi lặp lại.
 * Chế độ "Luyện tập": người dùng tự viết bằng chuột/ngón tay, có gợi ý khi sai.
 */
export default function StrokeOrder({ chars }) {
  const [mode, setMode] = useState('watch'); // 'watch' | 'practice'
  const [speed, setSpeed] = useState(1);
  const [showOutline, setShowOutline] = useState(true);
  const [current, setCurrent] = useState(0);
  const [restartKey, setRestartKey] = useState(0);

  const boxRefs = useRef([]);
  const writersRef = useRef([]);
  const stopRef = useRef(false);

  // Khởi tạo writer cho từng chữ
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
        strokeColor: '#f5f5f4',
        radicalColor: '#f97316',
        outlineColor: '#3f3f46',
        drawingColor: '#38bdf8',
        highlightColor: '#38bdf8',
        drawingWidth: 8,
        charDataLoader,
        renderer: 'svg',
      });
    });
    return () => {
      stopRef.current = true;
      writersRef.current.forEach((w) => {
        try {
          w.cancelQuiz();
          w.hideCharacter({ duration: 0 });
        } catch {
          /* bỏ qua */
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chars, speed, showOutline]);

  // Chế độ xem: tự động viết lần lượt từng chữ, xong quay lại từ đầu (không cần bấm gì)
  useEffect(() => {
    if (mode !== 'watch') return;
    stopRef.current = false;
    const writers = writersRef.current;
    let cancelled = false;

    const animateFrom = async (idx) => {
      for (let i = 0; i < writers.length; i++) writers[i].hideCharacter({ duration: 0 });
      let i = idx;
      while (!cancelled && !stopRef.current) {
        setCurrent(i);
        await new Promise((resolve) => {
          const w = writers[i];
          w.hideCharacter({ duration: 0 });
          w.animateCharacter({ onComplete: resolve });
        });
        if (cancelled) return;
        await new Promise((r) => setTimeout(r, 900));
        i = (i + 1) % writers.length;
        if (i === 0) {
          await new Promise((r) => setTimeout(r, 400));
          writers.forEach((w) => w.hideCharacter({ duration: 300 }));
          await new Promise((r) => setTimeout(r, 400));
        }
      }
    };
    animateFrom(0);
    return () => {
      cancelled = true;
      stopRef.current = true;
      writers.forEach((w) => {
        try {
          w.cancelQuiz();
        } catch {
          /* bỏ qua */
        }
      });
    };
  }, [mode, chars, speed, showOutline, restartKey]);

  // Chế độ luyện tập: quiz từng chữ, xong chữ này tự chuyển chữ kế
  useEffect(() => {
    if (mode !== 'practice') return;
    stopRef.current = true;
    const writers = writersRef.current;
    let cancelled = false;
    writers.forEach((w) => w.hideCharacter({ duration: 0 }));

    const quizAt = (i) => {
      if (cancelled || i >= writers.length) return;
      setCurrent(i);
      writers[i].quiz({
        showHintAfterMisses: 2,
        onComplete: () => setTimeout(() => quizAt(i + 1), 600),
      });
    };
    quizAt(0);
    return () => {
      cancelled = true;
      writers.forEach((w) => {
        try {
          w.cancelQuiz();
        } catch {
          /* bỏ qua */
        }
      });
    };
  }, [mode, chars, restartKey, speed, showOutline]);

  const restart = () => setRestartKey((k) => k + 1);

  return (
    <section className="panel strokes">
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
          <div key={`${ch}-${i}`} className={`stroke-box ${i === current ? 'is-current' : ''}`}>
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
          ? 'Animation tự chạy và lặp lại liên tục – không cần bấm.'
          : 'Dùng chuột hoặc ngón tay viết từng nét theo đúng thứ tự. Sai 2 lần sẽ hiện gợi ý.'}
      </p>
    </section>
  );
}
