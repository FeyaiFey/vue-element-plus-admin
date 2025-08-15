<script setup lang="ts">
import { computed, PropType, ref, onMounted, watch } from 'vue'
import { ElTable, ElTableColumn, ElInput, ElMessage } from 'element-plus'
import { Icon } from '@/components/Icon'
import { useDesign } from '@/hooks/web/useDesign'
import { getSaleInvoiceVsReceiptApi } from '@/api/sale'
import { SaleInvoiceVsReceipt, SaleInvoiceVsReceiptQuery } from '@/api/sale/types'

// 使用设计系统
const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('invoice-vs-collection-table')

// 定义 props
const props = defineProps({
  tableData: {
    type: Array as PropType<SaleInvoiceVsReceipt[]>,
    default: () => []
  },
  tableMinHeight: {
    type: String,
    default: 'auto'
  },
  componentHeight: {
    type: String,
    default: 'auto'
  },
  autoLoad: {
    type: Boolean,
    default: true
  },
  useExternalData: {
    type: Boolean,
    default: false
  }
})

// 组件内部数据
const invoiceVsCollectionData = ref<SaleInvoiceVsReceipt[]>([])
const loading = ref(false)
const errorMessage = ref('')

// 查询参数
const queryParams = ref<SaleInvoiceVsReceiptQuery>({
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1
})

// 表单验证状态
const yearError = ref('')
const monthError = ref('')

const emit = defineEmits<{
  (e: 'search', params: { year: number; month?: number }): void
  (e: 'data-loaded', data: SaleInvoiceVsReceipt[]): void
  (e: 'loading-change', loading: boolean): void
  (e: 'sort-change', sort: { prop: string | null; order: 'ascending' | 'descending' | null }): void
}>()

// 验证查询参数
const validateParams = (): boolean => {
  yearError.value = ''
  monthError.value = ''

  if (!queryParams.value.year) {
    yearError.value = '年份不能为空'
    return false
  }

  if (queryParams.value.year < 2000 || queryParams.value.year > 2100) {
    yearError.value = '年份必须在2000-2100之间'
    return false
  }

  if (queryParams.value.month && (queryParams.value.month < 1 || queryParams.value.month > 12)) {
    monthError.value = '月份必须在1-12之间'
    return false
  }

  return true
}

// 获取数据
const getData = async () => {
  if (!validateParams()) {
    return
  }

  try {
    loading.value = true
    errorMessage.value = ''
    emit('loading-change', true)

    // 构建API查询参数，过滤掉空的月份
    const apiParams: SaleInvoiceVsReceiptQuery = {
      year: queryParams.value.year!
    }
    if (queryParams.value.month) {
      apiParams.month = queryParams.value.month
    }

    const res = await getSaleInvoiceVsReceiptApi(apiParams)
    invoiceVsCollectionData.value = res.data.list || []

    emit('data-loaded', invoiceVsCollectionData.value)
  } catch (error) {
    console.error('获取开票额VS回款额数据失败:', error)
    errorMessage.value = '数据加载失败，请重试'
    ElMessage.error('数据加载失败')
  } finally {
    loading.value = false
    emit('loading-change', false)
  }
}

// 处理搜索事件
const handleSearch = () => {
  if (validateParams()) {
    getData()
    // 构建查询参数，月份为空时不包含
    const searchParams: { year: number; month?: number } = {
      year: queryParams.value.year!
    }
    if (queryParams.value.month) {
      searchParams.month = queryParams.value.month
    }
    emit('search', searchParams)
  }
}

// 表格数据 - 优先使用外部数据，如果没有则使用内部数据
const tableData = computed(() => {
  if (props.useExternalData && props.tableData.length > 0) {
    return props.tableData
  }
  return invoiceVsCollectionData.value
})

