import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import MainLayout from '../../layouts/MainLayout';
import CartItemCard from '../../components/cards/CartItemCard';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency } from '../../utils/formatters';
import { Trash2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePolling } from '../../hooks/usePolling';
import { useAuth } from '../../hooks/useAuth';

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, loading, fetchCart, updateItem, removeItem, clear } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);
  usePolling(fetchCart);

  const handleUpdate = (cartItemId, data) => {
    updateItem(cartItemId, data);
  };

  const handleRemove = (cartItemId) => {
    removeItem(cartItemId).then(() => toast.success('Item removed'));
  };

  const handleClear = () => {
    clear().then(() => toast.success('Cart cleared'));
  };

  if (loading && !cart) return <MainLayout><LoadingSpinner text="Loading cart..." /></MainLayout>;

  const allItems = cart?.items || [];
  const availableItems = allItems.filter((item) => item.restaurantActive !== false);
  const closedItems = allItems.filter((item) => item.restaurantActive === false);
  const restaurantIds = [...new Set(availableItems.map((item) => item.restaurantId))];
  const companySplitEligible = Boolean(user?.companyAffiliated && user?.affiliatedCompany
    && restaurantIds.length === 1
    && availableItems[0]?.restaurantTieUpCompanies?.some((company) => company.toLowerCase() === user.affiliatedCompany.toLowerCase()));
  const companyShare = companySplitEligible ? Math.round((Number(cart?.totalAmount || 0) * 0.5 + Number.EPSILON) * 100) / 100 : 0;
  const payableTotal = Number(cart?.totalAmount || 0) - companyShare;

  if (allItems.length === 0) {
    return (
      <MainLayout>
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Browse restaurants and add some delicious food!"
          action={
            <Link to="/restaurants">
              <Button>Browse Restaurants</Button>
            </Link>
          }
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black" style={{ color: 'var(--color-text-primary)' }}>
              Your Cart
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              {availableItems.length} available item{availableItems.length !== 1 ? 's' : ''}
              {closedItems.length > 0 && ` • ${closedItems.length} temporarily unavailable`}
            </p>
          </div>
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" /> Clear All
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {availableItems.length > 0 ? (
              <section className="space-y-4">
                <h2 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>Available from open restaurants</h2>
                {availableItems.map((item) => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    onUpdate={handleUpdate}
                    onRemove={handleRemove}
                    companyShareEligible={companySplitEligible}
                  />
                ))}
              </section>
            ) : (
              <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
                <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>No items available to order right now.</p>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Browse open restaurants or remove the unavailable items below.</p>
              </div>
            )}

            {closedItems.length > 0 && (
              <section className="space-y-3 pt-4">
                <div>
                  <h2 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>Unavailable — restaurant closed ({closedItems.length})</h2>
                  <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    These items are excluded from your total and checkout. They’ll become available again if the restaurant reopens.
                  </p>
                </div>
                {closedItems.map((item) => (
                  <CartItemCard key={item.id} item={item} onRemove={handleRemove} unavailable />
                ))}
              </section>
            )}
          </div>

          {/* Price Summary */}
          <div>
            {availableItems.length > 0 ? <div
              className="rounded-3xl p-7 sticky top-24 shadow-xl glass backdrop-blur-xl border"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              <h3 className="font-black text-xl mb-6 tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                Order Summary
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-base font-medium">
                  <span style={{ color: 'var(--color-text-secondary)' }}>Subtotal</span>
                  <span style={{ color: 'var(--color-text-primary)' }}>{formatCurrency(cart.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-base font-medium">
                  <span style={{ color: 'var(--color-text-secondary)' }}>Delivery Fee</span>
                  <span className="text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md">FREE</span>
                </div>
                <div className="flex justify-between text-base font-medium">
                  <span style={{ color: 'var(--color-text-secondary)' }}>Taxes</span>
                  <span style={{ color: 'var(--color-text-tertiary)' }}>Included</span>
                </div>
                {companySplitEligible && <div className="space-y-2 text-sm font-semibold">
                  <div className="flex justify-between text-emerald-600"><span>You pay (50%)</span><span>{formatCurrency(payableTotal)}</span></div>
                  <div className="flex justify-between" style={{ color: 'var(--color-text-secondary)' }}><span>{user.affiliatedCompany} pays restaurant (50%)</span><span>{formatCurrency(companyShare)}</span></div>
                </div>}
              </div>

              <div
                className="pt-5 mb-8 flex justify-between items-center border-t border-dashed"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <span className="font-black text-xl tracking-tight" style={{ color: 'var(--color-text-primary)' }}>You pay</span>
                <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
                  {formatCurrency(payableTotal)}
                </span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 cursor-pointer"
                style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
              >
                Proceed to Checkout <ArrowRight className="w-5 h-5" />
              </button>
            </div> : (
              <div className="rounded-3xl p-6 sticky top-24" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--color-text-primary)' }}>Checkout unavailable</h3>
                <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>Your cart has no items from an open restaurant.</p>
                <Button fullWidth onClick={() => navigate('/restaurants')}>Browse Restaurants</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CartPage;
