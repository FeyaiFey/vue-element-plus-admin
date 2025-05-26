<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Icon } from '@/components/Icon'

const router = useRouter()

// 快捷方式配置
const shortcuts = [
  {
    title: '封装历史记录',
    icon: 'vi-ic:baseline-history',
    path: '/assy/table',
    color: '#4CAE4F',
    description: '封装历史记录查询'
  },
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
  },
  {
    title: '销售BI',
    icon: 'vi-solar:chart-linear',
    path: '/sale/analyze',
    color: '#c21f30',
    description: '销售相关图表展示分析'
  },
  {
    title: '文件管理',
    icon: 'vi-iconoir:folder',
    path: '/file',
    color: '#ff6d1f',
    description: '打线图，框架图，环保资料等下载功能'
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
      <h1 class="welcome-title">外协管理系统</h1>
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

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }
}

// 响应式断点优化
@media screen and (width <= 1200px) {
  .shortcuts-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
}

@media screen and (width <= 768px) {
  .home-container {
    padding: 16px;
  }

  .shortcuts-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 0 8px;
  }

  .shortcut-card {
    padding: 20px;

    .card-icon {
      width: 56px;
      height: 56px;
      margin-right: 16px;
    }
  }
}

@media screen and (width <= 480px) {
  .shortcut-card {
    padding: 24px 16px;
    text-align: center;
    flex-direction: column;

    .card-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 16px;
    }

    .card-content {
      .card-title {
        font-size: 1.2rem;
      }

      .card-description {
        font-size: 0.9rem;
      }
    }
  }
}

// 超大屏幕适配
@media screen and (width >= 1600px) {
  .shortcuts-grid {
    grid-template-columns: repeat(4, 1fr);
    max-width: 1600px;
  }
}

// 高分辨率屏幕优化
@media screen and (resolution >= 2dppx) {
  .shortcut-card {
    .card-icon {
      box-shadow: 0 2px 8px rgb(0 0 0 / 20%);
    }
  }
}

// 减少动画的用户偏好设置
@media (prefers-reduced-motion: reduce) {
  .shortcut-card {
    animation: none;
    transition: none;

    &:hover {
      transform: none;
      animation: none;

      .card-icon {
        transform: none;
        animation: none;
      }
    }
  }

  .welcome-section {
    animation: none;
  }
}

// 打印样式
@media print {
  .home-container {
    color: black;
    background: white;
  }

  .shortcut-card {
    border: 1px solid #ccc;
    box-shadow: none;
    break-inside: avoid;
  }
}

.home-container {
  min-height: calc(100vh - 120px);
  padding: clamp(16px, 4vw, 32px);
  background: linear-gradient(135deg, var(--el-bg-color) 0%, var(--el-bg-color-page) 100%);

  // 暗色模式适配
  .dark & {
    background: linear-gradient(135deg, var(--el-bg-color-page) 0%, #1a1a1a 100%);
  }
}

.welcome-section {
  margin-bottom: clamp(32px, 6vw, 64px);
  text-align: center;
  animation: fadeInDown 0.8s ease-out;

  .welcome-title {
    margin-bottom: clamp(12px, 2vw, 24px);
    font-size: clamp(1.8rem, 4vw, 3rem);
    font-weight: 700;
    line-height: 1.2;
    color: var(--el-text-color-primary);
    background: linear-gradient(120deg, var(--el-color-primary) 0%, var(--el-color-success) 100%);
    background-clip: text;
    -webkit-text-fill-color: transparent;

    // 暗色模式下的渐变调整
    .dark & {
      background: linear-gradient(120deg, #409eff 0%, #67c23a 100%);
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }

  .welcome-subtitle {
    font-size: clamp(1rem, 2vw, 1.4rem);
    font-weight: 400;
    color: var(--el-text-color-secondary);
  }
}

.shortcuts-grid {
  display: grid;
  max-width: 1400px;
  padding: 0 clamp(8px, 2vw, 24px);
  margin: 0 auto;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: clamp(16px, 3vw, 32px);
}

.shortcut-card {
  position: relative;
  display: flex;
  padding: clamp(20px, 3vw, 32px);
  overflow: hidden;
  cursor: pointer;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 16px;
  box-shadow:
    0 4px 12px rgb(0 0 0 / 5%),
    0 2px 4px rgb(0 0 0 / 2%);
  animation: fadeInUp 0.8s ease-out;
  animation-fill-mode: both;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);

  // 暗色模式适配
  .dark & {
    background: rgb(255 255 255 / 5%);
    border-color: var(--el-border-color-dark);
    box-shadow:
      0 4px 12px rgb(0 0 0 / 20%),
      0 2px 4px rgb(0 0 0 / 10%);
  }

  // 动画延迟
  .loop(@i) when (@i > 0) {
    &:nth-child(@{i}) {
      animation-delay: @i * 0.1s;
    }
    .loop(@i - 1);
  }
  .loop(12);

  &:hover {
    border-color: var(--el-color-primary-light-7);
    transform: translateY(-8px) scale(1.02);
    box-shadow:
      0 12px 32px rgb(0 0 0 / 12%),
      0 4px 8px rgb(0 0 0 / 4%);

    .dark & {
      box-shadow:
        0 12px 32px rgb(0 0 0 / 30%),
        0 4px 8px rgb(0 0 0 / 20%);
    }

    .card-icon {
      transform: scale(1.1);
      animation: pulse 1s infinite;
    }

    .card-hover-effect {
      opacity: 0.08;
      transform: scale(1);
    }
  }

  &:active {
    transform: translateY(-4px) scale(0.98);
  }

  .card-icon {
    display: flex;
    width: clamp(48px, 8vw, 72px);
    height: clamp(48px, 8vw, 72px);
    margin-right: clamp(16px, 3vw, 24px);
    color: white;
    background: var(--card-color);
    border-radius: 14px;
    box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    align-items: center;
    justify-content: center;

    // 暗色模式下图标容器的阴影调整
    .dark & {
      box-shadow: 0 4px 12px rgb(0 0 0 / 30%);
    }
  }

  .card-content {
    flex: 1;
    min-width: 0; // 防止文本溢出

    .card-title {
      margin-bottom: clamp(6px, 1vw, 12px);
      font-size: clamp(1.1rem, 2.5vw, 1.4rem);
      font-weight: 600;
      line-height: 1.3;
      color: var(--el-text-color-primary);
      word-wrap: break-word;
    }

    .card-description {
      display: -webkit-box;
      overflow: hidden;
      font-size: clamp(0.8rem, 1.8vw, 1rem);
      line-height: 1.6;
      color: var(--el-text-color-secondary);
      word-wrap: break-word;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      line-clamp: 2;
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
    border-radius: inherit;
    opacity: 0;
    transform: scale(0.8);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  // 确保内容在悬停效果之上
  .card-icon,
  .card-content {
    position: relative;
    z-index: 1;
  }
}
</style>
