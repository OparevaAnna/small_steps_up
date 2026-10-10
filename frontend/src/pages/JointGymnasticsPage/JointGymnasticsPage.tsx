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
  const [lastViewedDaysAgo, setLastViewedDaysAgo] = useState<number | undefined>();
  const [unwatchedCount, setUnwatchedCount] = useState<number>(0);
  const [totalMatchingCount, setTotalMatchingCount] = useState<number>(0);

  // Состояние воспроизведения видео
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(900); // 15 минут = 900 сек по умолчанию
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Модалка истории и гайд
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showStorageGuide, setShowStorageGuide] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Инициализация случайного видео при монтировании
  const pickVideo = useCallback(
    (standing: boolean, excludeId?: string) => {
      const result = selectNextVideo({
        standingOnly: standing,
        currentVideoId: excludeId,
      });

      if (result) {
        setCurrentVideo(result.video);
        setIsFromArchiveRepeat(result.isFromArchiveRepeat);
        setLastViewedDaysAgo(result.lastViewedDaysAgo);
        setUnwatchedCount(result.unwatchedCount);
        setTotalMatchingCount(result.totalMatchingCount);

        // Фиксируем факт показа видео в истории
        recordVideoView(result.video.id, false);

        // Сбрасываем плеер
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

    // Проверяем, выполнена ли уже гимнастика на сегодня
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

  // Обработка переключения фильтра «Стоя»
  const handleToggleStanding = () => {
    const nextStanding = !standingOnly;
    setStandingOnly(nextStanding);

    // Если включили «Стоя», а текущее видео требует коврик — сразу подбираем подходящее стоячее
    if (nextStanding && currentVideo && !currentVideo.is_standing) {
      pickVideo(true, currentVideo.id);
    } else {
      // Иначе пересчитываем счётчики пула
      const result = selectNextVideo({
        standingOnly: nextStanding,
        currentVideoId: currentVideo?.id,
      });
      if (result) {
        setUnwatchedCount(result.unwatchedCount);
        setTotalMatchingCount(result.totalMatchingCount);
      }
    }
  };

  // Кнопка «Рефреш / Другая зарядка»
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);

    if (currentVideo) {
      pickVideo(standingOnly, currentVideo.id);
    }
  };

  // Выбор конкретного видео из истории
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

    // Проигрываем победный звук
    try {
      const victoryAudio = new Audio('/sounds/z_uki-pobeda.mp3');
      victoryAudio.play().catch(() => {});
    } catch {}
  };

  // Управление видео
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

  const handleCloseTab = () => {
    window.close();
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const historyEntries = getVideoHistory();

  return (
    <div className="joint-gym-page fade-in">
      {/* Шапка страницы */}
      <header className="joint-gym-header">
        <div className="header-left">
          <button
            type="button"
            className="close-window-btn"
            onClick={handleCloseTab}
            title="Закрыть вкладку"
          >
            ✕ Закрыть вкладку
          </button>
          <div className="header-title-wrap">
            <h1>Суставная гимнастика</h1>
            <p>15 минут · Ежедневная мобилизация</p>
          </div>
        </div>
      </header>

      {/* Панель фильтра «Стоя» и рефреша */}
      <section className="joint-controls-bar">
        <label className="standing-toggle-label" onClick={handleToggleStanding}>
          <div className={`toggle-switch ${standingOnly ? 'active' : ''}`}>
            <div className="toggle-knob" />
          </div>
          <div className="standing-label-text">
            <span className="standing-title">Зарядка стоя</span>
            <span className="standing-hint">
              {standingOnly ? 'Коврик не требуется' : 'Включая комплексы на коврике'}
            </span>
          </div>
        </label>

        <div className="controls-actions">
          <button
            type="button"
            className="refresh-video-btn"
            onClick={handleRefresh}
            title="Выбрать другую зарядку"
          >
            <span className={`refresh-icon ${isRefreshing ? 'rotating' : ''}`}>↻</span>
            Другая зарядка
          </button>

          <button
            type="button"
            className="history-toggle-btn"
            onClick={() => setShowHistoryModal(true)}
            title="История показов за 30 дней"
          >
            История ({historyEntries.length})
          </button>
        </div>
      </section>

      {/* Информационный бейдж ротации 30 дней */}
      {currentVideo && (
        <div
          className={`rotation-status-badge ${
            isFromArchiveRepeat ? 'archive-repeat' : ''
          }`}
        >
          {isFromArchiveRepeat ? (
            <span>
              ℹ️ Все подходящие видео уже показаны за 30 дней. Показываем повтор из
              архива (просмотрено {lastViewedDaysAgo} дн. назад).
            </span>
          ) : (
            <span>
              ✨ Свежая зарядка: не показывалась в последние 30 дней (доступно:{' '}
              {unwatchedCount} из {totalMatchingCount}).
            </span>
          )}
        </div>
      )}

      {/* Баннер успешного выполнения */}
      {isCompleted && (
        <div className="completion-banner">
          <h3>🎉 Суставная гимнастика выполнена!</h3>
          <p>
            Отметка автоматически проставлена на сегодня в вашем дневнике «Сегодня».
            Вы можете закрыть эту вкладку и продолжать день.
          </p>
          <button
            type="button"
            className="close-window-btn banner-close-action"
            onClick={handleCloseTab}
          >
            Закрыть эту вкладку
          </button>
        </div>
      )}

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

          {/* Центральная кнопка Play, когда на паузе */}
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

      {/* Описание текущего видео и ручная кнопка отметки */}
      {currentVideo && (
        <section className="video-info-card">
          <h2 className="video-info-title">{currentVideo.title}</h2>
          <p className="video-instructor-line">
            Инструктор: <strong>{currentVideo.instructor}</strong> · 15 минут
          </p>

          <div className="focus-tags-list">
            {currentVideo.focus_areas.map((tag) => (
              <span key={tag} className="focus-tag-chip">
                {tag}
              </span>
            ))}
          </div>

          <p className="video-desc-text">{currentVideo.description}</p>

          <div className="manual-complete-bar">
            <span className="standing-hint">
              {isCompleted
                ? 'Отметка зафиксирована'
                : 'Отметка проставится автоматически по завершении видео'}
            </span>

            <button
              type="button"
              className={`mark-done-btn ${isCompleted ? 'already-done' : ''}`}
              onClick={handleComplete}
              disabled={isCompleted}
            >
              {isCompleted ? '✓ Выполнено на сегодня' : 'Отметить выполненным'}
            </button>
          </div>
        </section>
      )}

      {/* Рекомендации по сетевому хранению 50+ видео */}
      <section className="storage-guide-card">
        <div
          className="storage-guide-summary"
          onClick={() => setShowStorageGuide(!showStorageGuide)}
        >
          <span>💡 Архитектура: где лучше хранить 50+ вертикальных видео в сети?</span>
          <span>{showStorageGuide ? '▲ скрыть' : '▼ подробнее'}</span>
        </div>

        {showStorageGuide && (
          <div className="storage-guide-content">
            <div className="storage-option-row">
              <span className="storage-option-name">1. Cloudflare Stream (Рекомендуемый выбор)</span>
              <p>
                Автоматический адаптивный битрейт (HLS/DASH) для смартфонов, CDN по всему миру,
                $5/мес за 1000 минут видео ($1 за 1000 минут стриминга). Встроенный плеер и защита от скачивания.
              </p>
            </div>

            <div className="storage-option-row">
              <span className="storage-option-name">2. Bunny Stream (Бюджетная альтернатива)</span>
              <p>
                $0.005 за ГБ хранения и $0.01 за ГБ трафика. Отличное быстродействие, встроенный плеер и перекодирование вертикального 9:16 видео.
              </p>
            </div>

            <div className="storage-option-row">
              <span className="storage-option-name">3. Cloudflare R2 / S3 + CDN</span>
              <p>
                Хранилище с нулевой стоимостью исходящего трафика (Egress-free). Подходит для прямой раздачи оптимизированных .mp4 / .webm файлов.
              </p>
            </div>

            <div className="storage-option-row">
              <span className="storage-option-name">4. YouTube Shorts / Unlisted (Бесплатный вариант)</span>
              <p>
                Загрузка с доступом по ссылке. Бесплатно и надежно, но в плеере отображается брендинг YouTube.
              </p>
            </div>
          </div>
        )}
      </section>

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
                className="close-window-btn"
                onClick={() => setShowHistoryModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="history-list-scroll">
              {historyEntries.length === 0 ? (
                <p className="text-secondary" style={{ padding: '12px 0' }}>
                  История просмотров пока пуста.
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
