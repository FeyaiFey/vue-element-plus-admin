<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
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
  ElButtonGroup,
  ElPopover
} from 'element-plus'
import PanelGroup from './components/PanelGroup.vue'
import SaleAmountAnalyzeTable from './target/SaleAmountAnalyzeTable.vue'
import SaleAmount from './amount/SaleAmount.vue'
import SaleAmountBarChart from './bar/SaleAmountBarChart.vue'
import { Echart } from '@/components/Echart'
import { getSaleAmountAnalyzeApi, getSaleAnalysisPannelApi, getSaleForecastApi } from '@/api/sale'
import { getSalesApi, getSaleUnitApi } from '@/api/params'
import type { SaleAmountAnalyze, SaleAmountAnalyzeQuery } from '@/api/sale/type'
import { EChartsOption } from 'echarts'
import {
  generateSaleAmountMonthGaugeOptions,
  generateSaleAmountYearGaugeOptions,
  generateSaleProportionOptions,
  generateSaleDataLineChart
} from './analyzeData'
import { Icon } from '@/components/Icon'

// 加载状态
const loading = ref(true)
const queryLoading = ref(false)
// popover可见性控制
const popoverVisible = ref(false)

// 数据状态
const amountYear = ref(0) // 年销售额
const amountMonth = ref(0) // 月销售额
const amountTargetYear = ref(0) // 年销售额目标
const amountTargetMonth = ref(0) // 月销售额目标
const amountRateYear = ref(0) // 年销售额完成率
const amountRateMonth = ref(0) // 月销售额完成率
const saleProportionData = ref<SaleAmountAnalyze[]>([]) // 销售占比数据
const queryResultData = ref<SaleAmountAnalyze[]>([]) // 查询结果数据

// 图表选项数据
const amountYearGaugeOptionsData = reactive<EChartsOption>({}) as EChartsOption
const amountMonthGaugeOptionsData = reactive<EChartsOption>({}) as EChartsOption
const saleProportionOptionsData = reactive<EChartsOption>({}) as EChartsOption
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

// 销售团队数据
const adminUnitList = ref<any[]>([])
// 业务员列表
const employeeList = ref<any[]>([])

// 获取行政部门列表
const getAdminUnitList = async () => {
  const res = await getSaleUnitApi()
  adminUnitList.value = res.data.list
}

// 获取业务员列表
const getEmployeeList = async () => {
  // 如果选择了行政部门，则传入行政部门ID
  const res = queryForm.admin_unit_name
    ? await getSalesApi(queryForm.admin_unit_name)
    : await getSalesApi()
  employeeList.value = res.data.list

  // 如果当前选择的业务员不在新的列表中，则清空选择
  if (
    queryForm.employee_name &&
    !employeeList.value.some((item) => item.id === queryForm.employee_name)
  ) {
    queryForm.employee_name = ''
  }
}

// 监听行政部门变化，更新业务员列表
watch(
  () => queryForm.admin_unit_name,
  async () => {
    // 当行政部门变化时，重新获取业务员列表
    await getEmployeeList()
  }
)

// 获取销售完成率数据
const getSaleCompletionRate = async () => {
  try {
    const res_pannel = await getSaleAnalysisPannelApi()
    const res_forecast = await getSaleForecastApi()
    const data = res_pannel.data.list
    amountYear.value = data[0].this_year_sale_amount
    amountMonth.value = data[0].this_month_sale_amount
    amountTargetYear.value = res_forecast.data.YearForecast
    amountTargetMonth.value = res_forecast.data.MonthForecast
    amountRateYear.value = Number(
      ((data[0].this_year_sale_amount / amountTargetYear.value) * 100).toFixed(2)
    )
    amountRateMonth.value = Number(
      ((data[0].this_month_sale_amount / amountTargetMonth.value) * 100).toFixed(2)
    )
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

    // 关闭popover
    popoverVisible.value = false
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
  // 更新本月销售额完成率仪表盘
  Object.assign(
    amountMonthGaugeOptionsData,
    generateSaleAmountMonthGaugeOptions(amountMonth.value, amountRateMonth.value)
  )

  // 更新今年销售额完成率仪表盘
  Object.assign(
    amountYearGaugeOptionsData,
    generateSaleAmountYearGaugeOptions(amountYear.value, amountRateYear.value)
  )

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
  getAdminUnitList()
  getEmployeeList()
})
</script>

