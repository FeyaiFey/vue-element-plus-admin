<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick, computed } from 'vue'
import * as echarts from 'echarts'
import { ElSelect, ElOption, ElRadioGroup, ElRadioButton } from 'element-plus'
import { getButterflyChartOption } from './saleTarget'
import type { SaleTargetDetail, SaleTargetSummary } from '@/api/sale/type'

// 排序字段类型
type SortField = 'PERCENTAGE' | 'FORECAST_QTY' | 'PRICE_QTY'
// 排序方向类型
type SortDirection = 'asc' | 'desc'

const props = defineProps<{
  data: SaleTargetDetail[] | SaleTargetSummary[]
  type: 'detail' | 'summary'
}>()

// 选择的排序字段
const sortField = ref<SortField>('PRICE_QTY')
// 选择的排序方向
const sortDirection = ref<SortDirection>('asc')

const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

// 根据数据计算图表高度
const calcChartHeight = computed(() => {
  if (!props.data || !Array.isArray(props.data)) return 400

  // 默认最小高度
  const minHeight = 400

  // 如果是明细图表，根据数据条数动态计算高度
  if (props.type === 'detail') {
    // 每条数据项的大约高度(像素)
    const itemHeight = 30
    // 顶部标题和其他元素的高度
    const headerHeight = 120
    // 底部留白
    const footerSpace = 50

    const totalHeight = headerHeight + props.data.length * itemHeight + footerSpace

    // 返回计算高度，但不低于最小高度
    return Math.max(totalHeight, minHeight)
  }

  // 如果是汇总图表，返回固定高度
  return props.type === 'summary' ? 'calc(100vh - 200px)' : minHeight
})

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return

  // 如果已经存在图表实例，先销毁
  if (chart) {
    chart.dispose()
  }

  // 设置容器高度
  if (props.type === 'detail') {
    chartRef.value.style.height = `${calcChartHeight.value}px`
  }

  // 初始化图表
  chart = echarts.init(chartRef.value)
  updateChart()
}

// 更新图表
const updateChart = () => {
  if (!chart) return
  if (!props.data || !Array.isArray(props.data) || props.data.length === 0) {
    // 没有数据时显示空状态
    chart.showLoading({
      text: '暂无数据',
      maskColor: 'rgba(255, 255, 255, 0.8)'
    })
    return
  }

  // 更新容器高度
  if (props.type === 'detail' && chartRef.value) {
    chartRef.value.style.height = `${calcChartHeight.value}px`
  }

  chart.hideLoading()
  const options = getButterflyChartOption(
    props.data,
    props.type,
    sortField.value,
    sortDirection.value
  )
  chart.setOption(options)

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
    case 'FORECAST_QTY':
      return '预测销量'
    case 'PRICE_QTY':
      return '实际销量'
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
  { deep: true }
)

// 监听窗口大小变化
const handleResize = () => {
  if (chart) {
    if (props.type === 'detail' && chartRef.value) {
      chartRef.value.style.height = `${calcChartHeight.value}px`
    }
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
  <div class="chart-wrapper" :class="{ 'detail-chart': props.type === 'detail' }">
    <div class="chart-controls">
      <div class="title-area">
        <div class="main-title">
          <span v-if="props.type === 'detail'">芯片销量预测vs实际</span>
          <span v-else>业务员销量预测vs实际</span>
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
          <ElOption label="预测销量" value="FORECAST_QTY" />
          <ElOption label="实际销量" value="PRICE_QTY" />
        </ElSelect>
      </div>
    </div>
    <div ref="chartRef" class="chart-container"></div>
  </div>
</template>

<style lang="less" scoped>
.chart-wrapper {
  display: flex;
  width: 100%;
  flex-direction: column;

  &:not(.detail-chart) {
    height: calc(100vh - 200px);
  }

  &.detail-chart {
    height: auto;
  }
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

.chart-container {
  width: 100%;
  flex: 1;

  .detail-chart & {
    height: auto !important;
    min-height: unset;
  }
}
</style>
