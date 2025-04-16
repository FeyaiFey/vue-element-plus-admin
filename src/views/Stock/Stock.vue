<script setup lang="ts">
import { ref, reactive, h, computed, unref } from 'vue'
import { ElMessage, ElCheckbox } from 'element-plus'
import {
  ElForm,
  ElFormItem,
  ElSelect,
  ElOption,
  ElRow,
  ElCol,
  ElInput,
  ElButton,
  ElCollapseTransition,
  ElTableV2,
  ElAutoResizer
} from 'element-plus'
import { ContentWrap } from '@/components/ContentWrap'
import { useTable } from '@/hooks/web/useTable'
import { Table } from '@/components/Table'
import { Dialog } from '@/components/Dialog'
import { Icon } from '@/components/Icon'
import type { FormInstance } from 'element-plus'
import { getStockListApi, getWaferIdQtyDetailApi, exportStockListApi } from '@/api/stock'
import type { Stock, StockQuery, WaferIdQtyDetail } from '@/api/stock/types'
import { getTestingProgramApi, getBurningProgramApi } from '@/api/params'
import type { CheckboxValueType, Column } from 'element-plus'
import { FixedDir } from 'element-plus/es/components/table-v2/src/constants'
import { TableV2SortOrder } from 'element-plus'
import type { SortBy, SortState } from 'element-plus'
import type { AxiosResponse } from 'axios'

// 测试程序选项
const testingProgramOptions = ref<Array<{ label: string; value: string }>>([])
const testingProgramLoading = ref(false)

// 远程搜索测试程序
const handleTestingProgramSearch = async (query: string) => {
  if (!query) {
    testingProgramOptions.value = []
    return
  }
  testingProgramLoading.value = true
  try {
    const res = await getTestingProgramApi({ testing_program: query })
    testingProgramOptions.value = res.data.list.map((item) => ({
      label: item.label,
      value: item.value
    }))
  } catch (error) {
    console.error('获取测试程序列表失败:', error)
  } finally {
    testingProgramLoading.value = false
  }
}

// 烧录程序选项
const burningProgramOptions = ref<Array<{ label: string; value: string }>>([])
const burningProgramLoading = ref(false)

// 远程搜索烧录程序
const handleBurningProgramSearch = async (query: string) => {
  if (!query) {
    burningProgramOptions.value = []
    return
  }
  burningProgramLoading.value = true
  try {
    const res = await getBurningProgramApi({ burning_program: query })
    burningProgramOptions.value = res.data.list.map((item) => ({
      label: item.label,
      value: item.value
    }))
  } catch (error) {
    console.error('获取烧录程序列表失败:', error)
  } finally {
    burningProgramLoading.value = false
  }
}

// 表单引用
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive<StockQuery>({
  item_code: '',
  item_name: '',
  lot_code: '',
  feature_group_name: '',
  warehouse_name: '',
  testing_program: [],
  burning_program: []
})

// 搜索方法
const handleSearch = () => {
  setSearchParams(formData)
}

// 使用 table hook
const { tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const res = await getStockListApi(searchParams.value)
    return {
      list: res.data.list
    }
  }
})

const { getList } = tableMethods
const { loading, dataList } = tableState

// 搜索参数
interface SearchParams extends StockQuery {
  enableSummary?: boolean
}

const searchParams = ref<SearchParams>({
  enableSummary: true // 设置初始值
})

// 搜索方法
const setSearchParams = (params: StockQuery) => {
  searchParams.value = {
    ...params,
    enableSummary: true
  }
  getList()
}

// Dialog 相关状态
const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogLoading = ref(false)
const dialogData = ref<WaferIdQtyDetail[]>([])

// 处理第二数量点击
const handleSecondQtyClick = async (row: any) => {
  if (row.SECOND_QTY > 0) {
    dialogTitle.value = `${row.LOT_CODE}  批次的第二数量明细`
    dialogVisible.value = true
    dialogLoading.value = true
    try {
      const res = await getWaferIdQtyDetailApi({
        item_code: row.ITEM_CODE,
        lot_code: row.LOT_CODE
      })
      dialogData.value = res.data.list
    } catch (error) {
      console.error('获取第二数量明细失败:', error)
      ElMessage.error('获取第二数量明细失败')
    } finally {
      dialogLoading.value = false
    }
  }
}

