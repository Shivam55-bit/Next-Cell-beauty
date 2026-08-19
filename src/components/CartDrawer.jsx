import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { X, Plus, Minus, Trash2 } from 'lucide-react'
import { closeCart } from '../redux/uiSlice.js'
import { removeFromCart, updateQuantity } from '../redux/cartSlice.js'
import { formatCurrency } from '../utils/format.js'

function CartDrawer() {
  const dispatch = useDispatch()
  const cartItems = useSelector((state) => state.cart.items)
  const isOpen = useSelector((state) => state.ui.isCartOpen)

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const getImageSrc = (item) => item.image || item.images?.[0] || item.gallery?.[0] || '/placeholder-product.svg'
  const handleImageError = (event) => {
    event.currentTarget.onerror = null
    event.currentTarget.src = '/placeholder-product.svg'
  }

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`} aria-hidden={!isOpen}>
      <button
        type="button"
        onClick={() => dispatch(closeCart())}
        className={`absolute inset-0 bg-slate-950/35 backdrop-blur-sm transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        aria-label="Close cart overlay"
        tabIndex={isOpen ? 0 : -1}
      />
      <aside
        className={`absolute inset-y-0 right-0 flex w-full max-w-full sm:max-w-md transform flex-col overflow-hidden bg-white shadow-soft transition duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'} dark:bg-slate-950 md:w-[440px]`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
      <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-5 dark:border-slate-700">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-brand-600 dark:text-brand-300">Your Cart</p>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Premium basket</h2>
        </div>
        <button type="button" onClick={() => dispatch(closeCart())} className="rounded-2xl border border-slate-200 bg-slate-50 p-2 text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-brand-200" aria-label="Close cart">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
        {cartItems.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-100">Your cart is empty.</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Add trending products and watch your premium collection grow.</p>
            <Link to="/shop" onClick={() => dispatch(closeCart())} className="mt-4 inline-flex rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600">
              Start shopping
            </Link>
          </div>
        ) : (
          cartItems.map((product) => (
            <div key={product.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-3 sm:rounded-[2rem] sm:p-4 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100">
              <div className="flex gap-3 sm:gap-4">
                <img src={getImageSrc(product)} alt={product.name} loading="lazy" decoding="async" onError={handleImageError} className="h-24 w-24 flex-none rounded-2xl object-cover sm:rounded-3xl" />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">{product.name}</h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{product.category}</p>
                    </div>
                    <button type="button" onClick={() => dispatch(removeFromCart(product.id))} className="rounded-2xl p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-100 dark:focus:ring-slate-700" aria-label={`Remove ${product.name} from cart`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                      <button type="button" onClick={() => dispatch(updateQuantity({ id: product.id, quantity: product.quantity - 1 }))} className="rounded-full p-1 text-slate-500 transition bg-white hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-100 dark:focus:ring-brand-200" aria-label={`Decrease quantity for ${product.name}`}>
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{product.quantity}</span>
                        <button type="button" onClick={() => dispatch(updateQuantity({ id: product.id, quantity: product.quantity + 1 }))} className="rounded-full p-1 text-slate-500 transition bg-white hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-100 dark:focus:ring-brand-200" aria-label={`Increase quantity for ${product.name}`}>
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(product.price * product.quantity)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="border-t border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950/90">
          <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(subtotal)}</span>
          </div>
          <div className="mt-5 grid gap-3">
            <Link to="/cart" onClick={() => dispatch(closeCart())} className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm border border-slate-200 transition hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
              View cart
            </Link>
            <Link to="/checkout" onClick={() => dispatch(closeCart())} className="inline-flex items-center justify-center rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600">
              Checkout now
            </Link>
          </div>
        </div>
      )}
      </aside>
    </div>
  )
}

export default CartDrawer
