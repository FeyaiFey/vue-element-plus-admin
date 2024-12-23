<script lang="tsx">
import { defineComponent, computed, PropType } from 'vue'
import { ElSteps, ElStep } from 'element-plus'
import { useDesign } from '@/hooks/web/useDesign'
import { Icon } from '@/components/Icon'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('progress-bar')

interface StepDetail {
  step: string
  quantity: number
  forecast: number
  status: 'finished' | 'processing' | 'waiting'
}

export default defineComponent({
  name: 'ProgressBar',
  props: {
    details: {
      type: Array as PropType<{ step: string; quantity: number; forecast: number }[]>,
      default: () => []
    }
  },
  setup(props) {
    // 计算每个步骤的状态
    const stepsWithStatus = computed(() => {
      const steps = [...props.details]

      const firstNonZeroIndex = steps.findIndex((item) => item.quantity > 0)
      const lastNonZeroIndex = steps.map((item) => item.quantity > 0).lastIndexOf(true)

      return steps.map((item, index) => {
        let status: 'finished' | 'processing' | 'waiting'

        if (index < firstNonZeroIndex) {
          status = 'finished'
        } else if (index > lastNonZeroIndex) {
          status = 'waiting'
        } else {
          status = item.quantity > 0 ? 'processing' : 'waiting'
        }

        return {
          ...item,
          status
        }
      })
    })

    const getStepIcon = (status: string) => {
      switch (status) {
        case 'finished':
          return <Icon icon="vi-fluent-mdl2:completed" class="text-success" size={24} />
        case 'processing':
          return <Icon icon="vi-svg-spinners:clock" class="text-primary" size={24} />
        default:
          return <Icon icon="vi-ic:baseline-alarm" class="text-gray-400" size={24} />
      }
    }

    const getStepDescription = (detail: StepDetail): string => {
      if (detail.status === 'processing') {
        return detail.quantity > 0 && detail.forecast > 0
          ? `在制数量: ${detail.quantity}\n预计${detail.forecast}天后完成`
          : `在制数量: ${detail.quantity}`
      }
      return detail.quantity > 0 ? `完成数量: ${detail.quantity}` : ''
    }

    const renderSteps = () => {
      return stepsWithStatus.value.map((detail) => {
        return (
          <ElStep
            key={detail.step}
            title={detail.step}
            icon={getStepIcon(detail.status)}
            description={getStepDescription(detail)}
            status={detail.status === 'finished' ? 'success' : undefined}
          />
        )
      })
    }

    return () => (
      <div class={prefixCls}>
        <ElSteps
          space={120}
          finish-status="success"
          active={stepsWithStatus.value.filter((s) => s.status !== 'waiting').length}
          alignCenter
          class="steps-container"
        >
          {renderSteps()}
        </ElSteps>
      </div>
    )
  }
})
</script>

<style lang="less" scoped>
@prefix-cls: ~'@{adminNamespace}-progress-bar';

.@{prefix-cls} {
  margin: 20px 0;

  :deep(.el-steps) {
    padding: 20px 0;
    overflow-x: auto;

    // 小屏幕适配
    @media screen and (width <= 768px) {
      padding: 20px;
      overflow-x: visible;

      &.steps-container {
        flex-direction: column !important;
      }

      .el-step {
        padding-bottom: 20px;
        margin-right: 0 !important;
        flex: 1;
        flex-basis: auto !important;

        .el-step__main {
          margin-top: 10px;
        }

        .el-step__line {
          top: 0 !important;
          left: 16px !important;
          width: 2px !important;
          height: 100% !important;
          margin-right: 0;
        }

        .el-step__description {
          padding-left: 10px;
        }
      }

      // 最后一个步骤不需要连接线
      .el-step:last-child {
        .el-step__line {
          display: none;
        }
      }
    }

    &::-webkit-scrollbar {
      height: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--el-border-color-light);
      border-radius: 3px;
    }
  }

  :deep(.el-step) {
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      .el-step__title {
        color: var(--el-color-primary) !important;
      }

      .el-step__description {
        color: var(--el-color-primary) !important;
      }

      .el-step__line {
        background-color: var(--el-color-primary-light-5) !important;
      }
    }

    &.is-success {
      .el-step__title {
        color: var(--el-color-success);
      }

      .el-step__line {
        background-color: var(--el-color-success);
      }

      &:hover {
        .el-step__title {
          color: var(--el-color-success-light-3) !important;
        }

        .el-step__description {
          color: var(--el-color-success-light-3) !important;
        }

        .el-step__line {
          background-color: var(--el-color-success-light-5) !important;
        }
      }
    }

    .el-step__icon-inner {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .el-step__title {
      font-size: 15px;
      font-weight: 500;
      transition: color 0.3s;

      &.is-process {
        font-weight: bold;
        color: var(--el-color-primary);
      }
    }
  }

  :deep(.el-step__description) {
    margin-top: 8px;
    font-size: 13px;
    line-height: 1.5;
    white-space: pre-line;
    transition: color 0.3s;

    &.is-process {
      font-weight: 500;
      color: var(--el-color-primary);
    }
  }

  :deep(.el-step__line) {
    top: 16px;
    height: 2px;
    transition: background-color 0.3s;
  }

  :deep(.el-step__head) {
    transition: transform 0.3s;

    &:hover {
      transform: scale(1.1);
    }
  }
}
</style>