// 主表格选中项
const tableSelection = ref<Stock[]>([])

// 计算主表格选中项合计
const tableSummary = computed(() => {
  const summary = {
    INVENTORY_QTY: 0,
    SECOND_QTY: 0
  }
  tableSelection.value.forEach((item) => {
    summary.INVENTORY_QTY += item.INVENTORY_QTY
    summary.SECOND_QTY += item.SECOND_QTY
  })
  return summary
})

// 选择列组件
const SelectionCell = ({
  value,
  intermediate = false,
  onChange
}: {
  value: boolean
  intermediate?: boolean
  onChange: (value: CheckboxValueType) => void
}) => {
  return h(ElCheckbox, {
    modelValue: value,
    indeterminate: intermediate,
    onChange
  })
}

// 筛选器状态
interface NumberFilter {
  expression: string
}

interface NumberFilters {
  [key: string]: NumberFilter
}

const textFilters = reactive({
  FEATURE_GROUP_NAME: '',
  ITEM_NAME: '',
  ITEM_CODE: '',
  LOT_CODE: '',
  WAREHOUSE_NAME: '',
  Z_BIN_LEVEL_NAME: '',
  Z_TESTING_PROGRAM_NAME: '',
  Z_BURNING_PROGRAM_NAME: ''
})

const numberFilters = ref<NumberFilters>({
  INVENTORY_QTY: { expression: '' },
  SECOND_QTY: { expression: '' }
})

// 解析数字过滤表达式
const parseNumberFilter = (expression: string): { operator: string; value: number | null } => {
  expression = expression.trim()
  if (!expression) return { operator: '', value: null }

  const matches = expression.match(/^(>=|<=|>|<|=)?\s*(-?\d+\.?\d*)$/)
  if (!matches) return { operator: '', value: null }

  const [, operator = '=', valueStr] = matches
  const value = parseFloat(valueStr)
  return { operator, value }
}

// 评估数字过滤条件
const evaluateNumberFilter = (
  value: number,
  filter: { operator: string; value: number | null }
) => {
  if (!filter.operator || filter.value === null) return true

  switch (filter.operator) {
    case '>':
      return value > filter.value
    case '>=':
      return value >= filter.value
    case '<':
      return value < filter.value
    case '<=':
      return value <= filter.value
    case '=':
      return value === filter.value
    default:
      return true
  }
}

// 过滤后的数据
const filteredData = computed(() => {
  return dataList.value.filter((row) => {
    // 文本列过滤
    const textFilterMatch = Object.entries(textFilters).every(([key, filterValue]) => {
      if (!filterValue) return true
      const value = String(row[key] || '').toLowerCase()
      return value.includes(filterValue.toLowerCase())
    })

    // 数字列过滤
    const numberFilterMatch = Object.entries(numberFilters.value).every(([key, filter]) => {
      if (!filter.expression) return true
      const value = Number(row[key])
      if (isNaN(value)) return true

      const parsedFilter = parseNumberFilter(filter.expression)
      return evaluateNumberFilter(value, parsedFilter)
    })

    return textFilterMatch && numberFilterMatch
  })
})

// 创建文本列过滤器渲染器
const createTextFilterHeader = (key: string, title: string) => ({
  key,
  dataKey: key,
  title,
  width:
    key === 'ITEM_CODE'
      ? 260
      : key === 'ITEM_NAME'
        ? 180
        : key === 'WAREHOUSE_NAME'
          ? 200
          : key === 'LOT_CODE'
            ? 300
            : 120,
  align: 'center' as const,
  headerAlign: 'center' as const,
  headerCellRenderer: ({ column }) => {
    return h('div', { class: 'filter-header' }, [
      h('span', { class: 'header-title' }, column.title),
      h(ElInput, {
        modelValue: textFilters[key],
        'onUpdate:modelValue': (val) => (textFilters[key] = val),
        placeholder: '筛选',
        size: 'small',
        class: 'filter-input',
        clearable: true,
        onClick: (e: Event) => {
          e.stopPropagation()
        }
      })
    ])
  }
})

