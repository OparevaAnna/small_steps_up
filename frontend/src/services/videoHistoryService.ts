import { JOINT_GYM_VIDEOS, JointGymVideo } from '../data/jointGymnasticsVideos';

const HISTORY_STORAGE_KEY = 'small_steps_up_video_history';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export interface VideoHistoryEntry {
  videoId: string;
  watchedAt: string; // ISO string
  completed: boolean;
}

export interface VideoSelectionResult {
  video: JointGymVideo;
  isFromArchiveRepeat: boolean;
  unwatchedCount: number;
  totalMatchingCount: number;
  lastViewedDaysAgo?: number;
}

/**
 * Получить полную историю просмотров видео
 */
export function getVideoHistory(): VideoHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Записать факт показа видео (с сохранением времени)
 */
export function recordVideoView(videoId: string, completed: boolean = false): void {
  try {
    const history = getVideoHistory();
    const nowIso = new Date().toISOString();
    
    // Добавляем новую запись в начало
    const updated: VideoHistoryEntry[] = [
      { videoId, watchedAt: nowIso, completed },
      ...history
    ];

    // Храним последние 100 записей
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated.slice(0, 100)));
  } catch (err) {
    console.warn('Не удалось сохранить историю видео в localStorage', err);
  }
}

/**
 * Умный выбор следующего видео:
 * 1. Фильтрует по признаку «Стоя» (standingOnly).
 * 2. Исключает видео, показанные за последние 30 дней.
 * 3. Если все подходящие видео уже показаны за 30 дней — выбирает самое давно показанное (Repeat Archive).
 */
export function selectNextVideo(options: {
  standingOnly: boolean;
  currentVideoId?: string;
}): VideoSelectionResult | null {
  const { standingOnly, currentVideoId } = options;

  // 1. Фильтруем пул по признаку "Стоя"
  let candidates = JOINT_GYM_VIDEOS.filter((v) => {
    if (standingOnly) return v.is_standing === true;
    return true; // если галочка не стоит, подходят все (и с ковриком, и стоячие)
  });

  if (candidates.length === 0) return null;

  const now = Date.now();
  const history = getVideoHistory();

  // Создаем карту: videoId -> время самого свежего показа (timestamp)
  const lastViewedMap = new Map<string, number>();
  for (const entry of history) {
    const time = new Date(entry.watchedAt).getTime();
    const existing = lastViewedMap.get(entry.videoId);
    if (!existing || time > existing) {
      lastViewedMap.set(entry.videoId, time);
    }
  }

  // Делим кандидатов на "не показанные за 30 дней" и "показанные за 30 дней"
  const unwatchedCandidates: JointGymVideo[] = [];
  const watchedRecentlyCandidates: Array<{ video: JointGymVideo; lastViewedAt: number }> = [];

  for (const video of candidates) {
    const lastViewed = lastViewedMap.get(video.id);
    if (!lastViewed || (now - lastViewed) > THIRTY_DAYS_MS) {
      unwatchedCandidates.push(video);
    } else {
      watchedRecentlyCandidates.push({ video, lastViewedAt: lastViewed });
    }
  }

  // 2. Если есть не показанные за 30 дней:
  if (unwatchedCandidates.length > 0) {
    // Если возможно, не выбираем текущее повторно при рефреше
    let pool = unwatchedCandidates;
    if (pool.length > 1 && currentVideoId) {
      pool = pool.filter((v) => v.id !== currentVideoId);
    }
    const randomIndex = Math.floor(Math.random() * pool.length);
    const selected = pool[randomIndex];

    return {
      video: selected,
      isFromArchiveRepeat: false,
      unwatchedCount: unwatchedCandidates.length,
      totalMatchingCount: candidates.length,
    };
  }

  // 3. Если ВСЕ видео в этой категории уже были показаны за 30 дней:
  // Сортируем по возрастанию времени (самое старое / давно просмотренное идет первым)
  let pool = watchedRecentlyCandidates;
  if (pool.length > 1 && currentVideoId) {
    const withoutCurrent = pool.filter((item) => item.video.id !== currentVideoId);
    if (withoutCurrent.length > 0) pool = withoutCurrent;
  }

  pool.sort((a, b) => a.lastViewedAt - b.lastViewedAt);
  const oldest = pool[0];
  const daysAgo = Math.max(1, Math.round((now - oldest.lastViewedAt) / (24 * 60 * 60 * 1000)));

  return {
    video: oldest.video,
    isFromArchiveRepeat: true,
    unwatchedCount: 0,
    totalMatchingCount: candidates.length,
    lastViewedDaysAgo: daysAgo,
  };
}

/**
 * Автоматическая отметка выполнения суставной гимнастики на сегодня:
 * 1. Отправляет POST-запрос на бэкенд по адресу /api/ofp/progress
 * 2. Добавляет идентификатор 'joint-gym-permanent' в completedIds
 * 3. Сохраняет в localStorage и синхронизирует вкладку «Сегодня» в реальном времени
 */
export async function markTodayJointGymCompleted(): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const TARGET_ID = 'joint-gym-permanent';

  try {
    const storageKey = `ofp_progress_${today}`;
    const raw = localStorage.getItem(storageKey);
    const current = raw ? JSON.parse(raw) : { completedIds: [], variant: 35, stepsDone: false };
    
    const completedIds = Array.isArray(current.completedIds) ? [...current.completedIds] : [];
    if (!completedIds.includes(TARGET_ID)) {
      completedIds.push(TARGET_ID);
    }

    const payload = {
      date: today,
      completedIds,
      variant: current.variant ?? 35,
      stepsDone: current.stepsDone ?? false,
    };

    // Сохраняем в localStorage
    localStorage.setItem(storageKey, JSON.stringify(payload));

    // Синхронизируем открытые соседние вкладки через BroadcastChannel
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('ofp_progress_channel');
        channel.postMessage({ type: 'PROGRESS_UPDATED', date: today, payload });
        channel.close();
      }
      window.dispatchEvent(new CustomEvent('small_steps_joint_gym_completed', { detail: payload }));
    } catch {}

    // Отправляем запрос на бэкенд в API progress
    const response = await fetch('/api/ofp/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const serverResult = await response.json();
      console.log('Прогресс успешно сохранён на бэкенде:', serverResult);
    }
  } catch (err) {
    console.warn('Ошибка при сохранении прогресса суставной гимнастики:', err);
  }
}
