import banner2 from '../assets/rakhi_banner.png'

function Banner2({ image }) {
  return (
    <section className="w-full overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white shadow-soft dark:border-slate-700 dark:bg-slate-900">
      <img
        src={image || banner2}
        alt="NAFLIN festive product banner"
        className="h-auto w-full object-cover max-h-[400px] sm:max-h-[550px]"
        loading="lazy"
        decoding="async"
      />
    </section>
  )
}

export default Banner2
