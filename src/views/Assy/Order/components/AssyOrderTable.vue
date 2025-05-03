<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import {
  ElTable,
  ElTableColumn,
  ElButton,
  ElInput,
  ElSelect,
  ElOption,
  ElDatePicker,
  ElForm,
  ElFormItem,
  ElMessage,
  ElTag,
  ElPagination,
  ElRow,
  ElCol,
  ElCollapseTransition
} from 'element-plus'
import { Icon } from '@/components/Icon'
import { getSalesApi } from '@/api/params'
import { getAssyRequireOrdersApi } from '@/api/assy'
import { AssyRequireOrdersQuery } from '@/api/assy/type'

// 定义 props
const props = defineProps<{
  showQueryForm?: boolean
  showCreateButton?: boolean
  showOperations?: boolean
  status?: string
}>()

// 定义事件
const emit = defineEmits<{
  (e: 'view', row: any): void
  (e: 'create'): void
  (e: 'cancel', row: any): void
  (e: 'delete', row: any): void
}>()

// 查询表单
const queryForm = reactive<AssyRequireOrdersQuery>({
  itemName: '',
  abtr: '',
  status: props.status || '',
  sales: '',
  order_date_start: '',
  order_date_end: ''
})

// 日期范围
const dateRange = ref<[string, string] | undefined>(undefined)

// 是否折叠
const isCollapse = ref(true)

// 监听日期范围变化
watch(dateRange, (newVal) => {
  if (newVal) {
    queryForm.order_date_start = newVal[0]
    queryForm.order_date_end = newVal[1]
  } else {
    queryForm.order_date_start = ''
    queryForm.order_date_end = ''
  }
})

// 销售员列表
const salesList = ref<any[]>([])

// 订单状态选项
const statusOptions = [
  { label: '全部', value: '' },
  { label: '待处理', value: '0' },
  { label: '已处理', value: '1' },
  { label: '已作废', value: '2' }
]

// 订单列表数据
const orderList = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(50)

// 获取销售员列表
const getSalesList = async () => {
  try {
    const res = await getSalesApi()
    salesList.value = Array.isArray(res.data) ? res.data : []
  } catch (error) {
    console.error('获取销售员列表失败:', error)
    ElMessage.error('获取销售员列表失败')
  }
}

