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
      type: 'category',
      data: []
    },
    yAxis: {
      type: 'value',
      minInterval: 1
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

    // 对数据进行降序排序
    const sortedData = [...levelData.data].sort((a, b) => b.value - a.value)

    // 数据转换为万元单位
    const convertedData = sortedData.map((item) => ({
      ...item,
      // 保留原始值用于比较和下钻
      originalValue: item.value,
      // 转换为万元
      value: +(item.value / 10000).toFixed(2)
    }))

    // 提取类别名称数组用于x轴（已排序后的）
    const categoryNames = convertedData.map((item) => item.name)

    // 检查是否为最后一层（没有子层级的数据）
    const isLastLevel = !convertedData.some((item) => item.childGroupId)

    const option: EChartsOption = {
      id: optionId,
      title: {
        text: `${optionId} 销售金额分析`,
        left: 'center'
      },
      grid: {
        left: '1%',
        right: '1%',
        bottom: '1%',
        top: '20%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: categoryNames,
        axisLabel: {
          interval: 0,
          // 只在最后一层旋转标签
          ...(isLastLevel
            ? {
                rotate: 15,
                align: 'right',
                verticalAlign: 'middle'
              }
            : {})
        },
        axisTick: {
          alignWithLabel: true
        }
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        name: '销售金额(万元)',
        nameTextStyle: {
          padding: [0, 0, 0, 30]
        }
      },
      tooltip: {
        trigger: 'axis',
        formatter: function (params: any) {
          const param = params[0]
          return `${param.name}: ${param.value} 万元`
        }
      },
      animationDurationUpdate: 500,
      series: {
        type: 'bar',
        dimensions: ['name', 'value', 'groupId', 'childGroupId', 'originalValue'],
        encode: {
          x: 'name',
          y: 'value',
          itemGroupId: 'groupId',
          itemChildGroupId: 'childGroupId'
        },
        data: convertedData,
        universalTransition: {
          enabled: true,
          divideShape: 'clone'
        },
        barWidth: '40%', // 限制柱子宽度为坐标轴的40%
        barMaxWidth: 50, // 设置柱子最大宽度为50px
        itemStyle: {
          color: function (params: any) {
            // 根据索引生成不同颜色
            const colorList = [
              '#5470c6',
              '#91cc75',
              '#fac858',
              '#ee6666',
              '#73c0de',
              '#3ba272',
              '#fc8452',
              '#9a60b4'
            ]
            return colorList[params.dataIndex % colorList.length]
          }
        },
        label: {
          show: true,
          position: 'top',
          formatter: function (params: any) {
            // 为第一名（最高值）添加王冠标记
            if (params.dataIndex === 0) {
              return '👑 ' + params.value
            }
            return params.value
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
