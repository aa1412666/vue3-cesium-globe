import * as Cesium from "cesium";
type WGS84 = {
  lng: number;
  lat: number;
  alt?: number;
};
type lineOption = {
  width?: number;
  material?: any;
  clampToGround?: boolean;
};

export default class MeasureTool {
  viewer: Cesium.Viewer;
  handler: Cesium.ScreenSpaceEventHandler;
  activePositions: Cesium.Cartesian3[] = [];
  entities: Cesium.Entity[] = [];
  _drawLayer: Cesium.CustomDataSource;
  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
    // 测量工具创建的entity 实体聚合
    this._drawLayer = new Cesium.CustomDataSource("measureLayer");
    this.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  }

  /**
   * WGS84转笛卡尔
   * @param position
   */
  transformWGS84ToCartesian(position: WGS84) {
    if (this.viewer) {
      return position
        ? Cesium.Cartesian3.fromDegrees(
            position.lng,
            position.lat,
            position.alt || 0,
            Cesium.Ellipsoid.WGS84
          )
        : Cesium.Cartesian3.ZERO;
    }
  }

  /**
   * 获取屏幕坐标位置
   * @param px
   */
  /**
   * 根据屏幕坐标获取世界坐标 (Cartesian3)
   * @param position Cesium.Cartesian2 鼠标事件位置
   * @returns Cesium.Cartesian3 | null
   */
  getCartesian3FromPX(position: Cesium.Cartesian2): Cesium.Cartesian3 | null {
    if (!position) return null;
    const scene = this.viewer.scene;
    let cartesian: Cesium.Cartesian3 | undefined | null = null;

    if (scene.pickPositionSupported) {
      cartesian = scene.pickPosition(position);
    }

    // 2️ 如果没拾取到，退回到 globe.pick (拾取地形或椭球)
    if (!cartesian) {
      const ray = this.viewer.camera.getPickRay(position);
      if (ray) {
        cartesian = scene.globe.pick(ray, scene);
      }
    }

    //  如果仍然拿不到，就用 camera.pickEllipsoid (不考虑地形)
    if (!cartesian) {
      cartesian = this.viewer.camera.pickEllipsoid(
        position,
        scene.globe.ellipsoid
      );
    }
    return cartesian ?? null;
  }

  /**
   * 长度测量
   */
  startMeasureLine(options: lineOption = {}) {
    if (this.viewer) {
      const container = this.viewer.cesiumWidget.container;

      let _tooltip = document.createElement("div");
      _tooltip.classList.add("measure-tooltip");
      _tooltip.style.position = "absolute";
      _tooltip.style.zIndex = "9999";
      _tooltip.style.left = "-10000px";
      _tooltip.style.top = "-10000px";
      _tooltip.innerHTML = "单击开始绘制";
      container.append(_tooltip);

      let positions: Cesium.Cartesian3[] = [];
      let segmentLabels: Cesium.Entity[] = [];
      const handler = this.handler;

      // 折线实体
      const _lineEntity = this._drawLayer.entities.add({
        polyline: {
          width: options.width || 2,
          material: options.material || Cesium.Color.BLUE.withAlpha(0.8),
          clampToGround: options.clampToGround || false,
          positions: new Cesium.CallbackProperty(() => positions, false),
        },
      });

      // 函数：添加段长度标签
      const addSegmentLabel = (index: number) => {
        if (index < 1) return; // 至少两个点才有长度
        const start = positions[index - 1];
        const end = positions[index];
        const distance = Cesium.Cartesian3.distance(start, end);

        // 计算中点位置
        const mid = Cesium.Cartesian3.midpoint(
          start,
          end,
          new Cesium.Cartesian3()
        );

        const label = this._drawLayer.entities.add({
          position: mid,
          label: {
            text: distance.toFixed(2) + " 米",
            font: "14px sans-serif",
            fillColor: Cesium.Color.YELLOW,
            showBackground: true,
            backgroundColor: Cesium.Color.BLACK.withAlpha(0.5),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
        });

        segmentLabels.push(label);
      };

      // 左键点击：增加点
      handler.setInputAction(
        (movement: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
          const cartesian = this.getCartesian3FromPX(movement.position);
          if (!cartesian) return;

          positions.push(cartesian);
          _tooltip.innerHTML = "单击增加点，右键结束";

          this._addInfoPoint(cartesian, positions);

          // 添加段长度标签
          addSegmentLabel(positions.length - 1);
        },
        Cesium.ScreenSpaceEventType.LEFT_CLICK
      );

      // 鼠标移动：实时更新最后一段的长度
      handler.setInputAction(
        (movement: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
          _tooltip.style.left = movement.endPosition.x + 20 + "px";
          _tooltip.style.top = movement.endPosition.y - 10 + "px";

          if (positions.length >= 1) {
            const cartesian = this.getCartesian3FromPX(movement.endPosition);
            if (cartesian) {
              positions[positions.length - 1] = cartesian;

              // 实时更新最后段的标签位置和长度
              if (positions.length >= 2 && segmentLabels.length > 0) {
                const lastLabel = segmentLabels[segmentLabels.length - 1];
                const start = positions[positions.length - 2];
                const mid = Cesium.Cartesian3.midpoint(
                  start,
                  cartesian,
                  new Cesium.Cartesian3()
                );
                lastLabel.position = new Cesium.ConstantPositionProperty(mid);
                const distance = Cesium.Cartesian3.distance(start, cartesian);
                (lastLabel.label as any).text = new Cesium.ConstantProperty(distance.toFixed(2) + " 米");
              }
            }
          }
        },
        Cesium.ScreenSpaceEventType.MOUSE_MOVE
      );

      // 右键结束：固定最后一个点
      handler.setInputAction(
        (movement: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
          const cartesian = this.getCartesian3FromPX(movement.position);
          if (cartesian) {
            positions.push(cartesian);
            this._addInfoPoint(cartesian, positions);
            addSegmentLabel(positions.length - 1);
          }

          _tooltip.remove();
          handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
          handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
          handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        },
        Cesium.ScreenSpaceEventType.RIGHT_CLICK
      );
    }
  }
  /**
   * 在场景中添加一个信息点
   * @param position 点击位置的 Cartesian3
   * @param positions 当前测量点数组（可选，用于标注序号）
   */
  _addInfoPoint(position: Cesium.Cartesian3, positions: Cesium.Cartesian3[]) {
    if (!position) return;

    // 转换为经纬高，便于显示
    const cartographic = Cesium.Cartographic.fromCartesian(position);
    const lon = Cesium.Math.toDegrees(cartographic.longitude).toFixed(6);
    const lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(6);
    const height = cartographic.height.toFixed(2);

    // 添加一个点实体
    this.viewer.entities.add({
      position: position,
      point: {
        pixelSize: 10, // 点大小
        color: Cesium.Color.YELLOW.withAlpha(0.9),
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 贴地
      },
      label: {
        text: `点位：${
          positions.length + 1
        }\n 经度: ${lon}\n纬度: ${lat}\n高程: ${height} m`, // 序号
        font: "16px sans-serif",
        fillColor: Cesium.Color.WHITE,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -12), // label 往上移一点
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
      description: `经度: ${lon}\n纬度: ${lat}\n高程: ${height} m`,
    });
  }

  /**
   * 84坐标转弧度坐标
   * @param position
   */
  transformWGS84ToCartographic(position: WGS84) {
    return position
      ? Cesium.Cartographic.fromDegrees(
          position.lng,
          position.lat,
          position.alt
        )
      : Cesium.Cartographic.ZERO;
  }

  /**
   * 笛卡尔坐标转WGS84
   * @param cartesian
   */
  transformCartesianToWGS84(cartesian: Cesium.Cartesian3): WGS84 {
    const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    return {
      lng: Cesium.Math.toDegrees(cartographic.longitude),
      lat: Cesium.Math.toDegrees(cartographic.latitude),
      alt: cartographic.height
    };
  }
  /**
   * 考虑地球曲率的测量
   * @param positions
   */
  getPositionDistance(positions: any[]) {
    let distance = 0;
    for (let i = 0; i < positions.length - 1; i++) {
      let point1cartographic = this.transformWGS84ToCartographic(positions[i]);
      let point2cartographic = this.transformWGS84ToCartographic(
        positions[i + 1]
      );
      let geodesic = new Cesium.EllipsoidGeodesic();
      geodesic.setEndPoints(point1cartographic, point2cartographic);
      let s = geodesic.surfaceDistance;
      s = Math.sqrt(
        Math.pow(s, 2) +
          Math.pow(point2cartographic.height - point1cartographic.height, 2)
      );
      distance = distance + s;
    }
    return distance;
  }

  /**
   * 考虑地形的测量
   * @param positions
   */
  getPositionDistanceTerrain(positions: any[]) {
    let $this = this;
    return new Promise((resolve) => {
      let lerpArray = [];
      for (let j = 1; j < positions.length; j++) {
        let start = $this.transformWGS84ToCartesian(positions[j - 1]);
        let end = $this.transformWGS84ToCartesian(positions[j]);

        if (start && end) {
          //插值个数
          let splitNum = parseInt(
            Cesium.Cartesian3.distance(start, end).toString()
          );
          let startCartographic = Cesium.Cartographic.fromCartesian(start);
          let startDegrees = [
            startCartographic.longitude,
            startCartographic.latitude,
          ];
          let endCartographic = Cesium.Cartographic.fromCartesian(end);
          let endDegrees = [
            endCartographic.longitude,
            endCartographic.latitude,
          ];
          lerpArray.push(
            new Cesium.Cartographic(startDegrees[0], startDegrees[1])
          );
          for (let i = 1; i <= splitNum - 1; i++) {
            let x = Cesium.Math.lerp(
              startDegrees[0],
              endDegrees[0],
              i / splitNum
            );
            let y = Cesium.Math.lerp(
              startDegrees[1],
              endDegrees[1],
              i / splitNum
            );
            lerpArray.push(new Cesium.Cartographic(x, y));
          }
        }
      }

      //地形细节采样：传入 目标地形 和 制图坐标插值组（不贴附地形） 获取 贴地形的制图坐标插值组 再计算距离
      Cesium.sampleTerrainMostDetailed(
        $this.viewer.terrainProvider,
        lerpArray
      ).then((cartographicArr) => {
        this.getDetailedTerrainDistance(cartographicArr).then((distance) => {
          resolve(distance);
        });
      });
    });
  }

  getDetailedTerrainDistance(cartographicArr: Cesium.Cartographic[]) {
    return new Promise((resolve) => {
      let terrainDistance = 0;
      cartographicArr.map((currentCartographic, index) => {
        if (index == cartographicArr.length - 1) {
          return;
        }
        let nextCartographic = cartographicArr[index + 1];
        let currentPosition = Cesium.Cartesian3.fromRadians(
          currentCartographic.longitude,
          currentCartographic.latitude,
          currentCartographic.height
        );
        let nextPosition = Cesium.Cartesian3.fromRadians(
          nextCartographic.longitude,
          nextCartographic.latitude,
          nextCartographic.height
        );
        terrainDistance += Cesium.Cartesian3.distance(
          currentPosition,
          nextPosition
        );
      });
      resolve(terrainDistance);
    });
  }
  //添加坐标点

  /**
   * 笛卡尔转84 数组
   * @param cartesianArr
   */
  transformCartesianArrayToWGS84Array(cartesianArr: Cesium.Cartesian3[]) {
    if (this.viewer) {
      return cartesianArr
        ? cartesianArr.map((item) => {
            return this.transformCartesianToWGS84(item);
          })
        : [];
    }
  }

  /**
   * 84转笛卡尔 数组
   * @param cartesianArr
   */
  transformWGS84ArrayToCartesianArray(WSG84Arr: WGS84[]) {
    if (this.viewer && WSG84Arr) {
      return WSG84Arr
        ? WSG84Arr.map((item) => {
            return this.transformWGS84ToCartesian(item);
          })
        : [];
    }
  }
  /**
   * 停止当前测量
   */
  stop() {
    this.handler?.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    this.handler?.removeInputAction(
      Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
    );
  }

  /**
   * 清空已有的测量图形
   */
  clear() {
    this.entities.forEach((entity) => this.viewer.entities.remove(entity));
    this.entities = [];
    this.activePositions = [];
  }

  /**
   * 销毁
   */
  destroy() {
    this.clear();
    this.handler?.destroy();
  }
}
