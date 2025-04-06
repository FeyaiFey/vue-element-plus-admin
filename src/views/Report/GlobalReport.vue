<script setup lang="ts">
import { ref, onMounted, computed, h, cloneVNode } from 'vue'
import { ContentWrap } from '@/components/ContentWrap'
import {
  ElTableV2,
  ElButton,
  ElMessage,
  ElAutoResizer,
  ElPopover,
  ElCheckbox,
  ElInput,
  ElTable,
  ElTableColumn
} from 'element-plus'
import { getGlobalReportApi, exportGlobalReportApi } from '@/api/report'
import { getStockListApi } from '@/api/stock'
import { getAssyWipApi } from '@/api/assy'
import { getPurchaseWipListApi } from '@/api/purchase'
import type { GlobalReport } from '@/api/report/type'
import { Icon } from '@/components/Icon'
import type { Column } from 'element-plus'
import { AxiosResponse } from 'axios'
import ResizeDialog from '@/components/Dialog/src/ResizeDialog.vue'

// 报表数据
const reportData = ref<GlobalReport[]>([])
const loading = ref(false)
const tableRef = ref()
const kls = ref<string>('')

// 过滤器状态
const mainChipFilter = ref('')
const chipNameFilter = ref('')
const deputyChipFilter = ref('')

// 数字列过滤器状态
interface NumberFilter {
  expression: string
}

interface NumberFilters {
  [key: string]: NumberFilter
}

const numberFilters = ref<NumberFilters>({
  TOTAL_FINISHED_GOODS: { expression: '' },
  TOP_FINISHED_GOODS: { expression: '' },
  BACK_FINISHED_GOODS: { expression: '' },
  TOTAL_SEMI_MANUFACTURED: { expression: '' },
  TOP_SEMI_MANUFACTURED: { expression: '' },
  BACK_SEMI_MANUFACTURED: { expression: '' },
  PACKAGE_WIP_QTY: { expression: '' },
  PACKAGE_TOP_WIP_QTY: { expression: '' },
  PACKAGE_BACK_WIP_QTY: { expression: '' },
  SG_QTY: { expression: '' },
  SG_FINISHED_GOODS: { expression: '' },
  SG_SEMI_MANUFACTURED: { expression: '' },
  SECONDARY_OUTSOURCING_WIP_QTY: { expression: '' },
  PURCHASE_WIP_QTY: { expression: '' },
  CP_WIP_QTY: { expression: '' },
  TOTAL_RAW_MATERIALS: { expression: '' },
  NO_TESTED_WAFER: { expression: '' },
  TESTED_WAFER: { expression: '' },
  DEPUTY_CHIP: { expression: '' },
  OUTSOURCING_WIP_QTY: { expression: '' },
  TOTAL_B_RAW_MATERIALS: { expression: '' }
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
  return reportData.value.filter((row) => {
    const mainChipMatch =
      !mainChipFilter.value ||
      (row.MAIN_CHIP?.toLowerCase().includes(mainChipFilter.value.toLowerCase()) ?? false)
    const chipNameMatch =
      !chipNameFilter.value ||
      (row.CHIP_NAME?.toLowerCase().includes(chipNameFilter.value.toLowerCase()) ?? false)
    const deputyChipMatch =
      !deputyChipFilter.value ||
      (row.DEPUTY_CHIP?.toLowerCase().includes(deputyChipFilter.value.toLowerCase()) ?? false)

    // 数字列过滤
    const numberFilterMatch = Object.entries(numberFilters.value).every(([key, filter]) => {
      if (!filter.expression) return true
      const value = Number(row[key])
      if (isNaN(value)) return true

      const parsedFilter = parseNumberFilter(filter.expression)
      return evaluateNumberFilter(value, parsedFilter)
    })

    return mainChipMatch && chipNameMatch && deputyChipMatch && numberFilterMatch
  })
})

// 定义列参数配置
interface ColumnConfig {
  title: string
  param1_name: string
  param1_value: string
  param2_name?: string
  param2_value?: string
  by_column_name?: string
  type: 'stock' | 'assyWip' | 'purchaseWip'
}

