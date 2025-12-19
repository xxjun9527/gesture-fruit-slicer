<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Gesture Fruit Slicer

一个基于摄像头手势识别的水果切割小游戏。通过 MediaPipe 手部关键点检测识别你的食指轨迹，在画布上生成手势轨迹，命中水果即可切割、加分并触发多种可爱的果汁特效。

## 技术栈
- `React 19` + `TypeScript` + `Vite 6`
- `Canvas` 绘制游戏层，`Tailwind CSS` 通过构建管线加载（`index.css`）
- 视觉识别：`@mediapipe/tasks-vision` 手部关键点
- 音效：原生 Web Audio API 合成

## 功能特性
- 双手跟踪与食指光标，平滑的彩色手势轨迹
- 水果抛射、重力与旋转，切割分裂为两半
- 组合技加分、屏幕震动、彩色纸屑与墨汁飞溅
- 炸弹惩罚（命中直接游戏结束）
- 支持上传自定义图片作为水果素材
- 无摄像头或识别失败时自动切换触控模式（指针轨迹）
- 识别质量可选：`lite`（更稳帧率）与 `standard`（更高精度）

## 本地运行
**环境要求**
- 建议使用 Node.js `>= 20`（当前插件对 Node 版本有更高要求）。
- 浏览器需允许摄像头权限。

**步骤**
1. 安装依赖：`npm install`
2. 模型与 WASM 资源（若未包含）放置到 `public/assets/`
   - 模型（标准/轻量）：`/assets/modules/hand_landmarker.task` 与（可选）`/assets/modules/hand_landmarker_lite.task`（`services/visionService.ts:26,38`）
   - WASM 目录：`/assets/wasm/`（`services/visionService.ts:13,21` 与 `services/prefetchService.ts:3-9`）
3. 启动开发服务器：`npm run dev`
4. 打开浏览器访问：`http://localhost:3000/`
5. 点击“开始游戏 ▶”，允许摄像头权限，挥动食指开始切水果；如拒绝或加载失败，将进入触控模式。

可选：如需调整静态资源前缀，设置环境变量 `VITE_BASE`（`vite.config.ts:5-11`）。构建后静态部署需确保 `base` 与站点路径一致。

## 可调参数与玩法节奏
- 生成间隔：`constants.ts:4-5`（`INITIAL_SPAWN_RATE=700ms`，最小 `MIN_SPAWN_RATE=200ms`）
- 每次生成数量：`components/GameCanvas.tsx:271-275`（一次生成 `2` 个实体）
- 炸弹概率：`constants.ts:3`（`BOMB_PROBABILITY`，当前默认 `0`，可改为 `0.15` 以增加挑战）
- 重力、半径、生命数：`constants.ts:1,6,7`（`GRAVITY`、`FRUIT_RADIUS`、`MAX_LIVES`）
- 组合窗口与震动：`constants.ts:12-15`（`COMBO_WINDOW`、`SHAKE_*`）

## 目录结构
```
components/        # UI 与游戏主画布
  GameCanvas.tsx   # 摄像头、视觉检测、更新与绘制循环
  MainMenu.tsx     # 主菜单与上传入口
  GameOver.tsx     # 结算界面
services/          # 视觉与音频服务
  visionService.ts # MediaPipe 手势模型初始化
  audioService.ts  # Web Audio 合成音效
utils/             # 数学工具（碰撞、距离、角度等）
index.html         # 应用入口（模块加载、WASM 兼容处理）
index.tsx          # React 挂载入口
App.tsx            # 状态机与 HUD 层
constants.ts       # 游戏参数与内置 SVG 素材
types.ts           # 类型定义
vite.config.ts     # Vite 配置（端口与环境注入）
```

## 构建与预览
- 构建：`npm run build`
- 预览本地构建产物：`npm run preview`
- 部署：将 `dist/` 目录上传至任意静态站点；如非根路径，请配置 `VITE_BASE` 并保持资源目录结构（`/assets/wasm/`、`/assets/modules/`）。

## 常见问题
- 摄像头权限：拒绝权限会导致无法开始游戏，请在浏览器设定中允许摄像头。
- Node 版本警告：若看到 `@vitejs/plugin-react` 的 engine 提示，建议升级至 Node `20+`。
- 模型加载 404：请确认模型已放置在 `public/assets/modules/hand_landmarker.task`，并且访问路径与 `services/visionService.ts:14` 保持一致。
- 样式文件：样式通过 `index.tsx` 中的 `import './index.css'` 引入（`index.tsx:4`），无需在 `index.html` 直接引用。
- BGM 未播放：首次点击交互后才会初始化音频，资源路径为 `assets/music/bgm.MP3`（`services/audioService.ts:144`）。
- WASM 兼容：`index.html:13-33` 对 `WebAssembly.instantiateStreaming` 做了兼容处理，避免某些服务器缺少 `application/wasm` MIME 导致加载失败。
- 进度显示：主菜单会预取识别资源并显示进度（`App.tsx:76-87` 与 `services/prefetchService.ts:16-57`）。

## 许可
本项目仅用于学习与演示。内置水果 SVG 为本地数据 URI，上传图片请确保拥有合法使用权。
