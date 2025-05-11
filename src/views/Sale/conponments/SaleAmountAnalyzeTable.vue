<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElTable, ElTableColumn, ElEmpty } from 'element-plus'
import type { SaleAmountAnalyze } from '@/api/sale/type'

const props = defineProps<{
  data: SaleAmountAnalyze[]
  loading?: boolean
}>()

// 可能的列配置
interface ColumnConfig {
  prop: keyof SaleAmountAnalyze
  label: string
  width?: string
  headerAlign?: 'left' | 'center' | 'right'
  align?: 'left' | 'center' | 'right'
  formatter?: (row: SaleAmountAnalyze) => string
}

// 列配置
const columns = ref<ColumnConfig[]>([
  { prop: 'YEAR', label: '年份', width: '100', align: 'center' },
  { prop: 'MONTH', label: '月份', width: '100', align: 'center' },
  { prop: 'ADMIN_UNIT_NAME', label: '销售团队', width: '150', align: 'center' },
  { prop: 'EMPLOYEE_NAME', label: '业务员', width: '120', align: 'center' },
  { prop: 'SHORTCUT', label: '产品线', width: '120', align: 'center' },
  { prop: 'ITEM_NAME', label: '芯片名称', width: '180', align: 'left' },
  {
    prop: 'PRICE_QTY',
    label: '数量',
    width: '120',
    align: 'right',
    formatter: (row) => row.PRICE_QTY?.toLocaleString() ?? '-'
  },
  {
    prop: 'AMOUNT',
    label: '金额',
    width: '150',
    align: 'right',
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
  if (!props.data || props.data.length === 0) return columns.value

  return columns.value.filter((column) => {
    // 检查这一列是否至少有一个非null、非undefined的值
    return props.data.some((row) => row[column.prop] !== null && row[column.prop] !== undefined)
  })
})

// 表格是否有数据
// const hasData = computed(() => props.data && props.data.length > 0)
</script>

<template>
  <div class="sale-amount-analyze-table">
    <ElTable
      v-loading="loading"
      :data="data"
      border
      stripe
      style="width: 100%"
      max-height="calc(100vh - 250px)"
      :empty-text="loading ? '加载中...' : '暂无数据'"
    >
      <template v-for="column in visibleColumns" :key="column.prop">
        <ElTableColumn
          :prop="column.prop"
          :label="column.label"
          :width="column.width"
          :header-align="column.align || 'center'"
          :align="column.align || 'center'"
          show-overflow-tooltip
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
