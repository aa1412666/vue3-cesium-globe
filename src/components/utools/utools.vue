<template>
  <!-- 功能按钮 -->
  <div class="top-left-button">
    <Transition name="el-zoom-in-center">
      <button
        class="tool-btn"
        :class="toolbarManager.functionButton.getButtonClasses()"
        title="功能按钮"
        @click="onFunctionClick"
        key="function-btn"
      >
        <svg
          t="1757410981676"
          class="icon function-icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="2513"
          width="200"
          height="200"
        >
          <path
            d="M177.738667 652.949333A364.074667 364.074667 0 0 0 331.306667 826.517333v-310.826666L192.490667 645.152c-4.298667 4.010667-9.397333 6.613333-14.752 7.808z m-19.989334-62.922666l209.706667-195.562667H170.666667c-0.618667 0-1.237333-0.010667-1.845334-0.053333A362.186667 362.186667 0 0 0 149.333333 512c0 26.784 2.901333 52.906667 8.416 78.026667z m302.08-195.562667a32.064 32.064 0 0 1-5.152 6.186667l-62.112 57.909333c1.76 3.957333 2.730667 8.341333 2.730667 12.949333v79.541334c3.584 1.642667 6.912 3.978667 9.802667 7.008l67.573333 70.848h90.570667l68.298666-72.938667v-95.872l-68.181333-66.826667c-2.773333 0.778667-5.685333 1.194667-8.693333 1.194667h-94.837334zM395.232 855.466667A362.218667 362.218667 0 0 0 512 874.666667c32.768 0 64.522667-4.341333 94.72-12.490667l-211.413333-221.653333V853.333333c0 0.714667-0.032 1.418667-0.074667 2.133334z m275.466667-17.269334a364.266667 364.266667 0 0 0 155.690666-145.28H533.706667l131.946666 138.346667c2.026667 2.133333 3.712 4.469333 5.045334 6.933333z m184.693333-209.216A362.208 362.208 0 0 0 874.666667 512c0-36.661333-5.44-72.053333-15.552-105.408L650.912 628.906667H853.333333c0.693333 0 1.376 0.021333 2.058667 0.064zM197.962667 330.464h301.312l-139.733334-136.938667a31.978667 31.978667 0 0 1-5.898666-7.893333A364.266667 364.266667 0 0 0 197.973333 330.474667z m220.373333-168.917333l213.205333 208.938666v-195.2c0-1.92 0.170667-3.786667 0.490667-5.621333A362.112 362.112 0 0 0 512 149.333333c-32.384 0-63.786667 4.245333-93.653333 12.213334zM695.552 446.613333V487.637333l134.432-143.573333c0.746667-0.8 1.546667-1.557333 2.346667-2.261333a364.373333 364.373333 0 0 0-136.778667-142.666667v247.488zM512 938.666667C276.362667 938.666667 85.333333 747.637333 85.333333 512S276.362667 85.333333 512 85.333333s426.666667 191.029333 426.666667 426.666667-191.029333 426.666667-426.666667 426.666667z"
            fill="#ffffff"
            p-id="2514"
          ></path>
        </svg>
      </button>
    </Transition>
  </div>

  <!-- 环形毛玻璃界面组件 -->
  <CircleRingOverlay :visible="showCircleRing" />

  <div class="left-toolbar">
    <div class="tool-wrapper">
      <Transition name="el-zoom-in-center">
        <button
          class="tool-btn"
          :class="toolbarManager.measureButton.getButtonClasses()"
          title="测量"
          @click="onMeasureClick"
          key="measure-btn"
        >
          <svg
            class="icon measure-icon"
            viewBox="0 0 1024 1024"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M725.333333 810.666667h85.333334v-213.333334h-384V213.333333H213.333333v85.333334h85.333334v85.333333H213.333333v85.333333h128v85.333334H213.333333v85.333333h85.333334v85.333333H213.333333v85.333334h85.333334v-85.333334h85.333333v85.333334h85.333333v-128h85.333334v128h85.333333v-85.333334h85.333333v85.333334z m-213.333333-298.666667h341.333333a42.666667 42.666667 0 0 1 42.666667 42.666667v298.666666a42.666667 42.666667 0 0 1-42.666667 42.666667H170.666667a42.666667 42.666667 0 0 1-42.666667-42.666667V170.666667a42.666667 42.666667 0 0 1 42.666667-42.666667h298.666666a42.666667 42.666667 0 0 1 42.666667 42.666667v341.333333z"
              fill="#ffffff"
            />
          </svg>
        </button>
      </Transition>
      <Transition name="el-fade-in-linear">
        <div v-if="showMeasureTools" class="measure-tools-panel">
          <span class="panel-title">测量工具</span>
          <!-- 行1: 空间距离 / 地表距离 / 投影距离 -->
          <button class="tool-btn" title="空间距离" @click="startMeasureLine">
            <svg
              class="icon"
              viewBox="0 0 1024 1024"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M128.2048 870.2976a25.6 25.6 0 0 1-25.6-25.6v-307.2a25.6 25.6 0 0 1 25.6-25.6h767.6416a25.6 25.6 0 0 1 25.6 25.6v307.2a25.6 25.6 0 0 1-25.6 25.6z m25.6-51.2h716.4416v-256h-25.6v59.7504a25.6 25.6 0 0 1-25.6 25.6 25.6 25.6 0 0 1-25.6-25.6v-59.7504h-102.4v59.7504a25.6 25.6 0 0 1-25.6 25.6 25.6 25.6 0 0 1-25.6-25.6v-59.7504h-102.4v128a25.6 25.6 0 0 1-25.6 25.6 25.6 25.6 0 0 1-25.6-25.6v-128h-102.4v59.7504a25.6 25.6 0 0 1-25.6 25.6 25.6 25.6 0 0 1-25.6-25.6v-59.7504h-102.4v59.7504a25.6 25.6 0 0 1-25.6 25.6 25.6 25.6 0 0 1-25.6-25.6v-59.7504h-25.6z m716.4416-384v-76.8H153.8048v76.8a25.6 25.6 0 0 1-25.6 25.6 25.6 25.6 0 0 1-25.6-25.6v-204.8a25.6 25.6 0 0 1 25.6-25.6 25.6 25.6 0 0 1 25.6 25.6v76.8h716.4416v-76.8a25.6 25.6 0 0 1 25.6-25.6 25.6 25.6 0 0 1 25.6 25.6v204.8a25.6 25.6 0 0 1-25.6 25.6 25.6 25.6 0 0 1-25.6-25.3952z"
                fill="#ffffff"
              />
            </svg>
          </button>
          <button class="tool-btn" title="地表距离" @click="startMeasureSurface">
            <svg
              class="icon"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M914.875124 582.451494H109.943394a97.587135 97.587135 0 0 0-97.041002 97.928468v245.759837a97.587135 97.587135 0 0 0 97.041002 97.928468h804.93173a97.621268 97.621268 0 0 0 97.075135-97.928468v-245.759837a97.621268 97.621268 0 0 0-97.075135-97.928468m11.434659 343.585905a11.502926 11.502926 0 0 1-11.434659 11.537059h-128.955648v-136.669776a28.569581 28.569581 0 1 0-57.105028 0v136.669776h-106.256996v-136.669776a28.569581 28.569581 0 1 0-57.105029 0v136.669776h-106.256996V755.916979a28.535448 28.535448 0 1 0-57.070895 0V937.574458H295.935803v-136.669776a28.535448 28.535448 0 1 0-57.070895 0v136.669776H109.943394a11.502926 11.502926 0 0 1-11.434659-11.537059v-245.759837a11.502926 11.502926 0 0 1 11.434659-11.537058h804.93173a11.502926 11.502926 0 0 1 11.434659 11.537058z"
                fill="#ffffff"
              />
              <path
                d="M985.36041 435.746526H881.731679L652.185165 19.900403A37.853841 37.853841 0 0 0 618.632121 0.000683a37.887975 37.887975 0 0 0-33.518911 20.00212L464.622624 240.230923 401.510133 143.360587a38.195175 38.195175 0 0 0-32.119446-17.544522 38.229308 38.229308 0 0 0-32.119445 17.578655l-189.098541 292.351806H39.458107a39.423974 39.423974 0 0 0 0 78.813814h945.902303a39.423974 39.423974 0 0 0 0-78.813814m-490.495673 0H236.851042l132.437245-201.386533 53.350365 82.227145-0.8192 1.467733z m297.983801-1.843199h-207.291595L512.409259 315.563139l107.895394-197.666002z"
                fill="#ffffff"
              />
            </svg>
          </button>
          <button class="tool-btn" title="投影距离" @click="startMeasureProjected">
            <svg
              class="icon"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M64 845.312V384h896L64 896v-50.688z m686.912-407.04H127.296v356.352l623.616-356.352zM960 320h-67.2V256H131.2v64H64V128h67.2v64h761.6V128H960v192z"
                fill="#ffffff"
              />
            </svg>
          </button>
          <!-- 行2: 投影面积 / 三角测量 / 方位角 -->
          <button class="tool-btn" title="投影面积" @click="startMeasureProjectedArea">
            <svg
              class="icon"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M512.016384 659.387733a92.740267 92.740267 0 0 1-51.780267-15.803733L107.604651 406.9376a93.047467 93.047467 0 0 1 0-154.487467L460.201984 15.803733a92.740267 92.740267 0 0 1 103.6288 0L916.359851 252.586667a93.013333 93.013333 0 0 1 0 154.487466l-352.4608 236.475734a92.910933 92.910933 0 0 1-51.848534 15.837866M510.173184 569.002667a3.413333 3.413333 0 0 0 3.754667 0l352.494933-236.578134a2.935467 2.935467 0 0 0 1.467733-2.730666 3.003733 3.003733 0 0 0-1.467733-2.7648L513.859584 90.350933a3.413333 3.413333 0 0 0-3.720533 0L157.644117 326.929067a3.003733 3.003733 0 0 0-1.467733 2.7648 2.935467 2.935467 0 0 0 1.467733 2.730666z"
                fill="#ffffff"
              />
              <path
                d="M916.359851 617.0624L759.790251 512l-80.4864 54.033067 187.050666 125.5424a3.003733 3.003733 0 0 1 1.467734 2.7648 3.037867 3.037867 0 0 1-1.467734 2.7648l-32.938666 22.084266-189.7472-129.194666-37.546667 25.258666 189.7472 129.2288-42.9056 28.808534-189.781333-129.2288a92.842667 92.842667 0 0 1-51.2 15.428266h-1.058134l204.356267 139.1616-49.527467 33.245867-355.874133-242.346667 34.747733-23.3472L264.174251 512l-156.535467 105.0624a93.013333 93.013333 0 0 0 0 154.487467l352.5632 236.612266a92.706133 92.706133 0 0 0 103.6288 0L916.359851 771.549867a93.013333 93.013333 0 0 0 0-154.487467m-402.432 316.586667a3.413333 3.413333 0 0 1-3.754667 0L157.609984 697.070933a3.106133 3.106133 0 0 1-1.4336-2.7648 3.037867 3.037867 0 0 1 1.4336-2.7648l27.477333-18.432 355.874134 242.346667zM578.439851 890.231467l-355.874134-242.346667 49.527467-33.245867 355.874133 242.346667z"
                fill="#ffffff"
              />
            </svg>
          </button>
          <button class="tool-btn" title="三角测量">
            <svg
              class="icon"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M63.578551 819.055503h827.002822v14.449671H63.578551z"
                fill="#ffffff"
              />
              <path
                d="M214.577611 826.280339h-14.449671c0-140.161806 104.760113-258.167451 243.71778-274.784572l1.685795 14.44967c-131.492004 15.65381-230.953904 127.638758-230.953904 260.334902z"
                fill="#ffffff"
              />
              <path
                d="M76.824083 826.280339h-14.449671C62.374412 597.734713 248.293509 411.815616 476.839135 411.815616c29.140169 0 58.039511 3.130762 86.216368 8.91063l-2.889934 14.208843c-27.213547-5.779868-55.149577-8.669802-83.326434-8.669802-220.598307 0-400.015052 179.416745-400.015052 400.015052zM891.303857 826.280339h-14.449671c0-107.890875-42.385701-209.279398-119.209783-284.899342l10.114769-10.355597c79.714017 78.509878 123.544685 183.510818 123.544685 295.254939z"
                fill="#ffffff"
              />
              <path
                d="M770.889934 833.505174H191.458137l579.431797-655.05174v655.05174z m-547.401693-14.449671h532.952022V216.745061L223.488241 819.055503z"
                fill="#ffffff"
              />
              <path
                d="M727.300094 685.636877H409.407338l317.892756-311.149577v311.149577z m-282.491063-14.449671H712.850423V408.925682L444.809031 671.187206z"
                fill="#ffffff"
              />
            </svg>
          </button>
          <button class="tool-btn" title="方位角">
            <svg
              class="icon"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M904.3 316.7L315.5 905.6c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L949.6 362c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0zM351.5 95.9v772.8c0 17.7 14.3 32 32 32s32-14.3 32-32V95.9c0-17.7-14.3-32-32-32s-32 14.3-32 32z m9.3 22.5l90.4 90.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-90.4-90.4c-12.5-12.5-32.8-12.5-45.3 0-12.5 12.6-12.5 32.8 0 45.3z m0-45.2l-90.4 90.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l90.4-90.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0z m281.6 519.9c-0.4-0.6-46.1-65.3-100.7-87.5l-0.2-0.1c-62.8-26.4-132.9-10.8-133.6-10.7l-7.1-31.2c3.3-0.7 80.9-18 153.1 12.3 63.4 25.8 112.7 95.9 114.8 98.8l-26.3 18.4z"
                fill="#ffffff"
              />
            </svg>
          </button>
          <button class="tool-btn" title="放置战斗机(左键放置,右键清除)" @click="placeFighter" @contextmenu.prevent="clearFighter">
            <svg
              class="icon"
              viewBox="0 0 1024 1024"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M928 512c0 35.3-28.7 64-64 64H656l-88 240h-64l-56-240H352l-80 96h-96l64-160-64-160h96l80 96h40l56-240h64l88 240h208c35.3 0 64 28.7 64 64z"
                fill="#ffffff"
              />
            </svg>
          </button>
          <button class="tool-btn" title="选择模型并放置(视野中心) | 右键撤销最近" @click="selectAndPlaceModel" @contextmenu.prevent="undoLastPlacedModel">
            <svg
              class="icon"
              viewBox="0 0 1024 1024"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M512 96l128 128H640V480H384V224H384L512 96z" fill="#ffffff"/>
              <path d="M256 512h512v256a64 64 0 0 1-64 64H320a64 64 0 0 1-64-64V512z" fill="#ffffff"/>
            </svg>
          </button>
        </div>
      </Transition>
    </div>
    <!-- 2D/3D 切换按钮（右上角常驻） -->
    <button
      class="tool-btn mode-toggle-btn"
      :title="is2D ? '切换到3D' : '切换到2D'"
      @click="toggle2D3D"
      key="toggle-2d3d-btn"
    >
      <span class="mode-label">{{ is2D ? '2D' : '3D' }}</span>
    </button>
    <!-- 风场(2D) 切换按钮 -->
    <button
      class="tool-btn"
      :class="{ active: wind2DEnabled }"
      :title="wind2DEnabled ? '关闭风场(仅2D)' : '开启风场(仅2D)'"
      @click="toggleWind2D"
      key="toggle-wind2d-btn"
    >
      <span class="mode-label">风</span>
    </button>
    <!-- 风场参数面板（仅开启时显示） -->
    <div v-if="wind2DEnabled" class="wind-panel">
      <div class="row">
        <label>粒子数量</label>
        <input type="range" min="300" max="4000" step="100" v-model.number="windParticleCount" @change="applyWindParticleCount"/>
        <span class="val">{{ windParticleCount }}</span>
      </div>
      <div class="row">
        <label>速度倍率</label>
        <input type="range" min="1" max="20" step="1" v-model.number="windSpeedScale" @change="applyWindSpeedScale"/>
        <span class="val">×{{ windSpeedScale }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue"; // 引入Vue的响应式和生命周期函数
import * as Cesium from "cesium";
import CircleRingOverlay from "./CircleRingOverlay.vue"; // 引入圆环界面组件
import MeasureTool from "../../utils/CesiumUtils/measureDistance";// 引入测量工具类
import MeasureSurfaceDistance from "../../utils/CesiumUtils/measureSurfaceDistance";// 引入测量地表距离类
import MeasureProjectedDistance from "../../utils/CesiumUtils/measureProjectedDistance";// 引入测量投影距离类
import MeasureProjectedArea from "../../utils/CesiumUtils/measureProjectedArea";// 引入测量投影面积类
import { addModelEntity } from "../../utils/CesiumUtils/addModel"; // 引入模型加载工具
import WindLayer2D from "../../utils/CesiumUtils/WindLayer2D"; // 引入2D风场图层（相对路径规避别名类型提示）
// 定义emit事件（声明 compass 以消除非声明监听警告）
const emit = defineEmits(["compass"]);

// 按钮基类
abstract class BaseButton {
  public isActive = ref(false);

  constructor(protected name: string) {}

  // 切换激活状态
  public toggleActive(): void {
    this.isActive.value = !this.isActive.value;
  }

  // 设置激活状态
  public setActive(active: boolean): void {
    this.isActive.value = active;
  }

  // 抽象方法：子类必须实现的点击处理逻辑
  abstract handleClick(): void;

  // 统一的点击处理流程
  public onClick(): void {
    this.handleClick();
  }

  // 获取按钮状态类名
  public getButtonClasses(): Record<string, boolean> {
    return {
      active: this.isActive.value,
    };
  }
}

// 测量按钮类
class MeasureButton extends BaseButton {
  constructor() {
    super("measure");
  }

  handleClick(): void {
    this.toggleActive();
    console.log(`${this.name} button clicked, active: ${this.isActive.value}`);
  }
}

// 启动测量线功能
const startMeasureLine = () => {
  const viewer = getViewer();
  if (!viewer) return console.warn('[utools] Viewer 未就绪，无法开始空间距离测量');
  new MeasureTool(viewer).startMeasureLine();
};

// 启动测量面功能
const startMeasureSurface = () => {
  const viewer = getViewer();
  if (!viewer) return console.warn('[utools] Viewer 未就绪，无法开始地表距离测量');
  new MeasureSurfaceDistance(viewer).start();
};

// 启动测量投影距离功能
const startMeasureProjected = () => {
  const viewer = getViewer();
  if (!viewer) return console.warn('[utools] Viewer 未就绪，无法开始投影距离测量');
  new MeasureProjectedDistance(viewer).start();
};

// 启动测量投影面积功能
const startMeasureProjectedArea = () => {
  const viewer = getViewer();
  if (!viewer) return console.warn('[utools] Viewer 未就绪，无法开始投影面积测量');
  new MeasureProjectedArea(viewer).start();
};

// 放置战斗机（Entity 方式）
let fighterRemove: null | (() => void) = null;
const placeFighter = async () => {
  if (fighterRemove) {
    fighterRemove();
    fighterRemove = null;
  }
  const viewer = getViewer();
  if (!viewer) return console.warn('[utools] Viewer 未就绪，无法放置战斗机');
  const url = "/models/super_tucano_fab/scene.gltf"; // 请确保该目录在 public 下
  const { remove, flyTo } = addModelEntity(
    viewer,
    url,
    116.397463,
    39.90869,
    100,
    { heading: 0, pitch: 0, roll: 0 },
    { scale: 1, minimumPixelSize: 64, maximumScale: 2000 }
  );
  fighterRemove = remove;
  flyTo();
};

const clearFighter = () => {
  if (fighterRemove) {
    fighterRemove();
    fighterRemove = null;
  }
};

// 选择模型并放置（放在视野中心）
const placedModelRemovers: Array<() => void> = [];

// 安全获取 Viewer
const getViewer = () => (window as any)?._earth?.viewer as any | undefined;
// 等待 Viewer 就绪（避免组件挂载早于 Cesium 初始化）
const waitForViewerReady = (maxTries = 50, intervalMs = 200): Promise<any | null> => {
  return new Promise((resolve) => {
    let tries = 0;
    const tick = () => {
      const v = getViewer();
      if (v) return resolve(v);
      tries++;
      if (tries >= maxTries) return resolve(null);
      setTimeout(tick, intervalMs);
    };
    tick();
  });
};

const getViewCenterCartographic = (viewer: any): { lon: number; lat: number; height: number } | null => {
  const scene = viewer.scene;
  const globe = scene.globe;
  const width = scene.canvas.width;
  const height = scene.canvas.height;
  const center = new Cesium.Cartesian2(width / 2, height / 2);
  const ray = viewer.camera.getPickRay(center);
  const cartesian = globe.pick(ray, scene);
  if (!cartesian) return null;
  const carto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian);
  return {
    lon: Cesium.Math.toDegrees(carto.longitude),
    lat: Cesium.Math.toDegrees(carto.latitude),
    height: carto.height ?? 0,
  };
};

