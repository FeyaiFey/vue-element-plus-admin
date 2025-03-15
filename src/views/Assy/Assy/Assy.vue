<script setup lang="ts">
import { ref, reactive, unref, h } from 'vue'
import {
  ElTable,
  ElTableColumn,
  ElPagination,
  ElCheckbox,
  ElSelect,
  ElOption,
  ElTag,
  ElMessage
} from 'element-plus'
import type { TableColumnCtx } from 'element-plus/es/components/table/src/table-column/defaults'
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/Search'
import { useTable } from '@/hooks/web/useTable'
import {
  getAssyListApi,
  getAssyWipApi,
  getAssyOrderItemsApi,
  getAssyOrderPackageTypeApi,
  getAssyOrderSupplierApi
} from '@/api/assy'
import type { AssyOrder, AssyOrderQuery, AssyWip } from '@/api/assy/type'
import { FormSchema } from '@/components/Form'
import { Table } from '@/components/Table'
import { Dialog } from '@/components/Dialog'

// 物料编码选项
const itemCodeOptions = ref<Array<{ label: string; value: string }>>([])
const itemCodeLoading = ref(false)

// 远程搜索物料编码
const handleItemCodeSearch = async (query: string) => {
  if (!query) {
    itemCodeOptions.value = []
    return
  }

  itemCodeLoading.value = true
  try {
    const res = await getAssyOrderItemsApi({ item_code: query })
    itemCodeOptions.value = res.data.list
  } catch (error) {
    console.error('获取物料编码列表失败:', error)
    ElMessage.error('获取物料编码列表失败')
    itemCodeOptions.value = []
  } finally {
    itemCodeLoading.value = false
  }
}

// 供应商选项
const supplierOptions = ref<Array<{ label: string; value: string }>>([])
const supplierLoading = ref(false)

// 远程搜索供应商
const handleSupplierSearch = async (query: string) => {
  if (!query) {
    supplierOptions.value = []
    return
  }
  supplierLoading.value = true
  try {
    const res = await getAssyOrderSupplierApi({ supplier: query })
    supplierOptions.value = res.data.list
  } catch (error) {
    console.error('获取供应商列表失败:', error)
  } finally {
    supplierLoading.value = false
  }
}

// 封装类型选项
const packageTypeOptions = ref<Array<{ label: string; value: string }>>([])
const packageTypeLoading = ref(false)

// 远程搜索封装类型
const handlePackageTypeSearch = async (query: string) => {
  if (!query) {
    packageTypeOptions.value = []
    return
  }
  packageTypeLoading.value = true
  try {
    const res = await getAssyOrderPackageTypeApi({ package_type: query })
    packageTypeOptions.value = res.data.list
  } catch (error) {
    console.error('获取封装类型列表失败:', error)
  } finally {
    packageTypeLoading.value = false
  }
}

const formRef = ref()

