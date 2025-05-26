<script setup lang="ts">
import { ref, reactive, h, watch, onBeforeUnmount, onMounted } from 'vue'
import {
  ElTable,
  ElTableColumn,
  ElPagination,
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
  ElDescriptionsItem,
  ElSkeleton
} from 'element-plus'
import type { AxiosResponse } from '@/axios/types'
import { getAssyListApi, getAssyWipApi, exportAssyListApi, getAssyBomApi } from '@/api/assy'
import type { AssyOrder, AssyOrderQuery, AssyWip, AssyBom } from '@/api/assy/type'
import { Table } from '@/components/Table'
import { Dialog } from '@/components/Dialog'
import { Icon } from '@/components/Icon'

// 定义组件名称（用于keep-alive缓存）
defineOptions({
  name: 'AssyTable'
})

// 表格列配置类型
interface TableColumn {
  type?: 'selection' | 'expand'
  label?: string
  prop?: string
  width?: number
  align?: 'left' | 'center' | 'right'
  fixed?: 'left' | 'right'
  showOverflowTooltip?: boolean
  formatter?: (row: AssyOrder) => any
  hidden?: boolean
  slots?: {
    default?: (scope: any) => any
  }
}

// 折叠状态
const isCollapse = ref(true)

// 表格列配置
const columns: TableColumn[] = [
  {
    type: 'selection',
    width: 50,
    align: 'center',
    fixed: 'left'
  },
  {
    type: 'expand',
    width: 50,
    align: 'center',
    fixed: 'left'
  },
  {
    label: '订单号',
    prop: 'DOC_NO',
    align: 'center',
    width: 150,
    showOverflowTooltip: true
  },
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
  {
    label: '打印批号',
    prop: 'LOT_CODE',
    align: 'center',
    width: 160,
    showOverflowTooltip: true
  },
  {
    label: '业务数量',
    prop: 'BUSINESS_QTY',
    align: 'center',
    width: 100
  },
  {
    label: '收货数量',
    prop: 'RECEIPTED_PRICE_QTY',
    align: 'center',
    width: 100
  },
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
  {
    label: '加工方式',
    prop: 'Z_PROCESSING_PURPOSE_NAME',
    align: 'center',
    width: 130
  },
  {
    label: '成测程序',
    prop: 'Z_TESTING_PROGRAM_NAME',
    align: 'center',
    width: 130
  },
  {
    label: '打线图号',
    prop: 'Z_ASSEMBLY_CODE',
    align: 'center',
    width: 120,
    showOverflowTooltip: true
  },
  {
    label: '线材',
    prop: 'Z_WIRE_NAME',
    align: 'center',
    width: 130
  },
  {
    label: '备注',
    prop: 'REMARK',
    align: 'center',
    width: 120,
    showOverflowTooltip: true
  },
  {
    label: '订单日期',
    prop: 'PURCHASE_DATE',
    align: 'center',
    width: 120
  },
  {
    label: '到货日期',
    prop: 'FIRST_ARRIVAL_DATE',
    align: 'center',
    width: 120
  },
  {
    label: '供应商',
    prop: 'SUPPLIER_FULL_NAME',
    align: 'left',
    width: 160,
    showOverflowTooltip: true,
    fixed: 'right'
  }
]

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

// 表格数据
const dataList = ref<AssyOrder[]>([])
const loading = ref(false)
const total = ref(0)

// 分页相关
const currentPage = ref(1)
const pageSize = ref(50)