const placeModelAt = (url: string, lon: number, lat: number, height = 0, scale = 1) => {
  const viewer = getViewer();
  if (!viewer) {
    console.warn('[utools] Viewer 未就绪，无法放置模型');
    return;
  }
  const { remove, flyTo } = addModelEntity(
    viewer,
    url,
    lon,
    lat,
    height,
    { heading: 0, pitch: 0, roll: 0 },
    { scale, minimumPixelSize: 32, maximumScale: 5000 }
  );
  placedModelRemovers.push(remove);
  flyTo();
};

const selectAndPlaceModel = () => {
  const defaultUrl = "/models/super_tucano_fab/scene.gltf";
  const url = window.prompt("输入模型URL(支持/public下相对路径或完整URL)", defaultUrl);
  if (!url) return;
  const viewer = getViewer();
  if (!viewer) {
    console.warn('[utools] Viewer 未就绪');
    return;
  }
  const center = getViewCenterCartographic(viewer) || { lon: 116.397463, lat: 39.90869, height: 0 };
  const scaleStr = window.prompt("输入缩放系数(可选)", "1");
  const scale = scaleStr ? Number(scaleStr) || 1 : 1;
  placeModelAt(url, center.lon, center.lat, Math.max(center.height, 0), scale);
};

const undoLastPlacedModel = () => {
  const remove = placedModelRemovers.pop();
  if (remove) remove();
};


