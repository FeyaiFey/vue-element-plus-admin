<script setup lang="ts">
import { ref, reactive } from 'vue'
import {
  ElMessage,
  ElMessageBox,
  ElSteps,
  ElStep,
  ElUpload,
  ElButton,
  ElAlert,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElDatePicker,
  ElRow,
  ElCol,
  ElDialog,
  ElTable,
  ElTableColumn
} from 'element-plus'
import type { UploadProps, UploadUserFile, UploadFile } from 'element-plus'
import { extractInvoiceDataApi } from '@/api/invoice'
import type { InvoiceExtractResponse, InvoiceConfirmData } from '@/api/invoice/type'
import { Icon } from '@/components/Icon'

const emit = defineEmits<{
  close: []
  confirm: [data: InvoiceConfirmData[], files: File[]]
}>()

// 上传相关状态
const uploadList = ref<UploadUserFile[]>([])
const uploadLoading = ref(false)
const extractedData = ref<InvoiceExtractResponse | null>(null)
const confirmedData = ref<InvoiceConfirmData[]>([])
const originalFiles = ref<File[]>([])

// 当前步骤：1-上传, 2-确认数据, 3-完成
const currentStep = ref(1)

// 编辑模式
const editingIndex = ref(-1)
const editForm = reactive<InvoiceConfirmData>({
  file_name: '',
  invoice_type: '',
  invoice_number: '',
  issue_date: '',
  issuer: '',
  buyer_name: '',
  buyer_tax_number: '',
  seller_name: '',
  seller_tax_number: '',
  total_amount: '',
  total_tax: '',
  total_amount_in_words: '',
  total_amount_in_numbers: '',
  status: 1
})

// 发票类型选项
const invoiceTypeOptions = [
  { label: '增值税专用发票', value: '增值税专用发票' },
  { label: '增值税普通发票', value: '增值税普通发票' },
  { label: '机动车销售统一发票', value: '机动车销售统一发票' },
  { label: '货物运输业增值税专用发票', value: '货物运输业增值税专用发票' }
]

// 上传前检查
const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.type !== 'application/pdf') {
    ElMessage.error('只能上传PDF格式的文件!')
    return false
  }
  if (rawFile.size / 1024 / 1024 > 10) {
    ElMessage.error('文件大小不能超过10MB!')
    return false
  }
  return true
}

// 文件上传成功
const handleUploadSuccess = () => {
  // 文件上传成功的处理逻辑已经在手动上传中处理
}

// 提取发票数据
const extractInvoiceData = async () => {
  if (uploadList.value.length === 0) {
    ElMessage.warning('请先上传PDF文件')
    return
  }

  try {
    uploadLoading.value = true

    // 转换上传文件为File对象
    const files: File[] = []
    uploadList.value.forEach((item) => {
      if (item.raw) {
        files.push(item.raw)
        originalFiles.value.push(item.raw)
      }
    })

    const res = await extractInvoiceDataApi(files)
    extractedData.value = res.data

    if (res.data.success && res.data.data.length > 0) {
      // 转换提取的数据为确认数据格式
      confirmedData.value = res.data.data.map((item) => ({
        file_name: item.文件名 || '',
        invoice_type: item.发票类型 || '',
        invoice_number: item.发票号码 || '',
        issue_date: item.开票日期 || '',
        issuer: item.开票人 || '',
        buyer_name: item.购买方名称 || '',
        buyer_tax_number: item.购买方税号 || '',
        seller_name: item.销售方名称 || '',
        seller_tax_number: item.销售方税号 || '',
        total_amount: item.合计金额 || '',
        total_tax: item.合计税额 || '',
        total_amount_in_words: item.价税合计大写 || '',
        total_amount_in_numbers: item.价税合计小写 || '',
        status: 1
      }))

      currentStep.value = 2
      ElMessage.success(`成功提取${res.data.data.length}个发票数据`)

      if (res.data.errors.length > 0) {
        ElMessage.warning(`有${res.data.errors.length}个文件提取失败`)
      }
    } else {
      ElMessage.error('发票数据提取失败')
    }
  } catch (error) {
    console.error('提取发票数据失败:', error)
    ElMessage.error('提取发票数据失败')
  } finally {
    uploadLoading.value = false
  }
}

