<script setup lang="ts">
import { ref, reactive, h, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { ContentWrap } from '@/components/ContentWrap'
import { Search } from '@/components/Search'
import { useTable } from '@/hooks/web/useTable'
import { Table } from '@/components/Table'
import { Dialog } from '@/components/Dialog'
import type { FormSchema } from '@/components/Form'
import { getStockListApi, getWaferIdQtyDetailApi } from '@/api/stock'
import type { Stock, StockQuery, WaferIdQtyDetail } from '@/api/stock/types'
import {
  getFeatureGroupNameApi,
  getItemCodeApi,
  getWarehouseNameApi,
  getTestingProgramApi,
  getBurningProgramApi
} from '@/api/params'
import Analyze from '@/views/Stock/Analyze.vue'

// 特征组选项
const featureGroupOptions = ref<Array<{ label: string; value: string }>>([])
const featureGroupLoading = ref(false)

// 远程搜索特征组
const handleFeatureGroupSearch = async (query: string) => {
  if (!query) {
    featureGroupOptions.value = []
    return
  }
  featureGroupLoading.value = true
  try {
    const res = await getFeatureGroupNameApi({ feature_group_name: query })
    featureGroupOptions.value = res.data.list.map((item) => ({
      label: item.label,
      value: item.value
    }))
  } catch (error) {
    console.error('获取特征组列表失败:', error)
  } finally {
    featureGroupLoading.value = false
  }
}

// 物料编码选项
const itemCodeOptions = ref<Array<{ label: string; value: string }>>([])
const itemCodeLoading = ref(false)

// 远程搜索物料编码
const handleItemCodeSearch = async (query: string) => {
  if (!query) {
    itemCodeOptions.value = []
    return
  }
  itemCodeLoading.value = true
  try {
    const res = await getItemCodeApi({ item_code: query })
    itemCodeOptions.value = res.data.list.map((item) => ({
      label: item.label,
      value: item.value
    }))
  } catch (error) {
    console.error('获取物料编码列表失败:', error)
  } finally {
    itemCodeLoading.value = false
  }
}

// 仓库选项
const warehouseOptions = ref<Array<{ label: string; value: string }>>([])
const warehouseLoading = ref(false)

// 远程搜索仓库
const handleWarehouseSearch = async (query: string) => {
  if (!query) {
    warehouseOptions.value = []
    return
  }
  warehouseLoading.value = true
  try {
    const res = await getWarehouseNameApi({ warehouse_name: query })
    warehouseOptions.value = res.data.list.map((item) => ({
      label: item.label,
      value: item.value
    }))
  } catch (error) {
    console.error('获取仓库列表失败:', error)
  } finally {
    warehouseLoading.value = false
  }
}

// 测试程序选项
const testingProgramOptions = ref<Array<{ label: string; value: string }>>([])
const testingProgramLoading = ref(false)

// 远程搜索测试程序
const handleTestingProgramSearch = async (query: string) => {
  if (!query) {
    testingProgramOptions.value = []
    return
  }
  testingProgramLoading.value = true
  try {
    const res = await getTestingProgramApi({ testing_program: query })
    testingProgramOptions.value = res.data.list.map((item) => ({
      label: item.label,
      value: item.value
    }))
  } catch (error) {
    console.error('获取测试程序列表失败:', error)
  } finally {
    testingProgramLoading.value = false
  }
}

// 烧录程序选项
const burningProgramOptions = ref<Array<{ label: string; value: string }>>([])
const burningProgramLoading = ref(false)

// 远程搜索烧录程序
const handleBurningProgramSearch = async (query: string) => {
  if (!query) {
    burningProgramOptions.value = []
    return
  }
  burningProgramLoading.value = true
  try {
    const res = await getBurningProgramApi({ burning_program: query })
    burningProgramOptions.value = res.data.list.map((item) => ({
      label: item.label,
      value: item.value
    }))
  } catch (error) {
    console.error('获取烧录程序列表失败:', error)
  } finally {
    burningProgramLoading.value = false
  }
}

// 添加表单引用
const formRef = ref()

// 查询表单配置
const schema = reactive<FormSchema[]>([
  {
    field: 'feature_group_name',
    label: '品号群组',
    component: 'Select',
    componentProps: {
      placeholder: '请输入品号群组搜索',
      clearable: true,
      multiple: true,
      filterable: true,
      remote: true,
      reserveKeyword: true,
      loading: featureGroupLoading,
      remoteMethod: handleFeatureGroupSearch,
      options: featureGroupOptions,
      collapseTags: true,
      collapseTagsTooltip: true
    },
    colProps: {
      span: 8
    }
  },
  {
    field: 'item_code',
    label: '物料编码',
    component: 'Select',
    componentProps: {
      placeholder: '请输入物料编码搜索',
      clearable: true,
      multiple: true,
      filterable: true,
      remote: true,
      reserveKeyword: true,
      loading: itemCodeLoading,
      remoteMethod: handleItemCodeSearch,
      options: itemCodeOptions,
      collapseTags: true,
      collapseTagsTooltip: true
    },
    colProps: {
      span: 8
    }
  },
  {
    field: 'item_name',
    label: '物料名称',
    component: 'Input',
    componentProps: {
      placeholder: '请输入物料名称模糊搜索',
      clearable: true,
      multiple: true,
      collapseTags: true,
      collapseTagsTooltip: true,
      onKeyup: (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          // 获取表单数据
          formRef.value?.getFormData().then((formData) => {
            setSearchParams(formData)
          })
        }
      }
    },
    colProps: {
      span: 8
    }
  },
  {
    field: 'warehouse_name',
    label: '仓库',
    component: 'Select',
    componentProps: {
      placeholder: '请输入仓库搜索',
      clearable: true,
      multiple: true,
      filterable: true,
      remote: true,
      reserveKeyword: true,
      loading: warehouseLoading,
      remoteMethod: handleWarehouseSearch,
      options: warehouseOptions,
      collapseTags: true,
      collapseTagsTooltip: true
    },
    colProps: {
      span: 8
    }
  },
  {
    field: 'testing_program',
    label: '测试程序',
    component: 'Select',
    componentProps: {
      placeholder: '请输入测试程序搜索',
      clearable: true,
      multiple: true,
      filterable: true,
      remote: true,
      reserveKeyword: true,
      loading: testingProgramLoading,
      remoteMethod: handleTestingProgramSearch,
      options: testingProgramOptions,
      collapseTags: true,
      collapseTagsTooltip: true
    },
    colProps: {
      span: 8
    }
  },
  {
    field: 'burning_program',
    label: '烧录程序',
    component: 'Select',
    componentProps: {
      placeholder: '请输入烧录程序搜索',
      clearable: true,
      multiple: true,
      filterable: true,
      remote: true,
      reserveKeyword: true,
      loading: burningProgramLoading,
      remoteMethod: handleBurningProgramSearch,
      options: burningProgramOptions,
      collapseTags: true,
      collapseTagsTooltip: true
    },
    colProps: {
      span: 8
    }
  }
])

