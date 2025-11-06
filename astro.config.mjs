import { defineConfig } from 'astro/config';

// Your integrations
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  // 1. We NEED this. This is the fix for the error you saw.
  // This turns on the API server.
  output: 'server',

  // 2. We NEED this. The sitemap() integration requires it.
  // (Change this to your real URL before you go live)
  site: "https://example.com", 
  
  // 3. We NEED these. This is your Tailwind, MDX, and Sitemap.
  integrations: [
    tailwind(), 
    mdx(), 
    sitemap()
  ],
});