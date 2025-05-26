<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue'
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
  ElButton,
  ElMessage,
  ElSkeleton
} from 'element-plus'
import { getPurchaseWipListApi, getPurchaseWipSupplierListApi } from '@/api/purchase'
import type {
  PurchaseWip,
  PurchaseWipQuery,
  PurchaseWipSupplierResponse
} from '@/api/purchase/type'
import { Icon } from '@/components/Icon'

defineOptions({
  name: 'WipFab'
})

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
  is_stranded: '',
  days: undefined
})

// 移除 useTable，改用直接的数据获取方式
const loading = ref(false)
const dataList = ref<PurchaseWip[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(50)

// 获取列表数据
const getList = async () => {
  try {
    loading.value = true
    const res = await getPurchaseWipListApi({
      pageIndex: currentPage.value,
      pageSize: pageSize.value,
      ...searchParams
    })
    dataList.value = res.data.list || []
    total.value = res.data.total || 0
  } catch (error) {
    console.error('获取数据失败:', error)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
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

// 获取状态标签类型
const getStatusType = (status: string): 'info' | 'danger' | 'primary' | 'success' => {
  if (!status) return 'info'
  const upperStatus = status.toUpperCase()
  if (status === '已完结') return 'info'
  if (upperStatus.includes('HOLD')) return 'danger'
  if (upperStatus === 'STOCK') return 'primary'
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

  if (diffDays < 8) return 'success'
  if (diffDays <= 15) return 'primary'
  if (diffDays <= 30) return 'warning'
  if (diffDays > 30) return 'danger'
  return 'info'
}

// 表格列配置接口
interface TableColumn {
  type?: 'selection' | 'expand' | 'index'
  label?: string
  prop?: string
  width?: number
  align?: 'left' | 'center' | 'right'
  fixed?: 'left' | 'right'
  showOverflowTooltip?: boolean
  headerAlign?: 'left' | 'center' | 'right'
  headerCellClassName?: string
  sortable?: boolean
  formatter?: (row: PurchaseWip) => any
  hidden?: boolean
  slots?: {
    default?: (scope: any) => any
  }
}

const columns = ref<TableColumn[]>([
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
  { label: '滞留天数', prop: 'stranded', align: 'center', width: 120 },
  {
    label: '预计交期',
    prop: 'forecastDate',
    align: 'center',
    width: 120,
    fixed: 'right',
    headerCellClassName: 'delivery-date-header',
    slots: {
      default: ({ row }) => {
        if (!row.forecastDate) return h('span', '-')
        return h(
          ElTag,
          {
            type: getDeliveryDateType(row.forecastDate),
            effect: 'dark',
            class: 'delivery-date-tag'
          },
          () => row.forecastDate
        )
      }
    }
  },
  { label: '供应商', prop: 'supplier', align: 'center', fixed: 'right' }
])

// 重置方法
const handleReset = () => {
  formRef.value?.resetFields()
  // 设置默认参数
  searchParams.purchase_order = ''
  searchParams.item_name = ''
  searchParams.supplier = ''
  searchParams.status = ''
  searchParams.is_finished = 0
  searchParams.is_stranded = ''
  searchParams.days = undefined
  getList()
}

// 在组件挂载时获取数据
onMounted(() => {
  getList()
  getSupplierList()
})
</script>

<template>
  <!-- 搜索表单 -->
  <ElForm ref="formRef" :model="searchParams" label-width="100px" class="search-form">
    <ElRow :gutter="20">
      <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
        <ElFormItem label="订单号">
          <ElInput
            v-model="searchParams.purchase_order"
            placeholder="请输入订单号"
            clearable
            @keyup.enter="getList"
          />
        </ElFormItem>
      </ElCol>
      <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
        <ElFormItem label="物料名称">
          <ElInput
            v-model="searchParams.item_name"
            placeholder="请输入物料名称"
            clearable
            @keyup.enter="getList"
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
            @keyup.enter="getList"
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
        <ElButton type="primary" @click="getList">
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
  <div class="table-container">
    <ElSkeleton v-if="loading" :rows="20" animated class="table-skeleton" />
    <ElTable
      v-else
      v-loading="loading"
      :data="dataList"
      border
      class="w-full"
      header-cell-class-name="table-header"
      row-key="purchaseOrder"
      height="calc(100vh - 280px)"
    >
      <template v-for="item in columns" :key="item.prop || item.type">
        <ElTableColumn v-bind="item" v-if="!item.hidden">
          <template #header>
            <span :class="item.headerCellClassName">{{ item.label }}</span>
          </template>
          <template #default="scope" v-if="!item.type">
            <template v-if="item.prop === 'status'">
              <ElTag :type="getStatusType(scope.row.status)" class="status-tag">
                {{ scope.row.status || '-' }}
              </ElTag>
            </template>
            <template v-else-if="item.prop === 'forecastDate'">
              <ElTag
                v-if="scope.row.forecastDate"
                :type="getDeliveryDateType(scope.row.forecastDate)"
                effect="dark"
                class="delivery-date-tag"
              >
                {{ scope.row.forecastDate }}
              </ElTag>
              <span v-else>-</span>
            </template>
            <template v-else>
              {{ scope.row[item.prop as keyof PurchaseWip] }}
            </template>
          </template>
        </ElTableColumn>
      </template>
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
    </div>
  </div>
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

.search-form {
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

.status-tag {
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
</style>
