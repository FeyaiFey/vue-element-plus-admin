<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
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
  ElTable,
  ElTableColumn,
  ElPagination,
  ElSkeleton
} from 'element-plus'
import { Dialog } from '@/components/Dialog'
import { Icon } from '@/components/Icon'
import type { FormInstance } from 'element-plus'
import { getStockListApi, getWaferIdQtyDetailApi, exportStockListApi } from '@/api/stock'
import type { Stock, StockQuery, WaferIdQtyDetail } from '@/api/stock/types'
import { getTestingProgramApi, getBurningProgramApi } from '@/api/params'
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

// 表格数据
const dataList = ref<Stock[]>([])
const loading = ref(false)
const total = ref(0)

// 分页相关
const currentPage = ref(1)
const pageSize = ref(100)

// 获取数据
const getList = async () => {
  try {
    loading.value = true
    const res = await getStockListApi({
      ...formData,
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

// 筛选器状态
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

const numberFilters = ref({
  INVENTORY_QTY: { expression: '' },
  SECOND_QTY: { expression: '' }
})

// 解析数字过滤表达式
const parseNumberFilter = (expression: string) => {
  if (!expression) return { operator: '', value: null }

  expression = expression.trim()

  // 处理特殊字符
  const operatorMap: { [key: string]: string } = {
    '>=': '>=',
    '<=': '<=',
    '>': '>',
    '<': '<',
    '=': '='
  }

  let operator = '='
  let value = expression

  // 检查是否以操作符开头
  for (const op of Object.keys(operatorMap)) {
    if (expression.startsWith(op)) {
      operator = op
      value = expression.slice(op.length).trim()
      break
    }
  }

  // 如果没有操作符但是是纯数字，默认使用等于
  if (operator === '=' && !isNaN(Number(value))) {
    return { operator, value: Number(value) }
  }

  // 尝试转换为数字
  const numValue = Number(value)
  if (isNaN(numValue)) {
    return { operator: '', value: null }
  }

  return { operator, value: numValue }
}

// 评估数字过滤条件
const evaluateNumberFilter = (
  value: number,
  filter: { operator: string; value: number | null }
) => {
  if (!filter.operator || filter.value === null) return true

  const targetValue = Number(value)
  if (isNaN(targetValue)) return false

  switch (filter.operator) {
    case '>':
      return targetValue > filter.value
    case '>=':
      return targetValue >= filter.value
    case '<':
      return targetValue < filter.value
    case '<=':
      return targetValue <= filter.value
    case '=':
      return targetValue === filter.value
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

// 处理筛选清除
const handleFilterClear = (prop: string) => {
  if (prop in textFilters) {
    textFilters[prop] = ''
  } else if (prop in numberFilters.value) {
    numberFilters.value[prop].expression = ''
  }
}

// 处理筛选器绑定
const getFilterValue = (col: any) => {
  return computed({
    get: () => (col.isNumber ? numberFilters.value[col.prop].expression : textFilters[col.prop]),
    set: (val) => {
      if (col.isNumber) {
        numberFilters.value[col.prop].expression = val
      } else {
        textFilters[col.prop] = val
      }
    }
  })
}

// 排序相关
const sortConfig = ref({
  field: '',
  order: 'asc'
})

// 监听排序变化
watch([() => sortConfig.value.field, () => sortConfig.value.order], () => {
  if (!sortConfig.value.field) return
  sortData()
})

// 处理排序
const sortData = () => {
  const { field, order } = sortConfig.value
  if (!field) return

  dataList.value.sort((a, b) => {
    const aValue = a[field]
    const bValue = b[field]

    // 如果是数字类型，进行数字比较
    if (columns.find((col) => col.prop === field)?.isNumber) {
      const aNum = Number(aValue) || 0
      const bNum = Number(bValue) || 0
      return order === 'asc' ? aNum - bNum : bNum - aNum
    }

    // 如果是字符串类型，进行字符串比较
    const aStr = String(aValue || '').toLowerCase()
    const bStr = String(bValue || '').toLowerCase()
    return order === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
  })
}

const handleSortClear = () => {
  sortConfig.value.field = ''
  sortConfig.value.order = 'asc'
  // 按ITEM_CODE升序排序
  dataList.value.sort((a, b) => {
    const aValue = Number(a.ITEM_CODE) || 0
    const bValue = Number(b.ITEM_CODE) || 0
    return aValue - bValue
  })
}

// 排序和筛选后的数据
const sortedAndFilteredData = computed(() => {
  // 如果没有选择排序字段，默认按ID升序
  if (!sortConfig.value.field) {
    return filteredData.value.slice().sort((a, b) => {
      const aValue = Number(a.ITEM_CODE) || 0
      const bValue = Number(b.ITEM_CODE) || 0
      return aValue - bValue
    })
  }
  return filteredData.value
})

// 表格列配置
const columns = [
  {
    prop: 'ITEM_CODE',
    label: '物料编码',
    minWidth: 320,
    isNumber: false,
    align: 'center',
    sortable: true,
    showOverflowTooltip: true
  },
  {
    prop: 'LOT_CODE',
    label: '批号',
    minWidth: 260,
    isNumber: false,
    align: 'center',
    sortable: true,
    showOverflowTooltip: true
  },
  {
    prop: 'INVENTORY_QTY',
    label: '库存数量',
    minWidth: 160,
    isNumber: true,
    align: 'center',
    sortable: true,
    showOverflowTooltip: true,
    fixed: 'right'
  },
  {
    prop: 'WAREHOUSE_NAME',
    label: '仓库',
    minWidth: 220,
    isNumber: false,
    align: 'center',
    sortable: true,
    showOverflowTooltip: true
  },
  {
    prop: 'SECOND_QTY',
    label: '片数',
    minWidth: 130,
    isNumber: true,
    align: 'center',
    sortable: true,
    showOverflowTooltip: true
  },
  {
    prop: 'Z_BURNING_PROGRAM_NAME',
    label: '烧录程序',
    minWidth: 320,
    isNumber: false,
    align: 'center',
    sortable: true,
    showOverflowTooltip: true
  },
  {
    prop: 'Z_TESTING_PROGRAM_NAME',
    label: '测试程序',
    minWidth: 320,
    isNumber: false,
    align: 'center',
    sortable: true,
    showOverflowTooltip: true
  },
  {
    prop: 'FEATURE_GROUP_NAME',
    label: '品号群组',
    minWidth: 260,
    isNumber: false,
    align: 'center',
    sortable: true,
    showOverflowTooltip: true
  }
]

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
    width: 200,
    fixed: 'right'
  }
]

// 折叠状态
const isCollapse = ref(true)

// 重置方法
const handleReset = () => {
  // 清空表单数据
  formData.item_code = ''
  formData.item_name = ''
  formData.lot_code = ''
  formData.feature_group_name = ''
  formData.warehouse_name = ''
  formData.testing_program = []
  formData.burning_program = []

  // 清空表格数据
  dataList.value = []
  total.value = 0
  currentPage.value = 1
  pageSize.value = 100

  // 清空筛选条件
  Object.keys(textFilters).forEach((key) => {
    textFilters[key] = ''
  })
  Object.keys(numberFilters.value).forEach((key) => {
    numberFilters.value[key].expression = ''
  })

  // 清空排序
  handleSortClear()

  // 清空选中项
  tableSelection.value = []
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
  <div class="table-container">
    <ElSkeleton v-if="loading" :rows="20" animated class="table-skeleton" />
    <ElTable
      v-else
      v-loading="loading"
      :data="sortedAndFilteredData"
      row-key="key"
      @selection-change="(val) => (tableSelection = val)"
      border
      style="width: 100%"
      height="calc(100vh - 280px)"
    >
      <ElTableColumn type="selection" width="50" header-align="center" align="center" />
      <ElTableColumn
        v-for="col in columns"
        :key="col.prop"
        :prop="col.prop"
        :width="col.minWidth"
        :show-overflow-tooltip="col.showOverflowTooltip"
        :fixed="col.fixed"
        :align="col.align || 'center'"
        header-align="center"
      >
        <template #header>
          <div class="custom-header">
            <div class="header-row">
              <span>{{ col.label }}</span>
            </div>
            <div class="filter-row" @click.stop>
              <ElInput
                v-model="getFilterValue(col).value"
                :placeholder="col.isNumber ? '例如: >=100' : '筛选'"
                size="small"
                class="filter-input"
                clearable
                @clear="handleFilterClear(col.prop)"
              />
            </div>
          </div>
        </template>
        <template #default="{ row }">
          <template v-if="col.prop === 'SECOND_QTY'">
            <span
              v-if="row.SECOND_QTY > 0"
              style="color: var(--el-color-primary); text-decoration: underline; cursor: pointer"
              @click="handleSecondQtyClick(row)"
            >
              {{ row.SECOND_QTY }}
            </span>
            <span v-else>{{ row.SECOND_QTY }}</span>
          </template>
          <template v-else>
            <span>{{ row[col.prop] }}</span>
          </template>
        </template>
      </ElTableColumn>
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
            已选择: <span class="summary-value">{{ tableSelection.length }}</span> 项
          </span>
          <span class="summary-item">
            库存数量合计: <span class="summary-value">{{ tableSummary.INVENTORY_QTY }}</span>
          </span>
          <span class="summary-item">
            第二数量合计: <span class="summary-value">{{ tableSummary.SECOND_QTY }}</span>
          </span>
        </div>
        <div class="sort-form">
          <ElSelect
            v-model="sortConfig.field"
            size="small"
            placeholder="选择排序字段"
            clearable
            @clear="handleSortClear"
          >
            <ElOption
              v-for="col in columns.filter((col) => col.sortable)"
              :key="col.prop"
              :label="col.label"
              :value="col.prop"
            />
          </ElSelect>
          <ElSelect
            v-model="sortConfig.order"
            size="small"
            placeholder="排序方式"
            :disabled="!sortConfig.field"
          >
            <ElOption label="升序" value="asc" />
            <ElOption label="降序" value="desc" />
          </ElSelect>
        </div>
      </div>
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

        <ElTable
          v-loading="dialogLoading"
          :data="dialogData"
          border
          stripe
          @selection-change="handleDialogSelectionChange"
        >
          <ElTableColumn type="selection" width="50" header-align="center" align="center" />
          <ElTableColumn
            v-for="col in dialogColumns"
            :key="col.field"
            :prop="col.field"
            :label="col.label"
            :width="col.width"
            :align="col.align"
            :show-overflow-tooltip="col.showOverflowTooltip"
            header-align="center"
          />
        </ElTable>
      </div>
    </div>
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
</style>
