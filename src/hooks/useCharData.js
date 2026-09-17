import { useEffect, useState } from 'react';
import { loadCharData } from '../lib/strokes.js';

/** Dữ liệu nét của một chữ (strokes, medians, radStrokes). null = đang tải, undefined = lỗi. */
export default function useCharData(char) {
  const [data, setData] = useState(null);
  useEffect(() => {
    let alive = true;
    setData(null);
    loadCharData(char)
      .then((d) => alive && setData(d))
      .catch(() => alive && setData(undefined));
    return () => {
      alive = false;
    };
  }, [char]);
  return data;
}
