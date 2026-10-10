export interface JointGymVideo {
  id: string;
  title: string;
  duration_minutes: number;
  is_standing: boolean; // true = зарядка стоя (коврик не нужен), false = требует коврик
  video_url: string;
  poster_url?: string;
  instructor: string;
  focus_areas: string[];
  description: string;
}

export const JOINT_GYM_VIDEOS: JointGymVideo[] = [
  {
    id: 'jg-001',
    title: 'Утренняя мобилизация: волны и мягкое раскрытие',
    duration_minutes: 15,
    is_standing: false,
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    poster_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
    instructor: 'Елена Смирнова',
    focus_areas: ['Шея', 'Грудной отдел', 'ТБС', 'Позвоночник'],
    description: 'Плавный разминочный комплекс на коврике: кошка-корова, ротации грудного отдела, раскрытие таза и вытяжение спины.'
  },
  {
    id: 'jg-002',
    title: 'Мобильность ТБС и снятие зажимов таза',
    duration_minutes: 15,
    is_standing: false,
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    poster_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
    instructor: 'Михаил Романов',
    focus_areas: ['ТБС', 'Ягодичные', 'Поясница'],
    description: 'Глубокая проработка тазобедренных суставов: 90/90, мягкие круги бедром, раскрытие приводящих мышц.'
  },
  {
    id: 'jg-003',
    title: 'Офисная зарядка: только стоя без инвентаря',
    duration_minutes: 15,
    is_standing: true,
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    poster_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    instructor: 'Анна Маута',
    focus_areas: ['Шея', 'Плечи', 'Грудной отдел', 'Голеностоп'],
    description: 'Комплекс 100% стоя. Идеально для офиса, отеля или быстрой разминки перед пробежкой без коврика.'
  },
  {
    id: 'jg-004',
    title: 'Здоровая осанка и плечевой пояс',
    duration_minutes: 15,
    is_standing: false,
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    poster_url: 'https://images.unsplash.com/photo-1552196563-55238914b18f?auto=format&fit=crop&w=800&q=80',
    instructor: 'Ольга Васильева',
    focus_areas: ['Шея', 'Лопатки', 'Грудной отдел'],
    description: 'Активация ромбовидных мышц, вытяжение трапеций и раскрытие плечевых суставов на коврике.'
  },
  {
    id: 'jg-005',
    title: 'Горный баланс: голеностоп и колени стоя',
    duration_minutes: 15,
    is_standing: true,
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    poster_url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80',
    instructor: 'Анна Маута',
    focus_areas: ['Стопы', 'Голеностоп', 'Колени', 'Баланс'],
    description: 'Специальная стоячая разминка для трейлраннеров: микробаланс, перекаты стопы, мобилизация ахиллова сухожилия.'
  },
  {
    id: 'jg-006',
    title: 'Полный суставной круг: от макушки до стоп',
    duration_minutes: 15,
    is_standing: false,
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    poster_url: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&w=800&q=80',
    instructor: 'Елена Смирнова',
    focus_areas: ['Шея', 'Плечи', 'Позвоночник', 'ТБС', 'Колени', 'Стопы'],
    description: 'Классическая мягкая суставная гимнастика: последовательная разминка всех ключевых сочленений тела.'
  },
  {
    id: 'jg-007',
    title: 'Бодрящая стойка: раскрытие грудной клетки стоя',
    duration_minutes: 15,
    is_standing: true,
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
    poster_url: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=800&q=80',
    instructor: 'Дмитрий Ковалев',
    focus_areas: ['Грудная клетка', 'Дыхание', 'Плечи', 'Позвоночник'],
    description: 'Дыхательная гимнастика и стоячие скручивания: снимаем спазм диафрагмы и зажатость между лопатками.'
  },
  {
    id: 'jg-008',
    title: 'Реабилитационный поток для поясницы и крестца',
    duration_minutes: 15,
    is_standing: false,
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    poster_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    instructor: 'Михаил Романов',
    focus_areas: ['Поясница', 'Крестец', 'ТБС'],
    description: 'Мягкая терапевтическая сессия ЛФК для снятия осевой нагрузки с межпозвонковых дисков.'
  },
  {
    id: 'jg-009',
    title: 'Динамическая разминка стоя перед активным днём',
    duration_minutes: 15,
    is_standing: true,
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    poster_url: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=800&q=80',
    instructor: 'Анна Маута',
    focus_areas: ['ТБС', 'Плечи', 'Колени', 'Баланс'],
    description: 'Энергичный поток стоячих суставных движений: махи с контролем таза, круговые вращения и активация суставов.'
  },
  {
    id: 'jg-010',
    title: 'Антистресс: шея, затылок и верхняя трапеция',
    duration_minutes: 15,
    is_standing: true,
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
    poster_url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80',
    instructor: 'Ольга Васильева',
    focus_areas: ['Шея', 'Трапеция', 'Глазодвигательные мышцы'],
    description: 'Специальный блок стоя для снятия компьютерного напряжения с шеи, подзатылочных мышц и плечевого пояса.'
  }
];
