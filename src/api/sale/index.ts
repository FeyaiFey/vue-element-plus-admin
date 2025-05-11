import request from '@/axios'
import type {
  SaleTableQuery,
  SaleTableResponse,
  SaleTargetCreate,
  SaleTargetUpdate,
  SaleTargetSummaryQuery,
  SaleTargetSummaryResponse,
  SaleTargetDetailQuery,
  SaleTargetDetailResponse,
  SaleAmountAnalyzeQuery,
  SaleAmountAnalyzeResponse,
  SaleAnalysisPannelResponse
} from './type'

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

export const getSaleTargetSummaryApi = (query: SaleTargetSummaryQuery) => {
  return request.get<SaleTargetSummaryResponse>({
    url: '/sale/target/summary',
    params: query
  })
}

export const getSaleTargetDetailApi = (query: SaleTargetDetailQuery) => {
  return request.get<SaleTargetDetailResponse>({
    url: '/sale/target/detail',
    params: query
  })
}

export const getSaleAmountAnalyzeApi = (query: SaleAmountAnalyzeQuery) => {
  return request.get<SaleAmountAnalyzeResponse>({
    url: '/sale/amount/analyze',
    params: query
  })
}

export const getSaleAnalysisPannelApi = () => {
  return request.get<SaleAnalysisPannelResponse>({
    url: '/sale/pannel'
  })
}
