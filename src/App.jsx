import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import WordPage from './pages/WordPage.jsx';
import { useVocab } from './context/VocabContext.jsx';
import { useLang } from './context/LangContext.jsx';

function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <button
      className={`scroll-top${visible ? ' visible' : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Lên đầu trang"
      title="Lên đầu trang"
    >
      ↑
    </button>
  );
}

export default function App() {
  const { words, error } = useVocab();
  const { t } = useLang();
  return (
    <div className="app">
      <Header />
      <main className="container">
        {error ? (
          <div className="empty">Không tải được dữ liệu từ vựng / Could not load vocabulary data.</div>
        ) : !words ? (
          <div className="empty">{t.loadingData}</div>
        ) : (
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tu-vung/:hanzi" element={<WordPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
