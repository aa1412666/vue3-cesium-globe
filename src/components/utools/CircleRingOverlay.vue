<template>
  <Transition name="el-fade-in" appear>
    <div v-if="visible" class="circle-ring-overlay">
      <div class="circle-ring">
        <!-- 外圆 -->
        <div class="outer-circle"></div>
        <!-- 内圆 -->
        <div class="inner-circle"></div>
        <!-- 环形毛玻璃区域作为父容器 -->
        <Transition name="el-zoom-in-center" appear :duration="{ enter: 600, leave: 400 }">
          <div v-if="visible" class="ring-area">
            <!-- 圆环项目容器作为子元素 -->
            <Transition name="el-fade-in-linear" appear :duration="{ enter: 800, leave: 400 }">
              <div v-if="visible" class="circular-items-container">
                <!-- 环形分布的选择器项目 -->
                <!-- 使用固定的DOM元素，只更新内容和样式 -->
                <div class="items-wrapper">
                  <div 
                    v-for="(item, index) in circularItems" 
                    :key="item.id"
                    :class="['circular-picker-item', { 'selected': index === selectedCircularIndex }]"
                    :style="getCircularItemStyle(index)"
                    @click="index === selectedCircularIndex ? handleItemClick(item) : null"
                  >
                    <div class="item-content">{{ item.label }}</div>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </Transition>
      <!-- 滚轮交互区域 -->
      <div class="ring-interaction-area" @wheel.prevent="handleWheel"></div>
    </div>
  </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from "vue";

// Props
interface Props {
  visible: boolean;
}

const props = defineProps<Props>();

// 按钮配置接口
interface ButtonConfig {
  id: string;
  label: string;
  action: () => void;
  icon?: string;
  description?: string;
}

// 滚轮选择器数据配置
const buttonConfigs: ButtonConfig[] = [
  { id: 'A', label: 'A.红蓝双方兵势概览', action: () => handleActionA(), description: '功能A' },
  { id: 'B', label: 'B.蓝方兵力部署', action: () => handleActionB(), description: '功能B' },
  { id: 'C', label: 'C.蓝方J15作战机', action: () => handleActionC(), description: '功能C' },
  { id: 'D', label: 'D.蓝方KJ200作战机', action: () => handleActionD(), description: '功能D' },
  { id: 'E', label: 'E.蓝方基站雷达', action: () => handleActionE(), description: '功能E' },
  { id: 'F', label: 'F.红方兵力部署', action: () => handleActionF(), description: '功能F' },
  { id: 'G', label: 'G.红方KJ200作战机', action: () => handleActionG(), description: '功能G' },
  { id: 'H', label: 'H.红方兵力-J20作战机', action: () => handleActionH(), description: '功能H' },
  { id: 'I', label: 'I.红方指挥所', action: () => handleActionI(), description: '功能I' },
  { id: 'J', label: 'J.红方红旗16', action: () => handleActionJ(), description: '功能J' },
  { id: 'K', label: 'K.蓝方潜艇部队', action: () => handleActionK(), description: '功能K' },
  { id: 'L', label: 'L.红方装甲集群', action: () => handleActionL(), description: '功能L' },
  { id: 'M', label: 'M.蓝方空降兵', action: () => handleActionM(), description: '功能M' },
  { id: 'N', label: 'N.红方防空网', action: () => handleActionN(), description: '功能N' },
  { id: 'O', label: 'O.蓝方航母战斗群', action: () => handleActionO(), description: '功能O' },
  { id: 'P', label: 'P.红方特种部队', action: () => handleActionP(), description: '功能P' },
  { id: 'Q', label: 'Q.蓝方炮兵阵地', action: () => handleActionQ(), description: '功能Q' },
  { id: 'R', label: 'R.红方侦察卫星', action: () => handleActionR(), description: '功能R' },
  { id: 'S', label: 'S.蓝方工程兵', action: () => handleActionS(), description: '功能S' },
  { id: 'T', label: 'T.红方指挥链路', action: () => handleActionT(), description: '功能T' },
  { id: 'U', label: 'U.红方预警机', action: () => handleActionU(), description: '功能U' },
  { id: 'V', label: 'V.蓝方护卫舰', action: () => handleActionV(), description: '功能V' },
  { id: 'W', label: 'W.红方导弹阵地', action: () => handleActionW(), description: '功能W' },
  { id: 'X', label: 'X.蓝方电子战', action: () => handleActionX(), description: '功能X' },
  { id: 'Y', label: 'Y.红方补给线', action: () => handleActionY(), description: '功能Y' },
  { id: 'Z', label: 'Z.综合态势评估', action: () => handleActionZ(), description: '功能Z' },
];

const currentIndex = ref(0);
const totalVisibleItems = 12; // 圆环上显示的项目总数

