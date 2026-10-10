import { Link } from 'react-router-dom';
import './NotFoundPage.css';

export default function NotFoundPage() {
  return (
    <div className="not-found-page fade-in">
      <h1 className="date-title">404</h1>
      <p className="text-secondary">Страница не найдена</p>
      <Link to="/" className="btn-primary" style={{marginTop: 'var(--spacing-lg)'}}>На главную</Link>
    </div>
  );
}