// 功能按钮类
class FunctionButton extends BaseButton {
  constructor() {
    super("function");
  }

  handleClick(): void {
    this.toggleActive();
    console.log(`${this.name} button clicked, active: ${this.isActive.value}`);
  }
}

// 工具栏管理器类
class ToolbarManager {
  public measureButton: MeasureButton;
  public functionButton: FunctionButton;

  constructor() {
    this.measureButton = new MeasureButton();
    this.functionButton = new FunctionButton();
  }

  // 初始化工具栏
  public init(): void {
    console.log("ToolbarManager initialized");
  }

  // 重置所有按钮状态
  public resetAllButtons(): void {
    this.measureButton.setActive(false);
    this.functionButton.setActive(false);
  }

  // 获取测量工具面板显示状态
  public get showMeasureTools(): boolean {
    return this.measureButton.isActive.value;
  }

  // 获取圆环界面显示状态
  public get showCircleRing(): boolean {
    return this.functionButton.isActive.value;
  }

  // 销毁管理器
  public destroy(): void {
    this.resetAllButtons();
    console.log("ToolbarManager destroyed");
  }
}

// 创建工具栏管理器实例
const toolbarManager = new ToolbarManager();

// 便捷的访问属性
const showMeasureTools = ref(false);
const showCircleRing = ref(false);
const is2D = ref(false);
const wind2DEnabled = ref(false);
let windLayer: WindLayer2D | null = null;
const windParticleCount = ref(1200);
const windSpeedScale = ref(8);

