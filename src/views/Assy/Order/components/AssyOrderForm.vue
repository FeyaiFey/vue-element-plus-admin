<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElSelect,
  ElOption,
  ElButton,
  ElMessage,
  ElRow,
  ElCol,
  ElCard
} from 'element-plus'
import { getWaferInfoApi, getSalesApi } from '@/api/params'
import type { FormInstance, FormRules } from 'element-plus'

// 定义接收的属性
const props = defineProps({
  editMode: {
    type: Boolean,
    default: false
  },
  initialData: {
    type: Object,
    default: () => ({})
  }
})

// 定义事件
const emit = defineEmits(['close', 'submit'])

// 表单引用
const formRef = ref<FormInstance>()

// 加载状态
const loading = ref(false)

// 销售员数据
const salesPersons = ref<any[]>([])

// 晶圆信息
const waferInfo = ref<any>(null)

// 表单数据
const formData = reactive({
  itemName: props.initialData?.ITEM_NAME || '',
  itemCode: props.initialData?.ITEM_CODE || '',
  abtr: props.initialData?.ABTR || '',
  businessQty: props.initialData?.BUSINESS_QTY ? props.initialData.BUSINESS_QTY / 10000 : 0,
  requirementType: props.initialData?.REQUIREMENT_TYPE || '安全库存',
  emergency: props.initialData?.EMERGENCY || '普通',
  sales: props.initialData?.SALES || '',
  remark: props.initialData?.REMARK || '',
  mainChip: props.initialData?.CHIP_A || '',
  deputyChip: props.initialData?.CHIP_B || '',
  mainChipUsage: props.initialData?.CHIP_A_QTY || 0,
  deputyChipUsage: props.initialData?.CHIP_B_QTY || 0
})

// 表单验证规则
const rules = reactive<FormRules>({
  itemName: [{ required: true, message: '请输入品名', trigger: 'blur' }],
  abtr: [{ required: true, message: '请选择管装/编带', trigger: 'change' }],
  businessQty: [
    { required: true, message: '请输入数量', trigger: 'blur' },
    { type: 'number', min: 1, message: '数量必须大于0', trigger: 'blur' }
  ],
  requirementType: [{ required: true, message: '请选择需求类型', trigger: 'change' }],
  emergency: [{ required: true, message: '请选择紧急程度', trigger: 'change' }],
  sales: [{ required: true, message: '请选择销售员', trigger: 'change' }]
})

// 紧急程度选项
const urgencyOptions = [
  { label: '普通', value: '普通' },
  { label: '紧急', value: '紧急' },
  { label: '特急', value: '特急' }
]

// 需求类型选项
const demandTypeOptions = [
  { label: '市场需求', value: '市场需求' },
  { label: '安全库存', value: '安全库存' }
]

// 计算A芯用量
const mainChipUsage = computed(() => {
  if (!waferInfo.value || !waferInfo.value.MAIN_CHIP_GROSS_DIE || formData.businessQty <= 0) {
    return 0
  }
  return ((formData.businessQty * 10000) / waferInfo.value.MAIN_CHIP_GROSS_DIE).toFixed(2)
})

// 计算B芯用量
const deputyChipUsage = computed(() => {
  if (!waferInfo.value || !waferInfo.value.DEPUTY_CHIP_GROSS_DIE || formData.businessQty <= 0) {
    return 0
  }
  return ((formData.businessQty * 10000) / waferInfo.value.DEPUTY_CHIP_GROSS_DIE).toFixed(2)
})

// 获取晶圆信息
const fetchWaferInfo = async () => {
  if (!formData.itemName) return

  try {
    loading.value = true
    const res = await getWaferInfoApi({ item_name: formData.itemName })

    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      waferInfo.value = res.data[0]
    } else {
      waferInfo.value = res.data
    }

    if (waferInfo.value) {
      formData.mainChip = waferInfo.value.MAIN_CHIP || ''
      formData.deputyChip = waferInfo.value.DEPUTY_CHIP || ''
      formData.mainChipUsage = Number(mainChipUsage.value)
      formData.deputyChipUsage = Number(deputyChipUsage.value)
    }
  } catch (error) {
    console.error('获取晶圆信息失败:', error)
    ElMessage.error('获取晶圆信息失败')
  } finally {
    loading.value = false
  }
}

