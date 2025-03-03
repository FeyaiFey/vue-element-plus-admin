<script setup lang="ts">
import { ref, reactive, unref, onMounted } from 'vue'
import { ElTable, ElTableColumn, ElPagination, ElTag } from 'element-plus'
import type { TableColumnCtx } from 'element-plus/es/components/table/src/table-column/defaults'
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/Search'
import { useTable } from '@/hooks/web/useTable'
import { getPurchaseWipListApi, getPurchaseWipSupplierListApi } from '@/api/purchase'
import type {
  PurchaseWip,
  PurchaseWipQuery,
  PurchaseWipSupplierResponse
} from '@/api/purchase/type'
import { FormSchema } from '@/components/Form'

// 供应商列表
const supplierList = ref<Array<{ label: string; value: string }>>([])

// 获取供应商列表
const getSupplierList = async () => {
  try {
    const res = await getPurchaseWipSupplierListApi()
    supplierList.value = res.data.map((item: PurchaseWipSupplierResponse) => ({
      label: item.label,
      value: item.label
    }))
  } catch (error) {
    console.error('获取供应商列表失败:', error)
  }
}

// 在组件挂载时获取供应商列表
onMounted(() => {
  getSupplierList()
})

// 查询表单配置
const schema = reactive<FormSchema[]>([
  {
    field: 'purchase_order',
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
    field: 'item_name',
    label: '物料名称',
    component: 'Input',
    componentProps: {
      placeholder: '请输入物料名称',
      clearable: true
    },
    colProps: {
      span: 6
    }
  },
  {
    field: 'supplier',
    label: '供应商',
    component: 'Select',
    componentProps: {
      placeholder: '请选择供应商',
      clearable: true,
      options: supplierList
    },
    colProps: {
      span: 6
    }
  },
  {
    field: 'status',
    label: '状态',
    component: 'Select',
    componentProps: {
      placeholder: '请选择状态',
      clearable: true,
      options: [
        { label: '全部', value: '' },
        { label: '已完结', value: '已完结' },
        { label: 'HOLD', value: 'HOLD' },
        { label: 'STOCK', value: 'STOCK' }
      ]
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
        { label: '7天', value: 7 },
        { label: '15天', value: 15 },
        { label: '30天', value: 30 }
      ]
    },
    colProps: {
      span: 6
    }
  }
])

// 定义展开字段
const is_finished = ref('is_finished')

// 使用 table hook
const { tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage } = tableState
    const res = await getPurchaseWipListApi({
      pageIndex: unref(currentPage),
      pageSize: 50, // 默认每页100行
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
interface SearchParams extends PurchaseWipQuery {
  enableSummary?: boolean
}

const searchParams = ref<SearchParams>({
  enableSummary: true, // 设置初始值
  is_finished: 0
})

// 搜索方法
const setSearchParams = (params: PurchaseWipQuery) => {
  // 有查询参数时重置到第一页
  if (Object.keys(params).some((key) => params[key] !== undefined && params[key] !== '')) {
    currentPage.value = 1
  }
  searchParams.value = params
  getList()
}

// 表格列配置接口
interface ColumnType extends Partial<TableColumnCtx<PurchaseWip>> {
  hidden?: boolean
  slots?: {
    default?: (scope: { row: PurchaseWip }) => JSX.Element
  }
}

// 获取状态标签类型
const getStatusType = (status: string): 'info' | 'danger' | 'primary' | 'success' => {
  if (!status) return 'info'
  const upperStatus = status.toUpperCase()
  if (status === '已完结') return 'info'
  if (upperStatus.includes('HOLD')) return 'danger'
  if (upperStatus === 'STOCK') return 'primary'
  return 'success'
}

// 表格列配置
const columns = ref<ColumnType[]>([
  {
    type: 'selection',
    width: 50,
    align: 'center',
    fixed: 'left'
  },
  { label: '序号', type: 'index', width: 60, align: 'center', fixed: 'left' },
  { label: '订单号', prop: 'purchaseOrder', align: 'center', width: 100, sortable: true },
  { label: '晶圆名称', prop: 'itemName', align: 'center', width: 120, sortable: true },
  { label: '批次', prop: 'lot', align: 'center', width: 120, sortable: true },
  { label: '数量', prop: 'qty', align: 'center', width: 100 },
  {
    label: '状态',
    prop: 'status',
    align: 'center',
    width: 120
  },
  { label: '当前阶段', prop: 'stage', align: 'center', width: 150 },
  { label: '光刻层数', prop: 'layerCount', align: 'center', width: 120 },
  { label: '剩余层数', prop: 'remainLayerCount', align: 'center', width: 120 },
  { label: '当前位置', prop: 'currentPosition', align: 'center', hidden: true },
  { label: '供应商', prop: 'supplier', align: 'center', width: 120 },
  { label: '完成日期', prop: 'finished_at', align: 'center', width: 120 },
  { label: '滞留天数', prop: 'stranded', align: 'center', width: 120 },
  { label: '提前期', prop: 'leadTime', align: 'center', width: 120 },
  { label: '预计交期', prop: 'forecastDate', align: 'center', width: 120, fixed: 'right' }
])

// 状态标签渲染
// const renderStatus = (row: PurchaseWip) => {
//   const type = getStatusType(row.status)
//   return h(ElTag, { type }, () => row.status || '-')
// }
</script>

<template>
  <ContentWrap>
    <!-- 搜索表单 -->
    <Search
      :schema="schema"
      :is-col="true"
      :inline="false"
      show-expand
      :expand-field="is_finished"
      @search="setSearchParams"
      @reset="setSearchParams"
    />

    <!-- 表格 -->
    <div class="mt-4">
      <ElTable
        v-loading="loading"
        :data="dataList"
        border
        class="w-full"
        header-cell-class-name="table-header"
      >
        <template v-for="item in columns" :key="item.prop">
          <ElTableColumn v-bind="item" v-if="!item.hidden">
            <template #default="scope" v-if="item.prop === 'status'">
              <ElTag :type="getStatusType(scope.row.status)" class="status-tag">
                {{ scope.row.status || '-' }}
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

:deep(.success-row) {
  background-color: var(--el-color-success-light-9);
}

:deep(.warning-row) {
  background-color: var(--el-color-warning-light-9);
}

:deep(.status-tag) {
  min-width: 80px;
  padding: 0 12px;
  text-align: center;
}
</style>
