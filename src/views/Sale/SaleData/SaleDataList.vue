<script setup lang="ts">
import { ref } from 'vue'
import { useTable } from '@/hooks/web/useTable'
import {
  ElInput,
  ElForm,
  ElFormItem,
  ElPagination,
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
import SaleDataListTable from './components/SaleDataListTable.vue'
import { SaleDataDetailQuery } from '@/api/sale/types'
import { getSaleDataDetailApi, exportSaleDataApi } from '@/api/sale'

// 使用设计系统
const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('sale-data')

// 定义组件名称（用于keep-alive缓存）
defineOptions({
  name: 'SaleData'
})

const searchParams = ref<SaleDataDetailQuery>({
  pageIndex: 1,
  pageSize: 20,
  beginDate: undefined,
  endDate: undefined,
  departmentName: undefined,
  employeeName: undefined,
  itemCode: undefined,
  shortcut: undefined,
  packagingType: undefined
})

// 抽屉相关
const drawerVisible = ref(false)
const advancedSearchParams = ref<{
  beginDate: string | undefined
  endDate: string | undefined
  departmentName: string | undefined
  employeeName: string | undefined
  itemCode: string | undefined
  shortcut: string | undefined
  packagingType: string | undefined
}>({
  beginDate: undefined,
  endDate: undefined,
  departmentName: undefined,
  employeeName: undefined,
  itemCode: undefined,
  shortcut: undefined,
  packagingType: undefined
})

const { tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const res = await getSaleDataDetailApi(searchParams.value)
    return {
      list: res.data.list || [],
      total: res.data.total
    }
  }
})

const { dataList, loading, total } = tableState
const { getList } = tableMethods

// 搜索方法
const handleSearch = () => {
  searchParams.value.pageIndex = 1 // 重置到第一页
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
    employeeName: undefined,
    itemCode: undefined,
    shortcut: undefined,
    packagingType: undefined
  }

  // 清空主搜索参数中的高级搜索部分
  searchParams.value.beginDate = undefined
  searchParams.value.endDate = undefined
  searchParams.value.departmentName = undefined
  searchParams.value.employeeName = undefined
  searchParams.value.itemCode = undefined
  searchParams.value.shortcut = undefined
  searchParams.value.packagingType = undefined

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

// 分页大小改变
const handleSizeChange = (size: number) => {
  searchParams.value.pageSize = size
  searchParams.value.pageIndex = 1
  getList()
}

// 当前页改变
const handleCurrentChange = (page: number) => {
  searchParams.value.pageIndex = page
  getList()
}

// 表格选择变化
const handleSelectionChange = (selection: any[]) => {
  console.log('选中的行:', selection)
  selectedRows.value = selection
  calculateSummary()
}

// 选中的行数据
const selectedRows = ref<any[]>([])

// 汇总数据
const summaryData = ref({
  count: 0,
  qty: 0,
  amount: 0
})

// 是否显示汇总信息
const showSummary = ref(false)

// 计算汇总
const calculateSummary = () => {
  const rows = selectedRows.value
  const count = rows.length

  if (count === 0) {
    showSummary.value = false
    return
  }

  showSummary.value = true

  const qty = rows.reduce((sum, row) => sum + (Number(row.qty) || 0), 0)
  const amount = rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0)

  summaryData.value = {
    count,
    qty,
    amount
  }
}

// 格式化数字
const formatNumber = (num: number, decimals: number = 2) => {
  return Number(num).toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

// 下载状态
const downloading = ref(false)

// 下载表格
const handleDownload = async () => {
  try {
    const response = await exportSaleDataApi({
      ...searchParams.value
    })

    // 获取文件名
    const disposition = (response as any).headers?.['content-disposition']
    let filename = `销售数据_${new Date().toLocaleDateString()}.xlsx`

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
          <SaleDataListTable
            :table-data="dataList"
            :enable-selection="true"
            table-height="calc(100vh - 240px)"
            @selection-change="handleSelectionChange"
          />
        </template>
      </ElSkeleton>
    </div>

    <!-- 分页区域 -->
    <div class="flex justify-between items-center">
      <!-- 统计信息 -->
      <div class="text-sm text-gray-600 dark:text-gray-300">
        <div v-if="!showSummary">
          <span>共 {{ total }} 条记录</span>
        </div>
        <div v-else class="flex flex-col gap-1">
          <div class="flex items-center gap-4">
            <span class="font-medium">已选 {{ summaryData.count }} 条</span>
            <span>总数量: {{ formatNumber(summaryData.qty, 0) }}</span>
            <span>总金额: {{ formatNumber(summaryData.amount, 0) }}</span>
          </div>
          <div class="flex items-center gap-4 text-xs">
            <span class="text-gray-500">共 {{ total }} 条记录</span>
          </div>
        </div>
      </div>

      <!-- 分页控件 -->
      <ElPagination
        v-model:current-page="searchParams.pageIndex"
        v-model:page-size="searchParams.pageSize"
        :page-sizes="[10, 20, 30, 50, 100]"
        :total="total"
        layout="sizes, prev, pager, next, jumper"
        size="small"
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
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

          <ElFormItem label="芯片名称">
            <ElInput
              v-model="advancedSearchParams.itemCode"
              placeholder="请输入芯片名称"
              clearable
              @keyup.enter="handleSearch"
            />
          </ElFormItem>

          <ElFormItem label="芯片类别">
            <ElInput
              v-model="advancedSearchParams.shortcut"
              placeholder="请输入芯片类别"
              clearable
              @keyup.enter="handleSearch"
            />
          </ElFormItem>

          <ElFormItem label="封装形式">
            <ElInput
              v-model="advancedSearchParams.packagingType"
              placeholder="请输入封装形式"
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
