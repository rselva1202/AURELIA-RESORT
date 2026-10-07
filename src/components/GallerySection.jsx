import { siteConfig } from '../data/siteConfig'
import { ImageReveal, SectionHeading } from './UI'

export default function GallerySection({ onOpen }) {
  return (
    <section className="gallery section-cream" id="gallery" aria-labelledby="gallery-title">
      <div className="page-shell"><SectionHeading eyebrow="A glimpse of the good life" title="Keep a little light for later." body="The rooms are only part of it. Follow the shade, find the courtyard, stay for the last table in the sun." /></div>
      <div className="gallery-grid page-shell">
        {siteConfig.images.gallery.map((image, index) => <button type="button" className={`gallery-item gallery-item--${image.size}`} key={image.src} onClick={() => onOpen(image)} aria-label={`View gallery image ${index + 1}`}><ImageReveal image={image} cursorView /></button>)}
      </div>
      <div className="gallery__footer page-shell"><span>{siteConfig.brand.cityName} · {siteConfig.brand.coordinates}</span><span>Open daily, always slowly</span></div>
    </section>
  )
}