// 响应式更新显示状态
const updateDisplayStates = () => {
  showMeasureTools.value = toolbarManager.showMeasureTools;
  showCircleRing.value = toolbarManager.showCircleRing;
};

// 测量按钮点击处理
const onMeasureClick = () => {
  toolbarManager.measureButton.onClick();
  updateDisplayStates();
};

// 功能按钮点击处理
const onFunctionClick = () => {
  toolbarManager.functionButton.onClick();
  updateDisplayStates();
};

// 生命周期钩子
onMounted(() => {
  toolbarManager.init();
  // 初始化 2D/3D 状态并监听形态切换完成事件（等待 viewer 就绪）
  (async () => {
    const viewer = await waitForViewerReady();
    if (viewer && viewer.scene) {
      is2D.value = viewer.scene.mode === Cesium.SceneMode.SCENE2D;
      viewer.scene.morphComplete.addEventListener(() => {
        is2D.value = viewer.scene.mode === Cesium.SceneMode.SCENE2D;
        // 如果处于2D且风场应开启，但层未创建，自动显示
        if (is2D.value && wind2DEnabled.value) {
          if (!windLayer) windLayer = new WindLayer2D(viewer, { particleCount: windParticleCount.value, speedScale: windSpeedScale.value });
          windLayer.show();
        } else if (!is2D.value && windLayer) {
          // 进入3D时隐藏风场
          windLayer.hide();
        }
      });
    }
  })();
});

