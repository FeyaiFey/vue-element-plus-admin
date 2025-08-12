<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useTable } from '@/hooks/web/useTable'
import { ElDrawer, ElSkeleton, ElSkeletonItem, ElMessage, ElButton } from 'element-plus'
import { Icon } from '@/components/Icon'
import ResizeDialog from '@/components/Dialog/src/ResizeDialog.vue'
import { useDesign } from '@/hooks/web/useDesign'
import SopTable from './components/SopTable.vue'
import ChipPackagingRequirementsForm from '@/views/ChipPackaging/ChipPackagingRequirements/components/ChipPackagingRequirementsForm.vue'
import ChipPackagingRequirementsTable from '@/views/ChipPackaging/ChipPackagingRequirements/components/ChipPackagingRequirementsTable.vue'
import SopPanelGroup from './components/PanelGroup.vue'
import Email from '@/views/Email/Email.vue'
import { sendEmailApi } from '@/api/email'
import { EmailSendRequest } from '@/api/email/types'
import { SopData } from '@/api/report/types'
import { ChipPackagingRequirementCreate, ChipPackagingRequirement } from '@/api/chipPackaging/types'
import { getSopDataListApi, exportSopDataListApi } from '@/api/report'
import {
  createChipPackagingRequirementApi,
  getChipPackagingRequirementListApi
} from '@/api/chipPackaging'

// 使用设计系统
const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('sop')

// 定义组件名称（用于keep-alive缓存）
defineOptions({
  name: 'Sop'
})

const unEmailNoticedClick = () => {
  unEmailNoticedDrawerVisible.value = true
}

export interface SopAnalysisPannel {
  rowCount: string
  sufficientCount: string
  insufficientCount: string
  selectedCount: string
}

const panelData = ref<SopAnalysisPannel>({
  rowCount: '0',
  sufficientCount: '0',
  insufficientCount: '0',
  selectedCount: '0'
})

// 表格相关状态
const { tableState, tableMethods } = useTable({
  immediate: true,
  fetchDataApi: async () => {
    const SopDataRes = await getSopDataListApi()
    const ChipPackagingRequirementRes = await getChipPackagingRequirementListApi({
      pageIndex: 1,
      pageSize: 10000,
      isEmailNoticed: '0'
    })
    panelData.value.selectedCount = ChipPackagingRequirementRes.data.list?.length.toString() || '0'
    unEmailNoticedFormData.value = ChipPackagingRequirementRes.data.list || []
    panelData.value.rowCount = SopDataRes.data.list?.length.toString() || '0'
    panelData.value.sufficientCount =
      SopDataRes.data.list
        ?.filter((item) => item.inventoryGapTotal && item.inventoryGapTotal >= 0)
        .length.toString() || '0'
    panelData.value.insufficientCount =
      SopDataRes.data.list
        ?.filter((item) => item.inventoryGapTotal && item.inventoryGapTotal < 0)
        .length.toString() || '0'
    return {
      list: SopDataRes.data.list || [],
      total: SopDataRes.data.list?.length || 0
    }
  }
})

const { dataList, loading } = tableState
const { getList } = tableMethods

// 新建需求相关状态
const createDialogVisible = ref(false)
const createLoading = ref(false)
const createFormData = ref<ChipPackagingRequirementCreate>({
  itemCode: '',
  itemName: '',
  abtr: '',
  businessQty: 1,
  requirementType: '',
  emergency: '',
  sales: '',
  remark: '',
  chipA: '',
  chipAQty: 0,
  chipB: '',
  chipBQty: 0
})

// 预填 itemName 状态（用于行内新建）
const prefilledItemName = ref('')

// 未邮件发送的封装需求
const unEmailNoticedDrawerVisible = ref(false)
const unEmailNoticedFormData = ref<ChipPackagingRequirement[]>([])

// 下载相关状态
const downloading = ref(false)

// 选中的行数据
const selectedRows = ref<SopData[]>([])

