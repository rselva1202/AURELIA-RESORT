import { useState } from 'react'
import { siteConfig } from '../data/siteConfig'
import { ArrowIcon, Button, ImageReveal } from './UI'

const toIsoDate = (date) => date.toISOString().slice(0, 10)
const todayIso = () => toIsoDate(new Date())
const addDays = (dateString, days) => {
  const date = new Date(`${dateString}T00:00:00`)
  date.setDate(date.getDate() + days)
  return toIsoDate(date)
}

export default function Hero({ onAvailability }) {
  const [dates, setDates] = useState({ checkIn: '', checkOut: '', guests: '2' })
  const [error, setError] = useState('')
  const today = todayIso()
  const minCheckOut = dates.checkIn ? addDays(dates.checkIn, 1) : addDays(today, 1)
  const setField = (key, value) => {
    setDates((current) => ({ ...current, [key]: value }))
    if (key === 'checkIn' && dates.checkOut && dates.checkOut <= value) setDates((current) => ({ ...current, checkIn: value, checkOut: '' }))
    setError('')
  }
  const submit = (event) => {
    event.preventDefault()
    if (dates.checkIn && dates.checkIn < today) return setError('Choose a check-in date from today onwards.')
    if (dates.checkOut && (!dates.checkIn || dates.checkOut <= dates.checkIn)) return setError('Check-out must be at least one night after check-in.')
    setError('')
    onAvailability(dates)
  }
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero__media"><ImageReveal image={siteConfig.images.hero} eager className="hero-media" /></div>
      <div className="hero__shade" />
      <div className="hero__shade-sunset" aria-hidden="true" />
      <div className="hero__content page-shell">
        <div className="hero__eyebrow" aria-hidden="true"><span className="hero__line" /></div>
        <h1 id="hero-title">{siteConfig.brand.taglineLines.map((line, index) => <span className={`hero-copy-line ${index === 1 ? 'hero-copy-line--indent' : ''}`} key={line}>{line}</span>)}</h1>
        <p className="hero__subline">{siteConfig.brand.subline}</p>
        <div className="hero__actions"><Button href="#contact">Check availability</Button><a className="text-link text-link--light" href="#about">Discover {siteConfig.brand.shortName} <ArrowIcon /></a></div>
      </div>
      <div className="hero__availability page-shell" data-reveal>
        <form onSubmit={submit} noValidate>
          <label><span>Check in</span><input type="date" min={today} value={dates.checkIn} onChange={(event) => setField('checkIn', event.target.value)} aria-label="Check-in date" /></label>
          <label><span>Check out</span><input type="date" min={minCheckOut} value={dates.checkOut} onChange={(event) => setField('checkOut', event.target.value)} aria-label="Check-out date" /></label>
          <label><span>Guests</span><select value={dates.guests} onChange={(event) => setField('guests', event.target.value)} aria-label="Number of guests"><option value="1">1 guest</option><option value="2">2 guests</option><option value="3">3 guests</option><option value="4">4 guests</option></select></label>
          <button type="submit" className="availability-submit" aria-label="Check availability"><span>Enquire now</span><ArrowIcon /></button>
        </form>
        {error && <p className="availability-error" role="alert">{error}</p>}
      </div>
      <div className="hero__scroll"><span>Scroll to wander</span><i /></div>
    </section>
  )
}
