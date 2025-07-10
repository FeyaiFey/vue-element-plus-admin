import request from '@/axios'
import type {
  SaleTargetQuery,
  SaleTargetResponse,
  SaleTargetCreate,
  SaleTargetImportResponse
} from './types'

// 获取销售目标列表
export const getSaleTargetListApi = (params: SaleTargetQuery) => {
  return request.get<SaleTargetResponse>({
    url: '/sale/target/list',
    params
  })
}

// 删除销售目标
export const deleteSaleTargetApi = (id: number) => {
  return request.delete({
    url: `/sale/target/delete/${id}`
  })
}

// 批量删除销售目标
export const deleteSaleTargetBatchApi = (ids: number[]) => {
  return request.delete({
    url: '/sale/target/batch',
    data: ids
  })
}

// 创建销售目标
export const createSaleTargetApi = (data: SaleTargetCreate) => {
  return request.post({
    url: '/sale/target',
    data
  })
}

// 同步导入销售目标
export const importSaleTargetsApi = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  return request.post<SaleTargetImportResponse>({
    url: '/sale/target/import',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 下载销售目标模板
export const downloadSaleTargetTemplateApi = () => {
  return request.get({
    url: '/sale/target/template',
    responseType: 'blob'
  })
}

// 启动异步导入任务
export const startImportTaskApi = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  return request.post<{ taskId: string }>({
    url: '/sale/target/import/async',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 查询导入任务状态
export const getImportTaskStatusApi = (taskId: string) => {
  return request.get<any>({
    url: `/sale/target/import/status/${taskId}`
  })
}
