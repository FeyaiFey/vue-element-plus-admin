/** * 用户管理组件 * 包含功能： * 1. 部门树展示和选择 * 2. 用户列表展示、搜索和分页 * 3.
用户角色编辑 * 4. 用户详情查看 * 5. 用户删除（单个/批量） */
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
  ElMessageBox,
  ElTree
} from 'element-plus'
import { BaseButton } from '@/components/Button'
import { Icon } from '@/components/Icon'
import { Dialog } from '@/components/Dialog'
import { getDepartmentApi } from '@/api/department'
import { getUserTableApi, deleteUserApi, batchDeleteUserApi } from '@/api/user'
import { updateRoleApi } from '@/api/role'
import type { DepartmentItem } from '@/api/department/types'
import type { UserTableItem } from '@/api/user/type'
import type { TableColumnCtx } from 'element-plus/es/components/table/src/table-column/defaults'
import { listToTree } from '@/utils/tree'
import UserView from './components/view.vue'
import UserEdit from './components/edit.vue'

const { t } = useI18n()

// 部门树相关状态
const departmentTree = ref<DepartmentItem[]>([]) // 部门树数据
const currentDepartment = ref<number>(0) // 当前选中的部门ID

// 用户列表相关状态
const tableData = ref<UserTableItem[]>([]) // 用户列表数据
const selectedRows = ref<UserTableItem[]>([]) // 选中的用户行
const currentPage = ref(1) // 当前页码
const pageSize = ref(10) // 每页显示条数
const total = ref(0) // 总数据条数
const tableLoading = ref(false) // 表格加载状态
const search = ref('') // 搜索关键字

// 对话框相关状态
const editDialogVisible = ref(false) // 编辑对话框显示状态
const viewDialogVisible = ref(false) // 查看对话框显示状态
const currentEditUser = ref<UserTableItem | null>(null) // 当前编辑的用户数据
const currentViewUser = ref<UserTableItem | null>(null) // 当前查看的用户数据
const editFormRef = ref() // 编辑表单引用

// 表格列配置接口
interface ColumnType extends Partial<TableColumnCtx<UserTableItem>> {
  hidden?: boolean // 是否隐藏列
}

// 表格列配置
const columns = ref<ColumnType[]>([
  { label: t('user.id'), prop: 'id', hidden: true },
  { label: t('user.username'), prop: 'username', align: 'left', width: 100 },
  { label: t('user.email'), prop: 'email', align: 'left', width: 200 },
  { label: t('user.department'), prop: 'department_name', align: 'left', width: 120 },
  { label: t('user.role'), prop: 'role_name', align: 'left', width: 300 },
  { label: t('user.status'), prop: 'status', align: 'center', width: 100 },
  { label: t('user.created_at'), prop: 'created_at', align: 'center' }
])

// 计算可见的表格列
const visibleColumns = computed(() => columns.value.filter((column) => !column.hidden))

// 根据搜索关键字过滤表格数据
const filterTableData = computed(() => {
  if (!search.value) return tableData.value
  const searchValue = search.value.toLowerCase()
  return tableData.value.filter(
    (item) =>
      item.username.toLowerCase().includes(searchValue) ||
      item.email.toLowerCase().includes(searchValue) ||
      item.department_name.toLowerCase().includes(searchValue)
  )
})

/**
 * 获取部门树数据
 * 将列表数据转换为树形结构
 */
const fetchDepartmentTree = async () => {
  try {
    const res = await getDepartmentApi()
    if (res.code === 200) {
      departmentTree.value = listToTree(res.data.list)
    }
  } catch (error) {
    console.error('获取部门树失败:', error)
  }
}

/**
 * 获取用户列表数据
 * 根据当前部门ID、页码和每页条数获取数据
 */
