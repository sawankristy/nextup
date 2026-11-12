import { Routes, Route, Navigate } from 'react-router-dom';
import RequireAuth from './auth/RequireAuth.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import MyListsPage from './pages/MyListsPage.jsx';
import ListPage from './pages/ListPage.jsx';
import SearchPage from './pages/SearchPage.jsx';

// one URL --> one page, and the browser never reloads (client-side routing)
export default function App() {
  return (
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
  );
}