// 未邮件发送需求选中的行数据
const unEmailNoticedSelectedRows = ref<ChipPackagingRequirement[]>([])

// 邮件默认配置
// const emailDefaults = {
//   to: ['fanlm@h-sun.com'], // 默认收件人
//   cc: [
//     'liury@h-sun.com',
//     'lib@h-sun.com',
//     'zhengxm@h-sun.com',
//     'wangkf@h-sun.com',
//     'panyb@h-sun.com',
//     'wuz@h-sun.com',
//     'shenlj@h-sun.com',
//     'fangmr@h-sun.com',
//     'wxb1@h-sun.com',
//     'wanghq@h-sun.com'
//   ], // 默认抄送
//   subjectPrefix: '【封装需求通知】'
// }
const emailDefaults = {
  to: ['wxb1@h-sun.com'], // 默认收件人
  cc: ['wxb1@h-sun.com'], // 默认抄送
  subjectPrefix: '【封装需求通知】'
}

// 邮件发送相关状态
const emailDialogVisible = ref(false)
const emailSending = ref(false)
const emailInfo = ref({
  to: [] as string[],
  cc: [] as string[],
  subject: '',
  attachments: [] as any[]
})

// 刷新数据
const handleRefresh = async () => {
  try {
    await getList()
    ElMessage.success('数据已刷新')
  } catch (error) {
    console.error('刷新数据失败:', error)
    ElMessage.error('刷新数据失败')
  }
}

