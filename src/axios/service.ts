import axios, { AxiosError } from 'axios'
import { defaultRequestInterceptors, defaultResponseInterceptors } from './config'

import { AxiosInstance, InternalAxiosRequestConfig, RequestConfig, AxiosResponse } from './types'
import { ElMessage } from 'element-plus'
import { REQUEST_TIMEOUT, UNAUTHORIZED_CODE } from '@/constants'
import { useUserStoreWithOut } from '@/store/modules/user'

export const PATH_URL = import.meta.env.VITE_API_BASE_PATH

const abortControllerMap: Map<string, AbortController> = new Map()

const axiosInstance: AxiosInstance = axios.create({
  timeout: REQUEST_TIMEOUT,
  baseURL: PATH_URL
})

axiosInstance.interceptors.request.use((res: InternalAxiosRequestConfig) => {
  const controller = new AbortController()
  const url = res.url || ''
  res.signal = controller.signal

  // 只有在VITE_USE_MOCK为false时才移除/mock前缀
  const shouldRemoveMock = import.meta.env.VITE_USE_MOCK === 'false' && url.startsWith('/mock')
  const finalUrl = shouldRemoveMock ? url.replace('/mock', '') : url
  abortControllerMap.set(finalUrl, controller)

  if (shouldRemoveMock) {
    res.url = finalUrl
  }
  return res
})

axiosInstance.interceptors.response.use(
  (res: AxiosResponse) => {
    const url = res.config.url || ''
    abortControllerMap.delete(url)
    // 这里不能做任何处理，否则后面的 interceptors 拿不到完整的上下文了
    return res
  },
  (error: AxiosError<{ message: string; code: number; name: string }>) => {
    console.log(error)
    const url = error.config?.url || ''
    abortControllerMap.delete(url)

    // 处理401错误
    if (error.response?.status === UNAUTHORIZED_CODE) {
      const userStore = useUserStoreWithOut()
      // 先显示错误消息
      ElMessage({
        type: 'error',
        message: '登录状态已过期，请重新登录',
        duration: 2000
      })
      // 延迟执行登出和跳转，确保消息能显示
      setTimeout(() => {
        userStore.logout()
        window.location.href = '/login'
      }, 1000)
      return Promise.reject(error)
    }

    // 处理其他错误
    const errorMessage = error.response?.data?.message || error.message || '请求失败'
    ElMessage({
      type: 'error',
      message: errorMessage,
      duration: 2000
    })
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.request.use(defaultRequestInterceptors)
axiosInstance.interceptors.response.use(defaultResponseInterceptors)

const service = {
  request: (config: RequestConfig) => {
    return new Promise((resolve, reject) => {
      if (config.interceptors?.requestInterceptors) {
        config = config.interceptors.requestInterceptors(config as any)
      }

      axiosInstance
        .request(config)
        .then((res) => {
          resolve(res)
        })
        .catch((err: any) => {
          reject(err)
        })
    })
  },
  cancelRequest: (url: string | string[]) => {
    const urlList = Array.isArray(url) ? url : [url]
    for (const _url of urlList) {
      abortControllerMap.get(_url)?.abort()
      abortControllerMap.delete(_url)
    }
  },
  cancelAllRequest() {
    for (const [_, controller] of abortControllerMap) {
      controller.abort()
    }
    abortControllerMap.clear()
  }
}

export default service
