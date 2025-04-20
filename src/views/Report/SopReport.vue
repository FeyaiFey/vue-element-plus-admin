<script setup lang="tsx">
import { ref, onMounted, computed, reactive } from 'vue'
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
  ElMessageBox,
  ElLoading
} from 'element-plus'
import { getSopAnalyzeApi, exportSopReportApi } from '@/api/report'
import { submitAssyOrdersApi, exportAssyOrderApi } from '@/api/assy'
import type { SopAnalyzeResponse } from '@/api/report/type'
import { Icon } from '@/components/Icon'
import { AxiosResponse } from 'axios'
import ResizeDialog from '@/components/Dialog/src/ResizeDialog.vue'
import AssyOrder from './component/AssyOrder.vue'

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
  inventoryGap: ''
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
    prop: 'INVENTORT_GAP',
    label: '库存缺口',
    width: 150,
    align: 'right',
    isNumber: true,
    filterKey: 'inventoryGap',
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
      if (!evaluateNumberFilter(Number(row.INVENTORT_GAP), filter)) {
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
    case 'INVENTORT_GAP':
      return 'inventoryGap'
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

// 封装单列表
const assyOrderList = ref<any[]>([])
const isEditing = ref(false)
const editIndex = ref(-1)
const selectedOrders = ref<any[]>([])
const formModel = reactive({
  itemName: '',
  itemCode: '',
  abtr: '',
  businessQty: 0,
  requirementType: '安全库存',
  emergency: '普通',
  sales: '',
  remark: '',
  mainChip: '',
  deputyChip: '',
  mainChipUsage: 0,
  deputyChipUsage: 0,
  waferInfo: null
})

// 重置表单
const resetForm = () => {
  formModel.itemName = ''
  formModel.itemCode = ''
  formModel.abtr = ''
  formModel.businessQty = 0
  formModel.requirementType = '安全库存'
  formModel.emergency = '普通'
  formModel.sales = ''
  formModel.remark = ''
  formModel.mainChip = ''
  formModel.deputyChip = ''
  formModel.mainChipUsage = 0
  formModel.deputyChipUsage = 0
  formModel.waferInfo = null
  isEditing.value = false
  editIndex.value = -1
}

// 创建封装单
const dialogVisible = ref(false)
const currentRow = ref<SopAnalyzeResponse | null>(null)

const handleCreatePackage = (row: SopAnalyzeResponse) => {
  resetForm()
  currentRow.value = row
  dialogVisible.value = true
}

// 处理表单提交
const handleSubmitForm = (formData: any) => {
  if (isEditing.value && editIndex.value !== -1) {
    // 更新现有记录
    assyOrderList.value[editIndex.value] = { ...formData }
    ElMessage.success({
      message: '记录已更新',
      duration: 3000
    })
  } else {
    // 添加新记录
    assyOrderList.value.push({ ...formData })
    ElMessage.success({
      message: '记录已添加',
      duration: 3000
    })
  }
  dialogVisible.value = false
}

// 编辑记录
const handleEditOrder = (index: number) => {
  // 获取要编辑的记录
  const order = assyOrderList.value[index]
  // 将数据填充到formModel中进行编辑
  Object.assign(formModel, order)
  // 设置currentRow以确保表单显示
  currentRow.value = {
    ITEM_NAME: order.itemName,
    ABTR: order.abtr
  } as SopAnalyzeResponse
  // 打开对话框
  dialogVisible.value = true
  // 设置编辑模式标记
  isEditing.value = true
  editIndex.value = index
}

// 删除记录
const handleDeleteOrder = (index: number) => {
  // 弹窗确认
  ElMessageBox.confirm('确定要删除这条记录吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      // 删除记录
      assyOrderList.value.splice(index, 1)
      ElMessage.success('删除成功')
    })
    .catch(() => {
      // 用户取消删除
    })
}

