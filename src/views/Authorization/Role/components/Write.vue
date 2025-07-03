<script setup lang="tsx">
import { Form, FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { PropType, reactive, watch, ref, unref, nextTick } from 'vue'
import { useValidator } from '@/hooks/web/useValidator'
import { useI18n } from '@/hooks/web/useI18n'
import { ElTree, ElCheckboxGroup, ElCheckbox } from 'element-plus'
import { getRoleMenuListApi } from '@/api/menu'

const { t } = useI18n()

const { required } = useValidator()

const props = defineProps({
  currentRow: {
    type: Object as PropType<any>,
    default: () => null
  }
})

const treeRef = ref<typeof ElTree>()

const formSchema = ref<FormSchema[]>([
  {
    field: 'RoleName',
    label: t('role.roleName'),
    component: 'Input',
    componentProps: {
      disabled: true
    }
  },
  {
    field: 'Status',
    label: t('menu.status'),
    component: 'Select',
    componentProps: {
      options: [
        {
          label: t('userDemo.disable'),
          value: '0'
        },
        {
          label: t('userDemo.enable'),
          value: '1'
        }
      ]
    }
  },
  {
    field: 'Menu',
    label: t('role.menu'),
    colProps: {
      span: 24
    },
    formItemProps: {
      slots: {
        default: () => {
          return (
            <>
              <div class="flex w-full">
                <div class="flex-1">
                  <ElTree
                    ref={treeRef}
                    show-checkbox
                    node-key="MenuId"
                    highlight-current
                    check-strictly
                    expand-on-click-node={false}
                    data={treeData.value}
                    onNode-click={nodeClick}
                  >
                    {{
                      default: (data) => {
                        return <span>{t(data.data.Title)}</span>
                      }
                    }}
                  </ElTree>
                </div>
                <div class="flex-1">
                  {unref(currentTreeData) && unref(currentTreeData)?.permissionList ? (
                    <ElCheckboxGroup v-model={unref(currentTreeData).meta.permission}>
                      {unref(currentTreeData)?.permissionList.map((v: any) => {
                        return <ElCheckbox label={v.value}>{v.label}</ElCheckbox>
                      })}
                    </ElCheckboxGroup>
                  ) : null}
                </div>
              </div>
            </>
          )
        }
      }
    }
  }
])

const currentTreeData = ref()
const nodeClick = (treeData: any) => {
  currentTreeData.value = treeData
}

const rules = reactive({
  roleName: [required()],
  role: [required()],
  status: [required()]
})

const { formRegister, formMethods } = useForm()
const { setValues, getFormData, getElFormExpose } = formMethods

const treeData = ref([])
const getMenuList = async () => {
  const res = await getRoleMenuListApi(props.currentRow.Id)
  if (res) {
    treeData.value = res.data
    await nextTick()

    // 根据Enabled字段设置选中状态
    const setCheckedByEnabled = (nodes: any[]) => {
      nodes.forEach((node) => {
        if (node.Enabled) {
          unref(treeRef)?.setChecked(node.MenuId, true, false)
        }
        if (node.children && node.children.length > 0) {
          setCheckedByEnabled(node.children)
        }
      })
    }

    setCheckedByEnabled(res.data)
  }
}
getMenuList()

const submit = async () => {
  const elForm = await getElFormExpose()
  const valid = await elForm?.validate().catch((err) => {
    console.log(err)
  })
  if (valid) {
    const formData = await getFormData()
    const checkedKeys = unref(treeRef)?.getCheckedKeys() || []

    const result = {
      ...formData,
      menuIds: checkedKeys
    }

    console.log('提交的数据:', result)
    return result
  }
}

watch(
  () => props.currentRow,
  (currentRow) => {
    if (!currentRow) return
    setValues(currentRow)
  },
  {
    deep: true,
    immediate: true
  }
)

defineExpose({
  submit
})
</script>

<template>
  <Form :rules="rules" @register="formRegister" :schema="formSchema" />
</template>
