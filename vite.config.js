import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { siteConfig } from './src/data/siteConfig.js'

const replaceToken = (html, token, value) =>
  html.replaceAll(`__${token}__`, value)

export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : '/GOD-S-HEAVEN/',

  plugins: [
    react(),
    {
      name: 'thira-config-meta',
      transformIndexHtml(html) {
        const ogImage = siteConfig.images.hero.src.replace(
          /([?&])w=\d+/,
          '$1w=1600'
        )

        return [
          ['THEME_COLOR', siteConfig.theme.ink],
          ['META_DESCRIPTION', siteConfig.seo.description],
          ['OG_TITLE', siteConfig.seo.title],
          ['OG_DESCRIPTION', siteConfig.seo.ogDescription],
          ['OG_IMAGE', ogImage],
          ['SITE_TITLE', siteConfig.seo.title],
          ['ROBOTS_META', siteConfig.demoMode ? 'noindex,nofollow' : 'index,follow'],
        ].reduce(
          (result, [token, value]) => replaceToken(result, token, value),
          html
        )
      },
    },
  ],

  server: {
    host: '0.0.0.0',
    port: 3000,
  },

  build: {
    target: 'es2020',
    sourcemap: true,
  },
}))
