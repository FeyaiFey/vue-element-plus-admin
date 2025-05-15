<script setup lang="ts">
import { ElCard, ElSkeleton, ElInput } from 'element-plus'
import { Echart } from '@/components/Echart'
import { Icon } from '@/components/Icon'
import { ref, onMounted, nextTick } from 'vue'
import { getSaleAmountBarChartApi } from '@/api/sale'
import {
  generateBarChartOption,
  generateAllDrillDownOptions,
  DrillDownData
} from './barChartOption'
import type {
  SaleAmountBarChartEChartsResponse,
  SaleAmountBarChartEChartsLevelData,
  SaleAmountBarChartEChartsDataItem
} from '@/api/sale/type'

const loading = ref(true)
const chartRef = ref()
const currentLevel = ref(0)

const queryForm = ref({
  year: String(new Date().getFullYear()),
  month: String(new Date().getMonth() + 1)
})

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
    const res = await getSaleAmountBarChartApi({
      year: queryForm.value.year,
      month: queryForm.value.month
    })
    if (res && res.data) {
      // 处理数据，转换为多层下钻格式
      processDrillDownData(res.data)
      // 生成所有层级的选项
      allOptions.value = generateAllDrillDownOptions(allLevelData.value)
      // 设置初始选项
      if (allLevelData.value.length > 0) {
        barOptionsData.value = allOptions.value[allLevelData.value[0].groupId]
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
  }

  // 设置新的图表选项
  barOptionsData.value = allOptions.value[optionId]
  currentLevel.value++
}

// 向上返回
const goBack = () => {
  if (optionStack.value.length === 0) {
    console.log('已经在顶层!')
    return
  }

  const prevOptionId = optionStack.value.pop()
  if (prevOptionId) {
    // 设置上一级的图表选项
    barOptionsData.value = allOptions.value[prevOptionId]
    currentLevel.value--
  }
}

// 图表点击事件处理
const handleChartClick = (params: any) => {
  const dataItem = params.data
  if (dataItem && dataItem.childGroupId) {
    const childGroupId = dataItem.childGroupId
    goForward(childGroupId)
  }
}

// 处理输入框回车事件
const handleKeyup = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    getSaleAmountBarChart()
  }
}

// 初始化
onMounted(() => {
  getSaleAmountBarChart()

  // 为返回按钮添加点击事件
  nextTick(() => {
    // 在图表组件初始化完成后，绑定返回按钮点击事件
    const graphicElements = document.querySelectorAll('.echarts-graphic-text')
    graphicElements.forEach((element) => {
      element.addEventListener('click', goBack)
    })
  })
})
</script>

<template>
  <ElCard shadow="never" class="chart-card">
    <template #header>
      <div class="card-header">
        <div v-if="currentLevel > 0" class="back-button" @click="goBack">
          <Icon icon="ep:back" class="mr-1" />
          返回上一级
        </div>
        <div v-else class="placeholder"></div>
        <div class="right-button">
          <span>查询参数(可为空)：</span>
          <ElInput
            v-model="queryForm.year"
            placeholder="年份"
            @keyup.enter="handleKeyup"
            style="width: 80px"
          />
          <ElInput
            v-model="queryForm.month"
            placeholder="月份"
            @keyup.enter="handleKeyup"
            style="width: 80px"
          />
        </div>
      </div>
    </template>

    <ElSkeleton :loading="loading" animated>
      <template #default>
        <div class="chart-container">
          <Echart
            ref="chartRef"
            :options="barOptionsData"
            :height="400"
            @click="handleChartClick"
          />
        </div>
      </template>
    </ElSkeleton>
  </ElCard>
</template>

<style lang="less" scoped>
.chart-card {
  width: 100%;
  height: 100%;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .back-button {
      display: flex;
      font-size: 14px;
      color: #409eff;
      cursor: pointer;
      align-items: center;

      &:hover {
        text-decoration: underline;
      }
    }

    .right-button {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }

  .chart-container {
    width: 100%;
    height: 400px;
  }
}
</style>
