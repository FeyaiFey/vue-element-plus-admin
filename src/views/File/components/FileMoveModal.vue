<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElTree, ElMessage, ElButton } from 'element-plus'
import ResizeDialog from '@/components/Dialog/src/ResizeDialog.vue'
import type { FileResponse, FolderResponse } from '@/api/file/types'
import { getFolderTreeApi, updateFileApi, updateFolderApi } from '@/api/file'

// Props
interface Props {
  visible: boolean
  item: FileResponse | FolderResponse | null
}

const props = defineProps<Props>()

// 事件
const emit = defineEmits<{
  'update:visible': [visible: boolean]
  success: []
}>()

// 状态
const loading = ref(false)
const treeData = ref<any[]>([])
const selectedFolderId = ref<number | null | undefined>(undefined)
const treeRef = ref()

// 是否为文件夹
const isFolder = (item: any): item is FolderResponse => {
  return item && 'is_public' in item && !('mime_type' in item)
}

// 加载文件夹树
const loadFolderTree = async () => {
  try {
    loading.value = true
    const response = await getFolderTreeApi({})

    // 转换数据结构
    const transformTreeData = (nodes: any[]): any[] => {
      return nodes.map((node) => ({
        id: node.id,
        label: node.name,
        children: node.children ? transformTreeData(node.children) : []
      }))
    }

    // 添加根目录选项
    treeData.value = [
      {
        id: null,
        label: '根目录',
        children: transformTreeData(response.data || [])
      }
    ]
  } catch (error) {
    console.error('加载文件夹树失败:', error)
    ElMessage.error('加载文件夹树失败')
  } finally {
    loading.value = false
  }
}

// 处理节点点击
const handleNodeClick = (data: any) => {
  selectedFolderId.value = data.id
}

// 确认移动
const handleConfirm = async () => {
  if (!props.item) return

  try {
    loading.value = true

    if (isFolder(props.item)) {
      // 移动文件夹 - 使用updateFolderApi更新parent_id
      // 当selectedFolderId为null时表示移动到根目录，parent_id应该为null
      await updateFolderApi(props.item.id, { parent_id: selectedFolderId.value })
    } else {
      // 移动文件 - 使用updateFileApi更新folder_id
      // 当selectedFolderId为null时表示移动到根目录，folder_id应该为null
      await updateFileApi(props.item.id, { folder_id: selectedFolderId.value })
    }

    ElMessage.success('移动成功')
    emit('success')
    handleClose()
  } catch (error: any) {
    console.error('移动失败:', error)
    ElMessage.error(error.message || '移动失败')
  } finally {
    loading.value = false
  }
}

// 关闭弹窗
const handleClose = () => {
  emit('update:visible', false)
  selectedFolderId.value = undefined
}

// 监听visible变化
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      loadFolderTree()
    }
  }
)
</script>

<template>
  <ResizeDialog
    :model-value="visible"
    :title="`移动${isFolder(item) ? '文件夹' : '文件'}`"
    :init-width="400"
    :init-height="500"
    :min-resize-width="350"
    :min-resize-height="400"
    @update:model-value="emit('update:visible', $event)"
  >
    <div class="move-container">
      <div class="current-item">
        <p class="item-info">
          <strong>{{ isFolder(item) ? '文件夹' : '文件' }}：</strong>
          {{ item?.name || (item as FileResponse)?.original_name }}
        </p>
      </div>

      <div class="folder-tree">
        <p class="tree-title">选择目标位置：</p>
        <ElTree
          ref="treeRef"
          :data="treeData"
          :props="{ children: 'children', label: 'label' }"
          node-key="id"
          :highlight-current="true"
          :expand-on-click-node="false"
          :default-expand-all="false"
          :default-expanded-keys="['root']"
          @node-click="handleNodeClick"
          v-loading="loading"
        >
          <template #default="{ data }">
            <span class="tree-node">
              <span class="node-icon">
                {{ data.id === null ? '🏠' : '📁' }}
              </span>
              <span class="node-label">{{ data.label || data.name }}</span>
            </span>
          </template>
        </ElTree>
      </div>

      <div class="selected-info" v-if="selectedFolderId !== undefined">
        <p>
          <strong>目标位置：</strong>
          {{ selectedFolderId === null ? '根目录' : '已选择文件夹' }}
        </p>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose" :disabled="loading">取消</el-button>
        <el-button
          type="primary"
          @click="handleConfirm"
          :loading="loading"
          :disabled="selectedFolderId === undefined"
        >
          {{ loading ? '移动中...' : '确认移动' }}
        </el-button>
      </div>
    </template>
  </ResizeDialog>
</template>

<style lang="less" scoped>
.move-container {
  .current-item {
    padding: 16px;
    margin-bottom: 16px;
    background: var(--el-fill-color-light);
    border-radius: 6px;

    .item-info {
      margin: 0;
      font-size: 14px;
      color: var(--el-text-color-primary);
    }
  }

  .folder-tree {
    .tree-title {
      margin: 0 0 12px;
      font-size: 14px;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }

    :deep(.el-tree) {
      max-height: 300px;
      padding: 8px;
      overflow-y: auto;
      background: transparent;
      border: 1px solid var(--el-border-color-light);
      border-radius: 6px;

      .el-tree-node__content {
        height: 32px;
        border-radius: 4px;

        &:hover {
          background: var(--el-fill-color-light);
        }

        &.is-current {
          color: var(--el-color-primary);
          background: var(--el-color-primary-light-9);
        }
      }
    }

    .tree-node {
      display: flex;
      align-items: center;

      .node-icon {
        margin-right: 6px;
        font-size: 14px;
      }

      .node-label {
        font-size: 14px;
      }
    }
  }

  .selected-info {
    padding: 12px;
    margin-top: 16px;
    background: var(--el-color-primary-light-9);
    border: 1px solid var(--el-color-primary-light-7);
    border-radius: 6px;

    p {
      margin: 0;
      font-size: 14px;
      color: var(--el-color-primary);
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
