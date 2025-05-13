<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElTable, ElTableColumn, ElSkeleton, ElSkeletonItem, ElEmpty } from 'element-plus'
import { getSaleAmountSummaryApi } from '@/api/sale'
import type { SaleAmountQuery, SaleAmount } from '@/api/sale/type'

const props = defineProps<{
  queryParams: SaleAmountQuery
}>()

// 原始表格数据
const originalData = ref<SaleAmount[]>([])
// 表格数据（包含汇总行）
const tableData = ref<SaleAmount[]>([])
const loading = ref(false)

// 获取数据
const getData = async () => {
  try {
    loading.value = true
    const res = await getSaleAmountSummaryApi(props.queryParams)
    originalData.value = res.data.list || []
    tableData.value = originalData.value
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
  { prop: 'YEAR', label: '年份', width: '100', align: 'center' },
  { prop: 'MONTH', label: '月份', width: '100', align: 'center' },
  {
    prop: 'ADMIN_UNIT_NAME',
    label: '销售团队',
    width: '130',
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'EMPLOYEE_NAME',
    label: '业务员',
    width: '100',
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

// 是否有数据
const hasData = computed(() => tableData.value && tableData.value.length > 0)

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
            <template #default="{ row }" v-if="column.prop === 'FORECAST_AMOUNT'">
              {{ row.FORECAST_AMOUNT?.toLocaleString() ?? '-' }}
            </template>
            <template #default="{ row }" v-else-if="column.prop === 'PRICE_AMOUNT'">
              {{ row.PRICE_AMOUNT?.toLocaleString() ?? '-' }}
            </template>
            <template #default="{ row }" v-else-if="column.prop === 'PERCENTAGE'">
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
          </ElTableColumn>
        </template>
      </ElTable>
      <ElEmpty v-if="!hasData && !loading" description="暂无数据" />
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
