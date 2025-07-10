<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { ElUpload, ElButton, ElProgress, ElTag, ElMessage, ElCard, ElDivider } from 'element-plus'
import { Icon } from '@/components/Icon'
import { useDesign } from '@/hooks/web/useDesign'
import { downloadSaleTargetTemplateApi, startImportTaskApi } from '@/api/sale'
import type { UploadProps, UploadFile } from 'element-plus'
import websocket from '@/websocket'

// 使用设计系统
const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('sale-target-upload')

// 定义 emits
const emit = defineEmits(['success', 'error', 'close', 'refresh'])

// 上传组件引用
const uploadRef = ref<InstanceType<typeof ElUpload>>()

// 选中的文件
const selectedFile = ref<File | null>(null)

// 简单的导入状态
const isImporting = ref(false)
const progress = ref(0)
const message = ref('')
const successCount = ref(0)
const errorCount = ref(0)
const totalCount = ref(0)
const errorDetails = ref<any[]>([]) // 改为存储错误对象而非字符串
const isCompleted = ref(false)
const hasError = ref(false)
const error = ref('')
const result = ref<any>(null)

// WebSocket连接状态
const wsConnected = ref(false)
const currentTaskId = ref('')

// 计算属性
const progressPercent = computed(() => Math.floor(progress.value))
const progressStatus = computed(() => {
  if (hasError.value) return 'exception'
  if (isCompleted.value) return 'success'
  return undefined
})

// 重置状态
const resetState = () => {
  // 不重置 isImporting，让界面状态由专门的逻辑控制
  // isImporting.value = false
  progress.value = 0
  message.value = ''
  successCount.value = 0
  errorCount.value = 0
  totalCount.value = 0
  errorDetails.value = []
  isCompleted.value = false
  hasError.value = false
  error.value = ''
  result.value = null
  wsConnected.value = false
  currentTaskId.value = ''
}

// 文件选择处理
const handleFileChange: UploadProps['onChange'] = (uploadFile: UploadFile) => {
  if (uploadFile.raw) {
    selectedFile.value = uploadFile.raw
  }
}

// 文件移除处理
const handleFileRemove = () => {
  selectedFile.value = null
  uploadRef.value?.clearFiles()
}

// 上传前验证
const beforeUpload: UploadProps['beforeUpload'] = (file: File) => {
  const isExcel =
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.type === 'application/vnd.ms-excel'
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isExcel) {
    ElMessage.error('只能上传Excel文件!')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB!')
    return false
  }
  return false // 阻止自动上传
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// 处理WebSocket消息
const handleProgressMessage = (data: any) => {
  try {
    console.log('📨 收到进度消息:', data)

    // 跳过心跳和ping/pong消息
    if (data.type === 'heartbeat' || data.type === 'ping' || data.type === 'pong') {
      return
    }

    // 更新进度信息
    if (data.progress !== undefined) {
      progress.value = data.progress
    }
    if (data.message) {
      message.value = data.message
    }
    if (data.successCount !== undefined) {
      successCount.value = data.successCount
    }
    if (data.errorCount !== undefined) {
      errorCount.value = data.errorCount
    }
    if (data.total !== undefined) {
      totalCount.value = data.total
    }

    // 处理失败记录 - 使用新的 failedRecords 格式
    if (data.failedRecords) {
      if (Array.isArray(data.failedRecords)) {
        errorDetails.value = data.failedRecords
      } else if (typeof data.failedRecords === 'string') {
        try {
          errorDetails.value = JSON.parse(data.failedRecords)
        } catch (e) {
          errorDetails.value = []
        }
      }
    }

    // 处理完成状态
    if (data.status === 'completed') {
      // 导入完成
      successCount.value = data.successCount || 0
      errorCount.value = data.errorCount || 0
      errorDetails.value = data.failedRecords || []
      isCompleted.value = true

      // 触发刷新表格数据事件
      emit('refresh')
    } else if (data.status === 'failed' || data.type === 'error') {
      isCompleted.value = true
      hasError.value = true
      error.value = data.message || '导入失败'
      ElMessage.error(error.value)
    }
  } catch (err) {
    console.error('处理进度消息失败:', err)
  }
}

