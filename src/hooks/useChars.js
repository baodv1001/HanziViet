import { useEffect, useState } from 'react';
import { loadChars } from '../context/VocabContext.jsx';

/** Bảng { chữ: [âm Hán Việt, nghĩa] }; null khi đang tải. */
export default function useChars() {
  const [chars, setChars] = useState(null);
  useEffect(() => {
    let alive = true;
    loadChars().then((c) => alive && setChars(c));
    return () => {
      alive = false;
    };
  }, []);
  return chars;
}