// 批量提交到后端
const batchSubmitOrders = async () => {
  if (assyOrderList.value.length === 0) {
    ElMessage.warning('没有可提交的记录')
    return
  }

  // 声明loading变量在try/catch外部，确保可以在finally中访问
  let loadingInstance: any = null

  try {
    // 确认是否提交
    await ElMessageBox.confirm(
      `确定要提交 ${assyOrderList.value.length} 条封装单记录吗？`,
      '批量提交',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )

    // 显示加载状态
    loadingInstance = ElLoading.service({
      lock: true,
      text: '正在提交...',
      background: 'rgba(0, 0, 0, 0.7)'
    })

    // 构造符合API要求的数据格式
    const requestData = {
      orders: assyOrderList.value.map((item) => ({
        itemName: item.itemName,
        itemCode: item.itemCode,
        abtr: item.abtr,
        businessQty: item.businessQty, // 这里已经是"只"为单位
        requirementType: item.requirementType,
        emergency: item.emergency,
        sales: item.sales,
        remark: item.remark,
        mainChip: item.mainChip || '',
        deputyChip: item.deputyChip || '',
        mainChipUsage: item.mainChipUsage || 0,
        deputyChipUsage: item.deputyChipUsage || 0
      }))
    }

    // 调用API提交数据
    const res = await submitAssyOrdersApi(requestData)

    if (res.code === 200) {
      console.log('批量提交数据成功:', requestData)
      ElMessage.success({
        message: `成功提交 ${assyOrderList.value.length} 条封装单`,
        duration: 3000
      })

      // 提交成功后清空列表
      assyOrderList.value = []
    } else {
      ElMessage.error(`提交失败: ${res.message || '未知错误'}`)
    }
  } catch (error) {
    if (error === 'cancel') {
      // 用户取消操作
      return
    }
    console.error('提交失败:', error)
    ElMessage.error('提交失败: ' + (error instanceof Error ? error.message : String(error)))
  } finally {
    // 无论成功还是失败，都确保关闭loading
    if (loadingInstance) {
      loadingInstance.close()
    }
  }
}

// 关闭对话框
const handleDialogClose = () => {
  dialogVisible.value = false
  currentRow.value = null
}

// 获取库存缺口等级
const getInventoryGapLevel = (value: number) => {
  if (value <= -500000) return 'critical'
  if (value <= -300000) return 'severe'
  if (value <= -100000) return 'warning'
  if (value < 0) return 'notice'
  return 'normal'
}

