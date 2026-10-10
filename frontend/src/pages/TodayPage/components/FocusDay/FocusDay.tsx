import { Link } from 'react-router-dom';
import './FocusDay.css';

export default function FocusDay() {
  return (
    <section className="focus-day card slide-up" style={{ animationDelay: '0.2s' }}>
      <h3 className="section-title">Фокус дня</h3>
      <p className="recovery-status">Хорошее восстановление · 72%</p>
      <div className="main-workout">
        <span className="workout-type">Велостанок</span>
        <span className="workout-goal">Аэробная база · 60 минут</span>
        <Link to="/execute/main-workout" className="btn-primary">
          Начать
        </Link>
      </div>
    </section>
  );
}
