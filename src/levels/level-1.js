/** @type {import('./schema').LevelConfig} */
const level1 = {
  id: 'level-1',
  title: '关卡 1',
  subtitle: '认识工具、音域与音名',
  steps: [
    {
      id: 'explore',
      title: '探索钢琴与画布',
      instruction: '点击左侧钢琴窗格的任意白键，听辨音高，同时观察它在屏幕上的高度位置。完成后点击"下一步"。',
      audio: {
        enableMic: false,
        playOnPianoClick: true,
      },
      ui: {
        showPiano: true,
        showPitchCanvas: true,
        showVolumeBar: false,
      },
      validator: { type: 'manual' },
      nextStepTrigger: 'manual',
    },
    {
      id: 'range-test',
      title: '舒适音域测试',
      instruction: '点击 Start，用日常说话最自然的状态发一个拉长的"啊——"。累计约 5 秒有效声音后系统将自动停止并设置你的舒适音域。',
      audio: {
        enableMic: true,
      },
      ui: {
        showPiano: false,
        showPitchCanvas: true,
        showVolumeBar: true,
      },
      validator: { type: 'manual' },
      nextStepTrigger: 'manual',
      // LevelRunner 会在用户点击"下一步"时根据录音数据自动推断音域
      autoDetectRange: true,
    },
  ],
};

export default level1;
