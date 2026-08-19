import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ShieldCheck, FileText } from 'lucide-react'
import styles from './PageStyles.module.css'

const sections = [
  {
    title: '1. Introduction',
    content: `At NEXT CELL BEAUTY, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and safeguard your data when you visit our website or use our services. By using our platform, you agree to the practices described in this policy.`,
  },
  {
    title: '2. Information We Collect',
    content: `We may collect the following types of information:\n\n• Full name and contact details (email, phone number)\n• Delivery and billing addresses\n• Account credentials and profile information\n• Order history, transaction details, and payment status\n• Wishlist, cart, and browsing activity\n• Information voluntarily submitted through forms, reviews, or support requests\n• Basic website usage data such as IP address, browser type, and pages visited`,
  },
  {
    title: '3. How We Use Your Information',
    content: `Your information helps us deliver a smooth and secure shopping experience. We use it to:\n\n• Create and manage your customer account\n• Process and fulfil your orders\n• Arrange delivery and logistics\n• Provide customer support and respond to enquiries\n• Manage your wishlist, cart, and personalised features\n• Improve our website, products, and services\n• Send important service-related updates and notifications\n• Detect and prevent fraud, abuse, or unauthorised activity`,
  },
  {
    title: '4. Cookies and Tracking Technologies',
    content: `Our website may use cookies and similar technologies to enhance functionality, remember your preferences, analyse usage patterns, and provide a more personalised shopping experience. You can manage or disable cookies through your browser settings, though some features of the website may not function properly as a result.`,
  },
  {
    title: '5. How We Protect Your Information',
    content: `We implement reasonable technical and organisational measures to protect your personal information against unauthorised access, misuse, alteration, disclosure, or loss. However, no method of transmission over the internet or electronic storage is completely secure, and we cannot guarantee absolute security.`,
  },
  {
    title: '6. Sharing of Information',
    content: `We do not sell or rent your personal information to third parties. We may share your data only when necessary with:\n\n• Payment processors and financial service providers\n• Delivery and logistics partners\n• Technology and infrastructure service providers\n• Legal or regulatory authorities when required by law\n• Internal teams bound by confidentiality obligations`,
  },
  {
    title: '7. Payment Information',
    content: `Payment transactions are processed through trusted third-party payment gateways. NEXT CELL BEAUTY does not unnecessarily store sensitive payment details such as card numbers, CVV, or banking credentials. Any payment-related information is handled in accordance with the security standards of our payment providers.`,
  },
  {
    title: '8. Account Security',
    content: `You are responsible for maintaining the confidentiality of your account credentials, including your password and any linked social accounts. Please notify us immediately if you suspect any unauthorised use of your account or any other breach of security.`,
  },
  {
    title: '9. Third-Party Services',
    content: `Our website may integrate third-party services such as payment gateways, authentication providers, analytics tools, and delivery services. These providers have their own privacy policies, and we encourage you to review them. We are not responsible for the privacy practices of third-party services.`,
  },
  {
    title: '10. Children\'s Privacy',
    content: `Our website and services are intended for general audiences and are not directed at children. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data without appropriate supervision, please contact us so we can take appropriate action.`,
  },
  {
    title: '11. Your Privacy Rights',
    content: `Depending on applicable laws, you may have the following rights:\n\n• Request access to your personal information\n• Request correction of inaccurate or incomplete data\n• Request deletion of your data where applicable\n• Update or modify your account information\n• Withdraw consent for certain communications\n• Object to or restrict certain processing activities\n\nTo exercise these rights, please contact us using the details provided below.`,
  },
  {
    title: '12. Data Retention',
    content: `We retain your personal information only for as long as reasonably necessary to:\n\n• Maintain and manage your account\n• Process orders and provide customer support\n• Comply with legal, tax, or regulatory obligations\n• Resolve disputes and enforce agreements\n• Support legitimate business purposes\n\nWhen data is no longer required, it will be securely deleted or anonymised.`,
  },
  {
    title: '13. Changes to This Privacy Policy',
    content: `NEXT CELL BEAUTY may update this Privacy Policy from time to time to reflect changes in our practices, services, or legal requirements. Any updates will be published on this page with a revised “Last Updated” date. We encourage you to review this policy periodically.`,
  },
  {
    title: '14. Contact Us',
    content: `If you have any questions, concerns, or requests regarding this Privacy Policy or how your information is handled, please reach out to NEXT CELL BEAUTY through the contact details available on our Contact page.`,
  },
]

const today = new Date().toLocaleDateString('en-IN', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export default function PrivacyPolicyPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <div className={styles.pageSpacing}>
      <div className={styles.pageWrapper}>
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#111827] via-[#7c2d12] to-[#f97316] p-8 text-white shadow-2xl sm:p-10 lg:p-12 dark:from-slate-900 dark:via-slate-800 dark:to-orange-500">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl dark:bg-orange-500/20" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-white/10 blur-xl dark:bg-white/10" />

          <div className="relative">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/80">Privacy Policy</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-4 max-w-2xl text-base text-white/85 sm:text-lg">
              Your privacy matters to us. Learn how NEXT CELL BEAUTY collects, uses, protects, and manages your personal information when you use our website and services.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold text-white backdrop-blur">
              <FileText size={14} />
              Last Updated: {today}
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-6 rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-xl sm:p-10 lg:p-12 dark:border-slate-700 dark:bg-slate-900">
          {sections.map((section) => (
            <section key={section.title} className="border-b border-slate-100 pb-8 last:border-b-0 last:pb-0 dark:border-slate-800">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 sm:text-2xl">
                {section.title}
              </h2>
              <div className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-8 rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-xl sm:p-10 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-300">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                  Questions About Your Privacy?
                </h3>
                <p className="mt-1 max-w-xl text-sm text-slate-600 dark:text-slate-300">
                  If you have any questions or concerns about this Privacy Policy or how your information is handled, please contact NEXT CELL BEAUTY through the contact details provided on the website.
                </p>
              </div>
            </div>
            <Link
              to="/contact"
              className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-600 sm:w-auto"
            >
              <ShieldCheck size={18} />
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
