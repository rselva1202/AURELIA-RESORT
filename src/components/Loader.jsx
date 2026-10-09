import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { siteConfig } from '../data/siteConfig'
import useReducedMotion from '../hooks/useReducedMotion'

const SESSION_STORAGE_KEY = 'thira_loader_session_seen'

export function Loader({ onComplete }) {
  const hookReduced = useReducedMotion()
  const isReduced = hookReduced || (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false)
  const loaderRef = useRef(null)
  const wavesGroupRef = useRef(null)
  const waveSandRef = useRef(null)
  const waveFoamRef = useRef(null)
  const sunRef = useRef(null)
  const surgeRef = useRef(null)
  const [progress, setProgress] = useState(0)

  const config = siteConfig.loader || {
    brandName: 'THIRA',
    tagline: 'Varkala · Kerala',
    colors: {
      bg: '#0B3C49',
      foam: '#C7E8E0',
      sand: '#E3CEAA',
      outline: 'rgba(255, 255, 255, 0.45)',
      sun: '#F7A072',
      sunGlow: 'rgba(247, 160, 114, 0.55)',
      horizon: 'rgba(255, 255, 255, 0.22)',
      text: '#F7F4EE',
      textMuted: 'rgba(247, 244, 238, 0.72)',
    },
    timings: {
      minDuration: 1800,
      maxDuration: 4000,
      quickFadeDuration: 600,
      reducedMotionDuration: 800,
    },
  }

  const { brandName, tagline, colors, timings } = config

  // Check session storage for repeat visit
  const isFirstVisitRef = useRef(null)
  if (isFirstVisitRef.current === null) {
    try {
      const seen = window.sessionStorage.getItem(SESSION_STORAGE_KEY)
      isFirstVisitRef.current = !seen
    } catch {
      isFirstVisitRef.current = true
    }
  }

  useEffect(() => {
    // 1. Reduced Motion Mode
    if (isReduced) {
      const duration = (timings.reducedMotionDuration || 800) / 1000
      const fadeDuration = Math.min(0.35, duration * 0.4)
      const delay = Math.max(0, duration - fadeDuration)
      const tl = gsap.timeline({ onComplete: () => onComplete?.() })
      tl.to(loaderRef.current, {
        opacity: 0,
        duration: fadeDuration,
        delay,
        ease: 'power2.out',
      })
      return () => tl.kill()
    }

    // 2. Repeat Visit per Session: quick fade
    if (!isFirstVisitRef.current) {
      const tl = gsap.timeline({ onComplete: () => onComplete?.() })
      tl.to(loaderRef.current, {
        opacity: 0,
        duration: (timings.quickFadeDuration || 600) / 1000,
        ease: 'power2.out',
      })
      return () => tl.kill()
    }

    // 3. First Visit: Full Varkala Sea-Themed Tide Experience
    const ctx = gsap.context(() => {
      // Looping wave oscillations horizontally inside the letters
      if (waveSandRef.current) {
        gsap.to(waveSandRef.current, {
          x: -300,
          duration: 4.2,
          repeat: -1,
          ease: 'none',
        })
      }
      if (waveFoamRef.current) {
        gsap.to(waveFoamRef.current, {
          x: -300,
          duration: 3.1,
          repeat: -1,
          ease: 'none',
        })
      }

      // Initial visual states
      if (wavesGroupRef.current) {
        wavesGroupRef.current.setAttribute('transform', 'translate(0, 125)')
      }
      if (sunRef.current) {
        sunRef.current.style.transform = 'translateY(-34px)'
      }

      const updateVisuals = (val) => {
        const clamped = Math.min(100, Math.max(0, val))
        setProgress(Math.round(clamped))

        // Tide rises vertically inside the letters (from 125 to -20)
        const waveY = 125 - (clamped / 100) * 145
        if (wavesGroupRef.current) {
          wavesGroupRef.current.setAttribute('transform', `translate(0, ${waveY})`)
        }

        // Sun slowly sinks toward the horizon line (from -34px to -2px)
        const sunY = -34 + (clamped / 100) * 32
        if (sunRef.current) {
          sunRef.current.style.transform = `translateY(${sunY}px)`
        }
      }

      let isFinished = false
      const finishTimeline = () => {
        if (isFinished) return
        isFinished = true

        const tl = gsap.timeline({
          onComplete: () => {
            try {
              window.sessionStorage.setItem(SESSION_STORAGE_KEY, 'true')
            } catch {}
            onComplete?.()
          },
        })

        // Wave rises to cover the screen
        if (surgeRef.current) {
          tl.to(surgeRef.current, {
            yPercent: 0,
            duration: 0.55,
            ease: 'power2.inOut',
          })
        }

        // Loader slides up with curved, wave-shaped bottom edge to reveal hero
        if (loaderRef.current) {
          tl.to(loaderRef.current, {
            yPercent: -100,
            duration: 0.85,
            ease: 'power3.inOut',
          })
        }
      }

      // Track real asset loading: fonts and hero image
      const fontsPromise = document.fonts ? document.fonts.ready.catch(() => {}) : Promise.resolve()
      const heroPromise = new Promise((resolve) => {
        const heroSrc = siteConfig.images?.hero?.src
        if (!heroSrc) return resolve()
        const img = new Image()
        img.src = heroSrc
        if (img.complete) return resolve()
        img.onload = () => resolve()
        img.onerror = () => resolve()
      })

      const startTime = performance.now()
      const progObj = { val: 0 }

      // Smooth progress tween towards 80% while loading
      const progTween = gsap.to(progObj, {
        val: 80,
        duration: (timings.minDuration || 1800) / 1000,
        ease: 'power1.out',
        onUpdate: () => updateVisuals(progObj.val),
      })

      // When fonts & hero image finish loading:
      Promise.all([fontsPromise, heroPromise]).then(() => {
        const elapsed = performance.now() - startTime
        const remainingTime = Math.max(0.35, ((timings.minDuration || 1800) - elapsed) / 1000)
        progTween.kill()
        gsap.to(progObj, {
          val: 100,
          duration: remainingTime,
          ease: 'power2.out',
          onUpdate: () => updateVisuals(progObj.val),
          onComplete: () => finishTimeline(),
        })
      })

      // Safety timeout: never longer than maxDuration (4000ms)
      const maxTimer = window.setTimeout(() => {
        if (!isFinished) {
          progTween.kill()
          gsap.to(progObj, {
            val: 100,
            duration: 0.25,
            ease: 'power1.out',
            onUpdate: () => updateVisuals(progObj.val),
            onComplete: () => finishTimeline(),
          })
        }
      }, timings.maxDuration || 4000)

      return () => {
        window.clearTimeout(maxTimer)
      }
    }, loaderRef)

    return () => ctx.revert()
  }, [isReduced, onComplete])

  return (
    <div
      ref={loaderRef}
      className={`loader loader--sea ${isReduced ? 'loader--reduced' : ''}`}
      role="status"
      aria-live="polite"
      aria-busy={progress < 100}
      style={{
        '--loader-bg': colors.bg,
        '--loader-foam': colors.foam,
        '--loader-sand': colors.sand,
        '--loader-text': colors.text,
        '--loader-text-muted': colors.textMuted,
        '--loader-sun': colors.sun,
        '--loader-sun-glow': colors.sunGlow,
        '--loader-horizon': colors.horizon,
      }}
    >
      <span className="sr-only">
        Loading {brandName}. {progress}% complete.
      </span>

      {/* Subtle moving sand-grain noise texture */}
      <div className="loader__noise" aria-hidden="true" />

      {isReduced ? (
        <div className="loader__content loader__content--reduced">
          <h1 className="loader__brand-static">{brandName}</h1>
          <p className="loader__tagline">{tagline}</p>
        </div>
      ) : (
        <div className="loader__content">
          {/* Centred Brand Name with SVG wave fill clip */}
          <div className="loader__name-wrap">
            <svg
              viewBox="0 0 600 160"
              className="loader__name-svg"
              aria-hidden="true"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <clipPath id="thira-loader-text-clip">
                  <text
                    x="50%"
                    y="54%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="loader__text-glyph"
                  >
                    {brandName}
                  </text>
                </clipPath>
              </defs>

              {/* Waves rising inside letters */}
              <g clipPath="url(#thira-loader-text-clip)">
                <g ref={wavesGroupRef} className="loader__wave-fill-group">
                  {/* Layer 1: Sand wave behind */}
                  <path
                    ref={waveSandRef}
                    className="loader__wave-path loader__wave-sand"
                    fill={colors.sand}
                    d="M 0 35 Q 75 12 150 35 T 300 35 T 450 35 T 600 35 T 750 35 T 900 35 T 1050 35 T 1200 35 L 1200 250 L 0 250 Z"
                  />
                  {/* Layer 2: Sea-foam wave in front */}
                  <path
                    ref={waveFoamRef}
                    className="loader__wave-path loader__wave-foam"
                    fill={colors.foam}
                    d="M 0 42 Q 75 62 150 42 T 300 42 T 450 42 T 600 42 T 750 42 T 900 42 T 1050 42 T 1200 42 L 1200 250 L 0 250 Z"
                  />
                </g>
              </g>

              {/* Crisp outline lettering */}
              <text
                x="50%"
                y="54%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="loader__text-glyph loader__text-outline"
                fill="none"
                stroke={colors.outline}
                strokeWidth="1.5"
              >
                {brandName}
              </text>
            </svg>
          </div>

          {/* Counter and Tagline below name */}
          <div className="loader__meta">
            <span className="loader__counter" aria-hidden="true">
              {progress}%
            </span>
            <span className="loader__tagline">{tagline}</span>
          </div>

          {/* Horizon line with sinking sun */}
          <div className="loader__horizon-wrap" aria-hidden="true">
            <div ref={sunRef} className="loader__sun" />
            <div className="loader__horizon-line" />
          </div>

          {/* Tiny looping lightweight seagull */}
          <svg
            className="loader__seagull"
            viewBox="0 0 28 12"
            aria-hidden="true"
          >
            <path
              d="M 2 9 Q 7 2 14 7 Q 21 2 26 9 Q 20 4 14 8 Q 8 4 2 9 Z"
              fill="rgba(247, 244, 238, 0.45)"
            />
          </svg>
        </div>
      )}

      {/* Screen-covering wave surge */}
      <div ref={surgeRef} className="loader__surge" aria-hidden="true">
        <div className="loader__surge-wave">
          <svg viewBox="0 0 1440 140" preserveAspectRatio="none">
            <path
              d="M 0,60 C 360,130 720,10 1080,90 C 1260,130 1380,30 1440,60 L 1440,140 L 0,140 Z"
              fill={colors.bg}
            />
          </svg>
        </div>
        <div className="loader__surge-body" style={{ background: colors.bg }} />
      </div>

      {/* Curved wave-shaped bottom edge when loader slides up */}
      <div className="loader__bottom-wave" aria-hidden="true">
        <svg viewBox="0 0 1440 140" preserveAspectRatio="none">
          <path
            d="M 0,0 L 1440,0 L 1440,25 C 1080,130 720,-10 0,65 Z"
            fill={colors.bg}
          />
        </svg>
      </div>
    </div>
  )
}
export default Loader
