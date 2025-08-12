import request from '@/axios'
import {
  StockReportQuery,
  StockReportResponse,
  StockSummaryResponse,
  SopDataResponse,
  GlobalReportResponse,
  StockQuery,
  StockResponse,
  WaferIdQtyDetailQuery,
  WaferIdQtyDetailResponse
} from './types'

export const getStockReportListApi = (data: StockReportQuery) => {
  return request.get<StockReportResponse>({
    url: '/report/stock/list',
    params: data
  })
}

export const exportStockReportListApi = (data: StockReportQuery) => {
  return request.get<any>({
    url: '/report/stock/list/export',
    responseType: 'blob',
    params: data
  })
}

export const getStockSummaryListApi = (data: StockReportQuery) => {
  return request.get<StockSummaryResponse>({
    url: '/report/stock/summary',
    params: data
  })
}

export const getSopDataListApi = () => {
  return request.get<SopDataResponse>({
    url: '/report/sop/data'
  })
}

export const exportSopDataListApi = () => {
  return request.get<any>({
    url: '/report/sop/list/export',
    responseType: 'blob'
  })
}

export const getGlobalReportListApi = () => {
  return request.get<GlobalReportResponse>({
    url: '/report/global'
  })
}

export const exportGlobalReportListApi = () => {
  return request.get<any>({
    url: '/report/global/export',
    responseType: 'blob'
  })
}

// 旧版本库存报表
export const getStockListApi = (query: StockQuery) => {
  return request.get<StockResponse>({
    url: '/report/stock_old/list',
    params: query
  })
}

export const getWaferIdQtyDetailApi = (query: WaferIdQtyDetailQuery) => {
  return request.get<WaferIdQtyDetailResponse>({
    url: '/report/stock_old/wafer_id_qty_detail',
    params: query
  })
}

export const exportStockListApi = (query: StockQuery) => {
  return request.get<any>({
    url: '/report/stock_old/export',
    params: query,
    responseType: 'blob'
  })
}
