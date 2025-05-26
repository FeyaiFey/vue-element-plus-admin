<script setup lang="ts">
import { ref, reactive, h, onMounted, watch } from 'vue'
import {
  ElTable,
  ElTableColumn,
  ElPagination,
  ElCheckbox,
  ElSelect,
  ElOption,
  ElTag,
  ElForm,
  ElFormItem,
  ElInput,
  ElDatePicker,
  ElRow,
  ElCol,
  ElCollapseTransition,
  ElButton,
  ElMessage,
  ElSkeleton
} from 'element-plus'
import {
  getPurchaseOrderListApi,
  getPurchaseWipListApi,
  getPurchaseSupplierListApi
} from '@/api/purchase'
import type {
  PurchaseOrder,
  PurchaseOrderQuery,
  PurchaseWip,
  PurchaseSupplierResponse
} from '@/api/purchase/type'
import { Table } from '@/components/Table'
import { Dialog } from '@/components/Dialog'
import type { FormInstance } from 'element-plus'
import { Icon } from '@/components/Icon'

defineOptions({
  name: 'PurchaseTable'
})

// 供应商列表
const supplierList = ref<PurchaseSupplierResponse[]>([])
const supplierLoading = ref(false)

// 获取供应商列表
const getSupplierList = async () => {
  supplierLoading.value = true
  try {
    const res = await getPurchaseSupplierListApi()
    if (res.code === 200) {
      supplierList.value = res.data
    }
  } catch (error) {
    console.error('获取供应商列表失败:', error)
  } finally {
    supplierLoading.value = false
  }
}

// 在组件挂载时获取供应商列表
onMounted(() => {
  getSupplierList()
  getList()
})

// 折叠状态
const isCollapse = ref(true)

// 表单引用
const formRef = ref<FormInstance>()

// 搜索参数
const searchParams = reactive<PurchaseOrderQuery>({
  item_name: '',
  supplier: '',
  receipt_close: undefined,
  purchase_date_start: undefined,
  purchase_date_end: undefined
})

// 日期范围
const dateRange = ref<[string, string] | undefined>(undefined)

// 监听日期范围变化
watch(dateRange, (newVal) => {
  if (newVal) {
    searchParams.purchase_date_start = newVal[0]
    searchParams.purchase_date_end = newVal[1]
  } else {
    searchParams.purchase_date_start = undefined
    searchParams.purchase_date_end = undefined
  }
})

// 搜索方法
const handleSearch = () => {
  currentPage.value = 1
  getList()
}

// 重置方法
const handleReset = () => {
  formRef.value?.resetFields()
  // 设置所有参数为空
  searchParams.item_name = ''
  searchParams.supplier = ''
  searchParams.receipt_close = undefined
  searchParams.purchase_date_start = undefined
  searchParams.purchase_date_end = undefined
  // 清空日期范围
  dateRange.value = undefined
  handleSearch()
}

