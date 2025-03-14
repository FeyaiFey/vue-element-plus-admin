<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ContentWrap } from '@/components/ContentWrap'
import { Echart } from '@/components/Echart'
import { Search } from '@/components/Search'
import { Table } from '@/components/Table'
import type { FormSchema } from '@/components/Form'
import type { StockSummary, StockSummaryQuery } from '@/api/stock/types'
import { getStockSummaryApi } from '@/api/stock'
import { ElMessage } from 'element-plus'
import { getFeatureGroupNameApi, getWarehouseNameApi } from '@/api/params'

// 查询表单配置
const formRef = ref()
const featureGroupOptions = ref<Array<{ label: string; value: string }>>([])
const featureGroupLoading = ref(false)
const warehouseOptions = ref<Array<{ label: string; value: string }>>([])
const warehouseLoading = ref(false)

// 远程搜索特征组
const handleFeatureGroupSearch = async (query: string) => {
  if (!query) {
    featureGroupOptions.value = []
    return
  }
  featureGroupLoading.value = true
  try {
    const res = await getFeatureGroupNameApi({ feature_group_name: query })
    featureGroupOptions.value = res.data.list.map((item) => ({
      label: item.label,
      value: item.value
    }))
  } catch (error) {
    console.error('获取特征组列表失败:', error)
  } finally {
    featureGroupLoading.value = false
  }
}

// 远程搜索仓库
const handleWarehouseSearch = async (query: string) => {
  if (!query) {
    warehouseOptions.value = []
    return
  }
  warehouseLoading.value = true
  try {
    const res = await getWarehouseNameApi({ warehouse_name: query })
    warehouseOptions.value = res.data.list.map((item) => ({
      label: item.label,
      value: item.value
    }))
  } catch (error) {
    console.error('获取仓库列表失败:', error)
  } finally {
    warehouseLoading.value = false
  }
}

// 查询表单配置
const schema = reactive<FormSchema[]>([
  {
    field: 'feature_group_name',
    label: '品号群组',
    component: 'Select',
    componentProps: {
      placeholder: '请输入品号群组搜索',
      clearable: true,
      filterable: true,
      remote: true,
      reserveKeyword: true,
      loading: featureGroupLoading,
      remoteMethod: handleFeatureGroupSearch,
      options: featureGroupOptions
    },
    colProps: {
      span: 8
    }
  },
  {
    field: 'item_name',
    label: '物料名称',
    component: 'Input',
    componentProps: {
      placeholder: '请输入物料名称',
      clearable: true,
      onKeyup: (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          formRef.value?.getFormData().then((formData) => {
            handleSearch(formData)
          })
        }
      }
    },
    colProps: {
      span: 8
    }
  },
  {
    field: 'warehouse_name',
    label: '仓库',
    component: 'Select',
    componentProps: {
      placeholder: '请输入仓库搜索',
      clearable: true,
      filterable: true,
      remote: true,
      reserveKeyword: true,
      loading: warehouseLoading,
      remoteMethod: handleWarehouseSearch,
      options: warehouseOptions
    },
    colProps: {
      span: 8
    }
  }
])

// 数据状态
const loading = ref(false)
const stockData = ref<StockSummary[]>([])
const currentView = ref<'feature' | 'warehouse'>('feature')
const selectedFeature = ref('')
const selectedWarehouse = ref('')

// 获取数据
const fetchData = async (params: StockSummaryQuery) => {
  loading.value = true
  try {
    const res = await getStockSummaryApi(params)
    stockData.value = res.data.list
  } catch (error) {
    console.error('获取库存汇总数据失败:', error)
    ElMessage.error('获取库存汇总数据失败')
  } finally {
    loading.value = false
  }
}

// 处理查询
const handleSearch = (params: StockSummaryQuery) => {
  fetchData(params)
}

// 添加类型定义
interface ChartDataItem {
  inventoryQty: number
  secondQty: number
  averageAge: number
  count: number
}

interface ChartData {
  [key: string]: ChartDataItem
}

