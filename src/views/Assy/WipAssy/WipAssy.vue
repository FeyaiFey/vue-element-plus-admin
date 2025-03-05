<script setup lang="ts">
import { ref, reactive, unref, onMounted, computed } from 'vue'
import { ElTable, ElTableColumn, ElPagination, ElPopover, ElCheckbox, ElTag } from 'element-plus'
import type { TableColumnCtx } from 'element-plus/es/components/table/src/table-column/defaults'
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/Search'
import { useTable } from '@/hooks/web/useTable'
import { getAssyWipApi } from '@/api/assy'
import type { AssyWip, AssyWipQuery } from '@/api/assy/type'
import { FormSchema } from '@/components/Form'
import { Icon } from '@/components/Icon'

// 查询表单配置
const schema = reactive<FormSchema[]>([
  {
    field: 'doc_no',
    label: '订单号',
    component: 'Input',
    componentProps: {
      placeholder: '请输入订单号',
      clearable: true
    },
    colProps: {
      span: 6
    }
  },
  {
    field: 'item_code',
    label: '物料编码',
    component: 'Input',
    componentProps: {
      placeholder: '请输入物料编码',
      clearable: true
    },
    colProps: {
      span: 6
    }
  },
  {
    field: 'supplier',
    label: '供应商',
    component: 'Input',
    componentProps: {
      placeholder: '请输入供应商',
      clearable: true
    },
    colProps: {
      span: 6
    }
  },
  {
    field: 'current_process',
    label: '当前工序',
    component: 'Input',
    componentProps: {
      placeholder: '请输入当前工序',
      clearable: true
    },
    colProps: {
      span: 6
    }
  },
  {
    field: 'is_finished',
    label: '是否完成',
    component: 'Select',
    value: 0,
    componentProps: {
      placeholder: '请选择',
      clearable: true,
      options: [
        { label: '全部', value: '' },
        { label: '已完成', value: 1 },
        { label: '未完成', value: 0 }
      ]
    },
    colProps: {
      span: 6
    }
  },
  {
    field: 'is_stranded',
    label: '是否滞留',
    component: 'Select',
    componentProps: {
      placeholder: '请选择',
      clearable: true,
      options: [
        { label: '全部', value: '' },
        { label: '是', value: 1 },
        { label: '否', value: 0 }
      ]
    },
    colProps: {
      span: 6
    }
  },
  {
    field: 'days',
    label: '提前天数',
    component: 'Select',
    componentProps: {
      placeholder: '请选择',
      clearable: true,
      options: [
        { label: '1天', value: 1 },
        { label: '3天', value: 3 },
        { label: '7天', value: 7 }
      ]
    },
    colProps: {
      span: 6
    }
  }
])

// 定义展开字段和展开状态
const is_finished = ref('is_finished')
const isExpand = ref(false)

// 自定义展开按钮文本
const expandBtnText = computed(() => {
  return isExpand.value ? '收起筛选' : '展开筛选'
})

// 使用 table hook
const { tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage } = tableState
    const res = await getAssyWipApi({
      pageIndex: unref(currentPage),
      pageSize: 100,
      ...searchParams.value
    })
    return {
      list: res.data.list,
      total: res.data.total
    }
  }
})

const { getList } = tableMethods
const { loading, dataList, total, currentPage } = tableState

// 搜索参数
const searchParams = ref<AssyWipQuery>({
  is_finished: 0
})

// 搜索方法
const setSearchParams = (params: AssyWipQuery) => {
  if (Object.keys(params).some((key) => params[key] !== undefined && params[key] !== '')) {
    currentPage.value = 1
  }
  searchParams.value = params
  getList()
}

// 表格列配置接口
interface ColumnType extends Partial<TableColumnCtx<AssyWip>> {
  hidden?: boolean
  type?: 'selection' | 'index'
  prop?: string
  label?: string
  slots?: {
    default?: (scope: { row: AssyWip }) => JSX.Element
  }
}

// 获取状态标签类型
const getCurrentProcessType = (
  CURRENT_PROCESS: string
): 'info' | 'danger' | 'primary' | 'success' => {
  if (!CURRENT_PROCESS) return 'info'
  if (CURRENT_PROCESS === '已完成') return 'info'
  if (CURRENT_PROCESS === 'STOCK') return 'primary'
  return 'success'
}

