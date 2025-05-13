<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElForm, ElFormItem, ElInput, ElRow, ElCol } from 'element-plus'
import SaleTargetSummaryTable from './target/SaleTargetSummaryTable.vue'
import SaleTargetDetailTable from './target/SaleTargetDetailTable.vue'
import ResizeDialog from '@/components/Dialog/src/ResizeDialog.vue'
import SaleTargetChart from './target/SaleTargetChart.vue'
import type { SaleTargetSummaryQuery, SaleTargetDetailQuery } from '@/api/sale/type'
import type { FormItemRule } from 'element-plus'

// 表单引用
const formRef = ref()

// 获取上个月的年月
const getLastMonth = () => {
  const date = new Date()
  date.setMonth(date.getMonth() - 1)
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1
  }
}

// 查询参数
const summaryQueryParams = reactive<SaleTargetSummaryQuery>({
  year: getLastMonth().year,
  month: getLastMonth().month
})

// 明细查询参数
const detailQueryParams = reactive<SaleTargetDetailQuery>({
  year: getLastMonth().year,
  month: getLastMonth().month,
  employee_name: ''
})

// 表单验证规则
const rules = {
  year: [
    { required: true, message: '请输入年份', trigger: 'blur' },
    { type: 'number' as const, message: '年份必须为数字', trigger: 'blur' },
    {
      validator: (_: any, value: number, callback: Function) => {
        if (value < 2025) {
          callback(new Error('年份必须大于等于2025'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  month: [
    { required: true, message: '请输入月份', trigger: 'blur' },
    { type: 'number' as const, message: '月份必须为数字', trigger: 'blur' },
    {
      validator: (_: any, value: number, callback: Function) => {
        if (value < 1 || value > 12) {
          callback(new Error('月份必须在1-12之间'))
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

// 搜索方法
const handleSearch = async () => {
  try {
    await formRef.value?.validate()
    // 清空当前选中行和明细数据
    currentRow.value = null
    detailQueryParams.year = undefined
    detailQueryParams.month = undefined
    detailQueryParams.employee_name = ''
    detailTableRef.value?.clearData()
    // 查询汇总数据
    await summaryTableRef.value?.getData()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 表格引用
const summaryTableRef = ref()
const detailTableRef = ref()
const saleTargetChartRef = ref()

// 当前选中的行
const currentRow = ref<any>(null)

// 控制对话框显示
const dialogVisible = ref(false)

// 处理汇总表格行点击
const handleSummaryRowClick = (row: any) => {
  if (
    currentRow.value?.YEAR === row.YEAR &&
    currentRow.value?.MONTH === row.MONTH &&
    currentRow.value?.EMPLOYEE_NAME === row.EMPLOYEE_NAME
  ) {
    // 再次点击同一行，关闭对话框
    currentRow.value = null
    dialogVisible.value = false
    detailQueryParams.year = undefined
    detailQueryParams.month = undefined
    detailQueryParams.employee_name = ''
    detailTableRef.value?.clearData()
  } else {
    // 点击新行，打开对话框并查询明细
    currentRow.value = row
    detailQueryParams.year = row.YEAR
    detailQueryParams.month = row.MONTH
    detailQueryParams.employee_name = row.EMPLOYEE_NAME
    // 确保明细查询参数与汇总查询参数一致
    if (
      detailQueryParams.year !== summaryQueryParams.year ||
      detailQueryParams.month !== summaryQueryParams.month
    ) {
      detailQueryParams.year = summaryQueryParams.year
      detailQueryParams.month = summaryQueryParams.month
    }
    dialogVisible.value = true
    // 等待对话框打开后再加载数据
    setTimeout(() => {
      detailTableRef.value?.getList()
    }, 100)
  }
}

// 对话框关闭时的处理
const handleDialogClose = () => {
  currentRow.value = null
  detailQueryParams.year = undefined
  detailQueryParams.month = undefined
  detailQueryParams.employee_name = ''
  detailTableRef.value?.clearData()
}

// 页面加载时执行查询
onMounted(async () => {
  await handleSearch()
})
</script>

<template>
  <!-- 搜索表单 -->
  <ElForm ref="formRef" :model="summaryQueryParams" :rules="rules" label-width="100px">
    <ElRow :gutter="20">
      <ElCol :xs="24" :sm="12" :md="6" :lg="4" :xl="4">
        <ElFormItem label="年份" prop="year">
          <ElInput
            v-model.number="summaryQueryParams.year"
            placeholder="请输入年份"
            @keyup="handleKeyup"
          />
        </ElFormItem>
      </ElCol>
      <ElCol :xs="24" :sm="12" :md="6" :lg="4" :xl="4">
        <ElFormItem label="月份" prop="month">
          <ElInput
            v-model.number="summaryQueryParams.month"
            placeholder="请输入月份"
            @keyup="handleKeyup"
          />
        </ElFormItem>
      </ElCol>
    </ElRow>
  </ElForm>

  <!-- 表格区域 -->
  <ElRow :gutter="20">
    <!-- 汇总表格 -->
    <ElCol :xs="24" :lg="12">
      <div class="table-container">
        <h3 class="table-title">备货计划和实际对比</h3>
        <SaleTargetSummaryTable
          ref="summaryTableRef"
          :query-params="summaryQueryParams"
          @row-click="handleSummaryRowClick"
        />
      </div>
    </ElCol>
    <ElCol :xs="24" :lg="12">
      <div class="table-container">
        <SaleTargetChart
          ref="saleTargetChartRef"
          :data="summaryTableRef?.originalData || []"
          type="summary"
        />
      </div>
    </ElCol>
  </ElRow>

  <!-- 明细对话框 -->
  <ResizeDialog
    v-model="dialogVisible"
    :title="`预测实际完成情况 - ${currentRow?.YEAR}年${currentRow?.MONTH}月 - ${currentRow?.EMPLOYEE_NAME || ''}`"
    :init-width="1000"
    :init-height="600"
    :min-resize-width="800"
    :min-resize-height="500"
    @close="handleDialogClose"
  >
    <div class="detail-container">
      <ElRow :gutter="20">
        <ElCol :span="24">
          <div class="detail-table-wrapper">
            <h3 class="detail-title">详细销售数据</h3>
            <SaleTargetDetailTable ref="detailTableRef" :query-params="detailQueryParams" />
          </div>
        </ElCol>
        <ElCol :span="24">
          <div class="detail-chart-wrapper">
            <SaleTargetChart :data="detailTableRef?.tableData || []" type="detail" />
          </div>
        </ElCol>
      </ElRow>
    </div>
  </ResizeDialog>
</template>

<style lang="less" scoped>
.table-container {
  display: flex;
  height: calc(100vh - 200px);
  padding: 5px;
  margin-top: 5px;
  border-radius: 4px;
  flex-direction: column;

  .table-title {
    padding: 8px 0;
    margin: 0 0 16px;
    font-size: 22px;
    font-weight: bold;
    color: var(--el-text-color-primary);
    text-align: center;
  }

  :deep(.el-table) {
    flex: 1;
    height: calc(100% - 100px);
  }
}

.detail-container {
  height: 100%;
  overflow: hidden;
}

.detail-table-wrapper {
  display: flex;
  height: 100%;
  flex-direction: column;

  .detail-title {
    padding: 8px 0;
    margin: 0 0 10px;
    font-size: 16px;
    font-weight: bold;
    color: var(--el-text-color-primary);
  }

  :deep(.el-table) {
    flex: 1;
    overflow: auto;
  }
}

.detail-chart-wrapper {
  padding-top: 34px; /* 与表格标题保持对齐 */
}
</style>
