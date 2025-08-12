<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElRow, ElCol, ElMessage } from 'element-plus'
import { useDesign } from '@/hooks/web/useDesign'
import PanelGroup from './components/PanelGroup.vue'
import SaleAmountTargetGauge from './components/SaleAmountTargetGauge.vue'
import ChipClassPie from './components/ChipClassPie.vue'
import ForecastVsActual from './components/forecastVsActual.vue'
import CompleteRateBarChart from './components/CompleteRateBarChart.vue'
import SaleAmountBarChart from './components/SaleAmountBarChart.vue'
import InvoiceVsCollection from './components/invoiceVsCollection.vue'
import InvoiceHistoryTrend from './components/invoiceHistoryTrend.vue'
import {
  getSaleAnalysisPannelApi,
  getSaleAnalysisGaugeApi,
  getSaleAnalysisChipClassPieApi,
  exportSaleDataApi,
  getSaleDataSummaryApi
} from '@/api/sale'
import type {
  SaleAnalysisPannel,
  SaleAnalysisGauge,
  SaleAnalysisGaugeType,
  SaleAnalysisChipClassPie,
  SaleDataDetailQuery,
  SaleDataSummary
} from '@/api/sale/types'

// 使用设计系统
const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('sale-analysis')

// 定义组件名称（用于keep-alive缓存）
defineOptions({
  name: 'SaleAnalysis'
})

// 销售分析看板数据定义
const saleAnalysisPannel = ref<SaleAnalysisPannel>({} as SaleAnalysisPannel)
const loading = ref(true)

// 月度年度销售额目标仪表板数据定义
const saleAnalysisGauge = ref<SaleAnalysisGauge>({} as SaleAnalysisGauge)
const saleAnalysisGaugeType = ref<SaleAnalysisGaugeType>({} as SaleAnalysisGaugeType)

const concatData = () => {
  saleAnalysisGaugeType.value = {
    this_month_sale_target: saleAnalysisGauge.value.this_month_sale_target,
    this_year_sale_target: saleAnalysisGauge.value.this_year_sale_target,
    this_month_sale_amount: saleAnalysisPannel.value.this_month_sale_amount,
    last_year_sale_amount: saleAnalysisPannel.value.this_year_sale_amount
  }
}

// 芯片分类销售数据定义
const saleAnalysisChipClassPie = ref<SaleAnalysisChipClassPie[]>([])
const forecastVsActualData = ref<SaleDataSummary[]>([])

const getData = async () => {
  try {
    loading.value = true
    const resPannel = await getSaleAnalysisPannelApi()
    const resGauge = await getSaleAnalysisGaugeApi()
    const resChipClassPie = await getSaleAnalysisChipClassPieApi()
    saleAnalysisPannel.value = resPannel.data.list
    saleAnalysisGauge.value = resGauge.data.list
    saleAnalysisChipClassPie.value = resChipClassPie.data.list
    concatData()
  } catch (error) {
    console.error('获取销售分析数据失败:', error)
  } finally {
    loading.value = false
  }
}

const queryParams = ref<SaleDataDetailQuery>({
  beginDate: 'today',
  endDate: 'today'
})

const forecastVsActualQueryParams = ref<any>({
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1
})

const getForecastVsActualData = async () => {
  // 本月第一天
  const resForecastVsActual = await getSaleDataSummaryApi({
    beginDate: forecastVsActualQueryParams.value.year,
    endDate: forecastVsActualQueryParams.value.month
  })
  forecastVsActualData.value = resForecastVsActual.data.list
}

// 下载表格
const handleDownload = async () => {
  try {
    const response = await exportSaleDataApi({
      ...queryParams.value
    })

    // 获取文件名
    const disposition = (response as any).headers?.['content-disposition']
    let filename = `销售数据_${new Date().toLocaleDateString()}.xlsx`

    if (disposition) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
      const matches = filenameRegex.exec(disposition)
      if (matches?.[1]) {
        filename = decodeURIComponent(matches[1].replace(/['"]/g, ''))
      }
    }

    // 创建下载链接
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()

    // 清理
    setTimeout(() => {
      window.URL.revokeObjectURL(url)
    }, 100)

    ElMessage.success('下载成功')
  } catch (error: any) {
    ElMessage.error('下载失败: ' + (error.message || '未知错误'))
  }
}

const handleForecastVsActualDataSearch = (params: { year: number; month: number }) => {
  forecastVsActualQueryParams.value.year = params.year
  forecastVsActualQueryParams.value.month = params.month
  getForecastVsActualData()
}

onMounted(() => {
  getData()
  getForecastVsActualData()
})
</script>

<template>
  <PanelGroup :panelData="saleAnalysisPannel" :loading="loading" @download="handleDownload" />
  <ElRow :gutter="20" :class="`${prefixCls}__chart-row`">
    <ElCol :xl="6" :lg="6" :md="6" :sm="24" :xs="24" :class="`${prefixCls}__row-item`">
      <SaleAmountTargetGauge
        :saleAnalysisGauge="saleAnalysisGaugeType"
        type="month"
        :height="350"
      />
    </ElCol>
    <ElCol :xl="12" :lg="12" :md="12" :sm="24" :xs="24" :class="`${prefixCls}__row-item`">
      <ChipClassPie :chipClassPieList="saleAnalysisChipClassPie" :height="350" />
    </ElCol>
    <ElCol :xl="6" :lg="6" :md="6" :sm="24" :xs="24" :class="`${prefixCls}__row-item`">
      <SaleAmountTargetGauge :saleAnalysisGauge="saleAnalysisGaugeType" type="year" :height="350" />
    </ElCol>
  </ElRow>
  <ElRow :gutter="20" :class="`${prefixCls}__chart-row`">
    <ElCol :xl="12" :lg="12" :md="24" :sm="24" :xs="24" :class="`${prefixCls}__row-item`">
      <ForecastVsActual
        :componentHeight="'850px'"
        :tableData="forecastVsActualData"
        @search="handleForecastVsActualDataSearch"
      />
    </ElCol>
    <ElCol :xl="12" :lg="12" :md="24" :sm="24" :xs="24" :class="`${prefixCls}__row-item`">
      <CompleteRateBarChart :auto-load="true" :componentHeight="'850px'" />
    </ElCol>
  </ElRow>
  <ElRow :gutter="20" :class="`${prefixCls}__chart-row`">
    <ElCol :xl="24" :lg="24" :md="24" :sm="24" :xs="24" :class="`${prefixCls}__row-item`">
      <SaleAmountBarChart :auto-load="true" :componentHeight="'850px'" />
    </ElCol>
  </ElRow>
  <ElRow :gutter="20" :class="`${prefixCls}__chart-row`">
    <ElCol :xl="12" :lg="12" :md="24" :sm="24" :xs="24" :class="`${prefixCls}__row-item`">
      <InvoiceVsCollection :auto-load="true" :componentHeight="'700px'" />
    </ElCol>
    <ElCol :xl="12" :lg="12" :md="24" :sm="24" :xs="24" :class="`${prefixCls}__row-item`">
      <InvoiceHistoryTrend :auto-load="true" :componentHeight="'700px'" />
    </ElCol>
  </ElRow>
</template>

<style scoped lang="less">
@prefix-cls: ~'@{adminNamespace}-sale-analysis';

.@{prefix-cls}__chart-row {
  margin-bottom: 20px;
}

.@{prefix-cls}__row-item {
  margin-bottom: 20px;

  // 中等屏幕及以上时，移除底部间距（因为是水平布局）
  @media (width >= 768px) {
    margin-bottom: 0;
  }
}
</style>
