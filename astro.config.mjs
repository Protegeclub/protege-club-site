// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';
import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  adapter: cloudflare({
    imageService: { build: 'compile', runtime: 'passthrough' }
  }),
  integrations: [preact()],
  vite: {
    plugins: [tailwindcss()]
  }
});