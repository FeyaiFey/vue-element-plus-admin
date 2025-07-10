<script setup lang="ts">
import { ref, onMounted, PropType } from 'vue'
import { useTable } from '@/hooks/web/useTable'
import {
  ElInput,
  ElForm,
  ElFormItem,
  ElDrawer,
  ElButton,
  ElDivider,
  ElMessage,
  ElRow,
  ElCol
} from 'element-plus'
import { Icon } from '@/components/Icon'
import { useDesign } from '@/hooks/web/useDesign'
import StockTable from './components/StockTable.vue'
import StockSummaryTable from './components/StockSummaryTable.vue'
import StockSummaryBarChart from './components/StockSummaryBarChart.vue'
import { StockReportQuery, StockSummary } from '@/api/report/types'
import {
  getStockReportListApi,
  exportStockReportListApi,
  getStockSummaryListApi
} from '@/api/report'

// 使用设计系统
const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('stock-list')

// 定义组件名称（用于keep-alive缓存）
defineOptions({
  name: 'Stock'
})

// 定义 props
const props = defineProps({
  tableType: {
    type: String as PropType<'detail' | 'summary'>,
    default: 'detail'
  }
})

const searchParams = ref<StockReportQuery>({
  itemCode: undefined,
  itemName: undefined,
  lotCode: undefined,
  burningProgram: undefined,
  testingProgram: undefined,
  featureGroupName: undefined,
  warehouse: undefined
})

// 抽屉相关
const drawerVisible = ref(false)
const advancedSearchParams = ref<{
  itemName?: string | undefined
  lotCode?: string | undefined
  burningProgram?: string | undefined
  testingProgram?: string | undefined
  featureGroupName?: string | undefined
  warehouse?: string | undefined
}>({
  itemName: undefined,
  lotCode: undefined,
  burningProgram: undefined,
  testingProgram: undefined,
  featureGroupName: undefined,
  warehouse: undefined
})

// 主要搜索条件（品名）
const quickSearch = ref('')

const { tableState, tableMethods } = useTable({
  immediate: false, // 关闭初始化时自动查询
  fetchDataApi: async () => {
    const [res1, res2] = await Promise.all([
      getStockReportListApi(searchParams.value),
      getStockSummaryListApi(searchParams.value)
    ])

    // 更新汇总表数据
    summaryList.value = res2.data.list || []

    return {
      list: res1.data.list || [],
      total: res1.data.total || 0
    }
  }
})

const { dataList, loading, total } = tableState
const { getList } = tableMethods

// 汇总表数据
const summaryList = ref<StockSummary[]>([])

// 搜索方法
const handleSearch = () => {
  // 验证是否至少填写了一个查询参数
  const hasQuickSearch = quickSearch.value && quickSearch.value.trim() !== ''
  const hasAdvancedSearch = Object.values(searchParams.value).some(
    (value) => value !== undefined && value !== null && value !== ''
  )

  if (!hasQuickSearch && !hasAdvancedSearch) {
    ElMessage.warning('请至少填写一个查询条件')
    return
  }

  // 清空之前的选中状态和汇总信息
  selectedRows.value = []
  showSummary.value = false
  summaryData.value = {
    count: 0,
    qtySum: 0,
    secondQtySum: 0
  }

  searchParams.value.itemCode = quickSearch.value || undefined
  getList()
}

// 应用高级搜索
const handleAdvancedSearch = () => {
  // 验证高级搜索参数
  const hasAdvancedParams = Object.values(advancedSearchParams.value).some(
    (value) => value !== undefined && value !== null && value !== ''
  )

  if (!hasAdvancedParams && (!quickSearch.value || quickSearch.value.trim() === '')) {
    ElMessage.warning('请至少填写一个查询条件')
    return
  }

  // 关闭抽屉
  drawerVisible.value = false

  // 合并高级搜索参数到主搜索参数
  Object.assign(searchParams.value, advancedSearchParams.value)

  // 执行搜索
  handleSearch()
}

