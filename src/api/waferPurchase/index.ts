import request from '@/axios'
import {
  WaferPurchaseQuery,
  WaferPurchaseResponse,
  WaferPurchaseWipQuery,
  WaferPurchaseWipResponse
} from './types'

export const getWaferPurchaseListApi = (data: WaferPurchaseQuery) => {
  return request.get<WaferPurchaseResponse>({
    url: '/waferPurchase/list',
    params: data
  })
}

export const exportWaferPurchaseListApi = (data: WaferPurchaseQuery) => {
  return request.get<any>({
    url: '/waferPurchase/list/export',
    responseType: 'blob',
    params: data
  })
}

export const getWaferPurchaseWipListApi = (data: WaferPurchaseWipQuery) => {
  return request.get<WaferPurchaseWipResponse>({
    url: '/waferPurchase/wip/list',
    params: data
  })
}