// 列参数配置
const columnConfigs: Record<string, ColumnConfig> = {
  TOTAL_FINISHED_GOODS: {
    title: '产成品库存',
    param1_name: 'item_code',
    param1_value: 'CP%REPLACE_TEXT%',
    by_column_name: 'CHIP_NAME',
    type: 'stock'
  },
  TOP_FINISHED_GOODS: {
    title: '正印产成品',
    param1_name: 'item_code',
    param1_value: 'CP%REPLACE_TEXT%ZY%',
    by_column_name: 'CHIP_NAME',
    type: 'stock'
  },
  BACK_FINISHED_GOODS: {
    title: '背印产成品',
    param1_name: 'item_code',
    param1_value: 'CP%REPLACE_TEXT%BY%',
    by_column_name: 'CHIP_NAME',
    type: 'stock'
  },
  TOTAL_SEMI_MANUFACTURED: {
    title: '总半成品',
    param1_name: 'item_code',
    param1_value: 'BC%REPLACE_TEXT%',
    by_column_name: 'CHIP_NAME',
    type: 'stock'
  },
  TOP_SEMI_MANUFACTURED: {
    title: '正印半成品',
    param1_name: 'item_code',
    param1_value: 'BC%REPLACE_TEXT%ZY%',
    by_column_name: 'CHIP_NAME',
    type: 'stock'
  },
  BACK_SEMI_MANUFACTURED: {
    title: '背印半成品',
    param1_name: 'item_code',
    param1_value: 'BC%REPLACE_TEXT%BY%',
    by_column_name: 'CHIP_NAME',
    type: 'stock'
  },
  PACKAGE_WIP_QTY: {
    title: '封装在制数',
    param1_name: 'item_code',
    param1_value: 'BC%REPLACE_TEXT%AB',
    by_column_name: 'CHIP_NAME',
    type: 'assyWip'
  },
  PACKAGE_TOP_WIP_QTY: {
    title: '正印封装',
    param1_name: 'item_code',
    param1_value: 'BC%REPLACE_TEXT%ZY-AB',
    by_column_name: 'CHIP_NAME',
    type: 'assyWip'
  },
  PACKAGE_BACK_WIP_QTY: {
    title: '背印封装',
    param1_name: 'item_code',
    param1_value: 'BC%REPLACE_TEXT%BY-AB',
    by_column_name: 'CHIP_NAME',
    type: 'assyWip'
  },
  SG_QTY: {
    title: '苏工院库存',
    param1_name: 'item_code',
    param1_value: '%REPLACE_TEXT%',
    param2_name: 'warehouse_name',
    param2_value: '苏工院',
    by_column_name: 'CHIP_NAME',
    type: 'stock'
  },
  SG_FINISHED_GOODS: {
    title: '苏工院产成品',
    param1_name: 'item_code',
    param1_value: 'CP%REPLACE_TEXT%',
    param2_name: 'warehouse_name',
    param2_value: '苏工院',
    by_column_name: 'CHIP_NAME',
    type: 'stock'
  },
  SG_SEMI_MANUFACTURED: {
    title: '苏工院半成品',
    param1_name: 'item_code',
    param1_value: 'BC%REPLACE_TEXT%',
    param2_name: 'warehouse_name',
    param2_value: '苏工院',
    by_column_name: 'CHIP_NAME',
    type: 'stock'
  },
  SECONDARY_OUTSOURCING_WIP_QTY: {
    title: '二次委外',
    param1_name: 'item_code',
    param1_value: 'CP%REPLACE_TEXT%',
    by_column_name: 'CHIP_NAME',
    type: 'assyWip'
  },
  PURCHASE_WIP_QTY: {
    title: '采购数量',
    param1_name: 'item_name',
    param1_value: 'REPLACE_TEXT',
    by_column_name: 'MAIN_CHIP',
    type: 'purchaseWip'
  },
  CP_WIP_QTY: {
    title: '中测数量',
    param1_name: 'item_code',
    param1_value: 'CL%REPLACE_TEXT%CP',
    by_column_name: 'MAIN_CHIP',
    type: 'assyWip'
  },
  TOTAL_RAW_MATERIALS: {
    title: '原材料库存',
    param1_name: 'item_name',
    param1_value: '%REPLACE_TEXT%',
    by_column_name: 'MAIN_CHIP',
    type: 'stock'
  },
  NO_TESTED_WAFER: {
    title: '未测晶圆',
    param1_name: 'item_code',
    param1_value: 'CL%REPLACE_TEXT%WF',
    param2_name: 'feature_group_name',
    param2_value: '未测',
    by_column_name: 'MAIN_CHIP',
    type: 'stock'
  },
  TESTED_WAFER: {
    title: '已测晶圆',
    param1_name: 'item_code',
    param1_value: 'CL%REPLACE_TEXT%CP',
    param2_name: 'feature_group_name',
    param2_value: '已测',
    by_column_name: 'MAIN_CHIP',
    type: 'stock'
  },
  OUTSOURCING_WIP_QTY: {
    title: 'B芯在途',
    param1_name: 'item_code',
    param1_value: 'CL%REPLACE_TEXT%',
    by_column_name: 'DEPUTY_CHIP',
    type: 'purchaseWip'
  },
  TOTAL_B_RAW_MATERIALS: {
    title: 'B芯库存',
    param1_name: 'item_name',
    param1_value: '%REPLACE_TEXT%',
    by_column_name: 'DEPUTY_CHIP',
    type: 'stock'
  }
}

