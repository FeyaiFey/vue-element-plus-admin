<script setup lang="ts">
import { computed, PropType } from 'vue'
import { ElTable, ElTableColumn } from 'element-plus'
import { Icon } from '@/components/Icon'
import { useDesign } from '@/hooks/web/useDesign'
import { StockSummary } from '@/api/report/types'

// 使用设计系统
const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('stock-summary-table')

// 定义 props
const props = defineProps({
  tableData: {
    type: Array as PropType<StockSummary[]>,
    default: () => []
  },
  tableType: {
    type: String as PropType<'detail' | 'summary'>,
    default: 'detail'
  },
  loading: {
    type: Boolean,
    default: false
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
    prop: 'rowId',
    label: '行号',
    minWidth: 80,
    fixed: 'left',
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'itemCode',
    label: '品号',
    minWidth: 250,
    headerAlign: 'center',
    fixed: 'left',
    align: 'center'
  },
  {
    prop: 'warehouse',
    label: '仓库',
    minWidth: 120,
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'qtySum',
    label: '数量合计',
    minWidth: 100,
    headerAlign: 'center',
    align: 'right',
    fixed: 'right'
  },
  {
    prop: 'secondQtySum',
    label: '第二数量合计',
    minWidth: 100,
    headerAlign: 'center',
    align: 'center',
    fixed: 'right'
  }
]

const summaryColumns = [
  {
    prop: 'rowId',
    label: '行号',
    minWidth: 80,
    fixed: 'left',
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'itemCode',
    label: '品号',
    minWidth: 250,
    headerAlign: 'center',
    fixed: 'left',
    align: 'center'
  },
  {
    prop: 'warehouse',
    label: '仓库',
    minWidth: 120,
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'qtySum',
    label: '数量合计',
    minWidth: 100,
    headerAlign: 'center',
    align: 'right',
    fixed: 'right'
  },
  {
    prop: 'secondQtySum',
    label: '第二数量合计',
    minWidth: 100,
    headerAlign: 'center',
    align: 'center',
    fixed: 'right'
  }
]

// 当前显示的列
const currentColumns = computed(() => {
  return props.tableType === 'detail' ? detailColumns : summaryColumns
})

// 格式化数字
const formatNumber = (value: number): string => {
  if (value === null || value === undefined) return '0'
  return value.toLocaleString()
}

// 汇总方法
const getSummary = (param: any) => {
  const { columns, data } = param
  const sums: string[] = []

  columns.forEach((column, index) => {
    if (index === 0) {
      // 第一列显示"合计"
      sums[index] = '合计'
    } else if (column.property === 'qtySum') {
      // 汇总数量合计
      const values = data.map((item) => Number(item[column.property]) || 0)
      const sum = values.reduce((prev, curr) => prev + curr, 0)
      sums[index] = formatNumber(sum)
    } else if (column.property === 'secondQtySum') {
      // 汇总第二数量合计
      const values = data.map((item) => Number(item[column.property]) || 0)
      const sum = values.reduce((prev, curr) => prev + curr, 0)
      sums[index] = formatNumber(sum)
    } else {
      // 其他列显示空字符串
      sums[index] = ''
    }
  })

  return sums
}
</script>

<template>
  <div
    :class="prefixCls"
    class="h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg overflow-hidden"
  >
    <ElTable
      :data="tableData"
      :loading="loading"
      :height="tableHeight"
      border
      stripe
      class="flex-1"
      size="small"
      highlight-current-row
      :show-summary="true"
      :summary-method="getSummary"
    >
      <!-- 数据列 -->
      <template v-for="column in currentColumns" :key="column.prop">
        <ElTableColumn
          :prop="column.prop"
          :label="column.label"
          :min-width="column.minWidth"
          :fixed="column.fixed"
          :align="column.align || 'left'"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <!-- 数量字段格式化 -->
            <span
              v-if="['qtySum', 'secondQtySum'].includes(column.prop)"
              class="font-medium text-gray-900 dark:text-gray-100"
            >
              {{ formatNumber(row[column.prop]) }}
            </span>
            <!-- 默认显示 -->
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

  // 表尾样式
  .el-table__footer-wrapper {
    border-top: 2px solid var(--el-color-primary);

    .el-table__footer {
      font-size: 13px;
      font-weight: 800;

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

// 标签样式优化
:deep(.el-tag) {
  font-size: 12px;
  border-radius: 4px;
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
@prefix-cls: ~'@{adminNamespace}-stock-table';
</style>
