import * as Cesium from "cesium";

/*
  WindLayer2D: 简易 2D 风场粒子可视化（屏幕空间 Canvas 覆盖层）
  - 仅在 SceneMode.SCENE2D 下启用
  - 提供 show/hide/destroy 接口
  - 基于屏幕空间的矢量场（非真实气象数据），效果接近风流线
*/

export type WindLayer2DOptions = {
  particleCount?: number; // 粒子数量
  fadeOpacity?: number;   // 轨迹衰减（背景渐隐）0-1
  lineWidth?: number;     // 线宽
  color?: string;         // 轨迹颜色
  speedScale?: number;    // 速度倍率（放大 m/s 以便屏幕上可见）
  // 数据文件路径（可覆盖默认）
  uUrl?: string;
  vUrl?: string;
};

type WindJsonHeader = {
  nx: number; ny: number; lo1: number; la1: number; dx: number; dy: number; lo2: number; la2: number;
};
type WindJsonRecord = { header: WindJsonHeader; data: number[] };

export default class WindLayer2D {
  private viewer: Cesium.Viewer;
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private running = false;
  private rafId: number | null = null;
  private particles: Array<{ x: number; y: number; lon: number; lat: number; age: number }>;
  private options: Required<WindLayer2DOptions>;
  private lastTime = 0;
  private resizeObserver?: ResizeObserver;
  // 风场网格
  private gridU?: { header: WindJsonHeader; data: Float32Array };
  private gridV?: { header: WindJsonHeader; data: Float32Array };
  private loadingPromise?: Promise<void> | null = null;

  constructor(viewer: Cesium.Viewer, options: WindLayer2DOptions = {}) {
    this.viewer = viewer;
    this.container = viewer.container as HTMLElement;

    this.options = {
      particleCount: options.particleCount ?? 1200,
      fadeOpacity: options.fadeOpacity ?? 0.94,
      lineWidth: options.lineWidth ?? 1.0,
      color: options.color ?? "rgba(255,255,255,0.8)",
      speedScale: options.speedScale ?? 8.0,
      // 使用 ?url 强制以静态资源 URL 形式提供，避免被当作模块解析
      uUrl: options.uUrl ?? new URL("../../assets/wind/wind_u.json?url", import.meta.url).toString(),
      vUrl: options.vUrl ?? new URL("../../assets/wind/wind_v.json?url", import.meta.url).toString(),
    } as Required<WindLayer2DOptions>;

    // 创建覆盖层 canvas
  this.canvas = document.createElement("canvas");
  this.canvas.className = "wind-layer2d-canvas";
    this.canvas.style.position = "absolute";
    this.canvas.style.left = "0";
    this.canvas.style.top = "0";
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.canvas.style.pointerEvents = "none";
  this.canvas.style.zIndex = "21"; // 位于 Cesium 画布之上、工具栏(20)之上/下按需调整

    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("WindLayer2D: cannot get 2d context");
    this.ctx = ctx;

    this.particles = [];

    this.handleResize = this.handleResize.bind(this);
    this.initSize();
  this.seedParticles();

    // 监听容器大小变化
    const hasRO = typeof (globalThis as any).ResizeObserver !== "undefined";
    if (hasRO) {
  this.resizeObserver = new (globalThis as any).ResizeObserver(() => this.handleResize());
  if (this.resizeObserver) this.resizeObserver.observe(this.container);
    } else {
      (globalThis as any).addEventListener("resize", this.handleResize);
    }
  }

  private initSize() {
  const dpr = (globalThis as any).devicePixelRatio || 1;
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    this.canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // 以 CSS 像素绘制
  }

  private handleResize() {
    this.initSize();
    // 重新播种以避免分布过密或过稀
    this.seedParticles();
  }

  private seedParticles() {
    const rect = this.container.getBoundingClientRect();
    const count = this.options.particleCount;
    const viewRect = this.getViewRectangle();
    const west = viewRect.west, east = viewRect.east, south = viewRect.south, north = viewRect.north;
    this.particles = new Array(count).fill(0).map(() => {
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;
      const lon = Cesium.Math.toDegrees(west + (x / rect.width) * this.lonSpan(west, east));
      const lat = Cesium.Math.toDegrees(north - (y / rect.height) * (north - south));
      return { x, y, lon: this.normalizeLon180(lon), lat: this.clampLat(lat), age: Math.floor(Math.random() * 100) };
    });
  }

