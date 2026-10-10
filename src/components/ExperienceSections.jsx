import { useEffect, useRef, useState } from 'react'
import { siteConfig, navigation } from '../data/siteConfig'
import BookingForm from './BookingForm'
import { ArrowIcon, Button, ImageReveal, SectionHeading } from './UI'
import brandLogo from '../assets/logo.png'

export function AboutSection() {
  const logoSrc = brandLogo || siteConfig.brand.logo
  return (
    <section className="about section-sand" id="about" aria-labelledby="about-title">
      <div className="about__grid page-shell">
        <ImageReveal
          image={siteConfig.images.about}
          className="about__image"
        />
        <div className="about__copy">
          <SectionHeading
            eyebrow={siteConfig.about?.eyebrow || 'Our Story & Perch'}
            title={siteConfig.about?.title || 'A cliff-top Kerala kitchen above the waves.'}
            body={siteConfig.about?.body}
          />
          <div className="about__signature">
            {logoSrc ? (
              <img src={logoSrc} alt={siteConfig.brand.name} className="about__signature-logo" />
            ) : (
              <span className="signature-mark">G</span>
            )}
            <span>{siteConfig.about?.caption || 'North Cliff near the Helipad · Est. 2012'}</span>
          </div>
          <div className="about__actions">
            <a className="text-link" href="#menu">
              Explore the sample menu <ArrowIcon />
            </a>
            <a className="text-link" href="#location">
              Find our cliff perch <ArrowIcon />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export function HighlightsSection({ onHighlightSelect }) {
  const highlights = siteConfig.highlights || []
  return (
    <section className="highlights section-cream" id="highlights" aria-labelledby="highlights-title">
      <div className="page-shell">
        <SectionHeading
          eyebrow="What We Offer"
          title="Cliffside Dining Highlights."
          body="Everything that makes an unhurried coastal meal on North Cliff special."
        />
        <div className="highlights-grid">
          {highlights.map((item, idx) => (
            <div className="highlight-card" key={item.id} data-reveal>
              <div className="highlight-card__top">
                <span className="highlight-card__icon" aria-hidden="true">{item.icon}</span>
                <span className="highlight-card__tag">{item.tag}</span>
              </div>
              <h3>{item.title}</h3>
              <p className="highlight-card__subtitle">{item.subtitle}</p>
              <p className="highlight-card__body">{item.description}</p>
              <button
                type="button"
                className="highlight-card__link text-link"
                onClick={() => onHighlightSelect?.(item.id)}
              >
                <span>Learn more</span> <ArrowIcon />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function OutdoorViewSection({ onReserveTable }) {
  const cfg = siteConfig.outdoorSeating || {}
  return (
    <section className="outdoor section-sand" id="outdoor" aria-labelledby="outdoor-title">
      <div className="outdoor__grid page-shell">
        <div className="outdoor__copy">
          <SectionHeading
            eyebrow={cfg.eyebrow || 'Cliffside Atmosphere'}
            title={cfg.title || 'Tables with unobstructed Arabian Sea views.'}
            body={cfg.body}
          />
          <ul className="outdoor__features" data-reveal>
            {(cfg.features || []).map((feat) => (
              <li key={feat}>
                <span className="feature-check" aria-hidden="true">✓</span>
                <span>{feat}</span>
              </li>
            ))}
          </ul>
          <div className="outdoor__actions">
            <Button href="#reservation" onClick={() => onReserveTable?.({ occasion: 'Sunset & Sea View Table' })}>
              Reserve a sunset table
            </Button>
          </div>
        </div>
        <div className="outdoor__media" data-reveal>
          <ImageReveal image={cfg.image || siteConfig.images.outdoor} className="outdoor__image" />
        </div>
      </div>
    </section>
  )
}

function AnimatedReviewsCounter({ target = 3800 }) {
  const [count, setCount] = useState(0)
  const counterRef = useRef(null)

  useEffect(() => {
    let triggered = false
    const checkVisible = () => {
      if (!triggered && counterRef.current) {
        const rect = counterRef.current.getBoundingClientRect()
        if (rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.95 && rect.bottom >= 0) {
          triggered = true
          const duration = 1800
          const startTime = performance.now()
          const step = (now) => {
            const elapsed = now - startTime
            const progress = Math.min(1, elapsed / duration)
            const ease = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(ease * target))
            if (progress < 1) {
              requestAnimationFrame(step)
            } else {
              setCount(target)
            }
          }
          requestAnimationFrame(step)
        }
      }
    }

    window.addEventListener('scroll', checkVisible, { passive: true })
    window.addEventListener('resize', checkVisible, { passive: true })
    const timer = setTimeout(checkVisible, 100)
    return () => {
      window.removeEventListener('scroll', checkVisible)
      window.removeEventListener('resize', checkVisible)
      clearTimeout(timer)
    }
  }, [target])

  return (
    <div ref={counterRef} className="reviews-counter">
      <span className="reviews-counter__num">{count.toLocaleString()}+</span>
      <span className="reviews-counter__label">Google Reviews</span>
    </div>
  )
}

export function ReviewsSection() {
  const [active, setActive] = useState(0)
  const data = siteConfig.reviewsData || { reviews: [] }
  const review = data.reviews?.[active] || {}
  const total = data.reviews?.length || 1

  return (
    <section className="reviews section-ink" id="reviews" aria-labelledby="reviews-title">
      <div className="reviews__inner page-shell">
        <div className="reviews__header">
          <SectionHeading
            eyebrow={data.eyebrow || 'Kind words from our guests'}
            title={data.title || 'Over 3,800 Google reviews.'}
            dark
          />
          <AnimatedReviewsCounter target={data.counter || 3800} />
        </div>

        <div className="review-card" data-reveal>
          <div className="review-card__badge-sample">sample review</div>
          <div className="review-card__quote">“</div>
          <blockquote>{review.quote}</blockquote>
          <div className="review-card__meta">
            <span>{review.author}</span>
            <small>{review.source}</small>
          </div>
          <div className="review-card__controls">
            <button
              type="button"
              aria-label="Previous review"
              onClick={() => setActive((active - 1 + total) % total)}
            >
              ←
            </button>
            <span>0{active + 1} <i>/</i> 0{total}</span>
            <button
              type="button"
              aria-label="Next review"
              onClick={() => setActive((active + 1) % total)}
            >
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export function EventsSection({ onEnquireEvent }) {
  const cfg = siteConfig.events || {}
  return (
    <section className="events section-cream" id="events" aria-labelledby="events-title">
      <div className="page-shell">
        <div className="events__grid">
          <div className="events__copy">
            <SectionHeading
              eyebrow={cfg.eyebrow || 'Gatherings & Celebrations'}
              title={cfg.title || 'Birthdays, group dinners & private celebrations.'}
              body={cfg.body}
            />
            <Button
              href="#reservation"
              onClick={() => onEnquireEvent?.({ occasion: 'Group / Birthday Celebration' })}
            >
              Enquire about a group table
            </Button>
          </div>
          <div className="events__options">
            {(cfg.options || []).map((opt) => (
              <div className="event-item" key={opt.title} data-reveal>
                <h4>{opt.title}</h4>
                <p>{opt.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function LocationSection() {
  const loc = siteConfig.location || {}
  const waterWords = (siteConfig.brand.waterBodyName || 'Arabian Sea').split(' ')
  const logoSrc = brandLogo || siteConfig.brand.logo

  return (
    <section className="location section-sand" id="location" aria-labelledby="location-title">
      <div className="location__grid page-shell">
        <div className="location__copy">
          <SectionHeading
            eyebrow={loc.eyebrow || 'Find Us on the Cliff'}
            title={loc.title || 'Near the Helipad on North Cliff.'}
            body={loc.body}
          />
          <div className="location__info-cards">
            <div className="info-card">
              <span className="info-card__label">Address</span>
              <p>{siteConfig.brand.address}</p>
              <small>Landmark: {siteConfig.brand.landmark}</small>
            </div>
            <div className="info-card">
              <span className="info-card__label">Opening Hours</span>
              <p>{siteConfig.brand.hours}</p>
            </div>
            <div className="info-card">
              <span className="info-card__label">Parking & Arrival</span>
              <p>{siteConfig.brand.parking}</p>
            </div>
          </div>
          <div className="location__actions">
            <Button
              href={siteConfig.brand.mapsUrl}
              target="_blank"
              variant="outline"
            >
              <span>Search on Google Maps</span>
              <ArrowIcon />
            </Button>
          </div>
        </div>

        <div
          className="map-card"
          role="img"
          aria-label={`Stylised map showing God's Own Country Kitchen on North Cliff near Helipad, Varkala`}
        >
          <div className="map-card__water">
            <span>
              {waterWords.map((word) => (
                <span key={word}>{word}<br /></span>
              ))}
            </span>
          </div>
          <div className="map-card__roads"><i /><i /><i /><i /></div>
          <div className="map-card__pin">
            {logoSrc ? (
              <img src={logoSrc} alt="" className="map-card__pin-logo" />
            ) : (
              <span>G</span>
            )}
            <b>{siteConfig.brand.shortName}</b>
            <small>North Cliff · Helipad</small>
          </div>
          <div className="map-card__footer">
            <span>{siteConfig.brand.coordinates}</span>
            <a href={siteConfig.brand.mapsUrl} target="_blank" rel="noreferrer">Open in Maps ↗</a>
          </div>
        </div>
      </div>
    </section>
  )
}

export function FaqSection() {
  const [open, setOpen] = useState(0)
  return (
    <section className="faq section-cream" id="faq" aria-labelledby="faq-title">
      <div className="faq__grid page-shell">
        <SectionHeading
          eyebrow="Helpful Details"
          title="Frequently Asked Questions."
          body="A few details guests ask before heading to our cliffside table."
        />
        <div className="faq-list">
          {siteConfig.faqs.map((faq, index) => (
            <div className={`faq-item ${open === index ? 'is-open' : ''}`} key={faq.question}>
              <button
                type="button"
                onClick={() => setOpen(open === index ? -1 : index)}
                aria-expanded={open === index}
              >
                <span>0{index + 1}</span>
                <strong>{faq.question}</strong>
                <i>{open === index ? '−' : '+'}</i>
              </button>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ContactSection({ reservationIntent }) {
  return (
    <section className="contact section-terracotta" id="contact" aria-labelledby="contact-title">
      <div className="contact__top page-shell">
        <div>
          <p className="eyebrow">Table Reservations & Enquiries</p>
          <h2 id="contact-title">An unhurried table<br /><em>overlooking the sea.</em></h2>
        </div>
        <a className="contact__phone" href={siteConfig.brand.phoneHref} target="_blank" rel="noreferrer">
          Chat on WhatsApp
          <span>Fastest reservation enquiry <ArrowIcon /></span>
        </a>
      </div>
      <div className="page-shell">
        <BookingForm reservationIntent={reservationIntent} />
      </div>
      <div className="contact__details page-shell">
        <div>
          <span>Location</span>
          <p>{siteConfig.brand.address}</p>
        </div>
        <div>
          <span>Hours</span>
          <p>{siteConfig.brand.hours}<br />{siteConfig.brand.phone}</p>
        </div>
        <div>
          <span>Direct Contact</span>
          <p>WhatsApp: {siteConfig.brand.whatsappLabel}<br />{siteConfig.brand.email}</p>
        </div>
      </div>
    </section>
  )
}

export function FooterSection() {
  return (
    <footer className="footer section-ink">
      <div className="footer__top page-shell">
        <BrandFooter />
        <div className="footer__links">
          <div>
            <span>Explore</span>
            {navigation.map((item) => (
              <a key={item.href} href={item.href}>{item.label}</a>
            ))}
          </div>
          <div>
            <span>Connect</span>
            <a href={siteConfig.brand.phoneHref} target="_blank" rel="noreferrer">WhatsApp Reservation</a>
            <a href={siteConfig.brand.mapsUrl} target="_blank" rel="noreferrer">Google Maps Location</a>
          </div>
        </div>
      </div>

      <div className="footer__bottom page-shell">
        <span>© {new Date().getFullYear()} {siteConfig.brand.shortName}</span>
        <span>{siteConfig.brand.locationLine}</span>
      </div>
    </footer>
  )
}

function BrandFooter() {
  const logoSrc = brandLogo || siteConfig.brand.logo
  return (
    <div className="footer-brand" aria-label={siteConfig.brand.name}>
      {logoSrc && (
        <img src={logoSrc} alt={siteConfig.brand.name} className="footer-brand__logo" />
      )}
      <div className="footer-brand__text">
        <span>{siteConfig.brand.name}</span>
        {siteConfig.brand.descriptor && <small>{siteConfig.brand.descriptor}</small>}
      </div>
    </div>
  )
}
