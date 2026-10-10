import './TodayHeader.css';

export default function TodayHeader() {
  const today = new Date();
  const dateStr = today.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  });

  return (
    <header className="today-header">
      <h1 className="brand">Small Steps Up</h1>
      <p className="slogan">Маленькие шаги к большой высоте.</p>
      <time className="date-title date-display">{dateStr}</time>
    </header>
  );
}
