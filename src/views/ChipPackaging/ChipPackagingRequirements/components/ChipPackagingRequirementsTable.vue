<script setup lang="ts">
import { computed, ref, PropType } from 'vue'
import { ElTable, ElTableColumn, ElTag, ElButton } from 'element-plus'
import { Icon } from '@/components/Icon'
import { useDesign } from '@/hooks/web/useDesign'
import { ChipPackagingRequirement } from '@/api/chipPackaging/types'

// 使用设计系统
const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('chip-packaging-requirements-table')

// 定义 props
const props = defineProps({
  tableData: {
    type: Array as PropType<ChipPackagingRequirement[]>,
    default: () => []
  },
  tableType: {
    type: String as PropType<'detail' | 'summary'>,
    default: 'detail'
  },
  loading: {
    type: Boolean,
    default: false
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
const emit = defineEmits([
  'selection-change',
  'summary-change',
  'packaging-order-click',
  'add-click',
  'cancel-click',
  'attach-order-click'
])

// 表格数据
const tableData = computed(() => props.tableData)

// 选中合计数据
const summaryData = ref({
  count: 0,
  businessQty: '0'
})

// 根据表格类型定义显示的列
const detailColumns = [
  {
    prop: 'id',
    label: 'ID',
    minWidth: 80,
    fixed: 'left',
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'itemName',
    label: '品名',
    minWidth: 250,
    headerAlign: 'center',
    align: 'center',
    fixed: 'left'
  },
  {
    prop: 'businessQty',
    label: '业务数量',
    minWidth: 120,
    headerAlign: 'center',
    align: 'right'
  },
  {
    prop: 'abtr',
    label: '管装/编带',
    minWidth: 120,
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'requirementType',
    label: '需求类型',
    minWidth: 120,
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'emergency',
    label: '紧急程度',
    minWidth: 120,
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'sales',
    label: '销售员',
    minWidth: 120,
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'status',
    label: '状态',
    minWidth: 120,
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'packagingOrders',
    label: '封装订单号',
    minWidth: 120,
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'remark',
    label: '销售备注',
    minWidth: 120,
    align: 'left',
    headerAlign: 'center'
  },
  {
    prop: 'remarkB',
    label: '外协备注',
    minWidth: 120,
    headerAlign: 'center',
    align: 'left'
  },
  {
    prop: 'createBy',
    label: '创建人',
    minWidth: 120,
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'createdAt',
    label: '创建时间',
    minWidth: 200,
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'chipA',
    label: 'A芯片名称',
    minWidth: 120,
    align: 'center',
    headerAlign: 'center'
  },
  {
    prop: 'chipAQty',
    label: 'A芯片数量',
    minWidth: 120,
    headerAlign: 'center',
    align: 'right'
  },
  {
    prop: 'chipB',
    label: 'B芯片名称',
    minWidth: 150,
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'chipBQty',
    label: 'B芯片数量',
    minWidth: 120,
    headerAlign: 'center',
    align: 'right'
  },
  {
    prop: 'operations',
    label: '操作',
    minWidth: 250,
    headerAlign: 'center',
    align: 'center',
    fixed: 'right'
  }
]

const summaryColumns = [
  {
    prop: 'itemCode',
    label: '品号',
    minWidth: 250,
    headerAlign: 'center',
    align: 'center',
    fixed: 'left'
  },
  {
    prop: 'abtr',
    label: '管装/编带',
    minWidth: 120,
    headerAlign: 'center',
    align: 'center'
  },
  {
    prop: 'businessQty',
    label: '业务数量',
    minWidth: 120,
    align: 'right',
    headerAlign: 'center'
  }
]

// 当前显示的列
const currentColumns = computed(() => {
  return props.tableType === 'detail' ? detailColumns : summaryColumns
})

// 格式化数字
const formatNumber = (value: number): string => {
  if (value === null || value === undefined) return '0'
  return value.toLocaleString()
}

// 选择变化事件处理
const handleSelectionChange = (selection: ChipPackagingRequirement[]) => {
  emit('selection-change', selection)

  // 更新合计数据
  if (props.tableType === 'summary' && selection.length > 0) {
    const summary = calculateSelectionSummary(selection)
    summaryData.value = summary
    emit('summary-change', summary)
  } else {
    summaryData.value = {
      count: 0,
      businessQty: '0'
    }
    emit('summary-change', null)
  }
}

// 计算选中行的合计
const calculateSelectionSummary = (selection: ChipPackagingRequirement[]) => {
  const businessQty = selection.reduce((sum, item) => sum + (Number(item.businessQty) || 0), 0)

  return {
    count: selection.length,
    businessQty: formatNumber(businessQty)
  }
}

// 处理封装订单号点击事件
const handlePackagingOrderClick = (orderNo: string) => {
  emit('packaging-order-click', orderNo)
}

// 处理操作按钮点击事件
const handleAddClick = (row: ChipPackagingRequirement) => {
  emit('add-click', row)
}

const handleCancelClick = (row: ChipPackagingRequirement) => {
  emit('cancel-click', row)
}

const handleAttachOrderClick = (row: ChipPackagingRequirement) => {
  emit('attach-order-click', row)
}

// 分割封装订单号
const splitPackagingOrders = (orders: string) => {
  if (!orders) return []
  return orders
    .split(',')
    .map((order) => order.trim())
    .filter((order) => order.length > 0)
}

// 字段值转换函数
const formatFieldValue = (value: string | number, field: string) => {
  if (value === null || value === undefined || value === '') return '-'

  switch (field) {
    case 'abtr':
      switch (String(value)) {
        case '0':
          return '管装'
        case '1':
          return '编带'
        default:
          return value
      }
    case 'requirementType':
      switch (String(value)) {
        case '0':
          return '安全库存'
        case '1':
          return '市场需求'
        default:
          return value
      }
    case 'emergency':
      switch (String(value)) {
        case '0':
          return '正常'
        case '1':
          return '紧急'
        case '2':
          return '特急'
        default:
          return value
      }
    case 'status':
      switch (String(value)) {
        case '0':
          return '未封装'
        case '1':
          return '已封装'
        case '2':
          return '已取消'
        default:
          return value
      }
    default:
      return value
  }
}
</script>

<template>
  <div
    :class="prefixCls"
    class="h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg overflow-hidden"
  >
    <ElTable
      :data="tableData"
      :loading="loading"
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

      <!-- 选中合计行 - 仅在summary模式下显示 -->
      <template v-if="tableType === 'summary'" #append>
        <div class="selection-summary-row">
          <div class="summary-content">
            <span class="summary-label">选中合计 ({{ summaryData.count }} 条):</span>
            <span class="summary-item"
              >数量合计: <span class="summary-value">{{ summaryData.businessQty }}</span></span
            >
          </div>
        </div>
      </template>

      <!-- 数据列 -->
      <template v-for="column in currentColumns" :key="column.prop">
        <ElTableColumn
          :prop="column.prop"
          :label="column.label"
          :min-width="column.minWidth"
          :fixed="column.fixed"
          :align="column.align || 'left'"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <!-- 封装订单号字段 - 可点击的多个订单号 -->
            <div v-if="column.prop === 'packagingOrders'" class="packaging-orders-container">
              <template
                v-for="(orderNo, index) in splitPackagingOrders(row[column.prop])"
                :key="orderNo"
              >
                <span class="packaging-order-link" @click="handlePackagingOrderClick(orderNo)">
                  {{ orderNo }}
                </span>
                <span
                  v-if="index < splitPackagingOrders(row[column.prop]).length - 1"
                  class="order-separator"
                  >,
                </span>
              </template>
              <span v-if="!row[column.prop]" class="text-gray-500">-</span>
            </div>
            <!-- 操作列 -->
            <div v-else-if="column.prop === 'operations'" class="operations-container">
              <ElButton type="primary" size="small" @click="handleAddClick(row)">
                <Icon icon="vi-ep:plus" />
                新增
              </ElButton>
              <ElButton
                type="warning"
                size="small"
                @click="handleCancelClick(row)"
                :disabled="row.status === '2'"
              >
                <Icon icon="vi-ep:close" />
                撤销
              </ElButton>
              <ElButton type="success" size="small" @click="handleAttachOrderClick(row)">
                <Icon icon="vi-ep:link" />
                附单
              </ElButton>
            </div>
            <!-- 需要格式化的字段 -->
            <template
              v-else-if="
                ['abtr', 'requirementType', 'emergency', 'status', 'businessQty'].includes(
                  column.prop
                )
              "
            >
              <!-- 紧急程度字段使用标签显示 -->
              <el-tag
                v-if="column.prop === 'emergency'"
                :type="
                  row[column.prop] === '0'
                    ? 'success'
                    : row[column.prop] === '1'
                      ? 'warning'
                      : 'danger'
                "
                size="small"
              >
                {{ formatFieldValue(row[column.prop], column.prop) }}
              </el-tag>
              <!-- 状态字段使用标签显示 -->
              <el-tag
                v-else-if="column.prop === 'status'"
                :type="
                  row[column.prop] === '0'
                    ? 'warning'
                    : row[column.prop] === '1'
                      ? 'success'
                      : 'info'
                "
                size="small"
              >
                {{ formatFieldValue(row[column.prop], column.prop) }}
              </el-tag>
              <!-- 需求类型字段使用标签显示 -->
              <el-tag
                v-else-if="column.prop === 'requirementType'"
                :type="row[column.prop] === '0' ? 'primary' : 'success'"
                size="small"
              >
                {{ formatFieldValue(row[column.prop], column.prop) }}
              </el-tag>
              <!-- 业务数量字段格式化 -->
              <span
                v-else-if="['businessQty'].includes(column.prop)"
                class="font-medium text-gray-900 dark:text-gray-100"
              >
                {{ formatNumber(row[column.prop]) }}
              </span>
              <!-- 其他字段普通文本显示 -->
              <span v-else class="text-gray-700 dark:text-gray-200">
                {{ formatFieldValue(row[column.prop], column.prop) }}
              </span>
            </template>
            <!-- 默认显示 -->
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

    :deep(.el-tag) {
      padding: 2px 6px;
      font-size: 10px;
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

// 封装订单号样式
.packaging-orders-container {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px;

  .packaging-order-link {
    padding: 2px 4px;
    font-weight: 500;
    color: var(--el-color-primary);
    text-decoration: none;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s ease;

    &:hover {
      color: var(--el-color-primary-light-3);
      text-decoration: underline;
      background-color: var(--el-color-primary-light-9);
    }

    &:active {
      color: var(--el-color-primary-dark-2);
    }
  }

  .order-separator {
    margin: 0 2px;
    color: var(--el-text-color-secondary);
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

// 标签样式优化
:deep(.el-tag) {
  font-size: 12px;
  border-radius: 4px;
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

  .selection-summary-row {
    background-color: var(--el-fill-color-darker);
    border-top-color: var(--el-border-color-darker);
  }

  .packaging-orders-container {
    .packaging-order-link {
      &:hover {
        background-color: var(--el-color-primary-dark-2);
      }
    }
  }
}
@prefix-cls: ~'@{adminNamespace}-chip-packaging-requirements-table';
</style>