// 获取订单列表
const getOrderList = async () => {
  try {
    loading.value = true
    const params = {
      ...queryForm,
      pageIndex: currentPage.value,
      pageSize: pageSize.value
    }
    const res = await getAssyRequireOrdersApi(params)
    orderList.value = res.data.list || []
    total.value = res.data.total || 0
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

// 查询
const handleQuery = () => {
  currentPage.value = 1
  getOrderList()
}

// 重置查询
const resetQuery = () => {
  Object.keys(queryForm).forEach((key) => {
    queryForm[key] = ''
  })
  dateRange.value = undefined
  handleQuery()
}

// 切换折叠状态
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 处理分页变化
const handlePageChange = (page: number) => {
  currentPage.value = page
  getOrderList()
}

// 处理每页条数变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  getOrderList()
}

// 获取状态标签类型
const getStatusType = (status: string) => {
  switch (status) {
    case '0':
      return 'warning'
    case '1':
      return 'success'
    case '2':
      return 'danger'
    default:
      return 'info'
  }
}

// 获取状态标签文本
const getStatusText = (status: string) => {
  switch (status) {
    case '0':
      return '待处理'
    case '1':
      return '已处理'
    case '2':
      return '已作废'
    default:
      return '未知'
  }
}

// 暴露方法给父组件
defineExpose({
  getOrderList,
  orderList
})

onMounted(() => {
  if (props.showQueryForm) {
    getSalesList()
  }
  getOrderList()
})
</script>

<template>
  <!-- 查询表单 -->
  <ElForm v-if="showQueryForm" :model="queryForm" label-width="100px" class="search-form">
    <ElRow :gutter="20">
      <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
        <ElFormItem label="品名">
          <ElInput v-model="queryForm.itemName" placeholder="请输入品名" clearable />
        </ElFormItem>
      </ElCol>
      <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
        <ElFormItem label="管装/编带">
          <ElSelect v-model="queryForm.abtr" placeholder="请选择" clearable>
            <ElOption label="管装" value="管装" />
            <ElOption label="编带" value="编带" />
          </ElSelect>
        </ElFormItem>
      </ElCol>
      <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
        <ElFormItem label="状态">
          <ElSelect v-model="queryForm.status" placeholder="请选择" clearable>
            <ElOption
              v-for="option in statusOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </ElSelect>
        </ElFormItem>
      </ElCol>
    </ElRow>
    <ElCollapseTransition>
      <div v-show="!isCollapse">
        <ElRow :gutter="20">
          <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
            <ElFormItem label="销售员">
              <ElSelect v-model="queryForm.sales" placeholder="请选择" clearable>
                <ElOption
                  v-for="sales in salesList"
                  :key="sales.value"
                  :label="sales.label"
                  :value="sales.value"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
            <ElFormItem label="订单日期">
              <ElDatePicker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                clearable
              />
            </ElFormItem>
          </ElCol>
        </ElRow>
      </div>
    </ElCollapseTransition>
    <ElRow>
      <ElCol :span="24" class="search-buttons">
        <ElButton type="primary" @click="handleQuery">
          <Icon icon="vi-ri:search-line" class="mr-1" />
          查询
        </ElButton>
        <ElButton @click="resetQuery">
          <Icon icon="vi-ri:refresh-line" class="mr-1" />
          重置
        </ElButton>
        <ElButton link @click="toggleCollapse">
          <Icon
            :icon="isCollapse ? 'vi-ri:arrow-down-s-line' : 'vi-ri:arrow-up-s-line'"
            class="mr-1"
          />
          {{ isCollapse ? '展开' : '收起' }}
        </ElButton>
      </ElCol>
    </ElRow>
  </ElForm>

  <div v-if="showCreateButton" class="mb-1">
    <ElRow>
      <ElCol :span="24">
        <ElButton type="primary" @click="emit('create')">
          <Icon icon="vi-ri:add-line" class="mr-1" />
          新建订单
        </ElButton>
      </ElCol>
    </ElRow>
  </div>

  <!-- 表格区域 -->
  <div class="relative">
    <!-- 订单列表 -->
    <ElTable
      :data="orderList"
      border
      stripe
      v-loading="loading"
      style="width: 100%"
      height="calc(100vh - 280px)"
    >
      <ElTableColumn prop="ASSY_REQUIREMENTS_ID" label="订单ID" v-if="false" />
      <ElTableColumn
        prop="ITEM_NAME"
        label="品名"
        align="right"
        width="150"
        header-align="center"
        show-overflow-tooltip
      />
      <ElTableColumn prop="ABTR" label="管装/编带" align="center" header-align="center" />
      <ElTableColumn prop="BUSINESS_QTY" label="需求数量" align="right" header-align="center">
        <template #default="{ row }">
          {{ row.BUSINESS_QTY.toLocaleString() }}
        </template>
      </ElTableColumn>
      <ElTableColumn
        prop="REQUIREMENT_TYPE"
        label="需求类型"
        align="center"
        header-align="center"
      />
      <ElTableColumn prop="EMERGENCY" label="紧急程度" align="center" header-align="center" />
      <ElTableColumn prop="SALES" label="销售员" align="center" header-align="center" />
      <ElTableColumn prop="STATUS" label="状态" align="center" header-align="center">
        <template #default="{ row }">
          <ElTag :type="getStatusType(row.STATUS)">
            {{ getStatusText(row.STATUS) }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="CreateDate" label="创建时间" align="center" header-align="center" />
      <ElTableColumn
        v-if="showOperations"
        label="操作"
        fixed="right"
        width="250"
        align="center"
        header-align="center"
      >
        <template #default="{ row }">
          <ElButton
            type="primary"
            link
            @click="emit('view', row)"
            :disabled="row.STATUS === 'cancelled'"
          >
            <Icon icon="vi-majesticons:checkbox-list-detail-line" class="mr-1" />
            查看
          </ElButton>
          <ElButton type="danger" link @click="emit('cancel', row)" :disabled="row.STATUS === '2'">
            <Icon icon="vi-quill:discard" class="mr-1" />
            作废
          </ElButton>
          <ElButton type="danger" link @click="emit('delete', row)" :disabled="row.STATUS !== '0'">
            <Icon icon="vi-ri:delete-bin-line" class="mr-1" />
            删除
          </ElButton>
        </template>
      </ElTableColumn>
    </ElTable>

    <!-- 分页 -->
    <div class="flex mt-1">
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
.search-form {
  :deep(.el-row) {
    margin-bottom: 0;
  }

  .search-buttons {
    display: flex;
    justify-content: center;
    gap: 12px;

    .el-button {
      min-width: 120px;
    }
  }
}

.mx-2 {
  margin: 0 8px;
}

.relative {
  position: relative;
  width: 100%;
  min-height: calc(100vh - 280px);
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
}

:deep(.el-table) {
  --el-table-header-bg-color: var(--el-fill-color-light);
  --el-table-row-hover-bg-color: var(--el-fill-color-light);

  .el-table__header {
    th {
      height: 40px;
      padding: 4px 0;
      font-weight: 600;
      color: var(--el-text-color-primary);
      background-color: var(--el-fill-color-light);
      border-bottom: 2px solid var(--el-border-color-lighter);
      transition: all 0.3s;

      &:hover {
        background-color: var(--el-fill-color);
      }
    }
  }

  .el-table__row {
    td {
      height: 40px;
      padding: 8px 0;
      transition: all 0.3s;
    }
  }
}
</style>