// 定义展开字段和展开状态
const warehouse_name = ref('warehouse_name')

// 使用 table hook
const { tableState, tableMethods } = useTable({
  fetchDataApi: async () => {
    const res = await getStockListApi(searchParams.value)
    return {
      list: res.data.list
    }
  }
})

const { getList } = tableMethods
const { loading, dataList } = tableState

// 搜索参数
interface SearchParams extends StockQuery {
  enableSummary?: boolean
}

const searchParams = ref<SearchParams>({
  enableSummary: true // 设置初始值
})

// 搜索方法
const setSearchParams = (params: StockQuery) => {
  searchParams.value = {
    ...params,
    enableSummary: true
  }
  getList()
}

// Dialog 相关状态
const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogLoading = ref(false)
const dialogData = ref<WaferIdQtyDetail[]>([])

// 处理第二数量点击
const handleSecondQtyClick = async (row: Stock) => {
  if (row.SECOND_QTY > 0) {
    dialogTitle.value = `${row.LOT_CODE}  批次的第二数量明细`
    dialogVisible.value = true
    dialogLoading.value = true
    try {
      const res = await getWaferIdQtyDetailApi({
        item_code: row.ITEM_CODE,
        lot_code: row.LOT_CODE
      })
      dialogData.value = res.data.list
    } catch (error) {
      console.error('获取第二数量明细失败:', error)
      ElMessage.error('获取第二数量明细失败')
    } finally {
      dialogLoading.value = false
    }
  }
}

// 主表格选中项
const tableSelection = ref<Stock[]>([])

// 主表格选中项变化
const handleSelectionChange = (val: Stock[]) => {
  tableSelection.value = val
}

