import './FocusWeek.css';

export default function FocusWeek() {
  return (
    <section className="focus-week card slide-up" style={{ animationDelay: '0.3s' }}>
      <h3 className="section-title">Фокус недели</h3>
      <div className="coverage-grid">
        <span className="coverage-item done">✓ Шея</span>
        <span className="coverage-item done">✓ Спина</span>
        <span className="coverage-item">○ Подтягивание</span>
        <span className="coverage-item">○ Складка</span>
        <span className="coverage-item">○ Баланс</span>
        <span className="coverage-item warning">! Стопы</span>
      </div>
    </section>
  );
}
