<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElContainer, ElAside, ElMain, ElMessage, ElMessageBox } from 'element-plus'
import FolderTree from './components/FolderTree.vue'
import FileList from './components/FileList.vue'
import FileToolbar from './components/FileToolbar.vue'
import FileBreadcrumb from './components/FileBreadcrumb.vue'
import FileUploadModal from './components/FileUploadModal.vue'
import FileContextMenu from './components/FileContextMenu.vue'
import FilePreviewModal from './components/FilePreviewModal.vue'
import type { FileResponse, FolderResponse } from '@/api/file/types'
import {
  listFilesApi,
  listFoldersApi,
  downloadFileApi,
  createFolderApi,
  deleteFileApi,
  deleteFolderApi,
  updateFileApi,
  updateFolderApi
} from '@/api/file'

// 定义组件名称（用于keep-alive缓存）
defineOptions({
  name: 'FileManagement'
})

// 当前状态
const currentFolder = ref<FolderResponse | null>(null)
const currentPath = ref<Array<{ id: number | null; name: string }>>([
  { id: null, name: '全部文件' }
])
const selectedFiles = ref<(FileResponse | FolderResponse)[]>([])

// 文件和文件夹数据
const files = ref<FileResponse[]>([])
const folders = ref<FolderResponse[]>([])
const loading = ref(false)

// 搜索状态
const isSearchMode = ref(false)
const searchResults = ref<FileResponse[]>([])

// 弹窗状态
const uploadModalVisible = ref(false)
const previewModalVisible = ref(false)
const currentPreviewFile = ref<FileResponse | null>(null)

// 右键菜单
const contextMenuVisible = ref(false)
const contextMenuPosition = reactive({ x: 0, y: 0 })
const contextMenuItem = ref<FileResponse | FolderResponse | null>(null)

// FolderTree组件引用
const folderTreeRef = ref()

