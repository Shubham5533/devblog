import { createSlice } from '@reduxjs/toolkit'

const savedTheme = localStorage.getItem('theme') || 'dark'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: savedTheme,
    toasts: [],
    mobileMenuOpen: false,
  },
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme', state.theme)
    },
    setTheme: (state, action) => {
      state.theme = action.payload
      localStorage.setItem('theme', action.payload)
    },
    addToast: (state, action) => {
      state.toasts.push({ id: Date.now(), ...action.payload })
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(t => t.id !== action.payload)
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen
    },
    closeMobileMenu: (state) => {
      state.mobileMenuOpen = false
    },
  },
})

export const { toggleTheme, setTheme, addToast, removeToast, toggleMobileMenu, closeMobileMenu } = uiSlice.actions
export default uiSlice.reducer
