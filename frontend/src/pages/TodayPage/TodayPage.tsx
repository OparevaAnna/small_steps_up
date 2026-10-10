import './TodayPage.css';

import TodayHeader from './components/TodayHeader';
import OfpSection from './components/OfpSection';
import FocusDay from './components/FocusDay';
import FocusWeek from './components/FocusWeek';
import WeekPathSection from './components/WeekPathSection';
import BottomNav from './components/BottomNav';

export default function TodayPage() {
  return (
    <div className="today-page fade-in">
      <TodayHeader />
      <div className="today-columns">
        <OfpSection />
        <div className="right-column">
          <FocusDay />
          <FocusWeek />
        </div>
      </div>
      <WeekPathSection />
      <BottomNav />
    </div>
  );
}