  // 从真实风场（U/V）采样，返回给定经纬度处的 (u,v) m/s
  private sampleUV(lonDeg: number, latDeg: number): { u: number; v: number } | null {
    if (!this.gridU || !this.gridV) return null;
    const { header: hU, data: dU } = this.gridU;
    const { header: hV, data: dV } = this.gridV;

    // 规范化经度到 [0, 360)
    let lon360 = lonDeg % 360; if (lon360 < 0) lon360 += 360;
    const lat = this.clampLat(latDeg);

    const i = (lon360 - hU.lo1) / hU.dx;
    const j = (lat - hU.la1) / hU.dy;

    const nx = hU.nx, ny = hU.ny;
    let i0 = Math.floor(i); let j0 = Math.floor(j);
    let i1 = (i0 + 1) % nx; let j1 = Math.min(j0 + 1, ny - 1);
    const fi = i - i0; const fj = j - j0;

    // 越界保护
    if (j0 < 0 || j0 >= ny || isNaN(i0) || isNaN(j0)) return null;

    const idx = (ii: number, jj: number) => jj * nx + ((ii % nx) + nx) % nx;

    const u00 = dU[idx(i0, j0)], u10 = dU[idx(i1, j0)], u01 = dU[idx(i0, j1)], u11 = dU[idx(i1, j1)];
    const v00 = dV[idx(i0, j0)], v10 = dV[idx(i1, j0)], v01 = dV[idx(i0, j1)], v11 = dV[idx(i1, j1)];

    // 双线性插值
    const u0 = u00 * (1 - fi) + u10 * fi;
    const u1 = u01 * (1 - fi) + u11 * fi;
    const v0 = v00 * (1 - fi) + v10 * fi;
    const v1 = v01 * (1 - fi) + v11 * fi;
    const u = u0 * (1 - fj) + u1 * fj;
    const v = v0 * (1 - fj) + v1 * fj;
    return { u, v };
  }

  // 载入 U/V JSON 数据
  private stripBOM(text: string) {
    if (text.charCodeAt(0) === 0xFEFF) return text.slice(1);
    // 兼容一些异常前导字符：去除开头非 { 或 [ 的不可见字符
    return text.replace(/^[\u0000-\u001F\uFEFF]+/, "");
  }

  private async readTextRobust(resp: Response): Promise<string> {
    const buf = await resp.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let encoding: string = 'utf-8';
    if (bytes.length >= 2) {
      const b0 = bytes[0], b1 = bytes[1];
      if (b0 === 0xFF && b1 === 0xFE) encoding = 'utf-16le';
      else if (b0 === 0xFE && b1 === 0xFF) encoding = 'utf-16be';
      else if (bytes.length >= 3 && b0 === 0xEF && b1 === 0xBB && bytes[2] === 0xBF) encoding = 'utf-8';
    }
    try {
      const dec = new TextDecoder(encoding as any);
      return dec.decode(bytes);
    } catch {
      // 兜底使用 utf-8
      return new TextDecoder('utf-8').decode(bytes);
    }
  }

