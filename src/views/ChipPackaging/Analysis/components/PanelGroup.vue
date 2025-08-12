<script setup lang="ts">
import { ElRow, ElCol, ElCard, ElSkeleton } from 'element-plus'
import { CountTo } from '@/components/CountTo'
import { Icon } from '@/components/Icon'
import { useDesign } from '@/hooks/web/useDesign'
import { PropType, computed } from 'vue'
import type { ChipPackagingAnalysisPannel } from '@/api/chipPackaging/types'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('panel-group')

const props = defineProps({
  panelData: {
    type: Object as PropType<ChipPackagingAnalysisPannel>,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// 计算属性 - 直接使用传入的数据
const totalState = computed(() => {
  if (!props.panelData) {
    // 提供默认值，防止访问undefined的属性
    return {
      thisMonthChipPackagingReceipt: 0,
      lastMonthChipPackagingReceipt: 0,
      chipPackagingWip: 0,
      thisSeasonAverageDeliveryDays: 0,
      thisSeasonAverageGoodRate: 0
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
            <div :class="`${prefixCls}__item flex justify-between`">
              <div>
                <div
                  :class="`${prefixCls}__item--icon ${prefixCls}__item--peoples p-16px inline-block rounded-6px`"
                >
                  <Icon
                    icon="vi-fluent:vehicle-truck-cube-24-filled"
                    :size="40"
                    class="primary-icon"
                  />
                </div>
              </div>
              <div class="flex flex-col justify-between">
                <div :class="`${prefixCls}__item--text text-16px text-gray-500 text-right`">{{
                  '本月累计入库(EA)'
                }}</div>
                <CountTo
                  class="text-20px font-700 text-right"
                  :start-val="0"
                  :end-val="Number(totalState.thisMonthChipPackagingReceipt) / 1000000"
                  :duration="2500"
                  :decimals="2"
                  :suffix="' kk'"
                />
                <div class="growth-indicator flex justify-end mt-2px space-x-8px">
                  <div class="flex items-center">
                    <span
                      class="ml-4px text-12px"
                      :class="
                        totalState.lastMonthChipPackagingReceipt >=
                        totalState.thisMonthChipPackagingReceipt
                          ? 'text-red-500'
                          : 'text-green-500'
                      "
                    >
                      上月累计入库：
                      <CountTo
                        :start-val="0"
                        :end-val="Number(totalState.lastMonthChipPackagingReceipt) / 1000000"
                        :duration="2500"
                        :decimals="2"
                        :suffix="' kk'"
                      />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </ElSkeleton>
      </ElCard>
    </ElCol>

    <ElCol :xl="6" :lg="6" :md="12" :sm="12" :xs="24">
      <ElCard shadow="hover" class="mb-20px">
        <ElSkeleton :loading="loading" animated :rows="2">
          <template #default>
            <div :class="`${prefixCls}__item flex justify-between`">
              <div>
                <div
                  :class="`${prefixCls}__item--icon ${prefixCls}__item--shopping p-16px inline-block rounded-6px`"
                >
                  <Icon icon="vi-game-icons:microchip" :size="40" class="primary-icon" />
                </div>
              </div>
              <div class="flex flex-col justify-between">
                <div :class="`${prefixCls}__item--text text-16px text-gray-500 text-right`">{{
                  '本月累计在制(EA)'
                }}</div>
                <CountTo
                  class="text-20px font-700 text-right"
                  :start-val="0"
                  :end-val="Number(totalState.chipPackagingWip) / 1000000"
                  :duration="2500"
                  :decimals="2"
                  :suffix="' kk'"
                />
              </div>
            </div>
          </template>
        </ElSkeleton>
      </ElCard>
    </ElCol>
    <ElCol :xl="6" :lg="6" :md="12" :sm="12" :xs="24">
      <ElCard shadow="hover" class="mb-20px">
        <ElSkeleton :loading="loading" animated :rows="2">
          <template #default>
            <div :class="`${prefixCls}__item flex justify-between`">
              <div>
                <div
                  :class="`${prefixCls}__item--icon ${prefixCls}__item--money p-16px inline-block rounded-6px`"
                >
                  <Icon icon="vi-openmoji:timer" :size="40" class="primary-icon" />
                </div>
              </div>
              <div class="flex flex-col justify-between">
                <div :class="`${prefixCls}__item--text text-16px text-gray-500 text-right`">{{
                  '本季平均交期(天)'
                }}</div>
                <CountTo
                  class="text-20px font-700 text-right"
                  :start-val="0"
                  :end-val="Number(totalState.thisSeasonAverageDeliveryDays)"
                  :duration="2500"
                  :suffix="' 天'"
                />
              </div>
            </div>
          </template>
        </ElSkeleton>
      </ElCard>
    </ElCol>

    <ElCol :xl="6" :lg="6" :md="12" :sm="12" :xs="24">
      <ElCard shadow="hover" class="mb-20px">
        <ElSkeleton :loading="loading" animated :rows="2">
          <template #default>
            <div :class="`${prefixCls}__item flex justify-between`">
              <div>
                <div
                  :class="`${prefixCls}__item--icon ${prefixCls}__item--message p-16px inline-block rounded-6px`"
                >
                  <Icon icon="vi-fluent:text-percent-16-filled" :size="40" class="primary-icon" />
                </div>
              </div>
              <div class="flex flex-col justify-between">
                <div :class="`${prefixCls}__item--text text-16px text-gray-500 text-right`">{{
                  '本季平均良率(%)'
                }}</div>
                <CountTo
                  class="text-20px font-700 text-right"
                  :start-val="0"
                  :decimals="2"
                  :end-val="Number(totalState.thisSeasonAverageGoodRate)"
                  :duration="2500"
                  :suffix="' %'"
                />
              </div>
            </div>
          </template>
        </ElSkeleton>
      </ElCard>
    </ElCol>
  </ElRow>
</template>

<style lang="less" scoped>
@prefix-cls: ~'@{adminNamespace}-panel-group';

.@{prefix-cls} {
  &__item {
    &--peoples {
      color: #40c9c6;
    }

    &--message {
      color: #36a3f7;
    }

    &--money {
      color: #f4516c;
    }

    &--shopping {
      color: #560cac;
    }

    &:hover {
      :deep(.primary-icon) {
        color: #fff !important;
      }
      .@{prefix-cls}__item--icon {
        transition: all 0.38s ease-out;
      }
      .@{prefix-cls}__item--peoples {
        background: #40c9c6;
      }
      .@{prefix-cls}__item--message {
        background: #36a3f7;
      }
      .@{prefix-cls}__item--money {
        background: #f4516c;
      }
      .@{prefix-cls}__item--shopping {
        background: #560cac;
      }
    }
  }
}

.growth-indicator {
  .growth-icon {
    line-height: 1;
  }
}
</style>
