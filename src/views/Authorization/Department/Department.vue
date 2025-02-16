<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ContentWrap } from '@/components/ContentWrap'
import {
  ElInput,
  ElTag,
  ElTable,
  ElTableColumn,
  ElPagination,
  ElMessage,
  ElMessageBox
} from 'element-plus'
import { BaseButton } from '@/components/Button'
import { Icon } from '@/components/Icon'
import { Dialog } from '@/components/Dialog'
import {
  getDepartmentTableApi,
  saveDepartmentApi,
  deleteDepartmentApi,
  batchDeleteDepartmentApi
} from '@/api/department'
import type { DepartmentTableItem } from '@/api/department/types'
import type { TableColumnCtx } from 'element-plus/es/components/table/src/table-column/defaults'
import { listToTree } from '@/utils/tree'
import DepartmentView from './components/view.vue'
import DepartmentEdit from './components/edit.vue'
import DepartmentCreate from './components/new.vue'

const { t } = useI18n()

// 扩展 DepartmentTableItem 类型以支持树形结构
interface TreeDepartmentItem extends DepartmentTableItem {
  children?: TreeDepartmentItem[]
}

const tableData = ref<TreeDepartmentItem[]>([])

interface ColumnType extends Partial<TableColumnCtx<TreeDepartmentItem>> {
  hidden?: boolean
}

const columns = ref<ColumnType[]>([
  {
    label: t('department.id'),
    prop: 'id',
    hidden: true
  },
  {
    label: t('tableDemo.index'),
    type: 'index',
    align: 'center',
    width: 100
  },
  {
    label: t('department.name'),
    prop: 'department_name',
    align: 'left'
  },
  {
    label: t('department.status'),
    prop: 'status',
    align: 'center'
  },
  {
    label: t('department.created_at'),
    prop: 'created_at',
    align: 'center'
  }
])

// 搜索
const search = ref('')

const filterTableData = computed(() => {
  if (!search.value) return tableData.value

  const filterTree = (data: TreeDepartmentItem[]): TreeDepartmentItem[] => {
    return data.filter((item) => {
      // 当前节点是否匹配
      const isMatch = item.department_name.toLowerCase().includes(search.value.toLowerCase())

      // 处理子节点
      if (item.children) {
        item.children = filterTree(item.children)
        // 如果子节点有匹配项，保留父节点
        return isMatch || item.children.length > 0
      }

      return isMatch
    })
  }

  return filterTree(JSON.parse(JSON.stringify(tableData.value)))
})

// 选中的行
const selectedRows = ref<TreeDepartmentItem[]>([])

const handleSelect = (selection: TreeDepartmentItem[]) => {
  selectedRows.value = selection
}

// 计算可见的列
const visibleColumns = computed(() => {
  return columns.value.filter((column) => !column.hidden)
})

// 新增对话框
const createDialogVisible = ref(false)
const createFormRef = ref()

// 新增部门
const newDepartment = () => {
  createDialogVisible.value = true
}

// 保存新增
const saveCreate = async () => {
  if (!createFormRef.value) return

  try {
    // 获取表单组件实例并验证
    const valid = await createFormRef.value.validate()
    if (!valid) return

    const formData = createFormRef.value.formData
    // 调用保存API
    const res = await saveDepartmentApi({
      department_name: formData.department_name,
      parent_id: formData.is_child ? formData.pid : null,
      status: formData.status
    })

    if (res.code === 200) {
      ElMessage.success(t('department.createSuccess'))
      createDialogVisible.value = false
      // 重置表单
      createFormRef.value.resetForm()
      // 刷新列表
      await fetchDepartmentList()
    } else {
      ElMessage.error(res.message || t('department.createError'))
    }
  } catch (error) {
    console.error('Failed to create department:', error)
    ElMessage.error(t('department.createError'))
  }
}

// 批量删除
const batchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning(t('department.selectItemsTip'))
    return
  }

  try {
    await ElMessageBox.confirm(
      t('department.batchDeleteConfirm', { count: selectedRows.value.length }),
      t('department.confirmTitle'),
      {
        confirmButtonText: t('department.confirm'),
        cancelButtonText: t('department.cancel'),
        type: 'warning'
      }
    )

    const ids = selectedRows.value.map((item) => item.id)
    const res = await batchDeleteDepartmentApi(ids)

    if (res.code === 200) {
      ElMessage.success(t('department.batchDeleteSuccess'))
      // 刷新列表
      await fetchDepartmentList()
    } else {
      ElMessage.error(res.message || t('department.batchDeleteError'))
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to batch delete departments:', error)
      ElMessage.error(t('department.batchDeleteError'))
    }
  }
}

// 分页参数
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 添加 loading 状态
const tableLoading = ref(false)

// 获取部门列表
onMounted(async () => {
  try {
    await fetchDepartmentList()
  } catch (error) {
    console.error('Failed to fetch departments:', error)
  }
})

const fetchDepartmentList = async () => {
  tableLoading.value = true
  try {
    const res = await getDepartmentTableApi({
      pageIndex: currentPage.value,
      pageSize: pageSize.value,
      use_cache: false
    })
    if (res.code === 200) {
      tableData.value = listToTree(res.data.list) as TreeDepartmentItem[]
      total.value = res.data.total
    }
  } catch (error) {
    console.error('Failed to fetch departments:', error)
  } finally {
    tableLoading.value = false
  }
}

// 编辑对话框
const editDialogVisible = ref(false)
const currentEditDepartment = ref<TreeDepartmentItem | null>(null)
const editFormRef = ref()