// 修改图表配置
const chartOptions = computed(() => {
  const data = stockData.value

  // 按品号群组汇总数据
  const featureGroupData: ChartData = data.reduce((acc: ChartData, item) => {
    const key = item.FEATURE_GROUP_NAME
    if (!acc[key]) {
      acc[key] = {
        inventoryQty: 0,
        secondQty: 0,
        averageAge: 0,
        count: 0
      }
    }
    acc[key].inventoryQty += item.INVENTORY_QTY
    acc[key].secondQty += item.SECOND_QTY
    acc[key].averageAge += item.AVERAGE_STOCK_AGE
    acc[key].count++
    return acc
  }, {})

  // 按仓库汇总数据
  const warehouseData: ChartData = data.reduce((acc: ChartData, item) => {
    const key = item.WAREHOUSE_NAME
    if (!acc[key]) {
      acc[key] = {
        inventoryQty: 0,
        secondQty: 0,
        averageAge: 0,
        count: 0
      }
    }
    acc[key].inventoryQty += item.INVENTORY_QTY
    acc[key].secondQty += item.SECOND_QTY
    acc[key].averageAge += item.AVERAGE_STOCK_AGE
    acc[key].count++
    return acc
  }, {})

  const series: any[] = []
  const xAxisData: string[] = []

  if (currentView.value === 'feature') {
    Object.entries(featureGroupData).forEach(([key, value]) => {
      xAxisData.push(key)
      series.push({
        name: '库存数量',
        type: 'bar' as const,
        data: [value.inventoryQty],
        itemStyle: {
          color: '#409EFF'
        }
      })
      series.push({
        name: '平均库龄',
        type: 'line' as const,
        yAxisIndex: 1,
        data: [value.averageAge / value.count],
        itemStyle: {
          color: '#F56C6C'
        }
      })
    })
  } else {
    Object.entries(warehouseData).forEach(([key, value]) => {
      xAxisData.push(key)
      series.push({
        name: '库存数量',
        type: 'bar' as const,
        data: [value.inventoryQty],
        itemStyle: {
          color: '#409EFF'
        }
      })
      series.push({
        name: '平均库龄',
        type: 'line' as const,
        yAxisIndex: 1,
        data: [value.averageAge / value.count],
        itemStyle: {
          color: '#F56C6C'
        }
      })
    })
  }

  return {
    tooltip: {
      trigger: 'axis' as const,
      axisPointer: {
        type: 'shadow' as const
      }
    },
    legend: {
      data: ['库存数量', '平均库龄']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category' as const,
      data: xAxisData,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: [
      {
        type: 'value' as const,
        name: '库存数量',
        position: 'left' as const
      },
      {
        type: 'value' as const,
        name: '平均库龄(天)',
        position: 'right' as const
      }
    ],
    series
  }
})

// 表格列配置
const columns = [
  {
    label: '品号群组',
    field: 'FEATURE_GROUP_NAME',
    align: 'center' as const,
    width: 150
  },
  {
    label: '物料名称',
    field: 'ITEM_NAME',
    align: 'center' as const,
    width: 200,
    showOverflowTooltip: true
  },
  {
    label: '仓库',
    field: 'WAREHOUSE_NAME',
    align: 'center' as const,
    width: 150
  },
  {
    label: '库存数量',
    field: 'INVENTORY_QTY',
    align: 'center' as const,
    width: 120
  },
  {
    label: '第二数量',
    field: 'SECOND_QTY',
    align: 'center' as const,
    width: 120
  },
  {
    label: '平均库龄(天)',
    field: 'AVERAGE_STOCK_AGE',
    align: 'center' as const,
    width: 120
  }
]

// 图表点击事件处理
const handleChartClick = (params) => {
  if (currentView.value === 'feature') {
    selectedFeature.value = params.name
    // 更新数据显示
    stockData.value = stockData.value.filter((item) => item.FEATURE_GROUP_NAME === params.name)
  } else {
    selectedWarehouse.value = params.name
    // 更新数据显示
    stockData.value = stockData.value.filter((item) => item.WAREHOUSE_NAME === params.name)
  }
}

// 切换视图
const toggleView = () => {
  currentView.value = currentView.value === 'feature' ? 'warehouse' : 'feature'
  selectedFeature.value = ''
  selectedWarehouse.value = ''
  // 重新加载数据
  formRef.value?.getFormData().then((formData) => {
    handleSearch(formData)
  })
}

// 初始化
onMounted(() => {
  fetchData({})
})
</script>

<template>
  <ContentWrap>
    <div class="stock-analyze">
      <!-- 搜索表单 -->
      <Search
        ref="formRef"
        :schema="schema"
        @search="handleSearch"
        @reset="handleSearch"
        :is-col="true"
        :inline="false"
        label-width="100px"
      >
        <template #buttons>
          <el-button type="primary" @click="toggleView">
            切换视图 ({{ currentView === 'feature' ? '按仓库' : '按品号群组' }})
          </el-button>
        </template>
      </Search>

      <!-- 图表区域 -->
      <div class="chart-container">
        <Echart
          :options="chartOptions"
          :loading="loading"
          height="400px"
          @click="handleChartClick"
        />
      </div>

      <!-- 表格区域 -->
      <div class="table-container">
        <div class="table-header">
          <span class="title">详细数据</span>
          <div class="filters" v-if="selectedFeature || selectedWarehouse">
            <el-tag v-if="selectedFeature" closable @close="selectedFeature = ''">
              品号群组: {{ selectedFeature }}
            </el-tag>
            <el-tag v-if="selectedWarehouse" closable @close="selectedWarehouse = ''">
              仓库: {{ selectedWarehouse }}
            </el-tag>
          </div>
        </div>
        <Table
          v-loading="loading"
          :columns="columns"
          :data="stockData"
          height="calc(100vh - 750px)"
        />
      </div>
    </div>
  </ContentWrap>
</template>

<style lang="less" scoped>
.stock-analyze {
  .chart-container {
    padding: 20px;
    margin-top: 20px;
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
  }

  .table-container {
    padding: 20px;
    margin-top: 20px;
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);

    .table-header {
      display: flex;
      margin-bottom: 16px;
      justify-content: space-between;
      align-items: center;

      .title {
        font-size: 16px;
        font-weight: bold;
        color: var(--el-text-color-primary);
      }

      .filters {
        display: flex;
        gap: 8px;
      }
    }
  }
}
</style>
