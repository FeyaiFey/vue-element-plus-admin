<script setup lang="tsx">
import { ref, onMounted, computed } from 'vue'
import {
  ElTable,
  ElTableColumn,
  ElRow,
  ElCol,
  ElInput,
  ElSelect,
  ElOption,
  ElSkeleton,
  ElButton,
  ElNotification,
  ElMessage,
  ElMessageBox
} from 'element-plus'
import { getSopAnalyzeApi, exportSopReportApi } from '@/api/report'
import {
  getAssyRequireOrdersApi,
  submitAssyRequireOrdersApi,
  deleteAssyRequireOrderApi,
  exportAssyRequireOrdersApi
} from '@/api/assy'
import { emailAssyRequireOrderApi } from '@/api/email'
import type { SopAnalyzeResponse } from '@/api/report/type'
import { Icon } from '@/components/Icon'
import { AxiosResponse } from 'axios'
import AssyOrderTable from '@/views/Assy/Order/components/AssyOrderTable.vue'
import AssyOrderForm from '@/views/Assy/Order/components/AssyOrderForm.vue'
import ResizeDialog from '@/components/Dialog/src/ResizeDialog.vue'
import Email from '@/views/Email/Email.vue'
import { useUserStore } from '@/store/modules/user'

const sopAnalyzeData = ref<SopAnalyzeResponse[]>([])
const loading = ref(false)

// 添加筛选状态
const filters = ref<Record<string, string>>({
  itemName: '',
  abtr: '',
  safeStock: '',
  lastMonthSale: '',
  cpQty: '',
  bcQty: '',
  wipQty: '',
  assyStock: '',
  totalStock: '',
  inventoryGap: '',
  inventoryGapTotal: ''
})

// ABTR选项
const abtrOptions = [
  { label: '全部', value: '' },
  { label: '管装', value: '管装' },
  { label: '编带', value: '编带' }
]

// 列配置
const columns = ref([
  { prop: 'ID', label: 'ID', width: 80, align: 'center', isNumber: false, filterKey: 'id' },
  {
    prop: 'ITEM_NAME',
    label: '品名',
    width: 200,
    align: 'right',
    isNumber: false,
    filterKey: 'itemName'
  },
  {
    prop: 'ABTR',
    label: '管装/编带',
    width: 120,
    align: 'center',
    isNumber: false,
    filterKey: 'abtr'
  },
  {
    prop: 'SAFE_STOCK',
    label: '安全库存值',
    width: 120,
    align: 'right',
    isNumber: true,
    filterKey: 'safeStock',
    sortable: true
  },
  {
    prop: 'LAST_MONTH_SALE',
    label: '上月销售量',
    width: 120,
    align: 'right',
    isNumber: true,
    filterKey: 'lastMonthSale',
    sortable: true
  },
  {
    prop: 'CP_QTY',
    label: '产成品库存',
    width: 120,
    align: 'right',
    isNumber: true,
    filterKey: 'cpQty',
    sortable: true
  },
  {
    prop: 'BC_QTY',
    label: '半成品库存',
    width: 120,
    align: 'right',
    isNumber: true,
    filterKey: 'bcQty',
    sortable: true
  },
  {
    prop: 'WIP_QTY_WITHOUT_STOCK',
    label: '封装数量',
    width: 120,
    align: 'right',
    isNumber: true,
    filterKey: 'wipQty',
    sortable: true
  },
  {
    prop: 'ASSY_STOCK',
    label: '封装厂库存',
    width: 120,
    align: 'right',
    isNumber: true,
    filterKey: 'assyStock',
    sortable: true
  },
  {
    prop: 'TOTAL_STOCK',
    label: '总库存',
    width: 120,
    align: 'right',
    isNumber: true,
    filterKey: 'totalStock',
    sortable: true
  },
  {
    prop: 'INVENTORY_GAP',
    label: '库存缺口',
    width: 130,
    align: 'right',
    isNumber: true,
    filterKey: 'inventoryGap',
    sortable: true
  },
  {
    prop: 'INVENTORY_GAP_TOTAL',
    label: '总库存缺口',
    width: 130,
    align: 'right',
    isNumber: true,
    filterKey: 'inventoryGapTotal',
    sortable: true
  }
])

