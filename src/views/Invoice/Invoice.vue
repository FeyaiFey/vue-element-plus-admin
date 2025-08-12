<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getInvoicesApi,
  deleteInvoiceApi,
  voidInvoiceApi,
  activateInvoiceApi,
  confirmAndSaveInvoicesApi,
  searchInvoicesApi
} from '@/api/invoice'
import type {
  InvoiceSearchRequest,
  InvoiceExtractResponse,
  InvoiceBatchConfirmRequest
} from '@/api/invoice/type'
import InvoiceTable from './components/InvoiceTable.vue'
import InvoiceForm from './components/InvoiceForm.vue'
import InvoiceUpload from './components/InvoiceUpload.vue'
import ResizeDialog from '@/components/Dialog/src/ResizeDialog.vue'

defineOptions({
  name: 'Invoice'
})

// 查询表单
const queryForm = reactive<InvoiceSearchRequest>({
  invoice_number: '',
  buyer_name: '',
  seller_name: '',
  issue_date_start: '',
  issue_date_end: '',
  amount_min: undefined,
  amount_max: undefined
})

// 日期范围
const dateRange = ref<[string, string] | undefined>(undefined)

// 监听日期范围变化
watch(dateRange, (newVal) => {
  if (newVal) {
    queryForm.issue_date_start = newVal[0]
    queryForm.issue_date_end = newVal[1]
  } else {
    queryForm.issue_date_start = ''
    queryForm.issue_date_end = ''
  }
})

// 发票列表数据
const invoiceList = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(50)

// 获取表格组件实例
const invoiceTableRef = ref()

// 新建/编辑发票对话框
const dialogVisible = ref(false)
const dialogTitle = ref('新建发票')
const dialogType = ref<'create' | 'edit' | 'view'>('create')
const currentInvoice = ref<any>(null)

// 上传对话框
const uploadDialogVisible = ref(false)
const uploadData = ref<InvoiceExtractResponse | null>(null)

// 获取发票列表
const getInvoiceList = async () => {
  try {
    loading.value = true
    const params = {
      skip: (currentPage.value - 1) * pageSize.value,
      limit: pageSize.value
    }
    const res = await getInvoicesApi(params)
    invoiceList.value = res.data || []
    total.value = res.data?.length || 0
  } catch (error) {
    console.error('获取发票列表失败:', error)
    ElMessage.error('获取发票列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索发票
const handleSearch = async (
  searchParams?: InvoiceSearchRequest,
  searchDateRange?: [string, string] | undefined
) => {
  try {
    loading.value = true

    // 使用传入的参数或当前的queryForm
    const finalSearchParams = searchParams || queryForm

    // 如果有传入的日期范围，更新本地日期范围
    if (searchDateRange) {
      dateRange.value = searchDateRange
    }

    // 过滤掉空值，构建最终的搜索参数
    const apiParams: InvoiceSearchRequest = {}

    if (finalSearchParams.invoice_number?.trim()) {
      apiParams.invoice_number = finalSearchParams.invoice_number.trim()
    }
    if (finalSearchParams.buyer_name?.trim()) {
      apiParams.buyer_name = finalSearchParams.buyer_name.trim()
    }
    if (finalSearchParams.seller_name?.trim()) {
      apiParams.seller_name = finalSearchParams.seller_name.trim()
    }
    if (finalSearchParams.issue_date_start) {
      apiParams.issue_date_start = finalSearchParams.issue_date_start
    }
    if (finalSearchParams.issue_date_end) {
      apiParams.issue_date_end = finalSearchParams.issue_date_end
    }

    // 处理金额字段
    if (finalSearchParams.amount_min !== undefined && finalSearchParams.amount_min !== null) {
      const minAmount = Number(finalSearchParams.amount_min)
      if (!isNaN(minAmount) && minAmount > 0) {
        apiParams.amount_min = minAmount
      }
    }
    if (finalSearchParams.amount_max !== undefined && finalSearchParams.amount_max !== null) {
      const maxAmount = Number(finalSearchParams.amount_max)
      if (!isNaN(maxAmount) && maxAmount > 0) {
        apiParams.amount_max = maxAmount
      }
    }

    const paginationParams = {
      skip: 0,
      limit: pageSize.value
    }

    console.log('搜索参数:', apiParams, '分页参数:', paginationParams)

    const res = await searchInvoicesApi(apiParams, paginationParams)
    invoiceList.value = res.data.invoices || []
    total.value = res.data.total || 0
    currentPage.value = 1

    // 同步数据到表格组件
    if (invoiceTableRef.value) {
      invoiceTableRef.value.updateTableData(res.data.invoices || [], res.data.total || 0, 1)
    }
  } catch (error) {
    console.error('搜索发票失败:', error)
    ElMessage.error('搜索发票失败')
  } finally {
    loading.value = false
  }
}

// 重置搜索
const handleReset = () => {
  // 重置查询表单
  Object.assign(queryForm, {
    invoice_number: '',
    buyer_name: '',
    seller_name: '',
    issue_date_start: '',
    issue_date_end: '',
    amount_min: undefined,
    amount_max: undefined
  })

  // 重置日期范围
  dateRange.value = undefined

  // 直接调用表格组件的重置方法
  if (invoiceTableRef.value) {
    invoiceTableRef.value.resetTable()
  }
}

// 查看发票
const handleView = (row: any) => {
  dialogType.value = 'view'
  dialogTitle.value = '查看发票详情'
  currentInvoice.value = { ...row }
  dialogVisible.value = true
}

// 编辑发票
const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  dialogTitle.value = '编辑发票'
  currentInvoice.value = { ...row }
  dialogVisible.value = true
}

// 作废发票
const handleVoid = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要作废该发票吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await voidInvoiceApi(Number(row.invoice_id))
    ElMessage.success('发票已作废')
    // 刷新表格
    invoiceTableRef.value?.getInvoiceList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('作废发票失败:', error)
      ElMessage.error('作废发票失败')
    }
  }
}

