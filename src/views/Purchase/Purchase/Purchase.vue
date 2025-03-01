<script setup lang="ts">
import { ref, reactive, unref, h } from 'vue'
import {
  ElTable,
  ElTableColumn,
  ElPagination,
  ElCheckbox,
  ElSelect,
  ElOption,
  ElTag
} from 'element-plus'
import type { TableColumnCtx } from 'element-plus/es/components/table/src/table-column/defaults'
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/Search'
import { useTable } from '@/hooks/web/useTable'
import { getPurchaseOrderListApi, getPurchaseWipListApi } from '@/api/purchase'
import type { PurchaseOrder, PurchaseOrderQuery, PurchaseWip } from '@/api/purchase/type'
import { FormSchema } from '@/components/Form'
import { Table } from '@/components/Table'
import ResizeDialog from '@/components/Dialog/src/ResizeDialog.vue'

// 查询表单配置
const schema = reactive<FormSchema[]>([
  {
    field: 'doc_no',
    label: 'E10单据号',
    component: 'Input'
  },
  {
    field: 'item_code',
    label: '物料编码',
    component: 'Input'
  },
  {
    field: 'item_name',
    label: '物料名称',
    component: 'Input'
  },
  {
    field: 'supplier',
    label: '供应商',
    component: 'Input'
  },
  {
    field: 'receipt_close',
    label: '订单状态',
    component: 'Select',
    componentProps: {
      options: [
        { label: '全部', value: '' },
        { label: '已关闭', value: 1 },
        { label: '未关闭', value: 0 }
      ]
    }
  },
  {
    field: 'purchase_date_start',
    label: '采购日期',
    component: 'DatePicker',
    componentProps: {
      type: 'date',
      valueFormat: 'YYYY-MM-DD',
      placeholder: '起始于'
    }
  },
  {
    field: 'purchase_date_end',
    label: '采购日期',
    component: 'DatePicker',
    componentProps: {
      type: 'date',
      valueFormat: 'YYYY-MM-DD',
      placeholder: '结束于'
    }
  }
])

// 使用 table hook
const { tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getPurchaseOrderListApi({
      pageIndex: unref(currentPage),
      pageSize: unref(pageSize),
      ...searchParams.value
    })
    return {
      list: res.data.list,
      total: res.data.total
    }
  }
})

const { getList } = tableMethods
const { loading, dataList, total, currentPage, pageSize } = tableState

// 搜索参数
interface SearchParams extends PurchaseOrderQuery {
  enableSummary?: boolean
}

const searchParams = ref<SearchParams>({
  enableSummary: true // 设置初始值
})

// 搜索方法
const setSearchParams = (params: PurchaseOrderQuery) => {
  // 有查询参数时重置到第一页
  if (Object.keys(params).some((key) => params[key] !== undefined && params[key] !== '')) {
    currentPage.value = 1
  }
  searchParams.value = params
  getList()
}

// 表格列配置接口
interface ColumnType extends Partial<TableColumnCtx<PurchaseOrder>> {
  hidden?: boolean // 是否隐藏列
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
    width: 100,
    align: 'center' as const,
    headerAlign: 'center' as const
  },
  {
    label: '状态',
    field: 'status',
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
    label: '预计交期',
    field: 'forecastDate',
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
const columns = ref<ColumnType[]>([
  {
    type: 'selection',
    width: 50,
    align: 'center',
    fixed: 'left'
  },
  { label: '序号', type: 'index', align: 'center', width: 60, headerAlign: 'center' },
  { label: 'E10单据号', prop: 'DOC_NO', align: 'center', showOverflowTooltip: true, hidden: true },
  { label: '订单号', prop: 'REMARK', align: 'center', width: 120 },
  { label: '物料编码', prop: 'ITEM_CODE', align: 'center', width: 180 },
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
      const className = row.WIP_QTY > 0 ? 'cursor-pointer text-primary' : ''
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
  { label: '供应商', prop: 'SUPPLIER_FULL_NAME', align: 'center' }
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
</script>

<template>
  <ContentWrap>
    <!-- 搜索表单 -->
    <Search :schema="schema" @search="setSearchParams" @reset="setSearchParams" />

    <!-- 表格 -->
    <div class="mt-4">
      <ElTable
        v-loading="loading"
        :data="dataList"
        border
        class="w-full"
        :row-class-name="tableRowClassName"
        header-cell-class-name="table-header"
        @selection-change="handleSelectionChange"
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
      <!-- 分页 -->
      <div class="flex justify-left mt-4">
        <ElPagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="getList"
          @current-change="getList"
        />
      </div>

      <!-- WIP 详情弹窗 -->
      <ResizeDialog v-model="dialogVisible" title="在制明细" :max-height="700">
        <Table
          v-loading="wipTableState.loading"
          :columns="wipColumns"
          :data="wipTableState.list"
          :pagination="{
            total: wipTableState.total,
            pageSize: wipTableState.pageSize,
            currentPage: wipTableState.currentPage
          }"
          @update:current-page="
            (page) => {
              wipTableState.currentPage = page
              getWipList()
            }
          "
        />
      </ResizeDialog>
    </div>
  </ContentWrap>
</template>

<style lang="less" scoped>
:deep(.table-header) {
  font-size: 16px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  text-align: center !important;
  background-color: #f0f7ff !important;
}

:deep(.success-row) {
  background-color: var(--el-color-success-light-9);
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
</style>
