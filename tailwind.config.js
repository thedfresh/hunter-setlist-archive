/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
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
        // Performer era colors - backgrounds
        'solo-bg': '#f5f1e8',
        'roadhog-bg': '#fef5e7',
        'comfort-bg': '#eff5e8',
        'dinosaurs-bg': '#e8f4ff',
        'special-bg': '#f0e8f0',
        // Performer era colors - borders (primary)
        'solo-border': '#b8913d',
        'roadhog-border': '#d4a017',
        'comfort-border': '#6b8e23',
        'dinosaurs-border': '#00d9ff',
        'special-border': '#7d5a80',
        // Performer era colors - borders (secondary stripe)
        'solo-border-dark': '#8b6914',
        'roadhog-border-dark': '#cc6600',
        'comfort-border-dark': '#8b7355',
        'dinosaurs-border-dark': '#7b2cbf',
        'special-border-dark': '#4a3850',
      },
      borderWidth: {
        '1.5': '1.5px',
      },
    },
  },
  plugins: [],
}