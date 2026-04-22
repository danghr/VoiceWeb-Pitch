# 目标
开发一个音准训练 Web 应用。将 `音准.pdf` 训练手册的 5 个章节抽象为 5 个可配置关卡，通过一套统一的底层引擎驱动。关卡内容通过声明式 JS 配置文件定义，禁止在引擎或 UI 组件中硬编码任何训练流程。你不需要完整照搬手册的内容，但需要还原手册的核心思想和训练方法，以更加适合 Web 的形式呈现。

# 硬性约束
1. **不考虑手机支持**：当浏览器宽度 < 1024px 时，全屏显示遮罩，提示"请使用平板横屏或电脑访问"。
2. **优先使用成熟外部库**：尽量避免从零手写复杂音频算法（如音高检测），尽量复用现有 npm 方案。
3. 单页应用，Vite + Vue 3 (Composition API)。

# 技术栈
- Vue 3 + Vite
- Pinia（全局状态管理）
- Tone.js（参考音合成、调律、播放控制）
- Pitchy（音高检测，基于 Rust/WASM，精度高）
- 纯 CSS（不使用重量级 UI 框架，保持可控）

# 架构设计（必须严格遵守）

## 1. 底层引擎层 (src/core/)
与业务无关，只提供原始能力：

- `AudioEngine.js`：封装 Tone.js 与 Web Audio API。
  - 麦克风输入管理：getUserMedia → MediaStreamSource → AnalyserNode。
  - 音高检测：使用 Pitchy 的 `detect` 函数处理 AnalyserNode 的 Float32Array 时域数据，检测范围 80Hz–1000Hz。
  - 响度检测：基于 AnalyserNode 时域数据计算 RMS。
  - 参考音播放：Tone.Synth 播放标准音，频率按 A4=440Hz 十二平均律计算 `f = 440 * 2^((n-69)/12)`。
  - 提供 API：`startMic()`, `stopMic()`, `playNote(noteName, duration)`, `setPitchCallback(fn)`, `setVolumeCallback(fn)`。

- `CanvasRenderer.vue`：通用可视化组件。
  - Props 接收 `pitchPoints[]`（{time, freq, noteName}）、`volumePoints[]`、`targetNotes[]`（在当前步骤中应绘制的目标水平线数组）。
  - 绘制内容：绿色音高轨迹（对数坐标，纵向映射到钢琴窗格位置）、橙色半透明响度区、灰色虚线目标水平线、当前音高吸附圆点。
  - 方法：`clear()`、`snapshot()`。

- `Validator.js`：判定策略引擎。
  - 根据步骤配置的 `validator.type` 执行实时判定，通过 EventTarget / callbacks 对外抛出 `step-pass`、`step-fail`、`hint`。
  - 内置策略：
    - `manual`：等待用户点击"下一步"。
    - `sustain`：持续发声 N 毫秒，且音高标准差 < threshold。
    - `match`：音高进入目标音 ±X cents 范围内持续 N 毫秒。
    - `slide`：检测频率从 A 到 B 的连续滑动，中间 RMS 无跌至静默。
    - `jump`：从音 A 直接跳到音 B（允许 N 毫秒寻找时间，禁止全程滑音——通过检测轨迹是否连续经过中间半音超过阈值来判定）。
    - `melody`：按顺序命中一系列目标音，每个音允许短暂寻找时间。

## 2. 关卡配置层 (src/levels/)
每个关卡是一个独立的 JS 文件，导出一个符合 Schema 的对象。

