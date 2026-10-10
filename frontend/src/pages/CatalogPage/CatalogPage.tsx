import { Link } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';
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

      <BottomNav />
    </div>
  );
}