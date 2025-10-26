/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  safelist: [
    'guest-vocals-roadhog',
    'guest-vocals-comfort',
    'guest-vocals-dinosaurs',
    'guest-vocals-special',
    'collapsible-wrapper',
    'collapsible-content',
    'collapse-icon',
    'collapsed-content',
    'expanded-content',
    'collapsed-label',
    'event-border-solo',
    'event-border-roadhog',
    'event-border-comfort',
    'event-border-dinosaurs',
    'event-border-special',
    'event-border-guest',
    'header-border-solo',
    'header-border-roadhog',
    'header-border-comfort',
    'header-border-dinosaurs',
    'header-border-special',
    'header-border-guest',
    'bg-solo-light',
    'bg-roadhog-light',
    'bg-comfort-light',
    'bg-dinosaurs-light',
    'bg-special-light',
    'bg-guest-light',
    'text-hunter-solo-primary',
    'text-hunter-roadhog-primary',
    'text-hunter-comfort-primary',
    'text-hunter-dinosaurs-primary',
    'text-hunter-special-primary',
  ],
  theme: {
    extend: {
      colors: {
        // Hunter Archive primary colors
        'hunter-gold': {
          DEFAULT: '#b8913d',
          light: '#c9a66b',
          dark: '#a07c2f',
          darker: '#8b6914',
        },
        'hunter-green': {
          DEFAULT: '#6b8e23',
          light: '#8ba832',
          dark: '#5a7a1e',
          darker: '#4a6617',
        },
      },
      borderWidth: {
        '1.5': '1.5px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}