// 编辑发票数据
const handleEdit = (index: number) => {
  editingIndex.value = index
  Object.assign(editForm, confirmedData.value[index])
}

// 保存编辑
const saveEdit = () => {
  if (editingIndex.value >= 0) {
    Object.assign(confirmedData.value[editingIndex.value], editForm)
    editingIndex.value = -1
  }
}

// 取消编辑
const cancelEdit = () => {
  editingIndex.value = -1
  // 重置编辑表单
  Object.assign(editForm, {
    file_name: '',
    invoice_type: '',
    invoice_number: '',
    issue_date: '',
    issuer: '',
    buyer_name: '',
    buyer_tax_number: '',
    seller_name: '',
    seller_tax_number: '',
    total_amount: '',
    total_tax: '',
    total_amount_in_words: '',
    total_amount_in_numbers: '',
    status: 1
  })
}

// 删除发票数据
const handleDeleteInvoice = async (index: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这条发票数据吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    confirmedData.value.splice(index, 1)
    originalFiles.value.splice(index, 1)
    ElMessage.success('删除成功')
  } catch (error) {
    // 用户取消删除
  }
}

// 重新上传
const resetUpload = () => {
  uploadList.value = []
  extractedData.value = null
  confirmedData.value = []
  originalFiles.value = []
  currentStep.value = 1
  editingIndex.value = -1
}

