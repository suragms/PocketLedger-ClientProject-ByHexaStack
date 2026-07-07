import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type ThemeMode = 'light' | 'dark' | 'system';

interface UiState {
  sidebarOpen: boolean;
  darkMode: boolean;
  themeMode: ThemeMode;
}

const getSystemDarkMode = (): boolean => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
};

const getInitialThemeMode = (): ThemeMode => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('themeMode') as ThemeMode | null;
    if (saved && ['light', 'dark', 'system'].includes(saved)) return saved;
  }
  return 'system';
};

const resolveDarkMode = (mode: ThemeMode): boolean => {
  if (mode === 'system') return getSystemDarkMode();
  return mode === 'dark';
};

const applyTheme = (dark: boolean) => {
  if (dark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

const getInitialSidebarOpen = (): boolean => {
  if (typeof window !== 'undefined') {
    return window.innerWidth > 768;
  }
  return true;
};

const initialMode = getInitialThemeMode();
const initialDark = resolveDarkMode(initialMode);

const initialState: UiState = {
  sidebarOpen: getInitialSidebarOpen(),
  darkMode: initialDark,
  themeMode: initialMode,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.themeMode = action.payload;
      state.darkMode = resolveDarkMode(action.payload);
      localStorage.setItem('themeMode', action.payload);
      applyTheme(state.darkMode);
    },
    toggleDarkMode: (state) => {
      const newMode: ThemeMode = state.darkMode ? 'light' : 'dark';
      state.themeMode = newMode;
      state.darkMode = !state.darkMode;
      localStorage.setItem('themeMode', newMode);
      applyTheme(state.darkMode);
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
      state.themeMode = action.payload ? 'dark' : 'light';
      localStorage.setItem('themeMode', state.themeMode);
      applyTheme(state.darkMode);
    },
  },
});

export const { toggleSidebar, setSidebarOpen, setThemeMode, toggleDarkMode, setDarkMode } = uiSlice.actions;
export default uiSlice.reducer;
