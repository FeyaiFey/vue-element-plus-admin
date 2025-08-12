<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import type { FileResponse, FolderResponse } from '@/api/file/types'

// Props
interface Props {
  visible: boolean
  position: { x: number; y: number }
  item: FileResponse | FolderResponse | null
}

const props = defineProps<Props>()

// 事件
const emit = defineEmits<{
  action: [action: string, item?: FileResponse | FolderResponse]
  close: []
}>()

// 是否为文件夹
const isFolder = computed(() => {
  return props.item && 'is_public' in props.item
})

// 是否为文件
const isFile = computed(() => {
  return props.item && 'mime_type' in props.item
})

// 定义菜单项类型
interface MenuItem {
  action?: string
  label?: string
  icon?: string
  danger?: boolean
  type?: string
}

// 菜单项配置
const menuItems = computed((): MenuItem[] => {
  if (!props.item) return []

  const items: MenuItem[] = []

  if (isFolder.value) {
    const folder = props.item as FolderResponse
    items.push(
      { action: 'enter', label: '打开', icon: '📁' },
      { type: 'divider' },
      {
        action: 'setStatus',
        label: folder.is_public ? '设为私有' : '设为公开',
        icon: folder.is_public ? '🔒' : '🌐'
      },
      { action: 'move', label: '移动', icon: '📋' },
      { type: 'divider' },
      { action: 'rename', label: '重命名', icon: '✏️' },
      { action: 'delete', label: '删除', icon: '🗑️', danger: true }
    )
  } else if (isFile.value) {
    const file = props.item as FileResponse
    const mimeType = file.mime_type || ''

    // 根据文件类型添加预览选项
    if (
      mimeType.startsWith('image/') ||
      mimeType.startsWith('video/') ||
      mimeType.startsWith('audio/') ||
      mimeType === 'application/pdf'
    ) {
      items.push({ action: 'preview', label: '预览', icon: '👁️' })
    }

    items.push(
      { action: 'download', label: '下载', icon: '⬇️' },
      { type: 'divider' },
      {
        action: 'setStatus',
        label: file.is_public ? '设为私有' : '设为公开',
        icon: file.is_public ? '🔒' : '🌐'
      },
      { action: 'move', label: '移动', icon: '📋' },
      { type: 'divider' },
      { action: 'rename', label: '重命名', icon: '✏️' },
      { action: 'delete', label: '删除', icon: '🗑️', danger: true }
    )
  }

  return items
})

// 处理菜单项点击
const handleMenuClick = (action: string) => {
  emit('action', action, props.item || undefined)
}

// 处理点击外部关闭
const handleClickOutside = () => {
  if (props.visible) {
    emit('close')
  }
}

// 监听键盘事件
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.visible) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="context-menu"
      :style="{
        left: position.x + 'px',
        top: position.y + 'px'
      }"
      @click.stop
    >
      <div class="menu-container">
        <template v-for="(item, index) in menuItems" :key="index">
          <!-- 分割线 -->
          <div v-if="item.type === 'divider'" class="menu-divider"></div>

          <!-- 菜单项 -->
          <div
            v-else
            class="menu-item"
            :class="{ danger: item.danger }"
            @click="handleMenuClick(item.action!)"
          >
            <span class="menu-icon">{{ item.icon }}</span>
            <span class="menu-label">{{ item.label }}</span>
          </div>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<style lang="less" scoped>
.context-menu {
  position: fixed;
  z-index: 9999;
  min-width: 120px;
  padding: 4px 0;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  box-shadow: var(--el-box-shadow);

  .menu-container {
    .menu-item {
      display: flex;
      padding: 8px 12px;
      font-size: 14px;
      color: var(--el-text-color-primary);
      cursor: pointer;
      transition: all 0.2s ease;
      align-items: center;

      &:hover {
        background: var(--el-fill-color-light);
      }

      &.danger {
        color: var(--el-color-danger);

        &:hover {
          background: var(--el-color-danger-light-9);
        }
      }

      .menu-icon {
        margin-right: 8px;
        font-size: 14px;
      }

      .menu-label {
        flex: 1;
      }
    }

    .menu-divider {
      height: 1px;
      margin: 4px 8px;
      background: var(--el-border-color-lighter);
    }
  }
}
</style>