// 获取数据
const getList = async () => {
  try {
    loading.value = true
    const res = await getAssyListApi({
      ...searchParams,
      pageIndex: currentPage.value,
      pageSize: pageSize.value
    })
    dataList.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error('获取数据失败:', error)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索方法
const handleSearch = () => {
  currentPage.value = 1
  getList()
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

// 选择项
const selection = ref<AssyOrder[]>([])

// 选择变化
const handleSelectionChange = (val: AssyOrder[]) => {
  selection.value = val
}

// 计算合计
const getSummaries = () => {
  const sums = {
    BUSINESS_QTY: 0,
    RECEIPTED_PRICE_QTY: 0,
    WIP_QTY: 0
  }
  selection.value.forEach((item) => {
    sums.BUSINESS_QTY += Number(item.BUSINESS_QTY || 0)
    sums.RECEIPTED_PRICE_QTY += Number(item.RECEIPTED_PRICE_QTY || 0)
    sums.WIP_QTY += Number(item.WIP_QTY || 0)
  })
  return sums
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

// 行样式方法
const tableRowClassName = ({ row }: { row: AssyOrder }) => {
  if (row.RECEIPT_CLOSE === 1 || row.RECEIPT_CLOSE === 2) {
    return 'success-row'
  }
  return ''
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
    // 显示导出进度提示
    const loadingInstance = ElMessage({
      type: 'info',
      message: '正在导出数据，请稍候...',
      duration: 0,
      showClose: true
    })

    const res = (await exportAssyListApi({
      ...searchParams
    })) as unknown as AxiosResponse

    // 关闭加载提示
    loadingInstance.close()

    // 检查响应数据
    if (!res.data) {
      throw new Error('导出数据为空')
    }

    // 创建blob对象
    const blob = new Blob([res.data], { type: 'application/vnd.ms-excel' })

    // 获取文件名
    const disposition = res.headers?.['content-disposition']
    let filename = `packageOrders_${new Date().toLocaleDateString()}.xlsx`

    if (disposition) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
      const matches = filenameRegex.exec(disposition)
      if (matches?.[1]) {
        filename = decodeURIComponent(matches[1].replace(/['"]/g, ''))
      }
    }

    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()

    // 清理
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error(error instanceof Error ? error.message : '导出失败，请稍后重试')
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

// 初始化
onMounted(() => {
  getList()
})

// 组件卸载前清理
onBeforeUnmount(() => {
  // 清理展开行数据
  expandedRows.value = {}
  loadingRows.value = {}
  // 清理选择项
  selection.value = []
})
</script>

<template>
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
                style="width: 100%"
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
                style="width: 100%"
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
          <span class="collapse-text">{{ isCollapse ? '更多查询' : '收起' }}</span>
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
      @expand-change="handleExpandChange"
      row-key="DOC_NO"
      height="calc(100vh - 280px)"
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
      <div class="summary-content">
        <div class="summary-left">
          <span class="summary-item">
            已选择: <span class="summary-value">{{ selection.length }}</span> 项
          </span>
          <span class="summary-item">
            业务数量合计: <span class="summary-value">{{ getSummaries().BUSINESS_QTY }}</span>
          </span>
          <span class="summary-item">
            收货数量合计:
            <span class="summary-value">{{ getSummaries().RECEIPTED_PRICE_QTY }}</span>
          </span>
          <span class="summary-item">
            在制数量合计: <span class="summary-value">{{ getSummaries().WIP_QTY }}</span>
          </span>
        </div>
      </div>
    </div>
  </div>

  <!-- WIP 详情弹窗 -->
  <Dialog v-model="dialogVisible" title="在制明细" width="1000px">
    <Table v-loading="wipTableState.loading" :columns="wipColumns" :data="wipTableState.list" />
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

.table-wrapper {
  overflow: hidden;
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  flex: 1;
}

:deep(.el-table-v2__cell) {
  border-right: 1px solid var(--el-border-color-light);
  border-bottom: 1px solid var(--el-border-color-light);
}

.table-summary {
  display: flex;
  padding: 8px 12px;
  background-color: var(--el-color-primary-light-9);
  border: 1px solid var(--el-border-color-light);
  border-bottom: none;
  align-items: center;
  border-radius: 4px 4px 0 0;

  .summary-content {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
  }

  .summary-left {
    display: flex;
    gap: 32px;
    align-items: center;
  }

  .summary-item {
    display: flex;
    font-size: 13px;
    color: var(--el-text-color-regular);
    align-items: center;
    gap: 4px;

    .summary-value {
      font-weight: 600;
      color: var(--el-color-primary);
    }
  }

  .sort-form {
    display: inline-flex;
    align-items: center;
    gap: 8px;

    :deep(.el-select) {
      width: 120px;
    }
  }
}

.search-form {
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

.summary-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.summary-left {
  display: flex;
  gap: 32px;
  align-items: center;
}

.summary-item {
  display: flex;
  font-size: 13px;
  color: var(--el-text-color-regular);
  align-items: center;
  gap: 4px;

  .summary-value {
    font-weight: 600;
    color: var(--el-color-primary);
  }
}

.sort-form {
  display: inline-flex;
  align-items: center;
  gap: 8px;

  :deep(.el-select) {
    width: 120px;
  }
}

.custom-header {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 4px;
}

.header-row {
  display: flex;
  min-height: 20px;
  padding: 1px;
  align-items: center;
  justify-content: center;

  span {
    font-size: 13px;
    font-weight: 600;
    line-height: 1.2;
    color: var(--el-text-color-primary);
  }
}

.filter-row {
  width: 100%;
  padding: 0 2px 1px;

  .filter-input {
    width: 100%;

    :deep(.el-input__inner) {
      height: 22px;
      padding: 0 8px;
      font-size: 12px;
      line-height: 22px;
    }
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
