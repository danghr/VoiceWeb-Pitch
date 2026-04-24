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
    {
      id: 'intro',
      title: '本关说明',
      instruction: `
<p><b>学习目标</b></p>
<ul>
  <li>建立音与音之间的相对距离（即音程）的感知。</li>
  <li>能准确执行两个音之间的干净跳跃（不滑音）。</li>
</ul>
<p><b>练习内容</b></p>
<p>上一关建立了你对单个音高的控制能力；本关训练你对音与音之间距离的感知和控制能力。</p>
<p><b>方法要点</b></p>
<ul>
  <li>先依次听两个参考音，感受它们之间的距离。</li>
  <li>再只播放第一个音，在发声前心里预演第二个音的位置。</li>
  <li>发声时尝试唱完第一个音后直接跳到第二个音，避免滑音。</li>
  <li>通过听参考音及观察音高线位置，判断是否成功跳跃到目标音。</li>
</ul>
<p>准备好后，点击“下一步”开始练习。</p>`,
      audio: { enableMic: false },
      ui: { showPiano: false, showPitchCanvas: false },
      validator: { type: 'manual' },
      nextStepTrigger: 'manual',
    },
    createJumpStep({
      id: 'adj-up',
      title: '级进上行',
      instruction: `
<p>先听 C3 和 D3 的参考音，然后尝试从 C3 直接跳到 D3，避免滑音。</p>
<p><b>建议：</b>练习 6–8 次。</p>
<p><b>完成标准：</b>能连续 3–5 次准确跳跃，允许短暂寻找时间（小于 2 秒），但禁止全程滑音。</p>`,
      from: 'C3',
      to: 'D3',
    }),
    createRandomIntervalStep({
      id: 'random-adj-up',
      title: '随机级进上行',
      instruction: `
<p>系统将随机抽取一个音及其上方相邻白键。听参考音后尝试从低音直接跳到高音。</p>
<p>默认隐藏参考线，先凭听觉跳跃，唱完后开启参考线核对。点击“换一组”抽取新的音程，关闭参考线继续练习。</p>
<p><b>完成标准：</b>随机切换 3–5 组不同的音，均能准确完成级进上行跳跃。</p>
<p><b>常见问题</b></p>
<ul>
  <li><b>唱到 E↔F 时感觉距离特别近：</b>这是正常的，E 到 F 是半音（中间无黑键），比其他相邻白键的全音距离窄一半。</li>
</ul>`,
      direction: 'up',
      interval: 1,
    }),
    createJumpStep({
      id: 'adj-down',
      title: '级进下行',
      instruction: `
<p>先听 D3 和 C3 的参考音，然后尝试从 D3 直接跳到 C3。</p>
<p><b>注意：</b>下行时容易降得过多。把目标位置想清楚后再发声。</p>
<p><b>完成标准：</b>能连续 3–5 次准确跳跃。</p>`,
      from: 'D3',
      to: 'C3',
    }),
    createRandomIntervalStep({
      id: 'random-adj-down',
      title: '随机级进下行',
      instruction: `
<p>系统将随机抽取一个音及其下方相邻白键。听参考音后尝试从高音直接跳到低音。</p>
<p>默认隐藏参考线，先凭听觉跳跃，唱完后开启参考线核对。点击“换一组”抽取新的音程，关闭参考线后继续练习。</p>
<p><b>完成标准：</b>随机切换 3–5 组不同的音，均能准确完成级进下行跳跃。</p>
<p><b>常见问题</b></p>
<ul>
  <li><b>下行时第二个音偏低：</b>下行时容易降得过多。把目标位置想清楚后再发声，可明显减少偏差。</li>
</ul>`,
      direction: 'down',
      interval: 1,
    }),
    createJumpStep({
      id: 'skip-up',
      title: '隔音上行',
      instruction: `
<p>先听 C3 和 E3 的参考音，然后尝试从 C3 直接跳到 E3（中间隔一个白键 D3）。</p>
<p><b>建议：</b>练习 6–8 次。</p>
<p><b>完成标准：</b>能连续 3–5 次准确跳跃。</p>`,
      from: 'C3',
      to: 'E3',
    }),
    createRandomIntervalStep({
      id: 'random-skip-up',
      title: '随机隔音上行',
      instruction: `
<p>系统将随机抽取一个音及其上方隔一个白键的音。听参考音后尝试从低音直接跳到高音。</p>
<p>默认隐藏参考线，先凭听觉跳跃，唱完后开启参考线核对。点击“换一组”抽取新的音程，关闭参考线后继续练习。</p>
<p><b>完成标准：</b>随机切换 3–5 组不同的音，均能准确完成隔音上行跳跃。</p>`,
      direction: 'up',
      interval: 2,
    }),
    createJumpStep({
      id: 'skip-down',
      title: '隔音下行',
      instruction: `
<p>先听 E3 和 C3 的参考音，然后尝试从 E3 直接跳到 C3。</p>
<p><b>注意：</b>下行跳跃容易降得过多，把目标位置想清楚后再发声。</p>
<p><b>完成标准：</b>能连续 3–5 次准确跳跃。</p>`,
      from: 'E3',
      to: 'C3',
    }),
    createRandomIntervalStep({
      id: 'random-skip-down',
      title: '随机隔音下行',
      instruction: `
<p>系统将随机抽取一个音及其下方隔一个白键的音。听参考音后尝试从高音直接跳到低音。</p>
<p>默认隐藏参考线，先凭听觉跳跃，唱完后开启参考线核对。点击“换一组”抽取新的音程，关闭参考线后继续练习。</p>
<p><b>完成标准：</b>随机切换 3–5 组不同的音，均能准确完成隔音下行跳跃。</p>`,
      direction: 'down',
      interval: 2,
    }),
    {
      id: 'random-jump',
      title: '随机音程练习',
      instruction: `
<p>系统将随机抽取两个白键音。听参考音后尝试从第一个音直接跳到第二个音。</p>
<p>默认隐藏参考线，先凭听觉跳跃，唱完后开启参考线核对。点击“换一组”抽取新的音程，关闭参考线后继续练习。</p>
<p><b>完成标准：</b>随机切换 5 组不同的音程，均能准确完成跳跃，允许短暂寻找时间（小于 2 秒），但禁止全程滑音。</p>
<p><b>常见问题</b></p>
<ul>
  <li><b>总是滑音，无法干净跳跃：</b>在播放两个音后、自己发声前，增加“心里预演”环节。先在心里听到目标，再直接发声。</li>
</ul>`,
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
    {
      id: 'principle',
      title: '原理：音程与半音',
      instruction: `
<ul>
  <li><b>音程：</b>两个音之间的距离。</li>
  <li><b>半音与全音：</b>相邻两个位置（无论黑白键）之间的距离为半音，两个半音构成一个全音。例如 C→D 为全音（中间隔一个黑键），E→F 为半音（相邻白键无黑键）。</li>
</ul>
<p>旋律的本质不是一串孤立的绝对音高，而是一组相对距离的组合。人耳对相对距离的敏感度高于对绝对频率的记忆，因此训练重点应放在"距离感"上。</p>`,
      audio: { enableMic: false },
      ui: { showPiano: true, showPitchCanvas: false },
      validator: { type: 'manual' },
      nextStepTrigger: 'manual',
    },
  ],
};

export default level4;
