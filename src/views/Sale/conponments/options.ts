import type { EChartsOption } from 'echarts'
import type { SaleTargetDetail, SaleTargetSummary } from '@/api/sale/type'

export const getButterflyChartOption = (
  data: SaleTargetDetail[] | SaleTargetSummary[],
  type: 'detail' | 'summary'
): EChartsOption => {
  // 处理数据
  const processData = () => {
    if (type === 'detail') {
      return processDetailData(data as SaleTargetDetail[])
    } else {
      return processSummaryData(data as SaleTargetSummary[])
    }
  }

  const { categories, forecast, actual } = processData()

  // 将预测值转为负值
  const forecastNegative = forecast.map((value) => -value)

  return {
    title: {
      text: type === 'detail' ? '芯片销量预测vs实际' : '业务员销量预测vs实际',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any[]) => {
        const forecast = Math.abs(params[0].value)
        const actual = params[1].value
        return `${params[0].name}<br/>
                预测销量: ${forecast.toLocaleString()}<br/>
                实际销量: ${actual.toLocaleString()}<br/>
                完成率: ${((actual / forecast) * 100).toFixed(2)}%`
      }
    },
    legend: {
      data: ['预测销量', '实际销量'],
      top: 30
    },
    grid: {
      left: '3%',
      right: '3%',
      bottom: '3%',
      containLabel: true
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
      data: categories,
      axisLabel: {
        formatter: (value: string) => {
          // 如果文字太长，进行截断
          return value.length > 15 ? value.substring(0, 12) + '...' : value
        }
      }
    },
    series: [
      {
        name: '预测销量',
        type: 'bar',
        stack: 'Total',
        label: {
          show: true,
          position: 'right',
          formatter: (params: any) => Math.abs(params.value).toLocaleString()
        },
        itemStyle: {
          color: '#91cc75'
        },
        data: forecastNegative
      },
      {
        name: '实际销量',
        type: 'bar',
        stack: 'Total',
        label: {
          show: true,
          position: 'right',
          formatter: (params: any) => params.value.toLocaleString()
        },
        itemStyle: {
          color: '#5470c6'
        },
        data: actual
      }
    ]
  }
}

// 处理明细数据
const processDetailData = (data: SaleTargetDetail[]) => {
  return {
    categories: data.map((item) => item.ITEM_NAME),
    forecast: data.map((item) => item.FORECAST_QTY || 0),
    actual: data.map((item) => item.PRICE_QTY || 0)
  }
}

// 处理汇总数据
const processSummaryData = (data: SaleTargetSummary[]) => {
  return {
    categories: data.map((item) => `${item.EMPLOYEE_NAME} (${item.ADMIN_UNIT_NAME})`),
    forecast: data.map((item) => item.FORECAST_QTY || 0),
    actual: data.map((item) => item.PRICE_QTY || 0)
  }
}
