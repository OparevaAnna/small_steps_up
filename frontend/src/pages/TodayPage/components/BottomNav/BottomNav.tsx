import { Link } from 'react-router-dom';
import './BottomNav.css';

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      <Link to="/" className="nav-link active">
        Сегодня
      </Link>
      <Link to="/week" className="nav-link">
        Неделя
      </Link>
      <Link to="/ofp" className="nav-link">
        ОФП
      </Link>
      <Link to="/catalog" className="nav-link">
        Каталог
      </Link>
      <Link to="/profile" className="nav-link">
        Профиль
      </Link>
    </nav>
  );
}
