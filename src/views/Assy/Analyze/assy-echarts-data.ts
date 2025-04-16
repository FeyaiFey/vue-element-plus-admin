import { EChartsOption } from 'echarts'

// 封装形式选项
export const packageTypeOptions = [
  { label: 'SOP8_12R', value: 'SOP8_12R' },
  { label: 'SOP8', value: 'SOP8' },
  { label: 'DFN8', value: 'DFN8' },
  { label: 'SOP16_12R', value: 'SOP16_12R' },
  { label: 'SOP16', value: 'SOP16' },
  { label: 'SOP14_12R', value: 'SOP14_12R' },
  { label: 'SOP14', value: 'SOP14' },
  { label: 'TSSOP20', value: 'TSSOP20' },
  { label: 'SOT26', value: 'SOT26' },
  { label: 'SOT25_20R', value: 'SOT25_20R' },
  { label: 'SOT25_14R', value: 'SOT25_14R' },
  { label: 'SSOP24', value: 'SSOP24' },
  { label: 'ESSOP10', value: 'ESSOP10' },
  { label: 'QFN20', value: 'QFN20' },
  { label: 'LQFP32', value: 'LQFP32' }
]

// 时间范围选项
export const dateRangeOptions = [
  { label: '近1个月', value: '0' },
  { label: '近3个月', value: '1' },
  { label: '近6个月', value: '2' },
  { label: '近1年', value: '3' },
  { label: '近2年', value: '4' }
]

// 生成echarts配置
export const generateLineOptions = (data: any[], selectedPackageType: string): EChartsOption => {
  const dates = data.map((item) => item.Date)
  const values = data.map((item) => item[selectedPackageType])

  return {
    animationDuration: 2500,
    title: {
      text: 'Hisemi装片量',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const param = params[0]
        return `日期: ${param.name}<br/>${selectedPackageType}: ${param.value}`
      },
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    grid: {
      left: '3%',
      right: '6%',
      top: '28%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
      axisLabel: {
        formatter: (value: string) => value,
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '数量(pcs)',
      nameTextStyle: {
        padding: [0, 0, 0, 40]
      },
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: selectedPackageType,
        type: 'line',
        data: values,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#409EFF'
        },
        lineStyle: {
          width: 3
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(64, 158, 255, 0.3)'
              },
              {
                offset: 1,
                color: 'rgba(64, 158, 255, 0.1)'
              }
            ]
          }
        },
        markPoint: {
          symbolSize: 100,
          symbol: 'pin',
          itemStyle: {
            borderColor: '#fff',
            shadowColor: 'rgba(0, 0, 0, 0.2)',
            shadowBlur: 10
          },
          data: [
            {
              type: 'max',
              name: '最大值',
              itemStyle: {
                color: '#67C23A'
              }
            },
            {
              type: 'min',
              name: '最小值',
              itemStyle: {
                color: '#F56C6C'
              }
            }
          ],
          label: {
            formatter: '{b}\n{c}',
            color: '#fff',
            fontSize: 12,
            fontWeight: 'bold'
          }
        },
        markLine: {
          silent: true,
          symbol: ['none', 'none'],
          lineStyle: {
            width: 2,
            type: 'dashed'
          },
          data: [
            {
              type: 'average',
              name: '平均值',
              lineStyle: {
                color: '#E6A23C',
                type: 'dashed'
              },
              label: {
                position: 'end',
                distance: [10, 0],
                color: '#E6A23C',
                backgroundColor: 'rgba(230, 162, 60, 0.1)',
                padding: [4, 8],
                borderRadius: 4,
                fontSize: 12
              }
            }
          ]
        }
      }
    ]
  }
}

export const generateGaugeOptions = (value: number): EChartsOption => {
  return {
    animationDuration: 2500,
    tooltip: {
      formatter: '{a} <br/>{b} : {c}%'
    },
    series: [
      {
        name: 'Pressure',
        type: 'gauge',
        radius: '100%',
        center: ['50%', '60%'],
        progress: {
          show: true
        },
        detail: {
          valueAnimation: true,
          formatter: (value: number) => value.toFixed(2) + '%'
        },
        data: [
          {
            value: value,
            name: '本月到货达成率'
          }
        ]
      }
    ]
  }
}

export const generateYearTrendOptions = (data: any[]): EChartsOption => {
  // 所有封装形式
  const packageTypes = ['SOP8', 'SOP14', 'SOP16', 'DFN8', 'TSSOP20']

  // 创建数据集过滤器
  const datasetWithFilters: echarts.DatasetComponentOption[] = []
  const seriesList: echarts.SeriesOption[] = []

  packageTypes.forEach((packageType) => {
    const datasetId = `dataset_${packageType}`

    // 为每个封装类型创建过滤后的数据集
    datasetWithFilters.push({
      id: datasetId,
      fromDatasetId: 'dataset_raw',
      transform: {
        type: 'filter',
        config: {
          dimension: 'packageType',
          '=': packageType
        }
      }
    })

    // 为每个封装类型创建一个系列
    seriesList.push({
      type: 'line',
      datasetId: datasetId,
      name: packageType,
      smooth: true,
      showSymbol: false,
      endLabel: {
        show: true,
        formatter: function (params: any) {
          return params.data.packageType + ':' + params.data.qty
        }
      },
      labelLayout: {
        moveOverlap: 'shiftY'
      },
      emphasis: {
        focus: 'series'
      },
      encode: {
        x: 'year',
        y: 'qty',
        label: ['packageType', 'qty'],
        itemName: 'year',
        tooltip: ['qty']
      }
    })
  })

  return {
    animationDuration: 4000,
    dataset: [
      {
        id: 'dataset_raw',
        source: data
      },
      ...datasetWithFilters
    ],
    title: {
      text: '年封装量',
      left: 'center'
    },
    tooltip: {
      order: 'valueDesc',
      trigger: 'axis'
    },
    toolbox: {
      show: true,
      feature: {
        saveAsImage: {},
        dataView: {},
        brush: {},
        dataZoom: {},
        magicType: {
          type: ['line', 'bar']
        }
      }
    },
    legend: {
      data: packageTypes,
      top: 25,
      left: 'center'
    },
    grid: {
      top: 100,
      right: 100,
      bottom: 0,
      left: 10,
      containLabel: true
    },
    xAxis: {
      type: 'category'
    },
    yAxis: {
      type: 'value',
      name: '数量(百万)'
    },
    series: seriesList
  }
}

