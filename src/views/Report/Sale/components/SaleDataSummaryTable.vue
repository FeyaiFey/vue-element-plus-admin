<script setup lang="ts">
import { computed, PropType } from 'vue'
import { ElTable, ElTableColumn } from 'element-plus'
import { Icon } from '@/components/Icon'
import { useDesign } from '@/hooks/web/useDesign'
import { SaleDataSummary } from '@/api/sale/types'

// 使用设计系统
const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('sale-data-summary-table')

// 定义 props
const props = defineProps({
  tableData: {
    type: Array as PropType<SaleDataSummary[]>,
    default: () => []
  },
  tableHeight: {
    type: String,
    default: 'auto'
  }
})

// 表格数据
const tableData = computed(() => props.tableData)

// 根据表格类型定义显示的列
const detailColumns = [
  {
    prop: 'departmentName',
    label: '部门',
    minWidth: 120,
    headerAlign: 'center',
    align: 'center',
    fixed: 'left'
  },
  {
    prop: 'employeeName',
    label: '业务员',
    minWidth: 80,
    headerAlign: 'center',
    align: 'center',
    fixed: 'left'
  },
  {
    prop: 'qtySum',
    label: '数量',
    minWidth: 150,
    headerAlign: 'center',
    align: 'right'
  },
  {
    prop: 'targetSum',
    label: '目标',
    minWidth: 150,
    headerAlign: 'center',
    align: 'right'
  },
  {
    prop: 'amountSum',
    label: '金额',
    minWidth: 150,
    headerAlign: 'center',
    align: 'right'
  },
  {
    prop: 'completeRate',
    label: '完成率',
    minWidth: 150,
    headerAlign: 'center',
    align: 'center'
  }
]

// 当前显示的列
const currentColumns = computed(() => {
  return detailColumns
})

// 格式化数字
const formatNumber = (value: number): string => {
  if (value === null || value === undefined) return '0'
  return value.toLocaleString()
}

// 格式化金额
const formatAmount = (value: number): string => {
  if (value === null || value === undefined) return '0.00'
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 格式化完成率
const formatCompleteRate = (value: number): string => {
  if (value === null || value === undefined) return '0.00'
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 判断行类型
const getRowType = (row: SaleDataSummary): 'detail' | 'group-total' | 'grand-total' => {
  // 总合计行
  if (row.departmentName === '合计' || row.departmentName === 'total') {
    return 'grand-total'
  }
  // 组内合计行（业务员为空或"-"）
  if (!row.employeeName || row.employeeName === '-' || row.employeeName === '') {
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
    class="h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg overflow-hidden"
  >
    <ElTable
      :data="tableData"
      :height="props.tableHeight"
      border
      stripe
      class="flex-1"
      size="small"
      highlight-current-row
      :row-class-name="({ row }) => getRowClass(row)"
    >
      <!-- 数据列 -->
      <template v-for="column in currentColumns" :key="column.prop">
        <ElTableColumn
          :prop="column.prop"
          :label="column.label"
          :min-width="column.minWidth"
          :align="column.align || 'left'"
          :fixed="column.fixed"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <!-- 数量字段格式化 -->
            <span
              v-if="column.prop === 'qtySum'"
              :class="[
                'font-medium',
                getRowType(row) === 'grand-total'
                  ? 'text-blue-700 dark:text-blue-300 font-bold'
                  : getRowType(row) === 'group-total'
                    ? 'text-orange-700 dark:text-orange-300 font-semibold'
                    : 'text-gray-900 dark:text-gray-100'
              ]"
            >
              {{ formatNumber(row[column.prop]) }}
            </span>
            <!-- 金额字段格式化 -->
            <span
              v-else-if="column.prop === 'amountSum'"
              :class="[
                'font-medium',
                getRowType(row) === 'grand-total'
                  ? 'text-blue-700 dark:text-blue-300 font-bold'
                  : getRowType(row) === 'group-total'
                    ? 'text-orange-700 dark:text-orange-300 font-semibold'
                    : 'text-gray-900 dark:text-gray-100'
              ]"
            >
              ￥ {{ formatAmount(row[column.prop]) }}
            </span>
            <!-- 目标字段格式化 -->
            <span
              v-else-if="column.prop === 'targetSum'"
              :class="[
                'font-medium',
                getRowType(row) === 'grand-total'
                  ? 'text-blue-700 dark:text-blue-300 font-bold'
                  : getRowType(row) === 'group-total'
                    ? 'text-orange-700 dark:text-orange-300 font-semibold'
                    : 'text-gray-900 dark:text-gray-100'
              ]"
            >
              ￥ {{ formatAmount(row[column.prop]) }}
            </span>
            <!-- 完成率字段格式化 -->
            <span
              v-else-if="column.prop === 'completeRate'"
              :class="[
                'font-medium',
                getRowType(row) === 'grand-total'
                  ? 'text-blue-700 dark:text-blue-300 font-bold'
                  : getRowType(row) === 'group-total'
                    ? 'text-orange-700 dark:text-orange-300 font-semibold'
                    : 'text-gray-900 dark:text-gray-100'
              ]"
            >
              {{ formatCompleteRate(row[column.prop]) }}%
            </span>
            <!-- 其他字段普通文本显示 -->
            <span
              v-else
              :class="[
                getRowType(row) === 'grand-total'
                  ? 'text-blue-700 dark:text-blue-300 font-bold'
                  : getRowType(row) === 'group-total'
                    ? 'text-orange-700 dark:text-orange-300 font-semibold'
                    : 'text-gray-700 dark:text-gray-200'
              ]"
            >
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
            <p class="m-0 text-gray-500 dark:text-gray-400 text-14px"> 暂无数据 </p>
          </div>
        </div>
      </template>
    </ElTable>
  </div>
</template>

<style scoped lang="less">
// 响应式设计
@media (width <= 768px) {
  .@{prefix-cls} {
    box-shadow: 0 1px 4px rgb(0 0 0 / 6%);

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
      .el-table__body-wrapper .el-table__row {
        &:hover {
          background-color: transparent;
          transform: none;
          box-shadow: none;
        }

        // 打印时保持合计行的视觉区分
        &.@{prefix-cls}__row--group-total {
          background-color: #f3f4f6 !important;
          border-top: 1px solid #6b7280 !important;
          border-bottom: 1px solid #6b7280 !important;

          .el-table__cell {
            font-weight: 600 !important;
          }
        }

        &.@{prefix-cls}__row--grand-total {
          background-color: #e5e7eb !important;
          border-top: 2px solid #374151 !important;
          border-bottom: 2px solid #374151 !important;

          .el-table__cell {
            font-weight: 700 !important;
          }
        }
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
        font-size: 13px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        text-align: center;
        background-color: var(--el-fill-color-light);
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
}

@prefix-cls: ~'@{adminNamespace}-sale-data-summary-table';
</style>
