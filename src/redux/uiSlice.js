import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isCartOpen: false,
  isMenuOpen: false,
  darkMode: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleCart(state) {
      state.isCartOpen = !state.isCartOpen
    },
    closeCart(state) {
      state.isCartOpen = false
    },
    toggleMenu(state) {
      state.isMenuOpen = !state.isMenuOpen
    },
    closeMenu(state) {
      state.isMenuOpen = false
    },
    setDarkMode(state, action) {
      state.darkMode = action.payload
    },
  },
})

export const { toggleCart, closeCart, toggleMenu, closeMenu, setDarkMode } = uiSlice.actions
export default uiSlice.reducer
