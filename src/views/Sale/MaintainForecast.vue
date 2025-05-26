<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import {
  ElMessage,
  ElMessageBox,
  ElRow,
  ElCol,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElButton,
  ElTable,
  ElTableColumn,
  ElPagination,
  ElInputNumber
} from 'element-plus'
import { Icon } from '@/components/Icon'
import ResizeDialog from '@/components/Dialog/src/ResizeDialog.vue'
import {
  getSaleTableApi,
  createSaleTargetApi,
  updateSaleTargetApi,
  deleteSaleTargetApi
} from '@/api/sale'
import { getSaleUnitApi, getSalesApi } from '@/api/params'
import type { SaleUnit, Sales } from '@/api/params/type'
import type { SaleTable, SaleTableQuery, SaleTargetUpdate, SaleTargetCreate } from '@/api/sale/type'

defineOptions({
  name: 'MaintainForecast'
})

// 查询参数
const queryForm = reactive<SaleTableQuery>({
  year: undefined,
  month: undefined,
  admin_unit_name: '',
  employee_name: '',
  pageIndex: 1,
  pageSize: 50
})

const saleUnitList = ref<SaleUnit[]>([])
const salesList = ref<Sales[]>([])

const getSalesByUnit = async (adminUnitName: string) => {
  try {
    const res = await getSalesApi(adminUnitName)
    salesList.value = res.data.list
  } catch (error) {
    console.error('获取业务员数据失败:', error)
    ElMessage.error('获取业务员数据失败')
  }
}

// 监听行政部门变化
watch(
  () => queryForm.admin_unit_name,
  (newVal) => {
    if (newVal) {
      getSalesByUnit(newVal)
    } else {
      salesList.value = []
    }
    // 清空已选择的业务员
    queryForm.employee_name = ''
  }
)

const getInfo = async () => {
  try {
    const res = await getSaleUnitApi()
    saleUnitList.value = res.data.list
    // 如果有选中的行政部门，则获取对应的业务员列表
    if (queryForm.admin_unit_name) {
      await getSalesByUnit(queryForm.admin_unit_name)
    }
  } catch (error) {
    console.error('获取销售预测数据失败:', error)
    ElMessage.error('获取销售预测数据失败')
  }
}

// 月份选项
const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  label: `${i + 1}月`,
  value: i + 1
}))

// 表格数据
const tableData = ref<SaleTable[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(50)

// 对话框相关
const dialogCreateVisible = ref(false)
const dialogCreateTitle = ref('新增销售预测')
const dialogEditVisible = ref(false)
const dialogEditTitle = ref('编辑销售预测')
const dialogType = ref<'create' | 'edit'>('create')
const currentRecord = ref<SaleTable | null>(null)

// 表单数据
const createFormData = reactive<SaleTargetCreate>({
  year: Number(new Date().getFullYear()),
  month: Number(new Date().getMonth() + 1),
  admin_unit_name: '',
  employee_name: '',
  monthly_target: 0
})

// 编辑表单数据
const editFormData = reactive<SaleTargetUpdate>({
  id: '',
  year: Number(new Date().getFullYear()),
  month: Number(new Date().getMonth() + 1),
  admin_unit_name: '',
  employee_name: '',
  monthly_target: 0
})
// 表单规则
const formRules = {
  year: [{ required: true, message: '请输入年份', trigger: 'blur' }],
  month: [{ required: true, message: '请选择月份', trigger: 'change' }],
  admin_unit_name: [{ required: true, message: '请输入行政部门', trigger: 'blur' }],
  employee_name: [{ required: true, message: '请输入业务员', trigger: 'blur' }],
  monthly_target: [{ required: true, message: '请输入月度目标', trigger: 'blur' }]
}
const formRef = ref()

// 获取表格数据
const getTableData = async () => {
  loading.value = true
  try {
    const params = {
      year: queryForm.year || undefined,
      month: queryForm.month || undefined,
      admin_unit_name: queryForm.admin_unit_name || undefined,
      employee_name: queryForm.employee_name || undefined,
      pageIndex: currentPage.value,
      pageSize: pageSize.value
    }
    const res = await getSaleTableApi(params)
    tableData.value = res.data.list || []
    total.value = res.data.total || 0
  } catch (error) {
    console.error('获取销售预测数据失败:', error)
    ElMessage.error('获取销售预测数据失败')
  } finally {
    loading.value = false
  }
}

// 处理查询
const handleQuery = () => {
  currentPage.value = 1
  getTableData()
}

// 处理页码变更
const handleCurrentChange = (page: number) => {
  currentPage.value = page
  getTableData()
}

// 处理每页条数变更
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  getTableData()
}

// 监听新增表单的行政部门变化
watch(
  () => createFormData.admin_unit_name,
  (newVal) => {
    if (newVal) {
      getSalesByUnit(newVal)
    } else {
      salesList.value = []
    }
    // 清空已选择的业务员
    createFormData.employee_name = ''
  }
)

