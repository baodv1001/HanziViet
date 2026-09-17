import { useLang } from '../context/LangContext.jsx';

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <span>HanziViet · {t.footer}</span>
        <span>© {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
