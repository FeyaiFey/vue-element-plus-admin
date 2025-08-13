<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTable } from '@/hooks/web/useTable'
import {
  ElRow,
  ElCol,
  ElInput,
  ElForm,
  ElFormItem,
  ElMessage,
  ElSkeleton,
  ElSkeletonItem
} from 'element-plus'
import { useDesign } from '@/hooks/web/useDesign'
import ResizeDialog from '@/components/Dialog/src/ResizeDialog.vue'
import SaleStockUpPlanTable from './components/SaleStockUpPlanTable.vue'
import SaleStockUpPlanDetailTable from './components/SaleStockUpPlanDetailTable.vue'
import SaleStockUpPlanBarChart from './components/SaleStockUpPlanBarChart.vue'
import {
  getSaleStockUpSummaryApi,
  exportSaleStockUpSummaryApi,
  getSaleStockUpDetailApi,
  getSaleStockUpSummaryNoGroupApi,
  exportSaleStockUpDetailApi
} from '@/api/sale'
import type {
  SaleStockUpSummaryQuery,
  SaleStockUpSummary,
  SaleStockUpDetail,
  SaleStockUpDetailQuery
} from '@/api/sale/types'

// 使用设计系统
const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('sale-stock-up-plan')

// 定义组件名称（用于keep-alive缓存）
defineOptions({
  name: 'SaleStockUpPlan'
})

const searchParams = ref<SaleStockUpSummaryQuery>({
  year: new Date().getFullYear(),
  month: new Date().getMonth()
})

const { tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    // 过滤空值，避免API报错
    const params = {
      year: searchParams.value.year || undefined,
      month: searchParams.value.month || undefined
    }
    const res = await getSaleStockUpSummaryApi(params)
    return {
      list: res.data.list || []
    }
  }
})

const { dataList, loading } = tableState
const dataListNoGroup = ref<SaleStockUpSummary[]>([])

const getNoGroupData = async () => {
  const params = {
    year: searchParams.value.year || undefined,
    month: searchParams.value.month || undefined
  }
  const res = await getSaleStockUpSummaryNoGroupApi(params)
  dataListNoGroup.value = res.data.list || []
}

const { getList } = tableMethods

