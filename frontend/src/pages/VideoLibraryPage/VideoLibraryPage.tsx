import { Link } from 'react-router-dom';
import './VideoLibraryPage.css';

export default function VideoLibraryPage() {
  return (
    <div className="video-library-page fade-in">
      <header className="page-header">
        <Link to="/" className="back-link">← Назад</Link>
        <h1 className="date-title">Библиотека видео</h1>
      </header>
      <p className="text-secondary">Видео для суставной гимнастики</p>
    </div>
  );
}