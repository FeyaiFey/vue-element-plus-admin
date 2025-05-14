import type { EChartsOption } from 'echarts'
import type { SaleAmountAnalyze } from '@/api/sale/type'

// 排序字段类型
type SortField = 'PERCENTAGE' | 'FORECAST_AMOUNT' | 'PRICE_AMOUNT'
// 排序方向类型
type SortDirection = 'asc' | 'desc'

// 生成蝴蝶图配置
export const getButterflyChartOption = (
  data: SaleAmountAnalyze[],
  sortField: SortField = 'FORECAST_AMOUNT',
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
  const { categories, forecast, actual } = processSummaryData(data, sortField, sortDirection)

  // 将预测值转为负值
  const forecastNegative = forecast.map((value) => -value)

  // 根据数据量调整柱子宽度和图表布局
  const barCount = categories.length
  const barWidth = calculateBarWidth(barCount)

  // 动态调整图表高度，确保每个柱子有足够的空间
  const gridHeight = Math.max(300, barCount * 30) // 每个柱子至少30px高

  return {
    grid: {
      left: '1%',
      right: '6%',
      bottom: '1%',
      top: '5%',
      containLabel: true,
      height: barCount > 10 ? `${gridHeight}px` : 'auto' // 当数据量大时，固定高度
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
      data: ['预测销售额', '实际销售额'],
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
      data: categories,
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
        name: '预测销售额',
        type: 'bar',
        stack: 'Total',
        label: {
          show: true,
          position: 'left',
          formatter: (params: any) => Math.abs(params.value).toLocaleString(),
          fontSize: 11
        },
        itemStyle: {
          color: '#91cc75'
        },
        barWidth: barWidth,
        barGap: '0%', // 柱间距离
        barCategoryGap: '20%', // 类目间柱形距离
        data: forecastNegative
      },
      {
        name: '实际销售额',
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
        barWidth: barWidth,
        barGap: '0%',
        barCategoryGap: '20%',
        data: actual
      }
    ]
  }
}

// 根据数据量计算合适的柱子宽度
const calculateBarWidth = (dataCount: number): number => {
  if (dataCount <= 5) return 30 // 数据少时，柱子宽一些
  if (dataCount <= 10) return 25
  if (dataCount <= 20) return 20
  return 15 // 数据量大时，柱子窄一些
}

// 获取完成率对应的颜色
const getColorByPercentage = (percentage: number): string => {
  if (percentage >= 100) return '#67C23A' // 成功色
  if (percentage >= 80) return '#95d475' // 浅成功色
  if (percentage >= 50) return '#409EFF' // 主要色
  if (percentage >= 30) return '#E6A23C' // 警告色
  return '#F56C6C' // 危险色
}

// 处理汇总数据
const processSummaryData = (
  data: SaleAmountAnalyze[],
  sortField: SortField = 'FORECAST_AMOUNT',
  sortDirection: SortDirection = 'asc'
) => {
  // 为了确保能够正确处理数据，我们需要先确认数据中是否包含所需字段
  // 如果不包含，则添加默认值
  const processedData = data.map((item) => ({
    ...item,
    FORECAST_AMOUNT: item.FORECAST_AMOUNT || 0,
    PRICE_AMOUNT: item.PRICE_AMOUNT || 0,
    PERCENTAGE: item.PERCENTAGE || 0
  }))

  // 根据字段和方向排序
  const sortedData = [...processedData].sort((a, b) => {
    const valueA = a[sortField] ?? 0
    const valueB = b[sortField] ?? 0
    return sortDirection === 'asc' ? valueA - valueB : valueB - valueA
  })

  // 动态生成分类标签
  const generateCategoryLabel = (item: SaleAmountAnalyze): string => {
    const parts: string[] = []

    // 添加年份
    if (item.YEAR) {
      parts.push(`${item.YEAR}年`)
    }

    // 添加月份
    if (item.MONTH) {
      parts.push(`${item.MONTH}月`)
    }

    // 添加销售团队
    if (item.ADMIN_UNIT_NAME) {
      parts.push(item.ADMIN_UNIT_NAME)
    }

    // 添加业务员
    if (item.EMPLOYEE_NAME) {
      parts.push(item.EMPLOYEE_NAME)
    }

    // 如果没有任何可用标签，使用默认值
    return parts.length > 0 ? parts.join('-') : '未知'
  }

  // 使用所有数据，不再限制条数
  return {
    categories: sortedData.map((item) => generateCategoryLabel(item)),
    forecast: sortedData.map((item) => item.FORECAST_AMOUNT || 0),
    actual: sortedData.map((item) => item.PRICE_AMOUNT || 0)
  }
}