// 处理编辑
const handleEdit = (row: TreeDepartmentItem) => {
  currentEditDepartment.value = { ...row }
  editDialogVisible.value = true
}

// 保存编辑
const saveEdit = async () => {
  if (!editFormRef.value) return

  try {
    // 获取表单组件实例并验证
    const valid = await editFormRef.value.validate()
    if (!valid) return

    const formData = currentEditDepartment.value!
    // 调用保存API
    const res = await saveDepartmentApi({
      id: formData.id,
      department_name: formData.department_name,
      parent_id: formData.pid,
      status: formData.status
    })

    if (res.code === 200) {
      ElMessage.success(t('department.updateSuccess'))
      editDialogVisible.value = false
      // 刷新列表
      await fetchDepartmentList()
    } else {
      ElMessage.error(res.message || t('department.updateError'))
    }
  } catch (error) {
    console.error('Failed to update department:', error)
    ElMessage.error(t('department.updateError'))
  }
}

// 查看对话框
const viewDialogVisible = ref(false)
const currentViewDepartment = ref<TreeDepartmentItem | null>(null)

// 处理查看
const handleView = (row: TreeDepartmentItem) => {
  currentViewDepartment.value = row
  viewDialogVisible.value = true
}

// 处理删除
const handleDelete = async (row: TreeDepartmentItem) => {
  try {
    await ElMessageBox.confirm(
      t('department.deleteConfirm', { name: row.department_name }),
      t('department.confirmTitle'),
      {
        confirmButtonText: t('department.confirm'),
        cancelButtonText: t('department.cancel'),
        type: 'warning'
      }
    )

    const res = await deleteDepartmentApi(row.id)

    if (res.code === 200) {
      ElMessage.success(t('department.deleteSuccess'))
      // 刷新列表
      await fetchDepartmentList()
    } else {
      ElMessage.error(res.message || t('department.deleteError'))
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete department:', error)
      ElMessage.error(t('department.deleteError'))
    }
  }
}

// 处理分页变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchDepartmentList()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchDepartmentList()
}
</script>

<template>
  <ContentWrap>
    <div class="flex flex-col md:flex-row gap-10px mb-10px">
      <BaseButton
        type="primary"
        class="flex items-center gap-10px justify-center md:justify-start w-[120px]"
        @click="newDepartment"
      >
        <Icon icon="mingcute:add-fill" :size="16" />
        <span>{{ t('department.new') }}</span>
      </BaseButton>
      <BaseButton
        type="danger"
        class="flex items-center gap-10px justify-center md:justify-start w-[120px]"
        @click="batchDelete"
      >
        <Icon icon="mingcute:delete-fill" :size="16" />
        <span>{{ t('department.batchDelete') }}</span>
      </BaseButton>
    </div>

    <ElTable
      v-loading="tableLoading"
      :data="filterTableData"
      row-key="id"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      @selection-change="handleSelect"
      border
    >
      <ElTableColumn type="selection" width="55" align="center" />
      <ElTableColumn v-for="column in visibleColumns" :key="column.prop" v-bind="column">
        <template #default="scope" v-if="column.prop === 'status'">
          <ElTag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? t('department.enable') : t('department.disable') }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn label="操作" align="left" fixed="right">
        <template #header>
          <ElInput v-model="search" size="default" :placeholder="t('department.search')" />
        </template>
        <template #default="scope">
          <BaseButton type="primary" @click="handleEdit(scope.row)">{{
            t('department.edit')
          }}</BaseButton>
          <BaseButton type="success" @click="handleView(scope.row)">{{
            t('department.view')
          }}</BaseButton>
          <BaseButton type="danger" @click="handleDelete(scope.row)">{{
            t('department.delete')
          }}</BaseButton>
        </template>
      </ElTableColumn>
    </ElTable>

    <!-- 添加分页组件 -->
    <div class="flex justify-left mt-10px">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        layout="total, sizes, prev, pager, next, jumper"
      />
    </div>
  </ContentWrap>

  <!-- 使用封装的 Dialog 组件 -->
  <!-- 查看 -->
  <Dialog v-model="viewDialogVisible" :title="t('department.departmentDetail')">
    <DepartmentView :data="currentViewDepartment" v-if="currentViewDepartment" />
    <template #footer>
      <BaseButton type="info" @click="viewDialogVisible = false">{{
        t('department.close')
      }}</BaseButton>
    </template>
  </Dialog>

  <!-- 编辑 -->
  <Dialog v-model="editDialogVisible" :title="t('department.editDepartment')">
    <DepartmentEdit
      ref="editFormRef"
      :data="currentEditDepartment"
      v-if="currentEditDepartment"
      @update:data="(val) => (currentEditDepartment = val)"
    />
    <template #footer>
      <BaseButton type="primary" @click="saveEdit">{{ t('department.save') }}</BaseButton>
      <BaseButton type="info" @click="editDialogVisible = false">{{
        t('department.cancel')
      }}</BaseButton>
    </template>
  </Dialog>

  <!-- 新增 -->
  <Dialog v-model="createDialogVisible" :title="t('department.newDepartment')">
    <DepartmentCreate ref="createFormRef" />
    <template #footer>
      <BaseButton type="primary" @click="saveCreate">{{ t('department.save') }}</BaseButton>
      <BaseButton type="info" @click="createDialogVisible = false">{{
        t('department.cancel')
      }}</BaseButton>
    </template>
  </Dialog>
</template>
