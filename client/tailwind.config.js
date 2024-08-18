/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin')
module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      spacing: {
        30: '7.5rem'
      },
      gridTemplateRows: {
        'auto-min-content': 'min-content'
      },
      height: {
        112: '28rem',
        128: '32rem',
        200: '50rem',
        180: '43rem',
        160: '40rem',
        140: '35rem',
        120: '30rem',
        100: '25rem'
      },
      textShadow: {
        default: '2px 2px 4px rgba(0, 0, 0, 0.5)'
      },
      transitionProperty: {
        height: 'height',
        spacing: 'margin, padding',
        transform: 'transform'

      },
      boxShadow: {
        right: '8px 0 15px -3px rgba(0, 0, 0, 0.1), 4px 0 6px -2px rgba(0, 0, 0, 0.05)',
        bottom: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      },
      aspectRatio: ['responsive']
    }
  },
  variants: {
    extend: {
      translate: ['responsive', 'group-hover', 'hover', 'focus'],
      transitionProperty: ['responsive', 'motion-safe', 'motion-reduce']
    }
  },
  plugins: [
    // require('@tailwindcss/transition'),
    // require('@tailwindcss/transform'),
    require('tailwindcss-transitions')(),
    require('tailwindcss-textshadow'),
    require('@tailwindcss/aspect-ratio'),
    // require('@tailwindcss/forms'),
    function ({ addUtilities }) {
      const newUtilities = {
        '.custom-scrollbar::-webkit-scrollbar': {
          width: '8px'
        },
        '.custom-scrollbar::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '4px'
        },
        '.custom-scrollbar::-webkit-scrollbar-track': {
          backgroundColor: 'rgba(0, 0, 0, 0.05)'
        }
      }
      addUtilities(newUtilities, ['responsive', 'hover'])
    },
    plugin(({ addVariant, e }) => {
      addVariant('sidebar-expanded', ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => `.sidebar-expanded .${e(`sidebar-expanded${separator}${className}`)}`)
      })
    })
  ]
}
