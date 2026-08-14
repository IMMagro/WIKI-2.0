/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        qe: {
          bg: '#F8FAFD',
          white: '#FFFFFF',
          text: '#1E2022',
          textSecondary: '#77838F',
          blue: '#377DFF',
          magenta: '#F80086'
        }
      },
      fontFamily: {
        poppins: ['Poppins', 'Arial', 'Helvetica', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
