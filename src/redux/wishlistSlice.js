import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
}

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist(state, action) {
      const product = action.payload
      if (!state.items.some((item) => item.id === product.id)) {
        state.items.push(product)
      }
    },
    removeFromWishlist(state, action) {
      state.items = state.items.filter((product) => product.id !== action.payload)
    },
    moveToCart(state, action) {
      state.items = state.items.filter((product) => product.id !== action.payload)
    },
    toggleWishlist(state, action) {
      const product = action.payload
      const idx = state.items.findIndex((item) => (item.id || item.slug) === (product.id || product.slug))
      if (idx >= 0) {
        state.items.splice(idx, 1)
      } else {
        state.items.push(product)
      }
    },
  },
})

export const { addToWishlist, removeFromWishlist, moveToCart, toggleWishlist } = wishlistSlice.actions
export default wishlistSlice.reducer