export const generateAssyExceedOptions = (value: number): EChartsOption => {
  // 根据数值范围确定颜色
  const getColor = (value: number) => {
    if (value <= 30) return '#67C23A' // 绿色
    if (value <= 60) return '#E6A23C' // 黄色
    return '#F56C6C' // 红色
  }

  const currentColor = getColor(value)

  return {
    animationDuration: 2500,
    tooltip: {
      formatter: '{a} <br/>{b} : {c}%'
    },
    series: [
      {
        name: '超期率',
        type: 'gauge',
        radius: '100%',
        center: ['50%', '60%'],
        min: 0,
        max: 100,
        axisLine: {
          lineStyle: {
            width: 18,
            color: [
              [0.3, '#67C23A'], // 0-30% 绿色
              [0.6, '#E6A23C'], // 30-60% 黄色
              [1, '#F56C6C'] // 60-100% 红色
            ]
          }
        },
        pointer: {
          itemStyle: {
            color: currentColor
          }
        },
        axisTick: {
          distance: -18,
          length: 8,
          lineStyle: {
            color: '#fff',
            width: 2
          }
        },
        splitLine: {
          distance: -18,
          length: 18,
          lineStyle: {
            color: '#fff',
            width: 3
          }
        },
        axisLabel: {
          color: 'inherit',
          distance: 25,
          fontSize: 14,
          formatter: function (value: number) {
            if (value === 0) return '优'
            if (value === 30) return '良'
            if (value === 60) return '差'
            return ''
          }
        },
        detail: {
          valueAnimation: true,
          formatter: (value: number) => value.toFixed(2) + '%',
          color: currentColor,
          fontSize: 20,
          fontWeight: 'bold'
        },
        data: [
          {
            value: value,
            name: '超期率',
            itemStyle: {
              color: currentColor
            }
          }
        ]
      }
    ]
  }
}

export const generateAssySupplyAnalyzeOptions = (data: any[]): EChartsOption => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return {
      title: {
        text: '暂无数据',
        left: 'center',
        top: 'center'
      }
    }
  }

  // 获取所有供应商
  const suppliers = [...new Set(data.map((item) => item.Supplier))]

  // 定义颜色数组
  const colors = [
    '#5470c6',
    '#91cc75',
    '#fac858',
    '#ee6666',
    '#73c0de',
    '#3ba272',
    '#fc8452',
    '#9a60b4',
    '#ea7ccc',
    '#1E88E5',
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#96CEB4',
    '#FFEEAD',
    '#D4A5A5',
    '#9B59B6',
    '#3498DB',
    '#E67E22',
    '#2ECC71',
    '#F1C40F',
    '#E74C3C',
    '#34495E',
    '#16A085',
    '#F39C12'
  ]

  // 计算最大封装类型数用于气泡大小计算
  const maxPackageTypeCount = Math.max(...data.map((item) => item.PackageTypeCount))

  // 计算气泡大小的函数
  const sizeFunction = (value: number) => {
    const maxSize = 100
    const minSize = 10
    return minSize + (value / maxPackageTypeCount) * (maxSize - minSize)
  }

  // 为每个供应商创建系列
  const series: echarts.ScatterSeriesOption[] = suppliers.map((supplier, index) => {
    const supplierData = data.filter((item) => item.Supplier === supplier)
    return {
      name: supplier,
      type: 'scatter',
      data: supplierData.map((item) => ({
        value: [item.DataRowCount, item.TotalOrderQty, item.PackageTypeCount],
        DataRowCount: item.DataRowCount,
        TotalOrderQty: item.TotalOrderQty,
        PackageTypeCount: item.PackageTypeCount
      })),
      symbolSize: (val) => sizeFunction(val[2]),
      itemStyle: {
        color: colors[index % colors.length]
      },
      emphasis: {
        focus: 'series',
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  })

  return {
    animationDuration: 2500,
    title: {
      text: '过去一年封装厂封装形式和订单量分析',
      left: 'center',
      top: '3%'
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `
          供应商: ${params.seriesName}<br/>
          订单数: ${params.data.DataRowCount}<br/>
          总订单量: ${params.data.TotalOrderQty}<br/>
          封装类型数: ${params.data.PackageTypeCount}
        `
      }
    },
    legend: {
      bottom: '0',
      left: 'center',
      data: suppliers
    },
    grid: {
      left: '1%',
      right: '4%',
      bottom: '20%',
      containLabel: true
    },
    xAxis: {
      type: 'log',
      name: '订单数',
      nameLocation: 'middle',
      nameGap: 30,
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    yAxis: {
      type: 'log',
      name: '总订单量',
      nameLocation: 'end',
      nameGap: 30,
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    series: series
  }
}
