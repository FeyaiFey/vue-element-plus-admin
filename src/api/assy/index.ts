import request from '@/axios'
import type {
  AssyOrderQuery,
  AssyOrderResponse,
  AxiosResponse,
  AssyWipQuery,
  AssyWipResponse,
  AssyOrderItemsQuery,
  AssyOrderItemsResponse,
  AssyOrderPackageTypeQuery,
  AssyOrderPackageTypeResponse,
  AssyOrderSupplierQuery,
  AssyOrderSupplierResponse,
  AssyBomQuery,
  AssyBomResponse,
  AssyAnalyzeTotalResponse,
  AssyAnalyzeLoadingResponse,
  AssyAnalyzeLoadingQuery,
  AssyYearTrendResponse,
  AssySupplyAnalyzeResponse,
  AssySubmitOrdersRequest,
  CpTestOrdersQuery,
  CpTestOrdersResponse,
  AssyRequireOrdersQuery,
  AssyRequireOrdersResponse,
  AssyRequireOrdersCancel
} from './type'

export const getAssyListApi = (query: AssyOrderQuery) => {
  return request.get<AssyOrderResponse>({
    url: '/assy/table',
    params: query
  })
}

export const getAssyBomApi = (query: AssyBomQuery) => {
  return request.get<AssyBomResponse>({
    url: '/assy/bom',
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

export const exportAssyListApi = (query: AssyOrderQuery) => {
  return request.get<AxiosResponse>({
    url: '/assy/export',
    params: query,
    responseType: 'blob',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export const getAssyAnalyzeTotalApi = () => {
  return request.get<AssyAnalyzeTotalResponse>({
    url: '/assy/analyze/total'
  })
}

export const getAssyAnalyzeLoadingApi = (query: AssyAnalyzeLoadingQuery) => {
  return request.get<AssyAnalyzeLoadingResponse>({
    url: '/assy/analyze/loading',
    params: query
  })
}

export const getAssyYearTrendApi = () => {
  return request.get<AssyYearTrendResponse>({
    url: '/assy/analyze/year-trend'
  })
}

export const getAssySupplyAnalyzeApi = () => {
  return request.get<AssySupplyAnalyzeResponse>({
    url: '/assy/analyze/supply'
  })
}

/**
 * 批量提交封装单
 * @param data 封装单数据列表
 * @returns 提交结果
 */

export const getAssyRequireOrdersApi = (query: AssyRequireOrdersQuery) => {
  return request.get<AssyRequireOrdersResponse>({
    url: '/assy/orders/table',
    params: query
  })
}

export const submitAssyRequireOrdersApi = (data: AssySubmitOrdersRequest) => {
  return request.post<IResponse>({
    url: '/assy/orders/batch',
    data
  })
}

export const cancelAssyRequireOrderApi = (data: AssyRequireOrdersCancel) => {
  return request.post<IResponse>({
    url: '/assy/orders/cancel',
    data
  })
}

export const deleteAssyRequireOrderApi = (data: AssyRequireOrdersCancel) => {
  return request.delete<IResponse>({
    url: '/assy/orders/delete',
    data
  })
}

export const exportAssyRequireOrdersApi = () => {
  return request.post<AxiosResponse>({
    url: '/assy/orders/export',
    responseType: 'blob',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export const getCpTestOrdersApi = (query: CpTestOrdersQuery) => {
  return request.get<CpTestOrdersResponse>({
    url: '/assy/cptest/table',
    params: query
  })
}

export const exportCpTestOrdersApi = (query: CpTestOrdersQuery) => {
  return request.get<AxiosResponse>({
    url: '/assy/cptest/export',
    params: query,
    responseType: 'blob',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
