import * as Cesium from "cesium";
export default class Earth {
  viewer!: Cesium.Viewer;
  container: HTMLElement;
  token: string;
  constructor(container: HTMLElement) {
    this.container = container;
    this.token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjZjVkMGQyMC0wNzQ1LTRkNGItYjI2NC05MjkyZTBlZDc1OGIiLCJpZCI6MTI4MTAyLCJpYXQiOjE3NTY4ODMyNzV9.r2OxpNQiGvnG_9o5Cd99s7e4QclwD2Wxi-SFmlhTyk8";
    Cesium.Ion.defaultAccessToken = this.token;
  }
  async initCesium() {
    // 关闭在线地形，改为纯椭球地形（高度为0），可避免网络请求与起伏影响
    const terrainProvider = new Cesium.EllipsoidTerrainProvider();
    this.viewer = new Cesium.Viewer(this.container, {
      geocoder: false,
      baseLayerPicker: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      vrButton: false,
      selectionIndicator: false,
      infoBox: false,
      animation: true,
      timeline: true,
      terrainProvider,
      sceneMode: Cesium.SceneMode.SCENE3D,
      creditContainer: document.createElement('div'), // 隐藏版权信息
    });
    
    // 开启基于太阳的真实光照与阴影，使模型受太阳光照亮
    // 1) 让地球根据太阳位置明暗变化
    this.viewer.scene.globe.enableLighting = true;
    // 2) 使用太阳作为方向光（会随时间变化）
    //    可根据需要调节强度，例如 new Cesium.SunLight({ intensity: 1.0 })
    // @ts-ignore: 某些 Cesium 版本的类型定义未包含 SunLight 选项
    this.viewer.scene.light = new Cesium.SunLight({ intensity: 1.0 });
    // 3) 全局开启阴影（模型可投射/接收阴影）
    this.viewer.shadows = true;
    this.viewer.shadowMap.enabled = true;
    this.viewer.shadowMap.softShadows = true;
    // 可按性能调节阴影贴图大小，数值越大越清晰但更耗性能
    // this.viewer.shadowMap.size = 2048;
    // 让地表也参与阴影
    // @ts-ignore: 类型定义版本差异
    this.viewer.scene.globe.shadows = Cesium.ShadowMode.ENABLED;
    // 显示太阳与月亮（可见性，不影响光照计算本身）
    if (this.viewer.scene.sun) {
      this.viewer.scene.sun.show = true;
    }
    if (this.viewer.scene.moon) {
      this.viewer.scene.moon.show = false; // 可按需打开月光影响
    }
    
    // 使用当前系统时间驱动太阳位置；也可以通过修改 clock 来观察一天内光照变化
    this.viewer.clock.currentTime = Cesium.JulianDate.fromDate(new Date());
    this.viewer.clock.shouldAnimate = false; // 若希望太阳随时间流逝移动，设为 true
    
    // 天地图token
    const tdtKey = "3be4f683aa97741583a90ca02be19f64";
    
    // 使用Cesium默认底图（Bing Maps），无需额外配置
    // Cesium.Viewer默认会使用Cesium Ion提供的Bing Maps卫星影像
    
    // 加载天地图地理标签（叠加在Cesium底图之上）
    const tdtLabelLayer = new Cesium.ImageryLayer(new Cesium.WebMapTileServiceImageryProvider({
      url: `http://t0.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=${tdtKey}`,
      layer: "tdtAnnoLayer",
      style: "default",
      format: "image/jpeg",
      tileMatrixSetID: "GoogleMapsCompatible",
    }));

    // 只添加天地图标签图层，底图使用Cesium默认的
    this.viewer.imageryLayers.add(tdtLabelLayer);
    
    // 调整 Cesium 控件的 z-index 层级
    setTimeout(() => {
      // 调整 animation 控件的 z-index
      const animationContainer = this.container.querySelector('.cesium-viewer-animationContainer') as HTMLElement;
      if (animationContainer) {
        animationContainer.style.zIndex = '20';
      }
      
      // 调整 timeline 控件的 z-index
      const timelineContainer = this.container.querySelector('.cesium-viewer-timelineContainer') as HTMLElement;
      if (timelineContainer) {
        timelineContainer.style.zIndex = '20';
      }
    }, 100); // 延迟确保DOM已渲染
  }
}
