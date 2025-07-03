<script setup lang="ts">
import { PropType } from 'vue'
import { DepartmentItem } from '@/api/department/types'
import { Descriptions, DescriptionsSchema } from '@/components/Descriptions'

defineProps({
  currentRow: {
    type: Object as PropType<DepartmentItem>,
    default: () => undefined
  },
  detailSchema: {
    type: Array as PropType<DescriptionsSchema[]>,
    default: () => []
  }
})
</script>

<template>
  <Descriptions :schema="detailSchema" :data="currentRow || {}" />
</template>
