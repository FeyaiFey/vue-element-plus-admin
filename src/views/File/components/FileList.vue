<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElTable, ElTableColumn, ElTag, ElButton } from 'element-plus'
import { Icon } from '@/components/Icon'
import type { FileResponse, FolderResponse } from '@/api/file/types'

// Props
interface Props {
  files: FileResponse[]
  folders: FolderResponse[]
  loading: boolean
  currentFolder: FolderResponse | null
}

const props = defineProps<Props>()

// 事件
const emit = defineEmits<{
  fileSelect: [selectedItems: (FileResponse | FolderResponse)[]]
  folderDoubleClick: [folder: FolderResponse]
  fileDoubleClick: [file: FileResponse]
  contextMenu: [event: MouseEvent, item: FileResponse | FolderResponse]
  filePreview: [file: FileResponse]
  fileDownload: [file: FileResponse]
  goBack: []
}>()

// 选中状态
const selectedItems = ref<(FileResponse | FolderResponse)[]>([])

// 合并文件和文件夹数据
const tableData = computed((): any[] => {
  const folderItems = props.folders.map((folder) => ({
    ...folder,
    isFolder: true,
    type: 'folder',
    size: '-',
    extension: '-'
  }))

  const fileItems = props.files.map((file) => ({
    ...file,
    isFolder: false,
    type: 'file'
  }))

  return [...folderItems, ...fileItems]
})

// 获取文件图标
const getFileIcon = (item: any) => {
  if (item.isFolder) {
    return 'vi-ep:folder'
  }

  const mimeType = item.mime_type || ''
  if (mimeType.startsWith('image/')) {
    return 'vi-ep:picture'
  } else if (mimeType.startsWith('video/')) {
    return 'vi-ep:video-play'
  } else if (mimeType.startsWith('audio/')) {
    return 'vi-ep:headphone'
  } else {
    return 'vi-ep:document'
  }
}

// 获取文件类型标签
const getFileTypeTag = (item: any) => {
  if (item.isFolder) {
    return { text: '文件夹', type: 'warning' }
  }

  const ext = item.extension?.toLowerCase() || ''
  const mimeType = item.mime_type || ''

  if (mimeType.startsWith('image/')) {
    return { text: '图片', type: 'success' }
  } else if (mimeType.startsWith('video/')) {
    return { text: '视频', type: 'primary' }
  } else if (mimeType.startsWith('audio/')) {
    return { text: '音频', type: 'info' }
  } else if (ext === 'pdf') {
    return { text: 'PDF', type: 'danger' }
  } else if (['doc', 'docx'].includes(ext)) {
    return { text: 'Word', type: 'primary' }
  } else if (['xls', 'xlsx'].includes(ext)) {
    return { text: 'Excel', type: 'success' }
  } else {
    return { text: '文件', type: 'info' }
  }
}

// 格式化文件大小
const formatSize = (size: number) => {
  if (!size || size === 0) return '-'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let index = 0
  let sizeValue = size

  while (sizeValue >= 1024 && index < units.length - 1) {
    sizeValue /= 1024
    index++
  }

  return `${sizeValue.toFixed(index === 0 ? 0 : 2)} ${units[index]}`
}

// 格式化日期
const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString('zh-CN')
}

// 选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedItems.value = selection.map((item) => {
    if (item.isFolder) {
      const { isFolder, type, size, extension, ...folder } = item
      return folder as FolderResponse
    } else {
      const { isFolder, type, ...file } = item
      return file as FileResponse
    }
  })
  emit('fileSelect', selectedItems.value)
}

// 行双击 - 改为单击
const handleRowClick = (row: any) => {
  if (row.isFolder) {
    const { isFolder, type, size, extension, ...folder } = row
    emit('folderDoubleClick', folder as FolderResponse)
  } else {
    const { isFolder, type, ...file } = row
    emit('fileDoubleClick', file as FileResponse)
  }
}

// 处理文件名点击
const handleNameClick = (row: any, event: Event) => {
  event.stopPropagation() // 阻止行选择
  handleRowClick(row)
}

