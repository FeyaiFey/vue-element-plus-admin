<script setup lang="ts">
import { ref, reactive, unref, onMounted, h } from 'vue'
import {
  ElTable,
  ElTableColumn,
  ElPagination,
  ElTag,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElRow,
  ElCol,
  ElCollapseTransition,
  ElButton
} from 'element-plus'
import type { TableColumnCtx } from 'element-plus/es/components/table/src/table-column/defaults'
import { ContentWrap } from '@/components/ContentWrap'
import { getPurchaseWipListApi, getPurchaseWipSupplierListApi } from '@/api/purchase'
import type {
  PurchaseWip,
  PurchaseWipQuery,
  PurchaseWipSupplierResponse
} from '@/api/purchase/type'
import { Icon } from '@/components/Icon'
import { useTable } from '@/hooks/web/useTable'

// 折叠状态
const isCollapse = ref(true)

// 供应商选项
const supplierOptions = ref<Array<{ label: string; value: string }>>([])
const supplierLoading = ref(false)

// 获取供应商列表
const getSupplierList = async () => {
  supplierLoading.value = true
  try {
    const res = await getPurchaseWipSupplierListApi()
    supplierOptions.value = res.data.map((item: PurchaseWipSupplierResponse) => ({
      label: item.label,
      value: item.label
    }))
  } catch (error) {
    console.error('获取供应商列表失败:', error)
  } finally {
    supplierLoading.value = false
  }
}

// 表单引用
const formRef = ref<InstanceType<typeof ElForm>>()

// 搜索参数
const searchParams = reactive<PurchaseWipQuery>({
  purchase_order: '',
  item_name: '',
  supplier: '',
  status: '',
  is_finished: 0,
  is_stranded: undefined,
  days: undefined
})

// 使用 table hook
const { tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const { currentPage } = tableState
    const res = await getPurchaseWipListApi({
      pageIndex: unref(currentPage),
      pageSize: 50,
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

// 搜索方法
const handleSearch = () => {
  currentPage.value = 1
  getList()
}

// 重置方法
const handleReset = () => {
  formRef.value?.resetFields()
  handleSearch()
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
interface ColumnType extends Partial<TableColumnCtx<PurchaseWip>> {
  hidden?: boolean
  slots?: {
    default?: (scope: { row: PurchaseWip }) => JSX.Element
  }
}

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
    width: 120,
    slots: {
      default: ({ row }) => {
        return h(ElTag, { type: getStatusType(row.status) }, () => row.status || '-')
      }
    }
  },
  { label: '当前阶段', prop: 'stage', align: 'center', width: 150 },
  { label: '光刻层数', prop: 'layerCount', align: 'center', width: 120 },
  { label: '剩余层数', prop: 'remainLayerCount', align: 'center', width: 120 },
  { label: '当前位置', prop: 'currentPosition', align: 'center', hidden: true },
  { label: '完成日期', prop: 'finished_at', align: 'center', width: 120 },
  { label: '提前期', prop: 'leadTime', align: 'center', width: 120 },
  { label: '滞留天数', prop: 'stranded', align: 'center', width: 120 },
  { label: '预计交期', prop: 'forecastDate', align: 'center', width: 120, fixed: 'right' },
  { label: '供应商', prop: 'supplier', align: 'center', fixed: 'right' }
])

// 在组件挂载时获取数据
onMounted(() => {
  getList()
  getSupplierList()
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
              v-model="searchParams.purchase_order"
              placeholder="请输入订单号"
              clearable
              @keyup.enter="handleSearch"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
          <ElFormItem label="物料名称">
            <ElInput
              v-model="searchParams.item_name"
              placeholder="请输入物料名称"
              clearable
              @keyup.enter="handleSearch"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
          <ElFormItem label="供应商">
            <ElSelect
              v-model="searchParams.supplier"
              placeholder="请选择供应商"
              clearable
              filterable
              :loading="supplierLoading"
              @keyup.enter="handleSearch"
            >
              <ElOption
                v-for="item in supplierOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElCollapseTransition>
        <div v-show="!isCollapse">
          <ElRow :gutter="20">
            <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
              <ElFormItem label="状态">
                <ElSelect v-model="searchParams.status" placeholder="请选择状态" clearable>
                  <ElOption label="全部" value="" />
                  <ElOption label="已完结" value="已完结" />
                  <ElOption label="HOLD" value="HOLD" />
                  <ElOption label="STOCK" value="STOCK" />
                </ElSelect>
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
            <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
              <ElFormItem label="提前天数">
                <ElSelect v-model="searchParams.days" placeholder="请选择提前天数" clearable>
                  <ElOption label="7天" :value="7" />
                  <ElOption label="15天" :value="15" />
                  <ElOption label="30天" :value="30" />
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
    <div class="mt-4 table-container">
      <!-- 表格 -->
      <div class="table-wrapper">
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
            :page-size="50"
            :total="total"
            layout="total, prev, pager, next, jumper"
            @current-change="getList"
          />
        </div>
      </div>
    </div>
  </ContentWrap>
</template>

<style lang="less" scoped>
.table-container {
  display: flex;
  flex-direction: column;
  overflow-x: auto;
}

.table-wrapper {
  min-width: 800px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
}

:deep(.el-table) {
  // 移除表格边框
  border: none !important;

  // 移动端适配
  @media screen and (width <= 768px) {
    // 减小字体大小
    font-size: 12px;
    // 减小单元格内边距
    td,
    th {
      padding: 8px !important;
    }
  }

  // 表头样式
  .el-table__body-header {
    th {
      font-weight: bold;
      color: var(--el-color-primary);
      text-align: center !important;
      background-color: var(--el-color-primary-light-9);
    }
  }

  // 表格内容居中
  .el-table__body {
    td {
      text-align: center !important;
    }
  }

  // 选中行样式
  .el-table__row.selected {
    td {
      color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-8) !important;
    }
  }

  // 鼠标悬停样式
  .el-table__row:hover {
    td {
      background-color: var(--el-color-primary-light-9) !important;
    }
  }

  // 固定列样式
  .el-table__fixed,
  .el-table__fixed-right {
    height: 100% !important;
    box-shadow: none;

    &::before {
      display: none;
    }

    // 固定列的选中行样式
    .el-table__row.selected {
      td {
        color: var(--el-color-primary);
        background-color: var(--el-color-primary-light-8) !important;
      }
    }
  }
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

.status-tag {
  min-width: 80px;
  padding: 0 12px;
  text-align: center;
}
</style>
