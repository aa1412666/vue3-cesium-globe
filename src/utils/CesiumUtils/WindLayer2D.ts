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
  speedScale?: number;    // 速度缩放
  color?: string;         // 轨迹颜色
};

export default class WindLayer2D {
  private viewer: Cesium.Viewer;
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private running = false;
  private rafId: number | null = null;
  private particles: Array<{ x: number; y: number; age: number }>; // 简化：速度由场决定
  private options: Required<WindLayer2DOptions>;
  private lastTime = 0;
  private resizeObserver?: ResizeObserver;

  constructor(viewer: Cesium.Viewer, options: WindLayer2DOptions = {}) {
    this.viewer = viewer;
    this.container = viewer.container as HTMLElement;

    this.options = {
      particleCount: options.particleCount ?? 1500,
      fadeOpacity: options.fadeOpacity ?? 0.94,
      lineWidth: options.lineWidth ?? 1.0,
      speedScale: options.speedScale ?? 0.6,
      color: options.color ?? "rgba(255,255,255,0.8)",
    };

    // 创建覆盖层 canvas
    this.canvas = document.createElement("canvas");
    this.canvas.style.position = "absolute";
    this.canvas.style.left = "0";
    this.canvas.style.top = "0";
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.canvas.style.pointerEvents = "none";
    this.canvas.style.zIndex = "18"; // 在控件之下/之上按需调整

    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("WindLayer2D: cannot get 2d context");
    this.ctx = ctx;

    this.particles = [];

    this.handleResize = this.handleResize.bind(this);
    this.initSize();
    this.seedParticles();

    // 监听容器大小变化
    if ("ResizeObserver" in window) {
      this.resizeObserver = new ResizeObserver(() => this.handleResize());
      this.resizeObserver.observe(this.container);
    } else {
      window.addEventListener("resize", this.handleResize);
    }
  }

  private initSize() {
    const dpr = window.devicePixelRatio || 1;
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
    this.particles = new Array(count).fill(0).map(() => ({
      x: Math.random() * rect.width,
      y: Math.random() * rect.height,
      age: Math.floor(Math.random() * 100),
    }));
  }

  // 简单的屏幕空间矢量场（近似风流）
  // 利用三角函数与时间构造一个平滑变化的方向场
  private field(x: number, y: number, t: number): { vx: number; vy: number } {
    const w = this.canvas.width / (window.devicePixelRatio || 1);
    const h = this.canvas.height / (window.devicePixelRatio || 1);
    const nx = (x / w) * 2.0 - 1.0;
    const ny = (y / h) * 2.0 - 1.0;

    // 基于多频率三角函数叠加形成流场
    const a = Math.sin((nx * 3.0 + t * 0.0004) * Math.PI) + Math.cos((ny * 2.0 - t * 0.0003) * Math.PI);
    const b = Math.cos((ny * 3.5 + t * 0.0005) * Math.PI) - Math.sin((nx * 2.5 + t * 0.0002) * Math.PI);

    // 角度与速度
    const angle = Math.atan2(b, a);
    const speed = this.options.speedScale * (0.6 + 0.4 * (Math.sin(nx * 2.0 + t * 0.0006) * 0.5 + 0.5));

    return { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed };
  }

  private step(time: number) {
    if (!this.running) return;

    // 背景渐隐，留下拖影
    this.ctx.globalCompositeOperation = "destination-in";
    this.ctx.fillStyle = `rgba(0,0,0,${this.options.fadeOpacity})`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.globalCompositeOperation = "source-over";

    this.ctx.lineWidth = this.options.lineWidth;
    this.ctx.strokeStyle = this.options.color;

    const now = time;
    const dt = this.lastTime ? Math.min(50, now - this.lastTime) : 16;
    this.lastTime = now;

    const rect = this.container.getBoundingClientRect();

    this.ctx.beginPath();
    for (let p of this.particles) {
      // 当前方向
      const v = this.field(p.x, p.y, now);
      const nx = p.x + v.vx * dt;
      const ny = p.y + v.vy * dt;

      // 绘制轨迹
      this.ctx.moveTo(p.x, p.y);
      this.ctx.lineTo(nx, ny);

      p.x = nx;
      p.y = ny;
      p.age++;

      // 出界或到期则重置
      if (p.x < 0 || p.x > rect.width || p.y < 0 || p.y > rect.height || p.age > 200) {
        p.x = Math.random() * rect.width;
        p.y = Math.random() * rect.height;
        p.age = 0;
      }
    }
    this.ctx.stroke();

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
      this.container.appendChild(this.canvas);
    }
    this.running = true;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame((ts) => this.step(ts));
  }

  public hide() {
    if (!this.running) return;
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.canvas.parentElement) {
      this.canvas.parentElement.removeChild(this.canvas);
    }
  }

  public destroy() {
    this.hide();
    if (this.resizeObserver) this.resizeObserver.disconnect();
    else window.removeEventListener("resize", this.handleResize);
  }
}
