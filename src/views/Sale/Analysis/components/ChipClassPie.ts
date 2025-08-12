import { EChartsOption } from 'echarts'

// 生成空的饼图配置（用于清空图表内容）
export const getEmptyPieOptions = (): EChartsOption => {
  return {
    title: {
      text: '本月产品线销售额占比',
      left: 'center'
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
        center: ['70%', '60%'],
        data: [],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          show: false
        },
        labelLine: {
          show: false
        }
      }
    ]
  }
}

// 生成产品线销售额占比饼图选项
export const generateSaleProportionOptions = (data: any[]): EChartsOption => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return getEmptyPieOptions()
  }

  // 直接使用后端返回的数据，不需要再次汇总
  const pieData = data
    .map((item) => ({
      name: item.className,
      value: item.amount || 0
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)

  return {
    animationDuration: 2500,
    title: {
      text: '本月产品线销售额占比',
      left: 'center',
      top: '0%'
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
        center: ['70%', '60%'],
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
          lineHeight: 16,
          fontSize: 12
        },
        labelLine: {
          show: true
        }
      }
    ]
  }
}
