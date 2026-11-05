import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchRestaurants } from '../../store/slices/restaurantSlice';
import { useAuth } from '../../hooks/useAuth';
import MainLayout from '../../layouts/MainLayout';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatTime } from '../../utils/formatters';
import { Store, Package, UtensilsCrossed, Plus, Star, Clock, MapPin, Pencil, Power, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePolling } from '../../hooks/usePolling';
import restaurantService from '../../services/restaurantService';
import toast from 'react-hot-toast';

const OwnerDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { restaurants, loading } = useSelector((state) => state.restaurants);
  const [updatingRestaurantId, setUpdatingRestaurantId] = useState(null);

  useEffect(() => {
    dispatch(fetchRestaurants());
  }, [dispatch]);
  usePolling(() => dispatch(fetchRestaurants()));

  const myRestaurants = (restaurants || []).filter(
    (restaurant) => restaurant.ownerEmail === user?.email,
  );
  const hasRestaurant = myRestaurants.length > 0;

  const toggleRestaurantAvailability = async (restaurant) => {
    setUpdatingRestaurantId(restaurant.id);
    try {
      await restaurantService.setAvailability(restaurant.id, !restaurant.active);
      await dispatch(fetchRestaurants()).unwrap();
      toast.success(`${restaurant.name} is now ${restaurant.active ? 'closed' : 'open'} for orders`);
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Could not update restaurant availability');
    } finally {
      setUpdatingRestaurantId(null);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-10 border-b pb-6" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
              Owner Dashboard
            </h1>
            <p className="text-sm mt-1 font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Welcome back, {user?.fullName || 'Partner'}
            </p>
          </div>
          <Link to="/owner/restaurant">
            <Button className="shadow-md hover:shadow-lg transition-all"><Plus className="w-4 h-4 mr-1" /> Add Restaurant</Button>
          </Link>
        </div>

        {/* Quick Links */}
        <h2 className="text-xl font-black tracking-tight mb-4" style={{ color: 'var(--color-text-primary)' }}>Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {[
            { to: '/owner/restaurant', label: 'Add Restaurant', desc: 'Set up another restaurant', icon: <Store className="w-6 h-6" />, color: '#FF6B35' },
            ...(hasRestaurant ? [
              { to: `/owner/restaurant/${myRestaurants[0].id}`, label: 'Restaurant details', desc: 'Edit your restaurant information', icon: <Pencil className="w-6 h-6" />, color: '#F59E0B' },
              { to: `/owner/restaurant/${myRestaurants[0].id}/tie-ups`, label: 'Company tie-ups', desc: 'Manage companies partnered with your restaurant', icon: <Store className="w-6 h-6" />, color: '#D97706' },
              { to: `/owner/restaurant/${myRestaurants[0].id}/employees`, label: 'Employee verification roster', desc: 'Add employees and review their order and company balances', icon: <UsersRound className="w-6 h-6" />, color: '#0EA5E9' },
            ] : []),
            { to: '/owner/menu', label: 'Manage Menu', desc: 'Add or update food items', icon: <UtensilsCrossed className="w-6 h-6" />, color: '#8B5CF6' },
            { to: '/owner/orders', label: 'View Orders', desc: 'Process customer orders', icon: <Package className="w-6 h-6" />, color: '#10B981' },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-2xl p-6 border group hover:shadow-md transition-all duration-300 relative overflow-hidden"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: link.color }} />
              
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors" style={{ backgroundColor: `${link.color}15`, color: link.color }}>
                  {link.icon}
                </div>
              </div>
              <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--color-text-primary)' }}>{link.label}</h3>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>{link.desc}</p>
            </Link>
          ))}
        </div>

        {/* Restaurant List */}
        <h2 className="text-xl font-black tracking-tight mb-4" style={{ color: 'var(--color-text-primary)' }}>Your Restaurants</h2>
        {loading ? <LoadingSpinner text="Loading..." /> : myRestaurants.length === 0 ? (
          <div className="text-center py-20 rounded-3xl border border-dashed" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <p className="text-5xl mb-6">🍽️</p>
            <p className="font-black text-xl mb-2" style={{ color: 'var(--color-text-primary)' }}>No restaurants yet</p>
            <p className="text-sm mb-6 max-w-md mx-auto leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>Create your restaurant to start receiving orders.</p>
            <Link to="/owner/restaurant"><Button size="lg" className="shadow-md"><Plus className="w-4 h-4 mr-2" /> Create Restaurant</Button></Link>
          </div>
        ) : (
          <div className="grid gap-5 stagger-children">
            {myRestaurants.map((r) => (
              <div key={r.id} className="flex flex-col sm:flex-row items-center gap-5 p-5 rounded-2xl transition-all hover:shadow-md border" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <div className="w-full sm:w-24 h-48 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 relative group">
                  <img src={r.imageUrl || '/images/default-restaurant.jpg'} alt={r.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="flex-1 w-full min-w-0 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-black text-lg truncate pr-4" style={{ color: 'var(--color-text-primary)' }}>{r.name}</h3>
                      <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full flex-shrink-0 border ${r.closedByAdmin ? 'bg-red-50 text-red-700 border-red-200' : !r.approved ? 'bg-amber-50 text-amber-700 border-amber-200' : r.active ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                        {r.closedByAdmin ? 'Closed by the admin' : !r.approved ? 'Pending Approval' : r.active ? 'Open' : 'Closed'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium mb-3" style={{ color: 'var(--color-text-tertiary)' }}>
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="truncate">{r.address}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    <div className="flex items-center gap-1.5 bg-[var(--color-bg-tertiary)] px-2.5 py-1.5 rounded-md">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatTime(r.openingTime)} - {formatTime(r.closingTime)}</span>
                    </div>
                    {r.averageRating > 0 && (
                      <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2.5 py-1.5 rounded-md border border-amber-200">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-bold">{r.averageRating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
                    {r.approved && (
                      <Button
                        size="sm"
                        variant={r.active ? 'danger' : 'success'}
                        disabled={updatingRestaurantId === r.id}
                        onClick={() => toggleRestaurantAvailability(r)}
                      >
                        <Power className="h-3.5 w-3.5" />
                        {updatingRestaurantId === r.id ? 'Updating...' : r.active ? 'Close' : 'Open'}
                      </Button>
                    )}
                    <Link to={`/owner/restaurant/${r.id}`}>
                      <Button size="sm" variant="ghost"><Pencil className="w-3.5 h-3.5 mr-1" /> Edit details</Button>
                    </Link>
                    <Link to={`/owner/restaurant/${r.id}/tie-ups`}>
                      <Button size="sm" variant="ghost"><Store className="w-3.5 h-3.5 mr-1" /> Company tie-ups</Button>
                    </Link>
                    <Link to={`/owner/restaurant/${r.id}/employees`}>
                      <Button size="sm" variant="ghost"><UsersRound className="w-3.5 h-3.5 mr-1" /> Employee roster</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default OwnerDashboard;
