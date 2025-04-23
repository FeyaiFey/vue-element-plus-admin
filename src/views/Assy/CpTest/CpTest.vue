<script setup lang="tsx">
import { Icon } from '@/components/Icon'
import {
  ElTable,
  ElTableColumn,
  ElPagination,
  ElCheckbox,
  ElSelect,
  ElOption,
  ElForm,
  ElRow,
  ElCol,
  ElFormItem,
  ElInput,
  ElDatePicker,
  ElCollapseTransition,
  ElButton,
  ElMessage
} from 'element-plus'
import { getCpTestOrdersApi, exportCpTestOrdersApi } from '@/api/assy'
import { ref, reactive, onMounted, watch, unref } from 'vue'
import type { CpTestOrdersQuery, CpTestOrders } from '@/api/assy/type'
import { ContentWrap } from '@/components/ContentWrap'
import { useTable } from '@/hooks/web/useTable'
import { AxiosResponse } from 'axios'

// 定义表格列类型
interface TableColumn {
  type?: string
  label?: string
  prop?: string
  align?: string
  width?: number
  fixed?: string
  hidden?: boolean
  headerCellClassName?: string
  showOverflowTooltip?: boolean
  tooltipEffect?: string
}

// 折叠状态
const isCollapse = ref(true)

// 搜索参数
const searchParams = reactive<CpTestOrdersQuery>({
  item_code: '',
  item_name: '',
  lot_name: '',
  status: undefined,
  doc_date_start: undefined,
  doc_date_end: undefined,
  supplier: '',
  progress_name: '',
  testing_program_name: ''
})

// 日期范围
const dateRange = ref<[string, string] | undefined>(undefined)

// 监听日期范围变化
watch(dateRange, (newVal) => {
  if (newVal) {
    searchParams.doc_date_start = newVal[0]
    searchParams.doc_date_end = newVal[1]
  } else {
    searchParams.doc_date_start = undefined
    searchParams.doc_date_end = undefined
  }
})

// 搜索表单
const formRef = ref<InstanceType<typeof ElForm>>()

// 搜索方法
const handleSearch = () => {
  currentPage.value = 1
  getList()
}

// 重置方法
const handleReset = () => {
  formRef.value?.resetFields()
  searchParams.item_code = ''
  searchParams.item_name = ''
  searchParams.lot_name = ''
  searchParams.status = undefined
  searchParams.doc_date_start = undefined
  searchParams.doc_date_end = undefined
  searchParams.supplier = ''
  searchParams.progress_name = ''
  searchParams.testing_program_name = ''
  dateRange.value = undefined
  handleSearch()
}

// 使用 table hook
const { tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage, pageSize } = tableState
    const res = await getCpTestOrdersApi({
      pageIndex: unref(currentPage),
      pageSize: unref(pageSize),
      ...searchParams
    })
    return {
      list: res.data.list,
      total: res.data.total
    }
  }
})

const { getList } = tableMethods
const { loading, dataList, total, currentPage, pageSize } = tableState

// 表格列配置
const defaultColumns = ref<TableColumn[]>([
  {
    type: 'selection',
    width: 50,
    align: 'center',
    fixed: 'left',
    hidden: false,
    headerCellClassName: ''
  },
  { label: 'ID', prop: 'ID', align: 'center', width: 80, hidden: false, headerCellClassName: '' },
  {
    label: '品名',
    prop: 'ITEM_NAME',
    align: 'center',
    width: 160,
    hidden: false,
    headerCellClassName: ''
  },
  {
    label: '批号',
    prop: 'LOT_NAME',
    align: 'center',
    width: 160,
    hidden: false,
    headerCellClassName: ''
  },
  {
    label: '测试数量',
    prop: 'BUSINESS_QTY',
    align: 'center',
    width: 100,
    hidden: false,
    headerCellClassName: ''
  },
  {
    label: '完成数量',
    prop: 'RECEIPT_QTY',
    align: 'center',
    width: 100,
    hidden: false,
    headerCellClassName: ''
  },
  {
    label: '剩余数量',
    prop: 'WIP_QTY',
    align: 'center',
    width: 100,
    hidden: false,
    headerCellClassName: ''
  },
  {
    label: '测试流程',
    prop: 'PROGRESS_NAME',
    align: 'center',
    width: 260,
    hidden: false,
    headerCellClassName: ''
  },
  {
    label: '测试程序',
    prop: 'TESTING_PROGRAM_NAME',
    align: 'center',
    width: 260,
    hidden: false,
    headerCellClassName: ''
  },
  {
    label: '订单日期',
    prop: 'DOC_DATE',
    align: 'center',
    width: 120,
    hidden: false,
    headerCellClassName: ''
  },
  {
    label: '到货日期',
    prop: 'FIRST_ARRIVAL_DATE',
    align: 'center',
    width: 120,
    hidden: false,
    headerCellClassName: ''
  },
  {
    label: '供应商',
    prop: 'SUPPLIER',
    align: 'center',
    width: 160,
    showOverflowTooltip: true,
    tooltipEffect: 'light',
    fixed: 'right',
    hidden: false,
    headerCellClassName: ''
  }
])

