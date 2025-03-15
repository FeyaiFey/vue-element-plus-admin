<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Search } from '@/components/Search'
import type { FormSchema } from '@/components/Form'
import { getFeatureGroupNameApi, getWarehouseNameApi } from '@/api/params'

const { loading } = defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'search', data: any): void
  (e: 'reset'): void
}>()

// 远程选项
// 特征组选项
const featureGroupOptions = ref<Array<{ label: string; value: string }>>([])
const featureGroupLoading = ref(false)

// 远程搜索特征组
const handleFeatureGroupSearch = async (query: string) => {
  if (!query) {
    featureGroupOptions.value = []
    return
  }
  featureGroupLoading.value = true
  try {
    const res = await getFeatureGroupNameApi({ feature_group_name: query })
    featureGroupOptions.value = res.data.list.map((item) => ({
      label: item.label,
      value: item.value
    }))
  } catch (error) {
    console.error('获取特征组列表失败:', error)
  } finally {
    featureGroupLoading.value = false
  }
}

// 仓库选项
const warehouseOptions = ref<Array<{ label: string; value: string }>>([])
const warehouseLoading = ref(false)

// 远程搜索仓库
const handleWarehouseSearch = async (query: string) => {
  if (!query) {
    warehouseOptions.value = []
    return
  }
  warehouseLoading.value = true
  try {
    const res = await getWarehouseNameApi({ warehouse_name: query })
    warehouseOptions.value = res.data.list.map((item) => ({
      label: item.label,
      value: item.value
    }))
  } catch (error) {
    console.error('获取仓库列表失败:', error)
  } finally {
    warehouseLoading.value = false
  }
}

// 添加表单引用
const formRef = ref()

// 查询表单配置
const schema = reactive<FormSchema[]>([
  {
    field: 'warehouse_name',
    label: '仓库',
    component: 'Select',
    componentProps: {
      placeholder: '请输入仓库搜索',
      clearable: true,
      multiple: true,
      filterable: true,
      remote: true,
      reserveKeyword: true,
      loading: warehouseLoading,
      remoteMethod: handleWarehouseSearch,
      options: warehouseOptions,
      collapseTags: true,
      collapseTagsTooltip: true,
      onKeyup: (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          // 获取表单数据
          formRef.value?.getFormData().then((formData) => {
            handleSearch(formData)
          })
        }
      }
    },
    colProps: {
      xs: 24, // 在超小屏幕上占满整行
      sm: 24, // 在小屏幕上占满整行
      md: 12, // 在中等屏幕上占半行
      lg: 8, // 在大屏幕上占 1/3
      xl: 8 // 在超大屏幕上占 1/3
    }
  },
  {
    field: 'feature_group_name',
    label: '品号群组',
    component: 'Select',
    componentProps: {
      placeholder: '请输入品号群组搜索',
      clearable: true,
      multiple: true,
      filterable: true,
      remote: true,
      reserveKeyword: true,
      loading: featureGroupLoading,
      remoteMethod: handleFeatureGroupSearch,
      options: featureGroupOptions,
      collapseTags: true,
      collapseTagsTooltip: true,
      onKeyup: (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          // 获取表单数据
          formRef.value?.getFormData().then((formData) => {
            handleSearch(formData)
          })
        }
      }
    },
    colProps: {
      xs: 24, // 在超小屏幕上占满整行
      sm: 24, // 在小屏幕上占满整行
      md: 12, // 在中等屏幕上占半行
      lg: 8, // 在大屏幕上占 1/3
      xl: 8 // 在超大屏幕上占 1/3
    }
  },
  {
    field: 'item_name',
    label: '物料名称',
    component: 'Input',
    componentProps: {
      placeholder: '请输入物料名称模糊搜索',
      clearable: true,
      multiple: true,
      collapseTags: true,
      collapseTagsTooltip: true,
      onKeyup: (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          // 获取表单数据
          formRef.value?.getFormData().then((formData) => {
            handleSearch(formData)
          })
        }
      }
    },
    colProps: {
      xs: 24, // 在超小屏幕上占满整行
      sm: 24, // 在小屏幕上占满整行
      md: 12, // 在中等屏幕上占半行
      lg: 8, // 在大屏幕上占 1/3
      xl: 8 // 在超大屏幕上占 1/3
    }
  }
])

// 处理搜索和重置
const handleSearch = (data: any) => {
  emit('search', data)
}

const handleReset = () => {
  emit('reset')
}
</script>

<template>
  <div class="stock-filter">
    <Search
      ref="formRef"
      :schema="schema"
      :search-loading="loading"
      @search="handleSearch"
      @reset="handleReset"
      :is-col="true"
      :inline="false"
      label-width="100px"
      :show-search="false"
      :show-reset="false"
      layout="bottom"
    />
  </div>
</template>

<style lang="less" scoped>
.stock-filter {
  padding: 8px;
  background-color: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
}
</style>
