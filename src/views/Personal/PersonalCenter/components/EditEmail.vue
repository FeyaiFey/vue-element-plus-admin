<script setup lang="ts">
import { Form, FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox, ElRow, ElCol } from 'element-plus'
import { getUserEmailInfoApi, updateUserEmailPasswordApi } from '@/api/email'
import { useUserStore } from '@/store/modules/user'
import { SUCCESS_CODE } from '@/constants'

const userStore = useUserStore()

const formSchema = reactive<FormSchema[]>([
  {
    field: 'email',
    label: '邮箱',
    component: 'Input',
    colProps: {
      span: 24
    },
    componentProps: {
      disabled: true
    }
  },
  {
    field: 'newPassword',
    label: '独立密码',
    component: 'InputPassword',
    colProps: {
      span: 24
    },
    componentProps: {
      placeholder: '请输入新密码'
    }
  },
  {
    field: 'ImapServer',
    label: 'IMAP服务器',
    component: 'Input',
    colProps: {
      span: 24
    },
    componentProps: {
      disabled: true
    }
  },
  {
    field: 'ImapPort',
    label: 'IMAP端口',
    component: 'Input',
    colProps: {
      span: 24
    },
    componentProps: {
      disabled: true
    }
  },
  {
    field: 'ImapUseSsl',
    label: 'IMAP是否使用SSL',
    component: 'Switch',
    colProps: {
      span: 24
    },
    componentProps: {
      disabled: true
    }
  },
  {
    field: 'SmtpServer',
    label: 'SMTP服务器',
    component: 'Input',
    colProps: {
      span: 24
    },
    componentProps: {
      disabled: true
    }
  },
  {
    field: 'SmtpPort',
    label: 'SMTP端口',
    component: 'Input',
    colProps: {
      span: 24
    },
    componentProps: {
      disabled: true
    }
  },
  {
    field: 'SmtpUseSsl',
    label: 'SMTP是否使用SSL',
    component: 'Switch',
    colProps: {
      span: 24
    },
    componentProps: {
      disabled: true
    }
  }
])

const { formRegister, formMethods } = useForm()
const { getFormData, setValues } = formMethods

const saveLoading = ref(false)
const save = async () => {
  try {
    saveLoading.value = true
    // 获取表单数据
    const formData = await getFormData()

    // 调用修改密码的接口
    const res = await updateUserEmailPasswordApi(userStore.getUserInfo?.Id || '', {
      SpecialPassword: formData.newPassword
    })

    if (res.code === 200) {
      ElMessage.success('密码修改成功')
    } else {
      ElMessage.error('密码修改失败')
    }
  } catch (error) {
    console.error('密码修改失败:', error)
    ElMessage.error('密码修改失败，请重试')
  } finally {
    saveLoading.value = false
  }
}

const help = async () => {
  try {
    await ElMessageBox.alert(
      `
      <div style="text-align: left; line-height: 1.8;">
        <p><strong>邮箱独立密码说明：</strong></p>
        <p>1. 该密码为客户端授权码，非邮箱密码</p>
        <p>2. BOSSMAIL位置：首页-设置-账户与安全-客户端授权码</p>
      </div>
      `,
      '帮助信息',
      {
        confirmButtonText: '我知道了',
        dangerouslyUseHTMLString: true,
        customClass: 'help-message-box'
      }
    )
  } catch (error) {
    // 用户点击关闭按钮时，不显示错误信息
    if (error !== 'cancel') {
      console.error('帮助信息失败:', error)
      ElMessage.error('帮助信息失败，请重试')
    }
  }
}

// 获取邮箱信息
const getEmailInfo = async () => {
  try {
    const res = await getUserEmailInfoApi(userStore.getUserInfo?.Id || '')
    if (res.code === SUCCESS_CODE && res.data?.SpecialPassword) {
      // 设置表单数据
      await setValues({
        email: userStore.getUserInfo?.Email,
        newPassword: res.data.SpecialPassword,
        ImapServer: res.data.ImapServer,
        ImapPort: res.data.ImapPort,
        ImapUseSsl: res.data.ImapUseSsl,
        SmtpServer: res.data.SmtpServer,
        SmtpPort: res.data.SmtpPort,
        SmtpUseSsl: res.data.SmtpUseSsl
      })
    } else {
      await setValues({
        email: userStore.getUserInfo?.Email,
        newPassword: '',
        ImapServer: '',
        ImapPort: '',
        ImapUseSsl: false,
        SmtpServer: '',
        SmtpPort: '',
        SmtpUseSsl: false
      })
    }
  } catch (error) {
    console.error('获取邮箱信息失败:', error)
    ElMessage.error('获取邮箱信息失败，请重试')
  }
}

// 组件挂载时获取邮箱信息
onMounted(() => {
  getEmailInfo()
})

// 表单验证规则
const rules = reactive({
  newPassword: [{ required: true, message: '请输入独立密码', trigger: 'blur' }]
})
</script>

<template>
  <Form @register="formRegister" :schema="formSchema" :rules="rules" />
  <ElRow :gutter="20">
    <ElCol :span="4">
      <BaseButton type="primary" :loading="saveLoading" @click="save" class="w-full">
        确认
      </BaseButton>
    </ElCol>
    <ElCol :span="4">
      <BaseButton type="warning" @click="help" class="w-full">帮助</BaseButton>
    </ElCol>
  </ElRow>
</template>

<style lang="less" scoped>
.help-message-box {
  :deep(.el-message-box__content) {
    padding: 20px;
  }
}
</style>
