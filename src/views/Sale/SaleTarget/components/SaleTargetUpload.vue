<script setup lang="ts">
import { ref } from 'vue'
import { ElUpload, ElButton, ElMessage, ElCard } from 'element-plus'
import { Icon } from '@/components/Icon'
import { useDesign } from '@/hooks/web/useDesign'
import { downloadSaleTargetTemplateApi, startImportTaskApi } from '@/api/sale'
import type { UploadProps, UploadFile } from 'element-plus'

// 使用设计系统
const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('sale-target-upload')

// 定义 emits
const emit = defineEmits(['success', 'error', 'close', 'refresh'])

// 上传组件引用
const uploadRef = ref<InstanceType<typeof ElUpload>>()

// 选中的文件
const selectedFile = ref<File | null>(null)

// 简单的上传状态
const isUploading = ref(false)
const uploadMessage = ref('')

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
    isUploading.value = true
    uploadMessage.value = '正在上传文件...'

    // 启动异步导入任务
    const response = await startImportTaskApi(selectedFile.value)
    const taskId = response.data.taskId

    uploadMessage.value = `上传成功！任务ID: ${taskId}`
    ElMessage.success('文件上传成功')

    // 触发刷新表格数据事件
    emit('refresh')

    // 延迟关闭对话框
    setTimeout(() => {
      emit('success', { taskId })
    }, 1500)
  } catch (error: any) {
    console.error('❌ 上传失败:', error)
    uploadMessage.value = '上传失败'
    ElMessage.error(error.message || '上传失败，请重试')
  } finally {
    isUploading.value = false
  }
}

// 取消上传
const handleCancelUpload = () => {
  isUploading.value = false
  uploadMessage.value = ''
  ElMessage.info('已取消上传')
}
</script>

<template>
  <div :class="prefixCls">
    <!-- 文件上传区域 -->
    <div v-if="!isUploading" :class="`${prefixCls}__upload-area`">
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

    <!-- 上传中状态 -->
    <div v-else :class="`${prefixCls}__uploading-area`">
      <ElCard :class="`${prefixCls}__uploading-card`" shadow="never">
        <div class="uploading-content">
          <Icon icon="vi-ep:loading" class="loading-icon" />
          <h4>正在上传文件</h4>
          <p class="upload-message">{{ uploadMessage }}</p>
          <ElButton @click="handleCancelUpload">取消上传</ElButton>
        </div>
      </ElCard>
    </div>
  </div>
</template>

<style scoped lang="less">
// 旋转动画
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@media (width <= 768px) {
  .@{prefix-cls} {
    &__action-buttons {
      flex-direction: column;
      align-items: stretch;
    }
  }
}

.@{prefix-cls} {
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

  &__uploading-area {
    .@{prefix-cls}__uploading-card {
      border: 1px solid var(--el-border-color-light);

      :deep(.el-card__body) {
        padding: 40px 20px;
      }
    }

    .uploading-content {
      text-align: center;

      .loading-icon {
        margin-bottom: 16px;
        font-size: 48px;
        color: var(--el-color-primary);
        animation: rotate 2s linear infinite;
      }

      h4 {
        margin: 0 0 12px;
        font-size: 18px;
        color: var(--el-text-color-primary);
      }

      .upload-message {
        margin: 0 0 20px;
        font-size: 14px;
        color: var(--el-text-color-secondary);
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
// 响应式设计
@prefix-cls: ~'@{adminNamespace}-sale-target-upload';
</style>
