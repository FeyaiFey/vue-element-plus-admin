import WebSocketService from './service'
import { WebSocketServiceConfig, WebSocketMessage } from './types'
import { createWebSocketUrl } from './config'

// WebSocket实例管理
const webSocketInstances: Map<string, WebSocketService> = new Map()

// 创建WebSocket连接
const createWebSocket = (config: WebSocketServiceConfig): WebSocketService => {
  const url = config.url

  // 如果已存在实例，先销毁
  if (webSocketInstances.has(url)) {
    const existingInstance = webSocketInstances.get(url)
    existingInstance?.destroy()
    webSocketInstances.delete(url)
  }

  // 创建新实例
  const instance = new WebSocketService(config)
  webSocketInstances.set(url, instance)

  return instance
}

// 获取WebSocket实例
const getWebSocket = (url: string): WebSocketService | undefined => {
  return webSocketInstances.get(url)
}

// 销毁WebSocket连接
const destroyWebSocket = (url: string): void => {
  const instance = webSocketInstances.get(url)
  if (instance) {
    instance.destroy()
    webSocketInstances.delete(url)
  }
}

// 销毁所有WebSocket连接
const destroyAllWebSockets = (): void => {
  webSocketInstances.forEach((instance) => {
    instance.destroy()
  })
  webSocketInstances.clear()
}

// 连接WebSocket
const connect = async (
  path: string,
  config?: Partial<WebSocketServiceConfig>
): Promise<WebSocketService> => {
  const url = createWebSocketUrl(path)

  const fullConfig: WebSocketServiceConfig = {
    url,
    ...config
  }

  const instance = createWebSocket(fullConfig)
  await instance.connect()

  return instance
}

// 发送消息
const send = (path: string, data: any): void => {
  const url = createWebSocketUrl(path)
  const instance = getWebSocket(url)

  if (!instance) {
    throw new Error(`WebSocket连接不存在: ${url}`)
  }

  instance.send(data)
}

// 监听消息
const on = (path: string, event: string, callback: Function): void => {
  const url = createWebSocketUrl(path)
  const instance = getWebSocket(url)

  if (!instance) {
    throw new Error(`WebSocket连接不存在: ${url}`)
  }

  instance.on(event, callback)
}

// 取消监听
const off = (path: string, event: string, callback?: Function): void => {
  const url = createWebSocketUrl(path)
  const instance = getWebSocket(url)

  if (!instance) {
    throw new Error(`WebSocket连接不存在: ${url}`)
  }

  instance.off(event, callback)
}

// 断开连接
const disconnect = (path: string, code?: number, reason?: string): void => {
  const url = createWebSocketUrl(path)
  const instance = getWebSocket(url)

  if (instance) {
    instance.disconnect(code, reason)
  }
}

// 获取连接状态
const getConnectionState = (path: string) => {
  const url = createWebSocketUrl(path)
  const instance = getWebSocket(url)

  if (!instance) {
    return {
      isConnected: false,
      readyState: 'closed' as const,
      reconnectAttempts: 0,
      isReconnecting: false
    }
  }

  return {
    isConnected: instance.isConnected,
    readyState: instance.readyState,
    reconnectAttempts: instance.reconnectAttempts,
    isReconnecting: instance.isReconnecting
  }
}

// 便捷方法：发送JSON消息
const sendJSON = (path: string, type: string, data?: any): void => {
  const message: WebSocketMessage = {
    type,
    data,
    timestamp: Date.now()
  }

  send(path, message)
}

// 便捷方法：发送通知
const sendNotification = (
  path: string,
  message: string,
  level: 'info' | 'success' | 'warning' | 'error' = 'info'
): void => {
  sendJSON(path, 'notification', {
    message,
    level,
    timestamp: Date.now()
  })
}

// 便捷方法：订阅消息类型
const subscribe = (path: string, messageType: string, callback: (data: any) => void): void => {
  on(path, 'message', (message: WebSocketMessage) => {
    if (message.type === messageType) {
      callback(message.data)
    }
  })
}

// 便捷方法：取消订阅
const unsubscribe = (path: string, _: string, callback?: (data: any) => void): void => {
  // 这里需要特殊处理，因为原始回调函数被包装了
  // 在实际使用中建议保存原始的监听器引用
  off(path, 'message', callback)
}

// 默认导出
export default {
  // 基础方法
  connect,
  send,
  on,
  off,
  disconnect,
  getConnectionState,

  // 便捷方法
  sendJSON,
  sendNotification,
  subscribe,
  unsubscribe,

  // 实例管理
  createWebSocket,
  getWebSocket,
  destroyWebSocket,
  destroyAllWebSockets
}

// 命名导出
export {
  connect,
  send,
  on,
  off,
  disconnect,
  getConnectionState,
  sendJSON,
  sendNotification,
  subscribe,
  unsubscribe,
  createWebSocket,
  getWebSocket,
  destroyWebSocket,
  destroyAllWebSockets
}
