<script setup lang="ts">
import { ref, watch, nextTick, PropType } from 'vue'
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
  ElMessageBox,
  ElSkeleton,
  ElSkeletonItem
} from 'element-plus'
import { Icon } from '@/components/Icon'
import ResizeDialog from '@/components/Dialog/src/ResizeDialog.vue'
import { useDesign } from '@/hooks/web/useDesign'
import SaleTargetTable from './components/SaleTargetTable.vue'
import SaleTargetUpload from './components/SaleTargetUpload.vue'
import { SaleTargetQuery, SaleTargetCreate } from '@/api/sale/types'
import {
  getSaleTargetListApi,
  createSaleTargetApi,
  deleteSaleTargetApi,
  downloadSaleTargetTemplateApi,
  deleteSaleTargetBatchApi
} from '@/api/sale'

// 使用设计系统
const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('sale-target')

// 定义组件名称（用于keep-alive缓存）
defineOptions({
  name: 'SaleTarget'
})

// 定义 props
const props = defineProps({
  tableType: {
    type: String as PropType<'detail' | 'summary'>,
    default: 'detail'
  }
})

const searchParams = ref<SaleTargetQuery>({
  pageIndex: 1,
  pageSize: 20,
  year: undefined,
  month: undefined,
  departmentName: undefined,
  employeeName: undefined
})

// 抽屉相关
const drawerVisible = ref(false)
const advancedSearchParams = ref<{
  year: number | undefined
  month: number | undefined
  departmentName: string | undefined
}>({
  year: undefined,
  month: undefined,
  departmentName: undefined
})

// 主要搜索条件
const quickSearch = ref('')

const { tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const res = await getSaleTargetListApi(searchParams.value)
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
  searchParams.value.employeeName = quickSearch.value || undefined
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
    year: undefined,
    month: undefined,
    departmentName: undefined
  }

  // 清空主搜索参数中的高级搜索部分
  searchParams.value.year = undefined
  searchParams.value.month = undefined
  searchParams.value.departmentName = undefined

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
  targetSum: 0
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

  const targetSum = rows.reduce((sum, row) => sum + (Number(row.monthTarget) || 0), 0)

  summaryData.value = {
    count,
    targetSum
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
const handleDownloadTemplate = async () => {
  try {
    const response = await downloadSaleTargetTemplateApi()

    // 创建下载链接
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `销售目标导入模板_${new Date().getTime()}.xlsx`
    link.click()

    // 清理
    setTimeout(() => {
      window.URL.revokeObjectURL(url)
    }, 100)

    ElMessage.success('模板下载成功')
  } catch (error: any) {
    ElMessage.error('模板下载失败: ' + (error.message || '未知错误'))
  }
}

// 删除处理
const handleDeleteClick = async (id: number) => {
  try {
    await deleteSaleTargetApi(id)
    ElMessage.success('删除成功')
    // 刷新数据
    await getList()
  } catch (error: any) {
    console.error('删除失败:', error)
    ElMessage.error(error?.message || '删除失败，请重试')
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的记录')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 条记录吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )

    const ids = selectedRows.value.map((row) => row.id)
    await deleteSaleTargetBatchApi(ids)
    ElMessage.success(`成功删除 ${ids.length} 条记录`)

    // 清空选择
    selectedRows.value = []
    showSummary.value = false

    // 刷新数据
    await getList()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error(error?.message || '批量删除失败，请重试')
    }
  }
}

// 新建需求相关状态
const createDialogVisible = ref(false)
const createLoading = ref(false)
const createFormData = ref<SaleTargetCreate>({
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  departmentName: '',
  employeeName: '',
  monthTarget: 0
})

// 上传对话框状态
const uploadDialogVisible = ref(false)

// 新建需求相关方法
const handleCreateRequirement = () => {
  // 创建新的对象避免引用问题
  const newFormData = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    departmentName: '',
    employeeName: '',
    monthTarget: 0
  }

  // 先设置数据，再打开对话框
  Object.assign(createFormData.value, newFormData)

  nextTick(() => {
    createDialogVisible.value = true
  })
}

const handleCreateSubmit = async () => {
  try {
    createLoading.value = true
    await createSaleTargetApi(createFormData.value)

    ElMessage.success('新建成功')

    // 先关闭对话框
    createDialogVisible.value = false

    // 重置搜索参数到第一页，确保能看到新创建的数据
    searchParams.value.pageIndex = 1

    // 清空搜索条件，确保新建的数据能显示
    quickSearch.value = ''
    searchParams.value.employeeName = undefined

    // 强制刷新表格数据
    await getList()
  } catch (error: any) {
    console.error('新建需求失败:', error)
    ElMessage.error(error?.message || '新建需求失败，请重试')
  } finally {
    createLoading.value = false
  }
}

// 上传相关方法
const handleUploadExcel = () => {
  uploadDialogVisible.value = true
}

const handleUploadSuccess = (result: any) => {
  console.log('上传成功:', result)
  ElMessage.success(`上传完成！成功 ${result.successCount} 条，失败 ${result.errorCount} 条`)
  uploadDialogVisible.value = false
  // 刷新列表
  getList()
}

const handleUploadError = (error: string) => {
  console.error('上传失败:', error)
  ElMessage.error('上传失败: ' + error)
}

