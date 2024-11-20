import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Calendar } from './pages/Calendar';
import { Settings } from './pages/Settings';
import { Analytics } from './pages/Analytics';
import { Platforms } from './pages/Platforms';
import { YouTubeCallback } from './pages/platforms/YouTubeCallback';
import { LinkedInCallback } from './pages/platforms/LinkedInCallback';
import { XCallback } from './pages/platforms/XCallback';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { Blog } from './pages/Blog';
import { MasteringSocialMediaConsistency } from './pages/blog/MasteringSocialMediaConsistency';
import { AIInContentCreation } from './pages/blog/AIInContentCreation';
import { TimeSavingSocialMediaTips } from './pages/blog/TimeSavingSocialMediaTips';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './lib/auth';
import { analytics } from './lib/analytics';
import './index.css';

analytics.page();

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/auth',
    element: <Auth />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/calendar',
    element: (
      <ProtectedRoute>
        <Calendar />
      </ProtectedRoute>
    ),
  },
  {
    path: '/platforms',
    element: (
      <ProtectedRoute>
        <Platforms />
      </ProtectedRoute>
    ),
  },
  {
    path: '/platforms/callback/youtube',
    element: (
      <ProtectedRoute>
        <YouTubeCallback />
      </ProtectedRoute>
    ),
  },
  {
    path: '/platforms/callback/linkedin',
    element: (
      <ProtectedRoute>
        <LinkedInCallback />
      </ProtectedRoute>
    ),
  },
  {
    path: '/platforms/callback/x',
    element: (
      <ProtectedRoute>
        <XCallback />
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    ),
  },
  {
    path: '/analytics',
    element: (
      <ProtectedRoute>
        <Analytics />
      </ProtectedRoute>
    ),
  },
  {
    path: '/privacy',
    element: <Privacy />,
  },
  {
    path: '/terms',
    element: <Terms />,
  },
  {
    path: '/blog',
    element: <Blog />,
  },
  {
    path: '/blog/mastering-social-media-consistency',
    element: <MasteringSocialMediaConsistency />,
  },
  {
    path: '/blog/ai-in-content-creation',
    element: <AIInContentCreation />,
  },
  {
    path: '/blog/time-saving-social-media-tips',
    element: <TimeSavingSocialMediaTips />,
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </AuthProvider>
  </StrictMode>
);