// 移除 useTable，改用直接的数据获取方式
const loading = ref(false)
const dataList = ref<PurchaseOrder[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(50)

// 获取列表数据
const getList = async () => {
  try {
    loading.value = true
    const res = await getPurchaseOrderListApi({
      pageIndex: currentPage.value,
      pageSize: pageSize.value,
      ...searchParams
    })
    dataList.value = res.data.list || []
    total.value = res.data.total || 0
  } catch (error) {
    console.error('获取数据失败:', error)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 处理分页变化
const handlePageChange = (page: number) => {
  currentPage.value = page
  getList()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  getList()
}

// 表格列配置接口
interface TableColumn {
  type?: 'selection' | 'expand'
  label?: string
  prop?: string
  width?: number
  align?: 'left' | 'center' | 'right'
  fixed?: 'left' | 'right'
  headerAlign?: 'left' | 'center' | 'right'
  showOverflowTooltip?: boolean
  formatter?: (row: PurchaseOrder) => any
  hidden?: boolean
  slots?: {
    default?: (scope: any) => any
  }
}

// Dialog 相关状态
const dialogVisible = ref(false)
const currentOrderNo = ref('')

// WIP 表格列配置
const wipColumns = [
  {
    label: '订单号',
    field: 'purchaseOrder',
    width: 100,
    align: 'center' as const,
    headerAlign: 'center' as const
  },
  {
    label: '预计交期',
    field: 'forecastDate',
    width: 120,
    align: 'center' as const,
    headerAlign: 'center' as const
  },
  {
    label: '晶圆名称',
    field: 'itemName',
    width: 120,
    align: 'center' as const,
    headerAlign: 'center' as const
  },
  {
    label: '批次',
    field: 'lot',
    width: 120,
    align: 'center' as const,
    headerAlign: 'center' as const
  },
  {
    label: '数量',
    field: 'qty',
    prop: 'qty',
    width: 100,
    align: 'center' as const,
    headerAlign: 'center' as const
  },
  {
    label: '状态',
    field: 'status',
    width: 120,
    align: 'center' as const,
    headerAlign: 'center' as const,
    slots: {
      default: ({ row }) =>
        h(ElTag, { type: getStatusType(row.status), class: 'status-tag' }, () => row.status || '-')
    }
  },
  {
    label: '当前阶段',
    field: 'stage',
    width: 150,
    align: 'center' as const,
    headerAlign: 'center' as const
  },
  {
    label: '光刻层数',
    field: 'layerCount',
    width: 120,
    align: 'center' as const,
    headerAlign: 'center' as const
  },
  {
    label: '剩余层数',
    field: 'remainLayerCount',
    width: 120,
    align: 'center' as const,
    headerAlign: 'center' as const
  }
]

// WIP 表格数据
const wipTableState = reactive({
  loading: false,
  list: [] as PurchaseWip[],
  total: 0,
  pageSize: 100,
  currentPage: 1
})

// 获取 WIP 数据
const getWipList = async () => {
  try {
    wipTableState.loading = true
    const res = await getPurchaseWipListApi({
      purchase_order: currentOrderNo.value,
      is_finished: 0,
      pageSize: wipTableState.pageSize,
      pageIndex: wipTableState.currentPage
    })
    wipTableState.list = res.data.list
    wipTableState.total = res.data.total
  } catch (error) {
    console.error('获取WIP数据失败:', error)
  } finally {
    wipTableState.loading = false
  }
}

// 处理在制数量点击
const handleWipClick = (row: PurchaseOrder) => {
  if (row.WIP_QTY > 0) {
    currentOrderNo.value = row.REMARK
    dialogVisible.value = true
    getWipList()
  }
}

// 表格列配置
const columns = ref<TableColumn[]>([
  {
    type: 'selection',
    width: 50,
    align: 'center',
    fixed: 'left'
  },
  { label: 'E10单据号', prop: 'DOC_NO', align: 'center', showOverflowTooltip: true, hidden: true },
  { label: '订单号', prop: 'REMARK', align: 'center', width: 120 },
  { label: '物料编码', prop: 'ITEM_CODE', align: 'center', hidden: true },
  { label: '物料名称', prop: 'ITEM_NAME', align: 'center' },
  { label: '采购数量', prop: 'BUSINESS_QTY', align: 'center', width: 120 },
  { label: '第二数量', prop: 'SECOND_QTY', align: 'center', hidden: true },
  { label: '收货数量', prop: 'RECEIPTED_BUSINESS_QTY', align: 'center', width: 120 },
  {
    label: '在制数量',
    prop: 'WIP_QTY',
    align: 'center',
    width: 120,
    formatter: (row: PurchaseOrder) => {
      const className = row.WIP_QTY > 0 ? 'wip-clickable' : ''
      return h(
        'span',
        {
          class: className,
          onClick: () => handleWipClick(row)
        },
        row.WIP_QTY
      )
    }
  },
  {
    label: '单价',
    prop: 'PRICE',
    align: 'right',
    headerAlign: 'center',
    width: 120,
    formatter: (row: PurchaseOrder) => {
      return `￥${Number(row.PRICE || 0).toFixed(2)}`
    }
  },
  {
    label: '金额',
    prop: 'AMOUNT',
    align: 'right',
    headerAlign: 'center',
    width: 140,
    formatter: (row: PurchaseOrder) => {
      return `￥${Number(row.AMOUNT || 0).toFixed(2)}`
    }
  },
  { label: '订单状态', prop: 'RECEIPT_CLOSE', align: 'center', hidden: true },
  { label: '采购日期', prop: 'PURCHASE_DATE', align: 'center', width: 120 },
  { label: '供应商', prop: 'SUPPLIER_FULL_NAME', align: 'center', showOverflowTooltip: true }
])

// 行样式方法
const tableRowClassName = ({ row }: { row: PurchaseOrder }) => {
  if (row.RECEIPT_CLOSE === 1 || row.RECEIPT_CLOSE === 2) {
    return 'success-row'
  }
  return ''
}

// 选择项
const selection = ref<PurchaseOrder[]>([])

// 选择变化
const handleSelectionChange = (val: PurchaseOrder[]) => {
  selection.value = val
}

// 汇总计算方式
const calculationTypes = {
  SUM: 'sum',
  AVERAGE: 'average'
}

// 可选的汇总字段
const summaryFields = ref([
  {
    label: '采购数量',
    field: 'BUSINESS_QTY',
    checked: true,
    calculationType: calculationTypes.SUM
  },
  {
    label: '收货数量',
    field: 'RECEIPTED_BUSINESS_QTY',
    checked: false,
    calculationType: calculationTypes.SUM
  },
  {
    label: '在制数量',
    field: 'WIP_QTY',
    checked: false,
    calculationType: calculationTypes.SUM
  },
  {
    label: '单价',
    field: 'PRICE',
    checked: true,
    calculationType: calculationTypes.AVERAGE
  },
  {
    label: '金额',
    field: 'AMOUNT',
    checked: true,
    calculationType: calculationTypes.SUM
  }
])

// 计算合计
const getSummaries = () => {
  const sums: { [key: string]: number } = {}

  summaryFields.value
    .filter((field) => field.checked)
    .forEach((field) => {
      const values = selection.value.map((item) => Number(item[field.field] || 0))
      if (field.calculationType === calculationTypes.AVERAGE) {
        sums[field.field] = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0
      } else {
        sums[field.field] = values.reduce((a, b) => a + b, 0)
      }
    })
  return sums
}

// 格式化数字（用于合计行）
const formatNumber = (value: number, field: string) => {
  switch (field) {
    case 'PRICE':
    case 'AMOUNT':
      return `￥${value.toFixed(2)}`
    case 'BUSINESS_QTY':
      return Math.round(value) // 采购数量取整
    default:
      return value.toFixed(2) // 其他数值保留两位小数
  }
}

// 获取状态标签类型
const getStatusType = (status: string): 'info' | 'danger' | 'primary' | 'success' => {
  if (!status) return 'info'
  const upperStatus = status.toUpperCase()
  if (status === '已完结') return 'info'
  if (upperStatus.includes('HOLD')) return 'danger'
  if (upperStatus === 'STOCK') return 'primary'
  return 'success'
}

// 添加合计行计算方法
const getSummaryMethod = (param: { columns: any[]; data: any[] }) => {
  const { columns, data } = param
  const sums: string[] = []

  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = '合计'
      return
    }

    // 只计算 qty 列的合计
    if (column.property === 'qty') {
      const values = data.map((item) => Number(item.qty || 0))
      const total = values.reduce((prev, curr) => prev + curr, 0)
      sums[index] = `${Math.round(total)}`
    } else {
      sums[index] = ''
    }
  })

  return sums
}
</script>

