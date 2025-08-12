<script setup lang="ts">
import { reactive, onMounted, watch, ref } from 'vue'
import { Echart } from '@/components/Echart'
import { ElInput, ElMessage } from 'element-plus'
import { EChartsOption } from 'echarts'
import { SaleInvoiceVsReceiptMonthlyChart } from '@/api/sale/types'
import { getSaleInvoiceVsReceiptMonthlyChartApi } from '@/api/sale'
import {
  getEmptyChartOptions,
  generateInvoiceVsCollectionChartOptions
} from './invoiceHistoryTrend'
import { useDesign } from '@/hooks/web/useDesign'

const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('invoice-history-trend')

const props = defineProps({
  componentHeight: {
    type: String,
    default: '400px'
  },
  autoLoad: {
    type: Boolean,
    default: true
  }
})

// 图表选项数据
const chartOptions = reactive<EChartsOption>(getEmptyChartOptions()) as EChartsOption

// 查询参数
const queryParams = ref({
  year: new Date().getFullYear()
})

// 加载状态
const loading = ref(false)

// 获取月度数据
const getMonthlyData = async (year: number): Promise<SaleInvoiceVsReceiptMonthlyChart[]> => {
  try {
    const res = await getSaleInvoiceVsReceiptMonthlyChartApi({ year })
    return res.data.list || []
  } catch (error) {
    console.error('获取月度开票额VS回款额数据失败:', error)
    throw error
  }
}

// 更新图表
const updateChart = async (year: number) => {
  try {
    loading.value = true

    // 获取月度数据
    const monthlyData = await getMonthlyData(year)

    // 生成图表配置
    const options = generateInvoiceVsCollectionChartOptions(monthlyData)

    // 应用配置到图表
    Object.assign(chartOptions, options)
  } catch (error) {
    console.error('获取月度开票额VS回款额数据失败:', error)
    ElMessage.error('数据加载失败')

    // 显示空图表
    Object.assign(chartOptions, getEmptyChartOptions())
  } finally {
    loading.value = false
  }
}

// 处理年份查询
const handleYearSearch = () => {
  const year = parseInt(queryParams.value.year.toString())
  if (year >= 2024 && year <= 2100) {
    updateChart(year)
  } else {
    ElMessage.warning('请输入2024-2100之间的年份')
  }
}

// 监听年份变化
watch(
  () => queryParams.value.year,
  (newYear) => {
    if (newYear && props.autoLoad) {
      handleYearSearch()
    }
  }
)

onMounted(() => {
  if (props.autoLoad) {
    updateChart(queryParams.value.year)
  }
})
</script>

<template>
  <div
    :class="prefixCls"
    :style="{ height: componentHeight }"
    class="h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg overflow-hidden"
  >
    <div
      class="h-40px flex items-center justify-between text-center font-bold text-20px dark:text-white-600 mb-2 px-4"
    >
      <div class="flex-1"></div>
      <div class="flex-1 text-center text-16px">月度开票额VS回款额趋势</div>
      <div class="flex-1 flex justify-end items-center gap-2">
        <span class="text-gray-500 dark:text-gray-400 text-14px">查询年份：</span>
        <ElInput
          v-model="queryParams.year"
          size="small"
          placeholder="年份"
          style="width: 80px"
          @keyup.enter="handleYearSearch"
        />
      </div>
    </div>

    <div class="chart-container flex-1 px-4">
      <Echart
        :options="chartOptions"
        :style="{ height: '100%', width: '100%' }"
        :loading="loading"
      />
    </div>
  </div>
</template>

<style lang="less" scoped>


// 响应式设计
@media (width <= 768px) {
  .@{prefix-cls} {
    .h-40px {
      height: 32px;
      font-size: 14px;
    }

    .text-16px {
      font-size: 14px;
    }

    .px-4 {
      padding-right: 16px;
      padding-left: 16px;
    }
  }
}

.chart-container {
  width: 100%;
  height: 100%;
}@prefix-cls: ~'@{adminNamespace}-invoice-history-trend';
</style>
