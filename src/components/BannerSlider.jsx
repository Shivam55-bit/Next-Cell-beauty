import { useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/pagination'
import { Autoplay, Pagination } from 'swiper/modules'

function BannerSlider({ slides }) {
  const [progress, setProgress] = useState(0)
  const isSingleSlide = slides.length <= 1

  return (
    <div className="relative">
      <Swiper
        modules={[Autoplay, Pagination]}
        slidesPerView={1}
        loop={!isSingleSlide}
        pagination={isSingleSlide ? false : { clickable: true }}
        autoplay={isSingleSlide ? false : { delay: 4500, disableOnInteraction: false }}
        allowTouchMove={!isSingleSlide}
        onSlideChange={(swiper) => setProgress(swiper.progress)}
        onSwiper={(swiper) => setProgress(swiper.progress)}
        className="overflow-hidden shadow-soft dark:shadow-[0_20px_45px_rgba(2,6,23,0.45)]"
      >
      {slides.map((slide) => (
        <SwiperSlide key={slide.title}>
          <div className="relative overflow-hidden bg-slate-100 dark:bg-slate-900">
            {slide.showText === false ? (
              <img
                src={slide.image}
                alt={slide.title}
                className="h-auto w-full object-contain"
                loading="eager"
                decoding="async"
              />
            ) : (
              <>
                <img
                  src={slide.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="eager"
                  decoding="async"
                />
              <div className="relative flex min-h-[360px] items-center bg-slate-950/60 px-5 py-10 sm:min-h-[460px] sm:px-12 lg:min-h-[520px]">
                <div className="max-w-2xl space-y-6 rounded-[2rem] border border-white/20 bg-slate-950/75 p-8 text-white shadow-[0_25px_80px_rgba(2,6,23,0.5)] backdrop-blur-xl">
                  <p className="text-sm uppercase tracking-[0.28em] text-white/85">{slide.tag}</p>
                  <h2 className="text-4xl font-bold leading-tight sm:text-5xl">{slide.title}</h2>
                  <p className="max-w-xl text-base leading-7 text-white/95">{slide.description}</p>
                  <a
                    href={slide.link}
                    className="inline-flex items-center justify-center rounded-full bg-brand-500 px-8 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-600"
                  >
                    {slide.cta}
                  </a>
                </div>
              </div>
              </>
            )}
          </div>
        </SwiperSlide>
      ))}
      </Swiper>

      {!isSingleSlide && (
        <div className="mt-4 flex justify-center">
          <div className="w-72 h-1 bg-white/20 rounded overflow-hidden">
            <div className="h-1 bg-brand-500 rounded" style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }} />
          </div>
        </div>
      )}
    </div>
  )
}

export default BannerSlider