// 修改初始pageSize
tableState.pageSize.value = 20

// 选择项
const selection = ref<CpTestOrders[]>([])

// 选择变化
const handleSelectionChange = (val: CpTestOrders[]) => {
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
    label: '测试数量',
    field: 'BUSINESS_QTY',
    checked: true,
    calculationType: calculationTypes.SUM
  },
  {
    label: '完成数量',
    field: 'RECEIPT_QTY',
    checked: false,
    calculationType: calculationTypes.SUM
  },
  {
    label: '剩余数量',
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

// 导出Excel
const handleExport = async () => {
  try {
    ElMessage.info('正在导出，请稍候...')
    const res = (await exportCpTestOrdersApi({
      ...searchParams
    })) as unknown as AxiosResponse
    // 如果是文件流，直接创建blob
    const blob = new Blob([res.data], { type: 'application/vnd.ms-excel' })
    const disposition = res.headers?.['content-disposition']
    let filename = `CP测试订单列表_${new Date().getTime()}.xlsx`
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

// 初始化
onMounted(() => {
  getList()
})
</script>

<template>
  <ContentWrap>
    <!-- 搜索表单 -->
    <ElForm ref="formRef" :model="searchParams" label-width="100px" class="search-form">
      <ElRow :gutter="20">
        <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
          <ElFormItem label="品名">
            <ElInput
              v-model="searchParams.item_name"
              placeholder="请输入品名"
              clearable
              @keyup.enter="handleSearch"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
          <ElFormItem label="批号">
            <ElInput
              v-model="searchParams.lot_name"
              placeholder="请输入批号"
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
      </ElRow>
      <ElCollapseTransition>
        <div v-show="!isCollapse">
          <ElRow :gutter="20">
            <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
              <ElFormItem label="状态">
                <ElSelect
                  v-model="searchParams.status"
                  placeholder="请选择状态"
                  clearable
                  @change="handleSearch"
                >
                  <ElOption label="未完成" :value="0" />
                  <ElOption label="已完成" :value="1" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
              <ElFormItem label="测试流程">
                <ElInput
                  v-model="searchParams.progress_name"
                  placeholder="请输入测试流程"
                  clearable
                  @keyup.enter="handleSearch"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
              <ElFormItem label="测试程序">
                <ElInput
                  v-model="searchParams.testing_program_name"
                  placeholder="请输入测试程序"
                  clearable
                  @keyup.enter="handleSearch"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
              <ElFormItem label="订单日期">
                <ElDatePicker
                  v-model="dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="YYYY-MM-DD"
                  @change="handleSearch"
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

    <!-- 表格区域 -->
    <div class="relative">
      <!-- 表格 -->
      <ElTable
        v-loading="loading"
        :data="dataList"
        border
        class="w-full"
        header-cell-class-name="table-header"
        @selection-change="handleSelectionChange"
      >
        <template v-for="item in defaultColumns" :key="item.prop || item.type">
          <ElTableColumn v-bind="item" v-if="item.hidden !== true">
            <template #header v-if="item.label">
              <span :class="item.headerCellClassName || ''">{{ item.label }}</span>
            </template>
            <template #default="scope" v-if="!item.type && item.prop">
              {{ scope.row[item.prop as keyof CpTestOrders] }}
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
      <div class="flex justify-end mt-4">
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

.search-form {
  padding: 20px;
  margin-bottom: 20px;
  background-color: var(--el-bg-color);
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
</style>