// 表格列配置
const defaultColumns: ColumnType[] = [
  {
    type: 'selection',
    width: 50,
    align: 'center',
    fixed: 'left'
  },
  { label: '序号', type: 'index', width: 60, align: 'center', fixed: 'left' },
  { label: '订单号', prop: 'DOC_NO', align: 'center', width: 150 },
  { label: '物料编码', prop: 'ITEM_CODE', align: 'center', width: 250, showOverflowTooltip: true },
  {
    label: '预计交期',
    prop: 'EXPECTED_DELIVERY_DATE',
    align: 'center',
    width: 120,
    fixed: 'right'
  },
  { label: '明日预计', prop: 'NEXT_DAY_EXPECTED', align: 'center', width: 100 },
  { label: '三日预计', prop: 'THREE_DAY_EXPECTED', align: 'center', width: 100 },
  { label: '七日预计', prop: 'SEVEN_DAY_EXPECTED', align: 'center', width: 100 },
  { label: '加工方式', prop: 'Z_PROCESSING_PURPOSE_NAME', align: 'center', width: 130 },
  {
    label: '当前工序',
    prop: 'CURRENT_PROCESS',
    width: 120,
    align: 'center',
    headerAlign: 'center'
  },
  { label: '在线合计', prop: 'ONLINE_TOTAL', align: 'center', width: 100 },
  { label: '仓库库存', prop: 'WAREHOUSE_INVENTORY', align: 'center', width: 100 },
  { label: '完成日期', prop: 'FINISHED_AT', align: 'center', width: 120 },
  { label: '滞留天数', prop: 'STRANDED', align: 'center', width: 100 },
  { label: '扣留信息', prop: 'HOLD_INFO', align: 'center', width: 120, showOverflowTooltip: true },
  {
    label: '封装供应商',
    prop: 'SUPPLIER_FULL_NAME',
    align: 'left',
    width: 150,
    fixed: 'right',
    showOverflowTooltip: true
  },
  { label: '研磨', prop: 'POLISHING', align: 'center', width: 80 },
  { label: '切割', prop: 'CUTTING', align: 'center', width: 80 },
  { label: '待装片', prop: 'WAITING_FOR_INSTALLATION', align: 'center', width: 80 },
  { label: '装片', prop: 'INSTALLATION', align: 'center', width: 80 },
  { label: '银胶固化', prop: 'SILVER_GLUE_CURE', align: 'center', width: 80 },
  { label: '等离子清洗1', prop: 'PLASMA_CLEANING_1', align: 'center', width: 100 },
  { label: '键合', prop: 'BONDING', align: 'center', width: 80 },
  { label: '三目检', prop: 'THREE_POINT_INSPECTION', align: 'center', width: 100 },
  { label: '等离子清洗2', prop: 'PLASMA_CLEANING_2', align: 'center', width: 100 },
  { label: '塑封', prop: 'SEALING', align: 'center', width: 80 },
  { label: '后固化', prop: 'POST_CURE', align: 'center', width: 80 },
  { label: '回流焊', prop: 'REFLOW_SOLDERING', align: 'center', width: 80 },
  { label: '电镀', prop: 'ELECTROPLATING', align: 'center', width: 80 },
  { label: '打印', prop: 'PRINTING', align: 'center', width: 80 },
  { label: '后切割', prop: 'POST_CUTTING', align: 'center', width: 80 },
  { label: '切筋成型', prop: 'CUTTING_AND_SHAPING', align: 'center', width: 80 },
  { label: '测编打印', prop: 'MEASUREMENT_AND_PRINTING', align: 'center', width: 100 },
  { label: '外观检', prop: 'APPEARANCE_INSPECTION', align: 'center', width: 100 },
  { label: '包装', prop: 'PACKING', align: 'center', width: 80 },
  { label: '待入库', prop: 'WAITING_FOR_WAREHOUSE_INVENTORY', align: 'center', width: 80 }
]

// 默认显示的列
const defaultVisibleColumns = [
  'selection',
  'index',
  'DOC_NO',
  'ITEM_CODE',
  'Z_PROCESSING_PURPOSE_NAME',
  'EXPECTED_DELIVERY_DATE',
  'NEXT_DAY_EXPECTED',
  'THREE_DAY_EXPECTED',
  'SEVEN_DAY_EXPECTED',
  'CURRENT_PROCESS',
  'ONLINE_TOTAL',
  'WAREHOUSE_INVENTORY',
  'STRANDED',
  'HOLD_INFO',
  'SUPPLIER_FULL_NAME'
]

// 列显示状态接口
interface ColumnVisibleState {
  [key: string]: boolean
}

// 列显示状态
const columnVisible = ref<ColumnVisibleState>(
  defaultColumns.reduce((acc: ColumnVisibleState, col) => {
    const key = col.type || col.prop || ''
    if (key) {
      acc[key] = defaultVisibleColumns.includes(key)
    }
    return acc
  }, {})
)

// 全选状态
const checkAll = ref(false)
const isIndeterminate = ref(true)

// 计算选中的列数量
const checkedCount = computed(() => {
  return Object.values(columnVisible.value).filter(Boolean).length
})

// 计算总列数（不包括selection和index列）
const totalCount = computed(() => {
  return defaultColumns.slice(2).length
})

// 监听选中状态变化
const handleCheckedColumnsChange = () => {
  const checkedCount = Object.values(columnVisible.value).filter(Boolean).length
  const totalCount = defaultColumns.slice(2).length
  checkAll.value = checkedCount === totalCount
  isIndeterminate.value = checkedCount > 0 && checkedCount < totalCount
}