// 添加弹窗相关状态
const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogData = ref<any>('')
const currentRow = ref<GlobalReport | null>(null)
const currentColumn = ref<ColumnConfig | null>(null)

// 修改点击事件处理函数
const handleNumberClick = async (row: GlobalReport, columnKey: string) => {
  const value = row[columnKey]
  if (value && !isNaN(Number(value))) {
    const columnConfig = columnConfigs[columnKey]
    if (columnConfig) {
      currentRow.value = row
      currentColumn.value = columnConfig
      dialogTitle.value = `${columnConfig.title}详情`
      if (columnConfig.type === 'stock') {
        const byColumnValue = currentColumn.value.by_column_name
        if (!byColumnValue) return

        const paramName1 = currentColumn.value.param1_name
        const paramValue1 = currentColumn.value.param1_value.replace(
          'REPLACE_TEXT',
          currentRow.value[byColumnValue]
        )
        if (currentColumn.value.param2_name) {
          const paramName2 = currentColumn.value.param2_name
          const paramValue2 = currentColumn.value.param2_value?.replace(
            'REPLACE_TEXT',
            currentRow.value[byColumnValue]
          )
          const res = await getStockListApi({
            [`${paramName1}`]: paramValue1,
            [`${paramName2}`]: paramValue2
          })
          dialogData.value = res.data.list
        } else {
          const res = await getStockListApi({
            [`${paramName1}`]: paramValue1
          })
          dialogData.value = res.data.list
        }
        dialogVisible.value = true
      } else if (columnConfig.type === 'assyWip') {
        const byColumnValue = currentColumn.value.by_column_name
        if (!byColumnValue) return

        const paramName1 = currentColumn.value.param1_name
        const paramValue1 = currentColumn.value.param1_value.replace(
          'REPLACE_TEXT',
          currentRow.value[byColumnValue]
        )

        const res = await getAssyWipApi({
          [`${paramName1}`]: paramValue1
        })
        dialogData.value = res.data.list
        dialogVisible.value = true
      } else if (columnConfig.type === 'purchaseWip') {
        const byColumnValue = currentColumn.value.by_column_name
        if (!byColumnValue) return

        const paramName1 = currentColumn.value.param1_name
        const paramValue1 = currentColumn.value.param1_value.replace(
          'REPLACE_TEXT',
          currentRow.value[byColumnValue]
        )

        const res = await getPurchaseWipListApi({
          [`${paramName1}`]: paramValue1
        })
        dialogData.value = res.data.list
        dialogVisible.value = true
      }
    }
  }
}

// 关闭弹窗
const handleDialogClose = () => {
  dialogVisible.value = false
  currentRow.value = null
  currentColumn.value = null
}

