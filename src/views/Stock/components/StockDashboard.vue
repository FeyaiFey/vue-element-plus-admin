<script setup lang="ts">
import { computed, defineProps, ref } from 'vue'
import type { EChartsOption } from 'echarts'
import type { StockSummary } from '@/api/stock/types'
import { ElRow, ElCol, ElSkeleton } from 'element-plus'
import { Echart } from '@/components/Echart'

const props = defineProps<{
  loading?: boolean
  data?: StockSummary[]
}>()

const emit = defineEmits<{
  (e: 'chartClick', data: { type: string; value: string }): void
}>()

// 添加全局筛选状态
const activeFilter = ref<{ type: string; value: string } | null>(null)

// 根据筛选条件过滤数据
const filteredData = computed(() => {
  if (!props.data) return []
  if (!activeFilter.value) return props.data

  const { type, value } = activeFilter.value
  return props.data.filter((item) => {
    switch (type) {
      case 'warehouse':
        return item.WAREHOUSE_NAME === value
      case 'feature_group':
        return item.FEATURE_GROUP_NAME === value
      case 'item':
        return item.ITEM_NAME === value
      default:
        return true
    }
  })
})

// 处理数据，获取前N个数据，其余归为"其他"
const processTopData = (data: Record<string, number>, topCount: number = 6) => {
  const sortedEntries = Object.entries(data)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({ name, value }))

  if (sortedEntries.length <= topCount) return sortedEntries

  const topItems = sortedEntries.slice(0, topCount)
  const otherValue = sortedEntries.slice(topCount).reduce((sum, item) => sum + item.value, 0)

  return [...topItems, { name: '其他', value: otherValue }]
}

// 库存分布饼图配置
const inventoryDistOption = computed<EChartsOption>(() => {
  if (!props.data?.length) return {}

  const warehouseData = props.data.reduce(
    (acc, curr) => {
      acc[curr.WAREHOUSE_NAME] = (acc[curr.WAREHOUSE_NAME] || 0) + curr.INVENTORY_QTY
      return acc
    },
    {} as Record<string, number>
  )

  const pieData = processTopData(warehouseData).map((item) => ({
    ...item,
    itemStyle: {
      opacity:
        activeFilter.value &&
        activeFilter.value.type === 'warehouse' &&
        activeFilter.value.value !== item.name
          ? 0.3
          : 1
    }
  }))

  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    series: [
      {
        name: '库存分布',
        type: 'pie',
        radius: ['30%', '60%'],
        center: ['50%', '50%'],
        data: pieData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          show: true,
          formatter: '{b}: {d}%'
        }
      }
    ]
  }
})

// 品号群组玫瑰图配置
const featureGroupRoseOption = computed<EChartsOption>(() => {
  if (!props.data?.length) return {}

  // 使用过滤后的数据计算群组数据
  const groupData = (filteredData.value || []).reduce(
    (acc, curr) => {
      acc[curr.FEATURE_GROUP_NAME] = (acc[curr.FEATURE_GROUP_NAME] || 0) + curr.INVENTORY_QTY
      return acc
    },
    {} as Record<string, number>
  )

  const roseData = processTopData(groupData).map((item) => ({
    ...item,
    itemStyle: {
      opacity:
        activeFilter.value &&
        activeFilter.value.type === 'feature_group' &&
        activeFilter.value.value !== item.name
          ? 0.3
          : 1
    }
  }))

  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    series: [
      {
        name: '品号群组分布',
        type: 'pie',
        roseType: 'radius',
        radius: ['20%', '60%'],
        center: ['50%', '50%'],
        data: roseData,
        label: {
          show: true,
          formatter: '{b}: {d}%'
        }
      }
    ]
  }
})

