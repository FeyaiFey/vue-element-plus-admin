<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElTreeSelect,
  ElSelect,
  ElOption,
  ElRadioGroup,
  ElRadio
} from 'element-plus'
import { getDepartmentApi } from '@/api/department'
import type { DepartmentItem } from '@/api/department/types'

defineOptions({
  name: 'DepartmentNew'
})

const { t } = useI18n()

// 创建一个新的响应式对象来存储表单数据
const formData = ref({
  department_name: '',
  is_child: false,
  pid: null,
  status: 1 // 默认启用
})

const departmentList = ref<DepartmentItem[]>([])

// 获取部门列表用于树形选择器
onMounted(async () => {
  const res = await getDepartmentApi()
  if (res.code === 200) {
    departmentList.value = res.data.list
  }
})

// 表单校验规则
const rules = {
  department_name: [
    { required: true, message: t('department.rules.name'), trigger: 'blur' },
    { min: 3, max: 50, message: t('department.rules.nameLength'), trigger: 'blur' }
  ],
  status: [{ required: true, message: t('department.rules.status'), trigger: 'change' }]
}

// 表单引用
const formRef = ref()

// 表单验证方法
const validate = async () => {
  if (!formRef.value) return false
  return await formRef.value.validate()
}

// 重置表单
const resetForm = () => {
  formData.value = {
    department_name: '',
    is_child: false,
    pid: null,
    status: 1
  }
  formRef.value?.resetFields()
}

// 暴露方法给父组件
defineExpose({
  validate,
  resetForm,
  formData
})
</script>

<template>
  <div class="flex flex-col gap-10px">
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem :label="t('department.name')" prop="department_name">
        <ElInput
          v-model="formData.department_name"
          :placeholder="t('department.placeholder.name')"
        />
      </ElFormItem>

      <ElFormItem :label="t('department.isSubDepartment')">
        <ElRadioGroup v-model="formData.is_child">
          <ElRadio :value="true">{{ t('department.yes') }}</ElRadio>
          <ElRadio :value="false">{{ t('department.no') }}</ElRadio>
        </ElRadioGroup>
      </ElFormItem>

      <ElFormItem v-if="formData.is_child" :label="t('department.parentDepartment')" prop="pid">
        <ElTreeSelect
          v-model="formData.pid"
          :data="departmentList"
          :props="{
            value: 'id',
            label: 'department_name',
            children: 'children'
          }"
          :placeholder="t('department.placeholder.parent')"
          check-strictly
          default-expand-all
        />
      </ElFormItem>

      <ElFormItem :label="t('department.status')" prop="status">
        <ElSelect v-model="formData.status" :placeholder="t('department.placeholder.status')">
          <ElOption :label="t('department.enable')" :value="1" />
          <ElOption :label="t('department.disable')" :value="0" />
        </ElSelect>
      </ElFormItem>
    </ElForm>
  </div>
</template>
