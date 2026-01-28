/**
 * Login Page
 * Premium admin login with animated background, form validation,
 * password visibility toggle, and remember me functionality.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ArrowRightIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

// ============================================================================
// ANIMATED BACKGROUND
// ============================================================================

const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Gradient background */}
    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />

    {/* Animated orbs */}
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{ duration: 8, repeat: Infinity }}
      className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500 rounded-full blur-3xl opacity-30"
    />
    <motion.div
      animate={{
        scale: [1, 1.3, 1],
        opacity: [0.2, 0.4, 0.2],
      }}
      transition={{ duration: 10, repeat: Infinity, delay: 1 }}
      className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-purple-500 rounded-full blur-3xl opacity-20"
    />
    <motion.div
      animate={{
        y: [0, -20, 0],
      }}
      transition={{ duration: 6, repeat: Infinity }}
      className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-10"
    />

    {/* Grid pattern overlay */}
    <div
      className="absolute inset-0 opacity-10"
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
        backgroundSize: '50px 50px',
      }}
    />
  </div>
);

// ============================================================================
// FLOATING CARD
// ============================================================================

const FloatingCard = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 40, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.6, delay }}
    className="relative"
  >
    {children}
  </motion.div>
);

// ============================================================================
// INPUT FIELD
// ============================================================================


const InputField = React.forwardRef(({
  label,
  type = 'text',
  icon: Icon,
  error,
  showPasswordToggle,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        )}
        <input
          ref={ref}
          type={inputType}
          className={`
                        w-full px-4 py-3.5 rounded-xl text-white placeholder-gray-400
                        bg-white/5 border border-white/10 backdrop-blur-sm
                        focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
                        transition-all ${Icon ? 'pl-12' : ''} ${showPasswordToggle ? 'pr-12' : ''}
                        ${error ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500' : ''}
                    `}
          {...props}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            {showPassword ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex items-center gap-1 mt-2 text-sm text-red-400"
          >
            <ExclamationCircleIcon className="w-4 h-4" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});

InputField.displayName = 'InputField';

// ============================================================================
// FEATURES LIST
// ============================================================================

const FeaturesList = () => {
  const features = [
    { icon: ShieldCheckIcon, text: 'Secure encrypted login' },
    { icon: SparklesIcon, text: 'Full admin dashboard access' },
    { icon: LockClosedIcon, text: 'Role-based permissions' },
  ];

  return (
    <div className="hidden lg:flex flex-col justify-center p-12">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-3xl font-bold text-white mb-4">
          Welcome to PrintPress Admin
        </h2>
        <p className="text-gray-400 mb-8">
          Manage orders, notes, and customers from a single powerful dashboard.
        </p>
        <div className="space-y-4">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="flex items-center gap-3 text-gray-300"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <feature.icon className="w-4 h-4 text-amber-400" />
              </div>
              <span>{feature.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

// ============================================================================
// MAIN LOGIN PAGE
// ============================================================================

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  // Load remembered email
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setValue('email', savedEmail);
      setRememberMe(true);
    }
  }, [setValue]);

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  async function onSubmit(data) {
    setLoading(true);
    try {
      // Save/remove email based on remember me
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', data.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      const result = await login(data.email, data.password);
      if (result.success) {
        navigate('/admin');
      } else {
        toast.error(result.message || 'Login failed');
      }
    } catch (error) {
      // Check for network/server errors
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        toast.error('Cannot connect to server. Please ensure the backend is running on port 5000.', {
          duration: 5000,
          icon: '🔌',
        });
      } else {
        toast.error(error.response?.data?.message || 'Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      <AnimatedBackground />

      {/* Left side - Features */}
      <div className="flex-1 hidden lg:block relative z-10">
        <FeaturesList />
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <div className="w-full max-w-md">
          <FloatingCard>
            {/* Logo */}
            <div className="text-center mb-8">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30"
              >
                <span className="text-white font-bold text-3xl">P</span>
              </motion.div>
              <h1 className="text-2xl font-bold text-white">Admin Login</h1>
              <p className="text-gray-400 mt-2">Sign in to access the dashboard</p>
            </div>

            {/* Form */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <InputField
                  label="Email Address"
                  type="email"
                  icon={EnvelopeIcon}
                  placeholder="admin@printpress.com"
                  error={errors.email?.message}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Please enter a valid email',
                    },
                  })}
                />

                <InputField
                  label="Password"
                  icon={LockClosedIcon}
                  placeholder="••••••••"
                  showPasswordToggle
                  error={errors.password?.message}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                />

                {/* Remember me & Forgot password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-sm text-gray-400">Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRightIcon className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Demo credentials */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-xs text-gray-500 text-center">
                  Demo credentials: <span className="text-gray-400">admin@printpress.com</span> / <span className="text-gray-400">Admin123456</span>
                </p>
              </div>
            </div>

            {/* Back to home */}
            <div className="text-center mt-6">
              <Link
                to="/"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                ← Back to PrintPress
              </Link>
            </div>
          </FloatingCard>
        </div>
      </div>
    </div>
  );
}