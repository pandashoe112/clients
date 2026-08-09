import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.revelectrical.com.au',
  output: 'static',
  build: { inlineStylesheets: 'auto' }
});
