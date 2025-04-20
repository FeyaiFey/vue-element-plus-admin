<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, onMounted, computed, watch } from 'vue'
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElButton,
  ElInputNumber,
  ElSelect,
  ElOption,
  ElMessage,
  ElRow,
  ElCol,
  ElCard,
  ElDivider
} from 'element-plus'
import { getWaferInfoApi, getSalesApi } from '@/api/params'
import type { FormInstance, FormRules } from 'element-plus'

// 定义接收的属性
const props = defineProps({
  itemName: {
    type: String,
    required: true
  },
  abtr: {
    type: String,
    required: true
  },
  // 添加更多属性用于编辑模式
  editMode: {
    type: Boolean,
    default: false
  },
  initialQuantity: {
    type: Number,
    default: 0
  },
  initialDemandType: {
    type: String,
    default: '安全库存'
  },
  initialUrgencyLevel: {
    type: String,
    default: '普通'
  },
  initialSalesPerson: {
    type: String,
    default: '方美容'
  },
  initialRemark: {
    type: String,
    default: ''
  },
  initialWaferInfo: {
    type: Object,
    required: false,
    default: undefined
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
  itemName: props.itemName,
  itemCode: '',
  abtr: props.abtr,
  businessQty: props.initialQuantity > 0 ? props.initialQuantity / 10000 : 0, // 转换为万只
  requirementType: props.initialDemandType,
  emergency: props.initialUrgencyLevel,
  sales: props.initialSalesPerson || '方美容',
  remark: props.initialRemark,
  mainChip: '',
  deputyChip: '',
  mainChipUsage: 0,
  deputyChipUsage: 0
})

// 表单验证规则
const rules = reactive<FormRules>({
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

// 计算A芯用量 - 用户输入是万只，计算用量时乘以10000
const mainChipUsage = computed(() => {
  if (!waferInfo.value || !waferInfo.value.MAIN_CHIP_GROSS_DIE || formData.businessQty <= 0) {
    return 0
  }
  // 将万只转换为只来计算
  return ((formData.businessQty * 10000) / waferInfo.value.MAIN_CHIP_GROSS_DIE).toFixed(2)
})

// 计算B芯用量 - 用户输入是万只，计算用量时乘以10000
const deputyChipUsage = computed(() => {
  if (!waferInfo.value || !waferInfo.value.DEPUTY_CHIP_GROSS_DIE || formData.businessQty <= 0) {
    return 0
  }
  // 将万只转换为只来计算
  return ((formData.businessQty * 10000) / waferInfo.value.DEPUTY_CHIP_GROSS_DIE).toFixed(2)
})

// 获取晶圆信息
const fetchWaferInfo = async () => {
  try {
    loading.value = true
    const res = await getWaferInfoApi({ item_name: props.itemName })

    // 处理API返回的数组数据
    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      waferInfo.value = res.data[0] // 取数组中的第一个元素
    } else {
      waferInfo.value = res.data // 如果不是数组，直接使用
    }

    // 设置品号为固定格式: "BC-"+itemName+"-AB"
    formData.itemCode = `BC-${props.itemName}-AB`

    // 设置晶圆信息
    if (waferInfo.value) {
      formData.mainChip = waferInfo.value.MAIN_CHIP || ''
      formData.deputyChip = waferInfo.value.DEPUTY_CHIP || ''
      // 更新用量计算
      formData.mainChipUsage = Number(mainChipUsage.value)
      formData.deputyChipUsage = Number(deputyChipUsage.value)
    }

    console.log('获取到的晶圆信息:', waferInfo.value) // 添加日志便于调试
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
      // 如果是安全库存，再次确认销售员设置
      if (formData.requirementType === '安全库存' && !formData.sales) {
        formData.sales = '方美容'
      }

      // 提交数据到父组件 - 将万只转换为只，再提交
      const actualQty = formData.businessQty * 10000 // 用户输入100代表100万只=1000000只
      const submitData = {
        ...formData,
        businessQty: actualQty, // 转换为"只"单位提交
        waferInfo: waferInfo.value
      }

      console.log(`提交数量: 用户输入${formData.businessQty}万只，转换为${actualQty}只`)
      emit('submit', submitData)
      ElMessage.success('封装单创建成功')
      emit('close')
    } else {
      ElMessage.error('请填写完整信息')
    }
  })
}

