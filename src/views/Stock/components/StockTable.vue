<script setup lang="ts">
import { Table, TableColumn } from '@/components/Table'
import { useDesign } from '@/hooks/web/useDesign'
import { ref, reactive, PropType, computed } from 'vue'
import type { StockItem } from '@/api/stock/types'
import { ContentWrap } from '@/components/ContentWrap'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('stock-table')

// Props定义
const props = defineProps({
  data: {
    type: Array as PropType<StockItem[]>,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  height: {
    type: Number,
    default: 800
  }
})

// Emits定义
const emit = defineEmits(['selection-change'])

// 表格列配置
const tableColumns = reactive<TableColumn[]>([
  {
    field: '',
    type: 'selection',
    width: 50,
    align: 'center'
  },
  {
    field: 'ITEM_BUSINESS_ID',
    label: '产品ID',
    width: 100,
    align: 'center'
  },
  {
    field: 'SHORTCUT',
    label: '类别',
    width: 100,
    align: 'center'
  },
  {
    field: 'FEATURE_GROUP_NAME',
    label: '品号群组',
    width: 100,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    field: 'ITEM_LOT_ID',
    label: '批号ID',
    width: 100,
    align: 'center',
    sortable: true
  },
  {
    field: 'ITEM_CODE',
    label: '产品编码',
    width: 150,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    field: 'ITEM_NAME',
    label: '产品名称',
    width: 'auto',
    align: 'center',
    showOverflowTooltip: true
  },
  {
    field: 'LOT_CODE',
    label: '批号',
    width: 100,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    field: 'BIN_LEVEL',
    label: 'Bin等级',
    width: 100,
    align: 'center'
  },
  {
    field: 'Z_TESTING_PROGRAM_NAME',
    label: '测试程序',
    width: 100,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    field: 'Z_BURNING_PROGRAM_CODE',
    label: '烧录程序',
    width: 100,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    field: 'INVENTORY_QTY',
    label: '库存数量',
    width: 100,
    align: 'center',
    sortable: true,
    fixed: 'right'
  },
  {
    field: 'SECOND_QTY',
    label: '第二数量',
    width: 100,
    align: 'center',
    sortable: true,
    fixed: 'right'
  },
  {
    field: 'WAREHOUSE_NAME',
    label: '仓库',
    width: 100,
    align: 'center'
  },
  {
    field: 'STOCK_AGE',
    label: '库存天数',
    width: 100,
    align: 'center',
    sortable: true
  }
])

// 选中行的合计数据
const selectedSummary = computed(() => {
  const selection = selectedRows.value
  return {
    inventoryQty: selection.reduce((sum, row) => sum + (Number(row.INVENTORY_QTY) || 0), 0),
    secondQty: selection.reduce((sum, row) => sum + (Number(row.SECOND_QTY) || 0), 0)
  }
})

// 保存选中的行数据
const selectedRows = ref<StockItem[]>([])

// 选择事件处理
const handleSelectionChange = (selection: StockItem[]) => {
  selectedRows.value = selection
  emit('selection-change', selection)
}
</script>

<template>
  <ContentWrap :class="prefixCls">
    <Table
      :loading="props.loading"
      :columns="tableColumns"
      :data="props.data"
      :height="props.height"
      @selection-change="handleSelectionChange"
      :class="`${prefixCls}__table`"
    >
      <template #empty>
        <div class="empty-block">
          <span class="empty-text">请点击查询按钮加载数据</span>
        </div>
      </template>
      <template #append>
        <div :class="`${prefixCls}__summary`">
          <div class="summary-item">
            <span class="label">已选择</span>
            <span class="value">{{ selectedRows.length }} 项</span>
          </div>
          <div class="divider"></div>
          <div class="summary-item">
            <span class="label">合计库存数量</span>
            <span class="value">{{ selectedSummary.inventoryQty }}</span>
          </div>
          <div class="divider"></div>
          <div class="summary-item">
            <span class="label">合计第二数量</span>
            <span class="value">{{ selectedSummary.secondQty }}</span>
          </div>
        </div>
      </template>
    </Table>
  </ContentWrap>
</template>

<style lang="less" scoped>
@prefix-cls: ~'@{adminNamespace}-stock-table';

.@{prefix-cls} {
  &__summary {
    display: flex;
    min-height: 48px;
    padding: 12px 16px;
    font-size: 14px;
    color: var(--el-text-color-regular);
    background-color: var(--el-fill-color-light);
    border-top: 1px solid var(--el-border-color-lighter);
    align-items: center;
    justify-content: flex-end;

    .summary-item {
      display: flex;
      align-items: center;
      gap: 8px;

      .label {
        color: var(--el-text-color-secondary);
      }

      .value {
        min-width: 60px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        text-align: right;
      }
    }

    .divider {
      width: 1px;
      height: 16px;
      margin: 0 16px;
      background-color: var(--el-border-color);
    }
  }

  &__table {
    :deep(.el-table) {
      overflow: hidden;
      border-radius: 8px;

      // 表头样式
      th.el-table__cell {
        height: 44px;
        padding: 8px 0;
        font-weight: 600;
        color: var(--el-text-color-primary);
        text-align: center !important;
        background-color: var(--el-fill-color-light);

        .cell {
          line-height: 1.4;
          word-break: break-word;
        }
      }

      // 单元格样式
      td.el-table__cell {
        height: 44px;
        padding: 8px 0;
        border-bottom: 1px solid var(--el-border-color-lighter);
      }

      // 多选框居中样式优化
      .el-table-column--selection {
        .cell {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0;
        }

        .el-checkbox {
          margin-right: 0;
        }

        .el-tooltip__trigger {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100%;
        }
      }

      // 行hover效果
      tr:hover > td.el-table__cell {
        background-color: var(--el-fill-color-light);
      }

      // 选中行样式
      .el-table__row.selected td.el-table__cell {
        background-color: var(--el-color-primary-light-9);
      }

      // 去除默认边框
      &::before {
        display: none;
      }

      // 空数据提示样式
      .empty-block {
        padding: 32px 0;

        .empty-text {
          font-size: 14px;
          color: var(--el-text-color-secondary);
        }
      }

      // 固定列阴影优化
      .el-table__fixed-right {
        height: 100% !important;
        box-shadow: -6px 0 6px -4px rgb(0 0 0 / 12%);
      }

      // 表尾合计行样式
      .el-table__append-wrapper {
        .el-table__cell {
          background-color: var(--el-fill-color-light);
        }
      }
    }

    // 表格容器样式
    :deep(.el-table__inner-wrapper) {
      border: 1px solid var(--el-border-color-lighter);
      border-radius: 8px;
    }

    // 表头和内容区域圆角
    :deep(.el-table__header-wrapper) {
      overflow: hidden;
      border-radius: 8px 8px 0 0;
    }

    :deep(.el-table__body-wrapper) {
      overflow: hidden;
      border-radius: 0 0 8px 8px;
    }
  }
}
</style>