// 连接WebSocket
const connectWebSocket = async (taskId: string) => {
  const wsPath = `/task/progress/${taskId}`

  try {
    // 连接WebSocket
    const wsInstance = await websocket.connect(wsPath, {
      enableLogging: true,
      onOpen: () => {
        wsConnected.value = true
        message.value = 'WebSocket连接成功，开始监听进度...'
      },
      onClose: () => {
        wsConnected.value = false
      },
      onError: (error: any) => {
        wsConnected.value = false
        console.error('❌ WebSocket错误:', error)

        if (isImporting.value) {
          message.value = '连接中断，请刷新重试'
        }
      }
    })

    // 监听消息
    websocket.on(wsPath, 'message', (wsMessage: any) => {
      // 直接处理消息数据
      const messageData = wsMessage.data || wsMessage
      handleProgressMessage(messageData)
    })

    return wsInstance
  } catch (error) {
    console.error('WebSocket连接失败:', error)
    wsConnected.value = false
    throw error
  }
}

// 断开WebSocket连接
const disconnectWebSocket = () => {
  if (currentTaskId.value) {
    const wsPath = `/task/progress/${currentTaskId.value}`
    websocket.disconnect(wsPath)
    wsConnected.value = false
  }
}

// 下载模板
const handleDownloadTemplate = async () => {
  try {
    const response = await downloadSaleTargetTemplateApi()

    // 创建下载链接
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `销售目标导入模板_${new Date().getTime()}.xlsx`
    link.click()

    // 清理
    setTimeout(() => {
      window.URL.revokeObjectURL(url)
    }, 100)

    ElMessage.success('模板下载成功')
  } catch (error: any) {
    ElMessage.error('模板下载失败: ' + (error.message || '未知错误'))
  }
}

// 开始上传
const handleStartUpload = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择要上传的文件')
    return
  }

  try {
    resetState()
    isImporting.value = true
    message.value = '正在启动导入任务...'

    // 启动异步导入任务
    const response = await startImportTaskApi(selectedFile.value)
    const taskId = response.data.taskId

    currentTaskId.value = taskId
    message.value = `导入任务已启动 (TaskID: ${taskId})`

    // 连接WebSocket监听进度
    await connectWebSocket(taskId)
  } catch (error: any) {
    console.error('❌ 启动导入任务失败:', error)
    isCompleted.value = true
    hasError.value = true
    error.value = error.message || '启动导入任务失败'
    ElMessage.error(error.value)
  }
}

// 取消上传
const handleCancelUpload = () => {
  disconnectWebSocket()
  resetState()
  // 取消时返回上传区域
  isImporting.value = false
  ElMessage.info('已取消上传')
}

// 组件卸载时清理
onUnmounted(() => {
  disconnectWebSocket()
})

// 处理关闭按钮
const handleClose = () => {
  disconnectWebSocket()

  // 重置isImporting状态，返回上传区域
  isImporting.value = false

  // 根据当前状态触发相应的事件
  if (isCompleted.value && !hasError.value && result.value) {
    // 成功完成时触发success事件
    emit('success', result.value)
  } else if (hasError.value) {
    // 有错误时触发error事件
    emit('error', error.value || '导入过程中发生错误')
  } else {
    // 其他情况直接触发close事件
    emit('close')
  }
}

