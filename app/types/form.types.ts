/**
 * Common interface for form action data responses
 */
export interface FormActionData {
  error?: string
  success?: boolean
  [key: string]: any
}
