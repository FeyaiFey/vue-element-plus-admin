<script setup lang="ts">
import { ElCard, ElSkeleton, ElInput } from 'element-plus'
import { Echart } from '@/components/Echart'
import { Icon } from '@/components/Icon'
import { ref, onMounted, nextTick } from 'vue'
import { getSaleAnalysisBarChartDrillApi } from '@/api/sale'
import {
  generateBarChartOption,
  generateAllDrillDownOptions,
  DrillDownData
} from './CompleteRateBarChart'
import type {
  SaleAnalysisBarChartDrillResponse,
  SaleAnalysisBarChartDrillData
} from '@/api/sale/types'

const loading = ref(true)
const chartRef = ref()
const currentLevel = ref(0)

const queryForm = ref({
  year: String(new Date().getFullYear()),
  month: String(new Date().getMonth() + 1)
})

// 初始化图表选项
const barOptionsData = ref<any>(generateBarChartOption({} as SaleAnalysisBarChartDrillResponse))

// 所有层级的数据和选项
const allLevelData = ref<DrillDownData[]>([])
const allOptions = ref<Record<string, any>>({})

// 选项栈，用于记录下钻历史
const optionStack = ref<string[]>([])

// 当前层级索引，用于跟踪下钻位置
const currentLevelIndex = ref(0)

// 获取柱状图数据
const getSaleAmountBarChart = async () => {
  loading.value = true
  try {
    const res = await getSaleAnalysisBarChartDrillApi({
      year: Number(queryForm.value.year),
      month: Number(queryForm.value.month)
    })
    if (res && res.data) {
      // console.log('API返回的原始数据:', res.data)

      // 处理数据，转换为多层下钻格式
      const { processedData, metadata } = processDrillDownData(res.data)
      allLevelData.value = processedData

      // 生成所有层级的选项
      allOptions.value = generateAllDrillDownOptions(allLevelData.value, metadata)
      // console.log('生成的图表选项:', allOptions.value)

      // 设置初始选项
      if (allLevelData.value.length > 0) {
        const firstLevelId = allLevelData.value[0].groupId
        barOptionsData.value = allOptions.value[firstLevelId]
        // console.log('设置的初始图表选项:', barOptionsData.value)
      }
    }
  } catch (error) {
    // console.error('获取销售完成率柱状图数据失败', error)
  } finally {
    loading.value = false
  }
}

// 处理下钻数据
const processDrillDownData = (data: any) => {
  // console.log('处理原始数据:', data)

  // 根据后端返回的数据结构进行处理
  // 后端返回的数据结构是: { data: [...], metadata: [...] }
  const actualData = data.data || []
  const metadata = data.metadata || []

  // console.log('提取的数据:', actualData)
  // console.log('提取的元数据:', metadata)
  // console.log('数据长度:', actualData.length)

  const processedData: DrillDownData[] = []

  if (actualData && actualData.length > 0) {
    actualData.forEach((levelData: SaleAnalysisBarChartDrillData[], index: number) => {
      // 根据metadata确定层级ID
      const levelMetadata = metadata[index]
      const levelId = levelMetadata?.groupId || `level_${index}`

      // console.log(`处理第${index}层数据:`, levelData)
      // console.log(`层级ID: ${levelId}`)

      const drillDownData: DrillDownData = {
        groupId: levelId,
        data: levelData.map((item: SaleAnalysisBarChartDrillData) => {
          // console.log(`处理数据项: ${item.name}, childrenGroupId: ${item.childrenGroupId}`)
          return {
            name: item.name,
            // 根据层级选择显示的数据：完成率、销售金额或销售量
            value: item.saleAmountValue || 0,
            quantity: item.saleQtyValue,
            completeRateValue: item.completeRateValue,
            groupId: item.groupId,
            childGroupId: item.childrenGroupId
          }
        })
      }

      processedData.push(drillDownData)
    })
  } else {
    // 如果没有数据，提供一个默认的空数据层级
    processedData.push({
      groupId: 'empty',
      data: []
    })
  }

  // console.log('处理后的层级数据:', processedData)
  return { processedData, metadata }
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
    currentLevelIndex.value--
  }
}

// 图表点击事件处理
const handleChartClick = (params: any) => {
  // console.log('图表点击事件:', params)

  // 检查是否是有效的点击事件
  if (!params || !params.data) {
    console.log('无效的点击事件')
    return
  }

  const dataItem = params.data
  // console.log('点击的数据项:', dataItem)

  // 从originalData中获取下钻信息
  const originalData = dataItem.originalData
  if (originalData && originalData.childGroupId) {
    // console.log('原始数据:', originalData)
    // console.log('子层级ID:', originalData.childGroupId)

    // console.log('当前层级索引:', currentLevelIndex.value)

    // 检查是否有下一层级
    if (currentLevelIndex.value < 3) {
      // 最多4层（0,1,2,3）
      // 获取下一层级的数据
      const nextLevelData = allLevelData.value[currentLevelIndex.value + 1]

      // 根据childrenGroupId过滤下一层级的数据
      // 过滤逻辑：下一层级数据的groupId应该以当前项的childrenGroupId开头
      const filteredData = nextLevelData.data.filter((item) =>
        item.groupId.startsWith(originalData.childGroupId + '_')
      )

      // console.log('过滤后的下一层级数据:', filteredData)

      if (filteredData.length > 0) {
        // 创建新的层级数据，只包含过滤后的数据
        const newLevelData: DrillDownData = {
          groupId: `${nextLevelData.groupId}_${originalData.childGroupId}`,
          data: filteredData
        }

        // 将新的层级数据添加到allLevelData中，以便后续下钻
        allLevelData.value.push(newLevelData)

        // 生成新的图表选项
        const newOptions = generateAllDrillDownOptions([newLevelData], [])
        const newOption = newOptions[newLevelData.groupId]

        // 将新选项保存到allOptions中
        allOptions.value[newLevelData.groupId] = newOption

        // 保存当前选项ID
        const currentId = barOptionsData.value.id as string
        if (currentId) {
          optionStack.value.push(currentId)
        }

        // 设置新的图表选项
        barOptionsData.value = newOption
        currentLevel.value++
        currentLevelIndex.value++
      } else {
        console.log('没有找到对应的下一层级数据')
      }
    } else {
      console.log('已经是最后一层或找不到下一层级')
    }
  } else {
    console.log('数据项没有子层级或childGroupId为空')
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
            size="small"
            @keyup.enter="handleKeyup"
            style="width: 80px"
          />
          <ElInput
            v-model="queryForm.month"
            placeholder="月份"
            size="small"
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
            :height="650"
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