// 下载错误报告
const downloadErrorReport = () => {
  if (errorDetails.value.length === 0) {
    ElMessage.warning('没有错误详情可下载')
    return
  }

  const report = errorDetails.value.map((record, index) => {
    return {
      序号: index + 1,
      行: record.row || index + 1,
      年份: record.year,
      月份: record.month,
      部门: record.departmentName,
      销售员: record.employeeName,
      月目标: record.monthTarget
    }
  })

  const csvContent = [
    '序号,行,年份,月份,部门,销售员,月目标',
    ...report.map((row) =>
      Object.values(row)
        .map((val) => `"${String(val).replace(/"/g, '""')}"`)
        .join(',')
    )
  ].join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `销售目标导入失败记录_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  ElMessage.success('失败记录下载成功')
}
</script>

<template>
  <div :class="prefixCls">
    <!-- 文件上传区域 -->
    <div v-if="!isImporting" :class="`${prefixCls}__upload-area`">
      <ElUpload
        ref="uploadRef"
        class="upload-dragger"
        drag
        :auto-upload="false"
        :show-file-list="false"
        accept=".xlsx,.xls"
        :on-change="handleFileChange"
        :before-upload="beforeUpload"
      >
        <Icon icon="vi-ep:upload-filled" :size="48" class="el-icon--upload" />
        <div class="el-upload__text">将Excel文件拖拽到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip">只能上传 .xlsx/.xls 文件，且不超过 10MB</div>
      </ElUpload>

      <!-- 选中的文件信息 -->
      <div v-if="selectedFile" :class="`${prefixCls}__file-info`">
        <div class="file-item">
          <Icon icon="vi-vscode-icons:file-type-excel" class="file-icon" />
          <span class="file-name">{{ selectedFile.name }}</span>
          <span class="file-size">({{ formatFileSize(selectedFile.size) }})</span>
          <ElButton link class="remove-btn" @click="handleFileRemove">
            <Icon icon="vi-ep:close" />
          </ElButton>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div :class="`${prefixCls}__action-buttons`">
        <ElButton @click="handleDownloadTemplate">
          <Icon icon="vi-ep:download" class="mr-2" />
          下载模板
        </ElButton>
        <ElButton type="primary" :disabled="!selectedFile" @click="handleStartUpload">
          <Icon icon="vi-ep:upload-filled" class="mr-2" />
          开始上传
        </ElButton>
      </div>
    </div>

    <!-- 上传进度区域 -->
    <div v-else :class="`${prefixCls}__progress-area`">
      <!-- 进度头部 -->
      <div :class="`${prefixCls}__progress-header`">
        <div>
          <h4 v-if="!isCompleted">正在导入数据</h4>
          <h4 v-else>{{ hasError ? '导入失败' : '导入完成' }}</h4>
        </div>
        <ElButton v-if="!isCompleted" link size="small" @click="handleCancelUpload"
          >取消上传</ElButton
        >
        <ElButton v-else type="primary" size="small" @click="handleClose">确认关闭</ElButton>
      </div>

      <!-- 主进度卡片 -->
      <ElCard :class="`${prefixCls}__progress-card`" shadow="never">
        <!-- 主进度条 -->
        <div :class="`${prefixCls}__main-progress`">
          <ElProgress
            :percentage="progressPercent"
            :status="progressStatus"
            :stroke-width="12"
            text-inside
            striped
            :striped-flow="!isCompleted"
          />
          <div class="progress-text">{{ message }}</div>
        </div>

        <ElDivider />
      </ElCard>

      <!-- WebSocket连接状态 - 只在未完成时显示 -->
      <div v-if="!isCompleted" :class="`${prefixCls}__connection-status`">
        <ElTag :type="wsConnected ? 'success' : 'warning'" size="small">
          <Icon :icon="wsConnected ? 'vi-ep:link' : 'vi-ep:connection'" class="mr-1" />
          {{ wsConnected ? 'WebSocket连接正常' : '等待连接' }}
        </ElTag>
      </div>

      <!-- 错误详情 -->
      <div v-if="errorDetails.length > 0" :class="`${prefixCls}__error-details`">
        <ElCard class="error-card" shadow="never">
          <template #header>
            <div class="error-header">
              <Icon icon="vi-ep:warning-filled" class="error-icon" />
              <span>失败记录（共 {{ errorDetails.length }} 条）</span>
            </div>
          </template>
          <div class="error-list">
            <div v-for="(record, index) in errorDetails" :key="index" class="error-item">
              <div class="record-header">
                <span class="record-index">{{ index + 1 }}.</span>
                <span class="record-row">第 {{ record.row }} 行</span>
              </div>
              <div class="record-data">
                <div class="data-row">
                  <span class="data-label">年份:</span>
                  <span class="data-value">{{ record.year }}</span>
                </div>
                <div class="data-row">
                  <span class="data-label">月份:</span>
                  <span class="data-value">{{ record.month }}</span>
                </div>
                <div class="data-row">
                  <span class="data-label">部门:</span>
                  <span class="data-value">{{ record.departmentName }}</span>
                </div>
                <div class="data-row">
                  <span class="data-label">销售员:</span>
                  <span class="data-value">{{ record.employeeName }}</span>
                </div>
                <div class="data-row">
                  <span class="data-label">月目标:</span>
                  <span class="data-value">{{ record.monthTarget?.toLocaleString() }}</span>
                </div>
              </div>
            </div>
          </div>
        </ElCard>
      </div>

      <!-- 完成操作按钮 -->
      <div v-if="isCompleted" :class="`${prefixCls}__complete-actions`">
        <div class="action-buttons">
          <ElButton v-if="errorCount > 0" @click="downloadErrorReport">下载失败记录</ElButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">


// 响应式设计
@media (width <= 768px) {
  .@{prefix-cls} {
    &__action-buttons {
      flex-direction: column;
      align-items: stretch;
    }

    &__progress-header {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;
    }
  }
}.@{prefix-cls} {
  min-height: 400px;
  padding: 20px;

  &__upload-area {
    .upload-dragger {
      width: 100%;

      :deep(.el-upload-dragger) {
        width: 100%;
        height: 180px;
        background-color: var(--el-fill-color-blank);
        border: 2px dashed var(--el-border-color);
        border-radius: 6px;
        transition: border-color 0.3s;

        &:hover {
          border-color: var(--el-color-primary);
        }
      }
    }
  }

  &__file-info {
    padding: 12px;
    margin: 16px 0;
    background-color: var(--el-fill-color-light);
    border-radius: 6px;

    .file-item {
      display: flex;
      align-items: center;
      gap: 8px;

      .file-icon {
        font-size: 20px;
        color: #1f7a3f;
      }

      .file-name {
        flex: 1;
        font-weight: 500;
      }

      .file-size {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }

      .remove-btn {
        color: var(--el-color-danger);

        &:hover {
          background-color: var(--el-color-danger-light-9);
        }
      }
    }
  }

  &__action-buttons {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-top: 20px;
  }

  &__progress-area {
    .@{prefix-cls}__progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h4 {
        margin: 0;
        color: var(--el-text-color-primary);
      }

      .task-id {
        margin: 4px 0 0;
        font-family: monospace;
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }

    .@{prefix-cls}__progress-card {
      margin-bottom: 16px;
      border: 1px solid var(--el-border-color-light);

      :deep(.el-card__body) {
        padding: 20px;
      }
    }

    .@{prefix-cls}__main-progress {
      margin-bottom: 16px;

      .progress-text {
        margin-top: 12px;
        font-size: 14px;
        font-weight: 500;
        color: var(--el-text-color-secondary);
        text-align: center;
      }
    }

    .@{prefix-cls}__connection-status {
      margin-bottom: 20px;
      text-align: center;
    }

    .@{prefix-cls}__error-details {
      margin-top: 20px;

      .error-card {
        border: 1px solid var(--el-color-danger-light-5);

        .error-header {
          display: flex;
          font-weight: 500;
          color: var(--el-color-danger);
          align-items: center;
          gap: 8px;

          .error-icon {
            font-size: 16px;
          }
        }

        .error-list {
          max-height: 200px;
          overflow-y: auto;

          .error-item {
            display: flex;
            padding: 8px;
            margin-bottom: 8px;
            font-size: 13px;
            line-height: 1.4;
            background-color: var(--el-color-danger-light-9);
            border-radius: 4px;
            align-items: flex-start;
            gap: 8px;
            flex-direction: column;

            &:last-child {
              margin-bottom: 0;
            }

            .record-header {
              display: flex;
              margin-bottom: 4px;
              font-size: 12px;
              color: var(--el-text-color-secondary);
              align-items: center;
              gap: 8px;

              .record-index {
                font-weight: 600;
                color: var(--el-color-danger);
                flex-shrink: 0;
              }

              .record-row {
                padding: 2px 6px;
                font-size: 11px;
                color: var(--el-text-color-secondary);
                background-color: var(--el-fill-color-light);
                border-radius: 4px;
              }
            }

            .record-data {
              .data-row {
                display: flex;
                margin-bottom: 3px;
                font-size: 12px;
                color: var(--el-text-color-secondary);
                justify-content: space-between;

                .data-label {
                  margin-right: 8px;
                  font-weight: 600;
                  color: var(--el-color-primary);
                }

                .data-value {
                  font-family: monospace;
                }
              }
            }
          }
        }
      }
    }

    .@{prefix-cls}__complete-actions {
      display: flex;
      margin-top: 20px;
      justify-content: center;
      gap: 12px;

      .action-buttons {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        justify-content: center;
      }
    }
  }
}

// 暗色主题适配
.dark .@{prefix-cls} {
  &__upload-area {
    :deep(.el-upload-dragger) {
      background-color: var(--el-bg-color-page);
      border-color: var(--el-border-color-darker);
    }
  }
}

@prefix-cls: ~'@{adminNamespace}-sale-target-upload';
</style>
