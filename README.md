# AURELIA Resort

A premium, motion-rich single-page resort website for AURELIA in Udaipur, built with React, Vite, GSAP, ScrollTrigger, Lenis, and plain CSS.

## Run locally

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal. The app binds to `0.0.0.0` for managed preview compatibility.

## Production build

```bash
npm run build
npm run preview
```

## Deploy to Vercel

```bash
npm install -g vercel
vercel
vercel --prod
```

The site is a static frontend. All editable business details, prices, palette values, room data, and image references live in `src/data/siteConfig.js`.

## Replace the demo details

Edit `src/data/siteConfig.js` to update:

- Resort name, city, phone, WhatsApp number, address, hours, and check-in/out
- Palette and typography tokens
- Room names, prices, descriptions, and amenities
- Gallery, hero, dining, and editorial image URLs with alt text
- Reviews, FAQs, nearby attractions, and amenities
