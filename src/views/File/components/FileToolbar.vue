<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElInput, ElMessage } from 'element-plus'
import { Icon } from '@/components/Icon'
import { searchFilesApi } from '@/api/file'
import type { FileResponse, FolderResponse } from '@/api/file/types'

// Props
interface Props {
  selectedFiles: (FileResponse | FolderResponse)[]
  currentFolderId?: number | null
}

const props = defineProps<Props>()

// 搜索相关
const searchKeyword = ref('')
const isSearching = ref(false)

// 事件
const emit = defineEmits<{
  upload: []
  createFolder: []
  refresh: []
  rename: []
  download: []
  delete: []
  searchResult: [files: FileResponse[]]
}>()

// 操作方法
const handleUpload = () => emit('upload')
const handleCreateFolder = () => emit('createFolder')
const handleRefresh = () => emit('refresh')
const handleRename = () => emit('rename')
const handleDownload = () => emit('download')
const handleDelete = () => emit('delete')

// 搜索方法
const handleSearch = async () => {
  const keyword = searchKeyword.value.trim()
  if (!keyword) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  try {
    isSearching.value = true
    const searchData = {
      query: keyword,
      folder_id: props.currentFolderId || undefined
    }

    const response = await searchFilesApi(searchData, { skip: 0, limit: 100 })
    emit('searchResult', response.data)
    ElMessage.success(`找到 ${response.data.length} 个文件`)
  } catch (error) {
    console.error('搜索失败:', error)
    ElMessage.error('搜索失败，请重试')
  } finally {
    isSearching.value = false
  }
}

// 清空搜索
const handleClearSearch = () => {
  searchKeyword.value = ''
  isSearching.value = false
  emit('searchResult', [])
}

// 回车搜索
const handleSearchEnter = () => {
  handleSearch()
}
</script>

<template>
  <div class="file-toolbar">
    <div class="toolbar-left">
      <ElButton type="primary" class="w-118px" @click="handleUpload">
        <Icon icon="vi-line-md:upload-loop" />
        上传
      </ElButton>
      <ElButton @click="handleCreateFolder">
        <Icon icon="vi-ep:folder-add" />
        新建文件夹
      </ElButton>
      <ElButton @click="handleRefresh">
        <Icon icon="vi-ep:refresh" />
        刷新
      </ElButton>
    </div>

    <div class="toolbar-right">
      <div class="toolbar-actions" v-if="selectedFiles.length > 0">
        <ElButton v-if="selectedFiles.length === 1" size="small" @click="handleRename">
          <Icon icon="ep:edit" />
          重命名
        </ElButton>
        <ElButton size="small" @click="handleDownload">
          <Icon icon="ep:download" />
          下载
        </ElButton>
        <ElButton type="danger" size="small" @click="handleDelete">
          <Icon icon="ep:delete" />
          删除
        </ElButton>
      </div>
      <span v-if="selectedFiles.length > 0" class="selection-count">
        已选中 {{ selectedFiles.length }} 个项目
      </span>

      <!-- 搜索框 -->
      <div class="search-container">
        <ElInput
          v-model="searchKeyword"
          placeholder="搜索文件..."
          size="small"
          class="search-input"
          clearable
          @keyup.enter="handleSearchEnter"
          @clear="handleClearSearch"
        >
          <template #suffix>
            <Icon
              icon="vi-ep:search"
              class="search-icon"
              :class="{ searching: isSearching }"
              @click="handleSearch"
            />
          </template>
        </ElInput>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
// 响应式适配
@media screen and (width <= 768px) {
  .file-toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;

    .toolbar-right {
      justify-content: space-between;

      .search-container {
        .search-input {
          width: 150px;
        }
      }
    }
  }
}

@media screen and (width <= 480px) {
  .file-toolbar {
    .toolbar-left {
      flex-wrap: wrap;
    }

    .toolbar-right {
      flex-direction: column;
      gap: 8px;
      align-items: stretch;

      .search-container {
        .search-input {
          width: 100%;
        }
      }
    }
  }
}

// 暗色模式适配
@media (prefers-color-scheme: dark) {
  .file-toolbar {
    background: var(--el-bg-color);
    border-color: var(--el-border-color);
  }
}

.file-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;

  .toolbar-left {
    display: flex;
    gap: 8px;
  }

  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 12px;

    .toolbar-actions {
      display: flex;
      gap: 8px;
    }

    .selection-count {
      font-size: 12px;
      color: #909399;
      white-space: nowrap;
    }

    .search-container {
      .search-input {
        width: 200px;

        :deep(.el-input__wrapper) {
          border-radius: 16px;
          transition: all 0.3s ease;

          &:hover {
            box-shadow: 0 0 0 1px var(--el-color-primary-light-7);
          }

          &.is-focus {
            box-shadow: 0 0 0 1px var(--el-color-primary);
          }
        }
      }

      .search-icon {
        color: var(--el-text-color-placeholder);
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          color: var(--el-color-primary);
        }

        &.searching {
          color: var(--el-color-primary);
        }
      }
    }
  }
}

.dark {
  .file-toolbar {
    background: var(--el-bg-color);
    border-color: var(--el-border-color);
  }
}
</style>
