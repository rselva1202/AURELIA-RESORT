import { useEffect, useState } from 'react'
import { siteConfig } from '../data/siteConfig'
import { Button } from './UI'

const initialForm = { name: '', phone: '', checkIn: '', checkOut: '', guests: '2', room: '' }
const toIsoDate = (date) => date.toISOString().slice(0, 10)
const todayIso = () => toIsoDate(new Date())
const addDays = (dateString, days) => {
  const date = new Date(`${dateString}T00:00:00`)
  date.setDate(date.getDate() + days)
  return toIsoDate(date)
}
const formatDate = (value) => value ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`)) : 'Flexible'

export default function BookingForm({ bookingIntent }) {
  const [form, setForm] = useState(initialForm)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const today = todayIso()
  const minCheckOut = form.checkIn ? addDays(form.checkIn, 1) : addDays(today, 1)

  useEffect(() => {
    if (!bookingIntent) return
    setForm((current) => ({ ...current, ...bookingIntent }))
    setSent(false)
    setError('')
  }, [bookingIntent])

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
    setError('')
  }

  const submit = (event) => {
    event.preventDefault()
    const clean = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim()]))
    if (clean.checkIn && clean.checkIn < today) return setError('Choose a check-in date from today onwards.')
    if (clean.checkOut && (!clean.checkIn || clean.checkOut <= clean.checkIn)) return setError('Check-out must be at least one night after check-in.')
    setError('')
    const message = [`Hello ${siteConfig.brand.shortName}, I would like to enquire about a stay.`, `Name: ${clean.name}`, `Phone: ${clean.phone}`, `Check-in: ${formatDate(clean.checkIn)}`, `Check-out: ${formatDate(clean.checkOut)}`, `Guests: ${clean.guests}`, `Room: ${clean.room || 'Please recommend one'}`].join('\n')
    window.open(`https://wa.me/${siteConfig.brand.whatsapp}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
    setSent(true)
  }

  return (
    <div className="booking-card" data-reveal>
      <div className="booking-card__intro"><p className="eyebrow">Make it yours</p><h3>Tell us what a good stay looks like.</h3><p>Leave a few details and our small team will come back to you on WhatsApp with availability.</p></div>
      <form className="booking-form" onSubmit={submit} noValidate>
        <div className="form-row"><label className="floating-field"><input required value={form.name} onChange={(event) => setField('name', event.target.value)} placeholder=" " /><span>Your name</span></label><label className="floating-field"><input required type="tel" value={form.phone} onChange={(event) => setField('phone', event.target.value)} placeholder=" " /><span>Phone number</span></label></div>
        <div className="form-row"><label className="floating-field"><input type="date" min={today} value={form.checkIn} onChange={(event) => setField('checkIn', event.target.value)} placeholder=" " /><span>Check in</span></label><label className="floating-field"><input type="date" min={minCheckOut} value={form.checkOut} onChange={(event) => setField('checkOut', event.target.value)} placeholder=" " /><span>Check out</span></label></div>
        <div className="form-row"><label className="floating-field"><select value={form.guests} onChange={(event) => setField('guests', event.target.value)}><option value="1">1 guest</option><option value="2">2 guests</option><option value="3">3 guests</option><option value="4">4 guests</option></select><span>Guests</span></label><label className="floating-field"><select value={form.room} onChange={(event) => setField('room', event.target.value)}><option value="">Any room</option>{siteConfig.rooms.map((room) => <option key={room.id} value={room.name}>{room.name}</option>)}</select><span>Room preference</span></label></div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="booking-form__footer"><Button type="submit">Open WhatsApp</Button>{sent && <span className="form-success" role="status">Your message is ready in WhatsApp ↗</span>}</div>
      </form>
    </div>
  )
}
