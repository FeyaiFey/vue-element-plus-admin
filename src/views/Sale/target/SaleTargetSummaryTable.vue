<script setup lang="ts">
import { ref } from 'vue'
import { ElTable, ElTableColumn, ElSkeleton, ElSkeletonItem } from 'element-plus'
import { getSaleTargetSummaryApi } from '@/api/sale'
import type { SaleTargetSummaryQuery, SaleTargetSummary } from '@/api/sale/type'

const props = defineProps<{
  queryParams: SaleTargetSummaryQuery
}>()

const emit = defineEmits<{
  (e: 'row-click', row: SaleTargetSummary): void
}>()

// 原始表格数据
const originalData = ref<SaleTargetSummary[]>([])
// 表格数据（包含汇总行）
const tableData = ref<(SaleTargetSummary & { isSummary?: boolean })[]>([])
const loading = ref(false)

// 处理数据，添加行政单位合计行
const processDataWithSummary = (data: SaleTargetSummary[]) => {
  if (!data || !data.length) return []

  // 克隆原始数据
  const clonedData = [...data]

  // 按行政单位分组
  const groupedByUnit: Record<string, SaleTargetSummary[]> = {}

  // 对原始数据分组
  clonedData.forEach((item) => {
    const unitName = item.ADMIN_UNIT_NAME
    if (!groupedByUnit[unitName]) {
      groupedByUnit[unitName] = []
    }
    groupedByUnit[unitName].push(item)
  })

  // 合并数据，添加合计行
  const result: (SaleTargetSummary & { isSummary?: boolean })[] = []

  // 遍历分组，为每个组创建汇总行
  Object.entries(groupedByUnit).forEach(([unitName, items]) => {
    // 将当前行政单位的所有明细行添加到结果中
    result.push(...items)

    // 计算当前行政单位的合计数据
    const totalForecastQty = items.reduce((sum, item) => sum + (item.FORECAST_QTY || 0), 0)
    const totalPriceQty = items.reduce((sum, item) => sum + (item.PRICE_QTY || 0), 0)
    const totalPercentage = totalForecastQty ? (totalPriceQty / totalForecastQty) * 100 : 0

    // 创建合计行
    const summaryRow: SaleTargetSummary & { isSummary?: boolean } = {
      YEAR: items[0].YEAR,
      MONTH: items[0].MONTH,
      ADMIN_UNIT_NAME: unitName,
      EMPLOYEE_NAME: '合计', // 业务员列显示为"合计"
      FORECAST_QTY: totalForecastQty,
      PRICE_QTY: totalPriceQty,
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
    const res = await getSaleTargetSummaryApi(props.queryParams)
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

// 处理行点击
const handleRowClick = (row: SaleTargetSummary & { isSummary?: boolean }) => {
  // 如果是汇总行，则不触发点击事件
  if (row.isSummary) return

  emit('row-click', row)
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
        @row-click="handleRowClick"
      >
        <ElTableColumn prop="YEAR" label="年份" width="100" align="center" />
        <ElTableColumn prop="MONTH" label="月份" width="100" align="center" />
        <ElTableColumn
          prop="ADMIN_UNIT_NAME"
          label="行政单位"
          width="130"
          align="center"
          show-overflow-tooltip
        />
        <ElTableColumn
          prop="EMPLOYEE_NAME"
          label="业务员"
          width="100"
          align="center"
          show-overflow-tooltip
        />
        <ElTableColumn
          prop="FORECAST_QTY"
          label="预测销量"
          width="110"
          header-align="center"
          align="right"
        >
          <template #default="{ row }">
            {{ row.FORECAST_QTY?.toLocaleString() ?? '-' }}
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="PRICE_QTY"
          label="实际销量"
          width="110"
          header-align="center"
          align="right"
        >
          <template #default="{ row }">
            {{ row.PRICE_QTY?.toLocaleString() ?? '-' }}
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="PERCENTAGE"
          label="完成率"
          min-width="150"
          align="center"
          fixed="right"
          sortable
        >
          <template #default="{ row }">
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
