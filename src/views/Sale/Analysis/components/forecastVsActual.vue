<script setup lang="ts">
import { computed, PropType, ref } from 'vue'
import { ElTable, ElTableColumn, ElInput } from 'element-plus'
import { Icon } from '@/components/Icon'
import { useDesign } from '@/hooks/web/useDesign'
import { SaleDataSummary } from '@/api/sale/types'

// 使用设计系统
const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('forecast-vs-actual-table')

// 定义 props
const props = defineProps({
  tableData: {
    type: Array as PropType<SaleDataSummary[]>,
    default: () => []
  },
  tableMinHeight: {
    type: String,
    default: 'auto'
  },
  componentHeight: {
    type: String,
    default: 'auto'
  }
})

const queryParams = ref<any>({
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1
})

const emit = defineEmits<{
  (e: 'search', params: { year: number; month: number }): void
}>()

// 处理搜索事件
const handleSearch = () => {
  emit('search', { year: queryParams.value.year, month: queryParams.value.month })
}

// 表格数据
const tableData = computed(() => props.tableData)

// 根据表格类型定义显示的列
const detailColumns = [
  {
    prop: 'employeeName',
    label: '业务员',
    minWidth: 70,
    headerAlign: 'center',
    align: 'center',
    fixed: 'left',
    showOverflowTooltip: true
  },
  {
    prop: 'qtySum',
    label: '实际销售量(万颗)',
    minWidth: 100,
    headerAlign: 'center',
    align: 'right'
  },
  {
    prop: 'targetSum',
    label: '预测销售额(万元)',
    minWidth: 100,
    headerAlign: 'center',
    align: 'right'
  },
  {
    prop: 'amountSum',
    label: '实际销售额(万元)',
    minWidth: 100,
    headerAlign: 'center',
    align: 'right'
  },
  {
    prop: 'departmentName',
    label: '部门',
    minWidth: 120,
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'completeRate',
    label: '完成率',
    minWidth: 100,
    headerAlign: 'center',
    align: 'center',
    fixed: 'right'
  }
]

// 当前显示的列
const currentColumns = computed(() => {
  return detailColumns
})

// 获取完成率背景色
const getPercentageColor = (percentage: number): string => {
  if (percentage >= 80) return '#67C23A' // 成功色
  if (percentage >= 60) return '#95d475' // 浅成功色
  if (percentage >= 30) return '#409EFF' // 主要色
  return '#F56C6C' // 危险色
}

// 计算组内合计行中的最大完成率
const getMaxGroupPercentage = computed(() => {
  if (!tableData.value || tableData.value.length === 0) return 0

  // 筛选出 departmentName 包含“销售部”或“合计”的行
  const groupRows = tableData.value.filter(
    (row) =>
      row.departmentName &&
      row.departmentName.includes('销售部') &&
      row.departmentName.includes('合计')
  )

  if (groupRows.length === 0) return 0

  // 找出最大完成率
  return Math.max(...groupRows.map((row) => row.completeRate || 0))
})

// 计算组内合计行中的最大实际销售额
const getMaxGroupPriceAmount = computed(() => {
  if (!tableData.value || tableData.value.length === 0) return 0

  // 筛选出组内合计行
  const groupRows = tableData.value.filter(
    (row) =>
      row.departmentName &&
      row.departmentName.includes('销售部') &&
      row.departmentName.includes('合计')
  )

  if (groupRows.length === 0) return 0

  // 找出最大实际销售额
  return Math.max(...groupRows.map((row) => row.amountSum || 0))
})

// 判断是否是完成率最高的组内合计行
const isMaxPercentageGroup = (row: any): boolean => {
  return (
    row.departmentName &&
    row.departmentName.includes('销售部') &&
    row.departmentName.includes('合计') &&
    (row.completeRate || 0) === getMaxGroupPercentage.value
  )
}

// 判断是否是实际销售额最高的组内合计行
const isMaxPriceAmountGroup = (row: any): boolean => {
  return (
    row.departmentName &&
    row.departmentName.includes('销售部') &&
    row.departmentName.includes('合计') &&
    (row.amountSum || 0) === getMaxGroupPriceAmount.value
  )
}

