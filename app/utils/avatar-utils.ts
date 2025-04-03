import * as React from 'react'

/**
 * Consistent set of background colors for generated avatar initials
 */
const AVATAR_COLORS = [
  '#5E76BF', // Blue
  '#F58A51', // Orange
  '#47B4AC', // Teal
  '#D988B9', // Pink
  '#B0A0D6', // Purple
  '#FFB6C1', // Light Pink
  '#87CEEB', // Sky Blue
  '#FFA07A', // Light Salmon
  '#98FB98', // Pale Green
  '#DDA0DD', // Plum
]

/**
 * Set of known SVG icons that should have fallbacks regardless
 */
const FORCE_FALLBACK_PATHS = [
  'car.svg',
  'coffee.svg',
  'tax.svg',
  'transfer.svg',
  'streaming.svg',
  'gym.svg',
  'gift.svg',
  'phone.svg',
]

/**
 * Generates a consistent color based on a string (name)
 */
export function getColorFromName(name: string): string {
  const hash = name.split('').reduce((acc: number, char: string) => {
    return acc + char.charCodeAt(0)
  }, 0)

  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

/**
 * Extracts initials from a name/title, limited to first 2 words
 * @param name The name to extract initials from
 * @returns 1-2 character string of initials
 */
export function getInitials(name: string): string {
  if (!name) return '?'

  // Split by whitespace and filter out empty strings
  const words = name.split(/\s+/).filter((word) => word.length > 0)

  // Take only first two words
  const relevantWords = words.slice(0, 2)

  // Extract first letter of each word and join
  const initials = relevantWords
    .map((word) => word.charAt(0).toUpperCase())
    .join('')

  return initials || name.charAt(0).toUpperCase()
}

/**
 * Process avatar path to ensure it's valid and accessible
 * @param path The original avatar path
 * @returns A properly formatted path or undefined if invalid
 */
export function processAvatarPath(path?: string): string | undefined {
  if (!path) return undefined

  // Handle empty strings
  if (path.trim() === '') return undefined

  // Check if the path contains any of the known missing icons
  const shouldForceFallback = FORCE_FALLBACK_PATHS.some((forcePath) =>
    path.includes(forcePath)
  )

  if (shouldForceFallback) {
    return undefined
  }

  // If path starts with "./", remove it to make it relative to the public folder
  if (path.startsWith('./')) {
    return path.substring(2)
  }

  // If the path doesn't start with '/' or 'http', add a leading slash
  if (!path.startsWith('/') && !path.startsWith('http')) {
    return '/' + path
  }

  return path
}

/**
 * Check for specific paths that we know have issues
 */
export function isKnownMissingIcon(path?: string): boolean {
  if (!path) return false

  // These are paths we know don't exist but appear in the data
  const missingIcons = [
    './icons/logo1.png',
    './icons/logo2.png',
    './icons/logo3.png',
    './icons/logo4.png',
    './icons/logo5.png',
  ]

  // Check if the path is in our list of known missing icons
  if (missingIcons.includes(path)) {
    return true
  }

  return false
}

/**
 * Creates a consistent avatar component that handles image errors gracefully
 * Falls back to initials on a colored background if image is missing/fails to load
 *
 * @param name The name or title to use for fallback initials
 * @param avatarUrl Optional URL to an image
 * @param size Size of the avatar in pixels (default: 40)
 * @returns JSX Element with the avatar
 */
export function renderAvatar(
  name: string,
  avatarUrl?: string,
  size: number = 40
): JSX.Element {
  const initials = getInitials(name)
  const bgColor = getColorFromName(name)

  // Process the avatar URL to ensure it's valid
  const processedAvatarUrl = processAvatarPath(avatarUrl)

  return React.createElement('div', {
    className: 'relative rounded-full overflow-hidden flex-shrink-0',
    style: { width: `${size}px`, height: `${size}px` },
    children: [
      // Image element (if avatar URL exists)
      processedAvatarUrl &&
        React.createElement('img', {
          key: 'avatar-img',
          src: processedAvatarUrl,
          alt: `${name} avatar`,
          className: 'h-full w-full object-cover',
          loading: 'lazy', // Add lazy loading
          onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            const fallbackDiv =
              target.parentElement?.querySelector('.avatar-fallback')
            if (fallbackDiv && fallbackDiv instanceof HTMLElement) {
              fallbackDiv.style.display = 'flex'
            }
          },
        }),

      // Fallback element with initials (always rendered but initially hidden if there's an avatar)
      React.createElement('div', {
        key: 'avatar-fallback',
        className:
          'avatar-fallback absolute inset-0 flex items-center justify-center text-white font-medium',
        style: {
          backgroundColor: bgColor,
          display: processedAvatarUrl ? 'none' : 'flex',
          fontSize: size > 32 ? '1rem' : '0.875rem',
        },
        children: initials,
      }),
    ],
  })
}
