<script setup lang="ts">
import { Table } from '@/components/Table'
import type { StockSummary } from '@/api/stock/types'
import type { TableColumn } from '@/components/Table'

defineProps<{
  loading: boolean
  data: StockSummary[]
}>()

// 表格列配置
const columns: TableColumn[] = [
  {
    label: '品号群组',
    field: 'FEATURE_GROUP_NAME',
    align: 'center'
  },
  {
    label: '物料名称',
    field: 'ITEM_NAME',
    align: 'center',
    showOverflowTooltip: true
  },
  {
    label: '仓库',
    field: 'WAREHOUSE_NAME',
    align: 'center'
  },
  {
    label: '库存数量',
    field: 'INVENTORY_QTY',
    align: 'center'
  },
  {
    label: '平均库龄(天)',
    field: 'AVERAGE_STOCK_AGE',
    align: 'center',
    formatter: (row: StockSummary) => row.AVERAGE_STOCK_AGE.toFixed(2)
  }
]
</script>

<template>
  <div class="stock-table">
    <div class="table-block" v-loading="loading">
      <Table :columns="columns" :data="data" />
    </div>
  </div>
</template>

<style lang="less" scoped>
.stock-table {
  .table-block {
    padding: 16px;
    background-color: var(--el-bg-color);
    border-radius: 8px;
    transition: all 0.3s;

    &:hover {
      box-shadow: var(--el-box-shadow-light);
    }
  }
}
</style>
