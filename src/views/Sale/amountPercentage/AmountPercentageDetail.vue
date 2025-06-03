<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  ElTable,
  ElTableColumn,
  ElSkeleton,
  ElSkeletonItem,
  ElForm,
  ElFormItem,
  ElInput,
  ElRow,
  ElCol,
  ElCard
} from 'element-plus'
import { getSaleAmountSummaryApi } from '@/api/sale'
import type { SaleAmountQuery, SaleAmount } from '@/api/sale/type'
import { Icon } from '@/components/Icon'

const props = defineProps<{
  queryParams: SaleAmountQuery
}>()

// 获取上个月的年份和月份
// 示例：
// - 当前是 2024年1月 → 上个月是 2023年12月
// - 当前是 2024年3月 → 上个月是 2024年2月
const getLastMonth = () => {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1 // getMonth() 返回 0-11，需要 +1 变成 1-12

  if (currentMonth === 1) {
    // 如果当前是1月，上个月是去年12月
    return {
      year: currentYear - 1,
      month: 12
    }
  } else {
    // 其他情况，月份减1
    return {
      year: currentYear,
      month: currentMonth - 1
    }
  }
}

// 本地查询参数
const localQueryParams = ref<SaleAmountQuery>({
  ...props.queryParams,
  ...getLastMonth(),
  group_by_year: true,
  group_by_month: true,
  group_by_admin_unit_name: true,
  group_by_employee_name: true
})

// 原始数据
const originalData = ref<SaleAmount[]>([])
// 主表格数据（按行政单位分组的汇总，包含展开数据）
const mainTableData = ref<
  (SaleAmount & {
    isSummary?: boolean
    isTotalSummary?: boolean
    detailData?: SaleAmount[]
    isExpanded?: boolean
    rowKey?: string // 添加唯一标识
  })[]
>([])
const loading = ref(false)

// 当前选中的行和对应的明细数据
const selectedRow = ref<any>(null)
const selectedDetailData = ref<SaleAmount[]>([])

// 处理行点击
const handleRowClick = (row: any) => {
  // 不允许选择总计行
  if (row.isTotalSummary) {
    return
  }

  selectedRow.value = row
  selectedDetailData.value = row.detailData || []
}

// 获取行样式
const getRowClass = ({ row }: { row: any }) => {
  let classes = ''
  if (row.isTotalSummary) {
    classes += 'total-summary-row'
  } else if (row.isSummary) {
    classes += 'summary-row'
  }

  // 添加选中状态
  if (selectedRow.value && selectedRow.value.rowKey === row.rowKey) {
    classes += ' selected-row'
  }

  return classes
}

// 搜索方法
const handleSearch = async () => {
  await getData()
}

// 列配置接口
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

// 主表格列配置
const mainColumns = [
  {
    prop: 'ADMIN_UNIT_NAME',
    label: '销售团队',
    width: '130',
    align: 'center',
    showOverflowTooltip: true
  },
  //   {
  //     prop: 'PRICE_QTY',
  //     label: '实际销量',
  //     width: '120',
  //     align: 'center',
  //     showOverflowTooltip: true
  //   },
  {
    prop: 'FORECAST_AMOUNT',
    label: '预测销售额',
    width: '120',
    headerAlign: 'center',
    align: 'right'
  },
  {
    prop: 'PRICE_AMOUNT',
    label: '实际销售额',
    width: '120',
    headerAlign: 'center',
    align: 'right'
  },
  {
    prop: 'PERCENTAGE',
    label: '完成率',
    minWidth: '150',
    maxWidth: '250',
    align: 'center',
    fixed: 'right'
  }
] as ColumnConfig[]

