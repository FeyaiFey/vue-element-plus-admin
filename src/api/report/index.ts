import request from '@/axios'
import type { GlobalReport, AxiosResponse } from './type'

export const getGlobalReportApi = () => {
  return request.get<GlobalReport>({
    url: '/report/global'
  })
}

export const exportGlobalReportApi = () => {
  return request.get<AxiosResponse>({
    url: '/report/global/export',
    responseType: 'blob'
  })
}
