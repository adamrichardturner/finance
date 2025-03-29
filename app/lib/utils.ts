import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * A utility function for combining Tailwind CSS classes with conditional values and resolving conflicts.
 * Uses clsx for conditional class joining and tailwind-merge for handling Tailwind class conflicts.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
