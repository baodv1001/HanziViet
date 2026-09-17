import { useEffect, useState } from 'react';
import { loadExamples } from '../context/VocabContext.jsx';

/** Câu ví dụ của một từ: null = đang tải, [] = không có. */
export default function useExamples(word) {
  const [list, setList] = useState(null);
  useEffect(() => {
    let alive = true;
    setList(null);
    if (!word) return;
    loadExamples(word.level)
      .then((all) => alive && setList(all[word.hanzi] || []))
      .catch(() => alive && setList([]));
    return () => {
      alive = false;
    };
  }, [word]);
  return list;
}
