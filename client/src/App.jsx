import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RequireAuth from './auth/RequireAuth.jsx';
import AppLayout from './components/AppLayout.jsx';
import Skeleton from './components/Skeleton.jsx';
import HomePage from './pages/HomePage.jsx'; // small pages that anyone can open: loaded right away
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';

// the logged-in pages are only downloaded when someone opens them (code splitting, Session 22)
const MyListsPage = lazy(() => import('./pages/MyListsPage.jsx'));
const ListPage = lazy(() => import('./pages/ListPage.jsx'));
const SearchPage = lazy(() => import('./pages/SearchPage.jsx'));

// one URL --> one page, and the browser never reloads (client-side routing)
export default function App() {
  return (
    // while a lazy page is still downloading, Suspense shows the fallback
    <Suspense fallback={<AppLayout><Skeleton title /></AppLayout>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* protected: RequireAuth sends you to /login if you're not logged in */}
        <Route path="/lists" element={<RequireAuth><MyListsPage /></RequireAuth>} />
        <Route path="/lists/:id" element={<RequireAuth><ListPage /></RequireAuth>} />
        <Route path="/lists/:id/add" element={<RequireAuth><SearchPage /></RequireAuth>} />

        {/* any other URL --> back to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