// 计算主表格选中项合计
const tableSummary = computed(() => {
  const summary = {
    INVENTORY_QTY: 0,
    SECOND_QTY: 0
  }
  tableSelection.value.forEach((item) => {
    summary.INVENTORY_QTY += item.INVENTORY_QTY
    summary.SECOND_QTY += item.SECOND_QTY
  })
  return summary
})

// 表格列配置
const columns = [
  {
    type: 'selection',
    width: 50,
    align: 'center' as const,
    field: 'selection'
  },
  {
    label: '品号群组',
    field: 'FEATURE_GROUP_NAME',
    align: 'center' as const,
    width: 120
  },
  {
    label: '物料编码',
    field: 'ITEM_CODE',
    align: 'center' as const,
    width: 250,
    showOverflowTooltip: true
  },
  {
    label: '物料名称',
    field: 'ITEM_NAME',
    align: 'center' as const,
    width: 180,
    showOverflowTooltip: true
  },
  {
    label: '批号',
    field: 'LOT_CODE',
    align: 'center' as const,
    width: 150,
    showOverflowTooltip: true
  },
  {
    label: '仓库',
    field: 'WAREHOUSE_NAME',
    align: 'center' as const,
    width: 180
  },
  {
    label: '库存数量',
    field: 'INVENTORY_QTY',
    align: 'center' as const,
    width: 100
  },
  {
    label: '第二数量',
    field: 'SECOND_QTY',
    align: 'center' as const,
    width: 100,
    formatter: (row: Stock) => {
      if (row.SECOND_QTY > 0) {
        return h(
          'span',
          {
            style: {
              color: 'var(--el-color-primary)',
              cursor: 'pointer',
              textDecoration: 'underline'
            },
            onClick: () => handleSecondQtyClick(row)
          },
          row.SECOND_QTY
        )
      }
      return row.SECOND_QTY
    }
  },
  {
    label: 'BIN等级',
    field: 'Z_BIN_LEVEL_NAME',
    align: 'center' as const,
    width: 100
  },
  {
    label: '测试程序',
    field: 'Z_TESTING_PROGRAM_NAME',
    align: 'center' as const,
    width: 150,
    showOverflowTooltip: true
  },
  {
    label: '烧录程序',
    field: 'Z_BURNING_PROGRAM_NAME',
    align: 'center' as const,
    showOverflowTooltip: true
  }
]

// Dialog表格选中项
const dialogSelection = ref<WaferIdQtyDetail[]>([])

// Dialog表格选中项变化
const handleDialogSelectionChange = (val: WaferIdQtyDetail[]) => {
  dialogSelection.value = val
}

// 计算选中项合计
const dialogSummary = computed(() => {
  const summary = {
    INVENTORY_QTY: 0,
    SECOND_QTY: 0
  }
  dialogSelection.value.forEach((item) => {
    summary.INVENTORY_QTY += item.INVENTORY_QTY
    summary.SECOND_QTY += item.SECOND_QTY
  })
  return summary
})

// Dialog表格列配置
const dialogColumns = [
  {
    type: 'selection',
    width: 50,
    align: 'center' as const,
    field: 'selection'
  },
  {
    label: '物料编码',
    field: 'ITEM_CODE',
    align: 'center' as const,
    width: 180,
    showOverflowTooltip: true
  },
  {
    label: '批号',
    field: 'LOT_CODE',
    align: 'center' as const,
    width: 150,
    showOverflowTooltip: true
  },
  {
    label: 'Wafer ID',
    field: 'WF_ID',
    align: 'center' as const,
    width: 100
  },
  {
    label: '库存数量',
    field: 'INVENTORY_QTY',
    align: 'center' as const,
    width: 100
  },
  {
    label: '第二数量',
    field: 'SECOND_QTY',
    align: 'center' as const,
    width: 100
  },
  {
    label: 'BIN等级',
    field: 'Z_BIN_LEVEL_NAME',
    align: 'center' as const,
    width: 150
  },
  {
    label: '测试程序',
    field: 'Z_TESTING_PROGRAM_NAME',
    align: 'center' as const,
    showOverflowTooltip: true
  },
  {
    label: '仓库',
    field: 'WAREHOUSE_NAME',
    align: 'center' as const,
    width: 200
  }
]

// 分析弹窗状态
const analyzeVisible = ref(false)

// 显示分析弹窗
const showAnalyze = () => {
  analyzeVisible.value = true
}
</script>