// 数字格式化函数
const formatNumber = (value: number | string) => {
  if (value === null || value === undefined) return ''
  const num = Number(value)
  if (isNaN(num)) return value
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })
}

// 解析数字过滤表达式
const parseNumberFilter = (expression: string) => {
  if (!expression) return { operator: '', value: null }

  expression = expression.trim()

  // 处理特殊字符
  const operatorMap: { [key: string]: string } = {
    '>=': '>=',
    '<=': '<=',
    '>': '>',
    '<': '<',
    '=': '='
  }

  let operator = '='
  let value = expression

  // 检查是否以操作符开头
  for (const op of Object.keys(operatorMap)) {
    if (expression.startsWith(op)) {
      operator = op
      value = expression.slice(op.length).trim()
      break
    }
  }

  // 如果没有操作符但是是纯数字，默认使用等于
  if (operator === '=' && !isNaN(Number(value))) {
    return { operator, value: Number(value) }
  }

  // 尝试转换为数字
  const numValue = Number(value)
  if (isNaN(numValue)) {
    return { operator: '', value: null }
  }

  return { operator, value: numValue }
}

// 评估数字过滤条件
const evaluateNumberFilter = (
  value: number,
  filter: { operator: string; value: number | null }
) => {
  if (!filter.operator || filter.value === null) return true

  const targetValue = Number(value)
  if (isNaN(targetValue)) return false

  switch (filter.operator) {
    case '>':
      return targetValue > filter.value
    case '>=':
      return targetValue >= filter.value
    case '<':
      return targetValue < filter.value
    case '<=':
      return targetValue <= filter.value
    case '=':
      return targetValue === filter.value
    default:
      return true
  }
}

// 过滤后的数据
const filteredData = computed(() => {
  return sopAnalyzeData.value.filter((row) => {
    // 品名过滤
    if (
      filters.value.itemName &&
      !String(row.ITEM_NAME).toLowerCase().includes(filters.value.itemName.toLowerCase())
    ) {
      return false
    }

    // ABTR过滤
    if (filters.value.abtr && row.ABTR !== filters.value.abtr) {
      return false
    }

    // 安全库存值过滤
    if (filters.value.safeStock) {
      const filter = parseNumberFilter(filters.value.safeStock)
      if (!evaluateNumberFilter(Number(row.SAFE_STOCK), filter)) {
        return false
      }
    }

    // 上月销售量过滤
    if (filters.value.lastMonthSale) {
      const filter = parseNumberFilter(filters.value.lastMonthSale)
      if (!evaluateNumberFilter(Number(row.LAST_MONTH_SALE), filter)) {
        return false
      }
    }

    // 产成品库存过滤
    if (filters.value.cpQty) {
      const filter = parseNumberFilter(filters.value.cpQty)
      if (!evaluateNumberFilter(Number(row.CP_QTY), filter)) {
        return false
      }
    }

    // 半成品库存过滤
    if (filters.value.bcQty) {
      const filter = parseNumberFilter(filters.value.bcQty)
      if (!evaluateNumberFilter(Number(row.BC_QTY), filter)) {
        return false
      }
    }

    // 封装数量过滤
    if (filters.value.wipQty) {
      const filter = parseNumberFilter(filters.value.wipQty)
      if (!evaluateNumberFilter(Number(row.WIP_QTY_WITHOUT_STOCK), filter)) {
        return false
      }
    }

    // 封装厂库存过滤
    if (filters.value.assyStock) {
      const filter = parseNumberFilter(filters.value.assyStock)
      if (!evaluateNumberFilter(Number(row.ASSY_STOCK), filter)) {
        return false
      }
    }

    // 总库存过滤
    if (filters.value.totalStock) {
      const filter = parseNumberFilter(filters.value.totalStock)
      if (!evaluateNumberFilter(Number(row.TOTAL_STOCK), filter)) {
        return false
      }
    }

    // 库存缺口过滤
    if (filters.value.inventoryGap) {
      const filter = parseNumberFilter(filters.value.inventoryGap)
      if (!evaluateNumberFilter(Number(row.INVENTORY_GAP), filter)) {
        return false
      }
    }

    // 库存缺口过滤
    if (filters.value.inventoryGapTotal) {
      const filter = parseNumberFilter(filters.value.inventoryGapTotal)
      if (!evaluateNumberFilter(Number(row.INVENTORY_GAP_TOTAL), filter)) {
        return false
      }
    }

    return true
  })
})

