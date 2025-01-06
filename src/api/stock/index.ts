import request from '@/axios'
import type { StockQueryParams } from './types'

// 获取库存列表
export const getStockList = (params: StockQueryParams) => {
  return request.post({ url: '/mock/stock/list', data: params })
}

// 获取品号群组选项
export const getFeatureGroups = (params: StockQueryParams) => {
  return request.get({ url: '/mock/stock/featureGroups', data: params })
}

// 导出库存数据
export const exportStock = (params: StockQueryParams) => {
  return request.post({ url: '/mock/stock/export', data: params, responseType: 'blob' })
}
