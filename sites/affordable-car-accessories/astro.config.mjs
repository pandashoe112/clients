// @ts-check
import {defineConfig} from 'astro/config'

export default defineConfig({
  // Fully static. No adapter, no server runtime — Netlify just serves files.
  output: 'static',

  build: {
    // Emits /thank-you/index.html so the Google Ads conversion URL is /thank-you/.
    format: 'directory',
    inlineStylesheets: 'always',
  },

  image: {
    // Section images are optimised at build time by sharp. Hero and logo come from
    // the Sanity CDN instead, which handles format negotiation on the fly.
    remotePatterns: [{protocol: 'https', hostname: 'cdn.sanity.io'}],
  },

  vite: {
    ssr: {
      // The template ships .astro sources rather than a build, so Vite has to
      // process it instead of treating it as an external CJS dependency.
      noExternal: ['@dunk/landing-template'],
    },
  },
})