// 重置高级搜索
const handleResetAdvanced = () => {
  advancedSearchParams.value = {
    itemName: undefined,
    lotCode: undefined,
    burningProgram: undefined,
    testingProgram: undefined,
    featureGroupName: undefined,
    warehouse: undefined
  }

  // 清空主搜索参数中的高级搜索部分
  searchParams.value.itemName = undefined
  searchParams.value.lotCode = undefined
  searchParams.value.burningProgram = undefined
  searchParams.value.testingProgram = undefined
  searchParams.value.featureGroupName = undefined
  searchParams.value.warehouse = undefined

  // 清空快速搜索
  quickSearch.value = ''

  // 清空表格数据，不执行查询
  dataList.value = []
  summaryList.value = []

  // 确保不显示加载状态
  loading.value = false

  // 清空选中状态和汇总信息
  selectedRows.value = []
  showSummary.value = false
  summaryData.value = {
    count: 0,
    qtySum: 0,
    secondQtySum: 0
  }
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
  qtySum: 0,
  secondQtySum: 0
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

  const qtySum = rows.reduce((sum, row) => sum + (Number(row.qty) || 0), 0)
  const secondQtySum = rows.reduce((sum, row) => sum + (Number(row.secondQty) || 0), 0)

  summaryData.value = {
    count,
    qtySum,
    secondQtySum
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

// 下载表格
const handleDownload = async () => {
  try {
    downloading.value = true
    downloadProgress.value = 0

    // 显示下载开始提示
    ElMessage.info('正在生成Excel文件，请稍候...')

    // 调用导出API，传入当前搜索条件
    const response = await exportStockReportListApi({
      ...searchParams.value
    })

    // 检查响应
    if (!response || !response.data) {
      throw new Error('下载失败：服务器响应异常')
    }

    // 获取文件名
    const disposition = (response as any).headers?.['content-disposition']
    let filename = `stock_${new Date().toLocaleDateString()}.xlsx`

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

onMounted(() => {
  // 通过 useTable 的 immediate: false 配置已关闭自动查询
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
            placeholder="尽量输入完整品号..."
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
            :disabled="downloading || (dataList.length === 0 && summaryList.length === 0)"
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
      <StockTable
        :table-data="dataList"
        :loading="loading"
        :table-type="props.tableType"
        :enable-selection="true"
        table-height="calc(100vh - 240px)"
        @selection-change="handleSelectionChange"
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
            <span>数量: {{ formatNumber(summaryData.qtySum, 0) }}</span>
            <span>第二数量: {{ formatNumber(summaryData.secondQtySum) }}</span>
          </div>
        </div>
      </div>
    </div>

    <ElRow :gutter="20">
      <ElCol :span="24" class="text-center text-lg font-bold mb-2">汇总信息</ElCol>
    </ElRow>

    <ElRow :gutter="20">
      <ElCol :xl="12" :lg="12" :md="24" :sm="24" :xs="24">
        <StockSummaryTable
          :table-data="summaryList"
          :loading="loading"
          :table-type="props.tableType"
          table-height="500px"
        />
      </ElCol>
      <ElCol :xl="12" :lg="12" :md="24" :sm="24" :xs="24">
        <StockSummaryBarChart :summary-list="summaryList" />
      </ElCol>
    </ElRow>

    <!-- 高级搜索抽屉 -->
    <ElDrawer v-model="drawerVisible" title="高级搜索" size="400px" direction="rtl">
      <div class="p-4">
        <ElForm :model="advancedSearchParams" label-width="100px" label-position="left">
          <ElFormItem label="品名">
            <ElInput v-model="advancedSearchParams.itemName" placeholder="请输入品名" clearable />
          </ElFormItem>

          <ElFormItem label="批号">
            <ElInput v-model="advancedSearchParams.lotCode" placeholder="请输入批号" clearable />
          </ElFormItem>

          <ElFormItem label="烧录程序">
            <ElInput
              v-model="advancedSearchParams.burningProgram"
              placeholder="请输入烧录程序"
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

          <ElFormItem label="品号群组名称">
            <ElInput
              v-model="advancedSearchParams.featureGroupName"
              placeholder="请输入品号群组名称"
              clearable
            />
          </ElFormItem>

          <ElFormItem label="仓库">
            <ElInput v-model="advancedSearchParams.warehouse" placeholder="请输入仓库" clearable />
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
@prefix-cls: ~'@{adminNamespace}-stock-list';
</style>