// 激活发票
const handleActivate = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要激活该发票吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await activateInvoiceApi(Number(row.invoice_id))
    ElMessage.success('发票已激活')
    // 刷新表格
    invoiceTableRef.value?.getInvoiceList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('激活发票失败:', error)
      ElMessage.error('激活发票失败')
    }
  }
}

// 删除发票
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该发票吗？删除后将无法恢复', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteInvoiceApi(Number(row.invoice_id))
    ElMessage.success('发票已删除')
    // 刷新表格
    invoiceTableRef.value?.getInvoiceList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除发票失败:', error)
      ElMessage.error('删除发票失败')
    }
  }
}

// 新建发票
const handleCreate = () => {
  dialogType.value = 'create'
  dialogTitle.value = '新建发票'
  currentInvoice.value = null
  dialogVisible.value = true
}

// 上传PDF
const handleUpload = () => {
  uploadDialogVisible.value = true
  uploadData.value = null
}

// 处理发票表单提交
const handleSubmit = async (_: any) => {
  try {
    // 这里根据dialogType处理不同的提交逻辑
    if (dialogType.value === 'create') {
      // 新建发票逻辑
      ElMessage.success('创建发票成功')
    } else if (dialogType.value === 'edit') {
      // 编辑发票逻辑
      ElMessage.success('更新发票成功')
    }
    dialogVisible.value = false
    // 刷新表格
    invoiceTableRef.value?.getInvoiceList()
  } catch (error) {
    console.error('提交发票失败:', error)
    ElMessage.error('提交发票失败')
  }
}

// 处理上传确认
const handleUploadConfirm = async (confirmedData: any, files: File[]) => {
  try {
    const request: InvoiceBatchConfirmRequest = {
      invoices: confirmedData,
      folder_id: 17
    }
    await confirmAndSaveInvoicesApi(request, files)
    ElMessage.success('发票保存成功')
    uploadDialogVisible.value = false
    // 刷新表格
    invoiceTableRef.value?.getInvoiceList()
  } catch (error) {
    console.error('保存发票失败:', error)
    ElMessage.error('保存发票失败')
  }
}

onMounted(async () => {
  await getInvoiceList()
  // 初始化完成后，同步数据到表格组件
  if (invoiceTableRef.value) {
    invoiceTableRef.value.updateTableData(invoiceList.value, total.value, currentPage.value)
  }
})
</script>

<template>
  <InvoiceTable
    ref="invoiceTableRef"
    :show-query-form="true"
    :show-create-button="true"
    :show-upload-button="true"
    :show-operations="true"
    :query-form="queryForm"
    :date-range="dateRange"
    @search="handleSearch"
    @reset="handleReset"
    @view="handleView"
    @edit="handleEdit"
    @create="handleCreate"
    @upload="handleUpload"
    @void="handleVoid"
    @activate="handleActivate"
    @delete="handleDelete"
    @update:dateRange="dateRange = $event"
  />

  <!-- 发票表单对话框 -->
  <ResizeDialog
    v-model="dialogVisible"
    :title="dialogTitle"
    :fullscreen="true"
    :initWidth="1000"
    :initHeight="600"
    @close="dialogVisible = false"
  >
    <InvoiceForm
      v-if="dialogVisible"
      :edit-mode="dialogType === 'view'"
      :initial-data="currentInvoice"
      :form-type="dialogType"
      @close="dialogVisible = false"
      @submit="handleSubmit"
    />
  </ResizeDialog>

  <!-- 上传PDF对话框 -->
  <ResizeDialog
    v-model="uploadDialogVisible"
    title="上传发票PDF"
    :fullscreen="true"
    :initWidth="1200"
    :initHeight="700"
    @close="uploadDialogVisible = false"
  >
    <InvoiceUpload
      v-if="uploadDialogVisible"
      @close="uploadDialogVisible = false"
      @confirm="handleUploadConfirm"
    />
  </ResizeDialog>
</template>

<style lang="less" scoped>
.search-form {
  padding: 20px;
  margin-bottom: 20px;
  background-color: var(--el-bg-color);
  border-radius: 4px;

  :deep(.el-row) {
    margin-bottom: 0;
  }

  .search-buttons {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-top: 16px;

    .el-button {
      min-width: 120px;
    }
  }
}

.mx-2 {
  margin: 0 8px;
}
</style>