// 下载表格
const handleDownload = async () => {
  try {
    // 过滤空值，避免API报错
    const params = {
      year: searchParams.value.year || undefined,
      month: searchParams.value.month || undefined
    }
    const response = await exportSaleStockUpSummaryApi(params)

    // 获取文件名
    const disposition = (response as any).headers?.['content-disposition']
    let filename = `备货计划_${new Date().toLocaleDateString()}.xlsx`

    if (disposition) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
      const matches = filenameRegex.exec(disposition)
      if (matches?.[1]) {
        filename = decodeURIComponent(matches[1].replace(/['"]/g, ''))
      }
    }

    // 创建下载链接
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()

    // 清理
    setTimeout(() => {
      window.URL.revokeObjectURL(url)
    }, 100)

    ElMessage.success('下载成功')
  } catch (error: any) {
    ElMessage.error('下载失败: ' + (error.message || '未知错误'))
  }
}

const handleSearch = () => {
  getList()
  getNoGroupData()
}

const detailDialogVisible = ref(false)
const detailDialogData = ref<SaleStockUpDetail[]>([])
const queryParams = ref<SaleStockUpDetailQuery>({})

const handleRowClick = async (row: SaleStockUpSummary) => {
  try {
    detailDialogVisible.value = true
    queryParams.value = {
      year: Number(row.year),
      month: Number(row.month),
      employeeName: row.employeeName
    }
    const res = await getSaleStockUpDetailApi(queryParams.value)
    detailDialogData.value = res.data.list || []
    console.log(detailDialogData.value)
  } catch (error: any) {
    ElMessage.error('获取详情失败: ' + (error.message || '未知错误'))
  }
}

// 下载表格
const handleDetailDownload = async () => {
  try {
    // 过滤空值，避免API报错
    const params = {
      year: searchParams.value.year || undefined,
      month: searchParams.value.month || undefined,
      employeeName: queryParams.value.employeeName || undefined
    }
    const response = await exportSaleStockUpDetailApi(params)

    // 获取文件名
    const disposition = (response as any).headers?.['content-disposition']
    let filename = `备货计划_${new Date().toLocaleDateString()}.xlsx`

    if (disposition) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
      const matches = filenameRegex.exec(disposition)
      if (matches?.[1]) {
        filename = decodeURIComponent(matches[1].replace(/['"]/g, ''))
      }
    }

    // 创建下载链接
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()

    // 清理
    setTimeout(() => {
      window.URL.revokeObjectURL(url)
    }, 100)

    ElMessage.success('下载成功')
  } catch (error: any) {
    ElMessage.error('下载失败: ' + (error.message || '未知错误'))
  }
}

onMounted(() => {
  getNoGroupData()
})
</script>

<template>
  <ElForm
    :model="searchParams"
    label-width="80px"
    :class="`${prefixCls}__search-form`"
    @submit.prevent="handleSearch"
  >
    <div class="form-container">
      <ElFormItem label="年份" prop="year" class="form-item">
        <ElInput
          v-model="searchParams.year"
          placeholder="请输入年份"
          clearable
          @keyup.enter="handleSearch"
          @change="handleSearch"
          @clear="handleSearch"
        />
      </ElFormItem>
      <ElFormItem label="月份" prop="month" class="form-item">
        <ElInput
          v-model="searchParams.month"
          placeholder="请输入月份"
          clearable
          @keyup.enter="handleSearch"
          @change="handleSearch"
          @clear="handleSearch"
        />
      </ElFormItem>
    </div>
  </ElForm>

  <!-- 表格区域 -->
  <ElRow :gutter="26">
    <ElCol :xl="12" :md="24" :sm="24" :xs="24">
      <ElSkeleton :loading="loading" animated>
        <template #template>
          <div class="bg-white dark:bg-gray-800 rounded-lg border">
            <!-- 表头骨架 -->
            <div class="border-b p-4 bg-gray-50 dark:bg-gray-700">
              <div class="grid grid-cols-6 gap-4">
                <ElSkeletonItem variant="text" style="width: 60%" />
                <ElSkeletonItem variant="text" style="width: 70%" />
                <ElSkeletonItem variant="text" style="width: 80%" />
                <ElSkeletonItem variant="text" style="width: 90%" />
                <ElSkeletonItem variant="text" style="width: 85%" />
                <ElSkeletonItem variant="text" style="width: 75%" />
              </div>
            </div>

            <!-- 表格行骨架 -->
            <div class="p-4 space-y-3">
              <div v-for="n in 18" :key="n" class="grid grid-cols-6 gap-4 py-2">
                <ElSkeletonItem variant="text" style="width: 80%" />
                <ElSkeletonItem variant="text" style="width: 60%" />
                <ElSkeletonItem variant="text" style="width: 90%" />
                <ElSkeletonItem variant="text" style="width: 70%" />
                <ElSkeletonItem variant="text" style="width: 85%" />
                <ElSkeletonItem variant="text" style="width: 65%" />
              </div>
            </div>
          </div>
        </template>

        <template #default>
          <SaleStockUpPlanTable
            :table-data="dataList"
            :enable-selection="false"
            :table-min-height="'740px'"
            @download="handleDownload"
            @row-click="handleRowClick"
            :component-height="'780px'"
          />
        </template>
      </ElSkeleton>
    </ElCol>
    <ElCol :xl="12" :md="24" :sm="24" :xs="24">
      <SaleStockUpPlanBarChart :data="dataListNoGroup" type="summary" />
    </ElCol>
  </ElRow>
  <ResizeDialog
    v-model="detailDialogVisible"
    :title="`预测实际完成情况 - ${queryParams.year}年${queryParams.month}月 - ${queryParams.employeeName || ''}`"
    :init-width="1100"
    :init-height="600"
    :min-resize-width="1000"
    :min-resize-height="500"
  >
    <ElRow :gutter="20">
      <ElCol :span="24">
        <div class="detail-table-wrapper">
          <SaleStockUpPlanDetailTable
            :table-data="detailDialogData"
            :enable-selection="false"
            @download="handleDetailDownload"
          />
        </div>
      </ElCol>
      <ElCol :span="24">
        <div class="detail-chart-wrapper">
          <SaleStockUpPlanBarChart :data="detailDialogData" type="detail" />
        </div>
      </ElCol>
    </ElRow>
  </ResizeDialog>
</template>

<style scoped lang="less">
// 小屏幕优化
@media (width <= 480px) {
  .search-form {
    .form-container {
      gap: 12px;

      .form-item {
        width: 100% !important;
      }
    }
  }
}

.@{prefix-cls}__search-form {
  margin-bottom: 16px;

  .form-container {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: flex-end;

    .form-item {
      flex: 0 0 auto;
      margin-bottom: 0;

      // 年份输入框 - 固定宽度
      &:nth-child(1) {
        width: 180px;

        @media (width <= 768px) {
          width: 100%;
        }
      }

      // 月份输入框 - 固定宽度
      &:nth-child(2) {
        width: 180px;

        @media (width <= 768px) {
          width: 100%;
        }
      }

      // 下载按钮 - 固定宽度
      &:nth-child(3) {
        width: 180px;

        @media (width <= 768px) {
          width: 100%;
        }
      }
    }
  }
}

.detail-table-wrapper {
  display: flex;
  height: 100%;
  flex-direction: column;

  .detail-title {
    padding: 0;
    margin: 0;
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
@prefix-cls: ~'@{adminNamespace}-sale-stock-up-plan';
</style>
