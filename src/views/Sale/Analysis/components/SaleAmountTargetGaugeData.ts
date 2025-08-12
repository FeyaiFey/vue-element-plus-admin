import { EChartsOption } from 'echarts'

// 生成本月销售额仪表盘选项
export const generateSaleAmountGaugeOptions = (
  type: 'month' | 'year',
  value: number,
  target: number,
  rate: number
): EChartsOption => {
  return {
    animationDuration: 2500,
    title: {
      text: `${type === 'month' ? '本月' : '今年'}销售额目标完成率`,
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold'
      },
      subtext:
        `${type === 'month' ? '本月' : '今年'}销售额: ${(value / 10000).toFixed(2)}万元` +
        ' ' +
        `${type === 'month' ? '本月' : '今年'}目标: ${(target / 10000).toFixed(2)}万元`,
      subtextStyle: {
        color: '#7ed3f4'
      },
      left: 'center'
    },
    tooltip: {
      formatter:
        `${type === 'month' ? '本月' : '今年'}销售额: ${(value / 10000).toFixed(2)}万元` +
        `<br/>${type === 'month' ? '本月' : '今年'}目标: ${(target / 10000).toFixed(2)}万元` +
        '<br/>{b} : {c}%'
    },
    series: [
      {
        name: '销售额',
        type: 'gauge',
        radius: '90%',
        center: ['50%', '60%'],
        progress: {
          show: true
        },
        detail: {
          valueAnimation: true,
          formatter: (rate: number) => `${rate.toFixed(2)}%`,
          fontSize: 20,
          fontWeight: 'bold',
          color:
            rate >= 100 ? '#67C23A' : rate >= 80 ? '#E6A23C' : rate >= 50 ? '#E6A23C' : '#F56C6C'
        },
        data: [
          {
            value: rate,
            name: '完成率'
          }
        ]
      }
    ]
  }
}
