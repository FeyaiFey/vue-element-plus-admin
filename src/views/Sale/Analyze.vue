<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  ElCard,
  ElRow,
  ElCol,
  ElSkeleton,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElButton,
  ElCheckbox,
  ElDivider,
  ElMessage,
  ElButtonGroup
} from 'element-plus'
import PanelGroup from './conponments/PanelGroup.vue'
import SaleAmountAnalyzeTable from './conponments/SaleAmountAnalyzeTable.vue'
import { Echart } from '@/components/Echart'
import { getSaleAmountAnalyzeApi, getSaleAnalysisPannelApi } from '@/api/sale'
import type { SaleAmountAnalyze, SaleAmountAnalyzeQuery } from '@/api/sale/type'
import { EChartsOption } from 'echarts'
import {
  generateSaleAmountGaugeOptions,
  generateSaleQtyGaugeOptions,
  generateSaleProportionOptions,
  generateSaleDataLineChart
} from './analyzeData'
import { Icon } from '@/components/Icon'

// 加载状态
const loading = ref(true)
const queryLoading = ref(false)

// 数据状态
const qty = ref(0) // 销售量
const qtyRate = ref(0) // 销售量完成率
const saleProportionData = ref<SaleAmountAnalyze[]>([]) // 销售占比数据
const amount = ref(0) // 销售额
const amountRate = ref(0) // 销售额完成率
const queryResultData = ref<SaleAmountAnalyze[]>([]) // 查询结果数据

// 图表选项数据
const qtyGaugeOptionsData = reactive<EChartsOption>({}) as EChartsOption
const saleProportionOptionsData = reactive<EChartsOption>({}) as EChartsOption
const amountGaugeOptionsData = reactive<EChartsOption>({}) as EChartsOption
const saleDataLineChartOptions = reactive<EChartsOption>({}) as EChartsOption

// 查询表单
const queryForm = reactive<SaleAmountAnalyzeQuery>({
  year: new Date().getFullYear(),
  month: undefined,
  shortcut: '',
  admin_unit_name: '',
  employee_name: '',
  item_name: '',
  group_by_year: true,
  group_by_month: true,
  group_by_shortcut: false,
  group_by_admin_unit_name: false,
  group_by_employee_name: false,
  group_by_item_name: false
})

// 获取销售完成率数据
const getSaleCompletionRate = async () => {
  try {
    const res = await getSaleAnalysisPannelApi()
    const data = res.data.list
    qty.value = data[0].this_month_sale_qty
    amount.value = data[0].this_month_sale_amount
    qtyRate.value = Number(((data[0].this_month_sale_qty / 20000000) * 100).toFixed(2))
    amountRate.value = Number(((data[0].this_month_sale_amount / 14450000) * 100).toFixed(2))
    return data
  } catch (error) {
    console.error('获取销售完成率数据失败:', error)
    return null
  }
}

// 生成销售占比数据
const getProportionData = async () => {
  try {
    const res = await getSaleAmountAnalyzeApi({
      year: Number(new Date().getFullYear()),
      month: Number(new Date().getMonth() + 1),
      group_by_year: true,
      group_by_month: true,
      group_by_shortcut: true,
      group_by_admin_unit_name: false,
      group_by_employee_name: false,
      group_by_item_name: false
    })
    saleProportionData.value = res.data.list
  } catch (error) {
    console.error('获取销售占比数据失败:', error)
    saleProportionData.value = []
  }
}

// 查询销售数据
const querySaleData = async () => {
  queryLoading.value = true
  try {
    // 确保至少选择了一个分组方式
    if (
      !queryForm.group_by_year &&
      !queryForm.group_by_month &&
      !queryForm.group_by_shortcut &&
      !queryForm.group_by_admin_unit_name &&
      !queryForm.group_by_employee_name &&
      !queryForm.group_by_item_name
    ) {
      ElMessage.warning('请至少选择一种分组方式')
      queryForm.group_by_year = true
      queryForm.group_by_month = true
    }

    console.log('查询参数:', queryForm)
    const res = await getSaleAmountAnalyzeApi(queryForm)
    queryResultData.value = res.data.list || []
    console.log('查询结果:', queryResultData.value)

    // 更新折线图
    Object.assign(saleDataLineChartOptions, generateSaleDataLineChart(queryResultData.value))
  } catch (error) {
    console.error('查询销售数据失败:', error)
    queryResultData.value = []
    ElMessage.error('查询销售数据失败')
  } finally {
    queryLoading.value = false
  }
}

