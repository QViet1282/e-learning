/* eslint-disable @typescript-eslint/promise-function-async */
/* eslint-disable @typescript-eslint/return-await */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import axios, { AxiosError } from 'axios'
import { getFromLocalStorage, setToLocalStorage, removeAllLocalStorage, reload } from 'utils/functions'
import { refresh } from 'api/post/post.api'
import { jwtDecode } from 'jwt-decode'
interface IBaseErrorResponse {
  code: string
  status: number
  message: string
}
// const navigate = useNavigate()
/**
 * Authenticated Request Interceptors config
 */
export const requestWithJwt = axios.create({
  baseURL: process.env.REACT_APP_API,
  timeout: 10000,
  withCredentials: false
})

const checkTokenValidity = (token: string) => {
  try {
    const { exp } = jwtDecode<{ exp: number }>(token)
    return exp * 1000 > Date.now()
  } catch (error) {
    return false
  }
}

const handleTokenRefresh = async () => {
  const tokens = getFromLocalStorage<any>('tokens')
  if (tokens?.accessToken && checkTokenValidity(tokens.accessToken)) {
    return tokens.accessToken
  }
  if (!tokens) {
    return null
  }
  try {
    const response = await refresh()
    const newAccessToken = response.data.accessToken
    setToLocalStorage('tokens', JSON.stringify(response.data))
    return newAccessToken
  } catch (error) {
    removeAllLocalStorage()
    reload()
    return null
  }
}
requestWithJwt.interceptors.request.use(async (config) => {
  const { accessToken } = getFromLocalStorage<any>('tokens')

  let token = ''
  if (accessToken != null) {
    token = accessToken
  }
  return {
    ...config,
    headers: {
      Authorization: `Bearer ${token}`,
      ...config.headers
    }
  }
})
requestWithJwt.interceptors.response.use(
  (response) => {
    return response
  },
  async (error: AxiosError<IBaseErrorResponse>) => {
    const originalRequest: any = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const newAccessToken = await handleTokenRefresh()
        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return requestWithJwt(originalRequest)
        }
      } catch (refreshError) {
        return Promise.reject(refreshError)
      }
    }

    if (!error.response?.data) {
      console.error('Unknown server error')
      return Promise.reject({
        code: 'Unknown',
        status: 500,
        message: 'Server error'
      })
    }
    return Promise.reject(error.response?.data)
  }
)
export const requestWithoutJwt = axios.create({
  baseURL: process.env.REACT_APP_API,
  timeout: 10000,
  withCredentials: false
})

requestWithoutJwt.interceptors.response.use(
  (response) => {
    return response
  },
  async (error: AxiosError<IBaseErrorResponse>) => {
    // alert('requestWithoutJwt.interceptors.response.use')
    return await Promise.reject({
      ...error.response?.data
    })
  }
)
