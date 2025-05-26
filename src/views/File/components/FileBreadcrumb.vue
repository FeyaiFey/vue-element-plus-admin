<script setup lang="ts">
import { ElLink } from 'element-plus'
import { Icon } from '@/components/Icon'

// Props
interface Props {
  currentPath: Array<{ id: number | null; name: string }>
  canGoBack: boolean
}

defineProps<Props>()

// 事件
const emit = defineEmits<{
  goBack: []
  pathClick: [index: number]
}>()

// 操作方法
const handleGoBack = () => emit('goBack')
const handlePathClick = (index: number) => emit('pathClick', index)
</script>

<template>
  <div class="file-breadcrumb">
    <!-- 返回上一级按钮 -->
    <ElLink v-if="canGoBack" size="small" @click="handleGoBack" class="back-button">
      <Icon icon="vi-ep:back" />
      返回上一级
    </ElLink>

    <!-- 面包屑路径 -->
    <div class="breadcrumb-path">
      <span
        v-for="(item, index) in currentPath"
        :key="index"
        class="path-item"
        :class="{ active: index === currentPath.length - 1 }"
        @click="handlePathClick(index)"
      >
        <Icon icon="ep:folder" class="path-icon" />
        {{ item.name }}
        <Icon v-if="index < currentPath.length - 1" icon="vi-ep:arrow-right" class="separator" />
      </span>
    </div>
  </div>
</template>

<style lang="less" scoped>


// 暗色模式适配
@media (prefers-color-scheme: dark) {
  .file-breadcrumb {
    background: var(--el-bg-color-page);
    border-color: var(--el-border-color);
  }
}

.file-breadcrumb {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #f9f9f9;
  border-bottom: 1px solid #e4e7ed;

  .back-button {
    flex-shrink: 0;
  }

  .breadcrumb-path {
    display: flex;
    align-items: center;
    flex: 1;
    overflow: hidden;

    .path-item {
      display: flex;
      padding: 4px 8px;
      font-size: 14px;
      color: var(--el-text-color-regular);
      white-space: nowrap;
      cursor: pointer;
      border-radius: 4px;
      transition: background-color 0.2s ease;
      align-items: center;
      gap: 4px;

      &:hover {
        background-color: var(--el-fill-color-light);
      }

      &.active {
        font-weight: 500;
        color: var(--el-color-primary);
      }

      .path-icon {
        font-size: 16px;
        color: var(--el-color-warning);
      }

      .separator {
        margin: 0 4px;
        font-size: 12px;
        color: var(--el-text-color-placeholder);
      }
    }
  }
}

.dark {
  .file-breadcrumb {
    background: var(--el-bg-color-page);
    border-color: var(--el-border-color);
  }
}
</style>
