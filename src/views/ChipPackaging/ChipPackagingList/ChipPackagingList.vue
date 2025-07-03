<script setup lang="ts">
import { ref, onMounted, PropType } from 'vue'
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
  ElMessage
} from 'element-plus'
import { Icon } from '@/components/Icon'
import { useDesign } from '@/hooks/web/useDesign'
import ResizeDialog from '@/components/Dialog/src/ResizeDialog.vue'
import ChipPackagingTable from './components/ChipPackagingListTable.vue'
import ChipPackagingWipTable from '../ChipPackagingWip/components/ChipPackagingWipTable.vue'
import ChipPackagingReceiptTable from '../ChipPackagingReceipt/components/ChipPackagingReceiptTable.vue'
import {
  ChipPackagingQuery,
  ChipPackagingWipQuery,
  ChipPackagingReceiptQuery
} from '@/api/chipPackaging/types'
import {
  getChipPackagingListApi,
  exportChipPackagingListApi,
  getChipPackagingWipListApi,
  getChipPackagingReceiptListApi
} from '@/api/chipPackaging'

// 使用设计系统
const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('chip-packaging-list')

// 定义组件名称（用于keep-alive缓存）
defineOptions({
  name: 'ChipPackagingList'
})

// 定义 props
const props = defineProps({
  tableType: {
    type: String as PropType<'detail' | 'summary'>,
    default: 'detail'
  }
})

const searchParams = ref<ChipPackagingQuery>({
  pageIndex: 1,
  pageSize: 20,
  docNo: undefined,
  itemCode: undefined,
  packageType: undefined,
  lotNo: undefined,
  processingFlow: undefined,
  testingProgram: undefined,
  drawingNo: undefined,
  wire: undefined,
  packagingDateStart: undefined,
  packagingDateEnd: undefined,
  supplier: undefined,
  receiptClose: undefined,
  bomType: undefined,
  waferName: undefined,
  waferLotNo: undefined
})

// 抽屉相关
const drawerVisible = ref(false)
const advancedSearchParams = ref<{
  docNo: string | undefined
  packageType: string | undefined
  lotNo: string | undefined
  processingFlow: string | undefined
  testingProgram: string | undefined
  drawingNo: string | undefined
  wire: string | undefined
  packagingDateStart: string | undefined
  packagingDateEnd: string | undefined
  supplier: string | undefined
  receiptClose: string | undefined
  bomType: string | undefined
  waferName: string | undefined
  waferLotNo: string | undefined
}>({
  docNo: undefined,
  packageType: undefined,
  lotNo: undefined,
  processingFlow: undefined,
  testingProgram: undefined,
  drawingNo: undefined,
  wire: undefined,
  packagingDateStart: undefined,
  packagingDateEnd: undefined,
  supplier: undefined,
  receiptClose: undefined,
  bomType: undefined,
  waferName: undefined,
  waferLotNo: undefined
})

// 主要搜索条件（品名）
const quickSearch = ref('')

const { tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const res = await getChipPackagingListApi(searchParams.value)
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
    docNo: undefined,
    packageType: undefined,
    lotNo: undefined,
    processingFlow: undefined,
    testingProgram: undefined,
    drawingNo: undefined,
    wire: undefined,
    packagingDateStart: undefined,
    packagingDateEnd: undefined,
    supplier: undefined,
    receiptClose: undefined,
    bomType: undefined,
    waferName: undefined,
    waferLotNo: undefined
  }

  // 清空主搜索参数中的高级搜索部分
  searchParams.value.docNo = undefined
  searchParams.value.packageType = undefined
  searchParams.value.lotNo = undefined
  searchParams.value.processingFlow = undefined
  searchParams.value.testingProgram = undefined
  searchParams.value.drawingNo = undefined
  searchParams.value.wire = undefined
  searchParams.value.packagingDateStart = undefined
  searchParams.value.packagingDateEnd = undefined
  searchParams.value.supplier = undefined
  searchParams.value.receiptClose = undefined
  searchParams.value.bomType = undefined
  searchParams.value.waferName = undefined
  searchParams.value.waferLotNo = undefined

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
  receiptQtySum: 0,
  wipQtySum: 0,
  businessQtyAvg: 0,
  receiptQtyAvg: 0
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
  const receiptQtySum = rows.reduce((sum, row) => sum + (Number(row.receiptQty) || 0), 0)
  const wipQtySum = rows.reduce((sum, row) => sum + (Number(row.wipQty) || 0), 0)

  summaryData.value = {
    count,
    businessQtySum,
    receiptQtySum,
    wipQtySum,
    businessQtyAvg: count > 0 ? businessQtySum / count : 0,
    receiptQtyAvg: count > 0 ? receiptQtySum / count : 0
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
const currentRowDocNo = ref('')
const wipDetailData = ref<any[]>([])
const wipDetailLoading = ref(false)
const wipDialogVisible = ref(false)
const receiptDialogVisible = ref(false)
const receiptDetailData = ref<any[]>([])
const receiptDetailLoading = ref(false)

// 下载表格
const handleDownload = async () => {
  try {
    downloading.value = true
    downloadProgress.value = 0

    // 显示下载开始提示
    ElMessage.info('正在生成Excel文件，请稍候...')

    // 调用导出API，传入当前搜索条件
    const response = await exportChipPackagingListApi({
      ...searchParams.value
    })

    // 检查响应
    if (!response || !response.data) {
      throw new Error('下载失败：服务器响应异常')
    }

    // 获取文件名
    const disposition = (response as any).headers?.['content-disposition']
    let filename = `chipPackagingOrders_${new Date().toLocaleDateString()}.xlsx`

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

// 处理wipQty点击事件
const handleWipQtyClick = async (docNo: string) => {
  currentRowDocNo.value = docNo
  wipDialogVisible.value = true

  // 查询详细数据
  wipDetailLoading.value = true
  try {
    const queryParams: ChipPackagingWipQuery = {
      pageIndex: undefined,
      pageSize: undefined,
      docNo: docNo,
      itemCode: undefined,
      isTr: undefined,
      leadDays: undefined,
      isStranded: undefined,
      isClosed: undefined
    }

    const res = await getChipPackagingWipListApi(queryParams)
    wipDetailData.value = res.data.list || []
  } catch (error) {
    console.error('查询在制详情失败:', error)
    ElMessage.error('查询在制详情失败')
    wipDetailData.value = []
  } finally {
    wipDetailLoading.value = false
  }
}

// 处理receiptQty点击事件
const handleReceiptQtyClick = async (docNo: string) => {
  currentRowDocNo.value = docNo
  receiptDialogVisible.value = true

  // 查询详细数据
  receiptDetailLoading.value = true
  try {
    const queryParams: ChipPackagingReceiptQuery = {
      pageIndex: undefined,
      pageSize: undefined,
      purchaseNo: docNo,
      packageType: undefined,
      lotCode: undefined,
      arrivalDateStart: undefined,
      arrivalDateEnd: undefined
    }

    const res = await getChipPackagingReceiptListApi(queryParams)
    receiptDetailData.value = res.data.list || []
  } catch (error) {
    console.error('查询收货详情失败:', error)
    ElMessage.error('查询收货详情失败')
    receiptDetailData.value = []
  } finally {
    receiptDetailLoading.value = false
  }
}

onMounted(() => {
  getList()
})
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
            placeholder="搜索品名..."
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
      <ChipPackagingTable
        :table-data="dataList"
        :loading="loading"
        :table-type="props.tableType"
        :enable-selection="true"
        table-height="calc(100vh - 240px)"
        @selection-change="handleSelectionChange"
        @wip-qty-click="handleWipQtyClick"
        @receipt-qty-click="handleReceiptQtyClick"
      />
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
            <span>总收货量: {{ formatNumber(summaryData.receiptQtySum, 0) }}</span>
            <span>总在制量: {{ formatNumber(summaryData.wipQtySum, 0) }}</span>
          </div>
          <div class="flex items-center gap-4">
            <span>均业务量: {{ formatNumber(summaryData.businessQtyAvg, 0) }}</span>
            <span>均收货量: {{ formatNumber(summaryData.receiptQtyAvg, 0) }}</span>
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

    <!-- 高级搜索抽屉 -->
    <ElDrawer v-model="drawerVisible" title="高级搜索" size="400px" direction="rtl">
      <div class="p-4">
        <ElForm :model="advancedSearchParams" label-width="80px" label-position="left">
          <ElFormItem label="订单号">
            <ElInput v-model="advancedSearchParams.docNo" placeholder="请输入订单号" clearable />
          </ElFormItem>

          <ElFormItem label="封装形式">
            <ElInput
              v-model="advancedSearchParams.packageType"
              placeholder="请输入封装形式"
              clearable
            />
          </ElFormItem>

          <ElFormItem label="打印批号">
            <ElInput v-model="advancedSearchParams.lotNo" placeholder="请输入打印批号" clearable />
          </ElFormItem>

          <ElFormItem label="加工方式">
            <ElInput
              v-model="advancedSearchParams.processingFlow"
              placeholder="请输入加工方式"
              clearable
            />
          </ElFormItem>

          <ElFormItem label="测试程序">
            <ElInput
              v-model="advancedSearchParams.testingProgram"
              placeholder="请输入测试程序"
              clearable
            />
          </ElFormItem>

          <ElFormItem label="打线图号">
            <ElInput
              v-model="advancedSearchParams.drawingNo"
              placeholder="请输入打线图号"
              clearable
            />
          </ElFormItem>

          <ElFormItem label="线材">
            <ElInput v-model="advancedSearchParams.wire" placeholder="请输入线材" clearable />
          </ElFormItem>

          <ElFormItem label="开始日期">
            <ElDatePicker
              v-model="advancedSearchParams.packagingDateStart"
              type="date"
              placeholder="请选择开始日期"
              value-format="YYYY-MM-DD"
              clearable
              class="w-full"
            />
          </ElFormItem>

          <ElFormItem label="结束日期">
            <ElDatePicker
              v-model="advancedSearchParams.packagingDateEnd"
              type="date"
              placeholder="请选择结束日期"
              value-format="YYYY-MM-DD"
              clearable
              class="w-full"
            />
          </ElFormItem>

          <ElFormItem label="供应商">
            <ElInput v-model="advancedSearchParams.supplier" placeholder="请输入供应商" clearable />
          </ElFormItem>

          <ElFormItem label="订单状态">
            <ElSelect
              v-model="advancedSearchParams.receiptClose"
              placeholder="请选择订单状态"
              clearable
              default-first-option
            >
              <ElOption label="全部" value="undefined" />
              <ElOption label="已结束" value="1" />
              <ElOption label="未结束" value="0" />
            </ElSelect>
          </ElFormItem>

          <ElFormItem label="封装类型">
            <ElSelect
              v-model="advancedSearchParams.packageType"
              placeholder="请选择封装类型"
              clearable
              default-first-option
            >
              <ElOption label="全部" value="undefined" />
              <ElOption label="U1" value="U1" />
              <ElOption label="U2" value="U2" />
            </ElSelect>
          </ElFormItem>

          <ElFormItem label="晶圆名">
            <ElInput
              v-model="advancedSearchParams.waferName"
              placeholder="请输入晶圆名"
              clearable
            />
          </ElFormItem>

          <ElFormItem label="晶圆批号">
            <ElInput
              v-model="advancedSearchParams.waferLotNo"
              placeholder="请输入晶圆批号"
              clearable
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

    <!-- 在制详情弹窗 -->
    <ResizeDialog
      v-model="wipDialogVisible"
      :title="`在制详情 - 订单号: ${currentRowDocNo}`"
      :init-width="1200"
      :init-height="600"
      :min-resize-width="800"
      :min-resize-height="400"
    >
      <div class="p-4">
        <ChipPackagingWipTable
          :table-data="wipDetailData"
          :loading="wipDetailLoading"
          table-type="summary"
          :enable-selection="false"
        />
      </div>
      <div class="text-md text-gray-600 dark:text-gray-300 text-left mt-2">
        注意：该数量仅为进度表上的在线数量，总在线数须以报表中的在制数为准
      </div>
    </ResizeDialog>

    <!-- 收货详情弹窗 -->
    <ResizeDialog
      v-model="receiptDialogVisible"
      :title="`收货详情 - 订单号: ${currentRowDocNo}`"
      :init-width="1200"
      :init-height="600"
      :min-resize-width="800"
      :min-resize-height="400"
    >
      <div class="p-4">
        <ChipPackagingReceiptTable
          :table-data="receiptDetailData"
          :loading="receiptDetailLoading"
          table-type="summary"
          :enable-selection="true"
        />
      </div>
    </ResizeDialog>
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
@prefix-cls: ~'@{adminNamespace}-chip-packaging-list';
</style>
