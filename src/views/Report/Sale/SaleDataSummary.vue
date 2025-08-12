<script setup lang="ts">
import { ref } from 'vue'
import { useTable } from '@/hooks/web/useTable'
import {
  ElInput,
  ElForm,
  ElFormItem,
  ElDrawer,
  ElButton,
  ElDivider,
  ElMessage,
  ElDatePicker,
  ElSkeleton,
  ElSkeletonItem
} from 'element-plus'
import { Icon } from '@/components/Icon'
import { useDesign } from '@/hooks/web/useDesign'
import SaleDataSummaryTable from './components/SaleDataSummaryTable.vue'
import { SaleDataSummaryQuery, SaleDataSummaryResponse } from '@/api/sale/types'
import { getSaleDataSummaryApi, exportSaleDataSummaryApi } from '@/api/sale'

// 使用设计系统
const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('sale-data-summary')

// 定义组件名称（用于keep-alive缓存）
defineOptions({
  name: 'SaleDataSummary'
})

const summaryData = ref<SaleDataSummaryResponse>({
  list: [],
  beginDate: '',
  endDate: ''
})

const searchParams = ref<SaleDataSummaryQuery>({
  beginDate: undefined,
  endDate: undefined,
  departmentName: undefined,
  employeeName: undefined
})

// 抽屉相关
const drawerVisible = ref(false)
const advancedSearchParams = ref<{
  beginDate: string | undefined
  endDate: string | undefined
  departmentName: string | undefined
  employeeName: string | undefined
}>({
  beginDate: undefined,
  endDate: undefined,
  departmentName: undefined,
  employeeName: undefined
})

const { tableState, tableMethods } = useTable({
  immediate: true,
  fetchDataApi: async () => {
    const res = await getSaleDataSummaryApi(searchParams.value)

    // 更新汇总数据（包含日期信息）
    summaryData.value = {
      list: res.data.list || [],
      beginDate: res.data.beginDate || '',
      endDate: res.data.endDate || ''
    }

    return {
      list: res.data.list || [],
      beginDate: res.data.beginDate,
      endDate: res.data.endDate
    }
  }
})

const { dataList, loading } = tableState
const { getList } = tableMethods

// 搜索方法
const handleSearch = () => {
  getList()
}

// 应用高级搜索
const handleAdvancedSearch = () => {
  // 合并高级搜索参数到主搜索参数
  Object.assign(searchParams.value, advancedSearchParams.value)
  handleSearch()
  drawerVisible.value = false
}

// 重置高级搜索
const handleResetAdvanced = () => {
  advancedSearchParams.value = {
    beginDate: undefined,
    endDate: undefined,
    departmentName: undefined,
    employeeName: undefined
  }

  // 清空主搜索参数中的高级搜索部分
  searchParams.value.beginDate = undefined
  searchParams.value.endDate = undefined
  searchParams.value.departmentName = undefined
  searchParams.value.employeeName = undefined

  handleSearch()
}

// 获取活跃的高级搜索条件数量
const getActiveAdvancedFilters = () => {
  const filters = advancedSearchParams.value
  let count = 0
  Object.values(filters).forEach((value) => {
    if (value !== undefined && value !== '' && value !== null) {
      count++
    }
  })
  return count
}

// 下载状态
const downloading = ref(false)