// 修改列配置，添加数字列的点击事件
const createNumberFilterHeader = (key: string, title: string) => ({
  key,
  dataKey: key,
  title,
  width: 120,
  align: 'center' as const,
  headerAlign: 'center' as const,
  cellRenderer: ({ rowData, column }) => {
    const value = rowData[column.dataKey]
    const isNumber = value && !isNaN(Number(value))

    return h(
      'div',
      {
        class: ['number-cell', { clickable: isNumber }],
        onClick: () => handleNumberClick(rowData, column.dataKey)
      },
      value
    )
  },
  headerCellRenderer: ({ column }) => {
    return h('div', { class: 'filter-header' }, [
      h('span', { class: 'header-title' }, column.title),
      h('div', { class: 'number-filter-container' }, [
        h(ElInput, {
          modelValue: numberFilters.value[key].expression,
          'onUpdate:modelValue': (val) => (numberFilters.value[key].expression = val),
          placeholder: '例如: >=100',
          size: 'small',
          class: 'filter-input',
          clearable: true
        })
      ])
    ])
  }
})

// 列配置
const allColumns: Column[] = [
  { key: 'ROW', dataKey: 'ROW', title: '行号', width: 80, align: 'center', headerAlign: 'center' },
  {
    key: 'MAIN_CHIP',
    dataKey: 'MAIN_CHIP',
    title: 'A芯',
    width: 120,
    align: 'center',
    headerAlign: 'center',
    headerCellRenderer: ({ column }) => {
      return h('div', { class: 'filter-header' }, [
        h('span', { class: 'header-title' }, column.title),
        h(ElInput, {
          modelValue: mainChipFilter.value,
          'onUpdate:modelValue': (val) => (mainChipFilter.value = val),
          placeholder: '筛选',
          size: 'small',
          class: 'filter-input',
          clearable: true
        })
      ])
    }
  },
  {
    key: 'CHIP_NAME',
    dataKey: 'CHIP_NAME',
    title: '芯片名称',
    width: 200,
    align: 'center',
    headerAlign: 'center',
    headerCellRenderer: ({ column }) => {
      return h('div', { class: 'filter-header' }, [
        h('span', { class: 'header-title' }, column.title),
        h(ElInput, {
          modelValue: chipNameFilter.value,
          'onUpdate:modelValue': (val) => (chipNameFilter.value = val),
          placeholder: '筛选',
          size: 'small',
          class: 'filter-input',
          clearable: true
        })
      ])
    }
  },
  createNumberFilterHeader('TOTAL_FINISHED_GOODS', '产成品库存'),
  createNumberFilterHeader('TOP_FINISHED_GOODS', '正印产成品'),
  createNumberFilterHeader('BACK_FINISHED_GOODS', '背印产成品'),
  createNumberFilterHeader('TOTAL_SEMI_MANUFACTURED', '总半成品'),
  createNumberFilterHeader('TOP_SEMI_MANUFACTURED', '正印半成品'),
  createNumberFilterHeader('BACK_SEMI_MANUFACTURED', '背印半成品'),
  createNumberFilterHeader('PACKAGE_WIP_QTY', '封装在制数'),
  createNumberFilterHeader('PACKAGE_TOP_WIP_QTY', '正印封装'),
  createNumberFilterHeader('PACKAGE_BACK_WIP_QTY', '背印封装'),
  createNumberFilterHeader('SG_QTY', '苏工院库存'),
  createNumberFilterHeader('SG_FINISHED_GOODS', '苏工院产成品'),
  createNumberFilterHeader('SG_SEMI_MANUFACTURED', '苏工院半成品'),
  createNumberFilterHeader('SECONDARY_OUTSOURCING_WIP_QTY', '二次委外'),
  createNumberFilterHeader('PURCHASE_WIP_QTY', '采购数量'),
  createNumberFilterHeader('CP_WIP_QTY', '中测数量'),
  createNumberFilterHeader('TOTAL_RAW_MATERIALS', '原材料库存'),
  createNumberFilterHeader('NO_TESTED_WAFER', '未测晶圆'),
  createNumberFilterHeader('TESTED_WAFER', '已测晶圆'),
  {
    key: 'DEPUTY_CHIP',
    dataKey: 'DEPUTY_CHIP',
    title: '副芯片',
    width: 120,
    align: 'center',
    headerAlign: 'center',
    headerCellRenderer: ({ column }) => {
      return h('div', { class: 'filter-header' }, [
        h('span', { class: 'header-title' }, column.title),
        h(ElInput, {
          modelValue: deputyChipFilter.value,
          'onUpdate:modelValue': (val) => (deputyChipFilter.value = val),
          placeholder: '筛选',
          size: 'small',
          class: 'filter-input',
          clearable: true
        })
      ])
    }
  },
  createNumberFilterHeader('OUTSOURCING_WIP_QTY', 'B芯在途'),
  createNumberFilterHeader('TOTAL_B_RAW_MATERIALS', 'B芯库存')
]

