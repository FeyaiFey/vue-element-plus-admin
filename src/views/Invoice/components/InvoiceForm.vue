<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import {
  ElMessage,
  ElInput,
  ElSelect,
  ElOption,
  ElDatePicker,
  ElForm,
  ElFormItem,
  ElRow,
  ElCol,
  ElDivider,
  ElButton
} from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { createInvoiceApi, updateInvoiceApi } from '@/api/invoice'
import type { InvoiceCreate, InvoiceUpdate, InvoiceResponse } from '@/api/invoice/type'

interface Props {
  editMode?: boolean
  initialData?: InvoiceResponse | null
  formType?: 'create' | 'edit' | 'view'
}

const props = withDefaults(defineProps<Props>(), {
  editMode: false,
  initialData: null,
  formType: 'create'
})

const emit = defineEmits<{
  close: []
  submit: [data: any]
}>()

// 表单引用
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive<InvoiceCreate>({
  file_name: '',
  invoice_type: '',
  invoice_number: '',
  issue_date: '',
  issuer: '',
  buyer_name: '',
  buyer_tax_number: '',
  seller_name: '',
  seller_tax_number: '',
  total_amount: 0,
  total_tax: 0,
  total_amount_in_words: '',
  total_amount_in_numbers: 0,
  status: 1
})

// 是否只读模式
const isReadonly = computed(() => props.editMode || props.formType === 'view')

// 表单验证规则
const rules: FormRules = {
  file_name: [
    {
      required: true,
      message: '请输入文件名',
      trigger: 'blur'
    }
  ],
  invoice_number: [
    {
      required: true,
      message: '请输入发票号码',
      trigger: 'blur'
    }
  ],
  invoice_type: [
    {
      required: true,
      message: '请选择发票类型',
      trigger: 'change'
    }
  ],
  buyer_name: [
    {
      required: true,
      message: '请输入购买方名称',
      trigger: 'blur'
    }
  ],
  seller_name: [
    {
      required: true,
      message: '请输入销售方名称',
      trigger: 'blur'
    }
  ]
}

// 发票类型选项
const invoiceTypeOptions = [
  { label: '增值税专用发票', value: '增值税专用发票' },
  { label: '增值税普通发票', value: '增值税普通发票' },
  { label: '机动车销售统一发票', value: '机动车销售统一发票' },
  { label: '货物运输业增值税专用发票', value: '货物运输业增值税专用发票' }
]

// 监听初始数据变化
watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      Object.assign(formData, {
        file_name: newData.file_name || '',
        invoice_type: newData.invoice_type || '',
        invoice_number: newData.invoice_number || '',
        issue_date: newData.issue_date || '',
        issuer: newData.issuer || '',
        buyer_name: newData.buyer_name || '',
        buyer_tax_number: newData.buyer_tax_number || '',
        seller_name: newData.seller_name || '',
        seller_tax_number: newData.seller_tax_number || '',
        total_amount: newData.total_amount || 0,
        total_tax: newData.total_tax || 0,
        total_amount_in_words: newData.total_amount_in_words || '',
        total_amount_in_numbers: newData.total_amount_in_numbers || 0
      })
    }
  },
  { immediate: true }
)

// 计算金额相关字段
watch([() => formData.total_amount, () => formData.total_tax], () => {
  if (formData.total_amount && formData.total_tax) {
    formData.total_amount_in_numbers = formData.total_amount + formData.total_tax
  }
})

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    if (props.formType === 'create') {
      await createInvoiceApi(formData)
      ElMessage.success('创建发票成功')
    } else if (props.formType === 'edit' && props.initialData) {
      const updateData: InvoiceUpdate = { ...formData }
      await updateInvoiceApi(props.initialData.invoice_id, updateData)
      ElMessage.success('更新发票成功')
    }

    emit('submit', formData)
  } catch (error) {
    console.error('表单验证失败或提交失败:', error)
  }
}

// 取消
const handleCancel = () => {
  emit('close')
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
}
</script>

