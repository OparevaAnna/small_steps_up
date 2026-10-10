import { Link } from 'react-router-dom';
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

      <nav className="bottom-nav">
        <Link to="/" className="nav-link">Сегодня</Link>
        <Link to="/week" className="nav-link">Неделя</Link>
        <Link to="/ofp" className="nav-link">ОФП</Link>
        <Link to="/catalog" className="nav-link">Каталог</Link>
        <Link to="/profile" className="nav-link active">Профиль</Link>
      </nav>
    </div>
  );
}