// 处理全选
const handleCheckAllChange = (val: boolean) => {
  defaultColumns.slice(2).forEach((col) => {
    if (col.prop) {
      columnVisible.value[col.prop] = val
    }
  })
  checkAll.value = val
  isIndeterminate.value = false
}

// 更新列显示状态
const updateColumnVisible = (key: string | undefined) => {
  if (key) {
    columnVisible.value[key] = !columnVisible.value[key]
    handleCheckedColumnsChange()
  }
}

// 可见列
const visibleColumns = computed(() => {
  return defaultColumns.filter((col) => {
    const key = col.type || col.prop
    return key ? columnVisible.value[key] : false
  })
})

// 行样式
const tableRowClassName = ({ row }: { row: AssyWip }) => {
  if (row.STRANDED > 0) {
    return 'warning-row'
  }
  return ''
}

// 选择行变化
const handleSelectionChange = (selection: AssyWip[]) => {
  console.log('selected:', selection)
}

// 初始化
onMounted(() => {
  getList()
})
</script>

<template>
  <ContentWrap>
    <!-- 搜索表单 -->
    <div class="flex justify-between items-center mb-4">
      <Search
        :schema="schema"
        :is-col="true"
        :inline="false"
        show-expand
        :expand-field="is_finished"
        @search="setSearchParams"
        @reset="setSearchParams"
        label-width="100px"
      >
        <template #expand-btn>
          <div class="expand-btn" @click="isExpand = !isExpand">
            {{ expandBtnText }}
            <Icon
              :icon="isExpand ? 'ep:arrow-up-bold' : 'ep:arrow-down-bold'"
              :size="14"
              class="expand-icon"
            />
          </div>
        </template>
      </Search>
    </div>

    <!-- 表格区域 -->
    <div class="relative">
      <!-- 列设置按钮 -->
      <div class="absolute right-0 -top-8">
        <ElPopover placement="bottom" :width="400" trigger="click">
          <template #reference>
            <div class="column-setting-btn">
              <Icon icon="ep:setting" :size="16" />
              <span>列设置</span>
            </div>
          </template>
          <div class="column-setting">
            <div class="column-setting-title flex items-center justify-between">
              <div class="flex items-center">
                <ElCheckbox
                  v-model="checkAll"
                  :indeterminate="isIndeterminate"
                  @change="handleCheckAllChange"
                />
                <span class="ml-2">列展示</span>
              </div>
              <span class="text-sm text-gray-500">{{ checkedCount }} / {{ totalCount }}</span>
            </div>
            <div class="column-setting-content">
              <ElCheckbox
                v-for="col in defaultColumns.slice(2)"
                :key="col.prop"
                v-model="columnVisible[col.prop || '']"
                @change="() => updateColumnVisible(col.prop)"
              >
                {{ col.label }}
              </ElCheckbox>
            </div>
          </div>
        </ElPopover>
      </div>

      <!-- 表格 -->
      <ElTable
        v-loading="loading"
        :data="dataList"
        border
        class="w-full"
        :row-class-name="tableRowClassName"
        header-cell-class-name="table-header"
        @selection-change="handleSelectionChange"
      >
        <template v-for="item in visibleColumns" :key="item.prop">
          <ElTableColumn v-bind="item" v-if="!item.hidden">
            <template #default="scope" v-if="item.prop === 'CURRENT_PROCESS'">
              <ElTag :type="getCurrentProcessType(scope.row.CURRENT_PROCESS)" class="status-tag">
                {{ scope.row.CURRENT_PROCESS || '-' }}
              </ElTag>
            </template>
          </ElTableColumn>
        </template>
      </ElTable>

      <!-- 分页 -->
      <div class="flex justify-end mt-4">
        <ElPagination
          v-model:current-page="currentPage"
          :page-size="100"
          :total="total"
          layout="total, prev, pager, next, jumper"
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
  background-color: #f0f7ff !important;
}

:deep(.warning-row) {
  background-color: var(--el-color-warning-light-9);
}

.expand-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  color: var(--el-color-primary);
  cursor: pointer;
  border: 1px solid var(--el-color-primary);
  border-radius: 4px;
  transition: all 0.3s;

  &:hover {
    color: white;
    background-color: var(--el-color-primary);
  }

  .expand-icon {
    transition: transform 0.3s;
  }
}

.column-setting-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  color: var(--el-color-primary);
  cursor: pointer;
  border: 1px solid var(--el-color-primary);
  border-radius: 4px;
  transition: all 0.3s;

  &:hover {
    color: white;
    background-color: var(--el-color-primary);
  }
}

.column-setting {
  &-title {
    padding-bottom: 8px;
    margin-bottom: 12px;
    font-size: 16px;
    font-weight: bold;
    border-bottom: 1px solid var(--el-border-color-light);
  }

  &-content {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;

    .el-checkbox {
      margin-right: 0;
    }
  }
}

:deep(.status-tag) {
  min-width: 80px;
  padding: 0 12px;
  text-align: center;
}
</style>
