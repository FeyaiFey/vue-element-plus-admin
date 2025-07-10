import request from '@/axios'
import { StockReportQuery, StockReportResponse, StockSummaryResponse } from './types'

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
