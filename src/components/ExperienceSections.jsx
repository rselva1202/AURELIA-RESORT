import { useState } from 'react'
import { siteConfig, navigation } from '../data/siteConfig'
import BookingForm from './BookingForm'
import { ArrowIcon, Button, ImageReveal, SectionHeading } from './UI'

export function AboutSection() {
  return (
    <section className="about section-sand" id="about" aria-labelledby="about-title">
      <div className="about__grid page-shell">
        <ImageReveal image={siteConfig.images.about} className="about__image" />
        <div className="about__copy">
          <SectionHeading
            eyebrow={siteConfig.about?.eyebrow || `${siteConfig.brand.shortName} story`}
            title={siteConfig.about?.title || 'A perch above the waves.'}
            body={siteConfig.about?.body}
          />
          <div className="about__signature">
            {siteConfig.brand.logo ? (
              <img src={siteConfig.brand.logo} alt="" className="about__signature-logo" />
            ) : (
              <span className="signature-mark">{siteConfig.brand.shortName ? siteConfig.brand.shortName[0] : 'G'}</span>
            )}
            <span>{siteConfig.about?.caption || 'Perched quietly on the Varkala cliff.'}</span>
          </div>
          <a className="text-link" href="#location">Find your way here <ArrowIcon /></a>
        </div>
      </div>
    </section>
  )
}