  private async ensureLoaded() {
    if (this.gridU && this.gridV) return;
    if (this.loadingPromise) return this.loadingPromise;
    const loadJsonCandidate = async (url: string) => {
      try {
        const resp = await fetch(url, { cache: 'no-cache' });
        if (!resp.ok) return null;
        const text = await this.readTextRobust(resp);
        const json = JSON.parse(this.stripBOM(text));
        return json as any;
      } catch (e) {
        console.warn('[WindLayer2D] 加载失败:', url, e);
        return null;
      }
    };

    this.loadingPromise = (async () => {
      // 多策略候选：优先使用构建产物 URL，其次尝试 public 路径
      const uCandidates = [
        this.options.uUrl!,
        '/wind/wind_u.json',
      ];
      const vCandidates = [
        this.options.vUrl!,
        '/wind/wind_v.json',
      ];

      let uJson: any = null; let uUsed: string | null = null;
      for (const u of uCandidates) { uJson = await loadJsonCandidate(u); if (uJson) { uUsed = u; break; } }
      let vJson: any = null; let vUsed: string | null = null;
      for (const v of vCandidates) { vJson = await loadJsonCandidate(v); if (vJson) { vUsed = v; break; } }

      if (!uJson || !vJson) {
        console.error('[WindLayer2D] 无法加载风场数据，请确认路径：', uCandidates, vCandidates);
        return;
      }
      console.info('[WindLayer2D] 风场数据加载成功:', { uUsed, vUsed });

      const uRec = (uJson as any[])[0] as WindJsonRecord;
      const vRec = (vJson as any[])[0] as WindJsonRecord;
      this.gridU = { header: uRec.header, data: new Float32Array(uRec.data as any) };
      this.gridV = { header: vRec.header, data: new Float32Array(vRec.data as any) };
    })();
    return this.loadingPromise;
  }

  private clampLat(lat: number) { return Math.max(-90, Math.min(90, lat)); }
  private normalizeLon180(lon: number) {
    let L = lon; while (L <= -180) L += 360; while (L > 180) L -= 360; return L;
  }
  private lonSpan(west: number, east: number) {
    // radians span, handle anti-meridian
    let span = east - west; if (span < 0) span += Math.PI * 2; return span;
  }
  private getViewRectangle(): Cesium.Rectangle {
    const rect = this.viewer.camera.computeViewRectangle();
    if (rect) return rect;
    return new Cesium.Rectangle(-Math.PI, -Math.PI / 2, Math.PI, Math.PI / 2);
  }
  private computeDynamicLineWidth(): number {
    const rect = this.getViewRectangle();
    const containerRect = this.container.getBoundingClientRect();
    const degSpan = Cesium.Math.toDegrees(this.lonSpan(rect.west, rect.east));
    const pxPerDeg = containerRect.width / Math.max(0.0001, degSpan);
    // 基于比例尺自适应线宽：世界视图 ~0.6，局部放大最多到 ~3
    const lw = 0.6 + pxPerDeg / 300; // 调整分母可改变增长速度
    return Math.max(0.6, Math.min(3.0, lw));
  }
  private lonLatToXY(lonDeg: number, latDeg: number) {
    const rect = this.getViewRectangle();
    const containerRect = this.container.getBoundingClientRect();
    const west = rect.west, east = rect.east, south = rect.south, north = rect.north;
    const lonRadRaw = Cesium.Math.toRadians(lonDeg);
    // 处理 anti-meridian：将 lonRad 映射到 [west, east] 范围
    let lonRad = lonRadRaw;
    if (east < west) {
      // wrap case
      if (lonRad < west) lonRad += Math.PI * 2;
    }
    const x = ((lonRad - west) / this.lonSpan(west, east)) * containerRect.width;
    const y = ((north - Cesium.Math.toRadians(latDeg)) / (north - south)) * containerRect.height;
    return { x, y };
  }

