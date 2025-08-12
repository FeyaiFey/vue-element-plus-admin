<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import {
  ElRow,
  ElCol,
  ElCard,
  ElSkeleton,
  ElSelect,
  ElButton,
  ElButtonGroup,
  ElOption
} from 'element-plus'
import PanelGroup from './components/PanelGroup.vue'
import { Echart } from '@/components/Echart'
import { EChartsOption } from 'echarts'
import {
  generateLineOptions,
  generateGaugeOptions,
  dateRangeOptions,
  packageTypeOptions,
  generateYearTrendOptions,
  generateAssySupplyAnalyzeOptions
} from './components/chipPackagingAnalysisOptions'
import {
  getChipPackagingAnalysisPannelApi,
  getChipPackagingHemiLoadingApi,
  getChipPackagingYearTrendApi,
  getChipPackagingSupplyAnalysisApi
} from '@/api/chipPackaging'
import {
  ChipPackagingAnalysisPannel,
  hisemiLoading,
  chipPackagingYearTrend,
  chipPackagingSupplyAnalysis
} from '@/api/chipPackaging/types'

// 定义组件名称（用于keep-alive缓存）
defineOptions({
  name: 'ChipPackagingAnalysis'
})

const loading = ref(true)
const selectedPackageType = ref('SOP8_12R')
const selectedDateRange = ref('0')

const hisemiLoadingData = ref<hisemiLoading[]>([])
const yearTrendData = ref<chipPackagingYearTrend[]>([])
const supplyAnalyzeData = ref<chipPackagingSupplyAnalysis[]>([])
const thisMonthReceiptCompleteRate = ref(0)
const thisMonthReceiptTarget = ref(0)

const hisemiLoadingOptionsData = reactive<EChartsOption>({}) as EChartsOption
const receiptGaugeOptionsData = reactive<EChartsOption>({}) as EChartsOption
const yearTrendOptionsData = reactive<EChartsOption>({}) as EChartsOption
const supplyAnalyzeOptionsData = reactive<EChartsOption>({}) as EChartsOption

// 封装分析看板数据定义
const panelData = ref<ChipPackagingAnalysisPannel>({} as ChipPackagingAnalysisPannel)

const getPanelData = async () => {
  try {
    const res = await getChipPackagingAnalysisPannelApi()
    panelData.value = res.data.list[0]
  } catch (error) {
    console.error('获取封装分析看板数据失败:', error)
  }
}

// 获取本月装片量
const getThisMonthReceipt = async () => {
  try {
    const res = await getChipPackagingAnalysisPannelApi()
    thisMonthReceiptCompleteRate.value = res.data.list[0].thisMonthChipPackagingReceiptCompleteRate
    thisMonthReceiptTarget.value = res.data.list[0].thisMonthChipPackagingReceiptTarget
    return res.data.list[0]
  } catch (error) {
    console.error('获取本月装片量失败:', error)
    return null
  }
}

// 获取装片量趋势数据
const getHemiLoadingData = async () => {
  try {
    const res = await getChipPackagingHemiLoadingApi({
      rangeType: selectedDateRange.value
    })
    if (res.data.list) {
      hisemiLoadingData.value = res.data.list
      return res.data.list
    }
    return null
  } catch (error) {
    console.error('获取图表数据失败:', error)
    return null
  }
}

// 获取封装形式年度趋势数据
const getYearTrendData = async () => {
  try {
    const res = await getChipPackagingYearTrendApi()
    if (res.data.list) {
      yearTrendData.value = res.data.list
      return res.data.list
    }
    return null
  } catch (error) {
    console.error('获取封装形式年度趋势数据失败:', error)
    return null
  }
}

// 获取供应商分析数据
const getSupplyAnalyzeData = async () => {
  try {
    const res = await getChipPackagingSupplyAnalysisApi()
    if (res.data.list) {
      supplyAnalyzeData.value = res.data.list
      return res.data.list
    }
    return null
  } catch (error) {
    console.error('获取供应商分析数据失败:', error)
    return null
  }
}

