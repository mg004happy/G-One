import { Phone, Star, Trash2 } from 'lucide-react';

const AddressCard = ({ address, selected, onSelect, onDelete, onSetDefault }) => {
  const { id, fullName, phoneNumber, street, city, state, pincode, landmark, addressType, isDefault } = address;

  const typeIcons = { HOME: '🏠', WORK: '💼', OTHER: '📍' };

  return (
    <div
      onClick={() => onSelect?.(address)}
      className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
        selected ? 'ring-2 ring-[var(--color-primary)]' : ''
      }`}
      style={{
        backgroundColor: 'var(--color-surface)',
        border: `1.5px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[var(--color-bg-tertiary)] flex items-center justify-center text-sm shadow-sm border border-[var(--color-border)]">
            {typeIcons[addressType] || '📍'}
          </div>
          <span className="font-bold text-sm tracking-wide" style={{ color: 'var(--color-text-primary)' }}>
            {addressType}
          </span>
          {(isDefault || address.default) && (
            <span
              className="text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full border bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30"
            >
              Default
            </span>
          )}
        </div>
        <div className="flex gap-1">
          {onSetDefault && !(isDefault || address.default) && (
            <button
              onClick={(e) => { e.stopPropagation(); onSetDefault(id); }}
              className="p-2 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] hover:bg-[var(--color-primary-light)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all cursor-pointer"
              title="Set as default"
            >
              <Star className="w-3.5 h-3.5 text-zinc-400 hover:text-[var(--color-primary)]" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(id); }}
              className="p-2 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-200 hover:text-red-500 transition-all cursor-pointer"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5 text-zinc-400 hover:text-red-500" />
            </button>
          )}
        </div>
      </div>
      
      <div className="space-y-1.5 mt-4">
        <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{fullName}</p>
        <p className="text-xs leading-relaxed font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          {street}, {city}, {state} - {pincode}
        </p>
        {landmark && (
          <p className="text-xs italic" style={{ color: 'var(--color-text-tertiary)' }}>
            Landmark: {landmark}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1.5 mt-4 pt-3 border-t text-xs font-semibold" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-tertiary)' }}>
        <Phone className="w-3.5 h-3.5 text-[var(--color-primary)]" />
        <span>{phoneNumber}</span>
      </div>
    </div>
  );
};

export default AddressCard;
