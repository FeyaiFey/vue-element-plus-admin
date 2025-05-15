import { EChartsOption } from 'echarts'
import { SaleAmountBarChartEChartsResponse } from '@/api/sale/type'

export interface DrillDownDataItem {
  name: string
  value: number
  groupId: string
  childGroupId?: string
}

export interface DrillDownData {
  groupId: string
  data: DrillDownDataItem[]
}

export const generateBarChartOption = (_: SaleAmountBarChartEChartsResponse): EChartsOption => {
  const option: EChartsOption = {
    title: {
      text: '销售金额柱状图'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'value',
      minInterval: 1
    },
    yAxis: {
      type: 'category',
      data: []
    },
    series: [
      {
        type: 'bar',
        data: []
      }
    ]
  }

  return option
}

// 生成所有层级的图表选项
export const generateAllDrillDownOptions = (
  allLevelData: DrillDownData[]
): Record<string, EChartsOption> => {
  const allOptions: Record<string, EChartsOption> = {}

  allLevelData.forEach((levelData) => {
    const optionId = levelData.groupId

    // 对数据进行升序排序
    const sortedData = [...levelData.data].sort((a, b) => a.value - b.value)

    // 获取数据长度，用于后续标记最大值
    const dataLength = sortedData.length

    // 数据转换为百分比格式
    const convertedData = sortedData.map((item) => ({
      ...item,
      // 保留原始值用于比较和下钻
      originalValue: item.value,
      value: +item.value
    }))

    // 提取类别名称数组用于y轴（已排序后的）
    const categoryNames = convertedData.map((item) => item.name)

    const option: EChartsOption = {
      id: optionId,
      title: {
        text: `${optionId} 销售完成率柱状图`,
        subtext: '点击柱子下钻',
        left: 'center'
      },
      grid: {
        left: '3%',
        right: '10%',
        bottom: '3%',
        top: '20%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        name: '销售完成率(%)',
        axisLabel: {
          formatter: '{value}%'
        }
      },
      yAxis: {
        type: 'category',
        data: categoryNames,
        axisLabel: {
          interval: 0,
          // 调整标签显示
          formatter: function (value) {
            // 如果文本太长，截断并添加省略号
            if (value.length > 12) {
              return value.substring(0, 10) + '...'
            }
            return value
          }
        },
        axisTick: {
          alignWithLabel: true
        }
      },
      tooltip: {
        trigger: 'axis',
        formatter: function (params: any) {
          const param = params[0]
          return `${param.name}: ${param.value}%`
        },
        axisPointer: {
          type: 'shadow'
        }
      },
      animationDurationUpdate: 500,
      series: {
        type: 'bar',
        dimensions: ['name', 'value', 'groupId', 'childGroupId', 'originalValue'],
        encode: {
          x: 'value',
          y: 'name',
          itemGroupId: 'groupId',
          itemChildGroupId: 'childGroupId'
        },
        data: convertedData,
        universalTransition: {
          enabled: true,
          divideShape: 'clone'
        },
        barWidth: '60%', // 限制柱子宽度为坐标轴的40%
        barMaxWidth: 50, // 设置柱子最大宽度为50px
        itemStyle: {
          color: function (params: any) {
            // 根据值的大小设置颜色
            const value = params.data.value
            if (value >= 100) return '#67C23A' // 成功色
            if (value >= 90) return '#85ce61' // 浅成功色
            if (value >= 80) return '#95d475' // 较浅成功色
            if (value >= 70) return '#a0db87' // 更浅成功色
            if (value >= 60) return '#409EFF' // 主要色
            if (value >= 50) return '#66b1ff' // 浅主要色
            if (value >= 40) return '#E6A23C' // 警告色
            if (value >= 30) return '#ebb563' // 浅警告色
            if (value >= 20) return '#F56C6C' // 危险色
            if (value >= 10) return '#f78989' // 浅危险色
            return '#f9a7a7' // 更浅危险色
          }
        },
        label: {
          show: true,
          position: 'right',
          formatter: function (params: any) {
            // 为最高值添加王冠标记（由于数据是升序排序，最后一个是最大值）
            if (params.dataIndex === dataLength - 1) {
              return '👑 ' + params.value + '%'
            }
            return params.value + '%'
          },
          fontSize: 12,
          color: '#333'
        }
      }
    }

    allOptions[optionId] = option
  })

  return allOptions
}
