import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { siteConfig } from './src/data/siteConfig.js'

const replaceToken = (html, token, value) =>
  html.replaceAll(`__${token}__`, value)

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/AURELIA-RESORT/' : '/',

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
})
