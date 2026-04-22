/** @type {import('./schema').LevelConfig} */
const level2 = {
  id: 'level-2',
  title: '关卡 2',
  subtitle: '建立音高控制',
  steps: [
    {
      id: 'slide',
      title: '往返滑音',
      instruction: '点击 Start，用"啊——"从最低舒适音平稳滑到最高舒适音，再滑回。保持气息连续，观察蓝线是否平滑无断裂。',
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
    },
    {
      id: 'hold',
      title: '滑中定点',
      instruction: '在滑音过程中任意位置突然停住，保持稳定 3 秒，观察蓝线是否水平。',
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
    },
    {
      id: 'chase',
      title: '随机追音',
      instruction: '系统将随机播放一个白键音并显示目标线。声音结束后，尝试把你的嗓音移动到目标线附近。',
      audio: {
        enableMic: true,
        autoPlayOnEnter: true,
      },
      ui: {
        showPiano: true,
        showPitchCanvas: true,
        showVolumeBar: true,
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