// 计算明细表格显示的列
const detailVisibleColumns = computed(() => {
  const allColumns = [
    {
      prop: 'EMPLOYEE_NAME',
      label: '业务员',
      width: '120',
      align: 'center',
      showOverflowTooltip: true
    },
    // { prop: 'PRICE_QTY', label: '销量', width: '120', align: 'center', showOverflowTooltip: true },
    {
      prop: 'FORECAST_AMOUNT',
      label: '预测销售额',
      width: '120',
      headerAlign: 'center',
      align: 'right'
    },
    {
      prop: 'PRICE_AMOUNT',
      label: '实际销售额',
      width: '120',
      headerAlign: 'center',
      align: 'right'
    },
    {
      prop: 'PERCENTAGE',
      label: '完成率',
      minWidth: '150',
      maxWidth: '250',
      align: 'center',
      sortable: true,
      fixed: 'right'
    }
  ] as ColumnConfig[]

  return allColumns.filter((column) => {
    // 检查是否应该根据查询参数显示列
    if (column.prop === 'YEAR' && !localQueryParams.value.group_by_year) return false
    if (column.prop === 'MONTH' && !localQueryParams.value.group_by_month) return false
    if (column.prop === 'EMPLOYEE_NAME' && !localQueryParams.value.group_by_employee_name)
      return false

    return true
  })
})

// 监听查询参数变化
watch(
  () => localQueryParams.value,
  () => {
    getData()
  },
  { deep: true }
)

// 获取数据
const getData = async () => {
  try {
    loading.value = true
    const res = await getSaleAmountSummaryApi(localQueryParams.value)
    originalData.value = res.data.list || []

    // 处理主表格数据
    mainTableData.value = processMainTableData(originalData.value)
  } catch (error) {
    console.error('获取销售目标汇总数据失败:', error)
    originalData.value = []
    mainTableData.value = []
  } finally {
    loading.value = false
  }
}

// 获取完成率背景色
const getPercentageColor = (percentage: number): string => {
  if (percentage >= 100) return '#67C23A' // 成功色
  if (percentage >= 80) return '#95d475' // 浅成功色
  if (percentage >= 50) return '#409EFF' // 主要色
  if (percentage >= 30) return '#E6A23C' // 警告色
  return '#F56C6C' // 危险色
}

// 定义ADMIN_UNIT_NAME的排序优先级
const adminUnitOrder = {
  '销售部-苏州一组': 1,
  '销售部-苏州二组': 2,
  '销售部-宁波组': 3,
  '销售部-深圳组': 4,
  '销售部-佛山组': 5,
  '销售部-公司自营': 6
}

// 获取ADMIN_UNIT_NAME的排序权重
const getAdminUnitWeight = (unitName: string): number => {
  return adminUnitOrder[unitName as keyof typeof adminUnitOrder] || 999
}

