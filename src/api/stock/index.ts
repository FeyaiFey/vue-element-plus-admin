import request from '@/axios'
import type {
  StockQuery,
  StockResponse,
  WaferIdQtyDetailQuery,
  WaferIdQtyDetailResponse,
  StockSummaryQuery,
  StockSummaryResponse
} from './types'

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
