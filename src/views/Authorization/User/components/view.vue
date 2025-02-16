<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ElDescriptions, ElDescriptionsItem, ElTag } from 'element-plus'
import type { UserTableItem } from '@/api/user/type'

defineOptions({
  name: 'UserView'
})

const { t } = useI18n()

interface Props {
  data: UserTableItem
}

defineProps<Props>()
</script>

<template>
  <ElDescriptions :column="1" border>
    <ElDescriptionsItem :label="t('user.id')">
      {{ data.id }}
    </ElDescriptionsItem>
    <ElDescriptionsItem :label="t('user.username')">
      {{ data.username }}
    </ElDescriptionsItem>
    <ElDescriptionsItem :label="t('user.email')">
      {{ data.email }}
    </ElDescriptionsItem>
    <ElDescriptionsItem :label="t('user.department')">
      {{ data.department_name }}
    </ElDescriptionsItem>
    <ElDescriptionsItem :label="t('user.role')">
      <template v-if="data.role_name?.length">
        <ElTag
          v-for="(role, index) in data.role_name"
          :key="index"
          class="mr-2 mb-2"
          type="success"
        >
          {{ role }}
        </ElTag>
      </template>
      <template v-else>-</template>
    </ElDescriptionsItem>
    <ElDescriptionsItem :label="t('user.status')">
      <ElTag :type="data.status === 1 ? 'success' : 'danger'">
        {{ data.status === 1 ? t('user.enable') : t('user.disable') }}
      </ElTag>
    </ElDescriptionsItem>
    <ElDescriptionsItem :label="t('user.created_at')">
      {{ data.created_at }}
    </ElDescriptionsItem>
  </ElDescriptions>
</template>
