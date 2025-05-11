<script setup lang="ts">
import { ref } from 'vue'
import { ElTable, ElTableColumn } from 'element-plus'
import { getSaleTargetDetailApi } from '@/api/sale'
import type { SaleTargetDetailQuery, SaleTargetDetail } from '@/api/sale/type'

const props = defineProps<{
  queryParams: SaleTargetDetailQuery
}>()

// 表格数据
const tableData = ref<SaleTargetDetail[]>([])
const loading = ref(false)

// 获取数据
const getList = async () => {
  try {
    loading.value = true
    const res = await getSaleTargetDetailApi(props.queryParams)
    tableData.value = res.data.list || []
    // 默认按完成率降序排序
    tableData.value.sort((a, b) => (b.PERCENTAGE ?? 0) - (a.PERCENTAGE ?? 0))
  } catch (error) {
    console.error('获取销售目标明细数据失败:', error)
    tableData.value = []
  } finally {
    loading.value = false
  }
}

// 清空数据
const clearData = () => {
  tableData.value = []
}

// 获取完成率背景色
const getPercentageColor = (percentage: number): string => {
  if (percentage >= 100) return '#67C23A' // 成功色
  if (percentage >= 80) return '#95d475' // 浅成功色
  if (percentage >= 50) return '#409EFF' // 主要色
  if (percentage >= 30) return '#E6A23C' // 警告色
  return '#F56C6C' // 危险色
}

// 暴露方法给父组件
defineExpose({
  getList,
  tableData,
  clearData
})
</script>

<template>
  <ElTable v-loading="loading" :data="tableData" border style="width: 100%">
    <ElTableColumn prop="YEAR" label="年份" width="100" align="center" v-if="false" />
    <ElTableColumn prop="MONTH" label="月份" width="100" align="center" v-if="false" />
    <ElTableColumn
      prop="ADMIN_UNIT_NAME"
      label="行政单位"
      min-width="200"
      align="center"
      show-overflow-tooltip
      v-if="false"
    />
    <ElTableColumn
      prop="EMPLOYEE_NAME"
      label="业务员"
      min-width="120"
      align="center"
      show-overflow-tooltip
      v-if="false"
    />
    <ElTableColumn prop="SHORTCUT" label="类别" width="120" align="center" v-if="false" />
    <ElTableColumn
      prop="ITEM_NAME"
      label="芯片名称"
      min-width="180"
      align="center"
      show-overflow-tooltip
    />
    <ElTableColumn prop="FORECAST_QTY" label="预测销量" width="120" align="center">
      <template #default="{ row }">
        {{ row.FORECAST_QTY?.toLocaleString() ?? '-' }}
      </template>
    </ElTableColumn>
    <ElTableColumn prop="PRICE_QTY" label="实际销量" width="120" align="center">
      <template #default="{ row }">
        {{ row.PRICE_QTY?.toLocaleString() ?? '-' }}
      </template>
    </ElTableColumn>
    <ElTableColumn prop="PERCENTAGE" label="完成率" min-width="150" align="center" sortable>
      <template #default="{ row }">
        <div class="percentage-cell">
          <div
            class="percentage-bar"
            :style="{
              width: `${Math.min(row.PERCENTAGE ?? 0, 100)}%`,
              backgroundColor: getPercentageColor(row.PERCENTAGE ?? 0)
            }"
          ></div>
          <span class="percentage-text">{{ (row.PERCENTAGE ?? 0).toFixed(2) }}%</span>
        </div>
      </template>
    </ElTableColumn>
  </ElTable>
</template>

<style lang="less" scoped>
.percentage-cell {
  position: relative;
  width: 100%;
  height: 20px;
  overflow: hidden;
  background-color: #f5f7fa;
  border-radius: 3px;
}

.percentage-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  opacity: 0.4; // 增加透明度
  box-shadow: 0 0 4px rgb(0 0 0 / 10%);
  transition: all 0.3s ease;
}

.percentage-text {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  display: flex;
  width: 100%;
  height: 100%;
  font-weight: 600; // 增加字体粗细
  color: var(--el-text-color-primary);
  align-items: center;
  justify-content: center;
  text-shadow: 0 0 2px rgb(255 255 255 / 80%); // 添加文字阴影提高可读性
}
</style>
