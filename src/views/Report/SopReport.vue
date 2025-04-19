<script setup lang="tsx">
import { ref, onMounted, computed } from 'vue'
import {
  ElTable,
  ElTableColumn,
  ElRow,
  ElCol,
  ElInput,
  ElSelect,
  ElOption,
  ElSkeleton,
  ElButton
} from 'element-plus'
import { getSopAnalyzeApi } from '@/api/report'
import type { SopAnalyzeResponse } from '@/api/report/type'
import { Icon } from '@/components/Icon'

const sopAnalyzeData = ref<SopAnalyzeResponse[]>([])
const loading = ref(false)

// 添加筛选状态
const filters = ref<Record<string, string>>({
  itemName: '',
  abtr: '',
  safeStock: '',
  lastMonthSale: '',
  cpQty: '',
  bcQty: '',
  wipQty: '',
  assyStock: '',
  totalStock: '',
  inventoryGap: ''
})

// ABTR选项
const abtrOptions = [
  { label: '全部', value: '' },
  { label: '管装', value: '管装' },
  { label: '编带', value: '编带' }
]

// 列配置
const columns = ref([
  { prop: 'ID', label: 'ID', width: 100, align: 'center', isNumber: false, filterKey: 'id' },
  {
    prop: 'ITEM_NAME',
    label: '品名',
    width: 200,
    align: 'right',
    isNumber: false,
    filterKey: 'itemName'
  },
  {
    prop: 'ABTR',
    label: '管装/编带',
    width: 150,
    align: 'center',
    isNumber: false,
    filterKey: 'abtr'
  },
  {
    prop: 'SAFE_STOCK',
    label: '安全库存值',
    width: 120,
    align: 'right',
    isNumber: true,
    filterKey: 'safeStock',
    sortable: true
  },
  {
    prop: 'LAST_MONTH_SALE',
    label: '上月销售量',
    width: 120,
    align: 'right',
    isNumber: true,
    filterKey: 'lastMonthSale',
    sortable: true
  },
  {
    prop: 'CP_QTY',
    label: '产成品库存',
    width: 120,
    align: 'right',
    isNumber: true,
    filterKey: 'cpQty',
    sortable: true
  },
  {
    prop: 'BC_QTY',
    label: '半成品库存',
    width: 120,
    align: 'right',
    isNumber: true,
    filterKey: 'bcQty',
    sortable: true
  },
  {
    prop: 'WIP_QTY_WITHOUT_STOCK',
    label: '封装数量',
    width: 120,
    align: 'right',
    isNumber: true,
    filterKey: 'wipQty',
    sortable: true
  },
  {
    prop: 'ASSY_STOCK',
    label: '封装厂库存',
    width: 120,
    align: 'right',
    isNumber: true,
    filterKey: 'assyStock',
    sortable: true
  },
  {
    prop: 'TOTAL_STOCK',
    label: '总库存',
    width: 120,
    align: 'right',
    isNumber: true,
    filterKey: 'totalStock',
    sortable: true
  },
  {
    prop: 'INVENTORT_GAP',
    label: '库存缺口',
    width: 150,
    align: 'right',
    isNumber: true,
    filterKey: 'inventoryGap',
    sortable: true
  }
])

