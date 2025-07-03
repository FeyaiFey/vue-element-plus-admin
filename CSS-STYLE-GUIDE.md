# Vue Element Plus Admin - CSS 样式系统指南

## 概述

本文档基于项目中 `Login.vue` 和 `LoginForm.vue` 的CSS写法，详细介绍了项目的样式系统架构、最佳实践和使用规范。

## 技术栈

- **Vue 3.4.32** + **TypeScript 5.5.3**
- **Element Plus 2.7.7** - UI组件库
- **UnoCSS 0.61.5** - 原子化CSS框架
- **LESS 4.2.0** - CSS预处理器
- **Animate.css 4.1.1** - 动画库

## 样式系统架构

### 1. 样式层次结构

```
src/styles/
├── index.less          # 主样式入口
├── var.css            # CSS变量定义
└── variables.module.less  # LESS变量导出
```

### 2. 设计系统核心

#### CSS变量系统 (`src/styles/var.css`)

```css
:root {
  /* 登录页面 */
  --login-bg-color: #293146;

  /* 左侧菜单 */
  --left-menu-max-width: 200px;
  --left-menu-min-width: 64px;
  --left-menu-bg-color: #001529;
  --left-menu-text-color: #bfcbd9;

  /* 头部 */
  --top-header-bg-color: '#fff';
  --top-header-hover-color: #f6f6f6;

  /* 过渡动画 */
  --transition-time-02: 0.2s;
}

/* 暗色主题变量 */
.dark {
  --app-content-bg-color: var(--el-bg-color);
}
```

#### 命名空间系统

```typescript
// src/hooks/web/useDesign.ts
export const useDesign = () => {
  const getPrefixCls = (scope: string) => {
    return `${lessVariables.namespace}-${scope}` // v-login
  }
}
```

## 样式编写规范

### 1. Login.vue 样式分析

#### UnoCSS 原子化类名使用

```vue
<template>
  <div :class="prefixCls" class="h-[100%] relative lt-xl:bg-[var(--login-bg-color)] lt-sm:px-10px">
    <!-- 内容 -->
  </div>
</template>
```

**关键特性：**

- `h-[100%]` - 自定义高度值
- `lt-xl:bg-[var(--login-bg-color)]` - 响应式断点 + CSS变量
- `lt-sm:px-10px` - 小屏幕下的内边距

#### 响应式断点系统

```css
/* UnoCSS 响应式前缀 */
lt-xl:   /* 小于 xl (1280px) */
lt-lg:   /* 小于 lg (1024px) */
lt-md:   /* 小于 md (768px) */
lt-sm:   /* 小于 sm (640px) */

at-2xl:  /* 大于等于 2xl (1536px) */
at-xl:   /* 大于等于 xl (1280px) */
at-lg:   /* 大于等于 lg (1024px) */
at-md:   /* 大于等于 md (768px) */
```

#### LESS + BEM 命名规范

```less
<style lang="less" scoped>
@prefix-cls: ~'@{adminNamespace}-login'; // v-login

.@{prefix-cls} {
  overflow: auto;

  &__left {
    &::before {
      position: absolute;
      background-image: url('@/assets/svgs/login-bg.svg');
      background-position: center;
      background-repeat: no-repeat;
      content: '';
    }
  }
}
</style>
```

### 2. LoginForm.vue TSX 样式写法

#### TSX 中的样式应用

```typescript
// 在 TSX 中使用类名
const schema = reactive<FormSchema[]>([
  {
    field: 'title',
    formItemProps: {
      slots: {
        default: () => {
          return <h2 class="text-2xl font-bold text-center w-[100%]">
            {t('login.login')}
          </h2>
        }
      }
    }
  }
])
```

#### 深度选择器使用

```vue
<style>
.dark:(border-1 border-[var(--el-border-color)] border-solid)

/* Element Plus 组件样式覆盖 */
:deep(.el-form-item__label) {
  color: var(--el-text-color-regular);
  font-weight: 500;
}
</style>
```

## UnoCSS 配置详解

### 自定义规则 (`uno.config.ts`)

```typescript
export default defineConfig({
  rules: [
    // 文本省略
    [
      /^overflow-ellipsis$/,
      () => ({
        'text-overflow': 'ellipsis'
      })
    ],

    // 自定义悬停效果
    [
      /^custom-hover$/,
      ([], { rawSelector }) => {
        const selector = e(rawSelector)
        return `
        ${selector} {
          display: flex;
          cursor: pointer;
          transition: background var(--transition-time-02);
        }
        ${selector}:hover {
          background-color: var(--top-header-hover-color);
        }
      `
      }
    ],

    // 布局边框
    [
      /^layout-border__(left|right|top|bottom)$/,
      (matches, { rawSelector }) => {
        // 动态生成边框样式
      }
    ]
  ],

  // 预设配置
  presets: [presetUno({ dark: 'class', attributify: false }), ...createPresetIcons()],

  // 变体组转换器
  transformers: [transformerVariantGroup()]
})
```

## 动画系统

### Animate.css 集成

```vue
<template>
  <TransitionGroup appear tag="div" enter-active-class="animate__animated animate__bounceInLeft">
    <img src="@/assets/svgs/login-box-bg.svg" key="1" />
    <div class="text-3xl text-white" key="2">欢迎</div>
  </TransitionGroup>
</template>
```

### 过渡动画类名

