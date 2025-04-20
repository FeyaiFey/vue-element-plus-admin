import request from '@/axios'
import type { GlobalReport, AxiosResponse, SopAnalyzeResponse } from './type'

export const getGlobalReportApi = () => {
  return request.get<GlobalReport>({
    url: '/report/global'
  })
}

export const exportGlobalReportApi = () => {
  return request.get<AxiosResponse>({
    url: '/report/global/export',
    responseType: 'blob',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export const getSopAnalyzeApi = () => {
  return request.get<SopAnalyzeResponse>({
    url: '/report/sop'
  })
}

export const exportSopReportApi = () => {
  return request.get<AxiosResponse>({
    url: '/report/sop/export',
    responseType: 'blob',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