// 数字格式化函数
const formatNumber = (value: number | string) => {
  if (value === null || value === undefined) return ''
  const num = Number(value)
  if (isNaN(num)) return value
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })
}

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
  return sopAnalyzeData.value.filter((row) => {
    // 品名过滤
    if (
      filters.value.itemName &&
      !String(row.ITEM_NAME).toLowerCase().includes(filters.value.itemName.toLowerCase())
    ) {
      return false
    }

    // ABTR过滤
    if (filters.value.abtr && row.ABTR !== filters.value.abtr) {
      return false
    }

    // 安全库存值过滤
    if (filters.value.safeStock) {
      const filter = parseNumberFilter(filters.value.safeStock)
      if (!evaluateNumberFilter(Number(row.SAFE_STOCK), filter)) {
        return false
      }
    }

    // 上月销售量过滤
    if (filters.value.lastMonthSale) {
      const filter = parseNumberFilter(filters.value.lastMonthSale)
      if (!evaluateNumberFilter(Number(row.LAST_MONTH_SALE), filter)) {
        return false
      }
    }

    // 产成品库存过滤
    if (filters.value.cpQty) {
      const filter = parseNumberFilter(filters.value.cpQty)
      if (!evaluateNumberFilter(Number(row.CP_QTY), filter)) {
        return false
      }
    }

    // 半成品库存过滤
    if (filters.value.bcQty) {
      const filter = parseNumberFilter(filters.value.bcQty)
      if (!evaluateNumberFilter(Number(row.BC_QTY), filter)) {
        return false
      }
    }

    // 封装数量过滤
    if (filters.value.wipQty) {
      const filter = parseNumberFilter(filters.value.wipQty)
      if (!evaluateNumberFilter(Number(row.WIP_QTY_WITHOUT_STOCK), filter)) {
        return false
      }
    }

    // 封装厂库存过滤
    if (filters.value.assyStock) {
      const filter = parseNumberFilter(filters.value.assyStock)
      if (!evaluateNumberFilter(Number(row.ASSY_STOCK), filter)) {
        return false
      }
    }

    // 总库存过滤
    if (filters.value.totalStock) {
      const filter = parseNumberFilter(filters.value.totalStock)
      if (!evaluateNumberFilter(Number(row.TOTAL_STOCK), filter)) {
        return false
      }
    }

    // 库存缺口过滤
    if (filters.value.inventoryGap) {
      const filter = parseNumberFilter(filters.value.inventoryGap)
      if (!evaluateNumberFilter(Number(row.INVENTORT_GAP), filter)) {
        return false
      }
    }

    return true
  })
})

// 获取筛选键
const getFilterKey = (prop: string) => {
  switch (prop) {
    case 'ITEM_NAME':
      return 'itemName'
    case 'ABTR':
      return 'abtr'
    case 'SAFE_STOCK':
      return 'safeStock'
    case 'LAST_MONTH_SALE':
      return 'lastMonthSale'
    case 'CP_QTY':
      return 'cpQty'
    case 'BC_QTY':
      return 'bcQty'
    case 'WIP_QTY_WITHOUT_STOCK':
      return 'wipQty'
    case 'ASSY_STOCK':
      return 'assyStock'
    case 'TOTAL_STOCK':
      return 'totalStock'
    case 'INVENTORT_GAP':
      return 'inventoryGap'
    default:
      return prop.toLowerCase()
  }
}