```css
/* 常用动画类名 */
animate__animated animate__bounceInLeft    /* 左侧弹入 */
animate__animated animate__bounceInRight   /* 右侧弹入 */
animate__animated animate__fadeIn          /* 淡入 */
animate__animated animate__slideInUp       /* 上滑进入 */
```

## 最佳实践

### 1. 样式组织原则

```vue
<template>
  <!-- 1. 使用语义化的class命名 -->
  <div :class="prefixCls" class="container-styles">
    <!-- 2. 响应式优先 -->
    <div class="lt-md:hidden lg:flex">
      <!-- 3. 原子化类名组合 -->
      <div class="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm"> 内容 </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
// 4. 使用BEM命名规范和命名空间
@prefix-cls: ~'@{adminNamespace}-component-name';

.@{prefix-cls} {
  // 5. 组件级别的样式
  .container-styles {
    // 6. 使用CSS变量保持主题一致性
    background-color: var(--el-bg-color);
    transition: all var(--transition-time-02);

    // 7. 嵌套选择器
    &__content {
      padding: 20px;

      // 8. Element Plus 组件样式覆盖
      :deep(.el-button) {
        border-radius: 6px;
      }
    }
  }
}
</style>
```

### 2. 响应式设计模式

```vue
<template>
  <!-- 移动优先设计 -->
  <div
    class="
    p-4 
    lt-md:p-2 
    md:p-6 
    lg:p-8
    flex 
    flex-col 
    md:flex-row
    gap-4
    md:gap-6
  "
  >
    <!-- 内容 -->
  </div>
</template>
```

### 3. 主题切换支持

```vue
<template>
  <!-- 支持明暗主题 -->
  <div
    class="
    bg-white 
    dark:bg-gray-800 
    text-gray-900 
    dark:text-white
    border 
    border-gray-200 
    dark:border-gray-700
  "
  >
    主题内容
  </div>
</template>
```

### 4. 性能优化

```vue
<style lang="less" scoped>
.component {
  // 使用 GPU 加速
  transform: translateZ(0);

  // 优化过渡动画
  transition: transform var(--transition-time-02) ease-out;

  // 避免重排重绘
  will-change: transform;

  &:hover {
    transform: translateY(-2px);
  }
}
</style>
```

## 常用工具类

### 1. 布局类

```html
<!-- Flexbox 布局 -->
<div class="flex items-center justify-between">
  <div class="flex-1 flex-col gap-4">
    <!-- Grid 布局 -->
    <div class="grid grid-cols-3 gap-4">
      <div class="col-span-2">
        <!-- 定位 -->
        <div class="relative"> <div class="absolute top-0 right-0"></div></div></div></div></div
></div>
```

### 2. 间距类

```html
<!-- 内边距 -->
<div class="p-4 px-6 py-2">
  <!-- 外边距 -->
  <div class="m-4 mx-auto my-6">
    <!-- 间隙 -->
    <div class="flex gap-4"> <div class="grid gap-x-4 gap-y-6"></div></div></div
></div>
```

### 3. 字体类

```html
<!-- 字体大小 -->
<div class="text-sm text-base text-lg text-xl text-2xl">
  <!-- 字体粗细 -->
  <div class="font-normal font-medium font-bold">
    <!-- 文本对齐 -->
    <div class="text-left text-center text-right"></div></div
></div>
```

## 组件样式模板

### 基础组件样式模板

```vue
<template>
  <div :class="[prefixCls, `${prefixCls}--${size}`]" class="base-component">
    <div :class="`${prefixCls}__header`">
      <slot name="header"></slot>
    </div>
    <div :class="`${prefixCls}__content`">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDesign } from '@/hooks/web/useDesign'

interface Props {
  size?: 'small' | 'medium' | 'large'
}

withDefaults(defineProps<Props>(), {
  size: 'medium'
})

const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('base-component')
</script>

<style lang="less" scoped>
@prefix-cls: ~'@{adminNamespace}-base-component';

.@{prefix-cls} {
  border-radius: 8px;
  background-color: var(--el-bg-color);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  transition: all var(--transition-time-02);

  &--small {
    padding: 12px;
  }

  &--medium {
    padding: 16px;
  }

  &--large {
    padding: 20px;
  }

  &__header {
    margin-bottom: 16px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  &__content {
    color: var(--el-text-color-regular);
    line-height: 1.6;
  }

  // 响应式处理
  @media (max-width: 768px) {
    padding: 12px;

    &__header {
      margin-bottom: 12px;
      font-size: 14px;
    }
  }
}
</style>
```

## 调试技巧

### 1. UnoCSS 开发工具

```bash
# 查看生成的 CSS
npm run dev
# 访问 http://localhost:3000/__unocss
```

### 2. 样式调试

```vue
<style lang="less" scoped>
.debug {
  // 临时调试边框
  * {
    outline: 1px solid red;
  }

  // 调试信息
  &::before {
    content: 'Debug: Component Name';
    position: fixed;
    top: 0;
    left: 0;
    background: red;
    color: white;
    z-index: 9999;
  }
}
</style>
```

## 总结

本样式系统通过以下几个核心特性实现了高效、可维护的CSS架构：

1. **原子化设计** - UnoCSS提供灵活的原子化类名
2. **设计令牌** - CSS变量确保设计一致性
3. **响应式优先** - 移动端优先的响应式设计
4. **组件化** - BEM + 命名空间的组件样式隔离
5. **主题系统** - 完整的明暗主题支持
6. **性能优化** - 按需生成，体积最小化

通过遵循这些规范和最佳实践，可以构建出既美观又高性能的用户界面。
