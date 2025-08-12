<script setup lang="ts">
import { PropType, reactive, onMounted, watch } from 'vue'
import { Echart } from '@/components/Echart'
import { ElCard } from 'element-plus'
import { EChartsOption } from 'echarts'
import { SaleAnalysisChipClassPie } from '@/api/sale/types'
import { generateSaleProportionOptions } from './ChipClassPie'
import { useDesign } from '@/hooks/web/useDesign'

const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('sale-analysis-chip-class-pie')

const props = defineProps({
  chipClassPieList: {
    type: Array as PropType<SaleAnalysisChipClassPie[]>,
    default: () => []
  },
  height: {
    type: Number,
    default: 300
  }
})

// 图表选项数据
const chipClassPieOptionsData = reactive<EChartsOption>({}) as EChartsOption

const updateChart = () => {
  Object.assign(chipClassPieOptionsData, generateSaleProportionOptions(props.chipClassPieList))
}

watch(
  () => props.chipClassPieList,
  () => {
    updateChart()
  }
)

onMounted(() => {
  updateChart()
})
</script>

<template>
  <ElCard shadow="hover" :class="`${prefixCls}__card`" :style="{ height: `${props.height}px` }">
    <Echart :options="chipClassPieOptionsData" :style="{ height: '100%', width: '100%' }" />
  </ElCard>
</template>

<style lang="less" scoped>
@prefix-cls: ~'@{adminNamespace}-sale-analysis-chip-class-pie';

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