// 表格列定义
const detailColumns = [
  {
    prop: 'employeeName',
    label: '业务员',
    minWidth: 70,
    headerAlign: 'center',
    align: 'center',
    fixed: 'left'
  },
  {
    prop: 'amountInvoice',
    label: '实际开票额',
    minWidth: 120,
    headerAlign: 'center',
    align: 'right',
    sortable: 'custom',
    sortMethod: (a: any, b: any) => {
      // 排除总计行
      if (isTotalRow(a) || isTotalRow(b)) return 0
      return (a.amountInvoice || 0) - (b.amountInvoice || 0)
    }
  },
  {
    prop: 'amountCollection',
    label: '实际回款额',
    minWidth: 120,
    headerAlign: 'center',
    align: 'right',
    sortable: 'custom',
    sortMethod: (a: any, b: any) => {
      // 排除总计行
      if (isTotalRow(a) || isTotalRow(b)) return 0
      return (a.amountCollection || 0) - (b.amountCollection || 0)
    }
  },
  {
    prop: 'completeRate',
    label: '完成率',
    minWidth: 120,
    headerAlign: 'center',
    align: 'right',
    fixed: 'right',
    sortable: 'custom',
    sortMethod: (a: any, b: any) => {
      // 排除总计行
      if (isTotalRow(a) || isTotalRow(b)) return 0
      return (a.completeRate || 0) - (b.completeRate || 0)
    }
  },
  {
    prop: 'departmentName',
    label: '部门',
    minWidth: 120,
    headerAlign: 'center',
    align: 'center'
  }
]

// 排序状态
const sortState = ref<{
  prop: string | null
  order: 'ascending' | 'descending' | null
}>({
  prop: null,
  order: null
})

// 处理排序变化
const handleSortChange = ({ prop, order }: { prop: string; order: string }) => {
  // 确保order的类型正确
  const validOrder = order === 'ascending' || order === 'descending' ? order : null
  sortState.value = { prop, order: validOrder }

  if (!prop || !validOrder) {
    // 重置排序，恢复原始数据
    if (props.useExternalData && props.tableData.length > 0) {
      // 使用外部数据时，需要父组件处理排序
      emit('sort-change', { prop: null, order: null })
    }
    return
  }

  // 对数据进行排序
  const sortedData = [...tableData.value].sort((a, b) => {
    // 排除总计行（通过检查特定字段或标识来判断）
    if (isTotalRow(a) || isTotalRow(b)) return 0

    let aValue = a[prop]
    let bValue = b[prop]

    // 处理完成率的特殊排序
    if (prop === 'completeRate') {
      aValue = aValue || 0
      bValue = bValue || 0
    } else {
      // 金额字段，转换为数字进行比较
      aValue = Number(aValue) || 0
      bValue = Number(bValue) || 0
    }

    if (validOrder === 'ascending') {
      return aValue - bValue
    } else {
      return bValue - aValue
    }
  })

  // 更新内部数据
  if (!props.useExternalData) {
    invoiceVsCollectionData.value = sortedData
  } else {
    // 使用外部数据时，发送排序事件给父组件
    emit('sort-change', { prop, order: validOrder })
  }
}

// 获取排序后的表格数据
const sortedTableData = computed(() => {
  let data = tableData.value

  // 如果有排序状态，应用排序
  if (sortState.value.prop && sortState.value.order) {
    data = [...data].sort((a, b) => {
      // 排除总计行
      if (isTotalRow(a) || isTotalRow(b)) return 0

      const prop = sortState.value.prop!
      let aValue = a[prop]
      let bValue = b[prop]

      // 处理完成率的特殊排序
      if (prop === 'completeRate') {
        aValue = aValue || 0
        bValue = bValue || 0
      } else {
        // 金额字段，转换为数字进行比较
        aValue = Number(aValue) || 0
        bValue = Number(bValue) || 0
      }

      if (sortState.value.order === 'ascending') {
        return aValue - bValue
      } else {
        return bValue - aValue
      }
    })
  }

  return data
})

