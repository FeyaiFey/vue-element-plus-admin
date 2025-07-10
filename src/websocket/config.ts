import { WebSocketMessage, WebSocketConfig } from './types'
import { ElMessage } from 'element-plus'
import { useUserStoreWithOut } from '@/store/modules/user'

// 默认WebSocket配置
export const defaultWebSocketConfig: Partial<WebSocketConfig> = {
  reconnectAttempts: 5,
  reconnectInterval: 3000,
  heartbeatInterval: 30000,
  heartbeatMessage: 'ping',
  timeout: 10000,
  enableLogging: import.meta.env.MODE === 'development'
}

// 默认发送拦截器
export const defaultSendInterceptors = (message: any) => {
  if (typeof message === 'object' && message !== null) {
    // 自动添加时间戳
    if (!message.timestamp) {
      message.timestamp = Date.now()
    }

    // 自动添加用户信息
    const userStore = useUserStoreWithOut()
    if (userStore.getToken && !message.token) {
      message.token = userStore.getToken
    }

    // 转换为JSON字符串
    return JSON.stringify(message)
  }

  return message
}

// 默认接收拦截器
export const defaultReceiveInterceptors = (message: WebSocketMessage) => {
  // 处理心跳消息
  if (message.type === 'pong') {
    return message
  }

  // 处理系统消息
  if (message.type === 'system') {
    if (message.data?.code === 401) {
      // 处理未授权
      ElMessage.error('WebSocket连接未授权，请重新登录')
      const userStore = useUserStoreWithOut()
      userStore.logout()
      return message
    }

    if (message.data?.code === 403) {
      // 处理禁止访问
      ElMessage.error('WebSocket连接被拒绝')
      return message
    }
  }

  // 处理错误消息
  if (message.type === 'error') {
    ElMessage.error(message.data?.message || '发生未知错误')
    return message
  }

  // 处理通知消息
  if (message.type === 'notification') {
    ElMessage.success(message.data?.message || '收到新通知')
    return message
  }

  return message
}

// 默认错误处理
export const defaultErrorHandler = (error: any) => {
  console.error('WebSocket错误:', error)

  // 根据错误类型显示不同的提示
  if (error.type === 'connection') {
    ElMessage.error('WebSocket连接失败，请检查网络')
  } else if (error.type === 'timeout') {
    ElMessage.error('WebSocket连接超时')
  } else if (error.type === 'send') {
    ElMessage.error('消息发送失败')
  } else {
    ElMessage.error('WebSocket发生未知错误')
  }
}

// 默认重连处理
export const defaultReconnectHandler = (attempt: number) => {
  if (defaultWebSocketConfig.enableLogging) {
    console.log(`WebSocket重连尝试 ${attempt}/${defaultWebSocketConfig.reconnectAttempts}`)
  }

  if (attempt <= 3) {
    ElMessage.info(`WebSocket连接断开，正在重连... (${attempt}/5)`)
  }
}

// 创建WebSocket URL
export const createWebSocketUrl = (path: string): string => {
  const baseUrl = import.meta.env.VITE_WS_BASE_PATH || 'ws://localhost:8000'
  const url = `${baseUrl}${path.startsWith('/') ? path : '/' + path}`

  // 添加token参数
  const userStore = useUserStoreWithOut()
  const token = userStore.getToken

  if (token) {
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}token=${encodeURIComponent(token)}`
  }

  return url
}

// 验证WebSocket配置
export const validateWebSocketConfig = (config: WebSocketConfig): boolean => {
  if (!config.url) {
    console.error('WebSocket URL不能为空')
    return false
  }

  if (!config.url.startsWith('ws://') && !config.url.startsWith('wss://')) {
    console.error('WebSocket URL必须以ws://或wss://开头')
    return false
  }

  if (config.reconnectAttempts && config.reconnectAttempts < 0) {
    console.error('重连次数不能为负数')
    return false
  }

  if (config.reconnectInterval && config.reconnectInterval < 1000) {
    console.error('重连间隔不能少于1秒')
    return false
  }

  return true
}
