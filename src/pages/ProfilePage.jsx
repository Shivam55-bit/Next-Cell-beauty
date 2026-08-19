import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { fetchProfile, updateProfile } from '../services/profileApi.js'
import { useAuth } from '../context/AuthContext.jsx'
import { uploadProfileImage } from '../services/uploadService.js'
import toast from "react-hot-toast";
import {
  Settings,
  Box,
  Heart,
  ShoppingBag,
  MapPin,
  Mail,
  Phone,
  Crown,
  Edit3,
  CheckCircle2,
  User,
  ShieldCheck,
  Save,
  X,
  LogOut,
  ImagePlus,
  Sparkles,
} from "lucide-react";
import styles from "./PageStyles.module.css";

const menuItems = [
  { label: "Account Details", path: "/profile", icon: Settings, active: true },
  { label: "Orders", path: "/account/orders", icon: ShoppingBag },
  { label: "Addresses", path: "/account/addresses", icon: MapPin },
  { label: "Invoices", path: "/account/invoices", icon: Box },
  { label: "Wishlist", path: "/wishlist", icon: Heart },
  { label: "Skin Quiz", path: "/account/skin-quiz", icon: Sparkles },
];

export default function ProfilePage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const location = useLocation()
  const fileInputRef = useRef(null)
  const [edit, setEdit] = useState(false);
  const [saving, setSaving] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')

  const [profile, setProfile] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('authUser')
      if (stored) {
        const authUser = JSON.parse(stored)
        return {
          name: authUser?.fullName || authUser?.name || '',
          email: authUser?.email || '',
          phone: authUser?.phone || '',
          address: authUser?.address || '',
          profileImage: authUser?.profileImage || authUser?.avatar || '',
        }
      }
    }

    return {
      name: '',
      email: '',
      phone: '',
      address: '',
      profileImage: '',
    }
  });

  const [temp, setTemp] = useState(profile);

  const save = async () => {
    const nextProfile = temp;
    setSaving(true)

    try {
      let profileImageUrl = nextProfile.profileImage || ''

      if (selectedFile) {
        const uploadRes = await uploadProfileImage(selectedFile)
        const uploadedUrl = uploadRes?.data?.url || uploadRes?.url || ''
        if (uploadedUrl) {
          profileImageUrl = uploadedUrl
        } else {
          throw new Error('Image upload failed')
        }
      }

      await updateProfile({
        fullName: nextProfile.name,
        email: nextProfile.email,
        phone: nextProfile.phone,
        address: nextProfile.address,
        profileImage: profileImageUrl,
      })

      const nextProfileState = {
        ...nextProfile,
        profileImage: profileImageUrl,
      }

      setProfile(nextProfileState);
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('authUser');
        if (stored) {
          const authUser = JSON.parse(stored);
          localStorage.setItem(
            'authUser',
            JSON.stringify({
              ...authUser,
              name: nextProfileState.name,
              fullName: nextProfileState.name,
              email: nextProfileState.email,
              phone: nextProfileState.phone,
              address: nextProfileState.address,
              profileImage: nextProfileState.profileImage,
            })
          );
        }
      }
      setEdit(false);
      setSelectedFile(null)
      setPreviewUrl('')
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Unable to update profile');
    } finally {
      setSaving(false)
    }
  };

  const cancel = () => {
    setTemp(profile);
    setEdit(false);
    setSelectedFile(null)
    setPreviewUrl('')
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (JPG, JPEG, PNG, WEBP).')
      return
    }

    setSelectedFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  const clearSelectedFile = () => {
    setSelectedFile(null)
    setPreviewUrl('')
    setTemp((current) => ({ ...current, profileImage: '' }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const loadProfile = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

    if (!token) return;

    try {
      const response = await fetchProfile()
      const data = response?.data?.data || response?.data
      const defaultAddress = data?.defaultAddress
      const addressString = defaultAddress
        ? `${defaultAddress.addressLine1}${defaultAddress.addressLine2 ? ', ' + defaultAddress.addressLine2 : ''}, ${defaultAddress.city}, ${defaultAddress.state} - ${defaultAddress.postalCode}`
        : data?.address || profile.address
      const nextProfile = {
        name: data?.fullName || data?.name || profile.name,
        email: data?.email || profile.email,
        phone: data?.phone || profile.phone,
        address: addressString,
        profileImage: data?.profileImage || data?.avatar || profile.profileImage || '',
      };

      setProfile(nextProfile);
      setTemp(nextProfile);
      localStorage.setItem('authUser', JSON.stringify({
        ...(typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('authUser') || '{}') : {}),
        name: nextProfile.name,
        fullName: nextProfile.name,
        email: nextProfile.email,
        phone: nextProfile.phone,
        address: nextProfile.address,
        profileImage: nextProfile.profileImage,
      }));
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to load profile');
    }
  };

  useEffect(() => {
    loadProfile();

    const handleAuthChange = () => {
      loadProfile();
    };

    window.addEventListener('auth:changed', handleAuthChange);
    return () => window.removeEventListener('auth:changed', handleAuthChange);
  }, []);

  return (
    <div data-profile-page className={`${styles.pageSpacing} min-h-screen bg-[#fffdfb] text-[#0B1F3A] ${styles.profileRoot}`}>
      <div className={`${styles.pageWrapper} max-w-[1180px]`}>
        <div className="relative overflow-hidden rounded-[2rem] border border-[#E2E8F0] bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.06)] md:p-8">
          <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#FF5A00]/10 blur-3xl" />
          <div className="absolute -bottom-10 left-8 h-32 w-32 rounded-full bg-[#FFF4EC] blur-2xl" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[1.5rem] border border-[#E2E8F0] bg-[#FFF4EC] text-3xl font-extrabold text-[#0B1F3A] shadow-sm md:h-24 md:w-24">
                {profile.profileImage ? (
                  <img src={profile.profileImage} alt={profile.name} className="h-full w-full object-cover" />
                ) : (
                  profile.name?.[0] || '?'
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 md:gap-3">
                  <h1 className="text-[1.8rem] font-bold tracking-tight text-[#0B1F3A] md:text-[2.2rem]">
                    {profile.name || 'Customer'}
                  </h1>
                  <CheckCircle2 className="h-5 w-5 text-[#008A5B] md:h-6 md:w-6" />
                </div>

                <p className="mt-2 text-sm font-medium text-[#475569] md:text-[1rem]">
                  Premium customer account dashboard
                </p>

                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-[#FFF4EC] px-3 py-1.5 text-[0.78rem] font-semibold text-[#0B1F3A] md:text-[0.9rem]">
                  <Crown size={15} className="text-[#FF5A00]" />
                  {profile.membership || 'Premium Member'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setEdit(true)}
              className="flex items-center justify-center gap-2 rounded-full bg-[#FF5A00] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(255,90,0,0.22)] transition hover:-translate-y-0.5 hover:bg-[#e94e00] md:px-6 md:text-[0.96rem]"
            >
              <Edit3 size={17} />
              Edit Profile
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="rounded-[1.7rem] border border-[#E2E8F0] bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.04)] lg:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF4EC] text-[#FF5A00]">
                <User size={20} />
              </div>
              <div>
                <h2 className="text-[1.55rem] font-bold text-[#0B1F3A]">My Account</h2>
                <p className="text-sm text-[#475569]">Manage profile</p>
              </div>
            </div>

            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={`flex items-center gap-3 rounded-2xl p-3.5 text-[0.95rem] font-semibold transition ${
                      isActive
                        ? 'bg-[#FFF4EC] text-[#0B1F3A] shadow-[0_8px_20px_rgba(255,90,0,0.08)] ring-1 ring-[#FFD2AF]'
                        : 'text-[#0B1F3A] hover:bg-[#F8FAFC] hover:text-[#0B1F3A]'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-[#FF5A00]' : 'text-[#475569]'} />
                    {item.label}
                  </Link>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="mt-2 flex w-full items-center gap-3 rounded-2xl p-3.5 text-[0.95rem] font-semibold text-[#0B1F3A] transition hover:bg-[#FFF1F1] hover:text-[#B91C1C]"
              >
                <LogOut size={18} className="text-[#475569]" />
                Logout
              </button>
            </div>
          </aside>

          <main className="rounded-[1.7rem] border border-[#E2E8F0] bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.04)] lg:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-[1.75rem] font-bold text-[#0B1F3A] md:text-[2rem]">
                  Personal Information
                </h2>
                <p className="mt-1 text-[0.97rem] text-[#475569]">
                  Update and manage your account details
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-[#CFEFE1] bg-[#EDFFF5] px-3.5 py-2 text-[0.8rem] font-semibold text-[#008A5B] md:text-[0.92rem]">
                <ShieldCheck size={16} className="text-[#008A5B]" />
                Verified Account
              </div>
            </div>

            {edit && (
              <div className="mt-8 rounded-[1.6rem] border border-[#E2E8F0] bg-[#FFFEFD] p-5 shadow-[0_10px_24px_rgba(148,163,184,0.12)] md:p-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <input
                    className="rounded-2xl border border-[#CBD5E1] bg-white p-3.5 text-[0.96rem] text-[#0B1F3A] placeholder:text-[#475569] outline-none transition focus:border-[#FF5A00] focus:ring-2 focus:ring-[#FF5A00]/10"
                    placeholder="Name"
                    value={temp.name}
                    onChange={(e) =>
                      setTemp({ ...temp, name: e.target.value })
                    }
                  />

                  <input
                    className="rounded-2xl border border-[#CBD5E1] bg-white p-3.5 text-[0.96rem] text-[#0B1F3A] placeholder:text-[#475569] outline-none transition focus:border-[#FF5A00] focus:ring-2 focus:ring-[#FF5A00]/10"
                    placeholder="Email"
                    value={temp.email}
                    onChange={(e) =>
                      setTemp({ ...temp, email: e.target.value })
                    }
                  />

                  <input
                    className="rounded-2xl border border-[#CBD5E1] bg-white p-3.5 text-[0.96rem] text-[#0B1F3A] placeholder:text-[#475569] outline-none transition focus:border-[#FF5A00] focus:ring-2 focus:ring-[#FF5A00]/10"
                    placeholder="Phone"
                    value={temp.phone}
                    onChange={(e) =>
                      setTemp({ ...temp, phone: e.target.value })
                    }
                  />
                </div>
                <div className="mt-4">
                  <textarea
                    className="w-full rounded-2xl border border-[#CBD5E1] bg-white p-3.5 text-[0.96rem] text-[#0B1F3A] placeholder:text-[#475569] outline-none transition focus:border-[#FF5A00] focus:ring-2 focus:ring-[#FF5A00]/10"
                    placeholder="Address"
                    rows={3}
                    value={temp.address}
                    onChange={(e) => setTemp({ ...temp, address: e.target.value })}
                  />
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-[#0B1F3A]">Profile Image</label>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#FFF4EC]">
                        {(previewUrl || temp.profileImage) ? (
                          <img src={previewUrl || temp.profileImage} alt="Profile preview" className="h-full w-full object-cover" />
                        ) : (
                          <User size={28} className="text-[#FF5A00]" />
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        <button
                          type="button"
                          onClick={triggerFileSelect}
                          className="inline-flex w-fit items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-semibold text-[#0B1F3A] shadow-sm transition hover:bg-[#F8FAFC]"
                        >
                          <ImagePlus size={18} className="text-[#FF5A00]" />
                          {temp.profileImage || previewUrl ? 'Change Photo' : 'Upload Photo'}
                        </button>
                        {(temp.profileImage || previewUrl) && (
                          <button
                            type="button"
                            onClick={clearSelectedFile}
                            className="w-fit text-xs font-semibold text-[#B91C1C] underline underline-offset-2 transition hover:text-[#991B1B]"
                          >
                            Remove photo
                          </button>
                        )}
                        <p className="text-xs text-[#475569]">JPG, JPEG, PNG, WEBP up to 5MB</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={save}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-full bg-[#FF5A00] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(255,90,0,0.25)] transition hover:bg-[#e94e00] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>

                  <button
                    onClick={cancel}
                    className="flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-6 py-3 text-sm font-semibold text-[#0B1F3A] transition hover:bg-[#F8FAFC]"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <InfoCard icon={Mail} label="Email Address" value={profile.email} />
              <InfoCard icon={Phone} label="Phone Number" value={profile.phone} isPhone />
              <InfoCard icon={MapPin} label="Default Address" value={profile.address} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value, isPhone = false }) {
  const displayValue = value || 'Not provided';
  const valueStyle = {
    overflowWrap: 'anywhere',
    wordBreak: 'break-word',
    maxWidth: '100%',
    minWidth: 0,
    display: 'block',
    fontFamily: isPhone ? 'Arial, Helvetica, sans-serif' : undefined,
  };

  return (
    <div className="group min-w-0 rounded-[1.4rem] border border-[#E2E8F0] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:border-[#FFD2AF] hover:shadow-[0_18px_40px_rgba(255,90,0,0.08)]">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF4EC] text-[#FF5A00]">
        <Icon size={21} />
      </div>

      <p className="text-[0.82rem] font-semibold text-[#475569] md:text-[0.9rem]">{label}</p>
      <h3
        className="mt-2 text-[1.02rem] font-semibold leading-6 text-[#0B1F3A] md:text-[1.15rem]"
        style={valueStyle}
      >
        {displayValue}
      </h3>
    </div>
  );
}