const fetchUserList = async () => {
  if (!currentDepartment.value) return
  tableLoading.value = true
  try {
    const res = await getUserTableApi({
      pageIndex: currentPage.value,
      pageSize: pageSize.value,
      department_id: currentDepartment.value,
      use_cache: false
    })
    if (res.code === 200) {
      tableData.value = res.data.list
      total.value = res.data.total
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
  } finally {
    tableLoading.value = false
  }
}

/**
 * 处理部门选择事件
 * 选择部门后重置页码并重新获取用户列表
 */
const handleDepartmentSelect = (data: DepartmentItem) => {
  currentDepartment.value = Number(data.id) || 0
  currentPage.value = 1
  fetchUserList()
}

/**
 * 处理表格多选事件
 */
const handleSelect = (selection: UserTableItem[]) => {
  selectedRows.value = selection
}

/**
 * 处理编辑按钮点击事件
 */
const handleEdit = (row: UserTableItem) => {
  currentEditUser.value = { ...row }
  editDialogVisible.value = true
}

/**
 * 处理查看按钮点击事件
 */
const handleView = (row: UserTableItem) => {
  currentViewUser.value = row
  viewDialogVisible.value = true
}

/**
 * 保存用户编辑
 * 更新用户角色和状态信息
 */
const saveEdit = async () => {
  if (!editFormRef.value) return
  try {
    const valid = await editFormRef.value.validate()
    if (!valid) return

    const formData = currentEditUser.value!
    const res = await updateRoleApi({
      id: [formData.id],
      role_id: formData.role_id.map(String),
      status: formData.status
    })

    if (res.code === 200) {
      ElMessage.success(t('user.updateSuccess'))
      editDialogVisible.value = false
      await fetchUserList()
    } else {
      ElMessage.error(res.message || t('user.updateError'))
    }
  } catch (error) {
    console.error('更新用户失败:', error)
    ElMessage.error(t('user.updateError'))
  }
}

/**
 * 处理删除用户
 * 删除单个用户数据
 */
const handleDelete = async (row: UserTableItem) => {
  try {
    await ElMessageBox.confirm(
      t('user.deleteConfirm', { name: row.username }),
      t('user.confirmTitle'),
      {
        confirmButtonText: t('user.confirm'),
        cancelButtonText: t('user.cancel'),
        type: 'warning'
      }
    )

    const res = await deleteUserApi(row.id)
    if (res.code === 200) {
      ElMessage.success(t('user.deleteSuccess'))
      await fetchUserList()
    } else {
      ElMessage.error(res.message || t('user.deleteError'))
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error)
      ElMessage.error(t('user.deleteError'))
    }
  }
}

/**
 * 批量删除用户
 * 删除选中的多个用户数据
 */
const batchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning(t('user.selectItemsTip'))
    return
  }

  try {
    await ElMessageBox.confirm(
      t('user.batchDeleteConfirm', { count: selectedRows.value.length }),
      t('user.confirmTitle'),
      {
        confirmButtonText: t('user.confirm'),
        cancelButtonText: t('user.cancel'),
        type: 'warning'
      }
    )

    const res = await batchDeleteUserApi(selectedRows.value.map((item) => item.id))
    if (res.code === 200) {
      ElMessage.success(t('user.batchDeleteSuccess'))
      await fetchUserList()
    } else {
      ElMessage.error(res.message || t('user.batchDeleteError'))
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除用户失败:', error)
      ElMessage.error(t('user.batchDeleteError'))
    }
  }
}

// 组件挂载时获取初始数据
onMounted(async () => {
  await fetchDepartmentTree()
  await fetchUserList()
})
</script>

