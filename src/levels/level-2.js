/** @type {import('./schema').LevelConfig} */
const level2 = {
  id: 'level-2',
  title: '关卡 2',
  subtitle: '建立音高控制',
  steps: [
    {
      id: 'intro',
      title: '本关说明',
      instruction: `
<p><b>学习目标</b></p>
<ul>
  <li>建立主动控制音高的核心直觉。</li>
  <li>建立“停住”（即稳定在某一音高）的能力。</li>
</ul>
<p><b>练习内容</b></p>
<p>本关练习发声所需的身体控制，重点不是记住某个音名，而是建立两个能力：</p>
<ul>
  <li>你能主动让声音往高走、往低走。</li>
  <li>你能把声音停在指定位置并保持稳定。</li>
</ul>
<p>音高线是主要训练工具。你要通过看音高线，建立“发声状态变化 ↔ 音高位置变化”的对应关系：</p>
<ul>
  <li><b>唱准了：</b>音高线与目标线重合，且保持水平。</li>
  <li><b>唱高了：</b>音高线位于目标线上方。需要降低发声音高。</li>
  <li><b>唱低了：</b>音高线位于目标线下方。需要提高发声音高。</li>
</ul>
<p>准备好后，点击“下一步”开始练习。</p>`,
      audio: { enableMic: false },
      ui: { showPiano: false, showPitchCanvas: false },
      validator: { type: 'manual' },
      nextStepTrigger: 'manual',
    },
    {
      id: 'slide',
      title: '往返滑音',
      instruction: `
<p>点击 Start，用“啊——”从最低舒适音平稳滑到最高舒适音，再滑回。</p>
<p><b>要求：</b>音高线连续、无断裂地从下方移动到上方再返回。</p>
<p><b>建议：</b>练习 2–3 次。模仿消防车警笛、防空警报等音调变化的“呜——呜——”声，高低来回滑动。</p>
<p><b>完成标准：</b>能从 C3 较平稳地滑至 G3 再返回 C3。</p>
<p><b>常见问题</b></p>
<ul>
  <li><b>音高线断裂或出现多段线：</b>发声过程中气息中断。尝试保持气流连续，尽量避免偷换气。</li>
</ul>`,
      audio: {
        enableMic: true,
      },
      ui: {
        showPiano: true,
        showPitchCanvas: true,
      },
      validator: { type: 'manual' },
      nextStepTrigger: 'manual',
    },
    {
      id: 'hold',
      title: '滑中定点',
      instruction: `
<p>在滑音过程中任意位置突然停住，保持稳定 3–5 秒，观察音高线是否变为水平直线。若音高线仍上下漂移，说明尚未建立“定点”肌肉记忆，继续练习。</p>
<p><b>完成标准：</b>在滑动路径上的任意点可停住 3–5 秒，做到音高线基本水平。允许上下抖动不超过一个半音（即一个键的高度）。</p>
<p><b>常见问题</b></p>
<ul>
  <li><b>停住后音高线抖动：</b>通常是响度不稳定所致，而非音准问题。尝试略微减小音量，保持气流均匀。</li>
</ul>`,
      audio: {
        enableMic: true,
      },
      ui: {
        showPiano: false,
        showPitchCanvas: true,
      },
      validator: { type: 'manual' },
      nextStepTrigger: 'manual',
    },
    {
      id: 'chase',
      title: '随机追音',
      instruction: `
<p>系统将随机播放一个白键音并显示目标线。声音结束后，尝试把你的嗓音移动到目标线附近。</p>
<p><b>要点：</b>本步不要求一次唱准，重点是练习听到一个音后，能根据音高线把嗓音移动到它附近。</p>
<p>点击“换一个”可以切换到新的随机音。</p>
<p><b>完成标准：</b>随机切换 5 个不同的音，均能通过滑音将音高线稳定在目标白键对应水平线处。</p>`,
      audio: {
        enableMic: true,
        autoPlayOnEnter: true,
      },
      ui: {
        showPiano: true,
        showPitchCanvas: true,
        showReplayButton: true,
        defaultHideTarget: false,
        allowToggleTarget: false,
      },
      validator: { type: 'manual' },
      nextStepTrigger: 'manual',
      randomWhiteKey: true,
      isRandomPractice: true,
    },
  ],
};

export default level2;
