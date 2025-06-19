import axios from 'axios'
import type { AxiosInstance } from 'axios'

const baseURL = `${import.meta.env.VITE_API_BASE_URL}/api`

const api: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api
