<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDesign } from '@/hooks/web/useDesign'
import { ContentWrap } from '@/components/ContentWrap'
import {
  ElForm,
  ElFormItem,
  ElSwitch,
  ElSelectV2,
  ElInput,
  ElButton,
  ElCol,
  ElRow
} from 'element-plus'
import { getFeatureGroups } from '@/api/stock'
import type { StockQueryParams, SelectOption } from '@/api/stock/types'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('stock-search')

interface Props {
  loading?: boolean
}

interface Emits {
  (e: 'search'): void
  (e: 'reset'): void
  (e: 'export'): void
  (e: 'update:queryParams', params: StockQueryParams): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()

const queryParams = ref<StockQueryParams>({
  itemCodes: '',
  itemNames: '',
  warehouses: '',
  featureGroups: '',
  lotCodes: '',
  shortcuts: '',
  showZeroStock: true
})

// 选项数据加载状态
const featureGroupsLoading = ref(false)

// 选项数据
const featureGroupOptions = ref<SelectOption[]>([])

// 远程方法
const remoteMethod = async (query: string) => {
  featureGroupsLoading.value = true
  try {
    const featureGroupsRes = await getFeatureGroups({
      featureGroups: query
    })
    if (featureGroupsRes.data) {
      featureGroupOptions.value = featureGroupsRes.data.map((item) => ({
        value: item.value,
        label: item.label
      }))
    }
  } catch (error) {
    console.error('Failed to load feature groups:', error)
    featureGroupOptions.value = []
  } finally {
    featureGroupsLoading.value = false
  }
}

// 监听查询参数变化
watch(
  () => queryParams.value,
  (newVal) => {
    emit('update:queryParams', newVal)
  },
  { deep: true }
)

// 处理查询
const handleSearch = () => {
  emit('search')
}

// 处理重置
const handleReset = () => {
  queryParams.value = {
    itemCodes: '',
    itemNames: '',
    warehouses: '',
    featureGroups: '',
    lotCodes: '',
    shortcuts: '',
    showZeroStock: true
  }
  emit('reset')
}

// 处理导出
const handleExport = () => {
  emit('export')
}

defineExpose({
  queryParams,
  handleReset
})
</script>

<template>
  <ContentWrap :loading="loading">
    <ElForm :model="queryParams" :class="prefixCls" label-position="right">
      <ElRow :gutter="16">
        <ElCol :xl="6" :lg="6" :md="12" :sm="12" :xs="24">
          <ElFormItem label="品号" :class="`${prefixCls}__item`">
            <ElInput v-model="queryParams.itemCodes" clearable placeholder="请输入品号" />
          </ElFormItem>
        </ElCol>
        <ElCol :xl="6" :lg="6" :md="12" :sm="12" :xs="24">
          <ElFormItem label="品名" :class="`${prefixCls}__item`">
            <ElInput v-model="queryParams.itemNames" clearable placeholder="请输入品名" />
          </ElFormItem>
        </ElCol>
        <ElCol :xl="6" :lg="6" :md="12" :sm="12" :xs="24">
          <ElFormItem label="仓库" :class="`${prefixCls}__item`">
            <ElInput v-model="queryParams.warehouses" clearable placeholder="请输入仓库" />
          </ElFormItem>
        </ElCol>
        <ElCol :xl="6" :lg="6" :md="12" :sm="12" :xs="24">
          <ElFormItem label="品号群组" :class="`${prefixCls}__item`">
            <ElSelectV2
              v-model="queryParams.featureGroups"
              multiple
              filterable
              remote
              :remote-method="remoteMethod"
              :loading="featureGroupsLoading"
              :options="featureGroupOptions"
              placeholder="可以多选"
              clearable
              style="width: 100%"
              :min-collapse-tags="1"
              collapse-tags
              collapse-tags-tooltip
            />
          </ElFormItem>
        </ElCol>
        <ElCol :xl="6" :lg="6" :md="12" :sm="12" :xs="24">
          <ElFormItem label="批号" :class="`${prefixCls}__item`">
            <ElInput v-model="queryParams.lotCodes" clearable placeholder="请输入批号" />
          </ElFormItem>
        </ElCol>
        <ElCol :xl="6" :lg="6" :md="12" :sm="12" :xs="24">
          <ElFormItem label="类别" :class="`${prefixCls}__item`">
            <ElInput v-model="queryParams.shortcuts" clearable placeholder="请输入类别" />
          </ElFormItem>
        </ElCol>
        <ElCol :xl="6" :lg="6" :md="12" :sm="12" :xs="24">
          <ElFormItem label="显示零库存" :class="`${prefixCls}__item ${prefixCls}__item-switch`">
            <ElSwitch v-model="queryParams.showZeroStock" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="24">
          <div :class="`${prefixCls}__buttons`">
            <ElButton type="primary" :loading="props.loading" @click="handleSearch">
              <template #icon>
                <Icon icon="vi-mingcute:search-3-line" :size="20" />
              </template>
              查询
            </ElButton>
            <ElButton @click="handleReset">
              <template #icon>
                <Icon icon="vi-mingcute:refresh-3-line" :size="20" />
              </template>
              重置
            </ElButton>
            <ElButton type="success" @click="handleExport">
              <template #icon>
                <Icon icon="vi-line-md:cloud-alt-download-filled-loop" :size="20" />
              </template>
              导出
            </ElButton>
          </div>
        </ElCol>
      </ElRow>
    </ElForm>
  </ContentWrap>
</template>

<style lang="less" scoped>


// 响应式调整
@media screen and (width <= 768px) {
  .@{prefix-cls} {
    &__item {
      :deep(.el-form-item__label) {
        width: 80px;
      }

      &-switch {
        :deep(.el-form-item__content) {
          width: 100%;
        }

        :deep(.el-form-item__label) {
          width: 100px;
        }
      }
    }

    &__buttons {
      flex-direction: column;
      align-items: center;
      width: 100%;
      margin: 0 auto;

      .el-button {
        width: 200px;
        margin: 5px 0;
      }
    }
  }
}

.@{prefix-cls} {
  padding: 5px;

  :deep(.el-form) {
    width: 100%;
  }

  :deep(.@{adminNamespace}-content-wrap .el-card__body) {
    padding: 5px !important;
  }

  &__item {
    display: flex;
    width: 100%;
    margin-bottom: 16px;
    align-items: center;

    :deep(.el-form-item__label) {
      width: 90px;
      padding-right: 12px;
      text-align: right;
    }

    :deep(.el-form-item__content) {
      display: flex;
      margin-left: 0 !important;
      flex: 1;
      align-items: center;

      .el-input,
      .el-select {
        width: 100%;
      }

      .el-input__wrapper {
        height: 32px;
      }
    }

    // 零库存开关特殊样式
    &-switch {
      :deep(.el-form-item__content) {
        width: 120px;
        flex: none;
      }

      :deep(.el-form-item__label) {
        width: 100px;
      }
    }
  }

  &__buttons {
    display: flex;
    padding-top: 16px;
    margin-top: 8px;
    border-top: 1px solid var(--el-border-color-light);
    justify-content: center;
    align-items: center;
    gap: 12px;

    .el-button {
      height: 32px;
      min-width: 120px;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--el-box-shadow-light);
      }
    }
  }
}

// 暗黑模式
.dark {
  .@{prefix-cls} {
    &__buttons {
      border-top-color: var(--el-border-color-darker);
    }
  }
}@prefix-cls: ~'@{adminNamespace}-stock-search';
</style>

<style>
.el-card__body {
  padding: 5px !important;
}
</style>
