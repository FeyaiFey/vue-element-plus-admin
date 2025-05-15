<script setup lang="ts">
import { ElCard, ElSkeleton } from 'element-plus'
import { Echart } from '@/components/Echart'
import { Icon } from '@/components/Icon'
import { ref, onMounted, watch } from 'vue'
import { getSalePercentageBarChartApi } from '@/api/sale'
import {
  generateBarChartOption,
  generateAllDrillDownOptions,
  DrillDownData
} from './barChartOption'
import type {
  SaleAmountBarChartEChartsResponse,
  SaleAmountBarChartEChartsLevelData,
  SaleAmountBarChartEChartsDataItem,
  SaleAmountQuery
} from '@/api/sale/type'

const loading = ref(true)
const chartRef = ref()
const currentLevel = ref(0)

// 接收父组件传递的查询参数
const props = defineProps<{
  queryParams: SaleAmountQuery
}>()

// 初始化图表选项
const barOptionsData = ref<any>(generateBarChartOption({} as SaleAmountBarChartEChartsResponse))

// 所有层级的数据和选项
const allLevelData = ref<DrillDownData[]>([])
const allOptions = ref<Record<string, any>>({})

// 选项栈，用于记录下钻历史
const optionStack = ref<string[]>([])

// 获取柱状图数据
const getSaleAmountBarChart = async () => {
  loading.value = true
  try {
    const res = await getSalePercentageBarChartApi({
      year: String(props.queryParams.year),
      month: String(props.queryParams.month)
    })
    if (res && res.data) {
      // 处理数据，转换为多层下钻格式
      processDrillDownData(res.data)
      // 生成所有层级的选项
      allOptions.value = generateAllDrillDownOptions(allLevelData.value)
      // 设置初始选项
      if (allLevelData.value.length > 0) {
        barOptionsData.value = allOptions.value[allLevelData.value[0].groupId]
        // 重置下钻历史
        optionStack.value = []
        currentLevel.value = 0
      }
    }
  } catch (error) {
    console.error('获取销售金额柱状图数据失败', error)
  } finally {
    loading.value = false
  }
}

// 处理下钻数据
const processDrillDownData = (data: SaleAmountBarChartEChartsResponse) => {
  // 清空之前的数据
  allLevelData.value = []

  // 根据API返回的数据结构进行处理
  if (data.list && data.list.length > 0) {
    data.list.forEach((levelData: SaleAmountBarChartEChartsLevelData) => {
      const drillDownData: DrillDownData = {
        groupId: levelData.level_id,
        data: levelData.items.map((item: SaleAmountBarChartEChartsDataItem) => ({
          name: item.name,
          value: item.value,
          groupId: item.group_id,
          childGroupId: item.child_group_id
        }))
      }

      allLevelData.value.push(drillDownData)
    })
  } else {
    // 如果没有数据，提供一个默认的空数据层级
    allLevelData.value = [
      {
        groupId: 'empty',
        data: []
      }
    ]
  }
}

// 向下钻取
const goForward = (optionId: string) => {
  // 保存当前选项ID
  const currentId = barOptionsData.value.id as string
  if (currentId) {
    optionStack.value.push(currentId)
    currentLevel.value++
  }

  // 设置新的图表选项
  barOptionsData.value = allOptions.value[optionId]
}

// 向上返回
const goBack = () => {
  if (optionStack.value.length === 0) {
    console.log('已经在顶层!')
    return
  }

  const prevOptionId = optionStack.value.pop()
  if (prevOptionId && allOptions.value[prevOptionId]) {
    // 设置上一级的图表选项
    barOptionsData.value = allOptions.value[prevOptionId]
    currentLevel.value--
  } else {
    console.error('找不到上一级选项:', prevOptionId)
    // 如果找不到上一级选项，返回第一层
    if (allLevelData.value.length > 0) {
      barOptionsData.value = allOptions.value[allLevelData.value[0].groupId]
      optionStack.value = []
      currentLevel.value = 0
    }
  }
}

// 图表点击事件处理
const handleChartClick = (params: any) => {
  const dataItem = params.data
  if (dataItem && dataItem.childGroupId && allOptions.value[dataItem.childGroupId]) {
    const childGroupId = dataItem.childGroupId
    goForward(childGroupId)
  }
}

// 监听查询参数变化，重新获取数据
watch(
  () => props.queryParams,
  () => {
    getSaleAmountBarChart()
  },
  { deep: true }
)

// 监听图表选项变化
watch(
  barOptionsData,
  () => {
    // 确保图表实例存在
    if (chartRef.value && chartRef.value.getEchartsInstance) {
      const instance = chartRef.value.getEchartsInstance()
      // 重新设置图表选项
      instance.setOption(barOptionsData.value, true)
    }
  },
  { deep: true }
)

// 初始化
onMounted(() => {
  getSaleAmountBarChart()
})
</script>

<template>
  <ElCard shadow="never" class="chart-card">
    <ElSkeleton :loading="loading" animated>
      <template #default>
        <div class="chart-container">
          <div v-if="currentLevel > 0" class="back-button" @click="goBack">
            <Icon icon="ep:back" class="mr-1" />
            返回上一级
          </div>
          <div v-else class="placeholder"></div>
          <Echart ref="chartRef" :options="barOptionsData" @click="handleChartClick" />
        </div>
      </template>
    </ElSkeleton>
  </ElCard>
</template>

<style lang="less" scoped>
.chart-card {
  width: 100%;
  height: 100%;

  .chart-container {
    width: 100%;
    height: 400px;

    .back-button {
      display: flex;
      height: 20px;
      font-size: 14px;
      color: #409eff;
      cursor: pointer;
      align-items: center;

      &:hover {
        text-decoration: underline;
      }
    }

    .placeholder {
      height: 20px;
    }
  }
}
</style>
