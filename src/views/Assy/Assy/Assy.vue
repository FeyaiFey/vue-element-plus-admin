<script setup lang="ts">
import { ref, reactive, unref, h, watch } from 'vue'
import {
  ElTable,
  ElTableColumn,
  ElPagination,
  ElCheckbox,
  ElSelect,
  ElOption,
  ElTag,
  ElForm,
  ElRow,
  ElCol,
  ElFormItem,
  ElInput,
  ElDatePicker,
  ElCollapseTransition,
  ElButton,
  ElMessage,
  ElDescriptions,
  ElDescriptionsItem
} from 'element-plus'
import type { TableColumnCtx } from 'element-plus/es/components/table/src/table-column/defaults'
import type { AxiosResponse } from '@/axios/types'
import { ContentWrap } from '@/components/ContentWrap'
import { useTable } from '@/hooks/web/useTable'
import { getAssyListApi, getAssyWipApi, exportAssyListApi, getAssyBomApi } from '@/api/assy'
import type { AssyOrder, AssyOrderQuery, AssyWip, AssyBom } from '@/api/assy/type'
import { Table } from '@/components/Table'
import { Dialog } from '@/components/Dialog'
import { Icon } from '@/components/Icon'

// 折叠状态
const isCollapse = ref(true)

// 表单引用
const formRef = ref<InstanceType<typeof ElForm>>()

// 搜索参数
const searchParams = reactive<AssyOrderQuery>({
  doc_no: '',
  item_code: '',
  supplier: '',
  package_type: '',
  is_closed: undefined,
  order_date_start: undefined,
  order_date_end: undefined
})

// 日期范围
const dateRange = ref<[string, string] | undefined>(undefined)

