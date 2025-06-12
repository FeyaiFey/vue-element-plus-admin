<script setup lang="ts">
import { Form, FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { useUserStore } from '@/store/modules/user'
import { updateUserPasswordApi } from '@/api/user'
import { reactive, ref } from 'vue'
import { useValidator } from '@/hooks/web/useValidator'
import { ElMessage, ElMessageBox, ElDivider } from 'element-plus'
import { SUCCESS_CODE } from '@/constants'

const userStore = useUserStore()

const { required } = useValidator()

const formSchema = reactive<FormSchema[]>([
  {
    field: 'OldPassword',
    label: '旧密码',
    component: 'InputPassword',
    colProps: {
      span: 24
    }
  },
  {
    field: 'NewPassword',
    label: '新密码',
    component: 'InputPassword',
    colProps: {
      span: 24
    },
    componentProps: {
      strength: true
    }
  },
  {
    field: 'ConfirmPassword',
    label: '确认新密码',
    component: 'InputPassword',
    colProps: {
      span: 24
    },
    componentProps: {
      strength: true
    }
  }
])

const rules = reactive({
  OldPassword: [required()],
  NewPassword: [
    required(),
    {
      asyncValidator: async (_, val, callback) => {
        const formData = await getFormData()
        const { ConfirmPassword } = formData
        if (val !== ConfirmPassword) {
          callback(new Error('新密码与确认新密码不一致'))
        } else {
          callback()
        }
      }
    }
  ],
  ConfirmPassword: [
    required(),
    {
      asyncValidator: async (_, val, callback) => {
        const formData = await getFormData()
        const { NewPassword } = formData
        if (val !== NewPassword) {
          callback(new Error('确认新密码与新密码不一致'))
        } else {
          callback()
        }
      }
    }
  ]
})

const { formRegister, formMethods } = useForm()
const { getFormData, getElFormExpose } = formMethods

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
          const res = await updateUserPasswordApi(userStore.getUserInfo?.Id || '', {
            OldPassword: formValues.OldPassword,
            NewPassword: formValues.NewPassword,
            ConfirmPassword: formValues.ConfirmPassword
          })
          if (res.code === SUCCESS_CODE) {
            ElMessage.success('修改成功,请重新登录')
            userStore.reset()
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
  <BaseButton type="primary" @click="save">确认修改</BaseButton>
</template>
