<script setup lang="ts">
import { ref, reactive, unref, onMounted, computed, h } from 'vue'
import {
  ElTable,
  ElTableColumn,
  ElPagination,
  ElPopover,
  ElCheckbox,
  ElTag,
  ElForm,
  ElRow,
  ElCol,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElCollapseTransition,
  ElButton
} from 'element-plus'
import type { TableColumnCtx } from 'element-plus/es/components/table/src/table-column/defaults'
import { ContentWrap } from '@/components/ContentWrap'
import { useTable } from '@/hooks/web/useTable'
import { getAssyWipApi } from '@/api/assy'
import type { AssyWip, AssyWipQuery } from '@/api/assy/type'
import { Icon } from '@/components/Icon'

// 折叠状态
const isCollapse = ref(true)

// 表单引用
const formRef = ref<InstanceType<typeof ElForm>>()

// 搜索参数
const searchParams = reactive<AssyWipQuery>({
  doc_no: '',
  item_code: '',
  supplier: '',
  current_process: '',
  is_finished: 0,
  is_stranded: undefined,
  days: undefined
})

// 搜索方法
const handleSearch = () => {
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
  searchParams.current_process = ''
  searchParams.is_finished = 0
  searchParams.is_stranded = undefined
  searchParams.days = undefined
  handleSearch()
}

// 使用 table hook
const { tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage } = tableState
    const res = await getAssyWipApi({
      pageIndex: unref(currentPage),
      pageSize: 100,
      ...searchParams
    })
    return {
      list: res.data.list,
      total: res.data.total
    }
  }
})

const { getList } = tableMethods
const { loading, dataList, total, currentPage } = tableState

// 表格列配置接口
interface ColumnType extends Partial<TableColumnCtx<AssyWip>> {
  hidden?: boolean
  type?: 'selection' | 'index'
  prop?: string
  label?: string
  headerCellClassName?: string
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

// 获取预计交期的样式类型
const getDeliveryDateType = (
  date: string
): 'danger' | 'warning' | 'success' | 'info' | 'primary' => {
  if (!date) return 'info'
  const deliveryDate = new Date(date)
  const today = new Date()
  const diffDays = Math.ceil((deliveryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 2) return 'success'
  if (diffDays <= 7) return 'primary'
  if (diffDays <= 10) return 'warning'
  if (diffDays <= 30) return 'danger'
  return 'info'
}

// 表格列配置
const defaultColumns: ColumnType[] = [
  { label: '序号', type: 'index', width: 60, align: 'center', fixed: 'left' },
  { label: '订单号', prop: 'DOC_NO', align: 'center', width: 150 },
  { label: '物料编码', prop: 'ITEM_CODE', align: 'center', width: 250, showOverflowTooltip: true },
  {
    label: '当前工序',
    prop: 'CURRENT_PROCESS',
    width: 120,
    align: 'center',
    headerAlign: 'center'
  },
  { label: '在线合计', prop: 'ONLINE_TOTAL', align: 'center', width: 100 },
  { label: '仓库库存', prop: 'WAREHOUSE_INVENTORY', align: 'center', width: 100 },
  { label: '扣留信息', prop: 'HOLD_INFO', align: 'center', width: 120, showOverflowTooltip: true },
  { label: '明日预计', prop: 'NEXT_DAY_EXPECTED', align: 'center', width: 100 },
  { label: '三日预计', prop: 'THREE_DAY_EXPECTED', align: 'center', width: 100 },
  { label: '七日预计', prop: 'SEVEN_DAY_EXPECTED', align: 'center', width: 100 },
  {
    label: '加工方式',
    prop: 'Z_PROCESSING_PURPOSE_NAME',
    align: 'center',
    width: 130,
    fixed: 'right'
  },
  {
    label: '预计交期',
    prop: 'EXPECTED_DELIVERY_DATE',
    align: 'center',
    width: 120,
    fixed: 'right',
    headerCellClassName: 'delivery-date-header',
    slots: {
      default: ({ row }) => {
        if (!row.EXPECTED_DELIVERY_DATE) return h('span', '-')
        return h(
          ElTag,
          {
            type: getDeliveryDateType(row.EXPECTED_DELIVERY_DATE),
            effect: 'dark',
            class: 'delivery-date-tag'
          },
          () => row.EXPECTED_DELIVERY_DATE
        )
      }
    }
  },
  { label: '完成日期', prop: 'FINISHED_AT', align: 'center', width: 120 },
  { label: '滞留天数', prop: 'STRANDED', align: 'center', width: 100 },
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
          <ElFormItem label="提前期">
            <ElSelect v-model="searchParams.days" placeholder="请选择提前天数" clearable>
              <ElOption label="1天" :value="1" />
              <ElOption label="3天" :value="3" />
              <ElOption label="7天" :value="7" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElCollapseTransition>
        <div v-show="!isCollapse">
          <ElRow :gutter="20">
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
              <ElFormItem label="当前工序">
                <ElInput
                  v-model="searchParams.current_process"
                  placeholder="请输入当前工序"
                  clearable
                  @keyup.enter="handleSearch"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
              <ElFormItem label="是否完成">
                <ElSelect v-model="searchParams.is_finished" placeholder="请选择是否完成" clearable>
                  <ElOption label="全部" value="" />
                  <ElOption label="已完成" :value="1" />
                  <ElOption label="未完成" :value="0" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
              <ElFormItem label="是否滞留">
                <ElSelect v-model="searchParams.is_stranded" placeholder="请选择是否滞留" clearable>
                  <ElOption label="全部" value="" />
                  <ElOption label="是" :value="1" />
                  <ElOption label="否" :value="0" />
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
        header-cell-class-name="table-header"
      >
        <template v-for="item in visibleColumns" :key="item.prop || item.type">
          <ElTableColumn v-bind="item" v-if="!item.hidden">
            <template #header>
              <span :class="item.headerCellClassName">{{ item.label }}</span>
            </template>
            <template #default="scope" v-if="!item.type">
              <template v-if="item.prop === 'CURRENT_PROCESS'">
                <ElTag :type="getCurrentProcessType(scope.row.CURRENT_PROCESS)" class="status-tag">
                  {{ scope.row.CURRENT_PROCESS || '-' }}
                </ElTag>
              </template>
              <template v-else-if="item.prop === 'EXPECTED_DELIVERY_DATE'">
                <ElTag
                  v-if="scope.row.EXPECTED_DELIVERY_DATE"
                  :type="getDeliveryDateType(scope.row.EXPECTED_DELIVERY_DATE)"
                  effect="dark"
                  class="delivery-date-tag"
                >
                  {{ scope.row.EXPECTED_DELIVERY_DATE }}
                </ElTag>
                <span v-else>-</span>
              </template>
              <template v-else>
                {{ scope.row[item.prop as keyof AssyWip] }}
              </template>
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

:deep(.delivery-date-header) {
  display: inline-block;
  padding: 4px 8px;
  font-size: 16px !important;
  font-weight: bold !important;
  color: var(--el-color-danger) !important;
  background-color: var(--el-color-danger-light-9) !important;
  border-radius: 4px;
}

:deep(.delivery-date-tag) {
  width: 100%;
  font-size: 14px;
  font-weight: bold;

  &.el-tag--success {
    animation: blink 1s infinite;
  }
}

@keyframes blink {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.6;
  }

  100% {
    opacity: 1;
  }
}
</style>
