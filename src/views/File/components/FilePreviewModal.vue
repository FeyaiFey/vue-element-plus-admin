<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import VueOfficeDocx from '@vue-office/docx'
import VueOfficeExcel from '@vue-office/excel'
import type { FileResponse } from '@/api/file/types'
import { previewFileApi } from '@/api/file'
import ResizeDialog from '@/components/Dialog/src/ResizeDialog.vue'

const props = defineProps<{
  modelValue: boolean
  file: FileResponse | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

// 预览内容
const previewContent = ref<Blob | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// 计算文件类型
const fileType = computed(() => {
  if (!props.file) return ''
  const mimeType = props.file.mime_type.toLowerCase()

  if (mimeType.includes('image/')) return 'image'
  if (mimeType.includes('pdf')) return 'pdf'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheetml')) return 'excel'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'docx'

  return 'unknown'
})

// 获取预览内容
const fetchPreviewContent = async () => {
  if (!props.file) return

  try {
    loading.value = true
    error.value = null
    const response = await previewFileApi(props.file.id)
    previewContent.value = response.data

    // 根据文件类型决定预览方式
    if (fileType.value === 'image' || fileType.value === 'pdf') {
      // 图片和PDF使用新标签页预览
      const url = window.URL.createObjectURL(response.data)
      window.open(url, '_blank')
      emit('update:modelValue', false)
    }
  } catch (err) {
    console.error('获取预览内容失败:', err)
    error.value = '获取预览内容失败'
    ElMessage.error('获取预览内容失败')
  } finally {
    loading.value = false
  }
}

// 监听文件变化
watch(
  () => props.file,
  (newFile) => {
    if (newFile && props.modelValue) {
      fetchPreviewContent()
    }
  }
)

// 监听弹窗显示状态
watch(
  () => props.modelValue,
  (newVisible) => {
    if (newVisible && props.file) {
      fetchPreviewContent()
    } else {
      previewContent.value = null
      error.value = null
    }
  }
)

// 关闭弹窗
const handleClose = () => {
  emit('update:modelValue', false)
}

// 计算弹窗尺寸
const dialogWidth = computed(() => Math.floor(window.innerWidth * 0.8))
const dialogHeight = computed(() => Math.floor(window.innerHeight * 0.8))
const minWidth = computed(() => Math.floor(window.innerWidth * 0.4))
const minHeight = computed(() => Math.floor(window.innerHeight * 0.4))
</script>

<template>
  <ResizeDialog
    v-if="fileType === 'excel' || fileType === 'docx'"
    :model-value="modelValue"
    @update:model-value="(val) => emit('update:modelValue', val)"
    :title="file?.original_name"
    :init-width="dialogWidth"
    :init-height="dialogHeight"
    :min-resize-width="minWidth"
    :min-resize-height="minHeight"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    @close="handleClose"
    class="file-preview-dialog"
  >
    <div v-loading="loading" class="preview-container">
      <!-- 错误提示 -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <!-- Excel预览 -->
      <div v-else-if="fileType === 'excel' && previewContent" class="office-preview">
        <VueOfficeExcel :src="previewContent" />
      </div>

      <!-- Word预览 -->
      <div v-else-if="fileType === 'docx' && previewContent" class="office-preview">
        <VueOfficeDocx :src="previewContent" />
      </div>
    </div>
  </ResizeDialog>

  <!-- 加载提示 -->
  <div v-else-if="loading" class="loading-container">
    <div class="loading-message">正在打开预览...</div>
  </div>
</template>

<style lang="less" scoped>


// 暗色模式适配
@media (prefers-color-scheme: dark) {
  .preview-container {
    background: var(--el-bg-color-page);
  }
}

.file-preview-dialog {
  :deep(.el-dialog__body) {
    padding: 0;
  }
}

.preview-container {
  display: flex;
  min-height: 500px;
  padding: 20px;
  background: #f5f7fa;
  justify-content: center;
  align-items: center;

  .error-message {
    font-size: 16px;
    color: var(--el-color-danger);
  }

  .office-preview {
    width: 100%;
    height: 80vh;
    overflow: auto;
  }
}

.loading-container {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  background: rgb(0 0 0 / 50%);
  justify-content: center;
  align-items: center;

  .loading-message {
    padding: 20px;
    font-size: 16px;
    color: #fff;
    background: rgb(0 0 0 / 70%);
    border-radius: 4px;
  }
}

.dark {
  .preview-container {
    background: var(--el-bg-color-page);
  }
}
</style>
