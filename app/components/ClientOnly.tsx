import { useEffect, useState, ReactNode } from 'react'

interface ClientOnlyProps {
  children: () => ReactNode
  fallback?: ReactNode
}

/**
 * Renders children only on the client-side, avoiding server-side rendering
 * Provides a fallback component for SSR to prevent content layout shift
 */
export function ClientOnly({
  children,
  fallback = null,
}: ClientOnlyProps): ReactNode {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    return () => {
      setMounted(false)
    }
  }, [])

  if (!mounted) {
    return fallback
  }

  return children()
}
