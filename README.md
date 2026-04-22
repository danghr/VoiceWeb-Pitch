# 音准训练 Web 应用

## 项目介绍
本项目是一个基于 Web Audio 的音准训练单页应用，将训练手册抽象为 5 个可配置关卡，并由统一的运行引擎驱动。训练流程不硬编码在组件中，而是通过声明式关卡配置定义，便于扩展与迭代。

## 核心特性
- 配置化训练流程：5 个关卡均由 `src/levels/` 中的配置文件驱动。
- 统一判定引擎：支持 `manual`、`sustain`、`match`、`slide`、`jump`、`melody` 六种策略。
- 实时音频能力：
  - Tone.js 负责参考音播放和合成。
  - Pitchy 负责音高检测。
  - Web Audio API 负责麦克风采样与响度分析。
- 可视化反馈：实时绘制音高轨迹、响度区域、目标参考线与当前吸附点。
- 分辨率守卫：当宽度 < 1024px 时显示全屏遮罩，阻止交互。

## 技术栈
- Vue 3 + Vite（Composition API）
- Pinia
- Tone.js
- Pitchy
- 纯 CSS

## 文件结构

```text
.
├── src/
│   ├── components/
│   │   ├── LevelHeader.vue
│   │   ├── LevelRunner.vue
│   │   ├── PianoRoll.vue
│   │   ├── ScreenGuard.vue
│   │   └── StepPanel.vue
│   ├── core/
│   │   ├── AudioEngine.js
│   │   ├── CanvasRenderer.vue
│   │   └── Validator.js
│   ├── levels/
│   │   ├── level-1.js
│   │   ├── level-2.js
│   │   ├── level-3.js
│   │   ├── level-4.js
│   │   ├── level-5.js
│   │   ├── index.js
│   │   └── schema.js
│   ├── stores/
│   │   └── training.js
│   ├── utils/
│   │   └── music.js
│   ├── App.vue
│   ├── main.js
│   └── style.css
├── index.html
├── package.json
└── README.md
```

## 使用方式
1. 安装依赖：

```bash
npm install
```

2. 启动开发服务器：

```bash
npm run dev
```

3. 生产构建：

```bash
npm run build
```

## 使用建议
- 首次训练前先允许浏览器麦克风权限。
- 建议使用安静环境，并搭配耳机进行参考音聆听。
- 训练时优先关注“稳定性”而非“一次命中”。

## 生成式人工智能使用声明
本项目代码由开发者提出需求后，结合生成式人工智能辅助生成初始实现，并由开发者进行人工审阅、功能核对与本地运行验证。
