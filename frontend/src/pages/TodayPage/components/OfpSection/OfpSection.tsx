import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { getMaxZIndex } from '../../../../helpers/getMaxZIndex';
import ExerciseModal from './components/exerciseModal/ExerciseModal';
import './OfpSection.css';
import AbsTimerModal from './components/absTimerModal/AbsTimerModal';
import { FALLBACK_BLOCKS, BackendExercise, WorkoutBlock } from '../../../../data/fallbackOfp';

type Variant = 35 | 50 | 70;

const VARIANT_LABELS: Record<Variant, string> = {
  35: 'Обязательный минимум',
  50: 'Оптимальный шаг',
  70: 'Максимальный фокус',
};

export default function OfpSection() {
  const today = new Date().toISOString().split('T')[0];
  const [variant, setVariant] = useState<Variant>(35);
  const [blocks, setBlocks] = useState<WorkoutBlock[]>([]);

  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [openBlockIds, setOpenBlockIds] = useState<number[]>([]); // Изначально пустой массив — все закрыты!
  const [selectedExercise, setSelectedExercise] = useState<BackendExercise | null>(null);
  const [stepsDone, setStepsDone] = useState(false);
  const [isAbsTimerOpen, setIsAbsTimerOpen] = useState(false);
  const [modalZIndex, setModalZIndex] = useState<number | null>(null);

  // Разделяем загрузку: общая первичная загрузка и фоновое обновление табов
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isContentUpdating, setIsContentUpdating] = useState(false);

  // 🕵️ ЭФФЕКТ: Загрузка плана тренировки при смене минут (Variant)
  useEffect(() => {
    async function loadWorkout() {
      setIsContentUpdating(true);

      try {
        const workoutRes = await fetch(`/api/ofp/daily-ofp?date=${today}&duration=${variant}`);
        if (workoutRes.ok) {
          const workoutData = await workoutRes.json();
          if (workoutData.blocks && workoutData.blocks.length > 0) {
            setBlocks(workoutData.blocks);
            return;
          }
        }
      } catch (err) {
        console.warn('API недоступен, используется локальный тренировочный план ОФП:', err);
      } finally {
        setIsContentUpdating(false);
        setIsInitialLoading(false);
      }

      // Фолбэк на подготовленную библиотеку упражнений
      setBlocks(FALLBACK_BLOCKS[variant] || FALLBACK_BLOCKS[35]);
    }

    loadWorkout();
  }, [today, variant]);

  // 🕵️ ЭФФЕКТ: Первичная загрузка прогресса (выполняется 1 раз при монтировании)
  useEffect(() => {
    async function loadProgress() {
      // Сначала читаем локальный кэш для моментального отклика
      try {
        const cached = localStorage.getItem(`ofp_progress_${today}`);
        if (cached) {
          const progressData = JSON.parse(cached);
          if (progressData.completedIds) setCompletedIds(progressData.completedIds);
          if (typeof progressData.stepsDone === 'boolean') setStepsDone(progressData.stepsDone);
          if (progressData.variant) setVariant(progressData.variant as Variant);
        }
      } catch {}

      // Затем синхронизируем с бэкендом при наличии соединения
      try {
        const progressRes = await fetch(`/api/ofp/progress?date=${today}`);
        if (progressRes.ok) {
          const progressData = await progressRes.json();
          if (progressData.completedIds) setCompletedIds(progressData.completedIds);
          if (typeof progressData.stepsDone === 'boolean') setStepsDone(progressData.stepsDone);
          if (progressData.variant) setVariant(progressData.variant as Variant);
        }
      } catch (err) {
        // Офлайн режим — прогресс сохраняется локально
      }
    }
    loadProgress();
  }, [today]);

  const saveProgress = async (updates: {
    completedIds?: string[];
    stepsDone?: boolean;
    variant?: Variant;
  }) => {
    // Сохраняем в localStorage мгновенно
    try {
      const cached = localStorage.getItem(`ofp_progress_${today}`);
      const existing = cached ? JSON.parse(cached) : {};
      const updated = { ...existing, ...updates };
      localStorage.setItem(`ofp_progress_${today}`, JSON.stringify(updated));
    } catch {}

    // Фоновая попытка отправить на сервер
    try {
      await fetch('/api/ofp/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: today, ...updates }),
      });
    } catch {
      // Игнорируем ошибку сети
    }
  };

  const toggleExercise = (id: string) => {
    const next = completedIds.includes(id)
      ? completedIds.filter((x) => x !== id)
      : [...completedIds, id];
    setCompletedIds(next);
    saveProgress({ completedIds: next, variant });
  };

  const changeVariant = (v: Variant) => {
    if (v === variant) return; // Защита от повторного клика по активному табу
    setVariant(v);
    saveProgress({ variant: v });
  };

  const toggleSteps = () => {
    const next = !stepsDone;
    setStepsDone(next);
    saveProgress({ stepsDone: next, variant });
  };

  const toggleAccordion = (index: number) => {
    setOpenBlockIds((prev) => {
      const next = prev.includes(index) ? prev.filter((id) => id !== index) : [...prev, index];

      localStorage.setItem('ofp_open_blocks', JSON.stringify(next));
      return next;
    });
  };

  const handleOpenModal = (ex: BackendExercise) => {
    // Ищем максимальный z-index только в основном приложении, игнорируя порталы
    const maxZ = getMaxZIndex('#root');
    setModalZIndex(maxZ + 1);
    setSelectedExercise(ex);
  };

  const handleCloseModal = () => {
    setSelectedExercise(null);
    setModalZIndex(null);
  };

  // Показываем глухую загрузку только в самый первый раз при открытии приложения
  if (isInitialLoading) {
    return (
      <section className="ofp-section card visual-loading-skeleton">
        <p className="loading-text">Сборка стабильного плана ОФП...</p>
      </section>
    );
  }

  return (
    <section className="ofp-section card slide-up" style={{ animationDelay: '0.1s' }}>
      <h2 className="section-title">ОФП</h2>

      {/* ТАБЫ ВЫБОРА МИНУТ — теперь никогда не исчезают с экрана при клике */}
      <div className="ofp-variants">
        {([35, 50, 70] as Variant[]).map((v) => (
          <button
            key={v}
            className={`variant-btn ${variant === v ? 'active' : ''}`}
            onClick={() => changeVariant(v)}
          >
            {v} мин
          </button>
        ))}
      </div>

      <p className="text-secondary">
        {VARIANT_LABELS[variant]} · {variant} мин
      </p>

      {/* ПОСТОЯННЫЕ ПУНКТЫ ФУНДАМЕНТА */}
      <div className="ofp-permanent-blocks">
        <ul className="ofp-list">
          <li
            className={`ofp-item permanent-item ${completedIds.includes('joint-gym-permanent') ? 'completed' : ''}`}
          >
            <label className="step-label">
              <input
                type="checkbox"
                className="step-checkbox"
                checked={completedIds.includes('joint-gym-permanent')}
                onChange={() => toggleExercise('joint-gym-permanent')}
              />
            </label>
            <Link to="/ofp/joint-gym" className="exercise-link-route">
              <span className="exercise-title">Суставная гимнастика</span>
              <span className="exercise-dose"> · 15 мин</span>
            </Link>
          </li>

          <li
            className={`ofp-item permanent-item ${completedIds.includes('abs-permanent') ? 'completed' : ''}`}
          >
            <div className="ofp-item-checkbox-wrapper">
              <input
                type="checkbox"
                className="step-checkbox"
                checked={completedIds.includes('abs-permanent')}
                onChange={() => toggleExercise('abs-permanent')}
              />
            </div>
            {/* Клик по прессу открывает модалку интервального таймера */}
            <div
              className="exercise-link-route"
              onClick={() => {
                const maxZ = getMaxZIndex('#root');
                setModalZIndex(maxZ + 1);
                setIsAbsTimerOpen(true);
              }}
            >
              <span className="exercise-title">Пресс</span>
              <span className="exercise-dose"> · 10 мин</span>
            </div>
          </li>
        </ul>
      </div>

      {/* Контейнер динамических аккордеонов с мягким эффектом прозрачности во время обновления данных */}
      <div className={`ofp-accordions-container ${isContentUpdating ? 'updating-fade' : ''}`}>
        <div className="ofp-accordions">
          {blocks.map((block, index) => {
            // Проверяем открытость по строковому индексу ("0", "1", "2")
            const isExpanded = openBlockIds.includes(index);
            console.log('isExpanded', index, openBlockIds, isExpanded);
            return (
              <div key={block.id} className={`accordion-item ${isExpanded ? 'expanded' : ''}`}>
                {/* Шапка аккордеона — передаем текущий порядковый индекс */}
                <div className="accordion-header" onClick={() => toggleAccordion(index)}>
                  <div className="accordion-header-left">
                    <span className="accordion-title-text">{block.title}</span>
                  </div>
                  <span className="accordion-duration">{block.duration_min} мин</span>
                </div>

                <div className="accordion-content">
                  <ul className="ofp-list">
                    {block.exercises.map((ex) => (
                      <li
                        key={ex.id}
                        className={`ofp-item ${completedIds.includes(ex.id) ? 'completed' : ''}`}
                      >
                        <label className="step-label">
                          <input
                            type="checkbox"
                            className="step-checkbox"
                            checked={completedIds.includes(ex.id)}
                            onChange={() => toggleExercise(ex.id)}
                          />
                        </label>

                        <div
                          className="exercise-info-clickable"
                          onClick={() => handleOpenModal(ex)}
                        >
                          <div className="exercise-title">{ex.title}</div>
                          <div className="exercise-dose">{ex.dose}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ТРЕКЕР ШАГОВ */}
      <div className="step-tracker">
        <label className="step-label">
          <input
            type="checkbox"
            className="step-checkbox"
            checked={stepsDone}
            onChange={toggleSteps}
          />
          <span>Норма шагов выполнена</span>
        </label>
      </div>

      {/* МОДАЛЬНОЕ ОКНО ДЕТАЛИЗАЦИИ */}
      <ExerciseModal exercise={selectedExercise} zIndex={modalZIndex} onClose={handleCloseModal} />
      <AbsTimerModal
        isOpen={isAbsTimerOpen}
        zIndex={modalZIndex}
        onClose={() => {
          setIsAbsTimerOpen(false);
          setModalZIndex(null);
        }}
        onComplete={() => {
          // Автоматически проставляем выполнение пресса, если пользователь прошел все 10 раундов
          if (!completedIds.includes('abs-permanent')) {
            toggleExercise('abs-permanent');
          }
        }}
      />
    </section>
  );
}