// 获取销售员数据
const fetchSalesPersons = async () => {
  try {
    const res = await getSalesApi()
    salesPersons.value = Array.isArray(res.data) ? res.data : []
  } catch (error) {
    console.error('获取销售员数据失败:', error)
    ElMessage.error('获取销售员数据失败')
  }
}

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate((valid) => {
    if (valid) {
      if (formData.requirementType === '安全库存' && !formData.sales) {
        formData.sales = '方美容'
      }

      const submitData = {
        orders: [
          {
            itemName: formData.itemName,
            itemCode: formData.itemCode,
            abtr: formData.abtr,
            businessQty: formData.businessQty * 10000,
            requirementType: formData.requirementType,
            emergency: formData.emergency,
            sales: formData.sales,
            remark: formData.remark,
            mainChip: formData.mainChip,
            deputyChip: formData.deputyChip,
            mainChipUsage: formData.mainChipUsage,
            deputyChipUsage: formData.deputyChipUsage,
            status: '1'
          }
        ]
      }

      emit('submit', submitData)
    } else {
      ElMessage.error('请填写完整信息')
    }
  })
}

// 取消表单
const cancelForm = () => {
  emit('close')
}

// 监听品名变化
const handleItemNameChange = () => {
  if (formData.itemName) {
    formData.itemCode = `BC-${formData.itemName.replace(/_/g, '-')}-AB`
    if (!props.editMode) {
      fetchWaferInfo()
    }
  }
}

// 监听需求类型变化
const handleRequirementTypeChange = (value: string) => {
  if (value === '安全库存') {
    formData.sales = '方美容'
  }
}

// 监听initialData变化
watch(
  () => props.initialData,
  (newVal) => {
    if (newVal) {
      formData.itemName = newVal.ITEM_NAME || ''
      formData.itemCode = newVal.ITEM_CODE || ''
      formData.abtr = newVal.ABTR || ''
      formData.businessQty = newVal.BUSINESS_QTY ? newVal.BUSINESS_QTY / 10000 : 0
      formData.requirementType = newVal.REQUIREMENT_TYPE || '安全库存'
      formData.emergency = newVal.EMERGENCY || '普通'
      formData.sales = newVal.SALES || ''
      formData.remark = newVal.REMARK || ''
      formData.mainChip = newVal.CHIP_A || ''
      formData.deputyChip = newVal.CHIP_B || ''
      formData.mainChipUsage = newVal.CHIP_A_QTY || 0
      formData.deputyChipUsage = newVal.CHIP_B_QTY || 0

      // 如果是查看模式且有晶圆信息，直接使用
      if (props.editMode && newVal.waferInfo) {
        waferInfo.value = newVal.waferInfo
      } else if (newVal.ITEM_NAME) {
        // 否则获取晶圆信息
        fetchWaferInfo()
      }
    }
  },
  { immediate: true }
)

onMounted(() => {
  fetchSalesPersons()
  if (props.initialData?.itemName) {
    handleItemNameChange()
  }
})
</script>

