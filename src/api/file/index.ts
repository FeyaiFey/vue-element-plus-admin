import request from '@/axios'
import type {
  FolderCreate,
  FolderResponse,
  FolderUpdate,
  FileResponse,
  FileUpdate,
  FileSearchRequest,
  BatchUploadResponse
} from './types'

// 文件夹相关接口
export const createFolderApi = (data: FolderCreate) => {
  return request.post<FolderResponse>({
    url: 'file/folders/',
    data
  })
}

export const listFoldersApi = (params: { parent_id?: number; skip?: number; limit?: number }) => {
  return request.get<FolderResponse[]>({
    url: 'file/folders/',
    params
  })
}

export const getFolderApi = (folder_id: number) => {
  return request.get<FolderResponse>({
    url: `file/folders/${folder_id}`
  })
}

export const updateFolderApi = (folder_id: number, data: FolderUpdate) => {
  return request.put<FolderResponse>({
    url: `file/folders/${folder_id}`,
    data
  })
}

export const deleteFolderApi = (folder_id: number) => {
  return request.delete<null>({
    url: `file/folders/${folder_id}`
  })
}

export const getFolderTreeApi = (params: { root_folder_id?: number }) => {
  return request.get<any>({
    url: 'file/folders/tree/',
    params
  })
}

// 文件相关接口
export const uploadFileApi = (formData: FormData) => {
  return request.post<FileResponse>({
    url: 'file/upload/',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export const uploadFilesBatchApi = (formData: FormData) => {
  return request.post<BatchUploadResponse>({
    url: 'file/upload/batch/',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export const listFilesApi = (params: { folder_id?: number; skip?: number; limit?: number }) => {
  return request.get<FileResponse[]>({
    url: 'file/files/',
    params
  })
}

export const getFileInfoApi = (file_id: number) => {
  return request.get<FileResponse>({
    url: `file/files/${file_id}`
  })
}

export const updateFileApi = (file_id: number, data: FileUpdate) => {
  return request.put<FileResponse>({
    url: `file/files/${file_id}`,
    data
  })
}

export const deleteFileApi = (file_id: number, permanent: boolean = false) => {
  return request.delete<null>({
    url: `file/files/${file_id}`,
    params: { permanent }
  })
}

export const downloadFileApi = (file_id: number) => {
  return request.get<Blob>({
    url: `file/files/${file_id}/download`,
    responseType: 'blob'
  })
}

export const previewFileApi = (file_id: number) => {
  return request.get<Blob>({
    url: `file/files/${file_id}/preview`,
    responseType: 'blob'
  })
}

export const searchFilesApi = (
  data: FileSearchRequest,
  params: { skip?: number; limit?: number }
) => {
  return request.post<FileResponse[]>({
    url: 'file/files/search/',
    data,
    params
  })
}