// 获取报表数据
const getReportData = async () => {
  try {
    loading.value = true
    const res = await getSopAnalyzeApi()
    sopAnalyzeData.value = Array.isArray(res.data) ? res.data : [res.data]
  } catch (error) {
    console.error('获取报表数据失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getReportData()
})

const handleSelectionChange = (val: SopAnalyzeResponse[]) => {
  console.log(
    '选中的行:',
    val.map((item) => item.ITEM_NAME)
  )
}

// 创建封装单
const handleCreatePackage = (row: any) => {
  console.log('创建封装单', row)
  // TODO: 实现创建封装单的逻辑
}

// 获取库存缺口等级
const getInventoryGapLevel = (value: number) => {
  if (value <= -500000) return 'critical'
  if (value <= -300000) return 'severe'
  if (value <= -100000) return 'warning'
  if (value < 0) return 'notice'
  return 'normal'
}
</script>

<template>
  <ElRow>
    <ElCol :span="24" class="flex justify-center items-center text-center">
      <span class="w-full text-3xl font-bold">产销协调报表(SOP Report)</span>
    </ElCol>
  </ElRow>
  <ElRow class="mt-6">
    <ElCol :span="24" class="flex justify-end mb-4">
      <ElButton type="primary" @click="getReportData">
        <Icon icon="vi-icon-park-outline:refresh" class="mr-2" />
        刷新数据
      </ElButton>
    </ElCol>
  </ElRow>
  <ElRow class="mt-2">
    <ElCol :span="24">
      <ElSkeleton v-if="loading" :rows="50" animated />
      <div v-else>
        <!-- 筛选行 -->
        <div class="filter-row">
          <div class="filter-cell" style="width: 50px"></div>
          <template v-for="col in columns" :key="col.prop">
            <div class="filter-cell" :style="{ width: col.width + 'px' }">
              <template v-if="col.prop === 'ABTR'">
                <ElSelect v-model="filters.abtr" size="small" class="filter-select" clearable>
                  <ElOption
                    v-for="option in abtrOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </ElSelect>
              </template>
              <ElInput
                v-else
                v-model="filters[getFilterKey(col.prop)]"
                :placeholder="col.isNumber ? '例如: >=100' : '筛选'"
                size="small"
                class="filter-input"
                clearable
              />
            </div>
          </template>
        </div>
        <!-- 数据表格 -->
        <ElTable
          :data="filteredData"
          height="calc(100vh - 300px)"
          style="width: 100%"
          border
          @selection-change="handleSelectionChange"
        >
          <ElTableColumn type="selection" width="50" header-align="center" align="center" />
          <ElTableColumn
            v-for="col in columns"
            :key="col.prop"
            :prop="col.prop"
            :label="col.label"
            :width="col.width"
            :align="col.align"
            :sortable="col.sortable"
            header-align="center"
          >
            <template #header>
              <div class="header-title">{{ col.label }}</div>
            </template>
            <template #default="{ row }">
              <template v-if="col.prop === 'INVENTORT_GAP'">
                <span
                  :class="['inventory-gap', `level-${getInventoryGapLevel(Number(row[col.prop]))}`]"
                >
                  {{ formatNumber(row[col.prop]) }}
                </span>
              </template>
              <template v-else>
                <span v-if="col.isNumber">{{ formatNumber(row[col.prop]) }}</span>
                <span v-else>{{ row[col.prop] }}</span>
              </template>
            </template>
          </ElTableColumn>
          <!-- 操作列 -->
          <ElTableColumn label="操作" align="center" header-align="center">
            <template #default="{ row }">
              <ElButton type="primary" size="small" @click="handleCreatePackage(row)">
                <Icon icon="vi-ri:add-line" class="mr-1" />
                创建封装单
              </ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
    </ElCol>
  </ElRow>
</template>

<style lang="less" scoped>
.header-title {
  display: inline;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.filter-row {
  display: flex;
  border: 1px solid var(--el-border-color-lighter);
}

.filter-cell {
  padding: 4px;
  text-align: center;
  border-right: 1px solid var(--el-border-color-lighter);

  &:last-child {
    border-right: none;
  }
}

.filter-input,
.filter-select {
  width: 100%;

  :deep(.el-input__inner) {
    height: 24px;
    padding: 0 8px;
    font-size: 12px;
    line-height: 24px;
  }
}

:deep(.el-table) {
  .el-button--small {
    padding: 4px 8px;
    font-size: 12px;
  }
}

.inventory-gap {
  display: inline-block;
  padding: 2px 8px;
  font-weight: 600;
  border-radius: 4px;

  &.level-critical {
    color: #fff;
    background-color: #f56c6c;
    animation: blink-critical 0.8s infinite;
  }

  &.level-severe {
    color: #fff;
    background-color: #e6a23c;
    animation: blink-severe 1.2s infinite;
  }

  &.level-warning {
    color: #fff;
    background-color: #f0c000;
    animation: blink-warning 1.6s infinite;
  }

  &.level-notice {
    color: #fff;
    background-color: #409eff;
    animation: blink-notice 2s infinite;
  }

  &.level-normal {
    color: #67c23a;
  }
}

@keyframes blink-critical {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.3;
  }
}

@keyframes blink-severe {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }
}

@keyframes blink-warning {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

@keyframes blink-notice {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.6;
  }
}
</style>
