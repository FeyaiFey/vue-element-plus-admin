<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElTree, ElIcon } from 'element-plus'
import { Icon } from '@/components/Icon'
import { getFolderTreeApi } from '@/api/file'
import type { FolderResponse } from '@/api/file/types'

// 定义事件
const emit = defineEmits<{
  folderClick: [folder: FolderResponse | null]
}>()

// 树形数据
const treeData = ref<any[]>([])
const loading = ref(false)
const defaultExpandedKeys = ref<(string | number)[]>([])

// 树形组件属性
const treeProps = {
  children: 'children',
  label: 'name',
  isLeaf: 'isLeaf'
}

// 获取文件夹树
const loadFolderTree = async () => {
  try {
    loading.value = true

    // 获取文件夹树数据
    const res = await getFolderTreeApi({ root_folder_id: undefined })
    const folders = res.data || []

    // 处理树形数据，添加根目录节点
    const processTreeData = (nodes: any[]): any[] => {
      return nodes.map((node) => ({
        id: node.id,
        name: node.name,
        parent_id: node.parent_id,
        is_folder: node.is_folder,
        folder: node,
        children: node.children ? processTreeData(node.children) : [],
        isLeaf: !node.children || node.children.length === 0
      }))
    }

    // 构建根节点
    const rootNode = {
      id: 'root',
      name: '根目录',
      parent_id: null,
      is_folder: true,
      folder: null,
      children: processTreeData(folders),
      isLeaf: false
    }

    treeData.value = [rootNode]

    // 设置默认展开的节点（只展开根目录）
    defaultExpandedKeys.value = ['root']
  } catch (error) {
    console.error('加载文件夹树失败:', error)
  } finally {
    loading.value = false
  }
}

// 节点点击事件
const handleNodeClick = (data: any) => {
  if (data.id === 'root') {
    // 根目录 - 传递null表示根目录
    emit('folderClick', null)
  } else {
    emit('folderClick', data.folder)
  }
}

onMounted(() => {
  loadFolderTree()
})

// 暴露方法给父组件
defineExpose({
  loadFolderTree
})
</script>

<template>
  <div class="folder-tree">
    <div class="tree-content" v-loading="loading">
      <ElTree
        :data="treeData"
        :props="treeProps"
        :expand-on-click-node="false"
        :default-expanded-keys="defaultExpandedKeys"
        node-key="id"
        @node-click="handleNodeClick"
      >
        <template #default="{ node, data }">
          <div class="tree-node-content">
            <ElIcon :size="16" style="margin-right: 6px">
              <Icon :icon="node.expanded ? 'vi-ep:folder-opened' : 'vi-ep:folder'" />
            </ElIcon>
            <span style="font-size: 14px">{{ data.name }}</span>
          </div>
        </template>
      </ElTree>
    </div>
  </div>
</template>

<style lang="less" scoped>
.folder-tree {
  display: flex;
  height: 100%;
  flex-direction: column;

  .tree-content {
    flex: 1;
    padding: 8px;
    overflow-y: auto;
  }
}

:deep(.el-tree) {
  background: transparent;

  .el-tree-node {
    .el-tree-node__content {
      height: 32px;
      margin-bottom: 2px;
      border-radius: 4px;

      &:hover {
        background: var(--el-fill-color-light);
      }

      .el-tree-node__expand-icon {
        color: var(--el-text-color-secondary);
      }
    }

    &.is-current > .el-tree-node__content {
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
    }
  }
}

.tree-node-content {
  display: flex;
  align-items: center;
  width: 100%;

  .el-icon {
    color: var(--el-color-warning);
  }
}
</style>