// 处理主表格数据，包含汇总和对应的明细数据
const processMainTableData = (data: SaleAmount[]) => {
  if (!data || !data.length) return []

  // 按行政单位分组
  const groupedByUnit: Record<string, SaleAmount[]> = {}

  data.forEach((item) => {
    const unitName = item.ADMIN_UNIT_NAME || '未分类'
    if (!groupedByUnit[unitName]) {
      groupedByUnit[unitName] = []
    }
    groupedByUnit[unitName].push(item)
  })

  // 合并数据，创建汇总行并关联明细数据
  const result: (SaleAmount & {
    isSummary?: boolean
    isTotalSummary?: boolean
    detailData?: SaleAmount[]
    isExpanded?: boolean
    rowKey?: string // 添加唯一标识
  })[] = []

  // 按照自定义顺序获取排序后的行政单位列表
  const sortedUnitNames = Object.keys(groupedByUnit).sort((a, b) => {
    return getAdminUnitWeight(a) - getAdminUnitWeight(b)
  })

  // 为每个行政单位创建汇总行
  sortedUnitNames.forEach((unitName) => {
    const items = groupedByUnit[unitName]

    // 排序明细数据
    const sortedItems = items.sort((a, b) => {
      if (a.YEAR !== b.YEAR) {
        return (a.YEAR || 0) - (b.YEAR || 0)
      }
      if (a.MONTH !== b.MONTH) {
        return (a.MONTH || 0) - (b.MONTH || 0)
      }
      return (b.PERCENTAGE || 0) - (a.PERCENTAGE || 0)
    })

    // 计算当前行政单位的合计数据
    const totalPriceQty = items.reduce((sum, item) => sum + (item.PRICE_QTY || 0), 0)
    const totalForecastAmount = items.reduce((sum, item) => sum + (item.FORECAST_AMOUNT || 0), 0)
    const totalPriceAmount = items.reduce((sum, item) => sum + (item.PRICE_AMOUNT || 0), 0)
    const totalPercentage = totalForecastAmount ? (totalPriceAmount / totalForecastAmount) * 100 : 0

    // 创建汇总行，包含明细数据
    const summaryRow = {
      YEAR: '汇总',
      MONTH: undefined,
      ADMIN_UNIT_NAME: unitName,
      EMPLOYEE_NAME: undefined,
      PRICE_QTY: totalPriceQty,
      FORECAST_AMOUNT: totalForecastAmount,
      PRICE_AMOUNT: totalPriceAmount,
      PERCENTAGE: totalPercentage,
      isSummary: true,
      detailData: sortedItems,
      isExpanded: false,
      rowKey: `summary_${unitName}_${Date.now()}_${Math.random()}` // 唯一标识
    }

    result.push(summaryRow)
  })

  // 计算总计数据
  const grandTotalPriceQty = data.reduce((sum, item) => sum + (item.PRICE_QTY || 0), 0)
  const grandTotalForecastAmount = data.reduce((sum, item) => sum + (item.FORECAST_AMOUNT || 0), 0)
  const grandTotalPriceAmount = data.reduce((sum, item) => sum + (item.PRICE_AMOUNT || 0), 0)
  const grandTotalPercentage = grandTotalForecastAmount
    ? (grandTotalPriceAmount / grandTotalForecastAmount) * 100
    : 0

  // 创建总计行
  const totalSummaryRow = {
    YEAR: '总计',
    MONTH: undefined,
    ADMIN_UNIT_NAME: '全部',
    EMPLOYEE_NAME: undefined,
    PRICE_QTY: grandTotalPriceQty,
    FORECAST_AMOUNT: grandTotalForecastAmount,
    PRICE_AMOUNT: grandTotalPriceAmount,
    PERCENTAGE: grandTotalPercentage,
    isSummary: true,
    isTotalSummary: true,
    detailData: [],
    isExpanded: false,
    rowKey: `total_summary_${Date.now()}` // 唯一标识
  }

  result.push(totalSummaryRow)
  return result
}

onMounted(() => {
  getData()
})

// 暴露方法给父组件
defineExpose({
  getData
})
</script>

