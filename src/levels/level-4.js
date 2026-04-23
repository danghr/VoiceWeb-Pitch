function createJumpStep({
  id,
  title,
  instruction,
  from,
  to,
}) {
  return {
    id,
    title,
    instruction,
    audio: {
      enableMic: true,
      referenceNotes: [from, to],
      autoPlayOnEnter: true,
    },
    ui: {
      showPiano: true,
      pianoHighlightNotes: [from, to],
      showPitchCanvas: true,
      canvasTargetNotes: [from, to],
      showReplayButton: true,
    },
    validator: { type: 'manual' },
    nextStepTrigger: 'manual',
  };
}

function createRandomIntervalStep({ id, title, instruction, direction, interval }) {
  return {
    id,
    title,
    instruction,
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
    randomInterval: { direction, interval },
    isRandomPractice: true,
  };
}

/** @type {import('./schema').LevelConfig} */
const level4 = {
  id: 'level-4',
  title: '关卡 4',
  subtitle: '距离感——音程',
  steps: [
    createJumpStep({
      id: 'adj-up',
      title: '邻进上行',
      instruction: '先听 C3 和 D3 的参考音。然后尝试从 C3 直接跳到 D3，避免滑音。',
      from: 'C3',
      to: 'D3',
    }),
    createRandomIntervalStep({
      id: 'random-adj-up',
      title: '随机邻进上行',
      instruction: '系统将随机抽取一个音及其上方相邻白键，听参考音后尝试从低音直接跳到高音。点击"换一组"抽取新的音程。',
      direction: 'up',
      interval: 1,
    }),
    createJumpStep({
      id: 'adj-down',
      title: '邻进下行',
      instruction: '先听 D3 和 C3 的参考音。然后尝试从 D3 直接跳到 C3。',
      from: 'D3',
      to: 'C3',
    }),
    createRandomIntervalStep({
      id: 'random-adj-down',
      title: '随机邻进下行',
      instruction: '系统将随机抽取一个音及其下方相邻白键，听参考音后尝试从高音直接跳到低音。点击"换一组"抽取新的音程。',
      direction: 'down',
      interval: 1,
    }),
    createJumpStep({
      id: 'skip-up',
      title: '隔音上行',
      instruction: '先听 C3 和 E3 的参考音。然后尝试从 C3 直接跳到 E3（中间隔一个白键）。',
      from: 'C3',
      to: 'E3',
    }),
    createRandomIntervalStep({
      id: 'random-skip-up',
      title: '随机隔音上行',
      instruction: '系统将随机抽取一个音及其上方隔一个白键的音，听参考音后尝试从低音直接跳到高音。点击"换一组"抽取新的音程。',
      direction: 'up',
      interval: 2,
    }),
    createJumpStep({
      id: 'skip-down',
      title: '隔音下行',
      instruction: '先听 E3 和 C3 的参考音。然后尝试从 E3 直接跳到 C3。',
      from: 'E3',
      to: 'C3',
    }),
    createRandomIntervalStep({
      id: 'random-skip-down',
      title: '随机隔音下行',
      instruction: '系统将随机抽取一个音及其下方隔一个白键的音，听参考音后尝试从高音直接跳到低音。点击"换一组"抽取新的音程。',
      direction: 'down',
      interval: 2,
    }),
    {
      id: 'random-jump',
      title: '随机音程练习',
      instruction: '系统将从你的音域范围内随机抽取两个白键音，听参考音后尝试从第一个音直接跳到第二个音。点击"换一组"抽取新的音程。',
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
      randomJumpPair: true,
      isRandomPractice: true,
    },
  ],
};

export default level4;
