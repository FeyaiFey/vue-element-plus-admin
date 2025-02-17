export interface AssyWipQuery {
  封装厂: string
  订单号: string
  预计交期: Date
}

export interface AssyWipItem {
  订单号: string
  封装厂: string
  当前工序: number
  预计交期: Date
  次日预计: number
  三日预计: number
  七日预计: number
  仓库库存: number
  扣留信息: string
  滞留天数: number
  在线合计: number
  研磨: number
  切割: number
  待装片: number
  装片: number
  银胶固化: number
  等离子清洗1: number
  键合: number
  三目检: number
  等离子清洗2: number
  塑封: number
  后固化: number
  回流焊: number
  电镀: number
  打印: number
  后切割: number
  切筋成型: number
  测编打印: number
  外观检: number
  包装: number
  待入库: number
  finished_at: Date
  modified_at: Date
}
