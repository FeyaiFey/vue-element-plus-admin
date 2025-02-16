<script lang="ts" setup>
import { FormSchema, Form } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { useValidator } from '@/hooks/web/useValidator'
import { reactive, ref, watch, onMounted } from 'vue'
import { ElDivider, ElMessage, ElMessageBox } from 'element-plus'
import { getDepartmentApi } from '@/api/department'
import { updateUserInfoApi } from '@/api/user'
import type { DepartmentItem } from '@/api/department/types'

const props = defineProps({
  userInfo: {
    type: Object,
    default: () => ({})
  }
})

const { required, maxlength, email } = useValidator()

const departmentList = ref<DepartmentItem[]>([])

// 获取部门列表
onMounted(async () => {
  try {
    const res = await getDepartmentApi()
    if (res.code === 200) {
      departmentList.value = res.data.list
    }
  } catch (error) {
    console.error('Failed to fetch departments:', error)
  }
})

const formSchema = reactive<FormSchema[]>([
  {
    field: 'username',
    label: '用户名',
    component: 'Input',
    colProps: {
      span: 24
    }
  },
  {
    field: 'email',
    label: '邮箱',
    component: 'Input',
    colProps: {
      span: 24
    }
  },
  {
    field: 'department_name',
    label: '部门',
    component: 'TreeSelect',
    componentProps: {
      data: departmentList,
      props: {
        value: 'id',
        label: 'department_name',
        children: 'children'
      },
      checkStrictly: true,
      defaultExpandAll: true,
      placeholder: '请选择部门'
    },
    colProps: {
      span: 24
    }
  }
])

const rules = reactive({
  username: [required(), maxlength(50)],
  email: [email()],
  department: [required()]
})

const { formRegister, formMethods } = useForm()
const { setValues, getElFormExpose, getFormData } = formMethods

watch(
  () => props.userInfo,
  (value) => {
    setValues(value)
  },
  {
    immediate: true,
    deep: true
  }
)

const saveLoading = ref(false)
const save = async () => {
  const elForm = await getElFormExpose()
  const valid = await elForm?.validate().catch((err) => {
    console.log(err)
  })
  if (valid) {
    ElMessageBox.confirm('是否确认修改?', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        try {
          saveLoading.value = true
          // 获取表单数据
          const formData = await getFormData()

          // 调用更新API
          const res = await updateUserInfoApi({
            username: formData.username,
            email: formData.email,
            department_id: formData.department_name // 这里使用选中的部门ID
          })

          if (res.code === 200) {
            ElMessage.success('修改成功')
            // 触发父组件更新
            emit('update:userInfo', formData)
          } else {
            ElMessage.error(res.message || '修改失败')
          }
        } catch (error) {
          console.error('更新用户信息失败:', error)
          ElMessage.error('修改失败')
        } finally {
          saveLoading.value = false
        }
      })
      .catch(() => {})
  }
}

// 定义 emit
const emit = defineEmits(['update:userInfo'])
</script>

<template>
  <Form :rules="rules" @register="formRegister" :schema="formSchema" />
  <ElDivider />
  <BaseButton type="primary" @click="save">保存</BaseButton>
</template>
