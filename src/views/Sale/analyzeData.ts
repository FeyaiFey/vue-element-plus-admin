import { EChartsOption } from 'echarts'

// 销售芯片类型选项
export const chipTypeOptions = [
  { label: '模拟芯片', value: '模拟芯片' },
  { label: '数字芯片', value: '数字芯片' },
  { label: '存储芯片', value: '存储芯片' },
  { label: '功率芯片', value: '功率芯片' },
  { label: '处理器', value: '处理器' }
]

// 时间范围选项
export const dateRangeOptions = [
  { label: '近1月', value: '0' },
  { label: '近3月', value: '1' },
  { label: '近6月', value: '2' },
  { label: '近1年', value: '3' }
]

// 生成销售额仪表盘选项
export const generateSaleAmountGaugeOptions = (value: number): EChartsOption => {
  return {
    animationDuration: 2500,
    tooltip: {
      formatter: '{a} <br/>{b} : {c}%'
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
          formatter: (value: number) => value.toFixed(2) + '%',
          fontSize: 20,
          fontWeight: 'bold',
          color: value >= 100 ? '#67C23A' : value >= 80 ? '#E6A23C' : '#F56C6C'
        },
        data: [
          {
            value: value,
            name: '销售额完成率'
          }
        ],
        axisLine: {
          lineStyle: {
            width: 20,
            color: [
              [0.8, '#F56C6C'],
              [1.0, '#E6A23C'],
              [1.2, '#67C23A']
            ]
          }
        },
        pointer: {
          itemStyle: {
            color: 'auto'
          }
        }
      }
    ]
  }
}

// 生成销售量仪表盘选项
export const generateSaleQtyGaugeOptions = (value: number): EChartsOption => {
  return {
    animationDuration: 2500,
    tooltip: {
      formatter: '{a} <br/>{b} : {c}%'
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
          formatter: (value: number) => value.toFixed(2) + '%',
          fontSize: 20,
          fontWeight: 'bold',
          color: value >= 100 ? '#67C23A' : value >= 80 ? '#E6A23C' : '#F56C6C'
        },
        data: [
          {
            value: value,
            name: '销售量完成率'
          }
        ],
        axisLine: {
          lineStyle: {
            width: 20,
            color: [
              [0.8, '#F56C6C'],
              [1.0, '#E6A23C'],
              [1.2, '#67C23A']
            ]
          }
        },
        pointer: {
          itemStyle: {
            color: 'auto'
          }
        }
      }
    ]
  }
}

// 生成销售趋势图选项
export const generateSaleTrendOptions = (data: any[], selectedChipType: string): EChartsOption => {
  const dates = data.map((item) => item.date)
  const values = data.map((item) => item[selectedChipType])

  return {
    animationDuration: 2500,
    title: {
      text: '销售趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const param = params[0]
        return `日期: ${param.name}<br/>${selectedChipType}: ${param.value}`
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
      name: '金额(元)',
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
        name: selectedChipType,
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

// 生成芯片销量占比饼图选项
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

  return {
    animationDuration: 2500,
    title: {
      text: '芯片销量占比',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'center'
    },
    series: [
      {
        name: '销量占比',
        type: 'pie',
        radius: '70%',
        center: ['60%', '50%'],
        data: data.map((item) => ({
          name: item.name,
          value: item.value
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          formatter: '{b}: {d}%'
        }
      }
    ]
  }
}

// 生成月度销售柱状图选项
export const generateMonthlySaleOptions = (data: any[]): EChartsOption => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return {
      title: {
        text: '暂无数据',
        left: 'center',
        top: 'center'
      }
    }
  }

  const months = data.map((item) => item.month)
  const amountData = data.map((item) => item.amount)
  const qtyData = data.map((item) => item.qty)

  return {
    animationDuration: 2500,
    title: {
      text: '月度销售数据',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['销售金额', '销售数量'],
      top: '10%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '20%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: months,
        axisTick: {
          alignWithLabel: true
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '金额',
        position: 'left',
        axisLabel: {
          formatter: '{value} 元'
        }
      },
      {
        type: 'value',
        name: '数量',
        position: 'right',
        axisLabel: {
          formatter: '{value} pcs'
        }
      }
    ],
    series: [
      {
        name: '销售金额',
        type: 'bar',
        yAxisIndex: 0,
        data: amountData,
        itemStyle: {
          color: '#5470c6'
        }
      },
      {
        name: '销售数量',
        type: 'bar',
        yAxisIndex: 1,
        data: qtyData,
        itemStyle: {
          color: '#91cc75'
        }
      }
    ]
  }
}