onUnmounted(() => {
  toolbarManager.destroy();
  if (windLayer) {
    windLayer.destroy();
    windLayer = null;
  }
});

// 2D/3D 切换
const toggle2D3D = () => {
  const viewer = getViewer();
  if (!viewer) {
    console.warn('[utools] Viewer 未就绪，无法切换 2D/3D');
    return;
  }
  const scene = viewer.scene;
  // 根据当前模式进行形态切换，过渡动画时长约 0.8s
  if (scene.mode === Cesium.SceneMode.SCENE2D) {
    scene.morphTo3D(0.8);
  } else {
    scene.morphTo2D(0.8);
  }
};

// 风场(2D) 开关
const toggleWind2D = async () => {
  const viewer = await waitForViewerReady();
  if (!viewer) return console.warn('[utools] Viewer 未就绪，无法切换风场');
  if (!is2D.value) {
    // 不在2D，先切换到2D，切换完成后再开启
    wind2DEnabled.value = !wind2DEnabled.value;
    if (wind2DEnabled.value) {
      viewer.scene.morphTo2D(0.8);
      // 在 morphComplete 监听里会自动 show()
    } else {
      if (windLayer) windLayer.hide();
    }
    return;
  }

  // 已经在2D
  wind2DEnabled.value = !wind2DEnabled.value;
  if (wind2DEnabled.value) {
    if (!windLayer) windLayer = new WindLayer2D(viewer, { particleCount: windParticleCount.value, speedScale: windSpeedScale.value });
    windLayer.show();
  } else {
    if (windLayer) windLayer.hide();
  }
};

