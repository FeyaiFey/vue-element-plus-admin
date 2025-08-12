<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { ElForm, ElFormItem, ElInput, ElTag, ElUpload, ElMessage, UploadFile } from 'element-plus'
import { Icon } from '@/components/Icon'

const props = defineProps<{
  to: string[]
  cc: string[]
  subject: string
  attachments: {
    filename: string
    content: string
    content_type: string
  }[]
}>()

const emit = defineEmits<{
  (e: 'update:to', value: string[]): void
  (e: 'update:cc', value: string[]): void
  (e: 'update:subject', value: string): void
  (e: 'add-attachment', file: File): void
  (e: 'remove-attachment', index: number): void
}>()

// 收件人输入相关
const recipientInputVisible = ref(false)
const ccInputVisible = ref(false)
const recipientInput = ref('')
const ccInput = ref('')
const recipientInputRef = ref()
const ccInputRef = ref()

// 显示收件人输入
const showRecipientInput = () => {
  recipientInputVisible.value = true
  nextTick(() => {
    recipientInputRef.value?.focus()
  })
}

// 显示抄送输入
const showCcInput = () => {
  ccInputVisible.value = true
  nextTick(() => {
    ccInputRef.value?.focus()
  })
}

// 校验邮箱格式
const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 处理收件人输入确认
const handleRecipientInputConfirm = (type: 'to' | 'cc') => {
  const inputValue = (type === 'to' ? recipientInput.value : ccInput.value) || ''
  if (inputValue && isValidEmail(inputValue)) {
    if (type === 'to' && !props.to.includes(inputValue)) {
      emit('update:to', [...props.to, inputValue])
    } else if (type === 'cc' && !props.cc.includes(inputValue)) {
      emit('update:cc', [...props.cc, inputValue])
    }
  } else if (inputValue) {
    ElMessage.warning('请输入有效的邮箱地址')
  }

  if (type === 'to') {
    recipientInputVisible.value = false
    recipientInput.value = ''
  } else {
    ccInputVisible.value = false
    ccInput.value = ''
  }
}

// 移除收件人
const removeRecipient = (email: string, type: 'to' | 'cc') => {
  if (type === 'to') {
    emit(
      'update:to',
      props.to.filter((item) => item !== email)
    )
  } else {
    emit(
      'update:cc',
      props.cc.filter((item) => item !== email)
    )
  }
}

// 处理粘贴多个邮箱
const handleRecipientPaste = (type: 'to' | 'cc', e: ClipboardEvent) => {
  e.preventDefault()
  const pasteText = e.clipboardData?.getData('text')

  if (!pasteText) return

  // 按分隔符分割并处理粘贴的多个邮箱
  const emails = pasteText
    .split(/[\s,;]+/)
    .map((email) => email.trim())
    .filter((email) => email && isValidEmail(email))

  if (emails.length) {
    if (type === 'to') {
      // 过滤掉已存在的邮箱
      const newEmails = emails.filter((email) => !props.to.includes(email))
      emit('update:to', [...props.to, ...newEmails])
      recipientInputVisible.value = false
      recipientInput.value = ''
    } else {
      const newEmails = emails.filter((email) => !props.cc.includes(email))
      emit('update:cc', [...props.cc, ...newEmails])
      ccInputVisible.value = false
      ccInput.value = ''
    }
  }
}

// 处理文件上传
const handleFileUpload = (uploadFile: UploadFile) => {
  if (uploadFile.raw) {
    emit('add-attachment', uploadFile.raw)
  }
  return false // 阻止自动上传
}
</script>