// 取消表单
const cancelForm = () => {
  emit('close')
}

// 组件挂载时获取数据
onMounted(() => {
  if (props.editMode && props.initialWaferInfo) {
    // 编辑模式下使用传入的晶圆信息
    waferInfo.value = props.initialWaferInfo
    formData.itemCode = `BC-${props.itemName}-AB`
  } else {
    // 新建模式下从API获取
    fetchWaferInfo()
  }
  fetchSalesPersons()

  // 确保默认值正确设置
  // 如果是安全库存类型，设置销售员为方美容
  if (formData.requirementType === '安全库存') {
    formData.sales = '方美容'
  }
})

// 监听businessQty变化，更新芯片用量
watch(
  () => formData.businessQty,
  () => {
    if (waferInfo.value) {
      formData.mainChipUsage = Number(mainChipUsage.value)
      formData.deputyChipUsage = Number(deputyChipUsage.value)
    }
  }
)

// 监听需求类型变化
watch(
  () => formData.requirementType,
  (newValue) => {
    // 当需求类型为"安全库存"时，自动设置销售员为"方美容"
    if (newValue === '安全库存') {
      formData.sales = '方美容'
    }
  }
)
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

            <!-- 基本信息表单项 - 每项占整行 -->
            <ElFormItem label="品名" prop="itemName">
              <ElInput v-model="formData.itemName" disabled />
            </ElFormItem>

            <ElFormItem label="品号" prop="itemCode">
              <ElInput v-model="formData.itemCode" disabled />
            </ElFormItem>

            <ElFormItem label="管装/编带" prop="abtr">
              <ElInput v-model="formData.abtr" disabled />
            </ElFormItem>

            <ElFormItem label="需求数量(万只)" prop="businessQty">
              <ElInputNumber
                v-model="formData.businessQty"
                :min="1"
                :precision="0"
                :step="1"
                style="width: 100%"
              />
            </ElFormItem>

            <ElFormItem label="需求类型" prop="requirementType">
              <ElSelect v-model="formData.requirementType" style="width: 100%">
                <ElOption
                  v-for="option in demandTypeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </ElSelect>
            </ElFormItem>

            <ElFormItem label="紧急程度" prop="emergency">
              <ElSelect v-model="formData.emergency" style="width: 100%">
                <ElOption
                  v-for="option in urgencyOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </ElSelect>
            </ElFormItem>

            <ElFormItem label="销售员" prop="sales">
              <ElSelect v-model="formData.sales" style="width: 100%">
                <ElOption
                  v-for="person in salesPersons"
                  :key="person.id"
                  :label="person.label"
                  :value="person.value"
                />
              </ElSelect>
            </ElFormItem>

            <!-- 备注部分 -->
            <ElFormItem label="备注" prop="remark">
              <ElInput
                v-model="formData.remark"
                type="textarea"
                rows="3"
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

            <!-- A芯信息 - 每项占整行 -->
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

            <ElDivider v-if="waferInfo.MAIN_CHIP && waferInfo.DEPUTY_CHIP" />

            <!-- B芯信息 - 每项占整行 -->
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
            <div class="empty-info"> 正在加载晶圆信息... </div>
          </ElCard>
        </ElCol>
      </ElRow>

      <!-- 按钮区域 -->
      <div class="form-actions">
        <ElButton type="primary" @click="submitForm(formRef)" :loading="loading">提交</ElButton>
        <ElButton @click="cancelForm">取消</ElButton>
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

  :deep(.el-divider) {
    margin: 16px 0;
  }
}
</style>