<template>
  <div class="amount-percentage-detail">
    <!-- 查询控制栏 -->
    <div class="query-controls">
      <ElForm :model="localQueryParams" inline size="small">
        <ElFormItem label="年份">
          <ElInput
            v-model.number="localQueryParams.year"
            placeholder="请输入年份"
            style="width: 120px"
            type="number"
            @keyup.enter="handleSearch"
          />
        </ElFormItem>
        <ElFormItem label="月份">
          <ElInput
            v-model.number="localQueryParams.month"
            placeholder="请输入月份"
            style="width: 120px"
            type="number"
            :min="1"
            :max="12"
            @keyup.enter="handleSearch"
          />
        </ElFormItem>
      </ElForm>
    </div>

    <div class="main-content">
      <ElRow :gutter="16" class="h-full">
        <!-- 左侧汇总表格 -->
        <ElCol :xs="24" :lg="12" class="h-full">
          <ElCard class="h-full" shadow="hover">
            <template #header>
              <div class="card-header">
                <span class="card-title">销售团队汇总数据</span>
              </div>
            </template>
            <ElSkeleton :loading="loading" animated>
              <template #template>
                <div class="skeleton-container">
                  <ElSkeletonItem
                    v-for="n in 8"
                    :key="n"
                    variant="text"
                    style="width: 100%; height: 30px; margin-bottom: 12px"
                  />
                </div>
              </template>
              <template #default>
                <ElTable
                  :data="mainTableData"
                  border
                  style="width: 100%"
                  :row-class-name="getRowClass"
                  @row-click="handleRowClick"
                  row-key="rowKey"
                  highlight-current-row
                >
                  <!-- 主表格列 -->
                  <template v-for="column in mainColumns" :key="column.prop">
                    <ElTableColumn
                      :prop="column.prop"
                      :label="column.label"
                      :width="column.width"
                      :min-width="column.minWidth"
                      :align="column.align"
                      :header-align="column.headerAlign"
                      :show-overflow-tooltip="column.showOverflowTooltip"
                    >
                      <template #default="{ row }">
                        <template v-if="column.prop === 'FORECAST_AMOUNT'">
                          {{
                            row.FORECAST_AMOUNT
                              ? (row.FORECAST_AMOUNT / 10000).toFixed(2).toLocaleString()
                              : '-'
                          }}
                        </template>
                        <template v-else-if="column.prop === 'PRICE_QTY'">
                          {{
                            row.PRICE_QTY
                              ? (row.PRICE_QTY / 10000).toFixed(2).toLocaleString()
                              : '-'
                          }}
                        </template>
                        <template v-else-if="column.prop === 'PRICE_AMOUNT'">
                          {{
                            row.PRICE_AMOUNT
                              ? (row.PRICE_AMOUNT / 10000).toFixed(2).toLocaleString()
                              : '-'
                          }}
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
                            <span class="percentage-text"
                              >{{ (row.PERCENTAGE ?? 0).toFixed(2) }}%</span
                            >
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
          </ElCard>
        </ElCol>

        <!-- 右侧明细表格 -->
        <ElCol :xs="24" :lg="12" class="h-full">
          <ElCard class="h-full" shadow="hover">
            <template #header>
              <div class="card-header">
                <span class="card-title">
                  {{ selectedRow ? `${selectedRow.ADMIN_UNIT_NAME} - 业务员明细` : '业务员明细' }}
                </span>
                <span v-if="selectedDetailData.length > 0" class="card-count">
                  共 {{ selectedDetailData.length }} 条记录
                </span>
              </div>
            </template>
            <div>
              <div v-if="!selectedRow" class="no-selection">
                <div class="no-selection-icon">
                  <Icon icon="vi-ep:info-filled" :size="48" />
                </div>
                <div class="no-selection-text">请点击左侧团队查看明细</div>
              </div>
              <div v-else-if="selectedDetailData.length === 0" class="no-detail">
                <div class="no-detail-icon">
                  <Icon icon="vi-ep:warning-filled" :size="48" />
                </div>
                <div class="no-detail-text">该团队暂无明细数据</div>
              </div>
              <ElTable v-else :data="selectedDetailData" border style="width: 100%">
                <template v-for="column in detailVisibleColumns" :key="column.prop">
                  <ElTableColumn
                    :prop="column.prop"
                    :label="column.label"
                    :width="column.width"
                    :min-width="column.minWidth"
                    :align="column.align"
                    :header-align="column.headerAlign"
                    :sortable="column.sortable"
                    :show-overflow-tooltip="column.showOverflowTooltip"
                  >
                    <template #default="{ row: detailRow }">
                      <template v-if="column.prop === 'FORECAST_AMOUNT'">
                        {{
                          detailRow.FORECAST_AMOUNT
                            ? (detailRow.FORECAST_AMOUNT / 10000).toFixed(2).toLocaleString()
                            : '-'
                        }}
                      </template>
                      <template v-else-if="column.prop === 'PRICE_QTY'">
                        {{
                          detailRow.PRICE_QTY
                            ? (detailRow.PRICE_QTY / 10000).toFixed(2).toLocaleString()
                            : '-'
                        }}
                      </template>
                      <template v-else-if="column.prop === 'PRICE_AMOUNT'">
                        {{
                          detailRow.PRICE_AMOUNT
                            ? (detailRow.PRICE_AMOUNT / 10000).toFixed(2).toLocaleString()
                            : '-'
                        }}
                      </template>
                      <template v-else-if="column.prop === 'PERCENTAGE'">
                        <div class="percentage-cell">
                          <div
                            class="percentage-bar"
                            :style="{
                              width: `${Math.min(detailRow.PERCENTAGE ?? 0, 100)}%`,
                              backgroundColor: getPercentageColor(detailRow.PERCENTAGE ?? 0)
                            }"
                          ></div>
                          <span class="percentage-text"
                            >{{ (detailRow.PERCENTAGE ?? 0).toFixed(2) }}%</span
                          >
                        </div>
                      </template>
                      <template v-else>
                        {{ detailRow[column.prop] }}
                      </template>
                    </template>
                  </ElTableColumn>
                </template>
              </ElTable>
            </div>
          </ElCard>
        </ElCol>
      </ElRow>
    </div>
  </div>