// 获取筛选键
const getFilterKey = (prop: string) => {
  switch (prop) {
    case 'ITEM_NAME':
      return 'itemName'
    case 'ABTR':
      return 'abtr'
    case 'SAFE_STOCK':
      return 'safeStock'
    case 'LAST_MONTH_SALE':
      return 'lastMonthSale'
    case 'CP_QTY':
      return 'cpQty'
    case 'BC_QTY':
      return 'bcQty'
    case 'WIP_QTY_WITHOUT_STOCK':
      return 'wipQty'
    case 'ASSY_STOCK':
      return 'assyStock'
    case 'TOTAL_STOCK':
      return 'totalStock'
    case 'INVENTORY_GAP':
      return 'inventoryGap'
    case 'INVENTORY_GAP_TOTAL':
      return 'inventoryGapTotal'
    default:
      return prop.toLowerCase()
  }
}

// 获取报表数据
const getReportData = async () => {
  try {
    loading.value = true
    const res = await getSopAnalyzeApi()
    sopAnalyzeData.value = Array.isArray(res.data) ? res.data : [res.data]
  } catch (error) {
    console.error('获取报表数据失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getReportData()
})

const handleSelectionChange = (val: SopAnalyzeResponse[]) => {
  console.log(
    '选中的行:',
    val.map((item) => item.ITEM_NAME)
  )
}

// 待处理封装单列表
const pendingOrders = ref<any[]>([])
const pendingOrdersLoading = ref(false)
const orderTableRef = ref()

// 创建封装单相关
const createDialogVisible = ref(false)
const currentRow = ref<any>(null)

// 获取待处理封装单
const getPendingOrders = async () => {
  try {
    pendingOrdersLoading.value = true
    const res = await getAssyRequireOrdersApi({ status: '0' })
    pendingOrders.value = res.data.list || []
  } catch (error) {
    console.error('获取待处理封装单失败:', error)
    ElMessage.error('获取待处理封装单失败')
  } finally {
    pendingOrdersLoading.value = false
  }
}

// 处理创建封装单
const handleCreatePackage = (row: any) => {
  // 设置默认值
  currentRow.value = {
    ...row,
    ITEM_NAME: row.ITEM_NAME,
    ITEM_CODE: `BC-${row.ITEM_NAME.replace(/_/g, '-')}-AB`,
    REQUIREMENT_TYPE: '安全库存',
    SALES: '方美容'
  }
  createDialogVisible.value = true
}

// 处理提交
const handleSubmit = async (data: any) => {
  try {
    // 设置状态为待处理
    data.orders[0].status = '0'
    await submitAssyRequireOrdersApi(data)
    ElMessage.success('创建成功')
    createDialogVisible.value = false

    // 刷新表格
    await orderTableRef.value?.getOrderList()

    // 如果待处理订单列表为空，则重新获取
    if (pendingOrders.value.length === 0) {
      await getPendingOrders()
    }
  } catch (error) {
    console.error('创建失败:', error)
    ElMessage.error('创建失败')
  }
}

// 处理删除
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该订单吗？删除后将无法恢复', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteAssyRequireOrderApi({ id: row.ASSY_REQUIREMENTS_ID })
    ElMessage.success('订单已删除')
    // 刷新表格
    orderTableRef.value?.getOrderList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除订单失败:', error)
      ElMessage.error('删除订单失败')
    }
  }
}

