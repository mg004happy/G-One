import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import MainLayout from '../../layouts/MainLayout';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ArrowLeft, Store } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import restaurantService from '../../services/restaurantService';
import { requiredRule } from '../../utils/validators';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const OwnerRestaurant = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    let active = true;
    restaurantService.getAll()
      .then((restaurants) => {
        if (!active) return;
        const ownedRestaurant = id
          ? restaurants.find((item) => item.ownerEmail === user?.email && String(item.id) === id)
          : null;
        if (id && !ownedRestaurant) {
          toast.error('Restaurant not found in your account');
          navigate('/owner');
          return;
        }
        if (ownedRestaurant) {
          setRestaurant(ownedRestaurant);
          reset({
            name: ownedRestaurant.name || '',
            description: ownedRestaurant.description || '',
            address: ownedRestaurant.address || '',
            phone: ownedRestaurant.phone || '',
            openingTime: ownedRestaurant.openingTime || '',
            closingTime: ownedRestaurant.closingTime || '',
            imageUrl: ownedRestaurant.imageUrl || '',
          });
        }
      })
      .catch((error) => toast.error(error.message || 'Failed to load restaurant'))
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [id, navigate, reset, user?.email]);

  const inputStyle = (error) => ({
    backgroundColor: 'var(--color-bg-secondary)',
    border: `1.5px solid ${error ? 'var(--color-error)' : 'var(--color-border)'}`,
    color: 'var(--color-text-primary)',
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (restaurant) {
        await restaurantService.update(restaurant.id, data);
        toast.success('Restaurant details updated!');
      } else {
        await restaurantService.create(data);
        toast.success('Restaurant created!');
      }
      navigate('/owner');
    } catch (err) {
      toast.error(err?.message || `Failed to ${restaurant ? 'update' : 'create'} restaurant`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? <LoadingSpinner text="Loading restaurant..." /> : <>
        <div className="flex items-center gap-3 mb-8">
          <Link to="/owner" className="p-2 rounded-xl transition-colors hover:bg-[var(--color-bg-tertiary)]">
            <ArrowLeft className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
          </Link>
          <h1 className="text-2xl font-black" style={{ color: 'var(--color-text-primary)' }}>
            <Store className="inline w-6 h-6 mr-2" /> {restaurant ? 'Edit Restaurant Details' : 'Create Restaurant'}
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-2xl p-6" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Name</label>
            <input {...register('name', requiredRule('Name'))} className="w-full px-4 py-3 rounded-xl text-sm outline-none" placeholder="Restaurant Name" style={inputStyle(errors.name)} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Description</label>
            <textarea {...register('description')} rows={3} className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none" placeholder="Describe your restaurant" style={inputStyle(false)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Address</label>
            <input {...register('address', requiredRule('Address'))} className="w-full px-4 py-3 rounded-xl text-sm outline-none" placeholder="Full address" style={inputStyle(errors.address)} />
            {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Phone</label>
            <input {...register('phone', requiredRule('Phone'))} className="w-full px-4 py-3 rounded-xl text-sm outline-none" placeholder="+91 98765 43210" style={inputStyle(errors.phone)} />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Opening Time</label>
              <input type="time" {...register('openingTime', requiredRule('Opening time'))} className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle(errors.openingTime)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Closing Time</label>
              <input type="time" {...register('closingTime', requiredRule('Closing time'))} className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle(errors.closingTime)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>Image URL</label>
            <input {...register('imageUrl')} className="w-full px-4 py-3 rounded-xl text-sm outline-none" placeholder="https://..." style={inputStyle(false)} />
          </div>
          {!restaurant && <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>After creating your restaurant, manage company tie-ups and employee verification from their separate dashboard options.</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Link to="/owner"><Button variant="ghost" type="button">Cancel</Button></Link>
            <Button type="submit" loading={submitting}>{restaurant ? 'Save Changes' : 'Create Restaurant'}</Button>
          </div>
        </form>
        </>}
      </div>
    </MainLayout>
  );
};

export default OwnerRestaurant;
