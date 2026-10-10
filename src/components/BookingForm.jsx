import { useEffect, useState } from 'react'
import { siteConfig } from '../data/siteConfig'
import { ArrowIcon, Button } from './UI'

const toIsoDate = (d) => d.toISOString().slice(0, 10)
const todayIso = () => toIsoDate(new Date())

export const formatDateDisplay = (dateString) => {
  if (!dateString) return 'Flexible'
  const [year, month, day] = dateString.split('-').map(Number)
  const d = new Date(Date.UTC(year, month - 1, day))
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

const defaultReservation = {
  name: '',
  people: '2 people',
  date: todayIso(),
  timeSlot: 'Sunset & Golden Hour (5:00 PM – 7:00 PM)',
  occasion: 'Casual dining',
  notes: '',
}

export default function BookingForm({ reservationIntent }) {
  const [form, setForm] = useState(defaultReservation)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const today = todayIso()

  useEffect(() => {
    if (reservationIntent) {
      setForm((prev) => ({ ...prev, ...reservationIntent }))
      setSubmitted(false)
      setError('')
    }
  }, [reservationIntent])

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError('')
  }

  const submit = (event) => {
    event.preventDefault()
    const clean = {
      name: form.name.trim(),
      people: form.people,
      date: form.date,
      timeSlot: form.timeSlot,
      occasion: form.occasion,
      notes: form.notes.trim(),
    }

    if (!clean.name) {
      return setError('Please enter your name.')
    }
    if (clean.date && clean.date < today) {
      return setError('Please choose a reservation date from today onwards.')
    }

    setError('')

    const formattedDate = formatDateDisplay(clean.date)
    const lines = [
      `Table Reservation Enquiry · ${siteConfig.brand.name}`,
      `Name: ${clean.name}`,
      `Number of people: ${clean.people}`,
      `Date: ${formattedDate}`,
      `Time slot: ${clean.timeSlot}`,
      clean.occasion ? `Occasion: ${clean.occasion}` : null,
      clean.notes ? `Notes: ${clean.notes}` : null,
    ].filter(Boolean)

    const message = lines.join('\n')
    const whatsappUrl = `https://wa.me/${siteConfig.brand.whatsapp}?text=${encodeURIComponent(message)}`

    setSubmitted(true)
    window.open(whatsappUrl, '_blank')
  }

  const reservationCfg = siteConfig.reservation || {
    title: 'Reserve a Table by the Sea',
    eyebrow: 'Table Reservation',
    description: 'Book your table for lunch, golden hour sunset, or an evening of live music on North Cliff.',
    timeSlots: ['Lunch (12:30 PM – 3:30 PM)', 'Sunset & Golden Hour (5:00 PM – 7:00 PM)', 'Dinner & Live Music (7:00 PM – 10:30 PM)', 'Other / Flexible'],
    occasions: ['Casual dining', 'Sunset drinks & dinner', 'Live music evening', 'Birthday celebration', 'Anniversary', 'Group / Family feast'],
    guestOptions: ['1 person', '2 people', '3 people', '4 people', '5–8 people', '9+ group'],
  }

  return (
    <div className="booking-card" id="reservation">
      <div className="booking-card__intro">
        <p className="eyebrow">{reservationCfg.eyebrow}</p>
        <h3>{reservationCfg.title}</h3>
        <p>{reservationCfg.description}</p>
        <div className="booking-card__notes">
          <span>☼ Outdoor seating & Arabian Sea views</span>
          <span>♪ Live music every evening</span>
          <span>🌿 Vegetarian options available</span>
        </div>
      </div>

      <form className="booking-form" onSubmit={submit} noValidate>
        <div className="form-row">
          <label className="floating-field">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              placeholder=" "
              required
              aria-label="Your full name"
            />
            <span>Your name *</span>
          </label>
          <label className="floating-field">
            <select
              value={form.people}
              onChange={(e) => setField('people', e.target.value)}
              aria-label="Number of people"
            >
              {reservationCfg.guestOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <span>Number of people</span>
          </label>
        </div>

        <div className="form-row">
          <label className="floating-field">
            <input
              type="date"
              min={today}
              value={form.date}
              onChange={(e) => setField('date', e.target.value)}
              placeholder=" "
              required
              aria-label="Reservation date"
            />
            <span>Date *</span>
          </label>
          <label className="floating-field">
            <select
              value={form.timeSlot}
              onChange={(e) => setField('timeSlot', e.target.value)}
              aria-label="Preferred time slot"
            >
              {reservationCfg.timeSlots.map((slot) => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
            <span>Time slot</span>
          </label>
        </div>

        <div className="form-row">
          <label className="floating-field">
            <select
              value={form.occasion}
              onChange={(e) => setField('occasion', e.target.value)}
              aria-label="Occasion"
            >
              {reservationCfg.occasions.map((occ) => (
                <option key={occ} value={occ}>{occ}</option>
              ))}
            </select>
            <span>Occasion (optional)</span>
          </label>
          <label className="floating-field">
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setField('notes', e.target.value)}
              placeholder=" "
              aria-label="Special requests or dietary notes"
            />
            <span>Special requests / Dietary notes</span>
          </label>
        </div>

        <div className="booking-form__footer">
          <button type="submit" className="button button--primary">
            <span>Confirm on WhatsApp</span>
            <ArrowIcon />
          </button>
          {submitted && (
            <span className="form-success">
              WhatsApp opened! Send the message to complete your reservation.
            </span>
          )}
          {error && <p className="form-error" role="alert">{error}</p>}
        </div>
      </form>
    </div>
  )
}
