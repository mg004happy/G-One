import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useCart } from '../../hooks/useCart';
import { fetchAddresses } from '../../store/slices/addressSlice';
import { placeOrder } from '../../store/slices/orderSlice';
import paymentService from '../../services/paymentService';
import MainLayout from '../../layouts/MainLayout';
import AddressCard from '../../components/cards/AddressCard';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency } from '../../utils/formatters';
import { PAYMENT_METHODS } from '../../utils/constants';
import { CreditCard, Banknote, MapPin, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePolling } from '../../hooks/usePolling';
import { useAuth } from '../../hooks/useAuth';

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, fetchCart } = useCart();
  const { user } = useAuth();
  const { addresses } = useSelector((state) => state.addresses);
  const { loading: orderLoading } = useSelector((state) => state.orders);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.CASH_ON_DELIVERY);

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchCart();
    dispatch(fetchAddresses());
  }, [dispatch, fetchCart]);
  usePolling(fetchCart);

  const availableItems = cart?.items?.filter((item) => item.restaurantActive !== false) || [];
  const restaurantIds = [...new Set(availableItems.map((item) => item.restaurantId))];
  const companySplitEligible = Boolean(user?.companyAffiliated && user?.affiliatedCompany
    && restaurantIds.length === 1
    && availableItems[0]?.restaurantTieUpCompanies?.some((company) => company.toLowerCase() === user.affiliatedCompany.toLowerCase()));
  const companyShare = companySplitEligible ? Math.round((Number(cart?.totalAmount || 0) * 0.5 + Number.EPSILON) * 100) / 100 : 0;
  const payableTotal = Number(cart?.totalAmount || 0) - companyShare;

  const selectedAddress = addresses.find((address) => address.id === selectedAddressId)
    || addresses.find((address) => address.isDefault || address.default)
    || addresses[0]
    || null;

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }
    if (availableItems.length === 0) {
      toast.error('Your cart has no items from an open restaurant');
      return;
    }

    setIsProcessing(true);
    const orderData = {
      addressId: selectedAddress.id,
      paymentMethod,
    };

    const result = await dispatch(placeOrder(orderData));
    if (result.meta?.requestStatus === 'fulfilled') {
      const order = result.payload;

      // Create a pending online payment record for later verification.
      if (paymentMethod === PAYMENT_METHODS.ONLINE_PAYMENT) {
        try {
          await paymentService.createPayment(order.id, { paymentMethod });
          toast.success('Order placed. Online payment is pending.');
          setIsProcessing(false);
          navigate(`/orders/${order.id}`);
        } catch (err) {
          setIsProcessing(false);
          toast.error(err.message || 'Payment failed. You can retry from order details.');
          navigate(`/orders/${order.id}`);
        }
      } else {
        toast.success('Order placed successfully! 🎉');
        setIsProcessing(false);
        navigate(`/orders/${order.id}`);
      }
    } else {
      setIsProcessing(false);
      toast.error(result.payload || 'Failed to place order');
    }
  };

  if (isProcessing) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <LoadingSpinner text="Processing your order... Please do not close this window." />
        </div>
      </MainLayout>
    );
  }

  if (availableItems.length === 0) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p style={{ color: 'var(--color-text-secondary)' }}>There are no items from an open restaurant in your cart. Add available items before checkout.</p>
          <Button className="mt-4" onClick={() => navigate('/restaurants')}>Browse Restaurants</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-black mb-8" style={{ color: 'var(--color-text-primary)' }}>
          Checkout
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Address Selection */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                  <MapPin className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                  Delivery Address
                </h2>
                <Button variant="ghost" size="sm" onClick={() => navigate('/addresses')}>
                  <Plus className="w-4 h-4" /> Add New
                </Button>
              </div>
              {addresses.length === 0 ? (
                <div className="p-6 rounded-xl text-center" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px dashed var(--color-border)' }}>
                  <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>No saved addresses</p>
                  <Button size="sm" onClick={() => navigate('/addresses')}>Add Address</Button>
                </div>
              ) : (
                <div className="grid gap-3">
                  {addresses.map((addr) => (
                    <AddressCard
                      key={addr.id}
                      address={addr}
                      selected={selectedAddress?.id === addr.id}
                      onSelect={(address) => setSelectedAddressId(address.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                <CreditCard className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                Payment Method
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { value: PAYMENT_METHODS.CASH_ON_DELIVERY, label: 'Cash on Delivery', icon: <Banknote className="w-5 h-5" />, desc: 'Pay when delivered' },
                  { value: PAYMENT_METHODS.ONLINE_PAYMENT, label: 'Online Payment', icon: <CreditCard className="w-5 h-5" />, desc: 'Pay online' },
                ].map((pm) => (
                  <button
                    key={pm.value}
                    onClick={() => setPaymentMethod(pm.value)}
                    className="flex items-center gap-3 p-4 rounded-xl transition-all cursor-pointer text-left"
                    style={{
                      backgroundColor: paymentMethod === pm.value ? 'var(--color-primary-light)' : 'var(--color-surface)',
                      border: `2px solid ${paymentMethod === pm.value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor: paymentMethod === pm.value ? 'var(--color-primary)' : 'var(--color-bg-tertiary)',
                        color: paymentMethod === pm.value ? 'white' : 'var(--color-text-secondary)',
                      }}
                    >
                      {pm.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>{pm.label}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{pm.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div
              className="rounded-3xl p-7 sticky top-24 shadow-xl glass backdrop-blur-xl border"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <h3 className="font-black text-xl mb-6 tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                Order Summary
              </h3>
              <div className="space-y-3 mb-6 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {availableItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-base font-medium">
                    <span className="truncate pr-4" style={{ color: 'var(--color-text-secondary)' }}>
                      {item.foodItemName} <span className="text-xs ml-1 px-1.5 py-0.5 rounded-md bg-[var(--color-bg-tertiary)]">x{item.quantity}</span>
                    </span>
                    <span className="text-right" style={{ color: 'var(--color-text-primary)' }}>
                      {companySplitEligible ? <><span className="block text-xs line-through" style={{ color: 'var(--color-text-tertiary)' }}>{formatCurrency(item.subtotal)}</span><span className="font-bold text-emerald-600">{formatCurrency(Math.round((Number(item.subtotal) * 0.5 + Number.EPSILON) * 100) / 100)} for you</span></> : formatCurrency(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
              {companySplitEligible && <div className="space-y-2 border-t border-dashed py-4 text-sm font-semibold" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex justify-between text-emerald-600"><span>You pay (50%)</span><span>{formatCurrency(payableTotal)}</span></div>
                <div className="flex justify-between" style={{ color: 'var(--color-text-secondary)' }}><span>{user.affiliatedCompany} pays restaurant (50%)</span><span>{formatCurrency(companyShare)}</span></div>
              </div>}
              <div className="pt-5 mb-8 flex justify-between items-center border-t border-dashed" style={{ borderColor: 'var(--color-border)' }}>
                <span className="font-black text-xl tracking-tight" style={{ color: 'var(--color-text-primary)' }}>You pay</span>
                <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
                  {formatCurrency(payableTotal)}
                </span>
              </div>
              <button
                disabled={!selectedAddress || orderLoading}
                onClick={handlePlaceOrder}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-bold text-lg shadow-lg transition-all ${(!selectedAddress || orderLoading) ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl hover:-translate-y-0.5 cursor-pointer'}`}
                style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
              >
                {orderLoading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CheckoutPage;