// 监听日期范围变化
watch(dateRange, (newVal) => {
  if (newVal) {
    searchParams.order_date_start = new Date(newVal[0])
    searchParams.order_date_end = new Date(newVal[1])
  } else {
    searchParams.order_date_start = undefined
    searchParams.order_date_end = undefined
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
  // 设置默认参数
  searchParams.doc_no = ''
  searchParams.item_code = ''
  searchParams.supplier = ''
  searchParams.package_type = ''
  searchParams.is_closed = undefined
  searchParams.order_date_start = undefined
  searchParams.order_date_end = undefined
  // 清空日期范围
  dateRange.value = undefined
  handleSearch()
}

// 使用 table hook
const { tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getAssyListApi({
      pageIndex: unref(currentPage),
      pageSize: unref(pageSize),
      ...searchParams
    })
    // 如果总数小于50，将pageSize设置为50
    if (res.data.total < 50) {
      tableState.pageSize.value = 50
    }
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

// 表格列配置接口
interface ColumnType extends Partial<TableColumnCtx<AssyOrder>> {
  hidden?: boolean // 是否隐藏列
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
      is_tr: undefined,
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
  if (row.WIP_QTY && row.WIP_QTY > 0 && row.DOC_NO) {
    currentOrderNo.value = row.DOC_NO
    dialogVisible.value = true
    getWipList()
  }
}

// 表格列配置
const columns = ref<ColumnType[]>([
  { label: '订单号', prop: 'DOC_NO', align: 'center', width: 150, showOverflowTooltip: true },
  {
    label: '物料编码',
    prop: 'ITEM_CODE',
    align: 'center',
    width: 260
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
      const wipClassName = row.WIP_QTY && row.WIP_QTY > 0 ? 'wip-clickable' : ''
      return h(
        'span',
        {
          class: wipClassName,
          onClick: () => handleWipClick(row)
        },
        row.WIP_QTY || 0
      )
    }
  },
  { label: '加工方式', prop: 'Z_PROCESSING_PURPOSE_NAME', align: 'center', width: 130 },
  { label: '成测程序', prop: 'Z_TESTING_PROGRAM_NAME', align: 'center', width: 130 },
  {
    label: '打线图号',
    prop: 'Z_ASSEMBLY_CODE',
    align: 'center',
    width: 120,
    showOverflowTooltip: true
  },
  { label: '线材', prop: 'Z_WIRE_NAME', align: 'center', width: 130 },
  { label: '备注', prop: 'REMARK', align: 'center', width: 120, showOverflowTooltip: true },
  { label: '订单日期', prop: 'PURCHASE_DATE', align: 'center', width: 120 },
  { label: '到货日期', prop: 'FIRST_ARRIVAL_DATE', align: 'center', width: 120 },
  {
    label: '供应商',
    prop: 'SUPPLIER_FULL_NAME',
    align: 'left',
    width: 160,
    showOverflowTooltip: true,
    fixed: 'right'
  },
  { label: '订单状态', prop: 'RECEIPT_CLOSE', align: 'center', hidden: true }
])

// 行样式方法
const tableRowClassName = ({ row }: { row: AssyOrder }) => {
  if (row.RECEIPT_CLOSE === 1 || row.RECEIPT_CLOSE === 2) {
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
const formatNumber = (value: number, calculationType: string) => {
  if (calculationType === calculationTypes.AVERAGE) {
    return value.toFixed(2) // 求平均保留两位小数
  }
  return Math.round(value) // 求和取整
}

// 获取状态标签类型
const getCurrentProcessType = (
  CURRENT_PROCESS: string
): 'info' | 'danger' | 'primary' | 'success' => {
  if (!CURRENT_PROCESS) return 'info'
  if (CURRENT_PROCESS === '已完成') return 'info'
  return 'success'
}

// 导出Excel
const handleExport = async () => {
  try {
    ElMessage.info('正在导出，请稍候...')
    const res = (await exportAssyListApi({
      ...searchParams
    })) as unknown as AxiosResponse
    // 如果是文件流，直接创建blob
    const blob = new Blob([res.data], { type: 'application/vnd.ms-excel' })
    const disposition = res.headers?.['content-disposition']
    let filename = `封装订单列表_${new Date().getTime()}.xlsx`
    if (disposition) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
      const matches = filenameRegex.exec(disposition)
      if (matches != null && matches[1]) {
        filename = decodeURIComponent(matches[1].replace(/['"]/g, ''))
      }
    }
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// 展开行数据
const expandedRows = ref<{ [key: string]: AssyBom[] }>({})
const loadingRows = ref<{ [key: string]: boolean }>({})

// 处理展开行
const handleExpandChange = async (row: AssyOrder, expanded: boolean) => {
  if (!expanded || !row.DOC_NO) return

  if (expandedRows.value[row.DOC_NO]) {
    return
  }

  try {
    loadingRows.value[row.DOC_NO] = true
    const res = await getAssyBomApi({
      doc_no: row.DOC_NO
    })
    // 对数据进行排序
    const sortedList = [...res.data.list].sort((a, b) => {
      const order = { U0: 0, U1: 1, U2: 2 }
      const aOrder = order[a.MAIN_CHIP] ?? 999
      const bOrder = order[b.MAIN_CHIP] ?? 999
      return aOrder - bOrder
    })
    expandedRows.value[row.DOC_NO] = sortedList
  } catch (error) {
    console.error('获取BOM数据失败:', error)
    ElMessage.error('获取BOM数据失败')
  } finally {
    loadingRows.value[row.DOC_NO] = false
  }
}
</script>

<template>
  <ContentWrap>
    <!-- 搜索表单 -->
    <ElForm ref="formRef" :model="searchParams" label-width="100px" class="search-form">
      <ElRow :gutter="20">
        <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
          <ElFormItem label="物料编码">
            <ElInput
              v-model="searchParams.item_code"
              placeholder="请输入物料编码"
              clearable
              @keyup.enter="handleSearch"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
          <ElFormItem label="打印批号">
            <ElInput
              v-model="searchParams.lot_code"
              placeholder="请输入打印批号"
              clearable
              @keyup.enter="handleSearch"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
          <ElFormItem label="封装类型">
            <ElInput
              v-model="searchParams.package_type"
              placeholder="请输入封装类型"
              clearable
              @keyup.enter="handleSearch"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElCollapseTransition>
        <div v-show="!isCollapse">
          <ElRow :gutter="20">
            <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
              <ElFormItem label="订单号">
                <ElInput
                  v-model="searchParams.doc_no"
                  placeholder="请输入订单号"
                  clearable
                  @keyup.enter="handleSearch"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
              <ElFormItem label="供应商">
                <ElInput
                  v-model="searchParams.supplier"
                  placeholder="请输入供应商"
                  clearable
                  @keyup.enter="handleSearch"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
              <ElFormItem label="订单状态">
                <ElSelect v-model="searchParams.is_closed" placeholder="请选择状态" clearable>
                  <ElOption label="全部" value="" />
                  <ElOption label="已结束" :value="1" />
                  <ElOption label="未结束" :value="0" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
              <ElFormItem label="订单日期">
                <ElDatePicker
                  v-model="searchParams.order_date_start"
                  type="date"
                  placeholder="起始于"
                  value-format="YYYY-MM-DD"
                  @keyup.enter="handleSearch"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
              <ElFormItem label="订单日期">
                <ElDatePicker
                  v-model="searchParams.order_date_end"
                  type="date"
                  placeholder="结束于"
                  value-format="YYYY-MM-DD"
                  @keyup.enter="handleSearch"
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
          <ElButton @click="handleExport">
            <Icon icon="vi-vscode-icons:file-type-excel" class="mr-2" />
            导出Excel
          </ElButton>
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
        @expand-change="handleExpandChange"
        row-key="DOC_NO"
      >
        <ElTableColumn type="selection" width="50" align="center" fixed="left" />
        <ElTableColumn type="expand" width="50" align="center" fixed="left">
          <template #default="props">
            <div v-loading="loadingRows[props.row.DOC_NO]" class="expanded-content">
              <div class="expanded-body">
                <template v-if="expandedRows[props.row.DOC_NO]?.length">
                  <div
                    v-for="(bom, index) in expandedRows[props.row.DOC_NO]"
                    :key="index"
                    class="bom-item"
                  >
                    <ElDescriptions :column="2" border size="small" class="bom-descriptions">
                      <ElDescriptionsItem label="主副芯片" label-class-name="label-style">
                        {{
                          bom.MAIN_CHIP === 'U0'
                            ? 'U0(A芯)'
                            : bom.MAIN_CHIP === 'U1'
                              ? 'U1(A芯)'
                              : bom.MAIN_CHIP === 'U2'
                                ? 'U2(B芯)'
                                : bom.MAIN_CHIP
                        }}
                      </ElDescriptionsItem>
                      <ElDescriptionsItem label="物料编码" label-class-name="label-style">
                        {{ bom.ITEM_CODE }}
                      </ElDescriptionsItem>
                      <ElDescriptionsItem label="物料名称" label-class-name="label-style">
                        {{ bom.ITEM_NAME }}
                      </ElDescriptionsItem>
                      <ElDescriptionsItem label="批号名称" label-class-name="label-style">
                        {{ bom.LOT_CODE_NAME }}
                      </ElDescriptionsItem>
                      <ElDescriptionsItem label="业务数量" label-class-name="label-style">
                        {{ bom.BUSINESS_QTY }}
                      </ElDescriptionsItem>
                      <ElDescriptionsItem label="第二数量" label-class-name="label-style">
                        {{ bom.SECOND_QTY }}
                      </ElDescriptionsItem>
                      <ElDescriptionsItem label="晶圆ID" label-class-name="label-style" :span="2">
                        {{ bom.WAFER_ID }}
                      </ElDescriptionsItem>
                    </ElDescriptions>
                  </div>
                </template>
                <div v-else class="empty-data">暂无BOM数据</div>
              </div>
            </div>
          </template>
        </ElTableColumn>
        <template v-for="item in columns" :key="item.prop">
          <ElTableColumn
            v-if="!item.hidden && item.type !== 'selection' && item.type !== 'expand'"
            v-bind="item"
          >
            <template v-if="item.slots?.default" #default="scope">
              {{ item.slots.default(scope) }}
            </template>
          </ElTableColumn>
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
                  {{ formatNumber(getSummaries()[field.field], field.calculationType) }}
                </span>
              </div>
            </div>
          </div>
        </template>
      </ElTable>
      <!-- 分页 -->
      <div v-if="total > 50" class="flex justify-left mt-4">
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
  padding: 12px 16px;
  background-color: var(--el-color-primary-light-9);
  border-top: 1px solid var(--el-border-color);
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}

.summary-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  white-space: nowrap;
}

.summary-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.field-config {
  display: inline-flex;
  align-items: center;
  gap: 8px;

  :deep(.el-checkbox) {
    margin-right: 0;

    .el-checkbox__label {
      font-size: 14px;
      font-weight: 500;
    }
  }

  :deep(.el-select) {
    margin-left: 4px;
  }
}

.summary-content {
  display: flex;
  padding-top: 8px;
  margin-top: 8px;
  border-top: 1px dashed var(--el-border-color-lighter);
  flex-wrap: wrap;
  gap: 24px;
}

.summary-item {
  display: inline-flex;
  padding: 4px 12px;
  font-size: 14px;
  background-color: var(--el-color-primary-light-8);
  border-radius: 4px;
  transition: all 0.3s;
  align-items: center;
  gap: 8px;

  &:hover {
    background-color: var(--el-color-primary-light-7);
  }

  .summary-label {
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  .summary-value {
    font-size: 16px;
    font-weight: 600;
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
  padding: 20px;
  margin-bottom: 20px;
  background-color: var(--el-bg-color);
  border-radius: 4px;

  :deep(.el-row) {
    margin-bottom: 0;
  }

  :deep(.el-date-editor.el-input) {
    width: 100%;
  }

  :deep(.el-collapse-transition) {
    overflow: hidden;
    transition: 0.3s height ease-in-out;
  }

  .search-buttons {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-top: 16px;

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

.expanded-content {
  padding: 16px;
  background-color: var(--el-bg-color-page);
}

.expanded-body {
  max-width: 800px;
  margin: 0;
}

.bom-item {
  margin-bottom: 16px;
  background-color: var(--el-bg-color);
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 5%);

  &:last-child {
    margin-bottom: 0;
  }
}

.bom-descriptions {
  :deep(.el-descriptions__body) {
    background-color: var(--el-bg-color);
  }

  :deep(.el-descriptions__label) {
    width: 120px;
    font-weight: bold;
    color: var(--el-color-primary);
    text-align: center;
    background-color: var(--el-color-primary-light-9);
  }

  :deep(.el-descriptions__content) {
    padding: 12px 16px;
    text-align: left;
  }
}

.empty-data {
  padding: 32px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  text-align: left;
}

:deep(.el-table__expand-icon) {
  margin-right: 0;
}
</style>
