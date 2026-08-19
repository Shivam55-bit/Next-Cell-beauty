import { MapPin, Mail, Phone } from 'lucide-react'
import styles from './PageStyles.module.css'

function ContactPage() {
  return (
    <div className={styles.pageSpacing}>
      <div className={styles.splitColsLg}>
        <div className="space-y-6 rounded-[2.5rem] border border-slate-200 bg-white p-10 shadow-soft dark:border-slate-700 dark:bg-slate-950 dark:shadow-none">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-brand-600">Contact</p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-900 dark:text-slate-100">Get in touch with our premium support team.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400">Whether you need help with orders, product details, or shipping updates, we are ready to support your luxury shopping experience.</p>
          </div>
          <form className="grid gap-6">
            <input type="text" placeholder="Full name" className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-900 outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
            <input type="email" placeholder="Email address" className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-900 outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
            <input type="text" placeholder="Subject" className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-900 outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
            <textarea rows="5" placeholder="Message" className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-900 outline-none transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"></textarea>
            <button className="inline-flex items-center justify-center rounded-full bg-brand-500 px-6 py-4 text-sm font-semibold text-white transition hover:bg-brand-600">
              Send message
            </button>
          </form>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-700 dark:bg-slate-950 dark:shadow-none">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Contact details</h2>
            <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">Reach out to our customer care for sales, returns, and premium service requests.</p>
            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-4 rounded-[2rem] border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
                <MapPin className="h-5 w-5 text-brand-600" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">Headquarters</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Mumbai, India</p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-[2rem] border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
                <Mail className="h-5 w-5 text-brand-600" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">Email</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">naflin2026@gmail.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-[2rem] border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
                <Phone className="h-5 w-5 text-brand-600" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">Phone</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">+91 8882399630</p>
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-hidden rounded-[2.5rem] border border-slate-200 shadow-soft dark:border-slate-700">
            <iframe
              title="NAFLIN ENTERPRISES location"
              src="https://maps.google.com/maps?q=mumbai&t=&z=13&ie=UTF8&iwloc=&output=embed"
              className="h-96 w-full border-0"
              loading="lazy"
            />
          </div>
        </aside>
      </div>
    </div>
  )
}

export default ContactPage