// 库存数量前十条形图配置
const topTenInventoryOption = computed<EChartsOption>(() => {
  if (!props.data?.length) return {}

  // 使用过滤后的数据计算物料数据
  const itemData = (filteredData.value || []).reduce(
    (acc, curr) => {
      if (!acc[curr.ITEM_NAME]) {
        acc[curr.ITEM_NAME] = {
          qty: curr.INVENTORY_QTY,
          feature: curr.FEATURE_GROUP_NAME
        }
      } else {
        acc[curr.ITEM_NAME].qty += curr.INVENTORY_QTY
      }
      return acc
    },
    {} as Record<string, { qty: number; feature: string }>
  )

  const sortedData = Object.entries(itemData)
    .sort(([, a], [, b]) => b.qty - a.qty)
    .slice(0, 10)
    .reverse()

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      show: false
    },
    grid: {
      left: '0.1%',
      bottom: '5%',
      top: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => `${(value / 1000000).toFixed(2)}M`
      }
    },
    yAxis: {
      type: 'category',
      data: sortedData.map(([name]) => name),
      axisLabel: {
        width: 120,
        overflow: 'truncate',
        interval: 0,
        rotate: 0
      }
    },
    series: [
      {
        name: '库存数量',
        type: 'bar',
        data: sortedData.map(([name, data]) => ({
          value: data.qty,
          itemStyle: {
            color: '#5470c6',
            opacity:
              activeFilter.value &&
              activeFilter.value.type === 'item' &&
              activeFilter.value.value !== name
                ? 0.3
                : 1
          }
        })),
        label: {
          show: true,
          position: 'right',
          formatter: (params: any) => `${(params.value / 1000000).toFixed(2)}M`
        }
      }
    ]
  }
})

// 气泡图配置
const bubbleOption = computed<EChartsOption>(() => {
  if (!props.data?.length) return {}

  // 使用过滤后的数据计算气泡图数据
  const bubbleData = (filteredData.value || []).reduce(
    (acc, curr) => {
      if (!acc[curr.ITEM_NAME]) {
        acc[curr.ITEM_NAME] = {
          qty: curr.INVENTORY_QTY,
          age: curr.AVERAGE_STOCK_AGE,
          feature: curr.FEATURE_GROUP_NAME
        }
      } else {
        const item = acc[curr.ITEM_NAME]
        item.qty += curr.INVENTORY_QTY
        item.age = (item.age + curr.AVERAGE_STOCK_AGE) / 2
      }
      return acc
    },
    {} as Record<string, { qty: number; age: number; feature: string }>
  )

  const featureGroups = Array.from(new Set(Object.values(bubbleData).map((info) => info.feature)))
  const colors = [
    '#5470c6',
    '#91cc75',
    '#fac858',
    '#ee6666',
    '#73c0de',
    '#3ba272',
    '#fc8452',
    '#9a60b4',
    '#ea7ccc'
  ]

  const groupedData = featureGroups.map((feature, index) => ({
    name: feature,
    type: 'scatter' as const,
    itemStyle: {
      color: colors[index % colors.length]
    },
    symbolSize: (data: number[]) => Math.sqrt(data[2]) * 8,
    data: Object.entries(bubbleData)
      .filter(([, info]) => info.feature === feature)
      .map(([name, info]) => ({
        name,
        value: [info.qty, info.age, info.qty / 1000000],
        feature: info.feature,
        itemStyle: {
          opacity:
            activeFilter.value &&
            activeFilter.value.type === 'item' &&
            activeFilter.value.value !== name
              ? 0.3
              : 1
        }
      }))
  }))

  return {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const { name, value, data } = params
        return `${name}<br/>
                库存数量: ${(value[0] / 1000000).toFixed(2)}M<br/>
                平均库龄: ${value[1].toFixed(2)}月<br/>
                品号群组: ${data.feature}`
      }
    },
    grid: {
      left: '3%',
      right: '2%',
      top: '8%',
      bottom: '8%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '库存数量(百万)',
      nameLocation: 'middle',
      nameGap: 30,
      axisLabel: {
        formatter: (value: number) => `${(value / 1000000).toFixed(2)}M`
      }
    },
    yAxis: {
      type: 'value',
      name: '平均库龄(月)',
      nameLocation: 'middle',
      nameGap: 30,
      axisLabel: {
        formatter: '{value}月'
      }
    },
    series: groupedData
  }
})

