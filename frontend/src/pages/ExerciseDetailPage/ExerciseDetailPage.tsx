import { Link, useParams } from 'react-router-dom';
import './ExerciseDetailPage.css';

export default function ExerciseDetailPage() {
  const { id } = useParams();
  return (
    <div className="exercise-detail-page fade-in">
      <header className="page-header">
        <Link to="/catalog" className="back-link">← Каталог</Link>
      </header>
      <p className="text-secondary">Упражнение #{id}</p>
      <p className="text-muted">Детальная карточка появится после подключения API</p>
    </div>
  );
}