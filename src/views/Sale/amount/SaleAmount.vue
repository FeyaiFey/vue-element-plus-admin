<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElRow,
  ElCol,
  ElButton,
  ElSelect,
  ElOption,
  ElDivider,
  ElCheckbox,
  ElPopover
} from 'element-plus'
import { Icon } from '@/components/Icon'
import SaleAmountSummaryTable from './SaleAmountSummaryTable.vue'
import SaleAmountChart from './SaleAmountChart.vue'
import { getSalesApi, getSaleUnitApi } from '@/api/params'
import type { SaleAmountQuery } from '@/api/sale/type'
import type { FormItemRule } from 'element-plus'

// 加载状态
const queryLoading = ref(false)

// 表单引用
const formRef = ref()

// 查询参数
const queryParams = reactive<SaleAmountQuery>({
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  admin_unit_name: '',
  employee_name: '',
  group_by_year: true,
  group_by_month: true,
  group_by_admin_unit_name: false,
  group_by_employee_name: true
})

// 行政部门列表
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
  const res = queryParams.admin_unit_name
    ? await getSalesApi(queryParams.admin_unit_name)
    : await getSalesApi()
  employeeList.value = res.data.list

  // 如果当前选择的业务员不在新的列表中，则清空选择
  if (
    queryParams.employee_name &&
    !employeeList.value.some((item) => item.id === queryParams.employee_name)
  ) {
    queryParams.employee_name = ''
  }
}

// 监听行政部门变化，更新业务员列表
watch(
  () => queryParams.admin_unit_name,
  async () => {
    // 当行政部门变化时，重新获取业务员列表
    await getEmployeeList()
  }
)

// 表单验证规则
const rules = {
  year: [
    { required: true, message: '请输入年份', trigger: 'blur' },
    { type: 'number', message: '年份必须为数字', trigger: 'blur' },
    {
      validator: (_: any, value: number, callback: Function) => {
        if (value < 2025) {
          callback(new Error('年份必须在2025年之后'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
} as Record<string, FormItemRule[]>

// 处理输入框回车事件
const handleKeyup = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleSearch()
  }
}

// 表格引用
const tableRef = ref()
const chartRef = ref()

// popover可见性控制
const popoverVisible = ref(false)

// 搜索方法
const handleSearch = async () => {
  try {
    await formRef.value?.validate()
    queryLoading.value = true
    // 查询数据
    await tableRef.value?.getData()
    queryLoading.value = false
    // 关闭popover
    popoverVisible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
    queryLoading.value = false
  }
}

// 重置方法
const handleReset = () => {
  queryParams.year = new Date().getFullYear()
  queryParams.month = new Date().getMonth() + 1
  queryParams.admin_unit_name = ''
  queryParams.employee_name = ''
  queryParams.group_by_year = true
  queryParams.group_by_month = true
  queryParams.group_by_admin_unit_name = false
  queryParams.group_by_employee_name = true
  handleSearch()
  getEmployeeList() // 重置后重新获取业务员列表
}

// 页面加载时执行查询
onMounted(async () => {
  await handleSearch()
  await getAdminUnitList()
  await getEmployeeList()
})
</script>

<template>
  <!-- 表格区域 -->
  <ElRow :gutter="20">
    <!-- 分析表格 -->
    <ElCol :xs="24" :lg="12">
      <div class="table-container">
        <div class="table-header">
          <h3 class="table-title">销售额预测vs实际（万元）</h3>
          <ElPopover
            v-model:visible="popoverVisible"
            placement="bottom-end"
            :width="800"
            trigger="click"
            popper-class="filter-popover"
          >
            <template #reference>
              <ElButton type="primary" size="small" circle>
                <Icon icon="vi-basil:filter-outline" />
              </ElButton>
            </template>
            <!-- 搜索表单 -->
            <div class="search-form">
              <ElForm
                ref="formRef"
                :model="queryParams"
                :rules="rules"
                label-width="80px"
                size="small"
              >
                <ElRow :gutter="16">
                  <ElCol :span="12">
                    <ElFormItem label="年份" prop="year">
                      <ElInput
                        v-model.number="queryParams.year"
                        placeholder="请输入年份"
                        @keyup="handleKeyup"
                      />
                    </ElFormItem>
                  </ElCol>
                  <ElCol :span="12">
                    <ElFormItem label="月份" prop="month">
                      <ElInput
                        v-model.number="queryParams.month"
                        placeholder="请输入月份"
                        @keyup="handleKeyup"
                      />
                    </ElFormItem>
                  </ElCol>
                </ElRow>
                <ElRow :gutter="16">
                  <ElCol :span="12">
                    <ElFormItem label="销售团队">
                      <ElSelect
                        v-model="queryParams.admin_unit_name"
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
                  <ElCol :span="12">
                    <ElFormItem label="业务员">
                      <ElSelect
                        v-model="queryParams.employee_name"
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
                </ElRow>
                <ElDivider content-position="left">分组方式</ElDivider>
                <ElRow>
                  <ElCol :span="24">
                    <ElFormItem label="分组方式">
                      <div class="checkbox-group">
                        <ElCheckbox v-model="queryParams.group_by_year">按年份</ElCheckbox>
                        <ElCheckbox v-model="queryParams.group_by_month">按月份</ElCheckbox>
                        <ElCheckbox v-model="queryParams.group_by_admin_unit_name"
                          >按销售团队</ElCheckbox
                        >
                        <ElCheckbox v-model="queryParams.group_by_employee_name"
                          >按业务员</ElCheckbox
                        >
                      </div>
                    </ElFormItem>
                  </ElCol>
                </ElRow>
                <ElRow>
                  <ElCol :span="24" style="text-align: center">
                    <ElButton
                      type="primary"
                      @click="handleSearch"
                      :loading="queryLoading"
                      style="width: 120px"
                    >
                      <Icon icon="ic:sharp-search" />
                      查询
                    </ElButton>
                    <ElButton @click="handleReset" style="width: 120px">
                      <Icon icon="ic:sharp-restart-alt" />
                      重置
                    </ElButton>
                  </ElCol>
                </ElRow>
              </ElForm>
            </div>
          </ElPopover>
        </div>
        <SaleAmountSummaryTable ref="tableRef" :query-params="queryParams" />
      </div>
    </ElCol>
    <!-- 图表区域 -->
    <ElCol :xs="24" :lg="12">
      <div class="table-container">
        <SaleAmountChart ref="chartRef" :data="tableRef?.tableData || []" />
      </div>
    </ElCol>
  </ElRow>
</template>

<style lang="less" scoped>
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

.table-container {
  display: flex;
  height: calc(100vh - 270px);
  padding: 5px;
  margin-top: 5px;
  border-radius: 4px;
  flex-direction: column;

  .table-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .table-title {
    padding: 8px 0;
    margin: 0;
    font-size: 22px;
    font-weight: bold;
    color: var(--el-text-color-primary);
    text-align: center;
    flex: 1;
  }

  :deep(.el-table) {
    flex: 1;
    height: calc(100% - 100px);
  }
}

:deep(.filter-popover) {
  max-width: 90vw;

  .el-popover__title {
    font-size: 16px;
    font-weight: bold;
  }
}
</style>