Schema（以 JSDoc 形式给出，必须遵守）：
```js
/**
 * @typedef {Object} LevelConfig
 * @property {string} id
 * @property {string} title
 * @property {string} subtitle
 * @property {StepConfig[]} steps
 *
 * @typedef {Object} StepConfig
 * @property {string} id
 * @property {string} title
 * @property {string} instruction - 支持 HTML 标签如 <strong>
 * @property {Object} audio
 * @property {boolean} audio.enableMic
 * @property {string[]} [audio.referenceNotes] - 如 ['C3','D3']
 * @property {boolean} [audio.autoPlayOnEnter] - 进入步骤时自动播放参考音序列
 * @property {boolean} [audio.playOnPianoClick] - 点击钢琴键时播放
 * @property {Object} ui
 * @property {boolean} ui.showPiano
 * @property {string[]} [ui.pianoHighlightNotes] - 需要高亮的键
 * @property {boolean} ui.showPitchCanvas
 * @property {string[]} [ui.canvasTargetNotes] - 在 Canvas 上绘制目标虚线的音名
 * @property {boolean} [ui.showVolumeBar]
 * @property {boolean} [ui.showNextButton]
 * @property {boolean} [ui.showReplayButton] - 重听参考音
 * @property {boolean} [ui.hideCanvasTargetUntilDone] - 完成后才显示轨迹复盘（用于听觉主导步骤）
 * @property {Object} validator
 * @property {'manual'|'sustain'|'match'|'slide'|'jump'|'melody'} validator.type
 * @property {Record<string,any>} validator.params
 * @property {string} validator.successMessage
 * @property {string} [validator.hintMessage] - 判定失败时给出的提示
 * @property {'manual'|'auto'|'validation-pass'} nextStepTrigger
 */
```

## 3. 关卡运行时 (src/components/)
- `LevelRunner.vue`：唯一的核心容器。接收 `levelConfig: LevelConfig`，维护 `currentStepIndex`。根据当前步骤配置，动态控制：
  - 是否渲染钢琴窗格、是否启用麦克风、是否显示 Canvas、绑定哪种 Validator。
  - 当 `validator` 触发 `step-pass` 时，若 `nextStepTrigger === 'validation-pass'` 则自动推进；若为 `manual` 则高亮"下一步"按钮。
- `PianoRoll.vue`：可交互钢琴窗格。白键为白色长条，黑键为深灰色短条，悬浮于白键间隙。标注 C 和 A。点击触发 `AudioEngine.playNote` 并高亮。
- `StepPanel.vue`：步骤指引面板。显示当前步骤的 `title`、`instruction`、控制按钮（下一步/重听/Start）。
- `LevelHeader.vue`：顶部栏。5 个关卡圆形按钮（已完成/进行中/未解锁），全局麦克风 Start/Stop 状态。

## 4. 分辨率守卫 (src/components/ScreenGuard.vue)
- 监听 `window.innerWidth` 与 `window.innerHeight`。
- 若宽度 < 1024px，显示 `position: fixed` 全屏遮罩，文案："本应用需要足够的可视化空间，请使用平板横屏或电脑访问。" 遮罩层阻止一切下层交互。

# 五个关卡配置文件（必须完整生成）

请完整生成 `src/levels/level-1.js` 至 `level-5.js`，作为业务逻辑的唯一定义：

### level-1.js：认识工具、音域与音名
- Step `explore`: `instruction`="点击左侧钢琴窗格的任意白键，听辨音高，同时观察它在屏幕上的高度位置。" `audio.playOnPianoClick=true`, `ui.showPiano=true`, `validator.type='manual'`.
- Step `range-test`: `instruction`="点击全局 Start，用日常说话最自然的状态发一个拉长的'啊——'。系统将自动判断你的舒适音域。" `audio.enableMic=true`, `validator.type='sustain'`, `params={durationMs:3000}`. 通过后根据检测到的平均频率自动设置全局状态 `userRange`（low: C3-A3, high: C4-A4），并以弹窗提示。

### level-2.js：建立音高控制
- Step `slide`: `instruction`="点击 Start，用'啊——'从最低舒适音平稳滑到最高舒适音，再滑回。保持气息连续，绿线应无断裂。" `audio.enableMic=true`, `validator.type='slide'`, `params={rangeSource:'userRange', minDurationMs:2000}`.
- Step `hold`: `instruction`="在滑音过程中任意位置突然停住，保持稳定 3 秒。" `validator.type='sustain'`, `params={durationMs:3000, allowDuringSlide:true}`.
- Step `chase`: `instruction`="系统将随机播放一个白键音。声音结束后，尝试把你的嗓音移动到它附近——不要求一次唱准，靠近即可。" `validator.type='match'`, `params={toleranceCents:200, timeoutMs:5000, requireSustain:false}`.

### level-3.js：锚定练习
- 生成 6 个同构步骤，分别对应 C3, D3, E3, F3, G3, A3。
  - 每个步骤：`ui.canvasTargetNotes=[当前音]`, `audio.referenceNotes=[当前音]`, `audio.autoPlayOnEnter=true`, `validator.type='match'`, `params={targetNote:'当前音', toleranceCents:50, sustainMs:3000}`.
