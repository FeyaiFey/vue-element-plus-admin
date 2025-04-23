<script setup lang="tsx">
import { ref, onMounted, computed, reactive, nextTick } from 'vue'
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
  ElLoading,
  ElDialog,
  ElForm,
  ElFormItem,
  ElTag,
  ElCard
} from 'element-plus'
import { getSopAnalyzeApi, exportSopReportApi } from '@/api/report'
import { submitAssyOrdersApi, exportAssyOrderApi } from '@/api/assy'
import { sendEmailApi } from '@/api/email'
import type { SopAnalyzeResponse } from '@/api/report/type'
import type { EmailSendRequest } from '@/api/email/type'
import { Icon } from '@/components/Icon'
import { AxiosResponse } from 'axios'
import ResizeDialog from '@/components/Dialog/src/ResizeDialog.vue'
import AssyOrder from './component/AssyOrder.vue'
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
        itemName: item?.itemName || '',
        itemCode: item?.itemCode || '',
        abtr: item?.abtr || '',
        businessQty: item?.businessQty || 0,
        requirementType: item?.requirementType || '安全库存',
        emergency: item?.emergency || '普通',
        sales: item?.sales || '',
        remark: item?.remark || '',
        mainChip: item?.mainChip || '',
        deputyChip: item?.deputyChip || '',
        mainChipUsage: item?.mainChipUsage || 0,
        deputyChipUsage: item?.deputyChipUsage || 0
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

  try {
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
  }
}

// 获取用户信息
const userStore = useUserStore()
const userInfo = computed(() => userStore.getUserInfo)

// 发送邮件对话框
const emailDialogVisible = ref(false)
const emailLoading = ref(false)
const emailForm = reactive<{
  to: string[]
  cc: string[]
  subject: string
  content: string
  templateId: number
  templateVariables: {
    user_name: string
    department: string
    content: string
  }
}>({
  to: ['wxb1@h-sun.com'], // 默认收件人
  cc: [],
  subject: `封装订单_${new Date().toLocaleDateString()}`,
  content: '', // 不再直接设置内容，因为将使用模板
  templateId: 1, // 使用模板ID为1
  templateVariables: {
    user_name: '管理员', // 用户名默认值
    department: '生产部', // 部门默认值
    content: '请查收附件中的封装订单。' // 内容默认值
  }
})

// 打开邮件发送对话框
const openEmailDialog = () => {
  // 更新主题日期部分
  emailForm.subject = `封装订单_${new Date().toLocaleDateString()}`

  // 确保默认收件人存在
  if (!emailForm.to.includes('wxb1@h-sun.com')) {
    emailForm.to = ['wxb1@h-sun.com']
  }

  // 默认模板参数，添加空值检查
  emailForm.templateVariables = {
    user_name: userInfo.value?.username || '管理员', // 使用用户名，如果没有则使用"管理员"
    department: userInfo.value?.department_name || '生产部', // 使用部门名称，如果没有则使用"生产部"
    content: `请查收附件中的封装订单（${assyOrderList.value?.length || 0}条记录）。`
  }

  emailDialogVisible.value = true
}