// 导出SOP报表
const handleSopExport = async () => {
  try {
    const loadingMessage = ElMessage({
      type: 'info',
      message: '正在导出数据...',
      duration: 0
    })

    const res = (await exportSopReportApi()) as unknown as AxiosResponse<Blob>

    // 创建 Blob 对象
    const blob = new Blob([res.data], { type: 'application/vnd.ms-excel' })
    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url

    // 从响应头中获取文件名
    const contentDisposition = res.headers['content-disposition']
    let filename = `SOP报表_${new Date().getTime()}.xlsx`
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename\*=UTF-8''(.+)/)
      if (filenameMatch && filenameMatch[1]) {
        filename = decodeURIComponent(filenameMatch[1])
      }
    }

    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    loadingMessage.close()
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请重试')
  }
}

onMounted(() => {
  getReportData()
  getPendingOrders()
})

// 获取库存缺口等级
const getInventoryGapLevel = (value: number) => {
  if (value <= -500000) return 'critical'
  if (value <= -300000) return 'severe'
  if (value <= -100000) return 'warning'
  if (value < 0) return 'notice'
  return 'normal'
}

// 导出封装单
const handleExport = async () => {
  try {
    const loadingMessage = ElMessage({
      type: 'info',
      message: '正在导出数据...',
      duration: 0
    })

    const res = (await exportAssyRequireOrdersApi()) as unknown as AxiosResponse<Blob>

    // 创建 Blob 对象
    const blob = new Blob([res.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url

    // 从响应头中获取文件名
    const contentDisposition = res.headers['content-disposition']
    let filename = `封装需求表_${new Date().getTime()}.xlsx`
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename\*=UTF-8''(.+)/)
      if (filenameMatch && filenameMatch[1]) {
        filename = decodeURIComponent(filenameMatch[1])
      }
    }

    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    loadingMessage.close()
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请重试')
  }
}

// 导出并发送邮件相关
const userStore = useUserStore()
const userInfo = userStore.getUserInfo
const emailDialogVisible = ref(false)
const emailFormData = ref({
  to: ['1206354516@qq.com'],
  cc: [] as string[],
  subject: `封装需求表 ${new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\//g, '-')}`,
  templateId: 1,
  templateVariables: {
    user_name: userInfo?.username || '',
    department: userInfo?.department_name || '',
    content: `请查收封装需求表，请及时查看。`
  }
})

// 导出并发送邮件
const handleExportAndSendEmail = async () => {
  try {
    // 打开邮件发送对话框
    emailDialogVisible.value = true
  } catch (error) {
    console.error('打开邮件对话框失败:', error)
    ElMessage.error('打开邮件对话框失败，请重试')
  }
}

// 处理邮件发送成功
const handleEmailSuccess = async (data: any) => {
  console.log('邮件发送成功:', data)
  emailDialogVisible.value = false

  // 刷新表格数据
  await orderTableRef.value?.getOrderList()

  // 如果待处理订单列表为空，则重新获取
  if (pendingOrders.value.length === 0) {
    await getPendingOrders()
  }
}

// 处理邮件发送失败
const handleEmailError = (error: any) => {
  console.error('邮件发送失败:', error)
}

ElNotification.warning({
  title: '注意',
  message:
    '对只设了编带安全库存的产品请注意该产品管装产品库存和封装数量(管装和编带都设有安全库存的产品除外)!!',
  position: 'top-right',
  duration: 30000
})
</script>

