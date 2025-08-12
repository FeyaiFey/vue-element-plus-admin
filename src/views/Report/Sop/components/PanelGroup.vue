<script setup lang="ts">
import { ElRow, ElCol, ElCard, ElSkeleton } from 'element-plus'
import { CountTo } from '@/components/CountTo'
import { useDesign } from '@/hooks/web/useDesign'
import { PropType, computed } from 'vue'

export interface SopAnalysisPannel {
  rowCount: string
  sufficientCount: string
  insufficientCount: string
  selectedCount: string
}

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('panel-group')

const props = defineProps({
  panelData: {
    type: Object as PropType<SopAnalysisPannel>,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// 定义 emits
const emit = defineEmits(['unEmailNoticedClick'])

// 计算属性 - 直接使用传入的数据
const totalState = computed(() => {
  if (!props.panelData) {
    // 提供默认值，防止访问undefined的属性
    return {
      rowCount: '0',
      sufficientCount: '0',
      insufficientCount: '0',
      selectedCount: '0'
    }
  }
  return props.panelData
})
</script>

<template>
  <ElRow :gutter="20" justify="space-between" :class="prefixCls">
    <ElCol :xl="6" :lg="6" :md="12" :sm="12" :xs="24">
      <ElCard shadow="hover" class="mb-20px">
        <ElSkeleton :loading="loading" animated :rows="2">
          <template #default>
            <div class="text-center">
              <CountTo
                class="text-3xl font-bold text-blue-600"
                :start-val="0"
                :end-val="Number(totalState.rowCount)"
                :duration="2500"
                :decimals="0"
              />
              <div class="text-sm text-gray-600 dark:text-gray-400">总品项数</div>
            </div>
          </template>
        </ElSkeleton>
      </ElCard>
    </ElCol>

    <ElCol :xl="6" :lg="6" :md="12" :sm="12" :xs="24">
      <ElCard shadow="hover" class="mb-20px">
        <ElSkeleton :loading="loading" animated :rows="2">
          <template #default>
            <div class="text-center">
              <CountTo
                class="text-3xl font-bold text-green-600"
                :start-val="0"
                :end-val="Number(totalState.sufficientCount)"
                :duration="2500"
                :decimals="0"
              />
              <div class="text-sm text-gray-600 dark:text-gray-400">库存充足</div>
            </div>
          </template>
        </ElSkeleton>
      </ElCard>
    </ElCol>

    <ElCol :xl="6" :lg="6" :md="12" :sm="12" :xs="24">
      <ElCard shadow="hover" class="mb-20px">
        <ElSkeleton :loading="loading" animated :rows="2">
          <template #default>
            <div class="text-center">
              <CountTo
                class="text-3xl font-bold text-red-600"
                :start-val="0"
                :end-val="Number(totalState.insufficientCount)"
                :duration="2500"
                :decimals="0"
              />
              <div class="text-sm text-gray-600 dark:text-gray-400">有缺口品项</div>
            </div>
          </template>
        </ElSkeleton>
      </ElCard>
    </ElCol>

    <ElCol :xl="6" :lg="6" :md="12" :sm="12" :xs="24">
      <ElCard shadow="hover" class="mb-20px email-notice-card">
        <ElSkeleton :loading="loading" animated :rows="2">
          <template #default>
            <div class="text-center" @click="emit('unEmailNoticedClick')">
              <CountTo
                class="text-3xl font-bold text-orange-600"
                :start-val="0"
                :end-val="Number(totalState.selectedCount)"
                :duration="2500"
                :decimals="0"
              />
              <div class="text-sm text-gray-600 dark:text-gray-400">待邮件发送</div>
            </div>
          </template>
        </ElSkeleton>
      </ElCard>
    </ElCol>
  </ElRow>
</template>

<style lang="less" scoped>
@prefix-cls: ~'@{adminNamespace}-panel-group';

.email-notice-card {
  transition: all 0.5s ease;

  &:hover {
    background: linear-gradient(135deg, #fef2f2 0%, #fef3c7 100%);
    border-color: #f59e0b;
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgb(251 191 36 / 30%);
  }
}

.growth-indicator {
  .growth-icon {
    line-height: 1;
  }
}
</style>
