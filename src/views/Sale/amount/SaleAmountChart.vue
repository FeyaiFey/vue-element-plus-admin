<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import { ElSelect, ElOption, ElRadioGroup, ElRadioButton, ElEmpty } from 'element-plus'
import { getButterflyChartOption } from './saleAmount'
import type { SaleAmountAnalyze } from '@/api/sale/type'

// 排序字段类型
type SortField = 'PERCENTAGE' | 'FORECAST_AMOUNT' | 'PRICE_AMOUNT'
// 排序方向类型
type SortDirection = 'asc' | 'desc'

const props = defineProps<{
  data: SaleAmountAnalyze[]
}>()

// 选择的排序字段
const sortField = ref<SortField>('PRICE_AMOUNT')
// 选择的排序方向
const sortDirection = ref<SortDirection>('asc')

const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null
// 是否有数据
const hasData = ref(false)
// 加载状态
const loading = ref(false)

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return

  // 如果已经存在图表实例，先销毁
  if (chart) {
    chart.dispose()
  }

  // 初始化图表
  chart = echarts.init(chartRef.value)
  updateChart()
}

// 更新图表
const updateChart = () => {
  if (!chart) return

  loading.value = true

  // 检查数据是否存在且有效
  hasData.value = !!(props.data && Array.isArray(props.data) && props.data.length > 0)

  if (!hasData.value) {
    // 没有数据时，隐藏加载状态，不显示图表
    loading.value = false
    chart.clear()
    return
  }

  try {
    loading.value = true
    const options = getButterflyChartOption(props.data, sortField.value, sortDirection.value)
    chart.setOption(options)
    loading.value = false
  } catch (error) {
    console.error('设置图表选项失败:', error)
    loading.value = false
  }

  // 强制重新计算尺寸
  setTimeout(() => {
    chart?.resize()
  }, 200)
}

// 排序字段变化
const handleSortFieldChange = (value: SortField) => {
  sortField.value = value
  updateChart()
}

// 排序方向变化
const handleSortDirectionChange = (value: SortDirection) => {
  sortDirection.value = value
  updateChart()
}

// 获取排序字段中文名
const getSortFieldName = () => {
  switch (sortField.value) {
    case 'PERCENTAGE':
      return '完成率'
    case 'FORECAST_AMOUNT':
      return '预测销售额'
    case 'PRICE_AMOUNT':
      return '实际销售额'
    default:
      return '完成率'
  }
}

// 获取排序方向中文名
const getSortDirectionName = () => {
  return sortDirection.value === 'asc' ? '升序' : '降序'
}

// 监听数据变化
watch(
  () => props.data,
  () => {
    nextTick(() => {
      updateChart()
    })
  },
  { deep: true, immediate: true }
)

// 监听窗口大小变化
const handleResize = () => {
  if (chart) {
    chart.resize()
  }
}

// 组件挂载时初始化
onMounted(() => {
  nextTick(() => {
    initChart()
    window.addEventListener('resize', handleResize)
  })
})

// 组件卸载时清理
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (chart) {
    chart.dispose()
    chart = null
  }
})
</script>

<template>
  <div class="chart-wrapper">
    <div class="chart-controls">
      <div class="title-area">
        <div class="main-title">
          <span>销售额预测vs实际对比图</span>
        </div>
        <div class="sub-title"> 排序：{{ getSortFieldName() }} {{ getSortDirectionName() }} </div>
      </div>
      <div class="control-area">
        <ElRadioGroup v-model="sortDirection" size="small" @change="handleSortDirectionChange">
          <ElRadioButton value="asc">升序</ElRadioButton>
          <ElRadioButton value="desc">降序</ElRadioButton>
        </ElRadioGroup>

        <ElSelect
          v-model="sortField"
          size="small"
          placeholder="请选择排序字段"
          style="width: 120px; margin-left: 10px"
          @change="handleSortFieldChange"
        >
          <ElOption label="完成率" value="PERCENTAGE" />
          <ElOption label="预测销售额" value="FORECAST_AMOUNT" />
          <ElOption label="实际销售额" value="PRICE_AMOUNT" />
        </ElSelect>
      </div>
    </div>
    <div class="chart-content">
      <div ref="chartRef" class="chart-container" v-loading="loading"></div>
      <ElEmpty v-if="!hasData && !loading" description="暂无数据" />
    </div>
  </div>
</template>

<style lang="less" scoped>
.chart-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
}

.chart-controls {
  display: flex;
  min-height: 60px;
  padding: 10px 20px;
  margin-bottom: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  justify-content: space-between;
  align-items: center;

  .title-area {
    display: flex;
    flex-direction: column;
    justify-content: center;

    .main-title {
      font-size: 16px;
      font-weight: bold;
      line-height: 1.5;
      color: #303133;
    }

    .sub-title {
      font-size: 12px;
      line-height: 1.5;
      color: #909399;
    }
  }

  .control-area {
    display: flex;
    align-items: center;
  }
}

.chart-content {
  position: relative;
  display: flex;
  width: 100%;
  flex: 1;
  justify-content: center;
  align-items: center;
}

.chart-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
