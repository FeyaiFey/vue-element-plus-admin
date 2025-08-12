<script setup lang="ts">
import { ref, watch, nextTick, PropType } from 'vue'
import { useTable } from '@/hooks/web/useTable'
import {
  ElInput,
  ElDatePicker,
  ElForm,
  ElFormItem,
  ElPagination,
  ElDrawer,
  ElButton,
  ElDivider,
  ElOption,
  ElSelect,
  ElMessage,
  ElSkeleton,
  ElSkeletonItem
} from 'element-plus'
import { Icon } from '@/components/Icon'
import ResizeDialog from '@/components/Dialog/src/ResizeDialog.vue'
import { useDesign } from '@/hooks/web/useDesign'
import ChipPackagingRequirementsTable from './components/ChipPackagingRequirementsTable.vue'
import ChipPackagingRequirementsForm from './components/ChipPackagingRequirementsForm.vue'
import ChipPackagingListTable from '../ChipPackagingList/components/ChipPackagingListTable.vue'
import ChipPackagingWipTable from '../ChipPackagingWip/components/ChipPackagingWipTable.vue'
import {
  ChipPackagingRequirementQuery,
  ChipPackagingRequirement,
  ChipPackagingRequirementCreate,
  ChipPackagingRequirementCancel,
  ChipPackagingRequirementAddOrders,
  ChipPackagingQuery,
  ChipPackagingWipQuery
} from '@/api/chipPackaging/types'
import {
  getChipPackagingRequirementListApi,
  exportChipPackagingRequirementListApi,
  getChipPackagingListApi,
  getChipPackagingWipListApi,
  createChipPackagingRequirementApi,
  cancelChipPackagingRequirementApi,
  addOrdersChipPackagingRequirementApi
} from '@/api/chipPackaging'

// 使用设计系统
const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('chip-packaging-requirements')

// 定义组件名称（用于keep-alive缓存）
defineOptions({
  name: 'ChipPackagingRequirements'
})

// 定义 props
const props = defineProps({
  tableType: {
    type: String as PropType<'detail' | 'summary'>,
    default: 'detail'
  }
})

const searchParams = ref<ChipPackagingRequirementQuery>({
  pageIndex: 1,
  pageSize: 20,
  id: undefined,
  itemCode: undefined,
  itemName: undefined,
  abtr: undefined,
  requirementType: undefined,
  emergency: undefined,
  isEmailNoticed: undefined,
  sales: undefined,
  createBy: undefined,
  dateStart: undefined,
  dateEnd: undefined
})

// 抽屉相关
const drawerVisible = ref(false)
const advancedSearchParams = ref<{
  id: number | undefined
  itemName: string | undefined
  abtr: string | undefined
  requirementType: string | undefined
  emergency: string | undefined
  isEmailNoticed: string | undefined
  sales: string | undefined
  createBy: string | undefined
  dateStart: string | undefined
  dateEnd: string | undefined
}>({
  id: undefined,
  itemName: undefined,
  abtr: undefined,
  requirementType: undefined,
  emergency: undefined,
  isEmailNoticed: undefined,
  sales: undefined,
  createBy: undefined,
  dateStart: undefined,
  dateEnd: undefined
})

// 主要搜索条件（品名）
const quickSearch = ref('')

const { tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const res = await getChipPackagingRequirementListApi(searchParams.value)
    return {
      list: res.data.list || [],
      total: res.data.total
    }
  }
})

const { dataList, loading, total } = tableState
const { getList } = tableMethods

// 搜索方法
const handleSearch = () => {
  searchParams.value.pageIndex = 1 // 重置到第一页
  searchParams.value.itemCode = quickSearch.value || undefined
  getList()
}

// 应用高级搜索
const handleAdvancedSearch = () => {
  // 合并高级搜索参数到主搜索参数
  Object.assign(searchParams.value, advancedSearchParams.value)
  handleSearch()
  drawerVisible.value = false
}

