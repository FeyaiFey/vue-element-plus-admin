<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElTable, ElTableColumn, ElSkeleton, ElSkeletonItem } from 'element-plus'
import { getSaleAmountSummaryApi } from '@/api/sale'
import type { SaleAmountQuery, SaleAmount } from '@/api/sale/type'

const props = defineProps<{
  queryParams: SaleAmountQuery
}>()

// 原始表格数据
const originalData = ref<SaleAmount[]>([])
// 表格数据（包含汇总行）
const tableData = ref<(SaleAmount & { isSummary?: boolean })[]>([])
const loading = ref(false)

// 处理数据，添加行政单位合计行
const processDataWithSummary = (data: SaleAmount[]) => {
  if (!data || !data.length) return []

  // 克隆原始数据
  const clonedData = [...data]

  // 排序数据：YEAR、MONTH升序，ADMIN_UNIT_NAME和PERCENTAGE降序
  clonedData.sort((a, b) => {
    // 首先按年份升序排序
    if (a.YEAR !== b.YEAR) {
      return (a.YEAR || 0) - (b.YEAR || 0)
    }

    // 然后按月份升序排序
    if (a.MONTH !== b.MONTH) {
      return (a.MONTH || 0) - (b.MONTH || 0)
    }

    // 然后按行政单位降序排序
    if (a.ADMIN_UNIT_NAME !== b.ADMIN_UNIT_NAME) {
      return (b.ADMIN_UNIT_NAME || '').localeCompare(a.ADMIN_UNIT_NAME || '')
    }

    // 最后按完成率降序排序
    return (b.PERCENTAGE || 0) - (a.PERCENTAGE || 0)
  })

  // 按行政单位分组
  const groupedByUnit: Record<string, SaleAmount[]> = {}

  // 对排序后的数据分组
  clonedData.forEach((item) => {
    const unitName = item.ADMIN_UNIT_NAME || '未分类'
    if (!groupedByUnit[unitName]) {
      groupedByUnit[unitName] = []
    }
    groupedByUnit[unitName].push(item)
  })

  // 合并数据，添加合计行
  const result: (SaleAmount & { isSummary?: boolean })[] = []

  // 遍历分组，为每个组创建汇总行
  Object.entries(groupedByUnit).forEach(([unitName, items]) => {
    // 将当前行政单位的所有明细行添加到结果中
    result.push(...items)

    // 计算当前行政单位的合计数据
    const totalPriceQty = items.reduce((sum, item) => sum + (item.PRICE_QTY || 0), 0)
    const totalForecastAmount = items.reduce((sum, item) => sum + (item.FORECAST_AMOUNT || 0), 0)
    const totalPriceAmount = items.reduce((sum, item) => sum + (item.PRICE_AMOUNT || 0), 0)
    const totalPercentage = totalForecastAmount ? (totalPriceAmount / totalForecastAmount) * 100 : 0

    // 创建合计行
    const summaryRow: SaleAmount & { isSummary?: boolean } = {
      YEAR: '合计',
      MONTH: undefined,
      ADMIN_UNIT_NAME: unitName,
      EMPLOYEE_NAME: undefined, // 业务员列显示为"合计"
      PRICE_QTY: totalPriceQty,
      FORECAST_AMOUNT: totalForecastAmount,
      PRICE_AMOUNT: totalPriceAmount,
      PERCENTAGE: totalPercentage,
      isSummary: true // 标记为汇总行
    }

    // 添加合计行到结果中
    result.push(summaryRow)
  })

  return result
}

// 获取数据
const getData = async () => {
  try {
    loading.value = true
    const res = await getSaleAmountSummaryApi(props.queryParams)
    originalData.value = res.data.list || []
    // 处理数据，添加汇总行
    tableData.value = processDataWithSummary(originalData.value)
  } catch (error) {
    console.error('获取销售目标汇总数据失败:', error)
    originalData.value = []
    tableData.value = []
  } finally {
    loading.value = false
  }
}

// 获取行样式
const getRowClass = ({ row }: { row: any }) => {
  return row.isSummary ? 'summary-row' : ''
}

// 获取完成率背景色
const getPercentageColor = (percentage: number): string => {
  if (percentage >= 100) return '#67C23A' // 成功色
  if (percentage >= 80) return '#95d475' // 浅成功色
  if (percentage >= 50) return '#409EFF' // 主要色
  if (percentage >= 30) return '#E6A23C' // 警告色
  return '#F56C6C' // 危险色
}

// 列配置
interface ColumnConfig {
  prop: string
  label: string
  width?: string
  minWidth?: string
  align?: 'left' | 'center' | 'right'
  headerAlign?: 'left' | 'center' | 'right'
  fixed?: boolean | 'left' | 'right'
  sortable?: boolean
  showOverflowTooltip?: boolean
}

// 定义所有可能的列
const allColumns = [
  { prop: 'YEAR', label: '年份', width: '100', align: 'center', sortable: true },
  { prop: 'MONTH', label: '月份', width: '100', align: 'center', sortable: true },
  {
    prop: 'ADMIN_UNIT_NAME',
    label: '销售团队',
    width: '130',
    align: 'center',
    showOverflowTooltip: true,
    sortable: true
  },
  {
    prop: 'EMPLOYEE_NAME',
    label: '业务员',
    width: '100',
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'PRICE_QTY',
    label: '销量',
    width: '110',
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'FORECAST_AMOUNT',
    label: '预测销售额',
    width: '110',
    headerAlign: 'center',
    align: 'right'
  },
  {
    prop: 'PRICE_AMOUNT',
    label: '实际销售额',
    width: '110',
    headerAlign: 'center',
    align: 'right'
  },
  {
    prop: 'PERCENTAGE',
    label: '完成率',
    minWidth: '150',
    align: 'center',
    fixed: 'right',
    sortable: true
  }
] as ColumnConfig[]