// 发送邮件，包含Excel附件
const sendEmailWithAttachment = async () => {
  if (!assyOrderList.value || assyOrderList.value.length === 0) {
    ElMessage.warning('没有可发送的记录')
    return
  }

  if (!emailForm.to || emailForm.to.length === 0) {
    ElMessage.warning('请至少添加一个收件人')
    return
  }

  emailLoading.value = true
  let loadingInstance: any = null
  let excelBlob: Blob | null = null
  let excelFilename = `封装订单_${new Date().getTime()}.xlsx`

  try {
    // 显示加载状态
    loadingInstance = ElLoading.service({
      lock: true,
      text: '正在处理导出请求...',
      background: 'rgba(0, 0, 0, 0.7)'
    })

    // 构造导出参数
    const exportParams = {
      orders: assyOrderList.value.map((item) => ({
        itemName: item?.itemName || '',
        itemCode: item?.itemCode || '',
        abtr: item?.abtr || '',
        businessQty: item?.businessQty || 0,
        requirementType: item?.requirementType || '安全库存',
        emergency: item?.emergency || '普通',
        sales: item?.sales || '',
        remark: item?.remark || '',
        mainChip: item?.mainChip || '',
        deputyChip: item?.deputyChip || '',
        mainChipUsage: item?.mainChipUsage || 0,
        deputyChipUsage: item?.deputyChipUsage || 0
      }))
    }

    // 步骤1: 先导出Excel文件
    if (loadingInstance) {
      loadingInstance.setText('正在导出Excel文件...')
    }

    console.log('开始导出Excel文件...')
    const res = (await exportAssyOrderApi(exportParams)) as unknown as AxiosResponse
    console.log('Excel文件导出成功')

    // 关闭loading，让用户可以看到浏览器的保存对话框
    if (loadingInstance) {
      loadingInstance.close()
      loadingInstance = null
    }

    // 检查响应数据是否有效
    if (!res || !res.data) {
      throw new Error('导出的Excel文件响应无效')
    }

    // 创建一个用于保存的Blob对象
    excelBlob = new Blob([res.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    // 检查blob大小
    console.log(`Excel文件大小: ${excelBlob.size} 字节`)

    if (excelBlob.size === 0) {
      throw new Error('导出的Excel文件为空')
    }

    // 处理文件名
    const disposition = res.headers?.['content-disposition']
    if (disposition) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
      const matches = filenameRegex.exec(disposition)
      if (matches != null && matches[1]) {
        // 移除UTF-8前缀
        const rawFilename = matches[1].replace(/['"]/g, '')
        excelFilename = decodeURIComponent(rawFilename.replace(/^UTF-8/, ''))
      }
    }

    // 创建并自动下载文件，这会触发浏览器的保存对话框
    const url = window.URL.createObjectURL(excelBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = excelFilename
    link.click()

    // 等待一小段时间让浏览器显示保存对话框
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 由于文件下载是用户交互过程，我们需要显示一个确认对话框
    // 等待用户确认文件已保存完成
    await ElMessageBox.confirm(
      '请等待Excel文件下载完成并保存。完成后请点击【确定】继续发送邮件',
      '等待文件保存',
      {
        confirmButtonText: '确定，文件已保存',
        cancelButtonText: '取消操作',
        closeOnClickModal: false,
        closeOnPressEscape: false,
        type: 'info'
      }
    )

    // 用户已确认文件保存完成，继续发送邮件流程
    window.URL.revokeObjectURL(url)

    // 显示新的loading
    loadingInstance = ElLoading.service({
      lock: true,
      text: '正在处理邮件...',
      background: 'rgba(0, 0, 0, 0.7)'
    })

    // 步骤2: 发送邮件
    if (loadingInstance) {
      loadingInstance.setText('正在处理文件以便发送邮件...')
    }

    if (!excelBlob) {
      throw new Error('Excel文件数据丢失，请重试')
    }

    // 使用FileReader直接读取Blob对象转为Base64
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // 提取base64编码部分（去掉MIME类型前缀）
          const base64 = reader.result.split(',')[1]
          resolve(base64)
        } else {
          reject(new Error('FileReader返回了非字符串结果'))
        }
      }
      reader.onerror = () => reject(reader.error)

      // 确保excelBlob不为null
      if (!excelBlob) {
        reject(new Error('Excel文件数据丢失，请重试'))
        return
      }

      reader.readAsDataURL(excelBlob)
    })

    console.log(`Base64编码完成，长度: ${base64Data.length}`)

    if (!base64Data || base64Data.length === 0) {
      throw new Error('文件编码失败: Base64数据为空')
    }

    // 更新加载状态
    if (loadingInstance) {
      loadingInstance.setText('正在发送邮件...')
    }

    // 构造邮件请求数据
    const emailData: EmailSendRequest = {
      to: emailForm.to || [],
      cc: emailForm.cc && emailForm.cc.length > 0 ? emailForm.cc : undefined,
      template_id: emailForm.templateId || 1, // 使用模板ID
      template_vars: emailForm.templateVariables || {
        user_name: '管理员',
        department: '生产部',
        content: `请查收附件`
      }, // 使用模板变量
      use_template_subject: true, // 使用模板主题
      attachments: [
        {
          filename: excelFilename,
          content: base64Data,
          encoding: 'base64',
          content_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      ]
    }

    // 发送邮件
    console.log('开始发送邮件...')
    const emailRes = await sendEmailApi(emailData)
    console.log('邮件发送完成')

    if (emailRes.data.success) {
      ElMessage.success('邮件发送成功')
      emailDialogVisible.value = false

      // 步骤3: 提交封装单
      if (loadingInstance) {
        loadingInstance.setText('正在提交封装单...')
      }

      console.log('开始提交封装单...')
      try {
        await autoSubmitOrders()
        console.log('封装单提交成功')
        ElMessage.success('封装单已成功提交')
      } catch (submitError) {
        console.error('提交封装单时出错:', submitError)
        ElMessage.error(
          '封装单提交失败: ' +
            (submitError instanceof Error ? submitError.message : String(submitError))
        )
      }
    } else {
      ElMessage.error(`邮件发送失败: ${emailRes.data.error || '未知错误'}`)
    }
  } catch (error) {
    // 检查是否是用户取消的操作
    if (error === 'cancel') {
      console.log('用户取消了操作')
      ElMessage.info('操作已取消')
    } else {
      console.error('处理失败:', error)
      ElMessage.error('操作失败: ' + (error instanceof Error ? error.message : String(error)))
    }
  } finally {
    emailLoading.value = false
    if (loadingInstance) {
      loadingInstance.close()
    }
  }
}

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
    // 确保数组已初始化
    if (!emailForm.to) emailForm.to = []
    if (!emailForm.cc) emailForm.cc = []

    // 确保不重复添加
    if (type === 'to' && !emailForm.to.includes(inputValue)) {
      emailForm.to.push(inputValue)
    } else if (type === 'cc' && !emailForm.cc.includes(inputValue)) {
      emailForm.cc.push(inputValue)
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
  if (!email) return

  // 确保数组已初始化
  if (!emailForm.to) emailForm.to = []
  if (!emailForm.cc) emailForm.cc = []

  if (type === 'to') {
    emailForm.to = emailForm.to.filter((item) => item !== email)
  } else {
    emailForm.cc = emailForm.cc.filter((item) => item !== email)
  }
}

// 处理粘贴多个邮箱
const handleRecipientPaste = (type: 'to' | 'cc', e: ClipboardEvent) => {
  e.preventDefault()
  const pasteText = e.clipboardData?.getData('text')

  if (!pasteText) return

  // 按分隔符分割并处理粘贴的多个邮箱
  const emails = pasteText
    .split(/[\s,;]+/) // 按空格、逗号或分号分割
    .map((email) => email.trim())
    .filter((email) => email && isValidEmail(email)) // 只保留有效邮箱

  if (emails.length) {
    if (type === 'to') {
      // 过滤掉已存在的邮箱
      const newEmails = emails.filter((email) => !emailForm.to.includes(email))
      emailForm.to.push(...newEmails)
      recipientInputVisible.value = false
      recipientInput.value = ''
    } else {
      const newEmails = emails.filter((email) => !emailForm.cc.includes(email))
      emailForm.cc.push(...newEmails)
      ccInputVisible.value = false
      ccInput.value = ''
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
            <ElButton type="primary" class="mr-2" @click="openEmailDialog">
              <Icon icon="vi-ri:mail-line" class="mr-2" />
              导出并发送邮件
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

  <!-- 添加邮件发送对话框 -->
  <ElDialog
    v-model="emailDialogVisible"
    title="发送封装单邮件"
    width="650px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    top="5vh"
    class="email-dialog"
  >
    <ElForm label-width="100px" :model="emailForm" class="email-form">
      <ElFormItem label="收件人" required>
        <div class="recipient-input">
          <div class="recipient-tags">
            <ElTag
              v-for="email in emailForm.to"
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
              v-for="email in emailForm.cc"
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

      <!-- 模板ID和模板变量 -->
      <ElFormItem label="模板">
        <div class="template-info">
          <ElTag type="success">使用模板ID: {{ emailForm.templateId || 1 }}</ElTag>
        </div>
      </ElFormItem>

      <!-- 模板变量编辑 -->
      <ElFormItem label="模板变量">
        <div class="template-variables">
          <ElCard shadow="never" class="template-vars-card">
            <ElForm
              label-position="top"
              :model="emailForm.templateVariables || {}"
              class="vars-form"
            >
              <ElRow :gutter="20">
                <ElCol :span="12">
                  <ElFormItem label="用户名">
                    <ElInput
                      v-model="emailForm.templateVariables.user_name"
                      placeholder="请输入用户名"
                    />
                  </ElFormItem>
                </ElCol>
                <ElCol :span="12">
                  <ElFormItem label="部门">
                    <ElInput
                      v-model="emailForm.templateVariables.department"
                      placeholder="请输入部门"
                    />
                  </ElFormItem>
                </ElCol>
              </ElRow>

              <ElFormItem label="内容">
                <ElInput
                  v-model="emailForm.templateVariables.content"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入内容"
                />
              </ElFormItem>
            </ElForm>
          </ElCard>
        </div>
      </ElFormItem>

      <ElFormItem label="附件">
        <div class="attachment-info">
          <Icon icon="vi-ri:attachment-2" class="mr-2" />
          <span>封装订单.xlsx (自动生成，共{{ assyOrderList?.length || 0 }}条记录)</span>
        </div>
      </ElFormItem>
    </ElForm>

    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="emailDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="sendEmailWithAttachment" :loading="emailLoading">
          <Icon icon="vi-ri:send-plane-fill" class="mr-2" />
          发送邮件
        </ElButton>
      </div>
    </template>
  </ElDialog>
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
</style>