// 更新所有图表
const updateAllCharts = () => {
  // 更新仪表盘
  Object.assign(
    receiptGaugeOptionsData,
    generateGaugeOptions(
      thisMonthReceiptCompleteRate.value,
      panelData.value.thisMonthChipPackagingReceipt,
      thisMonthReceiptTarget.value
    )
  )
  // 更新折线图
  Object.assign(
    hisemiLoadingOptionsData,
    generateLineOptions(hisemiLoadingData.value, selectedPackageType.value)
  )
  // 更新年度趋势图
  Object.assign(yearTrendOptionsData, generateYearTrendOptions(yearTrendData.value))
  // 更新供应商分析图
  Object.assign(supplyAnalyzeOptionsData, generateAssySupplyAnalyzeOptions(supplyAnalyzeData.value))
}

// 加载所有数据
const loadAllData = async () => {
  loading.value = true
  try {
    await getPanelData()
    const [monthData, chartData, yearTrendData, supplyAnalyzeData] = await Promise.all([
      getThisMonthReceipt(),
      getHemiLoadingData(),
      getYearTrendData(),
      getSupplyAnalyzeData()
    ])
    if (monthData && chartData && yearTrendData && supplyAnalyzeData) {
      updateAllCharts()
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 处理时间范围变化
const handleDateRangeChange = (value: string) => {
  selectedDateRange.value = value
  loadAllData()
}

// 处理封装形式变化
const handlePackageTypeChange = (value: string) => {
  selectedPackageType.value = value
  updateAllCharts()
}

onMounted(() => {
  loadAllData()
})
</script>

<template>
  <PanelGroup :panelData="panelData" :loading="loading" />
  <ElRow :gutter="20" justify="space-between">
    <ElCol :xl="6" :lg="6" :md="24" :sm="24" :xs="24">
      <ElCard shadow="hover" class="mb-20px">
        <Echart :options="receiptGaugeOptionsData" :height="300" />
      </ElCard>
    </ElCol>
    <ElCol :xl="12" :lg="12" :md="24" :sm="24" :xs="24">
      <ElCard shadow="hover" class="mb-20px">
        <Echart :options="yearTrendOptionsData" :height="300" />
      </ElCard>
    </ElCol>
    <ElCol :xl="6" :lg="6" :md="24" :sm="24" :xs="24">
      <ElCard shadow="hover" class="mb-20px">
        <Echart :options="receiptGaugeOptionsData" :height="300" />
      </ElCard>
    </ElCol>
    <ElCol :xl="24" :lg="24" :md="24" :sm="24" :xs="24">
      <ElCard shadow="hover" class="mb-20px">
        <Echart :options="supplyAnalyzeOptionsData" :height="500" />
      </ElCard>
    </ElCol>
    <ElCol :xl="24" :lg="24" :md="24" :sm="24" :xs="24">
      <ElSkeleton :loading="loading" animated>
        <ElCard shadow="hover" class="mb-20px">
          <template #header>
            <div class="flex justify-between items-center">
              <ElSelect
                v-model="selectedPackageType"
                @change="handlePackageTypeChange"
                style="width: 200px"
                placeholder="请选择封装形式"
              >
                <ElOption
                  v-for="option in packageTypeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </ElSelect>
              <span class="text-16px font-bold">池州华宇日装片量折线图</span>
              <ElButtonGroup>
                <ElButton
                  v-for="option in dateRangeOptions"
                  :key="option.value"
                  :type="selectedDateRange === option.value ? 'primary' : 'default'"
                  @click="handleDateRangeChange(option.value)"
                >
                  {{ option.label }}
                </ElButton>
              </ElButtonGroup>
            </div>
          </template>
          <Echart :options="hisemiLoadingOptionsData" :height="300" />
        </ElCard>
      </ElSkeleton>
    </ElCol>
  </ElRow>
</template>

<style lang="less" scoped>
.el-button-group {
  .el-button {
    padding: 8px 12px;
  }
}
</style>
