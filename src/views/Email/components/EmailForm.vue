<script setup lang="ts">
import { ref, nextTick } from 'vue'
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElTag,
  ElCard,
  ElRow,
  ElCol,
  ElUpload,
  ElButton,
  ElMessage,
  UploadFile
} from 'element-plus'
import { Icon } from '@/components/Icon'

const props = defineProps<{
  to: string[]
  cc: string[]
  subject: string
  templateId: number
  templateVariables: {
    user_name: string
    department: string
    content: string
  }
  attachments: {
    filename: string
    content: string
    encoding: string
    content_type: string
  }[]
}>()

const emit = defineEmits<{
  (e: 'update:to', value: string[]): void
  (e: 'update:cc', value: string[]): void
  (e: 'update:subject', value: string): void
  (e: 'update:templateId', value: number): void
  (e: 'update:templateVariables', value: any): void
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
            size="small"
            placeholder="请输入收件人邮箱，按回车添加"
            @keyup.enter="handleRecipientInputConfirm('to')"
            @blur="handleRecipientInputConfirm('to')"
            @paste="handleRecipientPaste('to', $event)"
          />
          <ElTag v-else class="button-new-tag" @click="showRecipientInput"> + 添加 </ElTag>
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
          <ElTag v-else class="button-new-tag" @click="showCcInput"> + 添加 </ElTag>
        </div>
      </div>
    </ElFormItem>

    <ElFormItem label="主题">
      <ElInput
        :model-value="subject"
        @update:model-value="(val) => emit('update:subject', val)"
        placeholder="请输入邮件主题"
      />
    </ElFormItem>

    <ElFormItem label="模板">
      <div class="template-info">
        <ElTag type="success">使用模板ID: {{ templateId }}</ElTag>
      </div>
    </ElFormItem>

    <ElFormItem label="模板变量">
      <div class="template-variables">
        <ElCard shadow="never" class="template-vars-card">
          <ElForm label-position="top" :model="templateVariables" class="vars-form">
            <ElRow :gutter="20">
              <ElCol :span="12">
                <ElFormItem label="用户名">
                  <ElInput
                    :model-value="templateVariables.user_name"
                    @update:model-value="
                      (val) =>
                        emit('update:templateVariables', { ...templateVariables, user_name: val })
                    "
                    placeholder="请输入用户名"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="12">
                <ElFormItem label="部门">
                  <ElInput
                    :model-value="templateVariables.department"
                    @update:model-value="
                      (val) =>
                        emit('update:templateVariables', { ...templateVariables, department: val })
                    "
                    placeholder="请输入部门"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :span="24">
                <ElFormItem label="内容">
                  <ElInput
                    :model-value="templateVariables.content"
                    @update:model-value="
                      (val) =>
                        emit('update:templateVariables', { ...templateVariables, content: val })
                    "
                    type="textarea"
                    :rows="4"
                    placeholder="请输入邮件内容"
                  />
                </ElFormItem>
              </ElCol>
            </ElRow>
          </ElForm>
        </ElCard>
      </div>
    </ElFormItem>

    <ElFormItem label="附件">
      <div class="attachment-list">
        <div v-for="(file, index) in attachments" :key="index" class="attachment-item">
          <Icon icon="vi-ri:attachment-2" class="mr-2" />
          <span>{{ file.filename }}</span>
          <Icon
            icon="vi-ri:close-circle-line"
            class="ml-2 cursor-pointer"
            @click="emit('remove-attachment', index)"
          />
        </div>
        <ElUpload
          class="upload-demo"
          action="#"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleFileUpload"
        >
          <ElButton type="primary">
            <Icon icon="vi-ri:upload-2-line" class="mr-2" />
            添加附件
          </ElButton>
        </ElUpload>
      </div>
    </ElFormItem>
  </ElForm>
</template>

<style lang="less" scoped>
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
  }

  .recipient-tag {
    margin-right: 6px;
    margin-bottom: 4px;
  }

  .button-new-tag {
    height: 32px;
    padding-top: 0;
    padding-bottom: 0;
    margin-right: 6px;
    margin-bottom: 4px;
    line-height: 30px;
    cursor: pointer;
  }

  .input-new-tag {
    width: 200px;
    margin-right: 6px;
    margin-bottom: 4px;
    vertical-align: bottom;
  }
}

.template-info {
  margin-bottom: 8px;
}

.template-variables {
  margin-bottom: 8px;
}

.template-vars-card {
  background-color: #f9f9f9;
  border: 1px solid #ebeef5;

  :deep(.el-card__body) {
    padding: 15px;
  }
}

.vars-form {
  :deep(.el-form-item__label) {
    padding-bottom: 4px;
    font-size: 13px;
    font-weight: 500;
    color: #606266;
  }

  :deep(.el-form-item) {
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.attachment-list {
  .attachment-item {
    display: flex;
    align-items: center;
    padding: 8px;
    margin-bottom: 8px;
    background-color: #f8f8f8;
    border: 1px dashed #d9d9d9;
    border-radius: 4px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
