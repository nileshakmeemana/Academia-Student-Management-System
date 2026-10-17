/** Design tokens from academia.html (gray / brand scales, shadows, radii). */
/** @type {import('tailwindcss').Config} */
const gray = {
  25: '#fdfdfd',
  50: '#fafafa',
  100: '#f5f5f5',
  200: '#e9eaeb',
  300: '#d5d7da',
  400: '#a4a7ae',
  500: '#717680',
  600: '#535862',
  700: '#414651',
  800: '#252b37',
  900: '#181d27',
  950: '#0a0d12',
};

module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}', './lib/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        // `slate` is used throughout the app; it now resolves to the mockup's gray scale.
        slate: gray,
        gray,
        brand: {
          25: '#fcfaff',
          50: '#f9f5ff',
          100: '#f4ebff',
          200: '#e9d7fe',
          300: '#d6bbfb',
          400: '#b692f6',
          500: '#9e77ed',
          600: '#7f56d9',
          700: '#6941c6',
          800: '#53389e',
          900: '#42307d',
        },
        // success scale from the mockup (trend arrows, online dots)
        emerald: {
          50: '#ecfdf3',
          100: '#dcfae6',
          200: '#abefc6',
          300: '#75e0a7',
          400: '#47cd89',
          500: '#17b26a',
          600: '#079455',
          700: '#067647',
          800: '#085d3a',
        },
      },
      fontSize: {
        // mockup uses 13px for labels, hints and badges
        13: ['13px', '18px'],
      },
      boxShadow: {
        xs: '0 1px 2px rgba(10, 13, 18, 0.05)',
        // secondary buttons / icon tiles ("skeuomorphic" inner border)
        skeuo: '0 1px 2px rgba(10, 13, 18, 0.05), inset 0 0 0 1px rgba(10, 13, 18, 0.18), inset 0 -2px 0 0 rgba(10, 13, 18, 0.05)',
        // primary buttons
        'skeuo-brand': '0 1px 2px rgba(10, 13, 18, 0.05), inset 0 0 0 1px rgba(10, 13, 18, 0.18), inset 0 -2px 0 0 rgba(10, 13, 18, 0.05)',
        hover: '0 4px 7px -2px rgba(10, 13, 18, 0.06)',
        lg: '0 12px 16px -4px rgba(10, 13, 18, 0.08), 0 4px 6px -2px rgba(10, 13, 18, 0.03)',
        '2xl': '0 24px 48px -12px rgba(10, 13, 18, 0.18)',
        focus: '0 0 0 4px rgba(158, 119, 237, 0.24)',
        logo: '0 1px 2px rgba(10, 13, 18, 0.08), inset 0 0 0 1px rgba(10, 13, 18, 0.08)',
      },
    },
  },
  plugins: [],
};
