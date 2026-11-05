import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import AuthLayout from '../../layouts/AuthLayout';
import { emailRules, passwordRules } from '../../utils/validators';
import { ROLES } from '../../utils/constants';
import toast from 'react-hot-toast';
import BrandLogo from '../../components/common/BrandLogo';

const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login, loading, error, isAuthenticated, user, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === ROLES.ADMIN) navigate('/admin', { replace: true });
      else if (user.role === ROLES.RESTAURANT_OWNER) navigate('/owner', { replace: true });
      else navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, from]);

  useEffect(() => { clearError(); }, [clearError]);

  const onSubmit = async (data) => {
    const result = await login(data);
    if (result.meta?.requestStatus === 'fulfilled') {
      toast.success('Welcome back! 🎉');
    }
  };

  return (
    <AuthLayout>
      <div
        className="rounded-3xl p-8 shadow-xl"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="mb-4 inline-flex items-center" aria-label="Velora home">
            <BrandLogo className="h-16 w-28" />
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Welcome Back
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Sign in to order your favourite food
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-xl text-sm" style={{ color: 'var(--color-error)', backgroundColor: 'var(--color-error-light)', border: '1px solid var(--color-error)' }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} />
              <input
                type="email"
                {...register('email', emailRules)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  border: `1.5px solid ${errors.email ? 'var(--color-error)' : 'var(--color-border)'}`,
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password', passwordRules)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  border: `1.5px solid ${errors.password ? 'var(--color-error)' : 'var(--color-border)'}`,
                  color: 'var(--color-text-primary)',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          <Button type="submit" fullWidth loading={loading} size="lg">
            Sign In
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm mt-6" style={{ color: 'var(--color-text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold" style={{ color: 'var(--color-primary)' }}>
            Sign Up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
