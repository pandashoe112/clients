import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.detailsplash.com.au',
  output: 'static',
  build: { inlineStylesheets: 'auto' }
});
