import {
  WebSocketInstance,
  WebSocketMessage,
  WebSocketServiceConfig,
  WebSocketReadyState,
  WebSocketError
} from './types'
import {
  defaultWebSocketConfig,
  defaultSendInterceptors,
  defaultReceiveInterceptors,
  defaultErrorHandler,
  defaultReconnectHandler,
  validateWebSocketConfig
} from './config'

class WebSocketService implements WebSocketInstance {
  private ws: WebSocket | null = null
  private config: WebSocketServiceConfig
  private eventListeners: Map<string, Function[]> = new Map()
  private reconnectTimer: number | null = null
  private heartbeatTimer: number | null = null
  private connectPromise: Promise<void> | null = null
  private connectResolve: (() => void) | null = null
  private connectReject: ((reason?: any) => void) | null = null

  private _readyState: WebSocketReadyState = 'closed'
  private _reconnectAttempts = 0
  private _isReconnecting = false
  private _lastError: WebSocketError | null = null

  constructor(config: WebSocketServiceConfig) {
    this.config = { ...defaultWebSocketConfig, ...config }

    if (!validateWebSocketConfig(this.config as any)) {
      throw new Error('无效的WebSocket配置')
    }
  }

  get readyState(): WebSocketReadyState {
    return this._readyState
  }

  get url(): string {
    return this.config.url
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  get isReconnecting(): boolean {
    return this._isReconnecting
  }

  get reconnectAttempts(): number {
    return this._reconnectAttempts
  }

  get lastError(): WebSocketError | null {
    return this._lastError
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
      return Promise.resolve()
    }

    if (this.connectPromise) {
      return this.connectPromise
    }

    this.connectPromise = new Promise<void>((resolve, reject) => {
      this.connectResolve = resolve
      this.connectReject = reject
      this._connect()
    })

    return this.connectPromise
  }

  private _connect(): void {
    try {
      if (this.config.enableLogging) {
        console.log('正在连接WebSocket:', this.config.url)
      }

      this._readyState = 'connecting'
      this.ws = new WebSocket(this.config.url, this.config.protocols)

      const timeout = setTimeout(() => {
        this._handleError({
          code: 408,
          message: '连接超时',
          type: 'timeout',
          timestamp: Date.now()
        })
      }, this.config.timeout)

      this.ws.onopen = (event) => {
        clearTimeout(timeout)
        this._readyState = 'open'
        this._reconnectAttempts = 0
        this._isReconnecting = false
        this._lastError = null
        this.connectPromise = null

        if (this.config.enableLogging) {
          console.log('WebSocket连接成功')
        }

        this.startHeartbeat()
        this.config.onOpen?.(event)
        this.emit('open', event)
        this.connectResolve?.()
      }

      this.ws.onmessage = (event) => {
        this._handleMessage(event)
      }

      this.ws.onclose = (event) => {
        clearTimeout(timeout)
        this._readyState = 'closed'
        this.stopHeartbeat()
        this.connectPromise = null

        if (this.config.enableLogging) {
          console.log('WebSocket连接关闭', event.code, event.reason)
        }

        this.config.onClose?.(event)
        this.emit('close', event)

        // 如果不是主动关闭，尝试重连
        if (!event.wasClean && this._reconnectAttempts < (this.config.reconnectAttempts || 0)) {
          this._scheduleReconnect()
        } else {
          this.connectReject?.(event)
        }
      }

      this.ws.onerror = (_) => {
        clearTimeout(timeout)
        this._handleError({
          code: 500,
          message: '连接错误',
          type: 'connection',
          timestamp: Date.now()
        })
      }
    } catch (error) {
      this._handleError({
        code: 500,
        message: error instanceof Error ? error.message : '未知错误',
        type: 'connection',
        timestamp: Date.now()
      })
    }
  }

  private _handleMessage(event: MessageEvent): void {
    try {
      let message: WebSocketMessage

      if (typeof event.data === 'string') {
        try {
          message = JSON.parse(event.data)
        } catch {
          message = {
            type: 'text',
            data: event.data,
            timestamp: Date.now()
          }
        }
      } else {
        message = {
          type: 'binary',
          data: event.data,
          timestamp: Date.now()
        }
      }

      // 应用接收拦截器
      if (this.config.interceptors?.receiveInterceptors) {
        try {
          message = this.config.interceptors.receiveInterceptors(message)
        } catch (error) {
          this.config.interceptors.receiveInterceptorsCatch?.(error)
          return
        }
      } else {
        message = defaultReceiveInterceptors(message)
      }

      // 处理心跳响应
      if (message.type === 'pong') {
        return
      }

      this.config.onMessage?.(message)
      this.emit('message', message)
    } catch (error) {
      this._handleError({
        code: 422,
        message: '消息解析失败',
        type: 'receive',
        timestamp: Date.now()
      })
    }
  }

  private _handleError(error: WebSocketError): void {
    this._lastError = error

    if (this.config.enableLogging) {
      console.error('WebSocket错误:', error)
    }

    defaultErrorHandler(error)
    this.config.onError?.(error as any)
    this.emit('error', error)
    this.connectReject?.(error)
  }

  private _scheduleReconnect(): void {
    if (this._isReconnecting) {
      return
    }

    this._isReconnecting = true
    this._reconnectAttempts++

    if (this.config.enableLogging) {
      console.log(`WebSocket将在${this.config.reconnectInterval}ms后重连`)
    }

    this.config.onReconnect?.(this._reconnectAttempts)
    defaultReconnectHandler(this._reconnectAttempts)

    this.reconnectTimer = window.setTimeout(() => {
      this._connect()
    }, this.config.reconnectInterval)
  }

  private startHeartbeat(): void {
    if (!this.config.heartbeatInterval) {
      return
    }

    this.heartbeatTimer = window.setInterval(() => {
      if (this.isConnected) {
        this.send({
          type: 'ping',
          data: this.config.heartbeatMessage,
          timestamp: Date.now()
        })
      }
    }, this.config.heartbeatInterval)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  disconnect(code = 1000, reason = ''): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    this.stopHeartbeat()
    this._isReconnecting = false

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this._readyState = 'closing'
      this.ws.close(code, reason)
    } else {
      this._readyState = 'closed'
    }
  }

  send(data: any): void {
    if (!this.isConnected) {
      this._handleError({
        code: 503,
        message: '连接未就绪',
        type: 'send',
        timestamp: Date.now()
      })
      return
    }

    try {
      let message = data

      // 应用发送拦截器
      if (this.config.interceptors?.sendInterceptors) {
        try {
          message = this.config.interceptors.sendInterceptors(message)
        } catch (error) {
          this.config.interceptors.sendInterceptorsCatch?.(error)
          return
        }
      } else {
        message = defaultSendInterceptors(message)
      }

      this.ws?.send(message)
    } catch (error) {
      this._handleError({
        code: 500,
        message: error instanceof Error ? error.message : '发送失败',
        type: 'send',
        timestamp: Date.now()
      })
    }
  }

  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)?.push(callback)
  }

  off(event: string, callback?: Function): void {
    if (!this.eventListeners.has(event)) {
      return
    }

    if (callback) {
      const listeners = this.eventListeners.get(event) || []
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    } else {
      this.eventListeners.delete(event)
    }
  }

  emit(event: string, ...args: any[]): void {
    const listeners = this.eventListeners.get(event) || []
    listeners.forEach((callback) => {
      try {
        callback(...args)
      } catch (error) {
        console.error('事件处理器错误:', error)
      }
    })
  }

  destroy(): void {
    this.disconnect()
    this.eventListeners.clear()
    this.ws = null
  }
}

export default WebSocketService
