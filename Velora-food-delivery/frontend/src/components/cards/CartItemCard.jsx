import { Plus, Minus, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const CartItemCard = ({ item, onUpdate, onRemove, unavailable = false, companyShareEligible = false }) => {
  const { id, foodItemName, foodItemImageUrl, restaurantName, quantity, price, subtotal } = item;
  const customerPrice = Math.round((Number(price) * 0.5 + Number.EPSILON) * 100) / 100;
  const customerSubtotal = Math.round((Number(subtotal) * 0.5 + Number.EPSILON) * 100) / 100;

  return (
    <div
      className="flex gap-4 p-4 rounded-xl animate-fade-in"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Image */}
      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
        <img
          src={foodItemImageUrl || '/images/default-food.jpg'}
          alt={foodItemName}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
          {foodItemName}
        </h4>
        {restaurantName && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>{restaurantName}</p>
        )}
        <div className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
          {companyShareEligible ? <><span className="line-through mr-2" style={{ color: 'var(--color-text-tertiary)' }}>{formatCurrency(price)}</span><span className="font-semibold text-emerald-600">{formatCurrency(customerPrice)} each for you</span></> : <span>{formatCurrency(price)} each</span>}
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center justify-between mt-3">
          {unavailable ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600">
                Restaurant closed
              </span>
              <button
                onClick={() => onRemove(id)}
                className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-600 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  quantity > 1
                    ? onUpdate(id, { quantity: quantity - 1 })
                    : onRemove(id)
                }
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                style={{
                  backgroundColor: 'var(--color-bg-tertiary)',
                  color: 'var(--color-text-primary)',
                }}
              >
                {quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-red-500" /> : <Minus className="w-3.5 h-3.5" />}
              </button>
              <span className="w-8 text-center font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                {quantity}
              </span>
              <button
                onClick={() => onUpdate(id, { quantity: quantity + 1 })}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                }}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <span className="font-bold text-right" style={{ color: 'var(--color-text-primary)' }}>
            {companyShareEligible ? <><span className="block text-xs font-normal line-through" style={{ color: 'var(--color-text-tertiary)' }}>{formatCurrency(subtotal)}</span><span className="text-emerald-600">{formatCurrency(customerSubtotal)}</span></> : formatCurrency(subtotal)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CartItemCard;
