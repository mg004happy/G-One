/**
 * localStorage utility helpers for JWT and user persistence.
 */
import { STORAGE_KEYS } from './constants';

// ---- Token ----
export const getToken = () => localStorage.getItem(STORAGE_KEYS.TOKEN);

export const setToken = (token) => localStorage.setItem(STORAGE_KEYS.TOKEN, token);

export const removeToken = () => localStorage.removeItem(STORAGE_KEYS.TOKEN);

// ---- User ----
export const getStoredUser = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  } catch {
    removeStoredUser();
    return null;
  }
};

export const setStoredUser = (user) =>
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

export const removeStoredUser = () =>
  localStorage.removeItem(STORAGE_KEYS.USER);

// ---- Theme ----
export const getStoredTheme = () =>
  localStorage.getItem(STORAGE_KEYS.THEME) || 'light';

export const setStoredTheme = (theme) =>
  localStorage.setItem(STORAGE_KEYS.THEME, theme);

// ---- Clear All ----
export const clearAuthStorage = () => {
  removeToken();
  removeStoredUser();
};
