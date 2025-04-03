import request from '@/axios'
import type {
  StockQuery,
  StockResponse,
  WaferIdQtyDetailQuery,
  WaferIdQtyDetailResponse,
  StockSummaryQuery,
  StockSummaryResponse
} from './types'
import { AxiosResponse } from 'axios'

export const getStockListApi = (query: StockQuery) => {
  return request.get<StockResponse>({
    url: '/stock/list',
    params: query
  })
}

export const getWaferIdQtyDetailApi = (query: WaferIdQtyDetailQuery) => {
  return request.get<WaferIdQtyDetailResponse>({
    url: '/stock/wafer_id_qty_detail',
    params: query
  })
}

export const getStockSummaryApi = (query: StockSummaryQuery) => {
  return request.get<StockSummaryResponse>({
    url: '/stock/summary',
    params: query
  })
}

export const exportStockListApi = (query: StockQuery) => {
  return request.get<AxiosResponse>({
    url: '/stock/export',
    params: query,
    responseType: 'blob',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
