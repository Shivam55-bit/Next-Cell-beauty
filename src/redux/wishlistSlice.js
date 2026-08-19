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
  },
})

export const { addToWishlist, removeFromWishlist, moveToCart } = wishlistSlice.actions
export default wishlistSlice.reducer