<template>
  <div class="email-form-container">
    <ElForm label-width="100px" class="email-form">
      <ElFormItem label="收件人" required>
        <div class="recipient-input">
          <div class="recipient-tags">
            <ElTag
              v-for="email in to"
              :key="email"
              class="recipient-tag"
              type="primary"
              effect="light"
              closable
              @close="removeRecipient(email, 'to')"
            >
              {{ email }}
            </ElTag>
            <ElInput
              v-if="recipientInputVisible"
              ref="recipientInputRef"
              v-model="recipientInput"
              class="input-new-tag"
              placeholder="请输入收件人邮箱，按回车添加"
              @keyup.enter="handleRecipientInputConfirm('to')"
              @blur="handleRecipientInputConfirm('to')"
              @paste="handleRecipientPaste('to', $event)"
            />
            <ElTag v-else class="button-new-tag" @click="showRecipientInput"> + 添加收件人 </ElTag>
          </div>
        </div>
      </ElFormItem>

      <ElFormItem label="抄送">
        <div class="recipient-input">
          <div class="recipient-tags">
            <ElTag
              v-for="email in cc"
              :key="email"
              class="recipient-tag"
              type="info"
              effect="light"
              closable
              @close="removeRecipient(email, 'cc')"
            >
              {{ email }}
            </ElTag>
            <ElInput
              v-if="ccInputVisible"
              ref="ccInputRef"
              v-model="ccInput"
              class="input-new-tag"
              size="small"
              placeholder="请输入抄送邮箱，按回车添加"
              @keyup.enter="handleRecipientInputConfirm('cc')"
              @blur="handleRecipientInputConfirm('cc')"
              @paste="handleRecipientPaste('cc', $event)"
            />
            <ElTag v-else class="button-new-tag" @click="showCcInput"> + 添加抄送 </ElTag>
          </div>
        </div>
      </ElFormItem>

      <ElFormItem label="主题" required>
        <div class="subject-input-container">
          <ElInput
            :model-value="subject"
            @update:model-value="(val) => emit('update:subject', val)"
            placeholder="请输入邮件主题"
            maxlength="100"
            show-word-limit
          />
        </div>
      </ElFormItem>

      <ElFormItem label="附件">
        <div class="attachment-list">
          <div v-if="attachments.length > 0" class="attachment-items">
            <div v-for="(file, index) in attachments" :key="index" class="attachment-item">
              <Icon icon="vi-ri:attachment-2" class="text-blue-500 mr-2" />
              <span class="flex-1 truncate">{{ file.filename }}</span>
              <Icon
                icon="vi-ri:close-circle-line"
                class="ml-2 cursor-pointer text-red-500 hover:text-red-700"
                @click="emit('remove-attachment', index)"
              />
            </div>
          </div>
          <ElUpload
            class="upload-demo"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFileUpload"
            :limit="5"
            :on-exceed="() => ElMessage.warning('最多只能上传5个文件')"
            drag
            multiple
          >
            <div class="upload-content">
              <Icon icon="vi-ri:upload-cloud-2-line" class="text-4xl text-gray-400 mb-2" />
              <div class="text-gray-600">将文件拖到此处，或<em>点击上传</em></div>
              <div class="text-xs text-gray-400 mt-1">邮件默认会携带选中行数据的附件，可不上传</div>
            </div>
          </ElUpload>
        </div>
      </ElFormItem>
    </ElForm>
  </div>
</template>

<style lang="less" scoped>


// 深色模式支持
@media (prefers-color-scheme: dark) {
  .email-form-container {
    background-color: #1e1e1e;
  }

  .email-form {
    background-color: #2d2d2d;
    box-shadow: 0 2px 8px rgb(0 0 0 / 30%);

    :deep(.el-form-item__label) {
      color: #e5e5e5;
    }
  }

  .attachment-list {
    .attachment-item {
      background-color: #3a3a3a;
      border-color: #4a4a4a;

      &:hover {
        background-color: #4a4a4a;
        border-color: #5a5a5a;
      }
    }

    .upload-demo {
      :deep(.el-upload-dragger) {
        background-color: #3a3a3a;
        border-color: #4a4a4a;

        &:hover {
          background-color: #2a4a6b;
          border-color: #409eff;
        }
      }
    }
  }

  .button-new-tag {
    color: #ccc;
    background-color: #3a3a3a;
    border-color: #4a4a4a;

    &:hover {
      color: #409eff;
      background-color: #2a4a6b;
      border-color: #409eff;
    }
  }
}

.email-form-container {
  min-height: 500px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.email-form {
  padding: 24px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 10%);

  :deep(.el-form-item__label) {
    font-weight: 600;
    color: #2c3e50;
  }

  :deep(.el-form-item) {
    margin-bottom: 20px;
  }
}

.recipient-input {
  display: flex;
  width: 100%;
  min-height: 40px;
  flex-wrap: wrap;

  .recipient-tags {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    width: 100%;
  }

  .recipient-tag {
    margin-right: 6px;
    margin-bottom: 4px;
    border-radius: 20px;
  }

  .button-new-tag {
    height: 32px;
    padding: 0 12px;
    margin-right: 6px;
    margin-bottom: 4px;
    line-height: 30px;
    color: #666;
    cursor: pointer;
    background-color: #fafafa;
    border: 1px dashed #d9d9d9;
    border-radius: 20px;
    transition: all 0.3s;

    &:hover {
      color: #409eff;
      background-color: #ecf5ff;
      border-color: #409eff;
    }
  }

  .input-new-tag {
    width: 200px;
    margin-right: 6px;
    margin-bottom: 4px;
    vertical-align: bottom;
  }
}

.attachment-list {
  .attachment-items {
    margin-bottom: 16px;
  }

  .attachment-item {
    display: flex;
    align-items: center;
    padding: 12px;
    margin-bottom: 8px;
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    transition: all 0.3s;

    &:hover {
      background-color: #e9ecef;
      border-color: #dee2e6;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  .upload-demo {
    width: 100%;

    :deep(.el-upload) {
      width: 100%;
    }

    :deep(.el-upload-dragger) {
      width: 100%;
      height: 120px;
      background-color: #fafafa;
      border: 2px dashed #d9d9d9;
      border-radius: 8px;
      transition: all 0.3s;

      &:hover {
        background-color: #ecf5ff;
        border-color: #409eff;
      }
    }

    .upload-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      text-align: center;

      em {
        font-style: normal;
        color: #409eff;
      }
    }
  }
}
</style>
