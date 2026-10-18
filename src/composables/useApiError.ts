import type { NormalizedAxiosError } from '@/api'

/**
 * Shared API error message extractor.
 *
 * If the response interceptor in api.ts has already normalised the error,
 * `normalizedMessage` is read directly. Otherwise the function falls back to
 * the same parsing logic so it stays correct even when called outside the
 * context of the Axios instance (e.g. in tests).
 *
 * Fallback priority:
 *   1. Pre-normalised by interceptor   (error.normalizedMessage)
 *   2. API response error array        (response.data.error[])
 *   3. API response error string       (response.data.error)
 *   4. API response message            (response.data.message)
 *   5. Native Error message
 *   6. Generic fallback
 */
export function useApiError() {
  function extractErrorMessage(err: unknown): string {
    // Fast path — interceptor has already done the work
    if (err && typeof err === 'object' && 'normalizedMessage' in err) {
      return (err as NormalizedAxiosError).normalizedMessage
    }

    // Fallback for errors that bypassed the interceptor
    if (err && typeof err === 'object' && 'response' in err) {
      const response = (err as any).response
      const apiError = response?.data?.error
      if (Array.isArray(apiError) && apiError.length) return apiError.join(' ')
      if (typeof apiError === 'string' && apiError) return apiError
      const apiMessage = response?.data?.message
      if (typeof apiMessage === 'string' && apiMessage) return apiMessage
    }

    if (err instanceof Error) return err.message
    return 'An unexpected error occurred. Please try again.'
  }

  return { extractErrorMessage }
}
