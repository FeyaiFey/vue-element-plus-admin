<script setup lang="ts">
import { computed, ref, PropType } from 'vue'
import { ElTable, ElTableColumn, ElButton, ElInput } from 'element-plus'
import { Icon } from '@/components/Icon'
import { useDesign } from '@/hooks/web/useDesign'
import { SopData } from '@/api/report/types'

// 使用设计系统
const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('sop-table')

// 定义 props
const props = defineProps({
  tableData: {
    type: Array as PropType<SopData[]>,
    default: () => []
  },
  enableSelection: {
    type: Boolean,
    default: false
  },
  tableHeight: {
    type: String,
    default: 'auto'
  }
})

// 定义 emits
const emit = defineEmits(['selection-change', 'add-click'])

// 表格引用
const tableRef = ref()

// 表格数据（带筛选）
const tableData = computed(() => {
  let filteredData = props.tableData

  // 品名筛选
  if (itemNameFilter.value) {
    filteredData = filteredData.filter((item) =>
      item.itemName?.toLowerCase().includes(itemNameFilter.value.toLowerCase())
    )
  }

  return filteredData
})

// 选中合计数据
const summaryData = ref({
  count: 0
})

// 品名筛选输入框的值
const itemNameFilter = ref('')

// ABTR筛选选项
const abtrFilters = [
  { text: '编带', value: '编带' },
  { text: '管装', value: '管装' }
]

// ABTR筛选方法
const filterAbtr = (value: string, row: SopData) => {
  return row.abtr === value
}

// 清空品名筛选
const clearItemNameFilter = () => {
  itemNameFilter.value = ''
}

// 根据表格类型定义显示的列
const detailColumns = [
  {
    prop: 'row',
    label: '行号',
    minWidth: 60,
    fixed: 'left',
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'itemName',
    label: '品名',
    minWidth: 195,
    headerAlign: 'center',
    align: 'right',
    fixed: 'left'
  },
  {
    prop: 'abtr',
    label: '编带/管装',
    minWidth: 100,
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'safeStock',
    label: '安全库存',
    minWidth: 120,
    headerAlign: 'center',
    align: 'right'
  },
  {
    prop: 'lastMonthSaleQty',
    label: '上月销量',
    minWidth: 120,
    headerAlign: 'center',
    align: 'right'
  },
  {
    prop: 'cpQty',
    label: '产成品库存',
    minWidth: 120,
    headerAlign: 'center',
    align: 'right'
  },
  {
    prop: 'bcQty',
    label: '半成品库存',
    minWidth: 120,
    headerAlign: 'center',
    align: 'right'
  },
  {
    prop: 'wipQtyWithoutStock',
    label: '封装数量',
    minWidth: 120,
    headerAlign: 'center',
    align: 'right'
  },
  {
    prop: 'packagingQty',
    label: '封装厂库存',
    minWidth: 120,
    headerAlign: 'center',
    align: 'right'
  },
  {
    prop: 'totalStock',
    label: '总库存',
    minWidth: 120,
    headerAlign: 'center',
    align: 'right'
  },
  {
    prop: 'inventoryGap',
    label: '库存缺口',
    minWidth: 120,
    headerAlign: 'center',
    align: 'right'
  },
  {
    prop: 'inventoryGapTotal',
    label: '总库存缺口',
    minWidth: 120,
    headerAlign: 'center',
    align: 'right'
  },
  {
    prop: 'operations',
    label: '操作',
    minWidth: 80,
    headerAlign: 'center',
    align: 'center'
  }
]

// 当前显示的列
const currentColumns = computed(() => {
  return detailColumns
})

// 格式化数字
const formatNumber = (value: number): string => {
  if (value === null || value === undefined) return '0'
  return value.toLocaleString()
}

// 选择变化事件处理
const handleSelectionChange = (selection: SopData[]) => {
  emit('selection-change', selection)
  summaryData.value.count = selection.length
}