// 重置高级搜索
const handleResetAdvanced = () => {
  advancedSearchParams.value = {
    id: undefined,
    itemName: undefined,
    abtr: undefined,
    requirementType: undefined,
    emergency: undefined,
    isEmailNoticed: undefined,
    sales: undefined,
    createBy: undefined,
    dateStart: undefined,
    dateEnd: undefined
  }

  // 清空主搜索参数中的高级搜索部分
  searchParams.value.id = undefined
  searchParams.value.itemCode = undefined
  searchParams.value.itemName = undefined
  searchParams.value.abtr = undefined
  searchParams.value.requirementType = undefined
  searchParams.value.emergency = undefined
  searchParams.value.isEmailNoticed = undefined
  searchParams.value.sales = undefined
  searchParams.value.createBy = undefined
  searchParams.value.dateStart = undefined
  searchParams.value.dateEnd = undefined

  handleSearch()
}

// 重置所有搜索
// const handleResetAll = () => {
//   quickSearch.value = ''
//   searchParams.value.itemName = undefined
//   handleResetAdvanced()
// }

// 获取活跃的高级搜索条件数量
const getActiveAdvancedFilters = () => {
  const filters = advancedSearchParams.value
  let count = 0
  Object.values(filters).forEach((value) => {
    if (value !== undefined && value !== '' && value !== null) {
      count++
    }
  })
  return count
}

// 分页大小改变
const handleSizeChange = (size: number) => {
  searchParams.value.pageSize = size
  searchParams.value.pageIndex = 1
  getList()
}

// 当前页改变
const handleCurrentChange = (page: number) => {
  searchParams.value.pageIndex = page
  getList()
}

// 表格选择变化
const handleSelectionChange = (selection: any[]) => {
  console.log('选中的行:', selection)
  selectedRows.value = selection
  calculateSummary()
}

// 选中的行数据
const selectedRows = ref<any[]>([])

// 汇总数据
const summaryData = ref({
  count: 0,
  businessQtySum: 0,
  chipAQtySum: 0,
  chipBQtySum: 0
})

// 是否显示汇总信息
const showSummary = ref(false)

// 计算汇总
const calculateSummary = () => {
  const rows = selectedRows.value
  const count = rows.length

  if (count === 0) {
    showSummary.value = false
    return
  }

  showSummary.value = true

  const businessQtySum = rows.reduce((sum, row) => sum + (Number(row.businessQty) || 0), 0)
  const chipAQtySum = rows.reduce((sum, row) => sum + (Number(row.chipAQty) || 0), 0)
  const chipBQtySum = rows.reduce((sum, row) => sum + (Number(row.chipBQty) || 0), 0)

  summaryData.value = {
    count,
    businessQtySum,
    chipAQtySum,
    chipBQtySum
  }
}

