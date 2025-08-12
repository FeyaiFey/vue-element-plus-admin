<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@/components/Icon'
import { useDesign } from '@/hooks/web/useDesign'

const { getPrefixCls } = useDesign()
const router = useRouter()

// 快捷入口配置
const quickEntries = ref([
  {
    id: 'sale-analysis',
    title: '销售分析',
    subtitle: 'Sales Analysis',
    icon: 'vi-icon-park-outline:chart-line',
    color: '#409EFF',
    bgColor: '#ECF5FF',
    route: '/sale/analysis',
    description: '查看销售数据情况和完成情况'
  },
  {
    id: 'stock-report',
    title: '库存查询',
    subtitle: 'Stock Query',
    icon: 'vi-icon-park-outline:box',
    color: '#67C23A',
    bgColor: '#F0F9FF',
    route: '/report/stockOld',
    description: '实时库存状态和明细查询'
  },
  {
    id: 'sop-report',
    title: 'S&OP产销协调',
    subtitle: 'S&OP',
    icon: 'vi-tdesign:cooperate',
    color: '#E6A23C',
    bgColor: '#FDF6EC',
    route: '/report/sop',
    description: 'S&OP产销协调'
  },
  {
    id: 'chipPackaging-wip',
    title: '封装进度',
    subtitle: 'Chip Packaging',
    icon: 'vi-icon-park-outline:chip',
    color: '#F56C6C',
    bgColor: '#FEF0F0',
    route: '/chipPackaging/chipPackagingWip',
    description: '封装进度查询'
  },
  {
    id: 'wafer-purchase-wip',
    title: '晶圆进度',
    subtitle: 'Wafer Purchase',
    icon: 'vi-tabler:percentage-33',
    color: '#9C27B0',
    bgColor: '#F3E5F5',
    route: '/waferPurchase/waferPurchaseWip',
    description: '晶圆采购进度查询'
  },
  {
    id: 'global-report',
    title: '外协报表',
    subtitle: 'Global Report',
    icon: 'vi-fluent-mdl2:table-last-column',
    color: '#00B8A9',
    bgColor: '#E0F7FA',
    route: '/report/global',
    description: '外协库存、封装、采购等综合报表'
  },
  {
    id: 'file-management',
    title: '文件管理',
    subtitle: 'File Management',
    icon: 'vi-line-md:folder-twotone',
    color: '#909399',
    bgColor: '#F4F4F5',
    route: '/function/file',
    description: '文件管理'
  }
])

// 处理点击事件
const handleEntryClick = (entry: any) => {
  router.push(entry.route)
}

// 获取当前时间
const currentTime = ref(new Date())
const timeString = computed(() => {
  return currentTime.value.toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
})
const dateString = computed(() => {
  return currentTime.value.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
})

// 更新时间
setInterval(() => {
  currentTime.value = new Date()
}, 1000)
</script>

<template>
  <div class="home-page">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <div class="welcome-text">
          <h1 class="welcome-title">欢迎回来</h1>
          <p class="welcome-subtitle">开始您的工作日</p>
        </div>
        <div class="time-display">
          <div class="time">{{ timeString }}</div>
          <div class="date">{{ dateString }}</div>
        </div>
      </div>
    </div>

    <!-- 快捷入口区域 -->
    <div class="quick-entries-section">
      <div class="section-header">
        <h2 class="section-title">快捷入口</h2>
        <p class="section-subtitle">快速访问常用功能</p>
      </div>

      <div class="entries-grid">
        <div
          v-for="entry in quickEntries"
          :key="entry.id"
          class="entry-card"
          :class="getPrefixCls('entry-card')"
          @click="handleEntryClick(entry)"
        >
          <div class="entry-icon" :style="{ backgroundColor: entry.bgColor, color: entry.color }">
            <Icon :icon="entry.icon" :size="32" />
          </div>
          <div class="entry-content">
            <h3 class="entry-title">{{ entry.title }}</h3>
            <p class="entry-subtitle">{{ entry.subtitle }}</p>
            <p class="entry-description">{{ entry.description }}</p>
          </div>
          <div class="entry-arrow">
            <Icon icon="vi-icon-park-outline:right" :size="16" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>


// 响应式断点
@media (width <= 1024px) {
  .entries-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
}

@media (width <= 768px) {
  .welcome-section {
    padding: 30px 0;
    margin-bottom: 30px;
  }

  .quick-entries-section {
    padding: 0 16px;
    margin-bottom: 30px;
  }

  .entries-grid {
    gap: 16px;
  }

  .entry-card {
    padding: 20px;
  }
}

@media (width <= 480px) {
  .welcome-section {
    padding: 24px 0;
  }

  .welcome-title {
    font-size: 1.8rem;
  }

  .time {
    font-size: 1.3rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .entry-card {
    padding: 16px;
  }

  .entry-icon {
    width: 48px;
    height: 48px;
  }
}

.home-page {
  min-height: 100vh;
  padding: 0;
}

.welcome-section {
  padding: 40px 0;
  margin-bottom: 40px;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .welcome-content {
    display: flex;
    max-width: 1200px;
    padding: 0 24px;
    margin: 0 auto;
    justify-content: space-between;
    align-items: center;

    @media (width <= 768px) {
      flex-direction: column;
      gap: 20px;
      text-align: center;
    }
  }

  .welcome-title {
    margin: 0 0 8px;
    font-size: 2.5rem;
    font-weight: 700;
    background: linear-gradient(45deg, #fff, #f0f0f0);
    background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;

    @media (width <= 768px) {
      font-size: 2rem;
    }
  }

  .welcome-subtitle {
    margin: 0;
    font-size: 1.1rem;
    opacity: 0.9;
  }

  .time-display {
    text-align: right;

    @media (width <= 768px) {
      text-align: center;
    }

    .time {
      margin-bottom: 4px;
      font-size: 2rem;
      font-weight: 600;

      @media (width <= 768px) {
        font-size: 1.5rem;
      }
    }

    .date {
      font-size: 0.9rem;
      opacity: 0.8;
    }
  }
}

.quick-entries-section {
  max-width: 1200px;
  padding: 0 24px;
  margin: 0 auto 40px;
}

.section-header {
  margin-bottom: 32px;
  text-align: center;

  .section-title {
    margin: 0 0 8px;
    font-size: 1.8rem;
    font-weight: 600;
    color: #2c3e50;
  }

  .section-subtitle {
    margin: 0;
    font-size: 1rem;
    color: #7f8c8d;
  }
}

.entries-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;

  @media (width <= 640px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

.entry-card {
  position: relative;
  display: flex;
  padding: 24px;
  overflow: hidden;
  cursor: pointer;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgb(0 0 0 / 8%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  align-items: center;
  gap: 16px;

  &::before {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    content: '';
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgb(0 0 0 / 12%);

    &::before {
      transform: scaleX(1);
    }

    .entry-arrow {
      opacity: 1;
      transform: translateX(4px);
    }
  }
}

.entry-icon {
  display: flex;
  width: 64px;
  height: 64px;
  border-radius: 12px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.entry-content {
  flex: 1;

  .entry-title {
    margin: 0 0 4px;
    font-size: 1.2rem;
    font-weight: 600;
    color: #2c3e50;
  }

  .entry-subtitle {
    margin: 0 0 8px;
    font-size: 0.9rem;
    font-weight: 500;
    color: #7f8c8d;
  }

  .entry-description {
    margin: 0;
    font-size: 0.85rem;
    line-height: 1.4;
    color: #95a5a6;
  }
}

.entry-arrow {
  color: #bdc3c7;
  opacity: 0.6;
  transition: all 0.3s ease;
}
</style>
