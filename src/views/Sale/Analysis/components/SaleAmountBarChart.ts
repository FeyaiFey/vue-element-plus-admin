import { EChartsOption } from 'echarts'
import type { SaleAnalysisBarChartDrillResponse } from '@/api/sale/types'

export interface DrillDownDataItem {
  name: string
  value: number
  quantity?: number
  groupId: string
  childGroupId?: string
  completeRateValue?: number
}

export interface DrillDownData {
  groupId: string
  data: DrillDownDataItem[]
}

export const generateBarChartOption = (_: SaleAnalysisBarChartDrillResponse): EChartsOption => {
  const option: EChartsOption = {
    title: {
      text: '销售额柱状图'
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
  allLevelData: DrillDownData[],
  metadata: any[]
): Record<string, EChartsOption> => {
  const allOptions: Record<string, EChartsOption> = {}

  allLevelData.forEach((levelData, index) => {
    const optionId = levelData.groupId
    const levelMetadata = metadata[index] || {}

    // console.log(`生成第${index}层图表配置:`, levelData)
    // console.log(`层级ID: ${optionId}`)

    // 检查是否为最后两层（没有子层级的数据或子层级是最后一层）
    const isLastLevel = !levelData.data.some((item) => item.childGroupId)

    // 计算层级深度，用于判断是否为倒数第二层
    // 将optionId的第7位字符转换为数字（假设optionId长度足够）
    const levelDepth = Number(optionId[6])

    // 如果是最后一层或倒数第二层，则显示数量
    const showQuantity = levelDepth >= 2

    // 数据转换 - 为ECharts准备数据
    const convertedData = levelData.data.map((item) => ({
      name: item.name,
      value: showQuantity
        ? +(item.quantity !== undefined ? item.quantity / 10000 : item.value).toFixed(2) // 销售量转换为万颗
        : +(item.value / 10000 || 0).toFixed(2), // 完成率保持原值
      // 保存原始数据用于下钻
      originalData: item
    }))

    // 对转换后的数据进行降序排序（基于最终的value值）
    const sortedConvertedData = [...convertedData].sort((a, b) => b.value - a.value)

    // 提取类别名称数组用于x轴（已排序后的）
    const categoryNames = sortedConvertedData.map((item) => item.name)

    // console.log(`第${index}层转换后的数据:`, convertedData)
    // console.log(`第${index}层类别名称:`, categoryNames)

    const option: EChartsOption = {
      id: optionId,
      title: {
        text: `${optionId.slice(8)} ${showQuantity ? '销售量' : '销售额'}柱状图`,
        subtext: '点击柱子下钻',
        left: 'center'
      },
      grid: {
        left: '1%',
        right: '1%',
        bottom: '5%',
        top: '20%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: categoryNames,
        name: levelMetadata.xAxisName || '类别',
        nameLocation: 'middle',
        nameTextStyle: {
          padding: [0, 0, 0, 0]
        },
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
        name: showQuantity ? '销售量(万颗)' : '销售额(万元)',
        nameTextStyle: {
          padding: [0, 0, 0, 30]
        }
      },
      tooltip: {
        trigger: 'axis',
        formatter: function (params: any) {
          const param = params[0]
          const unit = levelMetadata.yAxisUnit || (showQuantity ? '万颗' : '%')
          return `${param.name}: ${param.value} ${unit}`
        }
      },
      animationDurationUpdate: 500,
      series: {
        type: 'bar',
        data: sortedConvertedData,
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
            // 判断是否显示“万颗”或“%”后缀
            const suffix = showQuantity ? '万颗' : '万元'
            // 为第一名（最高值）添加王冠标记
            if (params.dataIndex === 0) {
              return '👑 ' + params.value + suffix
            }
            return params.value + suffix
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
