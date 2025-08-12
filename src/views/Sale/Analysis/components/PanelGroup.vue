<script setup lang="ts">
import { ElRow, ElCol, ElCard, ElSkeleton } from 'element-plus'
import { CountTo } from '@/components/CountTo'
import { Icon } from '@/components/Icon'
import { useDesign } from '@/hooks/web/useDesign'
import { PropType, computed } from 'vue'
import type { SaleAnalysisPannel } from '@/api/sale/types'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('panel-group')

const emit = defineEmits<{
  (e: 'download'): void
}>()

const props = defineProps({
  panelData: {
    type: Object as PropType<SaleAnalysisPannel>,
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
      today_sale_amount: 0,
      yesterday_sale_amount: 0,
      this_year_sale_qty: 0,
      this_year_sale_amount: 0,
      this_month_sale_qty: 0,
      this_month_sale_amount: 0,
      last_year_sale_qty: 0,
      last_year_sale_amount: 0,
      last_month_sale_qty: 0,
      last_month_sale_amount: 0,
      last_last_month_sale_qty: 0,
      last_last_month_sale_amount: 0,
      month_on_month_qty: 0,
      month_on_month_amount: 0,
      year_on_year_qty: 0,
      year_on_year_amount: 0
    }
  }
  return props.panelData
})

// 格式化百分比数值
const formatPercentage = (value: number) => {
  if (isNaN(value)) return '0'
  return value.toFixed(2)
}
</script>

<template>
  <ElRow :gutter="20" justify="space-between" :class="prefixCls">
    <ElCol :xl="6" :lg="6" :md="12" :sm="12" :xs="24">
      <ElCard shadow="hover" class="mb-20px" @click="emit('download')">
        <ElSkeleton :loading="loading" animated :rows="2">
          <template #default>
            <div :class="`${prefixCls}__item flex justify-between`">
              <div>
                <div
                  :class="`${prefixCls}__item--icon ${prefixCls}__item--peoples p-16px inline-block rounded-6px`"
                >
                  <Icon icon="vi-ant-design:money-collect-filled" :size="40" class="primary-icon" />
                </div>
              </div>
              <div class="flex flex-col justify-between">
                <div :class="`${prefixCls}__item--text text-16px text-gray-500 text-right`">{{
                  '今日累计销售额'
                }}</div>
                <CountTo
                  class="text-20px font-700 text-right"
                  :start-val="0"
                  :end-val="Number((totalState.today_sale_amount / 10000).toFixed(2))"
                  :duration="2500"
                  :decimals="2"
                  :suffix="' 万元'"
                />
                <div class="growth-indicator flex justify-end mt-2px space-x-8px">
                  <div class="flex items-center">
                    <span
                      class="ml-4px text-12px"
                      :class="
                        totalState.yesterday_sale_amount >= totalState.today_sale_amount
                          ? 'text-red-500'
                          : 'text-green-500'
                      "
                    >
                      昨日销售额：
                      <CountTo
                        :start-val="0"
                        :end-val="Number((totalState.yesterday_sale_amount / 10000).toFixed(2))"
                        :duration="2500"
                        :decimals="2"
                        :suffix="' 万元'"
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
                  <Icon icon="vi-ph:piggy-bank-bold" :size="40" class="primary-icon" />
                </div>
              </div>
              <div class="flex flex-col justify-between">
                <div :class="`${prefixCls}__item--text text-16px text-gray-500 text-right`">{{
                  '本月累计销售额'
                }}</div>
                <CountTo
                  class="text-20px font-700 text-right"
                  :start-val="0"
                  :end-val="totalState.this_month_sale_amount / 10000"
                  :duration="2500"
                  :decimals="2"
                  :suffix="' 万元'"
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
                  <Icon icon="vi-iconoir:coins" :size="40" class="primary-icon" />
                </div>
              </div>
              <div class="flex flex-col justify-between">
                <div :class="`${prefixCls}__item--text text-16px text-gray-500 text-right`">{{
                  '上月累计销售额'
                }}</div>
                <CountTo
                  class="text-20px font-700 text-right"
                  :start-val="0"
                  :end-val="totalState.last_month_sale_amount / 10000"
                  :duration="2500"
                  :suffix="' 万元'"
                />
                <div class="growth-indicator flex justify-end mt-2px space-x-8px">
                  <div class="flex items-center">
                    <Icon
                      :icon="
                        totalState.month_on_month_amount >= 0
                          ? 'vi-ep:caret-top'
                          : 'vi-ep:caret-bottom'
                      "
                      :class="[
                        'growth-icon',
                        totalState.month_on_month_amount >= 0 ? 'text-red-500' : 'text-green-500'
                      ]"
                      :size="14"
                    />
                    <span
                      class="ml-4px text-8px"
                      :class="
                        totalState.month_on_month_amount >= 0 ? 'text-red-500' : 'text-green-500'
                      "
                    >
                      环比
                      <CountTo
                        :start-val="0"
                        :end-val="Number(formatPercentage(totalState.month_on_month_amount))"
                        :duration="2500"
                        :decimals="2"
                      />%
                    </span>
                  </div>
                  <div class="flex items-center">
                    <Icon
                      :icon="
                        totalState.year_on_year_amount >= 0
                          ? 'vi-ep:caret-top'
                          : 'vi-ep:caret-bottom'
                      "
                      :class="[
                        'growth-icon',
                        totalState.year_on_year_amount >= 0 ? 'text-red-500' : 'text-green-500'
                      ]"
                      :size="14"
                    />
                    <span
                      class="ml-4px text-8px"
                      :class="
                        totalState.year_on_year_amount >= 0 ? 'text-red-500' : 'text-green-500'
                      "
                    >
                      同比
                      <CountTo
                        :start-val="0"
                        :end-val="Number(formatPercentage(totalState.year_on_year_amount))"
                        :duration="2500"
                        :decimals="2"
                      />%
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
                  :class="`${prefixCls}__item--icon ${prefixCls}__item--message p-16px inline-block rounded-6px`"
                >
                  <Icon icon="vi-emojione-monotone:money-bag" :size="40" class="primary-icon" />
                </div>
              </div>
              <div class="flex flex-col justify-between">
                <div :class="`${prefixCls}__item--text text-16px text-gray-500 text-right`">{{
                  '今年累计销售额'
                }}</div>
                <CountTo
                  class="text-20px font-700 text-right"
                  :start-val="0"
                  :end-val="totalState.this_year_sale_amount / 10000"
                  :duration="2500"
                  :suffix="' 万元'"
                />
                <div class="growth-indicator flex justify-end mt-2px space-x-8px">
                  <div class="flex items-center">
                    <span
                      class="ml-4px text-11px"
                      :class="
                        totalState.last_year_sale_amount >= totalState.this_year_sale_amount
                          ? 'text-red-500'
                          : 'text-green-500'
                      "
                    >
                      去年销售额：
                      <CountTo
                        :start-val="0"
                        :end-val="Number((totalState.last_year_sale_amount / 10000).toFixed(2))"
                        :duration="2500"
                        :decimals="2"
                        :suffix="' 万元'"
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
