import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '../../services/addressService.js'
import toast from 'react-hot-toast'
import { MapPin, Plus, Edit3, Trash2, Star, Home, Briefcase, Settings, ShoppingBag, ReceiptText, Heart, Sparkles, LogOut } from 'lucide-react'
import styles from '../PageStyles.module.css'

const sidebarItems = [
  { label: 'Account Details', path: '/profile', icon: Settings },
  { label: 'Orders', path: '/account/orders', icon: ShoppingBag },
  { label: 'Addresses', path: '/account/addresses', icon: MapPin },
  { label: 'Invoices', path: '/account/invoices', icon: ReceiptText },
  { label: 'Wishlist', path: '/wishlist', icon: Heart },
  { label: 'Skin Quiz', path: '/account/skin-quiz', icon: Sparkles },
]

export default function MyAddresses() {
  const [list, setList] = useState([])
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: 'India',
    postalCode: '',
    addressType: 'home',
    isDefault: false
  })

  useEffect(() => {
    let mounted = true
    const run = async () => {
      try {
        const res = await getMyAddresses()
        if (mounted) setList(Array.isArray(res) ? res : res.data || [])
      } catch {
        if (mounted) toast.error('Unable to load addresses')
      }
    }
    run()
    return () => { mounted = false }
  }, [])

  const resetForm = () => {
    setEditing(null)
    setShowForm(false)
    setForm({
      fullName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      country: 'India',
      postalCode: '',
      addressType: 'home',
      isDefault: false
    })
  }

  const load = async () => {
    try {
      const res = await getMyAddresses()
      setList(Array.isArray(res) ? res : res.data || [])
    } catch {
      toast.error('Unable to load addresses')
    }
  }

  const startAdd = () => {
    resetForm()
    setShowForm(true)
  }

  const startEdit = (a) => {
    setEditing(a._id || a.id)
    setForm({
      fullName: a.fullName || '',
      phone: a.phone || '',
      addressLine1: a.addressLine1 || '',
      addressLine2: a.addressLine2 || '',
      city: a.city || '',
      state: a.state || '',
      country: a.country || 'India',
      postalCode: a.postalCode || '',
      addressType: a.addressType || 'home',
      isDefault: !!a.isDefault
    })
    setShowForm(true)
  }

  const save = async () => {
    setSaving(true)
    try {
      if (editing) {
        await updateAddress(editing, form)
        toast.success('Address updated')
      } else {
        await addAddress(form)
        toast.success('Address added')
      }
      await load()
      resetForm()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    if (!confirm('Delete this address?')) return
    try {
      await deleteAddress(id)
      toast.success('Deleted')
      load()
    } catch {
      toast.error('Delete failed')
    }
  }

  const makeDefault = async (id) => {
    try {
      await setDefaultAddress(id)
      toast.success('Default address updated')
      load()
    } catch {
      toast.error('Unable to set default')
    }
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
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF4EC] text-[#FF5A00]">
                <MapPin size={20} />
              </div>
              <div>
                <h3 className="text-[1.4rem] font-bold text-[#0F172A]">Addresses</h3>
              </div>
            </div>

            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                const isActive = item.path === '/account/addresses'

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
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#FF5A00]">My Addresses</p>
                <h1 className="mt-2 text-[2rem] font-bold tracking-[-0.03em] text-[#0F172A]">Saved Addresses</h1>
                <p className="mt-2 text-sm text-[#475569]">Manage your delivery addresses for faster checkout.</p>
              </div>
              {!showForm && (
                <button
                  onClick={startAdd}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF5A00] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(255,90,0,0.18)] transition hover:bg-[#E94E00]"
                >
                  <Plus size={16} />
                  Add Address
                </button>
              )}
            </div>

            {showForm && (
              <div className="mb-6 rounded-[1.2rem] border border-[#E2E8F0] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
                <h2 className="mb-6 text-lg font-bold text-[#0F172A]">{editing ? 'Edit Address' : 'Add New Address'}</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#0F172A]">Full Name</label>
                    <input
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      placeholder="Enter full name"
                      className="w-full rounded-2xl border border-[#E2E8F0] bg-white p-3 text-[#0F172A] outline-none placeholder:text-[#64748B] focus:border-[#FF5A00]"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#0F172A]">Phone Number</label>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="Enter phone number"
                      className="w-full rounded-2xl border border-[#E2E8F0] bg-white p-3 text-[#0F172A] outline-none placeholder:text-[#64748B] focus:border-[#FF5A00]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-[#0F172A]">Address Line 1</label>
                    <input
                      value={form.addressLine1}
                      onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
                      placeholder="House No., Building, Street, Area"
                      className="w-full rounded-2xl border border-[#E2E8F0] bg-white p-3 text-[#0F172A] outline-none placeholder:text-[#64748B] focus:border-[#FF5A00]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-[#0F172A]">Address Line 2 <span className="font-normal text-[#64748B]">(Optional)</span></label>
                    <input
                      value={form.addressLine2}
                      onChange={(e) => setForm({ ...form, addressLine2: e.target.value })}
                      placeholder="Landmark, Nearby area"
                      className="w-full rounded-2xl border border-[#E2E8F0] bg-white p-3 text-[#0F172A] outline-none placeholder:text-[#64748B] focus:border-[#FF5A00]"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#0F172A]">City</label>
                    <input
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="City"
                      className="w-full rounded-2xl border border-[#E2E8F0] bg-white p-3 text-[#0F172A] outline-none placeholder:text-[#64748B] focus:border-[#FF5A00]"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#0F172A]">State</label>
                    <input
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      placeholder="State"
                      className="w-full rounded-2xl border border-[#E2E8F0] bg-white p-3 text-[#0F172A] outline-none placeholder:text-[#64748B] focus:border-[#FF5A00]"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#0F172A]">Pincode</label>
                    <input
                      value={form.postalCode}
                      onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                      placeholder="Pincode"
                      className="w-full rounded-2xl border border-[#E2E8F0] bg-white p-3 text-[#0F172A] outline-none placeholder:text-[#64748B] focus:border-[#FF5A00]"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#0F172A]">Country</label>
                    <input
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      placeholder="Country"
                      className="w-full rounded-2xl border border-[#E2E8F0] bg-white p-3 text-[#0F172A] outline-none placeholder:text-[#64748B] focus:border-[#FF5A00]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-3 block text-sm font-semibold text-[#0F172A]">Address Type</label>
                    <div className="flex flex-wrap gap-4">
                      <label className={`flex cursor-pointer items-center gap-2 rounded-2xl border-2 px-5 py-3 transition ${form.addressType === 'home' ? 'border-[#FF5A00] bg-[#FFF4EC]' : 'border-[#E2E8F0] bg-white'}`}>
                        <input type="radio" checked={form.addressType === 'home'} onChange={() => setForm({ ...form, addressType: 'home' })} className="hidden" />
                        <Home size={20} className={form.addressType === 'home' ? 'text-[#FF5A00]' : 'text-[#64748B]'} />
                        <span className={`font-semibold ${form.addressType === 'home' ? 'text-[#0F172A]' : 'text-[#475569]'}`}>Home</span>
                      </label>
                      <label className={`flex cursor-pointer items-center gap-2 rounded-2xl border-2 px-5 py-3 transition ${form.addressType === 'office' ? 'border-[#FF5A00] bg-[#FFF4EC]' : 'border-[#E2E8F0] bg-white'}`}>
                        <input type="radio" checked={form.addressType === 'office'} onChange={() => setForm({ ...form, addressType: 'office' })} className="hidden" />
                        <Briefcase size={20} className={form.addressType === 'office' ? 'text-[#FF5A00]' : 'text-[#64748B]'} />
                        <span className={`font-semibold ${form.addressType === 'office' ? 'text-[#0F172A]' : 'text-[#475569]'}`}>Office</span>
                      </label>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={!!form.isDefault}
                        onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                        className="h-5 w-5 rounded border-[#CBD5E1] text-[#FF5A00] focus:ring-[#FF5A00]"
                      />
                      <span className="text-sm font-semibold text-[#0F172A]">Set as default address</span>
                    </label>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={save}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-full bg-[#FF5A00] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(255,90,0,0.18)] transition hover:bg-[#E94E00] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {saving ? 'Saving...' : (editing ? 'Update Address' : 'Save Address')}
                  </button>
                  <button
                    onClick={resetForm}
                    className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-6 py-3 text-sm font-semibold text-[#0F172A] transition hover:bg-[#F8FAFC]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {list.length === 0 ? (
              <div className="rounded-[1.8rem] border border-[#E2E8F0] bg-white p-8 text-center shadow-[0_8px_30px_rgba(15,23,42,0.04)] md:p-12">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#FFF4EC] text-[#FF5A00]">
                  <MapPin size={42} />
                </div>
                <h2 className="mt-6 text-[1.8rem] font-bold text-[#0F172A]">No addresses saved</h2>
                <p className="mx-auto mt-3 max-w-lg text-base text-[#475569]">Add your first delivery address to speed up checkout.</p>
                {!showForm && (
                  <button onClick={startAdd} className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#FF5A00] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(255,90,0,0.18)] transition hover:bg-[#E94E00]">
                    <Plus size={16} />
                    Add Address
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {list.map((a) => {
                  const id = a._id || a.id
                  const isDefault = !!a.isDefault
                  return (
                    <div
                      key={id}
                      className={`rounded-[1.5rem] border p-5 transition ${isDefault ? 'border-[#FFD2AF] bg-[#FFF4EC]' : 'border-[#E2E8F0] bg-white'}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${a.addressType === 'office' ? 'bg-[#EAF2FF] text-[#2563EB]' : 'bg-[#FFF4EC] text-[#FF5A00]'}`}>
                            {a.addressType === 'office' ? <Briefcase size={18} /> : <Home size={18} />}
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-bold text-[#0F172A]">{a.fullName}</h3>
                              {isDefault && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#E0F7EE] px-2 py-0.5 text-[0.68rem] font-bold text-[#008A5B]">
                                  <Star size={10} fill="currentColor" /> Default
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-xs text-[#475569]">{a.phone}</p>
                            <p className="mt-1 text-xs text-[#475569]">{a.addressLine1}{a.addressLine2 ? `, ${a.addressLine2}` : ''}</p>
                            <p className="text-xs text-[#475569]">{a.city}, {a.state} - {a.postalCode}</p>
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col gap-2">
                          <button
                            onClick={() => startEdit(a)}
                            className="inline-flex items-center gap-1 rounded-full border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-semibold text-[#0F172A] transition hover:bg-[#F8FAFC]"
                          >
                            <Edit3 size={12} /> Edit
                          </button>
                          <button
                            onClick={() => remove(id)}
                            className="inline-flex items-center gap-1 rounded-full border border-[#FECACA] bg-white px-3 py-2 text-xs font-semibold text-[#B91C1C] transition hover:bg-[#FFF1F2]"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                          {!isDefault && (
                            <button
                              onClick={() => makeDefault(id)}
                              className="inline-flex items-center gap-1 rounded-full border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-semibold text-[#0F172A] transition hover:bg-[#F8FAFC]"
                            >
                              <Star size={12} /> Set Default
                            </button>
                          )}
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
