import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://dunk.agency',
  output: 'static',
  // the stylesheets are plain files in public/css, linked by Base.astro, so
  // there is nothing for Astro to inline
  build: { inlineStylesheets: 'never' },
});
