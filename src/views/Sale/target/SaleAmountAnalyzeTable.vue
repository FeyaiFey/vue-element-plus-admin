<!-- Analyze的具体数据 -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElTable, ElTableColumn, ElEmpty } from 'element-plus'
import type { SaleAmountAnalyze } from '@/api/sale/type'

const props = defineProps<{
  data: SaleAmountAnalyze[]
  loading?: boolean
  drillLevel?: number
}>()

// 可能的列配置
interface ColumnConfig {
  prop: string
  label: string
  width?: string
  headerAlign?: 'left' | 'center' | 'right'
  align?: 'left' | 'center' | 'right'
  formatter?: (row: SaleAmountAnalyze) => string
  showOnLevel?: number[] // 在哪些下钻级别显示
}

// 列配置
const columns = ref<ColumnConfig[]>([
  { prop: 'YEAR', label: '年份', width: '100', align: 'center', showOnLevel: [0, 1, 2] },
  { prop: 'MONTH', label: '月份', width: '100', align: 'center', showOnLevel: [0, 1, 2] },
  { prop: 'SHORTCUT', label: '产品线', align: 'center', showOnLevel: [0] },
  { prop: 'ITEM_NAME', label: '芯片名称', align: 'left', showOnLevel: [1, 2] },
  { prop: 'EMPLOYEE_NAME', label: '业务员', align: 'center', showOnLevel: [2] },
  {
    prop: 'ADMIN_UNIT_NAME',
    label: '销售团队',
    align: 'center',
    showOnLevel: [0, 1, 2]
  },
  {
    prop: 'PRICE_QTY',
    label: '销售数量',
    align: 'right',
    showOnLevel: [0, 1, 2],
    formatter: (row) => row.PRICE_QTY?.toLocaleString() ?? '-'
  },
  {
    prop: 'AMOUNT',
    label: '销售金额',
    align: 'right',
    showOnLevel: [0, 1, 2],
    formatter: (row) =>
      row.AMOUNT
        ? `¥${row.AMOUNT.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}`
        : '-'
  }
])

// 计算哪些列应该显示
const visibleColumns = computed(() => {
  if (!props.data || props.data.length === 0) return []

  // 根据下钻级别和数据内容筛选列
  return columns.value.filter((column) => {
    // 检查这一列是否应该在当前下钻级别显示
    const showOnCurrentLevel = column.showOnLevel
      ? column.showOnLevel.includes(props.drillLevel || 0)
      : true

    // 检查这一列是否至少有一个非null、非undefined的值
    const hasData = props.data.some(
      (row) => row[column.prop] !== null && row[column.prop] !== undefined
    )

    return showOnCurrentLevel && hasData
  })
})

// 表格排序
const sortBy = ref<string>('')
const sortOrder = ref<'ascending' | 'descending'>('ascending')

// 处理排序变化
const handleSortChange = (column: any) => {
  if (column.prop) {
    sortBy.value = column.prop
    sortOrder.value = column.order || 'ascending'
  } else {
    // 如果没有指定排序列，则清除排序
    sortBy.value = ''
  }
}

// 排序后的表格数据
const sortedData = computed(() => {
  if (!props.data || props.data.length === 0) return []

  // 如果没有指定排序列，则返回原始数据
  if (!sortBy.value) return props.data

  return [...props.data].sort((a, b) => {
    const valueA = a[sortBy.value as keyof SaleAmountAnalyze] || 0
    const valueB = b[sortBy.value as keyof SaleAmountAnalyze] || 0

    return sortOrder.value === 'ascending'
      ? valueA < valueB
        ? -1
        : valueA > valueB
          ? 1
          : 0
      : valueA > valueB
        ? -1
        : valueA < valueB
          ? 1
          : 0
  })
})
</script>

<template>
  <div class="sale-amount-analyze-table">
    <ElTable
      v-loading="loading"
      :data="sortedData"
      border
      stripe
      style="width: 100%"
      max-height="400px"
      :empty-text="loading ? '加载中...' : '暂无数据'"
      @sort-change="handleSortChange"
      default-sort-order="ascending"
    >
      <template v-for="column in visibleColumns" :key="column.prop">
        <ElTableColumn
          :prop="column.prop"
          :label="column.label"
          :width="column.width"
          :header-align="column.headerAlign || 'center'"
          :align="column.align || 'center'"
          show-overflow-tooltip
          sortable="custom"
        >
          <template #default="scope" v-if="column.formatter">
            {{ column.formatter(scope.row) }}
          </template>
        </ElTableColumn>
      </template>

      <!-- 空状态 -->
      <template #empty>
        <ElEmpty v-if="!loading" description="暂无数据" />
        <div v-else class="loading-placeholder">
          <span>加载中...</span>
        </div>
      </template>
    </ElTable>
  </div>
</template>

<style lang="less" scoped>
.sale-amount-analyze-table {
  width: 100%;
  height: 100%;

  :deep(.el-table) {
    .cell {
      padding: 0 10px;
    }

    th {
      font-weight: bold;
      color: #606266;
      background-color: #f5f7fa;
    }

    .el-table__row {
      &:hover {
        background-color: #f0f9eb;
      }
    }
  }

  .loading-placeholder {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px;
    color: #909399;
  }
}
</style>
