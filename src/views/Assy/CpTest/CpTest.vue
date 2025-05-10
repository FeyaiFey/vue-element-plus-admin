<script setup lang="tsx">
import { Icon } from '@/components/Icon'
import {
  ElTable,
  ElTableColumn,
  ElPagination,
  ElSelect,
  ElOption,
  ElForm,
  ElRow,
  ElCol,
  ElFormItem,
  ElInput,
  ElDatePicker,
  ElCollapseTransition,
  ElButton,
  ElMessage,
  ElSkeleton
} from 'element-plus'
import { getCpTestOrdersApi, exportCpTestOrdersApi } from '@/api/assy'
import { ref, reactive, onMounted, watch } from 'vue'
import type { CpTestOrdersQuery, CpTestOrders } from '@/api/assy/type'
import { AxiosResponse } from 'axios'

// 定义表格列类型
interface TableColumn {
  type?: string
  label?: string
  prop?: string
  align?: string
  width?: number
  fixed?: string
  hidden?: boolean
  headerCellClassName?: string
  showOverflowTooltip?: boolean
  tooltipEffect?: string
}

// 折叠状态
const isCollapse = ref(true)

// 搜索参数
const searchParams = reactive<CpTestOrdersQuery>({
  item_code: '',
  item_name: '',
  lot_name: '',
  status: undefined,
  doc_date_start: undefined,
  doc_date_end: undefined,
  supplier: '',
  progress_name: '',
  testing_program_name: ''
})

// 日期范围
const dateRange = ref<[string, string] | undefined>(undefined)

// 监听日期范围变化
watch(dateRange, (newVal) => {
  if (newVal) {
    searchParams.doc_date_start = newVal[0]
    searchParams.doc_date_end = newVal[1]
  } else {
    searchParams.doc_date_start = undefined
    searchParams.doc_date_end = undefined
  }
})

// 搜索表单
const formRef = ref<InstanceType<typeof ElForm>>()

// 表格数据
const dataList = ref<CpTestOrders[]>([])
const loading = ref(false)
const total = ref(0)

// 分页相关
const currentPage = ref(1)
const pageSize = ref(50)

