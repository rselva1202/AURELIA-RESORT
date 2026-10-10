import { useMemo, useState } from 'react'
import { siteConfig } from '../data/siteConfig'
import { ArrowIcon, Button, SectionHeading } from './UI'

export default function MenuSection({ onReserveItem }) {
  const menuCfg = siteConfig.menu || {}
  const [activeCategory, setActiveCategory] = useState(menuCfg.categories?.[0]?.id || 'seafood')
  const [vegOnly, setVegOnly] = useState(false)

  const filteredItems = useMemo(() => {
    const categoryItems = (menuCfg.items || []).filter(
      (item) => item.category === activeCategory
    )
    if (!vegOnly) return categoryItems
    return categoryItems.filter((item) => item.veg === true)
  }, [menuCfg.items, activeCategory, vegOnly])

  return (
    <section className="menu-section section-sand" id="menu" aria-labelledby="menu-title">
      <div className="page-shell">
        <div className="menu-header">
          <SectionHeading
            eyebrow={`${menuCfg.badge || 'Our Menu'} · North Cliff, Varkala`}
            title={menuCfg.title || 'The Cliff Kitchen Menu.'}
            body={menuCfg.subtitle || 'Fresh Arabian catches, traditional clay pot preparations, and vegetarian delicacies.'}
          />
        </div>

        {/* Controls: Category tabs + Veg Only toggle */}
        <div className="menu-controls">
          <div className="menu-tabs" role="tablist" aria-label="Menu categories">
            {(menuCfg.categories || []).map((cat) => (
              <button
                key={cat.id}
                role="tab"
                type="button"
                aria-selected={activeCategory === cat.id}
                className={`menu-tab ${activeCategory === cat.id ? 'is-active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="menu-filter">
            <button
              type="button"
              id="veg-filter"
              className={`veg-toggle ${vegOnly ? 'is-active' : ''}`}
              onClick={() => setVegOnly((prev) => !prev)}
              aria-pressed={vegOnly}
              aria-label="Toggle vegetarian only items"
            >
              <span className="veg-toggle__dot" />
              <span className="veg-toggle__label">
                {vegOnly ? '🌿 Veg Only (Active)' : '🌿 Veg Only'}
              </span>
            </button>
          </div>
        </div>

        {/* Menu items grid */}
        <div className="menu-grid">
          {filteredItems.length === 0 ? (
            <div className="menu-empty">
              <p>No vegetarian-only items in this category. Browse our <strong>Vegetarian</strong> tab or disable the Veg Only filter.</p>
              <Button variant="outline" onClick={() => { setActiveCategory('vegetarian'); setVegOnly(true) }}>
                Go to Vegetarian tab
              </Button>
            </div>
          ) : (
            filteredItems.map((item) => (
              <article className="menu-item" key={item.id} data-reveal>
                <div className="menu-item__header">
                  <div className="menu-item__title-wrap">
                    <span className={`menu-item__dot ${item.veg ? 'menu-item__dot--veg' : 'menu-item__dot--nonveg'}`} aria-label={item.veg ? 'Vegetarian' : 'Non-vegetarian'}>
                      <i />
                    </span>
                    <h3 className="menu-item__name">{item.name}</h3>
                  </div>
                  <span className="menu-item__price">{item.price || 'Price on menu'}</span>
                </div>

                <p className="menu-item__desc">{item.description}</p>

                <div className="menu-item__footer">
                  <span className="menu-item__tag">
                    {item.highlight ? '★ House Special' : item.veg ? 'Vegetarian' : 'Arabian Sea Catch'}
                  </span>
                  <a
                    href="#reservation"
                    className="menu-item__reserve-link"
                    onClick={(e) => {
                      e.preventDefault()
                      onReserveItem?.({ notes: `Interested in: ${item.name}` })
                    }}
                  >
                    Reserve table for this <ArrowIcon />
                  </a>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="menu-footer">
          <p className="menu-footer__disclaimer">
            * All seafood items are caught fresh daily and prepared to order. Special dietary requests and spice adjustments gladly accommodated.
          </p>
          <Button href="#reservation">Reserve a table</Button>
        </div>
      </div>
    </section>
  )
}
