import axios from 'axios'
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'

const baseURL = `${import.meta.env.VITE_API_BASE_URL}/api`

const api: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ---------------------------------------------------------------------------
// Request interceptor
// Attach auth token here when authentication is introduced.
// ---------------------------------------------------------------------------
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // TODO: inject bearer token once auth is wired up
    // const token = authStore.token
    // if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error: AxiosError) => Promise.reject(error),
)

// ---------------------------------------------------------------------------
// Response interceptor — normalise error messages into a single string.
//
// Every AxiosError that leaves this interceptor carries a `normalizedMessage`
// property so components and useApiError can read it without re-parsing the
// response body themselves.
// ---------------------------------------------------------------------------
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const data = error.response?.data

    let normalizedMessage = 'An unexpected error occurred. Please try again.'

    if (data) {
      if (Array.isArray(data.error) && data.error.length) {
        normalizedMessage = data.error.join(' ')
      } else if (typeof data.error === 'string' && data.error) {
        normalizedMessage = data.error
      } else if (typeof data.message === 'string' && data.message) {
        normalizedMessage = data.message
      }
    } else if (error.message) {
      normalizedMessage = error.message
    }

    // Attach to the error so useApiError / catch blocks can read it cheaply
    ;(error as NormalizedAxiosError).normalizedMessage = normalizedMessage

    return Promise.reject(error)
  },
)

export default api

// ---------------------------------------------------------------------------
// Supporting types
// ---------------------------------------------------------------------------

/** Shape of error bodies returned by the profitability-checker API */
export interface ApiErrorBody {
  success: false
  message?: string
  error?: string | string[]
}

/** AxiosError extended with the pre-normalised message string */
export interface NormalizedAxiosError extends AxiosError<ApiErrorBody> {
  normalizedMessage: string
}
