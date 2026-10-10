import { Link } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';
import './OfpPage.css';

export default function OfpPage() {
  return (
    <div className="ofp-page fade-in">
      <header className="page-header">
        <Link to="/" className="back-link">← Назад</Link>
        <h1 className="date-title">ОФП</h1>
      </header>

      <Link
        to="/ofp/joint-gym"
        target="_blank"
        rel="noopener noreferrer"
        className="card ofp-module ofp-module-link"
        style={{ display: 'block', textDecoration: 'none' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Суставная гимнастика ↗</h2>
          <span className="status-badge planned">открыть видео</span>
        </div>
        <p className="text-secondary">15 мин · Ежедневный комплекс</p>
      </Link>

      <section className="card ofp-module">
        <h2>Пресс</h2>
        <p className="text-secondary">10 мин · 50/10</p>
        <span className="status-badge planned">запланировано</span>
      </section>

      <section className="card ofp-module">
        <h2>Переменный блок</h2>
        <p className="text-secondary">10 мин · ЛФК ТБС</p>
        <span className="status-badge planned">запланировано</span>
      </section>

      <BottomNav />
    </div>
  );
}