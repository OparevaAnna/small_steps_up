import { Link } from 'react-router-dom';
import './WeekPathSection.css';

export default function WeekPathSection() {
  const days = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];

  return (
    <section className="coverage card slide-up" style={{ animationDelay: '0.4s' }}>
      <Link to="/week" className="section-link">
        <h3 className="section-title">Путь недели</h3>
        <span className="arrow">→</span>
      </Link>
      <div className="week-strip">
        {days.map((day, i) => (
          <div key={day} className={`week-day ${i === 0 ? 'today' : ''} ${i === 6 ? 'rest' : ''}`}>
            <span className="day-letter">{day}</span>
            <div className="activity-ring">
              <div
                className="ring-fill"
                style={
                  {
                    '--progress': `${i === 3 ? '60' : i === 0 ? '30' : '0'}%`,
                  } as React.CSSProperties
                }
              />
            </div>
            <span
              className={`day-load ${i === 0 || i === 3 ? 'heavy' : i === 6 ? 'rest' : 'moderate'}`}
            >
              {i === 0
                ? 'вело'
                : i === 1
                  ? 'зал-верх'
                  : i === 2
                    ? 'вело'
                    : i === 3
                      ? 'инт'
                      : i === 4
                        ? 'лест'
                        : i === 5
                          ? 'вело'
                          : 'восст'}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
