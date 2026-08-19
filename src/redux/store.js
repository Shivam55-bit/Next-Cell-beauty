import { configureStore } from '@reduxjs/toolkit'
import cartReducer from './cartSlice.js'
import wishlistReducer from './wishlistSlice.js'
import uiReducer from './uiSlice.js'

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    wishlist: wishlistReducer,
    ui: uiReducer,
  },
})
