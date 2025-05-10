<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Icon } from '@/components/Icon'

const router = useRouter()

// 快捷方式配置
const shortcuts = [
  {
    title: '封装进度',
    icon: 'vi-icon-park-solid:chip',
    path: '/assy/wip',
    color: '#409EFF',
    description: '封装进度查询'
  },
  {
    title: '晶圆进度',
    icon: 'vi-hugeicons:cd',
    path: '/purchase/wip',
    color: '#9B59B6',
    description: '晶圆进度查询'
  },
  {
    title: '库存查询',
    icon: 'vi-lsicon:goods-outline',
    path: '/stock',
    color: '#67C23A',
    description: '库存数据查询'
  },
  {
    title: 'S&OP报表',
    icon: 'vi-ri:file-chart-line',
    path: '/report/sop',
    color: '#E6A23C',
    description: '产销协调报表'
  },
  {
    title: '实时外协报表',
    icon: 'vi-ri:global-line',
    path: '/report/global',
    color: '#F56C6C',
    description: '采购,封装,库存一站式查询(原周报表)'
  },
  {
    title: '芯片追溯',
    icon: 'vi-ri:git-branch-line',
    path: '/report/chipTrace',
    color: '#909399',
    description: '根据批号追溯芯片信息,原材料信息'
  }
]

// 处理卡片点击
const handleCardClick = (path: string) => {
  router.push(path)
}
</script>

<template>
  <div class="home-container">
    <!-- 欢迎信息 -->
    <div class="welcome-section">
      <h1 class="welcome-title">欢迎使用外协智能管理系统</h1>
      <p class="welcome-subtitle">高效管理，智能决策</p>
    </div>

    <!-- 快捷方式卡片 -->
    <div class="shortcuts-grid">
      <div
        v-for="(item, index) in shortcuts"
        :key="index"
        class="shortcut-card"
        :style="{ '--card-color': item.color }"
        @click="handleCardClick(item.path)"
      >
        <div class="card-icon">
          <Icon :icon="item.icon" :size="32" />
        </div>
        <div class="card-content">
          <h3 class="card-title">{{ item.title }}</h3>
          <p class="card-description">{{ item.description }}</p>
        </div>
        <div class="card-hover-effect"></div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 响应式调整
@media screen and (width <= 768px) {
  .home-container {
    padding: 16px;
  }

  .welcome-section {
    margin-bottom: 32px;

    .welcome-title {
      font-size: 2rem;
    }

    .welcome-subtitle {
      font-size: 1rem;
    }
  }

  .shortcuts-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

.home-container {
  min-height: calc(100vh - 120px);
  padding: 24px;
  background: linear-gradient(135deg, var(--el-bg-color) 0%, var(--el-bg-color-page) 100%);
}

.welcome-section {
  margin-bottom: 48px;
  text-align: center;
  animation: fadeInDown 0.8s ease-out;

  .welcome-title {
    margin-bottom: 16px;
    font-size: 2.5rem;
    font-weight: 600;
    color: var(--el-text-color-primary);
    background: linear-gradient(120deg, var(--el-color-primary) 0%, var(--el-color-success) 100%);
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .welcome-subtitle {
    font-size: 1.2rem;
    color: var(--el-text-color-secondary);
  }
}

.shortcuts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  padding: 0 12px;
}

.shortcut-card {
  position: relative;
  display: flex;
  padding: 24px;
  overflow: hidden;
  cursor: pointer;
  background: var(--el-bg-color);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 5%);
  animation: fadeInUp 0.8s ease-out;
  animation-fill-mode: both;
  transition: all 0.3s ease;

  .loop(@i) when (@i > 0) {
    &:nth-child(@{i}) {
      animation-delay: @i * 0.1s;
    }
    .loop(@i - 1);
  }
  .loop(6);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgb(0 0 0 / 10%);

    .card-hover-effect {
      opacity: 0.1;
      transform: scale(1);
    }
  }

  .card-icon {
    display: flex;
    width: 64px;
    height: 64px;
    margin-right: 20px;
    color: white;
    background: var(--card-color);
    border-radius: 12px;
    transition: all 0.3s ease;
    align-items: center;
    justify-content: center;
  }

  .card-content {
    flex: 1;

    .card-title {
      margin-bottom: 8px;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .card-description {
      font-size: 0.875rem;
      line-height: 1.5;
      color: var(--el-text-color-secondary);
    }
  }

  .card-hover-effect {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;
    width: 100%;
    height: 100%;
    background: var(--card-color);
    opacity: 0;
    transform: scale(0.8);
    transition: all 0.3s ease;
  }
}
</style>
