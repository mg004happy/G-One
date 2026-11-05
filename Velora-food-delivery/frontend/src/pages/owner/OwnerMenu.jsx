import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFoodsByRestaurant, setFoodAvailability } from '../../store/slices/foodSlice';
import { fetchRestaurants } from '../../store/slices/restaurantSlice';
import MainLayout from '../../layouts/MainLayout';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency } from '../../utils/formatters';
import { ArrowLeft, UtensilsCrossed, Plus, Trash2, Edit, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { requiredRule, priceRules } from '../../utils/validators';
import { CATEGORIES } from '../../utils/constants';
import foodService from '../../services/foodService';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { usePolling } from '../../hooks/usePolling';

const OwnerMenu = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { foodsByRestaurant, loading, error: foodsError } = useSelector((state) => state.foods);
  const { restaurants } = useSelector((state) => state.restaurants);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [updatingAvailabilityId, setUpdatingAvailabilityId] = useState(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const myRestaurants = (restaurants || []).filter((restaurant) => restaurant.ownerEmail === user?.email);
  const activeRestaurantId = myRestaurants.some((restaurant) => String(restaurant.id) === selectedRestaurantId)
    ? selectedRestaurantId
    : String(myRestaurants[0]?.id ?? '');
  const myRestaurant = myRestaurants.find((restaurant) => String(restaurant.id) === activeRestaurantId);

  useEffect(() => {
    dispatch(fetchRestaurants());
  }, [dispatch]);

  useEffect(() => {
    if (myRestaurant?.id) dispatch(fetchFoodsByRestaurant(myRestaurant.id));
  }, [dispatch, myRestaurant?.id]);
  usePolling(() => {
    dispatch(fetchRestaurants());
    if (myRestaurant?.id) dispatch(fetchFoodsByRestaurant(myRestaurant.id));
  });

  const inputStyle = (error) => ({
    backgroundColor: 'var(--color-bg-secondary)',
    border: `1.5px solid ${error ? 'var(--color-error)' : 'var(--color-border)'}`,
    color: 'var(--color-text-primary)',
  });

  const onSubmit = async (data) => {
    if (!myRestaurant?.id) return toast.error('Create a restaurant first');
    setSubmitting(true);
    try {
      const payload = { ...data, restaurantId: myRestaurant.id, price: parseFloat(data.price) };
      if (editingItem) {
        await foodService.update(editingItem.id, payload);
        toast.success('Menu item updated!');
      } else {
        await foodService.create(payload);
        toast.success('Menu item added!');
      }
      reset();
      setShowForm(false);
      setEditingItem(null);
      dispatch(fetchFoodsByRestaurant(myRestaurant.id));
    } catch (err) {
      toast.error(err?.message || `Failed to ${editingItem ? 'update' : 'add'} item`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await foodService.delete(id);
      toast.success('Item deleted');
      if (myRestaurant?.id) dispatch(fetchFoodsByRestaurant(myRestaurant.id));
    } catch (err) {
      toast.error(err?.message || 'Failed to delete');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    reset({
      name: item.name,
      price: item.price,
      category: item.category,
      veg: item.veg,
      available: item.available,
      description: item.description || '',
      imageUrl: item.imageUrl || '',
    });
    setShowForm(true);
  };

  const handleAvailabilityToggle = async (item) => {
    const nextAvailable = !item.available;
    dispatch(setFoodAvailability({ id: item.id, available: nextAvailable }));
    setUpdatingAvailabilityId(item.id);
    try {
      await foodService.update(item.id, {
        name: item.name,
        description: item.description || '',
        price: item.price,
        imageUrl: item.imageUrl || '',
        category: item.category,
        veg: item.veg,
        available: nextAvailable,
        restaurantId: item.restaurantId,
      });
      toast.success(item.available ? 'Menu item hidden from customers' : 'Menu item available to customers');
    } catch (err) {
      dispatch(setFoodAvailability({ id: item.id, available: item.available }));
      toast.error(err?.message || 'Failed to change item availability');
    } finally {
      setUpdatingAvailabilityId(null);
    }
  };

  const availableItems = foodsByRestaurant.filter((item) => item.available);
  const unavailableItems = foodsByRestaurant.filter((item) => !item.available);
  const renderItems = (items) => items.length === 0 ? (
    <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-tertiary)' }}>No items in this section yet.</p>
  ) : (
    <div className="grid gap-3">
      {items.map((item) => (
        <div key={item.id} className="group flex flex-col gap-4 rounded-2xl border p-4 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-[var(--color-bg-tertiary)]">
            <img src={item.imageUrl || '/images/default-food.jpg'} alt={item.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className={item.veg ? 'veg-indicator' : 'nonveg-indicator'} style={{ width: 14, height: 14, flexShrink: 0 }} />
              <h4 className="truncate text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>{item.name}</h4>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${item.available ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{item.available ? 'Available' : 'Hidden'}</span>
            </div>
            <p className="mt-1 text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>{item.category?.replaceAll('_', ' ')}</p>
          </div>
          <span className="text-lg font-bold sm:min-w-24 sm:text-right" style={{ color: 'var(--color-text-primary)' }}>{formatCurrency(item.price)}</span>
          <div className="flex flex-wrap items-center gap-2 border-t pt-3 sm:border-0 sm:pt-0" style={{ borderColor: 'var(--color-border-light)' }}>
            <Button size="sm" variant="ghost" onClick={() => handleEdit(item)} title="Edit menu item"><Edit className="w-3.5 h-3.5" /></Button>
            <Button size="sm" variant="ghost" disabled={updatingAvailabilityId === item.id} onClick={() => handleAvailabilityToggle(item)} title={item.available ? 'Hide from customers' : 'Show to customers'}>
              {item.available ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span className="ml-1">{item.available ? 'Hide' : 'Make Available'}</span>
            </Button>
            <Button size="sm" variant="danger" onClick={() => handleDelete(item.id)} title="Delete menu item"><Trash2 className="w-3.5 h-3.5" /></Button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link to="/owner" className="p-2 rounded-xl transition-colors hover:bg-[var(--color-bg-tertiary)]">
              <ArrowLeft className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
            </Link>
            <h1 className="text-2xl font-black" style={{ color: 'var(--color-text-primary)' }}>
              <UtensilsCrossed className="inline w-6 h-6 mr-2" /> Menu Management
            </h1>
          </div>
          <Button onClick={() => {
            if (showForm) {
              setShowForm(false);
              setEditingItem(null);
              reset();
            } else {
              setEditingItem(null);
              reset({ category: CATEGORIES[0]?.value, veg: false, available: true });
              setShowForm(true);
            }
          }}>
            <Plus className="w-4 h-4" /> Add Item
          </Button>
        </div>

        {myRestaurants.length > 0 && (
          <div className="mb-6">
            <label htmlFor="menu-restaurant" className="mb-2 block text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Select restaurant</label>
            <div className="relative w-full sm:max-w-md">
              <select
                id="menu-restaurant"
                value={activeRestaurantId}
                onChange={(event) => setSelectedRestaurantId(event.target.value)}
                className="h-12 w-full appearance-none rounded-xl border px-4 pr-10 text-sm font-medium shadow-sm transition-colors hover:border-[var(--color-primary)]/40 focus-visible:outline-none focus-visible:ring-0"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)', outline: 'none', boxShadow: 'var(--shadow-sm)' }}
              >
                {myRestaurants.map((restaurant) => <option key={restaurant.id} value={restaurant.id}>{restaurant.name}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--color-text-secondary)' }} />
            </div>
          </div>
        )}

        {/* Add or edit menu item */}
        {showForm && (
          <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl p-6 mb-8 animate-fade-in space-y-4" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Name</label>
                <input {...register('name', requiredRule('Name'))} className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle(errors.name)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Price (₹)</label>
                <input type="number" step="0.01" {...register('price', priceRules)} className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle(errors.price)} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Category</label>
                <select {...register('category', requiredRule('Category'))} className="w-full px-4 py-3 rounded-xl text-sm outline-none cursor-pointer" style={inputStyle(errors.category)}>
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
                </select>
              </div>
              <div className="flex items-end gap-4 pb-1">
                <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  <input type="checkbox" {...register('veg')} className="w-4 h-4" /> Vegetarian
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  <input type="checkbox" {...register('available')} defaultChecked className="w-4 h-4" /> Available
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Description</label>
              <textarea {...register('description')} rows={2} className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none" style={inputStyle(false)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Image URL</label>
              <input {...register('imageUrl')} className="w-full px-4 py-3 rounded-xl text-sm outline-none" placeholder="https://..." style={inputStyle(false)} />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" type="button" onClick={() => { setShowForm(false); setEditingItem(null); reset(); }}>Cancel</Button>
              <Button type="submit" loading={submitting}>{editingItem ? 'Save Changes' : 'Add Item'}</Button>
            </div>
          </form>
        )}

        {/* Items List */}
        {loading ? <LoadingSpinner text="Loading menu..." /> : foodsError ? (
          <EmptyState icon="⚠️" title="Menu could not be loaded" description={foodsError} action={<Button onClick={() => myRestaurant?.id && dispatch(fetchFoodsByRestaurant(myRestaurant.id))}>Try Again</Button>} />
        ) : foodsByRestaurant.length === 0 ? (
          <EmptyState icon="🍕" title="No menu items" description="Add your first dish to start receiving orders" action={<Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4" /> Add Item</Button>} />
        ) : (
          <div className="space-y-6">
            <section className="rounded-2xl border p-4 sm:p-5" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Available items</h2>
                  <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Visible to customers</p>
                </div>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">{availableItems.length}</span>
              </div>
              {renderItems(availableItems)}
            </section>
            <section className="rounded-2xl border p-4 sm:p-5" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Unavailable items</h2>
                  <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Hidden from customers</p>
                </div>
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">{unavailableItems.length}</span>
              </div>
              {renderItems(unavailableItems)}
            </section>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default OwnerMenu;
