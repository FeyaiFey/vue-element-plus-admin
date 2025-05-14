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
  SaleAnalysisPannelResponse,
  SaleForecastResponse,
  SaleAmountQuery,
  SaleAmountResponse,
  SaleAmountBarChartQuery,
  SaleAmountBarChartEChartsResponse
} from './type'

export const getSaleTableApi = (query: SaleTableQuery) => {
  return request.get<SaleTableResponse>({
    url: '/sale/target/table',
    params: query
  })
}

export const createSaleTargetApi = (data: SaleTargetCreate) => {
  return request.post<SaleTargetCreate>({
    url: '/sale/target/create',
    data
  })
}

export const updateSaleTargetApi = (data: SaleTargetUpdate) => {
  return request.put<SaleTargetUpdate>({
    url: '/sale/target/update',
    data
  })
}

export const deleteSaleTargetApi = (id: string) => {
  return request.delete<SaleTargetUpdate>({
    url: '/sale/target/delete',
    params: { id }
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

export const getSaleForecastApi = () => {
  return request.get<SaleForecastResponse>({
    url: '/sale/analyze/forecast'
  })
}

export const getSaleAmountSummaryApi = (query: SaleAmountQuery) => {
  return request.get<SaleAmountResponse>({
    url: '/sale/analyze/amount',
    params: query
  })
}

export const getSaleAmountBarChartApi = (query: SaleAmountBarChartQuery) => {
  return request.get<SaleAmountBarChartEChartsResponse>({
    url: '/sale/analyze/bar',
    params: query
  })
}
