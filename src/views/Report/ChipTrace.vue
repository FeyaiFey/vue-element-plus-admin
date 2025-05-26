<script setup lang="ts">
import { ref, reactive } from 'vue'
import {
  ElTable,
  ElTableColumn,
  ElPagination,
  ElForm,
  ElRow,
  ElCol,
  ElFormItem,
  ElInput,
  ElCollapseTransition,
  ElButton,
  ElMessage,
  ElSkeleton
} from 'element-plus'
import { getChipInfoTraceApi, exportChipInfoTraceApi } from '@/api/report'
import type { ChipInfoTraceQuery, ChipInfoTrace } from '@/api/report/type'
import type { AxiosResponse } from '@/axios/types'
import { Icon } from '@/components/Icon'

defineOptions({
  name: 'ChipTrace'
})

// 折叠状态
const isCollapse = ref(true)

// 表单引用
const formRef = ref<InstanceType<typeof ElForm>>()

// 搜索参数
const searchParams = reactive<ChipInfoTraceQuery>({
  CHIP_LOT_CODE: '',
  WAFER_LOT_CODE: '',
  SUPPLIER: '',
  CHIP_NAME: '',
  WAFER_NAME: '',
  TESTING_PROGRAM_NAME: '',
  pageIndex: 1,
  pageSize: 20
})

