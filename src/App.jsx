import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { siteConfig } from './data/siteConfig'
import useReducedMotion from './hooks/useReducedMotion'
import Header from './components/Header'
import Hero from './components/Hero'
import RoomsSection from './components/RoomsSection'
import GallerySection from './components/GallerySection'
import { AboutSection, AmenitiesSection, DiningSection, ReviewsSection, LocationSection, FaqSection, ContactSection, FooterSection } from './components/ExperienceSections'
import { CustomCursor, Lightbox, Loader, WaveDivider, WhatsAppFloat } from './components/UI'

const Scene3DContainer = lazy(() => import('./components/Scene3D/Scene3DContainer'))

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  const reducedMotion = useReducedMotion()
  const lenisRef = useRef(null)
  const scrollProgressRef = useRef(0)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [lightbox, setLightbox] = useState(null)
  const [bookingIntent, setBookingIntent] = useState(null)
  const [scene3DActive, setScene3DActive] = useState(() => siteConfig.scene3D?.enabled !== false && !reducedMotion)

  useEffect(() => {
    const is3D = scene3DActive && !reducedMotion
    document.body.classList.toggle('has-scene-3d', is3D)
    return () => {
      document.body.classList.remove('has-scene-3d')
    }
  }, [scene3DActive, reducedMotion])

  useEffect(() => {
    document.body.classList.toggle('loader-locked', loading)
    if (lenisRef.current) {
      if (loading) lenisRef.current.stop()
      else if (!menuOpen) lenisRef.current.start()
    }
    return () => {
      document.body.classList.remove('loader-locked')
    }
  }, [loading, menuOpen])

  useEffect(() => {
    if (loading) return undefined
    const ctx = gsap.context(() => {
      gsap.utils.toArray('[data-reveal]').forEach((element) => {
        gsap.fromTo(element, { y: 34, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 88%', once: true } })
      })
      if (!reducedMotion) {
        gsap.fromTo('.hero-media img', { scale: 1.16 }, { scale: 1.03, duration: 2, ease: 'power2.out' })
        gsap.to('.hero-media img', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
        gsap.to('.hero__shade-sunset', { opacity: 1, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
        gsap.fromTo('.hero-copy-line', { yPercent: 105, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.05, stagger: 0.13, delay: 0.05, ease: 'power4.out' })
        gsap.utils.toArray('.image-reveal img').forEach((image) => gsap.fromTo(image, { scale: 1.08 }, { scale: 1, duration: 1.2, ease: 'power2.out', scrollTrigger: { trigger: image, start: 'top 86%', once: true } }))
        const track = document.querySelector('.rooms-track')
        const pin = document.querySelector('.rooms-pin')
        if (track && pin && window.matchMedia('(min-width: 981px)').matches) {
          const getDistance = () => Math.max(0, track.scrollWidth - window.innerWidth + 80)
          gsap.to(track, { x: () => -getDistance(), ease: 'none', scrollTrigger: { trigger: pin, start: 'top top', end: () => `+=${getDistance()}`, scrub: 1, pin: true, anticipatePin: 1, invalidateOnRefresh: true } })
        }
      }
      ScrollTrigger.refresh()
    })
    return () => {
      ctx.revert()
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [loading, reducedMotion])

  useEffect(() => {
    const bar = document.querySelector('.progress-bar')
    const updateProgress = (scrollVal) => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      const p = scrollable > 0 ? Math.min(1, Math.max(0, scrollVal / scrollable)) : 0
      scrollProgressRef.current = p
      if (bar) bar.style.transform = `scaleX(${p})`
    }
    const onScroll = () => updateProgress(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (reducedMotion) return undefined
    const lenis = new Lenis({ lerp: 0.085, smoothWheel: true })
    lenisRef.current = lenis
    const onScroll = (e) => {
      ScrollTrigger.update()
      if (e && typeof e.progress === 'number') {
        scrollProgressRef.current = e.progress
      }
    }
    const raf = (time) => lenis.raf(time * 1000)
    lenis.on('scroll', onScroll)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    return () => {
      lenis.off('scroll', onScroll)
      gsap.ticker.remove(raf)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [reducedMotion])

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen)
    if (lenisRef.current) {
      if (menuOpen) lenisRef.current.stop()
      else lenisRef.current.start()
    }
    return () => {
      document.body.classList.remove('menu-open')
      lenisRef.current?.start()
    }
  }, [menuOpen])

  const openBooking = (intent = {}) => {
    setBookingIntent(intent)
    window.setTimeout(() => document.querySelector('#contact')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' }), 40)
  }
  const handleAvailability = (dates) => openBooking(dates)
  return <>
    {loading && <Loader onComplete={() => setLoading(false)} />}
    {!loading && scene3DActive && !reducedMotion && (
      <Suspense fallback={null}>
        <Scene3DContainer
          scrollProgressRef={scrollProgressRef}
          enabled={scene3DActive}
          qualitySetting={siteConfig.scene3D?.quality || 'auto'}
          reducedMotion={reducedMotion}
        />
      </Suspense>
    )}
    <div className="progress-bar" aria-hidden="true" />
    <Header menuOpen={menuOpen} onMenuToggle={setMenuOpen} />
    <main>
      <Hero onAvailability={handleAvailability} />
      <WaveDivider fill="var(--sand)" />
      <AboutSection />
      <WaveDivider fill="var(--ocean-teal)" />
      <RoomsSection onBook={(room) => openBooking({ room: room.name })} />
      <WaveDivider fill="var(--cream)" />
      <AmenitiesSection />
      <WaveDivider fill="var(--sage)" />
      <DiningSection />
      <WaveDivider fill="var(--cream)" />
      <GallerySection onOpen={setLightbox} />
      <WaveDivider fill="var(--ocean-teal)" />
      <ReviewsSection />
      <WaveDivider fill="var(--sand)" />
      <LocationSection />
      <WaveDivider fill="var(--cream)" />
      <FaqSection />
      <WaveDivider fill="var(--laterite)" />
      <ContactSection bookingIntent={bookingIntent} />
      <WaveDivider fill="var(--ocean-teal)" />
    </main>
    <FooterSection
      scene3DActive={scene3DActive && !reducedMotion}
      onToggle3D={() => setScene3DActive((prev) => !prev)}
    />
    <WhatsAppFloat />
    <Lightbox image={lightbox} onClose={() => setLightbox(null)} />
    <CustomCursor />
    <div className="grain" aria-hidden="true" />
    <div className="sr-only">{siteConfig.brand.shortName} resort website</div>
  </>
}
