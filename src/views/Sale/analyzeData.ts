import { EChartsOption } from 'echarts'

// 生成本月销售额仪表盘选项
export const generateSaleAmountMonthGaugeOptions = (value: number, rate: number): EChartsOption => {
  return {
    animationDuration: 2500,
    tooltip: {
      formatter: '本月销售额:' + value + '<br/>{a} <br/>{b} : {c}%'
    },
    series: [
      {
        name: '销售额',
        type: 'gauge',
        radius: '100%',
        center: ['50%', '60%'],
        progress: {
          show: true
        },
        detail: {
          valueAnimation: true,
          formatter: (rate: number) => rate.toFixed(2) + '%',
          fontSize: 20,
          fontWeight: 'bold',
          color:
            rate >= 100 ? '#67C23A' : rate >= 80 ? '#E6A23C' : rate >= 50 ? '#E6A23C' : '#F56C6C'
        },
        data: [
          {
            value: rate,
            name: '本月销售额完成率'
          }
        ]
      }
    ]
  }
}

// 生成今年销售额仪表盘选项
export const generateSaleAmountYearGaugeOptions = (value: number, rate: number): EChartsOption => {
  return {
    animationDuration: 2500,
    tooltip: {
      formatter: '{a}: ' + value.toLocaleString() + '<br/>{b} : {c}%'
    },
    series: [
      {
        name: '销售量',
        type: 'gauge',
        radius: '100%',
        center: ['50%', '60%'],
        progress: {
          show: true
        },
        detail: {
          valueAnimation: true,
          formatter: (rate: number) => rate.toFixed(2) + '%',
          fontSize: 20,
          fontWeight: 'bold',
          color:
            rate >= 100 ? '#67C23A' : rate >= 80 ? '#E6A23C' : rate >= 50 ? '#E6A23C' : '#F56C6C'
        },
        data: [
          {
            value: rate,
            name: '今年销售额完成率'
          }
        ]
      }
    ]
  }
}

// 生成产品线销售额占比饼图选项
export const generateSaleProportionOptions = (data: any[]): EChartsOption => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return {
      title: {
        text: '暂无数据',
        left: 'center',
        top: 'center'
      }
    }
  }

  // 直接使用后端返回的数据，不需要再次汇总
  const pieData = data
    .map((item) => ({
      name: item.SHORTCUT,
      value: item.AMOUNT || 0
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)

  return {
    animationDuration: 2500,
    title: {
      text: '本月产品线销售额占比',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const value = Number(params.value).toLocaleString()
        return `${params.name}<br/>销售额: ${value}<br/>占比: ${params.percent}%`
      }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      type: 'scroll'
    },
    series: [
      {
        name: '本月产品线销售额占比',
        type: 'pie',
        radius: '70%',
        center: ['60%', '60%'],
        data: pieData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          show: true,
          formatter: (params: any) => {
            const value = Number(params.value / 10000)
              .toFixed(2)
              .toLocaleString()
            return [params.name, `销售额: ${value} 万元`, `占比: ${params.percent}%`].join('\n')
          },
          position: 'outside',
          lineHeight: 18,
          fontSize: 12
        },
        labelLine: {
          show: true
        }
      }
    ]
  }
}

