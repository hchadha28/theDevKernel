/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'primary': '#111018',
        'secondary': '#1f1e29',
        'accent': '#a260f8',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}