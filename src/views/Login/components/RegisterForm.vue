<script setup lang="tsx">
import { Form, FormSchema } from '@/components/Form'
import { reactive, ref } from 'vue'
import { getDepartDataApi, registerApi } from '@/api/login'
import { SUCCESS_CODE } from '@/constants'
import { ElMessage } from 'element-plus'
import { useI18n } from '@/hooks/web/useI18n'
import { useForm } from '@/hooks/web/useForm'
import { FormRules } from 'element-plus'
import { useValidator } from '@/hooks/web/useValidator'
import { BaseButton } from '@/components/Button'
import { IAgree } from '@/components/IAgree'
import { Icon } from '@/components/Icon'
const emit = defineEmits(['to-login'])

const { formRegister, formMethods } = useForm()
const { getFormData, getElFormExpose } = formMethods

const { t } = useI18n()

const { required, check } = useValidator()

const schema = reactive<FormSchema[]>([
  {
    field: 'title',
    colProps: {
      span: 24
    },
    formItemProps: {
      slots: {
        default: () => {
          return <h2 class="text-2xl font-bold text-center w-[100%]">{t('login.register')}</h2>
        }
      }
    }
  },
  {
    field: 'nickname',
    label: t('login.nickname'),
    value: '',
    component: 'Input',
    colProps: {
      span: 24
    },
    componentProps: {
      placeholder: t('login.nicknamePlaceholder'),
      slots: {
        prefix: () => {
          return <Icon icon="vi-mingcute:user-hide-line" size={22} />
        }
      }
    }
  },
  {
    field: 'email',
    label: t('login.email'),
    value: '',
    component: 'Input',
    colProps: {
      span: 24
    },
    componentProps: {
      placeholder: t('login.emailPlaceholder'),
      slots: {
        prefix: () => {
          return <Icon icon="vi-line-md:email-filled" size={22} />
        }
      }
    }
  },
  {
    field: 'password',
    label: t('login.password'),
    value: '',
    component: 'Input',
    colProps: {
      span: 24
    },
    componentProps: {
      type: 'password',
      showPassword: true,
      placeholder: t('login.passwordPlaceholder'),
      slots: {
        prefix: () => {
          return <Icon icon="vi-carbon:password" size={22} />
        }
      }
    }
  },
  {
    field: 'check_password',
    label: t('login.checkPassword'),
    value: '',
    component: 'Input',
    colProps: {
      span: 24
    },
    componentProps: {
      type: 'password',
      showPassword: true,
      placeholder: t('login.passwordPlaceholder'),
      slots: {
        prefix: () => {
          return <Icon icon="vi-carbon:password" size={22} />
        }
      }
    }
  },
  {
    field: 'department',
    label: t('login.department'),
    component: 'Select',
    colProps: {
      span: 12
    },
    componentProps: {
      placeholder: t('login.departmentPlaceholder')
    },
    optionApi: async () => {
      const res = await getDepartDataApi()
      return res.data
    }
  },
  {
    field: 'iAgree',
    colProps: {
      span: 24
    },
    formItemProps: {
      slots: {
        default: (formData: any) => {
          return (
            <>
              <IAgree
                v-model={formData.iAgree}
                text="我同意《用户协议》"
                link={[
                  {
                    text: '《用户协议》',
                    url: 'https://www.china-chip.com/'
                  }
                ]}
              />
            </>
          )
        }
      }
    }
  },
  {
    field: 'register',
    colProps: {
      span: 24
    },
    formItemProps: {
      slots: {
        default: () => {
          return (
            <>
              <div class="w-[100%]">
                <BaseButton
                  type="primary"
                  class="w-[100%]"
                  loading={loading.value}
                  onClick={loginRegister}
                >
                  {t('login.register')}
                </BaseButton>
              </div>
              <div class="w-[100%] mt-15px">
                <BaseButton class="w-[100%]" onClick={toLogin}>
                  {t('login.hasUser')}
                </BaseButton>
              </div>
            </>
          )
        }
      }
    }
  }
])

const rules: FormRules = {
  nickname: [required()],
  email: [required()],
  password: [required()],
  check_password: [
    required(),
    {
      asyncValidator: async (_, val, callback) => {
        const formData = await getFormData()
        const { password } = formData
        if (val !== password) {
          callback(new Error('密码不一致'))
        } else {
          callback()
        }
      }
    }
  ],
  department: [required()],
  iAgree: [required(), check()]
}

const toLogin = () => {
  emit('to-login')
}

const loading = ref(false)

const loginRegister = async () => {
  const formRef = await getElFormExpose()
  formRef?.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true
        const formData = await getFormData()
        const { nickname, email, password, department_id } = formData
        const res = await registerApi({ nickname, email, password, department_id })
        if (res.code === SUCCESS_CODE) {
          ElMessage.success(res.data[0])
          toLogin()
        }
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<template>
  <Form
    :schema="schema"
    :rules="rules"
    label-position="top"
    hide-required-asterisk
    size="large"
    class="dark:(border-1 border-[var(--el-border-color)] border-solid)"
    @register="formRegister"
  />
</template>