</template>

<style lang="less" scoped>
.amount-percentage-detail {
  display: flex;
  height: 100%;
  padding: 20px;
  flex-direction: column;
}

.query-controls {
  padding: 8px;
  margin-bottom: 10px;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;

  :deep(.el-form-item) {
    margin-right: 16px;
    margin-bottom: 0;
  }

  :deep(.el-form-item__label) {
    font-weight: 500;
    color: var(--el-text-color-regular);
  }
}

.main-content {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  border-radius: 6px 6px 0 0;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #334155;
}

.card-count {
  padding: 4px 8px;
  font-size: 12px;
  color: #64748b;
  background: #e2e8f0;
  border-radius: 4px;
}

// 合并 no-selection 和 no-detail 的共同样式
.no-selection,
.no-detail {
  padding: 60px 16px;
  margin: 16px;
  text-align: center;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
}

.no-selection-icon,
.no-detail-icon {
  margin-bottom: 12px;
  color: #94a3b8;
}

.no-selection-text,
.no-detail-text {
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
}

.percentage-cell {
  position: relative;
  width: 100%;
  height: 24px;
  overflow: hidden;
  background-color: #f1f5f9;
  border-radius: 12px;
}

.percentage-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: 12px;
  transition: width 0.3s ease;
}

.percentage-text {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  display: flex;
  width: 100%;
  height: 100%;
  font-size: 12px;
  font-weight: 500;
  color: #475569;
  align-items: center;
  justify-content: center;
}

// 美化ElCard样式
:deep(.el-card) {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 10%);

  .el-card__header {
    padding: 0;
    border-bottom: none;
  }

  .el-card__body {
    padding: 0;
  }
}

// 美化表格样式
:deep(.el-table) {
  overflow: hidden;
  border: 1px solid #d1d5db;
  border-radius: 6px;

  .el-table__header {
    th {
      padding: 12px;
      font-size: 13px;
      font-weight: 600;
      color: #475569;
      background: #f8fafc !important;
      border-right: 1px solid #d1d5db;
      border-bottom: 1px solid #d1d5db;

      &:last-child {
        border-right: none;
      }
    }
  }

  .el-table__body {
    tr {
      &:hover {
        background-color: #f8fafc !important;
      }

      td {
        padding: 12px;
        font-size: 13px;
        border-right: 1px solid #e5e7eb;
        border-bottom: 1px solid #e5e7eb;

        &:last-child {
          border-right: none;
        }
      }

      &:last-child td {
        border-bottom: none;
      }
    }
  }

  // 确保表格边框显示
  &::before {
    display: block;
    height: 1px;
    background-color: #d1d5db;
  }

  // 强制显示所有边框
  th.el-table__cell,
  td.el-table__cell {
    border-right: 1px solid #e5e7eb;

    &:last-child {
      border-right: none;
    }
  }

  .el-table__body-wrapper {
    border-right: none;
  }
}

:deep(.el-table__row) {
  cursor: pointer;
  transition: background-color 0.2s ease;

  &.summary-row {
    background-color: #eff6ff !important;

    td {
      font-weight: 600;
      color: #1e40af;
    }

    &:hover {
      background-color: #dbeafe !important;
    }
  }

  &.total-summary-row {
    background-color: #f0fdf4 !important;
    border-top: 2px solid #16a34a;

    td {
      font-weight: 700;
      color: #15803d;
      border-top: 2px solid #16a34a !important;
    }

    &:hover {
      background-color: #dcfce7 !important;
    }
  }

  &.selected-row {
    background-color: #fef3c7 !important;

    td {
      color: #92400e;
    }

    &:hover {
      background-color: #fde68a !important;
    }
  }
}
</style>
