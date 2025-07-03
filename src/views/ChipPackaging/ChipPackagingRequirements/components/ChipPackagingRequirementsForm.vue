<script setup lang="ts">
import { ref, watch, PropType, computed, onMounted } from 'vue'
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElInputNumber,
  ElButton,
  ElMessage
} from 'element-plus'
import { useDesign } from '@/hooks/web/useDesign'
import { ChipPackagingRequirementCreate } from '@/api/chipPackaging/types'
import { employees, waferInfo } from '@/api/common/types'
import { getEmployeesListApi, getChipBomListApi } from '@/api/common'

// 使用设计系统
const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('chip-packaging-requirements-form')

// 定义 props
const props = defineProps({
  modelValue: {
    type: Object as PropType<ChipPackagingRequirementCreate>,
    default: () => ({
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
  },
  loading: {
    type: Boolean,
    default: false
  },
  // 新增：是否预填 itemName (用于区分普通新建和行内新建)
  prefilledItemName: {
    type: String,
    default: ''
  }
})

// 定义 emits
const emit = defineEmits(['update:modelValue', 'submit', 'cancel'])

// 表单数据
const formData = ref<ChipPackagingRequirementCreate>({
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

// 表单引用
const formRef = ref()

// 加载状态
const chipBomLoading = ref(false)
const salesOptionsLoading = ref(false)

// 销售员选项
const salesOptions = ref<employees[]>([])

// 存储BOM信息用于计算
const bomInfo = ref<waferInfo>({})

// 计算属性：itemName是否为只读
const isItemNameReadonly = computed(() => {
  return !!props.prefilledItemName
})

// 格式化数字为两位小数
const formatNumber = (value: number): number => {
  return Number(Number(value || 0).toFixed(2))
}

// 通知父组件数据变化的统一方法
const emitDataChange = () => {
  emit('update:modelValue', { ...formData.value })
}

// 获取销售员列表
const fetchSalesOptions = async () => {
  try {
    salesOptionsLoading.value = true
    const res = await getEmployeesListApi({ departmentName: '销售' })

    if (res.data && res.data.list) {
      salesOptions.value = res.data.list
    }
  } catch (error) {
    console.error('获取销售员列表失败:', error)
  } finally {
    salesOptionsLoading.value = false
  }
}

// 计算芯片用量
const calculateChipQuantities = () => {
  const businessQty = formData.value.businessQty || 0
  const waferAQty = bomInfo.value.waferAQty || 0
  const waferBQty = bomInfo.value.waferBQty || 0

  if (waferAQty > 0) {
    formData.value.chipAQty = formatNumber(businessQty / waferAQty)
  } else {
    formData.value.chipAQty = formatNumber(0)
  }

  if (waferBQty > 0) {
    formData.value.chipBQty = formatNumber(businessQty / waferBQty)
  } else {
    formData.value.chipBQty = formatNumber(0)
  }
}

// 根据BOM信息更新表单数据
const updateFormDataFromBom = () => {
  if (!bomInfo.value.chipName) return

  // 生成品号：品名 + 前后缀
  formData.value.itemCode = `BC-${bomInfo.value.chipName}-AB`

  // 设置芯片信息
  formData.value.chipA = bomInfo.value.waferA || ''
  formData.value.chipB = bomInfo.value.waferB || ''

  // 计算芯片用量
  calculateChipQuantities()

  // 通知父组件数据变化
  emitDataChange()
}

// 重置BOM相关数据
const resetBomData = () => {
  bomInfo.value = {}
  formData.value.itemCode = ''
  formData.value.chipA = ''
  formData.value.chipAQty = formatNumber(0)
  formData.value.chipB = ''
  formData.value.chipBQty = formatNumber(0)
  emitDataChange()
}

// 获取芯片BOM信息
const fetchChipBomInfo = async (itemName: string) => {
  if (!itemName?.trim()) {
    resetBomData()
    return
  }

  try {
    chipBomLoading.value = true
    const res = await getChipBomListApi({ itemName: itemName.trim() })

    if (res.data && res.data.list && res.data.list.length > 0) {
      bomInfo.value = res.data.list[0]
      updateFormDataFromBom()
    } else {
      ElMessage.warning('未找到该品名对应的BOM信息')
      resetBomData()
    }
  } catch (error) {
    console.error('获取芯片BOM信息失败:', error)
    ElMessage.error('获取芯片BOM信息失败')
    resetBomData()
  } finally {
    chipBomLoading.value = false
  }
}

// itemName失去焦点时获取BOM信息
const handleItemNameBlur = () => {
  if (!isItemNameReadonly.value && formData.value.itemName?.trim()) {
    fetchChipBomInfo(formData.value.itemName)
  }
}

// 监听ABTR变化，重新生成品号
const handleAbtrChange = () => {
  if (bomInfo.value.chipName) {
    updateFormDataFromBom()
  }
}

// 监听业务数量变化，重新计算用量
const handleBusinessQtyChange = () => {
  if (bomInfo.value.chipName) {
    calculateChipQuantities()
    emitDataChange()
  }
}

// 表单验证规则
const formRules = {
  itemCode: [{ required: true, message: '请输入品号', trigger: 'blur' }],
  itemName: [{ required: true, message: '请输入品名', trigger: 'blur' }],
  abtr: [{ required: true, message: '请选择管装/编带', trigger: 'change' }],
  businessQty: [
    { required: true, message: '请输入业务数量', trigger: 'blur' },
    { type: 'number' as const, min: 1, message: '业务数量必须大于0', trigger: 'change' }
  ],
  requirementType: [{ required: true, message: '请选择需求类型', trigger: 'change' }],
  emergency: [{ required: true, message: '请选择紧急程度', trigger: 'change' }],
  sales: [{ required: true, message: '请选择销售员', trigger: 'change' }]
}

// 初始化表单数据
const initFormData = (data?: ChipPackagingRequirementCreate) => {
  const newData = data || {
    itemCode: '',
    itemName: props.prefilledItemName || '',
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

  // 确保数字字段的类型正确和格式一致
  formData.value = {
    ...newData,
    businessQty: Number(newData.businessQty) || 1,
    chipAQty: formatNumber(newData.chipAQty || 0),
    chipBQty: formatNumber(newData.chipBQty || 0)
  }
}

// 监听外部 props 变化
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && JSON.stringify(newVal) !== JSON.stringify(formData.value)) {
      initFormData(newVal)
    }
  },
  { immediate: true }
)

// 监听预填itemName变化
watch(
  () => props.prefilledItemName,
  (newVal, oldVal) => {
    if (newVal?.trim() && newVal !== oldVal) {
      formData.value.itemName = newVal
      // 确保函数已定义再调用
      if (typeof emitDataChange === 'function') {
        emitDataChange()
      }
      fetchChipBomInfo(newVal)
    }
  },
  { immediate: true }
)

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    emit('submit', formData.value)
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 取消操作
const handleCancel = () => {
  emit('cancel')
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  // 清空BOM信息
  bomInfo.value = {}
  // 重置表单数据
  initFormData()
}

// 组件挂载时获取销售员列表
const initializeForm = async () => {
  await fetchSalesOptions()
}

// 暴露方法给父组件
defineExpose({
  resetForm,
  validate: () => formRef.value?.validate()
})

// 在组件挂载后初始化
onMounted(() => {
  initializeForm()
})
</script>

<template>
  <div :class="prefixCls" class="h-full flex flex-col">
    <ElForm
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      label-position="left"
      :disabled="loading"
    >
      <ElFormItem label="品名" prop="itemName">
        <ElInput
          v-model="formData.itemName"
          placeholder="请输入品名"
          clearable
          :readonly="isItemNameReadonly"
          :loading="chipBomLoading"
          @blur="handleItemNameBlur"
          @input="emitDataChange"
        />
        <div v-if="isItemNameReadonly" class="text-xs text-gray-500 mt-1">
          * 行内新建，品名已自动填入
        </div>
      </ElFormItem>

      <ElFormItem label="品号" prop="itemCode">
        <ElInput v-model="formData.itemCode" placeholder="将根据品名自动生成" readonly />
      </ElFormItem>

      <ElFormItem label="管装/编带" prop="abtr">
        <ElSelect
          v-model="formData.abtr"
          placeholder="请选择"
          clearable
          class="w-full"
          @change="handleAbtrChange"
        >
          <ElOption label="管装" value="0" />
          <ElOption label="编带" value="1" />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="业务数量" prop="businessQty">
        <ElInputNumber
          v-model.number="formData.businessQty"
          placeholder="请输入业务数量"
          clearable
          :min="1"
          :max="999999999"
          :precision="0"
          :step="10000"
          style="width: 100%"
          @change="handleBusinessQtyChange"
        />
      </ElFormItem>

      <ElFormItem label="需求类型" prop="requirementType">
        <ElSelect
          v-model="formData.requirementType"
          placeholder="请选择"
          clearable
          class="w-full"
          @change="emitDataChange"
        >
          <ElOption label="安全库存" value="0" />
          <ElOption label="市场需求" value="1" />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="紧急程度" prop="emergency">
        <ElSelect
          v-model="formData.emergency"
          placeholder="请选择"
          clearable
          class="w-full"
          @change="emitDataChange"
        >
          <ElOption label="正常" value="0" />
          <ElOption label="紧急" value="1" />
          <ElOption label="特急" value="2" />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="销售员" prop="sales">
        <ElSelect
          v-model="formData.sales"
          placeholder="请选择销售员"
          clearable
          filterable
          :loading="salesOptionsLoading"
          class="w-full"
          @change="emitDataChange"
        >
          <ElOption
            v-for="option in salesOptions"
            :key="option.value || option.label"
            :label="option.label"
            :value="option.value || ''"
          />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="A芯片名称" prop="chipA">
        <ElInput
          v-model="formData.chipA"
          placeholder="根据品名自动获取"
          clearable
          readonly
          :loading="chipBomLoading"
        />
      </ElFormItem>

      <ElFormItem label="A芯片数量" prop="chipAQty">
        <ElInputNumber
          v-model="formData.chipAQty"
          placeholder="根据BOM和业务数量自动计算"
          :precision="2"
          :min="0"
          :max="999999999"
          readonly
          disabled
          style="width: 100%"
          :loading="chipBomLoading"
        />
      </ElFormItem>

      <ElFormItem label="B芯片名称" prop="chipB">
        <ElInput
          v-model="formData.chipB"
          placeholder="根据品名自动获取"
          clearable
          readonly
          :loading="chipBomLoading"
        />
      </ElFormItem>

      <ElFormItem label="B芯片数量" prop="chipBQty">
        <ElInputNumber
          v-model="formData.chipBQty"
          placeholder="根据BOM和业务数量自动计算"
          :precision="2"
          :min="0"
          :max="999999999"
          readonly
          disabled
          style="width: 100%"
          :loading="chipBomLoading"
        />
      </ElFormItem>

      <ElFormItem label="备注">
        <ElInput
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息（可选）"
          maxlength="500"
          show-word-limit
          @input="emitDataChange"
        />
      </ElFormItem>
    </ElForm>

    <!-- 操作按钮 -->
    <div
      class="flex justify-end items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700"
    >
      <ElButton @click="handleCancel" :disabled="loading">取消</ElButton>
      <ElButton type="primary" @click="handleSubmit" :loading="loading">
        {{ loading ? '提交中...' : '确认提交' }}
      </ElButton>
    </div>
  </div>
</template>