// 判断是否为总计行的辅助函数
const isTotalRow = (row: SaleInvoiceVsReceipt): boolean => {
  // 通过多种方式判断是否为总计行
  return (
    row.departmentName === '总计' ||
    row.departmentName === '合计' ||
    row.employeeName === '总计' ||
    row.employeeName === '合计' ||
    (row as any).isTotal === true ||
    (row as any).rowType === 'total'
  )
}

// 获取完成率背景色（数值越大，颜色越偏向成功色，数值越小越偏向危险色）
const getPercentageColor = (percentage: number): string => {
  if (percentage >= 100) return '#21ba45' // 深绿色，极高完成率
  if (percentage >= 90) return '#67C23A' // 成功色
  if (percentage >= 80) return '#95d475' // 浅成功色
  if (percentage >= 70) return '#b3e19d' // 更浅的成功色
  if (percentage >= 60) return '#409EFF' // 主要色
  if (percentage >= 50) return '#f7ba2a' // 警告色
  if (percentage >= 30) return '#faad14' // 橙色警告
  return '#F56C6C' // 危险色
}

// 格式化金额
const formatAmount = (value: number): string => {
  if (value === null || value === undefined) return '0.00'
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// 格式化完成率
const formatCompleteRate = (value: number): string => {
  if (value === null || value === undefined) return '0.00'
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%'
}

// 监听查询参数变化，自动搜索
watch(
  () => [queryParams.value.year, queryParams.value.month],
  ([newYear, newMonth], [oldYear, oldMonth]) => {
    if (newYear !== oldYear || newMonth !== oldMonth) {
      // 年份变化时自动搜索，月份变化时不自动搜索
      if (newYear !== oldYear && props.autoLoad) {
        getData()
      }
    }
  },
  { deep: true }
)

// 组件挂载时自动加载数据
onMounted(() => {
  if (props.autoLoad && !props.useExternalData) {
    getData()
  }
})
</script>

<template>
  <div
    :class="prefixCls"
    :style="{ height: componentHeight }"
    class="h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg overflow-hidden"
  >
    <div
      class="h-40px flex items-center justify-between text-center font-bold text-20px dark:text-white-600 mb-2 px-4"
    >
      <div class="flex-1"></div>
      <div class="flex-1 text-center text-16px">开票额VS回款额</div>
      <div class="flex-1 flex justify-end items-center gap-2">
        <span class="text-gray-500 dark:text-gray-400 text-14px">查询参数：</span>
        <div class="flex items-center gap-1">
          <ElInput
            v-model="queryParams.year"
            size="small"
            placeholder="年份"
            :class="{ 'border-red-500': yearError }"
            style="width: 70px"
            @keyup.enter="handleSearch"
          />
          <span class="text-red-500 text-12px" v-if="yearError">{{ yearError }}</span>
        </div>
        <ElInput
          v-model="queryParams.month"
          size="small"
          placeholder="月份(可选)"
          :class="{ 'border-red-500': monthError }"
          style="width: 70px"
          @keyup.enter="handleSearch"
        />
        <span class="text-red-500 text-12px" v-if="monthError">{{ monthError }}</span>
      </div>
    </div>

    <!-- 错误信息显示 -->
    <div v-if="errorMessage" class="px-4 mb-2">
      <div class="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-14px">
        {{ errorMessage }}
      </div>
    </div>

    <ElTable
      :data="sortedTableData"
      :min-height="tableMinHeight"
      :loading="loading"
      border
      class="flex-1"
      highlight-current-row
      @sort-change="handleSortChange"
    >
      <!-- 数据列 -->
      <template v-for="column in detailColumns" :key="column.prop">
        <ElTableColumn
          :prop="column.prop"
          :label="column.label"
          :min-width="column.minWidth"
          :fixed="column.fixed"
          :align="column.align || 'left'"
          show-overflow-tooltip
          :sortable="column.sortable"
          :sort-method="column.sortMethod"
        >
          <template #default="{ row }">
            <!-- 金额字段格式化 -->
            <span
              v-if="column.prop === 'amountInvoice' || column.prop === 'amountCollection'"
              class="font-medium text-gray-900 dark:text-gray-100"
            >
              ￥ {{ formatAmount(row[column.prop]) }}
            </span>
            <div v-else-if="column.prop === 'completeRate'" class="percentage-cell">
              <div
                class="percentage-bar"
                :style="{
                  width: `${Math.min(row.completeRate ?? 0, 100)}%`,
                  backgroundColor: getPercentageColor(row.completeRate ?? 0)
                }"
              ></div>
              <span class="percentage-text">
                {{ formatCompleteRate(row[column.prop]) }}
              </span>
            </div>
            <!-- 其他字段普通文本显示 -->
            <span v-else class="text-gray-700 dark:text-gray-200">
              {{ row[column.prop] || '-' }}
            </span>
          </template>
        </ElTableColumn>
      </template>
      <!-- 空数据插槽 -->
      <template #empty>
        <div
          :class="`${prefixCls}__empty`"
          class="h-full min-h-200px flex items-center justify-center"
        >
          <div class="text-center">
            <Icon icon="ep:document" :size="48" class="text-gray-300 dark:text-gray-600 mb-4" />
            <p class="m-0 text-gray-500 dark:text-gray-400 text-14px">
              {{ loading ? '数据加载中...' : '暂无数据' }}
            </p>
          </div>
        </div>
      </template>
    </ElTable>
  </div>
