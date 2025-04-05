import { useLocation, useNavigate } from '@remix-run/react'
import { useEffect, useCallback } from 'react'

export interface NavigationHandlers {
  handleCategoryClick: (categoryName: string) => void
  handleSenderClick: (senderName: string) => void
}

export interface UseTransactionNavigationProps {
  setCategory: (category: string) => void
  setSearchQuery: (query: string) => void
  setUrlSearchQuery: (query: string) => void
}

export interface UseTransactionNavigationResult extends NavigationHandlers {
  syncWithUrl: () => void
}

/**
 * Hook for handling transaction navigation and URL parameters
 */
export function useTransactionNavigation({
  setCategory,
  setSearchQuery,
  setUrlSearchQuery,
}: UseTransactionNavigationProps): UseTransactionNavigationResult {
  const location = useLocation()
  const navigate = useNavigate()

  // Sync component state with URL parameters
  const syncWithUrl = useCallback(() => {
    const params = new URLSearchParams(location.search)
    const categoryParam = params.get('category')
    const searchParam = params.get('search')

    if (categoryParam) {
      setCategory(categoryParam.toLowerCase())
    }

    if (searchParam) {
      // Update the URL search parameter state
      setUrlSearchQuery(searchParam)

      // Only update the input field if the query came from the input (not from clicking)
      if (!location.state?.fromSenderClick) {
        setSearchQuery(searchParam)
      }
    } else {
      // Clear URL search query when removed from URL
      setUrlSearchQuery('')
    }
  }, [
    location.search,
    location.state,
    setCategory,
    setSearchQuery,
    setUrlSearchQuery,
  ])

  // Sync with URL when location changes
  useEffect(() => {
    syncWithUrl()
  }, [syncWithUrl])

  // Navigate to transactions filtered by category
  const handleCategoryClick = useCallback(
    (categoryName: string) => {
      navigate(
        `/transactions?category=${encodeURIComponent(categoryName.toLowerCase())}`
      )
    },
    [navigate]
  )

  // Navigate to transactions filtered by sender/recipient
  const handleSenderClick = useCallback(
    (senderName: string) => {
      navigate(
        `/transactions?search=${encodeURIComponent(senderName.toLowerCase())}`,
        // Add state to indicate this navigation came from clicking a sender
        { state: { fromSenderClick: true } }
      )
    },
    [navigate]
  )

  return {
    syncWithUrl,
    handleCategoryClick,
    handleSenderClick,
  }
}
