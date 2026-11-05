import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats, fetchOrderAnalytics, fetchRevenueAnalytics } from '../../store/slices/adminSlice';
import { Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency } from '../../utils/formatters';
import { Users, Store, Package, DollarSign, TrendingUp, ShieldCheck, Clock, XCircle, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { usePolling } from '../../hooks/usePolling';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { stats, orderAnalytics, revenueAnalytics, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchOrderAnalytics());
    dispatch(fetchRevenueAnalytics(30));
  }, [dispatch]);
  usePolling(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchOrderAnalytics());
    dispatch(fetchRevenueAnalytics(30));
  });

  if (loading && !stats) return <MainLayout><div className="flex justify-center items-center h-[60vh]"><LoadingSpinner text="Loading your dashboard..." /></div></MainLayout>;

  const statCards = stats
    ? [
        { label: 'Total Users', value: stats.totalUsers, icon: <Users className="w-5 h-5" />, color: '#3B82F6', to: '/admin/users' },
        { label: 'Restaurants', value: stats.totalRestaurants, icon: <Store className="w-5 h-5" />, color: '#FF6B35', to: '/admin/restaurants' },
        { label: 'Total Orders', value: stats.totalOrders, icon: <Package className="w-5 h-5" />, color: '#8B5CF6', to: '/admin/orders' },
        { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue || 0), icon: <DollarSign className="w-5 h-5" />, color: '#10B981' },
        { label: 'Today Revenue', value: formatCurrency(stats.todayRevenue || 0), icon: <TrendingUp className="w-5 h-5" />, color: '#10B981' },
        { label: 'Completed', value: stats.totalCompletedOrders, icon: <ShieldCheck className="w-5 h-5" />, color: '#10B981' },
        { label: 'Pending', value: stats.totalPendingOrders, icon: <Clock className="w-5 h-5" />, color: '#F59E0B' },
        { label: 'Cancelled', value: stats.totalCancelledOrders, icon: <XCircle className="w-5 h-5" />, color: '#EF4444' },
      ]
    : [];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-10 border-b pb-6" style={{ borderColor: 'var(--color-border)' }}>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            Overview
          </h1>
          <p className="text-sm mt-1 font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Welcome back to the Velora admin control center.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 stagger-children">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative overflow-hidden group"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: card.color }} />
              
              {card.to ? (
                <Link to={card.to} className="block h-full">
                  <StatCardContent card={card} />
                </Link>
              ) : (
                <StatCardContent card={card} />
              )}
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12 stagger-children">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 rounded-2xl p-6 shadow-sm border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Revenue Trend (30 Days)</h3>
            </div>
            <div className="h-80 w-full">
              {revenueAnalytics ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueAnalytics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" strokeOpacity={0.5} />
                    <XAxis dataKey="date" tickFormatter={(tick) => new Date(tick).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} stroke="var(--color-text-tertiary)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="var(--color-text-tertiary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.75rem', color: 'var(--color-text-primary)', boxShadow: 'var(--shadow-lg)' }} 
                      formatter={(value) => [formatCurrency(value), 'Revenue']} 
                      labelFormatter={(label) => new Date(label).toLocaleDateString()} 
                      cursor={{ stroke: 'var(--color-border)', strokeWidth: 1, strokeDasharray: '3 3' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center"><LoadingSpinner /></div>
              )}
            </div>
          </div>

          {/* Order Status Pie Chart */}
          <div className="rounded-2xl p-6 shadow-sm border flex flex-col" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <h3 className="text-lg font-bold tracking-tight mb-6" style={{ color: 'var(--color-text-primary)' }}>Orders by Status</h3>
            <div className="flex-1 min-h-[250px] w-full relative">
              {orderAnalytics && orderAnalytics.ordersByStatus ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(orderAnalytics.ordersByStatus).map(([name, value]) => ({ name, value }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={95}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {Object.keys(orderAnalytics.ordersByStatus).map((key, index) => {
                        const colors = ['#10B981', '#FF6B35', '#F59E0B', '#EF4444', '#8B5CF6'];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.75rem', color: 'var(--color-text-primary)', boxShadow: 'var(--shadow-md)' }} 
                      itemStyle={{ color: 'var(--color-text-primary)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center"><LoadingSpinner /></div>
              )}
            </div>
            {orderAnalytics && orderAnalytics.ordersByStatus && (
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                 {Object.entries(orderAnalytics.ordersByStatus).map(([name, value], index) => {
                    const colors = ['#10B981', '#FF6B35', '#F59E0B', '#EF4444', '#8B5CF6'];
                    return (
                      <div key={name} className="flex items-center gap-2 text-xs font-medium bg-[var(--color-bg-tertiary)] px-2.5 py-1.5 rounded-md">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[index % colors.length] }}></div>
                        <span style={{ color: 'var(--color-text-secondary)' }}>{name} ({value})</span>
                      </div>
                    );
                 })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <h3 className="text-lg font-bold tracking-tight mb-4" style={{ color: 'var(--color-text-primary)' }}>Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { to: '/admin/users', label: 'Manage Users', desc: 'View and manage user accounts', icon: <Users className="w-6 h-6" />, bg: '#FAFAFA', color: '#3B82F6' },
            { to: '/admin/restaurants', label: 'Manage Restaurants', desc: 'Approve or disable restaurants', icon: <Store className="w-6 h-6" />, bg: '#FAFAFA', color: '#FF6B35' },
            { to: '/admin/orders', label: 'Manage Orders', desc: 'View and filter platform orders', icon: <Package className="w-6 h-6" />, bg: '#FAFAFA', color: '#10B981' },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-2xl p-6 border group hover:shadow-md transition-all duration-300"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors" style={{ backgroundColor: `${link.color}15`, color: link.color }}>
                  {link.icon}
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-gray-700 transition-colors" />
              </div>
              <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--color-text-primary)' }}>{link.label}</h3>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

const StatCardContent = ({ card }) => (
  <div className="flex flex-col h-full">
    <div className="flex items-center justify-between mb-4">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${card.color}15`, color: card.color }}
      >
        {card.icon}
      </div>
      {card.to && <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--color-text-tertiary)' }} />}
    </div>
    <p className="text-sm font-medium mb-1 uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
      {card.label}
    </p>
    <p className="text-3xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
      {card.value}
    </p>
  </div>
);

export default AdminDashboard;