// 右键菜单
const handleRowContextMenu = (row: any, _: any, event: MouseEvent) => {
  if (row.isFolder) {
    const { isFolder, type, size, extension, ...folder } = row
    emit('contextMenu', event, folder as FolderResponse)
  } else {
    const { isFolder, type, ...file } = row
    emit('contextMenu', event, file as FileResponse)
  }
}

// 预览文件
const handlePreview = (row: any) => {
  if (!row.isFolder) {
    const { isFolder, type, ...file } = row
    emit('filePreview', file as FileResponse)
  }
}

// 下载文件
const handleDownload = (row: any) => {
  if (!row.isFolder) {
    const { isFolder, type, ...file } = row
    emit('fileDownload', file as FileResponse)
  }
}
</script>

<template>
  <div class="file-list">
    <ElTable
      :data="tableData"
      v-loading="loading"
      border
      @selection-change="handleSelectionChange"
      @row-contextmenu="handleRowContextMenu"
      stripe
      style="width: 100%"
    >
      <!-- 选择列 -->
      <ElTableColumn type="selection" width="55" header-align="center" align="center" />

      <!-- 名称列 -->
      <ElTableColumn prop="name" label="名称" min-width="200" header-align="left" align="left">
        <template #default="{ row }">
          <div
            class="name-cell"
            :class="{ clickable: row.isFolder }"
            @click="handleNameClick(row, $event)"
          >
            <Icon :icon="getFileIcon(row)" />
            <span class="file-name">{{ row.original_name || row.name }}</span>
          </div>
        </template>
      </ElTableColumn>

      <!-- 类型列 -->
      <ElTableColumn prop="type" label="类型" width="100" header-align="center" align="center">
        <template #default="{ row }">
          <ElTag :type="getFileTypeTag(row).type as any" size="small">
            {{ getFileTypeTag(row).text }}
          </ElTag>
        </template>
      </ElTableColumn>

      <!-- 大小列 -->
      <ElTableColumn prop="size" label="大小" width="120" header-align="center" align="center">
        <template #default="{ row }">
          {{ row.isFolder ? '-' : formatSize(row.size) }}
        </template>
      </ElTableColumn>

      <!-- 修改时间列 -->
      <ElTableColumn
        prop="updated_at"
        label="修改时间"
        width="180"
        header-align="center"
        align="center"
      >
        <template #default="{ row }">
          {{ formatDateTime(row.updated_at) }}
        </template>
      </ElTableColumn>

      <!-- 操作列 -->
      <ElTableColumn label="操作" width="200" fixed="right" header-align="center" align="center">
        <template #default="{ row }">
          <div class="action-buttons" v-if="!row.isFolder">
            <ElButton
              type="primary"
              size="small"
              text
              @click.stop="handlePreview(row)"
              title="预览"
            >
              <Icon icon="vi-ep:view" />预览
            </ElButton>
            <ElButton
              type="success"
              size="small"
              text
              @click.stop="handleDownload(row)"
              title="下载"
            >
              <Icon icon="vi-ep:download" />下载
            </ElButton>
          </div>
          <div class="action-buttons" v-else>
            <span class="no-actions">-</span>
          </div>
        </template>
      </ElTableColumn>
    </ElTable>
  </div>
</template>

<style lang="less" scoped>
.file-list {
  width: 100%;

  .name-cell {
    display: flex;
    align-items: center;

    .file-icon {
      margin-right: 8px;
      color: var(--el-color-primary);

      &.folder-icon {
        color: var(--el-color-warning);
      }
    }

    .file-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &.clickable {
      padding: 4px;
      cursor: pointer;
      border-radius: 4px;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: var(--el-fill-color-light);
      }

      &:active {
        background-color: var(--el-fill-color);
      }
    }
  }

  .action-buttons {
    display: flex;
    align-items: center;
    justify-content: center;

    .no-actions {
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }
  }
}

:deep(.el-table) {
  .el-table__row {
    cursor: pointer;

    &:hover {
      background-color: var(--el-table-row-hover-bg-color);
    }
  }
}
</style>
