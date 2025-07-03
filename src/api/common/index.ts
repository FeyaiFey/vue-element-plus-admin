import request from '@/axios'
import { employeesQuery, employeesResponse, chipBomQuery, waferInfoResponse } from './types'

export const getEmployeesListApi = (data: employeesQuery) => {
  return request.get<employeesResponse>({
    url: '/common/employees/list',
    params: data
  })
}

export const getChipBomListApi = (data: chipBomQuery) => {
  return request.get<waferInfoResponse>({
    url: '/common/wafer/info',
    params: data
  })
}