// 查询表单配置
const schema = reactive<FormSchema[]>([
  {
    field: 'doc_no',
    label: '订单号',
    component: 'Input',
    componentProps: {
      placeholder: '请输入订单号',
      clearable: true,
      onKeyup: (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          // 获取表单数据
          formRef.value?.getFormData().then((formData) => {
            setSearchParams(formData)
          })
        }
      }
    },
    colProps: {
      xs: 24, // 在超小屏幕上占满整行
      sm: 24, // 在小屏幕上占满整行
      md: 12, // 在中等屏幕上占半行
      lg: 8, // 在大屏幕上占 1/3
      xl: 8 // 在超大屏幕上占 1/3
    }
  },
  {
    field: 'item_code',
    label: '物料编码',
    component: 'Select',
    componentProps: {
      placeholder: '请输入物料编码搜索',
      clearable: true,
      multiple: true,
      filterable: true,
      remote: true,
      reserveKeyword: true,
      loading: itemCodeLoading,
      remoteMethod: handleItemCodeSearch,
      options: itemCodeOptions,
      collapseTags: true,
      collapseTagsTooltip: true,
      onKeyup: (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          // 获取表单数据
          formRef.value?.getFormData().then((formData) => {
            setSearchParams(formData)
          })
        }
      }
    },
    colProps: {
      xs: 24, // 在超小屏幕上占满整行
      sm: 24, // 在小屏幕上占满整行
      md: 12, // 在中等屏幕上占半行
      lg: 8, // 在大屏幕上占 1/3
      xl: 8 // 在超大屏幕上占 1/3
    }
  },
  {
    field: 'supplier',
    label: '供应商',
    component: 'Select',
    componentProps: {
      placeholder: '请输入供应商搜索',
      clearable: true,
      multiple: true,
      filterable: true,
      remote: true,
      reserveKeyword: true,
      loading: supplierLoading,
      remoteMethod: handleSupplierSearch,
      options: supplierOptions,
      collapseTags: true,
      collapseTagsTooltip: true,
      onKeyup: (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          // 获取表单数据
          formRef.value?.getFormData().then((formData) => {
            setSearchParams(formData)
          })
        }
      }
    },
    colProps: {
      xs: 24, // 在超小屏幕上占满整行
      sm: 24, // 在小屏幕上占满整行
      md: 12, // 在中等屏幕上占半行
      lg: 8, // 在大屏幕上占 1/3
      xl: 8 // 在超大屏幕上占 1/3
    }
  },
  {
    field: 'package_type',
    label: '封装类型',
    component: 'Select',
    componentProps: {
      placeholder: '请输入封装类型搜索',
      clearable: true,
      multiple: true,
      filterable: true,
      remote: true,
      reserveKeyword: true,
      loading: packageTypeLoading,
      remoteMethod: handlePackageTypeSearch,
      options: packageTypeOptions,
      collapseTags: true,
      collapseTagsTooltip: true,
      onKeyup: (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          // 获取表单数据
          formRef.value?.getFormData().then((formData) => {
            setSearchParams(formData)
          })
        }
      }
    },
    colProps: {
      xs: 24, // 在超小屏幕上占满整行
      sm: 24, // 在小屏幕上占满整行
      md: 12, // 在中等屏幕上占半行
      lg: 8, // 在大屏幕上占 1/3
      xl: 8 // 在超大屏幕上占 1/3
    }
  },
  {
    field: 'is_closed',
    label: '订单状态',
    component: 'Select',
    componentProps: {
      options: [
        { label: '全部', value: '' },
        { label: '已结束', value: 1 },
        { label: '未结束', value: 0 }
      ],
      placeholder: '请选择状态',
      onKeyup: (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          // 获取表单数据
          formRef.value?.getFormData().then((formData) => {
            setSearchParams(formData)
          })
        }
      }
    },
    colProps: {
      xs: 24, // 在超小屏幕上占满整行
      sm: 24, // 在小屏幕上占满整行
      md: 12, // 在中等屏幕上占半行
      lg: 8, // 在大屏幕上占 1/3
      xl: 8 // 在超大屏幕上占 1/3
    }
  },
  {
    field: 'order_date_start',
    label: '订单日期',
    component: 'DatePicker',
    colProps: {
      xs: 24, // 在超小屏幕上占满整行
      sm: 24, // 在小屏幕上占满整行
      md: 12, // 在中等屏幕上占半行
      lg: 8, // 在大屏幕上占 1/3
      xl: 8 // 在超大屏幕上占 1/3
    },
    componentProps: {
      type: 'date',
      valueFormat: 'YYYY-MM-DD',
      placeholder: '起始于'
    }
  },
  {
    field: 'order_date_end',
    label: '订单日期',
    component: 'DatePicker',
    colProps: {
      xs: 24, // 在超小屏幕上占满整行
      sm: 24, // 在小屏幕上占满整行
      md: 12, // 在中等屏幕上占半行
      lg: 8, // 在大屏幕上占 1/3
      xl: 8 // 在超大屏幕上占 1/3
    },
    componentProps: {
      type: 'date',
      valueFormat: 'YYYY-MM-DD',
      placeholder: '结束于'
    }
  }
])

// 定义展开字段和展开状态
const is_closed = ref('is_closed')