<template>
  <!-- 页面布局：左侧部门树 + 右侧用户列表 -->
  <div class="flex h-[calc(100vh-100px)]">
    <!-- 左侧部门树 -->
    <ContentWrap title="部门列表" class="w-[240px] mr-4 overflow-auto">
      <ElTree
        :data="departmentTree"
        :props="{ label: 'department_name' }"
        @node-click="handleDepartmentSelect"
        default-expand-all
        class="department-tree"
      />
    </ContentWrap>

    <!-- 右侧用户列表 -->
    <ContentWrap title="用户列表" class="flex-1 overflow-auto">
      <!-- 批量删除按钮 -->
      <div class="flex flex-col md:flex-row gap-10px mb-10px">
        <BaseButton
          type="danger"
          class="flex items-center gap-10px justify-center md:justify-start w-[120px]"
          @click="batchDelete"
        >
          <Icon icon="mingcute:delete-fill" :size="16" />
          <span>{{ t('user.batchDelete') }}</span>
        </BaseButton>
      </div>

      <!-- 用户列表表格 -->
      <ElTable
        v-loading="tableLoading"
        :data="filterTableData"
        @selection-change="handleSelect"
        border
      >
        <!-- 选择列 -->
        <ElTableColumn type="selection" width="55" align="center" />
        <!-- 序号列 -->
        <ElTableColumn type="index" width="80" align="center" :label="t('tableDemo.index')" />
        <!-- 动态列 -->
        <ElTableColumn
          v-for="column in visibleColumns"
          :key="column.prop"
          v-bind="column"
          :label="column.label"
          align="center"
        >
          <template #default="scope">
            <!-- 状态列显示 -->
            <template v-if="column.prop === 'status'">
              <ElTag :type="scope.row.status === 1 ? 'success' : 'danger'">
                {{ scope.row.status === 1 ? t('user.enable') : t('user.disable') }}
              </ElTag>
            </template>
            <!-- 角色列显示 -->
            <template v-else-if="column.prop === 'role_name'">
              <template v-if="scope.row.role_name?.length">
                <ElTag
                  v-for="(role, index) in scope.row.role_name"
                  :key="index"
                  class="mr-2 mb-2"
                  type="success"
                >
                  {{ role }}
                </ElTag>
              </template>
              <template v-else>-</template>
            </template>
            <!-- 其他列显示 -->
            <template v-else>
              {{ column.prop ? scope.row[column.prop] : '' }}
            </template>
          </template>
        </ElTableColumn>
        <!-- 操作列 -->
        <ElTableColumn label="操作" align="left" fixed="right">
          <!-- 搜索框 -->
          <template #header>
            <ElInput v-model="search" size="default" :placeholder="t('user.search')" />
          </template>
          <!-- 操作按钮 -->
          <template #default="scope">
            <BaseButton type="primary" @click="handleEdit(scope.row)">{{
              t('user.edit')
            }}</BaseButton>
            <BaseButton type="success" @click="handleView(scope.row)">{{
              t('user.view')
            }}</BaseButton>
            <BaseButton type="danger" @click="handleDelete(scope.row)">{{
              t('user.delete')
            }}</BaseButton>
          </template>
        </ElTableColumn>
      </ElTable>

      <!-- 分页器 -->
      <div class="flex justify-left mt-10px">
        <ElPagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          @size-change="pageSize = $event"
          @current-change="currentPage = $event"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </ContentWrap>
  </div>

  <!-- 查看用户详情对话框 -->
  <Dialog v-model="viewDialogVisible" :title="t('user.userDetail')">
    <UserView :data="currentViewUser" v-if="currentViewUser" />
    <template #footer>
      <BaseButton type="info" @click="viewDialogVisible = false">{{ t('user.close') }}</BaseButton>
    </template>
  </Dialog>

  <!-- 编辑用户对话框 -->
  <Dialog v-model="editDialogVisible" :title="t('user.editUser')">
    <UserEdit
      ref="editFormRef"
      :data="currentEditUser"
      v-if="currentEditUser"
      @update:data="(val) => (currentEditUser = val)"
    />
    <template #footer>
      <BaseButton type="primary" @click="saveEdit">{{ t('user.save') }}</BaseButton>
      <BaseButton type="info" @click="editDialogVisible = false">{{ t('user.cancel') }}</BaseButton>
    </template>
  </Dialog>
</template>

<style lang="less" scoped>
// 部门树样式
.department-tree {
  :deep(.el-tree-node__content) {
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--el-tree-node-hover-bg-color);
    }
  }

  :deep(.el-tree-node.is-current > .el-tree-node__content) {
    background-color: var(--el-tree-node-hover-bg-color);
  }
}
</style>
