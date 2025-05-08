import request from '@/axios'
import type { SaleTableQuery, SaleTableResponse, SaleTargetCreate, SaleTargetUpdate } from './type'

export const getSaleTableApi = (query: SaleTableQuery) => {
  return request.get<SaleTableResponse>({
    url: '/sale/table',
    params: query
  })
}

export const createSaleTargetApi = (data: SaleTargetCreate) => {
  return request.post<SaleTargetCreate>({
    url: '/sale/target',
    data
  })
}

export const updateSaleTargetApi = (data: SaleTargetUpdate) => {
  return request.put<SaleTargetUpdate>({
    url: '/sale/target',
    data
  })
}

export const deleteSaleTargetApi = (data: SaleTargetUpdate) => {
  return request.delete<SaleTargetUpdate>({
    url: '/sale/target',
    data
  })
}
