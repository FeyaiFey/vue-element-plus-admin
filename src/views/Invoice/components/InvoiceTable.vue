<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import {
  ElMessage,
  ElTable,
  ElTableColumn,
  ElTag,
  ElInput,
  ElDatePicker,
  ElForm,
  ElFormItem,
  ElRow,
  ElCol,
  ElButton,
  ElPagination,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElCollapseTransition
} from 'element-plus'
import { getInvoicesApi } from '@/api/invoice'
import type { InvoiceSearchRequest, InvoiceResponse } from '@/api/invoice/type'
import { Icon } from '@/components/Icon'

interface Props {
  showQueryForm?: boolean
  showCreateButton?: boolean
  showUploadButton?: boolean
  showOperations?: boolean
  queryForm?: InvoiceSearchRequest
  dateRange?: [string, string] | undefined
}

const props = withDefaults(defineProps<Props>(), {
  showQueryForm: true,
  showCreateButton: true,
  showUploadButton: true,
  showOperations: true
})

const emit = defineEmits<{
  search: [queryData: InvoiceSearchRequest, dateRange: [string, string] | undefined]
  reset: []
  view: [row: any]
  edit: [row: any]
  create: []
  upload: []
  void: [row: any]
  activate: [row: any]
  delete: [row: any]
  'update:dateRange': [value: [string, string] | undefined]
}>()

// 折叠状态
const isCollapse = ref(true)

