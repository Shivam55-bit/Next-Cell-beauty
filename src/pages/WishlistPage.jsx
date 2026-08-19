import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { ShoppingCart, Trash2, Heart, Loader2, Star, Settings, ShoppingBag, MapPin, ReceiptText, Sparkles, LogOut } from 'lucide-react'
import { removeFromWishlist } from '../redux/wishlistSlice.js'
import { addToCart } from '../redux/cartSlice.js'
import { getMyWishlist, removeWishlistItem } from '../services/wishlistService.js'
import { formatCurrency } from '../utils/format.js'
import toast from 'react-hot-toast'
import styles from './PageStyles.module.css'

const sidebarItems = [
  { label: 'Account Details', path: '/profile', icon: Settings },
  { label: 'Orders', path: '/account/orders', icon: ShoppingBag },
  { label: 'Addresses', path: '/account/addresses', icon: MapPin },
  { label: 'Invoices', path: '/account/invoices', icon: ReceiptText },
  { label: 'Wishlist', path: '/wishlist', icon: Heart },
  { label: 'Skin Quiz', path: '/account/skin-quiz', icon: Sparkles },
]

function StarRating({ rating = 0 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          size={14}
          className={value <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
        />
      ))}
    </div>
  )
}

function WishlistPage() {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [remoteItems, setRemoteItems] = useState([])
  const localItems = useSelector((state) => state.wishlist.items)

  useEffect(() => {
    let mounted = true
    const run = async () => {
      try {
        const res = await getMyWishlist()
        const items = Array.isArray(res) ? res : res.data || []
        if (mounted) setRemoteItems(items || [])
      } catch (e) {
        if (mounted) setError(e?.response?.data?.message || 'Unable to load wishlist')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    run()
    return () => { mounted = false }
  }, [])

  const displayItems = remoteItems.length > 0 ? remoteItems : localItems

  const handleRemove = async (productId) => {
    try {
      await removeWishlistItem(productId)
      dispatch(removeFromWishlist(productId))
      setRemoteItems((prev) => prev.filter((p) => (p._id || p.id) !== productId))
      toast.success('Removed from wishlist')
    } catch {
      toast.error('Unable to remove item')
    }
  }

  const handleMoveToCart = (product) => {
    dispatch(addToCart({ ...product, quantity: 1 }))
    dispatch(removeFromWishlist(product._id || product.id))
    setRemoteItems((prev) => prev.filter((p) => (p._id || p.id) !== (product._id || product.id)))
    toast.success('Moved to cart')
  }

  return (
    <div
      className={`${styles.pageSpacing} min-h-screen bg-[#F8FAFC] text-[#0F172A]`}
      style={{ fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
    >
      <div className={`${styles.pageWrapper} max-w-[1180px]`}>
        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="rounded-[1.6rem] border border-[#E2E8F0] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFE5D6] text-[#FF5A00]">
                <Heart size={20} />
              </div>
              <div>
                <h3 className="text-[1.4rem] font-bold text-[#0F172A]">Wishlist</h3>
              </div>
            </div>

            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                const isActive = item.path === '/wishlist'

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-[0.95rem] font-semibold transition ${isActive ? 'bg-[#FFF4EC] text-[#FF5A00] ring-1 ring-[#FFD2AF]' : 'text-[#334155] hover:bg-[#FFF7F2]'}`}
                  >
                    <Icon size={18} className={isActive ? 'text-[#FF5A00]' : 'text-[#475569]'} />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </Link>
                )
              })}

              <button
                type="button"
                className="mt-2 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-[0.95rem] font-semibold text-[#334155] transition hover:bg-[#FFF1F1] hover:text-[#B91C1C]"
              >
                <LogOut size={18} className="text-[#475569]" />
                <span className="whitespace-nowrap">Logout</span>
              </button>
            </nav>
          </aside>

          <main className="rounded-[1.8rem] border border-[#E2E8F0] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:p-8">
            <div className="mb-6 text-center">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#FF5A00]">My Wishlist</p>
              <h1 className="mt-2 text-[2rem] font-bold tracking-[-0.03em] text-[#0F172A]">Your Saved Beauty Picks</h1>
              <p className="mx-auto mt-2 max-w-2xl text-sm text-[#475569]">Keep your favourite products together and move them to your cart whenever you are ready.</p>
            </div>

            {error ? (
              <div className="rounded-[1.8rem] border border-[#FECACA] bg-[#FFF1F2] p-6 text-center text-[#B91C1C]">
                {error}
                <button onClick={() => window.location.reload()} className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#FF5A00] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(255,90,0,0.18)] transition hover:bg-[#E94E00]">Retry</button>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-[#FF5A00]" />
              </div>
            ) : displayItems.length === 0 ? (
              <div className="rounded-[1.8rem] border border-[#E2E8F0] bg-white p-8 text-center shadow-[0_8px_30px_rgba(15,23,42,0.04)] md:p-12">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#FFF4EC] text-[#FF5A00]">
                  <Heart size={42} fill="currentColor" />
                </div>
                <h2 className="mt-6 text-[1.8rem] font-bold text-[#0F172A]">Your wishlist is empty</h2>
                <p className="mx-auto mt-3 max-w-lg text-base text-[#475569]">Save your favourite skincare, makeup, haircare and fragrances so you can find them easily later.</p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <Link to="/shop" className="inline-flex items-center gap-2 rounded-full bg-[#FF5A00] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(255,90,0,0.18)] transition hover:bg-[#E94E00]">Explore Products</Link>
                  <Link to="/best-sellers" className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-6 py-3 text-sm font-semibold text-[#0F172A] transition hover:bg-[#F8FAFC]">View Best Sellers</Link>
                </div>
                <div className="mx-auto mt-10 grid max-w-lg gap-4 text-left sm:grid-cols-3">
                  <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                    <strong className="block text-sm font-semibold text-[#0F172A]">Save favourites</strong>
                    <span className="text-xs text-[#475569]">Keep items for later</span>
                  </div>
                  <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                    <strong className="block text-sm font-semibold text-[#0F172A]">Compare products</strong>
                    <span className="text-xs text-[#475569]">Choose the best fit</span>
                  </div>
                  <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                    <strong className="block text-sm font-semibold text-[#0F172A]">Move to cart anytime</strong>
                    <span className="text-xs text-[#475569]">Add to cart when ready</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {displayItems.map((product) => {
                  const productId = product._id || product.id
                  const image = product.image || product.images?.[0] || product.gallery?.[0] || '/placeholder-product.svg'
                  const name = product.name || product.title || 'Product'
                  const price = product.price || 0
                  const originalPrice = product.compareAtPrice || product.originalPrice || product.mrp || null
                  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : null
                  const rating = product.rating || 0

                  return (
                    <div key={productId} className="group rounded-[1.6rem] border border-[#E2E8F0] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
                      <div className="relative">
                        <img
                          src={image}
                          alt={name}
                          onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/placeholder-product.svg' }}
                          className="h-56 w-full rounded-[1.5rem] object-cover"
                        />
                        {discount && (
                          <span className="absolute left-3 top-3 rounded-full bg-[#FF5A00] px-3 py-1 text-xs font-bold text-white shadow">
                            {discount}% OFF
                          </span>
                        )}
                        <button
                          onClick={() => handleRemove(productId)}
                          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#B91C1C] shadow-lg backdrop-blur transition hover:scale-110"
                          title="Remove from wishlist"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <div className="mt-5 space-y-3">
                        <div>
                          <p className="text-sm text-[#475569]">{product.category?.name || product.category || ''}</p>
                          <h2 className="text-lg font-semibold text-[#0F172A]">{name}</h2>
                        </div>
                        {rating > 0 && <StarRating rating={rating} />}
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <span className="text-xl font-bold text-[#0F172A]">{formatCurrency(price)}</span>
                            {originalPrice && (
                              <span className="ml-2 text-sm text-[#64748B] line-through">{formatCurrency(originalPrice)}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleMoveToCart(product)}
                            className="inline-flex items-center gap-2 rounded-full bg-[#FF5A00] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(255,90,0,0.18)] transition hover:bg-[#E94E00]"
                          >
                            <ShoppingCart size={16} />
                            Move to Cart
                          </button>
                          <button
                            onClick={() => handleRemove(productId)}
                            className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#0F172A] transition hover:bg-[#F8FAFC]"
                          >
                            <Trash2 size={16} />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default WishlistPage
