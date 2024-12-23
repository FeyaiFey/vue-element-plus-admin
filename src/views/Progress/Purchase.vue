<script setup lang="ts">
import { ContentWrap } from '@/components/ContentWrap'
import { ProgressBar } from './component'
import { ref } from 'vue'
import { useDesign } from '@/hooks/web/useDesign'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('progress-bar')

interface ProgressDetail {
  step: string
  quantity: number
  forecast: number
}

interface ProgressState {
  currentStep: string
  details: ProgressDetail[]
}

const res = ref<ProgressState>({
  currentStep: 'PLASMA2',
  details: [
    { step: '待装片', quantity: 0, forecast: 0 },
    { step: '装片', quantity: 0, forecast: 0 },
    { step: '银胶固化', quantity: 150, forecast: 20 },
    { step: 'PLASMA1', quantity: 100, forecast: 15 },
    { step: 'PLASMA2', quantity: 0, forecast: 0 },
    { step: 'PLASMA1', quantity: 800, forecast: 10 },
    { step: '键合', quantity: 1000, forecast: 5 },
    { step: '打印', quantity: 200, forecast: 3 },
    { step: '切筋', quantity: 0, forecast: 0 },
    { step: '测试', quantity: 0, forecast: 0 },
    { step: '包装', quantity: 0, forecast: 0 },
    { step: '发货', quantity: 0, forecast: 0 }
  ]
})
</script>

<template>
  <ContentWrap title="生产进度展示">
    <div :class="prefixCls">
      <ProgressBar :details="res.details" />
    </div>
  </ContentWrap>
</template>

<style lang="less" scoped>
@prefix-cls: ~'@{adminNamespace}-purchase';
</style>