// 列显示控制
const defaultColumnVisible = {
  ROW: true, // 行号
  MAIN_CHIP: true, // 主晶圆
  CHIP_NAME: true, // 芯片名称
  TOTAL_FINISHED_GOODS: true, // 产成品库存
  TOP_FINISHED_GOODS: false, // 正印产成品
  BACK_FINISHED_GOODS: false, // 背印产成品
  TOTAL_SEMI_MANUFACTURED: true, // 总半成品
  TOP_SEMI_MANUFACTURED: false, // 正印半成品
  BACK_SEMI_MANUFACTURED: false, // 背印半成品
  PACKAGE_WIP_QTY: true, // 封装在制数
  PACKAGE_TOP_WIP_QTY: false, // 正印封装
  PACKAGE_BACK_WIP_QTY: false, // 背印封装
  SG_QTY: true, // 苏工院库存
  SG_FINISHED_GOODS: false, // 苏工院产成品
  SG_SEMI_MANUFACTURED: false, // 苏工院半成品
  SECONDARY_OUTSOURCING_WIP_QTY: true, // 二次委外
  PURCHASE_WIP_QTY: true, // 采购数量
  CP_WIP_QTY: true, // 中测数量
  TOTAL_RAW_MATERIALS: true, // 原材料总数
  NO_TESTED_WAFER: false, // 未测晶圆
  TESTED_WAFER: false, // 已测晶圆
  DEPUTY_CHIP: true, // 副芯片
  OUTSOURCING_WIP_QTY: true, // 外购在途
  TOTAL_B_RAW_MATERIALS: true // 外购库存
}

const columnVisible = ref<{ [key: string]: boolean }>(defaultColumnVisible)

// 全选状态
const isAllSelected = computed(() => {
  return Object.values(columnVisible.value).every((v) => v)
})

// 是否部分选中
const isIndeterminate = computed(() => {
  const values = Object.values(columnVisible.value)
  return values.some((v) => v) && !values.every((v) => v)
})

// 处理全选/取消全选
const handleCheckAll = (val: boolean) => {
  Object.keys(columnVisible.value).forEach((key) => {
    columnVisible.value[key] = val
  })
}

// 当前显示的列
const columns = computed(() => {
  return allColumns.filter((col) => columnVisible.value[col.key])
})

// 切换列显示状态
const handleColumnVisibleChange = (key: string, value: boolean | string | number) => {
  // 如果要隐藏列，先检查是否至少还有一列显示
  if (!value && Object.values(columnVisible.value).filter((v) => v).length <= 1) {
    return
  }
  columnVisible.value[key] = Boolean(value)
}

// 获取报表数据
const getReportData = async () => {
  try {
    loading.value = true
    const res = await getGlobalReportApi()
    reportData.value = Array.isArray(res.data) ? res.data : [res.data]
  } catch (error) {
    console.error('获取报表数据失败:', error)
    ElMessage.error('获取报表数据失败')
  } finally {
    loading.value = false
  }
}

