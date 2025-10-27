/*
  通用模型加载工具：支持 Entity 和 Primitive 两种方式
  - addModelEntity: 使用 viewer.entities 加载 glTF/GLB
  - addModelPrimitive: 使用 scene.primitives 加载 Cesium.Model
*/

export type DegreesHPR = {
  heading?: number; // 度
  pitch?: number;   // 度
  roll?: number;    // 度
};

export type ModelCommonOptions = {
  scale?: number;
  minimumPixelSize?: number;
  maximumScale?: number;
  shadows?: any; // Cesium.ShadowMode
  allowPicking?: boolean;
};

export function addModelEntity(
  viewer: any,
  url: string,
  lon: number,
  lat: number,
  height = 0,
  hpr: DegreesHPR = {},
  options: ModelCommonOptions = {}
) {
  const {
    scale = 1.0,
    minimumPixelSize = 64,
    maximumScale = 2000,
    shadows = Cesium.ShadowMode.ENABLED,
    allowPicking = true,
  } = options;

  const position = Cesium.Cartesian3.fromDegrees(lon, lat, height);
  const heading = Cesium.Math.toRadians(hpr.heading ?? 0);
  const pitch = Cesium.Math.toRadians(hpr.pitch ?? 0);
  const roll = Cesium.Math.toRadians(hpr.roll ?? 0);
  const q = Cesium.Transforms.headingPitchRollQuaternion(
    position,
    new Cesium.HeadingPitchRoll(heading, pitch, roll)
  );

  const entity = viewer.entities.add({
    position,
    orientation: q,
    model: {
      uri: url,
      scale,
      minimumPixelSize,
      maximumScale,
      shadows,
      // @ts-ignore: Cesium typings sometimes miss allowPicking under ModelGraphics
      allowPicking,
    } as any,
  });

  const remove = () => viewer.entities.remove(entity);
  const flyTo = () => viewer.flyTo(entity);

  return { entity, remove, flyTo };
}

export function addModelPrimitive(
  viewer: any,
  url: string,
  lon: number,
  lat: number,
  height = 0,
  hpr: DegreesHPR = {},
  options: ModelCommonOptions = {}
) {
  const {
    scale = 1.0,
    minimumPixelSize = 64,
    maximumScale = 2000,
    shadows = Cesium.ShadowMode.ENABLED,
    allowPicking = true,
  } = options;

  const position = Cesium.Cartesian3.fromDegrees(lon, lat, height);
  const heading = Cesium.Math.toRadians(hpr.heading ?? 0);
  const pitch = Cesium.Math.toRadians(hpr.pitch ?? 0);
  const roll = Cesium.Math.toRadians(hpr.roll ?? 0);

  const modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
    position,
    new Cesium.HeadingPitchRoll(heading, pitch, roll)
  );

  const model = (Cesium as any).Model.fromGltf({
    url,
    modelMatrix,
    scale,
    minimumPixelSize,
    maximumScale,
    allowPicking,
    shadows,
  });

  const primitive = viewer.scene.primitives.add(model);
  const remove = () => viewer.scene.primitives.remove(primitive);
  const ready = (model as any).readyPromise;
  const flyTo = async () => {
    await ready;
    viewer.flyTo(model);
  };

  return { model, primitive, remove, ready, flyTo };
}
