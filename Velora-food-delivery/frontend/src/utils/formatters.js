/**
 * Formatting utilities for currency, dates, statuses, etc.
 */

/**
 * Format a number as Indian Rupees.
 * @param {number|string} amount
 * @returns {string} e.g. "₹249.00"
 */
export const formatCurrency = (amount) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(num);
};

/**
 * Format an ISO datetime string to a human-readable date.
 * @param {string} dateStr ISO datetime string
 * @returns {string} e.g. "15 Jan 2026"
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr));
};

/**
 * Format an ISO datetime string to date + time.
 * @param {string} dateStr
 * @returns {string} e.g. "15 Jan 2026, 2:30 PM"
 */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(dateStr));
};

/**
 * Format a time string (HH:mm) to 12-hour format.
 * @param {string} timeStr e.g. "09:00"
 * @returns {string} e.g. "9:00 AM"
 */
export const formatTime = (timeStr) => {
  if (!timeStr) return '—';
  const [hours, minutes] = timeStr.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  return `${h}:${String(minutes).padStart(2, '0')} ${ampm}`;
};

/**
 * Pretty-print an order status.
 * @param {string} status e.g. "OUT_FOR_DELIVERY"
 * @returns {string} e.g. "Out for Delivery"
 */
export const formatOrderStatus = (status) => {
  if (!status) return '—';
  return status
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Pretty-print a role string.
 * @param {string} role e.g. "RESTAURANT_OWNER"
 * @returns {string} e.g. "Restaurant Owner"
 */
export const formatRole = (role) => {
  if (!role) return '—';
  return role
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');
};

/** Convert a display name to a URL-friendly slug. */
export const slugify = (value) => (value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

/**
 * Get relative time (e.g. "2 hours ago").
 * @param {string} dateStr
 * @returns {string}
 */
export const timeAgo = (dateStr) => {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
};

/**
 * Truncate text with ellipsis.
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncate = (text, maxLength = 80) => {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '…' : text;
};

/**
 * Get initials from a full name.
 * @param {string} name
 * @returns {string} e.g. "PJ"
 */
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
