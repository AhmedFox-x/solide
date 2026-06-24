/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html','./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: { DEFAULT:'#03050D', 800:'#07091A', 700:'#0C1128', 600:'#141828' },
        gold: { DEFAULT:'#C8963C', light:'#E0B050', dark:'#8A6020', pale:'#7A5520' },
        ivory: { DEFAULT:'#F2E8D0', dark:'#C8B88A', muted:'#8A7040' },
        steel: { DEFAULT:'#8A9AB0', light:'#C8D4E0', dark:'#5A6278' },
      },
      fontFamily: {
        display: ['"Cinzel Decorative"', 'serif'],
        serif: ['"Cinzel"', 'serif'],
        sans: ['"Tajawal"', 'sans-serif'],
        italic: ['"Cormorant Garamond"', 'serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.7s ease forwards',
        'fade-in': 'fadeIn 0.5s ease forwards',
        'slide-in': 'slideIn 0.6s ease forwards',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeUp: { '0%':{ opacity:'0', transform:'translateY(30px)' }, '100%':{ opacity:'1', transform:'translateY(0)' } },
        fadeIn: { '0%':{ opacity:'0' }, '100%':{ opacity:'1' } },
        slideIn: { '0%':{ opacity:'0', transform:'translateX(-30px)' }, '100%':{ opacity:'1', transform:'translateX(0)' } },
        glow: { '0%':{ boxShadow:'0 0 5px rgba(200,150,60,0.2)' }, '100%':{ boxShadow:'0 0 20px rgba(200,150,60,0.5)' } },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #7A5520, #C8963C, #E0B050)',
        'dark-gradient': 'linear-gradient(180deg, #03050D, #07091A, #0C1128)',
      }
    },
  },
  plugins: [],
}