<template>
  <PanelGroup />

  <!-- 仪表盘和饼图 -->
  <ElRow :gutter="20" justify="space-between">
    <!-- 销售额完成率仪表盘 -->
    <ElCol :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
      <ElCard shadow="hover" class="mb-20px h-420px">
        <template #header>
          <div class="card-header">
            <span>本月销售额目标（万元）：</span>
            <span>{{ amountTargetMonth / 10000 }}</span>
          </div>
        </template>
        <ElSkeleton :loading="loading" animated>
          <template #default>
            <Echart :options="amountMonthGaugeOptionsData" :height="300" />
          </template>
        </ElSkeleton>
      </ElCard>
    </ElCol>

    <!-- 芯片销量占比饼图 -->
    <ElCol :xl="12" :lg="12" :md="24" :sm="24" :xs="24">
      <ElCard shadow="hover" class="mb-20px h-420px">
        <ElSkeleton :loading="loading" animated>
          <template #default>
            <Echart :options="saleProportionOptionsData" :height="380" />
          </template>
        </ElSkeleton>
      </ElCard>
    </ElCol>

    <!-- 销售量完成率仪表盘 -->
    <ElCol :xl="6" :lg="6" :md="12" :sm="24" :xs="24">
      <ElCard shadow="hover" class="mb-20px h-420px">
        <template #header>
          <div class="card-header">
            <span>今年销售额目标（万元）：</span>
            <span>{{ amountTargetYear / 10000 }}</span>
          </div>
        </template>
        <ElSkeleton :loading="loading" animated>
          <template #default>
            <Echart :options="amountYearGaugeOptionsData" :height="300" />
          </template>
        </ElSkeleton>
      </ElCard>
    </ElCol>
  </ElRow>

  <!-- 销售数据柱状图 -->
  <ElCol :xl="24" :lg="24" :md="24" :sm="24" :xs="24" class="mb-20px">
    <SaleAmountBarChart />
  </ElCol>

  <!-- 销售额汇总 -->
  <ElCol :xl="24" :lg="8" :md="12" :sm="24" :xs="24">
    <ElCard shadow="hover" class="mb-5">
      <SaleAmount />
    </ElCard>
  </ElCol>

  <!-- 查询结果展示 -->
  <ElRow :gutter="20">
    <!-- 销售数据折线图 -->
    <ElCol :xl="16" :lg="16" :md="24" :sm="24" :xs="24">
      <ElCard shadow="hover" class="mb-5 h-600px">
        <template #header>
          <div class="card-header">
            <span>销售数据分析图表</span>
            <div class="chart-actions">
              <ElPopover
                v-model:visible="popoverVisible"
                placement="bottom-end"
                :width="600"
                trigger="click"
                popper-class="filter-popover"
              >
                <template #reference>
                  <ElButton type="primary" size="small" circle class="mr-2">
                    <Icon icon="vi-basil:filter-outline" />
                  </ElButton>
                </template>
                <!-- 查询表单 -->
                <div class="search-form">
                  <ElForm :model="queryForm" label-width="80px" label-position="right" size="small">
                    <ElRow :gutter="16">
                      <ElCol :span="12">
                        <ElFormItem label="年份">
                          <ElInput v-model="queryForm.year" placeholder="请输入年份" clearable />
                        </ElFormItem>
                      </ElCol>
                      <ElCol :span="12">
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
                    </ElRow>
                    <ElRow :gutter="16">
                      <ElCol :span="12">
                        <ElFormItem label="产品线">
                          <ElInput
                            v-model="queryForm.shortcut"
                            placeholder="请输入产品线"
                            clearable
                          />
                        </ElFormItem>
                      </ElCol>
                      <ElCol :span="12">
                        <ElFormItem label="销售团队">
                          <ElSelect
                            v-model="queryForm.admin_unit_name"
                            placeholder="请选择销售团队"
                            clearable
                            style="width: 100%"
                          >
                            <ElOption
                              v-for="item in adminUnitList"
                              :key="item.value"
                              :label="item.label"
                              :value="item.value"
                            />
                          </ElSelect>
                        </ElFormItem>
                      </ElCol>
                    </ElRow>
                    <ElRow :gutter="16">
                      <ElCol :span="12">
                        <ElFormItem label="业务员">
                          <ElSelect
                            v-model="queryForm.employee_name"
                            placeholder="请选择业务员"
                            style="width: 100%"
                            clearable
                          >
                            <ElOption
                              v-for="item in employeeList"
                              :key="item.value"
                              :label="item.label"
                              :value="item.value"
                            />
                          </ElSelect>
                        </ElFormItem>
                      </ElCol>
                      <ElCol :span="12">
                        <ElFormItem label="芯片名称">
                          <ElInput
                            v-model="queryForm.item_name"
                            placeholder="请输入芯片名称"
                            clearable
                          />
                        </ElFormItem>
                      </ElCol>
                    </ElRow>

                    <ElDivider content-position="left">分组方式</ElDivider>

                    <ElRow>
                      <ElCol :span="24">
                        <ElFormItem label="分组方式">
                          <div class="checkbox-group">
                            <ElCheckbox v-model="queryForm.group_by_year">按年份</ElCheckbox>
                            <ElCheckbox v-model="queryForm.group_by_month">按月份</ElCheckbox>
                            <ElCheckbox v-model="queryForm.group_by_shortcut">按产品线</ElCheckbox>
                            <ElCheckbox v-model="queryForm.group_by_admin_unit_name"
                              >按销售团队</ElCheckbox
                            >
                            <ElCheckbox v-model="queryForm.group_by_employee_name"
                              >按业务员</ElCheckbox
                            >
                            <ElCheckbox v-model="queryForm.group_by_item_name"
                              >按芯片名称</ElCheckbox
                            >
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
                          style="width: 120px"
                        >
                          <Icon icon="ic:sharp-search" />
                          查询
                        </ElButton>
                        <ElButton @click="resetQueryForm" style="width: 120px">
                          <Icon icon="ic:sharp-restart-alt" />
                          重置
                        </ElButton>
                      </ElCol>
                    </ElRow>
                  </ElForm>
                </div>
              </ElPopover>

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
              <Echart :options="saleDataLineChartOptions" />
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
      <ElCard shadow="hover" class="w-full h-600px">
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
    align-items: center;
  }
}

.search-form {
  padding: 10px;
  background-color: var(--el-bg-color);
  border-radius: 4px;
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
  height: 100%;
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

:deep(.filter-popover) {
  max-width: 90vw;

  .el-popover__title {
    font-size: 16px;
    font-weight: bold;
  }
}

.mr-2 {
  margin-right: 8px;
}
</style>
