import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import Button from '../../components/common/Button';
import { User, Mail, Shield, MapPin, Package, Heart, LogOut } from 'lucide-react';
import { formatRole } from '../../utils/formatters';
import { ROLES } from '../../utils/constants';
import companyService from '../../services/companyService';
import authService from '../../services/authService';
import { updateUserCompanyAffiliation } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const dispatch = useDispatch();
  const [availableCompanies, setAvailableCompanies] = useState([]);
  const [companyAffiliated, setCompanyAffiliated] = useState(Boolean(user?.companyAffiliated));
  const [affiliatedCompany, setAffiliatedCompany] = useState(user?.affiliatedCompany || '');
  const [employeeId, setEmployeeId] = useState(user?.employeeId || '');
  const [savingAffiliation, setSavingAffiliation] = useState(false);

  useEffect(() => {
    companyService.getAvailable()
      .then(setAvailableCompanies)
      .catch(() => setAvailableCompanies([]));
  }, []);

  useEffect(() => {
    setCompanyAffiliated(Boolean(user?.companyAffiliated));
    setAffiliatedCompany(user?.affiliatedCompany || '');
    setEmployeeId(user?.employeeId || '');
  }, [user?.companyAffiliated, user?.affiliatedCompany, user?.employeeId]);

  const saveAffiliation = async (event) => {
    event.preventDefault();
    setSavingAffiliation(true);
    try {
      const updated = await authService.updateCompanyAffiliation({
        companyAffiliated,
        affiliatedCompany: companyAffiliated ? affiliatedCompany : null,
        employeeId: companyAffiliated ? employeeId : null,
      });
      dispatch(updateUserCompanyAffiliation(updated));
      toast.success(companyAffiliated ? 'Company affiliation verified and saved' : 'Company affiliation removed');
    } catch (error) {
      toast.error(error.message || 'Could not update company affiliation');
    } finally {
      setSavingAffiliation(false);
    }
  };

  const removeAffiliation = async () => {
    setSavingAffiliation(true);
    try {
      const updated = await authService.updateCompanyAffiliation({
        companyAffiliated: false,
        affiliatedCompany: null,
        employeeId: null,
      });
      dispatch(updateUserCompanyAffiliation(updated));
      setCompanyAffiliated(false);
      setAffiliatedCompany('');
      setEmployeeId('');
      toast.success('You have left the company tie-up facility');
    } catch (error) {
      toast.error(error.message || 'Could not remove company affiliation');
    } finally {
      setSavingAffiliation(false);
    }
  };

  const menuItems = [
    { to: '/orders', icon: <Package className="w-5 h-5" />, label: 'My Orders', desc: 'View order history' },
    { to: '/addresses', icon: <MapPin className="w-5 h-5" />, label: 'Addresses', desc: 'Manage delivery addresses' },
    { to: '/wishlist', icon: <Heart className="w-5 h-5" />, label: 'Wishlist', desc: 'Your saved items' },
  ];

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Profile Header */}
        <div
          className="rounded-3xl p-8 md:p-10 mb-8 text-center relative overflow-hidden shadow-lg border border-white/5"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary-dark), #18181b)',
          }}
        >
          {/* Decorative gradients */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)] rounded-full blur-3xl opacity-20 -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[var(--color-secondary)] rounded-full blur-3xl opacity-20 -ml-10 -mb-10" />
          
          <div className="relative z-10">
            <div className="w-24 h-24 rounded-full mx-auto mb-5 flex items-center justify-center text-4xl font-black text-white bg-white/10 backdrop-blur-md border border-white/20 shadow-md transform hover:rotate-6 transition-transform duration-300">
              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-1">{user?.fullName}</h1>
            <p className="text-zinc-300 text-sm font-medium">{user?.email}</p>
            <div className="inline-flex items-center gap-1.5 mt-4 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-extrabold tracking-wider uppercase border border-white/10">
              <Shield className="w-3.5 h-3.5 text-[var(--color-primary)] fill-current" />
              {formatRole(user?.role)}
            </div>
          </div>
        </div>

        {/* User Info */}
        <div
          className="rounded-3xl p-6 md:p-8 mb-8 shadow-sm"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <h2 className="font-black text-lg mb-6 tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            Account Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-2xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-orange-50 dark:bg-orange-950/20">
                <User className="w-5 h-5 text-[var(--color-primary)]" />
              </div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider mb-0.5 text-zinc-400" style={{ color: 'var(--color-text-tertiary)' }}>Full Name</p>
              <p className="font-bold text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>{user?.fullName}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-blue-50 dark:bg-blue-950/20">
                <Mail className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider mb-0.5 text-zinc-400" style={{ color: 'var(--color-text-tertiary)' }}>Email Address</p>
              <p className="font-bold text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>{user?.email}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-green-50 dark:bg-green-950/20">
                <Shield className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider mb-0.5 text-zinc-400" style={{ color: 'var(--color-text-tertiary)' }}>Access Role</p>
              <p className="font-bold text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>{formatRole(user?.role)}</p>
            </div>
          </div>
        </div>

        {user?.role === ROLES.CUSTOMER && (
          <form onSubmit={saveAffiliation} className="rounded-3xl p-6 md:p-8 mb-8 shadow-sm" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <h2 className="font-black text-lg mb-2 tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Company affiliation</h2>
            <p className="text-sm mb-5" style={{ color: 'var(--color-text-secondary)' }}>Existing customers can verify or update their company here. Your full name, company, and employee ID must match a restaurant’s approved employee roster.</p>
            <label className="flex items-start gap-3 text-sm font-semibold cursor-pointer mb-4" style={{ color: 'var(--color-text-primary)' }}>
              <input type="checkbox" checked={companyAffiliated} onChange={(event) => setCompanyAffiliated(event.target.checked)} className="mt-1 h-4 w-4 accent-[var(--color-primary)]" />
              <span>I am affiliated with a company</span>
            </label>
            {companyAffiliated && <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Company</label>
                <select required value={affiliatedCompany} onChange={(event) => setAffiliatedCompany(event.target.value)} className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}>
                  <option value="">Select your company</option>
                  {availableCompanies.map((company) => <option key={company} value={company}>{company}</option>)}
                </select>
                {availableCompanies.length === 0 && <p className="mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>No approved restaurant company tie-ups are available yet.</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Employee ID</label>
                <input required maxLength={80} value={employeeId} onChange={(event) => setEmployeeId(event.target.value)} placeholder="Enter your employee ID" className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }} />
              </div>
            </div>}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>At tied-up restaurants, your eligible order is split 50/50 between you and the company.</p>
              <div className="flex flex-col sm:flex-row gap-2">
                {user?.companyAffiliated && <Button type="button" variant="danger" disabled={savingAffiliation} onClick={removeAffiliation}>Leave company facility</Button>}
                <Button type="submit" loading={savingAffiliation}>Save affiliation</Button>
              </div>
            </div>
          </form>
        )}

        {/* Quick Links */}
        <div className="space-y-4 mb-8">
          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-4 p-5 rounded-2xl transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 border group cursor-pointer"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[var(--color-bg-tertiary)] group-hover:bg-[var(--color-primary-light)] transition-colors">
                <span className="text-[var(--color-primary)]">{item.icon}</span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm group-hover:text-[var(--color-primary)] transition-colors" style={{ color: 'var(--color-text-primary)' }}>{item.label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>{item.desc}</p>
              </div>
              <span className="text-lg font-bold group-hover:translate-x-1 duration-200 transition-transform" style={{ color: 'var(--color-text-tertiary)' }}>›</span>
            </Link>
          ))}
        </div>

        {/* Logout */}
        <Button variant="danger" fullWidth onClick={logout} className="rounded-2xl py-4 font-bold flex items-center justify-center gap-2">
          <LogOut className="w-4 h-4" /> Sign Out from Velora
        </Button>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