// 功能处理函数
const handleActionA = () => console.log('执行功能A');
const handleActionB = () => console.log('执行功能B');
const handleActionC = () => console.log('执行功能C');
const handleActionD = () => console.log('执行功能D');
const handleActionE = () => console.log('执行功能E');
const handleActionF = () => console.log('执行功能F');
const handleActionG = () => console.log('执行功能G');
const handleActionH = () => console.log('执行功能H');
const handleActionI = () => console.log('执行功能I');
const handleActionJ = () => console.log('执行功能J');
const handleActionK = () => console.log('执行功能K');
const handleActionL = () => console.log('执行功能L');
const handleActionM = () => console.log('执行功能M');
const handleActionN = () => console.log('执行功能N');
const handleActionO = () => console.log('执行功能O');
const handleActionP = () => console.log('执行功能P');
const handleActionQ = () => console.log('执行功能Q');
const handleActionR = () => console.log('执行功能R');
const handleActionS = () => console.log('执行功能S');
const handleActionT = () => console.log('执行功能T');
const handleActionU = () => console.log('执行功能U');
const handleActionV = () => console.log('执行功能V');
const handleActionW = () => console.log('执行功能W');
const handleActionX = () => console.log('执行功能X');
const handleActionY = () => console.log('执行功能Y');
const handleActionZ = () => console.log('执行功能Z');

// 计算可见项目列表
const visibleItems = computed(() => {
  const result: string[] = [];
  for (let i = -2; i <= 2; i++) {
    const index = (currentIndex.value + i + buttonConfigs.length) % buttonConfigs.length;
    result.push(buttonConfigs[index].label);
  }
  return result;
});

// 计算圆环上的项目分布
const circularItems = computed(() => {
  const result: ButtonConfig[] = [];
  for (let i = 0; i < totalVisibleItems; i++) {
    const index = (currentIndex.value + i - Math.floor(totalVisibleItems / 2) + buttonConfigs.length) % buttonConfigs.length;
    result.push(buttonConfigs[index]);
  }
  return result;
});

// 当前选中项目的索引（水平中心线位置）
const selectedCircularIndex = computed(() => {
  // 选中0度位置的项目（正右方，水平中心线）
  return Math.floor(totalVisibleItems / 2);
});

// 计算圆环项目的位置样式 - 优化版本（相对于父容器定位）
const getCircularItemStyle = (index: number) => {
  const totalItems = totalVisibleItems;
  // 在右半圆分布（-90度到+90度）
  const startAngle = -90; // 正上方
  const endAngle = 90;    // 正下方
  const angleRange = endAngle - startAngle; // 180度范围
  
  // 角度计算：确保索引6对应0度（水平中心线）
  let angle = startAngle + (index / (totalItems - 1)) * angleRange;
  const centerOffset = 180 / (totalItems - 1) / 2; // 角度偏移量
  angle -= centerOffset;
  
  // 圆环半径计算 - 相对于父容器的中心
  const ringRadius = 50; // vh单位，对应父容器的内圆半径
  const itemOffset = 100; // 像素偏移，项目在环形区域内的位置
  
  const radian = (angle * Math.PI) / 180;
  const totalRadius = ringRadius; // 使用vh单位保持一致性
  
  // 计算相对于父容器中心的偏移（使用百分比定位）
  const offsetX = Math.cos(radian) * totalRadius;
  const offsetY = Math.sin(radian) * totalRadius;
  
  // 选中项目的视觉效果
  const isSelected = index === selectedCircularIndex.value;
  const scale = isSelected ? 1.2 : 1;
  const opacity = isSelected ? 1 : 0.8;
  
  return {
    position: 'absolute' as const,
    // 使用百分比定位，相对于父容器(.ring-area)的中心
    left: `calc(50% + ${offsetX}vh + ${itemOffset}px)`,
    top: `calc(50% + ${offsetY}vh)`,
    transform: `translate(-50%, -50%) scale(${scale})`,
    opacity: opacity,
    zIndex: isSelected ? 150 : 100,
    willChange: 'transform, opacity', // 优化重绘性能
  };
};

// 当前选中的按钮配置
const selectedItem = computed(() => {
  const selectedIndex = selectedCircularIndex.value;
  if (circularItems.value[selectedIndex]) {
    return circularItems.value[selectedIndex];
  }
  return buttonConfigs[currentIndex.value];
});

// 处理项目点击事件
const handleItemClick = (item: ButtonConfig) => {
  console.log(`点击了按钮: ${item.label} (${item.description})`);
  item.action();
};

// 处理滚轮事件 - 优化版本
const isScrolling = ref(false);
let scrollTimeout: number | null = null;

const handleWheel = (event: WheelEvent) => {
  event.stopPropagation(); // 避免影响 Cesium 地图
  
  // 防抖处理，避免过于频繁的滚动
  if (isScrolling.value) return;
  
  isScrolling.value = true;
  
  if (event.deltaY > 0) {
    // 向下滚动
    currentIndex.value = (currentIndex.value + 1) % buttonConfigs.length;
  } else {
    // 向上滚动
    currentIndex.value = (currentIndex.value - 1 + buttonConfigs.length) % buttonConfigs.length;
  }
  
  // 重置滚动状态
  if (scrollTimeout) clearTimeout(scrollTimeout);
  scrollTimeout = window.setTimeout(() => {
    isScrolling.value = false;
  }, 100); // 100ms 防抖
};