// 导出报表
const handleExport = async () => {
  try {
    ElMessage.info('正在导出，请稍候...')
    const res = (await exportGlobalReportApi()) as unknown as AxiosResponse
    // 如果是文件流，直接创建blob
    const blob = new Blob([res.data], { type: 'application/vnd.ms-excel' })
    const disposition = res.headers?.['content-disposition']
    let filename = `外协报表_${new Date().getTime()}.xlsx`
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

// 单元格属性
const cellProps = ({ columnIndex }) => {
  const key = `hovering-col-${columnIndex}`
  return {
    ['data-key']: key,
    onMouseenter: () => {
      kls.value = key
    },
    onMouseleave: () => {
      kls.value = ''
    }
  }
}

// 定义需要合并的列数据键
const mergeColumns = [
  'MAIN_CHIP',
  'PURCHASE_WIP_QTY',
  'CP_WIP_QTY',
  'TOTAL_RAW_MATERIALS',
  'NO_TESTED_WAFER',
  'TESTED_WAFER'
]

const rowHeight = 50

// 自定义行组件，根据 RN 与 MAIN_CHIP_COUNT 控制合并
const Row = ({ rowData, cells, columns }) => {
  // 对需要合并的每个列进行处理
  mergeColumns.forEach((dataKey) => {
    // 找到当前列在 columns 中的索引
    const colIndex = columns.findIndex((col) => col.dataKey === dataKey)
    if (colIndex === -1) return

    if (rowData.RN === 1) {
      // 如果是分组的第一行，则计算合并高度
      const span = rowData.MAIN_CHIP_COUNT
      const cell = cells[colIndex]
      const style = {
        ...cell.props.style,
        backgroundColor: 'var(--el-bg-color)',
        height: `${span * rowHeight - 1}px`, // 跨行高度
        alignSelf: 'flex-start',
        zIndex: 1
      }
      // 更新 cell 的样式
      cells[colIndex] = cloneVNode(cell, { style })
    } else {
      // 非第一行保持单元格但隐藏内容
      const cell = cells[colIndex]
      const style = {
        ...cell.props.style,
        visibility: 'hidden',
        pointerEvents: 'none'
      }
      cells[colIndex] = cloneVNode(cell, { style })
    }
  })
  return cells
}

onMounted(() => {
  getReportData()
})
</script>

<template>
  <ContentWrap title="外协报表">
    <div class="report-container">
      <!-- 操作栏 -->
      <div class="operation-bar">
        <ElButton type="primary" @click="getReportData">
          <Icon icon="vi-icon-park-outline:refresh" class="mr-2" />
          刷新数据
        </ElButton>
        <ElButton type="success" @click="handleExport">
          <Icon icon="vi-vscode-icons:file-type-excel" class="mr-2" />
          导出Excel
        </ElButton>
        <ElPopover placement="bottom" :width="300" trigger="click">
          <template #reference>
            <ElButton>
              <Icon icon="vi-ic:baseline-view-column" class="mr-2" />
              展开详细列
            </ElButton>
          </template>
          <div class="column-selector">
            <div class="select-all-row">
              <ElCheckbox
                v-model="isAllSelected"
                :indeterminate="isIndeterminate"
                @change="handleCheckAll"
              >
                全选
              </ElCheckbox>
            </div>
            <div class="columns-container">
              <ElCheckbox
                v-for="col in allColumns"
                :key="col.key"
                v-model="columnVisible[col.key]"
                :disabled="
                  columnVisible[col.key] &&
                  Object.values(columnVisible).filter((v) => v).length <= 1
                "
                @change="(value) => handleColumnVisibleChange(col.key, value)"
              >
                {{ col.title }}
              </ElCheckbox>
            </div>
          </div>
        </ElPopover>
      </div>

      <!-- 报表内容 -->
      <div class="report-content">
        <div v-if="loading" class="app-loading">
          <div class="app-loading-wrap">
            <div class="app-loading-title">数据量较大,通常加载需要5~6秒钟，请稍候...</div>
            <div class="app-loading-item">
              <div class="app-loading-outter"></div>
              <div class="app-loading-inner"></div>
            </div>
          </div>
        </div>
        <ElAutoResizer v-else>
          <template #default="{ height, width }">
            <ElTableV2
              :cache="15"
              ref="tableRef"
              :columns="columns"
              :data="filteredData"
              :width="width"
              :height="height"
              fixed
              :row-class="() => 'table-row'"
              :header-class="() => 'table-header'"
              :cell-props="cellProps"
              :class="kls"
            >
              <template #row="props">
                <Row v-bind="props" />
              </template>
            </ElTableV2>
          </template>
        </ElAutoResizer>
      </div>
    </div>

    <!-- 添加详情弹窗 -->
    <ResizeDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      :fullscreen="false"
      :initWidth="1000"
      :initHeight="400"
      @close="handleDialogClose"
    >
      <div class="detail-content" v-if="currentRow && currentColumn">
        <div class="detail-item">
          <span class="label">A芯名称:</span>
          <span class="value">{{ currentRow.MAIN_CHIP }}</span>
        </div>
        <div class="detail-item">
          <span class="label">芯片名称:</span>
          <span class="value">{{ currentRow.CHIP_NAME }}</span>
        </div>
        <div class="detail-item">
          <span class="label">{{ currentColumn.title }}:</span>
          <span class="value">{{ currentRow[currentColumn.param1_name] }}</span>
        </div>

        <!-- 库存数据表格 -->
        <ElTable
          v-if="currentColumn.type === 'stock' && dialogData"
          :data="dialogData"
          style="margin-top: 20px"
          border
        >
          <ElTableColumn prop="FEATURE_GROUP_NAME" label="品号群组" width="200" align="center" />
          <ElTableColumn prop="ITEM_CODE" label="品号" width="250" align="center" />
          <ElTableColumn prop="LOT_CODE" label="批号" width="200" align="center" />
          <ElTableColumn prop="WAREHOUSE_NAME" label="仓库" width="180" align="center" />
          <ElTableColumn
            prop="INVENTORY_QTY"
            label="库存数量"
            align="center"
            width="100"
            fixed="right"
          />
          <ElTableColumn
            prop="SECOND_QTY"
            label="第二数量"
            width="100"
            align="center"
            fixed="right"
          />
          <ElTableColumn
            prop="Z_TESTING_PROGRAM_NAME"
            label="测试程序"
            width="100"
            align="center"
          />
          <ElTableColumn prop="Z_BURNING_PROGRAM_NAME" label="烧录程序" align="center" />
        </ElTable>

        <!-- 封装在制品数据表格 -->
        <ElTable
          v-if="currentColumn.type === 'assyWip' && dialogData"
          :data="dialogData"
          style="width: 100%; margin-top: 20px"
          border
        >
          <ElTableColumn prop="DOC_NO" label="订单号" width="150" align="center" />
          <ElTableColumn prop="ITEM_CODE" label="物料编码" width="250" align="center" />
          <ElTableColumn
            prop="EXPECTED_DELIVERY_DATE"
            label="预计交期"
            width="120"
            align="center"
          />
          <ElTableColumn prop="CURRENT_PROCESS" label="当前工序" width="120" align="center" />
          <ElTableColumn prop="ONLINE_TOTAL" label="在线合计" width="100" align="center" />
          <ElTableColumn prop="WAREHOUSE_INVENTORY" label="仓库库存" width="100" align="center" />
        </ElTable>

        <!-- 采购在制品数据表格 -->
        <ElTable
          v-if="currentColumn.type === 'purchaseWip' && dialogData"
          :data="dialogData"
          style="margin-top: 20px"
          border
        >
          <ElTableColumn prop="purchaseOrder" label="订单号" width="100" align="center" />
          <ElTableColumn prop="itemName" label="晶圆名称" width="120" align="center" />
          <ElTableColumn prop="lot" label="批次" width="120" align="center" />
          <ElTableColumn prop="qty" label="数量" width="120" align="center" />
          <ElTableColumn prop="status" label="状态" width="120" align="center" />
          <ElTableColumn prop="stage" label="当前阶段" width="100" align="center" />
          <ElTableColumn
            prop="forecastDate"
            label="预计交期"
            width="120"
            fixed="right"
            align="center"
          />
        </ElTable>
      </div>
    </ResizeDialog>
  </ContentWrap>
</template>

<style lang="less" scoped>
.operation-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.report-content {
  width: 100%;
  height: 700px;
  overflow: hidden;

  :deep(.el-table-v2) {
    overflow: hidden;
    font-size: 15px;
    border: 1px solid var(--el-border-color) !important;
    border-radius: 4px;

    .table-header {
      font-size: 16px;
      font-weight: bold;
      color: var(--el-text-color-primary);
      border-bottom: 1px solid var(--el-border-color);
    }

    .el-table-v2__header-cell {
      border-right: 1px solid var(--el-border-color);
      border-bottom: 1px solid var(--el-border-color);
    }

    .el-table-v2__row-cell {
      border-right: 1px solid var(--el-border-color);
      border-bottom: 1px solid var(--el-border-color);
      transition: background-color 0.25s ease;

      .number-cell {
        font-weight: 600;
        color: var(--el-color-primary);

        &.clickable {
          text-decoration: underline;
          cursor: pointer;

          &:hover {
            color: var(--el-color-primary-dark-2);
            background-color: var(--el-fill-color-light);
          }
        }
      }
    }
  }
}

:deep(.hovering-col-0) [data-key='hovering-col-0'],
:deep(.hovering-col-1) [data-key='hovering-col-1'],
:deep(.hovering-col-2) [data-key='hovering-col-2'],
:deep(.hovering-col-3) [data-key='hovering-col-3'],
:deep(.hovering-col-4) [data-key='hovering-col-4'],
:deep(.hovering-col-5) [data-key='hovering-col-5'],
:deep(.hovering-col-6) [data-key='hovering-col-6'],
:deep(.hovering-col-7) [data-key='hovering-col-7'],
:deep(.hovering-col-8) [data-key='hovering-col-8'],
:deep(.hovering-col-9) [data-key='hovering-col-9'],
:deep(.hovering-col-10) [data-key='hovering-col-10'],
:deep(.hovering-col-11) [data-key='hovering-col-11'],
:deep(.hovering-col-12) [data-key='hovering-col-12'],
:deep(.hovering-col-13) [data-key='hovering-col-13'],
:deep(.hovering-col-14) [data-key='hovering-col-14'],
:deep(.hovering-col-15) [data-key='hovering-col-15'],
:deep(.hovering-col-16) [data-key='hovering-col-16'],
:deep(.hovering-col-17) [data-key='hovering-col-17'],
:deep(.hovering-col-18) [data-key='hovering-col-18'],
:deep(.hovering-col-19) [data-key='hovering-col-19'],
:deep(.hovering-col-20) [data-key='hovering-col-20'],
:deep(.hovering-col-21) [data-key='hovering-col-21'],
:deep(.hovering-col-22) [data-key='hovering-col-22'],
:deep(.hovering-col-23) [data-key='hovering-col-23'] {
  background: var(--el-table-row-hover-bg-color);
}

.column-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px;

  .select-all-row {
    padding-bottom: 8px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .columns-container {
    display: grid;
    max-height: 400px;
    overflow-y: auto;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  :deep(.el-checkbox) {
    width: 100%;
    height: 24px;
    margin-right: 0;

    .el-checkbox__label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.el-input__wrapper {
  height: 18px;
}

.filter-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 4px;

  .header-title {
    font-weight: bold;
  }

  .number-filter-container {
    width: 100%;

    .filter-input {
      width: 100%;

      :deep(.el-input__inner) {
        padding: 0 8px;
        text-align: center;

        &::placeholder {
          font-size: 12px;
        }
      }
    }
  }
}

.app-loading {
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background: var(--el-bg-color);
}

.app-loading-wrap {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  transform: translate3d(-50%, -50%, 0);
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.app-loading-title {
  margin-bottom: 30px;
  font-size: 20px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  text-align: center;
}

.app-loading-item {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 60px;
  vertical-align: middle;
  border-radius: 50%;
}

.app-loading-outter {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 4px solid var(--el-color-primary);
  border-bottom: 0;
  border-left-color: transparent;
  border-radius: 50%;
  animation: loader-outter 1s cubic-bezier(0.42, 0.61, 0.58, 0.41) infinite;
}

.app-loading-inner {
  position: absolute;
  top: calc(50% - 20px);
  left: calc(50% - 20px);
  width: 40px;
  height: 40px;
  border: 4px solid var(--el-color-primary-light-3);
  border-right: 0;
  border-top-color: transparent;
  border-radius: 50%;
  animation: loader-inner 1s cubic-bezier(0.42, 0.61, 0.58, 0.41) infinite;
}

@keyframes loader-outter {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@keyframes loader-inner {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(-360deg);
  }
}

.detail-content {
  padding: 20px;
  background-color: var(--el-bg-color);

  .detail-item {
    display: flex;
    margin-bottom: 16px;
    line-height: 1.5;

    .label {
      width: 100px;
      font-weight: bold;
      color: var(--el-text-color-secondary);
    }

    .value {
      flex: 1;
      color: var(--el-text-color-primary);
    }
  }
}
</style>
