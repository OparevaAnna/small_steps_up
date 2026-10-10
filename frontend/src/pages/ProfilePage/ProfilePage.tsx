import { Link } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';
import './ProfilePage.css';

export default function ProfilePage() {
  return (
    <div className="profile-page fade-in">
      <header className="page-header">
        <Link to="/" className="back-link">← Назад</Link>
        <h1 className="date-title">Профиль</h1>
      </header>

      <section className="card">
        <h2>mauta</h2>
        <p className="text-secondary">Трейлраннинг · Средний</p>
      </section>

      <section className="card">
        <h3>Настройки</h3>
        <p className="text-muted">Редактирование профиля появится после подключения API</p>
      </section>

      <BottomNav />
    </div>
  );
}