<template>
  <ElRow>
    <ElCol :span="24" class="flex justify-center items-center text-center">
      <span class="w-full text-3xl font-bold">产销协调报表(SOP Report)</span>
    </ElCol>
  </ElRow>
  <ElRow class="mt-6">
    <ElCol :span="24" class="flex justify-end mb-4">
      <ElButton type="primary" @click="getReportData">
        <Icon icon="vi-icon-park-outline:refresh" class="mr-2" />
        刷新数据
      </ElButton>
      <ElButton type="success" class="ml-2" @click="handleSopExport">
        <Icon icon="vi-vscode-icons:file-type-excel" class="mr-2" />
        导出Excel
      </ElButton>
    </ElCol>
  </ElRow>

  <ElRow class="mt-2">
    <ElCol :span="24">
      <ElSkeleton v-if="loading" :rows="50" animated />
      <div v-else>
        <!-- 筛选行 -->
        <div class="filter-row">
          <div class="filter-cell" style="width: 50px"></div>
          <template v-for="col in columns" :key="col.prop">
            <div class="filter-cell" :style="{ width: col.width + 'px' }">
              <template v-if="col.prop === 'ABTR'">
                <ElSelect v-model="filters.abtr" size="small" class="filter-select" clearable>
                  <ElOption
                    v-for="option in abtrOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </ElSelect>
              </template>
              <ElInput
                v-else
                v-model="filters[getFilterKey(col.prop)]"
                :placeholder="col.isNumber ? '例如: >=100' : '筛选'"
                size="small"
                class="filter-input"
                clearable
              />
            </div>
          </template>
        </div>
        <!-- 数据表格 -->
        <ElTable
          :data="filteredData"
          height="calc(100vh - 300px)"
          style="width: 100%"
          border
          @selection-change="handleSelectionChange"
        >
          <ElTableColumn type="selection" width="50" header-align="center" align="center" />
          <ElTableColumn
            v-for="col in columns"
            :key="col.prop"
            :prop="col.prop"
            :label="col.label"
            :width="col.width"
            :align="col.align"
            :sortable="col.sortable"
            header-align="center"
          >
            <template #header>
              <div class="header-title">{{ col.label }}</div>
            </template>
            <template #default="{ row }">
              <template v-if="col.prop === 'INVENTORY_GAP' || col.prop === 'INVENTORY_GAP_TOTAL'">
                <span
                  :class="['inventory-gap', `level-${getInventoryGapLevel(Number(row[col.prop]))}`]"
                >
                  {{ formatNumber(row[col.prop]) }}
                </span>
              </template>
              <template v-else>
                <span v-if="col.isNumber">{{ formatNumber(row[col.prop]) }}</span>
                <span v-else>{{ row[col.prop] }}</span>
              </template>
            </template>
          </ElTableColumn>
          <!-- 操作列 -->
          <ElTableColumn label="操作" align="center" header-align="center">
            <template #default="{ row }">
              <ElButton type="primary" size="small" @click="handleCreatePackage(row)">
                <Icon icon="vi-ri:add-line" class="mr-1" />
                创建封装单
              </ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
    </ElCol>
  </ElRow>

  <!-- 待处理封装单列表 -->
  <ElRow v-if="pendingOrders.length > 0" class="mt-1">
    <ElCol :span="24">
      <div class="pending-orders-container">
        <div class="pending-orders-title">
          <div class="title-content">
            <h3>待处理封装单</h3>
            <div class="button-group">
              <ElButton type="success" @click="handleExport">
                <Icon icon="vi-vscode-icons:file-type-excel" class="mr-2" />
                导出Excel
              </ElButton>
              <ElButton type="primary" class="ml-2" @click="handleExportAndSendEmail">
                <Icon icon="vi-ri:mail-send-line" class="mr-2" />
                发送邮件
              </ElButton>
            </div>
          </div>
        </div>
        <AssyOrderTable
          ref="orderTableRef"
          :show-query-form="false"
          :show-create-button="false"
          :show-operations="true"
          :status="'0'"
          v-loading="pendingOrdersLoading"
          @delete="handleDelete"
        />
      </div>
    </ElCol>
  </ElRow>

  <!-- 创建封装单对话框 -->
  <ResizeDialog
    v-model="createDialogVisible"
    title="创建封装单"
    :initWidth="1000"
    :initHeight="600"
    :fullscreen="true"
    destroy-on-close
  >
    <AssyOrderForm
      v-if="createDialogVisible"
      :initial-data="currentRow"
      @close="createDialogVisible = false"
      @submit="handleSubmit"
    />
  </ResizeDialog>

  <!-- 邮件发送对话框 -->
  <ResizeDialog
    v-model="emailDialogVisible"
    title="发送邮件"
    :initWidth="800"
    :initHeight="600"
    destroy-on-close
  >
    <Email
      v-if="emailDialogVisible"
      :to="emailFormData.to"
      :cc="emailFormData.cc"
      :subject="emailFormData.subject"
      :templateId="emailFormData.templateId"
      :templateVariables="emailFormData.templateVariables"
      :customSendEmailApi="emailAssyRequireOrderApi"
      @success="handleEmailSuccess"
      @error="handleEmailError"
      @update:to="(val) => (emailFormData.to = val)"
      @update:cc="(val) => (emailFormData.cc = val)"
      @update:subject="(val) => (emailFormData.subject = val)"
      @update:templateId="(val) => (emailFormData.templateId = val)"
      @update:templateVariables="(val) => (emailFormData.templateVariables = val)"
    />
  </ResizeDialog>
