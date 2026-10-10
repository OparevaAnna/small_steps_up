import { createPortal } from 'react-dom';
import './ExerciseModal.css';

// Описываем строгие типы для пропсов модалки
interface BackendExercise {
  id: string;
  title: string;
  short_description: string;
  is_unilateral: boolean;
  dose: string;
  purpose: string[];
  how_to: string[];
}

interface ExerciseModalProps {
  exercise: BackendExercise | null;
  zIndex: number | null;
  onClose: () => void;
}

export default function ExerciseModal({ exercise, zIndex, onClose }: ExerciseModalProps) {
  // Если упражнение не выбрано, ничего не рендерим
  if (!exercise) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose} style={zIndex ? { zIndex } : undefined}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{exercise.title}</h3>
          <button className="close-modal-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-badge">{exercise.dose}</div>

          <p className="modal-description">{exercise.short_description}</p>

          <h4>💡 Цель и воздействие</h4>
          <ul className="modal-purpose-list">
            {exercise.purpose.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>

          <h4>🛠️ Техника выполнения</h4>
          <ol className="modal-howto-list">
            {exercise.how_to.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')!, // Выталкиваем в корень body
  );
}