// 应用参数到风场
const applyWindParticleCount = () => {
  if (windLayer) windLayer.setParticleCount(windParticleCount.value);
};
const applyWindSpeedScale = () => {
  if (windLayer) windLayer.setSpeedScale(windSpeedScale.value);
};
</script>

<style scoped lang="scss">
.left-toolbar {
  position: absolute;
  top: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 20;
  pointer-events: auto;
}
.tool-btn {
  position: relative;
  width: 44px;
  height: 44px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 6px;
  background: rgba(30, 30, 30, 0.55);
  backdrop-filter: blur(4px);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  outline: none;
  transition: all 0.2s ease;
  transform-origin: center;
}

.tool-btn:hover {
  background: rgba(50, 50, 50, 0.75);
  border-color: rgba(255, 255, 255, 0.4);
  transform: scale(1.05);
}

.tool-btn:active {
  background: rgba(70, 70, 70, 0.9);
  transform: scale(0.95);
}

/* 激活状态（面板打开时） */
.tool-btn.active {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.2);
}

// 激活状态下的悬停效果
.tool-btn.active:hover {
  background: rgba(255, 255, 255, 0.25);
}
.icon {
  width: 24px;
  height: 24px;
  display: block;
  transition: transform 0.3s ease;
}
.tool-wrapper {
  position: relative;
}

