const anchorNotes = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3'];

const anchorSteps = anchorNotes.map((note) => ({
  id: `anchor-${note.toLowerCase()}`,
  title: `${note} 锚定`,
  instruction: `
<p>反复执行以下步骤直到唱准：</p>
<ol>
  <li><b>听：</b>点击“重听参考音”或进入时自动播放 ${note}，仔细听目标音。</li>
  <li><b>模仿：</b>点击 Start，用“啊——”发出你认为与目标音相同的音。</li>
  <li><b>比对：</b>观察音高线与目标线的关系，判断偏高、偏低还是准确。同时注意听觉上的差异。</li>
  <li><b>调整：</b>若偏高或偏低，用上一关学到的控制方法回到目标线。</li>
  <li><b>确认：</b>当音高线与目标线重合时，保持 5 秒。再次播放参考音确认融合稳定。</li>
</ol>
<p><b>建议：</b>尝试 5–8 次，每次对准后保持 3–5 秒。</p>
<p><b>完成标准：</b>能连续 3 次在 3 秒内将音高线对准目标音，并保持 5 秒稳定。</p>
<p><b>常见问题</b></p>
<ul>
  <li><b>无法判断自己是高了还是低了：</b>可尝试先唱一个明显偏高的音，再唱一个明显偏低的音，目标位于两者之间，逐步逼近。</li>
  <li><b>嗓子疲劳或越唱越偏：</b>说明练习量已达上限，停止练习并休息。</li>
</ul>`,
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
    {
      id: 'intro',
      title: '本关说明',
      instruction: `
<p><b>学习目标</b></p>
<ul>
  <li>听到工具播放的参考音后，能用嗓音复制该音高。</li>
  <li>逐步脱离视觉工具的辅助，建立依赖“听觉比较”找到音准的能力。</li>
</ul>
<p><b>练习内容</b></p>
<p>上一关已经解决“如何让声音往高或往低走、如何停住”的问题；本关解决“听到什么就能唱到什么”的问题。</p>
<p>从本关起，蓝色音高线的角色从“主要训练工具”转为“校准工具”：先帮助你建立感知，再逐步减少依赖，最终由耳朵主导判断。</p>
<p>准备好后，点击“下一步”开始练习。</p>`,
      audio: { enableMic: false },
      ui: { showPiano: false, showPitchCanvas: false },
      validator: { type: 'manual' },
      nextStepTrigger: 'manual',
    },
    ...anchorSteps,
    {
      id: 'random-anchor',
      title: '听觉主导锚定练习',
      instruction: `
<p>系统将随机抽取一个白键音。<b>默认隐藏参考线和键盘</b>，先凭听觉模仿，唱完后开启“参考线与键盘”核对。</p>
<p><b>方法：</b></p>
<ol>
  <li>听参考音，不看屏幕直接模仿发声。此过程可以反复播放参考音，通过听觉进行校准。</li>
  <li>保持发声，开启参考线核对是否唱准。</li>
  <li>若未对准，关闭参考线，继续修正，直至成功。</li>
  <li>完成后关闭参考线，点击“换一个”，继续下一轮练习。</li>
</ol>
<p>点击“换一个”抽取新的音。</p>
<p><b>完成标准：</b>随机切换 5 个不同的音，均能在不看音高线的情况下准确唱出目标音。</p>
<p><b>常见问题</b></p>
<ul>
  <li><b>一不看音高线就没把握：</b>先把“不看”的时长缩短到 1 秒，只做一次发声后立刻核对，同时点击“重听参考音”，留意你听到的差距与屏幕上显示的差距之间的关系。随着成功率提高，再逐步延长“不看”的时间。</li>
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
      randomWhiteKey: true,
      isRandomPractice: true,
    },
    {
      id: 'principle',
      title: '原理：音高系统的物理基础',
      instruction: `
<ul>
  <li><b>A4 = 440 Hz：</b>现代音乐的国际标准音高。</li>
  <li><b>十二平均律：</b>一个八度被分为 12 个半音，每上升一个半音，频率乘以 2<sup>1/12</sup> ≈ 1.05946。每个八度的频率都是前一个八度的两倍。</li>
</ul>
<img src="${import.meta.env.BASE_URL}images/equal_temperament.png" alt="十二平均律频率分布" style="width:100%;border-radius:8px;margin:8px 0;" />`,
      audio: { enableMic: false },
      ui: { showPiano: true, showPitchCanvas: false },
      validator: { type: 'manual' },
      nextStepTrigger: 'manual',
    },
  ],
};

export default level3;