</template>
<style lang="less" scoped>
.header-title {
  display: inline;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.filter-row {
  display: flex;
  border: 1px solid var(--el-border-color-lighter);
}

.filter-cell {
  padding: 4px;
  text-align: center;
  border-right: 1px solid var(--el-border-color-lighter);

  &:last-child {
    border-right: none;
  }
}

.filter-input,
.filter-select {
  width: 100%;

  :deep(.el-input__inner) {
    height: 24px;
    padding: 0 8px;
    font-size: 12px;
    line-height: 24px;
  }
}

:deep(.el-table) {
  .el-button--small {
    padding: 4px 8px;
    font-size: 12px;
  }
}

.inventory-gap {
  display: inline-block;
  padding: 2px 8px;
  font-weight: 600;
  border-radius: 4px;

  &.level-critical {
    color: #fff;
    background-color: #f56c6c;
    animation: blink-critical 0.8s infinite;
  }

  &.level-severe {
    color: #fff;
    background-color: #e6a23c;
    animation: blink-severe 1.2s infinite;
  }

  &.level-warning {
    color: #fff;
    background-color: #f0c000;
    animation: blink-warning 1.6s infinite;
  }

  &.level-notice {
    color: #fff;
    background-color: #409eff;
    animation: blink-notice 2s infinite;
  }

  &.level-normal {
    color: #67c23a;
  }
}

@keyframes blink-critical {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.3;
  }
}

@keyframes blink-severe {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }
}

@keyframes blink-warning {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

@keyframes blink-notice {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.6;
  }
}

.record-list-container {
  margin-bottom: 16px;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
}

.record-list-header {
  display: flex;
  padding: 12px 16px;
  background-color: var(--el-fill-color-light);
  border-bottom: 1px solid var(--el-border-color-light);
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .header-actions {
    display: flex;
    align-items: center;
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

.mail-tips {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.attachment-info {
  display: flex;
  padding: 10px 15px;
  background-color: #f8f8f8;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  align-items: center;
}

.template-info {
  margin-bottom: 8px;
}

.template-variables {
  margin-bottom: 8px;
}

.email-dialog {
  :deep(.el-dialog__body) {
    padding: 20px 24px;
  }

  :deep(.el-dialog__header) {
    padding: 15px 24px;
    margin: 0;
    background-color: #f8f9fa;
    border-bottom: 1px solid #ebeef5;
  }

  :deep(.el-dialog__footer) {
    padding: 15px 24px;
    background-color: #f8f9fa;
    border-top: 1px solid #ebeef5;
  }
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.pending-orders-container {
  margin-top: 20px;
}

.pending-orders-title {
  padding: 12px 16px;
  margin-bottom: 16px;
  background-color: var(--el-fill-color-light);
  border-bottom: 1px solid var(--el-border-color-light);

  .title-content {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }
}

.button-group {
  display: flex;
  align-items: center;
}
</style>
