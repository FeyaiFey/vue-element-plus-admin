import request from '@/axios'
import type {
  PurchaseOrderQuery,
  PurchaseOrderResponse,
  PurchaseWipResponse,
  PurchaseWipQuery,
  PurchaseWipSupplierResponse,
  PurchaseSupplierResponse
} from './type'

export const getPurchaseOrderListApi = (query: PurchaseOrderQuery) => {
  return request.get<PurchaseOrderResponse>({
    url: '/purchase/table',
    params: query
  })
}

export const getPurchaseWipListApi = (query: PurchaseWipQuery) => {
  return request.get<PurchaseWipResponse>({
    url: '/purchase/wip',
    params: query
  })
}

export const getPurchaseSupplierListApi = () => {
  return request.get<PurchaseSupplierResponse[]>({
    url: '/purchase/supplier'
  })
}

export const getPurchaseWipSupplierListApi = () => {
  return request.get<PurchaseWipSupplierResponse[]>({
    url: '/purchase/wip/supplier'
  })
}