// 格式化数字
const formatNumber = (value: number): string => {
  if (value === null || value === undefined) return '0.00'
  return (value / 10000).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// 格式化金额
const formatAmount = (value: number): string => {
  if (value === null || value === undefined) return '0.00'
  return (value / 10000).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// 格式化完成率
const formatCompleteRate = (value: number): string => {
  if (value === null || value === undefined) return '0.00'
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%'
}

// 判断行类型
const getRowType = (row: SaleDataSummary): 'detail' | 'group-total' | 'grand-total' => {
  // 总合计行 - 检查多个字段来确定是否为总计行
  if (String(row.departmentName) === '合计') {
    return 'grand-total'
  }
  // 组内合计行 - 检查业务员字段或年份字段
  if (
    row.departmentName &&
    row.departmentName.includes('销售部') &&
    row.departmentName.includes(' 合计')
  ) {
    return 'group-total'
  }
  // 详细数据行
  return 'detail'
}

// 获取行的CSS类名
const getRowClass = (row: SaleDataSummary): string => {
  const rowType = getRowType(row)
  return `${prefixCls}__row--${rowType}`
}
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
      <div class="flex-1 text-center text-16px">销售额完成率 预测VS实际</div>
      <div class="flex-1 flex justify-end">
        <span class="text-gray-500 dark:text-gray-400 text-14px">查询参数：</span>
        <ElInput
          v-model="queryParams.year"
          size="small"
          placeholder="年份"
          style="width: 60px; margin-right: 10px"
          @keyup.enter="handleSearch"
        />
        <ElInput
          v-model="queryParams.month"
          size="small"
          placeholder="月份"
          style="width: 60px"
          @keyup.enter="handleSearch"
        />
      </div>
    </div>
    <ElTable
      :data="tableData"
      :min-height="tableMinHeight"
      border
      class="flex-1"
      highlight-current-row
      :row-class-name="({ row }) => getRowClass(row)"
    >
      <!-- 数据列 -->
      <template v-for="column in currentColumns" :key="column.prop">
        <ElTableColumn
          :prop="column.prop"
          :label="column.label"
          :min-width="column.minWidth"
          :fixed="column.fixed"
          :align="column.align || 'left'"
          :show-overflow-tooltip="true"
        >
          <template #default="{ row }">
            <!-- 数量字段格式化 -->
            <span
              v-if="column.prop === 'qtySum'"
              class="font-medium text-gray-900 dark:text-gray-100"
            >
              {{ formatNumber(row[column.prop]) }}
            </span>
            <span v-else-if="column.prop === 'employeeName'">
              <template
                v-if="
                  row.departmentName &&
                  row.departmentName.includes('销售部') &&
                  row.departmentName.includes('合计')
                "
              >
                <span v-if="isMaxPercentageGroup(row) && isMaxPriceAmountGroup(row)"
                  >👑💰 {{ row.employeeName }}</span
                >
                <span v-else-if="isMaxPercentageGroup(row)">👑 {{ row.employeeName }}</span>
                <span v-else-if="isMaxPriceAmountGroup(row)">💰 {{ row.employeeName }}</span>
                <span v-else>{{ row.employeeName }}</span>
              </template>
              <span v-else>{{ row.employeeName }}</span>
            </span>
            <span
              v-else-if="column.prop === 'targetSum' || column.prop === 'amountSum'"
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
            <p class="m-0 text-gray-500 dark:text-gray-400 text-14px">暂无数据</p>
          </div>
        </div>
      </template>
    </ElTable>
  </div>
</template>

<style scoped lang="less">
@prefix-cls: ~'@{adminNamespace}-forecast-vs-actual-table';
// 响应式设计
@media (width <= 768px) {
  .@{prefix-cls} {
    :deep(.el-table) {
      .el-table__header-wrapper .el-table__header th {
        padding: 8px 4px;
        font-size: 12px;

        &:not(:last-child)::after {
          display: none;
        }
      }

      .el-table__body-wrapper .el-table__row {
        .el-table__cell {
          padding: 8px 4px;
          font-size: 12px;
        }

        &:hover {
          transform: none;
          box-shadow: none;
        }
      }
    }

    :deep(.el-tag) {
      padding: 2px 6px;
      font-size: 10px;
    }

    .operations-container {
      :deep(.ElButton) {
        min-width: 60px;
        padding: 4px 8px;
        font-size: 11px;
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
        transform: none;
        box-shadow: none;
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

.empty-data {
  display: flex;
  height: 100%;
  min-height: 200px;
  align-items: center;
  justify-content: center;

  .empty-content {
    text-align: center;

    .empty-icon {
      margin-bottom: 16px;
      color: var(--el-text-color-placeholder);
    }

    .empty-text {
      margin: 0;
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }
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

      &.el-table__row--striped {
        background-color: var(--el-fill-color-darker);
      }
    }
  }
  :deep(.@{adminNamespace}-forecast-vs-actual-table__row--group-total) {
    color: #fff !important;
    background-color: #4b3f1b !important;
  }
  :deep(.@{adminNamespace}-forecast-vs-actual-table__row--grand-total) {
    color: #fff !important;
    background-color: #1b3a4b !important;
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
  font-weight: 700; // 增加字体粗细
  color: var(--el-text-color-primary);
  align-items: center;
  justify-content: center;
  text-shadow: 0 0 2px rgb(255 255 255 / 80%); // 添加文字阴影提高可读性
}

.dark {
  .percentage-text {
    color: #000 !important;
  }
}
// 额外的高优先级选择器 - 确保背景色生效
:deep(
  .el-table__body .el-table__row.v-forecast-vs-actual-table__row--group-total > .el-table__cell
) {
  background-color: #dae9f0 !important;
}

:deep(
  .el-table__body .el-table__row.v-forecast-vs-actual-table__row--grand-total > .el-table__cell
) {
  color: #fff !important;
  background-color: #0a8bc7 !important;
}
</style>