// 使用 table hook
const { tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getAssyListApi({
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

// 修改初始pageSize
tableState.pageSize.value = 20

const { getList } = tableMethods
const { loading, dataList, total, currentPage, pageSize } = tableState

// 搜索参数
interface SearchParams extends AssyOrderQuery {
  enableSummary?: boolean
}

const searchParams = ref<SearchParams>({
  enableSummary: true // 设置初始值
})

// 搜索方法
const setSearchParams = (params: AssyOrderQuery) => {
  // 有查询参数时重置到第一页
  if (Object.keys(params).some((key) => params[key] !== undefined && params[key] !== '')) {
    currentPage.value = 1
  }
  searchParams.value = params
  getList()
}

// 表格列配置接口
interface ColumnType extends Partial<TableColumnCtx<AssyOrder>> {
  hidden?: boolean // 是否隐藏列
}

// Dialog 相关状态
const dialogVisible = ref(false)
const currentOrderNo = ref('')

// WIP 表格列配置
const wipColumns = [
  {
    label: '订单号',
    field: 'DOC_NO',
    width: 150,
    align: 'center' as const,
    headerAlign: 'center' as const
  },
  {
    label: '预计交期',
    field: 'EXPECTED_DELIVERY_DATE',
    width: 120,
    align: 'center' as const,
    headerAlign: 'center' as const
  },
  {
    label: '物料编码',
    field: 'ITEM_CODE',
    width: 250,
    showOverflowTooltip: true,
    align: 'center' as const,
    headerAlign: 'center' as const
  },
  {
    label: '当前工序',
    field: 'CURRENT_PROCESS',
    width: 150,
    align: 'center' as const,
    headerAlign: 'center' as const,
    slots: {
      default: ({ row }) =>
        h(
          ElTag,
          { type: getCurrentProcessType(row.CURRENT_PROCESS), class: 'status-tag' },
          () => row.CURRENT_PROCESS || '-'
        )
    }
  },
  {
    label: '在线合计',
    field: 'ONLINE_TOTAL',
    width: 120,
    align: 'center' as const,
    headerAlign: 'center' as const
  },
  {
    label: '明日预计',
    field: 'NEXT_DAY_EXPECTED',
    width: 120,
    align: 'center' as const,
    headerAlign: 'center' as const
  },
  {
    label: '三日预计',
    field: 'THREE_DAY_EXPECTED',
    width: 120,
    align: 'center' as const,
    headerAlign: 'center' as const
  },
  {
    label: '七日预计',
    field: 'SEVEN_DAY_EXPECTED',
    width: 120,
    align: 'center' as const,
    headerAlign: 'center' as const
  }
]

// WIP 表格数据
const wipTableState = reactive({
  loading: false,
  list: [] as AssyWip[],
  total: 0,
  pageSize: 100,
  currentPage: 1
})

// 获取 WIP 数据
const getWipList = async () => {
  try {
    wipTableState.loading = true
    const res = await getAssyWipApi({
      doc_no: currentOrderNo.value,
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
const handleWipClick = (row: AssyOrder) => {
  if (row.WIP_QTY > 0) {
    currentOrderNo.value = row.DOC_NO
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
  { label: '订单号', prop: 'DOC_NO', align: 'center', width: 150, showOverflowTooltip: true },
  {
    label: '物料编码',
    prop: 'ITEM_CODE',
    align: 'right',
    width: 300
  },
  {
    label: '封装形式',
    prop: 'Z_PACKAGE_TYPE_NAME',
    align: 'center',
    width: 100,
    showOverflowTooltip: true
  },
  { label: '打印批号', prop: 'LOT_CODE', align: 'center', width: 160, showOverflowTooltip: true },
  { label: '业务数量', prop: 'BUSINESS_QTY', align: 'center', width: 100 },
  { label: '收货数量', prop: 'RECEIPTED_PRICE_QTY', align: 'center', width: 100 },
  {
    label: '在制数量',
    prop: 'WIP_QTY',
    align: 'center',
    width: 120,
    formatter: (row: AssyOrder) => {
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
  { label: '单价', prop: 'PRICE', align: 'center', width: 120 },
  {
    label: '打线图号',
    prop: 'Z_ASSEMBLY_CODE',
    align: 'center',
    width: 120,
    showOverflowTooltip: true
  },
  { label: '加工方式', prop: 'Z_PROCESSING_PURPOSE_NAME', align: 'center', width: 130 },
  { label: '备注', prop: 'REMARK', align: 'center', width: 120, showOverflowTooltip: true },
  {
    label: '供应商',
    prop: 'SUPPLIER_FULL_NAME',
    align: 'left',
    width: 160,
    showOverflowTooltip: true,
    fixed: 'right'
  },
  { label: '订单日期', prop: 'PURCHASE_DATE', align: 'center', width: 120 },
  { label: '订单状态', prop: 'CLOSE', align: 'center', hidden: true }
])

// 行样式方法
const tableRowClassName = ({ row }: { row: AssyOrder }) => {
  if (row.CLOSE === 1 || row.CLOSE === 2) {
    return 'success-row'
  }
  return ''
}

// 选择项
const selection = ref<AssyOrder[]>([])

// 选择变化
const handleSelectionChange = (val: AssyOrder[]) => {
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
    label: '业务数量',
    field: 'BUSINESS_QTY',
    checked: true,
    calculationType: calculationTypes.SUM
  },
  {
    label: '收货数量',
    field: 'RECEIPTED_PRICE_QTY',
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
const getCurrentProcessType = (
  CURRENT_PROCESS: string
): 'info' | 'danger' | 'primary' | 'success' => {
  if (!CURRENT_PROCESS) return 'info'
  if (CURRENT_PROCESS === '已完成') return 'info'
  return 'success'
}
</script>

<template>
  <ContentWrap>
    <!-- 搜索表单 -->
    <Search
      ref="formRef"
      :schema="schema"
      @search="setSearchParams"
      @reset="setSearchParams"
      :is-col="true"
      :inline="false"
      label-width="100px"
      show-expand
      :expand-field="is_closed"
    />

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
      <Dialog v-model="dialogVisible" title="在制明细" width="1000px">
        <Table v-loading="wipTableState.loading" :columns="wipColumns" :data="wipTableState.list" />
      </Dialog>
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
</style>
