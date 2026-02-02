/**
 * Admin Dashboard Entry Point
 * Main component for the admin panel with routing and authentication
 */
import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminLogin from './components/AdminLogin';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import ProfileEditor from './pages/ProfileEditor';
import ProjectManager from './pages/ProjectManager';
import BlogManager from './pages/BlogManager';
import FileManager from './pages/FileManager';
import AnalyticsDashboard from './pages/AnalyticsDashboard';

// Re-export auth hook for use in other admin components
export { useAuth } from './context/AuthContext';

// Admin routes enum
export type AdminRoute = 'dashboard' | 'profile' | 'projects' | 'blog' | 'analytics' | 'files';

// Main Admin Dashboard component
export default function AdminDashboard() {
  const [currentRoute, setCurrentRoute] = useState<AdminRoute>('dashboard');

  return (
    <AuthProvider>
      <AdminContent currentRoute={currentRoute} setCurrentRoute={setCurrentRoute} />
    </AuthProvider>
  );
}

interface AdminContentProps {
  currentRoute: AdminRoute;
  setCurrentRoute: (route: AdminRoute) => void;
}

function AdminContent({ currentRoute, setCurrentRoute }: AdminContentProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return (
    <AdminLayout currentRoute={currentRoute} setCurrentRoute={setCurrentRoute}>
      <AdminRouteContent route={currentRoute} />
    </AdminLayout>
  );
}

interface AdminRouteContentProps {
  route: AdminRoute;
}

function AdminRouteContent({ route }: AdminRouteContentProps) {
  switch (route) {
    case 'dashboard':
      return <Dashboard />;
    case 'profile':
      return <ProfileEditor />;
    case 'projects':
      return <ProjectManager />;
    case 'blog':
      return <BlogManager />;
    case 'analytics':
      return <AnalyticsDashboard />;
    case 'files':
      return <FileManager />;
    default:
      return <Dashboard />;
  }
}
