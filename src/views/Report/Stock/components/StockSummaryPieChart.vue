<script setup lang="ts">
import { PropType, reactive, onMounted, watch } from 'vue'
import { Echart } from '@/components/Echart'
import { EChartsOption } from 'echarts'
import { StockSummary } from '@/api/report/types'
import { generateStockSummaryPieChartOptions } from './StockSummaryPieChart'
import { useDesign } from '@/hooks/web/useDesign'

const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('stock-summary-bar-chart')

const props = defineProps({
  summaryList: {
    type: Array as PropType<StockSummary[]>,
    default: () => []
  }
})

// 图表选项数据
const amountYearGaugeOptionsData = reactive<EChartsOption>({}) as EChartsOption

const updateChart = () => {
  Object.assign(amountYearGaugeOptionsData, generateStockSummaryPieChartOptions(props.summaryList))
}

watch(
  () => props.summaryList,
  () => {
    updateChart()
  }
)

onMounted(() => {
  updateChart()
})
</script>

<template>
  <div
    :class="prefixCls"
    class="h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg overflow-hidden"
  >
    <Echart :options="amountYearGaugeOptionsData" />
  </div>
</template>
