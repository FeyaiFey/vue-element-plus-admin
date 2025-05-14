<script setup lang="ts">
import { ElRow, ElCol, ElCard, ElSkeleton } from 'element-plus'
import { CountTo } from '@/components/CountTo'
import { useDesign } from '@/hooks/web/useDesign'
import { ref, reactive } from 'vue'
import { getSaleAnalysisPannelApi } from '@/api/sale'
import type { SaleAnalysisPannel } from '@/api/sale/type'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('panel')

const loading = ref(true)

let totalState = reactive<SaleAnalysisPannel>({
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
})

const formatPercentage = (value: number) => {
  if (isNaN(value)) return '0%'
  return value
}

const getSaleAnalysisPannel = async () => {
  const res = await getSaleAnalysisPannelApi()
    .catch(() => {})
    .finally(() => {
      loading.value = false
    })
  totalState = Object.assign(totalState, res?.data.list[0] || {})
}

getSaleAnalysisPannel()
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
                  :class="`${prefixCls}__item--icon ${prefixCls}__item--shopping p-16px inline-block rounded-6px`"
                >
                  <Icon icon="vi-ant-design:money-collect-filled" :size="40" class="primary-icon" />
                </div>
              </div>
              <div class="flex flex-col justify-between">
                <div :class="`${prefixCls}__item--text text-16px text-gray-500 text-right`">{{
                  '本月销售额' + '(万元)'
                }}</div>
                <CountTo
                  class="text-20px font-700 text-right"
                  :start-val="0"
                  :end-val="totalState.this_month_sale_amount / 10000"
                  :duration="2500"
                  :decimals="2"
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
                  <Icon
                    icon="vi-material-symbols:delivery-truck-speed-outline"
                    :size="40"
                    class="primary-icon"
                  />
                </div>
              </div>
              <div class="flex flex-col justify-between">
                <div :class="`${prefixCls}__item--text text-16px text-gray-500 text-right`">{{
                  '上月销售额' + '(万元)'
                }}</div>
                <CountTo
                  class="text-20px font-700 text-right"
                  :start-val="0"
                  :end-val="totalState.last_month_sale_amount / 10000"
                  :duration="2500"
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
                      class="ml-4px text-10px"
                      :class="
                        totalState.month_on_month_amount >= 0 ? 'text-red-500' : 'text-green-500'
                      "
                    >
                      环比 {{ formatPercentage(totalState.month_on_month_amount) }}
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
                      class="ml-4px text-10px"
                      :class="
                        totalState.year_on_year_amount >= 0 ? 'text-red-500' : 'text-green-500'
                      "
                    >
                      同比 {{ formatPercentage(totalState.year_on_year_amount) }}
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
                  :class="`${prefixCls}__item--icon ${prefixCls}__item--peoples p-16px inline-block rounded-6px`"
                >
                  <Icon icon="vi-mdi:sale-outline" :size="40" class="primary-icon" />
                </div>
              </div>
              <div class="flex flex-col justify-between">
                <div :class="`${prefixCls}__item--text text-16px text-gray-500 text-right`">{{
                  '上年销售额' + '(万元)'
                }}</div>
                <CountTo
                  class="text-20px font-700 text-right"
                  :start-val="0"
                  :end-val="totalState.last_year_sale_amount / 10000"
                  :duration="2500"
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
                  <Icon icon="vi-grommet-icons:money" :size="40" class="primary-icon" />
                </div>
              </div>
              <div class="flex flex-col justify-between">
                <div :class="`${prefixCls}__item--text text-16px text-gray-500 text-right`">{{
                  '今年销售额' + '(万元)'
                }}</div>
                <CountTo
                  class="text-20px font-700 text-right"
                  :start-val="0"
                  :end-val="totalState.this_year_sale_amount / 10000"
                  :duration="2500"
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
@prefix-cls: ~'@{adminNamespace}-panel';

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
      color: #34bfa3;
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
        background: #34bfa3;
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
