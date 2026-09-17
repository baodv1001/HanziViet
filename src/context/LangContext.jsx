import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { STRINGS } from '../i18n.js';

const LangContext = createContext(null);
const KEY = 'hanziviet-lang';

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === 'vi' || saved === 'en') return saved;
    } catch {
      /* bỏ qua */
    }
    return navigator.language?.toLowerCase().startsWith('vi') ? 'vi' : 'vi';
  });

  useEffect(() => {
    try {
      localStorage.setItem(KEY, lang);
    } catch {
      /* bỏ qua */
    }
    document.documentElement.lang = lang;
  }, [lang]);

  const toggle = useCallback(() => setLang((l) => (l === 'vi' ? 'en' : 'vi')), []);
  const value = useMemo(() => ({ lang, setLang, toggle, t: STRINGS[lang] }), [lang, toggle]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