// 获取数据
const getList = async () => {
  try {
    loading.value = true
    const res = await getCpTestOrdersApi({
      ...searchParams,
      pageIndex: currentPage.value,
      pageSize: pageSize.value
    })
    dataList.value = res.data.list
    total.value = res.data.total
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

// 处理分页变化
const handlePageChange = (page: number) => {
  currentPage.value = page
  getList()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  getList()
}

// 重置方法
const handleReset = () => {
  formRef.value?.resetFields()
  searchParams.item_code = ''
  searchParams.item_name = ''
  searchParams.lot_name = ''
  searchParams.status = undefined
  searchParams.doc_date_start = undefined
  searchParams.doc_date_end = undefined
  searchParams.supplier = ''
  searchParams.progress_name = ''
  searchParams.testing_program_name = ''
  dateRange.value = undefined
  handleSearch()
}

// 表格列配置
const columns: TableColumn[] = [
  {
    type: 'selection',
    width: 50,
    align: 'center',
    fixed: 'left'
  },
  { label: 'ID', prop: 'ID', align: 'center', width: 80 },
  { label: '品名', prop: 'ITEM_NAME', align: 'center', width: 160 },
  { label: '批号', prop: 'LOT_NAME', align: 'center', width: 160 },
  { label: '测试数量', prop: 'BUSINESS_QTY', align: 'center', width: 100 },
  { label: '完成数量', prop: 'RECEIPT_QTY', align: 'center', width: 100 },
  { label: '剩余数量', prop: 'WIP_QTY', align: 'center', width: 100 },
  { label: '测试流程', prop: 'PROGRESS_NAME', align: 'center', width: 260 },
  { label: '测试程序', prop: 'TESTING_PROGRAM_NAME', align: 'center', width: 260 },
  { label: '订单日期', prop: 'DOC_DATE', align: 'center', width: 120 },
  { label: '到货日期', prop: 'FIRST_ARRIVAL_DATE', align: 'center', width: 120 },
  {
    label: '供应商',
    prop: 'SUPPLIER',
    align: 'center',
    showOverflowTooltip: true,
    tooltipEffect: 'light',
    fixed: 'right'
  }
]

// 选择项
const selection = ref<CpTestOrders[]>([])

// 选择变化
const handleSelectionChange = (val: CpTestOrders[]) => {
  selection.value = val
}

// 计算合计
const getSummaries = () => {
  const sums = {
    BUSINESS_QTY: 0,
    RECEIPT_QTY: 0,
    WIP_QTY: 0
  }
  selection.value.forEach((item) => {
    sums.BUSINESS_QTY += Number(item.BUSINESS_QTY || 0)
    sums.RECEIPT_QTY += Number(item.RECEIPT_QTY || 0)
    sums.WIP_QTY += Number(item.WIP_QTY || 0)
  })
  return sums
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

    const res = (await exportCpTestOrdersApi({
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

// 初始化
onMounted(() => {
  getList()
})
</script>

<template>
  <!-- 搜索表单 -->
  <ElForm ref="formRef" :model="searchParams" label-width="100px" class="search-form">
    <ElRow :gutter="20">
      <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
        <ElFormItem label="品名">
          <ElInput
            v-model="searchParams.item_name"
            placeholder="请输入品名"
            clearable
            @keyup.enter="handleSearch"
          />
        </ElFormItem>
      </ElCol>
      <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
        <ElFormItem label="批号">
          <ElInput
            v-model="searchParams.lot_name"
            placeholder="请输入批号"
            clearable
            @keyup.enter="handleSearch"
          />
        </ElFormItem>
      </ElCol>
      <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
        <ElFormItem label="供应商">
          <ElInput
            v-model="searchParams.supplier"
            placeholder="请输入供应商"
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
            <ElFormItem label="状态">
              <ElSelect
                v-model="searchParams.status"
                placeholder="请选择状态"
                clearable
                @change="handleSearch"
              >
                <ElOption label="未完成" :value="0" />
                <ElOption label="已完成" :value="1" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
            <ElFormItem label="测试流程">
              <ElInput
                v-model="searchParams.progress_name"
                placeholder="请输入测试流程"
                clearable
                @keyup.enter="handleSearch"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
            <ElFormItem label="测试程序">
              <ElInput
                v-model="searchParams.testing_program_name"
                placeholder="请输入测试程序"
                clearable
                @keyup.enter="handleSearch"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
            <ElFormItem label="订单日期">
              <ElDatePicker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                @change="handleSearch"
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
      header-cell-class-name="table-header"
      @selection-change="handleSelectionChange"
      height="calc(100vh - 280px)"
    >
      <template v-for="item in columns" :key="item.prop || item.type">
        <ElTableColumn v-bind="item">
          <template #header v-if="item.label">
            <span :class="item.headerCellClassName || ''">{{ item.label }}</span>
          </template>
          <template #default="scope" v-if="!item.type && item.prop">
            {{ scope.row[item.prop as keyof CpTestOrders] }}
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
        @current-change="handlePageChange"
      />
      <div class="summary-content">
        <div class="summary-left">
          <span class="summary-item">
            已选择: <span class="summary-value">{{ selection.length }}</span> 项
          </span>
          <span class="summary-item">
            测试数量合计: <span class="summary-value">{{ getSummaries().BUSINESS_QTY }}</span>
          </span>
          <span class="summary-item">
            完成数量合计: <span class="summary-value">{{ getSummaries().RECEIPT_QTY }}</span>
          </span>
          <span class="summary-item">
            剩余数量合计: <span class="summary-value">{{ getSummaries().WIP_QTY }}</span>
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

.search-form {
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
