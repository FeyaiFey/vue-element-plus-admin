<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ContentWrap } from '@/components/ContentWrap'
import StockFilter from './components/StockFilter.vue'
import StockDashboard from './components/StockDashboard.vue'
import type { StockSummary, StockSummaryQuery } from '@/api/stock/types'
import { getStockSummaryApi } from '@/api/stock'
import { ElMessage } from 'element-plus'

// 数据状态
const loading = ref(false)
const stockData = ref<StockSummary[]>([])
const originalData = ref<StockSummary[]>([])

// 获取数据
const fetchData = async (params: StockSummaryQuery = {}) => {
  loading.value = true
  try {
    const res = await getStockSummaryApi(params)
    stockData.value = res.data.list
    originalData.value = res.data.list
  } catch (error) {
    console.error('获取库存汇总数据失败:', error)
    ElMessage.error('获取库存汇总数据失败')
  } finally {
    loading.value = false
  }
}

// 处理筛选
const handleFilter = (params: StockSummaryQuery) => {
  fetchData(params)
}

// 处理重置
const handleReset = () => {
  fetchData()
}

// 处理图表点击
const handleChartClick = ({ type, value }: { type: string; value: string }) => {
  if (type === 'feature_group') {
    stockData.value = originalData.value.filter((item) => item.FEATURE_GROUP_NAME === value)
  } else if (type === 'warehouse') {
    stockData.value = originalData.value.filter((item) => item.WAREHOUSE_NAME === value)
  }
}

// 初始化
onMounted(() => {
  fetchData()
})
</script>

<template>
  <ContentWrap>
    <div class="stock-dashboard-container">
      <!-- 筛选器 -->
      <StockFilter :loading="loading" @search="handleFilter" @reset="handleReset" />

      <!-- 仪表盘 -->
      <div class="dashboard-section">
        <StockDashboard :loading="loading" :data="stockData" @chart-click="handleChartClick" />
      </div>
    </div>
  </ContentWrap>
</template>

<style lang="less" scoped>
.stock-dashboard-container {
  width: 100%;
  height: 100%;
  background-color: var(--el-bg-color);
  box-sizing: border-box;

  .dashboard-section {
    padding: 16px;
    margin-top: 16px;
    background-color: var(--el-bg-color-overlay);
    border-radius: 8px;
    box-shadow: var(--el-box-shadow-light);
  }
}
</style>
