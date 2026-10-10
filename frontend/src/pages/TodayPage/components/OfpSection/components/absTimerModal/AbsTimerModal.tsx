import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './AbsTimerModal.css';

interface AbsTimerModalProps {
  isOpen: boolean;
  zIndex: number | null;
  onClose: () => void;
  onComplete: () => void;
}

type TimerPhase = 'idle' | 'preparation' | 'work' | 'rest' | 'finished';

export default function AbsTimerModal({ isOpen, zIndex, onClose, onComplete }: AbsTimerModalProps) {
  const [phase, setPhase] = useState<TimerPhase>('idle');
  const [round, setRound] = useState(1);
  const [timeLeft, setSecondsLeft] = useState(10);
  const [isActive, setIsActive] = useState(false);

  // Ссылки на аудиофайлы для предотвращения дублирования в памяти
  const beepAudio = useRef<HTMLAudioElement | null>(null);
  const gongAudio = useRef<HTMLAudioElement | null>(null);
  const successAudio = useRef<HTMLAudioElement | null>(null);

  // Ссылки на макро-таймеры для их безопасного сброса
  const phaseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const soundTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visualIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Инициализация и воспроизведение звуков
  const playSound = useCallback((type: 'beep' | 'gong' | 'success') => {
    let audio: HTMLAudioElement | null = null;
    if (type === 'beep') {
      if (!beepAudio.current) beepAudio.current = new Audio('/sounds/54.mp3');
      audio = beepAudio.current;
    } else if (type === 'gong') {
      if (!gongAudio.current) gongAudio.current = new Audio('/sounds/54.mp3');
      audio = gongAudio.current;
    } else if (type === 'success') {
      if (!successAudio.current)
        successAudio.current = new Audio('/sounds/z_uki-pobeda.mp3');
      audio = successAudio.current;
    }
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch((e) => console.warn('Воспроизведение звука заблокировано браузером:', e));
    }
  }, []);

  // Логика автоматического переключения раундов и фаз
  const handlePhaseTransition = useCallback(() => {
    if (phase === 'preparation') {
      playSound('gong');
      setPhase('work');
      setSecondsLeft(50);
    } else if (phase === 'work') {
      playSound('gong');
      if (round < 10) {
        setPhase('rest');
        setSecondsLeft(10);
      } else {
        setPhase('finished');
        setIsActive(false);
        playSound('success');

        // По завершении 10 раундов закрываем окно и проставляем галку
        setTimeout(() => {
          onComplete();
          onClose();
          // Сбрасываем таймер в исходное состояние для следующего запуска
          setPhase('idle');
          setRound(1);
          setSecondsLeft(10);
        }, 2500);
      }
    } else if (phase === 'rest') {
      playSound('gong');
      setRound((r) => r + 1);
      setPhase('work');
      setSecondsLeft(50);
    }
  }, [phase, round, playSound, onComplete, onClose]);

  // Кнопка Управления: Старт / Пауза
  const handleStartPause = () => {
    if (phase === 'idle') {
      setPhase('preparation');
      setSecondsLeft(10);
    }
    setIsActive(!isActive);
  };

  // Метод ручного закрытия модалки пользователем (сброс всех параметров)
  const handleManualClose = () => {
    setIsActive(false);
    setPhase('idle');
    setRound(1);
    setSecondsLeft(10);
    onClose();
  };

  // 🕵️ ЭФФЕКТ: Монолитное планирование фаз и запуска 5-секундного трека отсчета
  useEffect(() => {
    if (!isActive || phase === 'idle' || phase === 'finished') {
      return () => {
        if (phaseTimeoutRef.current) clearTimeout(phaseTimeoutRef.current);
        if (soundTimeoutRef.current) clearTimeout(soundTimeoutRef.current);
        if (visualIntervalRef.current) clearInterval(visualIntervalRef.current);
      };
    }

    // Определяем полную длительность текущей фазы в секундах
    const currentDurationSec = phase === 'preparation' || phase === 'rest' ? 10 : 50;

    // Задаем начальное значение для визуального счетчика на экране
    setSecondsLeft(currentDurationSec);

    // 1. ⏱️ ТАЙМЕР ЗВУКА: Запускается строго один раз за 5 секунд до окончания текущей фазы
    const soundDelayMs = (currentDurationSec - 5) * 1000;
    soundTimeoutRef.current = setTimeout(() => {
      playSound('beep');
    }, soundDelayMs);

    // 2. 🏁 ТАЙМЕР ПЕРЕКЛЮЧЕНИЯ ФАЗЫ: Срабатывает ровно по истечении времени блока
    phaseTimeoutRef.current = setTimeout(() => {
      handlePhaseTransition();
    }, currentDurationSec * 1000);

    // 3. 📺 ДЕКОРАТИВНЫЙ СЧЕТЧИК: Плавно уменьшает цифру на экране каждую секунду
    visualIntervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // 🛑 КРИТИЧЕСКАЯ ОЧИСТКА ПОТОКОВ: Вызывается при паузе, размонтировании или закрытии
    return () => {
      if (phaseTimeoutRef.current) clearTimeout(phaseTimeoutRef.current);
      if (soundTimeoutRef.current) clearTimeout(soundTimeoutRef.current);
      if (visualIntervalRef.current) clearInterval(visualIntervalRef.current);

      // Принудительно глушим звуки, чтобы они не продолжали болтать в фоне
      if (beepAudio.current) {
        beepAudio.current.pause();
        beepAudio.current.currentTime = 0;
      }
      if (gongAudio.current) {
        gongAudio.current.pause();
        gongAudio.current.currentTime = 0;
      }
      if (successAudio.current) {
        successAudio.current.pause();
        successAudio.current.currentTime = 0;
      }
    };
  }, [isActive, phase, round, playSound, handlePhaseTransition]);

  if (!isOpen) return null;

  // Форматирование заголовков под фазы тренировки
  const getPhaseLabel = () => {
    if (phase === 'idle') return 'Пресс: 10 раундов';
    if (phase === 'preparation') return 'Приготовьтесь';
    if (phase === 'work') return `РАБОТА (Раунд ${round}/10)`;
    if (phase === 'rest') return `ОТДЫХ (После раунда ${round})`;
    return 'Отлично выполнено! 🎉';
  };

  return createPortal(
    <div
      className="modal-overlay"
      onClick={handleManualClose}
      style={zIndex ? { zIndex } : undefined}
    >
      <div className="modal-card abs-timer-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Интервальный таймер</h3>
          <button className="close-modal-btn" onClick={handleManualClose}>
            ✕
          </button>
        </div>

        <div className="abs-timer-body">
          <div className={`phase-badge phase-${phase}`}>{getPhaseLabel()}</div>

          <div className="timer-display">
            {phase === 'finished' ? '💪' : timeLeft}
            {phase !== 'finished' && <span className="timer-ms">сек</span>}
          </div>

          <div className="timer-controls">
            <button
              className={`timer-main-btn ${isActive ? 'btn-pause' : 'timer-start-btn'}`}
              onClick={handleStartPause}
            >
              {isActive ? 'ПАУЗА' : phase === 'idle' ? 'СТАРТ' : 'ПРОДОЛЖИТЬ'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')!,
  );
}