// 重置表单
const resetQueryForm = () => {
  Object.assign(queryForm, {
    year: new Date().getFullYear(),
    month: undefined,
    shortcut: '',
    admin_unit_name: '',
    employee_name: '',
    item_name: '',
    group_by_year: true,
    group_by_month: true,
    group_by_shortcut: false,
    group_by_admin_unit_name: false,
    group_by_employee_name: false,
    group_by_item_name: false
  })
  querySaleData()
}

// 更新所有图表
const updateAllCharts = () => {
  // 更新销售额完成率仪表盘
  Object.assign(
    amountGaugeOptionsData,
    generateSaleAmountGaugeOptions(amount.value, amountRate.value)
  )

  // 更新销售量完成率仪表盘
  Object.assign(qtyGaugeOptionsData, generateSaleQtyGaugeOptions(qty.value, qtyRate.value))

  // 更新销售占比图
  Object.assign(saleProportionOptionsData, generateSaleProportionOptions(saleProportionData.value))
}

// 加载所有数据
const loadAllData = async () => {
  loading.value = true
  try {
    await Promise.all([getSaleCompletionRate(), getProportionData()])
    updateAllCharts()

    // 初始加载查询数据
    await querySaleData()
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 刷新图表
const refreshChart = () => {
  querySaleData()
}

// 更改图表类型
const changeChartType = (type: 'line' | 'bar' | 'stack') => {
  if (!saleDataLineChartOptions.series || queryResultData.value.length === 0) return

  const newOptions = { ...saleDataLineChartOptions }

  // 更新所有系列的类型
  if (Array.isArray(newOptions.series)) {
    newOptions.series.forEach((series: any) => {
      if (type === 'stack' && series.type !== 'bar') {
        series.type = 'bar'
        series.stack = '总量'
      } else {
        series.type = type === 'stack' ? 'bar' : type
        if (type !== 'stack') {
          delete series.stack
        }
      }
    })
  }

  // 更新X轴设置
  if (newOptions.xAxis) {
    ;(newOptions.xAxis as any).boundaryGap = type === 'bar' || type === 'stack'
  }

  Object.assign(saleDataLineChartOptions, newOptions)
}

onMounted(() => {
  loadAllData()
})
</script>

<template>
  <PanelGroup />

  <!-- 仪表盘和饼图 -->
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
  </ElRow>

  <!-- 查询表单 -->
  <ElCard shadow="hover" class="mb-5">
    <template #header>
      <div class="card-header">
        <span>销售数据查询</span>
      </div>
    </template>
    <ElForm :model="queryForm" label-width="100px" label-position="right" size="default">
      <ElRow :gutter="20">
        <ElCol :xl="8" :lg="8" :md="12" :sm="24" :xs="24">
          <ElFormItem label="年份">
            <ElInput v-model="queryForm.year" placeholder="请输入年份" clearable />
          </ElFormItem>
        </ElCol>
        <ElCol :xl="8" :lg="8" :md="12" :sm="24" :xs="24">
          <ElFormItem label="月份">
            <ElSelect
              v-model="queryForm.month"
              placeholder="请选择月份"
              clearable
              style="width: 100%"
            >
              <ElOption
                v-for="month in Array.from({ length: 12 }, (_, i) => i + 1)"
                :key="month"
                :label="`${month}月`"
                :value="month"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :xl="8" :lg="8" :md="12" :sm="24" :xs="24">
          <ElFormItem label="产品线">
            <ElInput v-model="queryForm.shortcut" placeholder="请输入产品线" clearable />
          </ElFormItem>
        </ElCol>
        <ElCol :xl="8" :lg="8" :md="12" :sm="24" :xs="24">
          <ElFormItem label="销售团队">
            <ElInput v-model="queryForm.admin_unit_name" placeholder="请输入销售团队" clearable />
          </ElFormItem>
        </ElCol>
        <ElCol :xl="8" :lg="8" :md="12" :sm="24" :xs="24">
          <ElFormItem label="业务员">
            <ElInput v-model="queryForm.employee_name" placeholder="请输入业务员" clearable />
          </ElFormItem>
        </ElCol>
        <ElCol :xl="8" :lg="8" :md="12" :sm="24" :xs="24">
          <ElFormItem label="芯片名称">
            <ElInput v-model="queryForm.item_name" placeholder="请输入芯片名称" clearable />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElDivider content-position="left">分组方式</ElDivider>

      <ElRow :gutter="20">
        <ElCol :span="24">
          <ElFormItem label="分组方式">
            <div class="checkbox-group">
              <ElCheckbox v-model="queryForm.group_by_year">按年份</ElCheckbox>
              <ElCheckbox v-model="queryForm.group_by_month">按月份</ElCheckbox>
              <ElCheckbox v-model="queryForm.group_by_shortcut">按产品线</ElCheckbox>
              <ElCheckbox v-model="queryForm.group_by_admin_unit_name">按销售团队</ElCheckbox>
              <ElCheckbox v-model="queryForm.group_by_employee_name">按业务员</ElCheckbox>
              <ElCheckbox v-model="queryForm.group_by_item_name">按芯片名称</ElCheckbox>
            </div>
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow>
        <ElCol :span="24" style="text-align: center">
          <ElButton
            type="primary"
            @click="querySaleData"
            :loading="queryLoading"
            style="width: 200px"
          >
            查询
          </ElButton>
          <ElButton @click="resetQueryForm" style="width: 200px">重置</ElButton>
        </ElCol>
      </ElRow>
    </ElForm>
  </ElCard>

  <!-- 查询结果展示 -->
  <ElRow :gutter="20">
    <!-- 销售数据折线图 -->
    <ElCol :xl="16" :lg="16" :md="24" :sm="24" :xs="24">
      <ElCard shadow="hover" class="mb-20 h-480px">
        <template #header>
          <div class="card-header">
            <span>销售数据分析图表</span>
            <div class="chart-actions">
              <ElButtonGroup>
                <ElButton size="small" @click="refreshChart" :loading="queryLoading">
                  <Icon icon="ep:refresh" />
                </ElButton>
                <ElButton size="small" @click="changeChartType('line')">
                  <Icon icon="ep:trend-charts" />
                </ElButton>
                <ElButton size="small" @click="changeChartType('bar')">
                  <Icon icon="ep:histogram" />
                </ElButton>
                <ElButton size="small" @click="changeChartType('stack')">
                  <Icon icon="ep:data-line" />
                </ElButton>
              </ElButtonGroup>
            </div>
          </div>
        </template>
        <div class="chart-container">
          <ElSkeleton :loading="queryLoading" animated>
            <template #default>
              <Echart :options="saleDataLineChartOptions" :height="400" />
              <div v-if="queryResultData.length === 0" class="no-data-tip">
                暂无数据，请调整查询条件
              </div>
            </template>
          </ElSkeleton>
        </div>
      </ElCard>
    </ElCol>

    <!-- 销售数据表格 -->
    <ElCol :xl="8" :lg="8" :md="24" :sm="24" :xs="24">
      <ElCard shadow="hover" class="w-full h-480px">
        <SaleAmountAnalyzeTable :data="queryResultData" :loading="queryLoading" />
      </ElCard>
    </ElCol>
  </ElRow>
</template>

<style lang="less" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .chart-actions,
  .table-actions {
    display: flex;
    gap: 8px;
  }
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

@media (width <= 768px) {
  .checkbox-group {
    flex-direction: column;
    gap: 8px;
  }
}

.chart-container {
  position: relative;
  min-height: 400px;
}

.no-data-tip {
  position: absolute;
  top: 50%;
  left: 50%;
  font-size: 16px;
  color: #909399;
  transform: translate(-50%, -50%);
}
</style>
