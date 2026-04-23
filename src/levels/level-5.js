const melodySequence = ['C3', 'C3', 'G3', 'G3', 'A3', 'A3', 'G3', null, 'F3', 'F3', 'E3', 'E3', 'D3', 'D3', 'C3'];
const melodyNotes = [...new Set(melodySequence.filter(Boolean))];

/** @type {import('./schema').LevelConfig} */
const level5 = {
  id: 'level-5',
  title: '关卡 5',
  subtitle: '你的第一句旋律',
  melodySequence,
  steps: [
    {
      id: 'melody-high',
      title: '高辅助旋律',
      instruction: '高辅助模式：系统将逐音播放参考音，并在画布上显示所有目标线。请跟随演唱。',
      audio: {
        enableMic: true,
        referenceNotes: melodySequence,
        autoPlayOnEnter: true,
      },
      ui: {
        showPiano: true,
        pianoHighlightNotes: melodyNotes,
        showPitchCanvas: true,
        canvasTargetNotes: melodyNotes,
        showReplayButton: true,
      },
      validator: { type: 'manual' },
      nextStepTrigger: 'manual',
    },
    {
      id: 'melody-mid',
      title: '中辅助旋律',
      instruction: '中辅助模式：只播放第一个音，你凭记忆演唱后续音符。目标线仍然显示供参考。',
      audio: {
        enableMic: true,
        referenceNotes: [melodySequence[0]],
        autoPlayOnEnter: true,
      },
      ui: {
        showPiano: true,
        pianoHighlightNotes: melodyNotes,
        showPitchCanvas: true,
        canvasTargetNotes: melodyNotes,
        showReplayButton: true,
      },
      validator: { type: 'manual' },
      nextStepTrigger: 'manual',
    },
    {
      id: 'melody-low',
      title: '低辅助旋律',
      instruction: '低辅助模式：仅给起始音，全程隐藏目标线。唱完后可手动开启参考线复盘。',
      audio: {
        enableMic: true,
        referenceNotes: [melodySequence[0]],
        autoPlayOnEnter: true,
      },
      ui: {
        showPiano: true,
        pianoHighlightNotes: melodyNotes,
        showPitchCanvas: true,
        canvasTargetNotes: melodyNotes,
        showReplayButton: true,
        defaultHideTarget: true,
        allowToggleTarget: true,
      },
      validator: { type: 'manual' },
      nextStepTrigger: 'manual',
    },
  ],
};

export default level5;
