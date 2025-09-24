// measureSurfaceDistance.ts
/**
 * 使用建议：
 * 1. 调用 start() 开始测量，双击自动结束。
 * 2. 调用 clear() 可随时主动退出测量，鼠标右键自动清除所有测量点和痕迹。
 * 3. finish() 会自动显示最终距离，2秒后提示框消失。
 * 4. 可在工具栏或面板关闭时调用 clear()，保证测量状态清理。
 */
// 地表距离测量工具
import * as Cesium from 'cesium';

export default class MeasureSurfaceDistance {
  private viewer: Cesium.Viewer;
  private handler: Cesium.ScreenSpaceEventHandler | null = null;
  private positions: Cesium.Cartesian3[] = [];
  private polylineEntity: Cesium.Entity | null = null;
  private tooltip: HTMLDivElement | null = null;
  private measuring = false;

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
  }

  // 启动地表距离测量
  /**
   * 启动地表距离测量
   * 若正在测量则先清理，避免重复测量。
   */
  public start() {
    if (this.measuring) this.clear();
    this.measuring = true;
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    this.handler.setInputAction(this.onClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    this.handler.setInputAction(this.onMouseMove, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    this.handler.setInputAction(this.onDoubleClick, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    // 增加右键清除功能
    this.handler.setInputAction(this.onRightClick, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    this.createTooltip();
  }
  /**
   * 鼠标右键清除所有测量点和痕迹
   */
  private onRightClick = () => {
    this.clear();
  };

  // 单击添加点
  private onClick = (movement: any) => {
    const position = this.viewer.scene.pickPosition(movement.position);
    if (position) {
      this.positions.push(position);
      this.updatePolyline();
    }
  };

  // 鼠标移动更新临时线和提示框
  private onMouseMove = (movement: any) => {
    if (this.positions.length === 0) return;
    const position = this.viewer.scene.pickPosition(movement.endPosition);
    if (position) {
      this.updatePolyline(position);
      this.updateTooltip(position);
    }
  };

  // 双击结束测量
  /**
   * 双击结束测量
   */
  private onDoubleClick = () => {
    if (this.positions.length < 2) return;
    this.finish();
  };

  private updatePolyline(tempPosition?: Cesium.Cartesian3) {
    const getPositions = () => tempPosition ? [...this.positions, tempPosition] : this.positions;
    if (!this.polylineEntity) {
      this.polylineEntity = this.viewer.entities.add({
        polyline: {
          positions: new Cesium.CallbackProperty(getPositions, false),
          width: 3,
          material: Cesium.Color.YELLOW,
          clampToGround: true,
        },
      });
    }
    // CallbackProperty会自动更新，无需else分支
  }

  // 更新提示框位置和内容
  private updateTooltip(position: Cesium.Cartesian3) {
    if (!this.tooltip) return;
    const screenPos = Cesium.SceneTransforms.worldToWindowCoordinates(this.viewer.scene, position);
    if (screenPos) {
      this.tooltip.style.left = `${screenPos.x + 10}px`;
      this.tooltip.style.top = `${screenPos.y + 10}px`;
      this.tooltip.innerText = `地表距离: ${this.calculateSurfaceDistance([...this.positions, position]).toFixed(2)} 米`;
    }
  }

  // 创建提示框
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

  // 移除提示框
  private removeTooltip() {
    if (this.tooltip) {
      document.body.removeChild(this.tooltip);
      this.tooltip = null;
    }
  }

  // 计算地表距离（贴地折线长度）
  public calculateSurfaceDistance(positions: Cesium.Cartesian3[]): number {
    if (positions.length < 2) return 0;
    let distance = 0;
    for (let i = 1; i < positions.length; i++) {
      distance += Cesium.Cartesian3.distance(positions[i - 1], positions[i]);
    }
    return distance;
  }

  /**
   * 完成测量，显示最终距离，停止事件监听。
   */
  public finish() {
    if (this.handler) {
      this.handler.destroy();
      this.handler = null;
    }
    this.measuring = false;
    // 显示最终距离
    if (this.tooltip) {
      const total = this.calculateSurfaceDistance(this.positions);
      this.tooltip.innerText = `地表距离测量完成\n总长度: ${total.toFixed(2)} 米`;
      // 2秒后自动移除提示框
      setTimeout(() => this.removeTooltip(), 2000);
    }
  }

  /**
   * 主动退出/清理测量，移除所有事件、线、提示框。
   */
  public clear() {
    if (this.handler) {
      this.handler.destroy();
      this.handler = null;
    }
    if (this.polylineEntity) {
      this.viewer.entities.remove(this.polylineEntity);
      this.polylineEntity = null;
    }
    this.positions = [];
    this.measuring = false;
    this.removeTooltip();
  }
}