// 下载表格
const handleDownload = async () => {
  try {
    downloading.value = true
    ElMessage.info('正在生成Excel文件，请稍候...')

    const response = await exportSopDataListApi()

    // 获取文件名
    const disposition = (response as any).headers?.['content-disposition']
    let filename = `SOP数据表_${new Date().toLocaleDateString()}.xlsx`

    if (disposition) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
      const matches = filenameRegex.exec(disposition)
      if (matches?.[1]) {
        filename = decodeURIComponent(matches[1].replace(/['"]/g, ''))
      }
    }

    // 创建下载链接
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()

    // 清理
    setTimeout(() => {
      window.URL.revokeObjectURL(url)
    }, 100)

    ElMessage.success('下载成功')
  } catch (error: any) {
    ElMessage.error('下载失败: ' + (error.message || '未知错误'))
  } finally {
    downloading.value = false
  }
}

// 表格选择变化
const handleSelectionChange = (selection: SopData[]) => {
  selectedRows.value = selection
  panelData.value.selectedCount = selectedRows.value.length.toString() || '0'
}

// 未邮件发送需求表格选择变化
const handleUnEmailNoticedSelectionChange = (selection: ChipPackagingRequirement[]) => {
  unEmailNoticedSelectedRows.value = selection
}

// 处理新建按钮点击事件（行内新建）
const handleAddClick = (row: SopData) => {
  // 行内新建：预填行中的 itemName
  prefilledItemName.value = row.itemName || ''

  // 使用行数据预填表单
  const newFormData = {
    itemCode: '',
    itemName: row.itemName || '',
    abtr: '',
    businessQty: 1,
    requirementType: '0', // 默认安全库存
    emergency: '0', // 默认正常
    sales: '',
    remark: '',
    chipA: '',
    chipAQty: 0,
    chipB: '',
    chipBQty: 0
  }

  // 先设置数据，再打开对话框
  Object.assign(createFormData.value, newFormData)

  nextTick(() => {
    createDialogVisible.value = true
  })
}

// 新建需求提交
const handleCreateSubmit = async (formData: ChipPackagingRequirementCreate) => {
  try {
    createLoading.value = true
    await createChipPackagingRequirementApi(formData)

    ElMessage.success('基于SOP数据创建封装需求成功')
    createDialogVisible.value = false

    // 可选：刷新SOP数据以反映最新状态
    await getList()
  } catch (error: any) {
    console.error('创建封装需求失败:', error)
    ElMessage.error(error?.message || '创建封装需求失败，请重试')
  } finally {
    createLoading.value = false
  }
}

// 取消新建
const handleCreateCancel = () => {
  createDialogVisible.value = false
}

// 发送选中的邮件
const handleSendSelectedEmail = () => {
  if (unEmailNoticedSelectedRows.value.length === 0) {
    ElMessage.warning('请先选择要发送的需求')
    return
  }

  // 准备邮件信息，使用智能默认值
  emailInfo.value = {
    to: [...emailDefaults.to], // 去重的智能收件人
    cc: [...emailDefaults.cc], // 使用默认抄送
    subject: `${emailDefaults.subjectPrefix} ${unEmailNoticedSelectedRows.value.length}个需求- ${new Date().toLocaleDateString()}`,
    attachments: []
  }

  emailDialogVisible.value = true
}

// 发送全部邮件
const handleSendAllEmail = () => {
  if (unEmailNoticedFormData.value.length === 0) {
    ElMessage.warning('没有需要发送的需求')
    return
  }

  // 准备邮件信息，使用智能默认值
  emailInfo.value = {
    to: [...emailDefaults.to], // 去重的智能收件人
    cc: [...emailDefaults.cc], // 使用默认抄送
    subject: `${emailDefaults.subjectPrefix} ${unEmailNoticedFormData.value.length}个需求 - ${new Date().toLocaleDateString()}`,
    attachments: []
  }

  emailDialogVisible.value = true
}

// 处理邮件发送
const handleEmailSend = async () => {
  try {
    // 基本验证
    if (emailInfo.value.to.length === 0) {
      ElMessage.warning('请至少添加一个收件人')
      return
    }

    if (!emailInfo.value.subject.trim()) {
      ElMessage.warning('请输入邮件主题')
      return
    }

    emailSending.value = true

    // 确定要发送的需求数据
    const requirementsToSend =
      unEmailNoticedSelectedRows.value.length > 0
        ? unEmailNoticedSelectedRows.value
        : unEmailNoticedFormData.value

    // 获取需求ID列表
    const packagingRequirementsIds = requirementsToSend
      .map((item) => item.id)
      .filter((id): id is number => typeof id === 'number')

    if (packagingRequirementsIds.length === 0) {
      ElMessage.warning('没有有效的需求ID')
      return
    }

    // 调用邮件发送API
    const emailParams: EmailSendRequest = {
      to: emailInfo.value.to,
      cc: emailInfo.value.cc,
      bcc: [], // 添加必需的bcc字段
      subject: emailInfo.value.subject,
      attachments: emailInfo.value.attachments,
      packagingRequirementsIds
    }

    await sendEmailApi(emailParams)

    ElMessage.success('邮件发送成功')
    emailDialogVisible.value = false
    unEmailNoticedDrawerVisible.value = false

    // 刷新数据以更新邮件发送状态
    await getList()

    // 清空选中状态
    unEmailNoticedSelectedRows.value = []
  } catch (error: any) {
    console.error('邮件发送失败:', error)
    ElMessage.error(error?.message || '邮件发送失败，请重试')
  } finally {
    emailSending.value = false
  }
}

// 添加附件
const handleAddAttachment = (file: File) => {
  // 将文件转换为base64或其他需要的格式
  const reader = new FileReader()
  reader.onload = () => {
    emailInfo.value.attachments.push({
      filename: file.name,
      content: reader.result as string,
      content_type: file.type
    })
  }
  reader.readAsDataURL(file)
}

// 移除附件
const handleRemoveAttachment = (index: number) => {
  emailInfo.value.attachments.splice(index, 1)
}

// 重置邮件信息到默认值
const resetEmailInfo = () => {
  emailInfo.value = {
    to: [],
    cc: [],
    subject: '',
    attachments: []
  }
}

// 监听邮件对话框关闭，重置表单
watch(emailDialogVisible, (newValue) => {
  if (!newValue) {
    // 对话框关闭时，重置邮件信息
    nextTick(() => {
      resetEmailInfo()
    })
  }
})

// 监听新建对话框关闭，重置表单
watch(createDialogVisible, (newValue) => {
  if (!newValue) {
    // 对话框关闭时，重置表单数据和预填状态
    nextTick(() => {
      prefilledItemName.value = ''
      const resetData = {
        itemCode: '',
        itemName: '',
        abtr: '',
        businessQty: 1,
        requirementType: '',
        emergency: '',
        sales: '',
        remark: '',
        chipA: '',
        chipAQty: 0,
        chipB: '',
        chipBQty: 0
      }
      Object.assign(createFormData.value, resetData)
    })
  }
})
</script>

<template>
  <div :class="prefixCls">
    <!-- 操作栏 -->
    <div :class="`${prefixCls}__header`" class="mb-4">
      <div class="flex justify-between items-center">
        <div class="flex-1">
          <h2 class="text-xl font-bold text-gray-800 dark:text-gray-200">SOP库存计划</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            基于安全库存、销量和现有库存的综合分析，识别库存缺口并提供创建封装需求并邮件发送的功能。
          </p>
        </div>
        <div class="items-center gap-3">
          <!-- 刷新按钮 -->
          <ElButton @click="handleRefresh" :loading="loading" style="max-width: 100px">
            <Icon icon="vi-ep:refresh" class="mr-2" />
            刷新数据
          </ElButton>

          <!-- 下载按钮 -->
          <ElButton
            @click="handleDownload"
            :loading="downloading"
            :disabled="downloading || dataList.length === 0"
            style="max-width: 100px"
          >
            <Icon v-if="!downloading" icon="vi-vscode-icons:file-type-excel" class="mr-2" />
            {{ downloading ? '导出中...' : '下载表格' }}
          </ElButton>
        </div>
      </div>
    </div>

    <SopPanelGroup
      :panel-data="panelData"
      :loading="loading"
      @un-email-noticed-click="unEmailNoticedClick"
    />

    <!-- 表格区域 -->
    <div :class="`${prefixCls}__table`" class="flex-1">
      <ElSkeleton :loading="loading" animated>
        <template #template>
          <div class="bg-white dark:bg-gray-800 rounded-lg border">
            <!-- 表头骨架 -->
            <div class="border-b p-4 bg-gray-50 dark:bg-gray-700">
              <div class="grid grid-cols-6 gap-4">
                <ElSkeletonItem variant="text" style="width: 60%" />
                <ElSkeletonItem variant="text" style="width: 70%" />
                <ElSkeletonItem variant="text" style="width: 80%" />
                <ElSkeletonItem variant="text" style="width: 90%" />
                <ElSkeletonItem variant="text" style="width: 85%" />
                <ElSkeletonItem variant="text" style="width: 75%" />
              </div>
            </div>

            <!-- 表格行骨架 -->
            <div class="p-4 space-y-3">
              <div v-for="n in 15" :key="n" class="grid grid-cols-6 gap-4 py-2">
                <ElSkeletonItem variant="text" style="width: 80%" />
                <ElSkeletonItem variant="text" style="width: 60%" />
                <ElSkeletonItem variant="text" style="width: 90%" />
                <ElSkeletonItem variant="text" style="width: 70%" />
                <ElSkeletonItem variant="text" style="width: 85%" />
                <ElSkeletonItem variant="text" style="width: 65%" />
              </div>
            </div>
          </div>
        </template>

        <template #default>
          <SopTable
            :table-data="dataList"
            :enable-selection="true"
            table-height="calc(100vh - 240px)"
            @selection-change="handleSelectionChange"
            @add-click="handleAddClick"
          />
        </template>
      </ElSkeleton>
    </div>

    <!-- 新建封装需求抽屉 -->
    <ElDrawer
      v-model="createDialogVisible"
      title="基于SOP创建封装需求"
      size="400px"
      direction="rtl"
      class="create-requirement-drawer"
    >
      <div class="p-4 h-full">
        <div
          class="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
        >
          <div class="flex items-center">
            <Icon icon="vi-ep:info" class="text-blue-600 mr-2" />
            <span class="text-sm text-blue-800 dark:text-blue-200">
              将根据SOP数据自动填入品名，请完善其他必要信息
            </span>
          </div>
        </div>

        <ChipPackagingRequirementsForm
          v-model="createFormData"
          :loading="createLoading"
          :prefilled-item-name="prefilledItemName"
          @submit="handleCreateSubmit"
          @cancel="handleCreateCancel"
        />
      </div>
    </ElDrawer>

    <ElDrawer
      v-model="unEmailNoticedDrawerVisible"
      title="未邮件发送的封装需求"
      size="80vw"
      direction="rtl"
    >
      <div class="flex justify-end gap-1 mb-2">
        <ElButton
          v-if="unEmailNoticedSelectedRows.length > 0"
          type="primary"
          plain
          @click="handleSendSelectedEmail"
          style="max-width: 150px"
        >
          <Icon icon="vi-teenyicons:send-outline" class="mr-2" />
          发送选中（{{ unEmailNoticedSelectedRows.length }}）
        </ElButton>
        <ElButton type="primary" plain @click="handleSendAllEmail" style="max-width: 150px">
          <Icon icon="vi-teenyicons:send-outline" class="mr-2" />
          发送全部
        </ElButton>
      </div>
      <ChipPackagingRequirementsTable
        :table-data="unEmailNoticedFormData"
        :table-type="'summary'"
        :enable-selection="true"
        @selection-change="handleUnEmailNoticedSelectionChange"
      />
    </ElDrawer>
  </div>
  <ResizeDialog
    title="邮件发送"
    :model-value="emailDialogVisible"
    @update:model-value="emailDialogVisible = false"
    :init-height="500"
    width="800px"
  >
    <template #default>
      <Email
        :to="emailInfo.to"
        :cc="emailInfo.cc"
        :subject="emailInfo.subject"
        :attachments="emailInfo.attachments"
        @update:to="(val) => (emailInfo.to = val)"
        @update:cc="(val) => (emailInfo.cc = val)"
        @update:subject="(val) => (emailInfo.subject = val)"
        @add-attachment="handleAddAttachment"
        @remove-attachment="handleRemoveAttachment"
      />
    </template>
    <template #footer>
      <div class="flex justify-end gap-3">
        <ElButton @click="emailDialogVisible = false">取消</ElButton>
        <ElButton
          type="primary"
          :loading="emailSending"
          @click="handleEmailSend"
          :disabled="emailInfo.to.length === 0 || !emailInfo.subject.trim()"
        >
          <Icon icon="vi-teenyicons:send-outline" class="mr-2" />
          {{ emailSending ? '发送中...' : '发送邮件' }}
        </ElButton>
      </div>
    </template>
  </ResizeDialog>
</template>

<style scoped lang="less">
// 响应式设计
@media (width <= 768px) {
  .@{prefix-cls} {
    &__stats {
      .grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }
    }

    &__header {
      .flex {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;

        .flex-1 h2 {
          font-size: 18px;
        }

        .flex.items-center {
          justify-content: center;
          gap: 8px;

          .el-button {
            min-width: 80px;
            font-size: 12px;
          }
        }
      }
    }
  }
}

@media (width <= 1200px) {
  .@{prefix-cls} {
    &__stats {
      .grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  }
}

.@{prefix-cls} {
  display: flex;
  padding: 0;
  flex-direction: column;

  &__header {
    flex-shrink: 0;
  }

  &__stats {
    flex-shrink: 0;
  }

  &__table {
    flex: 1;
    min-height: 0;
  }
}

// 抽屉样式
:deep(.create-requirement-drawer) {
  .el-drawer__header {
    padding: 16px 20px;
    background-color: var(--el-fill-color-extra-light);
    border-bottom: 1px solid var(--el-border-color-light);

    .el-drawer__title {
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }

  .el-drawer__body {
    padding: 0;
  }
}

@prefix-cls: ~'@{adminNamespace}-sop';
</style>
