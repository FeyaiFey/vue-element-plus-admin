<script setup lang="tsx">
import { reactive, ref, unref } from 'vue'
import { getRoleTableApi } from '@/api/role'
import type { RoleTableQuery } from '@/api/role/types'
import { useTable } from '@/hooks/web/useTable'
import { useI18n } from '@/hooks/web/useI18n'
import { Table, TableColumn } from '@/components/Table'
import { ElTag, ElMessage } from 'element-plus'
import { Search } from '@/components/Search'
import { FormSchema } from '@/components/Form'
import { ContentWrap } from '@/components/ContentWrap'
import Write from './components/Write.vue'
import Detail from './components/Detail.vue'
import { Dialog } from '@/components/Dialog'
import { BaseButton } from '@/components/Button'
import { updateRoleMenuApi } from '@/api/menu'
import type { UpdateRoleMenuRequest } from '@/api/menu/types'

// 定义组件名称（用于keep-alive缓存）
defineOptions({
  name: 'RoleAuthorization'
})

const { t } = useI18n()

const { tableRegister, tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const res = await getRoleTableApi(searchParams.value)
    return {
      list: res.data.list || [],
      total: res.data.total
    }
  }
})

const { dataList, loading, total } = tableState
const { getList } = tableMethods

const tableColumns = reactive<TableColumn[]>([
  {
    field: 'index',
    label: t('userDemo.index'),
    type: 'index'
  },
  {
    field: 'RoleName',
    label: t('role.roleName')
  },
  {
    field: 'Status',
    label: t('menu.status'),
    slots: {
      default: (data: any) => {
        return (
          <>
            <ElTag type={data.row.Status === '0' ? 'danger' : 'success'}>
              {data.row.Status === '1' ? t('userDemo.enable') : t('userDemo.disable')}
            </ElTag>
          </>
        )
      }
    }
  },
  {
    field: 'CreatedAt',
    label: t('tableDemo.displayTime')
  },
  {
    field: 'Description',
    label: t('userDemo.remark')
  },
  {
    field: 'action',
    label: t('userDemo.action'),
    width: 240,
    slots: {
      default: (data: any) => {
        const row = data.row
        return (
          <>
            <BaseButton type="primary" onClick={() => action(row, 'edit')}>
              {t('exampleDemo.edit')}
            </BaseButton>
            <BaseButton type="success" onClick={() => action(row, 'detail')}>
              {t('exampleDemo.detail')}
            </BaseButton>
            <BaseButton type="danger">{t('exampleDemo.del')}</BaseButton>
          </>
        )
      }
    }
  },
  {
    field: 'Id',
    hidden: true
  }
])

const searchSchema = reactive<FormSchema[]>([
  {
    field: 'RoleName',
    label: t('role.roleName'),
    component: 'Input'
  }
])

const searchParams = ref<RoleTableQuery>({
  pageIndex: 1,
  pageSize: 10
})

const setSearchParams = (data: RoleTableQuery) => {
  searchParams.value = data
  searchParams.value.pageIndex = 1
  searchParams.value.pageSize = 10
  getList()
}

const dialogVisible = ref(false)
const dialogTitle = ref('')
const currentRow = ref()
const actionType = ref('')
const writeRef = ref<ComponentRef<typeof Write>>()
const saveLoading = ref(false)

const action = (row: any, type: string) => {
  dialogTitle.value = t(type === 'edit' ? 'exampleDemo.edit' : 'exampleDemo.detail')
  actionType.value = type
  currentRow.value = row
  dialogVisible.value = true
}

const AddAction = () => {
  dialogTitle.value = t('exampleDemo.add')
  currentRow.value = undefined
  dialogVisible.value = true
  actionType.value = ''
}

const save = async () => {
  const write = unref(writeRef)
  if (!write) {
    ElMessage.error('表单引用不存在')
    return
  }

  try {
    saveLoading.value = true
    const formData = await write.submit()

    if (formData && currentRow.value) {
      // 构造更新角色菜单权限的请求数据
      const updateRoleMenuData: UpdateRoleMenuRequest = {
        roleId: currentRow.value.Id,
        menuPermissions: formData.menuIds.map((menuId: number) => ({
          menuId,
          enabled: true
        }))
      }

      // 调用API更新角色菜单权限
      const result = await updateRoleMenuApi(updateRoleMenuData)

      if (result && result.data?.success) {
        ElMessage.success(
          `角色权限更新成功，新增${result.data.added}个权限，更新${result.data.updated}个权限，移除${result.data.removed}个权限`
        )
        dialogVisible.value = false
        // 刷新表格数据
        getList()
      } else {
        ElMessage.error(result?.data?.message || '角色权限更新失败')
      }
    }
  } catch (error) {
    console.error('保存角色权限时发生错误:', error)
    ElMessage.error('保存失败，请重试')
  } finally {
    saveLoading.value = false
  }
}
</script>

<template>
  <ContentWrap>
    <Search :schema="searchSchema" @reset="setSearchParams" @search="setSearchParams" />
    <div class="mb-10px">
      <BaseButton type="primary" @click="AddAction">{{ t('exampleDemo.add') }}</BaseButton>
    </div>
    <Table
      :columns="tableColumns"
      default-expand-all
      node-key="id"
      :data="dataList"
      :loading="loading"
      :pagination="{
        total
      }"
      @register="tableRegister"
    />
  </ContentWrap>

  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <Write v-if="actionType !== 'detail'" ref="writeRef" :current-row="currentRow" />
    <Detail v-else :current-row="currentRow" />

    <template #footer>
      <BaseButton
        v-if="actionType !== 'detail'"
        type="primary"
        :loading="saveLoading"
        @click="save"
      >
        {{ t('exampleDemo.save') }}
      </BaseButton>
      <BaseButton @click="dialogVisible = false">{{ t('dialogDemo.close') }}</BaseButton>
    </template>
  </Dialog>
</template>
