<script setup lang="ts">
import { ref, unref } from 'vue'
import { ElMessage } from 'element-plus'
import { useTable } from '@/hooks/web/useTable'
import { useDesign } from '@/hooks/web/useDesign'
import { getStockList, exportStock } from '@/api/stock'
import type { StockItem, StockQueryParams } from '@/api/stock/types'
import StockSearch from './components/StockSearch.vue'
import StockTable from './components/StockTable.vue'
import { ContentWrap } from '@/components/ContentWrap'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('stock')

// 组件引用
const searchRef = ref<InstanceType<typeof StockSearch>>()
const tableRef = ref<InstanceType<typeof StockTable>>()

// 查询参数
const queryParams = ref<StockQueryParams>({
  itemCodes: '',
  itemNames: '',
  warehouses: '',
  featureGroups: '',
  lotCodes: '',
  shortcuts: '',
  showZeroStock: true
})

// 表格配置
const { tableRegister, tableState, tableMethods } = useTable({
  immediate: false,
  fetchDataApi: async () => {
    try {
      const res = await getStockList(unref(queryParams))
      return {
        list: res.data || [],
        total: 0
      }
    } catch (error) {
      console.error('Failed to fetch stock list:', error)
      return {
        list: [],
        total: 0
      }
    }
  }
})

const { loading, dataList } = tableState

// 查询方法
const handleSearch = async () => {
  await tableMethods.getList()
}

// 重置方法
const handleReset = async () => {
  const search = unref(searchRef)
  if (search) {
    search.handleReset()
  }
  await tableMethods.getList()
}

// 导出方法
const handleExport = async () => {
  try {
    await exportStock(unref(queryParams))
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('Failed to export stock:', error)
    ElMessage.error('导出失败')
  }
}

// 选择事件
const handleSelectionChange = (selection: StockItem[]) => {
  console.log('selected:', selection)
}
</script>

<template>
  <ContentWrap :class="prefixCls">
    <!-- 搜索区域 -->
    <StockSearch
      ref="searchRef"
      v-model:queryParams="queryParams"
      :loading="loading"
      @search="handleSearch"
      @reset="handleReset"
      @export="handleExport"
    />

    <!-- 表格区域 -->
    <StockTable
      ref="tableRef"
      :loading="loading"
      :data="dataList"
      :height="600"
      @register="tableRegister"
      @selection-change="handleSelectionChange"
    />
  </ContentWrap>
</template>
