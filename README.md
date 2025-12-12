<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Gesture Fruit Slicer

一个基于摄像头手势识别的水果切割小游戏。通过 MediaPipe 手部关键点检测识别你的食指轨迹，在画布上生成手势轨迹，命中水果即可切割、加分并触发多种可爱的果汁特效。

## 技术栈
- `React 19` + `TypeScript` + `Vite 6`
- `Canvas` 绘制游戏层，`Tailwind`（CDN）负责基础样式
- 视觉识别：`@mediapipe/tasks-vision` 手部关键点
- 音效：原生 Web Audio API 合成

## 功能特性
- 双手跟踪与食指光标，平滑的彩色手势轨迹
- 水果抛射、重力与旋转，切割分裂为两半
- 组合技加分、屏幕震动、彩色纸屑与墨汁飞溅
- 炸弹惩罚（命中直接游戏结束）
- 支持上传自定义图片作为水果素材

## 本地运行
**环境要求**
- 建议使用 Node.js `>= 20`（当前插件对 Node 版本有更高要求）。
- 浏览器需允许摄像头权限。

**步骤**
1. 安装依赖：`npm install`
2. 将手势识别模型文件放到 `public/assets/modules/hand_landmarker.task`
   - 代码已改为加载本地模型：`services/visionService.ts:14`
3. 启动开发服务器：`npm run dev`
4. 打开浏览器访问：`http://localhost:3000/`
5. 点击 “PLAY NOW!” 并允许摄像头权限，挥动手指开始切水果。

可选：如需将 MediaPipe 的 `wasm` 也改为本地，请将 `services/visionService.ts:9` 的 CDN 路径替换为你在 `public` 下配置的本地路径。

## 可调参数与玩法节奏
- 生成间隔：`constants.ts:4-5`（`INITIAL_SPAWN_RATE`、`MIN_SPAWN_RATE`）
  - 已调整为更高频：`700ms` → 加速到 `200ms` 最小值。
- 每次生成数量：`components/GameCanvas.tsx:261-265`（一次生成 4 个水果）
- 炸弹概率：`constants.ts:3`（`BOMB_PROBABILITY`，默认 `0.15`）
- 重力、半径等：`constants.ts:1, 6`（`GRAVITY`、`FRUIT_RADIUS`）

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
index.html         # 应用入口（Tailwind CDN、字体、importmap）
index.tsx          # React 挂载入口
App.tsx            # 状态机与 HUD 层
constants.ts       # 游戏参数与内置 SVG 素材
types.ts           # 类型定义
vite.config.ts     # Vite 配置（端口与环境注入）
```

## 常见问题
- 摄像头权限：拒绝权限会导致无法开始游戏，请在浏览器设定中允许摄像头。
- Node 版本警告：若看到 `@vitejs/plugin-react` 的 engine 提示，建议升级至 Node `20+`。
- 模型加载 404：请确认模型已放置在 `public/assets/modules/hand_landmarker.task`，并且访问路径与 `services/visionService.ts:14` 保持一致。
- 样式文件：`index.html` 引用了 `/index.css`，仓库默认未提供该文件；样式主要依赖 Tailwind CDN，不影响游戏功能。

## 许可
本项目仅用于学习与演示。内置水果 SVG 为本地数据 URI，上传图片请确保拥有合法使用权。
