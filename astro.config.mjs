import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://runbeacon.net',
  adapter: cloudflare(),
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
