<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage, ElButton } from 'element-plus'
import { Icon } from '@/components/Icon'
import { sendEmailApi } from '@/api/email'
import type { EmailSendRequest } from '@/api/email/type'
import EmailForm from './components/EmailForm.vue'

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
  customSendEmailApi?: (data: EmailSendRequest) => Promise<any>
}>()

// 邮件表单数据
const emailForm = reactive<{
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
}>({
  to: props.to || [],
  cc: props.cc || [],
  subject: props.subject || '',
  templateId: props.templateId || 1,
  templateVariables: props.templateVariables || {
    user_name: '',
    department: '',
    content: ''
  },
  attachments: []
})

// 监听 props 变化
watch(
  () => props.to,
  (newVal) => {
    emailForm.to = newVal
  },
  { immediate: true }
)

watch(
  () => props.cc,
  (newVal) => {
    emailForm.cc = newVal
  },
  { immediate: true }
)

watch(
  () => props.subject,
  (newVal) => {
    emailForm.subject = newVal
  },
  { immediate: true }
)

watch(
  () => props.templateId,
  (newVal) => {
    emailForm.templateId = newVal
  },
  { immediate: true }
)

watch(
  () => props.templateVariables,
  (newVal) => {
    emailForm.templateVariables = newVal
  },
  { immediate: true, deep: true }
)

// 加载状态
const loading = ref(false)

// 发送邮件
const handleSendEmail = async () => {
  if (emailForm.to.length === 0) {
    ElMessage.warning('请至少添加一个收件人')
    return
  }

  try {
    loading.value = true
    const emailData: EmailSendRequest = {
      to: emailForm.to,
      cc: emailForm.cc.length > 0 ? emailForm.cc : undefined,
      template_id: emailForm.templateId,
      template_vars: emailForm.templateVariables,
      use_template_subject: true,
      attachments: emailForm.attachments
    }

    // 使用自定义的发送邮件 API 或默认的 API
    const sendApi = props.customSendEmailApi || sendEmailApi
    const res = await sendApi(emailData)

    if (res.data?.success) {
      ElMessage.success('邮件发送成功')
      // 发送成功事件
      emit('success', res.data)
    } else {
      ElMessage.error(`邮件发送失败: ${res.data?.error || '未知错误'}`)
      // 发送失败事件
      emit('error', res.data?.error || '未知错误')
    }
  } catch (error) {
    console.error('发送邮件失败:', error)
    ElMessage.error('发送邮件失败: ' + (error instanceof Error ? error.message : String(error)))
    // 发送失败事件
    emit('error', error)
  } finally {
    loading.value = false
  }
}

// 添加附件
const handleAddAttachment = (file: File) => {
  const reader = new FileReader()
  reader.onload = () => {
    if (reader.result) {
      const base64Content = reader.result.toString().split(',')[1]
      emailForm.attachments.push({
        filename: file.name,
        content: base64Content,
        encoding: 'base64',
        content_type: file.type
      })
    }
  }
  reader.readAsDataURL(file)
}

// 移除附件
const handleRemoveAttachment = (index: number) => {
  emailForm.attachments.splice(index, 1)
}

// 定义事件
const emit = defineEmits<{
  (e: 'success', data: any): void
  (e: 'error', error: any): void
  (e: 'update:to', value: string[]): void
  (e: 'update:cc', value: string[]): void
  (e: 'update:subject', value: string): void
  (e: 'update:templateId', value: number): void
  (e: 'update:templateVariables', value: any): void
}>()
</script>

<template>
  <div class="email-page">
    <div class="page-header">
      <h2>发送邮件</h2>
    </div>
    <div class="page-content">
      <EmailForm
        v-model:to="emailForm.to"
        v-model:cc="emailForm.cc"
        v-model:subject="emailForm.subject"
        v-model:templateId="emailForm.templateId"
        v-model:templateVariables="emailForm.templateVariables"
        :attachments="emailForm.attachments"
        @add-attachment="handleAddAttachment"
        @remove-attachment="handleRemoveAttachment"
      />
      <div class="form-actions">
        <ElButton type="primary" @click="handleSendEmail" :loading="loading">
          <Icon icon="vi-ri:send-plane-fill" class="mr-2" />
          发送邮件
        </ElButton>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.email-page {
  padding: 20px;

  .page-header {
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }

  .page-content {
    padding: 20px;
    background-color: var(--el-bg-color);
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }
}
</style>
