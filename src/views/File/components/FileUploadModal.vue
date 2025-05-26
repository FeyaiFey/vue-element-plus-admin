<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElUpload, ElButton, ElIcon, ElMessage, ElMessageBox } from 'element-plus'
import { Icon } from '@/components/Icon'
import ResizeDialog from '@/components/Dialog/src/ResizeDialog.vue'
import type { UploadProps, UploadUserFile } from 'element-plus'
import { uploadFileApi, uploadFilesBatchApi } from '@/api/file'

// Props
interface Props {
  visible: boolean
  currentFolderId?: number
}

const props = defineProps<Props>()

// 事件
const emit = defineEmits<{
  'update:visible': [visible: boolean]
  success: []
}>()

// 上传状态
const uploading = ref(false)
const fileList = ref<UploadUserFile[]>([])

// 文件选择
const handleFileChange: UploadProps['onChange'] = (_, uploadFiles) => {
  fileList.value = uploadFiles
}

// 文件移除
const handleRemove: UploadProps['onRemove'] = (_, uploadFiles) => {
  fileList.value = uploadFiles
}

// 上传前检查
const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  // 检查文件大小（限制100MB）
  const maxSize = 100 * 1024 * 1024
  if (file.size > maxSize) {
    ElMessage.error(`文件 ${file.name} 超过100MB限制`)
    return false
  }

  return true
}

// 执行上传
const handleUpload = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请选择要上传的文件')
    return
  }

  try {
    uploading.value = true

    // 创建FormData
    const formData = new FormData()

    // 添加文件
    fileList.value.forEach((file) => {
      if (file.raw) {
        formData.append('files', file.raw)
      }
    })

    // 添加其他参数
    if (props.currentFolderId) {
      formData.append('folder_id', props.currentFolderId.toString())
    }
    formData.append('is_public', 'false')

    // 调用上传API
    if (fileList.value.length === 1) {
      // 单文件上传
      const singleFormData = new FormData()
      if (fileList.value[0].raw) {
        singleFormData.append('file', fileList.value[0].raw)
      }
      if (props.currentFolderId) {
        singleFormData.append('folder_id', props.currentFolderId.toString())
      }
      singleFormData.append('is_public', 'false')

      await uploadFileApi(singleFormData)
    } else {
      // 批量上传
      await uploadFilesBatchApi(formData)
    }

    ElMessage.success('文件上传成功')
    emit('success')
    handleClose()
  } catch (error: any) {
    console.error('上传失败:', error)
    ElMessage.error(error.message || '上传失败')
  } finally {
    uploading.value = false
  }
}

// 关闭弹窗
const handleClose = () => {
  emit('update:visible', false)
  // 重置状态
  fileList.value = []
}

// 取消上传
const handleCancel = () => {
  if (uploading.value) {
    ElMessageBox.confirm('正在上传中，确定要取消吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '继续上传',
      type: 'warning'
    })
      .then(() => {
        handleClose()
      })
      .catch(() => {
        // 继续上传
      })
  } else {
    handleClose()
  }
}

// 监听visible变化
watch(
  () => props.visible,
  (newVal) => {
    if (!newVal) {
      fileList.value = []
    }
  }
)
</script>

<template>
  <ResizeDialog
    :model-value="visible"
    title="上传文件"
    :init-width="520"
    :init-height="400"
    :min-resize-width="480"
    :min-resize-height="350"
    :before-close="handleCancel"
    @update:model-value="emit('update:visible', $event)"
  >
    <div class="upload-container">
      <ElUpload
        multiple
        :auto-upload="false"
        drag
        :file-list="fileList"
        :show-file-list="true"
        list-type="text"
        :on-change="handleFileChange"
        :on-remove="handleRemove"
        :before-upload="beforeUpload"
        class="upload-area"
      >
        <div class="upload-dragger">
          <ElIcon class="upload-icon">
            <Icon icon="ep:upload" />
          </ElIcon>
          <div class="upload-text">
            <p>将文件拖到此处，或<em>点击上传</em></p>
            <p class="upload-tip">支持多文件上传，单个文件不超过100MB</p>
          </div>
        </div>
      </ElUpload>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="handleCancel" :disabled="uploading"> 取消 </ElButton>
        <ElButton
          type="primary"
          @click="handleUpload"
          :loading="uploading"
          :disabled="fileList.length === 0"
        >
          {{ uploading ? '上传中...' : '开始上传' }}
        </ElButton>
      </div>
    </template>
  </ResizeDialog>
</template>

<style lang="less" scoped>
.upload-container {
  .upload-area {
    width: 100%;

    :deep(.el-upload) {
      width: 100%;

      .el-upload-dragger {
        width: 100%;
        height: 180px;
        background: var(--el-fill-color-blank);
        border: 2px dashed var(--el-border-color);
        border-radius: 6px;
        transition: all 0.3s ease;

        &:hover {
          border-color: var(--el-color-primary);
        }

        .upload-dragger {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 20px;

          .upload-icon {
            margin-bottom: 16px;
            font-size: 48px;
            color: var(--el-color-primary);
          }

          .upload-text {
            text-align: center;

            p {
              margin: 0;
              font-size: 14px;
              color: var(--el-text-color-regular);

              em {
                font-style: normal;
                color: var(--el-color-primary);
                cursor: pointer;
              }
            }

            .upload-tip {
              margin-top: 8px;
              font-size: 12px;
              color: var(--el-text-color-secondary);
            }
          }
        }
      }
    }

    :deep(.el-upload-list) {
      max-height: 200px;
      margin-top: 16px;
      overflow-y: auto;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
