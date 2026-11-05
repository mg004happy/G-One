import { Search } from 'lucide-react';
import { useState } from 'react';

const SearchBar = ({ placeholder = 'Search...', onSearch, className = '' }) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.(value);
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <Search
        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
        style={{ color: 'var(--color-text-tertiary)' }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onSearch?.(e.target.value);
        }}
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-200 outline-none"
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          color: 'var(--color-text-primary)',
          border: '2px solid var(--color-border)',
        }}
        onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
        onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
      />
    </form>
  );
};

export default SearchBar;
