import { useLocation } from '@remix-run/react'
import { useEffect, useCallback } from 'react'

export interface NavigationHandlers {
  handleCategoryClick: (categoryName: string) => void
  handleSenderClick: (senderName: string) => void
}

export interface UseTransactionNavigationProps {
  setCategory: (category: string) => void
  setSearchQuery: (query: string) => void
  clearUrlSearch: () => void
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
}: UseTransactionNavigationProps): UseTransactionNavigationResult {
  const location = useLocation()

  // Sync component state with URL parameters
  const syncWithUrl = useCallback(() => {
    const params = new URLSearchParams(location.search)
    const categoryParam = params.get('category')
    const searchParam = params.get('search')

    if (categoryParam) {
      setCategory(categoryParam.toLowerCase())
    }

    if (searchParam) {
      // Update the search query directly
      setSearchQuery(searchParam)
    }
  }, [location.search, setCategory, setSearchQuery])

  // Sync with URL when location changes
  useEffect(() => {
    syncWithUrl()
  }, [syncWithUrl])

  // Navigate to transactions filtered by category
  const handleCategoryClick = useCallback(
    (categoryName: string) => {
      // First, set the category state
      setCategory(categoryName.toLowerCase())

      // Clear any existing search
      setSearchQuery('')
    },
    [setCategory, setSearchQuery]
  )

  // Navigate to transactions filtered by sender/recipient
  const handleSenderClick = useCallback(
    (senderName: string) => {
      // First, make sure we're looking at all categories
      setCategory('all')

      // Set the search query
      setSearchQuery(senderName)
    },
    [setCategory, setSearchQuery]
  )

  return {
    syncWithUrl,
    handleCategoryClick,
    handleSenderClick,
  }
}
