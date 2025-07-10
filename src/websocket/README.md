# WebSocket 管理工具

本项目提供了一套完整的WebSocket管理工具，类似于axios的设计模式，并深度集成到Pinia状态管理系统中。

## 特性

- 🔄 **自动重连**: 支持配置化的自动重连机制
- 💗 **心跳检测**: 自动发送心跳包保持连接
- 📦 **消息拦截**: 支持发送和接收消息拦截器
- 🔄 **状态管理**: 完整的状态管理集成
- 🎯 **类型安全**: 完整的TypeScript类型定义
- 🚀 **易于使用**: 类似axios的API设计
- 🔌 **多连接支持**: 同时管理多个WebSocket连接

## 快速开始

### 环境配置

在 `.env` 文件中配置WebSocket服务器地址：

```env
VITE_WS_BASE_URL=ws://localhost:8080
```

### 基本使用

```typescript
import { useWebSocket } from '@/hooks/web/useWebSocket'

// 在组件中使用
const { isConnected, send, sendJSON, subscribe, disconnect } = useWebSocket({
  path: '/api/chat',
  autoConnect: true
})

// 发送消息
send('Hello World')

// 发送JSON消息
sendJSON('chat', { message: 'Hello', userId: '123' })

// 订阅消息
subscribe('chat', (data) => {
  console.log('收到聊天消息:', data)
})
```

### 状态管理使用

```typescript
import { useWebSocketStore } from '@/store/modules/websocket'

const webSocketStore = useWebSocketStore()

// 初始化连接
await webSocketStore.initConnection({
  path: '/api/notifications',
  name: 'notifications',
  autoConnect: true
})

// 发送消息
webSocketStore.sendJSON('/api/notifications', 'subscribe', {
  userId: '123',
  topics: ['order', 'message']
})

// 获取连接状态
const connectionState = webSocketStore.getConnectionState('/api/notifications')
```

## API 文档

### useWebSocket Hook

#### 配置选项

```typescript
interface UseWebSocketOptions {
  path: string // WebSocket路径
  autoConnect?: boolean // 自动连接 (默认: true)
  reconnectAttempts?: number // 重连次数 (默认: 5)
  reconnectInterval?: number // 重连间隔 (默认: 3000ms)
  heartbeatInterval?: number // 心跳间隔 (默认: 30000ms)
  onMessage?: (message: WebSocketMessage) => void
  onOpen?: (event: Event) => void
  onClose?: (event: CloseEvent) => void
  onError?: (error: any) => void
  onReconnect?: (attempt: number) => void
}
```

#### 返回值

```typescript
{
  // 状态
  isConnected: Ref<boolean>
  readyState: Ref<WebSocketReadyState>
  error: Ref<any>
  lastMessage: Ref<WebSocketMessage | null>
  reconnectAttemptsCount: Ref<number>
  isReconnecting: Ref<boolean>
  messageHistory: ComputedRef<WebSocketMessage[]>

  // 方法
  connect(): Promise<void>
  disconnect(code?: number, reason?: string): void
  send(data: any): void
  sendJSON(type: string, data?: any): void
  sendNotification(message: string, level?: string): void
  subscribe(type: string, handler: Function): Function
  unsubscribe(type: string, handler?: Function): void
  once(type: string, handler: Function): Function
  waitForMessage(type: string, timeout?: number): Promise<any>
  clearHistory(): void
  reconnect(): void
}
```

### 直接使用WebSocket服务

```typescript
import websocket from '@/websocket'

// 连接
const ws = await websocket.connect('/api/chat')

// 发送消息
websocket.sendJSON('/api/chat', 'message', { text: 'Hello' })

// 监听消息
websocket.subscribe('/api/chat', 'message', (data) => {
  console.log('收到消息:', data)
})

// 断开连接
websocket.disconnect('/api/chat')
```

## 专用Hooks

### 1. 实时通知Hook

```typescript
import { useWebSocketNotification } from '@/hooks/web/useWebSocket'

const { notify, subscribe } = useWebSocketNotification('/api/notifications')

// 发送通知
notify('操作成功', 'success')

// 监听通知
subscribe('notification', (data) => {
  console.log('收到通知:', data)
})
```

### 2. 聊天Hook

```typescript
import { useWebSocketChat } from '@/hooks/web/useWebSocket'

const { messages, sendChatMessage } = useWebSocketChat('/api/chat')

// 发送聊天消息
sendChatMessage('Hello World', 'user123')

// 消息会自动添加到messages数组中
```

### 3. 状态同步Hook

```typescript
import { useWebSocketSync } from '@/hooks/web/useWebSocket'

const { state, updateState, requestState } = useWebSocketSync('/api/sync', {
  count: 0,
  status: 'idle'
})

// 更新状态
updateState({ count: 1 })

// 请求完整状态
requestState()
```

## 消息格式

### 标准消息格式

```typescript
interface WebSocketMessage {
  type: string // 消息类型
  data?: any // 消息数据
  timestamp?: number // 时间戳
  id?: string // 消息ID
}
```

### 常用消息类型

- `ping` / `pong`: 心跳消息
- `notification`: 通知消息
- `chat`: 聊天消息
- `system`: 系统消息
- `error`: 错误消息
- `state-update`: 状态更新
- `state-request`: 状态请求

## 高级配置

### 自定义拦截器

```typescript
import { createWebSocket } from '@/websocket'

const ws = createWebSocket({
  url: 'ws://localhost:8080/api/chat',
  interceptors: {
    sendInterceptors: (message) => {
      // 发送前处理
      return { ...message, timestamp: Date.now() }
    },
    receiveInterceptors: (message) => {
      // 接收后处理
      console.log('收到消息:', message)
      return message
    }
  }
})
```

### 错误处理

```typescript
const ws = useWebSocket({
  path: '/api/chat',
  onError: (error) => {
    console.error('WebSocket错误:', error)
    // 自定义错误处理
  },
  onReconnect: (attempt) => {
    console.log(`重连第${attempt}次`)
  }
})
```

## 最佳实践

1. **连接管理**: 建议在应用入口处初始化全局WebSocket连接
2. **状态同步**: 使用Pinia store统一管理所有WebSocket状态
3. **错误处理**: 实现完整的错误处理和用户提示
4. **性能优化**: 合理设置心跳间隔和重连策略
5. **消息过滤**: 使用订阅模式避免不必要的消息处理

## 故障排除

### 常见问题

1. **连接失败**: 检查WebSocket服务器地址和端口
2. **认证问题**: 确保token正确传递
3. **频繁重连**: 检查网络稳定性和服务器配置
4. **消息丢失**: 检查消息格式和类型匹配

### 调试

启用调试模式：

```typescript
const ws = useWebSocket({
  path: '/api/chat',
  config: {
    enableLogging: true
  }
})
```

## 示例项目

查看 `/examples` 目录下的完整示例项目，包含：

- 实时聊天应用
- 系统通知
- 数据同步
- 在线状态显示
