import { Link, useParams } from 'react-router-dom';
import './ExecutionPage.css';

export default function ExecutionPage() {
  const { blockType } = useParams();
  return (
    <div className="execution-page fade-in">
      <div className="execution-content">
        <p className="text-secondary">Выполнение: {blockType}</p>
        <div className="timer-display">
          <span className="timer-phase">Работа</span>
          <span className="timer-time">00:50</span>
          <span className="timer-interval">1/10</span>
        </div>
        <div className="execution-actions">
          <button className="btn-primary">Пауза</button>
          <Link to="/" className="back-link">Завершить</Link>
        </div>
        <button className="discomfort-btn">Остановить из-за дискомфорта</button>
      </div>
    </div>
  );
}