// 格式化数字
const formatNumber = (num: number, decimals: number = 2) => {
  return Number(num).toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

// 下载相关状态
const downloading = ref(false)
const downloadProgress = ref(0)

// 弹窗相关状态
const chipPackagingOrderNoRef = ref('')
const chipPackagingOrderData = ref<any[]>([])
const chipPackagingOrderLoading = ref(false)
const chipPackagingOrderDialogVisible = ref(false)
const chipPackagingOrderWipData = ref<any[]>([])
const chipPackagingOrderWipLoading = ref(false)

// 撤销需求相关状态
const cancelDialogVisible = ref(false)
const cancelLoading = ref(false)
const cancelFormData = ref<ChipPackagingRequirementCancel>({
  id: 0,
  status: '2', // 撤销状态
  remark: ''
})

// 附订单号相关状态
const attachOrderDialogVisible = ref(false)
const attachOrderLoading = ref(false)
const attachOrderFormData = ref<ChipPackagingRequirementAddOrders>({
  id: 0,
  packagingOrders: '',
  remarkB: ''
})

// 新建需求相关状态
const createDialogVisible = ref(false)
const createLoading = ref(false)
const createFormData = ref<ChipPackagingRequirementCreate>({
  itemCode: '',
  itemName: '',
  abtr: '',
  businessQty: 1,
  requirementType: '',
  emergency: '',
  sales: '',
  remark: '',
  chipA: '',
  chipAQty: 0,
  chipB: '',
  chipBQty: 0
})

// 新增：预填 itemName 状态（用于区分普通新建和行内新建）
const prefilledItemName = ref('')

// 下载表格
const handleDownload = async () => {
  try {
    downloading.value = true
    downloadProgress.value = 0

    // 显示下载开始提示
    ElMessage.info('正在生成Excel文件，请稍候...')

    // 调用导出API，传入当前搜索条件
    const response = await exportChipPackagingRequirementListApi({
      ...searchParams.value
    })

    // 检查响应
    if (!response || !response.data) {
      throw new Error('下载失败：服务器响应异常')
    }

    // 获取文件名
    const disposition = (response as any).headers?.['content-disposition']
    let filename = `chipPackagingRequirements_${new Date().toLocaleDateString()}.xlsx`

    if (disposition) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
      const matches = filenameRegex.exec(disposition)
      if (matches?.[1]) {
        filename = decodeURIComponent(matches[1].replace(/['"]/g, ''))
      }
    }

    // 创建Blob对象
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    // 检查文件大小
    if (blob.size === 0) {
      throw new Error('下载失败：文件为空')
    }

    downloadProgress.value = 50

    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.style.display = 'none'

    // 添加到DOM并触发下载
    document.body.appendChild(link)
    link.click()

    downloadProgress.value = 100

    // 清理资源
    setTimeout(() => {
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    }, 100)

    // 成功提示
    ElMessage.success({
      message: `Excel文件下载完成：${filename}`,
      duration: 3000
    })
  } catch (err: any) {
    console.error('下载失败:', err)

    // 错误处理
    let errorMessage = '下载失败'
    if (err?.response) {
      // 服务器响应错误
      if (err.response.status === 404) {
        errorMessage = '下载失败：找不到请求的资源'
      } else if (err.response.status === 500) {
        errorMessage = '下载失败：服务器内部错误'
      } else if (err.response.status === 403) {
        errorMessage = '下载失败：没有权限访问'
      } else {
        errorMessage = `下载失败：服务器错误 (${err.response.status})`
      }
    } else if (err?.request) {
      // 网络错误
      errorMessage = '下载失败：网络连接异常，请检查网络后重试'
    } else if (err?.message) {
      errorMessage = err.message
    }

    ElMessage.error({
      message: errorMessage,
      duration: 5000
    })
  } finally {
    downloading.value = false
    downloadProgress.value = 0
  }
}

// 处理封装订单号点击事件
const handlePurchaseOrderClick = async (chipPackagingOrderNo: string) => {
  chipPackagingOrderNoRef.value = chipPackagingOrderNo
  chipPackagingOrderDialogVisible.value = true

  // 查询详细数据
  chipPackagingOrderLoading.value = true
  chipPackagingOrderWipLoading.value = true
  try {
    const chipPackagingQueryParams: ChipPackagingQuery = {
      pageIndex: undefined,
      pageSize: undefined,
      docNo: chipPackagingOrderNo
    }

    const chipPackagingWipQueryParams: ChipPackagingWipQuery = {
      pageIndex: undefined,
      pageSize: undefined,
      docNo: chipPackagingOrderNo
    }

    const chipPackagingRes = await getChipPackagingListApi(chipPackagingQueryParams)
    const chipPackagingWipRes = await getChipPackagingWipListApi(chipPackagingWipQueryParams)

    chipPackagingOrderData.value = chipPackagingRes.data.list || []
    chipPackagingOrderWipData.value = chipPackagingWipRes.data.list || []
  } catch (error) {
    console.error('查询封装订单详情失败:', error)
    ElMessage.error('查询封装订单详情失败')
    chipPackagingOrderData.value = []
    chipPackagingOrderWipData.value = []
  } finally {
    chipPackagingOrderLoading.value = false
    chipPackagingOrderWipLoading.value = false
  }
}

// 新建需求相关方法
const handleCreateRequirement = () => {
  // 普通新建：不预填 itemName
  prefilledItemName.value = ''

  // 创建新的对象避免引用问题
  const newFormData = {
    itemCode: '',
    itemName: '',
    abtr: '',
    businessQty: 1,
    requirementType: '',
    emergency: '',
    sales: '',
    remark: '',
    chipA: '',
    chipAQty: 0,
    chipB: '',
    chipBQty: 0,
    isEmailNoticed: ''
  }

  // 先设置数据，再打开对话框
  Object.assign(createFormData.value, newFormData)

  nextTick(() => {
    createDialogVisible.value = true
  })
}

const handleCreateSubmit = async (formData: ChipPackagingRequirementCreate) => {
  try {
    createLoading.value = true
    await createChipPackagingRequirementApi(formData)

    ElMessage.success('新建成功')

    // 先关闭对话框
    createDialogVisible.value = false

    // 重置搜索参数到第一页，确保能看到新创建的数据
    searchParams.value.pageIndex = 1

    // 清空搜索条件，确保新建的数据能显示
    quickSearch.value = ''
    searchParams.value.itemCode = undefined

    // 强制刷新表格数据
    await forceRefresh()
  } catch (error: any) {
    console.error('新建需求失败:', error)
    ElMessage.error(error?.message || '新建需求失败，请重试')
  } finally {
    createLoading.value = false
  }
}

const handleCreateCancel = () => {
  createDialogVisible.value = false
}

// 强制刷新数据
const forceRefresh = async () => {
  try {
    loading.value = true
    await getList()
  } catch (error) {
    console.error('刷新数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 监听新建对话框关闭，重置表单
watch(createDialogVisible, (newValue) => {
  if (!newValue) {
    // 对话框关闭时，重置表单数据和预填状态
    nextTick(() => {
      prefilledItemName.value = ''
      const resetData = {
        itemCode: '',
        itemName: '',
        abtr: '',
        businessQty: 1,
        requirementType: '',
        emergency: '',
        sales: '',
        remark: '',
        chipA: '',
        chipAQty: 0,
        chipB: '',
        chipBQty: 0,
        isEmailNoticed: ''
      }
      Object.assign(createFormData.value, resetData)
    })
  }
})

// 监听撤销对话框关闭，重置表单
watch(cancelDialogVisible, (newValue) => {
  if (!newValue) {
    nextTick(() => {
      cancelFormData.value = {
        id: 0,
        status: '2',
        remark: ''
      }
    })
  }
})

// 监听附订单号对话框关闭，重置表单
watch(attachOrderDialogVisible, (newValue) => {
  if (!newValue) {
    nextTick(() => {
      attachOrderFormData.value = {
        id: 0,
        packagingOrders: '',
        remarkB: ''
      }
    })
  }
})

// 处理表格操作按钮点击事件
const handleAddClick = (row: ChipPackagingRequirement) => {
  // 行内新建：预填行中的 itemName
  prefilledItemName.value = row.itemName || ''

  // 行中新建需求：使用相同的新建表单，但预填行数据
  const newFormData = {
    itemCode: '',
    itemName: row.itemName || '',
    abtr: '',
    businessQty: 1,
    requirementType: '',
    emergency: '',
    sales: '',
    remark: '',
    chipA: '',
    chipAQty: 0,
    chipB: '',
    chipBQty: 0,
    isEmailNoticed: ''
  }

  // 先设置数据，再打开对话框
  Object.assign(createFormData.value, newFormData)

  nextTick(() => {
    createDialogVisible.value = true
  })
}

const handleCancelClick = (row: ChipPackagingRequirement) => {
  // 撤销需求
  cancelFormData.value = {
    id: row.id || 0,
    status: '2', // 撤销状态
    remark: ''
  }
  cancelDialogVisible.value = true
}

const handleAttachOrderClick = (row: ChipPackagingRequirement) => {
  // 附订单号
  attachOrderFormData.value = {
    id: row.id || 0,
    packagingOrders: row.packagingOrders || '',
    remarkB: row.remarkB || ''
  }
  attachOrderDialogVisible.value = true
}

// 撤销需求提交
const handleCancelSubmit = async () => {
  try {
    cancelLoading.value = true
    await cancelChipPackagingRequirementApi(cancelFormData.value)

    ElMessage.success('撤销需求成功')
    cancelDialogVisible.value = false

    // 刷新数据
    await forceRefresh()
  } catch (error: any) {
    console.error('撤销需求失败:', error)
    ElMessage.error(error?.message || '撤销需求失败，请重试')
  } finally {
    cancelLoading.value = false
  }
}

// 附订单号提交
const handleAttachOrderSubmit = async () => {
  // 简单验证
  if (!attachOrderFormData.value.packagingOrders?.trim()) {
    ElMessage.warning('请输入封装订单号')
    return
  }

  try {
    attachOrderLoading.value = true
    await addOrdersChipPackagingRequirementApi(attachOrderFormData.value)

    ElMessage.success('附订单号成功')
    attachOrderDialogVisible.value = false

    // 刷新数据
    await forceRefresh()
  } catch (error: any) {
    console.error('附订单号失败:', error)
    ElMessage.error(error?.message || '附订单号失败，请重试')
  } finally {
    attachOrderLoading.value = false
  }
}
</script>

<template>
  <div :class="prefixCls">
    <!-- 快速搜索区域 -->
    <div :class="`${prefixCls}__search`" class="mb-2">
      <div class="flex items-center gap-2">
        <!-- 主搜索框 -->
        <div class="flex-2">
          <ElInput
            v-model="quickSearch"
            placeholder="搜索品号..."
            size="small"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <Icon icon="vi-ep:search" />
            </template>
          </ElInput>
        </div>

        <!-- 高级搜索按钮 -->
        <div class="flex-2">
          <ElButton type="primary" size="small" plain @click="drawerVisible = true" class="w-25">
            <Icon icon="vi-ep:filter" class="mr-2" />
            高级搜索
            <span
              v-if="getActiveAdvancedFilters() > 0"
              class="ml-1 px-1 bg-red-500 text-white text-xs rounded"
            >
              {{ getActiveAdvancedFilters() }}
            </span>
          </ElButton>

          <!-- 重置按钮 -->
          <!-- <ElButton size="small" @click="handleResetAll" class="w-25">
            <Icon icon="vi-ep:refresh" class="mr-2" />
            重置
          </ElButton> -->

          <!-- 新建按钮 -->
          <ElButton size="small" @click="handleCreateRequirement" class="w-25" type="primary">
            <Icon icon="vi-ep:plus" class="mr-2" />
            新建需求
          </ElButton>

          <!-- 下载按钮 -->
          <ElButton
            size="small"
            @click="handleDownload"
            class="w-25"
            :loading="downloading"
            :disabled="downloading || dataList.length === 0"
            type="success"
          >
            <Icon v-if="!downloading" icon="vi-vscode-icons:file-type-excel" class="mr-2" />
            {{ downloading ? '导出中...' : '下载表格' }}
          </ElButton>
        </div>
      </div>
    </div>

    <!-- 表格区域 -->
    <div :class="`${prefixCls}__table`" class="flex-1 mb-4">
      <ElSkeleton :loading="loading" animated>
        <template #template>
          <div class="bg-white dark:bg-gray-800 rounded-lg border">
            <!-- 表头骨架 -->
            <div class="border-b p-4 bg-gray-50 dark:bg-gray-700">
              <div class="grid grid-cols-6 gap-4">
                <ElSkeletonItem variant="text" style="width: 60%" />
                <ElSkeletonItem variant="text" style="width: 70%" />
                <ElSkeletonItem variant="text" style="width: 80%" />
                <ElSkeletonItem variant="text" style="width: 90%" />
                <ElSkeletonItem variant="text" style="width: 85%" />
                <ElSkeletonItem variant="text" style="width: 75%" />
              </div>
            </div>

            <!-- 表格行骨架 -->
            <div class="p-4 space-y-3">
              <div v-for="n in 18" :key="n" class="grid grid-cols-6 gap-4 py-2">
                <ElSkeletonItem variant="text" style="width: 80%" />
                <ElSkeletonItem variant="text" style="width: 60%" />
                <ElSkeletonItem variant="text" style="width: 90%" />
                <ElSkeletonItem variant="text" style="width: 70%" />
                <ElSkeletonItem variant="text" style="width: 85%" />
                <ElSkeletonItem variant="text" style="width: 65%" />
              </div>
            </div>
          </div>
        </template>

        <template #default>
          <ChipPackagingRequirementsTable
            :table-data="dataList"
            :table-type="props.tableType"
            :enable-selection="true"
            table-height="calc(100vh - 240px)"
            @selection-change="handleSelectionChange"
            @packaging-order-click="handlePurchaseOrderClick"
            @add-click="handleAddClick"
            @cancel-click="handleCancelClick"
            @attach-order-click="handleAttachOrderClick"
          />
        </template>
      </ElSkeleton>
    </div>

    <!-- 分页区域 -->
    <div class="flex justify-between items-center">
      <!-- 统计信息 -->
      <div class="text-sm text-gray-600 dark:text-gray-300">
        <div v-if="!showSummary">
          <span>共 {{ total }} 条记录</span>
        </div>
        <div v-else class="flex flex-col gap-1">
          <div class="flex items-center gap-4">
            <span class="font-medium">已选 {{ summaryData.count }} 条</span>
            <span>总业务量: {{ formatNumber(summaryData.businessQtySum, 0) }}</span>
            <span>总A芯数: {{ formatNumber(summaryData.chipAQtySum, 0) }}</span>
            <span>总B芯数: {{ formatNumber(summaryData.chipBQtySum, 0) }}</span>
          </div>
          <div class="flex items-center gap-4 text-xs">
            <span class="text-gray-500">共 {{ total }} 条记录</span>
          </div>
        </div>
      </div>

      <!-- 分页控件 -->
      <ElPagination
        v-model:current-page="searchParams.pageIndex"
        v-model:page-size="searchParams.pageSize"
        :page-sizes="[10, 20, 30, 50, 100]"
        :total="total"
        layout="sizes, prev, pager, next, jumper"
        size="small"
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 订单详情弹窗 -->
    <ResizeDialog
      v-model="chipPackagingOrderDialogVisible"
      :title="`订单详情 - 订单号: ${chipPackagingOrderNoRef}`"
      :init-width="1200"
      :init-height="600"
      :min-resize-width="800"
      :min-resize-height="400"
    >
      <div class="p-4">封装订单详情</div>
      <div class="p-4 mb-4">
        <ChipPackagingListTable
          :table-data="chipPackagingOrderData"
          :loading="chipPackagingOrderLoading"
          table-type="summary"
          :enable-selection="false"
        />
      </div>
      <div v-if="chipPackagingOrderWipData.length > 0" class="p-4">在制详情</div>
      <div v-if="chipPackagingOrderWipData.length > 0" class="p-4">
        <ChipPackagingWipTable
          :table-data="chipPackagingOrderWipData"
          :loading="chipPackagingOrderWipLoading"
          table-type="summary"
          :enable-selection="false"
        />
      </div>
    </ResizeDialog>

    <!-- 高级搜索抽屉 -->
    <ElDrawer v-model="drawerVisible" title="高级搜索" size="400px" direction="rtl">
      <div class="p-4">
        <ElForm :model="advancedSearchParams" label-width="80px" label-position="left">
          <ElFormItem label="ID">
            <ElInput v-model="advancedSearchParams.id" placeholder="请输入ID" clearable />
          </ElFormItem>

          <ElFormItem label="品名">
            <ElInput v-model="advancedSearchParams.itemName" placeholder="请输入品名" clearable />
          </ElFormItem>

          <ElFormItem label="ABTR">
            <ElSelect
              v-model="advancedSearchParams.abtr"
              placeholder="请选择管装或者编带"
              clearable
            >
              <ElOption label="管装" value="管装" />
              <ElOption label="编带" value="编带" />
            </ElSelect>
          </ElFormItem>

          <ElFormItem label="需求类型">
            <ElSelect
              v-model="advancedSearchParams.requirementType"
              placeholder="请选择需求类型"
              clearable
            >
              <ElOption label="安全库存" value="安全库存" />
              <ElOption label="市场需求" value="市场需求" />
            </ElSelect>
          </ElFormItem>

          <ElFormItem label="紧急程度">
            <ElSelect
              v-model="advancedSearchParams.emergency"
              placeholder="请选择紧急程度"
              clearable
            >
              <ElOption label="正常" value="正常" />
              <ElOption label="紧急" value="紧急" />
              <ElOption label="特急" value="特急" />
            </ElSelect>
          </ElFormItem>

          <ElFormItem label="销售员">
            <ElInput v-model="advancedSearchParams.sales" placeholder="请输入销售员" clearable />
          </ElFormItem>

          <ElFormItem label="邮件通知">
            <ElSelect
              v-model="advancedSearchParams.isEmailNoticed"
              placeholder="请选择邮件通知"
              clearable
            >
              <ElOption label="未通知" value="0" />
              <ElOption label="已通知" value="1" />
            </ElSelect>
          </ElFormItem>

          <ElFormItem label="创建人">
            <ElInput v-model="advancedSearchParams.createBy" placeholder="请输入创建人" clearable />
          </ElFormItem>

          <ElFormItem label="开始日期">
            <ElDatePicker
              v-model="advancedSearchParams.dateStart"
              type="date"
              placeholder="请选择开始日期"
              value-format="YYYY-MM-DD"
              clearable
              class="w-full"
            />
          </ElFormItem>

          <ElFormItem label="结束日期">
            <ElDatePicker
              v-model="advancedSearchParams.dateEnd"
              type="date"
              placeholder="请选择结束日期"
              value-format="YYYY-MM-DD"
              clearable
              class="w-full"
            />
          </ElFormItem>
        </ElForm>

        <ElDivider />

        <!-- 抽屉操作按钮 -->
        <div class="flex justify-end">
          <ElButton type="info" @click="handleResetAdvanced" class="w-25"> 重置条件 </ElButton>
          <ElButton type="primary" @click="handleAdvancedSearch" class="w-25"> 应用搜索 </ElButton>
        </div>
      </div>
    </ElDrawer>

    <!-- 新建需求抽屉 -->
    <ElDrawer
      v-model="createDialogVisible"
      :title="prefilledItemName ? '行内新建封装需求' : '新建封装需求'"
      size="400px"
      direction="rtl"
      class="create-requirement-drawer"
    >
      <div class="p-4 h-full">
        <ChipPackagingRequirementsForm
          v-model="createFormData"
          :loading="createLoading"
          :prefilled-item-name="prefilledItemName"
          @submit="handleCreateSubmit"
          @cancel="handleCreateCancel"
        />
      </div>
    </ElDrawer>

    <!-- 撤销需求抽屉 -->
    <ElDrawer
      v-model="cancelDialogVisible"
      title="撤销封装需求"
      size="400px"
      direction="rtl"
      class="cancel-requirement-drawer"
    >
      <div class="p-4 h-full">
        <ElForm :model="cancelFormData" label-width="100px" label-position="left">
          <ElFormItem label="需求ID">
            <ElInput v-model="cancelFormData.id" disabled />
          </ElFormItem>

          <ElFormItem label="撤销备注" required>
            <ElInput
              v-model="cancelFormData.remark"
              type="textarea"
              :rows="4"
              placeholder="请输入撤销原因"
              maxlength="500"
              show-word-limit
            />
          </ElFormItem>
        </ElForm>

        <ElDivider />

        <div class="flex justify-end gap-2">
          <ElButton @click="cancelDialogVisible = false">取消</ElButton>
          <ElButton type="danger" :loading="cancelLoading" @click="handleCancelSubmit">
            确认撤销
          </ElButton>
        </div>
      </div>
    </ElDrawer>

    <!-- 附订单号抽屉 -->
    <ElDrawer
      v-model="attachOrderDialogVisible"
      title="附订单号"
      size="400px"
      direction="rtl"
      class="attach-order-drawer"
    >
      <div class="p-4 h-full">
        <ElForm :model="attachOrderFormData" label-width="100px" label-position="left">
          <ElFormItem label="需求ID">
            <ElInput v-model="attachOrderFormData.id" disabled />
          </ElFormItem>

          <ElFormItem label="封装订单号" required>
            <ElInput
              v-model="attachOrderFormData.packagingOrders"
              placeholder="请输入封装订单号，多个订单号用逗号分隔"
              maxlength="200"
            />
          </ElFormItem>

          <ElFormItem label="外协备注">
            <ElInput
              v-model="attachOrderFormData.remarkB"
              type="textarea"
              :rows="3"
              placeholder="请输入外协备注"
              maxlength="300"
              show-word-limit
            />
          </ElFormItem>
        </ElForm>

        <ElDivider />

        <div class="flex justify-end gap-2">
          <ElButton @click="attachOrderDialogVisible = false">取消</ElButton>
          <ElButton type="primary" :loading="attachOrderLoading" @click="handleAttachOrderSubmit">
            确认附单
          </ElButton>
        </div>
      </div>
    </ElDrawer>
  </div>
</template>

<style scoped lang="less">
// 响应式设计
@media (width <= 1200px) {
  .@{prefix-cls} {
    &__search {
      .flex {
        align-items: stretch;
      }
    }

    // 分页区域响应式
    .flex.justify-between {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;

      .text-sm {
        .flex.items-center {
          flex-wrap: wrap;
          gap: 8px;

          span {
            font-size: 11px;
            white-space: nowrap;
          }
        }
      }
    }

    :deep(.el-pagination) {
      justify-content: center;

      .el-pagination__sizes,
      .el-pagination__total {
        display: none;
      }

      .el-pager li {
        height: 24px;
        min-width: 24px;
        font-size: 11px;
        line-height: 22px;
      }

      .btn-prev,
      .btn-next {
        height: 24px;
        font-size: 11px;
      }
    }
  }
}

.@{prefix-cls} {
  padding: 0;
}

// 高级搜索表单样式
:deep(.el-drawer__body) {
  .el-form {
    .el-form-item {
      .el-form-item__content {
        .el-date-editor,
        .el-input,
        .el-select {
          width: 100% !important;
        }

        .el-date-editor.el-input {
          width: 100% !important;
        }
      }
    }
  }
}

// 暗色主题适配
.dark .@{prefix-cls} {
  &__search,
  &__table {
    border-color: var(--el-border-color-darker);
  }
}
@prefix-cls: ~'@{adminNamespace}-chip-packaging-requirements';
</style>
