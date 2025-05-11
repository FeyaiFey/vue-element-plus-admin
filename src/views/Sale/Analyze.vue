<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  ElCard,
  ElRow,
  ElCol,
  ElSkeleton,
  ElSelect,
  ElOption,
  ElButton,
  ElButtonGroup
} from 'element-plus'
import PanelGroup from './conponments/PanelGroup.vue'
import { Echart } from '@/components/Echart'
import { getSaleAmountAnalyzeApi, getSaleAnalysisPannelApi } from '@/api/sale'
import { EChartsOption } from 'echarts'
import {
  generateSaleAmountGaugeOptions,
  generateSaleQtyGaugeOptions,
  generateSaleTrendOptions,
  generateSaleProportionOptions,
  generateMonthlySaleOptions,
  chipTypeOptions,
  dateRangeOptions
} from './analyzeData'

// 加载状态
const loading = ref(true)

// 选项状态
const selectedChipType = ref('模拟芯片')
const selectedDateRange = ref('0')

// 数据状态
const saleTrendData = ref<any[]>([])
const saleProportionData = ref<any[]>([])
const monthlySaleData = ref<any[]>([])
const amountRate = ref(0) // 销售额完成率
const qtyRate = ref(0) // 销售量完成率

// 图表选项数据
const saleTrendOptionsData = reactive<EChartsOption>({}) as EChartsOption
const saleProportionOptionsData = reactive<EChartsOption>({}) as EChartsOption
const monthlySaleOptionsData = reactive<EChartsOption>({}) as EChartsOption
const amountGaugeOptionsData = reactive<EChartsOption>({}) as EChartsOption
const qtyGaugeOptionsData = reactive<EChartsOption>({}) as EChartsOption

// 获取销售完成率数据
const getSaleCompletionRate = async () => {
  try {
    const res = await getSaleAnalysisPannelApi()
    // 使用类型断言来访问不在类型定义中的属性，或者使用其他字段计算完成率
    // 假设我们用实际销量与目标销量的比例来计算完成率
    const data = res.data as any

    // 假设这是从API返回的数据，或者我们自己计算
    // 这里使用模拟数据，实际项目中应该根据真实数据计算
    amountRate.value = 85.5 // 销售额完成率，模拟数据
    qtyRate.value = 92.8 // 销售量完成率，模拟数据

    return data
  } catch (error) {
    console.error('获取销售完成率数据失败:', error)
    return null
  }
}

// 获取销售趋势数据
const getSaleTrendData = async () => {
  try {
    // 这里使用现有API模拟，实际项目中应该创建专门的API
    const res = await getSaleAmountAnalyzeApi({
      group_by_year: true,
      group_by_month: true,
      group_by_shortcut: false,
      group_by_admin_unit_name: false,
      group_by_employee_name: false,
      group_by_item_name: false
      // 移除不在类型定义中的属性
      // range_type: selectedDateRange.value
    })

    // 转换数据结构以适合图表使用
    if (Array.isArray(res.data.list)) {
      // 这里需要根据实际API返回的数据结构进行调整
      saleTrendData.value = res.data.list.map((item: any) => ({
        date: `${item.YEAR}-${item.MONTH}`,
        模拟芯片: item.模拟芯片_AMOUNT || 0,
        数字芯片: item.数字芯片_AMOUNT || 0,
        存储芯片: item.存储芯片_AMOUNT || 0,
        功率芯片: item.功率芯片_AMOUNT || 0,
        处理器: item.处理器_AMOUNT || 0
      }))
      return saleTrendData.value
    }
    return []
  } catch (error) {
    console.error('获取销售趋势数据失败:', error)
    return []
  }
}

// 生成销售占比数据（模拟数据）
const generateProportionData = () => {
  // 实际项目中应该从API获取数据
  saleProportionData.value = [
    { name: '模拟芯片', value: 4320 },
    { name: '数字芯片', value: 3650 },
    { name: '存储芯片', value: 2820 },
    { name: '功率芯片', value: 1950 },
    { name: '处理器', value: 1200 }
  ]
  return saleProportionData.value
}