// 确认并保存
const confirmAndSave = async () => {
  if (confirmedData.value.length === 0) {
    ElMessage.warning('没有要保存的发票数据')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要保存${confirmedData.value.length}条发票数据吗？`,
      '确认保存',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )

    emit('confirm', confirmedData.value, originalFiles.value)
  } catch (error) {
    // 用户取消保存
  }
}

// 格式化金额显示
const formatAmount = (amount: string | number) => {
  if (!amount) return '-'
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return isNaN(num) ? amount : `¥${num.toFixed(2)}`
}

// 移除上传文件
const handleRemove = (file: UploadFile) => {
  const index = uploadList.value.findIndex((item) => item.uid === file.uid)
  if (index > -1) {
    uploadList.value.splice(index, 1)
  }
}
</script>

<template>
  <div class="invoice-upload-container">
    <!-- 步骤指示器 -->
    <ElSteps :active="currentStep - 1" align-center class="upload-steps">
      <ElStep title="上传PDF文件" description="选择并上传发票PDF文件" />
      <ElStep title="确认发票数据" description="检查并修改提取的发票信息" />
      <ElStep title="保存发票" description="确认无误后保存到系统" />
    </ElSteps>

    <!-- 第一步：上传文件 -->
    <div v-if="currentStep === 1" class="upload-section">
      <ElUpload
        v-model:file-list="uploadList"
        class="upload-dragger"
        drag
        multiple
        :before-upload="beforeUpload"
        :on-success="handleUploadSuccess"
        :on-remove="handleRemove"
        :auto-upload="false"
        accept=".pdf"
      >
        <div class="upload-content">
          <Icon icon="ep:upload-filled" :size="40" color="#409eff" />
          <div class="el-upload__text"> 将PDF文件拖到此处，或<em>点击上传</em> </div>
          <div class="el-upload__tip"> 只能上传PDF文件，且不超过10MB </div>
        </div>
      </ElUpload>

      <div class="upload-actions">
        <ElButton @click="emit('close')">取消</ElButton>
        <ElButton
          type="primary"
          :loading="uploadLoading"
          :disabled="uploadList.length === 0"
          @click="extractInvoiceData"
        >
          {{ uploadLoading ? '提取中...' : '提取发票数据' }}
        </ElButton>
      </div>
    </div>

    <!-- 第二步：确认数据 -->
    <div v-if="currentStep === 2" class="confirm-section">
      <div class="section-header">
        <h3>提取的发票数据 ({{ confirmedData.length }}条)</h3>
        <div class="header-actions">
          <ElButton @click="resetUpload">重新上传</ElButton>
          <ElButton type="primary" @click="confirmAndSave">
            确认并保存 ({{ confirmedData.length }}条)
          </ElButton>
        </div>
      </div>

      <!-- 错误信息 -->
      <div v-if="extractedData?.errors?.length" class="error-section">
        <ElAlert title="部分文件处理失败" type="warning" show-icon :closable="false">
          <ul>
            <li v-for="(error, index) in extractedData.errors" :key="index">
              {{ error }}
            </li>
          </ul>
        </ElAlert>
      </div>

      <!-- 发票数据列表 -->
      <div class="flex-1 rounded-lg overflow-hidden">
        <ElTable
          :data="confirmedData"
          border
          stripe
          size="small"
          max-height="500"
          style="width: 100%"
        >
          <ElTableColumn
            prop="invoice_type"
            label="发票类型"
            width="140"
            header-align="center"
            show-overflow-tooltip
            align="center"
          >
            <template #default="{ row }">
              {{ row.invoice_type || '-' }}
            </template>
          </ElTableColumn>

          <ElTableColumn
            prop="invoice_number"
            label="发票号码"
            width="160"
            header-align="center"
            align="center"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              {{ row.invoice_number || '-' }}
            </template>
          </ElTableColumn>

          <ElTableColumn
            prop="issue_date"
            label="开票日期"
            width="110"
            header-align="center"
            align="center"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              {{ row.issue_date || '-' }}
            </template>
          </ElTableColumn>

          <ElTableColumn
            prop="seller_name"
            label="销售方"
            width="180"
            header-align="center"
            align="center"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              {{ row.seller_name || '-' }}
            </template>
          </ElTableColumn>

          <ElTableColumn
            prop="total_amount"
            label="金额"
            width="120"
            header-align="center"
            align="right"
          >
            <template #default="{ row }">
              {{ row.total_amount ? formatAmount(row.total_amount) : '-' }}
            </template>
          </ElTableColumn>

          <ElTableColumn
            prop="total_tax"
            label="税额"
            width="100"
            header-align="center"
            align="right"
          >
            <template #default="{ row }">
              {{ row.total_tax ? formatAmount(row.total_tax) : '-' }}
            </template>
          </ElTableColumn>

          <ElTableColumn
            prop="total_amount_in_numbers"
            label="价税合计"
            width="100"
            header-align="center"
            align="right"
          >
            <template #default="{ row }">
              {{ row.total_amount_in_numbers ? formatAmount(row.total_amount_in_numbers) : '-' }}
            </template>
          </ElTableColumn>

          <ElTableColumn
            prop="issuer"
            label="开票人"
            width="100"
            header-align="center"
            align="center"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              {{ row.issuer || '-' }}
            </template>
          </ElTableColumn>

          <ElTableColumn
            label="操作"
            width="120"
            fixed="right"
            header-align="center"
            align="center"
          >
            <template #default="{ $index }">
              <div class="flex justify-center items-center gap-2 whitespace-nowrap">
                <ElButton type="primary" size="small" @click="handleEdit($index)"> 编辑 </ElButton>
                <ElButton type="danger" size="small" @click="handleDeleteInvoice($index)">
                  删除
                </ElButton>
              </div>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
    </div>

    <!-- 编辑对话框 -->
    <ElDialog
      :model-value="editingIndex >= 0"
      title="编辑发票信息"
      width="80%"
      :close-on-click-modal="false"
      @close="cancelEdit"
    >
      <ElForm :model="editForm" label-width="120px">
        <ElRow :gutter="20">
          <ElCol :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <ElFormItem label="文件名">
              <ElInput v-model="editForm.file_name" />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <ElFormItem label="发票类型">
              <ElSelect v-model="editForm.invoice_type" style="width: 100%">
                <ElOption
                  v-for="option in invoiceTypeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
        </ElRow>

        <ElRow :gutter="20">
          <ElCol :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <ElFormItem label="发票号码">
              <ElInput v-model="editForm.invoice_number" />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <ElFormItem label="开票日期">
              <ElDatePicker
                v-model="editForm.issue_date"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </ElFormItem>
          </ElCol>
        </ElRow>

        <ElRow :gutter="20">
          <ElCol :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <ElFormItem label="开票人">
              <ElInput v-model="editForm.issuer" />
            </ElFormItem>
          </ElCol>
        </ElRow>

        <ElRow :gutter="20">
          <ElCol :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <ElFormItem label="购买方名称">
              <ElInput v-model="editForm.buyer_name" />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <ElFormItem label="购买方税号">
              <ElInput v-model="editForm.buyer_tax_number" />
            </ElFormItem>
          </ElCol>
        </ElRow>

        <ElRow :gutter="20">
          <ElCol :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <ElFormItem label="销售方名称">
              <ElInput v-model="editForm.seller_name" />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
            <ElFormItem label="销售方税号">
              <ElInput v-model="editForm.seller_tax_number" />
            </ElFormItem>
          </ElCol>
        </ElRow>

        <ElRow :gutter="20">
          <ElCol :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
            <ElFormItem label="合计金额">
              <ElInput v-model="editForm.total_amount" />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
            <ElFormItem label="合计税额">
              <ElInput v-model="editForm.total_tax" />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
            <ElFormItem label="价税合计">
              <ElInput v-model="editForm.total_amount_in_numbers" />
            </ElFormItem>
          </ElCol>
        </ElRow>

        <ElRow>
          <ElCol :span="24">
            <ElFormItem label="价税合计大写">
              <ElInput v-model="editForm.total_amount_in_words" type="textarea" :rows="2" />
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElForm>

      <template #footer>
        <ElButton @click="cancelEdit">取消</ElButton>
        <ElButton type="primary" @click="saveEdit">保存</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style lang="less" scoped>
.invoice-upload-container {
  display: flex;
  height: 100%;
  padding: 20px;
  flex-direction: column;

  // 响应式样式
  @media (width <= 768px) {
    padding: 15px;
  }
}

.upload-steps {
  margin-bottom: 30px;

  @media (width <= 768px) {
    margin-bottom: 20px;

    :deep(.el-step__title) {
      font-size: 12px;
    }

    :deep(.el-step__description) {
      font-size: 11px;
    }
  }
}

.upload-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .upload-dragger {
    width: 100%;
    max-width: 600px;

    @media (width <= 768px) {
      max-width: 100%;
    }
  }

  .upload-content {
    padding: 40px;
    text-align: center;

    @media (width <= 768px) {
      padding: 20px;
    }
  }

  .upload-actions {
    display: flex;
    margin-top: 20px;
    gap: 12px;

    @media (width <= 768px) {
      flex-direction: column;
      width: 100%;
      max-width: 300px;

      .el-button {
        width: 100%;
      }
    }
  }
}

.confirm-section {
  flex: 1;
  display: flex;
  flex-direction: column;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    @media (width <= 768px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }

    h3 {
      margin: 0;
      color: var(--el-text-color-primary);

      @media (width <= 768px) {
        font-size: 16px;
      }
    }

    .header-actions {
      display: flex;
      gap: 12px;

      @media (width <= 768px) {
        width: 100%;
        flex-direction: column;

        .el-button {
          width: 100%;
        }
      }
    }
  }

  .error-section {
    margin-bottom: 20px;

    ul {
      padding-left: 20px;
      margin: 8px 0 0;

      li {
        margin-bottom: 4px;
      }
    }
  }
}

.mr-1 {
  margin-right: 4px;
}

:deep(.el-upload-dragger) {
  width: 100%;
}

:deep(.el-table) {
  font-size: 12px;

  @media (width <= 768px) {
    font-size: 11px;
  }
}

// 编辑对话框响应式
:deep(.el-dialog) {
  @media (width <= 768px) {
    width: 95% !important;
    margin: 5vh auto !important;

    .el-dialog__body {
      padding: 15px;
    }
  }
}
</style>
