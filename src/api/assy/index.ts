import request from '@/axios'
import type {
  AssyOrderQuery,
  AssyOrderResponse,
  AssyWipQuery,
  AssyWipResponse,
  AssyOrderItemsQuery,
  AssyOrderItemsResponse,
  AssyOrderPackageTypeQuery,
  AssyOrderPackageTypeResponse,
  AssyOrderSupplierQuery,
  AssyOrderSupplierResponse
} from './type'

export const getAssyListApi = (query: AssyOrderQuery) => {
  return request.get<AssyOrderResponse>({
    url: '/assy/table',
    params: query
  })
}

export const getAssyWipApi = (query: AssyWipQuery) => {
  return request.get<AssyWipResponse>({
    url: '/assy/wip',
    params: query
  })
}

export const getAssyOrderItemsApi = (query: AssyOrderItemsQuery) => {
  return request.get<AssyOrderItemsResponse>({
    url: '/assy/items',
    params: query
  })
}

export const getAssyOrderPackageTypeApi = (query: AssyOrderPackageTypeQuery) => {
  return request.get<AssyOrderPackageTypeResponse>({
    url: '/assy/package_type',
    params: query
  })
}

export const getAssyOrderSupplierApi = (query: AssyOrderSupplierQuery) => {
  return request.get<AssyOrderSupplierResponse>({
    url: '/assy/supplier',
    params: query
  })
}