// 处理图表点击
const handleChartClick = (params: any) => {
  console.log('Chart clicked:', params) // 添加调试日志
  if (!params.data) return

  let type: string
  let value: string

  // 处理不同图表类型的点击事件
  if (params.seriesType === 'pie') {
    // 饼图和玫瑰图
    type = params.seriesName === '库存分布' ? 'warehouse' : 'feature_group'
    value = params.data.name
  } else if (params.seriesType === 'bar') {
    // 条形图
    type = 'item'
    value = params.name
  } else if (params.seriesType === 'scatter') {
    // 气泡图
    type = 'item'
    value = params.data.name
  } else {
    return
  }

  if (value === '其他') return

  // 处理点击切换
  if (activeFilter.value?.type === type && activeFilter.value?.value === value) {
    // 如果点击已选中的项，清除筛选
    activeFilter.value = null
    emit('chartClick', { type: '', value: '' })
  } else {
    // 如果点击新的项，更新筛选
    activeFilter.value = { type, value }
    emit('chartClick', { type, value })
  }
}
</script>

<template>
  <div class="stock-dashboard">
    <ElRow :gutter="20">
      <ElCol :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <div class="chart-block">
          <div class="chart-header">
            <span>仓库库存分布</span>
          </div>
          <div class="chart-container">
            <ElSkeleton v-if="loading" animated>
              <template #template>
                <div style="height: 50vh"></div>
              </template>
            </ElSkeleton>
            <Echart v-else :options="inventoryDistOption" height="50vh" @click="handleChartClick" />
          </div>
        </div>
      </ElCol>
      <ElCol :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="chart-col">
        <div class="chart-block">
          <div class="chart-header">
            <span>品号群组分布</span>
          </div>
          <div class="chart-container">
            <ElSkeleton v-if="loading" animated>
              <template #template>
                <div style="height: 50vh"></div>
              </template>
            </ElSkeleton>
            <Echart
              v-else
              :options="featureGroupRoseOption"
              height="50vh"
              @click="handleChartClick"
            />
          </div>
        </div>
      </ElCol>
    </ElRow>
    <ElRow :gutter="20">
      <ElCol :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="chart-col">
        <div class="chart-block">
          <div class="chart-header">
            <span>库存TOP10物料</span>
          </div>
          <div class="chart-container">
            <ElSkeleton v-if="loading" animated>
              <template #template>
                <div style="height: 50vh"></div>
              </template>
            </ElSkeleton>
            <Echart
              v-else
              :options="topTenInventoryOption"
              height="50vh"
              @click="handleChartClick"
            />
          </div>
        </div>
      </ElCol>
      <ElCol :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="chart-col">
        <div class="chart-block">
          <div class="chart-header">
            <span>库存-库龄分析</span>
          </div>
          <div class="chart-container">
            <ElSkeleton v-if="loading" animated>
              <template #template>
                <div style="height: 50vh"></div>
              </template>
            </ElSkeleton>
            <Echart v-else :options="bubbleOption" height="50vh" @click="handleChartClick" />
          </div>
        </div>
      </ElCol>
    </ElRow>
  </div>
</template>

<style lang="less" scoped>
.stock-dashboard {
  @media screen and (width <= 768px) {
    .chart-block {
      margin-bottom: 16px;
    }

    .chart-container {
      height: 60vh; // 在小屏幕上适当增加高度比例
    }
  }

  .chart-block {
    height: 100%;
    margin-bottom: 20px;
    overflow: hidden;
    background-color: var(--el-bg-color);
    border-radius: 8px;
    transition: all 0.3s;

    &:hover {
      box-shadow: var(--el-box-shadow-light);
    }

    .chart-header {
      padding: 16px;
      font-size: 16px;
      font-weight: bold;
      color: var(--el-text-color-primary);
      border-bottom: 1px solid var(--el-border-color-light);
    }
  }

  .chart-container {
    height: 50vh;
    padding: 16px;
  }

  .chart-col {
    margin-bottom: 20px;
  }
}
</style>