<template>
  <div class="assy-order-form" v-loading="loading">
    <ElForm
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-position="top"
      class="form-container"
      size="default"
    >
      <!-- 主容器行 - 分为左右两列 -->
      <ElRow :gutter="20">
        <!-- 左侧列 - 基本信息 -->
        <ElCol :xs="24" :md="12">
          <ElCard class="form-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span class="section-title">基本信息</span>
              </div>
            </template>

            <!-- 基本信息表单项 -->
            <ElFormItem label="品名" prop="itemName">
              <ElInput
                v-model="formData.itemName"
                :disabled="editMode"
                @change="handleItemNameChange"
              />
            </ElFormItem>

            <ElFormItem label="品号" prop="itemCode">
              <ElInput v-model="formData.itemCode" disabled />
            </ElFormItem>

            <ElFormItem label="管装/编带" prop="abtr">
              <ElSelect v-model="formData.abtr" :disabled="editMode" style="width: 100%">
                <ElOption label="管装" value="管装" />
                <ElOption label="编带" value="编带" />
              </ElSelect>
            </ElFormItem>

            <ElFormItem label="需求数量(万只)" prop="businessQty">
              <ElInputNumber
                v-model="formData.businessQty"
                :min="1"
                :precision="0"
                :step="1"
                :disabled="editMode"
                style="width: 100%"
              />
            </ElFormItem>

            <ElFormItem label="需求类型" prop="requirementType">
              <ElSelect
                v-model="formData.requirementType"
                :disabled="editMode"
                style="width: 100%"
                @change="handleRequirementTypeChange"
              >
                <ElOption
                  v-for="option in demandTypeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </ElSelect>
            </ElFormItem>

            <ElFormItem label="紧急程度" prop="emergency">
              <ElSelect v-model="formData.emergency" :disabled="editMode" style="width: 100%">
                <ElOption
                  v-for="option in urgencyOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </ElSelect>
            </ElFormItem>

            <ElFormItem label="销售员" prop="sales">
              <ElSelect v-model="formData.sales" :disabled="editMode" style="width: 100%">
                <ElOption
                  v-for="person in salesPersons"
                  :key="person.id"
                  :label="person.label"
                  :value="person.value"
                />
              </ElSelect>
            </ElFormItem>

            <ElFormItem label="备注" prop="remark">
              <ElInput
                v-model="formData.remark"
                type="textarea"
                rows="3"
                :disabled="editMode"
                placeholder="请输入备注信息"
              />
            </ElFormItem>
          </ElCard>
        </ElCol>

        <!-- 右侧列 - 晶圆信息 -->
        <ElCol :xs="24" :md="12">
          <ElCard v-if="waferInfo" class="form-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span class="section-title">原材料信息</span>
              </div>
            </template>

            <!-- A芯信息 -->
            <template v-if="waferInfo.MAIN_CHIP">
              <ElFormItem label="A芯">
                <ElInput :value="waferInfo.MAIN_CHIP" disabled />
              </ElFormItem>

              <ElFormItem v-if="waferInfo.MAIN_CHIP_GROSS_DIE" label="A芯GrossDie">
                <ElInput :value="waferInfo.MAIN_CHIP_GROSS_DIE" disabled />
              </ElFormItem>

              <ElFormItem v-if="waferInfo.MAIN_CHIP_GROSS_DIE" label="A芯用量">
                <ElInput :value="mainChipUsage" disabled>
                  <template #append>片</template>
                </ElInput>
              </ElFormItem>
            </template>

            <!-- B芯信息 -->
            <template v-if="waferInfo.DEPUTY_CHIP">
              <ElFormItem label="B芯">
                <ElInput :value="waferInfo.DEPUTY_CHIP" disabled />
              </ElFormItem>

              <ElFormItem v-if="waferInfo.DEPUTY_CHIP_GROSS_DIE" label="B芯GrossDie">
                <ElInput :value="waferInfo.DEPUTY_CHIP_GROSS_DIE" disabled />
              </ElFormItem>

              <ElFormItem v-if="waferInfo.DEPUTY_CHIP_GROSS_DIE" label="B芯用量">
                <ElInput :value="deputyChipUsage" disabled>
                  <template #append>片</template>
                </ElInput>
              </ElFormItem>
            </template>
          </ElCard>

          <!-- 如果没有晶圆信息，显示占位卡片 -->
          <ElCard v-else class="form-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span class="section-title">原材料信息</span>
              </div>
            </template>
            <div class="empty-info">请先输入品名</div>
          </ElCard>
        </ElCol>
      </ElRow>

      <!-- 按钮区域 -->
      <div class="form-actions">
        <ElButton @click="cancelForm">取消</ElButton>
        <ElButton v-if="!editMode" type="primary" @click="submitForm(formRef)" :loading="loading">
          提交
        </ElButton>
      </div>
    </ElForm>
  </div>
</template>

<style lang="less" scoped>
.assy-order-form {
  padding: 20px;

  .form-container {
    width: 100%;
  }

  .form-card {
    height: 100%;
    margin-bottom: 20px;
    border-radius: 8px;

    .card-header {
      display: flex;
      align-items: center;

      .section-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }
  }

  .form-actions {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 30px;
  }

  .empty-info {
    padding: 40px 0;
    font-style: italic;
    color: var(--el-text-color-secondary);
    text-align: center;
  }

  :deep(.el-form-item__label) {
    font-weight: 600;
  }

  :deep(.el-input.is-disabled .el-input__inner) {
    color: var(--el-text-color-primary);
    cursor: default;
  }

  :deep(.el-card__header) {
    padding: 12px 20px;
    background-color: var(--el-fill-color-light);
  }

  :deep(.el-select) {
    width: 100%;
  }
}
</style>
