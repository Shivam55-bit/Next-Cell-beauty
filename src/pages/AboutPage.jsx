import { Sparkles, Users, Target } from 'lucide-react'
import styles from './PageStyles.module.css'

function AboutPage() {
  return (
    <div className={styles.pageSpacing}>
      <div className={`${styles.pageWrapper} space-y-10`}>
        <section className="rounded-[2.5rem] border border-slate-200 bg-white p-12 shadow-soft dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_0.7fr] lg:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-brand-600">About us</p>
              <h1 className="mt-4 text-4xl font-semibold text-slate-900 dark:text-slate-100">NAFLIN ENTERPRISES - Your trusted source for premium home lighting and festive celebrations.</h1>
              <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400">Since our founding, we've been committed to providing high-quality lighting solutions, Holi colors, Diwali decorations, and emergency lights that transform every celebration into a memorable moment.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-sm uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Vision</p>
                <p className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">To light up every moment with premium quality and exceptional service.</p>
              </div>
              <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-sm uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Mission</p>
                <p className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Provide reliable, premium lighting and festive solutions for every celebration.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-3">
          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-soft">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-brand-50 text-brand-600">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-2xl font-semibold text-slate-900 dark:text-slate-100">Quality First</h3>
            <p className="mt-4 text-sm leading-7 text-slate-500">We meticulously select each product to ensure premium quality, durability, and excellence in every purchase.</p>
          </div>
          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-soft">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-brand-50 text-brand-600">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-2xl font-semibold text-slate-900 dark:text-slate-100">Customer Care</h3>
            <p className="mt-4 text-sm leading-7 text-slate-500">Our dedicated support team is available 24/7 to assist with orders, returns, and all your lighting needs.</p>
          </div>
          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-soft">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-brand-50 text-brand-600">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-2xl font-semibold text-slate-900 dark:text-slate-100">Wide Selection</h3>
            <p className="mt-4 text-sm leading-7 text-slate-500">From emergency lights to festive decorations, we offer everything you need to celebrate and illuminate every moment.</p>
          </div>
        </section>

        <section className="rounded-[2.5rem] border border-slate-200 bg-white p-10 shadow-soft dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-[2rem] bg-slate-50 p-6 text-center dark:bg-slate-900">
              <p className="text-4xl font-semibold text-slate-900 dark:text-slate-100">12k+</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Satisfied customers</p>
            </div>
            <div className="rounded-[2rem] bg-slate-50 p-6 text-center dark:bg-slate-900">
              <p className="text-4xl font-semibold text-slate-900 dark:text-slate-100">98%</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Repeat purchase rate</p>
            </div>
            <div className="rounded-[2rem] bg-slate-50 p-6 text-center dark:bg-slate-900">
              <p className="text-4xl font-semibold text-slate-900 dark:text-slate-100">200+</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Premium store concepts for festive and home lighting solutions</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AboutPage