<template>
  <!-- 搜索表单 -->
  <ElForm ref="formRef" :model="searchParams" label-width="100px" class="search-form">
    <ElRow :gutter="20">
      <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
        <ElFormItem label="物料名称">
          <ElInput
            v-model="searchParams.item_name"
            placeholder="请输入物料名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </ElFormItem>
      </ElCol>
      <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
        <ElFormItem label="供应商">
          <ElSelect
            v-model="searchParams.supplier"
            placeholder="请选择供应商"
            clearable
            filterable
            :loading="supplierLoading"
            @keyup.enter="handleSearch"
          >
            <ElOption
              v-for="item in supplierList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>
      </ElCol>
      <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
        <ElFormItem label="订单状态">
          <ElSelect v-model="searchParams.receipt_close" placeholder="请选择状态" clearable>
            <ElOption label="全部" value="" />
            <ElOption label="已关闭" :value="1" />
            <ElOption label="未关闭" :value="0" />
          </ElSelect>
        </ElFormItem>
      </ElCol>
    </ElRow>
    <ElCollapseTransition>
      <div v-show="!isCollapse">
        <ElRow :gutter="20">
          <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
            <ElFormItem label="采购日期">
              <ElDatePicker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                clearable
              />
            </ElFormItem>
          </ElCol>
        </ElRow>
      </div>
    </ElCollapseTransition>
    <ElRow>
      <ElCol :span="24" class="search-buttons">
        <ElButton type="primary" @click="handleSearch">
          <Icon icon="vi-icon-park-outline:search" class="mr-2" />
          查询
        </ElButton>
        <ElButton @click="handleReset">重置</ElButton>
        <ElButton link class="collapse-button" @click="isCollapse = !isCollapse">
          <span class="collapse-text">{{ isCollapse ? '展开' : '收起' }}</span>
          <Icon
            :icon="isCollapse ? 'vi-ic:baseline-expand-more' : 'vi-ic:outline-expand-less'"
            :size="20"
            class="collapse-icon"
          />
        </ElButton>
      </ElCol>
    </ElRow>
  </ElForm>

  <!-- 表格区域 -->
  <div class="table-container">
    <ElSkeleton v-if="loading" :rows="20" animated class="table-skeleton" />
    <ElTable
      v-else
      v-loading="loading"
      :data="dataList"
      border
      class="w-full"
      :row-class-name="tableRowClassName"
      header-cell-class-name="table-header"
      @selection-change="handleSelectionChange"
      row-key="DOC_NO"
      height="calc(100vh - 280px)"
    >
      <template v-for="item in columns" :key="item.prop">
        <ElTableColumn v-bind="item" v-if="!item.hidden" />
      </template>

      <!-- 合计行 -->
      <template #append>
        <div v-if="selection.length > 0" class="summary-row">
          <div class="summary-header">
            <span class="summary-title">已选择 {{ selection.length }} 项</span>
            <div class="summary-fields">
              <div v-for="field in summaryFields" :key="field.field" class="field-config">
                <ElCheckbox v-model="field.checked" class="summary-checkbox">
                  {{ field.label }}
                </ElCheckbox>
                <ElSelect
                  v-if="field.checked"
                  v-model="field.calculationType"
                  size="small"
                  style="width: 90px"
                >
                  <ElOption label="求和" :value="calculationTypes.SUM" />
                  <ElOption label="平均" :value="calculationTypes.AVERAGE" />
                </ElSelect>
              </div>
            </div>
          </div>
          <div class="summary-content">
            <div
              v-for="field in summaryFields.filter((f) => f.checked)"
              :key="field.field"
              class="summary-item"
            >
              <span class="summary-label">
                {{ field.label }}
                ({{ field.calculationType === calculationTypes.AVERAGE ? '平均' : '合计' }}):
              </span>
              <span class="summary-value">
                {{ formatNumber(getSummaries()[field.field], field.field) }}
              </span>
            </div>
          </div>
        </div>
      </template>
    </ElTable>
  </div>

  <!-- 分页组件 -->
  <div class="pagination-wrapper">
    <div class="pagination-container">
      <ElPagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[50, 100, 200, 500]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>

  <!-- WIP 详情弹窗 -->
  <Dialog v-model="dialogVisible" title="在制明细" width="1000px">
    <Table
      v-loading="wipTableState.loading"
      :columns="wipColumns"
      :data="wipTableState.list"
      :pagination="{
        total: wipTableState.total,
        pageSize: wipTableState.pageSize,
        currentPage: wipTableState.currentPage
      }"
      :show-summary="true"
      sum-text="合计"
      :summary-method="getSummaryMethod"
      @update:current-page="
        (page) => {
          wipTableState.currentPage = page
          getWipList()
        }
      "
    />
  </Dialog>