// 获取文件和文件夹列表
const loadFileList = async (folderId?: number) => {
  try {
    loading.value = true

    // 并发请求文件和文件夹
    const [filesRes, foldersRes] = await Promise.all([
      listFilesApi({ folder_id: folderId }),
      listFoldersApi({ parent_id: folderId })
    ])

    files.value = filesRes.data || []
    folders.value = foldersRes.data || []
  } catch (error) {
    console.error('加载文件列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 处理搜索结果
const handleSearchResult = (results: FileResponse[]) => {
  if (results.length > 0) {
    // 进入搜索模式
    isSearchMode.value = true
    searchResults.value = results
    files.value = results
    folders.value = [] // 搜索模式下不显示文件夹
  } else {
    // 退出搜索模式，恢复正常列表
    isSearchMode.value = false
    searchResults.value = []
    loadFileList(currentFolder.value?.id || undefined)
  }
}

// 进入文件夹（从文件列表双击进入）
const enterFolder = (folder: FolderResponse) => {
  currentFolder.value = folder
  currentPath.value.push({ id: folder.id, name: folder.name })
  loadFileList(folder.id)
}

// 从文件夹树直接跳转到文件夹
const jumpToFolder = async (folder: FolderResponse | null) => {
  if (!folder || folder.id === null) {
    // 跳转到根目录
    currentFolder.value = null
    currentPath.value = [{ id: null, name: '全部文件' }]
    loadFileList()
    return
  }

  try {
    // 重新构建路径：需要获取完整的父级路径
    const path = await buildFolderPath(folder)
    currentFolder.value = folder
    currentPath.value = path
    loadFileList(folder.id)
  } catch (error) {
    console.error('跳转文件夹失败:', error)
  }
}

// 构建文件夹完整路径
const buildFolderPath = async (
  folder: FolderResponse
): Promise<Array<{ id: number | null; name: string }>> => {
  const path: Array<{ id: number | null; name: string }> = []

  // 递归构建路径
  const buildPathRecursive = async (currentFolder: FolderResponse) => {
    // 添加当前文件夹到路径开头
    path.unshift({ id: currentFolder.id, name: currentFolder.name })

    // 如果有父文件夹ID，获取父文件夹信息并继续递归
    if (currentFolder.parent_id) {
      try {
        const res = await listFoldersApi({ limit: 1000 })
        const folders = res.data || []
        const parentFolder = folders.find((f) => f.id === currentFolder.parent_id)
        if (parentFolder) {
          await buildPathRecursive(parentFolder)
        }
      } catch (error) {
        console.error('获取父文件夹失败:', error)
      }
    }
  }

  await buildPathRecursive(folder)

  // 在最开头添加根目录
  return [{ id: null, name: '全部文件' }, ...path]
}

// 返回上一级
const handleGoBack = () => {
  if (currentPath.value.length > 1) {
    currentPath.value.pop()
    const parentPath = currentPath.value[currentPath.value.length - 1]
    currentFolder.value = parentPath.id ? ({ id: parentPath.id } as FolderResponse) : null
    loadFileList(parentPath.id || undefined)
  }
}

// 面包屑导航
const handleBreadcrumbClick = (index: number) => {
  const targetPath = currentPath.value[index]
  currentPath.value = currentPath.value.slice(0, index + 1)
  currentFolder.value = targetPath.id ? ({ id: targetPath.id } as FolderResponse) : null
  loadFileList(targetPath.id || undefined)
}

// 文件选择
const handleFileSelect = (selectedItems: (FileResponse | FolderResponse)[]) => {
  selectedFiles.value = selectedItems
}

// 文件夹双击
const handleFolderDoubleClick = (folder: FolderResponse) => {
  enterFolder(folder)
}

// 文件双击（预览）
const handleFileDoubleClick = (file: FileResponse) => {
  handleFilePreview(file)
}

// 单个文件预览 - 使用弹窗
const handleFilePreview = async (file: FileResponse) => {
  currentPreviewFile.value = file
  previewModalVisible.value = true
}

// 单个文件下载
const handleFileDownload = async (file: FileResponse) => {
  try {
    const response = await downloadFileApi(file.id)
    // 创建下载链接
    const blob = new Blob([response.data])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = file.original_name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    ElMessage.success('下载成功')
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载失败')
  }
}

// 上传
const handleUpload = () => {
  uploadModalVisible.value = true
}

// 上传成功后刷新列表
const handleUploadSuccess = () => {
  loadFileList(currentFolder.value?.id || undefined)
}

// 删除
const handleDelete = async () => {
  if (selectedFiles.value.length === 0) {
    ElMessage.warning('请先选择要删除的文件或文件夹')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedFiles.value.length} 个项目吗？`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )

    // 分别处理文件和文件夹的删除
    const deletePromises = selectedFiles.value.map((item) => {
      if ('mime_type' in item) {
        // 是文件
        return deleteFileApi(item.id)
      } else {
        // 是文件夹
        return deleteFolderApi(item.id)
      }
    })

    await Promise.all(deletePromises)
    ElMessage.success('删除成功')

    // 清空选择并刷新列表
    selectedFiles.value = []
    loadFileList(currentFolder.value?.id || undefined)
    // 刷新文件夹树（如果删除的包含文件夹）
    folderTreeRef.value?.loadFolderTree()
  } catch (error: any) {
    if (error === 'cancel') {
      return // 用户取消操作
    }
    console.error('删除失败:', error)
    ElMessage.error('删除失败')
  }
}

// 重命名
const handleRename = async () => {
  if (selectedFiles.value.length !== 1) {
    ElMessage.warning('请选择一个文件或文件夹进行重命名')
    return
  }

  const item = selectedFiles.value[0]
  const currentName = 'mime_type' in item ? item.original_name : item.name

  try {
    const { value: newName } = await ElMessageBox.prompt('请输入新名称', '重命名', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: currentName,
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return '名称不能为空'
        }
        if (value.trim() === currentName) {
          return '新名称不能与原名称相同'
        }
        return true
      }
    })

    if ('mime_type' in item) {
      // 是文件
      await updateFileApi(item.id, { name: newName.trim() })
    } else {
      // 是文件夹
      await updateFolderApi(item.id, { name: newName.trim() })
    }

    ElMessage.success('重命名成功')
    // 清空选择并刷新列表
    selectedFiles.value = []
    loadFileList(currentFolder.value?.id || undefined)
    // 刷新文件夹树（如果重命名的是文件夹）
    if (!('mime_type' in item)) {
      folderTreeRef.value?.loadFolderTree()
    }
  } catch (error: any) {
    if (error === 'cancel') {
      return // 用户取消操作
    }
    console.error('重命名失败:', error)
    ElMessage.error('重命名失败')
  }
}

// 批量下载
const handleDownload = async () => {
  if (selectedFiles.value.length === 0) {
    ElMessage.warning('请先选择要下载的文件')
    return
  }

  // 只下载文件，过滤掉文件夹
  const filesToDownload = selectedFiles.value.filter(
    (item) => 'mime_type' in item
  ) as FileResponse[]

  if (filesToDownload.length === 0) {
    ElMessage.warning('选中的项目中没有可下载的文件')
    return
  }

  try {
    ElMessage.info(`开始下载 ${filesToDownload.length} 个文件...`)

    // 并发下载所有文件
    const downloadPromises = filesToDownload.map(async (file) => {
      const response = await downloadFileApi(file.id)
      // 创建下载链接
      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = file.original_name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    })

    await Promise.all(downloadPromises)
    ElMessage.success('所有文件下载完成')
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载失败')
  }
}

// 新建文件夹
const handleCreateFolder = async () => {
  try {
    const { value: folderName } = await ElMessageBox.prompt('请输入文件夹名称', '新建文件夹', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return '文件夹名称不能为空'
        }
        return true
      }
    })

    await createFolderApi({
      name: folderName.trim(),
      parent_id: currentFolder.value?.id,
      is_public: false
    })

    ElMessage.success('文件夹创建成功')
    // 刷新当前文件夹内容
    loadFileList(currentFolder.value?.id || undefined)
    // 刷新文件夹树
    folderTreeRef.value?.loadFolderTree()
  } catch (error: any) {
    if (error === 'cancel') {
      return // 用户取消操作
    }
    console.error('创建文件夹失败:', error)
    ElMessage.error('创建文件夹失败')
  }
}

// 右键菜单
const handleContextMenu = (event: MouseEvent, item: FileResponse | FolderResponse) => {
  event.preventDefault()
  contextMenuItem.value = item
  contextMenuPosition.x = event.clientX
  contextMenuPosition.y = event.clientY
  contextMenuVisible.value = true
}

// 右键菜单操作
const handleContextMenuAction = (action: string) => {
  contextMenuVisible.value = false

  switch (action) {
    case 'preview':
      if (contextMenuItem.value && 'mime_type' in contextMenuItem.value) {
        handleFilePreview(contextMenuItem.value as FileResponse)
      }
      break
    case 'download':
      if (contextMenuItem.value && 'mime_type' in contextMenuItem.value) {
        handleFileDownload(contextMenuItem.value as FileResponse)
      }
      break
    case 'rename':
      if (contextMenuItem.value) {
        selectedFiles.value = [contextMenuItem.value]
        handleRename()
      }
      break
    case 'delete':
      if (contextMenuItem.value) {
        selectedFiles.value = [contextMenuItem.value]
        handleDelete()
      }
      break
    case 'enter':
      if (contextMenuItem.value && 'is_public' in contextMenuItem.value) {
        enterFolder(contextMenuItem.value as FolderResponse)
      }
      break
  }
}

// 初始化
onMounted(() => {
  loadFileList()
})
</script>

<template>
  <!-- 工具栏 -->
  <FileToolbar
    :selected-files="selectedFiles"
    :current-folder-id="currentFolder?.id"
    @upload="handleUpload"
    @create-folder="handleCreateFolder"
    @refresh="() => loadFileList(currentFolder?.id || undefined)"
    @rename="handleRename"
    @download="handleDownload"
    @delete="handleDelete"
    @search-result="handleSearchResult"
  />
  <div class="file-manager">
    <ElContainer class="file-container">
      <!-- 主体部分 -->
      <ElContainer class="main-container">
        <!-- 左侧文件夹树 -->
        <ElAside width="200px" class="file-aside">
          <FolderTree @folder-click="jumpToFolder" ref="folderTreeRef" />
        </ElAside>

        <!-- 右侧内容区 -->
        <ElMain class="file-main">
          <!-- 面包屑导航 -->
          <FileBreadcrumb
            :current-path="currentPath"
            :can-go-back="currentPath.length > 1"
            @go-back="handleGoBack"
            @path-click="handleBreadcrumbClick"
          />

          <!-- 文件列表 -->
          <div class="file-content">
            <FileList
              :files="files"
              :folders="folders"
              :loading="loading"
              :current-folder="currentFolder"
              @file-select="handleFileSelect"
              @folder-double-click="handleFolderDoubleClick"
              @file-double-click="handleFileDoubleClick"
              @file-preview="handleFilePreview"
              @file-download="handleFileDownload"
              @context-menu="handleContextMenu"
            />
          </div>
        </ElMain>
      </ElContainer>
    </ElContainer>

    <!-- 上传弹窗 -->
    <FileUploadModal
      v-model:visible="uploadModalVisible"
      :current-folder-id="currentFolder?.id"
      @success="handleUploadSuccess"
    />

    <!-- 右键菜单 -->
    <FileContextMenu
      :visible="contextMenuVisible"
      :position="contextMenuPosition"
      :item="contextMenuItem"
      @action="handleContextMenuAction"
      @close="contextMenuVisible = false"
    />

    <!-- 预览弹窗 -->
    <FilePreviewModal v-model="previewModalVisible" :file="currentPreviewFile" />
  </div>
</template>

<style lang="less" scoped>


// 暗色模式适配
@media (prefers-color-scheme: dark) {
  .file-manager {
    background: var(--el-bg-color-page);

    .file-container {
      background: var(--el-bg-color);
      border-color: var(--el-border-color);
    }

    .file-aside {
      background: var(--el-bg-color);
      border-color: var(--el-border-color);
    }

    .file-main {
      background: var(--el-bg-color);
    }
  }
}

.file-manager {
  display: flex;
  height: calc(100vh - 200px);
  background: #fff;
  flex-direction: column;

  .file-container {
    height: 100%;
    background: #fff;
    border: 1px solid #dcdfe6;
  }

  .main-container {
    height: 100%;
  }

  .file-aside {
    overflow-y: auto;
    background: #fafafa;
    border-right: 1px solid #dcdfe6;
  }

  .file-main {
    padding: 0;
    overflow: hidden;
    background: #fff;

    .file-content {
      height: calc(100% - 53px);
      overflow-y: auto;
    }
  }
}

.dark {
  .file-manager {
    background: var(--el-bg-color-page);

    .file-container {
      background: var(--el-bg-color);
      border-color: var(--el-border-color);
    }

    .file-aside {
      background: var(--el-bg-color);
      border-color: var(--el-border-color);
    }

    .file-main {
      background: var(--el-bg-color);
    }
  }
}
</style>
