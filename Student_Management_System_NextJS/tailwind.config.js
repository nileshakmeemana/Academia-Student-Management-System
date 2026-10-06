/** Theme copied from the `tailwind.config` block in academia_student_management_system.html */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}', './lib/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        'canvas-bg': '#eceef0',
        'card-bg': '#ffffff',
        'slate-dark': '#1e2229',
        'slate-darker': '#14171c',
        'brand-green': '#65d33a',
        'brand-green-hover': '#5ec435',
      },
      borderRadius: {
        card: '10px',
        'card-lg': '32px',
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.02), 0 1px 2px -1px rgba(0, 0, 0, 0.02)',
        float: '0 20px 40px -15px rgba(15, 23, 42, 0.07), 0 0 1px 1px rgba(15, 23, 42, 0.03)',
        popover: '0 12px 28px -4px rgba(15, 23, 42, 0.12), 0 4px 10px -2px rgba(15, 23, 42, 0.06)',
      },
    },
  },
  plugins: [],
};