// 创建数字列过滤器渲染器
const createNumberFilterHeader = (key: string, title: string) => ({
  key,
  dataKey: key,
  title,
  width: 100,
  align: 'center' as const,
  headerAlign: 'center' as const,
  headerCellRenderer: ({ column }) => {
    return h('div', { class: 'filter-header' }, [
      h('span', { class: 'header-title' }, column.title),
      h(ElInput, {
        modelValue: numberFilters.value[key].expression,
        'onUpdate:modelValue': (val) => (numberFilters.value[key].expression = val),
        placeholder: '例如: >=100',
        size: 'small',
        class: 'filter-input',
        clearable: true,
        onClick: (e: Event) => {
          e.stopPropagation()
        }
      })
    ])
  }
})

// 表格列配置
const columns: Column<any>[] = [
  {
    key: 'selection',
    dataKey: 'selection',
    title: '',
    width: 50,
    align: 'center',
    fixed: FixedDir.LEFT,
    cellRenderer: ({ rowData }: { rowData: any }) => {
      const onChange = (value: CheckboxValueType) => {
        if (value) {
          if (!tableSelection.value.includes(rowData)) {
            tableSelection.value.push(rowData)
          }
        } else {
          const index = tableSelection.value.findIndex((item) => item === rowData)
          if (index > -1) {
            tableSelection.value.splice(index, 1)
          }
        }
      }
      return h(SelectionCell, {
        value: tableSelection.value.includes(rowData),
        onChange
      })
    },
    headerCellRenderer: () => {
      const _dataList = unref(dataList)
      const onChange = (value: CheckboxValueType) => {
        if (value) {
          tableSelection.value = [..._dataList]
        } else {
          tableSelection.value = []
        }
      }
      const allSelected = _dataList.length > 0 && tableSelection.value.length === _dataList.length
      const containsChecked = tableSelection.value.length > 0

      return h(SelectionCell, {
        value: allSelected,
        intermediate: containsChecked && !allSelected,
        onChange
      })
    }
  },
  {
    ...createTextFilterHeader('FEATURE_GROUP_NAME', '品号群组'),
    sortable: true
  },
  {
    ...createTextFilterHeader('ITEM_NAME', '物料名称'),
    sortable: true
  },
  {
    ...createTextFilterHeader('ITEM_CODE', '物料编码'),
    sortable: true
  },
  {
    ...createTextFilterHeader('LOT_CODE', '批号'),
    sortable: true
  },
  {
    ...createTextFilterHeader('WAREHOUSE_NAME', '仓库'),
    sortable: true,
    fixed: FixedDir.RIGHT
  },
  {
    ...createNumberFilterHeader('INVENTORY_QTY', '库存数量'),
    sortable: true,
    fixed: FixedDir.RIGHT
  },
  {
    ...createNumberFilterHeader('SECOND_QTY', '片数'),
    sortable: true,
    fixed: FixedDir.RIGHT,
    cellRenderer: ({ cellData, rowData }: { cellData: number; rowData: any }) => {
      if (cellData > 0) {
        return h(
          'span',
          {
            style: {
              color: 'var(--el-color-primary)',
              cursor: 'pointer',
              textDecoration: 'underline'
            },
            onClick: () => handleSecondQtyClick(rowData)
          },
          String(cellData)
        )
      }
      return h('span', null, String(cellData))
    }
  },
  createTextFilterHeader('Z_BIN_LEVEL_NAME', 'BIN等级'),
  createTextFilterHeader('Z_TESTING_PROGRAM_NAME', '测试程序'),
  createTextFilterHeader('Z_BURNING_PROGRAM_NAME', '烧录程序')
]

// Dialog表格选中项
const dialogSelection = ref<WaferIdQtyDetail[]>([])

// Dialog表格选中项变化
const handleDialogSelectionChange = (val: WaferIdQtyDetail[]) => {
  dialogSelection.value = val
}

// 计算选中项合计
const dialogSummary = computed(() => {
  const summary = {
    INVENTORY_QTY: 0,
    SECOND_QTY: 0
  }
  dialogSelection.value.forEach((item) => {
    summary.INVENTORY_QTY += item.INVENTORY_QTY
    summary.SECOND_QTY += item.SECOND_QTY
  })
  return summary
})