// 导出报表
const handleExport = async () => {
  try {
    const loadingMessage = ElMessage({
      type: 'info',
      message: '正在导出，请稍候...',
      duration: 0 // 设置为0表示不自动关闭
    })

    const res = (await exportSopReportApi()) as unknown as AxiosResponse
    // 如果是文件流，直接创建blob
    const blob = new Blob([res.data], { type: 'application/vnd.ms-excel' })
    const disposition = res.headers?.['content-disposition']
    console.log(res)
    let filename = `SOP报表_${new Date().getTime()}.xlsx`
    if (disposition) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
      const matches = filenameRegex.exec(disposition)
      if (matches != null && matches[1]) {
        // 移除UTF-8前缀
        const rawFilename = matches[1].replace(/['"]/g, '')
        filename = decodeURIComponent(rawFilename.replace(/^UTF-8/, ''))
      }
    }
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    window.URL.revokeObjectURL(url)

    // 在文件下载框弹出后关闭提示消息
    loadingMessage.close()
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// 处理表格选择变化
const handleOrderSelectionChange = (selection: any[]) => {
  selectedOrders.value = selection
}

// 批量删除选中记录
const handleBatchDelete = () => {
  if (selectedOrders.value.length === 0) {
    ElMessage.warning('请先选择要删除的记录')
    return
  }

  ElMessageBox.confirm(`确定要删除选中的 ${selectedOrders.value.length} 条记录吗?`, '批量删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      // 获取选中记录的索引
      const selectedIds = selectedOrders.value
        .map((item) => {
          return assyOrderList.value.findIndex((order) => order === item)
        })
        .filter((index) => index !== -1)

      // 从后往前删除，避免索引变化
      selectedIds
        .sort((a, b) => b - a)
        .forEach((index) => {
          assyOrderList.value.splice(index, 1)
        })

      ElMessage.success(`成功删除 ${selectedIds.length} 条记录`)
      selectedOrders.value = []
    })
    .catch(() => {
      // 用户取消删除
    })
}

// 导出封装订单
const handleExportAssyOrders = async () => {
  if (assyOrderList.value.length === 0) {
    ElMessage.warning('没有可导出的记录')
    return
  }

  try {
    const loadingMessage = ElMessage({
      type: 'info',
      message: '正在导出，请稍候...',
      duration: 0 // 设置为0表示不自动关闭
    })

    // 构造导出参数
    const exportParams = {
      orders: assyOrderList.value.map((item) => ({
        itemName: item.itemName,
        itemCode: item.itemCode,
        abtr: item.abtr,
        businessQty: item.businessQty,
        requirementType: item.requirementType,
        emergency: item.emergency,
        sales: item.sales,
        remark: item.remark,
        mainChip: item.mainChip || '',
        deputyChip: item.deputyChip || '',
        mainChipUsage: item.mainChipUsage || 0,
        deputyChipUsage: item.deputyChipUsage || 0
      }))
    }

    const res = (await exportAssyOrderApi(exportParams)) as unknown as AxiosResponse
    // 如果是文件流，直接创建blob
    const blob = new Blob([res.data], { type: 'application/vnd.ms-excel' })
    const disposition = res.headers?.['content-disposition']
    let filename = `封装订单_${new Date().getTime()}.xlsx`
    if (disposition) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
      const matches = filenameRegex.exec(disposition)
      if (matches != null && matches[1]) {
        // 移除UTF-8前缀
        const rawFilename = matches[1].replace(/['"]/g, '')
        filename = decodeURIComponent(rawFilename.replace(/^UTF-8/, ''))
      }
    }
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    window.URL.revokeObjectURL(url)

    // 在文件下载框弹出后关闭提示消息
    loadingMessage.close()
    ElMessage.success('导出成功')

    // 导出成功后，自动运行批量提交(不需要确认)
    setTimeout(async () => {
      // 直接执行提交逻辑而不显示确认对话框
      await autoSubmitOrders()
    }, 1000)
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败: ' + (error instanceof Error ? error.message : String(error)))
  }
}

// 自动提交封装单(不需要确认)
const autoSubmitOrders = async () => {
  if (assyOrderList.value.length === 0) {
    return
  }

  let loadingInstance: any = null

  try {
    // 显示加载状态
    loadingInstance = ElLoading.service({
      lock: true,
      text: '正在提交...',
      background: 'rgba(0, 0, 0, 0.7)'
    })

    // 构造符合API要求的数据格式
    const requestData = {
      orders: assyOrderList.value.map((item) => ({
        itemName: item.itemName,
        itemCode: item.itemCode,
        abtr: item.abtr,
        businessQty: item.businessQty, // 这里已经是"只"为单位
        requirementType: item.requirementType,
        emergency: item.emergency,
        sales: item.sales,
        remark: item.remark,
        mainChip: item.mainChip || '',
        deputyChip: item.deputyChip || '',
        mainChipUsage: item.mainChipUsage || 0,
        deputyChipUsage: item.deputyChipUsage || 0
      }))
    }

    // 调用API提交数据
    const res = await submitAssyOrdersApi(requestData)

    if (res.code === 200) {
      console.log('批量提交数据成功:', requestData)

      // 提交成功后清空列表
      assyOrderList.value = []
    } else {
      ElMessage.error(`提交失败: ${res.message || '未知错误'}`)
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败: ' + (error instanceof Error ? error.message : String(error)))
  } finally {
    // 无论成功还是失败，都确保关闭loading
    if (loadingInstance) {
      loadingInstance.close()
    }
  }
}

ElNotification.warning({
  title: '注意',
  message:
    '对只设了编带安全库存的产品请注意该产品管装产品库存和封装数量(管装和编带都设有安全库存的产品除外)!!',
  position: 'top-right',
  duration: 300000
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
      <ElButton type="success" class="ml-2" @click="handleExport">
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
              <template v-if="col.prop === 'INVENTORT_GAP'">
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

  <!-- 封装单记录列表 -->
  <ElRow v-if="assyOrderList.length > 0" class="mt-6">
    <ElCol :span="24">
      <div class="record-list-container">
        <div class="record-list-header">
          <h3>待提交封装单记录 ({{ assyOrderList.length }}条)</h3>
          <div class="header-actions">
            <ElButton
              v-if="selectedOrders.length > 0"
              type="danger"
              @click="handleBatchDelete"
              class="mr-2"
            >
              <Icon icon="vi-ri:delete-bin-line" class="mr-1" />
              删除所选({{ selectedOrders.length }})
            </ElButton>
            <ElButton type="success" class="mr-2" @click="handleExportAssyOrders">
              <Icon icon="vi-vscode-icons:file-type-excel" class="mr-2" />
              导出Excel
            </ElButton>
            <ElButton type="primary" @click="batchSubmitOrders">
              <Icon icon="vi-ri:upload-cloud-line" class="mr-2" />
              批量提交
            </ElButton>
          </div>
        </div>
        <ElTable
          :data="assyOrderList"
          border
          stripe
          style="width: 100%"
          @selection-change="handleOrderSelectionChange"
        >
          <ElTableColumn type="selection" width="55" header-align="center" align="center" />
          <ElTableColumn
            prop="itemName"
            label="品名"
            width="200"
            header-align="center"
            align="right"
          />
          <ElTableColumn
            prop="itemCode"
            label="品号"
            width="250"
            header-align="center"
            align="right"
          />
          <ElTableColumn
            prop="abtr"
            label="管装/编带"
            width="120"
            header-align="center"
            align="center"
          />
          <ElTableColumn
            prop="businessQty"
            label="需求数量"
            width="120"
            header-align="center"
            align="center"
          />
          <ElTableColumn
            prop="requirementType"
            label="需求类型"
            width="120"
            header-align="center"
            align="center"
          />
          <ElTableColumn
            prop="emergency"
            label="紧急程度"
            width="120"
            header-align="center"
            align="center"
          />
          <ElTableColumn
            prop="sales"
            label="销售员"
            width="120"
            header-align="center"
            align="center"
          />
          <ElTableColumn
            prop="remark"
            label="备注"
            min-width="180"
            header-align="center"
            align="left"
          />
          <ElTableColumn
            label="操作"
            width="200"
            fixed="right"
            header-align="center"
            align="center"
          >
            <template #default="{ $index }">
              <ElButton type="primary" size="small" @click="handleEditOrder($index)" text>
                <Icon icon="vi-ri:edit-line" class="mr-1" />
                编辑
              </ElButton>
              <ElButton type="danger" size="small" @click="handleDeleteOrder($index)" text>
                <Icon icon="vi-ri:delete-bin-line" class="mr-1" />
                删除
              </ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
    </ElCol>
  </ElRow>

  <!-- 对话框 -->
  <ResizeDialog
    v-model="dialogVisible"
    :title="isEditing ? '编辑封装单' : '创建封装单'"
    :fullscreen="true"
    :initWidth="1000"
    :initHeight="600"
    @close="handleDialogClose"
  >
    <AssyOrder
      v-if="currentRow"
      ref="assyOrderRef"
      :itemName="isEditing ? formModel.itemName : currentRow.ITEM_NAME || ''"
      :abtr="isEditing ? formModel.abtr : currentRow.ABTR || ''"
      :edit-mode="isEditing"
      :initial-quantity="isEditing ? formModel.businessQty : 0"
      :initial-demand-type="isEditing ? formModel.requirementType : '安全库存'"
      :initial-urgency-level="isEditing ? formModel.emergency : '普通'"
      :initial-sales-person="isEditing ? formModel.sales : ''"
      :initial-remark="isEditing ? formModel.remark : ''"
      :initial-wafer-info="isEditing && formModel.waferInfo ? formModel.waferInfo : {}"
      @close="handleDialogClose"
      @submit="handleSubmitForm"
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
</style>
