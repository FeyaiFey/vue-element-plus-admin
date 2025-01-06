import { MockMethod } from 'vite-plugin-mock'
import Mock from 'mockjs'
import type { StockItem } from '@/api/stock/types'

// 生成品号群组数据
const featureGroups = [
  { value: 'CPU', label: 'CPU系列' },
  { value: 'RAM', label: '内存系列' },
  { value: 'SSD', label: '固态硬盘系列' },
  { value: 'HDD', label: '机械硬盘系列' },
  { value: 'GPU', label: '显卡系列' }
]

// 生成仓库数据
const warehouses = [
  { value: 'WH001', label: '原材料仓库A' },
  { value: 'WH002', label: '原材料仓库B' },
  { value: 'WH003', label: '芯片仓库A' },
  { value: 'WH004', label: '芯片仓库B' },
  { value: 'WH005', label: '成品仓库' }
]

// 生成品号和品名数据
const itemCodes = [
  { code: 'CPU001', name: 'Intel i9-13900K' },
  { code: 'CPU002', name: 'AMD R9-7950X' },
  { code: 'RAM001', name: 'DDR5 32GB' },
  { code: 'RAM002', name: 'DDR4 16GB' },
  { code: 'SSD001', name: 'Samsung 2TB NVMe' },
  { code: 'GPU001', name: 'RTX 4090' }
]

// 生成库存数据
const createStockData = (count: number): StockItem[] => {
  const data: StockItem[] = []
  for (let i = 0; i < count; i++) {
    const randomItem = itemCodes[Mock.Random.integer(0, itemCodes.length - 1)]
    const randomWarehouse = warehouses[Mock.Random.integer(0, warehouses.length - 1)]
    const randomGroup = featureGroups[Mock.Random.integer(0, featureGroups.length - 1)]

    data.push({
      ITEM_BUSINESS_ID: Mock.Random.guid(),
      SHORTCUT: Mock.Random.pick(['原料', '芯片', '半成品', '成品']),
      FEATURE_GROUP_NAME: randomGroup.label,
      ITEM_LOT_ID: Mock.Random.guid(),
      ITEM_CODE: randomItem.code,
      ITEM_NAME: randomItem.name,
      LOT_CODE: `LOT${Mock.Random.date('yyyyMMdd')}${Mock.Random.integer(1000, 9999)}`,
      BIN_LEVEL: Mock.Random.pick(['A', 'B', 'C', 'D']),
      Z_TESTING_PROGRAM_NAME: `TEST_${Mock.Random.word(5)}`,
      Z_BURNING_PROGRAM_CODE: `BURN_${Mock.Random.word(5)}`,
      INVENTORY_QTY: Mock.Random.integer(0, 1000),
      SECOND_QTY: Mock.Random.integer(0, 1000),
      WAREHOUSE_NAME: randomWarehouse.label,
      STOCK_AGE: Mock.Random.integer(1, 365)
    })
  }
  return data
}

export default [
  {
    url: '/mock/stock/list',
    method: 'post',
    response: ({ body }) => {
      const {
        itemCodes,
        itemNames,
        warehouses,
        featureGroups,
        lotCodes,
        shortcuts,
        showZeroStock
      } = body
      let data = createStockData(100)

      // 根据查询条件过滤数据
      if (itemCodes?.length) {
        data = data.filter((item) => itemCodes.includes(item.ITEM_CODE))
      }
      if (itemNames?.length) {
        data = data.filter((item) => itemNames.includes(item.ITEM_NAME))
      }
      if (warehouses?.length) {
        data = data.filter((item) => warehouses.includes(item.WAREHOUSE_NAME))
      }
      if (featureGroups?.length) {
        data = data.filter((item) => featureGroups.includes(item.FEATURE_GROUP_NAME))
      }
      if (lotCodes?.length) {
        data = data.filter((item) => lotCodes.includes(item.LOT_CODE))
      }
      if (shortcuts?.length) {
        data = data.filter((item) => shortcuts.includes(item.SHORTCUT))
      }
      if (showZeroStock === false) {
        data = data.filter((item) => item.INVENTORY_QTY > 0)
      }

      return {
        code: 0,
        message: 'ok',
        data
      }
    }
  },
  {
    url: '/mock/stock/itemCodes',
    method: 'get',
    response: () => {
      return {
        code: 0,
        message: 'ok',
        data: itemCodes.map((item) => ({
          value: item.code,
          label: `${item.code} - ${item.name}`
        }))
      }
    }
  },
  {
    url: '/mock/stock/itemNames',
    method: 'get',
    response: () => {
      return {
        code: 0,
        message: 'ok',
        data: itemCodes.map((item) => ({
          value: item.name,
          label: item.name
        }))
      }
    }
  },
  {
    url: '/mock/stock/warehouses',
    method: 'get',
    response: () => {
      return {
        code: 0,
        message: 'ok',
        data: warehouses
      }
    }
  },
  {
    url: '/mock/stock/featureGroups',
    method: 'get',
    response: () => {
      return {
        code: 0,
        message: 'ok',
        data: featureGroups
      }
    }
  }
] as MockMethod[]
