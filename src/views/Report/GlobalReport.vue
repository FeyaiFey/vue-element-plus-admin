<script setup lang="ts">
import { ref, onMounted, computed, h } from 'vue'
import { ContentWrap } from '@/components/ContentWrap'
import {
  ElTableV2,
  ElButton,
  ElMessage,
  ElAutoResizer,
  ElPopover,
  ElCheckbox,
  ElInput
} from 'element-plus'
import { getGlobalReportApi, exportGlobalReportApi } from '@/api/report'
import type { GlobalReport } from '@/api/report/type'
import { Icon } from '@/components/Icon'
import type { Column } from 'element-plus'
import { AxiosResponse } from 'axios'

// 报表数据
const reportData = ref<GlobalReport[]>([])
const loading = ref(false)
const tableRef = ref()
const kls = ref<string>('')

// 过滤器状态
const mainChipFilter = ref('')
const chipNameFilter = ref('')

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
  NO_TESTED_WAFER: { expression: '' },
  TESTED_WAFER: { expression: '' },
  DEPUTY_CHIP: { expression: '' },
  OUTSOURCING_WIP_QTY: { expression: '' },
  OUTSOURCING_WAFER: { expression: '' }
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

    // 数字列过滤
    const numberFilterMatch = Object.entries(numberFilters.value).every(([key, filter]) => {
      if (!filter.expression) return true
      const value = Number(row[key])
      if (isNaN(value)) return true

      const parsedFilter = parseNumberFilter(filter.expression)
      return evaluateNumberFilter(value, parsedFilter)
    })

    return mainChipMatch && chipNameMatch && numberFilterMatch
  })
})

// 创建数字列过滤器渲染器
const createNumberFilterHeader = (key: string, title: string) => ({
  key,
  dataKey: key,
  title,
  width: 120,
  align: 'center' as const,
  headerAlign: 'center' as const,
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
    title: '主晶圆',
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
  createNumberFilterHeader('NO_TESTED_WAFER', '未测晶圆'),
  createNumberFilterHeader('TESTED_WAFER', '已测晶圆'),
  createNumberFilterHeader('DEPUTY_CHIP', '副芯片'),
  createNumberFilterHeader('OUTSOURCING_WIP_QTY', '外购在途'),
  createNumberFilterHeader('OUTSOURCING_WAFER', '外购库存')
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
  NO_TESTED_WAFER: true, // 未测晶圆
  TESTED_WAFER: true, // 已测晶圆
  DEPUTY_CHIP: true, // 副芯片
  OUTSOURCING_WIP_QTY: true, // 外购在途
  OUTSOURCING_WAFER: true // 外购库存
}

const columnVisible = ref<{ [key: string]: boolean }>(defaultColumnVisible)

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
            <ElCheckbox
              v-for="col in allColumns"
              :key="col.key"
              v-model="columnVisible[col.key]"
              :disabled="
                columnVisible[col.key] && Object.values(columnVisible).filter((v) => v).length <= 1
              "
              @change="(value) => handleColumnVisibleChange(col.key, value)"
            >
              {{ col.title }}
            </ElCheckbox>
          </div>
        </ElPopover>
      </div>

      <!-- 报表内容 -->
      <div class="report-content">
        <ElAutoResizer>
          <template #default="{ height, width }">
            <ElTableV2
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
              v-loading="loading"
            />
          </template>
        </ElAutoResizer>
      </div>
    </div>
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
    font-size: 13px;

    .table-header {
      height: 80px;
      font-size: 14px;
      font-weight: bold;
      color: var(--el-text-color-primary);
      background-color: var(--el-color-primary-light-9);
    }

    .table-row {
      td {
        padding: 6px 0;
        font-size: 13px;
      }
    }

    .el-table-v2__cell {
      &.number-cell {
        font-weight: 600;
        color: var(--el-color-primary);
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
:deep(.hovering-col-22) [data-key='hovering-col-22'] {
  background: var(--el-table-row-hover-bg-color);
}

:deep(.el-table-v2__cell) {
  border-right: 1px solid var(--el-border-color-lighter);
  transition: background-color 0.25s ease;
}

.column-selector {
  display: grid;
  max-height: 400px;
  padding: 8px;
  overflow-y: auto;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;

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
</style>
