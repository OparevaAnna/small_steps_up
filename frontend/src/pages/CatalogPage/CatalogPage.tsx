import { Link } from 'react-router-dom';
import './CatalogPage.css';

export default function CatalogPage() {
  return (
    <div className="catalog-page fade-in">
      <header className="page-header">
        <Link to="/" className="back-link">← Назад</Link>
        <h1 className="date-title">Каталог упражнений</h1>
      </header>

      <p className="text-secondary" style={{marginBottom: 'var(--spacing-md)'}}>
        Каталог с фильтрами появится здесь после подключения к API
      </p>

      <nav className="bottom-nav">
        <Link to="/" className="nav-link">Сегодня</Link>
        <Link to="/week" className="nav-link">Неделя</Link>
        <Link to="/ofp" className="nav-link">ОФП</Link>
        <Link to="/catalog" className="nav-link active">Каталог</Link>
        <Link to="/profile" className="nav-link">Профиль</Link>
      </nav>
    </div>
  );
}