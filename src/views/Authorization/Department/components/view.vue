<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ElDescriptions, ElDescriptionsItem, ElTag } from 'element-plus'
import type { DepartmentTableItem } from '@/api/department/types'

defineOptions({
  name: 'DepartmentView'
})

const { t } = useI18n()

interface Props {
  data: DepartmentTableItem
}

defineProps<Props>()
</script>

<template>
  <ElDescriptions :column="1" border>
    <ElDescriptionsItem :label="t('department.id')">
      {{ data.id }}
    </ElDescriptionsItem>
    <ElDescriptionsItem :label="t('department.name')">
      {{ data.department_name }}
    </ElDescriptionsItem>
    <ElDescriptionsItem :label="t('department.parent_department')">
      {{ data.parent_department }}
    </ElDescriptionsItem>
    <ElDescriptionsItem :label="t('department.status')">
      <ElTag :type="data.status === 1 ? 'success' : 'danger'">
        {{ data.status === 1 ? t('department.enable') : t('department.disable') }}
      </ElTag>
    </ElDescriptionsItem>
    <ElDescriptionsItem :label="t('department.created_at')" :span="2">
      {{ data.created_at }}
    </ElDescriptionsItem>
  </ElDescriptions>
</template>
