import axios, { type AxiosInstance, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'
import { toast } from 'sonner'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export interface ApiResponse<T> {
  success: boolean
  data: T
  pagination?: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
  }
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: string[]
  }
}

interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
  expiresAt: string
  user: unknown
}

class ApiClient {
  private client: AxiosInstance
  private isRefreshing = false
  private failedQueue: Array<{
    resolve: (token: string) => void
    reject: (error: unknown) => void
  }> = []

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    })

    this.setupInterceptors()
  }

  private processQueue(error: unknown, token: string | null = null) {
    this.failedQueue.forEach((prom) => {
      if (token) {
        prom.resolve(token)
      } else {
        prom.reject(error)
      }
    })
    this.failedQueue = []
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor - handle errors and token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          // Don't try to refresh if this is the refresh endpoint itself
          if (originalRequest.url?.includes('/auth/refresh')) {
            this.clearAuthAndRedirect()
            return Promise.reject(error)
          }

          if (this.isRefreshing) {
            // Wait for the current refresh to complete
            return new Promise((resolve, reject) => {
              this.failedQueue.push({
                resolve: (token: string) => {
                  originalRequest.headers.Authorization = `Bearer ${token}`
                  resolve(this.client(originalRequest))
                },
                reject: (err: unknown) => reject(err),
              })
            })
          }

          originalRequest._retry = true
          this.isRefreshing = true

          try {
            const refreshToken = localStorage.getItem('refreshToken')
            if (!refreshToken) {
              throw new Error('No refresh token available')
            }

            const response = await this.client.post<RefreshTokenResponse>(
              '/v1/auth/refresh',
              { refreshToken }
            )

            const { accessToken, refreshToken: newRefreshToken } = response.data
            localStorage.setItem('accessToken', accessToken)
            localStorage.setItem('refreshToken', newRefreshToken)

            this.processQueue(null, accessToken)

            originalRequest.headers.Authorization = `Bearer ${accessToken}`
            return this.client(originalRequest)
          } catch (refreshError) {
            this.processQueue(refreshError, null)
            this.clearAuthAndRedirect()
            return Promise.reject(refreshError)
          } finally {
            this.isRefreshing = false
          }
        }

        // Handle 403 Forbidden - permission denied
        if (error.response?.status === 403) {
          const errorData = error.response.data
          const message = errorData?.message || "You don't have permission to perform this action"
          toast.error(message)
          return Promise.reject(error)
        }

        return Promise.reject(error)
      }
    )
  }

  private clearAuthAndRedirect() {
    // Clear all auth data
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('carmen-auth') // Clear Zustand persisted state

    // Show session expired notification
    toast.error('Session expired. Please log in again.', {
      duration: 5000,
      id: 'session-expired', // Prevent duplicate toasts
    })

    // Redirect to login page
    window.location.href = '/login'
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, config)
    return response.data.data
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config)
    return response.data.data
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config)
    return response.data.data
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config)
    return response.data.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url, config)
    return response.data.data
  }

  // Raw methods for cases where you need full response
  getRaw<T>(url: string, config?: AxiosRequestConfig) {
    return this.client.get<T>(url, config)
  }

  postRaw<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.client.post<T>(url, data, config)
  }

  putRaw<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.client.put<T>(url, data, config)
  }

  patchRaw<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
    return this.client.patch<T>(url, data, config)
  }

  deleteRaw<T>(url: string, config?: AxiosRequestConfig) {
    return this.client.delete<T>(url, config)
  }

  postFormData<T>(url: string, formData: FormData, config?: AxiosRequestConfig) {
    return this.client.post<T>(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
    })
  }
}

export const apiClient = new ApiClient()