</template>

<style lang="less" scoped>
.table-container {
  position: relative;
  width: 100%;
  min-height: calc(100vh - 280px);
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
}

.table-skeleton {
  height: 100%;
  padding: 20px;

  :deep(.el-skeleton__item) {
    height: 20px;
    margin-bottom: 16px;
  }
}

:deep(.table-header) {
  font-size: 16px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  text-align: center !important;
  background-color: var(--el-fill-color-light) !important;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

:deep(.success-row) {
  background-color: var(--el-color-success-light-9);
}

// 添加在制数量可点击样式
:deep(.wip-clickable) {
  color: var(--el-color-primary);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    color: var(--el-color-primary-dark-2);
    text-decoration: underline;
  }
}

.summary-row {
  padding: 8px 12px;
  background-color: var(--el-color-primary-light-9);
  border-top: 1px solid var(--el-border-color);
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 4px;
}

.summary-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  white-space: nowrap;
}

.summary-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.field-config {
  display: inline-flex;
  align-items: center;
  gap: 4px;

  :deep(.el-checkbox) {
    margin-right: 0;

    .el-checkbox__label {
      font-size: 12px;
    }
  }

  :deep(.el-select) {
    margin-left: 4px;
  }
}

.summary-content {
  display: flex;
  padding-top: 4px;
  margin-top: 4px;
  border-top: 1px dashed var(--el-border-color-lighter);
  flex-wrap: wrap;
  gap: 16px;
}

.summary-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;

  .summary-label {
    color: var(--el-text-color-secondary);
  }

  .summary-value {
    font-weight: 500;
    color: var(--el-color-primary);
  }
}

// 移除不需要的样式
.summary-checkbox,
.summary-label,
.summary-value {
  font-size: inherit;
}

.cursor-pointer {
  cursor: pointer;
}

.text-primary {
  color: var(--el-color-primary);
}

.search-form {
  border-radius: 4px;

  :deep(.el-row) {
    margin-bottom: 0;
  }

  :deep(.el-collapse-transition) {
    overflow: hidden;
    transition: 0.3s height ease-in-out;
  }

  .search-buttons {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-bottom: 16px;

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

.pagination-wrapper {
  position: relative;
  width: 100%;
  height: 60px;
}

.pagination-container {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  padding: 10px 20px;
  background-color: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-light);
  justify-content: space-between;
  align-items: center;
}
</style>
