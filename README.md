## vue3-cesium-globe

一个基于 Vue3 + Cesium 的地球可视化项目。

### 项目简介
本项目用于展示三维地球场景，支持地球漫游、图层管理、空间分析等功能，适合地理信息可视化、教育演示和二次开发。

### 主要功能
 三维地球展示与漫游
 图层切换与管理
 空间分析与测量（空间距离、地表距离、投影距离、投影面积）
 模型放置（放置战斗机、选择任意模型并放置到视野中心）
 可扩展的组件结构

### 技术栈
- Vue3
- CesiumJS
- Vite

### 安装与运行
1. 克隆仓库：
	```bash
	git clone https://github.com/aa1412666/-vue3-cesium-globe.git
	```
2. 安装依赖：
	```bash
	npm install
	# 或者使用 pnpm
	pnpm install
	```
3. 启动项目：
	```bash
	npm run dev
	```

### 快速体验
- 打开页面右上角工具栏中的“测量”按钮，可展开测量工具面板：
	- 空间距离：直线距离
	- 地表距离：沿地形贴地测距
	- 投影距离：投影到椭球面的距离
	- 投影面积：在椭球面投影的多边形面积
- 在测量面板中还有两个与模型相关的按钮：
	- 放置战斗机：一键在北京天安门附近经纬度（116.397463, 39.90869，高程100m）放置 Super Tucano glTF，右键该按钮可清除战斗机
	- 选择模型并放置：
		- 左键：输入模型 URL（默认示例为 /models/super_tucano_fab/scene.gltf），以及可选缩放系数；模型将放在“当前视野中心”的地表位置，并自动飞到
		- 右键：撤销最近一次放置的模型

### 如何添加自己的模型
推荐将模型放到本项目的静态资源目录 `public/models` 下，这样运行和打包后均可用稳定 URL 访问。

- GLB 单文件示例：
	- 放置路径：`public/models/your_model/your.glb`
	- 访问 URL：`/models/your_model/your.glb`

- glTF 多文件示例：
	- 放置路径：
		- `public/models/your_model/scene.gltf`
		- `public/models/your_model/scene.bin`
		- `public/models/your_model/textures/...`
	- 访问 URL：`/models/your_model/scene.gltf`
	- 注意：保持 `.gltf` 内部引用的 bin/贴图相对路径与文件夹结构一致，勿随意改名或层级

- 远程模型：
	- 可填写完整 URL（如 CDN），需确保 CORS 允许、且在 HTTPS 页面避免 HTTP 混合内容

- Base 路径：
	- 本项目 Vite 默认 `base` 为 `/`，直接使用以 `/` 开头的绝对路径即可
	- 若你修改了 Vite 的 `base`，建议拼接 `${import.meta.env.BASE_URL}models/...`

### 在代码里放置模型（可选）
项目提供了一个工具函数以便在代码中便捷放置模型：`src/utils/CesiumUtils/addModel.ts`

- 使用 Entity 方式（简单、与实体统一）：
	```ts
	import { addModelEntity } from '@/utils/CesiumUtils/addModel';

	const { remove, flyTo } = addModelEntity(
		viewer,
		'/models/your_model/scene.gltf', // 或 .glb
		lon, lat, height,
		{ heading: 0, pitch: 0, roll: 0 },
		{ scale: 1, minimumPixelSize: 64, maximumScale: 2000 }
	);
	// remove() 可移除模型，flyTo() 可飞到
	```

- 使用 Primitive 方式（底层控制更强）：
	```ts
	import { addModelPrimitive } from '@/utils/CesiumUtils/addModel';

	const { model, remove, ready, flyTo } = addModelPrimitive(
		viewer,
		'/models/your_model/scene.gltf',
		lon, lat, height,
		{ heading: 0, pitch: 0, roll: 0 },
		{ scale: 1 }
	);
	```

### 目录结构（节选）
- src/ 主要源码
- public/ 静态资源（建议将模型放在 `public/models` 下）
- public/Cesium/ CesiumJS 相关文件

### 常见问题
- glTF 加载不到贴图：检查 `.gltf` 引用的相对路径是否与 `public/models/your_model` 的实际文件结构一致
- 跨域错误：若加载外站模型，请确保服务端允许跨域（CORS）；尽量使用 HTTPS，避免混合内容
- 模型朝向不对：可调 `heading`（单位度），如 90 或 -90；`pitch/roll` 控制俯仰/横滚
- 贴地：可以在放置前通过 Cesium 的 `sampleTerrainMostDetailed` 采样地形，把高度设置为地形高程（需要启用地形）

### 目录结构
- src/ 主要源码
- public/ 静态资源
- Cesium/ CesiumJS 相关文件

### 许可协议
MIT
