<script setup lang="ts">
import { computed, ref, PropType } from 'vue'
import { ElTable, ElTableColumn, ElButton, ElPopconfirm } from 'element-plus'
import { Icon } from '@/components/Icon'
import { useDesign } from '@/hooks/web/useDesign'
import { SaleTarget } from '@/api/sale/types'

// 使用设计系统
const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('sale-target-table')

// 定义 props
const props = defineProps({
  tableData: {
    type: Array as PropType<SaleTarget[]>,
    default: () => []
  },
  tableType: {
    type: String as PropType<'detail' | 'summary'>,
    default: 'detail'
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
const emit = defineEmits(['selection-change', 'summary-change', 'delete-click'])

// 表格数据
const tableData = computed(() => props.tableData)

// 选中合计数据
const summaryData = ref({
  count: 0,
  monthTarget: '0'
})

// 根据表格类型定义显示的列
const detailColumns = [
  {
    prop: 'id',
    label: 'ID',
    minWidth: 80,
    fixed: 'left',
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'year',
    label: '年份',
    minWidth: 120,
    headerAlign: 'center',
    align: 'center',
    fixed: 'left'
  },
  {
    prop: 'month',
    label: '月份',
    minWidth: 120,
    headerAlign: 'center',
    align: 'center',
    fixed: 'left'
  },
  {
    prop: 'departmentName',
    label: '部门',
    minWidth: 200,
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'employeeName',
    label: '销售员',
    minWidth: 120,
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'monthTarget',
    label: '月目标',
    minWidth: 120,
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'createBy',
    label: '创建人',
    minWidth: 120,
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'createTime',
    label: '创建时间',
    minWidth: 150,
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'updateTime',
    label: '更新时间',
    minWidth: 150,
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'operations',
    label: '操作',
    minWidth: 120,
    headerAlign: 'center',
    align: 'center',
    fixed: 'right'
  }
]

const summaryColumns = [
  {
    prop: 'id',
    label: 'ID',
    minWidth: 80,
    fixed: 'left',
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'year',
    label: '年份',
    minWidth: 120,
    headerAlign: 'center',
    align: 'center',
    fixed: 'left'
  },
  {
    prop: 'month',
    label: '月份',
    minWidth: 120,
    headerAlign: 'center',
    align: 'center',
    fixed: 'left'
  },
  {
    prop: 'departmentName',
    label: '部门',
    minWidth: 200,
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'employeeName',
    label: '销售员',
    minWidth: 120,
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'monthTarget',
    label: '月目标',
    minWidth: 120,
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'createBy',
    label: '创建人',
    minWidth: 120,
    headerAlign: 'center',
    align: 'center'
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
const handleSelectionChange = (selection: SaleTarget[]) => {
  emit('selection-change', selection)

  // 更新合计数据
  if (props.tableType === 'summary' && selection.length > 0) {
    const summary = calculateSelectionSummary(selection)
    summaryData.value = summary
    emit('summary-change', summary)
  } else {
    summaryData.value = {
      count: 0,
      monthTarget: '0'
    }
    emit('summary-change', null)
  }
}

// 计算选中行的合计
const calculateSelectionSummary = (selection: SaleTarget[]) => {
  const monthTarget = selection.reduce((sum, item) => sum + (Number(item.monthTarget) || 0), 0)

  return {
    count: selection.length,
    monthTarget: formatNumber(monthTarget)
  }
}

// 处理删除点击事件
const handleDeleteClick = (id: number) => {
  emit('delete-click', id)
}
</script>

<template>
  <div
    :class="prefixCls"
    class="h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg overflow-hidden"
  >
    <ElTable
      :data="tableData"
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
            <span class="summary-item"
              >月目标合计: <span class="summary-value">{{ summaryData.monthTarget }}</span></span
            >
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
            <!-- 月目标字段 -->
            <div v-if="column.prop === 'monthTarget'" class="month-target-container">
              <span class="month-target-value">{{ formatNumber(row[column.prop]) }}</span>
              <span v-if="!row[column.prop]" class="text-gray-500">-</span>
            </div>
            <!-- 操作列 -->
            <div v-else-if="column.prop === 'operations'" class="operations-container">
              <ElPopconfirm
                title="确定要删除这条记录吗？"
                confirm-button-text="确定"
                cancel-button-text="取消"
                icon="WarningFilled"
                icon-color="#f56c6c"
                width="220"
                @confirm="handleDeleteClick(row.id)"
              >
                <template #reference>
                  <ElButton type="danger" size="small" plain>
                    <Icon icon="vi-ep:delete" />
                    删除
                  </ElButton>
                </template>
              </ElPopconfirm>
            </div>
            <!-- 需要格式化的字段 -->
            <template
              v-else-if="
                [
                  'year',
                  'month',
                  'departmentName',
                  'employeeName',
                  'createBy',
                  'createTime',
                  'updateTime'
                ].includes(column.prop)
              "
            >
              <!-- 月目标字段格式化 -->
              <span
                v-if="column.prop === 'monthTarget'"
                class="font-medium text-gray-900 dark:text-gray-100"
              >
                {{ formatNumber(row[column.prop]) }}
              </span>
              <!-- 其他字段普通文本显示 -->
              <span v-else class="text-gray-700 dark:text-gray-200">
                {{ row[column.prop] || '-' }}
              </span>
            </template>
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

// 封装订单号样式
.packaging-orders-container {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px;

  .packaging-order-link {
    padding: 2px 4px;
    font-weight: 500;
    color: var(--el-color-primary);
    text-decoration: none;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s ease;

    &:hover {
      color: var(--el-color-primary-light-3);
      text-decoration: underline;
      background-color: var(--el-color-primary-light-9);
    }

    &:active {
      color: var(--el-color-primary-dark-2);
    }
  }

  .order-separator {
    margin: 0 2px;
    color: var(--el-text-color-secondary);
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
      margin-right: 10px;
      font-weight: 700;
      color: var(--el-color-primary);
    }

    .summary-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 500;
      color: var(--el-text-color-primary);

      .summary-value {
        width: 60px;
        font-weight: 700;
        color: var(--el-color-success);
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

// 操作列样式
.operations-container {
  display: flex;
  flex-direction: row;
  gap: 4px;
  align-items: center;
  justify-content: center;

  :deep(.ElButton) {
    min-width: 70px;
    margin: 0;

    &.is-disabled {
      opacity: 0.5;
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

  .packaging-orders-container {
    .packaging-order-link {
      &:hover {
        background-color: var(--el-color-primary-dark-2);
      }
    }
  }
}
@prefix-cls: ~'@{adminNamespace}-sale-target-table';
</style>
