/**
 * Finance App Theme Colors
 * This file contains all the color definitions from the style guide.
 */

// Beige palette
export const BEIGE = {
  100: '#D8D4C9', // Light Beige
  500: '#9B9081', // Beige
}

// Gray palette
export const GRAY = {
  100: '#F1F1F2', // Lightest Gray
  300: '#DADADA', // Light Gray
  500: '#5E5E63', // Medium Gray
  900: '#1D1D1F', // Dark Gray (almost black)
}

// Secondary colors
export const GREEN = {
  500: '#427C76', // Green
}

export const YELLOW = {
  500: '#F2C89C', // Yellow/Cream
}

export const CYAN = {
  500: '#A8CDD7', // Cyan/Light Blue
}

export const NAVY = {
  500: '#45465D', // Navy Blue
}

export const RED = {
  500: '#DC6746', // Red/Orange-Red
}

export const PURPLE = {
  300: '#AA93BA', // Light Purple
  500: '#8D7CBE', // Purple
}

// Extended color palette
export const TURQUOISE = {
  500: '#5B857C', // Turquoise
}

export const BROWN = {
  500: '#9E826F', // Brown
}

export const MAGENTA = {
  500: '#B3456F', // Magenta/Deep Pink
}

export const BLUE = {
  500: '#5B6A83', // Blue
}

export const NAVY_GRAY = {
  500: '#5E646C', // Navy Gray
}

export const ARMY_GREEN = {
  500: '#777349', // Army Green
}

export const GOLD = {
  500: '#CEC25D', // Gold
}

export const ORANGE = {
  500: '#DD8C45', // Orange
}

// Basic colors
export const WHITE = '#FFFFFF'
export const BLACK = '#000000'

// Semantic color mapping for charts
export const CHART_COLORS = [
  GREEN[500],
  PURPLE[500],
  CYAN[500],
  YELLOW[500],
  RED[500],
]

// Theme color groups
export const THEME = {
  // Dark theme colors
  dark: {
    background: GRAY[900],
    foreground: WHITE,
    muted: GRAY[500],
    accent: PURPLE[500],
  },
  // Light theme colors
  light: {
    background: WHITE,
    foreground: GRAY[900],
    muted: GRAY[300],
    accent: PURPLE[500],
  },
}
