import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: ['./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'Noto Color Emoji',
        ],
      },
      colors: {
        beige: {
          '100': 'var(--color-beige-100)',
        },
        grey: {
          '100': 'var(--color-grey-100)',
          '200': 'var(--color-grey-200)',
          '300': 'var(--color-grey-300)',
          '400': 'var(--color-grey-400)',
          '500': 'var(--color-grey-500)',
          '600': 'var(--color-grey-600)',
          '700': 'var(--color-grey-700)',
          '800': 'var(--color-grey-800)',
          '900': 'var(--color-grey-900)',
        },
        green: 'var(--color-green)',
        yellow: 'var(--color-yellow)',
        cyan: 'var(--color-cyan)',
        pink: 'var(--color-pink)',
        orange: 'var(--color-orange)',
        'light-blue': 'var(--color-light-blue)',
        purple: 'var(--color-purple)',
        turquoise: 'var(--color-turquoise)',
        brown: 'var(--color-brown)',
        red: 'var(--color-red)',
        'navy-blue': 'var(--color-navy-blue)',
        'army-green': 'var(--color-army-green)',
        gold: 'var(--color-gold)',
        'navy-grey': 'var(--color-navy-grey)',
        white: 'var(--color-white)',
        black: 'var(--color-black)',

        // Additional palette using CSS variables (unchanged)
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config
