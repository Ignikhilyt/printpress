/**
 * PrintPress App
 * Main application entry point with routing and providers.
 * This modular version imports all enhanced components from their separate files.
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider, useAuth } from './context/AuthContext';
// CartProvider removed - using Zustand store
import { WishlistProvider } from './context/WishlistContext';
import { ThemeProvider } from './context/ThemeContext';
import { RecentlyViewedProvider } from './context/RecentlyViewedContext';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AdminSidebar from './components/layout/AdminSidebar';
import BackToTop from './components/common/BackToTop';
import { PageLoader } from './components/common/Loader';
// import WhatsAppButton from './components/common/WhatsAppButton'; // Uncomment after npm install

// Public Pages (Lazy Loaded)
const HomePage = React.lazy(() => import('./pages/public/HomePage'));
const NotesListPage = React.lazy(() => import('./pages/public/NotesListPage'));
const NoteDetailPage = React.lazy(() => import('./pages/public/NoteDetailPage'));
const BrowseBooksPage = React.lazy(() => import('./pages/public/BrowseBooksPage'));
const AboutPage = React.lazy(() => import('./pages/public/AboutPage'));
const ContactPage = React.lazy(() => import('./pages/public/ContactPage'));
const FAQPage = React.lazy(() => import('./pages/public/FAQPage'));
const LoginPage = React.lazy(() => import('./pages/public/LoginPage'));
const OrderPage = React.lazy(() => import('./pages/public/OrderPage'));
const OrderConfirmationPage = React.lazy(() => import('./pages/public/OrderConfirmationPage'));
const NotFoundPage = React.lazy(() => import('./pages/public/NotFoundPage'));

// Admin Pages (Lazy Loaded)
const DashboardPage = React.lazy(() => import('./pages/admin/DashboardPage'));
const ManageOrdersPage = React.lazy(() => import('./pages/admin/ManageOrdersPage'));
const ManageNotesPage = React.lazy(() => import('./pages/admin/ManageNotesPage'));
const ManageInstitutesPage = React.lazy(() => import('./pages/admin/ManageInstitutesPage'));
const OrderDetailPage = React.lazy(() => import('./pages/admin/OrderDetailPage'));

// ... (Layout components remain same) ...

// ... (ProtectedRoute remains same) ...

/**
 * Public Layout - Header, main content, footer
 */
function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <Header />
      <main className="flex-1">
        <React.Suspense fallback={<PageLoader />}>
          {children}
        </React.Suspense>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}

/**
 * Admin Layout - Sidebar with main content
 * Requires server-validated authentication
 */
function AdminLayout({ children }) {
  const { isAuthenticated, loading, serverConnected, isUnvalidated } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {/* Server connection warning */}
        {!serverConnected && (
          <div className="mb-4 p-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-xl flex items-center gap-3">
            <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-200">Server Disconnected</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Cannot connect to backend. Data may be outdated. Please start the server.
              </p>
            </div>
          </div>
        )}

        {/* Unvalidated session warning */}
        {isUnvalidated && serverConnected && (
          <div className="mb-4 p-4 bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700 rounded-xl">
            <p className="text-sm text-orange-800 dark:text-orange-200">
              ⚠️ Session not validated. Some features may not work correctly.
            </p>
          </div>
        )}

        <React.Suspense fallback={<PageLoader />}>
          {children}
        </React.Suspense>
      </main>
    </div>
  );
}

/**
 * Auth Layout - Minimal layout for login/register
 */
function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-900">
      <React.Suspense fallback={<PageLoader />}>
        {children}
      </React.Suspense>
    </div>
  );
}

// ... (AppRoutes remains same, but using lazy components) ...

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
      <Route path="/notes" element={<PublicLayout><NotesListPage /></PublicLayout>} />
      <Route path="/notes/:slug" element={<PublicLayout><NoteDetailPage /></PublicLayout>} />
      <Route path="/books" element={<PublicLayout><BrowseBooksPage /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
      <Route path="/faq" element={<PublicLayout><FAQPage /></PublicLayout>} />
      <Route path="/order" element={<PublicLayout><OrderPage /></PublicLayout>} />
      <Route path="/order/confirmation/:orderId" element={<PublicLayout><OrderConfirmationPage /></PublicLayout>} />

      {/* Auth Routes */}
      <Route path="/admin/login" element={<AuthLayout><LoginPage /></AuthLayout>} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout><DashboardPage /></AdminLayout>} />
      <Route path="/admin/dashboard" element={<AdminLayout><DashboardPage /></AdminLayout>} />
      <Route path="/admin/orders" element={<AdminLayout><ManageOrdersPage /></AdminLayout>} />
      <Route path="/admin/orders/:id" element={<AdminLayout><OrderDetailPage /></AdminLayout>} />
      <Route path="/admin/notes" element={<AdminLayout><ManageNotesPage /></AdminLayout>} />
      <Route path="/admin/institutes" element={<AdminLayout><ManageInstitutesPage /></AdminLayout>} />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <WishlistProvider>
            <RecentlyViewedProvider>
              <AppRoutes />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#1e293b',
                    color: '#fff',
                    borderRadius: '12px',
                    padding: '16px 20px',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </RecentlyViewedProvider>
          </WishlistProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;