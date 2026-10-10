import { Link } from 'react-router-dom';
import './WeekPage.css';

export default function WeekPage() {
  return (
    <div className="week-page fade-in">
      <header className="page-header">
        <Link to="/" className="back-link">← Назад</Link>
        <h1 className="date-title">Неделя</h1>
      </header>

      <div className="week-days">
        {[
          { day: 'Понедельник', workout: 'Зал — низ тела', load: 'тяжёлый', status: 'planned' },
          { day: 'Вторник', workout: 'Велостанок — легко', load: 'умеренный', status: 'planned' },
          { day: 'Среда', workout: 'Зал — верх тела', load: 'умеренный', status: 'planned' },
          { day: 'Четверг', workout: 'Велостанок — интервалы', load: 'тяжёлый', status: 'planned' },
          { day: 'Пятница', workout: 'Лестница', load: 'умеренный', status: 'planned' },
          { day: 'Суббота', workout: 'Велостанок — длительно', load: 'умеренный', status: 'planned' },
          { day: 'Воскресенье', workout: 'Восстановительный день', load: 'rest', status: 'planned' },
        ].map((item, i) => (
          <div key={item.day} className={`day-row card ${item.load === 'rest' ? 'rest-day' : ''}`}>
            <div className="day-info">
              <span className="day-name-day">{item.day}</span>
              <span className={`day-load-badge ${item.load}`}>{item.load}</span>
            </div>
            <span className="day-workout">{item.workout}</span>
            <span className={`day-status ${item.status}`}>запланировано</span>
          </div>
        ))}
      </div>

      <nav className="bottom-nav">
        <Link to="/" className="nav-link">Сегодня</Link>
        <Link to="/week" className="nav-link active">Неделя</Link>
        <Link to="/ofp" className="nav-link">ОФП</Link>
        <Link to="/catalog" className="nav-link">Каталог</Link>
        <Link to="/profile" className="nav-link">Профиль</Link>
      </nav>
    </div>
  );
}