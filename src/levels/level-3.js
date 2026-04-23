const anchorNotes = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3'];

const anchorSteps = anchorNotes.map((note) => ({
  id: `anchor-${note.toLowerCase()}`,
  title: `${note} 锚定`,
  instruction: `先听 ${note} 参考音，再尝试唱出该音并保持，观察蓝线是否贴近目标线。`,
  audio: {
    enableMic: true,
    referenceNotes: [note],
    autoPlayOnEnter: true,
  },
  ui: {
    showPiano: true,
    pianoHighlightNotes: [note],
    showPitchCanvas: true,
    canvasTargetNotes: [note],
    showReplayButton: true,
  },
  validator: { type: 'manual' },
  nextStepTrigger: 'manual',
}));

/** @type {import('./schema').LevelConfig} */
const level3 = {
  id: 'level-3',
  title: '关卡 3',
  subtitle: '锚定练习',
  steps: [
    ...anchorSteps,
    {
      id: 'random-anchor',
      title: '随机锚定练习',
      instruction: '系统将从你的音域范围内随机抽取一个白键音，听参考音后尝试唱准。可反复练习，点击"换一个"抽取新的音。',
      audio: {
        enableMic: true,
        autoPlayOnEnter: true,
      },
      ui: {
        showPiano: true,
        showPitchCanvas: true,
        showReplayButton: true,
        defaultHideTarget: true,
        allowToggleTarget: true,
      },
      validator: { type: 'manual' },
      nextStepTrigger: 'manual',
      randomWhiteKey: true,
      isRandomPractice: true,
    },
  ],
};

export default level3;
