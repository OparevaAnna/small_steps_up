import { useState, useEffect, useRef, useCallback } from 'react';
import {
  selectNextVideo,
  recordVideoView,
  markTodayJointGymCompleted,
  getVideoHistory,
  VideoHistoryEntry,
} from '../../services/videoHistoryService';
import { JOINT_GYM_VIDEOS, JointGymVideo } from '../../data/jointGymnasticsVideos';
import './JointGymnasticsPage.css';

export default function JointGymnasticsPage() {
  const [standingOnly, setStandingOnly] = useState<boolean>(false);
  const [currentVideo, setCurrentVideo] = useState<JointGymVideo | null>(null);
  const [isFromArchiveRepeat, setIsFromArchiveRepeat] = useState<boolean>(false);

  // Состояние воспроизведения видео
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(900); // 15 минут = 900 сек
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Модалка истории за 30 дней
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Подбор видео
  const pickVideo = useCallback(
    (standing: boolean, excludeId?: string) => {
      const result = selectNextVideo({
        standingOnly: standing,
        currentVideoId: excludeId,
      });

      if (result) {
        setCurrentVideo(result.video);
        setIsFromArchiveRepeat(result.isFromArchiveRepeat);

        // Фиксируем факт показа видео
        recordVideoView(result.video.id, false);

        // Сброс плеера
        setIsPlaying(false);
        setCurrentTime(0);
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.pause();
        }
      }
    },
    []
  );

  useEffect(() => {
    pickVideo(false);

    // Проверяем статус выполнения на сегодня
    const today = new Date().toISOString().split('T')[0];
    try {
      const cached = localStorage.getItem(`ofp_progress_${today}`);
      if (cached) {
        const data = JSON.parse(cached);
        if (data.completedIds?.includes('joint-gym-permanent')) {
          setIsCompleted(true);
        }
      }
    } catch {}
  }, [pickVideo]);

  // Переключение режима «Стоя»
  const handleToggleStanding = () => {
    const nextStanding = !standingOnly;
    setStandingOnly(nextStanding);

    // Если включили «Стоя», а текущее видео требует коврик — сразу подбираем стоячее
    if (nextStanding && currentVideo && !currentVideo.is_standing) {
      pickVideo(true, currentVideo.id);
    }
  };

  // Кнопка «Другая зарядка»
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);

    if (currentVideo) {
      pickVideo(standingOnly, currentVideo.id);
    }
  };

  // Выбор видео из истории
  const handleSelectFromHistory = (video: JointGymVideo) => {
    setCurrentVideo(video);
    setIsFromArchiveRepeat(true);
    setShowHistoryModal(false);
    recordVideoView(video.id, false);
    setIsPlaying(false);
    setCurrentTime(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.pause();
    }
  };

  // Отметка завершения тренировки
  const handleComplete = async () => {
    if (isCompleted) return;

    setIsCompleted(true);
    if (currentVideo) {
      recordVideoView(currentVideo.id, true);
    }

    // Сохраняем прогресс для главной страницы и бэкенда
    await markTodayJointGymCompleted();

    // Победный звук
    try {
      const victoryAudio = new Audio('/sounds/z_uki-pobeda.mp3');
      victoryAudio.play().catch(() => {});
    } catch {}
  };

  // Управление плеером
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && videoRef.current.duration) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    videoRef.current.currentTime = ratio * duration;
    setCurrentTime(ratio * duration);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const historyEntries = getVideoHistory();

  return (
    <div className="joint-gym-page fade-in">
      {/* Лаконичная шапка страницы */}
      <header className="joint-gym-header">
        <h1 className="joint-gym-title">Суставная гимнастика</h1>
        <p className="joint-gym-subtitle">15 минут · Ежедневная мобилизация</p>
      </header>

      {/* Вертикальный видеоплеер (9:16) */}
      {currentVideo && (
        <div className="vertical-player-wrapper">
          <video
            ref={videoRef}
            src={currentVideo.video_url}
            poster={currentVideo.poster_url}
            className="vertical-video-element"
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleComplete}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onClick={togglePlay}
          />

          {/* Верхние бейджи поверх видео */}
          <div className="player-top-overlay">
            <span
              className={`pill-badge ${
                currentVideo.is_standing ? 'standing' : 'mat'
              }`}
            >
              {currentVideo.is_standing ? '🚶 Стоя (без коврика)' : '🧘 На коврике'}
            </span>

            <span className="pill-badge timer-pill">
              ⏱ {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Кнопка Play по центру, когда на паузе */}
          {!isPlaying && (
            <div className="player-center-action">
              <button
                type="button"
                className="big-play-btn"
                onClick={togglePlay}
                aria-label="Воспроизвести"
              >
                ▶
              </button>
            </div>
          )}

          {/* Нижний бар управления плеером */}
          <div className="player-bottom-overlay">
            <div
              className="video-progress-track"
              onClick={handleSeek}
              title="Перемотать"
            >
              <div
                className="video-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="player-controls-row">
              <div className="controls-left">
                <button
                  type="button"
                  className="icon-player-btn"
                  onClick={togglePlay}
                  aria-label={isPlaying ? 'Пауза' : 'Воспроизвести'}
                >
                  {isPlaying ? '⏸' : '▶'}
                </button>
                <button
                  type="button"
                  className="icon-player-btn"
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Включить звук' : 'Выключить звук'}
                >
                  {isMuted ? '🔇' : '🔊'}
                </button>
                <span className="video-time-text">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="controls-right">
                <span className="video-time-text">
                  {Math.round(progressPercent)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Блок под видео: управление выбором + кнопка «Выполнено» */}
      <div className="video-controls-card">
        <div className="video-options-row">
          <label className="standing-toggle-label" onClick={handleToggleStanding}>
            <div className={`toggle-switch ${standingOnly ? 'active' : ''}`}>
              <div className="toggle-knob" />
            </div>
            <div className="standing-label-text">
              <span className="standing-title">Зарядка стоя</span>
              <span className="standing-hint">
                {standingOnly ? 'Без коврика' : 'С ковриком'}
              </span>
            </div>
          </label>

          <div className="video-action-btns">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleRefresh}
              title="Выбрать другую зарядку"
            >
              <span className={`refresh-icon ${isRefreshing ? 'rotating' : ''}`}>↻</span>
              Другая зарядка
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowHistoryModal(true)}
              title="История показов за 30 дней"
            >
              История ({historyEntries.length})
            </button>
          </div>
        </div>

        {isFromArchiveRepeat && (
          <p className="archive-repeat-hint">
            Показано повторно из архива: все видео этой категории уже просмотрены за 30 дней.
          </p>
        )}

        <button
          type="button"
          className={`btn-complete ${isCompleted ? 'completed' : ''}`}
          onClick={handleComplete}
          disabled={isCompleted}
        >
          {isCompleted ? '✓ Выполнено' : 'Выполнено'}
        </button>

        {isCompleted && (
          <p className="completed-toast-note">
            Отметка проставлена на главной странице «Сегодня»
          </p>
        )}
      </div>

      {/* Модальное окно истории за 30 дней */}
      {showHistoryModal && (
        <div
          className="history-modal-overlay"
          onClick={() => setShowHistoryModal(false)}
        >
          <div
            className="history-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="history-modal-header">
              <h2>Показанные видео (за 30 дней)</h2>
              <button
                type="button"
                className="close-modal-icon-btn"
                onClick={() => setShowHistoryModal(false)}
                aria-label="Закрыть"
              >
                ✕
              </button>
            </div>

            <div className="history-list-scroll">
              {historyEntries.length === 0 ? (
                <p className="text-secondary" style={{ padding: '12px 0' }}>
                  История показов пока пуста.
                </p>
              ) : (
                historyEntries.map((entry: VideoHistoryEntry, idx: number) => {
                  const video = JOINT_GYM_VIDEOS.find((v) => v.id === entry.videoId);
                  if (!video) return null;
                  const date = new Date(entry.watchedAt).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div key={`${entry.videoId}-${idx}`} className="history-entry-item">
                      <div className="history-entry-left">
                        <span className="history-entry-title">{video.title}</span>
                        <span className="history-entry-meta">
                          {date} · {video.is_standing ? 'Стоя' : 'На коврике'} ·{' '}
                          {entry.completed ? '✓ Завершено' : 'Просмотр'}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="history-select-btn"
                        onClick={() => handleSelectFromHistory(video)}
                      >
                        Включить
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
