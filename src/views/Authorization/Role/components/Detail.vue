<script setup lang="tsx">
import { PropType, ref, unref, nextTick } from 'vue'
import { Descriptions, DescriptionsSchema } from '@/components/Descriptions'
import { ElTag, ElTree } from 'element-plus'
import { useI18n } from '@/hooks/web/useI18n'
import { getRoleMenuListApi } from '@/api/menu'

const { t } = useI18n()

const props = defineProps({
  currentRow: {
    type: Object as PropType<any>,
    default: () => undefined
  }
})

const renderTag = (enable?: boolean) => {
  return (
    <ElTag type={!enable ? 'danger' : 'success'}>
      {enable ? t('userDemo.enable') : t('userDemo.disable')}
    </ElTag>
  )
}

const treeRef = ref<typeof ElTree>()
const currentTreeData = ref()
const treeData = ref<any[]>([])

const nodeClick = (treeData: any) => {
  currentTreeData.value = treeData
}

const getMenuList = async () => {
  const res = await getRoleMenuListApi(props.currentRow.Id)
  if (res) {
    treeData.value = res.data
    await nextTick()

    // 根据Enabled字段设置展开状态，并高亮启用的节点
    const setExpandByEnabled = (nodes: any[]) => {
      nodes.forEach((node) => {
        if (node.Enabled) {
          // 可以在这里添加一些视觉效果来表示启用状态
        }
        if (node.children && node.children.length > 0) {
          setExpandByEnabled(node.children)
        }
      })
    }

    setExpandByEnabled(res.data)
  }
}

// 初始化菜单列表
if (props.currentRow?.Id) {
  getMenuList()
}

const detailSchema = ref<DescriptionsSchema[]>([
  {
    field: 'RoleName',
    label: t('role.roleName')
  },
  {
    field: 'Status',
    label: t('menu.status'),
    slots: {
      default: (data: any) => {
        return renderTag(data.Status === '1')
      }
    }
  },
  {
    field: 'Description',
    label: t('userDemo.remark'),
    span: 24
  },
  {
    field: 'Menu',
    label: t('role.menu'),
    span: 24,
    slots: {
      default: () => {
        return (
          <>
            <div class="flex w-full">
              <div class="flex-1">
                <ElTree
                  ref={treeRef}
                  node-key="MenuId"
                  highlight-current
                  expand-on-click-node={false}
                  data={treeData.value}
                  onNode-click={nodeClick}
                >
                  {{
                    default: (data) => {
                      const isEnabled = data.data.Enabled
                      return (
                        <div class="flex items-center">
                          <span class={isEnabled ? 'text-green-600 font-medium' : 'text-gray-400'}>
                            {t(data.data.Title)}
                          </span>
                          {isEnabled && (
                            <ElTag type="success" size="small" class="ml-2">
                              {t('userDemo.enable')}
                            </ElTag>
                          )}
                        </div>
                      )
                    }
                  }}
                </ElTree>
              </div>
              <div class="flex-1">
                {unref(currentTreeData) && unref(currentTreeData)?.permissionList ? (
                  <div class="pl-4">
                    <div class="text-sm text-gray-600 mb-2">当前菜单权限：</div>
                    <div class="space-y-1">
                      {unref(currentTreeData)?.permissionList?.map((v: any) => {
                        const hasPermission = unref(currentTreeData)?.meta?.permission?.includes(
                          v.value
                        )
                        return (
                          <ElTag
                            key={v.value}
                            type={hasPermission ? 'success' : 'info'}
                            class="mr-2 mb-1"
                          >
                            {v.label}
                          </ElTag>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div class="pl-4 text-gray-400 text-sm">点击左侧菜单查看权限详情</div>
                )}
              </div>
            </div>
          </>
        )
      }
    }
  }
])
</script>

<template>
  <Descriptions :schema="detailSchema" :data="props.currentRow || {}" />
</template>
