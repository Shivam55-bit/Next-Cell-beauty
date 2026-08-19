import { Link } from 'react-router-dom'

function SmartApplianceCard({ product }) {
  const imageSrc = product.image || product.images?.[0] || product.gallery?.[0] || '/placeholder-product.svg'
  const handleImageError = (event) => {
    event.currentTarget.onerror = null
    event.currentTarget.src = '/placeholder-product.svg'
  }

  return (
    <article className="group h-full w-full max-w-[260px] overflow-hidden rounded-[1.35rem] border border-[#cfcfe2] bg-[#f5f4ff] shadow-[0_3px_10px_rgba(26,22,66,0.1)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(26,22,66,0.16)]">
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative h-[180px] overflow-hidden bg-[#ecebfb] sm:h-[205px]">
          <div className="absolute left-1/2 top-[-22%] h-[135%] w-[135%] -translate-x-1/2 rounded-full bg-white/45" />
          <img
            src={imageSrc}
            onError={handleImageError}
            alt={product.name}
            className="relative z-10 h-full w-full object-contain p-3 transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        <div className="bg-gradient-to-r from-[#6a30ff] to-[#4a2cff] px-3 py-2.5 text-center">
          <h3 className="truncate text-[1.05rem] font-medium tracking-wide text-white sm:text-[1.2rem]">{product.category || product.name}</h3>
        </div>
      </Link>
    </article>
  )
}

export default SmartApplianceCard
