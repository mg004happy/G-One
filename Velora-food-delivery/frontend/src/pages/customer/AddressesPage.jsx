import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { fetchAddresses, addAddress, deleteAddress, setDefaultAddress } from '../../store/slices/addressSlice';
import MainLayout from '../../layouts/MainLayout';
import AddressCard from '../../components/cards/AddressCard';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Plus, X } from 'lucide-react';
import { requiredRule, phoneRules, pincodeRules } from '../../utils/validators';
import { ADDRESS_TYPES } from '../../utils/constants';
import toast from 'react-hot-toast';

const AddressesPage = () => {
  const dispatch = useDispatch();
  const { addresses, loading } = useSelector((state) => state.addresses);
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  const onSubmit = async (data) => {
    const result = await dispatch(addAddress(data));
    if (result.meta?.requestStatus === 'fulfilled') {
      toast.success('Address added!');
      reset();
      setShowForm(false);
    } else {
      toast.error(result.payload || 'Failed to add address');
    }
  };

  const handleDelete = (id) => {
    dispatch(deleteAddress(id))
      .unwrap()
      .then(() => toast.success('Address deleted'))
      .catch((err) => toast.error(err));
  };

  const handleSetDefault = (id) => {
    dispatch(setDefaultAddress(id))
      .unwrap()
      .then(() => toast.success('Default address updated'))
      .catch((err) => toast.error(err));
  };

  const inputStyle = (error) => ({
    backgroundColor: 'var(--color-bg-secondary)',
    border: `1.5px solid ${error ? 'var(--color-error)' : 'var(--color-border)'}`,
    color: 'var(--color-text-primary)',
  });

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 mb-10" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
              My Addresses
            </h1>
            <p className="text-sm mt-2 font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Manage your delivery locations for faster checkouts
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="font-bold flex items-center gap-2 rounded-xl">
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Cancel' : 'Add New'}
          </Button>
        </div>

        {/* Add Address Form */}
        {showForm && (
          <div
            className="rounded-3xl p-6 md:p-8 mb-10 animate-fade-in shadow-sm relative overflow-hidden"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[var(--color-primary)]" />
            <h3 className="font-black text-lg mb-6 tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
              Add New Address
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>Full Name</label>
                  <input
                    {...register('fullName', requiredRule('Full name'))}
                    className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--color-primary)]/20"
                    placeholder="John Doe"
                    style={inputStyle(errors.fullName)}
                  />
                  {errors.fullName && <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.fullName.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>Phone Number</label>
                  <input
                    {...register('phoneNumber', phoneRules)}
                    className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--color-primary)]/20"
                    placeholder="+91 98765 43210"
                    style={inputStyle(errors.phoneNumber)}
                  />
                  {errors.phoneNumber && <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.phoneNumber.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>Street Address</label>
                <input
                  {...register('street', requiredRule('Street'))}
                  className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  placeholder="123 Main Street, Apt 4"
                  style={inputStyle(errors.street)}
                />
                {errors.street && <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.street.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>City</label>
                  <input
                    {...register('city', requiredRule('City'))}
                    className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--color-primary)]/20"
                    placeholder="Bangalore"
                    style={inputStyle(errors.city)}
                  />
                  {errors.city && <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.city.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>State</label>
                  <input
                    {...register('state', requiredRule('State'))}
                    className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--color-primary)]/20"
                    placeholder="Karnataka"
                    style={inputStyle(errors.state)}
                  />
                  {errors.state && <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.state.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>Pincode</label>
                  <input
                    {...register('pincode', pincodeRules)}
                    className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--color-primary)]/20"
                    placeholder="560001"
                    style={inputStyle(errors.pincode)}
                  />
                  {errors.pincode && <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.pincode.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>Landmark (Optional)</label>
                  <input
                    {...register('landmark')}
                    className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--color-primary)]/20"
                    placeholder="Near City Mall"
                    style={inputStyle(false)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>Address Type</label>
                  <select
                    {...register('addressType', requiredRule('Address type'))}
                    className="w-full px-4 py-3.5 rounded-xl text-sm outline-none cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-[var(--color-primary)]/20"
                    style={inputStyle(errors.addressType)}
                  >
                    <option value={ADDRESS_TYPES.HOME}>🏠 Home</option>
                    <option value={ADDRESS_TYPES.WORK}>💼 Work</option>
                    <option value={ADDRESS_TYPES.OTHER}>📍 Other</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <Button variant="ghost" type="button" className="rounded-xl px-5 font-bold" onClick={() => { setShowForm(false); reset(); }}>Cancel</Button>
                <Button type="submit" loading={loading} className="rounded-xl px-6 font-bold">Save Address</Button>
              </div>
            </form>
          </div>
        )}

        {/* Address List */}
        {loading && addresses.length === 0 ? (
          <div className="py-24">
            <LoadingSpinner text="Loading addresses..." />
          </div>
        ) : addresses.length === 0 ? (
          <div className="py-16">
            <EmptyState
              icon="📍"
              title="No saved addresses"
              description="Add a delivery address to get started with ordering."
              action={<Button onClick={() => setShowForm(true)} className="font-bold flex items-center gap-2 rounded-xl"><Plus className="w-4 h-4" /> Add Address</Button>}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger-children">
            {addresses.map((addr) => (
              <AddressCard
                key={addr.id}
                address={addr}
                onDelete={handleDelete}
                onSetDefault={handleSetDefault}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AddressesPage;