// 处理操作按钮点击事件
const handleAddClick = (row: SopData) => {
  emit('add-click', row)
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
  <div
    :class="prefixCls"
    class="h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg overflow-hidden"
  >
    <ElTable
      ref="tableRef"
      :data="tableData"
      :height="tableHeight"
      border
      stripe
      class="flex-1"
      size="small"
      highlight-current-row
      @selection-change="handleSelectionChange"
    >
      <!-- 选择列 -->
      <ElTableColumn
        v-if="enableSelection"
        type="selection"
        width="50"
        align="center"
        fixed="left"
      />

      <!-- 选中合计行 -->
      <template #append>
        <div class="selection-summary-row">
          <div class="summary-content">
            <span class="summary-label">选中合计 ({{ summaryData.count }} 条):</span>
          </div>
        </div>
      </template>

      <!-- 数据列 -->
      <template v-for="column in currentColumns" :key="column.prop">
        <!-- 品名列（可输入筛选） -->
        <ElTableColumn
          v-if="column.prop === 'itemName'"
          :prop="column.prop"
          :label="column.label"
          :min-width="column.minWidth"
          :fixed="column.fixed"
          :align="column.align || 'left'"
          show-overflow-tooltip
        >
          <template #header>
            <div class="flex justify-between gap-2">
              <span class="ml-10px">品名</span>
              <ElInput
                v-model="itemNameFilter"
                placeholder="筛选..."
                size="small"
                clearable
                @clear="clearItemNameFilter"
                style="max-width: 120px"
              >
                <template #prefix>
                  <Icon icon="vi-ep:search" :size="12" />
                </template>
              </ElInput>
            </div>
          </template>
          <template #default="{ row }">
            <span class="text-gray-700 dark:text-gray-200">
              {{ row[column.prop] || '-' }}
            </span>
          </template>
        </ElTableColumn>

        <!-- ABTR列（可筛选） -->
        <ElTableColumn
          v-else-if="column.prop === 'abtr'"
          :prop="column.prop"
          :label="column.label"
          :min-width="column.minWidth"
          :fixed="column.fixed"
          :align="column.align || 'left'"
          :filters="abtrFilters"
          :filter-method="filterAbtr"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span class="text-gray-700 dark:text-gray-200">
              {{ row[column.prop] || '-' }}
            </span>
          </template>
        </ElTableColumn>

        <!-- 库存缺口列（可排序） -->
        <ElTableColumn
          v-else-if="column.prop === 'inventoryGap' || column.prop === 'inventoryGapTotal'"
          :prop="column.prop"
          :label="column.label"
          :min-width="column.minWidth"
          :fixed="column.fixed"
          :align="column.align || 'left'"
          sortable
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span
              :class="['inventory-gap', `level-${getInventoryGapLevel(Number(row[column.prop]))}`]"
            >
              {{ formatNumber(row[column.prop]) }}
            </span>
            <span v-if="!row[column.prop]" class="text-gray-500">-</span>
          </template>
        </ElTableColumn>

        <!-- 其他列 -->
        <ElTableColumn
          v-else
          :prop="column.prop"
          :label="column.label"
          :min-width="column.minWidth"
          :fixed="column.fixed"
          :align="column.align || 'left'"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <!-- 操作列 -->
            <div v-if="column.prop === 'operations'" class="operations-container">
              <ElButton
                type="primary"
                size="small"
                @click="handleAddClick(row)"
                :disabled="!row.itemName"
              >
                <Icon icon="vi-tdesign:plus" class="mr-1" />
                下单
              </ElButton>
            </div>
            <!-- 需要格式化的数字字段 -->
            <template
              v-else-if="
                [
                  'safeStock',
                  'lastMonthSaleQty',
                  'cpQty',
                  'bcQty',
                  'wipQtyWithoutStock',
                  'packagingQty',
                  'totalStock'
                ].includes(column.prop)
              "
            >
              <span class="font-medium text-gray-900 dark:text-gray-100">
                {{ formatNumber(row[column.prop]) }}
              </span>
            </template>
            <!-- 其他字段普通文本显示 -->
            <span v-else class="text-gray-700 dark:text-gray-200">
              {{ row[column.prop] || '-' }}
            </span>
          </template>
        </ElTableColumn>
      </template>

      <!-- 空数据插槽 -->
      <template #empty>
        <div
          :class="`${prefixCls}__empty`"
          class="h-full min-h-200px flex items-center justify-center"
        >
          <div class="text-center">
            <Icon icon="ep:document" :size="48" class="text-gray-300 dark:text-gray-600 mb-4" />
            <p class="m-0 text-gray-500 dark:text-gray-400 text-14px"> 暂无数据 </p>
          </div>
        </div>
      </template>
    </ElTable>
  </div>
</template>

<style scoped lang="less">
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
// 响应式设计
@media (width <= 768px) {
  .@{prefix-cls} {
    box-shadow: 0 1px 4px rgb(0 0 0 / 6%);

    :deep(.el-table) {
      .el-table__header-wrapper .el-table__header th {
        padding: 8px 4px;
        font-size: 12px;

        &:not(:last-child)::after {
          display: none;
        }
      }

      .el-table__body-wrapper .el-table__row {
        .el-table__cell {
          padding: 8px 4px;
          font-size: 12px;
        }

        &:hover {
          transform: none;
          box-shadow: none;
        }
      }
    }

    .operations-container {
      :deep(.ElButton) {
        min-width: 60px;
        padding: 4px 8px;
        font-size: 11px;
      }
    }
  }
}

// 打印样式
@media print {
  .@{prefix-cls} {
    box-shadow: none;

    :deep(.el-table) {
      .el-table__body-wrapper .el-table__row:hover {
        background-color: transparent;
        transform: none;
        box-shadow: none;
      }
    }
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

// 选中合计行样式
.selection-summary-row {
  padding: 12px 16px;
  font-size: 13px;
  background-color: var(--el-fill-color-lighter);
  border-top: 2px solid var(--el-border-color);

  .summary-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    flex-wrap: nowrap;

    .summary-label {
      margin-right: 10px;
      font-weight: 700;
      color: var(--el-color-primary);
    }

    .summary-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 500;
      color: var(--el-text-color-primary);

      .summary-value {
        width: 60px;
        font-weight: 700;
        color: var(--el-color-success);
      }
    }
  }
}

:deep(.el-table) {
  flex: 1;

  // 表头样式
  .el-table__header-wrapper {
    .el-table__header {
      th {
        font-size: 13px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        text-align: center;
        background-color: var(--el-fill-color-light);
      }
    }
  }

  // 表格行样式
  .el-table__body-wrapper {
    .el-table__row {
      font-size: 13px;

      &:hover {
        background-color: var(--el-fill-color-light);
      }

      .el-table__cell {
        padding: 8px 0;
      }
    }
  }

  .el-table__empty-block {
    display: flex;
    height: 100%;
    align-items: center;
    justify-content: center;
  }
}

.empty-data {
  display: flex;
  height: 100%;
  min-height: 200px;
  align-items: center;
  justify-content: center;

  .empty-content {
    text-align: center;

    .empty-icon {
      margin-bottom: 16px;
      color: var(--el-text-color-placeholder);
    }

    .empty-text {
      margin: 0;
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }
  }
}

// 操作列样式
.operations-container {
  display: flex;
  flex-direction: row;
  gap: 4px;
  align-items: center;
  justify-content: center;

  :deep(.ElButton) {
    min-width: 70px;
    margin: 0;

    &.is-disabled {
      opacity: 0.5;
    }
  }
}

// 品名筛选输入框样式
:deep(.el-table) {
  .el-table__header-wrapper {
    .el-table__header {
      th {
        // 为品名列的自定义表头调整样式
        &:nth-child(2) {
          .cell {
            padding: 8px 4px;

            .flex.items-center {
              justify-content: flex-start;

              span {
                margin-right: 8px;
                font-weight: 600;
                color: var(--el-text-color-primary);
                white-space: nowrap;
              }

              .el-input {
                .el-input__wrapper {
                  height: 24px;
                  padding: 2px 6px;
                  font-size: 12px;
                }

                .el-input__inner {
                  height: 20px;
                  font-size: 12px;
                  line-height: 20px;
                }
              }
            }
          }
        }
      }
    }
  }
}

// 暗色主题适配
.dark .@{prefix-cls} {
  :deep(.el-table) {
    .el-table__header-wrapper .el-table__header th {
      background: linear-gradient(
        135deg,
        var(--el-fill-color-dark) 0%,
        var(--el-fill-color-darker) 100%
      );
    }

    .el-table__body-wrapper .el-table__row {
      &:hover {
        background-color: var(--el-fill-color-dark);
      }

      &.el-table__row--striped {
        background-color: var(--el-fill-color-darker);
      }
    }
  }
}
@prefix-cls: ~'@{adminNamespace}-sop-table';
</style>