// 监听编辑表单的行政部门变化
watch(
  () => editFormData.admin_unit_name,
  (newVal) => {
    if (newVal) {
      getSalesByUnit(newVal)
    } else {
      salesList.value = []
    }
    // 清空已选择的业务员
    editFormData.employee_name = ''
  }
)

// 创建新预测
const handleCreate = () => {
  dialogType.value = 'create'
  dialogCreateTitle.value = '新增销售预测'
  createFormData.year = Number(new Date().getFullYear())
  createFormData.month = Number(new Date().getMonth() + 1)
  createFormData.employee_name = ''
  createFormData.admin_unit_name = ''
  createFormData.monthly_target = 0
  dialogCreateVisible.value = true
}

// 编辑预测
const handleEdit = (row: SaleTable) => {
  dialogType.value = 'edit'
  dialogEditTitle.value = '编辑销售预测'
  currentRecord.value = row
  editFormData.id = row.Id
  editFormData.year = row.Year
  editFormData.month = row.Month
  editFormData.employee_name = row.EmployeeName || ''
  editFormData.admin_unit_name = row.AdminUnitName || ''
  editFormData.monthly_target = row.MonthlyTarget
  dialogEditVisible.value = true
  // 如果选择了行政部门，获取对应的业务员列表
  if (editFormData.admin_unit_name) {
    getSalesByUnit(editFormData.admin_unit_name)
  }
}

// 删除预测
const handleDelete = async (row: SaleTable) => {
  try {
    await ElMessageBox.confirm('确定要删除该销售预测吗？删除后将无法恢复', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteSaleTargetApi(row.Id)
    ElMessage.success('删除销售预测成功')
    getTableData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除销售预测数据失败:', error)
      ElMessage.error('删除销售预测数据失败')
    }
  }
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    if (dialogType.value === 'edit') {
      // 编辑
      await updateSaleTargetApi(editFormData)
      ElMessage.success('更新成功！')
    } else {
      // 新增
      // 创建时不需要id字段
      const params = {
        year: createFormData.year,
        month: createFormData.month,
        admin_unit_name: createFormData.admin_unit_name,
        employee_name: createFormData.employee_name,
        monthly_target: createFormData.monthly_target
      }
      await createSaleTargetApi(params)
      ElMessage.success('创建成功！')
    }

    dialogCreateVisible.value = false
    dialogEditVisible.value = false
    getTableData()
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败')
  }
}

// 处理输入框回车事件
const handleKeyup = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleQuery()
  }
}

// 格式化月份
const formatMonth = (row: SaleTable) => {
  return `${row.Month}月`
}

// 格式化金额
const formatAmount = (row: SaleTable) => {
  return row.MonthlyTarget.toLocaleString()
}

// 格式化日期时间
const formatDateTime = (dateTimeStr: string) => {
  if (!dateTimeStr) return '-'
  const date = new Date(dateTimeStr)
  return date.toLocaleString()
}

onMounted(() => {
  getTableData()
  getInfo()
})
</script>