// 生成销售数据折线图
export const generateSaleDataLineChart = (data: any[]): EChartsOption => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return {
      title: {
        text: '暂无数据',
        left: 'center',
        top: 'center'
      }
    }
  }

  console.log('折线图原始数据:', data)

  // 处理字段名大小写问题的辅助函数
  const getField = (item: any, fieldName: string) => {
    const fieldNames = [
      fieldName.toUpperCase(),
      fieldName.toLowerCase(),
      fieldName.charAt(0).toUpperCase() + fieldName.slice(1).toLowerCase()
    ]

    for (const name of fieldNames) {
      if (item[name] !== undefined && item[name] !== null) {
        return item[name]
      }
    }
    return null
  }

  // 确定X轴类型（时间或分类）
  const xAxisType = 'category'
  let xAxisData: string[] = []

  // 判断是否按年月分组
  const hasYearMonth = data.some(
    (item) => getField(item, 'YEAR') !== null && getField(item, 'MONTH') !== null
  )

  // 确定分组字段和数据系列
  let groupFields: string[] = []

  // 添加可能的分组字段
  if (data.some((item) => getField(item, 'SHORTCUT') !== null)) {
    groupFields.push('SHORTCUT')
  }
  if (data.some((item) => getField(item, 'ITEM_NAME') !== null)) {
    groupFields.push('ITEM_NAME')
  }
  if (data.some((item) => getField(item, 'EMPLOYEE_NAME') !== null)) {
    groupFields.push('EMPLOYEE_NAME')
  }
  if (data.some((item) => getField(item, 'ADMIN_UNIT_NAME') !== null)) {
    groupFields.push('ADMIN_UNIT_NAME')
  }

  // 如果没有找到分组字段，则使用默认分组
  if (groupFields.length === 0) {
    groupFields = ['默认分组']
  }

  // 按主分组字段收集唯一值
  const primaryGroupField = groupFields[0]
  const groupValues: Record<string, boolean> = {}

  data.forEach((item) => {
    const groupValue = primaryGroupField === '默认分组' ? '全部' : getField(item, primaryGroupField)
    if (groupValue !== null) {
      groupValues[groupValue] = true
    }
  })

  const seriesNames = Object.keys(groupValues)
  console.log('系列名称:', seriesNames)

  // 处理X轴数据
  if (hasYearMonth) {
    // 按年月构建X轴
    const dateMap: Record<string, boolean> = {}

    data.forEach((item) => {
      const year = getField(item, 'YEAR')
      const month = getField(item, 'MONTH')

      if (year !== null && month !== null) {
        const dateKey = `${year}-${String(month).padStart(2, '0')}`
        dateMap[dateKey] = true
      }
    })

    xAxisData = Object.keys(dateMap).sort()
  } else {
    // 使用次要分组字段作为X轴
    const secondaryGroupField = groupFields.length > 1 ? groupFields[1] : null

    if (secondaryGroupField) {
      const categoryMap: Record<string, boolean> = {}

      data.forEach((item) => {
        const category = getField(item, secondaryGroupField)
        if (category !== null) {
          categoryMap[category] = true
        }
      })

      xAxisData = Object.keys(categoryMap).sort()
    } else {
      // 如果没有次要分组字段，使用默认X轴
      xAxisData = ['总计']
    }
  }

  console.log('X轴数据:', xAxisData)

  // 构建系列数据
  const series: any[] = []

  seriesNames.forEach((seriesName) => {
    const seriesData: number[] = []

    xAxisData.forEach((xValue) => {
      let value = 0

      if (hasYearMonth) {
        // 按年月汇总
        const [year, month] = xValue.split('-')

        data.forEach((item) => {
          const itemYear = getField(item, 'YEAR')
          const itemMonth = getField(item, 'MONTH')
          const itemGroup =
            primaryGroupField === '默认分组' ? '全部' : getField(item, primaryGroupField)
          const priceQty = Number(getField(item, 'AMOUNT') || 0)

          if (itemYear == Number(year) && itemMonth == Number(month) && itemGroup === seriesName) {
            value += priceQty
          }
        })
      } else {
        // 按分类汇总
        const secondaryGroupField = groupFields.length > 1 ? groupFields[1] : null

        if (secondaryGroupField) {
          data.forEach((item) => {
            const itemGroup =
              primaryGroupField === '默认分组' ? '全部' : getField(item, primaryGroupField)
            const itemCategory = getField(item, secondaryGroupField)
            const priceQty = Number(getField(item, 'AMOUNT') || 0)

            if (itemGroup === seriesName && itemCategory === xValue) {
              value += priceQty
            }
          })
        } else {
          // 如果没有次要分组，汇总所有数据
          data.forEach((item) => {
            const itemGroup =
              primaryGroupField === '默认分组' ? '全部' : getField(item, primaryGroupField)
            const priceQty = Number(getField(item, 'AMOUNT') || 0)

            if (itemGroup === seriesName) {
              value += priceQty
            }
          })
        }
      }

      seriesData.push(value)
    })

    // 计算系列总量，用于后续排序
    const seriesTotal = seriesData.reduce((sum, value) => sum + value, 0)

    // 确定是否显示数据标签（根据数据量和值大小决定）
    const showDataLabel = seriesData.length <= 12 && seriesTotal > 0

    series.push({
      name: seriesName,
      type: 'line',
      data: seriesData,
      symbol: 'circle',
      symbolSize: 6,
      emphasis: {
        focus: 'series'
      },
      // 添加数据标签
      label: {
        show: showDataLabel,
        position: 'top',
        formatter: (params: any) => {
          // 对于较大的数值使用千分位或百万位表示
          const value = params.value
          if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`
          } else if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}k`
          } else if (value === 0) {
            return '' // 不显示0值
          }
          return value.toString()
        },
        fontSize: 12,
        color: '#606266',
        textBorderColor: '#fff',
        textBorderWidth: 2
      },
      _total: seriesTotal // 用于排序的辅助字段
    })
  })

  // 按总量排序并限制显示前10个系列
  series.sort((a, b) => b._total - a._total)
  const topSeries = series.slice(0, 10).map((item) => {
    const { _total, ...rest } = item
    return rest
  })

  console.log('处理后的系列数据:', topSeries)

  // 确定Y轴标题
  let yAxisName = '销售额'
  if (data.some((item) => getField(item, 'AMOUNT') !== null)) {
    yAxisName = '销售金额'
  }

  // 确定图表标题
  let chartTitle = '销售额汇总分析'
  if (primaryGroupField !== '默认分组') {
    chartTitle = `按${
      primaryGroupField === 'SHORTCUT'
        ? '产品线'
        : primaryGroupField === 'ITEM_NAME'
          ? '芯片名称'
          : primaryGroupField === 'EMPLOYEE_NAME'
            ? '业务员'
            : primaryGroupField === 'ADMIN_UNIT_NAME'
              ? '销售团队'
              : '分类'
    }的销售数据分析`
  }

  return {
    title: {
      text: chartTitle,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any[]) => {
        const xValue = params[0].axisValue
        let result = `<div>${xValue}</div>`

        params.forEach((param) => {
          const value = Number(param.value).toLocaleString()
          result += `<div style="display:flex;align-items:center;">
            <span style="display:inline-block;margin-right:5px;width:10px;height:10px;border-radius:50%;background-color:${param.color};"></span>
            <span>${param.seriesName}: ${value}</span>
          </div>`
        })

        return result
      }
    },
    legend: {
      type: 'scroll',
      orient: 'horizontal',
      top: 30,
      right: 10,
      data: topSeries.map((item) => item.name)
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '80px',
      containLabel: true
    },
    toolbox: {
      feature: {
        saveAsImage: {},
        dataZoom: {},
        magicType: {
          type: ['line', 'bar', 'stack']
        }
      }
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        start: 0,
        end: 100
      }
    ],
    xAxis: {
      type: xAxisType,
      boundaryGap: false,
      data: xAxisData,
      axisLabel: {
        formatter: (value: string) => {
          if (hasYearMonth && value.includes('-')) {
            const [year, month] = value.split('-')
            return `${year}年${parseInt(month)}月`
          }
          return value
        },
        interval: 0,
        rotate: xAxisData.length > 12 ? 45 : 0
      }
    },
    yAxis: {
      type: 'value',
      name: yAxisName,
      axisLabel: {
        formatter: (value: number) => {
          if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`
          } else if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}k`
          }
          return value.toString()
        }
      }
    },
    series: topSeries
  }
}
