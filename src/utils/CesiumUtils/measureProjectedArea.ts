// measureProjectedArea.ts
// 投影面积测量工具
import * as Cesium from 'cesium';

export default class MeasureProjectedArea {
  private viewer: Cesium.Viewer;
  private handler: Cesium.ScreenSpaceEventHandler | null = null;
  private positions: Cesium.Cartesian3[] = [];
  private polygonEntity: Cesium.Entity | null = null;
  private tooltip: HTMLDivElement | null = null;
  private measuring = false;

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
  }

  /**
   * 启动投影面积测量
   */
  public start() {
    if (this.measuring) this.clear();
    this.measuring = true;
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    this.handler.setInputAction(this.onClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    this.handler.setInputAction(this.onMouseMove, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    this.handler.setInputAction(this.onDoubleClick, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    this.handler.setInputAction(this.onRightClick, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    this.createTooltip();
  }

  /** 鼠标右键清除所有测量点和痕迹 */
  private onRightClick = () => {
    this.clear();
  };

  /** 单击添加点 */
  private onClick = (movement: any) => {
    const position = this.viewer.scene.pickPosition(movement.position);
    if (position) {
      // 投影到地球椭球面
      const cartographic = Cesium.Cartographic.fromCartesian(position);
      const projected = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0);
      this.positions.push(projected);
      this.updatePolygon();
    }
  };

  /** 鼠标移动时更新临时面和提示 */
  private onMouseMove = (movement: any) => {
    if (this.positions.length < 2) return;
    const position = this.viewer.scene.pickPosition(movement.endPosition);
    if (position) {
      const cartographic = Cesium.Cartographic.fromCartesian(position);
      const projected = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0);
      this.updatePolygon(projected);
      this.updateTooltip(projected);
    }
  };

  /** 双击结束测量 */
  private onDoubleClick = () => {
    if (this.positions.length < 3) return;
    this.finish();
  };

  private updatePolygon(tempPosition?: Cesium.Cartesian3) {
    const getPositions = () => tempPosition ? [...this.positions, tempPosition] : this.positions;
    if (!this.polygonEntity) {
      this.polygonEntity = this.viewer.entities.add({
        polygon: {
          hierarchy: new Cesium.CallbackProperty(() => new Cesium.PolygonHierarchy(getPositions()), false),
          material: Cesium.Color.CYAN.withAlpha(0.4),
          outline: true,
          outlineColor: Cesium.Color.CYAN,
        },
      });
    }
    // CallbackProperty会自动更新，无需else分支
  }

  private updateTooltip(position: Cesium.Cartesian3) {
    if (!this.tooltip) return;
    const screenPos = Cesium.SceneTransforms.worldToWindowCoordinates(this.viewer.scene, position);
    if (screenPos) {
      this.tooltip.style.left = `${screenPos.x + 10}px`;
      this.tooltip.style.top = `${screenPos.y + 10}px`;
      this.tooltip.innerText = `投影面积: ${this.calculateProjectedArea([...this.positions, position]).toFixed(2)} 平方米`;
    }
  }

  private createTooltip() {
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'cesium-tooltip';
    this.tooltip.style.position = 'absolute';
    this.tooltip.style.pointerEvents = 'none';
    this.tooltip.style.background = 'rgba(0,0,0,0.6)';
    this.tooltip.style.color = '#fff';
    this.tooltip.style.padding = '4px 8px';
    this.tooltip.style.borderRadius = '4px';
    this.tooltip.style.zIndex = '100';
    document.body.appendChild(this.tooltip);
  }

  private removeTooltip() {
    if (this.tooltip) {
      document.body.removeChild(this.tooltip);
      this.tooltip = null;
    }
  }

  /**
   * 计算投影面积（所有点投影到地球椭球面后的多边形面积，单位：平方米）
   * 使用球面多边形面积公式
   */
  public calculateProjectedArea(positions: Cesium.Cartesian3[]): number {
    if (positions.length < 3) return 0;
    // 转为经纬度数组
    const cartos = positions.map(p => Cesium.Cartographic.fromCartesian(p));
    // 计算球面多边形面积
    let area = 0;
    const R = Cesium.Ellipsoid.WGS84.maximumRadius; // 地球半径
    for (let i = 0; i < cartos.length; i++) {
      const j = (i + 1) % cartos.length;
      area += cartos[i].longitude * cartos[j].latitude - cartos[j].longitude * cartos[i].latitude;
    }
    area = Math.abs(area) / 2;
    // 球面面积近似公式（经纬度弧度，乘以地球半径的平方）
    return area * R * R;
  }

  /**
   * 完成测量，显示最终面积，停止事件监听。
   */
  public finish() {
    if (this.handler) {
      this.handler.destroy();
      this.handler = null;
    }
    this.measuring = false;
    // 显示最终面积
    if (this.tooltip) {
      const total = this.calculateProjectedArea(this.positions);
      this.tooltip.innerText = `投影面积测量完成\n总面积: ${total.toFixed(2)} 平方米`;
      setTimeout(() => this.removeTooltip(), 2000);
    }
  }

  /**
   * 主动退出/清理测量，移除所有事件、面、提示框。
   */
  public clear() {
    if (this.handler) {
      this.handler.destroy();
      this.handler = null;
    }
    if (this.polygonEntity) {
      this.viewer.entities.remove(this.polygonEntity);
      this.polygonEntity = null;
    }
    this.positions = [];
    this.measuring = false;
    this.removeTooltip();
  }
}

/**
 * 使用建议：
 * 1. 调用 start() 开始测量，双击自动结束。
 * 2. 调用 clear() 可随时主动退出测量。
 * 3. finish() 会自动显示最终面积，2秒后提示框消失。
 * 4. 可在工具栏或面板关闭时调用 clear()，保证测量状态清理。
 *
 * 样式建议：在全局样式中添加 .cesium-tooltip 的样式以美化提示框。
 */