<template>
  <!-- 查询表单 -->
  <div class="search-form">
    <ElForm :model="queryForm" label-width="100px" inline>
      <ElRow :gutter="20">
        <ElCol :xs="24" :sm="12" :md="6" :lg="4" :xl="4">
          <ElFormItem label="行政部门" style="width: 100%">
            <ElSelect
              v-model="queryForm.admin_unit_name"
              placeholder="请选择行政部门"
              clearable
              style="width: 100%"
            >
              <ElOption
                v-for="item in saleUnitList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="12" :md="6" :lg="4" :xl="4">
          <ElFormItem label="业务员" style="width: 100%">
            <ElSelect
              v-model="queryForm.employee_name"
              placeholder="请选择业务员"
              style="width: 100%"
              clearable
            >
              <ElOption
                v-for="item in salesList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="12" :md="6" :lg="4" :xl="4">
          <ElFormItem label="年份">
            <ElInput
              v-model="queryForm.year"
              placeholder="请输入年份"
              clearable
              @keyup.enter="handleKeyup"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="12" :md="6" :lg="4" :xl="4">
          <ElFormItem label="月份">
            <ElInput
              v-model="queryForm.month"
              placeholder="请选择月份"
              clearable
              @keyup.enter="handleKeyup"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>
  </div>
  <!-- 表格操作栏 -->
  <div class="table-header">
    <div class="left-buttons">
      <el-button type="primary" @click="handleCreate">新增预测</el-button>
    </div>
  </div>

  <!-- 表格 -->
  <ElTable
    v-loading="loading"
    :data="tableData"
    border
    stripe
    style="width: 100%"
    height="calc(100vh - 280px)"
  >
    <ElTableColumn type="index" width="50" label="#" align="center" />
    <ElTableColumn prop="Year" label="年份" width="100" align="center" />
    <ElTableColumn prop="Month" label="月份" width="100" align="center" :formatter="formatMonth" />
    <ElTableColumn prop="AdminUnitName" label="行政部门" align="center" />
    <ElTableColumn prop="EmployeeName" label="业务员" align="center" />
    <ElTableColumn
      prop="MonthlyTarget"
      label="月度目标"
      align="center"
      :formatter="formatAmount"
      width="150"
    />
    <ElTableColumn prop="CreatedBy" label="创建人" align="center" />
    <ElTableColumn prop="CreatedAt" label="创建时间" align="center">
      <template #default="scope">
        {{ formatDateTime(scope.row.CreatedAt) }}
      </template>
    </ElTableColumn>
    <ElTableColumn label="操作" width="180" align="center">
      <template #default="scope">
        <ElButton type="primary" size="small" @click="handleEdit(scope.row)">
          <Icon icon="vi-icon-park-outline:edit" />
          编辑
        </ElButton>
        <ElButton type="danger" size="small" @click="handleDelete(scope.row)">
          <Icon icon="vi-icon-park-outline:delete" />
          删除
        </ElButton>
      </template>
    </ElTableColumn>
  </ElTable>

  <!-- 分页 -->
  <div class="pagination-container">
    <ElPagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      background
    />
  </div>
  <!-- 表单对话框 -->
  <ResizeDialog
    v-model="dialogCreateVisible"
    :title="dialogCreateTitle"
    :fullscreen="true"
    :initWidth="800"
    :initHeight="400"
    @close="dialogCreateVisible = false"
  >
    <ElForm
      v-if="dialogCreateVisible"
      ref="formRef"
      :model="createFormData"
      :rules="formRules"
      label-width="100px"
      label-position="right"
    >
      <ElFormItem label="年份" prop="year">
        <ElInput v-model="createFormData.year" placeholder="请输入年份" style="width: 100%" />
      </ElFormItem>
      <ElFormItem label="月份" prop="month">
        <ElSelect v-model="createFormData.month" placeholder="请选择月份" style="width: 100%">
          <ElOption
            v-for="item in monthOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="行政部门" prop="admin_unit_name">
        <ElSelect
          v-model="createFormData.admin_unit_name"
          placeholder="请选择行政部门"
          style="width: 100%"
          clearable
        >
          <ElOption
            v-for="item in saleUnitList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="业务员" prop="employee_name">
        <ElSelect
          v-model="createFormData.employee_name"
          placeholder="请选择业务员"
          style="width: 100%"
          clearable
        >
          <ElOption
            v-for="item in salesList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="月度目标" prop="monthly_target">
        <ElInputNumber
          v-model="createFormData.monthly_target"
          :min="0"
          :precision="0"
          :step="10000"
          style="width: 100%"
          placeholder="请输入月度目标"
        />
      </ElFormItem>

      <ElFormItem>
        <div class="dialog-footer">
          <ElButton @click="dialogCreateVisible = false">取消</ElButton>
          <ElButton type="primary" @click="submitForm">确定</ElButton>
        </div>
      </ElFormItem>
    </ElForm>
  </ResizeDialog>

  <ResizeDialog
    v-model="dialogEditVisible"
    :title="dialogEditTitle"
    :fullscreen="true"
    :initWidth="800"
    :initHeight="400"
    @close="dialogEditVisible = false"
  >
    <ElForm
      v-if="dialogEditVisible"
      ref="formRef"
      :model="editFormData"
      :rules="formRules"
      label-width="100px"
      label-position="right"
    >
      <ElFormItem label="年份" prop="year">
        <ElInput v-model="editFormData.year" placeholder="请输入年份" style="width: 100%" />
      </ElFormItem>
      <ElFormItem label="月份" prop="month">
        <ElSelect v-model="editFormData.month" placeholder="请选择月份" style="width: 100%">
          <ElOption
            v-for="item in monthOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="行政部门" prop="admin_unit_name">
        <ElSelect
          v-model="editFormData.admin_unit_name"
          placeholder="请选择行政部门"
          style="width: 100%"
          clearable
        >
          <ElOption
            v-for="item in saleUnitList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="业务员" prop="employee_name">
        <ElSelect
          v-model="editFormData.employee_name"
          placeholder="请选择业务员"
          style="width: 100%"
          clearable
        >
          <ElOption
            v-for="item in salesList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="月度目标" prop="monthly_target">
        <ElInputNumber
          v-model="editFormData.monthly_target"
          :min="0"
          :precision="0"
          :step="10000"
          style="width: 100%"
          placeholder="请输入月度目标"
        />
      </ElFormItem>

      <ElFormItem>
        <div class="dialog-footer">
          <ElButton @click="dialogEditVisible = false">取消</ElButton>
          <ElButton type="primary" @click="submitForm">确定</ElButton>
        </div>
      </ElFormItem>
    </ElForm>
  </ResizeDialog>
</template>

<style lang="less" scoped>
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  .left-buttons {
    display: flex;
    gap: 8px;
  }
}

.pagination-container {
  display: flex;
  margin-top: 20px;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}
</style>
