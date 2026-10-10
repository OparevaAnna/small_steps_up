import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import TodayPage from '../pages/TodayPage/TodayPage';
import WeekPage from '../pages/WeekPage/WeekPage';
import OfpPage from '../pages/OfpPage/OfpPage';
import CatalogPage from '../pages/CatalogPage/CatalogPage';
import ExerciseDetailPage from '../pages/ExerciseDetailPage/ExerciseDetailPage';
import VideoLibraryPage from '../pages/VideoLibraryPage/VideoLibraryPage';
import ProfilePage from '../pages/ProfilePage/ProfilePage';
import ExecutionPage from '../pages/ExecutionPage/ExecutionPage';
import NotFoundPage from '../pages/NotFoundPage/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <TodayPage /> },
      { path: 'week', element: <WeekPage /> },
      { path: 'ofp', element: <OfpPage /> },
      { path: 'catalog', element: <CatalogPage /> },
      { path: 'catalog/:id', element: <ExerciseDetailPage /> },
      { path: 'videos', element: <VideoLibraryPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'execute/:blockType', element: <ExecutionPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);