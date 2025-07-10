// WebSocket连接状态
export type WebSocketReadyState = 'connecting' | 'open' | 'closing' | 'closed'

// WebSocket消息类型
export interface WebSocketMessage<T = any> {
  type: string
  data?: T
  timestamp?: number
  id?: string
}

// WebSocket配置选项
export interface WebSocketConfig {
  url: string
  protocols?: string | string[]
  reconnectAttempts?: number
  reconnectInterval?: number
  heartbeatInterval?: number
  heartbeatMessage?: string
  timeout?: number
  enableLogging?: boolean
  onOpen?: (event: Event) => void
  onMessage?: (message: WebSocketMessage) => void
  onClose?: (event: CloseEvent) => void
  onError?: (event: Event) => void
  onReconnect?: (attempt: number) => void
}

// WebSocket拦截器
export interface WebSocketInterceptors {
  // 发送拦截
  sendInterceptors?: (message: any) => any
  sendInterceptorsCatch?: (err: any) => any
  // 接收拦截
  receiveInterceptors?: (message: WebSocketMessage) => WebSocketMessage
  receiveInterceptorsCatch?: (err: any) => any
}

// WebSocket实例接口
export interface WebSocketInstance {
  readonly readyState: WebSocketReadyState
  readonly url: string
  readonly isConnected: boolean
  readonly isReconnecting: boolean
  readonly reconnectAttempts: number

  connect(): Promise<void>
  disconnect(code?: number, reason?: string): void
  send(data: any): void
  on(event: string, callback: Function): void
  off(event: string, callback?: Function): void
  emit(event: string, ...args: any[]): void
  destroy(): void
}

// WebSocket错误类型
export interface WebSocketError {
  code: number
  message: string
  type: 'connection' | 'send' | 'receive' | 'timeout' | 'unknown'
  timestamp: number
}

// WebSocket状态
export interface WebSocketState {
  isConnected: boolean
  readyState: WebSocketReadyState
  error: WebSocketError | null
  lastMessage: WebSocketMessage | null
  reconnectAttempts: number
  isReconnecting: boolean
}

// WebSocket服务配置
export interface WebSocketServiceConfig extends WebSocketConfig {
  interceptors?: WebSocketInterceptors
}