// 表格数据
const tableData = ref<InvoiceResponse[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(50)

// 选中的行数据
const selectedRows = ref<InvoiceResponse[]>([])

// 计算选中合计
const selectedSummary = computed(() => {
  const count = selectedRows.value.length
  const totalAmount = selectedRows.value.reduce((sum, row) => sum + (row.total_amount || 0), 0)
  const totalTax = selectedRows.value.reduce((sum, row) => sum + (row.total_tax || 0), 0)
  const totalAmountInNumbers = selectedRows.value.reduce(
    (sum, row) => sum + (row.total_amount_in_numbers || 0),
    0
  )

  return {
    count,
    totalAmount,
    totalTax,
    totalAmountInNumbers
  }
})

// 本地查询表单
const localQueryForm = reactive<
  InvoiceSearchRequest & { amount_min?: string | number; amount_max?: string | number }
>({
  invoice_number: '',
  buyer_name: '',
  seller_name: '',
  issue_date_start: '',
  issue_date_end: '',
  amount_min: undefined,
  amount_max: undefined
})

// 本地日期范围
const localDateRange = ref<[string, string] | undefined>(undefined)

// 计算属性：合并外部和内部的查询表单
const finalQueryForm = computed(() => {
  return { ...localQueryForm, ...props.queryForm }
})

// 计算属性：合并外部和内部的日期范围
const finalDateRange = computed({
  get: () => props.dateRange || localDateRange.value,
  set: (value) => {
    localDateRange.value = value
    emit('update:dateRange', value)
  }
})

// 获取发票列表
const getInvoiceList = async () => {
  try {
    loading.value = true
    const params = {
      skip: (currentPage.value - 1) * pageSize.value,
      limit: pageSize.value
    }
    const res = await getInvoicesApi(params)
    tableData.value = res.data || []
    // 这里可以根据实际API返回调整总数的获取方式
    total.value = res.data?.length || 0
  } catch (error) {
    console.error('获取发票列表失败:', error)
    ElMessage.error('获取发票列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1

  // 构建查询参数，包含日期范围处理
  const searchParams: InvoiceSearchRequest = { ...localQueryForm }
  if (finalDateRange.value) {
    searchParams.issue_date_start = finalDateRange.value[0]
    searchParams.issue_date_end = finalDateRange.value[1]
  }

  emit('search', searchParams, finalDateRange.value)
}

// 重置
const handleReset = () => {
  // 重置本地查询表单
  Object.assign(localQueryForm, {
    invoice_number: '',
    buyer_name: '',
    seller_name: '',
    issue_date_start: '',
    issue_date_end: '',
    amount_min: undefined,
    amount_max: undefined
  })

  // 重置日期范围
  finalDateRange.value = undefined

  // 重置分页
  currentPage.value = 1

  // 重置收起状态
  isCollapse.value = true

  // 触发重置事件，让父组件处理数据重新加载
  emit('reset')
}

// 分页改变
const handlePageChange = (page: number) => {
  currentPage.value = page
  getInvoiceList()
}

// 分页大小改变
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  getInvoiceList()
}

// 格式化金额
const formatAmount = (amount: number) => {
  return amount ? `¥${amount.toFixed(2)}` : '-'
}

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

// 获取状态标签类型
const getStatusType = (status: number) => {
  switch (status) {
    case 1:
      return 'success'
    case 0:
      return 'danger'
    default:
      return 'info'
  }
}

// 获取状态文本
const getStatusText = (status: number) => {
  switch (status) {
    case 0:
      return '作废'
    case 1:
      return '正常'
    default:
      return '未知'
  }
}

// 处理选择变化
const handleSelectionChange = (selection: InvoiceResponse[]) => {
  selectedRows.value = selection
}

// 暴露方法给父组件
defineExpose({
  getInvoiceList,
  updateTableData: (data: InvoiceResponse[], totalCount: number, page: number = 1) => {
    tableData.value = data
    total.value = totalCount
    currentPage.value = page
  },
  resetTable: () => {
    // 重置本地查询表单
    Object.assign(localQueryForm, {
      invoice_number: '',
      buyer_name: '',
      seller_name: '',
      issue_date_start: '',
      issue_date_end: '',
      amount_min: undefined,
      amount_max: undefined
    })

    // 重置日期范围
    finalDateRange.value = undefined

    // 重置分页
    currentPage.value = 1

    // 重置收起状态
    isCollapse.value = true

    // 清空选中状态
    selectedRows.value = []

    // 清空当前数据并重新获取
    tableData.value = []
    total.value = 0
    loading.value = true

    // 重新获取数据
    getInvoiceList()
  },
  tableData,
  total,
  currentPage
})
</script>

<template>
  <div class="invoice-table-container">
    <!-- 搜索表单 -->
    <div v-if="showQueryForm" class="search-form">
      <ElForm :model="finalQueryForm" label-width="100px">
        <ElRow :gutter="20">
          <ElCol :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <ElFormItem label="发票号码" prop="invoice_number">
              <ElInput
                v-model="localQueryForm.invoice_number"
                placeholder="请输入发票号码"
                clearable
                @keyup.enter="handleSearch"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <ElFormItem label="购买方名称" prop="buyer_name">
              <ElInput
                v-model="localQueryForm.buyer_name"
                placeholder="请输入购买方名称"
                clearable
                @keyup.enter="handleSearch"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <ElFormItem label="销售方名称" prop="seller_name">
              <ElInput
                v-model="localQueryForm.seller_name"
                placeholder="请输入销售方名称"
                clearable
                @keyup.enter="handleSearch"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <ElFormItem label="开票日期" prop="issue_date">
              <ElDatePicker
                v-model="finalDateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                clearable
                style="width: 100%"
                @keyup.enter="handleSearch"
              />
            </ElFormItem>
          </ElCol>
        </ElRow>

        <!-- 可折叠的更多查询条件 -->
        <ElCollapseTransition>
          <div v-show="!isCollapse">
            <ElRow :gutter="20">
              <ElCol :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
                <ElFormItem label="最小金额" prop="amount_min">
                  <ElInput
                    v-model="localQueryForm.amount_min"
                    placeholder="最小金额"
                    clearable
                    @keyup.enter="handleSearch"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
                <ElFormItem label="最大金额" prop="amount_max">
                  <ElInput
                    v-model="localQueryForm.amount_max"
                    placeholder="最大金额"
                    clearable
                    @keyup.enter="handleSearch"
                  />
                </ElFormItem>
              </ElCol>
            </ElRow>
          </div>
        </ElCollapseTransition>

        <!-- 操作按钮区域 -->
        <ElRow>
          <ElCol :span="24" class="search-buttons">
            <ElButton type="primary" @click="handleSearch">
              <Icon icon="vi-ep:search" class="mr-1" />
              搜索
            </ElButton>
            <ElButton @click="handleReset">
              <Icon icon="vi-ep:refresh" class="mr-1" />
              重置
            </ElButton>
            <ElButton v-if="showCreateButton" type="success" @click="emit('create')">
              <Icon icon="vi-ep:plus" class="mr-1" />
              新建发票
            </ElButton>
            <ElButton v-if="showUploadButton" type="warning" @click="emit('upload')">
              <Icon icon="vi-ep:upload" class="mr-1" />
              上传PDF
            </ElButton>
            <ElButton link class="collapse-button" @click="isCollapse = !isCollapse">
              <span class="collapse-text">{{ isCollapse ? '更多查询' : '收起' }}</span>
              <Icon
                :icon="isCollapse ? 'vi-ep:arrow-down' : 'vi-ep:arrow-up'"
                :size="16"
                class="collapse-icon"
              />
            </ElButton>
          </ElCol>
        </ElRow>
      </ElForm>
    </div>

    <!-- 表格 -->
    <ElTable
      v-loading="loading"
      :data="tableData"
      stripe
      border
      style="width: 100%"
      height="calc(100vh - 370px)"
      @selection-change="handleSelectionChange"
    >
      <!-- 选择列 -->
      <ElTableColumn type="selection" width="55" header-align="center" align="center" />

      <ElTableColumn prop="invoice_id" label="ID" width="80" header-align="center" align="center" />
      <ElTableColumn
        prop="invoice_number"
        label="发票号码"
        width="200"
        header-align="center"
        align="center"
      />
      <ElTableColumn
        prop="invoice_type"
        label="发票类型"
        width="250"
        header-align="center"
        align="center"
      />
      <ElTableColumn
        prop="seller_name"
        label="销售方"
        width="200"
        header-align="center"
        align="center"
        show-overflow-tooltip
      />
      <ElTableColumn
        prop="total_amount"
        label="金额"
        width="120"
        header-align="center"
        align="right"
      >
        <template #default="{ row }">
          {{ formatAmount(row.total_amount) }}
        </template>
      </ElTableColumn>
      <ElTableColumn prop="total_tax" label="税额" width="120" header-align="center" align="right">
        <template #default="{ row }">
          {{ formatAmount(row.total_tax) }}
        </template>
      </ElTableColumn>
      <ElTableColumn
        prop="total_amount_in_numbers"
        label="加税合计"
        width="120"
        header-align="center"
        align="right"
      >
        <template #default="{ row }">
          {{ formatAmount(row.total_amount_in_numbers) }}
        </template>
      </ElTableColumn>
      <ElTableColumn
        prop="issue_date"
        label="开票日期"
        width="120"
        header-align="center"
        align="center"
      >
        <template #default="{ row }">
          {{ formatDate(row.issue_date) }}
        </template>
      </ElTableColumn>
      <ElTableColumn
        prop="created_at"
        label="创建时间"
        width="120"
        header-align="center"
        align="center"
      >
        <template #default="{ row }">
          {{ formatDate(row.created_at) }}
        </template>
      </ElTableColumn>
      <ElTableColumn label="状态" width="100" header-align="center" align="center">
        <template #default="{ row }">
          <ElTag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn
        v-if="showOperations"
        label="操作"
        width="350"
        header-align="center"
        align="center"
        fixed="right"
      >
        <template #default="{ row }">
          <div class="operations-container">
            <ElButton
              type="primary"
              size="small"
              class="operation-btn view-btn"
              @click="emit('view', row)"
            >
              <Icon icon="vi-ep:view" class="mr-1" />
              查看
            </ElButton>

            <!-- 状态管理下拉菜单 -->
            <ElDropdown trigger="click" class="status-dropdown">
              <ElButton type="warning" size="small" class="operation-btn status-btn">
                <Icon icon="vi-ep:setting" class="mr-1" />
                状态管理
                <Icon icon="vi-ep:arrow-down" class="ml-1" />
              </ElButton>
              <template #dropdown>
                <ElDropdownMenu class="status-menu">
                  <ElDropdownItem class="dropdown-item edit-item" @click="emit('edit', row)">
                    <Icon icon="vi-ep:edit" class="mr-2" />
                    编辑信息
                  </ElDropdownItem>
                  <ElDropdownItem
                    v-if="row.status === 1"
                    class="dropdown-item void-item"
                    @click="emit('void', row)"
                    divided
                  >
                    <Icon icon="vi-ep:circle-close" class="mr-2" />
                    作废发票
                  </ElDropdownItem>
                  <ElDropdownItem
                    v-if="row.status === 0"
                    class="dropdown-item activate-item"
                    @click="emit('activate', row)"
                    divided
                  >
                    <Icon icon="vi-ep:circle-check" class="mr-2" />
                    激活发票
                  </ElDropdownItem>
                </ElDropdownMenu>
              </template>
            </ElDropdown>

            <ElButton
              type="danger"
              size="small"
              class="operation-btn delete-btn"
              @click="emit('delete', row)"
            >
              <Icon icon="vi-material-symbols:delete-outline" class="mr-1" />
              删除
            </ElButton>
          </div>
        </template>
      </ElTableColumn>
    </ElTable>

    <!-- 选中合计显示 -->
    <div v-if="selectedSummary.count > 0" class="selection-summary">
      <div class="summary-content">
        <span class="summary-label">已选中:</span>
        <span class="summary-count">{{ selectedSummary.count }} 条</span>
        <span class="summary-divider">|</span>
        <span class="summary-label">金额:</span>
        <span class="summary-amount">{{ formatAmount(selectedSummary.totalAmount) }}</span>
        <span class="summary-divider">|</span>
        <span class="summary-label">税额:</span>
        <span class="summary-amount">{{ formatAmount(selectedSummary.totalTax) }}</span>
        <span class="summary-divider">|</span>
        <span class="summary-label">价税合计:</span>
        <span class="summary-amount">{{ formatAmount(selectedSummary.totalAmountInNumbers) }}</span>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <ElPagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[20, 50, 100, 200]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style lang="less" scoped>
// 响应式设计
@media (width <= 768px) {
  .operations-container {
    flex-direction: column;
    gap: 4px;

    .operation-btn {
      width: 100%;
      padding: 4px 8px;
      font-size: 12px;
    }
  }
}

.invoice-table-container {
  display: flex;
  height: 100%;
  flex-direction: column;
}

.search-form {
  padding: 20px;
  margin-bottom: 20px;
  background-color: var(--el-bg-color);
  border-radius: 4px;

  // 响应式样式
  @media (width <= 768px) {
    padding: 15px;

    .search-buttons {
      .el-button {
        min-width: 100px;
        font-size: 12px;
      }

      .collapse-button {
        height: 28px;
        padding: 0 12px;

        .collapse-text {
          font-size: 13px;
        }
      }
    }
  }

  :deep(.el-row) {
    margin-bottom: 0;
  }

  .search-buttons {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-top: 16px;
    flex-wrap: wrap;

    .el-button {
      min-width: 120px;
    }

    .collapse-button {
      display: flex;
      height: 32px;
      min-width: auto;
      padding: 0 16px;
      transition: all 0.3s;
      align-items: center;
      gap: 4px;

      &:hover {
        opacity: 0.8;
      }

      .collapse-text {
        font-size: 14px;
        font-weight: 500;
        color: var(--el-color-primary);
      }

      .collapse-icon {
        color: var(--el-color-primary);
        transition: transform 0.3s;
      }
    }
  }
}

.pagination-container {
  display: flex;
  margin-top: 20px;
  justify-content: left;

  // 响应式分页
  @media (width <= 768px) {
    justify-content: center;

    :deep(.el-pagination) {
      .el-pagination__sizes {
        display: none;
      }

      .el-pagination__jump {
        display: none;
      }
    }
  }
}

// 表格响应式
:deep(.el-table) {
  @media (width <= 768px) {
    .el-table__header th,
    .el-table__body td {
      padding: 8px 4px;
      font-size: 12px;
    }
  }
}

.mx-2 {
  margin: 0 8px;
}

.mr-1 {
  margin-right: 4px;
}

.ml-1 {
  margin-left: 4px;
}

.mr-2 {
  margin-right: 8px;
}

// 操作列容器
.operations-container {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

// 操作按钮基础样式
.operation-btn {
  font-weight: 500;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 10%);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgb(0 0 0 / 15%);
  }

  &:active {
    transform: translateY(0);
  }
}

// 查看按钮
.view-btn {
  background: linear-gradient(135deg, #409eff, #5dade2);
  border: none;

  &:hover {
    background: linear-gradient(135deg, #5dade2, #409eff);
  }
}

// 状态管理按钮
.status-btn {
  background: linear-gradient(135deg, #e6a23c, #f39c12);
  border: none;

  &:hover {
    background: linear-gradient(135deg, #f39c12, #e6a23c);
  }
}

// 删除按钮
.delete-btn {
  background: linear-gradient(135deg, #f56c6c, #e74c3c);
  border: none;

  &:hover {
    background: linear-gradient(135deg, #e74c3c, #f56c6c);
  }
}

// 下拉菜单样式
.status-dropdown {
  .el-dropdown-menu {
    padding: 4px 0;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    box-shadow: 0 6px 16px rgb(0 0 0 / 12%);
  }
}

// 下拉菜单项样式
.dropdown-item {
  display: flex;
  padding: 8px 16px;
  margin: 2px 8px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  align-items: center;

  &:hover {
    background-color: var(--el-fill-color-light);
    transform: translateX(2px);
  }

  // 编辑项
  &.edit-item {
    color: var(--el-color-primary);

    &:hover {
      color: var(--el-color-primary-dark-2);
      background-color: rgb(64 158 255 / 10%);
    }
  }

  // 作废项
  &.void-item {
    color: var(--el-color-danger);

    &:hover {
      color: var(--el-color-danger-dark-2);
      background-color: rgb(245 108 108 / 10%);
    }
  }

  // 激活项
  &.activate-item {
    color: var(--el-color-success);

    &:hover {
      color: var(--el-color-success-dark-2);
      background-color: rgb(103 194 58 / 10%);
    }
  }
}

// 选中合计显示样式
.selection-summary {
  padding: 1px;
  margin-top: 2px;
  margin-bottom: 2px;
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 6%);

  @media (width <= 768px) {
    padding: 10px 15px;
    margin-bottom: 12px;

    .summary-content {
      flex-wrap: wrap;
      gap: 8px;
      font-size: 13px;
    }
  }

  .summary-content {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    font-weight: 500;

    .summary-label {
      color: var(--el-text-color-regular);
    }

    .summary-count {
      font-weight: 600;
      color: var(--el-color-primary);
    }

    .summary-amount {
      font-family: Consolas, Monaco, monospace;
      font-weight: 600;
      color: var(--el-color-success);
    }

    .summary-divider {
      margin: 0 4px;
      color: var(--el-text-color-placeholder);
    }
  }
}
</style>
