<script setup lang="ts">
import { computed, ref, PropType } from 'vue'
import { ElTable, ElTableColumn } from 'element-plus'
import { Icon } from '@/components/Icon'
import { useDesign } from '@/hooks/web/useDesign'
import { StockReport } from '@/api/report/types'

// 使用设计系统
const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('stock-table')

// 定义 props
const props = defineProps({
  tableData: {
    type: Array as PropType<StockReport[]>,
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
  enableSelection: {
    type: Boolean,
    default: false
  },
  tableHeight: {
    type: String,
    default: 'auto'
  }
})

// 定义 emits
const emit = defineEmits(['selection-change', 'summary-change'])

// 表格数据
const tableData = computed(() => props.tableData)

// 选中合计数据
const summaryData = ref({
  count: 0,
  qtySum: '0',
  secondQtySum: '0'
})

// 根据表格类型定义显示的列
const detailColumns = [
  {
    prop: 'rowId',
    label: '行号',
    minWidth: 50,
    fixed: 'left',
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'itemCode',
    label: '品号',
    minWidth: 150,
    headerAlign: 'center',
    fixed: 'left',
    align: 'center'
  },
  {
    prop: 'itemName',
    label: '品名',
    minWidth: 150,
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'lotCode',
    label: '批号',
    minWidth: 150,
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'qty',
    label: '数量',
    minWidth: 80,
    headerAlign: 'center',
    align: 'right',
    fixed: 'right'
  },
  {
    prop: 'secondQty',
    label: '第二数量',
    minWidth: 80,
    headerAlign: 'center',
    align: 'center',
    fixed: 'right'
  },
  {
    prop: 'burningProgram',
    label: '烧录程序',
    minWidth: 200,
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'testingProgram',
    label: '测试程序',
    minWidth: 200,
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'binLevel',
    label: 'BIN等级',
    minWidth: 120,
    align: 'center',
    headerAlign: 'center'
  },
  {
    prop: 'featureGroupName',
    label: '品号群组名称',
    minWidth: 200,
    align: 'center',
    headerAlign: 'center'
  },
  {
    prop: 'warehouse',
    label: '仓库',
    minWidth: 120,
    headerAlign: 'center',
    align: 'center'
  }
]

const summaryColumns = [
  {
    prop: 'rowId',
    label: '行号',
    minWidth: 50,
    headerAlign: 'center',
    align: 'center',
    fixed: 'left'
  },
  {
    prop: 'itemName',
    label: '品名',
    minWidth: 150,
    headerAlign: 'center',
    align: 'center',
    fixed: 'left'
  },
  {
    prop: 'lotCode',
    label: '批号',
    minWidth: 150,
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'qty',
    label: '数量',
    minWidth: 80,
    align: 'right',
    headerAlign: 'center',
    fixed: 'right'
  },
  {
    prop: 'secondQty',
    label: '第二数量',
    minWidth: 80,
    align: 'center',
    headerAlign: 'center',
    fixed: 'right'
  },
  {
    prop: 'burningProgram',
    label: '烧录程序',
    minWidth: 200,
    align: 'center',
    headerAlign: 'center'
  },
  {
    prop: 'testingProgram',
    label: '测试程序',
    minWidth: 200,
    align: 'center',
    headerAlign: 'center'
  },
  {
    prop: 'warehouse',
    label: '仓库',
    minWidth: 120,
    align: 'center',
    headerAlign: 'center'
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

// 选择变化事件处理
const handleSelectionChange = (selection: StockReport[]) => {
  emit('selection-change', selection)

  // 更新合计数据
  if (props.tableType === 'summary' && selection.length > 0) {
    const summary = calculateSelectionSummary(selection)
    summaryData.value = summary
    emit('summary-change', summary)
  } else {
    summaryData.value = {
      count: 0,
      qtySum: '0',
      secondQtySum: '0'
    }
    emit('summary-change', null)
  }
}

// 计算选中行的合计
const calculateSelectionSummary = (selection: StockReport[]) => {
  const qtySum = selection.reduce((sum, item) => sum + (Number(item.qty) || 0), 0)
  const secondQtySum = selection.reduce((sum, item) => sum + (Number(item.secondQty) || 0), 0)

  return {
    count: selection.length,
    qtySum: formatNumber(qtySum),
    secondQtySum: formatNumber(secondQtySum)
  }
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
      @selection-change="handleSelectionChange"
    >
      <!-- 选择列 -->
      <ElTableColumn
        v-if="enableSelection"
        type="selection"
        width="50"
        align="center"
        fixed="left"
      />

      <!-- 选中合计行 - 仅在summary模式下显示 -->
      <template v-if="tableType === 'summary'" #append>
        <div class="selection-summary-row">
          <div class="summary-content">
            <span class="summary-label">选中合计 ({{ summaryData.count }} 条):</span>
            <div class="summary-right">
              <span class="summary-item">
                数量合计: <span class="summary-value">{{ summaryData.qtySum }}</span>
              </span>
              <span class="summary-item">
                第二数量合计: <span class="summary-value">{{ summaryData.secondQtySum }}</span>
              </span>
            </div>
          </div>
        </div>
      </template>

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
              v-if="['qty', 'secondQty'].includes(column.prop)"
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

  .el-table__empty-block {
    display: flex;
    height: 100%;
    align-items: center;
    justify-content: center;
  }
}

// 选中合计行样式
.selection-summary-row {
  padding: 12px 16px;
  font-size: 13px;
  background-color: var(--el-fill-color-lighter);
  border-top: 2px solid var(--el-border-color);

  .summary-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    flex-wrap: nowrap;

    .summary-label {
      font-weight: 700;
      color: var(--el-color-primary);
      flex-shrink: 0;
    }

    .summary-right {
      display: flex;
      align-items: center;
      gap: 20px;
      flex-shrink: 0;
    }

    .summary-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 500;
      color: var(--el-text-color-primary);
      white-space: nowrap;

      .summary-value {
        min-width: 60px;
        font-weight: 700;
        color: var(--el-color-success);
        text-align: right;
      }
    }
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

  .selection-summary-row {
    background-color: var(--el-fill-color-darker);
    border-top-color: var(--el-border-color-darker);
  }
}
@prefix-cls: ~'@{adminNamespace}-stock-table';
</style>
