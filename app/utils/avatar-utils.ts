import * as React from 'react'

const AVATAR_COLORS = [
  '#5E76BF',
  '#F58A51',
  '#47B4AC',
  '#D988B9',
  '#B0A0D6',
  '#FFB6C1',
  '#87CEEB',
  '#FFA07A',
  '#98FB98',
  '#DDA0DD',
]

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

export function getColorFromName(name: string): string {
  const hash = name.split('').reduce((acc: number, char: string) => {
    return acc + char.charCodeAt(0)
  }, 0)

  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

export function getInitials(name: string): string {
  if (!name) return '?'

  const words = name.split(/\s+/).filter((word) => word.length > 0)

  const relevantWords = words.slice(0, 2)

  const initials = relevantWords
    .map((word) => word.charAt(0).toUpperCase())
    .join('')

  return initials || name.charAt(0).toUpperCase()
}

export function processAvatarPath(path?: string): string | undefined {
  if (!path) return undefined

  if (path.trim() === '') return undefined

  const shouldForceFallback = FORCE_FALLBACK_PATHS.some((forcePath) =>
    path.includes(forcePath)
  )

  if (shouldForceFallback) {
    return undefined
  }

  if (path.startsWith('./')) {
    return path.substring(2)
  }

  if (!path.startsWith('/') && !path.startsWith('http')) {
    return '/' + path
  }

  return path
}

export function isKnownMissingIcon(path?: string): boolean {
  if (!path) return false

  const missingIcons = [
    './icons/logo1.png',
    './icons/logo2.png',
    './icons/logo3.png',
    './icons/logo4.png',
    './icons/logo5.png',
  ]

  if (missingIcons.includes(path)) {
    return true
  }

  return false
}

export function renderAvatar(
  name: string,
  avatarUrl?: string,
  size: number = 40
): JSX.Element {
  const initials = getInitials(name)
  const bgColor = getColorFromName(name)

  const processedAvatarUrl = processAvatarPath(avatarUrl)

  return React.createElement('div', {
    className: 'relative rounded-full overflow-hidden flex-shrink-0',
    style: { width: `${size}px`, height: `${size}px` },
    children: [
      processedAvatarUrl &&
        React.createElement('img', {
          key: 'avatar-img',
          src: processedAvatarUrl,
          alt: `${name} avatar`,
          className: 'h-full w-full object-cover',
          loading: 'lazy',
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
