<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElForm, ElFormItem, ElInput, ElSelect, ElOption } from 'element-plus'
import type { FormRules } from 'element-plus'
import { getDepartmentApi } from '@/api/department'
import { getRoleListApi } from '@/api/role'
import type { DepartmentItem } from '@/api/department/types'
import type { UserTableItem } from '@/api/user/type'
import type { RoleItem } from '@/api/role/type'

defineOptions({
  name: 'UserEdit'
})

const { t } = useI18n()

interface Props {
  data: UserTableItem
}

const props = defineProps<Props>()

// 创建一个新的响应式对象来存储表单数据
const formData = ref({
  id: props.data.id,
  username: props.data.username,
  email: props.data.email,
  department_id: props.data.department_id,
  department_name: props.data.department_name,
  role_id: props.data.role_id || [], // 确保有默认值
  status: props.data.status
})

const departmentList = ref<DepartmentItem[]>([])
const roleList = ref<RoleItem[]>([])

// 获取部门列表和角色列表
onMounted(async () => {
  try {
    const [deptRes, roleRes] = await Promise.all([getDepartmentApi(), getRoleListApi()])

    if (deptRes.code === 200) {
      departmentList.value = deptRes.data.list
    }

    if (roleRes.code === 200) {
      roleList.value = roleRes.data
    }
  } catch (error) {
    console.error('获取数据失败:', error)
  }
})

// 表单校验规则
const rules: FormRules = {
  role_id: [{ required: true, message: t('user.rules.role'), trigger: 'change' }],
  status: [{ required: true, message: t('user.rules.status'), trigger: 'change' }]
}

// 定义 emit
const emit = defineEmits(['update:data'])

// 监听表单数据变化并同步到父组件
const updateFormData = () => {
  // 获取选中角色的名称
  const selectedRoleNames = formData.value.role_id
    .map((id) => roleList.value.find((role) => role.id === Number(id))?.role_name)
    .filter((name) => name) as string[]

  // 更新父组件数据
  emit('update:data', {
    ...props.data,
    id: formData.value.id,
    role_id: formData.value.role_id,
    role_name: selectedRoleNames,
    status: formData.value.status
  })
}

// 表单引用
const formRef = ref()

// 表单验证方法
const validate = async () => {
  if (!formRef.value) return false
  return await formRef.value.validate()
}

// 暴露方法给父组件
defineExpose({
  validate
})
</script>

<template>
  <div class="flex flex-col gap-10px">
    <ElForm
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      @change="updateFormData"
    >
      <ElFormItem :label="t('user.username')">
        <ElInput v-model="formData.username" disabled />
      </ElFormItem>

      <ElFormItem :label="t('user.email')">
        <ElInput v-model="formData.email" disabled />
      </ElFormItem>

      <ElFormItem :label="t('user.department')">
        <ElInput v-model="formData.department_name" disabled />
      </ElFormItem>

      <ElFormItem :label="t('user.role')" prop="role_id">
        <ElSelect
          v-model="formData.role_id"
          :placeholder="t('user.placeholder.role')"
          multiple
          clearable
          collapse-tags
          collapse-tags-tooltip
        >
          <ElOption
            v-for="role in roleList"
            :key="role.id"
            :label="role.role_name"
            :value="role.id"
          />
        </ElSelect>
      </ElFormItem>

      <ElFormItem :label="t('user.status')" prop="status">
        <ElSelect v-model="formData.status" :placeholder="t('user.placeholder.status')">
          <ElOption :label="t('user.enable')" :value="1" />
          <ElOption :label="t('user.disable')" :value="0" />
        </ElSelect>
      </ElFormItem>
    </ElForm>
  </div>
</template>