// 环形界面管理类
class CircleRingManager {
  private isVisible: boolean = false;
  private animationId: number | null = null;

  constructor() {
    this.init();
  }

  private init() {
    console.log('CircleRingManager initialized');
  }

  public show() {
    this.isVisible = true;
    this.startAnimation();
  }

  public hide() {
    this.isVisible = false;
    this.stopAnimation();
  }

  public toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  private startAnimation() {
    console.log('Starting circle ring animation');
  }

  private stopAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    console.log('Stopping circle ring animation');
  }

  public destroy() {
    this.stopAnimation();
    console.log('CircleRingManager destroyed');
  }

  get visible() {
    return this.isVisible;
  }
}

// 创建管理器实例
const ringManager = new CircleRingManager();

// 监听props变化
watch(() => props.visible, (newVal) => {
  if (newVal) {
    ringManager.show();
  } else {
    ringManager.hide();
  }
}, { immediate: true });

// 生命周期
onMounted(() => {
  console.log('CircleRingOverlay mounted');
});

onUnmounted(() => {
  // 清理定时器
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }
  ringManager.destroy();
});
</script>

<style scoped lang="scss">
/* 圆环覆盖层 */
.circle-ring-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10;
  pointer-events: none;
  background: rgba(0, 0, 0, 0.1);
}

.circle-ring {
  position: relative;
  width: 100%;
  height: 100%;
}

/* 内圆：左侧四分之一区域内侧的圆弧 */
.inner-circle {
  position: absolute;
  width: 100vh;
  height: 100vh;
  border: none;
  border-radius: 50%;
  background: transparent;
  left: calc(-100vh + 25vw - 50px);
  top: 0;
  z-index: 1;
}

/* 外圆：左侧四分之一区域外侧的圆弧 */
.outer-circle {
  position: absolute;
  width: calc(100vh + 400px);
  height: calc(100vh + 400px);
  border: none;
  border-radius: 50%;
  background: transparent;
  left: calc(-100vh - 200px + 25vw - 50px);
  top: -200px;
  z-index: 1;
}

/* 环形毛玻璃区域 - 作为父容器 */
.ring-area {
  position: absolute;
  width: calc(100vh + 400px);
  height: calc(100vh + 400px);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  mask: radial-gradient(circle at center, transparent 50vh, black calc(50vh + 1px), black calc(50vh + 200px - 1px), transparent calc(50vh + 200px));
  -webkit-mask: radial-gradient(circle at center, transparent 50vh, black calc(50vh + 1px), black calc(50vh + 200px - 1px), transparent calc(50vh + 200px));
  left: calc(-100vh - 200px + 25vw - 50px);
  top: -200px;
  pointer-events: none;
  z-index: 5;
}

/* 圆环项目容器 - 作为子元素，继承父容器的位置 */
.circular-items-container {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 50;
}

/* 项目包装器 */
.items-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

/* 优化的圆环选择器项目 */
.circular-picker-item {
  min-width: 80px;
  max-width: 200px;
  width: auto;
  height: 40px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  pointer-events: none;
  cursor: default;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  position: absolute;
  z-index: 100;
  white-space: nowrap;
  
  /* 使用 transform 属性进行硬件加速 */
  will-change: transform, opacity;
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94),
              opacity 0.3s ease,
              background 0.3s ease,
              border-color 0.3s ease,
              box-shadow 0.3s ease;
  
  /* 移除消耗性能的 backdrop-filter */
  /* backdrop-filter: blur(8px); */
}

/* 滚轮交互区域 */
.ring-interaction-area {
  position: absolute;
  left: 25vw;
  top: 0;
  width: 200px;
  height: 100vh;
  pointer-events: auto;
  cursor: default;
}

/* 滚轮选择器容器 */
.scroll-picker-container {
  position: absolute;
  top: 50%;
  left: calc(100vh + 200px - 25vw + 50px - 150px);
  transform: translateY(-50%);
  width: 300px;
  height: 400px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.circular-picker-item.selected {
  color: rgba(255, 255, 255, 1);
  background: rgba(255, 255, 255, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 0 25px rgba(255, 255, 255, 0.4);
  font-size: 14px;
  font-weight: 900;
  z-index: 150;
  animation: shimmer 2s ease-in-out infinite;
  pointer-events: auto;
  cursor: pointer;
}

.circular-picker-item.selected:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: translate(-50%, -50%) scale(1.15); /* 减小缩放避免过度动画 */
  box-shadow: 0 0 35px rgba(255, 255, 255, 0.6);
}

.circular-picker-item.selected:active {
  transform: translate(-50%, -50%) scale(1.1); /* 减小缩放 */
}

/* 闪光动画 */
@keyframes shimmer {
  0%, 100% {
    box-shadow: 0 0 25px rgba(255, 255, 255, 0.4);
    border-color: rgba(255, 255, 255, 0.7);
  }
  50% {
    box-shadow: 0 0 35px rgba(255, 255, 255, 0.8), 0 0 50px rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 1);
  }
}

.circular-picker-item .item-content {
  text-align: center;
  white-space: nowrap;
  overflow: visible;
  text-overflow: initial;
  width: auto;
}
</style>
