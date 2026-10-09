import { siteConfig } from '../data/siteConfig'
import { Button, ImageReveal, SectionHeading } from './UI'

export default function RoomsSection({ onBook }) {
  const intro = siteConfig.roomsSection || {
    eyebrow: 'Stay a little longer',
    title: 'Rooms with room to breathe.',
    body: 'Four ways to slow down. Each one is shaped by sea breeze, golden cliff light, and the kind of details you notice on day two.',
  }

  return (
    <section className="rooms section-dark" id="rooms" aria-labelledby="rooms-title">
      <div className="rooms__intro page-shell">
        <SectionHeading
          eyebrow={intro.eyebrow}
          title={intro.title}
          body={intro.body}
          dark
        />
        <div className="rooms__note">
          <span>01—04</span>
          <p>Swipe through our rooms<br />or let the day decide.</p>
        </div>
      </div>
      <div className="rooms-pin">
        <div className="rooms-track">
          {siteConfig.rooms.map((room) => (
            <article className="room-card" key={room.id}>
              <ImageReveal image={room.image} className="room-card__image" cursorView />
              <div className="room-card__body">
                <div className="room-card__top">
                  <p className="eyebrow">{room.eyebrow}</p>
                  <span>{room.size} · {room.guests}</span>
                </div>
                <h3>{room.name}</h3>
                <p className="room-card__description">{room.description}</p>
                <ul>
                  {room.amenities.map((amenity) => (
                    <li key={amenity}>{amenity}</li>
                  ))}
                </ul>
                <div className="room-card__bottom">
                  <div>
                    <strong>{room.price}</strong>
                    <span>{room.suffix}</span>
                  </div>
                  <Button variant="outline-light" onClick={() => onBook(room)}>
                    Book this room
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
