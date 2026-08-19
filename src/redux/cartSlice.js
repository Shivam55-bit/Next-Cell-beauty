import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action) {
      const item = action.payload
      const existing = state.items.find((product) => product.id === item.id)
      if (existing) {
        existing.quantity += item.quantity ?? 1
      } else {
        state.items.push({ ...item, quantity: item.quantity ?? 1 })
      }
    },
    removeFromCart(state, action) {
      state.items = state.items.filter((product) => product.id !== action.payload)
    },
    updateQuantity(state, action) {
      const { id, quantity } = action.payload
      const existing = state.items.find((product) => product.id === id)
      if (existing) {
        existing.quantity = Math.max(1, quantity)
      }
    },
    clearCart(state) {
      state.items = []
    },
  },
})

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions
export default cartSlice.reducer