// Dialog表格列配置
const dialogColumns = [
  {
    type: 'selection',
    width: 50,
    align: 'center' as const,
    field: 'selection'
  },
  {
    label: '物料编码',
    field: 'ITEM_CODE',
    align: 'center' as const,
    width: 180,
    showOverflowTooltip: true
  },
  {
    label: '批号',
    field: 'LOT_CODE',
    align: 'center' as const,
    width: 150,
    showOverflowTooltip: true
  },
  {
    label: 'Wafer ID',
    field: 'WF_ID',
    align: 'center' as const,
    width: 100
  },
  {
    label: '库存数量',
    field: 'INVENTORY_QTY',
    align: 'center' as const,
    width: 100
  },
  {
    label: '第二数量',
    field: 'SECOND_QTY',
    align: 'center' as const,
    width: 100
  },
  {
    label: 'BIN等级',
    field: 'Z_BIN_LEVEL_NAME',
    align: 'center' as const,
    width: 150
  },
  {
    label: '测试程序',
    field: 'Z_TESTING_PROGRAM_NAME',
    align: 'center' as const,
    showOverflowTooltip: true
  },
  {
    label: '仓库',
    field: 'WAREHOUSE_NAME',
    align: 'center' as const,
    width: 200
  }
]

// 折叠状态
const isCollapse = ref(true)

// 重置方法
const handleReset = () => {
  formRef.value?.resetFields()
  // 设置所有参数为空
  formData.item_code = ''
  formData.item_name = ''
  formData.lot_code = ''
  formData.feature_group_name = ''
  formData.warehouse_name = ''
  formData.testing_program = []
  formData.burning_program = []
  handleSearch()
}

// 排序状态
const sortState = ref<SortState>({
  ITEM_CODE: TableV2SortOrder.ASC,
  ITEM_NAME: TableV2SortOrder.ASC,
  LOT_CODE: TableV2SortOrder.ASC,
  WAREHOUSE_NAME: TableV2SortOrder.ASC,
  INVENTORY_QTY: TableV2SortOrder.ASC,
  SECOND_QTY: TableV2SortOrder.ASC
})

const onSort = ({ key, order }: SortBy) => {
  sortState.value[key] = order
  if (order === undefined) {
    // 重置排序
    getList()
    return
  }

  // 根据排序状态对数据进行排序
  dataList.value.sort((a, b) => {
    const value1 = a[key]
    const value2 = b[key]

    // 处理数字类型
    if (typeof value1 === 'number' && typeof value2 === 'number') {
      return order === TableV2SortOrder.ASC ? value1 - value2 : value2 - value1
    }

    // 处理字符串类型
    return order === TableV2SortOrder.ASC
      ? String(value1).localeCompare(String(value2))
      : String(value2).localeCompare(String(value1))
  })
}

