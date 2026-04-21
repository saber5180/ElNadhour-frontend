import React from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';

const LegacyCategoryRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/categorie/${id}`} replace />;
};
import { useAuth } from './contexts/AuthContext';

// Public components
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import CategoryPage from './pages/CategoryPage';
import SimpleMenuPage from './pages/SimpleMenuPage';
import LiveStreamPage from './pages/LiveStreamPage';

// Admin components
import AdminLayout from './components/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import CategoriesManager from './pages/admin/CategoriesManager';
import MenuItemsManager from './pages/admin/MenuItemsManager';
import HeroImagesManager from './pages/admin/HeroImagesManager';

// Loading component
import LoadingSpinner from './components/LoadingSpinner';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="carte" element={<SimpleMenuPage />} />
        <Route path="simple-menu" element={<Navigate to="/carte" replace />} />
        <Route path="categorie/:id" element={<CategoryPage />} />
        <Route path="category/:id" element={<LegacyCategoryRedirect />} />
        <Route path="en-direct" element={<LiveStreamPage />} />
        <Route path="live" element={<Navigate to="/en-direct" replace />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="categories" element={<CategoriesManager />} />
        <Route path="articles" element={<MenuItemsManager />} />
        <Route path="menu-items" element={<Navigate to="/admin/articles" replace />} />
        <Route path="medias-accueil" element={<HeroImagesManager />} />
        <Route path="hero-images" element={<Navigate to="/admin/medias-accueil" replace />} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;