// 表格数据
const loading = ref(false)
const dataList = ref<ChipInfoTrace[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

// 获取列表数据
const getList = async () => {
  // 检查是否有搜索参数
  const hasSearchParams = Object.values(searchParams).some(
    (value) => value && value.toString().trim() !== ''
  )

  if (!hasSearchParams) {
    ElMessage.warning('请输入至少一个搜索条件')
    return
  }

  try {
    loading.value = true
    const res = await getChipInfoTraceApi({
      pageIndex: currentPage.value,
      pageSize: pageSize.value,
      ...searchParams
    })
    dataList.value = res.data.list || []
    total.value = res.data.total || 0
  } catch (error) {
    console.error('获取数据失败:', error)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索方法
const handleSearch = () => {
  currentPage.value = 1
  getList()
}

// 重置方法
const handleReset = () => {
  formRef.value?.resetFields()
  // 设置默认参数
  searchParams.CHIP_LOT_CODE = ''
  searchParams.WAFER_LOT_CODE = ''
  searchParams.SUPPLIER = ''
  searchParams.CHIP_NAME = ''
  searchParams.WAFER_NAME = ''
  searchParams.TESTING_PROGRAM_NAME = ''
  // 重置后清空数据
  dataList.value = []
  total.value = 0
}

// 导出Excel
const handleExport = async () => {
  try {
    // 显示导出进度提示
    const loadingInstance = ElMessage({
      type: 'info',
      message: '正在导出数据，请稍候...',
      duration: 0,
      showClose: true
    })

    const res = (await exportChipInfoTraceApi({
      ...searchParams
    })) as unknown as AxiosResponse

    // 关闭加载提示
    loadingInstance.close()

    // 检查响应数据
    if (!res.data) {
      throw new Error('导出数据为空')
    }

    // 创建blob对象
    const blob = new Blob([res.data], { type: 'application/vnd.ms-excel' })

    // 获取文件名
    const disposition = res.headers?.['content-disposition']
    let filename = `packageOrders_${new Date().toLocaleDateString()}.xlsx`

    if (disposition) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
      const matches = filenameRegex.exec(disposition)
      if (matches?.[1]) {
        filename = decodeURIComponent(matches[1].replace(/['"]/g, ''))
      }
    }

    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()

    // 清理
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error(error instanceof Error ? error.message : '导出失败，请稍后重试')
  }
}

// 表格列配置接口
interface ColumnType {
  label: string
  prop: string
  align?: 'left' | 'center' | 'right'
  width?: number
  minWidth?: number
  showOverflowTooltip?: boolean
  hidden?: boolean // 是否隐藏列
  fixed?: boolean | 'left' | 'right'
  formatter?: (row: ChipInfoTrace) => any
}

// 表格列配置
const columns = ref<ColumnType[]>([
  { label: 'ID', prop: 'ID', align: 'center', width: 80 },
  { label: '订单号', prop: 'DOC_NO', align: 'center', width: 150, showOverflowTooltip: true },
  { label: '物料编码', prop: 'ITEM_CODE', align: 'center', width: 250, showOverflowTooltip: true },
  { label: '封装形式', prop: 'Z_PACKAGE_TYPE_NAME', align: 'center', width: 120 },
  { label: '打印批号', prop: 'LOT_CODE', align: 'center', width: 160, showOverflowTooltip: true },
  { label: '业务数量', prop: 'BUSINESS_QTY', align: 'center', width: 100 },
  { label: '收货数量', prop: 'RECEIPTED_PRICE_QTY', align: 'center', width: 100 },
  { label: '在制数量', prop: 'WIP_QTY', align: 'center', width: 100 },
  { label: '加工方式', prop: 'Z_PROCESSING_PURPOSE_NAME', align: 'center', width: 130 },
  { label: '成测程序', prop: 'Z_TESTING_PROGRAM_NAME', align: 'center', width: 130 },
  { label: '打线图号', prop: 'Z_ASSEMBLY_CODE', align: 'center', width: 130 },
  { label: '打线材料', prop: 'Z_WIRE_NAME', align: 'center', width: 130 },
  {
    label: '封装供应商',
    prop: 'SUPPLIER_FULL_NAME',
    align: 'left',
    width: 160
  },
  { label: '晶圆名称', prop: 'CHIP_CODE', align: 'center', width: 160, showOverflowTooltip: true },
  {
    label: '晶圆批号',
    prop: 'LOT_CODE_NAME',
    align: 'center',
    width: 160,
    showOverflowTooltip: true
  },
  { label: '晶圆Die数', prop: 'WAFER_QTY', align: 'center', width: 100 },
  { label: '片数', prop: 'S_QTY', align: 'center', width: 100 },
  { label: '晶圆ID', prop: 'WAFER_ID', align: 'center', width: 160 },
  { label: '测试流程', prop: 'PROGRESS_NAME', align: 'center', width: 150 },
  { label: '测试程序', prop: 'TESTING_PROGRAM_NAME', align: 'center', width: 150 },
  { label: '订单日期', prop: 'PURCHASE_DATE', align: 'center', width: 120 },
  { label: '到货日期', prop: 'FIRST_ARRIVAL_DATE', align: 'center', width: 120 },
  {
    label: 'CP供应商',
    prop: 'SUPPLIER',
    align: 'left',
    width: 160,
    fixed: 'right'
  }
])

// 选择项
const selection = ref<ChipInfoTrace[]>([])

// 选择变化
const handleSelectionChange = (val: ChipInfoTrace[]) => {
  selection.value = val
}

// 行样式方法
const tableRowClassName = () => {
  return ''
}

// 分页大小变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  getList()
}

// 页码变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  getList()
}
</script>

<template>
  <!-- 搜索表单 -->
  <ElForm ref="formRef" :model="searchParams" label-width="100px" class="search-form">
    <ElRow :gutter="20">
      <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
        <ElFormItem label="芯片批号">
          <ElInput
            v-model="searchParams.CHIP_LOT_CODE"
            placeholder="请输入芯片批号"
            clearable
            @keyup.enter="handleSearch"
          />
        </ElFormItem>
      </ElCol>
      <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
        <ElFormItem label="晶圆批号">
          <ElInput
            v-model="searchParams.WAFER_LOT_CODE"
            placeholder="请输入晶圆批号"
            clearable
            @keyup.enter="handleSearch"
          />
        </ElFormItem>
      </ElCol>
      <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
        <ElFormItem label="CP供应商">
          <ElInput
            v-model="searchParams.SUPPLIER"
            placeholder="请输入CP供应商"
            clearable
            @keyup.enter="handleSearch"
          />
        </ElFormItem>
      </ElCol>
    </ElRow>
    <ElCollapseTransition>
      <div v-show="!isCollapse">
        <ElRow :gutter="20">
          <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
            <ElFormItem label="芯片名称">
              <ElInput
                v-model="searchParams.CHIP_NAME"
                placeholder="请输入芯片名称"
                clearable
                @keyup.enter="handleSearch"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
            <ElFormItem label="晶圆名称">
              <ElInput
                v-model="searchParams.WAFER_NAME"
                placeholder="请输入晶圆名称"
                clearable
                @keyup.enter="handleSearch"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
            <ElFormItem label="测试程序">
              <ElInput
                v-model="searchParams.TESTING_PROGRAM_NAME"
                placeholder="请输入测试程序"
                clearable
                @keyup.enter="handleSearch"
              />
            </ElFormItem>
          </ElCol>
        </ElRow>
      </div>
    </ElCollapseTransition>
    <ElRow>
      <ElCol :span="24" class="search-buttons">
        <ElButton type="primary" @click="handleSearch">
          <Icon icon="vi-icon-park-outline:search" class="mr-2" />
          查询
        </ElButton>
        <ElButton @click="handleReset">重置</ElButton>
        <ElButton @click="handleExport">
          <Icon icon="vi-vscode-icons:file-type-excel" class="mr-2" />
          导出Excel
        </ElButton>
        <ElButton link class="collapse-button" @click="isCollapse = !isCollapse">
          <span class="collapse-text">{{ isCollapse ? '更多查询' : '收起' }}</span>
          <Icon
            :icon="isCollapse ? 'vi-ic:baseline-expand-more' : 'vi-ic:outline-expand-less'"
            :size="20"
            class="collapse-icon"
          />
        </ElButton>
      </ElCol>
    </ElRow>
  </ElForm>

  <!-- 表格区域 -->
  <div class="table-container">
    <ElSkeleton v-if="loading" :rows="20" animated class="table-skeleton" />
    <ElTable
      v-else
      v-loading="loading"
      :data="dataList"
      border
      class="w-full"
      :row-class-name="tableRowClassName"
      header-cell-class-name="table-header"
      @selection-change="handleSelectionChange"
      row-key="ID"
      height="calc(100vh - 280px)"
    >
      <ElTableColumn type="selection" width="50" align="center" fixed="left" />
      <template v-for="item in columns" :key="item.prop">
        <ElTableColumn
          v-if="!item.hidden"
          :prop="item.prop"
          :label="item.label"
          :width="item.width"
          :min-width="item.minWidth"
          :align="item.align || 'center'"
          :show-overflow-tooltip="item.showOverflowTooltip"
          :fixed="item.fixed"
        >
          <template v-if="item.formatter" #default="scope">
            {{ item.formatter(scope.row) }}
          </template>
        </ElTableColumn>
      </template>
    </ElTable>
  </div>

  <!-- 分页组件 -->
  <div class="pagination-wrapper">
    <div class="pagination-container">
      <ElPagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[50, 100, 200, 500]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
      <div class="summary-content">
        <div class="summary-left">
          <span class="summary-item">
            已选择: <span class="summary-value">{{ selection.length }}</span> 项
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.table-container {
  position: relative;
  width: 100%;
  min-height: calc(100vh - 280px);
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
}

.table-skeleton {
  height: 100%;
  padding: 20px;

  :deep(.el-skeleton__item) {
    height: 20px;
    margin-bottom: 16px;
  }
}

.table-wrapper {
  overflow: hidden;
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  flex: 1;
}

:deep(.el-table-v2__cell) {
  border-right: 1px solid var(--el-border-color-light);
  border-bottom: 1px solid var(--el-border-color-light);
}

.table-summary {
  display: flex;
  padding: 8px 12px;
  background-color: var(--el-color-primary-light-9);
  border: 1px solid var(--el-border-color-light);
  border-bottom: none;
  align-items: center;
  border-radius: 4px 4px 0 0;

  .summary-content {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
  }

  .summary-left {
    display: flex;
    gap: 32px;
    align-items: center;
  }

  .summary-item {
    display: flex;
    font-size: 13px;
    color: var(--el-text-color-regular);
    align-items: center;
    gap: 4px;

    .summary-value {
      font-weight: 600;
      color: var(--el-color-primary);
    }
  }

  .sort-form {
    display: inline-flex;
    align-items: center;
    gap: 8px;

    :deep(.el-select) {
      width: 120px;
    }
  }
}

.search-form {
  border-radius: 4px;

  :deep(.el-row) {
    margin-bottom: 0;
  }

  :deep(.el-date-editor.el-input) {
    width: 100%;
  }

  :deep(.el-collapse-transition) {
    overflow: hidden;
    transition: 0.3s height ease-in-out;
  }

  .search-buttons {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-bottom: 16px;

    .el-button {
      min-width: 120px;
    }

    .collapse-button {
      display: flex;
      height: 32px;
      min-width: auto;
      padding: 0 16px;
      transition: all 0.3s;
      align-items: center;
      gap: 4px;

      &:hover {
        opacity: 0.8;
      }

      .collapse-text {
        font-size: 14px;
        font-weight: 500;
        color: var(--el-color-primary);
      }

      .collapse-icon {
        color: var(--el-color-primary);
        transition: transform 0.3s;
      }
    }
  }
}

.pagination-wrapper {
  position: relative;
  width: 100%;
  height: 60px;
}

.pagination-container {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  padding: 10px 20px;
  background-color: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-light);
  justify-content: space-between;
  align-items: center;
}

.summary-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.summary-left {
  display: flex;
  gap: 32px;
  align-items: center;
}

.summary-item {
  display: flex;
  font-size: 13px;
  color: var(--el-text-color-regular);
  align-items: center;
  gap: 4px;

  .summary-value {
    font-weight: 600;
    color: var(--el-color-primary);
  }
}

.sort-form {
  display: inline-flex;
  align-items: center;
  gap: 8px;

  :deep(.el-select) {
    width: 120px;
  }
}

.custom-header {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 4px;
}

.header-row {
  display: flex;
  min-height: 20px;
  padding: 1px;
  align-items: center;
  justify-content: center;

  span {
    font-size: 13px;
    font-weight: 600;
    line-height: 1.2;
    color: var(--el-text-color-primary);
  }
}

.filter-row {
  width: 100%;
  padding: 0 2px 1px;

  .filter-input {
    width: 100%;

    :deep(.el-input__inner) {
      height: 22px;
      padding: 0 8px;
      font-size: 12px;
      line-height: 22px;
    }
  }
}

:deep(.table-header) {
  font-size: 16px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  text-align: center !important;
  background-color: var(--el-fill-color-light) !important;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

:deep(.el-table) {
  --el-table-header-bg-color: var(--el-fill-color-light);
  --el-table-row-hover-bg-color: var(--el-fill-color-light);

  .el-table__header {
    th {
      height: 40px;
      padding: 4px 0;
      font-weight: 600;
      color: var(--el-text-color-primary);
      background-color: var(--el-fill-color-light);
      border-bottom: 2px solid var(--el-border-color-lighter);
      transition: all 0.3s;

      &:hover {
        background-color: var(--el-fill-color);
      }
    }
  }

  .el-table__row {
    td {
      height: 40px;
      padding: 8px 0;
      transition: all 0.3s;
    }
  }

  .el-table__cell {
    .cell {
      line-height: 1.5;
    }
  }

  // 多选框选中行样式
  .el-table__row.is-selected {
    background-color: var(--el-color-primary-light-9) !important;

    td {
      font-weight: 500;
      color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9) !important;
    }
  }

  // 多选框选中行悬停样式
  .el-table__row.is-selected:hover {
    td {
      background-color: var(--el-color-primary-light-8) !important;
    }
  }
}
</style>
