<script lang="ts" setup>
import { FormSchema, Form } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { useValidator } from '@/hooks/web/useValidator'
import { updateUserInfoApi } from '@/api/user'
import { useUserStore } from '@/store/modules/user'
import { reactive, ref, watch } from 'vue'
import { ElDivider, ElMessage, ElMessageBox } from 'element-plus'
import { SUCCESS_CODE } from '@/constants'

const userStore = useUserStore()

const props = defineProps({
  userInfo: {
    type: Object,
    default: () => ({})
  }
})

const { required, maxlength, email } = useValidator()

const formSchema = reactive<FormSchema[]>([
  {
    field: 'Id',
    label: 'ID',
    component: 'Input',
    colProps: {
      span: 24
    },
    componentProps: {
      disabled: true
    }
  },
  {
    field: 'UserName',
    label: '昵称',
    component: 'Input',
    colProps: {
      span: 24
    }
  },
  {
    field: 'Email',
    label: '邮箱',
    component: 'Input',
    colProps: {
      span: 24
    }
  }
])

const rules = reactive({
  UserName: [required(), maxlength(50)],
  Email: [email()]
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
          const formValues = await getFormData()
          const res = await updateUserInfoApi(userStore.getUserInfo?.Id || '', {
            UserName: formValues.UserName,
            Email: formValues.Email
          })
          if (res.code === SUCCESS_CODE) {
            ElMessage.success('修改成功')
            setValues(res.data)
            userStore.setUserInfo(res.data)
          }
        } catch (error) {
          console.log(error)
        } finally {
          saveLoading.value = false
        }
      })
      .catch(() => {})
  }
}
</script>

<template>
  <Form :rules="rules" @register="formRegister" :schema="formSchema" />
  <ElDivider />
  <BaseButton type="primary" @click="save">保存</BaseButton>
</template>
