import type { EChartsOption } from 'echarts'
import type { SaleStockUpSummary, SaleStockUpDetail } from '@/api/sale/types'

// 排序字段类型
type SortField = 'completeRate' | 'forecastQty' | 'actualQty'
// 排序方向类型
type SortDirection = 'asc' | 'desc'

// 生成蝴蝶图配置
export const getButterflyChartOption = (
  data: SaleStockUpDetail[] | SaleStockUpSummary[],
  type: 'detail' | 'summary',
  sortField: SortField = 'forecastQty',
  sortDirection: SortDirection = 'asc'
): EChartsOption => {
  // 确保数据不为空
  if (!data || !Array.isArray(data) || data.length === 0) {
    return {
      title: {
        text: '暂无数据',
        left: 'center',
        top: '40%'
      }
    }
  }

  // 处理数据
  const { categories, forecast, actual } =
    type === 'detail'
      ? processDetailData(data as SaleStockUpDetail[], sortField, sortDirection)
      : processSummaryData(data as SaleStockUpSummary[], sortField, sortDirection)

  // 将预测值转为负值
  const forecastNegative = forecast.map((value) => -value)

  return {
    grid: {
      left: '1%',
      right: '6%',
      bottom: '1%',
      top: '5%',
      containLabel: true
    },
    toolbox: {
      feature: {
        saveAsImage: {},
        dataView: {
          readOnly: false
        }
      },
      left: '0',
      top: '0'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any[]) => {
        const forecast = Math.abs(params[0].value)
        const actual = params[1].value
        const percentage = ((actual / forecast) * 100).toFixed(2)
        const color = getColorByPercentage(parseFloat(percentage))
        return `${params[0].name}<br/>
                <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${params[0].color};"></span>预测销量: ${forecast.toLocaleString()}<br/>
                <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${params[1].color};"></span>实际销量: ${actual.toLocaleString()}<br/>
                <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${color};"></span>完成率: <span style="color:${color};font-weight:bold">${percentage}%</span>`
      }
    },
    legend: {
      data: ['预测销量', '实际销量'],
      top: 0,
      right: 0
    },
    xAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      },
      axisLabel: {
        formatter: (value: number) => Math.abs(value).toLocaleString()
      }
    },
    yAxis: {
      type: 'category',
      axisTick: { show: false },
      data: categories as string[],
      axisLabel: {
        formatter: (value: string) => {
          // 如果文字太长，进行截断
          return value.length > 15 ? value.substring(0, 12) + '...' : value
        },
        margin: 8,
        fontSize: 12
      }
    },
    series: [
      {
        name: '预测销量',
        type: 'bar',
        stack: 'Total',
        label: {
          show: true,
          position: 'inside',
          formatter: (params: any) => Math.abs(params.value).toLocaleString(),
          fontSize: 11
        },
        itemStyle: {
          color: '#91cc75'
        },
        barWidth: '60%',
        data: forecastNegative
      },
      {
        name: '实际销量',
        type: 'bar',
        stack: 'Total',
        label: {
          show: true,
          position: 'right',
          formatter: (params: any) => params.value.toLocaleString(),
          fontSize: 11
        },
        itemStyle: {
          color: '#5470c6'
        },
        barWidth: '60%',
        data: actual
      }
    ]
  }
}

// 获取完成率对应的颜色
const getColorByPercentage = (percentage: number): string => {
  if (percentage >= 100) return '#67C23A' // 成功色
  if (percentage >= 80) return '#95d475' // 浅成功色
  if (percentage >= 50) return '#409EFF' // 主要色
  if (percentage >= 30) return '#E6A23C' // 警告色
  return '#F56C6C' // 危险色
}

// 处理明细数据
const processDetailData = (
  data: SaleStockUpDetail[],
  sortField: SortField = 'forecastQty',
  sortDirection: SortDirection = 'asc'
) => {
  // 根据字段和方向排序
  const sortedData = [...data].sort((a, b) => {
    const valueA = a[sortField] ?? 0
    const valueB = b[sortField] ?? 0
    return sortDirection === 'asc' ? valueA - valueB : valueB - valueA
  })

  // 使用所有数据，不再限制条数
  return {
    categories: sortedData.map((item) => item.itemName),
    forecast: sortedData.map((item) => item.forecastQty || 0),
    actual: sortedData.map((item) => item.actualQty || 0)
  }
}

// 处理汇总数据
const processSummaryData = (
  data: SaleStockUpSummary[],
  sortField: SortField = 'forecastQty',
  sortDirection: SortDirection = 'asc'
) => {
  // 根据字段和方向排序
  const sortedData = [...data].sort((a, b) => {
    const valueA = a[sortField] ?? 0
    const valueB = b[sortField] ?? 0
    return sortDirection === 'asc' ? valueA - valueB : valueB - valueA
  })

  // 使用所有数据，不再限制条数
  return {
    categories: sortedData.map((item) => `${item.employeeName}`),
    forecast: sortedData.map((item) => item.forecastQty || 0),
    actual: sortedData.map((item) => item.actualQty || 0)
  }
}
