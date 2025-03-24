import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: ['./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Public Sans',
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
        // Beige palette
        beige: {
          '100': '#D8D4C9', // Light Beige
          '500': '#9B9081', // Beige
        },

        // Gray palette
        gray: {
          '100': '#F1F1F2', // Lightest Gray
          '300': '#DADADA', // Light Gray
          '500': '#5E5E63', // Medium Gray
          '900': '#1D1D1F', // Dark Gray (almost black)
        },

        // Secondary colors
        green: {
          '500': '#427C76', // Green
        },
        yellow: {
          '500': '#F2C89C', // Yellow/Cream
        },
        cyan: {
          '500': '#A8CDD7', // Cyan/Light Blue
        },
        navy: {
          '500': '#45465D', // Navy Blue
        },
        red: {
          '500': '#DC6746', // Red/Orange-Red
        },
        purple: {
          '300': '#AA93BA', // Light Purple
          '500': '#8D7CBE', // Purple
        },

        // Extended color palette
        turquoise: {
          '500': '#5B857C', // Turquoise
        },
        brown: {
          '500': '#9E826F', // Brown
        },
        magenta: {
          '500': '#B3456F', // Magenta/Deep Pink
        },
        blue: {
          '500': '#5B6A83', // Blue
        },
        'navy-gray': {
          '500': '#5E646C', // Navy Gray
        },
        'army-green': {
          '500': '#777349', // Army Green
        },
        gold: {
          '500': '#CEC25D', // Gold
        },
        orange: {
          '500': '#DD8C45', // Orange
        },

        // Basic colors
        white: '#FFFFFF',
        black: '#000000',

        // Accent and theme colors
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
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
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