  private step(time: number) {
    if (!this.running) return;

    // 背景渐隐，留下拖影
    this.ctx.globalCompositeOperation = "destination-in";
    this.ctx.fillStyle = `rgba(0,0,0,${this.options.fadeOpacity})`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.globalCompositeOperation = "source-over";

  const dynLineWidth = this.computeDynamicLineWidth();
  this.ctx.lineWidth = dynLineWidth;
  this.ctx.lineCap = 'round';
  this.ctx.lineJoin = 'round';
  this.ctx.strokeStyle = this.options.color;

    const now = time;
    const dt = this.lastTime ? Math.min(50, now - this.lastTime) : 16;
    this.lastTime = now;

    const rect = this.container.getBoundingClientRect();

  this.ctx.beginPath();
  const headPoints: Array<{x:number;y:number}> = [];
    const dtSec = dt / 1000;
    const metersPerDegLat = 111320;
    for (let p of this.particles) {
      // 如果数据未就绪，保持原地淡出
      const uv = this.sampleUV(p.lon, p.lat);
      if (!uv) continue;
      const lonMetersPerDeg = metersPerDegLat * Math.cos(Cesium.Math.toRadians(p.lat));
      const scale = this.options.speedScale;
      const dLonDeg = (lonMetersPerDeg > 0 ? (uv.u / lonMetersPerDeg) : 0) * dtSec * scale;
      const dLatDeg = (uv.v / metersPerDegLat) * dtSec * scale;

      const prev = this.lonLatToXY(p.lon, p.lat);
      p.lon = this.normalizeLon180(p.lon + dLonDeg);
      p.lat = this.clampLat(p.lat + dLatDeg);
      const next = this.lonLatToXY(p.lon, p.lat);

  // 绘制轨迹
      this.ctx.moveTo(prev.x, prev.y);
      this.ctx.lineTo(next.x, next.y);
  headPoints.push({ x: next.x, y: next.y });

      p.x = next.x; p.y = next.y;
      p.age++;

      // 出界或到期则重置（按屏幕坐标）
      if (p.x < 0 || p.x > rect.width || p.y < 0 || p.y > rect.height || p.age > 300) {
        p.x = Math.random() * rect.width;
        p.y = Math.random() * rect.height;
        const viewRect = this.getViewRectangle();
        const west = viewRect.west, east = viewRect.east, south = viewRect.south, north = viewRect.north;
        p.lon = this.normalizeLon180(Cesium.Math.toDegrees(west + (p.x / rect.width) * this.lonSpan(west, east)));
        p.lat = this.clampLat(Cesium.Math.toDegrees(north - (p.y / rect.height) * (north - south)));
        p.age = 0;
      }
    }
    this.ctx.stroke();

    // 画粒子“头部”小圆点，随缩放自适应
    this.ctx.beginPath();
    const r = Math.max(0.8, dynLineWidth * 0.6);
    for (const hp of headPoints) {
      this.ctx.moveTo(hp.x + r, hp.y);
      this.ctx.arc(hp.x, hp.y, r, 0, Math.PI * 2);
    }
    this.ctx.fillStyle = this.options.color;
    this.ctx.fill();

    this.rafId = requestAnimationFrame((ts) => this.step(ts));
  }

  public show() {
    if (this.running) return;
    if (this.viewer.scene.mode !== Cesium.SceneMode.SCENE2D) {
      console.warn("WindLayer2D: 当前非2D模式，风场层未启用");
      return;
    }
    if (!this.canvas.parentElement) {
      // 插入到 Cesium 容器之上但在控件之下（根据需求调整 zIndex）
      // 先清理历史遗留的风场画布（例如热重载或异常退出残留）
      const stale = this.container.querySelectorAll('.wind-layer2d-canvas');
      stale.forEach((el) => {
        if (el && el.parentElement) el.parentElement.removeChild(el);
      });
      this.container.appendChild(this.canvas);
    }
    this.running = true;
    this.lastTime = performance.now();
    // 确保数据加载后再开始动画
    this.ensureLoaded().then(() => {
      if (!this.gridU || !this.gridV) {
        console.warn('[WindLayer2D] 数据未加载成功，风场未启动');
        return;
      }
      // 重新播种以同步当前视域
      this.seedParticles();
      this.rafId = requestAnimationFrame((ts) => this.step(ts));
    });
  }

  public hide() {
    if (!this.running) return;
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    // 清空画布（忽略当前变换，保证彻底清除）
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
    if (this.canvas.parentElement) {
      this.canvas.parentElement.removeChild(this.canvas);
    }
  }

  public destroy() {
    this.hide();
    if (this.resizeObserver) this.resizeObserver.disconnect();
    else (globalThis as any).removeEventListener("resize", this.handleResize);
  }

  // 动态调整：速度倍率
  public setSpeedScale(scale: number) {
    this.options.speedScale = Math.max(0.1, Math.min(100, scale || 0));
  }

  // 动态调整：粒子数量（会重新播种）
  public setParticleCount(count: number) {
    const c = Math.floor(Math.max(100, Math.min(20000, count || 0)));
    if (c === this.options.particleCount) return;
    this.options.particleCount = c;
    this.seedParticles();
  }
}