export function AmenitiesSection() {
  return (
    <section className="amenities section-cream" aria-labelledby="amenities-title">
      <div className="amenities__marquee" aria-hidden="true">
        <div>
          {[...siteConfig.amenities, ...siteConfig.amenities].map((item, index) => (
            <span key={`${item.name}-${index}`}>
              <b>{item.icon}</b>{item.name}
            </span>
          ))}
        </div>
      </div>
      <div className="amenities__content page-shell">
        <SectionHeading
          eyebrow="The easy parts"
          title="Everything you need. Nothing you don't."
          body="From a sunrise yoga deck to ocean breeze that takes its time, the coastal essentials are already here."
        />
        <div className="amenities__stats">
          {siteConfig.stats.map((stat) => (
            <div className="stat" key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function DiningSection() {
  return (
    <section className="dining section-sage" aria-labelledby="dining-title">
      <div className="dining__grid page-shell">
        <div className="dining__copy">
          <SectionHeading
            eyebrow={siteConfig.dining?.eyebrow || 'At the table'}
            title={siteConfig.dining?.title || 'The Cliff Table'}
            body={siteConfig.dining?.body}
          />
          <Button href="#contact" variant="outline">Ask about dinner</Button>
        </div>
        <ImageReveal image={siteConfig.images.dining} className="dining__image" />
      </div>
    </section>
  )
}

export function ReviewsSection() {
  const [active, setActive] = useState(0)
  const review = siteConfig.reviews[active]
  return (
    <section className="reviews section-ink" aria-labelledby="reviews-title">
      <div className="reviews__inner page-shell">
        <SectionHeading eyebrow="A few kind words" title="Leave room for a little wonder." dark />
        <div className="review-card" data-reveal>
          <div className="review-card__quote">“</div>
          <blockquote>{review.quote}</blockquote>
          <div className="review-card__meta">
            <span>{review.author}</span>
            <small>{review.stay}</small>
          </div>
          <div className="review-card__controls">
            <button
              type="button"
              aria-label="Previous review"
              onClick={() => setActive((active - 1 + siteConfig.reviews.length) % siteConfig.reviews.length)}
            >
              ←
            </button>
            <span>0{active + 1} <i>/</i> 0{siteConfig.reviews.length}</span>
            <button
              type="button"
              aria-label="Next review"
              onClick={() => setActive((active + 1) % siteConfig.reviews.length)}
            >
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export function LocationSection() {
  const waterWords = (siteConfig.brand.waterBodyName || 'Arabian Sea').split(' ')
  return (
    <section className="location section-sand" id="location" aria-labelledby="location-title">
      <div className="location__grid page-shell">
        <div className="location__copy">
          <SectionHeading
            eyebrow={siteConfig.location?.eyebrow || 'Close to the good things'}
            title={siteConfig.location?.title || 'Meet us on the cliff.'}
            body={siteConfig.location?.body}
          />
          <div className="attractions">
            {siteConfig.attractions.map((place) => (
              <div className="attraction" key={place.name}>
                <span>{place.distance}</span>
                <div>
                  <strong>{place.name}</strong>
                  <small>{place.detail}</small>
                </div>
                <ArrowIcon />
              </div>
            ))}
          </div>
        </div>
        <div
          className="map-card"
          role="img"
          aria-label={`Stylised map showing ${siteConfig.brand.shortName} in ${siteConfig.brand.locationLine}`}
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
            {siteConfig.brand.logo ? (
              <img src={siteConfig.brand.logo} alt="" className="map-card__pin-logo" />
            ) : (
              <span>{siteConfig.brand.shortName ? siteConfig.brand.shortName[0] : 'G'}</span>
            )}
            <b>{siteConfig.brand.shortName}</b>
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
    <section className="faq section-cream" aria-labelledby="faq-title">
      <div className="faq__grid page-shell">
        <SectionHeading
          eyebrow="The small print, made simple"
          title="Good to know."
          body="A few things guests often ask before arriving at the cliff."
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

export function ContactSection({ bookingIntent }) {
  return (
    <section className="contact section-terracotta" id="contact" aria-labelledby="contact-title">
      <div className="contact__top page-shell">
        <div>
          <p className="eyebrow">Start with a hello</p>
          <h2 id="contact-title">Your next slow morning<br /><em>could start here.</em></h2>
        </div>
        <a className="contact__phone" href={siteConfig.brand.phoneHref}>
          {siteConfig.brand.phone}
          <span>Call to enquire <ArrowIcon /></span>
        </a>
      </div>
      <div className="page-shell">
        <BookingForm bookingIntent={bookingIntent} />
      </div>
      <div className="contact__details page-shell">
        <div>
          <span>Address</span>
          <p>{siteConfig.brand.address}</p>
        </div>
        <div>
          <span>Hours</span>
          <p>{siteConfig.brand.hours}<br />{siteConfig.brand.email}</p>
        </div>
        <div>
          <span>Check-in / out</span>
          <p>{siteConfig.brand.checkIn}<br />{siteConfig.brand.checkOut}</p>
        </div>
      </div>
    </section>
  )
}

export function FooterSection({ scene3DActive = false, onToggle3D }) {
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
            <span>Say hello</span>
            <a href={siteConfig.brand.phoneHref}>{siteConfig.brand.phone}</a>
            <a href={`mailto:${siteConfig.brand.email}`}>{siteConfig.brand.email}</a>
          </div>
        </div>
      </div>
      {onToggle3D && (
        <div className="footer__motion-control page-shell">
          <button
            type="button"
            className="motion-toggle-btn"
            onClick={onToggle3D}
            aria-pressed={scene3DActive}
          >
            {scene3DActive ? '✦ 3D Scene Active · Switch to 2D' : '✧ 3D Scene Off · Switch to 3D'}
          </button>
        </div>
      )}
      <div className="footer__bottom page-shell">
        <span>© {new Date().getFullYear()} {siteConfig.brand.shortName}</span>
        <span className="footer__demo-note">{siteConfig.demoNote || 'Sample website demo'}</span>
        <span>{siteConfig.brand.locationLine}</span>
      </div>
    </footer>
  )
}

function BrandFooter() {
  return (
    <div className="footer-brand" aria-label={siteConfig.brand.name}>
      {siteConfig.brand.logo && (
        <img src={siteConfig.brand.logo} alt="" className="footer-brand__logo" />
      )}
      <div className="footer-brand__text">
        <span>{siteConfig.brand.name}</span>
        {siteConfig.brand.descriptor && <small>{siteConfig.brand.descriptor}</small>}
      </div>
    </div>
  )
}
