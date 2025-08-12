<script setup lang="ts">
import { PropType, reactive, watch } from 'vue'
import { Echart } from '@/components/Echart'
import { ElCard } from 'element-plus'
import { EChartsOption } from 'echarts'
import { SaleAnalysisGaugeType } from '@/api/sale/types'
import { generateSaleAmountGaugeOptions } from './SaleAmountTargetGaugeData'
import { useDesign } from '@/hooks/web/useDesign'

const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('sale-amount-target-gauge')

const props = defineProps({
  saleAnalysisGauge: {
    type: Object as PropType<SaleAnalysisGaugeType>,
    default: () => ({})
  },
  type: {
    type: String as PropType<'month' | 'year'>,
    default: 'month'
  },
  height: {
    type: Number,
    default: 300
  }
})

export interface SaleAnalysisGaugeTypeData {
  value: number
  target: number
  rate: number
}

const getTypeData = (): SaleAnalysisGaugeTypeData => {
  if (props.type === 'month') {
    const amount = props.saleAnalysisGauge.this_month_sale_amount || 0
    const target = props.saleAnalysisGauge.this_month_sale_target || 1
    return {
      value: amount,
      target: target,
      rate: Number(((amount / target) * 100).toFixed(2))
    }
  } else {
    const amount = props.saleAnalysisGauge.last_year_sale_amount || 0
    const target = props.saleAnalysisGauge.this_year_sale_target || 1
    return {
      value: amount,
      target: target,
      rate: Number(((amount / target) * 100).toFixed(2))
    }
  }
}

// 图表选项数据
const amountYearGaugeOptionsData = reactive<EChartsOption>({}) as EChartsOption

const updateChart = () => {
  const data = getTypeData()
  Object.assign(
    amountYearGaugeOptionsData,
    generateSaleAmountGaugeOptions(props.type, data.value, data.target, data.rate)
  )
}

watch(
  () => props.saleAnalysisGauge,
  () => {
    if (props.saleAnalysisGauge && Object.keys(props.saleAnalysisGauge).length > 0) {
      updateChart()
    }
  },
  { immediate: true }
)
</script>

<template>
  <ElCard shadow="hover" :class="`${prefixCls}__card`" :style="{ height: `${props.height}px` }">
    <Echart
      v-if="props.saleAnalysisGauge && Object.keys(props.saleAnalysisGauge).length > 0"
      :options="amountYearGaugeOptionsData"
      :style="{ height: '100%', width: '100%' }"
    />
  </ElCard>
</template>

<style lang="less" scoped>
@prefix-cls: ~'@{adminNamespace}-sale-amount-target-gauge';

.@{prefix-cls}__card {
  height: 100%;

  // 确保卡片内容居中显示
  :deep(.el-card__body) {
    display: flex;
    height: 100%; // 减去卡片padding
    align-items: center;
    justify-content: center;
  }
}
</style>