</template>

<style scoped lang="less">
@prefix-cls: ~'@{adminNamespace}-invoice-vs-collection-table';

// 响应式设计
@media (width <= 768px) {
  .@{prefix-cls} {
    :deep(.el-table) {
      .el-table__header-wrapper .el-table__header th {
        padding: 8px 4px;
        font-size: 12px;
      }

      .el-table__body-wrapper .el-table__row {
        .el-table__cell {
          padding: 8px 4px;
          font-size: 12px;
        }
      }
    }
  }
}

// 打印样式
@media print {
  .@{prefix-cls} {
    box-shadow: none;

    :deep(.el-table) {
      .el-table__body-wrapper .el-table__row:hover {
        background-color: transparent;
      }
    }
  }
}

:deep(.el-table) {
  flex: 1;
  // 表头样式
  .el-table__header-wrapper {
    .el-table__header {
      th {
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        text-align: center;
      }
    }
  }
  // 表格行样式
  .el-table__body-wrapper {
    .el-table__row {
      font-size: 13px;

      &:hover {
        background-color: var(--el-fill-color-light);
      }

      .el-table__cell {
        padding: 8px 0;
      }
    }
  }

  .el-table__empty-block {
    display: flex;
    height: 100%;
    align-items: center;
    justify-content: center;
  }
}

// 暗色主题适配
.dark .@{prefix-cls} {
  :deep(.el-table) {
    .el-table__header-wrapper .el-table__header th {
      background: linear-gradient(
        135deg,
        var(--el-fill-color-dark) 0%,
        var(--el-fill-color-darker) 100%
      );
    }

    .el-table__body-wrapper .el-table__row {
      &:hover {
        background-color: var(--el-fill-color-dark);
      }
    }
  }
}

.percentage-cell {
  position: relative;
  width: 100%;
  height: 23px;
  overflow: hidden;
  background-color: #f5f7fa;
  border-radius: 3px;
}

.percentage-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  opacity: 0.4;
  box-shadow: 0 0 4px rgb(0 0 0 / 10%);
  transition: all 0.3s ease;
}

.percentage-text {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  display: flex;
  width: 100%;
  height: 100%;
  font-weight: 700;
  color: var(--el-text-color-primary);
  align-items: center;
  justify-content: center;
  text-shadow: 0 0 2px rgb(255 255 255 / 80%);
}

.dark {
  .percentage-text {
    color: #000 !important;
  }
}
</style>
