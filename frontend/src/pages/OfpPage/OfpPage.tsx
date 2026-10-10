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

      <section className="card ofp-module">
        <h2>Суставная гимнастика</h2>
        <p className="text-secondary">15 мин</p>
        <span className="status-badge planned">запланировано</span>
      </section>

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