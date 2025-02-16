<script setup lang="ts">
import { Form, FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { reactive, ref } from 'vue'
import { useValidator } from '@/hooks/web/useValidator'
import { ElMessage, ElMessageBox, ElDivider } from 'element-plus'
import { updateUserPasswordApi } from '@/api/user'
import { useUserStore } from '@/store/modules/user'
import { useRouter } from 'vue-router'
import type { FormItemRule } from 'element-plus/es/components/form/src/types'

const router = useRouter()
const userStore = useUserStore()
const { required } = useValidator()

const formSchema = reactive<FormSchema[]>([
  {
    field: 'password',
    label: '旧密码',
    component: 'InputPassword',
    colProps: {
      span: 24
    },
    componentProps: {
      placeholder: '请输入旧密码'
    }
  },
  {
    field: 'newPassword',
    label: '新密码',
    component: 'InputPassword',
    colProps: {
      span: 24
    },
    componentProps: {
      strength: true,
      placeholder: '请输入新密码'
    }
  },
  {
    field: 'newPassword2',
    label: '确认新密码',
    component: 'InputPassword',
    colProps: {
      span: 24
    },
    componentProps: {
      strength: true,
      placeholder: '请再次输入新密码'
    }
  }
])

// 密码验证规则
const validatePassword = (_: any, value: string, callback: any) => {
  if (value.length < 6) {
    callback(new Error('密码长度不能小于6位'))
    return
  }
  callback()
}

const validateNewPassword = (_: any, value: string, callback: any) => {
  getFormData()
    .then((formData) => {
      if (value === formData.password) {
        callback(new Error('新密码不能与旧密码相同'))
        return
      }
      callback()
    })
    .catch(() => {
      callback(new Error('验证失败'))
    })
}

const validateConfirmPassword = (_: any, value: string, callback: any) => {
  getFormData()
    .then((formData) => {
      if (value !== formData.newPassword) {
        callback(new Error('两次输入的密码不一致'))
        return
      }
      callback()
    })
    .catch(() => {
      callback(new Error('验证失败'))
    })
}

const rules = reactive<Record<string, FormItemRule[]>>({
  password: [required()],
  newPassword: [
    required(),
    { validator: validatePassword, trigger: 'blur' },
    { validator: validateNewPassword, trigger: 'blur' }
  ],
  newPassword2: [required(), { validator: validateConfirmPassword, trigger: 'blur' }]
})

const { formRegister, formMethods } = useForm()
const { getFormData, getElFormExpose } = formMethods

const saveLoading = ref(false)
const save = async () => {
  const elForm = await getElFormExpose()
  const valid = await elForm?.validate().catch((err) => {
    console.error('表单验证失败:', err)
    return false
  })

  if (!valid) return

  try {
    await ElMessageBox.confirm('修改密码后需要重新登录，是否继续?', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })

    saveLoading.value = true
    // 获取表单数据
    const formData = await getFormData()

    // 调用修改密码的接口
    const res = await updateUserPasswordApi({
      old_password: formData.password,
      new_password: formData.newPassword
    })

    if (res.code === 200) {
      ElMessage.success('密码修改成功，请重新登录')
      // 清除用户信息并跳转到登录页
      await userStore.logout()
      router.push('/login')
    } else {
      ElMessage.error(res.message || '密码修改失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('密码修改失败:', error)
      ElMessage.error('密码修改失败，请重试')
    }
  } finally {
    saveLoading.value = false
  }
}

// 重置表单
const resetForm = async () => {
  const elForm = await getElFormExpose()
  elForm?.resetFields()
}
</script>

<template>
  <Form :rules="rules" @register="formRegister" :schema="formSchema" />
  <ElDivider />
  <div class="flex justify-center gap-4">
    <BaseButton type="primary" :loading="saveLoading" @click="save">确认修改</BaseButton>
    <BaseButton @click="resetForm">重置</BaseButton>
  </div>
</template>