// 生成月度销售数据（模拟数据）
const generateMonthlySaleData = () => {
  // 实际项目中应该从API获取数据
  monthlySaleData.value = [
    { month: '1月', amount: 23500, qty: 1234 },
    { month: '2月', amount: 28900, qty: 1576 },
    { month: '3月', amount: 35200, qty: 1890 },
    { month: '4月', amount: 42500, qty: 2345 },
    { month: '5月', amount: 38700, qty: 1987 },
    { month: '6月', amount: 45800, qty: 2456 }
  ]
  return monthlySaleData.value
}

// 更新所有图表
const updateAllCharts = () => {
  // 更新销售额完成率仪表盘
  Object.assign(amountGaugeOptionsData, generateSaleAmountGaugeOptions(amountRate.value))

  // 更新销售量完成率仪表盘
  Object.assign(qtyGaugeOptionsData, generateSaleQtyGaugeOptions(qtyRate.value))

  // 更新销售趋势图
  Object.assign(
    saleTrendOptionsData,
    generateSaleTrendOptions(saleTrendData.value, selectedChipType.value)
  )

  // 更新销售占比图
  Object.assign(saleProportionOptionsData, generateSaleProportionOptions(saleProportionData.value))

  // 更新月度销售图
  Object.assign(monthlySaleOptionsData, generateMonthlySaleOptions(monthlySaleData.value))
}

// 加载所有数据
const loadAllData = async () => {
  loading.value = true
  try {
    await Promise.all([getSaleCompletionRate(), getSaleTrendData()])

    // 生成模拟数据（实际项目中应该从API获取）
    generateProportionData()
    generateMonthlySaleData()

    updateAllCharts()
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

// 处理芯片类型变化
const handleChipTypeChange = (value: string) => {
  selectedChipType.value = value
  updateAllCharts()
}

onMounted(() => {
  loadAllData()
})
</script>

<template>
  <PanelGroup />
  <ElRow :gutter="20" justify="space-between">
    <!-- 销售额完成率仪表盘 -->
    <ElCol :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
      <ElCard shadow="hover" class="mb-20px">
        <ElSkeleton :loading="loading" animated>
          <template #default>
            <Echart :options="amountGaugeOptionsData" :height="300" />
          </template>
        </ElSkeleton>
      </ElCard>
    </ElCol>

    <!-- 芯片销量占比饼图 -->
    <ElCol :xl="12" :lg="12" :md="24" :sm="24" :xs="24">
      <ElCard shadow="hover" class="mb-20px">
        <ElSkeleton :loading="loading" animated>
          <template #default>
            <Echart :options="saleProportionOptionsData" :height="300" />
          </template>
        </ElSkeleton>
      </ElCard>
    </ElCol>

    <!-- 销售量完成率仪表盘 -->
    <ElCol :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
      <ElCard shadow="hover" class="mb-20px">
        <ElSkeleton :loading="loading" animated>
          <template #default>
            <Echart :options="qtyGaugeOptionsData" :height="300" />
          </template>
        </ElSkeleton>
      </ElCard>
    </ElCol>

    <!-- 月度销售柱状图 -->
    <ElCol :xl="24" :lg="24" :md="24" :sm="24" :xs="24">
      <ElCard shadow="hover" class="mb-20px">
        <ElSkeleton :loading="loading" animated>
          <template #default>
            <Echart :options="monthlySaleOptionsData" :height="300" />
          </template>
        </ElSkeleton>
      </ElCard>
    </ElCol>

    <!-- 销售趋势折线图 -->
    <ElCol :xl="24" :lg="24" :md="24" :sm="24" :xs="24">
      <ElSkeleton :loading="loading" animated>
        <ElCard shadow="hover" class="mb-20px">
          <template #header>
            <div class="flex justify-between items-center">
              <ElSelect
                v-model="selectedChipType"
                @change="handleChipTypeChange"
                style="width: 200px"
                placeholder="请选择芯片类型"
              >
                <ElOption
                  v-for="option in chipTypeOptions"
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
          <Echart :options="saleTrendOptionsData" :height="300" />
        </ElCard>
      </ElSkeleton>
    </ElCol>
  </ElRow>
</template>

<style lang="less" scoped>
.mb-20px {
  margin-bottom: 20px;
}

.el-button-group {
  .el-button {
    padding: 8px 12px;
  }
}
</style>
