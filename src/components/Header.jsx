import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext.jsx';

export default function Header() {
  const { t, lang, toggle } = useLang();
  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="brand">
          <span className="brand__logo">汉</span>
          <span className="brand__name">HanziViet</span>
        </Link>
        <nav className="nav">
          <Link to="/">{t.dictionary}</Link>
          <span className="nav__badge">HSK 1–6</span>
          <button className="lang-btn" onClick={toggle} title={t.langTitle} aria-label={t.langTitle}>
            <span className={lang === 'vi' ? 'is-active' : ''}>VI</span>
            <span className="lang-btn__sep">/</span>
            <span className={lang === 'en' ? 'is-active' : ''}>EN</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
