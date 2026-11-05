import { useForm, useWatch } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import AuthLayout from '../../layouts/AuthLayout';
import { emailRules, passwordRules, fullNameRules, phoneRules } from '../../utils/validators';
import { ROLES } from '../../utils/constants';
import toast from 'react-hot-toast';
import BrandLogo from '../../components/common/BrandLogo';
import companyService from '../../services/companyService';

const RegisterPage = () => {
  const { register, handleSubmit, control, setError, formState: { errors } } = useForm({
    defaultValues: { role: ROLES.CUSTOMER, companyAffiliated: false },
  });
  const { register: registerUser, loading, error, isAuthenticated, user, clearError } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [availableCompanies, setAvailableCompanies] = useState([]);

  const selectedRole = useWatch({ control, name: 'role' });
  const companyAffiliated = useWatch({ control, name: 'companyAffiliated' });

  useEffect(() => {
    companyService.getAvailable().then(setAvailableCompanies).catch(() => setAvailableCompanies([]));
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === ROLES.ADMIN) navigate('/admin', { replace: true });
      else if (user.role === ROLES.RESTAURANT_OWNER) navigate('/owner', { replace: true });
      else navigate('/', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => { clearError(); }, [clearError]);

  const onSubmit = async (data) => {
    const result = await registerUser(data);
    if (result.meta?.requestStatus === 'fulfilled') {
      toast.success('Account created! 🎉');
    } else {
      const message = String(result.payload || '').toLowerCase();
      if (message.includes('email')) setError('email', { type: 'server', message: 'An account with this email address already exists' });
      if (message.includes('phone')) setError('phoneNumber', { type: 'server', message: 'An account with this phone number already exists' });
    }
  };

  const roles = [
    { value: ROLES.CUSTOMER, label: '🛒 Customer', desc: 'Order food' },
    { value: ROLES.RESTAURANT_OWNER, label: '🍳 Restaurant Owner', desc: 'Manage restaurant' },
  ];

  return (
    <AuthLayout>
      <div
        className="rounded-3xl p-8 shadow-xl"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div className="text-center mb-8">
          <Link to="/" className="mb-4 inline-flex items-center" aria-label="Velora home">
            <BrandLogo className="h-16 w-28" />
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Create Account
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Join Velora for fast food delivery
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl text-sm" style={{ color: 'var(--color-error)', backgroundColor: 'var(--color-error-light)', border: '1px solid var(--color-error)' }}>{error}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} />
              <input
                type="text"
                {...register('fullName', fullNameRules)}
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  border: `1.5px solid ${errors.fullName ? 'var(--color-error)' : 'var(--color-border)'}`,
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>
            {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Email</label>
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

          {/* Phone number */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} />
              <input
                type="tel"
                {...register('phoneNumber', phoneRules)}
                placeholder="+91 9876543210"
                autoComplete="tel"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ backgroundColor: 'var(--color-bg-secondary)', border: `1.5px solid ${errors.phoneNumber ? 'var(--color-error)' : 'var(--color-border)'}`, color: 'var(--color-text-primary)' }}
              />
            </div>
            {errors.phoneNumber && <p className="text-xs text-red-500 mt-1">{errors.phoneNumber.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password', passwordRules)}
                placeholder="Min. 6 characters"
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

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>I am a</label>
            <div className="grid grid-cols-2 gap-3">
              {roles.map((r) => {
                const isSelected = selectedRole === r.value;
                return (
                  <label
                    key={r.value}
                    className="flex flex-col items-center p-3 rounded-xl cursor-pointer transition-all border-2 text-center"
                    style={{
                      borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                      backgroundColor: isSelected ? 'var(--color-primary-light)' : 'transparent',
                    }}
                  >
                    <input type="radio" value={r.value} {...register('role', { required: 'Role is required' })} className="sr-only" />
                    <span className="text-lg mb-1">{r.label.split(' ')[0]}</span>
                    <span className="text-xs font-semibold" style={{ color: isSelected ? 'var(--color-primary-dark)' : 'var(--color-text-primary)' }}>{r.label.split(' ').slice(1).join(' ')}</span>
                    <span className="text-[10px]" style={{ color: isSelected ? 'var(--color-primary-dark)' : 'var(--color-text-tertiary)' }}>{r.desc}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {selectedRole === ROLES.CUSTOMER && (
            <div className="space-y-3 rounded-xl p-4" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
              <label className="flex items-start gap-3 text-sm font-medium cursor-pointer" style={{ color: 'var(--color-text-primary)' }}>
                <input type="checkbox" {...register('companyAffiliated')} className="mt-1 h-4 w-4 accent-[var(--color-primary)]" />
                <span>I am affiliated with a company</span>
              </label>
              {companyAffiliated && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Company</label>
                    <select
                      {...register('affiliatedCompany', { required: 'Select your company' })}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                    >
                      <option value="">Select your company</option>
                      {availableCompanies.map((company) => <option key={company} value={company}>{company}</option>)}
                    </select>
                    {availableCompanies.length === 0 && <p className="mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>Company choices appear after a restaurant with a company tie-up is approved.</p>}
                    {errors.affiliatedCompany && <p className="text-xs text-red-500 mt-1">{errors.affiliatedCompany.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Employee ID</label>
                    <input
                      {...register('employeeId', { required: 'Employee ID is required' })}
                      placeholder="Enter your employee ID"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                    />
                    {errors.employeeId && <p className="text-xs text-red-500 mt-1">{errors.employeeId.message}</p>}
                  </div>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Your full name, company, and employee ID must match the restaurant’s approved employee roster.</p>
                </div>
              )}
            </div>
          )}

          <Button type="submit" fullWidth loading={loading} size="lg">
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--color-text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold" style={{ color: 'var(--color-primary)' }}>
            Sign In
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