// 监听新建对话框关闭，重置表单
watch(createDialogVisible, (newValue) => {
  if (!newValue) {
    // 对话框关闭时，重置表单数据和预填状态
    nextTick(() => {
      const resetData = {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        departmentName: '',
        employeeName: '',
        monthTarget: 0
      }
      Object.assign(createFormData.value, resetData)
    })
  }
})
</script>

<template>
  <div :class="prefixCls">
    <div :class="`${prefixCls}__search`" class="flex justify-between items-center mb-2">
      <div class="flex-1">
        <ElInput
          v-model="quickSearch"
          placeholder="搜索销售员..."
          @keyup.enter="handleSearch"
          style="max-width: 200px"
        >
          <template #prefix>
            <Icon icon="vi-ep:search" />
          </template>
        </ElInput>
      </div>

      <div class="items-center gap-3">
        <!-- 高级搜索 -->
        <ElButton type="primary" plain @click="drawerVisible = true" style="max-width: 100px">
          <Icon icon="vi-ep:filter" class="mr-2" />
          高级搜索
          <span
            v-if="getActiveAdvancedFilters() > 0"
            class="ml-1 px-1 bg-red-500 text-white text-xs rounded"
          >
            {{ getActiveAdvancedFilters() }}
          </span>
        </ElButton>

        <!-- 下载模板按钮 -->
        <ElButton @click="handleDownloadTemplate" style="max-width: 100px" :loading="downloading">
          <Icon icon="vi-ep:download" class="mr-2" />
          下载模板
        </ElButton>

        <!-- 批量删除按钮 -->
        <ElButton
          type="danger"
          plain
          :disabled="selectedRows.length === 0"
          @click="handleBatchDelete"
          style="max-width: 120px"
        >
          <Icon icon="vi-ep:delete" class="mr-2" />
          批量删除 ({{ selectedRows.length }})
        </ElButton>

        <!-- 新建按钮 -->
        <ElButton @click="handleCreateRequirement" style="max-width: 100px" type="primary">
          <Icon icon="vi-ep:plus" class="mr-2" />
          新建目标
        </ElButton>

        <!-- 上传Excel按钮 -->
        <ElButton @click="handleUploadExcel" style="max-width: 100px" type="warning">
          <Icon icon="vi-ep:upload-filled" class="mr-2" />
          上传Excel
        </ElButton>
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
          <SaleTargetTable
            :table-data="dataList"
            :table-type="props.tableType"
            :enable-selection="true"
            table-height="calc(100vh - 240px)"
            @selection-change="handleSelectionChange"
            @delete-click="handleDeleteClick"
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
            <span>总目标: {{ formatNumber(summaryData.targetSum, 0) }}</span>
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
        <ElForm :model="advancedSearchParams" label-width="80px" label-position="left">
          <ElFormItem label="年份">
            <ElInput v-model="advancedSearchParams.year" placeholder="请输入年份" clearable />
          </ElFormItem>

          <ElFormItem label="月份">
            <ElInput v-model="advancedSearchParams.month" placeholder="请输入月份" clearable />
          </ElFormItem>

          <ElFormItem label="部门">
            <ElInput
              v-model="advancedSearchParams.departmentName"
              placeholder="请输入部门"
              clearable
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

    <!-- 新建目标抽屉 -->
    <ElDrawer
      v-model="createDialogVisible"
      title="新建目标"
      size="400px"
      direction="rtl"
      class="attach-order-drawer"
    >
      <div class="p-4 h-full">
        <ElForm :model="createFormData" label-width="100px" label-position="left">
          <ElFormItem label="年份">
            <ElInput v-model="createFormData.year" placeholder="请输入年份" />
          </ElFormItem>

          <ElFormItem label="月份" required>
            <ElInput v-model="createFormData.month" placeholder="请输入月份" maxlength="2" />
          </ElFormItem>

          <ElFormItem label="部门" required>
            <ElInput v-model="createFormData.departmentName" placeholder="请输入部门" />
          </ElFormItem>

          <ElFormItem label="业务员" required>
            <ElInput v-model="createFormData.employeeName" placeholder="请输入业务员" />
          </ElFormItem>

          <ElFormItem label="目标金额" required>
            <ElInput
              v-model="createFormData.monthTarget"
              type="number"
              placeholder="请输入目标金额"
            />
          </ElFormItem>
        </ElForm>

        <ElDivider />

        <div class="flex justify-end gap-2">
          <ElButton @click="createDialogVisible = false">取消</ElButton>
          <ElButton type="primary" :loading="createLoading" @click="handleCreateSubmit">
            确认新建
          </ElButton>
        </div>
      </div>
    </ElDrawer>

    <!-- Excel上传对话框 -->
    <ResizeDialog
      v-model="uploadDialogVisible"
      title="上传Excel文件"
      :init-width="600"
      :init-height="400"
      :min-resize-width="600"
      :min-resize-height="400"
      @close="uploadDialogVisible = false"
    >
      <SaleTargetUpload
        @success="handleUploadSuccess"
        @error="handleUploadError"
        @close="uploadDialogVisible = false"
        @refresh="getList"
      />
    </ResizeDialog>
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
@prefix-cls: ~'@{adminNamespace}-sale-target';
</style>
