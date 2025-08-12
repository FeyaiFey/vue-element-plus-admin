import { EChartsOption } from 'echarts'
import { SaleInvoiceVsReceiptMonthlyChart } from '@/api/sale/types'

// 生成空的复合图配置（用于清空图表内容）
export const getEmptyChartOptions = (): EChartsOption => {
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['回款额', '开票额'],
      top: '10%'
    },
    xAxis: {
      type: 'category',
      data: [],
      axisLabel: {
        formatter: '{value}月'
      }
    },
    yAxis: {
      type: 'value',
      name: '金额（万元）',
      axisLabel: {
        formatter: '{value}'
      }
    },
    series: [
      {
        name: '回款额',
        type: 'bar',
        data: [],
        itemStyle: {
          color: '#409EFF'
        }
      },
      {
        name: '开票额',
        type: 'line',
        data: [],
        itemStyle: {
          color: '#67C23A'
        },
        lineStyle: {
          width: 3
        },
        symbol: 'circle',
        symbolSize: 8
      }
    ]
  }
}

// 生成月度开票额VS回款额复合图选项
export const generateInvoiceVsCollectionChartOptions = (
  data: SaleInvoiceVsReceiptMonthlyChart[]
): EChartsOption => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return getEmptyChartOptions()
  }

  // 按月份排序数据
  const sortedData = [...data].sort((a, b) => a.month - b.month)

  // 提取月份和金额数据
  const months = sortedData.map((item) => item.month)
  const collectionAmounts = sortedData.map((item) => (item.amountCollection || 0) / 10000) // 转换为万元
  const invoiceAmounts = sortedData.map((item) => (item.amountInvoice || 0) / 10000) // 转换为万元

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999'
        }
      },
      formatter: (params: any[]) => {
        let result = `${params[0].axisValue}月<br/>`
        params.forEach((param) => {
          const value = param.value ? param.value.toFixed(2) : '0.00'
          const color = param.color
          result += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${color};"></span>`
          result += `${param.seriesName}: ${value} 万元<br/>`
        })
        return result
      }
    },
    legend: {
      data: ['回款额', '开票额'],
      top: '10%',
      left: 'center'
    },
    grid: {
      left: '6%',
      right: '6%',
      bottom: '6%',
      top: '6%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: months,
      axisPointer: {
        type: 'shadow'
      },
      axisLabel: {
        formatter: '{value}月',
        fontSize: 12
      },
      name: '月份',
      nameLocation: 'middle',
      nameGap: 30
    },
    yAxis: {
      type: 'value',
      name: '金额（万元）',
      axisLabel: {
        formatter: '{value}',
        fontSize: 12
      },
      nameLocation: 'middle',
      nameGap: 40,
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
          color: '#E4E7ED'
        }
      }
    },
    series: [
      {
        name: '回款额',
        type: 'bar',
        data: collectionAmounts,
        itemStyle: {
          color: '#409EFF',
          borderRadius: [4, 4, 0, 0]
        },
        emphasis: {
          itemStyle: {
            color: '#337ECC'
          }
        },
        barWidth: '40%',
        label: {
          show: true,
          position: 'top',
          formatter: (params: any) => {
            return params.value > 0 ? params.value.toFixed(1) : ''
          },
          fontSize: 11,
          color: '#606266'
        }
      },
      {
        name: '开票额',
        type: 'line',
        data: invoiceAmounts,
        itemStyle: {
          color: '#67C23A'
        },
        lineStyle: {
          width: 3,
          color: '#67C23A'
        },
        symbol: 'emptyCircle',
        symbolSize: 6,
        emphasis: {
          itemStyle: {
            color: '#5DAF34'
          }
        },
        label: {
          show: true,
          position: 'top',
          formatter: (params: any) => {
            return params.value > 0 ? params.value.toFixed(1) : ''
          },
          fontSize: 11,
          color: '#606266'
        },
        connectNulls: true
      }
    ],
    animationDuration: 2000,
    animationEasing: 'cubicOut'
  }
}

// 生成响应式图表选项（移动端适配）
export const generateResponsiveChartOptions = (
  data: SaleInvoiceVsReceiptMonthlyChart[]
): EChartsOption => {
  const baseOptions = generateInvoiceVsCollectionChartOptions(data)

  // 移动端适配
  if (typeof window !== 'undefined' && window.innerWidth <= 768) {
    return {
      ...baseOptions,
      title: {
        ...baseOptions.title,
        textStyle: {
          fontSize: 14,
          fontWeight: 'bold'
        }
      },
      legend: {
        ...baseOptions.legend,
        top: '8%',
        left: 'center',
        itemWidth: 12,
        itemHeight: 8,
        textStyle: {
          fontSize: 11
        }
      },
      grid: {
        ...baseOptions.grid,
        top: '18%',
        left: '5%',
        right: '5%'
      },
      xAxis: {
        ...baseOptions.xAxis,
        axisLabel: {
          formatter: '{value}月',
          fontSize: 10
        }
      },
      yAxis: {
        ...baseOptions.yAxis,
        axisLabel: {
          formatter: '{value}',
          fontSize: 10
        }
      },
      series: [
        {
          ...baseOptions.series?.[0],
          label: {
            ...baseOptions.series?.[0]?.label,
            fontSize: 9
          }
        },
        {
          ...baseOptions.series?.[1],
          label: {
            ...baseOptions.series?.[1]?.label,
            fontSize: 9
          }
        }
      ]
    }
  }

  return baseOptions
}
