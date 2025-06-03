<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElRow, ElCol, ElInput, ElCard, ElButton } from 'element-plus'
import AmountPercentageTable from './AmountPercentageTable.vue'
import AmountPercentageChart from './AmountPercentageChart.vue'
import AmountPercentageDetail from './AmountPercentageDetail.vue'
import ResizeDialog from '@/components/Dialog/src/ResizeDialog.vue'

import { getSalesApi, getSaleUnitApi } from '@/api/params'
import type { SaleAmountQuery } from '@/api/sale/type'
import { Icon } from '@/components/Icon'

// 加载状态
const queryLoading = ref(false)

// 表单引用
const formRef = ref()

// 详情对话框
const detailDialogVisible = ref(false)

// 查询参数
const queryParams = reactive<SaleAmountQuery>({
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  admin_unit_name: '',
  employee_name: '',
  group_by_year: true,
  group_by_month: true,
  group_by_admin_unit_name: true,
  group_by_employee_name: true
})

// 监听month变化，设置group_by_month
watch(
  () => queryParams.month,
  (newValue) => {
    // 如果month为空、undefined或0，则group_by_month为false，否则为true
    queryParams.group_by_month = Boolean(newValue)
  }
)

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

// 处理输入框回车事件
const handleKeyup = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleSearch()
  }
}

// 表格引用
const tableRef = ref()
const chartRef = ref()

// 搜索方法
const handleSearch = async () => {
  try {
    await formRef.value?.validate()
    queryLoading.value = true
    // 查询数据
    await tableRef.value?.getData()
    queryLoading.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
    queryLoading.value = false
  }
}

// 打开详情对话框
const openDetailDialog = () => {
  detailDialogVisible.value = true
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
    <ElCol :xl="14" :lg="14" :md="24" :sm="24" :xs="24">
      <ElCard shadow="never" class="chart-card">
        <template #header>
          <div class="header-container">
            <div class="header-title">
              <span>销售额完成率 预测VS实际</span>
            </div>
            <div class="header-search">
              <ElButton type="warning" size="small" @click="openDetailDialog">
                <Icon icon="vi-fluent:apps-list-detail-20-regular" />
              </ElButton>
              <span>查询参数：</span>
              <span>年份：</span>
              <ElInput
                v-model="queryParams.year"
                placeholder="年份"
                @keyup.enter="handleKeyup"
                style="width: 80px"
              />
              <span>月份：</span>
              <ElInput
                v-model="queryParams.month"
                placeholder="月份"
                @keyup.enter="handleKeyup"
                style="width: 80px"
              />
            </div>
          </div>
        </template>
        <AmountPercentageTable ref="tableRef" :query-params="queryParams" />
      </ElCard>
    </ElCol>
    <ElCol :xl="10" :lg="10" :md="24" :sm="24" :xs="24">
      <AmountPercentageChart ref="chartRef" :query-params="queryParams" />
    </ElCol>
  </ElRow>

  <!-- 详情对话框 -->
  <ResizeDialog
    v-model="detailDialogVisible"
    title="销售额完成率详情分析"
    :fullscreen="true"
    :initWidth="1500"
    :initHeight="700"
    :minResizeWidth="1200"
    :minResizeHeight="600"
    @close="detailDialogVisible = false"
  >
    <AmountPercentageDetail v-if="detailDialogVisible" :query-params="queryParams" />
  </ResizeDialog>
</template>

<style lang="less" scoped>
.search-form {
  padding: 10px;
  background-color: var(--el-bg-color);
  border-radius: 4px;
}

.mr-1 {
  margin-right: 4px;
}

.header-container {
  display: flex;
  gap: 8px;
  align-items: center;
  height: 16px;

  .header-title {
    font-weight: bold;
    color: var(--el-text-color-primary);
    text-align: center;
    flex: 1;
  }

  .header-search {
    display: flex;
    gap: 6px;
    align-items: center;
    height: 16px;

    span {
      font-size: 14px;
      color: var(--el-text-color-regular);
    }
  }
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.table-container {
  display: flex;
  padding: 2px;
  margin-top: 2px;
  border-radius: 4px;
  flex-direction: column;

  .table-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .table-title {
    padding: 4px 0;
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

.chart-card {
  :deep(.el-card__body) {
    padding: 8px;
  }
}

:deep(.filter-popover) {
  max-width: 90vw;

  .el-popover__title {
    font-size: 16px;
    font-weight: bold;
  }
}

:deep(.detail-dialog) {
  .el-dialog__body {
    height: 70vh;
    padding: 0;
    overflow: hidden;
  }
}
</style>
