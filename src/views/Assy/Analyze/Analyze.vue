<script setup lang="tsx">
import PanelGroup from '@/views/Assy/Analyze/components/PanelGroup.vue'
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
import { Echart } from '@/components/Echart'
import { ref, onMounted, reactive } from 'vue'
import { EChartsOption } from 'echarts'
import {
  generateLineOptions,
  generateGaugeOptions,
  dateRangeOptions,
  packageTypeOptions,
  generateYearTrendOptions,
  generateAssyYieldOptions
} from './assy-echarts-data'
import { getAssyAnalyzeLoadingApi, getAssyAnalyzeTotalApi, getAssyYearTrendApi } from '@/api/assy'
import type { AssyAnalyzeLoadingResponse, AssyYearTrendResponse } from '@/api/assy/type'

const loading = ref(true)
const selectedPackageType = ref('SOP8_12R')
const selectedDateRange = ref('0')

const assyAnalyzeLoadingData = ref<AssyAnalyzeLoadingResponse[]>([])
const assyAnalyzeYearTrendData = ref<AssyYearTrendResponse[]>([])
const thisMonthReceipt = ref(0)
const exceed_rate = ref(0)

const lineOptionsData = reactive<EChartsOption>({}) as EChartsOption
const receiptGaugeOptionsData = reactive<EChartsOption>({}) as EChartsOption
const yearTrendData = reactive<EChartsOption>({}) as EChartsOption
const exceedGaugeOptionsData = reactive<EChartsOption>({}) as EChartsOption

// 获取本月装片量
const getThisMonthReceipt = async () => {
  try {
    const res = await getAssyAnalyzeTotalApi()
    thisMonthReceipt.value = res.data.this_month_receipt
    exceed_rate.value = res.data.exceed
    return res.data
  } catch (error) {
    console.error('获取本月装片量失败:', error)
    return null
  }
}

// 获取装片量趋势数据
const getAssyAnalyzeLoadingData = async () => {
  try {
    const res = await getAssyAnalyzeLoadingApi({
      range_type: selectedDateRange.value
    })
    if (Array.isArray(res.data)) {
      assyAnalyzeLoadingData.value = res.data
      return res.data
    }
    return null
  } catch (error) {
    console.error('获取图表数据失败:', error)
    return null
  }
}

// 获取封装形式年度趋势数据
const getAssyAnalyzeYearTrendData = async () => {
  try {
    const res = await getAssyYearTrendApi()
    if (Array.isArray(res.data)) {
      assyAnalyzeYearTrendData.value = res.data
      return res.data
    }
    return null
  } catch (error) {
    console.error('获取封装形式年度趋势数据失败:', error)
    return null
  }
}

// 更新所有图表
const updateAllCharts = () => {
  // 更新仪表盘
  Object.assign(receiptGaugeOptionsData, generateGaugeOptions(thisMonthReceipt.value))
  // 更新折线图
  Object.assign(
    lineOptionsData,
    generateLineOptions(assyAnalyzeLoadingData.value, selectedPackageType.value)
  )
  // 更新年度趋势图
  Object.assign(yearTrendData, generateYearTrendOptions(assyAnalyzeYearTrendData.value))
  // 更新超期率图
  Object.assign(exceedGaugeOptionsData, generateAssyYieldOptions(exceed_rate.value))
}

// 加载所有数据
const loadAllData = async () => {
  loading.value = true
  try {
    const [monthData, chartData, yearTrendData] = await Promise.all([
      getThisMonthReceipt(),
      getAssyAnalyzeLoadingData(),
      getAssyAnalyzeYearTrendData()
    ])
    if (monthData && chartData && yearTrendData) {
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
  <PanelGroup />
  <ElRow :gutter="20" justify="space-between">
    <ElCol :xl="6" :lg="12" :md="12" :sm="24" :xs="24">
      <ElCard shadow="hover" class="mb-20px">
        <Echart :options="receiptGaugeOptionsData" :height="300" />
      </ElCard>
    </ElCol>
    <ElCol :xl="12" :lg="12" :md="12" :sm="24" :xs="24">
      <ElCard shadow="hover" class="mb-20px">
        <Echart :options="yearTrendData" :height="300" />
      </ElCard>
    </ElCol>
    <ElCol :xl="6" :lg="12" :md="12" :sm="24" :xs="24">
      <ElCard shadow="hover" class="mb-20px">
        <Echart :options="exceedGaugeOptionsData" :height="300" />
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
          <Echart :options="lineOptionsData" :height="300" />
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