// 计算哪些列应该显示
const visibleColumns = computed(() => {
  if (!tableData.value || tableData.value.length === 0) return allColumns

  return allColumns.filter((column) => {
    // 检查是否应该根据查询参数显示列
    if (column.prop === 'YEAR' && !props.queryParams.group_by_year) return false
    if (column.prop === 'MONTH' && !props.queryParams.group_by_month) return false
    if (column.prop === 'ADMIN_UNIT_NAME' && !props.queryParams.group_by_admin_unit_name)
      return false
    if (column.prop === 'EMPLOYEE_NAME' && !props.queryParams.group_by_employee_name) return false

    // 检查这一列是否至少有一个非null、非undefined的值
    const hasData = tableData.value.some(
      (row) =>
        row[column.prop as keyof SaleAmount] !== null &&
        row[column.prop as keyof SaleAmount] !== undefined
    )

    return hasData
  })
})

// 暴露方法给父组件
defineExpose({
  getData,
  tableData,
  originalData
})
</script>

<template>
  <ElSkeleton :loading="loading" animated>
    <template #template>
      <div class="skeleton-container">
        <ElSkeletonItem variant="text" style="width: 100%; height: 23px" />
        <ElSkeletonItem variant="text" style="width: 100%; height: 23px" />
        <ElSkeletonItem variant="text" style="width: 100%; height: 23px" />
        <ElSkeletonItem variant="text" style="width: 100%; height: 23px" />
        <ElSkeletonItem variant="text" style="width: 100%; height: 23px" />
        <ElSkeletonItem variant="text" style="width: 100%; height: 23px" />
        <ElSkeletonItem variant="text" style="width: 100%; height: 23px" />
        <ElSkeletonItem variant="text" style="width: 100%; height: 23px" />
        <ElSkeletonItem variant="text" style="width: 100%; height: 23px" />
        <ElSkeletonItem variant="text" style="width: 100%; height: 23px" />
        <ElSkeletonItem variant="text" style="width: 100%; height: 23px" />
        <ElSkeletonItem variant="text" style="width: 100%; height: 23px" />
        <ElSkeletonItem variant="text" style="width: 100%; height: 23px" />
        <ElSkeletonItem variant="text" style="width: 100%; height: 23px" />
        <ElSkeletonItem variant="text" style="width: 100%; height: 23px" />
        <ElSkeletonItem variant="text" style="width: 100%; height: 23px" />
        <ElSkeletonItem variant="text" style="width: 100%; height: 23px" />
      </div>
    </template>
    <template #default>
      <ElTable
        v-loading="loading"
        :data="tableData"
        border
        style="width: 100%"
        :row-class-name="getRowClass"
      >
        <template v-for="column in visibleColumns" :key="column.prop">
          <ElTableColumn
            :prop="column.prop"
            :label="column.label"
            :width="column.width"
            :min-width="column.minWidth"
            :align="column.align"
            :header-align="column.headerAlign"
            :fixed="column.fixed"
            :sortable="column.sortable"
            :show-overflow-tooltip="column.showOverflowTooltip"
          >
            <template #default="{ row }">
              <template v-if="column.prop === 'FORECAST_AMOUNT'">
                {{ row.FORECAST_AMOUNT?.toLocaleString() ?? '-' }}
              </template>
              <template v-else-if="column.prop === 'PRICE_QTY'">
                {{ row.PRICE_QTY?.toLocaleString() ?? '-' }}
              </template>
              <template v-else-if="column.prop === 'PRICE_AMOUNT'">
                {{ row.PRICE_AMOUNT?.toLocaleString() ?? '-' }}
              </template>
              <template v-else-if="column.prop === 'PERCENTAGE'">
                <div class="percentage-cell">
                  <div
                    class="percentage-bar"
                    :style="{
                      width: `${Math.min(row.PERCENTAGE ?? 0, 100)}%`,
                      backgroundColor: getPercentageColor(row.PERCENTAGE ?? 0)
                    }"
                  ></div>
                  <span class="percentage-text">{{ (row.PERCENTAGE ?? 0).toFixed(2) }}%</span>
                </div>
              </template>
              <template v-else>
                {{ row[column.prop] }}
              </template>
            </template>
          </ElTableColumn>
        </template>
      </ElTable>
    </template>
  </ElSkeleton>
</template>

<style lang="less" scoped>
:deep(.el-table__row) {
  cursor: pointer;

  &.summary-row {
    font-weight: bold;
    background-color: #f0f9eb;

    td {
      background-color: #f0f9eb !important;
    }

    // 鼠标悬停样式
    &:hover > td {
      background-color: #e6f3d7 !important;
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
  opacity: 0.4; // 增加透明度
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
  font-weight: 400; // 增加字体粗细
  color: var(--el-text-color-primary);
  align-items: center;
  justify-content: center;
  text-shadow: 0 0 2px rgb(255 255 255 / 80%); // 添加文字阴影提高可读性
}

.skeleton-container {
  padding: 20px;

  :deep(.el-skeleton__item) {
    margin-bottom: 16px;
  }
}
</style>
