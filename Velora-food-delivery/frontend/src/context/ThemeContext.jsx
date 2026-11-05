import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleDarkMode, selectDarkMode } from '../store/slices/uiSlice';
import { getStoredTheme } from '../utils/storage';
import { ThemeContext } from './theme-context';

export const ThemeProvider = ({ children }) => {
  const dispatch = useDispatch();
  const darkMode = useSelector(selectDarkMode);

  // Apply theme on mount
  useEffect(() => {
    const theme = getStoredTheme();
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  // Sync data-theme attribute when darkMode changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggle = () => dispatch(toggleDarkMode());

  return (
    <ThemeContext.Provider value={{ darkMode, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
};
