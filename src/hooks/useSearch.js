import { useMemo } from 'react';
import { useVocab } from '../context/VocabContext.jsx';
import { searchWords } from '../lib/search.js';

/** Kết quả tìm kiếm theo từ khoá + bộ lọc (cấp HSK, loại từ). */
export default function useSearch(query, filters) {
  const { index } = useVocab();
  const levelKey = filters?.levels ? [...filters.levels].sort().join(',') : '';
  const pos = filters?.pos || '';
  return useMemo(() => {
    if (!index) return [];
    return searchWords(index, query, { levels: filters?.levels, pos });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, query, levelKey, pos]);
}