/* 2D/3D 切换按钮文字样式 */
.mode-toggle-btn .mode-label {
  color: #fff;
  font-weight: 800;
  letter-spacing: 0.5px;
  font-size: 12px;
}

/* 风场参数面板 */
.wind-panel {
  position: relative;
  margin-top: 8px;
  padding: 10px 12px;
  width: 220px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 8px;
  backdrop-filter: blur(4px);
  color: #fff;
}
.wind-panel .row {
  display: grid;
  grid-template-columns: 70px 1fr auto;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.wind-panel .row:last-child { margin-bottom: 0; }
.wind-panel label {
  font-size: 12px;
  opacity: 0.85;
}
.wind-panel .val {
  font-size: 12px;
  opacity: 0.9;
  min-width: 40px;
  text-align: right;
}

/* 风字按钮文字样式 */
.tool-btn .mode-label {
  color: #fff;
  font-weight: 800;
  letter-spacing: 0.5px;
  font-size: 12px;
}

// 测量工具面板
.measure-tools-panel {
  position: absolute;
  top: 0;
  right: 48px; /* 主按钮左侧 */
  display: grid;
  grid-template-columns: repeat(3, 44px);
  grid-auto-rows: 44px;
  gap: 8px 8px;
  padding: 24px 6px 4px 6px; /* 增加顶部padding为标题留空间 */
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
}

// 面板标题
.panel-title {
  position: absolute;
  top: 4px; /* 调整到面板内部 */
  left: 4px;
  font-size: 12px;
  color: #fff;
  letter-spacing: 1px;
  opacity: 0.85;
  user-select: none;
  pointer-events: none;
}

/* 左栏中间按钮 */
.top-left-button {
  position: fixed; /* 保持fixed定位，相对于视窗 */
  top: 50%; /* 垂直居中 */
  left: 24px; /* 保持左侧24px距离 */
  transform: translateY(-50%); /* 精确垂直居中 */
  z-index: 40; /* 提高z-index，确保在圆环覆盖层之上 */
  pointer-events: auto;
}
</style>