- Step `blind`: `instruction`="闭眼或移开视线。听参考音后直接模仿，发声时先不看屏幕。唱完后系统会显示轨迹复盘。" `ui.hideCanvasTargetUntilDone=true`, `audio.referenceNotes=['C3','E3','G3']`, `validator.type='match'`, `params={toleranceCents:50, sustainMs:3000, revealAfter:true}`.

### level-4.js：距离感——音程
- Step `adj-up`: `instruction`="先听 C3，再听 D3。然后只播放 C3，直接唱 D3，避免滑音。" `validator.type='jump'`, `params={from:'C3', to:'D3', maxSearchMs:2000, banSlide:true}`.
- Step `adj-down`: `instruction`="先听 D3，再听 C3。然后只播放 D3，直接唱 C3。" 同构，参数 `from:'D3', to:'C3'`.
- Step `skip-up`: `instruction`="先听 C3，再听 E3。然后只播放 C3，直接唱 E3（中间隔一个白键）。" `params={from:'C3', to:'E3'}`.
- Step `skip-down`: `instruction`="先听 E3，再听 C3。然后只播放 E3，直接唱 C3。" `params={from:'E3', to:'C3'}`. `validator.hintMessage="下行时容易降得太多，心里先预演目标位置。"`

### level-5.js：你的第一句旋律
配置全局音符序列 `['C3','C3','G3','G3','A3','A3','G3','F3','F3','E3','E3','D3','D3','C3']`。
- Step `melody-high`: `instruction`="高辅助模式：系统将逐音播放参考音，并在 Canvas 上显示目标线。请跟随演唱。" `validator.type='melody'`, `params={notes:'全局序列', assistLevel:'high', toleranceCents:100}`.
- Step `melody-mid`: `instruction`="中辅助模式：只播放第一个音，你凭记忆演唱后续音符。每唱完一个音后，系统会短暂显示正确位置供你核对。" `params={assistLevel:'medium'}`.
- Step `melody-low`: `instruction`="低辅助模式：仅给起始音，全程隐藏目标线。唱完后系统整体复盘，标出偏差大的音。" `params={assistLevel:'low', revealAfter:true}`.

# UI/UX 规范
- **浅色主题**。白键 `#FFFFFF` 边框 `#E5E7EB`，黑键 `#1F2937` 短条悬浮于白键间隙。当前高亮键使用蓝色背景 `#DBEAFE`。
- **Canvas 配色**：音高轨迹 `#2563EB`（蓝），响度填充 `#F97316`（橙，透明度 30%），目标虚线 `#9CA3AF`（灰），当前吸附点 `#EF4444`（红）。
- **布局**：左侧固定 140px 钢琴窗格；中间上方为 Canvas（高度 320px）；中间下方为 `StepPanel` 指引区；顶部为 `LevelHeader`。
- **Tone.js 启动**：必须在用户首次点击全局"Start"或钢琴键后初始化 AudioContext，以绕过浏览器自动播放策略。

# 输出要求
1. 生成完整可运行的 Vite + Vue 3 项目，包含 `package.json`。
2. 必须包含 5 个关卡配置文件（`src/levels/level-1.js` 到 `level-5.js`）。
3. 必须包含底层引擎（`src/core/AudioEngine.js`、`src/core/CanvasRenderer.vue`、`src/core/Validator.js`）。
4. 必须包含 `ScreenGuard.vue`。
5. 代码注释与界面文本使用中文。
6. 提供 `npm install && npm run dev` 即可运行的完整代码。

# 特别注意
- Pitchy 的 `detect` 函数接收 `Float32Array` 和采样率，返回 `{freq, clarity}`。若 clarity < 0.8 可视为无有效音高。
- 所有音名-频率转换统一使用十二平均律 `noteToFreq` / `freqToNote` 工具函数（基于 A4=440Hz）。
- Validator 的 `melody` 策略在 `assistLevel: 'low'` 时，Canvas 不应实时绘制目标线，只在步骤结束后绘制实际轨迹与目标轨迹的对比。
- 关卡 4 的 `banSlide` 检测逻辑：若用户在寻找目标音的过程中，连续经过中间半音的累计时间超过 400ms，即判定为滑音，触发 `step-fail` 并给出提示。

# 其他事项
- 生成 `README.md`，阐述项目介绍，核心特性，技术栈，文件结构，使用建议，和生成式人工智能的使用声明。