<template>
  <ContentWrap>
    <!-- 搜索表单 -->
    <Search
      ref="formRef"
      :schema="schema"
      @search="setSearchParams"
      @reset="setSearchParams"
      :is-col="true"
      :inline="false"
      label-width="100px"
      show-expand
      :expand-field="warehouse_name"
    />

    <!-- 表格区域 -->
    <div class="mt-4 table-container">
      <!-- 表格 -->
      <div class="table-wrapper">
        <!-- 选中项合计 -->
        <div class="table-summary">
          <div class="summary-content">
            <span class="summary-item">
              已选择: <span class="summary-value">{{ tableSelection.length }}</span> 项
            </span>
            <span class="summary-item">
              库存数量合计: <span class="summary-value">{{ tableSummary.INVENTORY_QTY }}</span>
            </span>
            <span class="summary-item">
              第二数量合计: <span class="summary-value">{{ tableSummary.SECOND_QTY }}</span>
            </span>
          </div>
        </div>

        <Table
          v-loading="loading"
          :columns="columns"
          :data="dataList"
          @selection-change="handleSelectionChange"
        />
      </div>
    </div>

    <!-- 第二数量明细弹窗 -->
    <Dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="70%"
      :top="'5vh'"
      :draggable="true"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="dialog-content">
        <div class="table-wrapper">
          <!-- 选中项合计 -->
          <div class="table-summary">
            <div class="summary-content">
              <span class="summary-item">
                已选择: <span class="summary-value">{{ dialogSelection.length }}</span> 项
              </span>
              <span class="summary-item">
                库存数量合计: <span class="summary-value">{{ dialogSummary.INVENTORY_QTY }}</span>
              </span>
              <span class="summary-item">
                第二数量合计: <span class="summary-value">{{ dialogSummary.SECOND_QTY }}</span>
              </span>
            </div>
          </div>

          <Table
            v-loading="dialogLoading"
            :columns="dialogColumns"
            :data="dialogData"
            @selection-change="handleDialogSelectionChange"
            height="calc(100vh - 250px)"
          />
        </div>
      </div>
    </Dialog>

    <!-- 添加分析按钮 -->
    <el-button
      type="primary"
      icon="el-icon-data-analysis"
      @click="showAnalyze"
      :disabled="!dataList.length"
    >
      数据分析
    </el-button>

    <!-- 分析弹窗 -->
    <Dialog
      v-model="analyzeVisible"
      title="库存数据分析"
      width="90%"
      :top="'5vh'"
      :draggable="true"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <Analyze :initial-params="searchParams" />
    </Dialog>
  </ContentWrap>
</template>

<style lang="less" scoped>
.table-container {
  display: flex;
  flex-direction: column;
}

.table-wrapper {
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
}

:deep(.el-table) {
  // 移除表格边框
  border: none !important;

  // 表头样式
  .el-table__header {
    th {
      font-weight: bold;
      color: var(--el-color-primary);
      text-align: center !important;
      background-color: var(--el-color-primary-light-9);
    }
  }

  // 表格内容居中
  .el-table__body {
    td {
      text-align: center !important;
    }
  }

  // 选择框居中
  .el-checkbox {
    display: flex;
    height: 100%;
    padding: 0;
    margin-right: 0;
    justify-content: center;
    align-items: center;
  }

  .el-table-column--selection .cell {
    display: flex;
    padding: 0;
    justify-content: center;
    align-items: center;
  }

  // 选中行样式
  .el-table__row.current-row,
  .el-table__row.hover-row,
  .el-table__row.selected {
    td {
      background-color: var(--el-color-primary-light-8) !important;
    }
  }

  // 鼠标悬停样式
  .el-table__row:hover {
    td {
      background-color: var(--el-color-primary-light-9) !important;
    }
  }
}

.table-summary {
  display: flex;
  padding: 8px 12px;
  background-color: var(--el-color-primary-light-9);
  border-bottom: 1px solid var(--el-border-color-light);
  align-items: center;

  .summary-content {
    display: flex;
    gap: 32px;
  }

  .summary-item {
    display: flex;
    font-size: 13px;
    color: var(--el-text-color-regular);
    align-items: center;
    gap: 4px;

    .summary-value {
      font-weight: 500;
      color: var(--el-color-primary);
    }
  }
}

// 可点击的第二数量样式
.clickable-qty {
  color: var(--el-color-primary);
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    color: var(--el-color-primary-dark-2);
  }
}

.dialog-content {
  display: flex;
  flex-direction: column;
}
</style>
