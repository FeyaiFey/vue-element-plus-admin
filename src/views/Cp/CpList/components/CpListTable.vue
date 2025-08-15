<script setup lang="ts">
import { computed, PropType } from 'vue'
import { ElTable, ElTableColumn } from 'element-plus'
import { Icon } from '@/components/Icon'
import { useDesign } from '@/hooks/web/useDesign'
import { CpTestOrders } from '@/api/cp/type'

// 使用设计系统
const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('cp-list-table')

// 定义 props
const props = defineProps({
  tableData: {
    type: Array as PropType<CpTestOrders[]>,
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
const emit = defineEmits(['selection-change', 'receipt-qty-click'])

// 表格数据
const tableData = computed(() => props.tableData)

// 根据表格类型定义显示的列
const detailColumns = [
  {
    prop: 'id',
    label: 'ID',
    minWidth: 80,
    headerAlign: 'center',
    align: 'center',
    fixed: 'left'
  },
  {
    prop: 'docNo',
    label: '订单号',
    minWidth: 120,
    headerAlign: 'center',
    align: 'center',
    fixed: 'left'
  },
  {
    prop: 'itemName',
    label: '品名',
    minWidth: 120,
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'lotName',
    label: '批号',
    minWidth: 150,
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'businessQty',
    label: '业务数量',
    minWidth: 100,
    headerAlign: 'center',
    align: 'right'
  },
  {
    prop: 'receiptQty',
    label: '收货数量',
    minWidth: 100,
    align: 'right',
    headerAlign: 'center'
  },
  {
    prop: 'wipQty',
    label: '在制数量',
    minWidth: 100,
    align: 'right',
    headerAlign: 'center'
  },
  {
    prop: 'progressName',
    label: '测试流程',
    minWidth: 150,
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'programName',
    label: '测试程序',
    minWidth: 100,
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'remark',
    label: '备注',
    minWidth: 200,
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'docDate',
    label: '订单日期',
    minWidth: 100,
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'firstArrivalDate',
    label: '首次到货',
    minWidth: 120,
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'supplier',
    label: '供应商',
    minWidth: 120,
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'status',
    label: '状态',
    minWidth: 120,
    headerAlign: 'center',
    align: 'center'
  }
]

const summaryColumns = [
  {
    prop: 'docNo',
    label: '订单号',
    minWidth: 120,
    fixed: 'left',
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'itemName',
    label: '品名',
    minWidth: 120,
    headerAlign: 'center',
    align: 'center',
    fixed: 'left'
  },
  {
    prop: 'lotName',
    label: '批号',
    minWidth: 80,
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'programName',
    label: '测试程序',
    minWidth: 150,
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'progressName',
    label: '测试流程',
    minWidth: 100,
    align: 'right',
    headerAlign: 'center'
  },
  {
    prop: 'businessQty',
    label: '业务数量',
    minWidth: 150,
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'receiptQty',
    label: '收货数量',
    minWidth: 100,
    headerAlign: 'center',
    align: 'right'
  },
  {
    prop: 'wipQty',
    label: '在制数量',
    minWidth: 100,
    align: 'right',
    headerAlign: 'center',
    fixed: 'right'
  },
  {
    prop: 'supplier',
    label: '供应商',
    minWidth: 150,
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
const handleSelectionChange = (selection: CpTestOrders[]) => {
  emit('selection-change', selection)
}

// 处理receiptQty点击事件
const handleReceiptQtyClick = (docNo: string) => {
  emit('receipt-qty-click', docNo)
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
            <!-- receiptQty字段可点击 -->
            <span
              v-if="column.prop === 'receiptQty' && row[column.prop] > 0"
              class="font-medium text-blue-600 dark:text-blue-400 cursor-pointer hover:text-blue-800 underline"
              @click="handleReceiptQtyClick(row.docNo)"
            >
              {{ formatNumber(row[column.prop]) }}
            </span>
            <!-- receiptQty为0时不可点击 -->
            <span
              v-else-if="column.prop === 'receiptQty'"
              class="font-medium text-gray-500 dark:text-gray-400"
            >
              {{ formatNumber(row[column.prop]) }}
            </span>
            <!-- 其他数量字段格式化 -->
            <span
              v-else-if="['businessQty'].includes(column.prop)"
              class="font-medium text-gray-900 dark:text-gray-100"
            >
              {{ formatNumber(row[column.prop]) }}
            </span>
            <!-- 日期字段格式化 -->
            <span
              v-else-if="['docDate', 'firstArrivalDate'].includes(column.prop)"
              class="text-gray-600 dark:text-gray-300"
            >
              {{ row[column.prop] }}
            </span>
            <span v-else-if="column.prop === 'status'" class="text-gray-600 dark:text-gray-300">
              {{ row[column.prop] === '0' ? '未结束' : '已结束' }}
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
@prefix-cls: ~'@{adminNamespace}-cp-list-table';
</style>
