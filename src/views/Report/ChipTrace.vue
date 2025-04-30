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
  ElMessage
} from 'element-plus'
import { ContentWrap } from '@/components/ContentWrap'
import { getChipInfoTraceApi } from '@/api/report'
import type { ChipInfoTraceQuery, ChipInfoTrace } from '@/api/report/type'
import { Icon } from '@/components/Icon'

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
  { label: '芯片类型', prop: 'MAIN_CHIP', align: 'center', width: 100 },
  { label: '芯片编码', prop: 'CHIP_CODE', align: 'center', width: 160, showOverflowTooltip: true },
  {
    label: '批号名称',
    prop: 'LOT_CODE_NAME',
    align: 'center',
    width: 160,
    showOverflowTooltip: true
  },
  { label: '晶圆数量', prop: 'WAFER_QTY', align: 'center', width: 100 },
  { label: '测试数量', prop: 'S_QTY', align: 'center', width: 100 },
  { label: '晶圆ID', prop: 'WAFER_ID', align: 'center', width: 160, showOverflowTooltip: true },
  { label: '流程名称', prop: 'PROGRESS_NAME', align: 'center', width: 150 },
  { label: '测试程序', prop: 'TESTING_PROGRAM_NAME', align: 'center', width: 150 },
  { label: '订单日期', prop: 'PURCHASE_DATE', align: 'center', width: 120 },
  { label: '到货日期', prop: 'FIRST_ARRIVAL_DATE', align: 'center', width: 120 },
  {
    label: '供应商',
    prop: 'SUPPLIER',
    align: 'left',
    width: 160,
    showOverflowTooltip: true,
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
  <ContentWrap>
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
          <ElFormItem label="供应商">
            <ElInput
              v-model="searchParams.SUPPLIER"
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
          <ElButton link class="collapse-button" @click="isCollapse = !isCollapse">
            <span class="collapse-text">{{ isCollapse ? '展开' : '收起' }}</span>
            <Icon
              :icon="isCollapse ? 'vi-ic:baseline-expand-more' : 'vi-ic:outline-expand-less'"
              :size="20"
              class="collapse-icon"
            />
          </ElButton>
        </ElCol>
      </ElRow>
    </ElForm>

    <!-- 表格 -->
    <div class="mt-4">
      <ElTable
        v-loading="loading"
        :data="dataList"
        border
        class="w-full"
        :row-class-name="tableRowClassName"
        header-cell-class-name="table-header"
        @selection-change="handleSelectionChange"
        row-key="ID"
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
      <!-- 分页 -->
      <div class="flex justify-left mt-4">
        <ElPagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </ContentWrap>
</template>

<style lang="less" scoped>
:deep(.table-header) {
  font-size: 16px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  text-align: center !important;
  background-color: var(--el-fill-color-light) !important;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.search-form {
  padding: 20px;
  margin-bottom: 20px;
  background-color: var(--el-bg-color);
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
    margin-top: 16px;

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
</style>