<template>
  <div class="invoice-form-container">
    <ElForm
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
      :disabled="isReadonly"
    >
      <ElRow :gutter="20">
        <ElCol :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <ElFormItem label="文件名" prop="file_name">
            <ElInput v-model="formData.file_name" placeholder="请输入文件名" clearable />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <ElFormItem label="发票类型" prop="invoice_type">
            <ElSelect
              v-model="formData.invoice_type"
              placeholder="请选择发票类型"
              style="width: 100%"
              clearable
            >
              <ElOption
                v-for="item in invoiceTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <ElFormItem label="发票号码" prop="invoice_number">
            <ElInput v-model="formData.invoice_number" placeholder="请输入发票号码" clearable />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <ElFormItem label="开票日期" prop="issue_date">
            <ElDatePicker
              v-model="formData.issue_date"
              type="date"
              placeholder="选择开票日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <ElFormItem label="开票人" prop="issuer">
            <ElInput v-model="formData.issuer" placeholder="请输入开票人" clearable />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElDivider content-position="left">购买方信息</ElDivider>

      <ElRow :gutter="20">
        <ElCol :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <ElFormItem label="购买方名称" prop="buyer_name">
            <ElInput v-model="formData.buyer_name" placeholder="请输入购买方名称" clearable />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <ElFormItem label="购买方税号" prop="buyer_tax_number">
            <ElInput v-model="formData.buyer_tax_number" placeholder="请输入购买方税号" clearable />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElDivider content-position="left">销售方信息</ElDivider>

      <ElRow :gutter="20">
        <ElCol :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <ElFormItem label="销售方名称" prop="seller_name">
            <ElInput v-model="formData.seller_name" placeholder="请输入销售方名称" clearable />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <ElFormItem label="销售方税号" prop="seller_tax_number">
            <ElInput
              v-model="formData.seller_tax_number"
              placeholder="请输入销售方税号"
              clearable
            />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElDivider content-position="left">金额信息</ElDivider>

      <ElRow :gutter="20">
        <ElCol :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
          <ElFormItem label="合计金额" prop="total_amount">
            <ElInput v-model="formData.total_amount" placeholder="合计金额" style="width: 100%" />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
          <ElFormItem label="合计税额" prop="total_tax">
            <ElInput v-model="formData.total_tax" placeholder="合计税额" style="width: 100%" />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
          <ElFormItem label="价税合计" prop="total_amount_in_numbers">
            <ElInput
              v-model="formData.total_amount_in_numbers"
              placeholder="价税合计"
              style="width: 100%"
              disabled
            />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :span="24">
          <ElFormItem label="价税合计大写" prop="total_amount_in_words">
            <ElInput
              v-model="formData.total_amount_in_words"
              placeholder="请输入价税合计大写"
              type="textarea"
              :rows="2"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>

    <div class="form-footer">
      <ElButton @click="handleCancel">
        {{ isReadonly ? '关闭' : '取消' }}
      </ElButton>
      <ElButton v-if="!isReadonly" @click="resetForm"> 重置 </ElButton>
      <ElButton v-if="!isReadonly" type="primary" @click="handleSubmit">
        {{ formType === 'create' ? '创建' : '保存' }}
      </ElButton>
    </div>
  </div>
</template>

<style lang="less" scoped>
.invoice-form-container {
  display: flex;
  height: 100%;
  padding: 20px;
  flex-direction: column;

  // 响应式样式
  @media (width <= 768px) {
    padding: 15px;
  }
}

.el-form {
  flex: 1;
  overflow-y: auto;

  // 响应式表单
  @media (width <= 768px) {
    :deep(.el-form-item__label) {
      font-size: 13px;
    }

    :deep(.el-input__inner),
    :deep(.el-select__inner),
    :deep(.el-textarea__inner) {
      font-size: 14px;
    }
  }
}

.form-footer {
  display: flex;
  padding-top: 20px;
  margin-top: 20px;
  border-top: 1px solid var(--el-border-color-light);
  justify-content: center;
  gap: 12px;

  // 响应式按钮
  @media (width <= 768px) {
    flex-direction: column;

    .el-button {
      width: 100%;
      min-width: auto;
    }
  }

  .el-button {
    min-width: 100px;
  }
}

:deep(.el-divider) {
  margin: 20px 0;

  @media (width <= 768px) {
    margin: 15px 0;

    .el-divider__text {
      font-size: 14px;
    }
  }
}
</style>
