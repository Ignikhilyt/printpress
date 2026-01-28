import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from './AdminSidebar';
import { PageLoader } from '../common/Loader';

export default function AdminLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}