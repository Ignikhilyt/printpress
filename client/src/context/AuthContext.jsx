import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverConnected, setServerConnected] = useState(true);

  // Validate token with server on mount
  const validateSession = useCallback(async () => {
    const token = authService.getToken();

    if (!token) {
      setAdmin(null);
      setLoading(false);
      return;
    }

    try {
      // Verify token with server
      const response = await authService.getProfile();

      if (response.success && response.data) {
        setAdmin(response.data);
        setServerConnected(true);
      } else {
        // Token invalid - clear it
        authService.clearAuth();
        setAdmin(null);
      }
    } catch (error) {
      console.error('Session validation failed:', error);

      // Check if server is down vs token is invalid
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        // Server is down - don't clear auth, show warning
        setServerConnected(false);
        toast.error('Cannot connect to server. Please ensure the backend is running.');
        // Still use cached admin data for UI, but mark as unvalidated
        const cachedAdmin = authService.getAdmin();
        if (cachedAdmin) {
          setAdmin({ ...cachedAdmin, _unvalidated: true });
        }
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        // Token is invalid/expired - clear it
        authService.clearAuth();
        setAdmin(null);
        toast.error('Session expired. Please login again.');
      } else {
        // Other error - clear auth to be safe
        authService.clearAuth();
        setAdmin(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    validateSession();
  }, [validateSession]);

  const login = async (email, password) => {
    try {
      const result = await authService.login(email, password);
      if (result.success) {
        setAdmin(result.data.admin);
        setServerConnected(true);
        toast.success('Login successful!');
      }
      return result;
    } catch (error) {
      if (error.code === 'ERR_NETWORK') {
        setServerConnected(false);
        toast.error('Cannot connect to server. Please start the backend.');
        return { success: false, message: 'Server not available' };
      }
      throw error;
    }
  };

  const logout = () => {
    setAdmin(null);
    authService.logout();
    toast.success('Logged out successfully');
  };

  // Refresh session periodically (every 5 minutes)
  useEffect(() => {
    if (!admin) return;

    const interval = setInterval(() => {
      validateSession();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [admin, validateSession]);

  const value = {
    admin,
    loading,
    login,
    logout,
    isAuthenticated: !!admin && !admin._unvalidated,
    isUnvalidated: !!admin?._unvalidated,
    serverConnected,
    refreshSession: validateSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}