// 导出Excel
const handleExport = async () => {
  try {
    ElMessage.info('正在导出，请稍候...')
    const res = (await exportStockListApi({
      ...formData
    })) as unknown as AxiosResponse
    // 如果是文件流，直接创建blob
    const blob = new Blob([res.data], { type: 'application/vnd.ms-excel' })
    const disposition = res.headers?.['content-disposition']
    let filename = `库存列表_${new Date().getTime()}.xlsx`
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
</script>

<template>
  <ContentWrap>
    <!-- 搜索表单 -->
    <ElForm ref="formRef" :model="formData" label-width="100px" class="search-form">
      <ElRow :gutter="20">
        <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
          <ElFormItem label="物料编码">
            <ElInput
              v-model="formData.item_code"
              placeholder="按物料编码模糊搜索"
              clearable
              @keyup.enter="handleSearch"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
          <ElFormItem label="物料名称">
            <ElInput
              v-model="formData.item_name"
              placeholder="请输入物料名称模糊搜索"
              clearable
              @keyup.enter="handleSearch"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
          <ElFormItem label="批号">
            <ElInput
              v-model="formData.lot_code"
              placeholder="请输入批号搜索"
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
              <ElFormItem label="品号群组">
                <ElInput
                  v-model="formData.feature_group_name"
                  placeholder="请输入品号群组模糊搜索"
                  clearable
                  @keyup.enter="handleSearch"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
              <ElFormItem label="仓库">
                <ElInput
                  v-model="formData.warehouse_name"
                  placeholder="请输入仓库模糊搜索"
                  clearable
                  @keyup.enter="handleSearch"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
              <ElFormItem label="测试程序">
                <ElSelect
                  v-model="formData.testing_program"
                  placeholder="请输入测试程序搜索"
                  clearable
                  filterable
                  remote
                  :remote-method="handleTestingProgramSearch"
                  :loading="testingProgramLoading"
                  multiple
                  collapse-tags
                  collapse-tags-tooltip
                  @keyup.enter="handleSearch"
                >
                  <ElOption
                    v-for="item in testingProgramOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
              <ElFormItem label="烧录程序">
                <ElSelect
                  v-model="formData.burning_program"
                  placeholder="请输入烧录程序搜索"
                  clearable
                  filterable
                  remote
                  :remote-method="handleBurningProgramSearch"
                  :loading="burningProgramLoading"
                  multiple
                  collapse-tags
                  collapse-tags-tooltip
                  @keyup.enter="handleSearch"
                >
                  <ElOption
                    v-for="item in burningProgramOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </ElSelect>
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
    <div class="h-150">
      <ElAutoResizer>
        <template #default="{ width, height }">
          <ElTableV2
            v-loading="loading"
            :columns="columns"
            :data="filteredData"
            :width="width"
            :height="height"
            v-model:sort-state="sortState"
            @column-sort="onSort"
            fixed
            :cell-props="{
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }
            }"
          />
        </template>
      </ElAutoResizer>
    </div>
    <!-- 选中项合计 -->
    <div class="table-summary">
      <div class="summary-content">
        <span class="summary-item">
          已选择: <span class="summary-value">{{ tableSelection.length }}</span> 项
        </span>
        <span class="summary-item">
          库存数量合计: <span class="summary-value">{{ tableSummary.INVENTORY_QTY }}</span>
        </span>
        <span class="summary-item">
          第二数量合计: <span class="summary-value">{{ tableSummary.SECOND_QTY }}</span>
        </span>
      </div>
    </div>

    <!-- 第二数量明细弹窗 -->
    <Dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="70%"
      :top="'5vh'"
      :draggable="true"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="dialog-content">
        <div class="table-wrapper">
          <!-- 选中项合计 -->
          <div class="table-summary">
            <div class="summary-content">
              <span class="summary-item">
                已选择: <span class="summary-value">{{ dialogSelection.length }}</span> 项
              </span>
              <span class="summary-item">
                库存数量合计: <span class="summary-value">{{ dialogSummary.INVENTORY_QTY }}</span>
              </span>
              <span class="summary-item">
                第二数量合计: <span class="summary-value">{{ dialogSummary.SECOND_QTY }}</span>
              </span>
            </div>
          </div>

          <Table
            v-loading="dialogLoading"
            :columns="dialogColumns"
            :data="dialogData"
            @selection-change="handleDialogSelectionChange"
          />
        </div>
      </div>
    </Dialog>
  </ContentWrap>
</template>

<style lang="less" scoped>
.table-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 300px);
  min-height: 400px;
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
    gap: 32px;
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
}

// 可点击的第二数量样式
.clickable-qty {
  color: var(--el-color-primary);
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    color: var(--el-color-primary-dark-2);
  }
}

.dialog-content {
  display: flex;
  flex-direction: column;
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

.filter-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 2px;

  .header-title {
    font-size: 14px;
    font-weight: bold;
    line-height: 20px;
  }

  .filter-input {
    width: 100%;

    :deep(.el-input__inner) {
      height: 22px;
      padding: 0 8px;
      font-size: 12px;
      line-height: 22px;

      &::placeholder {
        font-size: 12px;
      }
    }
  }
}

:deep(.table-header) {
  height: 42px;
  font-size: 14px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  text-align: center !important;
  background-color: var(--el-fill-color-light) !important;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
</style>
