import api from './api.js'

export async function getMyWishlist() {
  const res = await api.get('/wishlist')
  return res?.data?.data || res?.data || []
}

export async function addWishlistItem(productId, product = {}) {
  const res = await api.post(`/wishlist/${productId}`, { product })
  return res?.data?.data || res?.data
}

export async function removeWishlistItem(productId) {
  const res = await api.delete(`/wishlist/${productId}`)
  return res?.data?.data || res?.data
}

export default { getMyWishlist, addWishlistItem, removeWishlistItem }
