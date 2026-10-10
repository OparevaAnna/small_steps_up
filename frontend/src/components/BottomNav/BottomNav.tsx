import { NavLink } from 'react-router-dom';
import './BottomNav.css';

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Основная навигация">
      <NavLink
        to="/"
        end
        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
      >
        Сегодня
      </NavLink>
      <NavLink
        to="/week"
        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
      >
        Неделя
      </NavLink>
      <NavLink
        to="/ofp"
        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
      >
        ОФП
      </NavLink>
      <NavLink
        to="/catalog"
        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
      >
        Каталог
      </NavLink>
      <NavLink
        to="/profile"
        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
      >
        Профиль
      </NavLink>
    </nav>
  );
}
