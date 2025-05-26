<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getSalesApi } from '@/api/params'
import {
  getAssyRequireOrdersApi,
  submitAssyRequireOrdersApi,
  cancelAssyRequireOrderApi,
  deleteAssyRequireOrderApi
} from '@/api/assy'
import { AssyRequireOrdersQuery } from '@/api/assy/type'
import AssyOrderForm from './components/AssyOrderForm.vue'
import AssyOrderTable from './components/AssyOrderTable.vue'
import ResizeDialog from '@/components/Dialog/src/ResizeDialog.vue'

defineOptions({
  name: 'AssyOrder'
})

// 查询表单
const queryForm = reactive<AssyRequireOrdersQuery>({
  itemName: '',
  abtr: '',
  status: '',
  sales: '',
  order_date_start: '',
  order_date_end: ''
})

// 日期范围
const dateRange = ref<[string, string] | undefined>(undefined)

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

// 订单列表数据
const orderList = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(50)

// 获取表格组件实例
const orderTableRef = ref()

// 新建订单对话框
const dialogVisible = ref(false)
const dialogTitle = ref('新建封装订单')
const dialogType = ref<'create' | 'view'>('create')
const currentOrder = ref<any>(null)

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

// 查看订单
const handleView = async (row: any) => {
  try {
    const res = await getAssyRequireOrdersApi({ assy_requirements_id: row.ASSY_REQUIREMENTS_ID })
    if (res.data && res.data.list && res.data.list.length > 0) {
      dialogType.value = 'view'
      dialogTitle.value = '查看封装订单'
      currentOrder.value = res.data.list[0]
      dialogVisible.value = true
    } else {
      ElMessage.warning('未找到订单详情')
    }
  } catch (error) {
    console.error('获取订单详情失败:', error)
    ElMessage.error('获取订单详情失败')
  }
}

// 作废订单
const handleCancel = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要作废该订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await cancelAssyRequireOrderApi({ id: row.ASSY_REQUIREMENTS_ID })
    ElMessage.success('订单已作废')
    // 刷新表格
    orderTableRef.value?.getOrderList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('作废订单失败:', error)
      ElMessage.error('作废订单失败')
    }
  }
}

// 删除订单
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该订单吗？删除后将无法恢复', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteAssyRequireOrderApi({ id: row.ASSY_REQUIREMENTS_ID })
    ElMessage.success('订单已删除')
    // 刷新表格
    orderTableRef.value?.getOrderList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除订单失败:', error)
      ElMessage.error('删除订单失败')
    }
  }
}

// 处理订单表单提交
const handleSubmit = async (formData: any) => {
  try {
    if (dialogType.value === 'create') {
      await submitAssyRequireOrdersApi(formData)
      ElMessage.success('创建订单成功')
    }
    dialogVisible.value = false
    // 刷新表格
    orderTableRef.value?.getOrderList()
  } catch (error) {
    console.error('提交订单失败:', error)
    ElMessage.error('提交订单失败')
  }
}

onMounted(() => {
  getSalesList()
  getOrderList()
})
</script>

<template>
  <AssyOrderTable
    ref="orderTableRef"
    :show-query-form="true"
    :show-create-button="true"
    :show-operations="true"
    @view="handleView"
    @create="dialogVisible = true"
    @cancel="handleCancel"
    @delete="handleDelete"
  />

  <!-- 订单表单对话框 -->
  <ResizeDialog
    v-model="dialogVisible"
    :title="dialogTitle"
    :fullscreen="true"
    :initWidth="1000"
    :initHeight="600"
    @close="dialogVisible = false"
  >
    <AssyOrderForm
      v-if="dialogVisible"
      :edit-mode="dialogType === 'view'"
      :initial-data="currentOrder"
      @close="dialogVisible = false"
      @submit="handleSubmit"
    />
  </ResizeDialog>
</template>

<style lang="less" scoped>
.search-form {
  padding: 20px;
  margin-bottom: 20px;
  background-color: var(--el-bg-color);
  border-radius: 4px;

  :deep(.el-row) {
    margin-bottom: 0;
  }

  .search-buttons {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-top: 16px;

    .el-button {
      min-width: 120px;
    }
  }
}

.mx-2 {
  margin: 0 8px;
}
</style>