// 下载表格
const handleDownload = async () => {
  try {
    const response = await exportSaleDataSummaryApi({
      ...searchParams.value
    })

    // 获取文件名
    const disposition = (response as any).headers?.['content-disposition']
    let filename = `销售数据汇总表_${new Date().toLocaleDateString()}.xlsx`

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
</script>

<template>
  <div :class="prefixCls">
    <!-- 快速搜索区域 -->
    <div :class="`${prefixCls}__search`" class="mb-2">
      <div class="flex items-center gap-2">
        <!-- 操作按钮组 -->
        <div class="flex-2">
          <!-- 高级搜索 -->
          <ElButton type="primary" size="small" plain @click="drawerVisible = true" class="w-25">
            <Icon icon="vi-ep:filter" class="mr-2" />
            高级搜索
            <span
              v-if="getActiveAdvancedFilters() > 0"
              class="ml-1 px-1 bg-red-500 text-white text-xs rounded"
            >
              {{ getActiveAdvancedFilters() }}
            </span>
          </ElButton>

          <!-- 下载按钮 -->
          <ElButton
            size="small"
            @click="handleDownload"
            class="w-25"
            :loading="downloading"
            :disabled="downloading || dataList.length === 0"
            type="success"
          >
            <Icon v-if="!downloading" icon="vi-vscode-icons:file-type-excel" class="mr-2" />
            {{ downloading ? '导出中...' : '下载表格' }}
          </ElButton>
        </div>
      </div>
    </div>

    <div class="flex mb-2">
      <div class="flex-1">
        <div class="text-xl font-bold">
          统计周期：{{ summaryData.beginDate }} 至 {{ summaryData.endDate }}
        </div>
      </div>
    </div>

    <!-- 表格区域 -->
    <div :class="`${prefixCls}__table`" class="flex-1 mb-4">
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
          <SaleDataSummaryTable :table-data="dataList" :table-height="'calc(100vh - 200px)'" />
        </template>
      </ElSkeleton>
    </div>

    <!-- 高级搜索抽屉 -->
    <ElDrawer v-model="drawerVisible" title="高级搜索" size="400px" direction="rtl">
      <div class="p-4">
        <ElForm :model="advancedSearchParams" label-width="100px" label-position="left">
          <ElFormItem label="开始日期">
            <ElDatePicker
              v-model="advancedSearchParams.beginDate"
              type="date"
              placeholder="请选择开始日期"
              value-format="YYYY-MM-DD"
              clearable
              class="w-full"
            />
          </ElFormItem>

          <ElFormItem label="结束日期">
            <ElDatePicker
              v-model="advancedSearchParams.endDate"
              type="date"
              placeholder="请选择结束日期"
              value-format="YYYY-MM-DD"
              clearable
              class="w-full"
            />
          </ElFormItem>

          <ElFormItem label="部门">
            <ElInput
              v-model="advancedSearchParams.departmentName"
              placeholder="请输入部门"
              clearable
            />
          </ElFormItem>

          <ElFormItem label="业务员">
            <ElInput
              v-model="advancedSearchParams.employeeName"
              placeholder="请输入业务员"
              clearable
              @keyup.enter="handleSearch"
            />
          </ElFormItem>
        </ElForm>

        <ElDivider />

        <!-- 抽屉操作按钮 -->
        <div class="flex justify-end">
          <ElButton type="info" @click="handleResetAdvanced" class="w-25"> 重置条件 </ElButton>
          <ElButton type="primary" @click="handleAdvancedSearch" class="w-25"> 应用搜索 </ElButton>
        </div>
      </div>
    </ElDrawer>
  </div>
</template>

<style scoped lang="less">
// 响应式设计
@media (width <= 1200px) {
  .@{prefix-cls} {
    &__search {
      .flex {
        align-items: stretch;
      }
    }

    // 分页区域响应式
    .flex.justify-between {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;

      .text-sm {
        .flex.items-center {
          flex-wrap: wrap;
          gap: 8px;

          span {
            font-size: 11px;
            white-space: nowrap;
          }
        }
      }
    }

    :deep(.el-pagination) {
      justify-content: center;

      .el-pagination__sizes,
      .el-pagination__total {
        display: none;
      }

      .el-pager li {
        height: 24px;
        min-width: 24px;
        font-size: 11px;
        line-height: 22px;
      }

      .btn-prev,
      .btn-next {
        height: 24px;
        font-size: 11px;
      }
    }
  }
}

.@{prefix-cls} {
  padding: 0;
}

// 高级搜索表单样式
:deep(.el-drawer__body) {
  .el-form {
    .el-form-item {
      .el-form-item__content {
        .el-date-editor,
        .el-input,
        .el-select {
          width: 100% !important;
        }

        .el-date-editor.el-input {
          width: 100% !important;
        }
      }
    }
  }
}

// 暗色主题适配
.dark .@{prefix-cls} {
  &__search,
  &__table {
    border-color: var(--el-border-color-darker);
  }
}
@prefix-cls: ~'@{adminNamespace}-sale-data';
</style>
