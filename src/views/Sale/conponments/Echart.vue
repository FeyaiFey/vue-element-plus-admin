<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { getButterflyChartOption } from '@/views/Sale/conponments/options'
import type { SaleTargetDetail, SaleTargetSummary } from '@/api/sale/type'

const props = defineProps<{
  data: SaleTargetDetail[] | SaleTargetSummary[]
  type: 'detail' | 'summary'
}>()

const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  const options = getButterflyChartOption(props.data, props.type)
  chart.setOption(options)
}

// 监听数据变化
watch(
  () => props.data,
  () => {
    if (chart) {
      const options = getButterflyChartOption(props.data, props.type)
      chart.setOption(options)
    }
  },
  { deep: true }
)

// 监听窗口大小变化
const handleResize = () => {
  chart?.resize()
}

// 组件挂载时初始化
onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

// 组件卸载时清理
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  chart?.dispose()
})
</script>

<template>
  <div ref="chartRef" class="chart-container"></div>
</template>

<style lang="less" scoped>
.chart-container {
  width: 100%;
  height: 400px;
}
</style>
