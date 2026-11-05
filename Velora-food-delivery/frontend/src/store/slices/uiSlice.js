import { createSlice } from '@reduxjs/toolkit';
import { getStoredTheme, setStoredTheme } from '../../utils/storage';

const initialTheme = getStoredTheme();

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    darkMode: initialTheme === 'dark',
  },
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      const theme = state.darkMode ? 'dark' : 'light';
      setStoredTheme(theme);
      document.documentElement.setAttribute('data-theme', theme);
    },
  },
});

export const { toggleDarkMode } = uiSlice.actions;

export const selectDarkMode = (state) => state.ui.darkMode;

export default uiSlice.reducer;
